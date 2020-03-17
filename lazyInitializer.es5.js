"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instance = Instance;
exports.lazyInitializer = lazyInitializer;
exports.valueInitializer = valueInitializer;

var _trkl = require("./trkl.es5.js");

function Instance({ trackable = false, callback, initVal = null }) {
  let inst = trackable && trackable.subscribe !== undefined ? trackable : (0, _trkl.trkl)(initVal);
  if(callback) inst.subscribe(value => callback(value, inst));
  inst.subscribe(newVal => {
    if(newVal) console.log("new instance: ", value);
  });

  _trkl.trkl.property(inst, "current", inst);

  return inst;
}

function TrackedInstance(initVal = null) {
  const callback = value => {};

  var inst = Instance({
    trackable: true,
    callback,
    initVal
  });
  return inst;
}

function lazyInitializer(fn, opts = {}) {
  var instance = (0, _trkl.trkl)();

  var ret = (value = null) => {
    if(value === null) {
      if(!instance()) {
        const initVal = fn(instance);
        instance(initVal);
      }

      return instance();
    }

    return instance(value);
  };

  ret.subscribe = instance.subscribe.bind(instance);
  return ret;
}

function valueInitializer(createFunction, onInit) {}
