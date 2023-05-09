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
try {
  WebSocket.prototype[Symbol.asyncIterator] = async function* () {
    while(this.readyState !== 3) {
      yield (await oncePromise(this, 'message')).data;
    }
  };
} catch(e) {}

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

// Only pass along events that meet a condition
export const filter = async function* (stream, test) {
  for await(let event of stream) {
    if(test(event)) {
      yield event;
    }
  }
};

export default {
  timer,
  map,
  consume,
  oncePromise,
  filter,
  accumulate
};
