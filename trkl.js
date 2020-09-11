let computedTracker = [];

//We will need to copy subscriptions here during writes, so that subscriptions can edit their original subscription lists
//safely. This is necessary for subscriptions that remove themselves.
let effects = [];

export function trkl(initValue) {
  let value = initValue;
  let subscribers = [];

  let self = function(writeValue) {
    if(arguments.length) {
      write(writeValue);
    } else {
      return read();
    }
  };

  //Using string keys tells Uglify that we intend to export these symbols
  self.subscribe = subscribe;

  self['bind_to'] = (obj, prop) => {
    Object.defineProperty(obj, prop, {
      enumerable: true,
      configurable: true,
      get: self,
      set: self
    });
    return self;
  };

  //declaring as a private function means the minifier can scrub its name on internal references
  function subscribe(subscriber, immediate) {
    if(!~subscribers.indexOf(subscriber)) {
      subscribers.push(subscriber);
    }
    if(immediate) {
      subscriber(value);
    }
    return this;
  }

  self.unsubscribe = function(subscriber) {
    remove(subscribers, subscriber);
    return this;
  };

  function write(newValue) {
    let oldValue = value;

    if(newValue === oldValue && (newValue === null || typeof newValue !== 'object')) {
      return; //bail out
    }

    value = newValue;
    effects.push.apply(effects, subscribers);

    //We will now rewind through as many effects as we have subscribers
    //We don't recheck the length during the loop, as subscribers may be mutated
    //(e.g. when a subscribers unsubs itself)
    let subCount = subscribers.length;
    for(let i = 0; i < subCount; i++) {
      //If a sub throws an error, the effects array will just keep growing and growing.
      //It won't stop operating properly, but it might eat memory. We're okay with this, I guess?
      effects.pop()(value, oldValue);
    }
  }

  function read() {
    let runningComputation = computedTracker[computedTracker.length - 1];
    if(runningComputation) {
      subscribe(runningComputation._subscriber);
    }
    return value;
  }
  Object.setPrototypeOf(self, trkl.prototype);

  return self;
}

trkl.prototype = Object.create({ ...Function.prototype, constructor: trkl });
trkl.is = (arg) => typeof arg == 'function' && typeof arg.subscribe == 'function';

trkl.getset = function(arg) {
  let trkl = arg || new trkl(arg);
  return Object.create({
      get: () => trkl(),
      set: (value) => trkl(value)
    },
    {}
  );
};

trkl.computed = function(fn) {
  let self = trkl();
  let computationToken = {
    _subscriber: runComputed
  };

  runComputed();
  return self;

  function runComputed() {
    detectCircularity(computationToken);
    computedTracker.push(computationToken);
    let errors, result;
    try {
      result = fn();
    } catch(e) {
      errors = e;
    }
    computedTracker.pop();
    if(errors) {
      throw errors;
    }
    self(result);
  }
};

trkl.from = function(executor) {
  let self = trkl();
  executor(self);
  return self;
};

trkl.property = function(object, name, options = { enumerable: true, configurable: true, deletable: false }) {
  const { value, ...opts } = options;
  let self = trkl(value);
  Object.defineProperty(object, name, {
    ...opts,
    get: self,
    set: self
  });
  if(options.deletable) {
    trkl.subscribe((value) => (value === undefined ? self.delete() : undefined));
    self.delete = () => {
      delete object[name];
      self(null);
    };
  }
  return self;
};

trkl.bind = function(object, name, handler) {
  let self = handler;
  if(typeof name == 'object')
    Object.defineProperties(object,
      Object.keys(name).reduce((acc, key) => ({ ...acc, [key]: { get: name[key], set: name[key], enumerable: true } }), {})
    );
  else
    Object.defineProperty(object, name, {
      enumerable: true,
      configurable: true,
      get: self,
      set: self
    });
  return object;
};

trkl.object = function(handlers, ret = {}) {
  for(let prop in handlers) {
    ret[prop] = handlers[prop]();

    trkl.bind(ret, prop, handlers[prop]);
  }

  return ret;
};

function detectCircularity(token) {
  if(computedTracker.indexOf(token) !== -1) {
    throw Error('Circular computation detected');
  }
}

function remove(array, item) {
  let position = array.indexOf(item);
  if(position !== -1) {
    array.splice(position, 1);
  }
}

export default trkl;

/*if(typeof module === "object") {
  const { from, computed, property } = trkl;
  //console.log("trkl.property ", trkl.property);
  module.exports = { from, computed, property, trkl };
} else {
  window["trkl"] = trkl;
}*/
