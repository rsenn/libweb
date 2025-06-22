const destreamify = async (stream, callback) => {
  for await(let event of stream) {
    callback(event);
  }
};

export const debounceIterator = function* (stream, interval) {
  let first; //is this first event?  will pass
  let lastEvent; //the last event raised
  let deferred; //deferred promise instance
  let resolve; //resolve method for deferred promise

  //reset internal state - create new deferred/resolve
  const reset = isFirst => {
    first = isFirst;
    lastEvent = undefined;
    deferred = new Promise(r => (resolve = r));
  };

  //handle event resolution
  const passEvent = () => {
    //if no event to pass
    if(lastEvent === undefined) {
      first = true; //reset first state
      return;
    }

    const event = lastEvent; //handle to event to pass
    const res = resolve; //handle to resolve for current deferred
    reset(false); //reset and create next deferred
    setTimeout(passEvent, interval); //debounce timer
    res(event); //resolve current deferred
  };

  reset(true); //set initial state & deferred
  destreamify(stream, event => {
    lastEvent = event; //reference event
    if(first) passEvent(); //if first run, pass it through
  });

  //yield deferred results
  while(true) yield deferred;
};

/* global setTimeout, clearTimeout */
export function debounceAsync(fn, wait = 0, options = {}) {
  //console.debug(`debounceAsync invoked`, { fn, wait, options });
  let lastCallAt;
  let deferred;
  let timer;
  let pendingArgs = [];
  const callFn = (thisObj, args) => {
    //console.debug(`debounceAsync calling`, { lastCallAt, deferred, timer, pendingArgs, fn });
    return fn.call(thisObj, ...args);
  };

  function defer() {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  }

  return function debounced(...args) {
    const currentWait = getWait(wait);
    const currentTime = new Date().getTime();
    const isCold = !lastCallAt || currentTime - lastCallAt > currentWait;
    //console.debug(`debounceAsync handler`, { lastCallAt, currentWait, currentTime, isCold });
    lastCallAt = currentTime;
    if(isCold && options.leading) return options.accumulate ? Promise.resolve(callFn(this, [args])).then(result => result[0]) : Promise.resolve(callFn(this, args));

    if(deferred) clearTimeout(timer);
    else deferred = defer();

    pendingArgs.push(args);
    timer = setTimeout(flush.bind(this), currentWait);
    if(options.accumulate) {
      const argsIndex = pendingArgs.length - 1;
      return deferred.promise.then(results => results[argsIndex]);
    }
    return deferred.promise;
  };

  function getWait(wait) {
    return typeof wait === 'function' ? wait() : wait;
  }

  function flush() {
    const thisDeferred = deferred;
    clearTimeout(timer);
    Promise.resolve(options.accumulate ? callFn(this, [pendingArgs]) : callFn(this, pendingArgs[pendingArgs.length - 1])).then(thisDeferred.resolve, thisDeferred.reject);
    pendingArgs = [];
    deferred = null;
  }
}

export default debounceAsync;
