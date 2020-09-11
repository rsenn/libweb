export const ArrayWriter = (arr) =>
  new WritableStream({
    write(chunk) {
      arr.push(chunk);
    },
    abort(err) {
      //console.log('ArrayWriter error:', err);
    }
  });

export function readStream(stream, arr) {
  const reader = stream.getReader();
  let count = 0;
  return new Promise((resolve, reject) => {
    reader.read().then(function processData(res) {
      if(res.done) {
        resolve();
        return;
      }
      count++;
      arr.push(res.value);
      return reader.read().then(processData);
    });
  });
}

export const WriteToRepeater = async () => {
  const repeater = new Repeater(async (push, stop) => {
    await push({ write(chunk) { push(chunk); }, close() { stop(); }, abort(err) { stop(new Error('WriteRepeater error:' + err)); } });
  });
  const stream = new WritableStream((await repeater.next()).value);
  return [repeater, stream];
};

export const LogSink = (fn = console.log) =>
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
      for(;;) 
        this.read(controller);
    }
  });

  function read(controller) {
    let s;
    if(pos < str.length) {
      let [start, end] = chunk(pos, str);
      s = str.substring(start, end || str.length);
      controller.enqueue(s);
      pos = end;
    } else {
      controller.close();
    }
    console.log('pull()', { desiredSize: n }, { pos, end: pos + s.length, s });
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

export const ChunkReader = (str, chunkSize) => new StringReader(str, (pos, str) => [pos, pos + chunkSize]);

export const ByteReader = (str) => ChunkReader(str, 1);

export const PipeToRepeater = async (stream) => RepeaterSink((writable) => stream.pipeTo(writable));

export default {  ArrayWriter, readStream, WriteToRepeater, LogSink, RepeaterSink, StringReader, LineReader, ChunkReader, ByteReader, PipeToRepeater };
