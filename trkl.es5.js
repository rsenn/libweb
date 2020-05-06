"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trkl = trkl;
exports.default = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var computedTracker = [];
var effects = [];

function trkl(initValue) {
  var value = initValue;
  var subscribers = [];

  var self = function self(writeValue) {
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

trkl.prototype = Object.create(_objectSpread({}, Function.prototype, {
  constructor: trkl
}));

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
  configurable: true,
  deletable: false
}) {
  const value = options.value,
        opts = (0, _objectWithoutProperties2.default)(options, ["value"]);
  var self = trkl(value);
  Object.defineProperty(object, name, _objectSpread({}, opts, {
    get: self,
    set: self
  }));

  if (options.deletable) {
    trkl.subscribe(value => value === undefined ? self.delete() : undefined);

    self.delete = () => {
      delete object[name];
      self(null);
    };
  }

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

var _default = trkl;
exports.default = _default;
