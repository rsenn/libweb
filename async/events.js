// Generate a Promise that listens only once for an event
export function once(emitter, ...events) {
  return new Promise(resolve => {
    events.forEach(type => emitter.addEventListener(type, handler, { passive: true }));
    function handler(event) {
      events.forEach(type => emitter.removeEventListener(type, handler, { passive: true }));
      resolve(event);
    }
  });
}

// Turn any event emitter into a stream
export async function* streamify(event, element) {
  let events = Array.isArray(event) ? event : [event];
  while(true) {
    yield await once(element, ...events);
  }
}

// Only pass along events that meet a condition
export async function* filter(stream, test) {
  for await(let event of stream) {
    if(test(event)) yield event;
  }
}

// Transform every event of the stream
export async function* map(stream, transform) {
  for await(let event of stream) {
    yield transform(event);
  }
}

// Only pass along event if some time has passed since the last one
export async function* throttle(stream, delay) {
  let lastTime;
  let thisTime;
  for await(let event of stream) {
    thisTime = new Date().getTime();
    if(!lastTime || thisTime - lastTime > delay) {
      lastTime = thisTime;
      yield event;
    }
  }
}

let identity = e => e;

// Only pass along events that differ from the last one
export async function* distinct(stream, extract = identity) {
  let previous;
  let current;
  for await(let event of stream) {
    current = extract(event);
    if(current !== previous) {
      previous = current;
      yield event;
    }
  }
}

// Invoke a callback every time an event arrives
export async function subscribe(stream, callback) {
  for await(let event of stream) callback(event);
}

// run();
