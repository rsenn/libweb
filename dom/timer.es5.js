"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.Timer = Timer;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

var _now = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/date/now"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

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
    started: (0, _now["default"])(),
    stop: function stop() {
      if (this.id !== null) {
        destroy(this.id);
        this.id = null;
        this.running = false;
      }
    }
  }, props);

  if (this instanceof Timer) (0, _assign["default"])(this, t);else return t;
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
  return Timer.once(deadline - (0, _now["default"])(), fn, props);
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
    new _promise["default"](function (resolve, reject) {
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
