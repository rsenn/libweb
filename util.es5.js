"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Util = exports.default = Util;

require("core-js/modules/es7.object.get-own-property-descriptors");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es7.object.values");

require("core-js/modules/es6.promise");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es7.object.entries");

require("core-js/modules/es6.map");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

require("core-js/modules/es7.string.trim-right");

require("core-js/modules/es6.array.sort");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const formatAnnotatedObject = function formatAnnotatedObject(subject, {
  indent = "  ",
  spacing = " ",
  separator = ",",
  newline = "\n",
  maxlen = 30,
  depth = 1
}) {
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

  let ret = "{".concat(opts.newline).concat(r.map(arr => "".concat(padding(arr[0]) + arr[0], ":").concat(spacing).concat(arr[1])).join(j)).concat(opts.newline, "}");
  return ret;
};

function Util(g) {
  if (g) Util.globalObject = g;
}

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

Util.log = function () {
  const log = Math.log;
  return function (n, base) {
    return log(n) / (base ? log(base) : 1);
  };
}();

Util.logBase = function (n, base) {
  return Math.log(n) / Math.log(base);
};

Util.generalLog = function (n, x) {
  return Math.log(x) / Math.log(n);
};

Util.toSource = function (arg) {
  if (typeof arg == "string") return "'".concat(arg, "'");

  if (arg && arg.x !== undefined && arg.y !== undefined) {
    return "[".concat(arg.x, ",").concat(arg.y, "]");
  }

  if (arg && arg.toSource) return arg.toSource();
  let cls = arg && arg.constructor && Util.fnName(arg.constructor);
  return String(arg);
};

Util.debug = function (message) {
  const args = [...arguments];
  let cache = Util.array();

  const removeCircular = function removeCircular(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) return;
      cache.push(value);
    }

    return value;
  };

  const str = args.map(arg => typeof arg === "object" ? JSON.stringify(arg, removeCircular) : arg).join(" ").replace(/\n/g, "");
  console.log.call(console, str);
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
  let proto = Object.getPrototypeOf(obj) || obj;
  return Util.fnName(proto.constructor || proto);
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
  const r = Util.sortNum(Util.draw(Util.range(start, end), draws));
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

Util.define = (obj, key, value, enumerable = false) => Object.defineProperty(obj, key, {
  enumerable,
  configurable: false,
  writable: false,
  value
});

Util.extend = (obj, ...args) => {
  for (var _i = 0, _args = args; _i < _args.length; _i++) {
    let other = _args[_i];

    for (let prop in other) Util.define(obj, prop, other[prop]);
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
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key;

        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context2.prev = 3;
              _iterator = _this.keys()[Symbol.iterator]();

            case 5:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context2.next = 12;
                break;
              }

              key = _step.value;
              _context2.next = 9;
              return [key, getItem(obj, key)];

            case 9:
              _iteratorNormalCompletion = true;
              _context2.next = 5;
              break;

            case 12:
              _context2.next = 18;
              break;

            case 14:
              _context2.prev = 14;
              _context2.t0 = _context2["catch"](3);
              _didIteratorError = true;
              _iteratorError = _context2.t0;

            case 18:
              _context2.prev = 18;
              _context2.prev = 19;

              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }

            case 21:
              _context2.prev = 21;

              if (!_didIteratorError) {
                _context2.next = 24;
                break;
              }

              throw _iteratorError;

            case 24:
              return _context2.finish(21);

            case 25:
              return _context2.finish(18);

            case 26:
            case "end":
              return _context2.stop();
          }
        }, _callee2, null, [[3, 14, 18, 26], [19,, 21, 25]]);
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

Util.array = function (...args) {
  let a = args[0] instanceof Array ? args.shift() : [...args];
  let fn = args[0];
  if (doExtendArray) try {
    if (a.match === undefined) {
      doExtendArray();
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
  return m;
};

Util.extendMap = function (map) {
  if (map.entries === undefined) {
    map.entries = _regenerator.default.mark(function iterator() {
      var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, entry;

      return _regenerator.default.wrap(function iterator$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context3.prev = 3;
            _iterator2 = map[Symbol.iterator]();

          case 5:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context3.next = 22;
              break;
            }

            entry = _step2.value;

            if (!(entry.name !== undefined && entry.value !== undefined)) {
              _context3.next = 12;
              break;
            }

            _context3.next = 10;
            return [entry.name, entry.value];

          case 10:
            _context3.next = 19;
            break;

          case 12:
            if (!(entry[0] !== undefined && entry[1] !== undefined)) {
              _context3.next = 17;
              break;
            }

            _context3.next = 15;
            return entry;

          case 15:
            _context3.next = 19;
            break;

          case 17:
            _context3.next = 19;
            return [entry, map[entry]];

          case 19:
            _iteratorNormalCompletion2 = true;
            _context3.next = 5;
            break;

          case 22:
            _context3.next = 28;
            break;

          case 24:
            _context3.prev = 24;
            _context3.t0 = _context3["catch"](3);
            _didIteratorError2 = true;
            _iteratorError2 = _context3.t0;

          case 28:
            _context3.prev = 28;
            _context3.prev = 29;

            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }

          case 31:
            _context3.prev = 31;

            if (!_didIteratorError2) {
              _context3.next = 34;
              break;
            }

            throw _iteratorError2;

          case 34:
            return _context3.finish(31);

          case 35:
            return _context3.finish(28);

          case 36:
          case "end":
            return _context3.stop();
        }
      }, iterator, null, [[3, 24, 28, 36], [29,, 31, 35]]);
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
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = entries[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      let _step3$value = (0, _slicedToArray2.default)(_step3.value, 2),
          k = _step3$value[0],
          v = _step3$value[1];

      ret[k] = v;
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
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
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = arr[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      let v = _step4.value;
      {
        if (pred(v)) return v;
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
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

Util.toString = function () {};

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

Util.transform = function (fn) {
  return _regenerator.default.mark(function _callee5(arr) {
    var _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, item;

    return _regenerator.default.wrap(function _callee5$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _iteratorNormalCompletion5 = true;
          _didIteratorError5 = false;
          _iteratorError5 = undefined;
          _context6.prev = 3;
          _iterator5 = arr[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
            _context6.next = 12;
            break;
          }

          item = _step5.value;
          _context6.next = 9;
          return fn(item);

        case 9:
          _iteratorNormalCompletion5 = true;
          _context6.next = 5;
          break;

        case 12:
          _context6.next = 18;
          break;

        case 14:
          _context6.prev = 14;
          _context6.t0 = _context6["catch"](3);
          _didIteratorError5 = true;
          _iteratorError5 = _context6.t0;

        case 18:
          _context6.prev = 18;
          _context6.prev = 19;

          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }

        case 21:
          _context6.prev = 21;

          if (!_didIteratorError5) {
            _context6.next = 24;
            break;
          }

          throw _iteratorError5;

        case 24:
          return _context6.finish(21);

        case 25:
          return _context6.finish(18);

        case 26:
        case "end":
          return _context6.stop();
      }
    }, _callee5, null, [[3, 14, 18, 26], [19,, 21, 25]]);
  });
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
      console.log(propName);
      console.log(object[key]);
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

  if (t === "object") {
    o = data.length ? Util.array() : {};
  } else {
    return data;
  }

  if (t === "object") {
    if (data.length) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = data[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          const value = _step6.value;
          o.push(this.deepCloneObservable(value));
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
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
  console.log("Setting cookie[".concat(key, "] = ").concat(value));
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
  } catch (e) {
    console.log(object);
  }

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
  console.log("getURL process ", {
    url
  });
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
  const ret = Util.array();

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
  console.log("PARAMS: ", {
    argstr,
    pmatches,
    params
  });
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
    reject();
  }

  resolve(ret);
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

Util.concat = _regenerator.default.mark(function _callee6(...args) {
  var _i2, _args8, arg, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, item;

  return _regenerator.default.wrap(function _callee6$(_context7) {
    while (1) switch (_context7.prev = _context7.next) {
      case 0:
        _i2 = 0, _args8 = args;

      case 1:
        if (!(_i2 < _args8.length)) {
          _context7.next = 37;
          break;
        }

        arg = _args8[_i2];

        if (!Util.isGenerator(arg)) {
          _context7.next = 8;
          break;
        }

        console.error("isGenerator:", arg);
        return _context7.delegateYield(arg, "t0", 6);

      case 6:
        _context7.next = 34;
        break;

      case 8:
        _iteratorNormalCompletion7 = true;
        _didIteratorError7 = false;
        _iteratorError7 = undefined;
        _context7.prev = 11;
        _iterator7 = arg[Symbol.iterator]();

      case 13:
        if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
          _context7.next = 20;
          break;
        }

        item = _step7.value;
        _context7.next = 17;
        return item;

      case 17:
        _iteratorNormalCompletion7 = true;
        _context7.next = 13;
        break;

      case 20:
        _context7.next = 26;
        break;

      case 22:
        _context7.prev = 22;
        _context7.t1 = _context7["catch"](11);
        _didIteratorError7 = true;
        _iteratorError7 = _context7.t1;

      case 26:
        _context7.prev = 26;
        _context7.prev = 27;

        if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
          _iterator7.return();
        }

      case 29:
        _context7.prev = 29;

        if (!_didIteratorError7) {
          _context7.next = 32;
          break;
        }

        throw _iteratorError7;

      case 32:
        return _context7.finish(29);

      case 33:
        return _context7.finish(26);

      case 34:
        _i2++;
        _context7.next = 1;
        break;

      case 37:
      case "end":
        return _context7.stop();
    }
  }, _callee6, null, [[11, 22, 26, 34], [27,, 29, 33]]);
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
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = arr1[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      let obj = _step8.value;
      hash[obj[key]] = obj;
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }

  var _iteratorNormalCompletion9 = true;
  var _didIteratorError9 = false;
  var _iteratorError9 = undefined;

  try {
    for (var _iterator9 = arr2[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
      let obj = _step9.value;
      hash[obj[key]] = obj;
    }
  } catch (err) {
    _didIteratorError9 = true;
    _iteratorError9 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
        _iterator9.return();
      }
    } finally {
      if (_didIteratorError9) {
        throw _iteratorError9;
      }
    }
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
  var _iteratorNormalCompletion10 = true;
  var _didIteratorError10 = false;
  var _iteratorError10 = undefined;

  try {
    for (var _iterator10 = Util.entries(o)[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
      let _step10$value = (0, _slicedToArray2.default)(_step10.value, 2),
          k = _step10$value[0],
          v = _step10$value[1];

      fn(v, k, o);
    }
  } catch (err) {
    _didIteratorError10 = true;
    _iteratorError10 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
        _iterator10.return();
      }
    } finally {
      if (_didIteratorError10) {
        throw _iteratorError10;
      }
    }
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
  if (Util.isGenerator(a)) return _regenerator.default.mark(function _callee7() {
    var _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, item;

    return _regenerator.default.wrap(function _callee7$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _iteratorNormalCompletion11 = true;
          _didIteratorError11 = false;
          _iteratorError11 = undefined;
          _context8.prev = 3;
          _iterator11 = a[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
            _context8.next = 13;
            break;
          }

          item = _step11.value;

          if (!pred(item)) {
            _context8.next = 10;
            break;
          }

          _context8.next = 10;
          return item;

        case 10:
          _iteratorNormalCompletion11 = true;
          _context8.next = 5;
          break;

        case 13:
          _context8.next = 19;
          break;

        case 15:
          _context8.prev = 15;
          _context8.t0 = _context8["catch"](3);
          _didIteratorError11 = true;
          _iteratorError11 = _context8.t0;

        case 19:
          _context8.prev = 19;
          _context8.prev = 20;

          if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
            _iterator11.return();
          }

        case 22:
          _context8.prev = 22;

          if (!_didIteratorError11) {
            _context8.next = 25;
            break;
          }

          throw _iteratorError11;

        case 25:
          return _context8.finish(22);

        case 26:
          return _context8.finish(19);

        case 27:
        case "end":
          return _context8.stop();
      }
    }, _callee7, null, [[3, 15, 19, 27], [20,, 22, 26]]);
  })();
  let isa = Util.isArray(a);
  if (isa) return _regenerator.default.mark(function _callee8() {
    var _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, _step12$value, k, v;

    return _regenerator.default.wrap(function _callee8$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _iteratorNormalCompletion12 = true;
          _didIteratorError12 = false;
          _iteratorError12 = undefined;
          _context9.prev = 3;
          _iterator12 = a.entries()[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
            _context9.next = 13;
            break;
          }

          _step12$value = (0, _slicedToArray2.default)(_step12.value, 2), k = _step12$value[0], v = _step12$value[1];

          if (!pred(v, k, a)) {
            _context9.next = 10;
            break;
          }

          _context9.next = 10;
          return v;

        case 10:
          _iteratorNormalCompletion12 = true;
          _context9.next = 5;
          break;

        case 13:
          _context9.next = 19;
          break;

        case 15:
          _context9.prev = 15;
          _context9.t0 = _context9["catch"](3);
          _didIteratorError12 = true;
          _iteratorError12 = _context9.t0;

        case 19:
          _context9.prev = 19;
          _context9.prev = 20;

          if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
            _iterator12.return();
          }

        case 22:
          _context9.prev = 22;

          if (!_didIteratorError12) {
            _context9.next = 25;
            break;
          }

          throw _iteratorError12;

        case 25:
          return _context9.finish(22);

        case 26:
          return _context9.finish(19);

        case 27:
        case "end":
          return _context9.stop();
      }
    }, _callee8, null, [[3, 15, 19, 27], [20,, 22, 26]]);
  })();
  let ret = {};

  let fn = (k, v) => ret[k] = v;

  var _iteratorNormalCompletion13 = true;
  var _didIteratorError13 = false;
  var _iteratorError13 = undefined;

  try {
    for (var _iterator13 = Util.entries(a)[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
      let _step13$value = (0, _slicedToArray2.default)(_step13.value, 2),
          k = _step13$value[0],
          v = _step13$value[1];

      if (pred(v, k, a)) fn(k, v);
    }
  } catch (err) {
    _didIteratorError13 = true;
    _iteratorError13 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
        _iterator13.return();
      }
    } finally {
      if (_didIteratorError13) {
        throw _iteratorError13;
      }
    }
  }

  return ret;
};

Util.reduce = function (obj, fn, accu) {
  for (let key in obj) accu = fn(accu, obj[key], key, obj);

  return accu;
};

Util.mapFunctional = fn => _regenerator.default.mark(function _callee9(arg) {
  var _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, item;

  return _regenerator.default.wrap(function _callee9$(_context10) {
    while (1) switch (_context10.prev = _context10.next) {
      case 0:
        _iteratorNormalCompletion14 = true;
        _didIteratorError14 = false;
        _iteratorError14 = undefined;
        _context10.prev = 3;
        _iterator14 = arg[Symbol.iterator]();

      case 5:
        if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
          _context10.next = 12;
          break;
        }

        item = _step14.value;
        _context10.next = 9;
        return fn(item);

      case 9:
        _iteratorNormalCompletion14 = true;
        _context10.next = 5;
        break;

      case 12:
        _context10.next = 18;
        break;

      case 14:
        _context10.prev = 14;
        _context10.t0 = _context10["catch"](3);
        _didIteratorError14 = true;
        _iteratorError14 = _context10.t0;

      case 18:
        _context10.prev = 18;
        _context10.prev = 19;

        if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
          _iterator14.return();
        }

      case 21:
        _context10.prev = 21;

        if (!_didIteratorError14) {
          _context10.next = 24;
          break;
        }

        throw _iteratorError14;

      case 24:
        return _context10.finish(21);

      case 25:
        return _context10.finish(18);

      case 26:
      case "end":
        return _context10.stop();
    }
  }, _callee9, null, [[3, 14, 18, 26], [19,, 21, 25]]);
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
  return Math.round(Util.randFloat(min, max, rnd));
};

Util.hex = function (num, numDigits = 0) {
  let n = typeof num == "number" ? num : parseInt(num);
  return ("0".repeat(numDigits) + n.toString(16)).slice(-numDigits);
};

Util.roundTo = function (value, prec) {
  if (prec == 1) return Math.round(value);
  const digits = Math.ceil(-Math.log10(prec));
  return +(Math.round(value / prec) * prec).toFixed(digits);
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
  return obj && obj.length !== undefined && !(obj instanceof String) || obj instanceof Array;
};

Util.isObject = function (obj) {
  const type = typeof obj;
  return type === "function" || type === "object" && !!obj;
};

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

  console.log("Util.entries", arg);
  return null;
};

Util.traverse = function (o, fn) {
  var _marked = _regenerator.default.mark(walker);

  if (typeof fn == "function") return Util.foreach(o, (v, k, a) => {
    fn(v, k, a);
    if (typeof v === "object") Util.traverse(v, fn);
  });

  function walker(o, depth = 0) {
    var _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, _step15$value, k, v;

    return _regenerator.default.wrap(function walker$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _iteratorNormalCompletion15 = true;
          _didIteratorError15 = false;
          _iteratorError15 = undefined;
          _context11.prev = 3;
          _iterator15 = Util.entries(o)[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
            _context11.next = 14;
            break;
          }

          _step15$value = (0, _slicedToArray2.default)(_step15.value, 2), k = _step15$value[0], v = _step15$value[1];
          _context11.next = 9;
          return [v, k, o, depth];

        case 9:
          if (!(typeof v == "object" && v !== null)) {
            _context11.next = 11;
            break;
          }

          return _context11.delegateYield(walker(v, depth + 1), "t0", 11);

        case 11:
          _iteratorNormalCompletion15 = true;
          _context11.next = 5;
          break;

        case 14:
          _context11.next = 20;
          break;

        case 16:
          _context11.prev = 16;
          _context11.t1 = _context11["catch"](3);
          _didIteratorError15 = true;
          _iteratorError15 = _context11.t1;

        case 20:
          _context11.prev = 20;
          _context11.prev = 21;

          if (!_iteratorNormalCompletion15 && _iterator15.return != null) {
            _iterator15.return();
          }

        case 23:
          _context11.prev = 23;

          if (!_didIteratorError15) {
            _context11.next = 26;
            break;
          }

          throw _iteratorError15;

        case 26:
          return _context11.finish(23);

        case 27:
          return _context11.finish(20);

        case 28:
        case "end":
          return _context11.stop();
      }
    }, _marked, null, [[3, 16, 20, 28], [21,, 23, 27]]);
  }

  return walker(o);
};

Util.traverseWithPath = function (o, rootPath = []) {
  var _marked2 = _regenerator.default.mark(walker);

  var _iteratorNormalCompletion16 = true;
  var _didIteratorError16 = false;
  var _iteratorError16 = undefined;

  try {
    for (var _iterator16 = rootPath[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
      let key = _step16.value;
      o = o[key];
    }
  } catch (err) {
    _didIteratorError16 = true;
    _iteratorError16 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion16 && _iterator16.return != null) {
        _iterator16.return();
      }
    } finally {
      if (_didIteratorError16) {
        throw _iteratorError16;
      }
    }
  }

  function walker(o, path) {
    var _iteratorNormalCompletion17, _didIteratorError17, _iteratorError17, _iterator17, _step17, _step17$value, k, v, p;

    return _regenerator.default.wrap(function walker$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _iteratorNormalCompletion17 = true;
          _didIteratorError17 = false;
          _iteratorError17 = undefined;
          _context12.prev = 3;
          _iterator17 = Util.entries(o)[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done) {
            _context12.next = 15;
            break;
          }

          _step17$value = (0, _slicedToArray2.default)(_step17.value, 2), k = _step17$value[0], v = _step17$value[1];
          p = [...path, k];
          _context12.next = 10;
          return [v, k, o, p];

        case 10:
          if (!(typeof v == "object" && v !== null)) {
            _context12.next = 12;
            break;
          }

          return _context12.delegateYield(walker(v, p), "t0", 12);

        case 12:
          _iteratorNormalCompletion17 = true;
          _context12.next = 5;
          break;

        case 15:
          _context12.next = 21;
          break;

        case 17:
          _context12.prev = 17;
          _context12.t1 = _context12["catch"](3);
          _didIteratorError17 = true;
          _iteratorError17 = _context12.t1;

        case 21:
          _context12.prev = 21;
          _context12.prev = 22;

          if (!_iteratorNormalCompletion17 && _iterator17.return != null) {
            _iterator17.return();
          }

        case 24:
          _context12.prev = 24;

          if (!_didIteratorError17) {
            _context12.next = 27;
            break;
          }

          throw _iteratorError17;

        case 27:
          return _context12.finish(24);

        case 28:
          return _context12.finish(21);

        case 29:
        case "end":
          return _context12.stop();
      }
    }, _marked2, null, [[3, 17, 21, 29], [22,, 24, 28]]);
  }

  return walker(o, []);
};

Util.indexByPath = function (o, p) {
  var _iteratorNormalCompletion18 = true;
  var _didIteratorError18 = false;
  var _iteratorError18 = undefined;

  try {
    for (var _iterator18 = p[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
      let key = _step18.value;
      o = o[key];
    }
  } catch (err) {
    _didIteratorError18 = true;
    _iteratorError18 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion18 && _iterator18.return != null) {
        _iterator18.return();
      }
    } finally {
      if (_didIteratorError18) {
        throw _iteratorError18;
      }
    }
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

Util.members = function (obj, recursive = false, pred = () => true) {
  let names = Util.array();

  const adder = name => {
    const exists = names.indexOf(name) != -1;
    const add = !exists && pred(obj[name], name);
    if (add) names.push(name);
    return add;
  };

  return _regenerator.default.mark(function _callee10() {
    var name, _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, _iteratorNormalCompletion20, _didIteratorError20, _iteratorError20, _iterator20, _step20, proto, _iteratorNormalCompletion21, _didIteratorError21, _iteratorError21, _iterator21, _step21;

    return _regenerator.default.wrap(function _callee10$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.t0 = _regenerator.default.keys(obj);

        case 1:
          if ((_context13.t1 = _context13.t0()).done) {
            _context13.next = 8;
            break;
          }

          name = _context13.t1.value;

          if (!adder(name)) {
            _context13.next = 6;
            break;
          }

          _context13.next = 6;
          return name;

        case 6:
          _context13.next = 1;
          break;

        case 8:
          _iteratorNormalCompletion19 = true;
          _didIteratorError19 = false;
          _iteratorError19 = undefined;
          _context13.prev = 11;
          _iterator19 = Object.getOwnPropertyNames(obj)[Symbol.iterator]();

        case 13:
          if (_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done) {
            _context13.next = 21;
            break;
          }

          name = _step19.value;

          if (!adder(name)) {
            _context13.next = 18;
            break;
          }

          _context13.next = 18;
          return name;

        case 18:
          _iteratorNormalCompletion19 = true;
          _context13.next = 13;
          break;

        case 21:
          _context13.next = 27;
          break;

        case 23:
          _context13.prev = 23;
          _context13.t2 = _context13["catch"](11);
          _didIteratorError19 = true;
          _iteratorError19 = _context13.t2;

        case 27:
          _context13.prev = 27;
          _context13.prev = 28;

          if (!_iteratorNormalCompletion19 && _iterator19.return != null) {
            _iterator19.return();
          }

        case 30:
          _context13.prev = 30;

          if (!_didIteratorError19) {
            _context13.next = 33;
            break;
          }

          throw _iteratorError19;

        case 33:
          return _context13.finish(30);

        case 34:
          return _context13.finish(27);

        case 35:
          if (!recursive) {
            _context13.next = 87;
            break;
          }

          _iteratorNormalCompletion20 = true;
          _didIteratorError20 = false;
          _iteratorError20 = undefined;
          _context13.prev = 39;
          _iterator20 = Util.getPrototypeChain(obj)[Symbol.iterator]();

        case 41:
          if (_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done) {
            _context13.next = 73;
            break;
          }

          proto = _step20.value;
          _iteratorNormalCompletion21 = true;
          _didIteratorError21 = false;
          _iteratorError21 = undefined;
          _context13.prev = 46;
          _iterator21 = Object.getOwnPropertyNames(proto)[Symbol.iterator]();

        case 48:
          if (_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done) {
            _context13.next = 56;
            break;
          }

          name = _step21.value;

          if (!adder(name)) {
            _context13.next = 53;
            break;
          }

          _context13.next = 53;
          return name;

        case 53:
          _iteratorNormalCompletion21 = true;
          _context13.next = 48;
          break;

        case 56:
          _context13.next = 62;
          break;

        case 58:
          _context13.prev = 58;
          _context13.t3 = _context13["catch"](46);
          _didIteratorError21 = true;
          _iteratorError21 = _context13.t3;

        case 62:
          _context13.prev = 62;
          _context13.prev = 63;

          if (!_iteratorNormalCompletion21 && _iterator21.return != null) {
            _iterator21.return();
          }

        case 65:
          _context13.prev = 65;

          if (!_didIteratorError21) {
            _context13.next = 68;
            break;
          }

          throw _iteratorError21;

        case 68:
          return _context13.finish(65);

        case 69:
          return _context13.finish(62);

        case 70:
          _iteratorNormalCompletion20 = true;
          _context13.next = 41;
          break;

        case 73:
          _context13.next = 79;
          break;

        case 75:
          _context13.prev = 75;
          _context13.t4 = _context13["catch"](39);
          _didIteratorError20 = true;
          _iteratorError20 = _context13.t4;

        case 79:
          _context13.prev = 79;
          _context13.prev = 80;

          if (!_iteratorNormalCompletion20 && _iterator20.return != null) {
            _iterator20.return();
          }

        case 82:
          _context13.prev = 82;

          if (!_didIteratorError20) {
            _context13.next = 85;
            break;
          }

          throw _iteratorError20;

        case 85:
          return _context13.finish(82);

        case 86:
          return _context13.finish(79);

        case 87:
        case "end":
          return _context13.stop();
      }
    }, _callee10, null, [[11, 23, 27, 35], [28,, 30, 34], [39, 75, 79, 87], [46, 58, 62, 70], [63,, 65, 69], [80,, 82, 86]]);
  })();
};

Util.getMethodNames = function (obj, recursive = false) {
  return Util.filter(Util.members(obj, recursive), item => typeof obj[item] === "function" && item != "constructor");
};

Util.getMethods = function (obj, recursive = false) {
  const names = [...Util.getMethodNames(obj, recursive)];
  return names.reduce((ret, method) => _objectSpread({}, ret, {
    [method]: obj[method]
  }), {});
};

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
  let ret = Util.array();
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
  Error.stackTraceLimit = 20;

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

Util.getCaller = function (position = 2) {
  let stack = Util.getCallerStack(position + 1);
  const methods = ["getColumnNumber", "getEvalOrigin", "getFileName", "getFunction", "getFunctionName", "getLineNumber", "getMethodName", "getPosition", "getPromiseIndex", "getScriptNameOrSourceURL", "getThis", "getTypeName"];

  if (stack !== null && typeof stack === "object") {
    const frame = stack[0];
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
  let ret = [];
  let i = start;

  while (i++ < start + num) {
    try {
      let caller = Util.getCaller(i + 1);
      if (!caller) break;
      ret.push(caller);
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
    var _iteratorNormalCompletion22 = true;
    var _didIteratorError22 = false;
    var _iteratorError22 = undefined;

    try {
      for (var _iterator22 = tree.children[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
        let child = _step22.value;
        Util.flatTree(child, addOutput);
      }
    } catch (err) {
      _didIteratorError22 = true;
      _iteratorError22 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion22 && _iterator22.return != null) {
          _iterator22.return();
        }
      } finally {
        if (_didIteratorError22) {
          throw _iteratorError22;
        }
      }
    }
  }

  return ret;
};

Util.traverseTree = function (tree, fn, depth = 0, parent = null) {
  fn(tree, depth, parent);

  if (typeof tree == "object" && tree !== null && typeof tree.children == "object" && tree.children !== null && tree.children.length) {
    var _iteratorNormalCompletion23 = true;
    var _didIteratorError23 = false;
    var _iteratorError23 = undefined;

    try {
      for (var _iterator23 = tree.children[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
        let child = _step23.value;
        Util.traverseTree(child, fn, depth + 1, tree);
      }
    } catch (err) {
      _didIteratorError23 = true;
      _iteratorError23 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion23 && _iterator23.return != null) {
          _iterator23.return();
        }
      } finally {
        if (_didIteratorError23) {
          throw _iteratorError23;
        }
      }
    }
  }
};

Util.walkTree = function (node, pred, t, depth = 0, parent = null) {
  return _regenerator.default.mark(function _callee11() {
    var _i3, _arr, child;

    return _regenerator.default.wrap(function _callee11$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          if (!pred) pred = i => true;
          if (!t) t = function t(i) {
            i.depth = depth;
            return i;
          };

          if (!pred(node, depth, parent)) {
            _context14.next = 13;
            break;
          }

          _context14.next = 5;
          return t(node);

        case 5:
          if (!(typeof node == "object" && node !== null && typeof node.children == "object" && node.children.length)) {
            _context14.next = 13;
            break;
          }

          _i3 = 0, _arr = [...node.children];

        case 7:
          if (!(_i3 < _arr.length)) {
            _context14.next = 13;
            break;
          }

          child = _arr[_i3];
          return _context14.delegateYield(Util.walkTree(child, pred, t, depth + 1, node.parent_id), "t0", 10);

        case 10:
          _i3++;
          _context14.next = 7;
          break;

        case 13:
        case "end":
          return _context14.stop();
      }
    }, _callee11);
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
  return str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, "");
};

Util.proxy = (obj = {}, handler) => new Proxy(obj, _objectSpread({
  get(target, key, receiver) {
    console.log("Util.proxy getting ".concat(key, "!"));
    return Reflect.get(target, key, receiver);
  },

  set(target, key, value, receiver) {
    console.log("Util.proxy setting ".concat(key, "!"));
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

Util.curry = function curry(fn, arity) {
  return function curried() {
    if (arity == null) {
      arity = fn.length;
    }

    var args = [].slice.call(arguments);

    if (args.length >= arity) {
      return fn.apply(this, args);
    } else {
      return function () {
        return curried.apply(this, args.concat([].slice.call(arguments)));
      };
    }
  };
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
