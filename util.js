//var useragent = require('useragent');

const formatAnnotatedObject = (subject, { indent = "  ", spacing = " ", separator = ",", newline = "\n", maxlen = 30, depth = 1 }) => {
  const i = indent.repeat(Math.abs(1 - depth));
  let nl = newline != "" ? newline + i : spacing;
  const opts = {
    newline: depth >= 0 ? newline : "",
    depth: depth - 1
  };
  if(subject && subject.toSource !== undefined) return subject.toSource();
  if(subject instanceof Date) return `new Date('${new Date().toISOString()}')`;
  if(typeof subject == "string") return `'${subject}'`;

  if(subject != null && subject["y2"] !== undefined) {
    return "rect[" + spacing + subject["x"] + separator + subject["y"] + " | " + subject["x2"] + separator + subject["y2"] + " (" + subject["w"] + "x" + subject["h"] + ")" + " ]";
  }
  if("map" in subject && typeof subject.map == "function") {
    //subject instanceof Array || (subject && subject.length !== undefined)) {
    return "[" + nl + /*(opts.depth <= 0) ? subject.length + '' : */ subject.map(i => formatAnnotatedObject(i, opts)).join(separator + nl) + "]";
  }
  if(typeof subject === "string" || subject instanceof String) {
    return "'" + subject + "'";
  }
  let longest = "";
  let r = [];
  for(let k in subject) {
    if(k.length > longest.length) longest = k;
    let s = "";

    //if(typeof(subject[k]) == 'string') s = subject[k];

    if(typeof subject[k] === "symbol") {
      s = "Symbol";
    } else if(typeof subject[k] === "string" || subject[k] instanceof String) {
      s = "'" + subject[k] + "'";
    } else if(typeof subject[k] === "function") {
      s = Util.fnName(s) || "function";
      s += "()";
    } else if(typeof subject[k] === "number" || typeof subject[k] === "boolean") {
      s = "" + subject[k];
    } else if(subject[k] === null) {
      s = "null";
    } else if(subject[k] && subject[k].length !== undefined) {
      try {
        s = depth <= 0 ? `Array(${subject[k].length})` : "[ " + subject[k].map(item => formatAnnotatedObject(item, opts)).join(", ") + " ]";
      } catch(err) {
        s = "[" + subject[k] + "]";
      }
    } else if(subject[k] && subject[k].toSource !== undefined) {
      s = subject[k].toSource();
    } else if(opts.depth >= 0) {
      s = s.length > maxlen ? "[Object " + Util.objName(subject[k]) + "]" : formatAnnotatedObject(subject[k], opts);
    }
    r.push([k, s]);
  }
  //console.log("longest: ", longest)
  let padding = x => Util.pad(x, longest.length, spacing);
  let j = separator + spacing;
  if(r.length > 6) {
    nl = opts.newline + i;
    j = separator + (opts.newline || spacing) + i;
  }
  //padding = x => '';

  let ret = "{" + opts.newline + r.map(arr => padding(arr[0]) + arr[0] + ":" + spacing + arr[1]).join(j) + opts.newline + "}";
  return ret;
};
/**
 * Class for utility.
 *
 * @class      Util (name)
 */
function Util() {}

Util.isDebug = function() {
  if(process !== undefined && process.env.NODE_ENV === "production") return false;

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
Util.log = (function() {
  var log = Math.log;
  return function(n, base) {
    return log(n) / (base ? log(base) : 1);
  };
})();

Util.logBase = (n, base) => Math.log(n) / Math.log(base);
Util.generalLog = (n, x) => Math.log(x) / Math.log(n);
Util.toSource = arg => {
  if(typeof arg == "string") return "'" + arg + "'";
  if(arg && arg.x !== undefined && arg.y !== undefined) {
    return "[" + arg.x + "," + arg.y + "]";
  }
  if(arg && arg.toSource) return arg.toSource();
  let cls = arg && arg.constructor && Util.fnName(arg.constructor);

  return String(arg);
};
Util.debug = function(message) {
  const args = [...arguments];
  let cache = Util.array();

  const removeCircular = (key, value) => {
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
  //console.log("STR: "+str);

  console.log.call(console, str);
  //Util.log.apply(Util, args)
};

Util.type = obj => (obj.type && String(obj.type).split(/[ ()]/)[1]) || "";

Util.functionName = fn => {
  const matches = /function\s*([^(]*)\(.*/g.exec(String(fn));
  if(matches && matches[1]) return matches[1];
  return null;
};

Util.className = obj => Util.functionName(obj.constructor);

Util.unwrapComponent = c => {
  for(;;) {
    if(c.wrappedComponent) c = c.wrappedComponent;
    else if(c.WrappedComponent) c = c.WrappedComponent;
    else break;
  }
  return c;
};
Util.componentName = c => {
  for(;;) {
    if(c.displayName || c.name) {
      return (c.displayName || c.name).replace(/.*\(([A-Za-z0-9_]+).*/, "$1");
    } else if(c.wrappedComponent) c = c.wrappedComponent;
    else if(c.WrappedComponent) c = c.WrappedComponent;
    else break;
  }
  return Util.fnName(c);
};

Util.count = (s, ch) => (String(s).match(new RegExp(ch, "g")) || Util.array()).length;

Util.parseNum = str => {
  let num = parseFloat(str);
  if(isNaN(num)) num = 0;
  return num;
};
Util.minmax = (num, min, max) => Math.min(Math.max(num, min), max);
Util.getExponential = function(num) {
  let str = typeof num == "string" ? num : num.toExponential();
  const matches = /e\+?(.*)$/.exec(str);
  //console.log("matches: ", matches);
  return parseInt(matches[1]);
};
Util.getNumberParts = function(num) {
  let str = typeof num == "string" ? num : num.toExponential();
  const matches = /^(-?)(.*)e\+?(.*)$/.exec(str);
  //console.log("matches: ", matches);
  const negative = matches[1] == "-";
  return {
    negative,
    mantissa: parseFloat(matches[2]),
    exponent: parseInt(matches[3])
  };
};
Util.pow2 = n => Math.pow(2, n);
Util.pow10 = n => (n >= 0 ? Math.pow(10, n) : 1 / Math.pow(10, -n));

Util.bitValue = n => Util.pow2(n - 1);

Util.toBinary = num => parseInt(num).toString(2);

Util.toBits = num => {
  let a = Util.toBinary(num)
    .split("")
    .reverse();
  return Array.from(Object.assign({}, a, { length: 50 }), bit => (bit ? 1 : 0));
};

Util.getBit = (v, n) => {
  let s = v.toString(2);
  return n < s.length ? parseInt(s[s.length - n - 1]) : 0;
};

Util.isSet = (v, n) => {
  return Util.getBit(v, n) == 1;
};

Util.bitCount = n => Util.count(Util.toBinary(n), "1");

Util.toggleBit = (num, bit) => {
  const n = Number(num);
  return Util.isSet(n, bit) ? n - Util.pow2(bit) : n + Util.pow2(bit);
};

Util.setBit = (num, bit) => {
  const n = Number(num);
  return Util.isSet(n, bit) ? n : n + Util.pow2(bit);
};

Util.clearBit = (num, bit) => {
  const n = Number(num);
  return Util.isSet(n, bit) ? n - Util.pow2(bit) : n;
};

Util.range = (start, end) => {
  const r = Array.from({ length: end - start + 1 }, (v, k) => k + start);
  //console.log("Util.range ", r);
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

Util.bitsToNumbers = bits => {
  let a = Util.toBinary(bits).split("");
  let r = Util.array();
  //return a;
  a.forEach((val, key, arr) => val == "1" && r.unshift(a.length - key));
  return r;
};

Util.shuffle = (arr, rnd = Util.rng) => {
  arr.sort((a, b) => 0.5 - rnd());
  return arr;
};
Util.sortNum = arr => {
  arr.sort((a, b) => a - b);
  //console.log("Util.sortNum ", { arr });
  return arr;
};

Util.draw = (arr, n, rnd = Util.rng) => {
  const r = Util.shuffle(arr, rnd).splice(0, n);
  //console.log("Util.draw ", { arr, n, r });
  return r;
};

Util.is = {
  on: val => val == "on" || val === "true" || val === true,
  off: val => val == "off" || val === "false" || val === false,
  true: val => val === "true" || val === true,
  false: val => val === "false" || val === false
};

Util.onoff = val => {
  if(Util.is.on(val)) return true;
  if(Util.is.off(val)) return false;
  return undefined;
};

Util.numbersToBits = arr => arr.reduce((bits, num) => bits + Util.bitValue(num), 0);

Util.randomNumbers = ([start, end], draws) => {
  const r = Util.sortNum(Util.draw(Util.range(start, end), draws));
  //console.log("Util.randomNumbers ", { start, end, draws, r });
  return r;
};

Util.randomBits = (r = [1, 50], n = 5) => Util.numbersToBits(Util.randomNumbers(r, n));

Util.pad = (s, n, char = " ") => (s.length < n ? char.repeat(n - s.length) : "");

Util.abbreviate = function(str, max, suffix = "...") {
  if(str.length > max) {
    return str.substring(0, max - suffix.length) + suffix;
  }
  return str;
};

Util.trim = function(str, charset) {
  const r1 = RegExp("^[" + charset + "]*");
  const r2 = RegExp("[" + charset + "]*$");
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

Util.extendArray = (arr = Array.prototype) => {
  /*  Util.define(arr, 'tail', function() {
    return this[this.length - 1];
  });*/
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
  /*Util.define(arr, 'inspect', function(opts = {}) {
    return Util.inspect(this, { depth: 100, ...opts });
  });*/
};
Util.adapter = function(obj, getLength = obj => obj.length, getKey = (obj, index) => obj.key(index), getItem = (obj, key) => obj[key], setItem = (obj, index, value) => (obj[index] = value)) {
  var adapter = {
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
    *keys() {
      var length = getLength(obj);
      for(let i = 0; i < length; i++) yield getKey(obj, i);
    },
    *entries() {
      for(let key of this.keys()) yield [key, getItem(obj, key)];
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

Util.adapter.localStorage = (s = localStorage) =>
  Util.adapter(
    s,
    l => l.length,
    (l, i) => l.key(i),
    (l, key) => JSON.parse(l.getItem(key)),
    (l, key, v) => l.setItem(key, JSON.stringify(v))
  );

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
    //if(m.toObject === undefined) Util.extendMap();
    if(m.toObject === undefined) Util.extendMap(m);
  } catch(err) {}
  return m;
};
Util.extendMap = function(map) {
  if(map.entries === undefined) {
    map.entries = function* iterator() {
      for(let entry of map) {
        if(entry.name !== undefined && entry.value !== undefined) yield [entry.name, entry.value];
        else if(entry[0] !== undefined && entry[1] !== undefined) yield entry;
        else yield [entry, map[entry]];
      }
    };
  }
  map.toObject = function() {
    return Object.fromEntries(this.entries());
  };
  map.match = function() {
    return Util.match.apply(this, arguments);
  };
};
Util.objectFrom = any => {
  if("toJS" in any) any = any.toJS();
  if("entries" in any) return Object.fromEntries(any.entries());

  return { ...any };
};

Util.tail = function(arr) {
  return arr && arr.length > 0 ? arr[arr.legth - 1] : null;
};

Util.splice = function(str, index, delcount, insert) {
  var chars = str.split("");
  Array.prototype.splice.apply(chars, arguments);
  return chars.join("");
};

Util.keyOf = (obj, prop) => {
  const keys = Object.keys(obj);
  for(let k in keys) {
    if(obj[k] === prop) return k;
  }
  return undefined;
};

Util.rotateRight = (arr, n) => {
  arr.unshift.apply(arr, arr.splice(n, arr.length));
  return arr;
};

Util.repeat = (n, what) => {
  let ret = [];
  while(n-- > 0) ret.push(what);
  return ret;
};

/*Util.define(
  String.prototype,
  'splice',
  function(index, delcount, insert) {
    return Util.splice.apply(this, [this, ...arguments]);
  }
);*/

Util.fnName = (f, parent) => {
  if(f !== undefined && f.name !== undefined) return f.name;
  const s = f.toSource ? f.toSource() : f + "";
  const matches = /([A-Za-z_][0-9A-Za-z_]*)\w*[(\]]/.exec(s);
  if(matches) return matches[1];
  if(parent !== undefined) {
    for(let key in parent) {
      if(parent[key] === f) return key;
    }
  }
  return undefined;
};

Util.keys = obj => {
  let r = Util.array();
  for(let i in obj) r.push(i);
  return r;
};

Util.objName = o => {
  if(o === undefined || o == null) return o + "";
  if(typeof o === "function" || o instanceof Function) return Util.fnName(o);

  if(o.constructor) return Util.fnName(o.constructor);
  const s = o.type + "";
  return s;
};

Util.findKey = (obj, value) => {
  for(let k in obj) {
    if(obj[k] === value) return k;
  }
  return null;
};

Util.find = (arr, value, prop = "id", acc = Util.array()) => {
  let pred;
  if(typeof value == "function") pred = value;
  else if(prop && prop.length !== undefined) {
    pred = obj => {
      if(obj[prop] == value) return true;
      return false;
    };
  } else pred = obj => obj[prop] == value;

  for(let k = 0; k < arr.length; k++) {
    let v = arr[k];
    // console.log("v: ", v, "k:", k);
    /*if(Util.isArray(v)) {
      for(let i = 0; i < v.length; i++)
        if(pred(v[i]))
          return v[i];

    } else */ {
      if(pred(v)) return v;
    }
  }
  return null;
};

Util.match = (arg, pred) => {
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
    // console.log('Util.match ', { arg });
    return [...arg.keys()].reduce((acc, key) => (match(arg.get(key), key, arg) ? acc.set(key, arg.get(key)) : acc), new Map());
  } else {
    let i = 0;
    let ret = [];
    for(let item of arg) {
      if(match(item, i, arg)) ret.push(item);
    }
    return ret;
    //    return Object.keys(arg).reduce((acc, key) => (match(arg[key], key, arg) ? { ...acc, [key]: arg[key] } : {}), {});
  }
};

Util.toHash = (map, keyTransform = k => Util.camelize(k)) => {
  let ret = {};

  for(let i = 0; i < map.length; i++) {
    const key = map[i];
    ret[keyTransform(key)] = map[key];
  }
  return ret;
};

Util.indexOf = (obj, prop) => {
  for(let key in obj) {
    if(obj[key] === prop) return key;
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
Util.toString = function() {};

Util.dump = function(name, props) {
  var args = [name];

  for(let key in props) {
    args.push("\n\t" + key + ": ");
    args.push(props[key]);
  }

  if("window" in global !== false) {
    //if(window.alert !== undefined)
    //alert(args);

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
/**
 * Camelize a string, cutting the string by multiple separators like
 * hyphens, underscores and spaces.
 *
 * @param {text} string Text to camelize
 * @return string Camelized text
 */
Util.camelize = function(text, sep = "") {
  return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
    if(p2) return sep + p2.toUpperCase();
    return p1.toLowerCase();
  });
};
Util.decamelize = (str, separator = "-") =>
  /[A-Z]/.test(str)
    ? str
        .replace(/([a-z\d])([A-Z])/g, "$1" + separator + "$2")
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1" + separator + "$2")
        .toLowerCase()
    : str;

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
  if(!v) {
    return true;
  }
  if(!v.length) {
    return true;
  }
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
//deep copy
Util.deepClone = function(data) {
  return JSON.parse(JSON.stringify(data));
};

// Function
Util.findVal = (object, propName, maxDepth = 10) => {
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
//Deep copy for ObservableArray/Object == There is a problem
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
      for(const value of data) {
        o.push(this.deepCloneObservable(value));
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

//Convert ObservableArray to Array
Util.toArray = function(observableArray) {
  return observableArray.slice();
};

/**
 * Convert the original array to tree
 * @param data original array
 * @param id id field
 * @param pId parent id field
 * @param appId the parent id value of the level one array
 */
Util.arryToTree = function(data, id, pId, appId) {
  const arr = Util.array();
  data.map((e, i) => {
    e[pId] === appId && arr.push(e);
  });
  const res = this.to3wei(arr, data, id, pId);
  return res;
};

/**
 * Convert a first-level branch array to a tree
 * @param a level one branch array
 * @param old original array
 * @param id id field
 * @param pId parent id field
 */
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

/**
 * Exchange 2 element positions in the array
 * @param arr original array
 * @param i First element Starting from 0
 * @param j The second element starts at 0
 */
Util.arrExchangePos = function(arr, i, j) {
  arr[i] = arr.splice(j, 1, arr[i])[0];
};

Util.arrRemove = function(arr, i) {
  const index = arr.indexOf(i);
  if(index > -1) arr.splice(index, 1);
};

Util.removeEqual = function(a, b) {
  let c = {};

  for(let key in { ...a }) {
    if(b[key] === a[key]) continue;
    c[key] = a[key];
  }
  return c;
};

//Remove the storage when logging out
Util.logOutClearStorage = function() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userLoginPermission");
  localStorage.removeItem("ssoToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("userGroupList");
  localStorage.removeItem("gameAuthList");
};

//Take the cookies
Util.getCookie = function(cookie, name) {
  let arr = cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
  if(arr != null) return unescape(arr[2]);
  return null;
};

Util.parseCookie = (c = document.cookie) => {
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

/*

    matches.shift();


    return matches.reduce((acc, part) => {
      const a = part.trim().split('=');
      return { ...acc, [a[0]]: decodeURIComponent(a[1]) };
    }, {});
  };*/

Util.encodeCookie = c =>
  Object.entries(c)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("; ");

Util.setCookies = c =>
  Object.entries(c).forEach(([key, value]) => {
    document.cookie = `${key}=${value}`;
    console.log(`Setting cookie[${key}] = ${value}`);
  });

Util.clearCookies = c => Util.setCookies(Object.keys(Util.parseCookie(c)).reduce((acc, name) => ({ ...acc, [name]: "; max-age=0; expires=" + new Date().toUTCString() }), {}));

Util.deleteCookie = name => {
  if(global.window) document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};

Util.accAdd = function(arg1, arg2) {
  var r1, r2, m;
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
//js subtraction calculation
//
Util.Subtr = function(arg1, arg2) {
  var r1, r2, m, n;
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
  //last modify by deeka
  //动态控制精度长度
  n = r1 >= r2 ? r1 : r2;
  return (arg1 * m - arg2 * m) / m;
};

//js division function
//
Util.accDiv = function(arg1, arg2) {
  var t1 = 0;
  var t2 = 0;
  var r1;
  var r2;
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

//js multiplication function
//
Util.accMul = function(arg1, arg2) {
  var m = 0;
  var s1 = arg1.toString();
  var s2 = arg2.toString();
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
  month = month > 9 ? month : `0${month}`;
  let day = date.getDate();
  day = day > 9 ? day : `0${day}`;
  let hour = date.getHours();
  hour = hour > 9 ? hour : `0${hour}`;
  let minute = date.getMinutes();
  minute = minute > 9 ? minute : `0${minute}`;
  let second = date.getSeconds();
  second = second > 9 ? second : `0${second}`;

  return formate
    .replace(/Y+/, `${year}`.slice(-formate.match(/Y/g).length))
    .replace(/M+/, month)
    .replace(/D+/, day)
    .replace(/h+/, hour)
    .replace(/m+/, minute)
    .replace(/s+/, second);
};

Util.numberFormatter = function(numStr) {
  let numSplit = numStr.split(".");

  return numSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",").concat(`.${numSplit[1]}`);
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
    result.push({ path: currentPath, value: object });
  }
  try {
    if(object === Object(object)) {
      for(var property in object) {
        const desc = Object.getOwnPropertyDescriptor(object, property);
        //console.log('x ', {property, desc})
        if(property.indexOf("$") !== 0 && typeof object[property] !== "function" && !desc.get && !desc.set) {
          if(typeof object[property] === "object") {
            try {
              JSON.stringify(object[property]);
            } catch(err) {
              continue;
            }
          }
          //if (Object.prototype.hasOwnProperty.call(object, property)) {
          Util.searchObject(object[property], matchCallback, currentPath + "." + property, result, searched);
          //}
        }
      }
    }
  } catch(e) {
    console.log(object);
    //throw e;
  }
  return result;
};

Util.getURL = function(req = {}) {
  let proto = process.env.NODE_ENV === "production" ? "https" : "http";
  let port = process.env.NODE_ENV === "production" ? 443 : 8080;

  let host = global.ip || global.host || "localhost";
  if(req && req.headers && req.headers.host !== undefined) {
    host = req.headers.host.replace(/:.*/, "");
  } else if(process.env.HOST !== undefined) host = process.env.HOST;

  if(global.window !== undefined && window.location !== undefined) return window.location.href;
  if(req.url !== undefined) return req.url;

  if(global.process !== undefined && global.process.url !== undefined) return global.process.url;

  const url = `${proto}://${host}:${port}`;
  console.log("getURL process ", { url });
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
  for(let d in data) ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  return ret.join("&");
};
Util.parseURL = function(href = this.getURL()) {
  const matches = /^([^:]*):\/\/([^/:]*)(:[0-9]*)?(\/?.*)/.exec(href);
  if(!matches) return null;
  const argstr = matches[4].replace(/^[^?]*\?/, "?") + "&test=1";
  const pmatches = typeof argstr === "string" ? /[?&]([^?&=]*)=([^?&]*)/g.exec(argstr) : Util.array();
  const params = [...pmatches].reduce((acc, m) => {
    acc[m[1]] = m[2];
    return acc;
  }, {});
  //console.log('PARAMS: ', { argstr, pmatches, params });
  return {
    protocol: matches[1],
    host: matches[2],
    port: typeof matches[3] === "string" ? parseInt(matches[3].substring(1)) : 443,
    location: matches[4].replace(/\?.*/, ""),
    query: params,
    href(override) {
      if(typeof override === "object") Object.assign(this, override);
      const qstr = Util.encodeQuery(this.query);
      return (this.protocol ? `${this.protocol}://` : "") + (this.host ? this.host : "") + (this.port ? ":" + this.port : "") + `${this.location}` + (qstr != "" ? "?" + qstr : "");
    }
  };
};

Util.makeURL = function() {
  const args = [...arguments];
  let href = typeof args[0] === "string" ? args.shift() : this.getURL();
  let urlObj = null;
  let host = global.ip || global.host || "localhost";
  if(String(href).indexOf("://") == -1) href = `http://${host}:8080`;

  urlObj = this.parseURL(href);

  return urlObj ? urlObj.href(args[0]) : null;
};
Util.numberFromURL = function(url, fn) {
  const obj = typeof url === "object" ? url : this.parseURL(url);
  const nr_match = RegExp(".*[^0-9]([0-9]+)$").exec(url.location);
  const nr_arg = nr_match ? nr_match[1] : undefined;
  const nr = nr_arg && parseInt(nr_arg);
  if(!isNaN(nr) && typeof fn === "function") fn(nr);
  return nr;
};
Util.isBrowser = () => {
  return !!(global.window && global.window.document);
};
Util.isServer = () => {
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
  let hash = arr1.reduce((acc, it) => ({ [it[key]]: it, ...acc }), {});
  hash = arr2.reduce((acc, it) => ({ [it[key]]: it, ...acc }), {});
  let ret = Util.array();
  for(let k in hash) {
    if(hash[k][key]) ret.push(hash[k]);
  }
  return ret;
};
Util.throttle = function(fn, wait) {
  var time = Date.now();
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
var map = Util.map;
Util.map = (obj, fn) => {
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
Util.parseDate = d => {
  return /^[0-9]+$/.test(d) ? Util.fromUnixTime(d) : new Date(d);
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
    if(fmt.startsWith("H")) num = ("0" + date.getHours()).substring(0, n);
    else if(fmt.startsWith("M")) num = ("0" + date.getMinutes()).substring(0, n);
    else if(fmt.startsWith("S")) num = ("0" + date.getSeconds()).substring(0, n);
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
  if(days) ret = days + " days " + ret;
  if(weeks) ret = weeks + " weeks " + ret;
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
  return Math.round(value / prec) * prec;
};
Util.base64 = {
  encode: utf8 => window.btoa(unescape(encodeURIComponent(utf8))),
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
  var deviceWidth = window.orientation == 0 ? window.screen.width : window.screen.height;
  //iOS returns available pixels, Android returns pixels / pixel ratio
  //http://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html
  if(navigator.userAgent.indexOf("Android") >= 0 && window.devicePixelRatio) {
    deviceWidth = deviceWidth / window.devicePixelRatio;
  }
  return deviceWidth;
};
Util.getFormFields = function(initialState) {
  return Util.mergeObjects([initialState, [...document.forms].reduce((acc, form) => [...form.elements].reduce((acc2, e) => (e.name == "" || e.value == undefined || e.value == "undefined" ? acc2 : { ...acc2, [e.name]: e.value }), acc), {})]);
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
  var agent = useragent.parse(headers["user-agent"]);
  return agent;
};
Util.factor = function(start, end) {
  var f = 1;
  for(var i = start; i <= end; i++) {
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
  const adder = name => {
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
  return names.reduce((ret, method) => ({ ...ret, [method]: obj[method] }), {});
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
    throw new TypeError("getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `" + position + "` and Error.stackTraceLimit was: `" + Error.stackTraceLimit + "`");
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
    //stack[0] holds this file
    //stack[1] holds where this function was called
    //stack[2] holds the file we're interested in
    return frame ? frame.getFileName() + ":" + frame.getLineNumber() : undefined;
  }
};
Util.getCallerFunction = function(position = 2) {
  let stack = Util.getCallerStack(position + 1);

  if(stack !== null && typeof stack === "object") {
    const frame = stack[0];
    //stack[0] holds this file
    //stack[1] holds where this function was called
    //stack[2] holds the file we're interested in
    return frame ? frame.getFunction() : undefined;
  }
};
Util.getCallerFunctionName = function(position = 2) {
  let stack = Util.getCallerStack(position + 1);

  if(stack !== null && typeof stack === "object") {
    const frame = stack[0];
    //stack[0] holds this file
    //stack[1] holds where this function was called
    //stack[2] holds the file we're interested in
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
Util.hashString = function(string, bits = 32, mask = 0xffffffff) {
  var ret = 0;
  var bitc = 0;
  for(var i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);

    ret ^= code;
    bitc += 8;
    ret = ((ret << 8) | ((ret >> (bits - 8)) & 0xff)) & mask;
  }
  return ret;
};
Util.flatTree = function(tree, addOutput) {
  var ret = [];
  if(!addOutput) addOutput = arg => ret.push(arg);

  addOutput(Util.filterKeys(tree, key => key !== "children"));

  if(typeof tree.children == "object" && tree.children.length) for(let child of tree.children) Util.flatTree(child, addOutput);
  return ret;
};
Util.traverseTree = function(tree, fn, depth = 0, parent = null) {
  fn(tree, depth, parent);
  if(typeof tree.children == "object" && tree.children.length) for(let child of tree.children) Util.traverseTree(child, fn, depth + 1, tree);
};
Util.getImageAverageColor = function(imageElement, options) {
  if(!imageElement) {
    return false;
  }

  options = options || {};
  var settings = {
    tooDark: (options.tooDark || 0.03) * 255 * 3, // How dark is too dark for a pixel
    tooLight: (options.tooLight || 0.97) * 255 * 3, // How light is too light for a pixel
    tooAlpha: (options.tooAlpha || 0.1) * 255 // How transparent is too transparent for a pixel
  };

  var w = imageElement.width,
    h = imageElement.height;

  // Setup canvas and draw image onto it
  var context = document.createElement("canvas").getContext("2d");
  context.drawImage(imageElement, 0, 0, w, h);

  // Extract the rgba data for the image from the canvas
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
  for(var i = 0, l = w * h * 4; i < l; i += 4) {
    pixel.r = subpixels[i];
    pixel.g = subpixels[i + 1];
    pixel.b = subpixels[i + 2];
    pixel.a = subpixels[i + 4];

    // Only consider pixels that aren't black, white, or too transparent
    if(
      pixel.a > settings.tooAlpha &&
      (luma = pixel.r + pixel.g + pixel.b) > settings.tooDark && // Luma is assigned inside the conditional to avoid re-calculation when alpha is not met
      luma < settings.tooLight
    ) {
      pixels.r += pixel.r;
      pixels.g += pixel.g;
      pixels.b += pixel.b;
      pixels.a += pixel.a;

      processedPixels++;
    }
  }

  // Values of the channels that make up the average color
  var channels = {
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

  var o = {
    ...channels,
    toStringRgb: function() {
      // Returns a CSS compatible RGB string (e.g. '255, 255, 255')
      const { r, g, b } = this;
      return [r, g, b].join(", ");
    },
    toStringRgba: function() {
      // Returns a CSS compatible RGBA string (e.g. '255, 255, 255, 1.0')
      const { r, g, b, a } = this;
      return [r,g,b,a].join(", ");
    },
    toStringHex: function() {
      // Returns a CSS compatible HEX coloor string (e.g. 'FFA900')
      var toHex = function(d) {
        h = Math.round(d).toString(16);

        if(h.length < 2) {
          h = "0" + h;
        }
        return h;
      };
      const { r, g, b } = this;
      return [toHex(r), toHex(g), toHex(b)].join("");
    }
  };

  return o;
};

module.exports = Util;
module.exports.default = Util;
