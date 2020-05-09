"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Util = Util;
exports.default = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es7.object.values");

require("core-js/modules/es6.promise");

require("core-js/modules/es7.object.entries");

require("core-js/modules/es6.map");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es7.string.trim-right");

require("core-js/modules/es6.array.sort");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

var _awaitAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/awaitAsyncGenerator"));

var _wrapAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapAsyncGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const formatAnnotatedObject = function formatAnnotatedObject(subject, o) {
  const _o$indent = o.indent,
        indent = _o$indent === void 0 ? "  " : _o$indent,
        _o$spacing = o.spacing,
        spacing = _o$spacing === void 0 ? " " : _o$spacing,
        _o$separator = o.separator,
        separator = _o$separator === void 0 ? "," : _o$separator,
        _o$newline = o.newline,
        newline = _o$newline === void 0 ? "\n" : _o$newline,
        _o$maxlen = o.maxlen,
        maxlen = _o$maxlen === void 0 ? 30 : _o$maxlen,
        _o$depth = o.depth,
        depth = _o$depth === void 0 ? 1 : _o$depth;
  const i = indent.repeat(Math.abs(1 - depth));
  let nl = newline != "" ? newline + i : spacing;
  const opts = {
    newline: depth >= 0 ? newline : "",
    depth: depth - 1
  };
  if (subject && subject.toSource !== undefined) return subject.toSource();
  if (subject instanceof Date) return "new Date('".concat(new Date().toISOString(), "')");
  if (typeof subject == "string") return "'".concat(subject, "'");

  if (subject != null && subject["y2"] !== undefined) {
    return "rect[".concat(spacing).concat(subject["x"]).concat(separator).concat(subject["y"], " | ").concat(subject["x2"]).concat(separator).concat(subject["y2"], " (").concat(subject["w"], "x").concat(subject["h"], ") ]");
  }

  if (typeof subject == "object" && "map" in subject && typeof subject.map == "function") {
    return "[".concat(nl).concat(subject.map(i => formatAnnotatedObject(i, opts)).join(separator + nl), "]");
  }

  if (typeof subject === "string" || subject instanceof String) {
    return "'".concat(subject, "'");
  }

  let longest = "";
  let r = [];

  for (let k in subject) {
    if (k.length > longest.length) longest = k;
    let s = "";

    if (typeof subject[k] === "symbol") {
      s = "Symbol";
    } else if (typeof subject[k] === "string" || subject[k] instanceof String) {
      s = "'".concat(subject[k], "'");
    } else if (typeof subject[k] === "function") {
      s = Util.fnName(s) || "function";
      s += "()";
    } else if (typeof subject[k] === "number" || typeof subject[k] === "boolean") {
      s = "".concat(subject[k]);
    } else if (subject[k] === null) {
      s = "null";
    } else if (subject[k] && subject[k].length !== undefined) {
      try {
        s = depth <= 0 ? "Array(".concat(subject[k].length, ")") : "[ ".concat(subject[k].map(item => formatAnnotatedObject(item, opts)).join(", "), " ]");
      } catch (err) {
        s = "[".concat(subject[k], "]");
      }
    } else if (subject[k] && subject[k].toSource !== undefined) {
      s = subject[k].toSource();
    } else if (opts.depth >= 0) {
      s = s.length > maxlen ? "[Object ".concat(Util.objName(subject[k]), "]") : formatAnnotatedObject(subject[k], opts);
    }

    r.push([k, s]);
  }

  let padding = x => opts.newline != "" ? Util.pad(x, longest.length, spacing) : spacing;

  let j = separator + spacing;

  if (r.length > 6) {
    nl = opts.newline + i;
    j = separator + (opts.newline || spacing) + i;
  }

  let ret = "{" + opts.newline + r.map(arr => padding(arr[0]) + arr[0] + ":" + spacing + arr[1]).join(j) + opts.newline;
  return ret;
};

function Util(g) {
  if (g) Util.globalObject = g;
}

Util.curry = function curry(fn, arity) {
  return function curried() {
    if (arity == null) arity = fn.length;
    var args = [...arguments];

    if (args.length >= arity) {
      return fn.apply(this, args);
    } else {
      return function () {
        return curried.apply(this, args.concat([...arguments]));
      };
    }
  };
};

Util.getGlobalObject = function () {
  let ret = this.globalObject;

  try {
    if (!ret) ret = global;
    if (!ret) ret = globalThis;
  } catch (err) {}

  return ret;
};

Util.isDebug = function () {
  if (process !== undefined && process.env.NODE_ENV === "production") return false;
  return true;
};

Util.log = Util.curry(function (n, base) {
  return Math.log(n) / (base ? Math.log(base) : 1);
});

Util.logBase = function (n, base) {
  return Math.log(n) / Math.log(base);
};

Util.generalLog = function (n, x) {
  return Math.log(x) / Math.log(n);
};

Util.toSource = function (arg, opts = {}) {
  const _opts$color = opts.color,
        color = _opts$color === void 0 ? true : _opts$color;
  const c = Util.color(color);
  if (typeof arg == "string") return c.text("'".concat(arg, "'"), 1, 36);
  if (arg && arg.x !== undefined && arg.y !== undefined) return "[".concat(c.text(arg.x, 1, 32), ",").concat(c.text(arg.y, 1, 32), "]");
  if (arg && arg.toSource) return arg.toSource();
  let cls = arg && arg.constructor && Util.fnName(arg.constructor);
  return String(arg);
};

Util.debug = function (message) {
  const args = [...arguments];
  let cache = [];

  const removeCircular = function removeCircular(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) return;
      cache.push(value);
    }

    return value;
  };

  const str = args.map(arg => typeof arg === "object" ? JSON.stringify(arg, removeCircular) : arg).join(" ").replace(/\n/g, "");
};

Util.type = function ({
  type
}) {
  return type && String(type).split(/[ ()]/)[1] || "";
};

Util.functionName = function (fn) {
  const matches = /function\s*([^(]*)\(.*/g.exec(String(fn));
  if (matches && matches[1]) return matches[1];
  return null;
};

Util.className = function (obj) {
  let proto;

  try {
    proto = Object.getPrototypeOf(obj);
  } catch (err) {
    try {
      proto = obj.prototype;
    } catch (err) {}
  }

  if (Util.isObject(proto) && "constructor" in proto) return Util.fnName(proto.constructor);
};

Util.unwrapComponent = function (c) {
  for (;;) {
    if (c.wrappedComponent) c = c.wrappedComponent;else if (c.WrappedComponent) c = c.WrappedComponent;else break;
  }

  return c;
};

Util.componentName = function (c) {
  for (;;) {
    if (c.displayName || c.name) {
      return (c.displayName || c.name).replace(/.*\(([A-Za-z0-9_]+).*/, "$1");
    } else if (c.wrappedComponent) c = c.wrappedComponent;else if (c.WrappedComponent) c = c.WrappedComponent;else break;
  }

  return Util.fnName(c);
};

Util.count = function (s, ch) {
  return (String(s).match(new RegExp(ch, "g")) || Util.array()).length;
};

Util.parseNum = function (str) {
  let num = parseFloat(str);
  if (isNaN(num)) num = 0;
  return num;
};

Util.minmax = function (num, min, max) {
  return Math.min(Math.max(num, min), max);
};

Util.getExponential = function (num) {
  let str = typeof num == "string" ? num : num.toExponential();
  const matches = /e\+?(.*)$/.exec(str);
  return parseInt(matches[1]);
};

Util.getNumberParts = function (num) {
  let str = typeof num == "string" ? num : num.toExponential();
  const matches = /^(-?)(.*)e\+?(.*)$/.exec(str);
  const negative = matches[1] == "-";
  return {
    negative,
    mantissa: parseFloat(matches[2]),
    exponent: parseInt(matches[3])
  };
};

Util.pow2 = function (n) {
  return Math.pow(2, n);
};

Util.pow10 = function (n) {
  return n >= 0 ? Math.pow(10, n) : 1 / Math.pow(10, -n);
};

Util.bitValue = function (n) {
  return Util.pow2(n - 1);
};

Util.toBinary = function (num) {
  return parseInt(num).toString(2);
};

Util.toBits = function (num) {
  let a = Util.toBinary(num).split("").reverse();
  return Array.from(Object.assign({}, a, {
    length: 50
  }), bit => bit ? 1 : 0);
};

Util.getBit = function (v, n) {
  let s = v.toString(2);
  return n < s.length ? parseInt(s[s.length - n - 1]) : 0;
};

Util.isSet = function (v, n) {
  return Util.getBit(v, n) == 1;
};

Util.bitCount = function (n) {
  return Util.count(Util.toBinary(n), "1");
};

Util.toggleBit = function (num, bit) {
  const n = Number(num);
  return Util.isSet(n, bit) ? n - Util.pow2(bit) : n + Util.pow2(bit);
};

Util.setBit = function (num, bit) {
  const n = Number(num);
  return Util.isSet(n, bit) ? n : n + Util.pow2(bit);
};

Util.clearBit = function (num, bit) {
  const n = Number(num);
  return Util.isSet(n, bit) ? n - Util.pow2(bit) : n;
};

Util.range = function (start, end) {
  if (start > end) {
    let ret = [];

    while (start >= end) ret.push(start--);

    return ret;
  }

  const r = Array.from({
    length: end - start + 1
  }, (v, k) => k + start);
  return r;
};

Util.inspect = function (obj, opts = {
  indent: "  ",
  newline: "\n",
  depth: 2,
  spacing: " "
}) {
  return formatAnnotatedObject(obj, opts);
};

Util.bitArrayToNumbers = function (arr) {
  let numbers = Util.array();

  for (let i = 0; i < arr.length; i++) {
    const number = i + 1;
    if (arr[i]) numbers.push(number);
  }

  return numbers;
};

Util.bitsToNumbers = function (bits) {
  let a = Util.toBinary(bits).split("");
  let r = Util.array();
  a.forEach((val, key, arr) => val == "1" && r.unshift(a.length - key));
  return r;
};

Util.shuffle = function (arr, rnd = Util.rng) {
  arr.sort((a, b) => 0.5 - rnd());
  return arr;
};

Util.sortNum = function (arr) {
  arr.sort((a, b) => a - b);
  return arr;
};

Util.draw = function (arr, n, rnd = Util.rng) {
  const r = Util.shuffle(arr, rnd).splice(0, n);
  return r;
};

Util.is = {
  on: val => val == "on" || val === "true" || val === true,
  off: val => val == "off" || val === "false" || val === false,
  true: val => val === "true" || val === true,
  false: val => val === "false" || val === false
};

Util.onoff = function (val) {
  if (Util.is.on(val)) return true;
  if (Util.is.off(val)) return false;
  return undefined;
};

Util.numbersToBits = function (arr) {
  return arr.reduce((bits, num) => bits + Util.bitValue(num), 0);
};

Util.randomNumbers = function ([start, end], draws) {
  const r = Util.draw(Util.range(start, end), draws);
  return r;
};

Util.randomBits = function (r = [1, 50], n = 5) {
  return Util.numbersToBits(Util.randomNumbers(r, n));
};

Util.padFn = function (len, char = " ", fn = (str, pad) => pad) {
  return (s, n = len) => {
    let m = Util.stripAnsi(s).length;
    s = s ? s.toString() : "" + s;
    return fn(s, m < n ? char.repeat(n - m) : "");
  };
};

Util.pad = function (s, n, char = " ") {
  return Util.padFn(n, char)(s);
};

Util.abbreviate = function (str, max, suffix = "...") {
  if (str.length > max) {
    return str.substring(0, max - suffix.length) + suffix;
  }

  return str;
};

Util.trim = function (str, charset) {
  const r1 = RegExp("^[".concat(charset, "]*"));
  const r2 = RegExp("[".concat(charset, "]*$"));
  return str.replace(r1, "").replace(r2, "");
};

Util.trimRight = function (str, charset) {
  const r2 = RegExp("[".concat(charset, "]*$"));
  return str.replace(r2, "");
};

Util.define = (obj, key, value, enumerable = false) => {
  if (typeof key == "object") {
    for (let prop in key) Util.define(obj, prop, key[prop], Util.isBool(value) ? value : false);

    return obj;
  }

  Object.defineProperty(obj, key, {
    enumerable,
    configurable: false,
    writable: false,
    value
  });
  return obj;
};

Util.copyEntries = (obj, entries) => {
  var _iterator2 = _createForOfIteratorHelper(entries),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      let _step2$value = (0, _slicedToArray2.default)(_step2.value, 2),
          k = _step2$value[0],
          v = _step2$value[1];

      obj[k] = v;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return obj;
};

Util.extend = (obj, ...args) => {
  for (var _i = 0, _args = args; _i < _args.length; _i++) {
    let other = _args[_i];

    var _iterator3 = _createForOfIteratorHelper(Util.iterateMethods(other, 0, (key, value) => obj[key] === undefined && [key, value])),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        let _step3$value = (0, _slicedToArray2.default)(_step3.value, 2),
            name = _step3$value[0],
            fn = _step3$value[1];

        try {
          Object.defineProperty(obj, name, {
            value: fn,
            enumerable: false,
            configurable: false,
            writable: false
          });
        } catch (err) {
          console.log("extend:", err);
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }

  return obj;
};

Util.static = (obj, functions, thisObj, pred = (k, v, f) => true) => {
  var _iterator4 = _createForOfIteratorHelper(Util.iterateMethods(functions, 0, (key, value) => obj[key] === undefined && pred(key, value, functions) && [key, value])),
      _step4;

  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      let _step4$value = (0, _slicedToArray2.default)(_step4.value, 2),
          name = _step4$value[0],
          fn = _step4$value[1];

      const value = function value(...args) {
        return fn.call(thisObj || obj, this, ...args);
      };

      try {
        obj[name] = value;
      } catch (err) {
        console.log("static:", err);
      }
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }

  return obj;
};

Util.defineGetter = (obj, key, get, enumerable = false) => obj[key] === undefined && Object.defineProperty(obj, key, {
  enumerable,
  configurable: false,
  get
});

Util.defineGetterSetter = (obj, key, get, set, enumerable = false) => obj[key] === undefined && Object.defineProperty(obj, key, {
  get,
  set,
  enumerable
});

Util.extendArray = function (arr = Array.prototype) {
  Util.define(arr, "match", function (pred) {
    return Util.match(this, pred);
  });
  Util.define(arr, "clear", function () {
    this.splice(0, this, length);
    return this;
  });
  Util.define(arr, "unique", function () {
    return this.filter((item, i, a) => a.indexOf(item) == i);
  });
  Util.defineGetterSetter(arr, "tail", function () {
    return Util.tail(this);
  }, function (value) {
    if (this.length == 0) this.push(value);else this[this.length - 1] = value;
  });
};

Util.adapter = function (obj, getLength = obj => obj.length, getKey = (obj, index) => obj.key(index), getItem = (obj, key) => obj[key], setItem = (obj, index, value) => obj[index] = value) {
  const adapter = {
    get length() {
      return getLength(obj);
    },

    get instance() {
      return obj;
    },

    key(i) {
      return getKey(obj, i);
    },

    get(key) {
      return getItem(obj, key);
    },

    set(key, value) {
      return setItem(obj, key, value);
    },

    keys() {
      return _regenerator.default.mark(function _callee() {
        var length, i;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              length = getLength(obj);
              i = 0;

            case 2:
              if (!(i < length)) {
                _context.next = 8;
                break;
              }

              _context.next = 5;
              return getKey(obj, i);

            case 5:
              i++;
              _context.next = 2;
              break;

            case 8:
            case "end":
              return _context.stop();
          }
        }, _callee);
      })();
    },

    entries() {
      var _this = this;

      return _regenerator.default.mark(function _callee2() {
        var _iterator5, _step5, key;

        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _iterator5 = _createForOfIteratorHelper(_this.keys());
              _context2.prev = 1;

              _iterator5.s();

            case 3:
              if ((_step5 = _iterator5.n()).done) {
                _context2.next = 9;
                break;
              }

              key = _step5.value;
              _context2.next = 7;
              return [key, getItem(obj, key)];

            case 7:
              _context2.next = 3;
              break;

            case 9:
              _context2.next = 14;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2["catch"](1);

              _iterator5.e(_context2.t0);

            case 14:
              _context2.prev = 14;

              _iterator5.f();

              return _context2.finish(14);

            case 17:
            case "end":
              return _context2.stop();
          }
        }, _callee2, null, [[1, 11, 14, 17]]);
      })();
    },

    [Symbol.iterator]() {
      return this.entries();
    },

    toObject() {
      return Object.fromEntries(this.entries());
    },

    toMap() {
      return new Map(this.entries());
    }

  };
  return adapter;
};

Util.adapter.localStorage = function (s) {
  if (!s && global.window) s = window.localStorage;
  return Util.adapter(s, l => l.length, (l, i) => l.key(i), (l, key) => JSON.parse(l.getItem(key)), (l, key, v) => l.setItem(key, JSON.stringify(v)));
};

var doExtendArray = Util.extendArray;

Util.array = function (a) {
  if (!(a instanceof Array)) {
    if (Util.isObject(a) && "length" in a) a = Array.from(a);
  }

  if (doExtendArray) try {
    if (a.match === undefined) {
      doExtendArray(Array.prototype);
      if (a.match) doExtendArray = null;
    }

    if (a.match === undefined) doExtendArray(a);
  } catch (err) {}
  return a;
};

Util.arrayFromEntries = entries => Array.from(entries.map(([k, v]) => k), key => entries.find(([k, v]) => k === key)[1]);

Util.toMap = function (hash = {}, fn) {
  let m, gen;
  if (hash instanceof Array && typeof fn == "function") hash = hash.map(fn);
  if (hash[Symbol.iterator] !== undefined) gen = hash[Symbol.iterator]();else if (Util.isGenerator(hash)) gen = hash;else gen = Object.entries(hash);
  m = new Map(gen);

  try {
    if (Map.prototype.toObject === undefined) Util.extendMap(Map.prototype);
  } catch (err) {}

  return m;
};

Util.extendMap = function (map) {
  if (map.entries === undefined) {
    map.entries = _regenerator.default.mark(function iterator() {
      var _iterator6, _step6, entry;

      return _regenerator.default.wrap(function iterator$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _iterator6 = _createForOfIteratorHelper(map);
            _context3.prev = 1;

            _iterator6.s();

          case 3:
            if ((_step6 = _iterator6.n()).done) {
              _context3.next = 19;
              break;
            }

            entry = _step6.value;

            if (!(entry.name !== undefined && entry.value !== undefined)) {
              _context3.next = 10;
              break;
            }

            _context3.next = 8;
            return [entry.name, entry.value];

          case 8:
            _context3.next = 17;
            break;

          case 10:
            if (!(entry[0] !== undefined && entry[1] !== undefined)) {
              _context3.next = 15;
              break;
            }

            _context3.next = 13;
            return entry;

          case 13:
            _context3.next = 17;
            break;

          case 15:
            _context3.next = 17;
            return [entry, map[entry]];

          case 17:
            _context3.next = 3;
            break;

          case 19:
            _context3.next = 24;
            break;

          case 21:
            _context3.prev = 21;
            _context3.t0 = _context3["catch"](1);

            _iterator6.e(_context3.t0);

          case 24:
            _context3.prev = 24;

            _iterator6.f();

            return _context3.finish(24);

          case 27:
          case "end":
            return _context3.stop();
        }
      }, iterator, null, [[1, 21, 24, 27]]);
    });
  }

  map.toObject = function () {
    return Object.fromEntries(this.entries());
  };

  map.match = function (...args) {
    return Util.match.apply(this, args);
  };
};

Util.fromEntries = Object.fromEntries ? Object.fromEntries : entries => {
  let ret = {};

  var _iterator7 = _createForOfIteratorHelper(entries),
      _step7;

  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      let _step7$value = (0, _slicedToArray2.default)(_step7.value, 2),
          k = _step7$value[0],
          v = _step7$value[1];

      ret[k] = v;
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }

  return ret;
};

Util.objectFrom = function (any) {
  if ("toJS" in any) any = any.toJS();else if (Util.isArray(any)) return Util.fromEntries(any);else if ("entries" in any) return Util.fromEntries(any.entries());
  return Object.assign({}, any);
};

Util.tail = function (arr) {
  return arr && arr.length > 0 ? arr[arr.legth - 1] : null;
};

Util.splice = function (str, index, delcount, insert) {
  const chars = str.split("");
  Array.prototype.splice.apply(chars, arguments);
  return chars.join("");
};

Util.keyOf = function (obj, prop) {
  const keys = Object.keys(obj);

  for (let k in keys) {
    if (obj[k] === prop) return k;
  }

  return undefined;
};

Util.rotateRight = function (arr, n) {
  arr.unshift(...arr.splice(n, arr.length));
  return arr;
};

Util.repeater = function (n, what) {
  if (typeof what == "function") return _regenerator.default.mark(function _callee3() {
    var i;
    return _regenerator.default.wrap(function _callee3$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          i = 0;

        case 1:
          if (!(i < n)) {
            _context4.next = 7;
            break;
          }

          _context4.next = 4;
          return what();

        case 4:
          i++;
          _context4.next = 1;
          break;

        case 7:
        case "end":
          return _context4.stop();
      }
    }, _callee3);
  })();
  return _regenerator.default.mark(function _callee4() {
    var i;
    return _regenerator.default.wrap(function _callee4$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          i = 0;

        case 1:
          if (!(i < n)) {
            _context5.next = 7;
            break;
          }

          _context5.next = 4;
          return what;

        case 4:
          i++;
          _context5.next = 1;
          break;

        case 7:
        case "end":
          return _context5.stop();
      }
    }, _callee4);
  })();
};

Util.repeat = function (n, what) {
  return [...Util.repeater(n, what)];
};

Util.arrayDim = function (dimensions, init) {
  let args = [...dimensions];
  args.reverse();
  let ret = init;

  while (args.length > 0) {
    const n = args.shift();
    ret = Util.repeat(n, ret);
  }

  return ret;
};

Util.flatten = function (arr) {
  let ret = [];

  for (let i = 0; i < arr.length; i++) {
    ret = [...ret, ...arr[i]];
  }

  return ret;
};

Util.chunkArray = function (myArray, chunk_size) {
  let index = 0;
  const arrayLength = myArray.length;
  const tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    myChunk = myArray.slice(index, index + chunk_size);
    tempArray.push(myChunk);
  }

  return tempArray;
};

Util.chances = function (numbers, matches) {
  const f = Util.factorial;
  return f(numbers) / (f(matches) * f(numbers - matches));
};

Util.sum = function (arr) {
  return arr.reduce((acc, n) => acc + n, 0);
};

Util.fnName = function (f, parent) {
  if (f !== undefined && f.name !== undefined) return f.name;
  const s = f.toSource ? f.toSource() : "".concat(f);
  const matches = /([A-Za-z_][0-9A-Za-z_]*)\w*[(\]]/.exec(s);
  if (matches) return matches[1];

  if (parent !== undefined) {
    for (let key in parent) {
      if (parent[key] === f) return key;
    }
  }

  return undefined;
};

Util.keys = function (obj) {
  let r = Util.array();

  for (let i in obj) r.push(i);

  return r;
};

Util.objName = function (o) {
  if (o === undefined || o == null) return "".concat(o);
  if (typeof o === "function" || o instanceof Function) return Util.fnName(o);
  if (o.constructor) return Util.fnName(o.constructor);
  const s = "".concat(o.type);
  return s;
};

Util.findKey = function (obj, value) {
  let pred = typeof value == "function" ? value : v => v === value;

  for (let k in obj) if (pred(obj[k], k)) return k;
};

Util.find = function (arr, value, prop = "id", acc = Util.array()) {
  let pred;
  if (typeof value == "function") pred = value;else if (prop && prop.length !== undefined) {
    pred = function pred(obj) {
      if (obj[prop] == value) return true;
      return false;
    };
  } else pred = obj => obj[prop] == value;

  var _iterator8 = _createForOfIteratorHelper(arr),
      _step8;

  try {
    for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
      let v = _step8.value;
      {
        if (pred(v)) return v;
      }
    }
  } catch (err) {
    _iterator8.e(err);
  } finally {
    _iterator8.f();
  }

  return null;
};

Util.match = function (arg, pred) {
  let match = pred;

  if (pred instanceof RegExp) {
    const re = pred;

    match = (val, key) => val && val.tagName !== undefined && re.test(val.tagName) || typeof key === "string" && re.test(key) || typeof val === "string" && re.test(val);
  }

  if (Util.isArray(arg)) {
    if (!(arg instanceof Array)) arg = [...arg];
    return arg.reduce((acc, val, key) => {
      if (match(val, key, arg)) acc.push(val);
      return acc;
    }, Util.array());
  } else if (Util.isMap(arg)) {
    return [...arg.keys()].reduce((acc, key) => match(arg.get(key), key, arg) ? acc.set(key, arg.get(key)) : acc, new Map());
  }

  return Util.filter(arg, match);
};

Util.toHash = function (map, keyTransform = k => Util.camelize("" + k)) {
  let ret = {};
  Util.foreach(map, (v, k) => ret[keyTransform(k)] = v);
  return ret;
};

Util.indexOf = function (obj, prop) {
  for (let key in obj) {
    if (obj[key] === prop) return key;
  }

  return undefined;
};

Util.toString = (obj, opts = {}, indent = "") => {
  const _opts$quote = opts.quote,
        quote = _opts$quote === void 0 ? '"' : _opts$quote,
        _opts$multiline = opts.multiline,
        multiline = _opts$multiline === void 0 ? true : _opts$multiline,
        _opts$color2 = opts.color,
        color = _opts$color2 === void 0 ? true : _opts$color2,
        _opts$spacing = opts.spacing,
        spacing = _opts$spacing === void 0 ? " " : _opts$spacing,
        _opts$padding = opts.padding,
        padding = _opts$padding === void 0 ? " " : _opts$padding,
        _opts$separator = opts.separator,
        separator = _opts$separator === void 0 ? "," : _opts$separator,
        _opts$colon = opts.colon,
        colon = _opts$colon === void 0 ? ":" : _opts$colon;
  const c = Util.color(color);
  const sep = multiline ? (space = false) => "\n" + indent + (space ? "  " : "") : (space = false) => space ? spacing : "";

  if (Util.isArray(obj)) {
    let s = c.text("[".concat(padding), 1, 36);

    for (let i = 0; i < obj.length; i++) {
      s += i > 0 ? c.text(separator, 1, 36) : "";
      s += sep(true);
      s += Util.toString(obj[i], opts, indent + "  ");
    }

    return s + sep() + "".concat(padding, "]");
  }

  if (typeof obj == "function" || obj instanceof Function || Util.className(obj) == "Function") {
    obj = "" + obj;
    if (!multiline) obj = obj.replace(/(\n| anonymous)/g, "");
    return obj;
  }

  let s = c.text("{".concat(padding), 1, 36);
  let i = 0;

  for (let key in obj) {
    const value = obj[key];
    s += i > 0 ? c.text(separator, 36) : "";
    if (i > 0) s += sep(true);
    s += "".concat(c.text(key, 1, 33)).concat(c.text(colon, 1, 36)) + spacing;
    if (Util.isObject(value)) s += Util.toString(value, opts, indent + "  ");else if (typeof value == "string") s += c.text("".concat(quote).concat(value).concat(quote), 1, 36);else if (typeof value == "number") s += c.text(value, 1, 32);else s += value;
    i++;
  }

  return s + sep(false) + c.text("".concat(padding, "}"), 1, 36);
};

Util.dump = function (name, props) {
  const args = [name];

  for (let key in props) {
    args.push("\n\t".concat(key, ": "));
    args.push(props[key]);
  }

  if ("window" in global !== false) {
    if (window.console !== undefined) console.log(...args);
  }
};

Util.ucfirst = function (str) {
  if (typeof str != "string") str = String(str);
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

Util.lcfirst = function (str) {
  return str.substring(0, 1).toLowerCase() + str.substring(1);
};

Util.camelize = (text, sep = "") => text.replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2, offset) {
  if (p2) return sep + p2.toUpperCase();
  return p1.toLowerCase();
});

Util.decamelize = function (str, separator = "-") {
  return /[A-Z]/.test(str) ? str.replace(/([a-z\d])([A-Z])/g, "$1".concat(separator, "$2")).replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1".concat(separator, "$2")).toLowerCase() : str;
};

Util.ifThenElse = function (pred = value => !!value, _then = () => {}, _else = () => {}) {
  return function (value) {
    var result = pred(value);
    var ret = !!result ? _then(value) : _else(value);
    return ret;
  };
};

Util.transform = Util.curry(_regenerator.default.mark(function _callee5(fn, arr) {
  var _iterator9, _step9, item;

  return _regenerator.default.wrap(function _callee5$(_context6) {
    while (1) switch (_context6.prev = _context6.next) {
      case 0:
        _iterator9 = _createForOfIteratorHelper(arr);
        _context6.prev = 1;

        _iterator9.s();

      case 3:
        if ((_step9 = _iterator9.n()).done) {
          _context6.next = 9;
          break;
        }

        item = _step9.value;
        _context6.next = 7;
        return fn(item);

      case 7:
        _context6.next = 3;
        break;

      case 9:
        _context6.next = 14;
        break;

      case 11:
        _context6.prev = 11;
        _context6.t0 = _context6["catch"](1);

        _iterator9.e(_context6.t0);

      case 14:
        _context6.prev = 14;

        _iterator9.f();

        return _context6.finish(14);

      case 17:
      case "end":
        return _context6.stop();
    }
  }, _callee5, null, [[1, 11, 14, 17]]);
}));

Util.colorDump = (iterable, textFn = (color, n) => ("   " + (n + 1)).slice(-3) + " ".concat(color)) => {
  let j = 0;
  const filters = "font-weight: bold; text-shadow: 0px 0px 1px rgba(0,0,0,0.8); filter: drop-shadow(30px 10px 4px #4444dd)";

  for (let j = 0; j < iterable.length; j++) {
    const _ref = iterable[j].length == 2 ? iterable[j] : [j, iterable[j]],
          _ref2 = (0, _slicedToArray2.default)(_ref, 2),
          i = _ref2[0],
          color = _ref2[1];

    console.log("  %c    %c ".concat(color, " %c ").concat(textFn(color, i)), "background: ".concat(color, "; font-size: 18px; ").concat(filters, ";"), "background: none; color: ".concat(color, "; min-width: 120px; ").concat(filters, "; "), "color: black; font-size: 12px;");
  }
};

Util.bucketInserter = (map, ...extraArgs) => {
  var inserter;
  inserter = typeof map.has == "function" ? function (...args) {
    for (var _i2 = 0, _args8 = args; _i2 < _args8.length; _i2++) {
      let _args8$_i = (0, _slicedToArray2.default)(_args8[_i2], 2),
          k = _args8$_i[0],
          v = _args8$_i[1];

      let a;
      map.has(k) ? a = map.get(k) : map.set(k, a = []);
      a.push(v);
    }

    return inserter;
  } : function (...args) {
    for (var _i3 = 0, _args9 = args; _i3 < _args9.length; _i3++) {
      let arg = _args9[_i3];

      for (let k in arg) {
        const v = arg[k];
        let a = map[k] || [];
        if (typeof a.push == "function") a.push(v);
        map[k] = a;
      }
    }
  };
  inserter(...extraArgs);
  inserter.map = map;
  return inserter;
};

Util.fifo = function fifo() {
  let resolve = () => {};

  const queue = [];

  function generator() {
    return _generator.apply(this, arguments);
  }

  function _generator() {
    _generator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee6() {
      return _regenerator.default.wrap(function _callee6$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            if (queue.length) {
              _context7.next = 3;
              break;
            }

            _context7.next = 3;
            return (0, _awaitAsyncGenerator2.default)(new Promise(r => resolve = r));

          case 3:
            _context7.next = 5;
            return queue.shift();

          case 5:
            _context7.next = 0;
            break;

          case 7:
          case "end":
            return _context7.stop();
        }
      }, _callee6);
    }));
    return _generator.apply(this, arguments);
  }

  return {
    push: function push(...args) {
      for (var _i4 = 0, _args11 = args; _i4 < _args11.length; _i4++) {
        let event = _args11[_i4];
        queue.push(event);
        if (queue.length === 1) resolve();
      }

      return this;
    },
    loop: generator(),
    process: function run() {
      var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, event;

      return _regenerator.default.async(function run$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context8.prev = 2;
            _iterator = (0, _asyncIterator2.default)(this.loop);

          case 4:
            _context8.next = 6;
            return _regenerator.default.awrap(_iterator.next());

          case 6:
            _step = _context8.sent;
            _iteratorNormalCompletion = _step.done;
            _context8.next = 10;
            return _regenerator.default.awrap(_step.value);

          case 10:
            _value = _context8.sent;

            if (_iteratorNormalCompletion) {
              _context8.next = 17;
              break;
            }

            event = _value;
            console.info("event:", event);

          case 14:
            _iteratorNormalCompletion = true;
            _context8.next = 4;
            break;

          case 17:
            _context8.next = 23;
            break;

          case 19:
            _context8.prev = 19;
            _context8.t0 = _context8["catch"](2);
            _didIteratorError = true;
            _iteratorError = _context8.t0;

          case 23:
            _context8.prev = 23;
            _context8.prev = 24;

            if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
              _context8.next = 28;
              break;
            }

            _context8.next = 28;
            return _regenerator.default.awrap(_iterator.return());

          case 28:
            _context8.prev = 28;

            if (!_didIteratorError) {
              _context8.next = 31;
              break;
            }

            throw _iteratorError;

          case 31:
            return _context8.finish(28);

          case 32:
            return _context8.finish(23);

          case 33:
          case "end":
            return _context8.stop();
        }
      }, null, this, [[2, 19, 23, 33], [24,, 28, 32]], Promise);
    }
  };
};

Util.isEmail = function (v) {
  return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(v);
};

Util.isString = function (v) {
  return Object.prototype.toString.call(v) == "[object String]";
};

Util.isObject = obj => typeof obj === "object" && obj !== null;

Util.isEmptyString = function (v) {
  if (this.isString(v) && !v) {
    return true;
  }

  if (this.isString(v) && !v.length) {
    return true;
  }

  return false;
};

Util.isEmpty = function (v) {
  if (typeof v == "object" && !!v && v.constructor == Object && Object.keys(v).length == 0) return true;
  if (!v || v === null) return true;
  if (typeof v == "object" && v.length !== undefined && v.length === 0) return true;
  return false;
};

Util.notEmpty = function (v) {
  return !Util.isEmpty(v);
};

Util.hasProps = function (obj) {
  const keys = Object.keys(obj);
  return keys.length > 0;
};

Util.validatePassword = function (value) {
  return value.length > 7 && /^(?![\d]+$)(?![a-zA-Z]+$)(?![!#$%^&*]+$)[\da-zA-Z!#$ %^&*]/.test(value) && !/\s/.test(value);
};

Util.clone = function (obj) {
  if (typeof obj != "object") return obj;
  return Util.isArray(obj) ? obj.slice() : Object.assign({}, obj);
};

Util.deepClone = function (data) {
  return JSON.parse(JSON.stringify(data));
};

Util.findVal = function (object, propName, maxDepth = 10) {
  if (maxDepth <= 0) return null;

  for (let key in object) {
    if (key === propName) {
      return object[key];
    } else {
      let value = Util.findVal(object[key], propName, maxDepth - 1);
      if (value !== undefined) return value;
    }
  }
};

Util.deepCloneObservable = function (data) {
  let o;
  const t = typeof data;
  if (t === "object") return data;

  if (t === "object") {
    if (data.length) {
      var _iterator10 = _createForOfIteratorHelper(data),
          _step10;

      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          const value = _step10.value;
          o.push(this.deepCloneObservable(value));
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }

      return o;
    } else {
      for (const i in data) {
        o[i] = this.deepCloneObservable(data[i]);
      }

      return o;
    }
  }
};

Util.toArray = function (observableArray) {
  return observableArray.slice();
};

Util.arryToTree = function (data, id, pId, appId) {
  const arr = Util.array();
  data.map((e, i) => {
    e[pId] === appId && arr.push(e);
  });
  const res = this.to3wei(arr, data, id, pId);
  return res;
};

Util.to3wei = function (a, old, id, pId) {
  a.map((e, i) => {
    a[i].children = Util.array();
    old.map((se, si) => {
      if (se[pId] === a[i][id]) {
        a[i].children = [...a[i].children, se];
        this.to3wei(a[i].children, old, id, pId);
      }
    });

    if (!a[i].children.length) {
      delete a[i].children;
    }
  });
  return a;
};

Util.arrExchangePos = function (arr, i, j) {
  arr[i] = arr.splice(j, 1, arr[i])[0];
};

Util.arrRemove = function (arr, i) {
  const index = arr.indexOf(i);
  if (index > -1) arr.splice(index, 1);
};

Util.move = function (src, dst = []) {
  let items = src.splice(0, src.length);
  dst.splice(dst.length, 0, ...items);
  return dst;
};

Util.moveIf = function (src, pred, dst = []) {
  let items = src.splice(0, src.length);
  let i = 0;

  var _iterator11 = _createForOfIteratorHelper(items),
      _step11;

  try {
    for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
      let item = _step11.value;
      (pred(item, i++) ? src : dst).push(item);
    }
  } catch (err) {
    _iterator11.e(err);
  } finally {
    _iterator11.f();
  }

  return dst;
};

Util.removeEqual = function (a, b) {
  let c = {};

  for (let key in Object.assign({}, a)) {
    if (b[key] === a[key]) continue;
    c[key] = a[key];
  }

  return c;
};

Util.logOutClearStorage = function () {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userLoginPermission");
  localStorage.removeItem("ssoToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("userGroupList");
  localStorage.removeItem("gameAuthList");
};

Util.getCookie = function (cookie, name) {
  let arr = cookie.match(new RegExp("(^| )".concat(name, "=([^;]*)(;|$)")));
  if (arr != null) return unescape(arr[2]);
  return null;
};

Util.parseCookie = function (c = document.cookie) {
  if (!(typeof c == "string" && c && c.length > 0)) return {};
  let key = "";
  let value = "";
  const ws = " \r\n\t";
  let i = 0;
  let ret = {};

  const skip = (pred = char => ws.indexOf(char) != -1) => {
    let start = i;

    while (i < c.length && pred(c[i])) i++;

    let r = c.substring(start, i);
    return r;
  };

  do {
    let str = skip(char => char != "=" && char != ";");

    if (c[i] == "=" && str != "path") {
      i++;
      key = str;
      value = skip(char => char != ";");
    } else {
      i++;
      skip();
    }

    if (key != "") ret[key] = value;
    skip();
  } while (i < c.length);

  return ret;
};

Util.encodeCookie = c => Object.entries(c).map(([key, value]) => "".concat(key, "=").concat(encodeURIComponent(value))).join("; ");

Util.setCookies = c => Object.entries(c).forEach(([key, value]) => {
  document.cookie = "".concat(key, "=").concat(value);
});

Util.clearCookies = function (c) {
  return Util.setCookies(Object.keys(Util.parseCookie(c)).reduce((acc, name) => Object.assign(acc, {
    [name]: "; max-age=0; expires=".concat(new Date().toUTCString())
  }), {}));
};

Util.deleteCookie = function (name) {
  if (global.window) document.cookie = "".concat(name, "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;");
};

Util.accAdd = function (arg1, arg2) {
  let r1, r2, m;

  try {
    r1 = arg1.toString().split(".")[1].length;
  } catch (e) {
    r1 = 0;
  }

  try {
    r2 = arg2.toString().split(".")[1].length;
  } catch (e) {
    r2 = 0;
  }

  m = Math.pow(10, Math.max(r1, r2));
  return (arg1 * m + arg2 * m) / m;
};

Util.Subtr = function (arg1, arg2) {
  let r1, r2, m, n;

  try {
    r1 = arg1.toString().split(".")[1].length;
  } catch (e) {
    r1 = 0;
  }

  try {
    r2 = arg2.toString().split(".")[1].length;
  } catch (e) {
    r2 = 0;
  }

  m = Math.pow(10, Math.max(r1, r2));
  n = r1 >= r2 ? r1 : r2;
  return (arg1 * m - arg2 * m) / m;
};

Util.accDiv = function (arg1, arg2) {
  let t1 = 0;
  let t2 = 0;
  let r1;
  let r2;

  try {
    t1 = arg1.toString().split(".")[1].length;
  } catch (e) {}

  try {
    t2 = arg2.toString().split(".")[1].length;
  } catch (e) {}

  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));
  return r1 / r2 * Math.pow(10, t2 - t1);
};

Util.accMul = function (arg1, arg2) {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();

  try {
    m += s1.split(".")[1].length;
  } catch (e) {}

  try {
    m += s2.split(".")[1].length;
  } catch (e) {}

  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
};

Util.dateFormatter = function (date, formate) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = month > 9 ? month : "0".concat(month);
  let day = date.getDate();
  day = day > 9 ? day : "0".concat(day);
  let hour = date.getHours();
  hour = hour > 9 ? hour : "0".concat(hour);
  let minute = date.getMinutes();
  minute = minute > 9 ? minute : "0".concat(minute);
  let second = date.getSeconds();
  second = second > 9 ? second : "0".concat(second);
  return formate.replace(/Y+/, "".concat(year).slice(-formate.match(/Y/g).length)).replace(/M+/, month).replace(/D+/, day).replace(/h+/, hour).replace(/m+/, minute).replace(/s+/, second);
};

Util.numberFormatter = function (numStr) {
  let numSplit = numStr.split(".");
  return numSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",").concat(".".concat(numSplit[1]));
};

Util.searchObject = function (object, matchCallback, currentPath, result, searched) {
  currentPath = currentPath || "";
  result = result || Util.array();
  searched = searched || Util.array();

  if (searched.indexOf(object) !== -1 && object === Object(object)) {
    return;
  }

  searched.push(object);

  if (matchCallback(object)) {
    result.push({
      path: currentPath,
      value: object
    });
  }

  try {
    if (object === Object(object)) {
      for (const property in object) {
        const desc = Object.getOwnPropertyDescriptor(object, property);

        if (property.indexOf("$") !== 0 && typeof object[property] !== "function" && !desc.get && !desc.set) {
          if (typeof object[property] === "object") {
            try {
              JSON.stringify(object[property]);
            } catch (err) {
              continue;
            }
          }

          Util.searchObject(object[property], matchCallback, "".concat(currentPath, ".").concat(property), result, searched);
        }
      }
    }
  } catch (e) {}

  return result;
};

Util.getURL = function (req = {}) {
  let proto = process.env.NODE_ENV === "production" ? "https" : "http";
  let port = process.env.PORT ? parseInt(process.env.PORT) : process.env.NODE_ENV === "production" ? 443 : 8080;
  let host = global.ip || global.host || "localhost";

  if (req && req.headers && req.headers.host !== undefined) {
    host = req.headers.host.replace(/:.*/, "");
  } else if (process.env.HOST !== undefined) host = process.env.HOST;

  if (global.window !== undefined && window.location !== undefined) return window.location.href;
  if (req.url !== undefined) return req.url;
  if (global.process !== undefined && global.process.url !== undefined) return global.process.url;
  const url = "".concat(proto, "://").concat(host, ":").concat(port);
  return url;
};

Util.parseQuery = function (url = Util.getURL()) {
  let startIndex;
  let query = {};

  try {
    if ((startIndex = url.indexOf("?")) != -1) url = url.substring(startIndex);
    const args = [...url.matchAll(/[?&]([^=&#]+)=?([^&#]*)/g)];

    if (args) {
      for (let i = 0; i < args.length; i++) {
        const k = args[i][1];
        query[k] = decodeURIComponent(args[i][2]);
      }
    }

    return query;
  } catch (err) {
    return undefined;
  }
};

Util.encodeQuery = function (data) {
  const ret = [];

  for (let d in data) ret.push("".concat(encodeURIComponent(d), "=").concat(encodeURIComponent(data[d])));

  return ret.join("&");
};

Util.parseURL = function (href = this.getURL()) {
  const matches = /^([^:]*):\/\/([^/:]*)(:[0-9]*)?(\/?.*)/.exec(href);
  if (!matches) return null;
  const argstr = matches[4].indexOf("?") != -1 ? matches[4].replace(/^[^?]*\?/, "") : "";
  const pmatches = typeof argstr === "string" ? argstr.split(/&/g).map(part => {
    let a = part.split(/=/);
    let b = a.shift();
    return [b, a.join("=")];
  }).filter(([k, v]) => !(k.length == 0 && v.length == 0)) : Util.array();
  const params = [...pmatches].reduce((acc, m) => {
    acc[m[0]] = m[1];
    return acc;
  }, {});
  return {
    protocol: matches[1],
    host: matches[2],
    port: typeof matches[3] === "string" ? parseInt(matches[3].substring(1)) : 443,
    location: matches[4].replace(/\?.*/, ""),
    query: params,

    href(override) {
      if (typeof override === "object") Object.assign(this, override);
      const qstr = Util.encodeQuery(this.query);
      return (this.protocol ? "".concat(this.protocol, "://") : "") + (this.host ? this.host : "") + (this.port ? ":".concat(this.port) : "") + "".concat(this.location) + (qstr != "" ? "?".concat(qstr) : "");
    }

  };
};

Util.makeURL = function () {
  let args = [...arguments];
  let href = typeof args[0] == "string" ? args.shift() : Util.getURL();
  let url = Util.parseURL(href);
  let obj = typeof args[0] == "object" ? args.shift() : {};
  Object.assign(url, obj);
  return url.href();
};

Util.numberFromURL = function (url, fn) {
  const obj = typeof url === "object" ? url : this.parseURL(url);
  const nr_match = RegExp(".*[^0-9]([0-9]+)$").exec(url.location);
  const nr_arg = nr_match ? nr_match[1] : undefined;
  const nr = nr_arg && parseInt(nr_arg);
  if (!isNaN(nr) && typeof fn === "function") fn(nr);
  return nr;
};

Util.tryPromise = fn => new Promise((resolve, reject) => Util.tryCatch(fn, resolve, reject));

Util.tryCatch = (fn, resolve, reject) => {
  let ret;

  try {
    ret = fn();
  } catch (err) {
    return reject();
  }

  return resolve(ret);
};

Util.isBrowser = function () {
  let ret = false;
  Util.tryCatch(() => window, w => Util.isObject(w) ? ret = true : undefined, () => {});
  Util.tryCatch(() => document, w => Util.isObject(w) ? ret = true : undefined, () => {});
  return ret;
};

Util.isServer = function () {
  return !Util.isBrowser();
};

Util.isMobile = function () {
  return true;
};

Util.uniquePred = (el, i, arr) => arr.indexOf(el) === i;

Util.unique = arr => arr.filter(Util.uniquePred);

Util.concat = _regenerator.default.mark(function _callee7(...args) {
  var _i5, _args13, arg, _iterator12, _step12, item;

  return _regenerator.default.wrap(function _callee7$(_context9) {
    while (1) switch (_context9.prev = _context9.next) {
      case 0:
        _i5 = 0, _args13 = args;

      case 1:
        if (!(_i5 < _args13.length)) {
          _context9.next = 28;
          break;
        }

        arg = _args13[_i5];

        if (!Util.isGenerator(arg)) {
          _context9.next = 8;
          break;
        }

        console.error("isGenerator:", arg);
        return _context9.delegateYield(arg, "t0", 6);

      case 6:
        _context9.next = 25;
        break;

      case 8:
        _iterator12 = _createForOfIteratorHelper(arg);
        _context9.prev = 9;

        _iterator12.s();

      case 11:
        if ((_step12 = _iterator12.n()).done) {
          _context9.next = 17;
          break;
        }

        item = _step12.value;
        _context9.next = 15;
        return item;

      case 15:
        _context9.next = 11;
        break;

      case 17:
        _context9.next = 22;
        break;

      case 19:
        _context9.prev = 19;
        _context9.t1 = _context9["catch"](9);

        _iterator12.e(_context9.t1);

      case 22:
        _context9.prev = 22;

        _iterator12.f();

        return _context9.finish(22);

      case 25:
        _i5++;
        _context9.next = 1;
        break;

      case 28:
      case "end":
        return _context9.stop();
    }
  }, _callee7, null, [[9, 19, 22, 25]]);
});

Util.distinct = function (arr) {
  return Array.prototype.filter.call(arr, function (value, index, me) {
    return me.indexOf(value) === index;
  });
};

Util.rangeMinMax = function (arr, field) {
  const numbers = [...arr].map(obj => obj[field]);
  return [Math.min(...numbers), Math.max(...numbers)];
};

Util.mergeLists = function (arr1, arr2, key = "id") {
  let hash = {};

  var _iterator13 = _createForOfIteratorHelper(arr1),
      _step13;

  try {
    for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
      let obj = _step13.value;
      hash[obj[key]] = obj;
    }
  } catch (err) {
    _iterator13.e(err);
  } finally {
    _iterator13.f();
  }

  var _iterator14 = _createForOfIteratorHelper(arr2),
      _step14;

  try {
    for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
      let obj = _step14.value;
      hash[obj[key]] = obj;
    }
  } catch (err) {
    _iterator14.e(err);
  } finally {
    _iterator14.f();
  }

  return Object.values(hash);
};

Util.throttle = function (fn, wait) {
  let time = Date.now();
  return function () {
    if (time + wait - Date.now() < 0) {
      fn();
      time = Date.now();
    }
  };
};

Util.foreach = function (o, fn) {
  var _iterator15 = _createForOfIteratorHelper(Util.entries(o)),
      _step15;

  try {
    for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
      let _step15$value = (0, _slicedToArray2.default)(_step15.value, 2),
          k = _step15$value[0],
          v = _step15$value[1];

      fn(v, k, o);
    }
  } catch (err) {
    _iterator15.e(err);
  } finally {
    _iterator15.f();
  }
};

Util.all = function (obj, pred) {
  for (let k in obj) if (!pred(obj[k])) return false;

  return true;
};

Util.isGenerator = function (fn) {
  return typeof fn == "function" && /^[^(]*\*/.test(fn.toString()) || ["function", "object"].indexOf(typeof fn) != -1 && fn.next !== undefined;
};

Util.filter = function (a, pred) {
  if (Util.isGenerator(a)) return _regenerator.default.mark(function _callee8() {
    var _iterator16, _step16, item;

    return _regenerator.default.wrap(function _callee8$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _iterator16 = _createForOfIteratorHelper(a);
          _context10.prev = 1;

          _iterator16.s();

        case 3:
          if ((_step16 = _iterator16.n()).done) {
            _context10.next = 10;
            break;
          }

          item = _step16.value;

          if (!pred(item)) {
            _context10.next = 8;
            break;
          }

          _context10.next = 8;
          return item;

        case 8:
          _context10.next = 3;
          break;

        case 10:
          _context10.next = 15;
          break;

        case 12:
          _context10.prev = 12;
          _context10.t0 = _context10["catch"](1);

          _iterator16.e(_context10.t0);

        case 15:
          _context10.prev = 15;

          _iterator16.f();

          return _context10.finish(15);

        case 18:
        case "end":
          return _context10.stop();
      }
    }, _callee8, null, [[1, 12, 15, 18]]);
  })();
  let isa = Util.isArray(a);
  if (isa) return _regenerator.default.mark(function _callee9() {
    var _iterator17, _step17, _step17$value, k, v;

    return _regenerator.default.wrap(function _callee9$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _iterator17 = _createForOfIteratorHelper(a.entries());
          _context11.prev = 1;

          _iterator17.s();

        case 3:
          if ((_step17 = _iterator17.n()).done) {
            _context11.next = 10;
            break;
          }

          _step17$value = (0, _slicedToArray2.default)(_step17.value, 2), k = _step17$value[0], v = _step17$value[1];

          if (!pred(v, k, a)) {
            _context11.next = 8;
            break;
          }

          _context11.next = 8;
          return v;

        case 8:
          _context11.next = 3;
          break;

        case 10:
          _context11.next = 15;
          break;

        case 12:
          _context11.prev = 12;
          _context11.t0 = _context11["catch"](1);

          _iterator17.e(_context11.t0);

        case 15:
          _context11.prev = 15;

          _iterator17.f();

          return _context11.finish(15);

        case 18:
        case "end":
          return _context11.stop();
      }
    }, _callee9, null, [[1, 12, 15, 18]]);
  })();
  let ret = {};

  let fn = (k, v) => ret[k] = v;

  var _iterator18 = _createForOfIteratorHelper(Util.entries(a)),
      _step18;

  try {
    for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
      let _step18$value = (0, _slicedToArray2.default)(_step18.value, 2),
          k = _step18$value[0],
          v = _step18$value[1];

      if (pred(v, k, a)) fn(k, v);
    }
  } catch (err) {
    _iterator18.e(err);
  } finally {
    _iterator18.f();
  }

  return ret;
};

Util.reduce = function (obj, fn, accu) {
  for (let key in obj) accu = fn(accu, obj[key], key, obj);

  return accu;
};

Util.mapFunctional = fn => _regenerator.default.mark(function _callee10(arg) {
  var _iterator19, _step19, item;

  return _regenerator.default.wrap(function _callee10$(_context12) {
    while (1) switch (_context12.prev = _context12.next) {
      case 0:
        _iterator19 = _createForOfIteratorHelper(arg);
        _context12.prev = 1;

        _iterator19.s();

      case 3:
        if ((_step19 = _iterator19.n()).done) {
          _context12.next = 9;
          break;
        }

        item = _step19.value;
        _context12.next = 7;
        return fn(item);

      case 7:
        _context12.next = 3;
        break;

      case 9:
        _context12.next = 14;
        break;

      case 11:
        _context12.prev = 11;
        _context12.t0 = _context12["catch"](1);

        _iterator19.e(_context12.t0);

      case 14:
        _context12.prev = 14;

        _iterator19.f();

        return _context12.finish(14);

      case 17:
      case "end":
        return _context12.stop();
    }
  }, _callee10, null, [[1, 11, 14, 17]]);
});

Util.map = function (obj, fn) {
  if (typeof obj == "function") return Util.mapFunctional(...arguments);
  if (typeof fn != "function") return Util.toMap(...arguments);
  let ret = {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let item = fn(key, obj[key], obj);
      if (item instanceof Array && item.length == 2) ret[item[0]] = item[1];else {
        if (!(ret instanceof Array)) ret = [];
        ret.push(item);
      }
    }
  }

  return ret;
};

Util.entriesToObj = function (arr) {
  return [...arr].reduce((acc, item) => {
    const k = item[0];
    const v = item[1];
    acc[k] = v;
    return acc;
  }, {});
};

Util.isDate = function (d) {
  return d instanceof Date || typeof d == "string" && /[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/.test(d);
};

Util.parseDate = function (d) {
  if (Util.isDate(d)) {
    d = new Date(d);
  }

  return d;
};

Util.isoDate = function (date) {
  try {
    const minOffset = date.getTimezoneOffset();
    const milliseconds = date.valueOf() - minOffset * 60 * 1000;
    date = new Date(milliseconds);
    return date.toISOString().replace(/T.*/, "");
  } catch (err) {}

  return null;
};

Util.toUnixTime = function (dateObj, utc = false) {
  if (!(dateObj instanceof Date)) dateObj = new Date(dateObj);
  let epoch = Math.floor(dateObj.getTime() / 1000);
  if (utc) epoch += dateObj.getTimezoneOffset() * 60;
  return epoch;
};

Util.unixTime = function (utc = false) {
  return Util.toUnixTime(new Date(), utc);
};

Util.fromUnixTime = function (epoch, utc = false) {
  let t = parseInt(epoch);
  let d = new Date(0);
  utc ? d.setUTCSeconds(t) : d.setSeconds(t);
  return d;
};

Util.formatTime = function (date = new Date(), format = "HH:MM:SS") {
  let n;
  let out = "";

  for (let i = 0; i < format.length; i += n) {
    n = 1;

    while (format[i] == format[i + n]) n++;

    const fmt = format.substring(i, i + n);
    let num = fmt;
    if (fmt.startsWith("H")) num = "0".concat(date.getHours()).substring(0, n);else if (fmt.startsWith("M")) num = "0".concat(date.getMinutes()).substring(0, n);else if (fmt.startsWith("S")) num = "0".concat(date.getSeconds()).substring(0, n);
    out += num;
  }

  return out;
};

Util.leapYear = function (year) {
  if (year % 400 == 0) return true;
  if (year % 100 == 0) return false;
  if (year % 4 == 0) return true;
  return false;
};

Util.timeSpan = function (s) {
  const seconds = s % 60;
  s = Math.floor(s / 60);
  const minutes = s % 60;
  s = Math.floor(s / 60);
  const hours = s % 24;
  s = Math.floor(s / 24);
  const days = s % 7;
  s = Math.floor(s / 7);
  const weeks = s;
  let ret = "";
  ret = "".concat("0".concat(hours).substring(0, 2), ":").concat("0".concat(minutes).substring(0, 2), ":").concat("0".concat(seconds).substring(0, 2));
  if (days) ret = "".concat(days, " days ").concat(ret);
  if (weeks) ret = "".concat(weeks, " weeks ").concat(ret);
  return ret;
};

Util.rng = Math.random;

Util.randFloat = function (min, max, rnd = Util.rng) {
  return rnd() * (max - min) + min;
};

Util.randInt = function (min, max = 16777215, rnd = Util.rng) {
  let args = [...arguments];
  let range = args[0] instanceof Array ? args.shift() : args.splice(0, typeof args[1] == "number" ? 2 : 1);
  let prng = typeof args[0] == "function" ? args.shift() : Util.rng;
  if (range.length < 2) range.unshift(0);
  return Math.round(Util.randFloat(...range, prng));
};

Util.hex = function (num, numDigits = 0) {
  let n = typeof num == "number" ? num : parseInt(num);
  return ("0".repeat(numDigits) + n.toString(16)).slice(-numDigits);
};

Util.numberParts = (num, base) => {
  let exp = 0;
  let sgn = 0;
  if (num === 0) return {
    sign: 0,
    mantissa: 0,
    exponent: 0
  };
  if (num < 0) sgn = 1, num = -num;

  while (num > base) num /= base, exp++;

  while (num < 1) num *= base, exp--;

  return {
    sign: sgn,
    mantissa: num,
    exponent: exp
  };
};

Util.roundTo = function (value, prec, digits) {
  if (prec == 1) return Math.round(value);
  let ret = Math.round(value / prec) * prec;
  if (typeof digits == "number") ret = +ret.toFixed(digits);
  return ret;
};

Util.base64 = {
  encode: utf8 => {
    if (global.window) return window.btoa(unescape(encodeURIComponent(utf8)));
    return Buffer.from(utf8).toString("base64");
  },
  decode: base64 => decodeURIComponent(escape(window.atob(base64)))
};

Util.formatRecord = function (obj) {
  let ret = {};

  for (let key in obj) {
    let val = obj[key];
    if (val instanceof Array) val = val.map(item => Util.formatRecord(item));else if (/^-?[0-9]+$/.test(val)) val = parseInt(val);else if (/^-?[.0-9]+$/.test(val)) val = parseFloat(val);else if (val == "true" || val == "false") val = Boolean(val);
    ret[key] = val;
  }

  return ret;
};

Util.isArray = function (obj) {
  return obj && obj.length !== undefined && !(obj instanceof String) && !(obj instanceof Function) && typeof obj == "function" || obj instanceof Array;
};

Util.equals = function (a, b) {
  if (Util.isArray(a) && Util.isArray(b)) {
    return a.length == b.length && a.every((e, i) => b[i] === e);
  }
};

Util.isObject = function (obj) {
  const type = typeof obj;
  return type === "function" || type === "object" && !!obj;
};

Util.isBool = value => value === true || value === false;

Util.size = function (obj) {
  if (Util.isObject(obj)) {
    if ("length" in obj) return obj.length;
    return Object.keys(obj).length;
  }

  return undefined;
};

Util.isMap = function (obj) {
  return obj && obj.get !== undefined && obj.keys !== undefined || obj instanceof Map;
};

Util.effectiveDeviceWidth = function () {
  let deviceWidth = window.orientation == 0 ? window.screen.width : window.screen.height;

  if (navigator.userAgent.indexOf("Android") >= 0 && window.devicePixelRatio) {
    deviceWidth = deviceWidth / window.devicePixelRatio;
  }

  return deviceWidth;
};

Util.getFormFields = function (initialState) {
  return Util.mergeObjects([initialState, [...document.forms].reduce((acc, {
    elements
  }) => [...elements].reduce((acc2, {
    name,
    value
  }) => name == "" || value == undefined || value == "undefined" ? acc2 : Object.assign(acc2, {
    [name]: value
  }), acc), {})]);
};

Util.mergeObjects = function (objArr, predicate = (dst, src, key) => src[key] == "" ? undefined : src[key]) {
  let args = objArr;
  let obj = {};

  for (let i = 0; i < args.length; i++) {
    for (let key in args[i]) {
      const newVal = predicate(obj, args[i], key);
      if (newVal != undefined) obj[key] = newVal;
    }
  }

  return obj;
};

Util.getUserAgent = function (headers = req.headers) {
  const agent = useragent.parse(headers["user-agent"]);
  return agent;
};

Util.factor = function (start, end) {
  let f = 1;

  for (let i = start; i <= end; i++) {
    f = f * i;
  }

  return f;
};

Util.factorial = function (n) {
  return Util.factor(1, n);
};

Util.lottoChances = function (numbers, draws) {
  const f = Util.factorial;
  return f(numbers) / (f(numbers - draws) * f(draws));
};

Util.increment = function (obj, key) {
  if (obj[key] >= 1) obj[key] == 0;
  obj[key]++;
  return obj[key];
};

Util.counter = function () {
  this.i = 0;

  this.incr = function () {
    this.i++;
    return this.i;
  };
};

Util.filterKeys = function (obj) {
  let args = [...arguments];
  obj = args.shift();
  let ret = {};
  let pred = typeof args[0] == "function" ? args[0] : key => args.indexOf(key) != -1;

  for (let key in obj) {
    if (pred(key)) ret[key] = obj[key];
  }

  return ret;
};

Util.filterOutKeys = function (obj, arr) {
  return Util.filterKeys(obj, key => arr.indexOf(key) == -1);
};

Util.numbersConvert = function (str) {
  return str.split("").map((ch, i) => /[ :,./]/.test(ch) ? ch : String.fromCharCode((str.charCodeAt(i) & 0x0f) + 0x30)).join("");
};

Util.entries = function (arg) {
  if (typeof arg == "object" && arg !== null) {
    return typeof arg.entries !== "undefined" ? arg.entries() : Object.entries(arg);
  }

  return null;
};

Util.traverse = function (o, fn) {
  var _marked = _regenerator.default.mark(walker);

  if (typeof fn == "function") return Util.foreach(o, (v, k, a) => {
    fn(v, k, a);
    if (typeof v === "object") Util.traverse(v, fn);
  });

  function walker(o, depth = 0) {
    var _iterator20, _step20, _step20$value, k, v;

    return _regenerator.default.wrap(function walker$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _iterator20 = _createForOfIteratorHelper(Util.entries(o));
          _context13.prev = 1;

          _iterator20.s();

        case 3:
          if ((_step20 = _iterator20.n()).done) {
            _context13.next = 11;
            break;
          }

          _step20$value = (0, _slicedToArray2.default)(_step20.value, 2), k = _step20$value[0], v = _step20$value[1];
          _context13.next = 7;
          return [v, k, o, depth];

        case 7:
          if (!(typeof v == "object" && v !== null)) {
            _context13.next = 9;
            break;
          }

          return _context13.delegateYield(walker(v, depth + 1), "t0", 9);

        case 9:
          _context13.next = 3;
          break;

        case 11:
          _context13.next = 16;
          break;

        case 13:
          _context13.prev = 13;
          _context13.t1 = _context13["catch"](1);

          _iterator20.e(_context13.t1);

        case 16:
          _context13.prev = 16;

          _iterator20.f();

          return _context13.finish(16);

        case 19:
        case "end":
          return _context13.stop();
      }
    }, _marked, null, [[1, 13, 16, 19]]);
  }

  return walker(o);
};

Util.traverseWithPath = function (o, rootPath = []) {
  var _marked2 = _regenerator.default.mark(walker);

  var _iterator21 = _createForOfIteratorHelper(rootPath),
      _step21;

  try {
    for (_iterator21.s(); !(_step21 = _iterator21.n()).done;) {
      let key = _step21.value;
      o = o[key];
    }
  } catch (err) {
    _iterator21.e(err);
  } finally {
    _iterator21.f();
  }

  function walker(o, path) {
    var _iterator22, _step22, _step22$value, k, v, p;

    return _regenerator.default.wrap(function walker$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          _iterator22 = _createForOfIteratorHelper(Util.entries(o));
          _context14.prev = 1;

          _iterator22.s();

        case 3:
          if ((_step22 = _iterator22.n()).done) {
            _context14.next = 12;
            break;
          }

          _step22$value = (0, _slicedToArray2.default)(_step22.value, 2), k = _step22$value[0], v = _step22$value[1];
          p = [...path, k];
          _context14.next = 8;
          return [v, k, o, p];

        case 8:
          if (!(typeof v == "object" && v !== null)) {
            _context14.next = 10;
            break;
          }

          return _context14.delegateYield(walker(v, p), "t0", 10);

        case 10:
          _context14.next = 3;
          break;

        case 12:
          _context14.next = 17;
          break;

        case 14:
          _context14.prev = 14;
          _context14.t1 = _context14["catch"](1);

          _iterator22.e(_context14.t1);

        case 17:
          _context14.prev = 17;

          _iterator22.f();

          return _context14.finish(17);

        case 20:
        case "end":
          return _context14.stop();
      }
    }, _marked2, null, [[1, 14, 17, 20]]);
  }

  return walker(o, []);
};

Util.indexByPath = function (o, p) {
  var _iterator23 = _createForOfIteratorHelper(p),
      _step23;

  try {
    for (_iterator23.s(); !(_step23 = _iterator23.n()).done;) {
      let key = _step23.value;
      o = o[key];
    }
  } catch (err) {
    _iterator23.e(err);
  } finally {
    _iterator23.f();
  }

  return o;
};

Util.pushUnique = function (arr) {
  let args = [...arguments];
  arr = args.shift();
  args.forEach(item => {
    if (arr.indexOf(item) == -1) arr.push(item);
  });
  return arr;
};

Util.iterateMembers = _regenerator.default.mark(function _callee11(obj, predicate = (name, depth) => true, depth = 0) {
  var names, pred, name, _iterator24, _step24, _iterator25, _step25, symbol, proto;

  return _regenerator.default.wrap(function _callee11$(_context15) {
    while (1) switch (_context15.prev = _context15.next) {
      case 0:
        names = [];
        pred = Util.predicate(predicate);
        _context15.t0 = _regenerator.default.keys(obj);

      case 3:
        if ((_context15.t1 = _context15.t0()).done) {
          _context15.next = 10;
          break;
        }

        name = _context15.t1.value;

        if (!pred(name, depth)) {
          _context15.next = 8;
          break;
        }

        _context15.next = 8;
        return name;

      case 8:
        _context15.next = 3;
        break;

      case 10:
        _iterator24 = _createForOfIteratorHelper(Object.getOwnPropertyNames(obj));
        _context15.prev = 11;

        _iterator24.s();

      case 13:
        if ((_step24 = _iterator24.n()).done) {
          _context15.next = 20;
          break;
        }

        name = _step24.value;

        if (!pred(name, depth)) {
          _context15.next = 18;
          break;
        }

        _context15.next = 18;
        return name;

      case 18:
        _context15.next = 13;
        break;

      case 20:
        _context15.next = 25;
        break;

      case 22:
        _context15.prev = 22;
        _context15.t2 = _context15["catch"](11);

        _iterator24.e(_context15.t2);

      case 25:
        _context15.prev = 25;

        _iterator24.f();

        return _context15.finish(25);

      case 28:
        _iterator25 = _createForOfIteratorHelper(Object.getOwnPropertySymbols(obj));
        _context15.prev = 29;

        _iterator25.s();

      case 31:
        if ((_step25 = _iterator25.n()).done) {
          _context15.next = 38;
          break;
        }

        symbol = _step25.value;

        if (!pred(symbol, depth)) {
          _context15.next = 36;
          break;
        }

        _context15.next = 36;
        return symbol;

      case 36:
        _context15.next = 31;
        break;

      case 38:
        _context15.next = 43;
        break;

      case 40:
        _context15.prev = 40;
        _context15.t3 = _context15["catch"](29);

        _iterator25.e(_context15.t3);

      case 43:
        _context15.prev = 43;

        _iterator25.f();

        return _context15.finish(43);

      case 46:
        proto = Object.getPrototypeOf(obj);

        if (!proto) {
          _context15.next = 49;
          break;
        }

        return _context15.delegateYield(Util.iterateMembers(proto, pred, depth + 1), "t4", 49);

      case 49:
      case "end":
        return _context15.stop();
    }
  }, _callee11, null, [[11, 22, 25, 28], [29, 40, 43, 46]]);
});

Util.getMembers = (obj, pred = (prop, level) => true) => Util.unique([...Util.iterateMembers(obj, pred)]);

Util.iterateMethodNames = (obj, depth = 1, start = 0) => {
  const end = depth === true ? start + 1 : depth === false ? start : start + depth;
  const check = Util.inRange(start, end);
  return Util.iterateMembers(obj, (prop, level) => check(level) && typeof obj[prop] === "function" && prop != "constructor");
};

Util.getMethodNames = (obj, depth = 1, start = 0) => Util.unique([...Util.iterateMethodNames(obj, depth, start)]);

Util.methods = (obj, depth = 1, t = (k, v) => [k, v], r = e => Object.fromEntries([...e])) => r(Util.iterateMethods(obj, depth, t));

Util.getMethods = (obj, depth = 1) => {
  let ret = {};

  var _iterator26 = _createForOfIteratorHelper(Util.iterateMethods(obj, depth)),
      _step26;

  try {
    for (_iterator26.s(); !(_step26 = _iterator26.n()).done;) {
      let _step26$value = (0, _slicedToArray2.default)(_step26.value, 2),
          k = _step26$value[0],
          v = _step26$value[1];

      ret[k] = v;
    }
  } catch (err) {
    _iterator26.e(err);
  } finally {
    _iterator26.f();
  }

  return ret;
};

Util.iterateMethods = _regenerator.default.mark(function _callee12(obj, depth = 1, t = (key, value) => [key, value], start = 0) {
  var _iterator27, _step27, name, value;

  return _regenerator.default.wrap(function _callee12$(_context16) {
    while (1) switch (_context16.prev = _context16.next) {
      case 0:
        _iterator27 = _createForOfIteratorHelper(Util.getMethodNames(obj, depth, start));
        _context16.prev = 1;

        _iterator27.s();

      case 3:
        if ((_step27 = _iterator27.n()).done) {
          _context16.next = 16;
          break;
        }

        name = _step27.value;
        _context16.prev = 5;
        value = t(name, obj[name]);

        if (!(value !== undefined && value !== false && value !== null)) {
          _context16.next = 10;
          break;
        }

        _context16.next = 10;
        return value;

      case 10:
        _context16.next = 14;
        break;

      case 12:
        _context16.prev = 12;
        _context16.t0 = _context16["catch"](5);

      case 14:
        _context16.next = 3;
        break;

      case 16:
        _context16.next = 21;
        break;

      case 18:
        _context16.prev = 18;
        _context16.t1 = _context16["catch"](1);

        _iterator27.e(_context16.t1);

      case 21:
        _context16.prev = 21;

        _iterator27.f();

        return _context16.finish(21);

      case 24:
      case "end":
        return _context16.stop();
    }
  }, _callee12, null, [[1, 18, 21, 24], [5, 12]]);
});

Util.bindMethods = function (methods, obj) {
  for (let name in methods) {
    methods[name] = methods[name].bind(obj);
  }

  return methods;
};

Util.bindMethodsTo = function (dest, obj, methods) {
  for (let name in methods) {
    dest[name] = methods[name].bind(obj);
  }

  return dest;
};

Util.getConstructor = obj => {
  return Object.getPrototypeOf(obj).constructor;
};

Util.getPrototypeChain = function (obj, fn = p => p) {
  let ret = [];
  let proto;

  while (proto = Object.getPrototypeOf(obj)) {
    if (proto === Object.prototype) break;
    ret.push(fn(proto));
    obj = proto;
  }

  return ret;
};

Util.weakAssign = function (obj) {
  let args = [...arguments];
  obj = args.shift();
  args.forEach(other => {
    for (let key in other) {
      if (obj[key] === undefined) obj[key] = other[key];
    }
  });
  return obj;
};

Util.getCallerStack = function (position = 2) {
  Error.stackTraceLimit = 100;

  if (position >= Error.stackTraceLimit) {
    throw new TypeError("getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `".concat(position, "` and Error.stackTraceLimit was: `").concat(Error.stackTraceLimit, "`"));
  }

  const oldPrepareStackTrace = Error.prepareStackTrace;

  Error.prepareStackTrace = (_, stack) => stack;

  const stack = new Error().stack;
  Error.prepareStackTrace = oldPrepareStackTrace;
  return stack !== null && typeof stack === "object" ? stack.slice(position) : null;
};

Util.getCallerFile = function (position = 2) {
  let stack = Util.getCallerStack();

  if (stack !== null && typeof stack === "object") {
    const frame = stack[position];
    return frame ? "".concat(frame.getFileName(), ":").concat(frame.getLineNumber()) : undefined;
  }
};

Util.getCallerFunction = function (position = 2) {
  let stack = Util.getCallerStack(position + 1);

  if (stack !== null && typeof stack === "object") {
    const frame = stack[0];
    return frame ? frame.getFunction() : undefined;
  }
};

Util.getCallerFunctionName = function (position = 2) {
  let stack = Util.getCallerStack(position + 1);

  if (stack !== null && typeof stack === "object") {
    const frame = stack[0];
    return frame ? frame.getMethodName() || frame.getFunctionName() : undefined;
  }
};

Util.getCallerFunctionNames = function (position = 2) {
  let stack = Util.getCallerStack(position + 1);

  if (stack !== null && typeof stack === "object") {
    let ret = [];

    for (let i = 0; stack[i]; i++) {
      const frame = stack[i];
      ret.push(frame ? frame.getMethodName() || frame.getFunctionName() : undefined);
    }

    return ret;
  }
};

Util.getCaller = function (index, stack) {
  const methods = ["getColumnNumber", "getEvalOrigin", "getFileName", "getFunction", "getFunctionName", "getLineNumber", "getMethodName", "getPosition", "getPromiseIndex", "getScriptNameOrSourceURL", "getThis", "getTypeName"];

  if (stack !== null && typeof stack === "object") {
    const frame = stack[index];
    return methods.reduce((acc, m) => {
      if (frame[m]) {
        const name = Util.lcfirst(m.replace(/^get/, ""));
        const value = frame[m]();

        if (value != undefined) {
          acc[name] = value;
        }
      }

      return acc;
    }, {});
  }
};

Util.getCallers = function (start = 2, num = Number.MAX_SAFE_INTEGER) {
  let stack = Util.getCallerStack(start + 1);
  let ret = [];
  let i = 0;

  while (i++ < num) {
    try {
      let frame = Util.getCaller(i, stack);
      if (frame === null) break;
      ret.push(frame);
    } catch (err) {}
  }

  return ret;
};

Util.rotateLeft = function (x, n) {
  n = n & 0x1f;
  return x << n | x >> 32 - n & ~(-1 >> n << n);
};

Util.rotateRight = function (x, n) {
  n = n & 0x1f;
  return Util.rotateLeft(x, 32 - n);
};

Util.hashString = function (string, bits = 32, mask = 0xffffffff) {
  let ret = 0;
  let bitc = 0;

  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    ret *= 186;
    ret ^= code;
    bitc += 8;
    ret = Util.rotateLeft(ret, 7) & mask;
  }

  return ret & 0x7fffffff;
};

Util.flatTree = function (tree, addOutput) {
  const ret = [];
  if (!addOutput) addOutput = arg => ret.push(arg);
  addOutput(Util.filterKeys(tree, key => key !== "children"));

  if (typeof tree.children == "object" && tree.children !== null && tree.children.length) {
    var _iterator28 = _createForOfIteratorHelper(tree.children),
        _step28;

    try {
      for (_iterator28.s(); !(_step28 = _iterator28.n()).done;) {
        let child = _step28.value;
        Util.flatTree(child, addOutput);
      }
    } catch (err) {
      _iterator28.e(err);
    } finally {
      _iterator28.f();
    }
  }

  return ret;
};

Util.traverseTree = function (tree, fn, depth = 0, parent = null) {
  fn(tree, depth, parent);

  if (typeof tree == "object" && tree !== null && typeof tree.children == "object" && tree.children !== null && tree.children.length) {
    var _iterator29 = _createForOfIteratorHelper(tree.children),
        _step29;

    try {
      for (_iterator29.s(); !(_step29 = _iterator29.n()).done;) {
        let child = _step29.value;
        Util.traverseTree(child, fn, depth + 1, tree);
      }
    } catch (err) {
      _iterator29.e(err);
    } finally {
      _iterator29.f();
    }
  }
};

Util.walkTree = function (node, pred, t, depth = 0, parent = null) {
  return _regenerator.default.mark(function _callee13() {
    var _i6, _arr, child;

    return _regenerator.default.wrap(function _callee13$(_context17) {
      while (1) switch (_context17.prev = _context17.next) {
        case 0:
          if (!pred) pred = i => true;
          if (!t) t = function t(i) {
            i.depth = depth;
            return i;
          };

          if (!pred(node, depth, parent)) {
            _context17.next = 13;
            break;
          }

          _context17.next = 5;
          return t(node);

        case 5:
          if (!(typeof node == "object" && node !== null && typeof node.children == "object" && node.children.length)) {
            _context17.next = 13;
            break;
          }

          _i6 = 0, _arr = [...node.children];

        case 7:
          if (!(_i6 < _arr.length)) {
            _context17.next = 13;
            break;
          }

          child = _arr[_i6];
          return _context17.delegateYield(Util.walkTree(child, pred, t, depth + 1, node.parent_id), "t0", 10);

        case 10:
          _i6++;
          _context17.next = 7;
          break;

        case 13:
        case "end":
          return _context17.stop();
      }
    }, _callee13);
  })();
};

Util.isPromise = function (obj) {
  return Boolean(obj) && typeof obj.then === "function" || obj instanceof Promise;
};

if (typeof setImmediate !== "function") var setImmediate = fn => setTimeout(fn, 0);

Util.next = function (iter, observer, prev = undefined) {
  let item;

  try {
    item = iter.next(prev);
  } catch (err) {
    return observer.error(err);
  }

  const value = item.value;
  if (item.done) return observer.complete();

  if (isPromise(value)) {
    value.then(val => {
      observer.next(val);
      setImmediate(() => Util.next(iter, observer, val));
    }).catch(err => {
      return observer.error(err);
    });
  } else {
    observer.next(value);
    setImmediate(() => Util.next(iter, observer, value));
  }
};

Util.getImageAverageColor = function (imageElement, options) {
  if (!imageElement) {
    return false;
  }

  options = options || {};
  const settings = {
    tooDark: (options.tooDark || 0.03) * 255 * 3,
    tooLight: (options.tooLight || 0.97) * 255 * 3,
    tooAlpha: (options.tooAlpha || 0.1) * 255
  };
  const w = imageElement.width;
  let h = imageElement.height;
  const context = document.createElement("canvas").getContext("2d");
  context.drawImage(imageElement, 0, 0, w, h);
  const subpixels = context.getImageData(0, 0, w, h).data;
  const pixels = {
    r: 0,
    g: 0,
    b: 0,
    a: 0
  };
  let processedPixels = 0;
  const pixel = {
    r: 0,
    g: 0,
    b: 0,
    a: 0
  };
  let luma = 0;

  for (let i = 0, l = w * h * 4; i < l; i += 4) {
    pixel.r = subpixels[i];
    pixel.g = subpixels[i + 1];
    pixel.b = subpixels[i + 2];
    pixel.a = subpixels[i + 4];

    if (pixel.a > settings.tooAlpha && (luma = pixel.r + pixel.g + pixel.b) > settings.tooDark && luma < settings.tooLight) {
      pixels.r += pixel.r;
      pixels.g += pixel.g;
      pixels.b += pixel.b;
      pixels.a += pixel.a;
      processedPixels++;
    }
  }

  let channels = {
    r: null,
    g: null,
    b: null,
    a: null
  };

  if (processedPixels > 0) {
    channels = {
      r: Math.round(pixels.r / processedPixels),
      g: Math.round(pixels.g / processedPixels),
      b: Math.round(pixels.b / processedPixels),
      a: Math.round(pixels.a / processedPixels)
    };
  }

  const o = Object.assign({}, channels, {
    toStringRgb() {
      const r = this.r,
            g = this.g,
            b = this.b;
      return [r, g, b].join(", ");
    },

    toStringRgba() {
      const r = this.r,
            g = this.g,
            b = this.b,
            a = this.a;
      return [r, g, b, a].join(", ");
    },

    toStringHex() {
      const toHex = function toHex(d) {
        h = Math.round(d).toString(16);

        if (h.length < 2) {
          h = "0".concat(h);
        }

        return h;
      };

      const r = this.r,
            g = this.g,
            b = this.b;
      return [toHex(r), toHex(g), toHex(b)].join("");
    }

  });
  return o;
};

Util.jsonToObject = function (jsonStr) {
  let ret = null;

  try {
    ret = JSON.parse(jsonStr);
  } catch (error) {
    let pos = +("" + error).split("\n").reverse()[0].replace(/.*position ([0-9]+).*/, "$1");
    console.error("Unexpected token: ", jsonStr);
    console.error("Unexpected token at:", jsonStr.substring(pos));
    ret = null;
  }

  return ret;
};

Util.splitLines = function (str, max_linelen = Number.MAX_SAFE_INTEGER) {
  const tokens = str.split(/\s/g);
  let lines = [];
  let line = tokens.shift();

  for (; tokens.length;) {
    if ((line.length ? line.length + 1 : 0) + tokens[0].length > max_linelen) {
      lines.push(line);
      line = "";
    }

    if (line != "") line += " ";
    line += tokens.shift();
  }

  if (line != "") lines.push(line);
  return lines;
};

Util.decodeHTMLEntities = function (text) {
  var entities = {
    amp: "&",
    apos: "'",
    "#x27": "'",
    "#x2F": "/",
    "#39": "'",
    "#47": "/",
    lt: "<",
    gt: ">",
    nbsp: " ",
    quot: '"'
  };
  return text.replace(/&([^;]+);/gm, function (match, entity) {
    return entities[entity] || match;
  });
};

Util.stripAnsi = function (str) {
  return (str + "").replace(/\x1B[[(?);]{0,2}(;?\d)*./g, "");
};

Util.proxy = (obj = {}, handler) => new Proxy(obj, _objectSpread({
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver);
  },

  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  }

}, handler));

Util.proxyTree = function proxyTree(...callbacks) {
  const setCallback = callbacks[0],
        _callbacks$ = callbacks[1],
        applyCallback = _callbacks$ === void 0 ? () => {} : _callbacks$;
  const handler = {
    get(target, key) {
      return node([...this.path, key]);
    },

    set(target, key, value) {
      return setCallback(this.path, key, value);
    },

    apply(target, thisArg, args) {
      return applyCallback(this.path, ...args);
    }

  };

  function node(path) {
    return new Proxy(() => {}, _objectSpread({
      path
    }, handler));
  }

  return node([]);
};

Util.proxyClone = obj => {
  const override = Object.create(null);
  const deleted = Object.create(null);

  const debug = (...args) => console.log("DEBUG proxyClone", ...args);

  const _get = name => {
    let value;
    if (!deleted[name]) value = override[name] || obj[name];

    if (Util.isObject(value)) {
      value = Util.proxyClone(value);
      override[name] = value;
    }

    if (typeof value === "function") {
      value = value.bind(obj);
    }

    return value;
  };

  return new Proxy(Object.prototype, {
    getPrototypeOf: () => Object.getPrototypeOf(obj),
    setPrototypeOf: () => {
      throw new Error("Not yet implemented: setPrototypeOf");
    },
    isExtensible: () => {
      throw new Error("Not yet implemented: isExtensible");
    },
    preventExtensions: () => {
      throw new Error("Not yet implemented: preventExtensions");
    },
    getOwnPropertyDescriptor: (target, name) => {
      let desc;

      if (!deleted[name]) {
        desc = Object.getOwnPropertyDescriptor(override, name) || Object.getOwnPropertyDescriptor(obj, name);
      }

      if (desc) desc.configurable = true;
      debug("getOwnPropertyDescriptor ".concat(name, " ="), desc);
      return desc;
    },
    defineProperty: () => {
      throw new Error("Not yet implemented: defineProperty");
    },
    has: (_, name) => {
      const has = !deleted[name] && (name in override || name in obj);
      debug("has ".concat(name, " = ").concat(has));
      return has;
    },
    get: (receiver, name) => {
      const value = _get(name);

      debug("get ".concat(name, " ="), value);
      return value;
    },
    set: (_, name, val) => {
      delete deleted[name];
      override[name] = val;
      debug("set ".concat(name, " = ").concat(val), name, val);
      return true;
    },
    deleteProperty: (_, name) => {
      debug("deleteProperty ".concat(name));
      deleted[name] = true;
      delete override[name];
    },
    ownKeys: () => {
      const keys = Object.keys(obj).concat(Object.keys(override)).filter(Util.uniquePred).filter(key => !deleted[key]);
      debug("ownKeys", keys);
      return keys;
    },
    apply: () => {
      throw new Error("Not yet implemented: apply");
    },
    construct: () => {
      throw new Error("Not yet implemented: construct");
    },
    enumerate: () => {
      throw new Error("Not yet implemented: enumerate");
    }
  });
};

Util.proxyDelegate = (target, origin) => {
  return new Proxy(target, {
    get(target, key, receiver) {
      if (key in target) return Reflect.get(target, key, receiver);
      const value = origin[key];
      return typeof value === "function" ? (...args) => value.apply(origin, args) : value;
    },

    set(target, key, value, receiver) {
      if (key in target) return Reflect.set(target, key, value, receiver);
      origin[key] = value;
      return true;
    }

  });
};

Util.immutable = args => {
  const argsType = typeof args === "object" && Util.isArray(args) ? "array" : "object";
  const errorText = argsType === "array" ? "Error! You can't change elements of this array" : "Error! You can't change properties of this object";
  const handler = {
    set: () => {
      throw new Error(errorText);
    },
    deleteProperty: () => {
      throw new Error(errorText);
    },
    defineProperty: () => {
      throw new Error(errorText);
    }
  };
  return new Proxy(args, handler);
};

Util.immutableClass = Original => {
  let name = Util.fnName(Original);
  return new Function("Original", "const Immutable".concat(name, " = class extends Original {\n    constructor(...args) {\n      super(...args);\n      if(new.target === Immutable").concat(name, ")\n        Object.freeze(this);\n    }\n  };\n  return Immutable").concat(name, ";"))(Original);
};

Util.partial = function partial(fn) {
  var partialArgs = [].slice.call(arguments, 1);

  if (!partialArgs.length) {
    return fn;
  }

  return function () {
    var args = [].slice.call(arguments);
    var derivedArgs = [];

    for (var i = 0; i < partialArgs.length; i++) {
      var thisPartialArg = partialArgs[i];
      derivedArgs[i] = thisPartialArg === undefined ? args.shift() : thisPartialArg;
    }

    return fn.apply(this, derivedArgs.concat(args));
  };
};

Util.compose = function compose(fn1, fn2) {
  if (!arguments.length) {
    throw new Error("expected at least one (and probably more) function arguments");
  }

  var fns = arguments;
  return function () {
    var result = fns[0].apply(this, arguments);
    var len = fns.length;

    for (var i = 1; i < len; i++) {
      result = fns[i].call(this, result);
    }

    return result;
  };
};

Util.clamp = Util.curry((min, max, value) => Math.max(min, Math.min(max, value)));

Util.color = (useColor = true) => !useColor || Util.isBrowser() ? {
  code: () => "",
  text: (_text, ...color) => color.indexOf(1) != -1 ? "".concat(_text) : _text
} : {
  code(...args) {
    return "\x1B[".concat([...args].join(";"), "m");
  },

  text(text, ...color) {
    return this.code(...color) + text + this.code(0);
  }

};

Util.colorText = (...args) => Util.color().text(...args);

Util.ansiCode = (...args) => Util.color().code(...args);

Util.defineInspect = (proto, ...props) => {
  if (!Util.isBrowser()) {
    const c = Util.color();

    proto[Symbol.for("nodejs.util.inspect.custom")] = function () {
      const obj = this;
      return c.text(Util.fnName(proto.constructor) + " ", 1, 31) + Util.toString(props.reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {}), {
        multiline: false,
        colon: ":",
        spacing: "",
        separator: ", ",
        padding: ""
      });
    };
  }
};

Util.predicate = fn_or_regex => {
  let fn;
  if (fn_or_regex instanceof RegExp) fn = (...args) => fn_or_regex.test(args + "");else fn = (...args) => fn_or_regex(...args);
  return fn;
};

Util.inRange = Util.curry((a, b, value) => value >= a && value <= b);

Util.bindProperties = (proxy, target, props, gen) => {
  if (props instanceof Array) props = Object.fromEntries(props.map(name => [name, name]));
  const propNames = Object.keys(props);
  if (!gen) gen = p => v => v === undefined ? target[p] : target[p] = v;
  Object.defineProperties(proxy, propNames.reduce((a, k) => {
    const prop = props[k];
    const get_set = typeof prop == "function" ? prop : gen(prop);
    return _objectSpread({}, a, {
      [k]: {
        get: get_set,
        set: get_set,
        enumerable: true
      }
    });
  }, {
    __getter_setter__: {
      value: gen,
      enumerable: false
    },
    __bound_target__: {
      value: target,
      enumerable: false
    }
  }));
  return proxy;
};

var _default = Util;
exports.default = _default;
