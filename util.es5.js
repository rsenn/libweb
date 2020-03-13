var _Object$getPrototypeOf = require("@babel/runtime-corejs2/core-js/object/get-prototype-of");

var _Object$getOwnPropertyNames = require("@babel/runtime-corejs2/core-js/object/get-own-property-names");

var _Date$now = require("@babel/runtime-corejs2/core-js/date/now");

var _Set = require("@babel/runtime-corejs2/core-js/set");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor");

var _Object$keys = require("@babel/runtime-corejs2/core-js/object/keys");

var _Object$entries = require("@babel/runtime-corejs2/core-js/object/entries");

var _toConsumableArray = require("@babel/runtime-corejs2/helpers/toConsumableArray");

var _defineProperty = require("@babel/runtime-corejs2/helpers/defineProperty");

var _Map = require("@babel/runtime-corejs2/core-js/map");

var _Symbol$iterator = require("@babel/runtime-corejs2/core-js/symbol/iterator");

var _getIterator = require("@babel/runtime-corejs2/core-js/get-iterator");

var _regeneratorRuntime = require("@babel/runtime-corejs2/regenerator");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

var _slicedToArray = require("@babel/runtime-corejs2/helpers/slicedToArray");

var _Object$assign = require("@babel/runtime-corejs2/core-js/object/assign");

var _Array$from = require("@babel/runtime-corejs2/core-js/array/from");

var _parseInt = require("@babel/runtime-corejs2/core-js/parse-int");

var _parseFloat = require("@babel/runtime-corejs2/core-js/parse-float");

var _JSON$stringify = require("@babel/runtime-corejs2/core-js/json/stringify");

//var useragent = require('useragent');
var formatAnnotatedObject = function formatAnnotatedObject(subject, _ref) {
  var _ref$indent = _ref.indent,
      indent = _ref$indent === void 0 ? "  " : _ref$indent,
      _ref$spacing = _ref.spacing,
      spacing = _ref$spacing === void 0 ? " " : _ref$spacing,
      _ref$separator = _ref.separator,
      separator = _ref$separator === void 0 ? "," : _ref$separator,
      _ref$newline = _ref.newline,
      newline = _ref$newline === void 0 ? "\n" : _ref$newline,
      _ref$maxlen = _ref.maxlen,
      maxlen = _ref$maxlen === void 0 ? 30 : _ref$maxlen,
      _ref$depth = _ref.depth,
      depth = _ref$depth === void 0 ? 1 : _ref$depth;
  var i = indent.repeat(Math.abs(1 - depth));
  var nl = newline != "" ? newline + i : spacing;
  var opts = {
    newline: depth >= 0 ? newline : "",
    depth: depth - 1
  };
  if (subject && subject.toSource !== undefined) return subject.toSource();
  if (subject instanceof Date) return "new Date('".concat(new Date().toISOString(), "')");
  if (typeof subject == "string") return "'".concat(subject, "'");

  if (subject != null && subject["y2"] !== undefined) {
    return "rect[" + spacing + subject["x"] + separator + subject["y"] + " | " + subject["x2"] + separator + subject["y2"] + " (" + subject["w"] + "x" + subject["h"] + ")" + " ]";
  }

  if (typeof subject == "object" && "map" in subject && typeof subject.map == "function") {
    //subject instanceof Array || (subject && subject.length !== undefined)) {
    return "[" + nl +
    /*(opts.depth <= 0) ? subject.length + '' : */
    subject.map(function (i) {
      return formatAnnotatedObject(i, opts);
    }).join(separator + nl) + "]";
  }

  if (typeof subject === "string" || subject instanceof String) {
    return "'" + subject + "'";
  }

  var longest = "";
  var r = [];

  for (var k in subject) {
    if (k.length > longest.length) longest = k;
    var s = ""; //if(typeof(subject[k]) == 'string') s = subject[k];

    if (typeof subject[k] === "symbol") {
      s = "Symbol";
    } else if (typeof subject[k] === "string" || subject[k] instanceof String) {
      s = "'" + subject[k] + "'";
    } else if (typeof subject[k] === "function") {
      s = Util.fnName(s) || "function";
      s += "()";
    } else if (typeof subject[k] === "number" || typeof subject[k] === "boolean") {
      s = "" + subject[k];
    } else if (subject[k] === null) {
      s = "null";
    } else if (subject[k] && subject[k].length !== undefined) {
      try {
        s = depth <= 0 ? "Array(".concat(subject[k].length, ")") : "[ " + subject[k].map(function (item) {
          return formatAnnotatedObject(item, opts);
        }).join(", ") + " ]";
      } catch (err) {
        s = "[" + subject[k] + "]";
      }
    } else if (subject[k] && subject[k].toSource !== undefined) {
      s = subject[k].toSource();
    } else if (opts.depth >= 0) {
      s = s.length > maxlen ? "[Object " + Util.objName(subject[k]) + "]" : formatAnnotatedObject(subject[k], opts);
    }

    r.push([k, s]);
  } //console.log("longest: ", longest)


  var padding = function padding(x) {
    return Util.pad(x, longest.length, spacing);
  };

  var j = separator + spacing;

  if (r.length > 6) {
    nl = opts.newline + i;
    j = separator + (opts.newline || spacing) + i;
  } //padding = x => '';


  var ret = "{" + opts.newline + r.map(function (arr) {
    return padding(arr[0]) + arr[0] + ":" + spacing + arr[1];
  }).join(j) + opts.newline + "}";
  return ret;
};
/**
 * Class for utility.
 *
 * @class      Util (name)
 */


function Util() {}

Util.isDebug = function () {
  if (process !== undefined && process.env.NODE_ENV === "production") return false;
  return true;
};
/*Util.log = function(message) {
  const args = [...arguments];
  if(!this.logFile) {
    if(process.browser === undefined) {
      if(globals && globals.require !== undefined) {
        this.fs = globals.require('fs');
        this.logFile = this.fs.openSync('logs/node.log', 'a');
      }
    }
  }

  return this.logFile !== undefined ? fs.writeSync(this.logFile, args.join('') + '\n') : null;
};
*/


Util.log = function () {
  var log = Math.log;
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
  if (typeof arg == "string") return "'" + arg + "'";

  if (arg && arg.x !== undefined && arg.y !== undefined) {
    return "[" + arg.x + "," + arg.y + "]";
  }

  if (arg && arg.toSource) return arg.toSource();
  var cls = arg && arg.constructor && Util.fnName(arg.constructor);
  return String(arg);
};

Util.debug = function (message) {
  var args = Array.prototype.slice.call(arguments);
  var cache = Util.array();

  var removeCircular = function removeCircular(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) return;
      cache.push(value);
    }

    return value;
  };

  var str = args.map(function (arg) {
    return typeof arg === "object" ? _JSON$stringify(arg, removeCircular) : arg;
  }).join(" ").replace(/\n/g, ""); //console.log("STR: "+str);

  console.log.call(console, str); //Util.log.apply(Util, args)
};

Util.type = function (obj) {
  return obj.type && String(obj.type).split(/[ ()]/)[1] || "";
};

Util.functionName = function (fn) {
  var matches = /function\s*([^(]*)\(.*/g.exec(String(fn));
  if (matches && matches[1]) return matches[1];
  return null;
};

Util.className = function (obj) {
  return Util.functionName(obj.constructor);
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
  var num = _parseFloat(str);

  if (isNaN(num)) num = 0;
  return num;
};

Util.minmax = function (num, min, max) {
  return Math.min(Math.max(num, min), max);
};

Util.getExponential = function (num) {
  var str = typeof num == "string" ? num : num.toExponential();
  var matches = /e\+?(.*)$/.exec(str); //console.log("matches: ", matches);

  return _parseInt(matches[1]);
};

Util.getNumberParts = function (num) {
  var str = typeof num == "string" ? num : num.toExponential();
  var matches = /^(-?)(.*)e\+?(.*)$/.exec(str); //console.log("matches: ", matches);

  var negative = matches[1] == "-";
  return {
    negative: negative,
    mantissa: _parseFloat(matches[2]),
    exponent: _parseInt(matches[3])
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
  return _parseInt(num).toString(2);
};

Util.toBits = function (num) {
  var a = Util.toBinary(num).split("").reverse();
  return _Array$from(_Object$assign({}, a, {
    length: 50
  }), function (bit) {
    return bit ? 1 : 0;
  });
};

Util.getBit = function (v, n) {
  var s = v.toString(2);
  return n < s.length ? _parseInt(s[s.length - n - 1]) : 0;
};

Util.isSet = function (v, n) {
  return Util.getBit(v, n) == 1;
};

Util.bitCount = function (n) {
  return Util.count(Util.toBinary(n), "1");
};

Util.toggleBit = function (num, bit) {
  var n = Number(num);
  return Util.isSet(n, bit) ? n - Util.pow2(bit) : n + Util.pow2(bit);
};

Util.setBit = function (num, bit) {
  var n = Number(num);
  return Util.isSet(n, bit) ? n : n + Util.pow2(bit);
};

Util.clearBit = function (num, bit) {
  var n = Number(num);
  return Util.isSet(n, bit) ? n - Util.pow2(bit) : n;
};

Util.range = function (start, end) {
  if (start > end) {
    var ret = [];

    while (start >= end) {
      ret.push(start--);
    }

    return ret;
  }

  var r = _Array$from({
    length: end - start + 1
  }, function (v, k) {
    return k + start;
  }); //console.log("Util.range ", r);


  return r;
};

Util.inspect = function (obj) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    indent: "  ",
    newline: "\n",
    depth: 2,
    spacing: " "
  };
  return formatAnnotatedObject(obj, opts);
};

Util.bitArrayToNumbers = function (arr) {
  var numbers = Util.array();

  for (var i = 0; i < arr.length; i++) {
    var number = i + 1;
    if (arr[i]) numbers.push(number);
  }

  return numbers;
};

Util.bitsToNumbers = function (bits) {
  var a = Util.toBinary(bits).split("");
  var r = Util.array(); //return a;

  a.forEach(function (val, key, arr) {
    return val == "1" && r.unshift(a.length - key);
  });
  return r;
};

Util.shuffle = function (arr) {
  var rnd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Util.rng;
  arr.sort(function (a, b) {
    return 0.5 - rnd();
  });
  return arr;
};

Util.sortNum = function (arr) {
  arr.sort(function (a, b) {
    return a - b;
  }); //console.log("Util.sortNum ", { arr });

  return arr;
};

Util.draw = function (arr, n) {
  var rnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Util.rng;
  var r = Util.shuffle(arr, rnd).splice(0, n); //console.log("Util.draw ", { arr, n, r });

  return r;
};

Util.is = {
  on: function on(val) {
    return val == "on" || val === "true" || val === true;
  },
  off: function off(val) {
    return val == "off" || val === "false" || val === false;
  },
  "true": function _true(val) {
    return val === "true" || val === true;
  },
  "false": function _false(val) {
    return val === "false" || val === false;
  }
};

Util.onoff = function (val) {
  if (Util.is.on(val)) return true;
  if (Util.is.off(val)) return false;
  return undefined;
};

Util.numbersToBits = function (arr) {
  return arr.reduce(function (bits, num) {
    return bits + Util.bitValue(num);
  }, 0);
};

Util.randomNumbers = function (_ref2, draws) {
  var _ref3 = _slicedToArray(_ref2, 2),
      start = _ref3[0],
      end = _ref3[1];

  var r = Util.sortNum(Util.draw(Util.range(start, end), draws)); //console.log("Util.randomNumbers ", { start, end, draws, r });

  return r;
};

Util.randomBits = function () {
  var r = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [1, 50];
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  return Util.numbersToBits(Util.randomNumbers(r, n));
};

Util.pad = function (s, n) {
  var _char = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : " ";

  return s.length < n ? _char.repeat(n - s.length) : "";
};

Util.abbreviate = function (str, max) {
  var suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "...";

  if (str.length > max) {
    return str.substring(0, max - suffix.length) + suffix;
  }

  return str;
};

Util.trim = function (str, charset) {
  var r1 = RegExp("^[" + charset + "]*");
  var r2 = RegExp("[" + charset + "]*$");
  return str.replace(r1, "").replace(r2, "");
};

Util.define = function (obj, key, value) {
  var enumerable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return obj[key] === undefined && _Object$defineProperty(obj, key, {
    enumerable: enumerable,
    configurable: false,
    writable: false,
    value: value
  });
};

Util.defineGetter = function (obj, key, get) {
  var enumerable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return obj[key] === undefined && _Object$defineProperty(obj, key, {
    enumerable: enumerable,
    configurable: false,
    get: get
  });
};

Util.defineGetterSetter = function (obj, key, get, set) {
  var enumerable = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  return obj[key] === undefined && _Object$defineProperty(obj, key, {
    get: get,
    set: set,
    enumerable: enumerable
  });
};

Util.extendArray = function () {
  var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Array.prototype;

  /*  Util.define(arr, 'tail', function() {
    return this[this.length - 1];
  });*/
  Util.define(arr, "match", function (pred) {
    return Util.match(this, pred);
  });
  Util.define(arr, "clear", function () {
    this.splice(0, this, length);
    return this;
  });
  Util.define(arr, "unique", function () {
    return this.filter(function (item, i, a) {
      return a.indexOf(item) == i;
    });
  });
  Util.defineGetterSetter(arr, "tail", function () {
    return Util.tail(this);
  }, function (value) {
    if (this.length == 0) this.push(value);else this[this.length - 1] = value;
  });
  /*Util.define(arr, 'inspect', function(opts = {}) {
    return Util.inspect(this, { depth: 100, ...opts });
  });*/
};

Util.adapter = function (obj) {
  var _adapter;

  var getLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (obj) {
    return obj.length;
  };
  var getKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (obj, index) {
    return obj.key(index);
  };
  var getItem = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (obj, key) {
    return obj[key];
  };
  var setItem = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : function (obj, index, value) {
    return obj[index] = value;
  };
  var adapter = (_adapter = {
    get length() {
      return getLength(obj);
    },

    get instance() {
      return obj;
    },

    key: function key(i) {
      return getKey(obj, i);
    },
    get: function get(key) {
      return getItem(obj, key);
    },
    set: function set(key, value) {
      return setItem(obj, key, value);
    },
    keys: /*#__PURE__*/_regeneratorRuntime.mark(function keys() {
      var length, i;
      return _regeneratorRuntime.wrap(function keys$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
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
        }
      }, keys);
    }),
    entries: /*#__PURE__*/_regeneratorRuntime.mark(function entries() {
      var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key;

      return _regeneratorRuntime.wrap(function entries$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context2.prev = 3;
              _iterator = _getIterator(this.keys());

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

              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
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
        }
      }, entries, this, [[3, 14, 18, 26], [19,, 21, 25]]);
    })
  }, _defineProperty(_adapter, _Symbol$iterator, function () {
    return this.entries();
  }), _defineProperty(_adapter, "toObject", function toObject() {
    return Object.fromEntries(this.entries());
  }), _defineProperty(_adapter, "toMap", function toMap() {
    return new _Map(this.entries());
  }), _adapter);
  return adapter;
};

Util.adapter.localStorage = function () {
  var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : localStorage;
  return Util.adapter(s, function (l) {
    return l.length;
  }, function (l, i) {
    return l.key(i);
  }, function (l, key) {
    return JSON.parse(l.getItem(key));
  }, function (l, key, v) {
    return l.setItem(key, _JSON$stringify(v));
  });
};

Util.array = function () {
  var enumerable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var a = enumerable instanceof Array ? enumerable : _toConsumableArray(enumerable);

  try {
    if (a.match === undefined) Util.extendArray();
    if (a.match === undefined) Util.extendArray(a);
  } catch (err) {}

  return a;
};

Util.map = function () {
  var hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var m = hash[_Symbol$iterator] !== undefined ? hash : new _Map(_Object$entries(hash));
  if (m instanceof Array) m[_Symbol$iterator] = m.entries;

  try {
    //if(m.toObject === undefined) Util.extendMap();
    if (m.toObject === undefined) Util.extendMap(m);
  } catch (err) {}

  return m;
};

Util.extendMap = function (map) {
  if (map.entries === undefined) {
    map.entries = /*#__PURE__*/_regeneratorRuntime.mark(function iterator() {
      var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, entry;

      return _regeneratorRuntime.wrap(function iterator$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context3.prev = 3;
              _iterator2 = _getIterator(map);

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

              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
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
        }
      }, iterator, null, [[3, 24, 28, 36], [29,, 31, 35]]);
    });
  }

  map.toObject = function () {
    return Object.fromEntries(this.entries());
  };

  map.match = function () {
    return Util.match.apply(this, arguments);
  };
};

Util.objectFrom = function (any) {
  if ("toJS" in any) any = any.toJS();
  if ("entries" in any) return Object.fromEntries(any.entries());
  return _Object$assign({}, any);
};

Util.tail = function (arr) {
  return arr && arr.length > 0 ? arr[arr.legth - 1] : null;
};

Util.splice = function (str, index, delcount, insert) {
  var chars = str.split("");
  Array.prototype.splice.apply(chars, arguments);
  return chars.join("");
};

Util.keyOf = function (obj, prop) {
  var keys = _Object$keys(obj);

  for (var k in keys) {
    if (obj[k] === prop) return k;
  }

  return undefined;
};

Util.rotateRight = function (arr, n) {
  arr.unshift.apply(arr, arr.splice(n, arr.length));
  return arr;
};

Util.repeat = function (n, what) {
  var ret = [];

  while (n-- > 0) {
    ret.push(what);
  }

  return ret;
};

Util.arrayDim = function (dimensions, init) {
  var args = _toConsumableArray(dimensions);

  args.reverse();
  var ret = init;

  while (args.length > 0) {
    var n = args.shift();
    ret = Util.repeat(n, ret);
  }

  return ret;
};

Util.flatten = function (arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    ret = [].concat(_toConsumableArray(ret), _toConsumableArray(arr[i]));
  }

  return ret;
};

Util.chunkArray = function (myArray, chunk_size) {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    myChunk = myArray.slice(index, index + chunk_size); // Do something if you want with the group

    tempArray.push(myChunk);
  }

  return tempArray;
};

Util.chances = function (numbers, matches) {
  var f = Util.factorial;
  return f(numbers) / (f(matches) * f(numbers - matches));
};

Util.sum = function (arr) {
  return arr.reduce(function (acc, n) {
    return acc + n;
  }, 0);
};
/*Util.define(
  String.prototype,
  'splice',
  function(index, delcount, insert) {
    return Util.splice.apply(this, [this, ...arguments]);
  }
);*/


Util.fnName = function (f, parent) {
  if (f !== undefined && f.name !== undefined) return f.name;
  var s = f.toSource ? f.toSource() : f + "";
  var matches = /([A-Za-z_][0-9A-Za-z_]*)\w*[(\]]/.exec(s);
  if (matches) return matches[1];

  if (parent !== undefined) {
    for (var key in parent) {
      if (parent[key] === f) return key;
    }
  }

  return undefined;
};

Util.keys = function (obj) {
  var r = Util.array();

  for (var i in obj) {
    r.push(i);
  }

  return r;
};

Util.objName = function (o) {
  if (o === undefined || o == null) return o + "";
  if (typeof o === "function" || o instanceof Function) return Util.fnName(o);
  if (o.constructor) return Util.fnName(o.constructor);
  var s = o.type + "";
  return s;
};

Util.findKey = function (obj, value) {
  for (var k in obj) {
    if (obj[k] === value) return k;
  }

  return null;
};

Util.find = function (arr, value) {
  var prop = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "id";
  var acc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Util.array();
  var pred;
  if (typeof value == "function") pred = value;else if (prop && prop.length !== undefined) {
    pred = function pred(obj) {
      if (obj[prop] == value) return true;
      return false;
    };
  } else pred = function pred(obj) {
    return obj[prop] == value;
  };

  for (var k = 0; k < arr.length; k++) {
    var v = arr[k]; //console.log("v: ", v, "k:", k);

    /*if(Util.isArray(v)) {
      for(let i = 0; i < v.length; i++)
        if(pred(v[i]))
          return v[i];
     } else */

    {
      if (pred(v)) return v;
    }
  }

  return null;
};

Util.match = function (arg, pred) {
  var match = pred;

  if (pred instanceof RegExp) {
    var re = pred;

    match = function match(val, key) {
      return val && val.tagName !== undefined && re.test(val.tagName) || typeof key === "string" && re.test(key) || typeof val === "string" && re.test(val);
    };
  }

  if (Util.isArray(arg)) {
    if (!(arg instanceof Array)) arg = _toConsumableArray(arg);
    return arg.reduce(function (acc, val, key) {
      if (match(val, key, arg)) acc.push(val);
      return acc;
    }, Util.array());
  } else if (Util.isMap(arg)) {
    //console.log('Util.match ', { arg });
    return _toConsumableArray(arg.keys()).reduce(function (acc, key) {
      return match(arg.get(key), key, arg) ? acc.set(key, arg.get(key)) : acc;
    }, new _Map());
  } else {
    var i = 0;
    var ret = [];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = _getIterator(arg), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var item = _step3.value;
        if (match(item, i, arg)) ret.push(item);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
          _iterator3["return"]();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return ret; //    return Object.keys(arg).reduce((acc, key) => (match(arg[key], key, arg) ? { ...acc, [key]: arg[key] } : {}), {});
  }
};

Util.toHash = function (map) {
  var keyTransform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (k) {
    return Util.camelize(k);
  };
  var ret = {};

  for (var i = 0; i < map.length; i++) {
    var key = map[i];
    ret[keyTransform(key)] = map[key];
  }

  return ret;
};

Util.indexOf = function (obj, prop) {
  for (var key in obj) {
    if (obj[key] === prop) return key;
  }

  return undefined;
};
/*
Util.injectProps = (options) => {
  return function(InitialComponent) {
    return function DndStateInjector() {
      return <InitialComponent {...options} />;
    }
  }
}*/


Util.toString = function () {};

Util.dump = function (name, props) {
  var args = [name];

  for (var key in props) {
    args.push("\n\t" + key + ": ");
    args.push(props[key]);
  }

  if ("window" in global !== false) {
    var _console;

    //if(window.alert !== undefined)
    //alert(args);
    if (window.console !== undefined) (_console = console).log.apply(_console, args);
  }
};

Util.ucfirst = function (str) {
  if (typeof str != "string") str = String(str);
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

Util.lcfirst = function (str) {
  return str.substring(0, 1).toLowerCase() + str.substring(1);
};
/**
 * Camelize a string, cutting the string by multiple separators like
 * hyphens, underscores and spaces.
 *
 * @param {text} string Text to camelize
 * @return string Camelized text
 */


Util.camelize = function (text) {
  var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2, offset) {
    if (p2) return sep + p2.toUpperCase();
    return p1.toLowerCase();
  });
};

Util.decamelize = function (str) {
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "-";
  return /[A-Z]/.test(str) ? str.replace(/([a-z\d])([A-Z])/g, "$1" + separator + "$2").replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1" + separator + "$2").toLowerCase() : str;
};

Util.isEmail = function (v) {
  return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(v);
};

Util.isString = function (v) {
  return Object.prototype.toString.call(v) == "[object String]";
};

Util.isObject = function (v) {
  return Object.prototype.toString.call(v) == "[object Object]";
};

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
  if (typeof v == "object" && !!v && v.constructor == Object && _Object$keys(v).length == 0) return true;
  if (!v || v === null) return true;
  if (typeof v == "object" && v.length !== undefined && v.length === 0) return true;
  return false;
};

Util.notEmpty = function (v) {
  return !Util.isEmpty(v);
};

Util.hasProps = function (obj) {
  var keys = _Object$keys(obj);

  return keys.length > 0;
};

Util.validatePassword = function (value) {
  return value.length > 7 && /^(?![\d]+$)(?![a-zA-Z]+$)(?![!#$%^&*]+$)[\da-zA-Z!#$ %^&*]/.test(value) && !/\s/.test(value);
}; //deep copy


Util.deepClone = function (data) {
  return JSON.parse(_JSON$stringify(data));
}; // Function


Util.findVal = function (object, propName) {
  var maxDepth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  if (maxDepth <= 0) return null;

  for (var key in object) {
    if (key === propName) {
      console.log(propName);
      console.log(object[key]);
      return object[key];
    } else {
      var value = Util.findVal(object[key], propName, maxDepth - 1);
      if (value !== undefined) return value;
    }
  }
}; //Deep copy for ObservableArray/Object == There is a problem


Util.deepCloneObservable = function (data) {
  var o;
  var t = typeof data;

  if (t === "object") {
    o = data.length ? Util.array() : {};
  } else {
    return data;
  }

  if (t === "object") {
    if (data.length) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = _getIterator(data), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var value = _step4.value;
          o.push(this.deepCloneObservable(value));
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return o;
    } else {
      for (var i in data) {
        o[i] = this.deepCloneObservable(data[i]);
      }

      return o;
    }
  }
}; //Convert ObservableArray to Array


Util.toArray = function (observableArray) {
  return observableArray.slice();
};
/**
 * Convert the original array to tree
 * @param data original array
 * @param id id field
 * @param pId parent id field
 * @param appId the parent id value of the level one array
 */


Util.arryToTree = function (data, id, pId, appId) {
  var arr = Util.array();
  data.map(function (e, i) {
    e[pId] === appId && arr.push(e);
  });
  var res = this.to3wei(arr, data, id, pId);
  return res;
};
/**
 * Convert a first-level branch array to a tree
 * @param a level one branch array
 * @param old original array
 * @param id id field
 * @param pId parent id field
 */


Util.to3wei = function (a, old, id, pId) {
  var _this = this;

  a.map(function (e, i) {
    a[i].children = Util.array();
    old.map(function (se, si) {
      if (se[pId] === a[i][id]) {
        a[i].children = [].concat(_toConsumableArray(a[i].children), [se]);

        _this.to3wei(a[i].children, old, id, pId);
      }
    });

    if (!a[i].children.length) {
      delete a[i].children;
    }
  });
  return a;
};
/**
 * Exchange 2 element positions in the array
 * @param arr original array
 * @param i First element Starting from 0
 * @param j The second element starts at 0
 */


Util.arrExchangePos = function (arr, i, j) {
  arr[i] = arr.splice(j, 1, arr[i])[0];
};

Util.arrRemove = function (arr, i) {
  var index = arr.indexOf(i);
  if (index > -1) arr.splice(index, 1);
};

Util.removeEqual = function (a, b) {
  var c = {};

  for (var key in _Object$assign({}, a)) {
    if (b[key] === a[key]) continue;
    c[key] = a[key];
  }

  return c;
}; //Remove the storage when logging out


Util.logOutClearStorage = function () {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userLoginPermission");
  localStorage.removeItem("ssoToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("userGroupList");
  localStorage.removeItem("gameAuthList");
}; //Take the cookies


Util.getCookie = function (cookie, name) {
  var arr = cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
  if (arr != null) return unescape(arr[2]);
  return null;
};

Util.parseCookie = function () {
  var c = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.cookie;
  if (!(typeof c == "string" && c && c.length > 0)) return {};
  var key = "";
  var value = "";
  var ws = " \r\n\t";
  var i = 0;
  var ret = {};

  var skip = function skip() {
    var pred = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (_char2) {
      return ws.indexOf(_char2) != -1;
    };
    var start = i;

    while (i < c.length && pred(c[i])) {
      i++;
    }

    var r = c.substring(start, i);
    return r;
  };

  do {
    var str = skip(function (_char3) {
      return _char3 != "=" && _char3 != ";";
    });

    if (c[i] == "=" && str != "path") {
      i++;
      key = str;
      value = skip(function (_char4) {
        return _char4 != ";";
      });
    } else {
      i++;
      skip();
    }

    if (key != "") ret[key] = value;
    skip();
  } while (i < c.length);

  return ret;
};
/*

    matches.shift();


    return matches.reduce((acc, part) => {
      const a = part.trim().split('=');
      return { ...acc, [a[0]]: decodeURIComponent(a[1]) };
    }, {});
  };*/


Util.encodeCookie = function (c) {
  return _Object$entries(c).map(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
        key = _ref5[0],
        value = _ref5[1];

    return "".concat(key, "=").concat(encodeURIComponent(value));
  }).join("; ");
};

Util.setCookies = function (c) {
  return _Object$entries(c).forEach(function (_ref6) {
    var _ref7 = _slicedToArray(_ref6, 2),
        key = _ref7[0],
        value = _ref7[1];

    document.cookie = "".concat(key, "=").concat(value);
    console.log("Setting cookie[".concat(key, "] = ").concat(value));
  });
};

Util.clearCookies = function (c) {
  return Util.setCookies(_Object$keys(Util.parseCookie(c)).reduce(function (acc, name) {
    return _Object$assign(acc, _defineProperty({}, name, "; max-age=0; expires=" + new Date().toUTCString()));
  }, {}));
};

Util.deleteCookie = function (name) {
  if (global.window) document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};

Util.accAdd = function (arg1, arg2) {
  var r1, r2, m;

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
}; //js subtraction calculation
//


Util.Subtr = function (arg1, arg2) {
  var r1, r2, m, n;

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

  m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka
  //动态控制精度长度

  n = r1 >= r2 ? r1 : r2;
  return (arg1 * m - arg2 * m) / m;
}; //js division function
//


Util.accDiv = function (arg1, arg2) {
  var t1 = 0;
  var t2 = 0;
  var r1;
  var r2;

  try {
    t1 = arg1.toString().split(".")[1].length;
  } catch (e) {}

  try {
    t2 = arg2.toString().split(".")[1].length;
  } catch (e) {}

  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));
  return r1 / r2 * Math.pow(10, t2 - t1);
}; //js multiplication function
//


Util.accMul = function (arg1, arg2) {
  var m = 0;
  var s1 = arg1.toString();
  var s2 = arg2.toString();

  try {
    m += s1.split(".")[1].length;
  } catch (e) {}

  try {
    m += s2.split(".")[1].length;
  } catch (e) {}

  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
};

Util.dateFormatter = function (date, formate) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = month > 9 ? month : "0".concat(month);
  var day = date.getDate();
  day = day > 9 ? day : "0".concat(day);
  var hour = date.getHours();
  hour = hour > 9 ? hour : "0".concat(hour);
  var minute = date.getMinutes();
  minute = minute > 9 ? minute : "0".concat(minute);
  var second = date.getSeconds();
  second = second > 9 ? second : "0".concat(second);
  return formate.replace(/Y+/, "".concat(year).slice(-formate.match(/Y/g).length)).replace(/M+/, month).replace(/D+/, day).replace(/h+/, hour).replace(/m+/, minute).replace(/s+/, second);
};

Util.numberFormatter = function (numStr) {
  var numSplit = numStr.split(".");
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
      for (var property in object) {
        var desc = _Object$getOwnPropertyDescriptor(object, property); //console.log('x ', {property, desc})


        if (property.indexOf("$") !== 0 && typeof object[property] !== "function" && !desc.get && !desc.set) {
          if (typeof object[property] === "object") {
            try {
              _JSON$stringify(object[property]);
            } catch (err) {
              continue;
            }
          } //if (Object.prototype.hasOwnProperty.call(object, property)) {


          Util.searchObject(object[property], matchCallback, currentPath + "." + property, result, searched); //}
        }
      }
    }
  } catch (e) {
    console.log(object); //throw e;
  }

  return result;
};

Util.getURL = function () {
  var req = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var proto = process.env.NODE_ENV === "production" ? "https" : "http";
  var port = process.env.NODE_ENV === "production" ? 443 : 8080;
  var host = global.ip || global.host || "localhost";

  if (req && req.headers && req.headers.host !== undefined) {
    host = req.headers.host.replace(/:.*/, "");
  } else if (process.env.HOST !== undefined) host = process.env.HOST;

  if (global.window !== undefined && window.location !== undefined) return window.location.href;
  if (req.url !== undefined) return req.url;
  if (global.process !== undefined && global.process.url !== undefined) return global.process.url;
  var url = "".concat(proto, "://").concat(host, ":").concat(port);
  console.log("getURL process ", {
    url: url
  });
  return url;
};

Util.parseQuery = function () {
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Util.getURL();
  var startIndex;
  var query = {};

  try {
    if ((startIndex = url.indexOf("?")) != -1) url = url.substring(startIndex);

    var args = _toConsumableArray(url.matchAll(/[?&]([^=&#]+)=?([^&#]*)/g));

    if (args) {
      for (var i = 0; i < args.length; i++) {
        var k = args[i][1];
        query[k] = decodeURIComponent(args[i][2]);
      }
    }

    return query;
  } catch (err) {
    return undefined;
  }
};

Util.encodeQuery = function (data) {
  var ret = Util.array();

  for (var d in data) {
    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  }

  return ret.join("&");
};

Util.parseURL = function () {
  var href = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getURL();
  var matches = /^([^:]*):\/\/([^/:]*)(:[0-9]*)?(\/?.*)/.exec(href);
  if (!matches) return null;
  var argstr = matches[4].replace(/^[^?]*\?/, "");
  /* + "&test=1"*/

  var pmatches = typeof argstr === "string" ? argstr.split(/&/g).map(function (part) {
    var a = part.split(/=/);
    var b = a.shift();
    return [b, a.join("=")];
  }) : Util.array();

  var params = _toConsumableArray(pmatches).reduce(function (acc, m) {
    acc[m[0]] = m[1];
    return acc;
  }, {});

  console.log("PARAMS: ", {
    argstr: argstr,
    pmatches: pmatches,
    params: params
  });
  return {
    protocol: matches[1],
    host: matches[2],
    port: typeof matches[3] === "string" ? _parseInt(matches[3].substring(1)) : 443,
    location: matches[4].replace(/\?.*/, ""),
    query: params,
    href: function href(override) {
      if (typeof override === "object") _Object$assign(this, override);
      var qstr = Util.encodeQuery(this.query);
      return (this.protocol ? "".concat(this.protocol, "://") : "") + (this.host ? this.host : "") + (this.port ? ":" + this.port : "") + "".concat(this.location) + (qstr != "" ? "?" + qstr : "");
    }
  };
};

Util.makeURL = function () {
  var args = Array.prototype.slice.call(arguments);
  var href = typeof args[0] === "string" ? args.shift() : this.getURL();
  var urlObj = null;
  var host = global.ip || global.host || "localhost";
  if (String(href).indexOf("://") == -1) href = "http://".concat(host, ":8080");
  urlObj = this.parseURL(href);
  return urlObj ? urlObj.href(args[0]) : null;
};

Util.numberFromURL = function (url, fn) {
  var obj = typeof url === "object" ? url : this.parseURL(url);
  var nr_match = RegExp(".*[^0-9]([0-9]+)$").exec(url.location);
  var nr_arg = nr_match ? nr_match[1] : undefined;

  var nr = nr_arg && _parseInt(nr_arg);

  if (!isNaN(nr) && typeof fn === "function") fn(nr);
  return nr;
};

Util.isBrowser = function () {
  return !!(global.window && global.window.document);
};

Util.isServer = function () {
  return !Util.isBrowser();
};

Util.isMobile = function () {
  return true;
};

Util.unique = function (arr) {
  return _Array$from(new _Set(arr));
};

Util.distinct = function (arr) {
  return Array.prototype.filter.call(arr, function (value, index, me) {
    return me.indexOf(value) === index;
  });
};

Util.rangeMinMax = function (arr, field) {
  var numbers = _toConsumableArray(arr).map(function (obj) {
    return obj[field];
  });

  return [Math.min.apply(Math, _toConsumableArray(numbers)), Math.max.apply(Math, _toConsumableArray(numbers))];
};

Util.mergeLists = function (arr1, arr2) {
  var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "id";
  var hash = arr1.reduce(function (acc, it) {
    return _Object$assign(_defineProperty({}, it[key], it), acc);
  }, {});
  hash = arr2.reduce(function (acc, it) {
    return _Object$assign(_defineProperty({}, it[key], it), acc);
  }, {});
  var ret = Util.array();

  for (var k in hash) {
    if (hash[k][key]) ret.push(hash[k]);
  }

  return ret;
};

Util.throttle = function (fn, wait) {
  var time = _Date$now();

  return function () {
    if (time + wait - _Date$now() < 0) {
      fn();
      time = _Date$now();
    }
  };
};

Util.foreach = function (obj, fn) {
  if (obj instanceof Array) obj.forEach(fn);else {
    for (var key in obj) {
      fn(obj[key], key, obj);
    }
  }
};

Util.all = function (obj, pred) {
  for (var k in obj) {
    if (!pred(obj[k])) return false;
  }

  return true;
};

Util.filter = function (obj, fn) {
  var ret = {};

  for (var key in obj) {
    if (fn(obj[key], key, obj)) ret[key] = obj[key];
  }

  return ret;
};

Util.reduce = function (obj, fn, accu) {
  for (var key in obj) {
    accu = fn(accu, obj[key], key, obj);
  }

  return accu;
};

var map = Util.map;

Util.map = function (obj, fn) {
  if (!fn) return map(obj);
  var ret = {};

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var item = fn(key, obj[key], obj);
      if (item instanceof Array && item.length == 2) ret[item[0]] = item[1];else {
        if (!(ret instanceof Array)) ret = [];
        ret.push(item);
      }
    }
  }

  return ret;
};

Util.entriesToObj = function (arr) {
  return _toConsumableArray(arr).reduce(function (acc, item) {
    var k = item[0];
    var v = item[1];
    acc[k] = v;
    return acc;
  }, {});
};

Util.parseDate = function (d) {
  return /^[0-9]+$/.test(d) ? Util.fromUnixTime(d) : new Date(d);
};

Util.isoDate = function (date) {
  try {
    var minOffset = date.getTimezoneOffset();
    var milliseconds = date.valueOf() - minOffset * 60 * 1000;
    date = new Date(milliseconds);
    return date.toISOString().replace(/T.*/, "");
  } catch (err) {}

  return null;
};

Util.toUnixTime = function (dateObj) {
  var utc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!(dateObj instanceof Date)) dateObj = new Date(dateObj);
  var epoch = Math.floor(dateObj.getTime() / 1000);
  if (utc) epoch += dateObj.getTimezoneOffset() * 60;
  return epoch;
};

Util.unixTime = function () {
  var utc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  return Util.toUnixTime(new Date(), utc);
};

Util.fromUnixTime = function (epoch) {
  var utc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var t = _parseInt(epoch);

  var d = new Date(0);
  utc ? d.setUTCSeconds(t) : d.setSeconds(t);
  return d;
};

Util.formatTime = function () {
  var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();
  var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "HH:MM:SS";
  var n;
  var out = "";

  for (var i = 0; i < format.length; i += n) {
    n = 1;

    while (format[i] == format[i + n]) {
      n++;
    }

    var fmt = format.substring(i, i + n);
    var num = fmt;
    if (fmt.startsWith("H")) num = ("0" + date.getHours()).substring(0, n);else if (fmt.startsWith("M")) num = ("0" + date.getMinutes()).substring(0, n);else if (fmt.startsWith("S")) num = ("0" + date.getSeconds()).substring(0, n);
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
  var seconds = s % 60;
  s = Math.floor(s / 60);
  var minutes = s % 60;
  s = Math.floor(s / 60);
  var hours = s % 24;
  s = Math.floor(s / 24);
  var days = s % 7;
  s = Math.floor(s / 7);
  var weeks = s;
  var ret = "";
  ret = ("0" + hours).substring(0, 2) + ":" + ("0" + minutes).substring(0, 2) + ":" + ("0" + seconds).substring(0, 2);
  if (days) ret = days + " days " + ret;
  if (weeks) ret = weeks + " weeks " + ret;
  return ret;
};

Util.rng = Math.random;

Util.randFloat = function (min, max) {
  var rnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Util.rng;
  return rnd() * (max - min) + min;
};

Util.randInt = function (min) {
  var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16777215;
  var rnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Util.rng;
  return Math.round(Util.randFloat(min, max, rnd));
};

Util.hex = function (num) {
  var numDigits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var n = typeof num == "number" ? num : _parseInt(num);
  return ("0".repeat(numDigits) + n.toString(16)).slice(-numDigits);
};

Util.roundTo = function (value, prec) {
  return Math.round(value / prec) * prec;
};

Util.base64 = {
  encode: function encode(utf8) {
    if (global.window) return window.btoa(unescape(encodeURIComponent(utf8)));
    return Buffer.from(utf8).toString("base64");
  },
  decode: function decode(base64) {
    return decodeURIComponent(escape(window.atob(base64)));
  }
};

Util.formatRecord = function (obj) {
  var ret = {};

  for (var key in obj) {
    var val = obj[key];
    if (val instanceof Array) val = val.map(function (item) {
      return Util.formatRecord(item);
    });else if (/^-?[0-9]+$/.test(val)) val = _parseInt(val);else if (/^-?[.0-9]+$/.test(val)) val = _parseFloat(val);else if (val == "true" || val == "false") val = Boolean(val);
    ret[key] = val;
  }

  return ret;
};

Util.isArray = function (obj) {
  return obj && obj.length !== undefined || obj instanceof Array;
};

Util.isMap = function (obj) {
  return obj && obj.get !== undefined && obj.keys !== undefined || obj instanceof _Map;
};

Util.effectiveDeviceWidth = function () {
  var deviceWidth = window.orientation == 0 ? window.screen.width : window.screen.height; //iOS returns available pixels, Android returns pixels / pixel ratio
  //http://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html

  if (navigator.userAgent.indexOf("Android") >= 0 && window.devicePixelRatio) {
    deviceWidth = deviceWidth / window.devicePixelRatio;
  }

  return deviceWidth;
};

Util.getFormFields = function (initialState) {
  return Util.mergeObjects([initialState, _toConsumableArray(document.forms).reduce(function (acc, form) {
    return _toConsumableArray(form.elements).reduce(function (acc2, e) {
      return e.name == "" || e.value == undefined || e.value == "undefined" ? acc2 : _Object$assign(acc2, _defineProperty({}, e.name, e.value));
    }, acc);
  }, {})]);
};

Util.mergeObjects = function (objArr) {
  var predicate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (dst, src, key) {
    return src[key] == "" ? undefined : src[key];
  };
  var args = objArr;
  var obj = {};

  for (var i = 0; i < args.length; i++) {
    for (var key in args[i]) {
      var newVal = predicate(obj, args[i], key);
      if (newVal != undefined) obj[key] = newVal;
    }
  }

  return obj;
};

Util.getUserAgent = function () {
  var headers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : req.headers;
  var agent = useragent.parse(headers["user-agent"]);
  return agent;
};

Util.factor = function (start, end) {
  var f = 1;

  for (var i = start; i <= end; i++) {
    f = f * i;
  }

  return f;
};

Util.factorial = function (n) {
  return Util.factor(1, n);
};

Util.lottoChances = function (numbers, draws) {
  var f = Util.factorial;
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
  var args = Array.prototype.slice.call(arguments);
  obj = args.shift();
  var ret = {};
  var pred = typeof args[0] == "function" ? args[0] : function (key) {
    return args.indexOf(key) != -1;
  };

  for (var key in obj) {
    if (pred(key)) ret[key] = obj[key];
  }

  return ret;
};

Util.filterOutKeys = function (obj, arr) {
  return Util.filterKeys(obj, function (key) {
    return arr.indexOf(key) == -1;
  });
};

Util.numbersConvert = function (str) {
  return str.split("").map(function (ch, i) {
    return /[ :,./]/.test(ch) ? ch : String.fromCharCode((str.charCodeAt(i) & 0x0f) + 0x30);
  }).join("");
};

Util.traverse = function (obj, fn) {
  Util.foreach(obj, function (v, k, a) {
    fn(v, k, a);
    if (typeof v === "object") Util.traverse(v, fn);
  });
};

Util.pushUnique = function (arr) {
  var args = Array.prototype.slice.call(arguments);
  arr = args.shift();
  args.forEach(function (item) {
    if (arr.indexOf(item) == -1) arr.push(item);
  });
  return arr;
};

Util.members = function (obj) {
  var names = Util.array();

  for (var name in obj) {
    names.push(name);
  }

  var adder = function adder(name) {
    if (names.indexOf(name) == -1) names.push(name);
  };

  _Object$getOwnPropertyNames(obj).forEach(adder);

  Util.getPrototypeChain(obj).forEach(function (proto) {
    return _Object$getOwnPropertyNames(proto).forEach(adder);
  });
  return names;
};

Util.getMethodNames = function (obj) {
  return Util.array(Util.members(obj).filter(function (item) {
    return typeof obj[item] === "function" && item != "constructor";
  }));
};

Util.getMethods = function (obj) {
  var names = Util.getMethodNames(obj);
  return names.reduce(function (ret, method) {
    return _Object$assign(ret, _defineProperty({}, method, obj[method]));
  }, {});
};

Util.bindMethods = function (methods, obj) {
  for (var name in methods) {
    methods[name] = methods[name].bind(obj);
  }

  return methods;
};

Util.bindMethodsTo = function (dest, obj, methods) {
  for (var name in methods) {
    dest[name] = methods[name].bind(obj);
  }

  return dest;
};

Util.getPrototypeChain = function (obj) {
  var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (p) {
    return p;
  };
  var ret = Util.array();
  var proto;

  while (proto = _Object$getPrototypeOf(obj)) {
    if (proto === Object.prototype) break;
    ret.push(fn(proto));
    obj = proto;
  }

  return ret;
};

Util.weakAssign = function (obj) {
  var args = Array.prototype.slice.call(arguments);
  obj = args.shift();
  args.forEach(function (other) {
    for (var key in other) {
      if (obj[key] === undefined) obj[key] = other[key];
    }
  });
  return obj;
};

Util.getCallerStack = function () {
  var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

  if (position >= Error.stackTraceLimit) {
    throw new TypeError("getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `" + position + "` and Error.stackTraceLimit was: `" + Error.stackTraceLimit + "`");
  }

  var oldPrepareStackTrace = Error.prepareStackTrace;

  Error.prepareStackTrace = function (_, stack) {
    return stack;
  };

  var stack = new Error().stack;
  Error.prepareStackTrace = oldPrepareStackTrace;
  return stack !== null && typeof stack === "object" ? stack.slice(position) : null;
};

Util.getCallerFile = function () {
  var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
  var stack = Util.getCallerStack();

  if (stack !== null && typeof stack === "object") {
    var frame = stack[position]; //stack[0] holds this file
    //stack[1] holds where this function was called
    //stack[2] holds the file we're interested in

    return frame ? frame.getFileName() + ":" + frame.getLineNumber() : undefined;
  }
};

Util.getCallerFunction = function () {
  var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
  var stack = Util.getCallerStack(position + 1);

  if (stack !== null && typeof stack === "object") {
    var frame = stack[0]; //stack[0] holds this file
    //stack[1] holds where this function was called
    //stack[2] holds the file we're interested in

    return frame ? frame.getFunction() : undefined;
  }
};

Util.getCallerFunctionName = function () {
  var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
  var stack = Util.getCallerStack(position + 1);

  if (stack !== null && typeof stack === "object") {
    var frame = stack[0]; //stack[0] holds this file
    //stack[1] holds where this function was called
    //stack[2] holds the file we're interested in

    return frame ? frame.getMethodName() || frame.getFunctionName() : undefined;
  }
};

Util.getCallerFunctionNames = function () {
  var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
  var stack = Util.getCallerStack(position + 1);

  if (stack !== null && typeof stack === "object") {
    var ret = [];

    for (var i = 0; stack[i]; i++) {
      var frame = stack[i];
      ret.push(frame ? frame.getMethodName() || frame.getFunctionName() : undefined);
    }

    return ret;
  }
};

Util.getCaller = function () {
  var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
  var stack = Util.getCallerStack(position + 1);
  var methods = ["getColumnNumber", "getEvalOrigin", "getFileName", "getFunction", "getFunctionName", "getLineNumber", "getMethodName", "getPosition", "getPromiseIndex", "getScriptNameOrSourceURL", "getThis", "getTypeName"];

  if (stack !== null && typeof stack === "object") {
    var frame = stack[0];
    return methods.reduce(function (acc, m) {
      if (frame[m]) {
        var name = Util.lcfirst(m.replace(/^get/, ""));
        var value = frame[m]();

        if (value != undefined) {
          acc[name] = value;
        }
      }

      return acc;
    }, {});
  }
};

Util.getCallers = function () {
  var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
  var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var ret = [];
  var i = start;

  while (i++ < start + num) {
    try {
      ret.push(Util.getCaller(i + 1));
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

Util.hashString = function (string) {
  var bits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;
  var mask = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0xffffffff;
  var ret = 0;
  var bitc = 0;

  for (var i = 0; i < string.length; i++) {
    var code = string.charCodeAt(i);
    ret *= 186;
    ret ^= code;
    bitc += 8;
    ret = Util.rotateLeft(ret, 7) & mask;
  }

  return ret & 0x7fffffff;
};

Util.flatTree = function (tree, addOutput) {
  var ret = [];
  if (!addOutput) addOutput = function addOutput(arg) {
    return ret.push(arg);
  };
  addOutput(Util.filterKeys(tree, function (key) {
    return key !== "children";
  }));

  if (typeof tree.children == "object" && tree.children.length) {
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = _getIterator(tree.children), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var child = _step5.value;
        Util.flatTree(child, addOutput);
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
          _iterator5["return"]();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  }

  return ret;
};

Util.traverseTree = function (tree, fn) {
  var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  fn(tree, depth, parent);

  if (typeof tree == "object" && tree !== null && typeof tree.children == "object" && tree.children.length) {
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = _getIterator(tree.children), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var child = _step6.value;
        Util.traverseTree(child, fn, depth + 1, tree);
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
          _iterator6["return"]();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  }
};

Util.walkTree = /*#__PURE__*/_regeneratorRuntime.mark(function _callee(node) {
  var depth,
      parent,
      pred,
      t,
      _i,
      _arr,
      child,
      _args4 = arguments;

  return _regeneratorRuntime.wrap(function _callee$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          depth = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : 0;
          parent = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : null;
          pred = _args4.length > 3 ? _args4[3] : undefined;
          t = _args4.length > 4 ? _args4[4] : undefined;
          if (!pred) pred = function pred(i) {
            return true;
          };
          if (!t) t = function t(i) {
            return i;
          };

          if (!pred(node, depth, parent)) {
            _context4.next = 9;
            break;
          }

          _context4.next = 9;
          return t(node);

        case 9:
          if (!(typeof node == "object" && node !== null && typeof node.children == "object" && node.children.length)) {
            _context4.next = 17;
            break;
          }

          _i = 0, _arr = _toConsumableArray(node.children);

        case 11:
          if (!(_i < _arr.length)) {
            _context4.next = 17;
            break;
          }

          child = _arr[_i];
          return _context4.delegateYield(Util.walkTree(child, depth + 1, node, pred, t), "t0", 14);

        case 14:
          _i++;
          _context4.next = 11;
          break;

        case 17:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee);
});

Util.isPromise = function (obj) {
  return Boolean(obj) && typeof obj.then === "function";
};
/* eslint-disable no-use-before-define */


if (typeof setImmediate !== "function") var setImmediate = function setImmediate(fn) {
  return setTimeout(fn, 0);
};

Util.next = function (iter, observer) {
  var prev = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  var item;

  try {
    item = iter.next(prev);
  } catch (err) {
    return observer.error(err);
  }

  var value = item.value;
  if (item.done) return observer.complete();

  if (isPromise(value)) {
    value.then(function (val) {
      observer.next(val);
      setImmediate(function () {
        return Util.next(iter, observer, val);
      });
    })["catch"](function (err) {
      return observer.error(err);
    });
  } else {
    observer.next(value);
    setImmediate(function () {
      return Util.next(iter, observer, value);
    });
  }
};

Util.getImageAverageColor = function (imageElement, options) {
  if (!imageElement) {
    return false;
  }

  options = options || {};
  var settings = {
    tooDark: (options.tooDark || 0.03) * 255 * 3,
    // How dark is too dark for a pixel
    tooLight: (options.tooLight || 0.97) * 255 * 3,
    // How light is too light for a pixel
    tooAlpha: (options.tooAlpha || 0.1) * 255 // How transparent is too transparent for a pixel

  };
  var w = imageElement.width,
      h = imageElement.height; // Setup canvas and draw image onto it

  var context = document.createElement("canvas").getContext("2d");
  context.drawImage(imageElement, 0, 0, w, h); // Extract the rgba data for the image from the canvas

  var subpixels = context.getImageData(0, 0, w, h).data;
  var pixels = {
    r: 0,
    g: 0,
    b: 0,
    a: 0
  };
  var processedPixels = 0;
  var pixel = {
    r: 0,
    g: 0,
    b: 0,
    a: 0
  };
  var luma = 0; // Having luma in the pixel object caused ~10% performance penalty for some reason
  // Loop through the rgba data

  for (var i = 0, l = w * h * 4; i < l; i += 4) {
    pixel.r = subpixels[i];
    pixel.g = subpixels[i + 1];
    pixel.b = subpixels[i + 2];
    pixel.a = subpixels[i + 4]; // Only consider pixels that aren't black, white, or too transparent

    if (pixel.a > settings.tooAlpha && (luma = pixel.r + pixel.g + pixel.b) > settings.tooDark && // Luma is assigned inside the conditional to avoid re-calculation when alpha is not met
    luma < settings.tooLight) {
      pixels.r += pixel.r;
      pixels.g += pixel.g;
      pixels.b += pixel.b;
      pixels.a += pixel.a;
      processedPixels++;
    }
  } // Values of the channels that make up the average color


  var channels = {
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

  var o = _Object$assign({}, channels, {
    toStringRgb: function toStringRgb() {
      // Returns a CSS compatible RGB string (e.g. '255, 255, 255')
      var r = this.r,
          g = this.g,
          b = this.b;
      return [r, g, b].join(", ");
    },
    toStringRgba: function toStringRgba() {
      // Returns a CSS compatible RGBA string (e.g. '255, 255, 255, 1.0')
      var r = this.r,
          g = this.g,
          b = this.b,
          a = this.a;
      return [r, g, b, a].join(", ");
    },
    toStringHex: function toStringHex() {
      // Returns a CSS compatible HEX coloor string (e.g. 'FFA900')
      var toHex = function toHex(d) {
        h = Math.round(d).toString(16);

        if (h.length < 2) {
          h = "0" + h;
        }

        return h;
      };

      var r = this.r,
          g = this.g,
          b = this.b;
      return [toHex(r), toHex(g), toHex(b)].join("");
    }
  });

  return o;
};

module.exports = Util;
module.exports["default"] = Util;
