import { Repeater } from '../repeater/repeater.js';
import { className, isConstructor } from '../misc.js';

function gotClassPrototype(name, protoFn) {
  let ctor = globalThis[name];
  return isConstructor(ctor) && ctor.prototype && typeof ctor.prototype[protoFn] == 'function';
}

export function isStream(obj) {
  if(/Stream$/.test(className(obj))) return true;

  if(typeof obj.pipe == 'function' && typeof obj.cork == 'function') return true;
  if(typeof obj.getReader == 'function' || typeof obj.getWriter == 'function') return true;

  return false;
}

export const AcquireReader =
  (gotClassPrototype('ReadableStream', 'getReader') &&
    ((stream, fn) => {
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
    })) ||
  ((
    stream,
    fn = async reader => {
      console.log('reader.read()', reader.read());
    }
  ) => {
    return (async () => {
      let ret = await fn({
        read() {
          return new Promise((resolve, reject) => {
            let listeners = {
              data(value) {
                removeListeners();
                resolve({ value, done: false });
              },
              error(error) {
                removeListeners();
                reject({ error, done: true });
              },
              close() {
                removeListeners();
                resolve({ value: null, done: true });
              }
            };

            function addListeners() {
              for(let eventName in listeners) stream.addListener(eventName, listeners[eventName]);
            }
            function removeListeners() {
              for(let eventName in listeners) stream.removeListener(eventName, listeners[eventName]);
            }

            addListeners();
          });
        }
      });
      return ret;
    })();
  });

export const AcquireWriter =
  (gotClassPrototype('WritableStream', 'getWriter') &&
    ((
      stream,
      fn = async writer => {
        await writer.write('TEST');
      }
    ) => {
      return (async writer => {
        writer = await writer;
        let ret = await fn(writer);
        await writer.releaseLock();
        return ret;
      })(stream.getWriter());
    })) ||
  ((
    stream,
    fn = async writer => {
      await writer.write('TEST');
    }
  ) => {
    return (async () => {
      let ret = await fn({
        write(chunk) {
          return stream.write(chunk);
          return new Promise((resolve, reject) => stream.write(chunk, 'utf-8', err => (err ? reject(err) : resolve(chunk.length))));
        }
      });
      return ret;
    })();
  });

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
      for await(let item of repeater) yield await item;
    })();

  if(arg instanceof Array) fn = item => arg.push(item);
  else if(typeof arg == 'function') fn = item => arg(item);
  else if(typeof arg == 'string') fn = item => (arg += item);
  for await(let item of repeater) fn(item);
  if(typeof arg == 'function') arg(undefined);
  return arg;
}

export async function PipeTo(input, output) {
  if(typeof input.pipeTo == 'function') return input.pipeTo(output);
  if(typeof input.pipe == 'function') return input.pipe(output);

  return await AcquireWriter(output, async writer => {
    await AcquireReader(input, async reader => {
      let result;
      while((result = await reader.read())) {
        if(typeof result.value == 'string') await writer.write(result.value);
        if(result.done) break;
      }
    });
  });
}

export function WritableRepeater(writable) {
  return new Repeater(async (push, stop) => {
    let write = chunk => {
      let r = writable.write(Buffer.from(chunk));
      if(r == false) {
        writable.once('drain', () => {
          console.log('drain');
          push(write);
        });
      } else {
        process.nextTick(() => push(write));
      }
      return r;
    };

    push(write);
  });
}

export async function WriteIterator(iterator, writable) {
<<<<<<< HEAD
  if(types.isGeneratorFunction(iterator)) iterator = iterator();
=======
  if(isGenerator(iterator)) iterator = iterator();
>>>>>>> 3bff3e8fe346d1edd1510e14a0fd86ed03820ddf

  for await(let write of await WritableRepeater(writable)) {
    let data = await iterator.next();
    if(data.done) break;
    console.debug('value:', data.value);
    write(data.value);
  }
}

export function AsyncWrite(iterator, writable) {
  if(AcquireWriter)
    return AcquireWriter(writable, async writer => {
      for await(let data of iterator) writer.write(await data);
    });
}

/**
 * Reads from readable stream and pushes to repeater
 *
 * @class      AsyncRead (name)
 * @param      {ReadableStream}     The readable stream
 * @return     {Iterator}           An async iterator
 */
export function AsyncRead(readable) {
  if(AcquireReader)
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

  return new Repeater(async (push, stop) => {
    readable.on('readable', async function() {
      // There is some data to read now.
      let data;

      while((data = this.read())) await push(data);
    });
    readable.on('end', () => stop());
  });
}

export const ReadFromIterator = null;

export async function WriteToRepeater() {
  const repeater = new Repeater(async (push, stop) => {
    await push({
      write(chunk) {
        push(chunk);
        return true;
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

export class DebugTransformStream {
  constructor(callback) {
    callback = callback || ((...args) => console.log(...args));
    let handler = {
      callback,
      transform(chunk, controller) {
        this.callback(className(this) + '.transform', chunk);
        if(chunk != '') {
          controller.enqueue(chunk);
        }
      },

      flush(controller) {
        if(typeof controller.flush == 'function') controller.flush();
        if(typeof controller.close == 'function') controller.close();
        this.callback(className(this) + '.end');
      }
    };

    let transformer = new TransformStream(handler);
    transformer.handler = handler;
    return transformer;
  }
}

export async function CreateWritableStream(handler, options = { decodeStrings: false }) {
  let ctor, browser, args;
  if((ctor = globalThis.WritableStream)) {
    browser = true;
    args = [handler, options];
  } else {
    ctor = (await import('stream')).Writable;
    ctor = class extends ctor {
      constructor(...args) {
        super(...args);
      }
      _write(chunk, encoding, callback) {
        if(options.decodeStrings === false && typeof chunk.toString == 'function') chunk = chunk.toString();
        let ret = handler.write(chunk);

        handleReturnValue(ret, callback);
      }
      _destroy(err, callback) {
        let ret;
        if(!err) {
          if(typeof handler.close == 'function') ret = handler.close();
        } else {
          if(typeof handler.abort == 'function') ret = handler.abort(err);
        }
        handleReturnValue(ret, callback);
      }
      _final(callback) {
        let ret;
        if(typeof handler.close == 'function') ret = handler.close();
        handleReturnValue(ret, callback);
      }
    };
    args = [options];

    function handleReturnValue(ret, callback) {
      if(ret instanceof Promise) ret.then(() => callback()).catch(err => callback(err));
      else if(ret === true) callback();
    }
  }
  return new ctor(...args);
}

export async function CreateTransformStream(handler, options = { decodeStrings: false }) {
  let ctor, browser, args;
  if((ctor = globalThis.TransformStream)) {
    browser = true;
    args = [handler, options];
  } else {
    ctor = (await import('stream')).Transform;
    let controller = {
      enqueue(chunk) {
        const { instance, callback } = this;
        return /*callback ? callback(null, chunk) :*/ instance.push(chunk);
      },
      close() {
        const { instance } = this;
        instance.cork();
        return instance.destroy();
      },
      error(err) {
        const { instance } = this;
        return instance.destroy(err);
      }
    };
    ctor = class extends ctor {
      _transform(chunk, encoding, done) {
        if(!('instance' in controller)) controller.instance = this;
        controller.callback = done;
        if(options.decodeStrings == false && typeof chunk.toString == 'function') chunk = chunk.toString();

        handler.transform(chunk, controller);

        delete controller.callback;
        done();
      }
      _flush(done) {
        if(!('instance' in controller)) controller.instance = this;
        handler.flush(controller);
        done();
      }
    };
    args = [options];
  }
  return new ctor(...args);
}

export function RepeaterSource(stream) {
  return new Repeater(async (push, stop) => {
    let listeners = {
      data(value) {
        push(value);
      },
      error(error) {
        removeListeners();
        stop(error);
      },
      close() {
        removeListeners();
        stop();
      },
      end() {
        removeListeners();
        stop();
      }
    };
    function addListeners() {
      for(let eventName in listeners) stream.addListener(eventName, listeners[eventName]);
    }
    function removeListeners() {
      for(let eventName in listeners) stream.removeListener(eventName, listeners[eventName]);
    }
    addListeners();
  });
}

export async function RepeaterSink(start /*= async sink => {}*/) {
  let ret = new Repeater(async (push, stop) => {
    let wr = await CreateWritableStream({
      write(chunk) {
        //console.debug('RepeaterSink.write', { chunk }, this.write + '');
        return push(chunk);
      },
      close() {
        // console.debug('RepeaterSink.close');
        return stop();
      },
      abort(err) {
        //SS{ position }console.debug('RepeaterSink.abort', err);
        return stop(new Error('WriteRepeater error:' + err));
      }
    });
    if(typeof start == 'function') await start(wr);
    else await push(wr);
  });
  if(typeof start != 'function') return [ret, (await ret.next()).value];

  return ret;
}

export async function LineBufferStream(options = {}) {
  let lines = [];

  let stream = await CreateTransformStream(
    {
      queue(str) {
        if(typeof str != 'string') if (typeof str.toString == 'function') str = str.toString();

        if(lines.length > 0 && !lines[lines.length - 1].endsWith('\n')) lines[lines.length - 1] += str;
        else lines.push(str);
      },
      transform(chunk, controller) {
        let i, j;
        // console.log('chunk:', typeof chunk, className(chunk), chunk.length);
        for(i = 0; i < chunk.length; i = j) {
          j = chunk.indexOf('\n', i) + 1;
          this.queue(j ? chunk.slice(i, j) : chunk.slice(i));
          if(j == 0) break;
        }
        while(lines.length > 0 && !(lines.length == 1 && !lines[0].endsWith('\n'))) if(!controller.enqueue(lines.shift())) return false;
      },
      flush(controller) {
        while(lines.length > 0) controller.enqueue(lines.shift());
      }
    },
    { ...options, decodeStrings: true }
  );
  stream.lines = lines;
  return stream;
}

export function TextTransformStream(tfn) {
  tfn = tfn || (chunk => (typeof chunk.toString == 'function' ? chunk.toString() : chunk + ''));
  return CreateTransformStream({
    transform(chunk, controller) {
      chunk = tfn(chunk);
      console.log('chunk:', chunk);
      controller.enqueue(chunk);
    },

    flush(controller) {
      if(typeof controller.flush == 'function') controller.flush();
      else if(typeof controller.close == 'function') controller.close();
    }
  });
}

export function ChunkReader(str, chunkSize) {
  return StringReader(str, (pos, str) => [pos, pos + chunkSize]);
}

export function ByteReader(str) {
  return ChunkReader(str, 1);
}

export function PipeToRepeater(stream) {
  return RepeaterSink(writable => PipeTo(stream, writable));
}

export async function* Reader(input) {
  const buffer = new ArrayBuffer(1024);
  let ret;
  do {
    await filesystem.waitRead(input);
    ret = filesystem.read(input, buffer, 0, 1024);
    yield buffer.slice(0, ret);
  } while(ret == 1024);
}

export async function ReadAll(input) {
  let data = '';
  for await(let chunk of await Reader(input)) data += filesystem.bufferToString(chunk);
  return data;
}

export default {
  AsyncRead,
  AsyncWrite,
  ArrayWriter,
  readStream,
  AcquireReader,
  AcquireWriter,
  PipeTo,
  WriteToRepeater,
  LogSink,
  RepeaterSink,
  StringReader,
  LineReader,
  DebugTransformStream,
  ChunkReader,
  ByteReader,
  PipeToRepeater
};

const blah =
  false &&
  (function testTransform(str = 'BLAAAAAAAAAAAAAAAAAAAAAAAAAAAAH\nTEST\nXXX\n...\n\n') {
    let ts = new DebugTransformStream();
    let rs = LineReader(str).pipeThrough(ts);
    let [loop, read] = rs.tee();

    (async () => {
      for await(let item of await PipeToRepeater(loop)) console.log('Item:', item);
    })();
    return readStream(read, []);
  })();
