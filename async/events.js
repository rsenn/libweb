//Tie everything together
var run = async () => {
  var i = 0;
  var clicks = streamify('click', document.querySelector('body'));

  clicks = filter(clicks, (e) => e.target.matches('a'));
  clicks = distinct(clicks, (e) => e.target);
  clicks = map(clicks, (e) => [i++, e]);
  clicks = throttle(clicks, 500);

  subscribe(clicks, ([id, click]) => {
    console.log(id);
    console.log(click);
    click.preventDefault();
  });
};

//Turn any event emitter into a stream
var streamify = async function* (event, element) {
  while(true) {
    yield await oncePromise(element, event);
  }
};

//Generate a Promise that listens only once for an event
var oncePromise = (emitter, event) => {
  return new Promise((resolve) => {
    var handler = (...args) => {
      emitter.removeEventListener(event, handler);
      resolve(...args);
    };
    emitter.addEventListener(event, handler);
  });
};

//Only pass along events that meet a condition
var filter = async function* (stream, test) {
  for await (var event of stream) {
    if(test(event)) {
      yield event;
    }
  }
};

//Transform every event of the stream
var map = async function* (stream, transform) {
  for await (var event of stream) {
    yield transform(event);
  }
};

//Only pass along event if some time has passed since the last one
var throttle = async function* (stream, delay) {
  var lastTime;
  var thisTime;
  for await (var event of stream) {
    thisTime = new Date().getTime();
    if(!lastTime || thisTime - lastTime > delay) {
      lastTime = thisTime;
      yield event;
    }
  }
};

var identity = (e) => e;

//Only pass along events that differ from the last one
var distinct = async function* (stream, extract = identity) {
  var lastVal;
  var thisVal;
  for await (var event of stream) {
    thisVal = extract(event);
    if(thisVal !== lastVal) {
      lastVal = thisVal;
      yield event;
    }
  }
};

//Invoke a callback every time an event arrives
var subscribe = async (stream, callback) => {
  for await (var event of stream) {
    callback(event);
  }
};

run();
