var _Object$defineProperties = require("@babel/runtime-corejs2/core-js/object/define-properties");

var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor");

var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols");

var _Object$keys = require("@babel/runtime-corejs2/core-js/object/keys");

var _defineProperty = require("@babel/runtime-corejs2/helpers/defineProperty");

var _objectWithoutProperties = require("@babel/runtime-corejs2/helpers/objectWithoutProperties");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (_Object$getOwnPropertyDescriptors) { _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } } return target; }

var computedTracker = []; //We will need to copy subscriptions here during writes, so that subscriptions can edit their original subscription lists
//safely. This is necessary for subscriptions that remove themselves.

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
  }; //Using string keys tells Uglify that we intend to export these symbols


  self["subscribe"] = subscribe;

  self["bind_to"] = function (obj, prop) {
    _Object$defineProperty(obj, prop, {
      enumerable: true,
      configurable: true,
      get: self,
      set: self
    });

    return self;
  }; //declaring as a private function means the minifier can scrub its name on internal references


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
      return; // bail out
    }

    value = newValue;
    effects.push.apply(effects, subscribers); //We will now rewind through as many effects as we have subscribers
    //We don't recheck the length during the loop, as subscribers may be mutated
    //(e.g. when a subscribers unsubs itself)

    var subCount = subscribers.length;

    for (var i = 0; i < subCount; i++) {
      //If a sub throws an error, the effects array will just keep growing and growing.
      //It won't stop operating properly, but it might eat memory. We're okay with this, I guess?
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

  return self;
}

trkl["computed"] = function (fn) {
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

trkl.property = function (object, name) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    enumerable: true,
    configurable: true
  };

  var value = options.value,
      opts = _objectWithoutProperties(options, ["value"]);

  var self = trkl(value);

  _Object$defineProperty(object, name, _objectSpread({}, opts, {
    get: self,
    set: self
  }));

  return self;
};

trkl.bind = function (object, name, handler) {
  var self = handler;

  _Object$defineProperty(object, name, {
    enumerable: true,
    configurable: true,
    get: self,
    set: self
  });

  return self;
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

if (typeof module === "object") {
  var from = trkl.from,
      computed = trkl.computed,
      property = trkl.property; //console.log("trkl.property ", trkl.property);

  module.exports = {
    from: from,
    computed: computed,
    property: property,
    trkl: trkl
  };
} else {
  window["trkl"] = trkl;
}
