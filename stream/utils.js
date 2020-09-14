import { Repeater } from '../repeater/repeater.js';

export function ArrayWriter(arr) {
  return new WritableStream({
    write(chunk) {
      arr.push(chunk);
    },
    abort(err) {
      //console.log('ArrayWriter error:', err);
    }
  });
}

export async function readStream(stream, arg) {
  let repeater = await PipeToRepeater(stream);
  let fn;

  if(arg === undefined)
    return await (async function* () {
      for await (let item of repeater) yield await item;
    })();

  if(arg instanceof Array) fn = item => arg.push(item);
  else if(typeof arg == 'function') fn = item => arg(item);
  else if(typeof arg == 'string') fn = item => (arg += item);
  for await (let item of repeater) fn(item);
  if(typeof arg == 'function') arg(undefined);
  return arg;
}

export function AcquireReader(stream, fn) {
  fn =
    fn ||
    (async reader => {
      let result,
        data = '';
      while((result = await reader.read())) {
        console.log('result:', result);
        if(typeof result.value == 'string') data += result.value;
        if(result.done) break;
      }
      return data;
    });
  let reader, ret;
  return (async () => {
    reader = await stream.getReader();
    ret = await fn(reader);
    await reader.releaseLock();
    return ret;
  })();
}

export function AcquireWriter(stream,
  fn = async writer => {
    await writer.write('TEST');
  }
) {
  return (async writer => {
    writer = await writer;
    let ret = await fn(writer);
    await writer.releaseLock();
    return ret;
  })(stream.getWriter());
}

export function PipeTo(input, output) {
  return AcquireWriter(output, async writer => {
    await AcquireReader(input, async reader => {
      let result;
      while((result = await reader.read())) {
        if(typeof result.value == 'string') await writer.write(result.value);
        if(result.done) break;
      }
    });
  });
}

export function AsyncWrite(iterator, writable) {
  return AcquireWriter(writable, async writer => {
    for await (let data of iterator) writer.write(await data);
  });
}

export function AsyncRead(readable) {
  return new Repeater(async (push, stop) => {
    AcquireReader(readable, async reader => {
      let result;
      while((result = await reader.read())) {
        console.log('result:', result);
        if(typeof result.value == 'string') await push(result.value);
        if(result.done) break;
      }
      await stop();
    });
  });
}

export async function WriteToRepeater() {
  const repeater = new Repeater(async (push, stop) => {
    await push({
      write(chunk) {
        push(chunk);
      },
      close() {
        stop();
      },
      abort(err) {
        stop(new Error('WriteRepeater error:' + err));
      }
    });
  });
  const stream = new WritableStream((await repeater.next()).value);
  return [repeater, stream];
}

export function LogSink(fn = (...args) => console.log('LogSink.fn', ...args)) {
  return new WritableStream({
    write(chunk) {
      fn(chunk);
    },
    close() {
      fn('LogSink closed');
    },
    abort(err) {
      throw new Error('LogSink error:' + err);
    }
  });
}

export async function RepeaterSink(start = async sink => {}) {
  return new Repeater(async (push, stop) => {
    await start(new WritableStream({
        write(chunk) {
          //  console.debug("RepeaterSink.write", {chunk});
          push(chunk);
        },
        close() {
          stop();
        },
        abort(err) {
          stop(new Error('WriteRepeater error:' + err));
        }
      })
    );
  });
}

export function StringReader(str, chunk = (pos, str) => [pos, str.length]) {
  let pos = 0;
  return new ReadableStream({
    queuingStrategy: new ByteLengthQueuingStrategy({
      highWaterMark: 512,
      size(chunk) {
        console.log('size(chunk)', chunk);
        return 16;
      }
    }),
    start(controller) {
      for(;;) {
        if(read(controller)) break;
      }
    }
  });

  function read(controller) {
    let s = '';
    const { desiredSize } = controller;
    if(pos < str.length) {
      let [start, end] = chunk(pos, str);
      s = str.substring(start, end || str.length);
      controller.enqueue(s);
      pos = end;
    } else {
      controller.close();
      return true;
    }
    console.log('pull()', { desiredSize }, { pos, end: pos + s.length, s });
  }
}

export function LineReader(str, chunkEnd = (pos, str) => 1 + str.indexOf('\n', pos) || str.length) {
  let pos = 0;
  let len = str.length;
  return new ReadableStream({
    start(controller) {
      for(;;) {
        if(pos < str.length) {
          let end = chunkEnd(pos, str);
          controller.enqueue(str.substring(pos, end));
          pos = end;
        } else {
          controller.close();
          break;
        }
      }
    }
  });
}

class DebugTransformer {
  constructor(callback) {
    callback = callback || ((...args) => console.log(...args));
    this._callback = callback;
  }

  transform(chunk, controller) {
    this._callback(Util.className(this) + '.transform', chunk);
    if(chunk != '') {
      controller.enqueue(chunk);
    }
  }

  flush(controller) {
    if(typeof controller.flush == 'function') controller.flush();
    if(typeof controller.close == 'function') controller.close();
    this._callback(Util.className(this) + '.end');
  }
}

export class DebugTransformStream {
  constructor(callback) {
    let handler = new DebugTransformer(callback);

    let transformer = new TransformStream(handler);
    transformer.handler = handler;
    return transformer;
  }
}

export function ChunkReader(str, chunkSize) {
  return StringReader(str, (pos, str) => [pos, pos + chunkSize]);
}

export function ByteReader(str) {
  return ChunkReader(str, 1);
}

export function PipeToRepeater(stream) {
  return RepeaterSink(writable => stream.pipeTo(writable));
}

export default { AsyncRead, AsyncWrite, ArrayWriter, readStream, AcquireReader, AcquireWriter, PipeTo, WriteToRepeater, LogSink, RepeaterSink, StringReader, LineReader, DebugTransformStream, ChunkReader, ByteReader, PipeToRepeater };

const blah =
  false &&
  (function testTransform(str = 'BLAAAAAAAAAAAAAAAAAAAAAAAAAAAAH\nTEST\nXXX\n...\n\n') {
    let ts = new DebugTransformStream();
    let rs = LineReader(str).pipeThrough(ts);
    let [loop, read] = rs.tee();

    (async () => {
      for await (let item of await PipeToRepeater(loop)) console.log('Item:', item);
    })();
    return readStream(read, []);
  })();
