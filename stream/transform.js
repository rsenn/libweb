function transform(transform2) {
  return new TransformStream({ transform: transform2 });
}

function map(mapper) {
  return transform(async (data, controller) => {
    controller.enqueue(await mapper(data));
  });
}

function filter(predicate) {
  return transform(async (data, controller) => {
    if(await predicate(data)) {
      controller.enqueue(data);
    }
  });
}

function take(count) {
  return transform(async (data, controller) => {
    if(count > 0) {
      controller.enqueue(data);
      count--;
    }
  });
}

function drop(count) {
  return transform(async (data, controller) => {
    if(count > 0) {
      count--;
      return;
    }
    controller.enqueue(data);
  });
}

function concat(...streams) {
  const { readable, writable } = new TransformStream();
  streams
    .reduce((prev, stream) => prev.then(() => stream.pipeTo(writable, { preventClose: true })), Promise.resolve())
    .then(() => writable.close());
  return readable;
}

function zipWith(stream) {
  const reader = stream.getReader();
  return new TransformStream({
    flush() {
      reader.releaseLock();
    },
    transform: async (data, controller) => {
      if(await reader.closed) return;
      const value = await reader.read();
      if(value.done) {
        return;
      }
      controller.enqueue([data, value.value]);
    }
  });
}

function zip(stream1, stream2) {
  const { readable, writable } = new TransformStream();
  (async function() {
    const reader1 = stream1.getReader();
    const reader2 = stream2.getReader();
    const writer = writable.getWriter();
    try {
      for(;;) {
        const [item1, item2] = await Promise.all([reader1.read(), reader2.read()]);
        if(item1.done || item2.done) {
          break;
        }
        writer.write([item1.value, item2.value]);
      }
    } finally {
      reader1.releaseLock();
      reader2.releaseLock();
      writer.releaseLock();
    }
  })();
  return readable;
}

function enumerate() {
  let index = 0;
  return new TransformStream({
    transform(data, controller) {
      controller.enqueue([index++, data]);
    }
  });
}

function iota(n = Infinity) {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      return new Promise(resolve => {
        setTimeout(() => {
          if(index < n) {
            controller.enqueue(index++);
          } else {
            controller.close();
          }
          resolve();
        }, 0);
      });
    }
  });
}

function debounce(ms) {
  let timer;
  return new TransformStream({
    transform(data, controller) {
      if(!timer) {
        controller.enqueue(data);
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = void 0;
      }, ms);
    },
    flush() {
      if(timer) {
        clearTimeout(timer);
        timer = void 0;
      }
    }
  });
}

function throttle(ms) {
  let timer;
  return new TransformStream({
    transform(data, controller) {
      if(!timer) {
        controller.enqueue(data);
        timer = setTimeout(() => {
          timer = void 0;
        }, ms);
      }
    },
    flush() {
      if(timer) {
        clearTimeout(timer);
        timer = void 0;
      }
    }
  });
}

export { concat, debounce, drop, enumerate, filter, iota, map, take, throttle, transform, zip, zipWith };
//# sourceMappingURL=stream.js.map
