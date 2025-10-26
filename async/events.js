// Generate a Promise that listens only once for an event

export function once(emitter, ...events) {
  if(events.length == 1 && Array.isArray(events[0])) events = events[0];
  return waitOne(emitter, events); /*new Promise(resolve => { events.forEach(type => emitter.addEventListener(type, handler, { passive: true })); function handler(event) { events.forEach(type =>
emitter.removeEventListener(type, handler, { passive: true })); resolve(event); } });*/
}

export function waitOne(emitter, events, options = { passive: true, capture: false }) {
  return new Promise(resolve => {
    events.forEach(type => emitter.addEventListener(type, handler, options));
    function handler(event) {
      events.forEach(type => emitter.removeEventListener(type, handler, options));
      resolve(event);
      return options.return;
    }
  });
}

// Turn any event emitter into a stream
export async function* streamify(event, element, options = { passive: true, capture: false }) {
  let events = Array.isArray(event) ? event : [event];
  for(;;) yield await waitOne(element, events, options);
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

let identity = e => e; // Only pass along events that differ from the last one

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
} // run();
