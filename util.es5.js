"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Util;

require("core-js/modules/es6.set");

require("core-js/modules/es7.object.entries");

require("core-js/modules/es6.map");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

require("core-js/modules/es6.array.sort");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

const formatAnnotatedObject = function formatAnnotatedObject(subject, { indent = "  ", spacing = " ", separator = ",", newline = "\n", maxlen = 30, depth = 1 }) {
  const i = indent.repeat(Math.abs(1 - depth));
  let nl = newline != "" ? newline + i : spacing;
  const opts = {
    newline: depth >= 0 ? newline : "",
    depth: depth - 1
  };
  if(subject && subject.toSource !== undefined) return subject.toSource();
  if(subject instanceof Date) return "new Date('".concat(new Date().toISOString(), "')");
  if(typeof subject == "string") return "'".concat(subject, "'");

  if(subject != null && subject["y2"] !== undefined) {
    return "rect["
      .concat(spacing)
      .concat(subject["x"])
      .concat(separator)
      .concat(subject["y"], " | ")
      .concat(subject["x2"])
      .concat(separator)
      .concat(subject["y2"], " (")
      .concat(subject["w"], "x")
      .concat(subject["h"], ") ]");
  }

  if(typeof subject == "object" && "map" in subject && typeof subject.map == "function") {
    return "[".concat(nl).concat(subject.map(i => formatAnnotatedObject(i, opts)).join(separator + nl), "]");
  }

  if(typeof subject === "string" || subject instanceof String) {
    return "'".concat(subject, "'");
  }

  let longest = "";
  let r = [];

  for(let k in subject) {
    if(k.length > longest.length) longest = k;
    let s = "";

    if(typeof subject[k] === "symbol") {
      s = "Symbol";
    } else if(typeof subject[k] === "string" || subject[k] instanceof String) {
      s = "'".concat(subject[k], "'");
    } else if(typeof subject[k] === "function") {
      s = Util.fnName(s) || "function";
      s += "()";
    } else if(typeof subject[k] === "number" || typeof subject[k] === "boolean") {
      s = "".concat(subject[k]);
    } else if(subject[k] === null) {
      s = "null";
    } else if(subject[k] && subject[k].length !== undefined) {
      try {
        s = depth <= 0 ? "Array(".concat(subject[k].length, ")") : "[ ".concat(subject[k].map(item => formatAnnotatedObject(item, opts)).join(", "), " ]");
      } catch(err) {
        s = "[".concat(subject[k], "]");
      }
    } else if(subject[k] && subject[k].toSource !== undefined) {
      s = subject[k].toSource();
    } else if(opts.depth >= 0) {
      s = s.length > maxlen ? "[Object ".concat(Util.objName(subject[k]), "]") : formatAnnotatedObject(subject[k], opts);
    }

    r.push([k, s]);
  }

  let padding = x => (opts.newline != "" ? Util.pad(x, longest.length, spacing) : spacing);

  let j = separator + spacing;

  if(r.length > 6) {
    nl = opts.newline + i;
    j = separator + (opts.newline || spacing) + i;
  }

  let ret = "{"
    .concat(opts.newline)
    .concat(
      r
        .map(arr =>
          ""
            .concat(padding(arr[0]) + arr[0], ":")
            .concat(spacing)
            .concat(arr[1])
        )
        .join(j)
    )
    .concat(opts.newline, "}");
  return ret;
};

function Util() {}

Util.isDebug = function() {
  if(process !== undefined && process.env.NODE_ENV === "production") return false;
  return true;
};

Util.log = (function() {
  const log = Math.log;
  return function(n, base) {
    return log(n) / (base ? log(base) : 1);
  };
})();

Util.logBase = function(n, base) {
  return Math.log(n) / Math.log(base);
};

Util.generalLog = function(n, x) {
  return Math.log(x) / Math.log(n);
};

Util.toSource = function(arg) {
  if(typeof arg == "string") return "'".concat(arg, "'");

  if(arg && arg.x !== undefined && arg.y !== undefined) {
    return "[".concat(arg.x, ",").concat(arg.y, "]");
  }

  if(arg && arg.toSource) return arg.toSource();
  let cls = arg && arg.constructor && Util.fnName(arg.constructor);
  return String(arg);
};

Util.debug = function(message) {
  const args = [...arguments];
  let cache = Util.array();

  const removeCircular = function removeCircular(key, value) {
    if(typeof value === "object" && value !== null) {
      if(cache.indexOf(value) !== -1) return;
      cache.push(value);
    }

    return value;
  };

  const str = args
    .map(arg => (typeof arg === "object" ? JSON.stringify(arg, removeCircular) : arg))
    .join(" ")
    .replace(/\n/g, "");
  console.log.call(console, str);
};

Util.type = function({ type }) {
  return (type && String(type).split(/[ ()]/)[1]) || "";
};

Util.functionName = function(fn) {
  const matches = /function\s*([^(]*)\(.*/g.exec(String(fn));
  if(matches && matches[1]) return matches[1];
  return null;
};

Util.className = function({ constructor }) {
  return Util.functionName(constructor);
};

Util.unwrapComponent = function(c) {
  for(;;) {
    if(c.wrappedComponent) c = c.wrappedComponent;
    else if(c.WrappedComponent) c = c.WrappedComponent;
    else break;
  }

  return c;
};

Util.componentName = function(c) {
  for(;;) {
    if(c.displayName || c.name) {
      return (c.displayName || c.name).replace(/.*\(([A-Za-z0-9_]+).*/, "$1");
    } else if(c.wrappedComponent) c = c.wrappedComponent;
    else if(c.WrappedComponent) c = c.WrappedComponent;
    else break;
  }

  return Util.fnName(c);
};

Util.count = function(s, ch) {
  return (String(s).match(new RegExp(ch, "g")) || Util.array()).length;
};

Util.parseNum = function(str) {
  let num = parseFloat(str);
  if(isNaN(num)) num = 0;
  return num;
};

Util.minmax = function(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

Util.getExponential = function(num) {
  let str = typeof num == "string" ? num : num.toExponential();
  const matches = /e\+?(.*)$/.exec(str);
  return parseInt(matches[1]);
};

Util.getNumberParts = function(num) {
  let str = typeof num == "string" ? num : num.toExponential();
  const matches = /^(-?)(.*)e\+?(.*)$/.exec(str);
  const negative = matches[1] == "-";
  return {
    negative,
    mantissa: parseFloat(matches[2]),
    exponent: parseInt(matches[3])
  };
};

Util.pow2 = function(n) {
  return Math.pow(2, n);
};

Util.pow10 = function(n) {
  return n >= 0 ? Math.pow(10, n) : 1 / Math.pow(10, -n);
};

Util.bitValue = function(n) {
  return Util.pow2(n - 1);
};

Util.toBinary = function(num) {
  return parseInt(num).toString(2);
};

Util.toBits = function(num) {
  let a = Util.toBinary(num)
    .split("")
    .reverse();
  return Array.from(
    Object.assign({}, a, {
      length: 50
    }),
    bit => (bit ? 1 : 0)
  );
};

Util.getBit = function(v, n) {
  let s = v.toString(2);
  return n < s.length ? parseInt(s[s.length - n - 1]) : 0;
};

Util.isSet = function(v, n) {
  return Util.getBit(v, n) == 1;
};

Util.bitCount = function(n) {
  return Util.count(Util.toBinary(n), "1");
};

Util.toggleBit = function(num, bit) {
  const n = Number(num);
  return Util.isSet(n, bit) ? n - Util.pow2(bit) : n + Util.pow2(bit);
};

Util.setBit = function(num, bit) {
  const n = Number(num);
  return Util.isSet(n, bit) ? n : n + Util.pow2(bit);
};

Util.clearBit = function(num, bit) {
  const n = Number(num);
  return Util.isSet(n, bit) ? n - Util.pow2(bit) : n;
};

Util.range = function(start, end) {
  if(start > end) {
    let ret = [];

    while(start >= end) ret.push(start--);

    return ret;
  }

  const r = Array.from(
    {
      length: end - start + 1
    },
    (v, k) => k + start
  );
  return r;
};

Util.inspect = function(
  obj,
  opts = {
    indent: "  ",
    newline: "\n",
    depth: 2,
    spacing: " "
  }
) {
  return formatAnnotatedObject(obj, opts);
};

Util.bitArrayToNumbers = function(arr) {
  let numbers = Util.array();

  for(let i = 0; i < arr.length; i++) {
    const number = i + 1;
    if(arr[i]) numbers.push(number);
  }

  return numbers;
};

Util.bitsToNumbers = function(bits) {
  let a = Util.toBinary(bits).split("");
  let r = Util.array();
  a.forEach((val, key, arr) => val == "1" && r.unshift(a.length - key));
  return r;
};

Util.shuffle = function(arr, rnd = Util.rng) {
  arr.sort((a, b) => 0.5 - rnd());
  return arr;
};

Util.sortNum = function(arr) {
  arr.sort((a, b) => a - b);
  return arr;
};

Util.draw = function(arr, n, rnd = Util.rng) {
  const r = Util.shuffle(arr, rnd).splice(0, n);
  return r;
};

Util.is = {
  on: val => val == "on" || val === "true" || val === true,
  off: val => val == "off" || val === "false" || val === false,
  true: val => val === "true" || val === true,
  false: val => val === "false" || val === false
};

Util.onoff = function(val) {
  if(Util.is.on(val)) return true;
  if(Util.is.off(val)) return false;
  return undefined;
};

Util.numbersToBits = function(arr) {
  return arr.reduce((bits, num) => bits + Util.bitValue(num), 0);
};

Util.randomNumbers = function([start, end], draws) {
  const r = Util.sortNum(Util.draw(Util.range(start, end), draws));
  return r;
};

Util.randomBits = function(r = [1, 50], n = 5) {
  return Util.numbersToBits(Util.randomNumbers(r, n));
};

Util.pad = function(s, n, char = " ") {
  return s.length < n ? char.repeat(n - s.length) : "";
};

Util.abbreviate = function(str, max, suffix = "...") {
  if(str.length > max) {
    return str.substring(0, max - suffix.length) + suffix;
  }

  return str;
};

Util.trim = function(str, charset) {
  const r1 = RegExp("^[".concat(charset, "]*"));
  const r2 = RegExp("[".concat(charset, "]*$"));
  return str.replace(r1, "").replace(r2, "");
};

Util.define = (obj, key, value, enumerable = false) =>
  obj[key] === undefined &&
  Object.defineProperty(obj, key, {
    enumerable,
    configurable: false,
    writable: false,
    value
  });

Util.defineGetter = (obj, key, get, enumerable = false) =>
  obj[key] === undefined &&
  Object.defineProperty(obj, key, {
    enumerable,
    configurable: false,
    get
  });

Util.defineGetterSetter = (obj, key, get, set, enumerable = false) =>
  obj[key] === undefined &&
  Object.defineProperty(obj, key, {
    get,
    set,
    enumerable
  });

Util.extendArray = function(arr = Array.prototype) {
  Util.define(arr, "match", function(pred) {
    return Util.match(this, pred);
  });
  Util.define(arr, "clear", function() {
    this.splice(0, this, length);
    return this;
  });
  Util.define(arr, "unique", function() {
    return this.filter((item, i, a) => a.indexOf(item) == i);
  });
  Util.defineGetterSetter(
    arr,
    "tail",
    function() {
      return Util.tail(this);
    },
    function(value) {
      if(this.length == 0) this.push(value);
      else this[this.length - 1] = value;
    }
  );
};

Util.adapter = function(obj, getLength = obj => obj.length, getKey = (obj, index) => obj.key(index), getItem = (obj, key) => obj[key], setItem = (obj, index, value) => (obj[index] = value)) {
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
          while(1)
            switch ((_context.prev = _context.next)) {
              case 0:
                length = getLength(obj);
                i = 0;

              case 2:
                if(!(i < length)) {
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

        return _regenerator.default.wrap(
          function _callee2$(_context2) {
            while(1)
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _iteratorError = undefined;
                  _context2.prev = 3;
                  _iterator = _this.keys()[Symbol.iterator]();

                case 5:
                  if((_iteratorNormalCompletion = (_step = _iterator.next()).done)) {
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

                  if(!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                  }

                case 21:
                  _context2.prev = 21;

                  if(!_didIteratorError) {
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
          },
          _callee2,
          null,
          [
            [3, 14, 18, 26],
            [19, , 21, 25]
          ]
        );
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

Util.adapter.localStorage = function(s) {
  if(!s && global.window) s = window.localStorage;
  return Util.adapter(
    s,
    l => l.length,
    (l, i) => l.key(i),
    (l, key) => JSON.parse(l.getItem(key)),
    (l, key, v) => l.setItem(key, JSON.stringify(v))
  );
};

Util.array = function(enumerable = []) {
  let a = enumerable instanceof Array ? enumerable : [...enumerable];

  try {
    if(a.match === undefined) Util.extendArray();
    if(a.match === undefined) Util.extendArray(a);
  } catch(err) {}

  return a;
};

Util.map = function(hash = {}) {
  let m = hash[Symbol.iterator] !== undefined ? hash : new Map(Object.entries(hash));
  if(m instanceof Array) m[Symbol.iterator] = m.entries;

  try {
    if(m.toObject === undefined) Util.extendMap(m);
  } catch(err) {}

  return m;
};

Util.extendMap = function(map) {
  if(map.entries === undefined) {
    map.entries = _regenerator.default.mark(function iterator() {
      var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, entry;

      return _regenerator.default.wrap(
        function iterator$(_context3) {
          while(1)
            switch ((_context3.prev = _context3.next)) {
              case 0:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context3.prev = 3;
                _iterator2 = map[Symbol.iterator]();

              case 5:
                if((_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done)) {
                  _context3.next = 22;
                  break;
                }

                entry = _step2.value;

                if(!(entry.name !== undefined && entry.value !== undefined)) {
                  _context3.next = 12;
                  break;
                }

                _context3.next = 10;
                return [entry.name, entry.value];

              case 10:
                _context3.next = 19;
                break;

              case 12:
                if(!(entry[0] !== undefined && entry[1] !== undefined)) {
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

                if(!_iteratorNormalCompletion2 && _iterator2.return != null) {
                  _iterator2.return();
                }

              case 31:
                _context3.prev = 31;

                if(!_didIteratorError2) {
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
        },
        iterator,
        null,
        [
          [3, 24, 28, 36],
          [29, , 31, 35]
        ]
      );
    });
  }

  map.toObject = function() {
    return Object.fromEntries(this.entries());
  };

  map.match = function(...args) {
    return Util.match.apply(this, args);
  };
};

Util.objectFrom = function(any) {
  if("toJS" in any) any = any.toJS();
  if("entries" in any) return Object.fromEntries(any.entries());
  return Object.assign({}, any);
};

Util.tail = function(arr) {
  return arr && arr.length > 0 ? arr[arr.legth - 1] : null;
};

Util.splice = function(str, index, delcount, insert) {
  const chars = str.split("");
  Array.prototype.splice.apply(chars, arguments);
  return chars.join("");
};

Util.keyOf = function(obj, prop) {
  const keys = Object.keys(obj);

  for(let k in keys) {
    if(obj[k] === prop) return k;
  }

  return undefined;
};

Util.rotateRight = function(arr, n) {
  arr.unshift(...arr.splice(n, arr.length));
  return arr;
};

Util.repeat = function(n, what) {
  let ret = [];

  while(n-- > 0) ret.push(what);

  return ret;
};

Util.arrayDim = function(dimensions, init) {
  let args = [...dimensions];
  args.reverse();
  let ret = init;

  while(args.length > 0) {
    const n = args.shift();
    ret = Util.repeat(n, ret);
  }

  return ret;
};

Util.flatten = function(arr) {
  let ret = [];

  for(let i = 0; i < arr.length; i++) {
    ret = [...ret, ...arr[i]];
  }

  return ret;
};

Util.chunkArray = function(myArray, chunk_size) {
  let index = 0;
  const arrayLength = myArray.length;
  const tempArray = [];

  for(index = 0; index < arrayLength; index += chunk_size) {
    myChunk = myArray.slice(index, index + chunk_size);
    tempArray.push(myChunk);
  }

  return tempArray;
};

Util.chances = function(numbers, matches) {
  const f = Util.factorial;
  return f(numbers) / (f(matches) * f(numbers - matches));
};

Util.sum = function(arr) {
  return arr.reduce((acc, n) => acc + n, 0);
};

Util.fnName = function(f, parent) {
  if(f !== undefined && f.name !== undefined) return f.name;
  const s = f.toSource ? f.toSource() : "".concat(f);
  const matches = /([A-Za-z_][0-9A-Za-z_]*)\w*[(\]]/.exec(s);
  if(matches) return matches[1];

  if(parent !== undefined) {
    for(let key in parent) {
      if(parent[key] === f) return key;
    }
  }

  return undefined;
};

Util.keys = function(obj) {
  let r = Util.array();

  for(let i in obj) r.push(i);

  return r;
};

Util.objName = function(o) {
  if(o === undefined || o == null) return "".concat(o);
  if(typeof o === "function" || o instanceof Function) return Util.fnName(o);
  if(o.constructor) return Util.fnName(o.constructor);
  const s = "".concat(o.type);
  return s;
};

Util.findKey = function(obj, value) {
  for(let k in obj) {
    if(obj[k] === value) return k;
  }

  return null;
};

Util.find = function(arr, value, prop = "id", acc = Util.array()) {
  let pred;
  if(typeof value == "function") pred = value;
  else if(prop && prop.length !== undefined) {
    pred = function pred(obj) {
      if(obj[prop] == value) return true;
      return false;
    };
  } else pred = obj => obj[prop] == value;
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for(var _iterator3 = arr[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      let v = _step3.value;
      {
        if(pred(v)) return v;
      }
    }
  } catch(err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if(!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if(_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return null;
};

Util.match = function(arg, pred) {
  let match = pred;

  if(pred instanceof RegExp) {
    const re = pred;

    match = (val, key) => (val && val.tagName !== undefined && re.test(val.tagName)) || (typeof key === "string" && re.test(key)) || (typeof val === "string" && re.test(val));
  }

  if(Util.isArray(arg)) {
    if(!(arg instanceof Array)) arg = [...arg];
    return arg.reduce((acc, val, key) => {
      if(match(val, key, arg)) acc.push(val);
      return acc;
    }, Util.array());
  } else if(Util.isMap(arg)) {
    return [...arg.keys()].reduce((acc, key) => (match(arg.get(key), key, arg) ? acc.set(key, arg.get(key)) : acc), new Map());
  } else {
    let i = 0;
    let ret = [];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for(var _iterator4 = arg[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        let item = _step4.value;
        if(match(item, i, arg)) ret.push(item);
      }
    } catch(err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if(!_iteratorNormalCompletion4 && _iterator4.return != null) {
          _iterator4.return();
        }
      } finally {
        if(_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    return ret;
  }
};

Util.toHash = function(map, keyTransform = k => Util.camelize(k)) {
  let ret = {};
  map.forEach(key => {
    ret[keyTransform(key)] = map[key];
  });
  return ret;
};

Util.indexOf = function(obj, prop) {
  for(let key in obj) {
    if(obj[key] === prop) return key;
  }

  return undefined;
};

Util.toString = function() {};

Util.dump = function(name, props) {
  const args = [name];

  for(let key in props) {
    args.push("\n\t".concat(key, ": "));
    args.push(props[key]);
  }

  if("window" in global !== false) {
    if(window.console !== undefined) console.log(...args);
  }
};

Util.ucfirst = function(str) {
  if(typeof str != "string") str = String(str);
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

Util.lcfirst = function(str) {
  return str.substring(0, 1).toLowerCase() + str.substring(1);
};

Util.camelize = (text, sep = "") =>
  text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
    if(p2) return sep + p2.toUpperCase();
    return p1.toLowerCase();
  });

Util.decamelize = function(str, separator = "-") {
  /[A-Z]/.test(str)
    ? str
        .replace(/([a-z\d])([A-Z])/g, "$1".concat(separator, "$2"))
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1".concat(separator, "$2"))
        .toLowerCase()
    : str;
};

Util.isEmail = function(v) {
  return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(v);
};

Util.isString = function(v) {
  return Object.prototype.toString.call(v) == "[object String]";
};

Util.isObject = function(v) {
  return Object.prototype.toString.call(v) == "[object Object]";
};

Util.isEmptyString = function(v) {
  if(this.isString(v) && !v) {
    return true;
  }

  if(this.isString(v) && !v.length) {
    return true;
  }

  return false;
};

Util.isEmpty = function(v) {
  if(typeof v == "object" && !!v && v.constructor == Object && Object.keys(v).length == 0) return true;
  if(!v || v === null) return true;
  if(typeof v == "object" && v.length !== undefined && v.length === 0) return true;
  return false;
};

Util.notEmpty = function(v) {
  return !Util.isEmpty(v);
};

Util.hasProps = function(obj) {
  const keys = Object.keys(obj);
  return keys.length > 0;
};

Util.validatePassword = function(value) {
  return value.length > 7 && /^(?![\d]+$)(?![a-zA-Z]+$)(?![!#$%^&*]+$)[\da-zA-Z!#$ %^&*]/.test(value) && !/\s/.test(value);
};

Util.deepClone = function(data) {
  return JSON.parse(JSON.stringify(data));
};

Util.findVal = function(object, propName, maxDepth = 10) {
  if(maxDepth <= 0) return null;

  for(let key in object) {
    if(key === propName) {
      console.log(propName);
      console.log(object[key]);
      return object[key];
    } else {
      let value = Util.findVal(object[key], propName, maxDepth - 1);
      if(value !== undefined) return value;
    }
  }
};

Util.deepCloneObservable = function(data) {
  let o;
  const t = typeof data;

  if(t === "object") {
    o = data.length ? Util.array() : {};
  } else {
    return data;
  }

  if(t === "object") {
    if(data.length) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for(var _iterator5 = data[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          const value = _step5.value;
          o.push(this.deepCloneObservable(value));
        }
      } catch(err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if(!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if(_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return o;
    } else {
      for(const i in data) {
        o[i] = this.deepCloneObservable(data[i]);
      }

      return o;
    }
  }
};

Util.toArray = function(observableArray) {
  return observableArray.slice();
};

Util.arryToTree = function(data, id, pId, appId) {
  const arr = Util.array();
  data.map((e, i) => {
    e[pId] === appId && arr.push(e);
  });
  const res = this.to3wei(arr, data, id, pId);
  return res;
};

Util.to3wei = function(a, old, id, pId) {
  a.map((e, i) => {
    a[i].children = Util.array();
    old.map((se, si) => {
      if(se[pId] === a[i][id]) {
        a[i].children = [...a[i].children, se];
        this.to3wei(a[i].children, old, id, pId);
      }
    });

    if(!a[i].children.length) {
      delete a[i].children;
    }
  });
  return a;
};

Util.arrExchangePos = function(arr, i, j) {
  arr[i] = arr.splice(j, 1, arr[i])[0];
};

Util.arrRemove = function(arr, i) {
  const index = arr.indexOf(i);
  if(index > -1) arr.splice(index, 1);
};

Util.removeEqual = function(a, b) {
  let c = {};

  for(let key in Object.assign({}, a)) {
    if(b[key] === a[key]) continue;
    c[key] = a[key];
  }

  return c;
};

Util.logOutClearStorage = function() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userLoginPermission");
  localStorage.removeItem("ssoToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("userGroupList");
  localStorage.removeItem("gameAuthList");
};

Util.getCookie = function(cookie, name) {
  let arr = cookie.match(new RegExp("(^| )".concat(name, "=([^;]*)(;|$)")));
  if(arr != null) return unescape(arr[2]);
  return null;
};

Util.parseCookie = function(c = document.cookie) {
  if(!(typeof c == "string" && c && c.length > 0)) return {};
  let key = "";
  let value = "";
  const ws = " \r\n\t";
  let i = 0;
  let ret = {};

  const skip = (pred = char => ws.indexOf(char) != -1) => {
    let start = i;

    while(i < c.length && pred(c[i])) i++;

    let r = c.substring(start, i);
    return r;
  };

  do {
    let str = skip(char => char != "=" && char != ";");

    if(c[i] == "=" && str != "path") {
      i++;
      key = str;
      value = skip(char => char != ";");
    } else {
      i++;
      skip();
    }

    if(key != "") ret[key] = value;
    skip();
  } while(i < c.length);

  return ret;
};

Util.encodeCookie = c =>
  Object.entries(c)
    .map(([key, value]) => "".concat(key, "=").concat(encodeURIComponent(value)))
    .join("; ");

Util.setCookies = c =>
  Object.entries(c).forEach(([key, value]) => {
    document.cookie = "".concat(key, "=").concat(value);
    console.log("Setting cookie[".concat(key, "] = ").concat(value));
  });

Util.clearCookies = function(c) {
  return Util.setCookies(
    Object.keys(Util.parseCookie(c)).reduce(
      (acc, name) =>
        Object.assign(acc, {
          [name]: "; max-age=0; expires=".concat(new Date().toUTCString())
        }),
      {}
    )
  );
};

Util.deleteCookie = function(name) {
  if(global.window) document.cookie = "".concat(name, "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;");
};

Util.accAdd = function(arg1, arg2) {
  let r1, r2, m;

  try {
    r1 = arg1.toString().split(".")[1].length;
  } catch(e) {
    r1 = 0;
  }

  try {
    r2 = arg2.toString().split(".")[1].length;
  } catch(e) {
    r2 = 0;
  }

  m = Math.pow(10, Math.max(r1, r2));
  return (arg1 * m + arg2 * m) / m;
};

Util.Subtr = function(arg1, arg2) {
  let r1, r2, m, n;

  try {
    r1 = arg1.toString().split(".")[1].length;
  } catch(e) {
    r1 = 0;
  }

  try {
    r2 = arg2.toString().split(".")[1].length;
  } catch(e) {
    r2 = 0;
  }

  m = Math.pow(10, Math.max(r1, r2));
  n = r1 >= r2 ? r1 : r2;
  return (arg1 * m - arg2 * m) / m;
};

Util.accDiv = function(arg1, arg2) {
  let t1 = 0;
  let t2 = 0;
  let r1;
  let r2;

  try {
    t1 = arg1.toString().split(".")[1].length;
  } catch(e) {}

  try {
    t2 = arg2.toString().split(".")[1].length;
  } catch(e) {}

  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));
  return (r1 / r2) * Math.pow(10, t2 - t1);
};

Util.accMul = function(arg1, arg2) {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();

  try {
    m += s1.split(".")[1].length;
  } catch(e) {}

  try {
    m += s2.split(".")[1].length;
  } catch(e) {}

  return (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) / Math.pow(10, m);
};

Util.dateFormatter = function(date, formate) {
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
  return formate
    .replace(/Y+/, "".concat(year).slice(-formate.match(/Y/g).length))
    .replace(/M+/, month)
    .replace(/D+/, day)
    .replace(/h+/, hour)
    .replace(/m+/, minute)
    .replace(/s+/, second);
};

Util.numberFormatter = function(numStr) {
  let numSplit = numStr.split(".");
  return numSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",").concat(".".concat(numSplit[1]));
};

Util.searchObject = function(object, matchCallback, currentPath, result, searched) {
  currentPath = currentPath || "";
  result = result || Util.array();
  searched = searched || Util.array();

  if(searched.indexOf(object) !== -1 && object === Object(object)) {
    return;
  }

  searched.push(object);

  if(matchCallback(object)) {
    result.push({
      path: currentPath,
      value: object
    });
  }

  try {
    if(object === Object(object)) {
      for(const property in object) {
        const desc = Object.getOwnPropertyDescriptor(object, property);

        if(property.indexOf("$") !== 0 && typeof object[property] !== "function" && !desc.get && !desc.set) {
          if(typeof object[property] === "object") {
            try {
              JSON.stringify(object[property]);
            } catch(err) {
              continue;
            }
          }

          Util.searchObject(object[property], matchCallback, "".concat(currentPath, ".").concat(property), result, searched);
        }
      }
    }
  } catch(e) {
    console.log(object);
  }

  return result;
};

Util.getURL = function(req = {}) {
  let proto = process.env.NODE_ENV === "production" ? "https" : "http";
  let port = process.env.PORT ? parseInt(process.env.PORT) : process.env.NODE_ENV === "production" ? 443 : 8080;
  let host = global.ip || global.host || "localhost";

  if(req && req.headers && req.headers.host !== undefined) {
    host = req.headers.host.replace(/:.*/, "");
  } else if(process.env.HOST !== undefined) host = process.env.HOST;

  if(global.window !== undefined && window.location !== undefined) return window.location.href;
  if(req.url !== undefined) return req.url;
  if(global.process !== undefined && global.process.url !== undefined) return global.process.url;
  const url = ""
    .concat(proto, "://")
    .concat(host, ":")
    .concat(port);
  console.log("getURL process ", {
    url
  });
  return url;
};

Util.parseQuery = function(url = Util.getURL()) {
  let startIndex;
  let query = {};

  try {
    if((startIndex = url.indexOf("?")) != -1) url = url.substring(startIndex);
    const args = [...url.matchAll(/[?&]([^=&#]+)=?([^&#]*)/g)];

    if(args) {
      for(let i = 0; i < args.length; i++) {
        const k = args[i][1];
        query[k] = decodeURIComponent(args[i][2]);
      }
    }

    return query;
  } catch(err) {
    return undefined;
  }
};

Util.encodeQuery = function(data) {
  const ret = Util.array();

  for(let d in data) ret.push("".concat(encodeURIComponent(d), "=").concat(encodeURIComponent(data[d])));

  return ret.join("&");
};

Util.parseURL = function(href = this.getURL()) {
  const matches = /^([^:]*):\/\/([^/:]*)(:[0-9]*)?(\/?.*)/.exec(href);
  if(!matches) return null;
  const argstr = matches[4].indexOf("?") != -1 ? matches[4].replace(/^[^?]*\?/, "") : "";
  const pmatches =
    typeof argstr === "string"
      ? argstr
          .split(/&/g)
          .map(part => {
            let a = part.split(/=/);
            let b = a.shift();
            return [b, a.join("=")];
          })
          .filter(([k, v]) => !(k.length == 0 && v.length == 0))
      : Util.array();
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
      if(typeof override === "object") Object.assign(this, override);
      const qstr = Util.encodeQuery(this.query);
      return (this.protocol ? "".concat(this.protocol, "://") : "") + (this.host ? this.host : "") + (this.port ? ":".concat(this.port) : "") + "".concat(this.location) + (qstr != "" ? "?".concat(qstr) : "");
    }
  };
};

Util.makeURL = function() {
  let args = [...arguments];
  let href = typeof args[0] == "string" ? args.shift() : Util.getURL();
  let url = Util.parseURL(href);
  let obj = typeof args[0] == "object" ? args.shift() : {};
  Object.assign(url, obj);
  return url.href();
};

Util.numberFromURL = function(url, fn) {
  const obj = typeof url === "object" ? url : this.parseURL(url);
  const nr_match = RegExp(".*[^0-9]([0-9]+)$").exec(url.location);
  const nr_arg = nr_match ? nr_match[1] : undefined;
  const nr = nr_arg && parseInt(nr_arg);
  if(!isNaN(nr) && typeof fn === "function") fn(nr);
  return nr;
};

Util.isBrowser = function() {
  return !!(global.window && global.window.document);
};

Util.isServer = function() {
  return !Util.isBrowser();
};

Util.isMobile = function() {
  return true;
};

Util.unique = function(arr) {
  return Array.from(new Set(arr));
};

Util.distinct = function(arr) {
  return Array.prototype.filter.call(arr, function(value, index, me) {
    return me.indexOf(value) === index;
  });
};

Util.rangeMinMax = function(arr, field) {
  const numbers = [...arr].map(obj => obj[field]);
  return [Math.min(...numbers), Math.max(...numbers)];
};

Util.mergeLists = function(arr1, arr2, key = "id") {
  let hash = arr1.reduce(
    (acc, it) =>
      Object.assign(
        {
          [it[key]]: it
        },
        acc
      ),
    {}
  );
  hash = arr2.reduce(
    (acc, it) =>
      Object.assign(
        {
          [it[key]]: it
        },
        acc
      ),
    {}
  );
  let ret = Util.array();

  for(let k in hash) {
    if(hash[k][key]) ret.push(hash[k]);
  }

  return ret;
};

Util.throttle = function(fn, wait) {
  let time = Date.now();
  return function() {
    if(time + wait - Date.now() < 0) {
      fn();
      time = Date.now();
    }
  };
};

Util.foreach = function(obj, fn) {
  if(obj instanceof Array) obj.forEach(fn);
  else {
    for(let key in obj) {
      fn(obj[key], key, obj);
    }
  }
};

Util.all = function(obj, pred) {
  for(let k in obj) if(!pred(obj[k])) return false;

  return true;
};

Util.filter = function(obj, fn) {
  let ret = {};

  for(let key in obj) {
    if(fn(obj[key], key, obj)) ret[key] = obj[key];
  }

  return ret;
};

Util.reduce = function(obj, fn, accu) {
  for(let key in obj) accu = fn(accu, obj[key], key, obj);

  return accu;
};

const map = Util.map;

Util.map = function(obj, fn) {
  if(!fn) return map(obj);
  let ret = {};

  for(let key in obj) {
    if(obj.hasOwnProperty(key)) {
      let item = fn(key, obj[key], obj);
      if(item instanceof Array && item.length == 2) ret[item[0]] = item[1];
      else {
        if(!(ret instanceof Array)) ret = [];
        ret.push(item);
      }
    }
  }

  return ret;
};

Util.entriesToObj = function(arr) {
  return [...arr].reduce((acc, item) => {
    const k = item[0];
    const v = item[1];
    acc[k] = v;
    return acc;
  }, {});
};

Util.isDate = function(d) {
  return d instanceof Date || (typeof d == "string" && /[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/.test(d));
};

Util.parseDate = function(d) {
  if(Util.isDate(d)) {
    d = new Date(d);
  }

  return d;
};

Util.isoDate = function(date) {
  try {
    const minOffset = date.getTimezoneOffset();
    const milliseconds = date.valueOf() - minOffset * 60 * 1000;
    date = new Date(milliseconds);
    return date.toISOString().replace(/T.*/, "");
  } catch(err) {}

  return null;
};

Util.toUnixTime = function(dateObj, utc = false) {
  if(!(dateObj instanceof Date)) dateObj = new Date(dateObj);
  let epoch = Math.floor(dateObj.getTime() / 1000);
  if(utc) epoch += dateObj.getTimezoneOffset() * 60;
  return epoch;
};

Util.unixTime = function(utc = false) {
  return Util.toUnixTime(new Date(), utc);
};

Util.fromUnixTime = function(epoch, utc = false) {
  let t = parseInt(epoch);
  let d = new Date(0);
  utc ? d.setUTCSeconds(t) : d.setSeconds(t);
  return d;
};

Util.formatTime = function(date = new Date(), format = "HH:MM:SS") {
  let n;
  let out = "";

  for(let i = 0; i < format.length; i += n) {
    n = 1;

    while(format[i] == format[i + n]) n++;

    const fmt = format.substring(i, i + n);
    let num = fmt;
    if(fmt.startsWith("H")) num = "0".concat(date.getHours()).substring(0, n);
    else if(fmt.startsWith("M")) num = "0".concat(date.getMinutes()).substring(0, n);
    else if(fmt.startsWith("S")) num = "0".concat(date.getSeconds()).substring(0, n);
    out += num;
  }

  return out;
};

Util.leapYear = function(year) {
  if(year % 400 == 0) return true;
  if(year % 100 == 0) return false;
  if(year % 4 == 0) return true;
  return false;
};

Util.timeSpan = function(s) {
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
  ret = ""
    .concat("0".concat(hours).substring(0, 2), ":")
    .concat("0".concat(minutes).substring(0, 2), ":")
    .concat("0".concat(seconds).substring(0, 2));
  if(days) ret = "".concat(days, " days ").concat(ret);
  if(weeks) ret = "".concat(weeks, " weeks ").concat(ret);
  return ret;
};

Util.rng = Math.random;

Util.randFloat = function(min, max, rnd = Util.rng) {
  return rnd() * (max - min) + min;
};

Util.randInt = function(min, max = 16777215, rnd = Util.rng) {
  return Math.round(Util.randFloat(min, max, rnd));
};

Util.hex = function(num, numDigits = 0) {
  let n = typeof num == "number" ? num : parseInt(num);
  return ("0".repeat(numDigits) + n.toString(16)).slice(-numDigits);
};

Util.roundTo = function(value, prec) {
  const digits = Math.ceil(-Math.log10(prec));
  return +(Math.round(value / prec) * prec).toFixed(digits);
};

Util.base64 = {
  encode: utf8 => {
    if(global.window) return window.btoa(unescape(encodeURIComponent(utf8)));
    return Buffer.from(utf8).toString("base64");
  },
  decode: base64 => decodeURIComponent(escape(window.atob(base64)))
};

Util.formatRecord = function(obj) {
  let ret = {};

  for(let key in obj) {
    let val = obj[key];
    if(val instanceof Array) val = val.map(item => Util.formatRecord(item));
    else if(/^-?[0-9]+$/.test(val)) val = parseInt(val);
    else if(/^-?[.0-9]+$/.test(val)) val = parseFloat(val);
    else if(val == "true" || val == "false") val = Boolean(val);
    ret[key] = val;
  }

  return ret;
};

Util.isArray = function(obj) {
  return (obj && obj.length !== undefined) || obj instanceof Array;
};

Util.isMap = function(obj) {
  return (obj && obj.get !== undefined && obj.keys !== undefined) || obj instanceof Map;
};

Util.effectiveDeviceWidth = function() {
  let deviceWidth = window.orientation == 0 ? window.screen.width : window.screen.height;

  if(navigator.userAgent.indexOf("Android") >= 0 && window.devicePixelRatio) {
    deviceWidth = deviceWidth / window.devicePixelRatio;
  }

  return deviceWidth;
};

Util.getFormFields = function(initialState) {
  return Util.mergeObjects([
    initialState,
    [...document.forms].reduce(
      (acc, { elements }) =>
        [...elements].reduce(
          (acc2, { name, value }) =>
            name == "" || value == undefined || value == "undefined"
              ? acc2
              : Object.assign(acc2, {
                  [name]: value
                }),
          acc
        ),
      {}
    )
  ]);
};

Util.mergeObjects = function(objArr, predicate = (dst, src, key) => (src[key] == "" ? undefined : src[key])) {
  let args = objArr;
  let obj = {};

  for(let i = 0; i < args.length; i++) {
    for(let key in args[i]) {
      const newVal = predicate(obj, args[i], key);
      if(newVal != undefined) obj[key] = newVal;
    }
  }

  return obj;
};

Util.getUserAgent = function(headers = req.headers) {
  const agent = useragent.parse(headers["user-agent"]);
  return agent;
};

Util.factor = function(start, end) {
  let f = 1;

  for(let i = start; i <= end; i++) {
    f = f * i;
  }

  return f;
};

Util.factorial = function(n) {
  return Util.factor(1, n);
};

Util.lottoChances = function(numbers, draws) {
  const f = Util.factorial;
  return f(numbers) / (f(numbers - draws) * f(draws));
};

Util.increment = function(obj, key) {
  if(obj[key] >= 1) obj[key] == 0;
  obj[key]++;
  return obj[key];
};

Util.counter = function() {
  this.i = 0;

  this.incr = function() {
    this.i++;
    return this.i;
  };
};

Util.filterKeys = function(obj) {
  let args = [...arguments];
  obj = args.shift();
  let ret = {};
  let pred = typeof args[0] == "function" ? args[0] : key => args.indexOf(key) != -1;

  for(let key in obj) {
    if(pred(key)) ret[key] = obj[key];
  }

  return ret;
};

Util.filterOutKeys = function(obj, arr) {
  return Util.filterKeys(obj, key => arr.indexOf(key) == -1);
};

Util.numbersConvert = function(str) {
  return str
    .split("")
    .map((ch, i) => (/[ :,./]/.test(ch) ? ch : String.fromCharCode((str.charCodeAt(i) & 0x0f) + 0x30)))
    .join("");
};

Util.traverse = function(obj, fn) {
  Util.foreach(obj, (v, k, a) => {
    fn(v, k, a);
    if(typeof v === "object") Util.traverse(v, fn);
  });
};

Util.pushUnique = function(arr) {
  let args = [...arguments];
  arr = args.shift();
  args.forEach(item => {
    if(arr.indexOf(item) == -1) arr.push(item);
  });
  return arr;
};

Util.members = function(obj) {
  let names = Util.array();

  for(let name in obj) names.push(name);

  const adder = function adder(name) {
    if(names.indexOf(name) == -1) names.push(name);
  };

  Object.getOwnPropertyNames(obj).forEach(adder);
  Util.getPrototypeChain(obj).forEach(proto => Object.getOwnPropertyNames(proto).forEach(adder));
  return names;
};

Util.getMethodNames = function(obj) {
  return Util.array(Util.members(obj).filter(item => typeof obj[item] === "function" && item != "constructor"));
};

Util.getMethods = function(obj) {
  const names = Util.getMethodNames(obj);
  return names.reduce(
    (ret, method) =>
      Object.assign(ret, {
        [method]: obj[method]
      }),
    {}
  );
};

Util.bindMethods = function(methods, obj) {
  for(let name in methods) {
    methods[name] = methods[name].bind(obj);
  }

  return methods;
};

Util.bindMethodsTo = function(dest, obj, methods) {
  for(let name in methods) {
    dest[name] = methods[name].bind(obj);
  }

  return dest;
};

Util.getPrototypeChain = function(obj, fn = p => p) {
  let ret = Util.array();
  let proto;

  while((proto = Object.getPrototypeOf(obj))) {
    if(proto === Object.prototype) break;
    ret.push(fn(proto));
    obj = proto;
  }

  return ret;
};

Util.weakAssign = function(obj) {
  let args = [...arguments];
  obj = args.shift();
  args.forEach(other => {
    for(let key in other) {
      if(obj[key] === undefined) obj[key] = other[key];
    }
  });
  return obj;
};

Util.getCallerStack = function(position = 2) {
  if(position >= Error.stackTraceLimit) {
    throw new TypeError("getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `".concat(position, "` and Error.stackTraceLimit was: `").concat(Error.stackTraceLimit, "`"));
  }

  const oldPrepareStackTrace = Error.prepareStackTrace;

  Error.prepareStackTrace = (_, stack) => stack;

  const stack = new Error().stack;
  Error.prepareStackTrace = oldPrepareStackTrace;
  return stack !== null && typeof stack === "object" ? stack.slice(position) : null;
};

Util.getCallerFile = function(position = 2) {
  let stack = Util.getCallerStack();

  if(stack !== null && typeof stack === "object") {
    const frame = stack[position];
    return frame ? "".concat(frame.getFileName(), ":").concat(frame.getLineNumber()) : undefined;
  }
};

Util.getCallerFunction = function(position = 2) {
  let stack = Util.getCallerStack(position + 1);

  if(stack !== null && typeof stack === "object") {
    const frame = stack[0];
    return frame ? frame.getFunction() : undefined;
  }
};

Util.getCallerFunctionName = function(position = 2) {
  let stack = Util.getCallerStack(position + 1);

  if(stack !== null && typeof stack === "object") {
    const frame = stack[0];
    return frame ? frame.getMethodName() || frame.getFunctionName() : undefined;
  }
};

Util.getCallerFunctionNames = function(position = 2) {
  let stack = Util.getCallerStack(position + 1);

  if(stack !== null && typeof stack === "object") {
    let ret = [];

    for(let i = 0; stack[i]; i++) {
      const frame = stack[i];
      ret.push(frame ? frame.getMethodName() || frame.getFunctionName() : undefined);
    }

    return ret;
  }
};

Util.getCaller = function(position = 2) {
  let stack = Util.getCallerStack(position + 1);
  const methods = ["getColumnNumber", "getEvalOrigin", "getFileName", "getFunction", "getFunctionName", "getLineNumber", "getMethodName", "getPosition", "getPromiseIndex", "getScriptNameOrSourceURL", "getThis", "getTypeName"];

  if(stack !== null && typeof stack === "object") {
    const frame = stack[0];
    return methods.reduce((acc, m) => {
      if(frame[m]) {
        const name = Util.lcfirst(m.replace(/^get/, ""));
        const value = frame[m]();

        if(value != undefined) {
          acc[name] = value;
        }
      }

      return acc;
    }, {});
  }
};

Util.getCallers = function(start = 2, num = 1) {
  let ret = [];
  let i = start;

  while(i++ < start + num) {
    try {
      ret.push(Util.getCaller(i + 1));
    } catch(err) {}
  }

  return ret;
};

Util.rotateLeft = function(x, n) {
  n = n & 0x1f;
  return (x << n) | ((x >> (32 - n)) & ~((-1 >> n) << n));
};

Util.rotateRight = function(x, n) {
  n = n & 0x1f;
  return Util.rotateLeft(x, 32 - n);
};

Util.hashString = function(string, bits = 32, mask = 0xffffffff) {
  let ret = 0;
  let bitc = 0;

  for(let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    ret *= 186;
    ret ^= code;
    bitc += 8;
    ret = Util.rotateLeft(ret, 7) & mask;
  }

  return ret & 0x7fffffff;
};

Util.flatTree = function(tree, addOutput) {
  const ret = [];
  if(!addOutput) addOutput = arg => ret.push(arg);
  addOutput(Util.filterKeys(tree, key => key !== "children"));

  if(typeof tree.children == "object" && tree.children !== null && tree.children.length) {
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for(var _iterator6 = tree.children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        let child = _step6.value;
        Util.flatTree(child, addOutput);
      }
    } catch(err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if(!_iteratorNormalCompletion6 && _iterator6.return != null) {
          _iterator6.return();
        }
      } finally {
        if(_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  }

  return ret;
};

Util.traverseTree = function(tree, fn, depth = 0, parent = null) {
  fn(tree, depth, parent);

  if(typeof tree == "object" && tree !== null && typeof tree.children == "object" && tree.children !== null && tree.children.length) {
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for(var _iterator7 = tree.children[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        let child = _step7.value;
        Util.traverseTree(child, fn, depth + 1, tree);
      }
    } catch(err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if(!_iteratorNormalCompletion7 && _iterator7.return != null) {
          _iterator7.return();
        }
      } finally {
        if(_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }
  }
};

Util.walkTree = function(node, pred, t, depth = 0, parent = null) {
  return _regenerator.default.mark(function _callee3() {
    var _i, _arr, child;

    return _regenerator.default.wrap(function _callee3$(_context4) {
      while(1)
        switch ((_context4.prev = _context4.next)) {
          case 0:
            if(!pred) pred = i => true;
            if(!t)
              t = function t(i) {
                i.depth = depth;
                return i;
              };

            if(!pred(node, depth, parent)) {
              _context4.next = 13;
              break;
            }

            _context4.next = 5;
            return t(node);

          case 5:
            if(!(typeof node == "object" && node !== null && typeof node.children == "object" && node.children.length)) {
              _context4.next = 13;
              break;
            }

            (_i = 0), (_arr = [...node.children]);

          case 7:
            if(!(_i < _arr.length)) {
              _context4.next = 13;
              break;
            }

            child = _arr[_i];
            return _context4.delegateYield(Util.walkTree(child, pred, t, depth + 1, node.parent_id), "t0", 10);

          case 10:
            _i++;
            _context4.next = 7;
            break;

          case 13:
          case "end":
            return _context4.stop();
        }
    }, _callee3);
  })();
};

Util.isPromise = function(obj) {
  return Boolean(obj) && typeof obj.then === "function";
};

if(typeof setImmediate !== "function") var setImmediate = fn => setTimeout(fn, 0);

Util.next = function(iter, observer, prev = undefined) {
  let item;

  try {
    item = iter.next(prev);
  } catch(err) {
    return observer.error(err);
  }

  const value = item.value;
  if(item.done) return observer.complete();

  if(isPromise(value)) {
    value
      .then(val => {
        observer.next(val);
        setImmediate(() => Util.next(iter, observer, val));
      })
      .catch(err => {
        return observer.error(err);
      });
  } else {
    observer.next(value);
    setImmediate(() => Util.next(iter, observer, value));
  }
};

Util.getImageAverageColor = function(imageElement, options) {
  if(!imageElement) {
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

  for(let i = 0, l = w * h * 4; i < l; i += 4) {
    pixel.r = subpixels[i];
    pixel.g = subpixels[i + 1];
    pixel.b = subpixels[i + 2];
    pixel.a = subpixels[i + 4];

    if(pixel.a > settings.tooAlpha && (luma = pixel.r + pixel.g + pixel.b) > settings.tooDark && luma < settings.tooLight) {
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

  if(processedPixels > 0) {
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

        if(h.length < 2) {
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
