"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.Instance = Instance;
exports.lazyInitializer = lazyInitializer;
exports.valueInitializer = valueInitializer;

var _trkl.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js = require("./trkl.es5.js");

function Instance(_ref) {
  var _ref$trackable = _ref.trackable,
      trackable = _ref$trackable === void 0 ? false : _ref$trackable,
      callback = _ref.callback,
      _ref$initVal = _ref.initVal,
      initVal = _ref$initVal === void 0 ? null : _ref$initVal;
  var inst = trackable && trackable.subscribe !== undefined ? trackable : (0, _trkl.trkl)(initVal);
  if (callback) inst.subscribe(function (value) {
    return callback(value, inst);
  });
  inst.subscribe(function (newVal) {
    if (newVal) console.log("new instance: ", value);
  });
  /*else*/

  /*  inst.subscribe(value => {
    if(value) inst.current = value; 
  });
  */

  _trkl.trkl.property(inst, "current", inst);

  return inst;
}

function TrackedInstance() {
  var initVal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  var callback = function callback(value) {};

  var inst = Instance({
    trackable: true,
    callback: callback,
    initVal: initVal
  });
  return inst;
}

function lazyInitializer(fn) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var instance = (0, _trkl.trkl)();

  var ret = function ret() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (value === null) {
      if (!instance()) {
        var initVal = fn(instance);
        instance(initVal); //console.log("initialized to: ", initVal);
      }

      return instance();
    }

    return instance(value);
  };

  ret.subscribe = instance.subscribe.bind(instance);
  return ret;
}

function valueInitializer(createFunction, onInit) {}
