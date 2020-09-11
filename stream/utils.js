import { Repeater } from '../repeater/repeater.js';

export const ArrayWriter = (arr) =>
  new WritableStream({
    write(chunk) {
      arr.push(chunk);
    },
    abort(err) {
      //console.log('ArrayWriter error:', err);
    }
  });

export async function readStream(stream, arg) {
  let repeater = await PipeToRepeater(stream);
  let fn;

  if(arg === undefined)
    return await (async function* () {
      for await (let item of repeater) yield await item;
    })();

  if(arg instanceof Array) fn = (item) => arg.push(item);
  else if(typeof arg == 'function') fn = (item) => arg(item);
  else if(typeof arg == 'string') fn = (item) => (arg += item);
  for await (let item of repeater) fn(item);
  if(typeof arg == 'function') arg(undefined);
  return arg;
}

export function AcquireReader(stream, fn) {
  fn =
    fn ||
    (async (reader) => {
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
  let acquire = async () => {
    reader = await stream.getReader();
    ret = await fn(reader);
    await reader.releaseLock();
    return ret;
  };
  return acquire();
}
export function AcquireWriter(stream, fn) {
  fn =
    fn ||
    (async (writer) => {
      await writer.write('TEST');
    });
  let acquire = async (writer) => {
    writer = await writer;
     let   ret = await fn(writer);
    await writer.releaseLock();
    return ret;
  };
  return acquire(stream.getWriter());
}

export function PipeTo(input, output) {
 return AcquireWriter(output, async (writer) => {
    await AcquireReader(input, async (reader) => {
      let result;
      while((result = await reader.read())) {
        if(typeof result.value == 'string') await writer.write(result.value);
        if(result.done) break;
      }
    });
  });
}

export function ReadIterator(stream) {
  return (async function* (reader) {
    let result;
    reader = await reader;
    while((result = await reader.read())) {
       if(typeof result.value == 'string') yield result.value;
      if(result.done) break;
    }
    await reader.releaseLock();
  })(stream.getReader());
}

export const WriteToRepeater = async () => {
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
};

export const LogSink = (fn = (...args) => console.log('LogSink.fn', ...args)) =>
  new WritableStream({
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

export const RepeaterSink = async (start = (sink) => {}) =>
  new Repeater(async (push, stop) => {
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

export const StringReader = function (str, chunk = (pos, str) => [pos, str.length]) {
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
};

export const LineReader = (str, chunkEnd = (pos, str) => 1 + str.indexOf('\n', pos) || str.length) => {
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
};

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

export const ChunkReader = (str, chunkSize) => new StringReader(str, (pos, str) => [pos, pos + chunkSize]);

export const ByteReader = (str) => ChunkReader(str, 1);

export const PipeToRepeater = async (stream) => RepeaterSink((writable) => stream.pipeTo(writable));

export default { PipeTo, AcquireReader, AcquireWriter, ReadIterator, ArrayWriter, readStream, WriteToRepeater, LogSink, RepeaterSink, StringReader, LineReader, ChunkReader, ByteReader, PipeToRepeater };

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
