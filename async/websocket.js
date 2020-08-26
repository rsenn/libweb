//Generate a Promise that listens only once for an event
let oncePromise = (emitter, event) =>
  new Promise((resolve) => {
    var handler = (...args) => {
      emitter.removeEventListener(event, handler);
      resolve(...args);
    };
    emitter.addEventListener(event, handler);
  });

//Add an async iterator to all WebSockets
WebSocket.prototype[Symbol.asyncIterator] = async function* () {
  while(this.readyState !== 3) {
    yield (await oncePromise(this, 'message')).data;
  }
};

//Tie everything together
let run = async () => {
  let ws = new WebSocket('ws://localhost:3000/');
  for await (let message of ws) {
    console.log(message);
  }
};

run();
//=> "hello"
//=> "sandwich"
//=> "otters"
//...
