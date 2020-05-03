//import debug from "debug";

const formatAnnotatedObject = function(subject, { indent = '  ', spacing = ' ', separator = ',', newline = '\n', maxlen = 30, depth = 1 }) {
  const i = indent.repeat(Math.abs(1 - depth));
  let nl = newline != '' ? newline + i : spacing;
  const opts = {
    newline: depth >= 0 ? newline : '',
    depth: depth - 1
  };
  if(subject && subject.toSource !== undefined) return subject.toSource();
  if(subject instanceof Date) return `new Date('${new Date().toISOString()}')`;
  if(typeof subject == 'string') return `'${subject}'`;
  if(subject != null && subject['y2'] !== undefined) {
    return `rect[${spacing}${subject['x']}${separator}${subject['y']} | ${subject['x2']}${separator}${subject['y2']} (${subject['w']}x${subject['h']}) ]`;
  }
  if(typeof subject == 'object' && 'map' in subject && typeof subject.map == 'function') {
    //subject instanceof Array || (subject && subject.length !== undefined)) {
    return /*(opts.depth <= 0) ? subject.length + '' : */ `[${nl}${/*(opts.depth <= 0) ? subject.length + '' : */ subject.map(i => formatAnnotatedObject(i, opts)).join(separator + nl)}]`;
  }
  if(typeof subject === 'string' || subject instanceof String) {
    return `'${subject}'`;
  }
  let longest = '';
  let r = [];
  for(let k in subject) {
    if(k.length > longest.length) longest = k;
    let s = '';
    //if(typeof(subject[k]) == 'string') s = subject[k];
    if(typeof subject[k] === 'symbol') {
      s = 'Symbol';
    } else if(typeof subject[k] === 'string' || subject[k] instanceof String) {
      s = `'${subject[k]}'`;
    } else if(typeof subject[k] === 'function') {
      s = Util.fnName(s) || 'function';
      s += '()';
    } else if(typeof subject[k] === 'number' || typeof subject[k] === 'boolean') {
      s = `${subject[k]}`;
    } else if(subject[k] === null) {
      s = 'null';
    } else if(subject[k] && subject[k].length !== undefined) {
      try {
        s = depth <= 0 ? `Array(${subject[k].length})` : `[ ${subject[k].map(item => formatAnnotatedObject(item, opts)).join(', ')} ]`;
      } catch(err) {
        s = `[${subject[k]}]`;
      }
    } else if(subject[k] && subject[k].toSource !== undefined) {
      s = subject[k].toSource();
    } else if(opts.depth >= 0) {
      s = s.length > maxlen ? `[Object ${Util.objName(subject[k])}]` : formatAnnotatedObject(subject[k], opts);
    }
    r.push([k, s]);
  }
  //console.log("longest: ", longest)
  let padding = x => (opts.newline != '' ? Util.pad(x, longest.length, spacing) : spacing);
  let j = separator + spacing;
  if(r.length > 6) {
    nl = opts.newline + i;
    j = separator + (opts.newline || spacing) + i;
  }
  //padding = x => '';
  let ret = `{${opts.newline}${r.map(arr => `${padding(arr[0]) + arr[0]}:${spacing}${arr[1]}`).join(j)}${opts.newline}}`;
  return ret;
};
/**
 * Class for utility.
 *
 * @class      Util (name)
 */
function Util(g) {
  if(g) Util.globalObject = g;
}

export { Util as default, Util };

Util.getGlobalObject = function() {
  let ret = this.globalObject;
  try {
    if(!ret) ret = global;

    if(!ret) ret = globalThis;
  } catch(err) {}
  return ret;
};
Util.isDebug = function() {
  if(process !== undefined && process.env.NODE_ENV === 'production') return false;
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
Util.toSource = function(arg, opts = {}) {
  const { color = true } = opts;
  const c = Util.color(color);
  if(typeof arg == 'string') return c.text(`'${arg}'`, 1, 36);
  if(arg && arg.x !== undefined && arg.y !== undefined) return `[${c.text(arg.x, 1, 32)},${c.text(arg.y, 1, 32)}]`;
  if(arg && arg.toSource) return arg.toSource();
  let cls = arg && arg.constructor && Util.fnName(arg.constructor);
  return String(arg);
};
Util.debug = function(message) {
  const args = [...arguments];
  let cache = Util.array();
  const removeCircular = function(key, value) {
    if(typeof value === 'object' && value !== null) {
      if(cache.indexOf(value) !== -1) return;
      cache.push(value);
    }
    return value;
  };
  const str = args
    .map(arg => (typeof arg === 'object' ? JSON.stringify(arg, removeCircular) : arg))
    .join(' ')
    .replace(/\n/g, '');
  //console.log("STR: "+str);
  //console.log.call(console, str);
  //Util.log.apply(Util, args)
};
Util.type = function({ type }) {
  return (type && String(type).split(/[ ()]/)[1]) || '';
};
Util.functionName = function(fn) {
  const matches = /function\s*([^(]*)\(.*/g.exec(String(fn));
  if(matches && matches[1]) return matches[1];
  return null;
};
Util.className = function(obj) {
  let proto;
  //console.log("class:", obj);
  try {
    proto = Object.getPrototypeOf(obj);
  } catch(err) {
    try {
      proto = obj.prototype;
    } catch(err) {}
  }
  if(Util.isObject(proto) && 'constructor' in proto) return Util.fnName(proto.constructor);
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
      return (c.displayName || c.name).replace(/.*\(([A-Za-z0-9_]+).*/, '$1');
    } else if(c.wrappedComponent) c = c.wrappedComponent;
    else if(c.WrappedComponent) c = c.WrappedComponent;
    else break;
  }
  return Util.fnName(c);
};
Util.count = function(s, ch) {
  return (String(s).match(new RegExp(ch, 'g')) || Util.array()).length;
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
  let str = typeof num == 'string' ? num : num.toExponential();
  const matches = /e\+?(.*)$/.exec(str);
  //console.log("matches: ", matches);
  return parseInt(matches[1]);
};
Util.getNumberParts = function(num) {
  let str = typeof num == 'string' ? num : num.toExponential();
  const matches = /^(-?)(.*)e\+?(.*)$/.exec(str);
  //console.log("matches: ", matches);
  const negative = matches[1] == '-';
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
    .split('')
    .reverse();
  return Array.from(Object.assign({}, a, { length: 50 }), bit => (bit ? 1 : 0));
};
Util.getBit = function(v, n) {
  let s = v.toString(2);
  return n < s.length ? parseInt(s[s.length - n - 1]) : 0;
};
Util.isSet = function(v, n) {
  return Util.getBit(v, n) == 1;
};
Util.bitCount = function(n) {
  return Util.count(Util.toBinary(n), '1');
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
  const r = Array.from({ length: end - start + 1 }, (v, k) => k + start);
  //console.log("Util.range ", r);
  return r;
};
Util.inspect = function(
  obj,
  opts = {
    indent: '  ',
    newline: '\n',
    depth: 2,
    spacing: ' '
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
  let a = Util.toBinary(bits).split('');
  let r = Util.array();
  //return a;
  a.forEach((val, key, arr) => val == '1' && r.unshift(a.length - key));
  return r;
};
Util.shuffle = function(arr, rnd = Util.rng) {
  arr.sort((a, b) => 0.5 - rnd());
  return arr;
};
Util.sortNum = function(arr) {
  arr.sort((a, b) => a - b);
  //console.log("Util.sortNum ", { arr });
  return arr;
};
Util.draw = function(arr, n, rnd = Util.rng) {
  const r = Util.shuffle(arr, rnd).splice(0, n);
  //console.log("Util.draw ", { arr, n, r });
  return r;
};
Util.is = {
  on: val => val == 'on' || val === 'true' || val === true,
  off: val => val == 'off' || val === 'false' || val === false,
  true: val => val === 'true' || val === true,
  false: val => val === 'false' || val === false
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
  const r = Util.draw(Util.range(start, end), draws);
  //console.log("Util.randomNumbers ", { start, end, draws, r });
  return r;
};
Util.randomBits = function(r = [1, 50], n = 5) {
  return Util.numbersToBits(Util.randomNumbers(r, n));
};
Util.padFn = function(len, char = ' ', fn = (str, pad) => pad) {
  return (s, n = len) => {
    let m = Util.stripAnsi(s).length;
    s = s ? s.toString() : '' + s;
    return fn(s, m < n ? char.repeat(n - m) : '');
  };
};
Util.pad = function(s, n, char = ' ') {
  return Util.padFn(n, char)(s);
};
Util.abbreviate = function(str, max, suffix = '...') {
  if(str.length > max) {
    return str.substring(0, max - suffix.length) + suffix;
  }
  return str;
};
Util.trim = function(str, charset) {
  const r1 = RegExp(`^[${charset}]*`);
  const r2 = RegExp(`[${charset}]*$`);
  return str.replace(r1, '').replace(r2, '');
};
Util.trimRight = function(str, charset) {
  const r2 = RegExp(`[${charset}]*$`);
  return str.replace(r2, '');
};
Util.define = (obj, key, value, enumerable = false) => {
  if(typeof key == 'object') {
    for(let prop in key) Util.define(obj, prop, key[prop], Util.isBool(value) ? value : false);
    return obj;
  }
  /*obj[key] === undefined &&*/
  Object.defineProperty(obj, key, {
    enumerable,
    configurable: false,
    writable: false,
    value
  });
  return obj;
};
Util.copyEntries = (obj, entries) => {
  for(let [k, v] of entries) obj[k] = v;
  return obj;
};

Util.extend = (obj, ...args) => {
  let props = {};
  for(let other of args) {
    let desc = Util.getMethods(other, false, (key, value) => obj[key] === undefined && [key, value]);

    Object.assign(obj, desc);
    /*
    for(let prop in desc) {
      const descriptor=desc[prop];
      props[prop] = { ...descriptor, enumerable: false };
    }*/
  }
  // Object.defineProperties(obj, props);
  return obj;
};
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
  /*  Util.define(arr, 'tail', function() {
    return this[this.length - 1];
  });*/
  Util.define(arr, 'match', function(pred) {
    return Util.match(this, pred);
  });
  Util.define(arr, 'clear', function() {
    this.splice(0, this, length);
    return this;
  });
  Util.define(arr, 'unique', function() {
    return this.filter((item, i, a) => a.indexOf(item) == i);
  });
  Util.defineGetterSetter(
    arr,
    'tail',
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
    *keys() {
      const length = getLength(obj);
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
var doExtendArray = Util.extendArray;
Util.array = function(a) {
  if(!(a instanceof Array)) {
    if(Util.isObject(a) && 'length' in a) a = Array.from(a);
  }
  if(doExtendArray)
    try {
      /*  if(Array.prototype.match === undefined) doExtendArray(Array.prototype);*/
      if(a.match === undefined) {
        doExtendArray(Array.prototype);
        if(a.match) doExtendArray = null;
      }
      if(a.match === undefined) doExtendArray(a);
    } catch(err) {}
  return a;
};
Util.arrayFromEntries = entries =>
  Array.from(
    entries.map(([k, v]) => k),
    key => entries.find(([k, v]) => k === key)[1]
  );

Util.toMap = function(hash = {}, fn) {
  let m, gen;
  if(hash instanceof Array && typeof fn == 'function') hash = hash.map(fn);

  if(hash[Symbol.iterator] !== undefined) gen = hash[Symbol.iterator]();
  else if(Util.isGenerator(hash)) gen = hash;
  else gen = Object.entries(hash);

  m = new Map(gen);
  /*  
  if(m instanceof Array) m[Symbol.iterator] = m.entries;*/
  try {
    //if(m.toObject === undefined) Util.extendMap();
    if(Map.prototype.toObject === undefined) Util.extendMap(Map.prototype);
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
  map.match = function(...args) {
    return Util.match.apply(this, args);
  };
};
Util.fromEntries = Object.fromEntries
  ? Object.fromEntries
  : entries => {
      let ret = {};
      for(let [k, v] of entries) {
        ret[k] = v;
      }
      return ret;
    };

Util.objectFrom = function(any) {
  if('toJS' in any) any = any.toJS();
  else if(Util.isArray(any)) return Util.fromEntries(any);
  else if('entries' in any) return Util.fromEntries(any.entries());
  return Object.assign({}, any);
};
Util.tail = function(arr) {
  return arr && arr.length > 0 ? arr[arr.legth - 1] : null;
};
Util.splice = function(str, index, delcount, insert) {
  const chars = str.split('');
  Array.prototype.splice.apply(chars, arguments);
  return chars.join('');
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
Util.repeater = function(n, what) {
  if(typeof what == 'function')
    return (function*() {
      for(let i = 0; i < n; i++) yield what();
    })();
  return (function*() {
    for(let i = 0; i < n; i++) yield what;
  })();
};
Util.repeat = function(n, what) {
  return [...Util.repeater(n, what)];
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
    // Do something if you want with the group
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
/*Util.define(String.prototype,
  'splice',
  function(index, delcount, insert) {
    return Util.splice.apply(this, [this, ...arguments]);
  }
);*/
Util.fnName = function(f, parent) {
  if(f !== undefined && f.name !== undefined) return f.name;
  const s = f.toSource ? f.toSource() : `${f}`;
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
  if(o === undefined || o == null) return `${o}`;
  if(typeof o === 'function' || o instanceof Function) return Util.fnName(o);
  if(o.constructor) return Util.fnName(o.constructor);
  const s = `${o.type}`;
  return s;
};
Util.findKey = function(obj, value) {
  let pred = typeof value == 'function' ? value : v => v === value;
  for(let k in obj) if(pred(obj[k], k)) return k;
};
Util.find = function(arr, value, prop = 'id', acc = Util.array()) {
  let pred;
  if(typeof value == 'function') pred = value;
  else if(prop && prop.length !== undefined) {
    pred = function(obj) {
      if(obj[prop] == value) return true;
      return false;
    };
  } else pred = obj => obj[prop] == value;
  for(let v of arr) {
    //console.log("v: ", v, "k:", k);
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
Util.match = function(arg, pred) {
  let match = pred;
  if(pred instanceof RegExp) {
    const re = pred;
    match = (val, key) => (val && val.tagName !== undefined && re.test(val.tagName)) || (typeof key === 'string' && re.test(key)) || (typeof val === 'string' && re.test(val));
  }
  if(Util.isArray(arg)) {
    if(!(arg instanceof Array)) arg = [...arg];
    return arg.reduce((acc, val, key) => {
      if(match(val, key, arg)) acc.push(val);
      return acc;
    }, Util.array());
  } else if(Util.isMap(arg)) {
    //console.log('Util.match ', { arg });
    return [...arg.keys()].reduce((acc, key) => (match(arg.get(key), key, arg) ? acc.set(key, arg.get(key)) : acc), new Map());
  }
  return Util.filter(arg, match);
};
Util.toHash = function(map, keyTransform = k => Util.camelize('' + k)) {
  let ret = {};
  Util.foreach(map, (v, k) => (ret[keyTransform(k)] = v));
  return ret;
};
Util.indexOf = function(obj, prop) {
  for(let key in obj) {
    if(obj[key] === prop) return key;
  }
  return undefined;
};
/*
Util.injectProps = function(options) {
  return function(InitialComponent) {
    return function DndStateInjector() {
      return <InitialComponent {...options} />;
    }
  }
}*/
Util.toString = (obj, opts = {}, indent = '') => {
  const { quote = '"', multiline = true, color = true, spacing = ' ', padding = ' ', separator = ',', colon = ':' } = opts;
  const c = Util.color(color);
  const sep = multiline ? (space = false) => '\n' + indent + (space ? '  ' : '') : (space = false) => (space ? spacing : '');
  if(Util.isArray(obj)) {
    let s = c.text(`[${padding}`, 1, 36);
    for(let i = 0; i < obj.length; i++) {
      s += i > 0 ? c.text(separator, 1, 36) : '';
      s += sep(true);
      s += Util.toString(obj[i], opts, indent + '  ');
    }
    return s + sep() + `${padding}]`;
  }
  //console.log("obj:", Util.className(obj), obj);
  if(typeof obj == 'function' || obj instanceof Function || Util.className(obj) == 'Function') {
    obj = '' + obj;
    if(!multiline) obj = obj.replace(/(\n| anonymous)/g, '');
    return obj;
  }
  let s = c.text(`{${padding}`, 1, 36);
  let i = 0;
  for(let key in obj) {
    const value = obj[key];
    s += i > 0 ? c.text(separator, 36) : '';

    if(i > 0) s += sep(true);
    s += `${c.text(key, 1, 33)}${c.text(colon, 1, 36)}` + spacing;
    /*if(Util.isArray(value)) s+= Util.toString(value);
      else*/ if(Util.isObject(value)) s += Util.toString(value, opts, indent + '  ');
    else if(typeof value == 'string') s += c.text(`${quote}${value}${quote}`, 1, 36);
    else if(typeof value == 'number') s += c.text(value, 1, 32);
    else s += value;
    i++;
  }
  return s + sep(false) + c.text(`${padding}}`, 1, 36);
};
Util.dump = function(name, props) {
  const args = [name];
  for(let key in props) {
    args.push(`\n\t${key}: `);
    args.push(props[key]);
  }
  if('window' in global !== false) {
    //if(window.alert !== undefined)
    //alert(args);
    if(window.console !== undefined) console.log(...args);
  }
};
Util.ucfirst = function(str) {
  if(typeof str != 'string') str = String(str);
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
Util.camelize = (text, sep = '') =>
  text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
    if(p2) return sep + p2.toUpperCase();
    return p1.toLowerCase();
  });

Util.decamelize = function(str, separator = '-') {
  return /[A-Z]/.test(str)
    ? str
        .replace(/([a-z\d])([A-Z])/g, `$1${separator}$2`)
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, `$1${separator}$2`)
        .toLowerCase()
    : str;
};
Util.ifThenElse = function(pred = value => !!value, _then = () => {}, _else = () => {}) {
  return function(value) {
    var result = pred(value);
    var ret = !!result ? _then(value) : _else(value);
    return ret;
  };
};
Util.transform = function(fn) {
  return function*(arr) {
    for(let item of arr) {
      yield fn(item);
    }
  };
};
Util.isEmail = function(v) {
  return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(v);
};
Util.isString = function(v) {
  return Object.prototype.toString.call(v) == '[object String]';
};

Util.isObject = obj => typeof obj === 'object' && obj !== null;

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
  if(typeof v == 'object' && !!v && v.constructor == Object && Object.keys(v).length == 0) return true;
  if(!v || v === null) return true;
  if(typeof v == 'object' && v.length !== undefined && v.length === 0) return true;
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
Util.clone = function(obj) {
  if(typeof obj != 'object') return obj;
  return Util.isArray(obj) ? obj.slice() : Object.assign({}, obj);
};
//deep copy
Util.deepClone = function(data) {
  return JSON.parse(JSON.stringify(data));
};
// Function
Util.findVal = function(object, propName, maxDepth = 10) {
  if(maxDepth <= 0) return null;
  for(let key in object) {
    if(key === propName) {
      //console.log(propName);
      //console.log(object[key]);
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
  if(t === 'object') {
    o = data.length ? Util.array() : {};
  } else {
    return data;
  }
  if(t === 'object') {
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
  for(let key in Object.assign({}, a)) {
    if(b[key] === a[key]) continue;
    c[key] = a[key];
  }
  return c;
};
//Remove the storage when logging out
Util.logOutClearStorage = function() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userLoginPermission');
  localStorage.removeItem('ssoToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userGroupList');
  localStorage.removeItem('gameAuthList');
};
//Take the cookies
Util.getCookie = function(cookie, name) {
  let arr = cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`));
  if(arr != null) return unescape(arr[2]);
  return null;
};
Util.parseCookie = function(c = document.cookie) {
  if(!(typeof c == 'string' && c && c.length > 0)) return {};
  let key = '';
  let value = '';
  const ws = ' \r\n\t';
  let i = 0;
  let ret = {};
  const skip = (pred = char => ws.indexOf(char) != -1) => {
    let start = i;
    while(i < c.length && pred(c[i])) i++;
    let r = c.substring(start, i);
    return r;
  };
  do {
    let str = skip(char => char != '=' && char != ';');
    if(c[i] == '=' && str != 'path') {
      i++;
      key = str;
      value = skip(char => char != ';');
    } else {
      i++;
      skip();
    }
    if(key != '') ret[key] = value;
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
    .join('; ');
Util.setCookies = c =>
  Object.entries(c).forEach(([key, value]) => {
    document.cookie = `${key}=${value}`;
    //console.log(`Setting cookie[${key}] = ${value}`);
  });
Util.clearCookies = function(c) {
  return Util.setCookies(Object.keys(Util.parseCookie(c)).reduce((acc, name) => Object.assign(acc, { [name]: `; max-age=0; expires=${new Date().toUTCString()}` }), {}));
};
Util.deleteCookie = function(name) {
  if(global.window) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};
Util.accAdd = function(arg1, arg2) {
  let r1, r2, m;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch(e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch(e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  return (arg1 * m + arg2 * m) / m;
};
//js subtraction calculation
//
Util.Subtr = function(arg1, arg2) {
  let r1, r2, m, n;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch(e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
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
  let t1 = 0;
  let t2 = 0;
  let r1;
  let r2;
  try {
    t1 = arg1.toString().split('.')[1].length;
  } catch(e) {}
  try {
    t2 = arg2.toString().split('.')[1].length;
  } catch(e) {}
  r1 = Number(arg1.toString().replace('.', ''));
  r2 = Number(arg2.toString().replace('.', ''));
  return (r1 / r2) * Math.pow(10, t2 - t1);
};
//js multiplication function
//
Util.accMul = function(arg1, arg2) {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();
  try {
    m += s1.split('.')[1].length;
  } catch(e) {}
  try {
    m += s2.split('.')[1].length;
  } catch(e) {}
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m);
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
  let numSplit = numStr.split('.');
  return numSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',').concat(`.${numSplit[1]}`);
};
Util.searchObject = function(object, matchCallback, currentPath, result, searched) {
  currentPath = currentPath || '';
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
      for(const property in object) {
        const desc = Object.getOwnPropertyDescriptor(object, property);
        //console.log('x ', {property, desc})
        if(property.indexOf('$') !== 0 && typeof object[property] !== 'function' && !desc.get && !desc.set) {
          if(typeof object[property] === 'object') {
            try {
              JSON.stringify(object[property]);
            } catch(err) {
              continue;
            }
          }
          //if (Object.prototype.hasOwnProperty.call(object, property)) {
          Util.searchObject(object[property], matchCallback, `${currentPath}.${property}`, result, searched);
          //}
        }
      }
    }
  } catch(e) {
    //console.log(object);
    //throw e;
  }
  return result;
};
Util.getURL = function(req = {}) {
  let proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  let port = process.env.PORT ? parseInt(process.env.PORT) : process.env.NODE_ENV === 'production' ? 443 : 8080;
  let host = global.ip || global.host || 'localhost';
  if(req && req.headers && req.headers.host !== undefined) {
    host = req.headers.host.replace(/:.*/, '');
  } else if(process.env.HOST !== undefined) host = process.env.HOST;
  if(global.window !== undefined && window.location !== undefined) return window.location.href;
  if(req.url !== undefined) return req.url;
  if(global.process !== undefined && global.process.url !== undefined) return global.process.url;
  const url = `${proto}://${host}:${port}`;
  //console.log("getURL process ", { url });
  return url;
};
Util.parseQuery = function(url = Util.getURL()) {
  let startIndex;
  let query = {};
  try {
    if((startIndex = url.indexOf('?')) != -1) url = url.substring(startIndex);
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
  const ret = [];
  for(let d in data) ret.push(`${encodeURIComponent(d)}=${encodeURIComponent(data[d])}`);
  return ret.join('&');
};
Util.parseURL = function(href = this.getURL()) {
  const matches = /^([^:]*):\/\/([^/:]*)(:[0-9]*)?(\/?.*)/.exec(href);
  if(!matches) return null;
  const argstr = matches[4].indexOf('?') != -1 ? matches[4].replace(/^[^?]*\?/, '') : ''; /* + "&test=1"*/
  const pmatches =
    typeof argstr === 'string'
      ? argstr
          .split(/&/g)
          .map(part => {
            let a = part.split(/=/);
            let b = a.shift();
            return [b, a.join('=')];
          })
          .filter(([k, v]) => !(k.length == 0 && v.length == 0))
      : Util.array();
  const params = [...pmatches].reduce((acc, m) => {
    acc[m[0]] = m[1];
    return acc;
  }, {});
  //console.log("PARAMS: ", { argstr, pmatches, params });
  return {
    protocol: matches[1],
    host: matches[2],
    port: typeof matches[3] === 'string' ? parseInt(matches[3].substring(1)) : 443,
    location: matches[4].replace(/\?.*/, ''),
    query: params,
    href(override) {
      if(typeof override === 'object') Object.assign(this, override);
      const qstr = Util.encodeQuery(this.query);
      return (this.protocol ? `${this.protocol}://` : '') + (this.host ? this.host : '') + (this.port ? `:${this.port}` : '') + `${this.location}` + (qstr != '' ? `?${qstr}` : '');
    }
  };
};
Util.makeURL = function() {
  let args = [...arguments];
  let href = typeof args[0] == 'string' ? args.shift() : Util.getURL();
  let url = Util.parseURL(href);
  let obj = typeof args[0] == 'object' ? args.shift() : {};
  Object.assign(url, obj);
  return url.href();
  /*
  let href = typeof args[0] === "string" ? args.shift() : this.getURL();
  let urlObj = null;
  urlObj = this.parseURL(href);
  return urlObj ? urlObj.href(args[0]) : null;*/
};
Util.numberFromURL = function(url, fn) {
  const obj = typeof url === 'object' ? url : this.parseURL(url);
  const nr_match = RegExp('.*[^0-9]([0-9]+)$').exec(url.location);
  const nr_arg = nr_match ? nr_match[1] : undefined;
  const nr = nr_arg && parseInt(nr_arg);
  if(!isNaN(nr) && typeof fn === 'function') fn(nr);
  return nr;
};
Util.tryPromise = fn => new Promise((resolve, reject) => Util.tryCatch(fn, resolve, reject));

Util.tryCatch = (fn, resolve, reject) => {
  let ret;
  try {
    ret = fn();
  } catch(err) {
    return reject();
  }
  return resolve(ret);
};

Util.isBrowser = function() {
  let ret = false;
  Util.tryCatch(
    () => window,
    w => (Util.isObject(w) ? (ret = true) : undefined),
    () => {}
  );
  Util.tryCatch(
    () => document,
    w => (Util.isObject(w) ? (ret = true) : undefined),
    () => {}
  );
  return ret;
  //return !!(global.window && global.window.document);
};
Util.isServer = function() {
  return !Util.isBrowser();
};
Util.isMobile = function() {
  return true;
};
Util.uniquePred = (el, i, arr) => arr.indexOf(el) === i;
Util.unique = arr => arr.filter(Util.uniquePred);

Util.concat = function*(...args) {
  for(let arg of args) {
    if(Util.isGenerator(arg)) {
      console.error('isGenerator:', arg);
      yield* arg;
    } /* if(Util.isArray(arg))*/ else {
      for(let item of arg) yield item;
    }
    /*   else  else {
      throw new Error("No such arg type:"+typeof(arg));
    }*/
  }
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
Util.mergeLists = function(arr1, arr2, key = 'id') {
  let hash = {};

  for(let obj of arr1) hash[obj[key]] = obj;
  for(let obj of arr2) hash[obj[key]] = obj;
  return Object.values(hash);
  /* let hash = arr1.reduce((acc, it) => Object.assign({ [it[key]]: it }, acc), {});
  hash = arr2.reduce((acc, it) => Object.assign({ [it[key]]: it }, acc), {});
  let ret = Util.array();
  for(let k in hash) {
    if(hash[k][key]) ret.push(hash[k]);
  }
  return ret;*/
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
Util.foreach = function(o, fn) {
  for(let [k, v] of Util.entries(o)) fn(v, k, o);
};
Util.all = function(obj, pred) {
  for(let k in obj) if(!pred(obj[k])) return false;
  return true;
};
Util.isGenerator = function(fn) {
  return (typeof fn == 'function' && /^[^(]*\*/.test(fn.toString())) || (['function', 'object'].indexOf(typeof fn) != -1 && fn.next !== undefined);
};
Util.filter = function(a, pred) {
  if(Util.isGenerator(a))
    return (function*() {
      for(let item of a) if(pred(item)) yield item;
    })();
  let isa = Util.isArray(a);
  if(isa)
    return (function*() {
      for(let [k, v] of a.entries()) if(pred(v, k, a)) yield v;
    })();
  let ret = {};
  let fn = (k, v) => (ret[k] = v);
  for(let [k, v] of Util.entries(a)) if(pred(v, k, a)) fn(k, v);
  return ret;
};
Util.reduce = function(obj, fn, accu) {
  for(let key in obj) accu = fn(accu, obj[key], key, obj);
  return accu;
};
Util.mapFunctional = fn =>
  function*(arg) {
    for(let item of arg) yield fn(item);
  };
Util.map = function(obj, fn) {
  if(typeof obj == 'function') return Util.mapFunctional(...arguments);
  if(typeof fn != 'function') return Util.toMap(...arguments);
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
/*Util.indexedMap = (arr, fn = arg => arg.name) => {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      let idx = arr.findIndex(item => fn(item) == 'prop');
      if(idx != -1)
        prop = idx;

      return Reflect.get(arr, idx, receiver);
    }
  });
};*/

Util.entriesToObj = function(arr) {
  return [...arr].reduce((acc, item) => {
    const k = item[0];
    const v = item[1];
    acc[k] = v;
    return acc;
  }, {});
};
Util.isDate = function(d) {
  return d instanceof Date || (typeof d == 'string' && /[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/.test(d));
};
Util.parseDate = function(d) {
  if(Util.isDate(d)) {
    d = new Date(d);
  }
  return d;
  //  return /^[0-9]+$/.test(d) ? Util.fromUnixTime(d) : new Date(d);
};
Util.isoDate = function(date) {
  try {
    const minOffset = date.getTimezoneOffset();
    const milliseconds = date.valueOf() - minOffset * 60 * 1000;
    date = new Date(milliseconds);
    return date.toISOString().replace(/T.*/, '');
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
Util.formatTime = function(date = new Date(), format = 'HH:MM:SS') {
  let n;
  let out = '';
  for(let i = 0; i < format.length; i += n) {
    n = 1;
    while(format[i] == format[i + n]) n++;
    const fmt = format.substring(i, i + n);
    let num = fmt;
    if(fmt.startsWith('H')) num = `0${date.getHours()}`.substring(0, n);
    else if(fmt.startsWith('M')) num = `0${date.getMinutes()}`.substring(0, n);
    else if(fmt.startsWith('S')) num = `0${date.getSeconds()}`.substring(0, n);
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
  let ret = '';
  ret = `${`0${hours}`.substring(0, 2)}:${`0${minutes}`.substring(0, 2)}:${`0${seconds}`.substring(0, 2)}`;
  if(days) ret = `${days} days ${ret}`;
  if(weeks) ret = `${weeks} weeks ${ret}`;
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
  let n = typeof num == 'number' ? num : parseInt(num);
  return ('0'.repeat(numDigits) + n.toString(16)).slice(-numDigits);
};
Util.numberParts = (num, base) => {
  let exp = 0;
  let sgn = 0;
  if(num === 0) return { sign: 0, mantissa: 0, exponent: 0 };
  if(num < 0) (sgn = 1), (num = -num);
  while(num > base) (num /= base), exp++;
  while(num < 1) (num *= base), exp--;
  return { sign: sgn, mantissa: num, exponent: exp };
};
Util.roundTo = function(value, prec, digits) {
  if(prec == 1) return Math.round(value);
  /*  const decimals = Math.log10(prec);
  const digits = Math.ceil(-decimals);
  console.log('digits:', digits);*/
  let ret = Math.round(value / prec) * prec;

  if(typeof digits == 'number') ret = +ret.toFixed(digits);
  return ret;
};
Util.base64 = {
  encode: utf8 => {
    if(global.window) return window.btoa(unescape(encodeURIComponent(utf8)));
    return Buffer.from(utf8).toString('base64');
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
    else if(val == 'true' || val == 'false') val = Boolean(val);
    ret[key] = val;
  }
  return ret;
};
Util.isArray = function(obj) {
  return (obj && obj.length !== undefined && !(obj instanceof String) && !(obj instanceof Function) && typeof obj == 'function') || obj instanceof Array;
};
Util.equals = function(a, b) {
  if(Util.isArray(a) && Util.isArray(b)) {
    return a.length == b.length && a.every((e, i) => b[i] === e);
  }
};

Util.isObject = function(obj) {
  const type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
};
Util.isBool = value => value === true || value === false;
Util.size = function(obj) {
  if(Util.isObject(obj)) {
    if('length' in obj) return obj.length;
    return Object.keys(obj).length;
  }
  return undefined;
};
Util.isMap = function(obj) {
  return (obj && obj.get !== undefined && obj.keys !== undefined) || obj instanceof Map;
};
Util.effectiveDeviceWidth = function() {
  let deviceWidth = window.orientation == 0 ? window.screen.width : window.screen.height;
  //iOS returns available pixels, Android returns pixels / pixel ratio
  //http://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html
  if(navigator.userAgent.indexOf('Android') >= 0 && window.devicePixelRatio) {
    deviceWidth = deviceWidth / window.devicePixelRatio;
  }
  return deviceWidth;
};
Util.getFormFields = function(initialState) {
  return Util.mergeObjects([initialState, [...document.forms].reduce((acc, { elements }) => [...elements].reduce((acc2, { name, value }) => (name == '' || value == undefined || value == 'undefined' ? acc2 : Object.assign(acc2, { [name]: value })), acc), {})]);
};
Util.mergeObjects = function(objArr, predicate = (dst, src, key) => (src[key] == '' ? undefined : src[key])) {
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
  const agent = useragent.parse(headers['user-agent']);
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
  let pred = typeof args[0] == 'function' ? args[0] : key => args.indexOf(key) != -1;
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
    .split('')
    .map((ch, i) => (/[ :,./]/.test(ch) ? ch : String.fromCharCode((str.charCodeAt(i) & 0x0f) + 0x30)))
    .join('');
};
Util.entries = function(arg) {
  if(typeof arg == 'object' && arg !== null) {
    return typeof arg.entries !== 'undefined' ? arg.entries() : Object.entries(arg);
  }
  //console.log("Util.entries", arg);
  return null;
};
Util.traverse = function(o, fn) {
  if(typeof fn == 'function')
    return Util.foreach(o, (v, k, a) => {
      fn(v, k, a);
      if(typeof v === 'object') Util.traverse(v, fn);
    });
  function* walker(o, depth = 0) {
    for(let [k, v] of Util.entries(o)) {
      yield [v, k, o, depth];
      if(typeof v == 'object' && v !== null) yield* walker(v, depth + 1);
    }
  }
  return walker(o);
};
Util.traverseWithPath = function(o, rootPath = []) {
  for(let key of rootPath) o = o[key];

  function* walker(o, path) {
    for(let [k, v] of Util.entries(o)) {
      let p = [...path, k];
      yield [v, k, o, p];
      if(typeof v == 'object' && v !== null) yield* walker(v, p);
    }
  }

  return walker(o, []);
};
Util.indexByPath = function(o, p) {
  for(let key of p) o = o[key];
  return o;
};
Util.pushUnique = function(arr) {
  let args = [...arguments];
  arr = args.shift();
  args.forEach(item => {
    if(arr.indexOf(item) == -1) arr.push(item);
  });
  return arr;
};
Util.iterateMembers = function*(obj, predicate = (name, depth) => true, depth = 0) {
  let names = [];
  let pred = Util.predicate(predicate);
  for(let name in obj) if(pred(name, depth)) yield name;
  for(let name of Object.getOwnPropertyNames(obj)) if(pred(name, depth)) yield name;
  for(let symbol of Object.getOwnPropertySymbols(obj)) if(pred(symbol, depth)) yield symbol;
  const proto = Object.getPrototypeOf(obj);
  if(proto) yield* Util.iterateMembers(proto, pred, depth + 1);
};

Util.getMembers = (obj, pred = (prop, level) => true) => Util.unique([...Util.iterateMembers(obj, pred)]);

Util.iterateMethodNames = (obj, depth = 1, start = 0) => {
  const end = depth === true ? start + 1 : depth === false ? start : start + depth;
  const check = Util.inRange(start, end);
  return Util.iterateMembers(obj, (prop, level) => check(level) && typeof obj[prop] === 'function' && prop != 'constructor');
};
Util.getMethodNames = (obj, depth = 1, start = 0) => Util.unique([...Util.iterateMethodNames(obj, depth, start)]);

Util.methods = (obj, depth = 1, t = (k, v) => [k, v], r = e => Object.fromEntries([...e])) => r(Util.iterateMethods(obj, depth, t));

Util.getMethods = (obj, depth = 1) => {
  let ret = {};
  for(let [k, v] of Util.iterateMethods(obj, depth, (k, v) => [k, v])) ret[k] = v;
  return ret;
};
Util.iterateMethods = function*(obj, depth = 1, t = (key, value) => [key, value], start = 0) {
  for(let name of Util.getMethodNames(obj, depth, start)) {
    try {
      const value = t(name, obj[name]);
      if(value !== undefined && value !== false && value !== null) yield value;
    } catch(err) {}
  }
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
Util.getConstructor = obj => {
  return Object.getPrototypeOf(obj).constructor;
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
  Error.stackTraceLimit = 20;
  if(position >= Error.stackTraceLimit) {
    throw new TypeError(`getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: \`${position}\` and Error.stackTraceLimit was: \`${Error.stackTraceLimit}\``);
  }
  const oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack;
  Error.prepareStackTrace = oldPrepareStackTrace;
  return stack !== null && typeof stack === 'object' ? stack.slice(position) : null;
};
Util.getCallerFile = function(position = 2) {
  let stack = Util.getCallerStack();
  if(stack !== null && typeof stack === 'object') {
    const frame = stack[position];
    return frame ? `${frame.getFileName()}:${frame.getLineNumber()}` : undefined;
  }
};
Util.getCallerFunction = function(position = 2) {
  let stack = Util.getCallerStack(position + 1);
  if(stack !== null && typeof stack === 'object') {
    const frame = stack[0];
    return frame ? frame.getFunction() : undefined;
  }
};
Util.getCallerFunctionName = function(position = 2) {
  let stack = Util.getCallerStack(position + 1);
  if(stack !== null && typeof stack === 'object') {
    const frame = stack[0];
    return frame ? frame.getMethodName() || frame.getFunctionName() : undefined;
  }
};
Util.getCallerFunctionNames = function(position = 2) {
  let stack = Util.getCallerStack(position + 1);
  if(stack !== null && typeof stack === 'object') {
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
  const methods = ['getColumnNumber', 'getEvalOrigin', 'getFileName', 'getFunction', 'getFunctionName', 'getLineNumber', 'getMethodName', 'getPosition', 'getPromiseIndex', 'getScriptNameOrSourceURL', 'getThis', 'getTypeName'];
  if(stack !== null && typeof stack === 'object') {
    const frame = stack[0];
    return methods.reduce((acc, m) => {
      if(frame[m]) {
        const name = Util.lcfirst(m.replace(/^get/, ''));
        const value = frame[m]();
        if(value != undefined) {
          acc[name] = value;
        }
      }
      return acc;
    }, {});
  }
};
Util.getCallers = function(start = 2, num = Number.MAX_SAFE_INTEGER) {
  let ret = [];
  let i = start;
  while(i++ < start + num) {
    try {
      let caller = Util.getCaller(i + 1);
      if(!caller) break;

      ret.push(caller);
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
  addOutput(Util.filterKeys(tree, key => key !== 'children'));
  if(typeof tree.children == 'object' && tree.children !== null && tree.children.length) for(let child of tree.children) Util.flatTree(child, addOutput);
  return ret;
};
Util.traverseTree = function(tree, fn, depth = 0, parent = null) {
  fn(tree, depth, parent);
  if(typeof tree == 'object' && tree !== null && typeof tree.children == 'object' && tree.children !== null && tree.children.length) for(let child of tree.children) Util.traverseTree(child, fn, depth + 1, tree);
};
Util.walkTree = function(node, pred, t, depth = 0, parent = null) {
  return (function*() {
    if(!pred) pred = i => true;
    if(!t)
      t = function(i) {
        i.depth = depth;
        /*if(parent) i.parent = parent; */ return i;
      };
    /*      let thisNode = node;
      let nodeId = node.id;*/
    //node = t(node);
    if(pred(node, depth, parent)) {
      yield t(node);
      if(typeof node == 'object' && node !== null && typeof node.children == 'object' && node.children.length) {
        for(let child of [...node.children]) {
          /*   if(pred(child, depth + 1, node))*/
          yield* Util.walkTree(child, pred, t, depth + 1, node.parent_id);
        }
      }
    }
  })();
};
Util.isPromise = function(obj) {
  return (Boolean(obj) && typeof obj.then === 'function') || obj instanceof Promise;
};
/* eslint-disable no-use-before-define */
if(typeof setImmediate !== 'function') var setImmediate = fn => setTimeout(fn, 0);
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
    tooDark: (options.tooDark || 0.03) * 255 * 3, // How dark is too dark for a pixel
    tooLight: (options.tooLight || 0.97) * 255 * 3, // How light is too light for a pixel
    tooAlpha: (options.tooAlpha || 0.1) * 255 // How transparent is too transparent for a pixel
  };
  const w = imageElement.width;
  let h = imageElement.height;
  // Setup canvas and draw image onto it
  const context = document.createElement('canvas').getContext('2d');
  context.drawImage(imageElement, 0, 0, w, h);
  // Extract the rgba data for the image from the canvas
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
  let luma = 0; // Having luma in the pixel object caused ~10% performance penalty for some reason
  // Loop through the rgba data
  for(let i = 0, l = w * h * 4; i < l; i += 4) {
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
      // Returns a CSS compatible RGB string (e.g. '255, 255, 255')
      const { r, g, b } = this;
      return [r, g, b].join(', ');
    },
    toStringRgba() {
      // Returns a CSS compatible RGBA string (e.g. '255, 255, 255, 1.0')
      const { r, g, b, a } = this;
      return [r, g, b, a].join(', ');
    },
    toStringHex() {
      // Returns a CSS compatible HEX coloor string (e.g. 'FFA900')
      const toHex = function(d) {
        h = Math.round(d).toString(16);
        if(h.length < 2) {
          h = `0${h}`;
        }
        return h;
      };
      const { r, g, b } = this;
      return [toHex(r), toHex(g), toHex(b)].join('');
    }
  });
  return o;
};
Util.jsonToObject = function(jsonStr) {
  let ret = null;
  try {
    ret = JSON.parse(jsonStr);
  } catch(error) {
    let pos = +('' + error)
      .split('\n')
      .reverse()[0]
      .replace(/.*position ([0-9]+).*/, '$1');
    console.error('Unexpected token: ', jsonStr);
    console.error('Unexpected token at:', jsonStr.substring(pos));
    ret = null;
  }
  return ret;
};
Util.splitLines = function(str, max_linelen = Number.MAX_SAFE_INTEGER) {
  const tokens = str.split(/\s/g);
  let lines = [];
  let line = tokens.shift();
  for(; tokens.length; ) {
    if((line.length ? line.length + 1 : 0) + tokens[0].length > max_linelen) {
      lines.push(line);
      line = '';
    }
    if(line != '') line += ' ';
    line += tokens.shift();
  }
  if(line != '') lines.push(line);
  return lines;
};

Util.decodeHTMLEntities = function(text) {
  var entities = {
    amp: '&',
    apos: "'",
    '#x27': "'",
    '#x2F': '/',
    '#39': "'",
    '#47': '/',
    lt: '<',
    gt: '>',
    nbsp: ' ',
    quot: '"'
  };
  return text.replace(/&([^;]+);/gm, function(match, entity) {
    return entities[entity] || match;
  });
};
Util.stripAnsi = function(str) {
  return (str + '').replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');
};
Util.proxy = (obj = {}, handler) =>
  new Proxy(obj, {
    get(target, key, receiver) {
      //console.log(`Util.proxy getting ${key}!`);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      //console.log(`Util.proxy setting ${key}!`);
      return Reflect.set(target, key, value, receiver);
    },
    ...handler
  });
Util.proxyTree = function proxyTree(...callbacks) {
  const [setCallback, applyCallback = () => {}] = callbacks;
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
    return new Proxy(() => {}, { path, ...handler });
  }

  return node([]);
};
Util.proxyClone = obj => {
  const override = Object.create(null);
  const deleted = Object.create(null);

  const debug = (...args) => console.log('DEBUG proxyClone', ...args); //Util.debug("proxy-clone");

  const get = name => {
    let value;
    if(!deleted[name]) value = override[name] || obj[name];
    if(Util.isObject(value)) {
      value = Util.proxyClone(value);
      override[name] = value;
    }
    if(typeof value === 'function') {
      value = value.bind(obj);
    }
    return value;
  };

  return new Proxy(Object.prototype, {
    getPrototypeOf: () => Object.getPrototypeOf(obj),
    setPrototypeOf: () => {
      throw new Error('Not yet implemented: setPrototypeOf');
    },
    isExtensible: () => {
      throw new Error('Not yet implemented: isExtensible');
    },
    preventExtensions: () => {
      throw new Error('Not yet implemented: preventExtensions');
    },
    getOwnPropertyDescriptor: (target, name) => {
      let desc;
      if(!deleted[name]) {
        desc = Object.getOwnPropertyDescriptor(override, name) || Object.getOwnPropertyDescriptor(obj, name);
      }
      if(desc) desc.configurable = true;
      debug(`getOwnPropertyDescriptor ${name} =`, desc);
      return desc;
    },
    defineProperty: () => {
      throw new Error('Not yet implemented: defineProperty');
    },
    has: (_, name) => {
      const has = !deleted[name] && (name in override || name in obj);
      debug(`has ${name} = ${has}`);
      return has;
    },
    get: (receiver, name) => {
      const value = get(name);
      debug(`get ${name} =`, value);
      return value;
    },
    set: (_, name, val) => {
      delete deleted[name];
      override[name] = val;
      debug(`set ${name} = ${val}`, name, val);
      return true;
    },
    deleteProperty: (_, name) => {
      debug(`deleteProperty ${name}`);
      deleted[name] = true;
      delete override[name];
    },
    ownKeys: () => {
      const keys = Object.keys(obj)
        .concat(Object.keys(override))
        .filter(Util.uniquePred)
        .filter(key => !deleted[key]);
      debug(`ownKeys`, keys);
      return keys;
    },
    apply: () => {
      throw new Error('Not yet implemented: apply');
    },
    construct: () => {
      throw new Error('Not yet implemented: construct');
    },
    enumerate: () => {
      throw new Error('Not yet implemented: enumerate');
    }
  });
};
Util.proxyDelegate = (target, origin) => {
  return new Proxy(target, {
    get(target, key, receiver) {
      if(key in target) return Reflect.get(target, key, receiver);
      const value = origin[key];
      return typeof value === 'function' ? (...args) => value.apply(origin, args) : value;
    },
    set(target, key, value, receiver) {
      if(key in target) return Reflect.set(target, key, value, receiver);
      origin[key] = value;
      return true;
    }
  });
};
Util.immutable = args => {
  const argsType = typeof args === 'object' && Util.isArray(args) ? 'array' : 'object';
  const errorText = argsType === 'array' ? "Error! You can't change elements of this array" : "Error! You can't change properties of this object";
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
  return new Function(
    'Original',
    `const Immutable${name} = class extends Original {
    constructor(...args) {
      super(...args);
      if(new.target === Immutable${name})
        Object.freeze(this);
    }
  };
  return Immutable${name};`
  )(Original);
};
Util.curry = function curry(fn, arity) {
  return function curried() {
    if(arity == null) {
      arity = fn.length;
    }
    var args = [].slice.call(arguments);
    if(args.length >= arity) {
      return fn.apply(this, args);
    } else {
      return function() {
        return curried.apply(this, args.concat([].slice.call(arguments)));
      };
    }
  };
};

Util.partial = function partial(fn /*, arg1, arg2 etc */) {
  var partialArgs = [].slice.call(arguments, 1);
  if(!partialArgs.length) {
    return fn;
  }
  return function() {
    var args = [].slice.call(arguments);
    var derivedArgs = [];
    for(var i = 0; i < partialArgs.length; i++) {
      var thisPartialArg = partialArgs[i];
      derivedArgs[i] = thisPartialArg === undefined ? args.shift() : thisPartialArg;
    }
    return fn.apply(this, derivedArgs.concat(args));
  };
};

Util.compose = function compose(fn1, fn2 /*, fn3, etc */) {
  if(!arguments.length) {
    throw new Error('expected at least one (and probably more) function arguments');
  }
  var fns = arguments;

  return function() {
    var result = fns[0].apply(this, arguments);
    var len = fns.length;
    for(var i = 1; i < len; i++) {
      result = fns[i].call(this, result);
    }
    return result;
  };
};
Util.clamp = Util.curry((min, max, value) => Math.max(min, Math.min(max, value)));

Util.color = (useColor = true) =>
  !useColor || Util.isBrowser()
    ? {
        code: () => '',
        text: (text, ...color) => (color.indexOf(1) != -1 ? `${text}` : text)
      }
    : {
        code(...args) {
          return `\u001b[${[...args].join(';')}m`;
        },
        text(text, ...color) {
          return this.code(...color) + text + this.code(0);
        }
      };

Util.colorText = (...args) => Util.color().text(...args);
Util.ansiCode = (...args) => Util.color().code(...args);

Util.defineInspect = (proto, ...props) => {
  if(!Util.isBrowser()) {
    const c = Util.color();
    proto[Symbol.for('nodejs.util.inspect.custom')] = function() {
      const obj = this;
      return (
        c.text(Util.fnName(proto.constructor) + ' ', 1, 31) +
        Util.toString(
          props.reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
          }, {}),
          { multiline: false, colon: ':', spacing: '', separator: ', ', padding: '' }
        )
      );
    };
  }
};
Util.predicate = fn_or_regex => {
  let fn;
  if(fn_or_regex instanceof RegExp) fn = (...args) => fn_or_regex.test(args + '');
  else fn = (...args) => fn_or_regex(...args);
  return fn;
};
Util.inRange = Util.curry((a, b, value) => value >= a && value <= b);


Util.bindProperties = (proxy,target, props, fn = p => v => v === undefined ? target[p] : target[p] = v) => {
  if(props instanceof Array)
    props = Object.fromEntries(props.map(name => [name,name]));
  const propNames = Object.keys(props);

  Object.defineProperties(proxy, propNames.reduce((a,k) => {
const propName = props[k];
const propFn = fn(propName);
    return { ...a,[k]
: {
      get: () => propFn(undefined),
      set: (value) => propFn(value),
      enumerable: true
    }};
  }, {}));
  return proxy;
};