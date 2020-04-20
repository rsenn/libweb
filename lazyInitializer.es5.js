"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instance = Instance;
exports.lazyInitializer = lazyInitializer;
exports.lazyMembers = lazyMembers;
exports.lazyMap = lazyMap;
exports.lazyArray = lazyArray;
exports.valueInitializer = valueInitializer;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

var _util = require("./util.es5.js");

var _trkl = require("./trkl.es5.js");

function Instance({
  trackable = false,
  callback,
  initVal = null
}) {
  let inst = trackable && trackable.subscribe !== undefined ? trackable : (0, _trkl.trkl)(initVal);
  if (callback) inst.subscribe(value => callback(value, inst));
  inst.subscribe(newVal => {
    if (newVal) console.log("new instance: ", value);
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
    if (value === null) {
      if (!instance()) {
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

function lazyMembers(obj, members) {
  let initializers = {};

  for (let name in members) {
    initializers[name] = lazyInitializer(members[name]);
    Object.defineProperty(obj, name, {
      get: function get() {
        return initializers[name]();
      },
      set: function set(value) {
        initializers[name](value);
        return initializers[name]();
      },
      enumerable: true
    });
  }
}

function lazyMap(arr, lookup = item => item.name, ctor = arg => arg, prototyp) {
  var proto = prototyp;
  Object.assign(arr, {
    filter() {
      let ret = Array.prototype.filter.apply(this, arguments);
      ret = proxify(ret, {});
      return ret;
    }

  });

  function proxify(arr, cache = {}) {
    return new Proxy(arr, {
      get(target, key, receiver) {
        let index = typeof key == "string" && /^[0-9]+$/.test(key) ? parseInt(key) : key;
        if (cache[key]) return cache[key];

        if (key == "length") {
          index = key;
        } else if (typeof index == "string") {
          index = _util.Util.findKey(target, (v, k) => lookup(v) === key);
          if (typeof index == "string" && /^[0-9]+$/.test(index)) index = parseInt(index);
          if (typeof index != "number" || typeof index != "string") index = key;
        }

        let ret = typeof proto[key] == "function" ? proto[key] : Reflect.get(target, index, receiver);

        if (typeof ret == "object" && typeof index == "number") {
          key = lookup(ret);
          cache[key] = ctor(ret, index);
          ret = cache[key];
        }

        return ret;
      },

      set(target, key, value, receiver) {
        console.log("setting ".concat(key, "!"));
        Reflect.set(target, key, value, receiver);
        return true;
      },

      has(target, key) {
        if (Reflect.has(target, key)) return true;
        const len = target.length;
        if (typeof key == "number") return key >= 0 && key < len;

        for (let i = 0; i < len; i++) if (lookup(target[i]) === key) return true;

        return false;
      },

      getPrototypeOf(target) {
        return proto;
      }

    });
  }

  return proxify(arr);
}

function lazyArray(elements) {
  let initializers = new Array(elements.length);
  let i = 0;
  let arr = new Array(elements.length);
  let props = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      let fn = _step.value;
      let lazy = lazyInitializer(fn);
      props[i] = {
        get: function get() {
          return lazy();
        },
        enumerable: true
      };
      i++;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  Object.defineProperties(arr, props);
  return arr;
}

function valueInitializer(createFunction, onInit) {}
