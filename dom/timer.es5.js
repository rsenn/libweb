"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Timer = Timer;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if(Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if(enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for(var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if(i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        (0, _defineProperty2.default)(target, key, source[key]);
      });
    } else if(Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}

function Timer(timeout, fn, props = {}, { create = setInterval, destroy = clearInterval }) {
  let t;
  t = _objectSpread(
    {
      timeout,
      fn,
      running: true,
      id: create(() => fn.call(t, t), timeout, fn, t),
      started: Date.now(),

      stop() {
        if(this.id !== null) {
          destroy(this.id);
          this.id = null;
          this.running = false;
        }
      }
    },
    props
  );
  if(this instanceof Timer) Object.assign(this, t);
  else return t;
}

Timer.interval = (timeout, fn, props) =>
  new Timer(timeout, fn, props, {
    destroy: clearTimeout
  });

Timer.once = (timeout, fn, props) =>
  new Timer(timeout, fn, props, {
    create: setTimeout,
    destroy: clearTimeout
  });

Timer.until = (deadline, fn, props) => Timer.once(deadline - Date.now(), fn, props);

Timer.std = {
  create: (fn, interval) => setTimeout(fn, interval),
  destroy: id => clearTimeout(id)
};

Timer.debug = (impl = Timer.std) => ({
  log: msg => console.log(msg),

  create(fn, timeout) {
    var id, str;
    id = impl.create(() => {
      this.log("Timer #".concat(id, " END"));
      impl.destroy(id);
      fn();
    }, timeout);
    this.log("Timer #".concat(id, " START ").concat(timeout, "ms"));
    return id;
  },

  destroy(id) {
    impl.destroy(id);
    this.log("Timer #".concat(id, " STOP"));
  }
});

Timer.promise = (timeout, impl = Timer.std) =>
  new Promise((resolve, reject) =>
    Timer(
      timeout,
      resolve,
      {},
      {
        create: (fn, timeout) => impl.create(fn, timeout),
        destroy: id => {
          impl.destroy(id);
          reject();
        }
      }
    )
  );
