"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Timer = Timer;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function Timer(timeout, fn) {
  var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var _ref = arguments.length > 3 ? arguments[3] : undefined,
      _ref$create = _ref.create,
      create = _ref$create === void 0 ? setInterval : _ref$create,
      _ref$destroy = _ref.destroy,
      destroy = _ref$destroy === void 0 ? clearInterval : _ref$destroy;

  var t = _objectSpread({
    timeout: timeout,
    fn: fn,
    running: true,
    id: create(function () {
      return fn.call(t, t);
    }, timeout, fn, t),
    started: Date.now(),
    stop: function stop() {
      if (this.id !== null) {
        destroy(this.id);
        this.id = null;
        this.running = false;
      }
    }
  }, props);

  if (this instanceof Timer) Object.assign(this, t);else return t;
}

Timer.interval = function (timeout, fn, props) {
  return new Timer(timeout, fn, props, {
    destroy: clearTimeout
  });
};

Timer.once = function (timeout, fn, props) {
  return new Timer(timeout, fn, props, {
    create: setTimeout,
    destroy: clearTimeout
  });
};

Timer.until = function (deadline, fn, props) {
  return Timer.once(deadline - Date.now(), fn, props);
};

Timer.std = {
  create: function create(fn, interval) {
    return setTimeout(fn, interval);
  },
  destroy: function destroy(id) {
    return clearTimeout(id);
  }
};

Timer.debug = function () {
  var impl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Timer.std;
  return {
    log: function log(msg) {
      return console.log(msg);
    },
    create: function create(fn, timeout) {
      var _this = this;

      var id, str;
      id = impl.create(function () {
        _this.log("Timer #".concat(id, " END"));

        impl.destroy(id);
        fn();
      }, timeout);
      this.log("Timer #".concat(id, " START ").concat(timeout, "ms"));
      return id;
    },
    destroy: function destroy(id) {
      impl.destroy(id);
      this.log("Timer #".concat(id, " STOP"));
    }
  };
};

Timer.promise = function (timeout) {
  var impl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Timer.std;
  return (
    /*Timer.debug(Timer.std)*/
    new Promise(function (resolve, reject) {
      return Timer(timeout, resolve, {}, {
        create: function create(fn, timeout) {
          return impl.create(fn, timeout);
        },
        destroy: function destroy(id) {
          impl.destroy(id);
          reject();
        }
      });
    })
  );
};
