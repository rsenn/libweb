// Create a Promise that resolves after ms time
export const timer = function(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

// Repeatedly generate a number starting
// from 0 after a random amount of time
let source = async function* () {
  let i = 0;
  while(true) {
    await timer(Math.random() * 1000);
    yield i++;
  }
};

// Return a new async iterator that applies a
// transform to the values from another async generator
export const map = async function* (stream, transform = a => a) {
  for await(let n of stream) {
    yield transform(n);
  }
};
export const consume = async function(stream, fn = a => console.log(`async consume =`, a)) {
  for await(let n of stream) await fn(n);
};
export const accumulate = async function(stream, accu) {
  return await consume(stream, a => accu.push(a)), accu;
};

// Add an async iterator to all WebSockets
WebSocket.prototype[Symbol.asyncIterator] = async function* () {
  while(this.readyState !== 3) {
    yield (await oncePromise(this, 'message')).data;
  }
};

// Generate a Promise that listens only once for an event
export const oncePromise = (emitter, event) => {
  let events = Array.isArray(event) ? event : [event];
  return new Promise(resolve => {
    var handler = (...args) => {
      events.forEach(event => emitter.removeEventListener(event, handler));
      resolve(...args);
    };
    events.forEach(event => emitter.addEventListener(event, handler));
  });
};

// Turn any event emitter into a stream
export const streamify = async function* (event, element) {
  while(true) {
    yield await oncePromise(element, event);
  }
};

// Only pass along events that meet a condition
export const filter = async function* (stream, test) {
  for await(let event of stream) {
    if(test(event)) {
      yield event;
    }
  }
};

let identity = e => e;
// Only pass along events that differ from the last one
export const distinct = async function* (stream, extract = identity) {
  let lastVal;
  let thisVal;
  for await(let event of stream) {
    thisVal = extract(event);
    if(thisVal !== lastVal) {
      lastVal = thisVal;
      yield event;
    }
  }
};

// Only pass along event if some time has passed since the last one
export const throttle = async function* (stream, delay) {
  let lastTime;
  let thisTime;
  for await(let event of stream) {
    thisTime = new Date().getTime();
    if(!lastTime || thisTime - lastTime > delay) {
      lastTime = thisTime;
      yield event;
    }
  }
};

// Invoke a callback every time an event arrives
export const subscribe = async (stream, callback) => {
  for await(let event of stream) {
    callback(event);
  }
};

/*var streamify = async function*(event, element) {
  element.addEventListener(event, e => {
     // This doesn't work because yield is being
     // called from inside another function.
    yield e;
  });
};*/
export default {
  timer,
  map,
  consume,
  oncePromise,
  streamify,
  filter,
  distinct,
  throttle,
  subscribe,
  accumulate
};
