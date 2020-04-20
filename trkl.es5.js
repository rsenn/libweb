var computedTracker = [];
var effects = [];
export function trkl(initValue) {
  var value = initValue;
  var subscribers = [];

  var self = function (writeValue) {
    if (arguments.length) {
      write(writeValue);
    } else {
      return read();
    }
  };

  self["subscribe"] = subscribe;

  self["bind_to"] = (obj, prop) => {
    Object.defineProperty(obj, prop, {
      enumerable: true,
      configurable: true,
      get: self,
      set: self
    });
    return self;
  };

  function subscribe(subscriber, immediate) {
    if (!~subscribers.indexOf(subscriber)) {
      subscribers.push(subscriber);
    }

    if (immediate) {
      subscriber(value);
    }
  }

  self["unsubscribe"] = function (subscriber) {
    remove(subscribers, subscriber);
  };

  function write(newValue) {
    var oldValue = value;

    if (newValue === oldValue && (newValue === null || typeof newValue !== "object")) {
      return;
    }

    value = newValue;
    effects.push.apply(effects, subscribers);
    var subCount = subscribers.length;

    for (var i = 0; i < subCount; i++) {
      effects.pop()(value, oldValue);
    }
  }

  function read() {
    var runningComputation = computedTracker[computedTracker.length - 1];

    if (runningComputation) {
      subscribe(runningComputation._subscriber);
    }

    return value;
  }

  Object.setPrototypeOf(self, trkl.prototype);
  return self;
}
trkl.prototype = Object.create({ ...Function.prototype,
  constructor: trkl
});

trkl.getset = function (arg) {
  let trkl = arg || new trkl(arg);
  return Object.create({
    get: () => trkl(),
    set: value => trkl(value)
  }, {});
};

trkl.computed = function (fn) {
  var self = trkl();
  var computationToken = {
    _subscriber: runComputed
  };
  runComputed();
  return self;

  function runComputed() {
    detectCircularity(computationToken);
    computedTracker.push(computationToken);
    var errors, result;

    try {
      result = fn();
    } catch (e) {
      errors = e;
    }

    computedTracker.pop();

    if (errors) {
      throw errors;
    }

    self(result);
  }
};

trkl["from"] = function (executor) {
  var self = trkl();
  executor(self);
  return self;
};

trkl.property = function (object, name, options = {
  enumerable: true,
  configurable: true
}) {
  const {
    value,
    ...opts
  } = options;
  var self = trkl(value);
  Object.defineProperty(object, name, { ...opts,
    get: self,
    set: self
  });
  return self;
};

trkl.bind = function (object, name, handler) {
  var self = handler;
  Object.defineProperty(object, name, {
    enumerable: true,
    configurable: true,
    get: self,
    set: self
  });
  return object;
};

trkl.object = function (handlers, ret = {}) {
  for (let prop in handlers) trkl.bind(ret, prop, handlers[prop]);

  return ret;
};

function detectCircularity(token) {
  if (computedTracker.indexOf(token) !== -1) {
    throw Error("Circular computation detected");
  }
}

function remove(array, item) {
  var position = array.indexOf(item);

  if (position !== -1) {
    array.splice(position, 1);
  }
}

export default trkl;
