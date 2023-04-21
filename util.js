// ==UserScript==

// @name         util.js
// @namespace    util
// @version      0.2
// @description  geom.js, align.js, bbox.js, util.js, graph.js, intersection.js, point.js, line.js, lineList.js, element.js, node.js, trbl.js, rect.js, size.js, iterator.js, pointList.js, matrix.js, circle.js, polygonFinder.js, polygon.js, sweepLine.js, transformation.js, vector.js, simplify.js
// @author       You
// @match        *://*/*
// @exclude      *://127.0.0.1*/*
// @updateURL    http://127.0.0.1:9000/lib/util.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

/* jshint esversion: 6 */
/* jshint ignore:start */

/**
 * Class for utility.
 *
 * @class      Util (name)
 */

export function Util(g) {
  const globalObject = g || Util.getGlobalObject();
  globalObject.Util = Util;
  return Util;
}

Util.toString = undefined;
//export const Util = {};

const lineSplit = new RegExp('\\n', 'g');

Util.inspectSymbol = Symbol.for('nodejs.util.inspect.custom');

Util.formatAnnotatedObject = function(subject, o) {
  const { indent = '  ', spacing = ' ', separator = ',', newline = '\n', maxlen = 30, depth = 1, level = 0 } = o;
  const i = indent.repeat(o.level || 0);
  let nl = newline != '' ? newline + i : spacing;
  const opts = {
    ...o,
    newline: depth >= 0 ? newline : '',
    depth: depth - 1,
    level: level + 1
  };
  if(subject && subject.toSource !== undefined) return subject.toSource();
  if(subject instanceof Date) return 'new Date(' + new Date().toISOString() + ')';
  if(typeof subject == 'string') return "'" + subject + "'";
  if(typeof subject == 'number') return subject;
  if(subject != null && subject.y2 !== undefined) return `rect[${spacing}${subject.x}${separator}${subject.y} | ${subject.x2}${separator}${subject.y2} (${subject.w}x${subject.h}) ]`;
  if(Util.isObject(subject) && 'map' in subject && typeof subject.map == 'function') return `[${nl}${subject.map(i => Util.formatAnnotatedObject(i, opts)).join(separator + nl)}]`;
  if(typeof subject === 'string' || subject instanceof String) return `'${subject}'`;
  let longest = '';
  let r = [];
  for(let k in subject) {
    const v = subject[k];
    if(k.length > longest.length) longest = k;
    let s = '';
    if(typeof v === 'symbol') {
      s = 'Symbol';
    } else if(typeof v === 'string' || v instanceof String) {
      s = `'${v}'`;
    } else if(typeof v === 'function') {
      s = (v + '').replace(lineSplit, '\n' + i);
      s = (Util.fnName(s) || 'function') + '()';
    } else if(typeof v === 'number' || typeof v === 'boolean') {
      s = `${v}`;
    } else if(v === null) {
      s = 'null';
    } else if(v && v.length !== undefined) {
      try {
        s = depth <= 0 ? `Array(${v.length})` : `[ ${v.map(item => Util.formatAnnotatedObject(item, opts)).join(', ')} ]`;
      } catch(err) {
        s = `[${v}]`;
      }
    } else if(v && v.toSource !== undefined) {
      s = v.toSource();
    } else if(opts.depth >= 0) {
      s = s.length > maxlen ? `[Object ${Util.objName(v)}]` : Util.formatAnnotatedObject(v, opts);
    } else {
      let c = Util.className(v);
      let t = Util.ucfirst(typeof v);

      s = `[${t}${c !== t ? ' ' : ''}${c !== t ? c : ''}]`;
    }
    if(s == '') s = typeof v;
    r.push([k, s]);
  }
  let padding = x => indent + (opts.newline != '' ? Util.pad(x, longest.length, spacing) : spacing);
  let j = separator + spacing;
  if(r.length > 6) {
    nl = opts.newline + i;
    j = separator + (opts.newline != '' ? nl : spacing);
  }
  let ret = '{' + opts.newline + r.map(arr => padding(arr[0]) + arr[0] + ':' + spacing + arr[1]).join(j) + opts.newline + i + '}';
  return ret;
};
Util.curry = (fn, arity) => {
  if(arity == null) arity = fn.length;
  let ret = function curried(...args) {
    let thisObj = this;
    if(args.length >= arity) return fn.apply(this, args);

    let n = arity - args.length;
    let a = Array.from({ length: n }, (v, i) => String.fromCharCode(65 + i));
    let Curried = function(...a) {
      return curried.apply(thisObj, a);
    }; //;
    return [
      function() {
        return Curried(...args);
      },
      function(a) {
        return Curried(...args, a);
      },
      function(a, b) {
        return Curried(...args, a, b);
      },
      function(a, b, c) {
        return r(...args, a, b, c);
      },
      function(a, b, c, d) {
        return Curried(...args, a, b, c, d);
      }
    ][n];
    return new Function(...a, `const { curried,thisObj,args} = this; return curried.apply(thisObj, args.concat([${a.join(',')}]))`).bind({ args, thisObj, curried });
  };
  Object.defineProperties(ret, {
    length: {
      value: arity,
      configurable: true,
      writable: true,
      enumerable: false
    },
    orig: {
      get() {
        return fn;
      }
    }
  });
  return ret;
};
Util.arityN = (fn, n) => {
  const arityFn = [
    function(fn) {
      return function() {
        return fn();
      };
    },
    function(fn) {
      return function(a) {
        return fn(a);
      };
    },
    function(fn) {
      return function(a, b) {
        return fn(a, b);
      };
    },
    function(fn) {
      return function(a, b, c) {
        return fn(a, b, c);
      };
    },
    function(fn) {
      return function(a, b, c, d) {
        return fn(a, b, c, d);
      };
    },
    function(fn) {
      return function(a, b, c, d, e) {
        return fn(a, b, c, d, e);
        H;
      };
    }
  ];
  if(n && n <= 5) return arityFn[n](fn);
  return fn;
};

Util.getter = target => {
  let self;
  if(typeof target.get == 'function') self = target.get;
  else
    self = function(key) {
      if(!target) {
        if(this !== self && this) target = this;
        self.target = target;
      }
      let obj = target;
      if(!self.fn) {
        if(typeof obj == 'object' && obj !== null) {
          if(typeof obj.get == 'function') self.fn = key => obj.get(key);
        }
        if(!self.fn) self.fn = key => obj[key];
      }
      return self.fn(key);
    };
  if(target !== undefined) self.target = target;
  return self;
};
Util.setter = target => {
  if(typeof target.set == 'function') return target.set;
  let set;
  set = function(key, value) {
    if(!target) {
      if(this !== set && this) target = this;
      set.target = target;
    }
    let obj = target;
    if(!set.fn) {
      if(typeof obj == 'object' && obj !== null) {
        if(typeof obj.set == 'function') set.fn = (key, value) => obj.set(key, value);
      }
    }
    if(!set.fn) set.fn = (key, value) => ((obj[key] = value), obj);
    return set.fn(key, value);
  };
  if(target !== undefined) set.target = target;
  return set;
};
Util.remover = target => (typeof target == 'object' && target !== null ? (typeof target.delete == 'function' ? key => target.delete(key) : key => delete target[key]) : null);
Util.hasFn = target => (typeof target == 'object' && target !== null ? (typeof target.has == 'function' ? key => target.has(key) : key => key in target) : null);
Util.adder = target => {
  let self;

  if(target instanceof Set) return arg => target.add(arg);
  if(target instanceof Array) return arg => (target.push(arg), target);

  self = function(obj, arg = 1) {
    if(!target) if (obj) target = obj;

    if(!self.fn) ChooseFn(arg, obj);
    //console.debug('adder', self.fn + '');

    // if(!self.fn) console.log('adder', { target, thisObj: this, fn: self.fn + '', arg });
    return self.fn(obj, arg);
  };
  if(target && !self.fn) {
    ChooseFn(',', target);
    target = null;
  }

  return self;

  function ChooseFn(a, o) {
    if(!self.fn) {
      if(typeof target == 'object' && target !== null) {
        if(typeof target.add == 'function') self.fn = (obj, arg) => (obj.add(arg), undefined);
        else if(typeof target.push == 'function') self.fn = (obj, arg) => (obj.push(arg), undefined);
      }
    }
    let isNum = Util.isNumeric(a);
    //console.debug('ChooseFn', { a, o, f: self.fn });
    if(!self.fn) {
      if(typeof o == 'string') self.fn = (obj, arg) => (obj == '' ? '' : obj + ', ') + arg;
      else if(typeof o == 'number') self.fn = (num, arg) => (typeof num == 'number' ? num : 0) + +arg;
      else if(a) self.fn = (obj, arg) => ((obj || (isNum || typeof arg == 'number' ? 0 : '')) + isNum ? +arg : ',' + arg);
    }
  }
};
Util.updater = (target, get, set, fn) => {
  let value;

  /* prettier-ignore */ get = get || Util.getter(target);
  /* prettier-ignore */ set = set || Util.setter(target);

  return (k, f, i) => doUpdate(k, f || fn, i);
  function doUpdate(key, func, i) {
    value = get.call(target, key);
    let tmp = func(value, i, key);

    if(tmp !== undefined && tmp != value) {
      set.call(target, key, tmp);

      value = get.call(target, key);
    }
    return value;
  }
};
Util.getOrCreate = (target, create = () => ({}), set) => {
  const get = Util.getter(target),
    has = Util.hasFn(target);
  /* prettier-ignore */ set = set || Util.setter(target);
  let value;
  return key => (value = has.call(target, key) ? get.call(target, key) : ((value = create(key, target)), set.call(target, key, value), value));
};
Util.accumulate = (entries, dest = new Map()) => {
  let get = Util.getOrCreate(dest, () => []);
  for(let [key, value] of entries) Util.adder(get(key))(value);
  return dest;
};
Util.memoize = (fn, storage = new Map()) => {
  let self;
  const getter = typeof storage.get == 'function' ? storage.get : typeof storage == 'function' ? storage : Util.getter(storage);
  const setter = typeof storage.set == 'function' ? storage.set : typeof storage == 'function' ? storage : Util.setter(storage);
  self = function(...args) {
    // let n = args[0]; // just taking one argument here
    let cached;
    let key = args[0];

    if((cached = getter.call(storage, key))) {
      //console.log('Fetching from cache');
      return cached;
    }
    let result = fn.call(this, ...args);
    setter.call(storage, key, result);
    return result;
  };
  self.cache = storage;
  return Object.freeze(self);
};
Util.once = (fn, thisArg, memoFn) => {
  let ran = false;
  let ret;

  return function(...args) {
    if(!ran) {
      ran = true;
      ret = fn.call(thisArg || this, ...args);
    } else if(typeof memoFn == 'function') {
      ret = memoFn(ret);
    }
    return ret;
  };
};
Util.delay = (func, wait, thisObj) => {
  if(typeof func != 'function') throw new TypeError(FUNC_ERROR_TEXT);
  return function(...args) {
    setTimeout(function () {
      func.apply(thisObj || this, args);
    }, wait);
  };
};
Util.throttle = (f, t, thisObj) => {
  let lastCall;
  return function(...args) {
    let previousCall = lastCall;
    lastCall = Date.now();
    if(
      previousCall === undefined || // function is being called for the first time
      lastCall - previousCall > t
    )
      // throttle time has elapsed
      f.apply(thisObj || this, args);
  };
};
Util.debounce = (func, wait, options = {}) => {
  if(!Number.isFinite(wait)) throw new TypeError('Expected `wait` to be a finite number');
  let id, args, ctx, timestamp, r;
  const { leading, thisObj } = options;
  if(null == wait) wait = 100;
  function later() {
    let last = Date.now() - timestamp;
    if(last < wait && last >= 0) {
      id = setTimeout(later, wait - last);
    } else {
      id = null;
      if(!leading) {
        r = func.apply(ctx, args);
        ctx = args = null;
      }
    }
  }
  function debounced(...a) {
    ctx = thisObj || this;
    args = a;
    timestamp = Date.now();
    let callNow = leading && !id;
    if(!id) id = setTimeout(later, wait);
    if(callNow) {
      r = func.apply(ctx, args);
      ctx = args = null;
    }
    return r;
  }
  debounced.clear = function() {
    if(id) {
      clearTimeout(id);
      id = null;
    }
  };
  debounced.flush = function() {
    if(id) {
      r = func.apply(ctx, args);
      ctx = args = null;
      clearTimeout(id);
      id = null;
    }
  };
  return debounced;
};

Util.debounceAsync = (fn, wait, options = {}) => {
  if(!Number.isFinite(wait)) throw new TypeError('Expected `wait` to be a finite number');
  let r,
    id,
    resolveList = [];
  const { thisObj, leading } = options;
  return function(...a) {
    return new Promise(resolve => {
      const callNow = leading && !id;
      clearTimeout(id);
      id = setTimeout(() => {
        id = null;
        const result = leading ? r : fn.apply(thisObj || this, a);
        for(resolve of resolveList) resolve(result);
        resolveList = [];
      }, wait);
      if(callNow) {
        r = fn.apply(thisObj || this, a);
        resolve(r);
      } else {
        resolveList.push(resolve);
      }
    });
  };
};

/*Util.debounce = (f, t, thisObj) => {
  let lastCall, lastCallTimer;
  return function(...args) {
    let previousCall = lastCall;
    lastCall = Date.now();
    if(previousCall && lastCall - previousCall <= t) clearTimeout(lastCallTimer);

    return new Promise((resolve, reject) => {
      lastCallTimer = setTimeout(() => resolve(f.apply(thisObj || this, args)), t);
    });
  };
};*/
Util.getGlobalObject = Util.memoize(arg => {
  const retfn = typeof arg == 'function' ? arg : typeof arg == 'string' ? g => g[arg] : g => g;

  return Util.tryCatch(
    () => globalThis,
    retfn,
    err =>
      Util.tryCatch(
        () => globalThis,
        retfn,
        err =>
          Util.tryCatch(
            () => window,
            retfn,
            err => console.log('Util.getGlobalObject:', err)
          )
      )
  );
});

Util.isDebug = Util.memoize(() => {
  if(process !== undefined && process.env.NODE_ENV === 'production') return false;
  return true;
});

/*Util.log = Util.curry(function(n, base) {
  return Math.log(n) / (base ? Math.log(base) : 1);
});*/
Util.log = (...args) => {
  let location;
  if(args[0] instanceof Util.location) location = args.shift();
  else {
    let stack = Util.getStackFrames(2);
    if(/\/util\.js$/.test(stack[0].fileName)) stack = stack.slice(1);
    location = stack[0].getLocation();
  }
  let locationStr = location.toString(true);
  let c = [(locationStr[Util.inspectSymbol] || locationStr.toString).call(locationStr)];
  c.push(' ');
  let filters = Util.log.filters;
  let results = filters.map(f => f.test(locationStr));
  if(filters.every(f => !f.test(locationStr))) return;
  console.log('log', { args, c });
  Util.putStack();
  args = args.reduce((a, p, i) => {
    if(Util.isObject(p) && p[Util.log.methodName]) p = p[Util.log.methodName]();
    else if(Util.isObject(p) && p[Util.inspectSymbol]) p = p[Util.inspectSymbol]();
    else if(typeof p != 'string') {
      if(Util.isObject(p) && typeof p.toString == 'function' && !Util.isNativeFunction(p.toString)) p = p.toString();
      else p = inspect(p, { multiline: false });
    }

    //  if(i > 0) a.push(',');
    a.push(p);
    //    a.append([p]);
    return a;
  }, c);
  if(args.toConsole) args.toConsole();
  else console.log(...args);
};

Object.defineProperty(Util.log, 'methodName', {
  get: () => (Util.isBrowser() ? 'toConsole' : 'toAnsi256')
});

Util.log.filters = [/.*/];
Util.log.setFilters = function(args) {
  this.filters = [...args].map(arg => (arg instanceof RegExp ? arg : new RegExp(arg)));
};
Util.log.getFilters = function() {
  return this.filters;
};

Util.msg = (strings, ...substitutions) => {
  let i,
    o = [];
  for(i = 0; i < Math.max(strings.length, substitutions.length); i++) {
    if(strings[i] !== undefined) o.push(strings[i].trim());
    if(substitutions[i] !== undefined) o.push(substitutions[i]);
  }
  console.log(...o);
};

Util.logBase = Util.curry((base, n) => Math.log(n) / Math.log(base));

Util.generalLog = function(n, x) {
  return Math.log(x) / Math.log(n);
};
Util.toSource = function(arg, opts = {}) {
  const { quote = "'", colors = false, multiline = false, json = false } = opts;
  const { c = Util.coloring(colors) } = opts;
  let o = [];
  const { print = (...args) => (o = c.concat(o, c.text(...args))) } = opts;
  if(Array.isArray(arg)) {
    print('[', 1, 36);
    for(let item of arg) {
      if(o.length > 0) print(', ');
      Util.toSource(item, { ...opts, c, print });
    }
    print(']', 1, 36);
  } else if(typeof arg == 'number' || arg === undefined || arg === null) print(arg, 1, 35);
  else if(typeof arg == 'string') print(`${quote}${arg}${quote}`, 1, 36);
  else if(arg && arg.x !== undefined && arg.y !== undefined) {
    print('[', 1, 36);
    print(arg.x, 1, 32);
    print(',', 1, 36);
    print(arg.y, 1, 32);
    print(']', 1, 36);
  } else if(typeof arg == 'object') {
    let i = 0;
    let m = arg instanceof Map;
    if(m) {
      print('new ', 1, 31);
      print('Map', 1, 33);
    }
    print((m ? '([[' : '{') + (multiline ? '\n  ' : ' '), 1, 36);
    for(const [prop, value] of Util.entries(arg)) {
      if(i > 0) {
        let s = multiline ? ',\n  ' : ', ';
        if(m) s = ' ]' + s + '[ ';
        print(s, 1, 36);
      }
      if(!m) print(json ? `"${prop}"` : prop, 1, 33);
      else Util.toSource(prop, { ...opts, c, print });
      print(m ? ', ' : ': ', 1, 36);
      Util.toSource(value, { ...opts, c, print });
      i++;
    }
    print(multiline ? '\n' : ' ' + (m ? ']])' : '}'), 1, 36);
  }
  return o;
};
Util.debug = function(message) {
  const args = [...arguments];
  let cache = [];
  const removeCircular = function(key, value) {
    if(typeof value === 'object' && value !== null) {
      if(cache.indexOf(value) !== -1) return;
      cache.push(value);
    }
    return value;
  };
  const str = args
    .map(arg => (typeof arg === 'object' ? JSON.toString(arg, removeCircular) : arg))
    .join(' ')
    .replace(lineSplit, '');
  //console.log("STR: "+str);
  //console.log.call(console, str);
  //Util.log.apply(Util, args)
};
Util.type = function({ type }) {
  return (type && String(type).split(new RegExp('[ ()]', 'g'))[1]) || '';
};
Util.functionName = function(fn) {
  if(typeof fn == 'function' && typeof fn.name == 'string') return fn.name;
  try {
    const matches = /function\s*([^(]*)\(.*/g.exec(fn + '');
    if(matches && matches[1]) return matches[1];
  } catch {}
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
  if(Util.isObject(proto) && 'constructor' in proto) return Util.functionName(proto.constructor);
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
Util.bitMask = function(bits, start = 0) {
  let r = 0;
  let b = 1 << start;

  for(let i = 0; i < bits; i++) {
    r |= b;
    b <<= 1;
  }
  return r;
};

Util.bitGroups = function(num, bpp, minLen) {
  let m = Util.bitMask(bpp, 0);
  let n = Math.floor(64 / bpp);
  let r = [];
  for(let i = 0; i < n; i++) {
    r.push(num & m);
    num /= m + 1;
  }
  while(r.length > 0 && r[r.length - 1] == 0 /* && Util.mod(r.length *bpp, 8) > 0*/) r.pop();
  while(r.length < minLen) r.push(0);
  return r;
};

Util.bitStuff = (arr, bpp) => {
  const m = Util.bitMask(bpp, 0);
  return arr.reduce(([b, f], n) => [b + (n & m) * f, f * (m + 1)], [0, 1])[0];
};

Util.toBinary = function(num) {
  return parseInt(num).toString(2);
};
Util.toBits = function(num) {
  let a = Util.toBinary(num).split('').reverse();
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
Util.bitNo = function(n) {
  for(let i = 0; n; i++) {
    if(n & 1) return i;
    n >>= 1;
  }
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
Util.range = function(...args) {
  let [start, end, step = 1] = args;
  let ret;
  start /= step;
  end /= step;
  if(start > end) {
    ret = [];
    while(start >= end) ret.push(start--);
  } else {
    ret = Array.from({ length: end - start + 1 }, (v, k) => k + start);
  }
  if(step != 1) {
    ret = ret.map(n => n * step);
  }
  //console.log("Util.range ", r);
  return ret;
};
Util.set = function(obj, prop, value) {
  const set = obj instanceof Map ? (prop, value) => obj.set(prop, value) : (prop, value) => (obj[prop] = value);
  if(arguments.length == 1)
    return (prop, value) => {
      set(prop, value);
      return set;
    };
  if(arguments.length == 2) return value => set(prop, value);
  return set(prop, value);
};

Util.get = Util.curry((obj, prop) => (obj instanceof Map ? obj.get(prop) : obj[prop]));
Util.symbols = (() => {
  const { asyncIterator, hasInstance, isConcatSpreadable, iterator, match, matchAll, replace, search, species, split, toPrimitive, toStringTag, unscopables } = Symbol;
  return {
    inspect: Util.inspectSymbol,
    asyncIterator,
    hasInstance,
    isConcatSpreadable,
    iterator,
    match,
    matchAll,
    replace,
    search,
    species,
    split,
    toPrimitive,
    toStringTag,
    unscopables
  };
})();

/*
  const { indent = '  ', newline = '\n', depth = 2, spacing = ' ' } = typeof opts == 'object' ? opts : { indent: '', newline: '', depth: typeof opts == 'number' ? opts : 10, spacing: ' ' };

  return Util.formatAnnotatedObject(obj, { indent, newline, depth, spacing });
};*/
Util.bitArrayToNumbers = function(arr) {
  let numbers = [];
  for(let i = 0; i < arr.length; i++) {
    const number = i + 1;
    if(arr[i]) numbers.push(number);
  }
  return numbers;
};
Util.bitsToNumbers = function(bits) {
  let a = Util.toBinary(bits).split('');
  let r = [];
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
Util.draw = (arr, n = 1, rnd = Util.rng) => {
  let pos = Util.randInt(0, arr.length - n - 1, rnd);
  const r = arr.splice(pos, n);
  return n == 1 ? r[0] : r;
};
Util.is = function(what, ...pred) {
  let fnlist = pred.map(type => (Util.isConstructor(type) ? what instanceof type : this.is[type]));
  //console.debug('fnlist:', fnlist);
  return fnlist.every(fn => fn(what));
};

Util.instanceOf = (value, ctor) => Util.isObject(value) && Util.isConstructor(ctor) && value instanceof ctor;

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
Util.abbreviate = function(str, max = 40, suffix = '...') {
  max = +max;
  if(isNaN(max)) max = Infinity;
  if(Array.isArray(str)) {
    return Array.prototype.slice.call(str, 0, Math.min(str.length, max)).concat([suffix]);
  }
  if(typeof str != 'string' || !Number.isFinite(max) || max < 0) return str;
  str = '' + str;
  if(str.length > max) {
    return str.substring(0, max - suffix.length) + suffix;
  }
  return str;
};
Util.trim = function(str, charset) {
  const r1 = RegExp('^[' + charset + ']*');
  const r2 = RegExp('[' + charset + ']*$');
  return str.replace(r1, '').replace(r2, '');
};
Util.trimRight = function(str, charset) {
  const r2 = RegExp('[' + charset + ']*$');
  return str.replace(r2, '');
};
Util.indent = (text, space = '  ') => {
  text = text.trim();
  if(!/\n/.test(text)) return text;
  return text.replace(/(\n)/g, '\n' + space) + '\n';
};
Util.define = (obj, ...args) => {
  if(typeof args[0] == 'object') {
    const [arg, overwrite = true] = args;
    let adecl = Object.getOwnPropertyDescriptors(arg);
    let odecl = {};
    for(let prop in adecl) {
      if(prop in obj) {
        if(!overwrite) continue;
        else delete obj[prop];
      }
      if(Object.getOwnPropertyDescriptor(obj, prop)) delete odecl[prop];
      else
        odecl[prop] = {
          ...adecl[prop],
          enumerable: false,
          configurable: true,
          writeable: true
        };
    }
    Object.defineProperties(obj, odecl);
    return obj;
  }
  const [key, value, enumerable = false] = args;
  Object.defineProperty(obj, key, {
    enumerable,
    configurable: true,
    writable: true,
    value
  });
  return obj;
};
Util.memoizedProperties = (obj, methods) => {
  let decls = {};
  for(let method in methods) {
    const memoize = Util.memoize(methods[method]);
    decls[method] = {
      get() {
        return memoize.call(this);
      },
      enumerable: true,
      configurable: true
    };
  }
  return Object.defineProperties(obj, decls);
};
Util.copyWhole = (dst, ...args) => {
  let chain = [];
  for(let src of args) chain = chain.concat(Util.getPrototypeChain(src).reverse());
  //console.debug('chain:', ...chain);
  for(let obj of chain) Util.define(dst, obj);
  return dst;
};
Util.copyEntries = (obj, entries) => {
  for(let [k, v] of entries) obj[k] = v;
  return obj;
};

Util.extend = (...args) => {
  let deep = false;
  if(typeof args[0] == 'boolean') deep = args.shift();

  let result = args[0];
  if(Util.isUnextendable(result)) throw new Error('extendee must be an object');
  let extenders = args.slice(1);
  let len = extenders.length;
  for(let i = 0; i < len; i++) {
    let extender = extenders[i];
    for(let key in extender) {
      if(true || extender.hasOwnProperty(key)) {
        let value = extender[key];
        if(deep && Util.isCloneable(value)) {
          let base = Array.isArray(value) ? [] : {};
          result[key] = Util.extend(true, result.hasOwnProperty(key) && !Util.isUnextendable(result[key]) ? result[key] : base, value);
        } else {
          result[key] = value;
        }
      }
    }
  }
  return result;
};

Util.isCloneable = obj => Array.isArray(obj) || {}.toString.call(obj) == '[object Object]';

Util.isUnextendable = val => !val || (typeof val != 'object' && typeof val != 'function');

/*
Util.extend = (obj, ...args) => {
  for(let other of args) {
    for(let key of Util.iterateMembers(other, (k, value) => obj[k] === undefined && [k, value])) {
      const value = other[key];
      try {
        Object.defineProperty(obj, key, {
          value,
          enumerable: false,
          configurable: false,
          writable: false
        });
      } catch(err) {
        console.log('extend:' + err + '\n', { obj, key, value });
      }
    }
  }
  return obj;
};*/

Util.static = (obj, functions, thisObj, pred = (k, v, f) => true) => {
  for(let [name, fn] of Util.iterateMembers(
    functions,

    Util.tryPredicate((key, depth) => obj[key] === undefined && typeof functions[key] == 'function' && pred(key, depth, functions) && [key, value])
  )) {
    const value = function(...args) {
      return fn.call(thisObj || obj, this, ...args);
    };
    try {
      obj[name] = value;

      /*        Object.defineProperty(obj, name, { value, enumerable: false, configurable: false, writable: false });*/
    } catch(err) {
      console.log('static:', err);
    }
  }
  return obj;
};
Util.defineGetter = (obj, key, fn, enumerable = false) =>
  obj[key] === undefined &&
  Object.defineProperty(obj, key, {
    enumerable,
    configurable: true,
    get: fn
  });
Util.defineGetterSetter = (obj, key, g, s, enumerable = false) =>
  obj[key] === undefined &&
  Object.defineProperty(obj, key, {
    get: g,
    set: s,
    enumerable
  });
Util.defineGettersSetters = (obj, gettersSetters) => {
  for(let name in gettersSetters) Util.defineGetterSetter(obj, name, gettersSetters[name], gettersSetters[name]);
};

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
    return inspect(this, { depth: 100, ...opts });
  });*/
};
Util.adapter = function(obj, getLength = obj => obj.length, getKey = (obj, index) => obj.key(index), getItem = (obj, key) => obj[key], setItem = (obj, index, value) => (obj[index] = value)) {
  const adapter = obj && {
    /* prettier-ignore */ get length() {
      return getLength(obj);
    },
    /* prettier-ignore */ get instance() {
      return obj;
    },
    key(i) {
      return getKey(obj, i);
    },
    get(key) {
      return getItem(obj, key);
    },
    has(key) {
      return this.get(key) !== undefined;
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
  s = Util.tryCatch(
    () => !s && globalThis.window,
    w => w.localStorage,
    () => s
  );

  return Util.adapter(
    s,
    l => l.length,
    (l, i) => l.key(i),
    (l, key) => JSON.parse(l.getItem(key)),
    (l, key, v) => l.setItem(key, JSON.toString(v))
  );
};
let doExtendArray = Util.extendArray;
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
        yield entry.name !== undefined && entry.value !== undefined ? [entry.name, entry.value] : entry[0] !== undefined && entry[1] !== undefined ? entry : [entry, map[entry]];
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
  else if(Array.isArray(any)) return Util.fromEntries(any);
  else if('entries' in any) return Util.fromEntries(any.entries());
  return Object.assign({}, any);
};
Util.tail = function(arr) {
  return arr && arr.length > 0 ? arr[arr.length - 1] : null;
};
Util.splice = function(str, index, delcount, insert) {
  const chars = str.split('');
  Array.prototype.splice.apply(chars, arguments);
  return chars.join('');
};
Util.identity = arg => arg;
Util.reverse = arr => arr.reverse();

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
    return (function* () {
      for(let i = 0; i < n; i++) yield what();
    })();
  return (function* () {
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
Util.chunkArray = (a, size) =>
  a.reduce((acc, item, i) => {
    const idx = i % size;
    if(idx == 0) acc.push([]);

    acc[acc.length - 1].push(item);
    return acc;
  }, []);

Util.partition = function* (a, size) {
  for(let i = 0; i < a.length; i += size) yield a.slice(i, i + size);
};

Util.difference = (a, b, incicludes) => {
  //console.log('Util.difference', { a, b, includes });
  if(typeof includes != 'function') return [a.filter(x => !b.includes(x)), b.filter(x => !a.includes(x))];

  return [a.filter(x => !includes(b, x)), b.filter(x => !includes(a, x))];
};
Util.intersect = (a, b) => a.filter(Set.prototype.has, new Set(b));
Util.symmetricDifference = (a, b) => [].concat(...Util.difference(a, b));
Util.union = (a, b, equality) => {
  if(equality === undefined) return [...new Set([...a, ...b])];

  return Util.unique([...a, ...b], equality);
};

/**
 * accepts array and function returning `true` or `false` for each element
 *
 * @param  {[type]}   array    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Util.partition = (array, callback) => {
  const matches = [],
    nonMatches = [];

  // push each element into array depending on return value of `callback`
  for(let element of array) (callback(element) ? matches : nonMatches).push(element);

  return [matches, nonMatches];
};

Util.chances = function(numbers, matches) {
  const f = Util.factorial;
  return f(numbers) / (f(matches) * f(numbers - matches));
};
Util.sum = arr => arr.reduce((acc, n) => acc + n, 0);

Util.expr = fn => {
  let nargs = fn.length;
  let ret = Util.curry(fn);

  return ret;
  return expr;
  function expr(...args) {
    let nums = [];

    function addArgs(args) {
      while(args.length > 0) {
        const arg = args.shift();

        if(typeof arg == 'function') args.unshift(arg(...args.splice(0, arg.length)));
        else if(typeof arg == 'number') nums.push(arg);
      }
    }
    addArgs(args);
    //console.debug('nargs:', nargs);
    //console.debug('nums.length:', nums.length);
    if(nums.length >= nargs) return fn(...nums);

    //let args = ['a','b','c','d'].slice(0,nargs - nums.length);
    let ret = function returnFn(...args) {
      addArgs(args.slice(0, nargs - nums.length));

      //console.log('nums.length:', nums.length);
      if(nums.length >= nargs) return fn(...nums);
      return returnFn;
    };
    ret.nums = nums;

    return ret;
  }
};

Util.add = Util.curry((a, b) => a + b);
Util.sub = Util.curry((a, b) => a - b);
Util.mul = Util.curry((a, b) => a * b);
Util.div = Util.curry((a, b) => a / b);
Util.xor = Util.curry((a, b) => a ^ b);
Util.or = Util.curry((a, b) => a | b);
Util.and = Util.curry((a, b) => a & b);
Util.mod = (a, b) => (typeof b == 'number' ? ((a % b) + b) % b : n => ((n % a) + a) % a);
Util.pow = Util.curry((a, b) => Math.pow(a, b));

/*Util.define(String.prototype,
  'splice',
  function(index, delcount, insert) {
    return Util.splice.apply(this, [this, ...arguments]);
  }
);*/
Util.fnName = function(f, parent) {
  if(typeof f == 'function') {
    if(f.name !== undefined) return f.name;
    const s = typeof f.toSource == 'function' ? f.toSource() : f + '';
    const matches = /([A-Za-z_][0-9A-Za-z_]*)\w*[(\]]/.exec(s);
    if(matches) return matches[1];
    if(parent !== undefined) {
      for(let key in parent) {
        if(parent[key] === f) return key;
      }
    }
  }
};

Util.objName = function(o) {
  if(o === undefined || o == null) return `${o}`;
  if(typeof o === 'function' || o instanceof Function) return Util.fnName(o);
  if(o.constructor) return Util.fnName(o.constructor);
  const s = `${o.type}`;
  return s;
};
Util.findKey = function(obj, pred, thisVal) {
  let fn = typeof pred == 'function' ? value : v => v === pred;
  for(let k in obj) if(fn.call(thisVal, obj[k], k)) return k;
};
Util.find = function(arr, value, prop = 'id') {
  let pred;
  if(typeof value == 'function') {
    pred = value;
  } else if(prop && prop.length !== undefined) {
    pred = function(obj) {
      if(obj[prop] == value) return true;
      return false;
    };
  } else {
    pred = typeof prop == 'function' ? obj => prop(value, obj) : obj => obj[prop] == value;
  }
  if(typeof arr.find == 'function') return arr.find(pred);
  if(!arr[Symbol.iterator] && typeof arr.entries == 'function') {
    let entryPred = pred;
    pred = ([key, value], arr) => entryPred(value, key, arr);
    arr = arr.entries();
  }
  for(let v of arr) {
    if(pred(v)) return v;
  }
  return null;
};

Util.findIndex = function(obj, pred, thisArg) {
  if(typeof obj.findIndex == 'function') return obj.findIndex(pred, thisArg);
  return Util.findKey(obj, pred, thisArg);
};

Util.match = function(arg, pred) {
  let match = pred;
  if(pred instanceof RegExp) {
    const re = pred;
    match = (val, key) => (val && val.tagName !== undefined && re.test(val.tagName)) || (typeof key === 'string' && re.test(key)) || (typeof val === 'string' && re.test(val));
  }
  if(Array.isArray(arg)) {
    if(!(arg instanceof Array)) arg = [...arg];
    return arg.reduce((acc, val, key) => {
      if(match(val, key, arg)) acc.push(val);
      return acc;
    }, []);
  } else if(Util.isMap(arg)) {
    //console.log('Util.match ', { arg });
    return [...arg.keys()].reduce((acc, key) => (match(arg.get(key), key, arg) ? acc.set(key, arg.get(key)) : acc), new Map());
  }
  return filter(arg, match);
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

Util.greatestCommonDenominator = (a, b) => (b ? Util.greatestCommonDenominator(b, a % b) : a);

Util.leastCommonMultiple = (n1, n2) => {
  //Find the gcd first
  let gcd = Util.greatestCommonDenominator(n1, n2);

  //then calculate the lcm
  return (n1 * n2) / gcd;
};
Util.matchAll = Util.curry(function* (re, str) {
  let match;
  re = re instanceof RegExp ? re : new RegExp(Array.isArray(re) ? '(' + re.join('|') + ')' : re, 'g');
  do {
    if((match = re.exec(str))) yield match;
  } while(match != null);
});

Util.inspect = function(obj, opts = {}) {
  const {
    quote = '"',
    multiline = true,
    toString = Symbol.toStringTag || 'toString' /*Util.symbols.toStringTag*/,
    stringFn = str => str,
    indent = '',
    colors = false,
    stringColor = [1, 36],
    spacing = '',
    newline = '\n',
    padding = ' ',
    separator = ',',
    colon = ': ',
    depth = 10,
    json = false
  } = {
    ...Util.inspect.defaultOpts,
    toString: Util.symbols.inspect,
    colors: true,
    multiline: true,
    newline: '\n',
    ...opts
  };

  try {
    if(Util == obj) return Util;
  } catch(e) {}
  //console.log("Util.inspect", {quote,colors,multiline,json})

  let out;
  const { c = Util.coloring(colors) } = opts;
  const { print = (...args) => (out = c.concat(out, c.text(...args))) } = opts;
  const sep = multiline && depth > 0 ? (space = false) => newline + indent + (space ? '  ' : '') : (space = false) => (space ? spacing : '');
  if(typeof obj == 'number') {
    print(obj + '', 1, 36);
  } else if(typeof obj == 'undefined' || obj === null) {
    print(obj + '', 1, 35);
  } else if(typeof obj == 'function' /*|| obj instanceof Function || Util.className(obj) == 'Function'*/) {
    obj = '' + obj;
    //  if(!multiline)
    obj = obj.split(lineSplit)[0].replace(/{\s*$/, '{}');
    print(obj);
  } else if(typeof obj == 'string') {
    print(`${quote}${stringFn(obj)}${quote}`, 1, 36);
  } else if(obj instanceof Date) {
    print(`new `, 1, 31);

    print(`Date`, 1, 33);
    print(`(`, 1, 36);
    print(obj.getTime() + obj.getMilliseconds() / 1000, 1, 36);
    print(`)`, 1, 36);
  } else if(Object.getPrototypeOf(obj) == Array.prototype) {
    let i;
    print(`[`, 1, 36);
    for(i = 0; i < obj.length; i++) {
      if(i > 0) print(separator, 1, 36);
      else print(padding);
      print(sep(i > 0));
      inspect(obj[i], {
        ...opts,
        c,
        print,
        newline: newline + '  ',
        depth: depth - 1
      });
    }
    print((padding || '') + `]`, 1, 36);
  } else if(Util.isObject(obj)) {
    const inspect = toString ? obj[toString] : null;
    if(typeof inspect == 'function' && !Util.isNativeFunction(inspect) && !/Util.inspect/.test(inspect + '')) {
      let s = inspect.call(obj, depth, { ...opts });
      //console.debug('s:', s);
      //console.debug('inspect:', inspect + '');

      out += s;
    } else {
      let isMap = obj instanceof Map;
      let keys = isMap ? obj.keys() : Object.getOwnPropertyNames(obj);
      //console.debug("keys:", keys);

      if(Object.getPrototypeOf(obj) !== Object.prototype) print(Util.className(obj) + ' ', 1, 31);
      isMap ? print(`(${obj.size}) {${sep(true)}`, 1, 36) : print('{' + (sep(true) || padding), 1, 36);
      let i = 0;
      let getFn = isMap ? key => obj.get(key) : key => obj[key];
      let propSep = isMap ? [' => ', 0] : [': ', 1, 36];
      for(let key of keys) {
        const value = getFn(key);
        if(i > 0) print(separator + sep(true), 36);
        if(typeof key == 'symbol') print(key.toString(), 1, 32);
        else if(Util.isObject(key) && typeof key[toString] == 'function') print(isMap ? `'${key[toString]()}'` : json ? `"${key.toString()}"` : key[toString](), 1, isMap ? 36 : 33);
        else if(typeof key == 'string' || (!isMap && Util.isObject(key) && typeof key.toString == 'function'))
          print(json ? `"${key.toString()}"` : isMap || /(-)/.test(key) ? `'${key}'` : key, 1, isMap ? 36 : 33);
        else
          inspect(key, {
            ...opts,
            c,
            print,
            newline: newline + '  ',
            newline: '',
            multiline: false,
            toString: 'toString',
            depth: depth - 1
          });
        print(...propSep);
        if(typeof value == 'number') print(`${value}`, 1, 36);
        else if(typeof value == 'string' || value instanceof String) print(`${quote}${value}${quote}`, 1, 36);
        else if(typeof value == 'object')
          inspect(value, {
            ...opts,
            print,
            multiline: isMap && !(value instanceof Map) ? false : multiline,
            newline: newline + '  ',
            depth: depth - 1
          });
        else print((value + '').replace(lineSplit, sep(true)));
        i++;
      }
      print(`${multiline ? newline : padding}}`, 1, 36);
    }
  }
  return out;
};

Util.inspect.defaultOpts = {
  spacing: ' ',
  padding: ' '
};

Util.dump = function(name, props) {
  const args = [name];
  for(let key in props) {
    f;
    args.push(`\n\t${key}: `);
    args.push(props[key]);
  }
  const w = Util.tryCatch(
    () => globalThis.window,
    w => w,
    () => null
  );

  if(w) {
    //if(window.alert !== undefined)
    //alert(args);
    if(w.console !== undefined) w.console.log(...args);
  }
};
Util.ucfirst = function(str) {
  if(typeof str != 'string') str = str + '';
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};
Util.lcfirst = function(str) {
  if(typeof str != 'string') str = str + '';
  return str.substring(0, 1).toLowerCase() + str.substring(1);
};
Util.typeOf = v => {
  let type = typeof v;
  if(type == 'object' && v != null && Object.getPrototypeOf(v) != Object.prototype) type = Util.className(v);
  else type = Util.ucfirst(type);
  return type;
};

/**
 * Camelize a string, cutting the string by multiple separators like
 * hyphens, underscores and spaces.
 *
 * @param {text} string Text to camelize
 * @return string Camelized text
 */
Util.camelize = (text, sep = '') =>
  text.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2, offset) => {
    if(p2) return sep + p2.toUpperCase();
    return p1.toLowerCase();
  });

Util.decamelize = function(str, separator = '-') {
  return /.[A-Z]/.test(str)
    ? str
        .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
        .toLowerCase()
    : str;
};
Util.ifThenElse = function(pred = value => !!value, _then = () => {}, _else = () => {}) {
  return function(value) {
    let result = pred(value);
    let ret = result ? _then(value) : _else(value);
    return ret;
  };
};
Util.if = (value, _then, _else, pred) => Util.ifThenElse(pred || (v => !!v), _then || (() => value), _else || (() => value))(value);

Util.ifElse = (value, _else, pred) => Util.ifThenElse(pred || (v => !!v), () => value, _else ? () => _else : () => value)(value);
Util.ifThen = (value, _then, pred) => Util.ifThenElse(pred || (v => !!v), _then ? () => _then : () => value, () => value)(value);

Util.switch = ({ default: defaultCase, ...cases }) =>
  function(value) {
    if(value in cases) return cases[value];
    return defaultCase;
  };

Util.transform = Util.curry(function* (fn, arr) {
  for(let item of arr) yield fn(item);
});

Util.colorDump = (iterable, textFn) => {
  textFn = textFn || ((color, n) => ('   ' + (n + 1)).slice(-3) + ` ${color}`);

  let j = 0;
  const filters = 'font-weight: bold; text-shadow: 0px 0px 1px rgba(0,0,0,0.8); filter: drop-shadow(30px 10px 4px #4444dd)';

  if(!Array.isArray(iterable)) iterable = [...iterable];
  for(let j = 0; j < iterable.length; j++) {
    const [i, color] = iterable[j].length == 2 ? iterable[j] : [j, iterable[j]];
    console.log(
      `  %c    %c ${color} %c ${textFn(color, i)}`,
      `background: ${color}; font-size: 18px; ${filters};`,
      `background: none; color: ${color}; min-width: 120px; ${filters}; `,
      `color: black; font-size: 12px;`
    );
  }
};

Util.bucketInserter = (map, ...extraArgs) => {
  let inserter;
  inserter =
    typeof map.has == 'function'
      ? function(...args) {
          //console.log("bucketInsert:",map,args);
          for(let [k, v] of args) {
            let a;
            map.has(k) ? (a = map.get(k)) : map.set(k, (a = []));
            a.push(v);
          }
          return inserter;
        }
      : function(...args) {
          for(let arg of args) {
            for(let k in arg) {
              const v = arg[k];
              let a = map[k] || [];
              if(typeof a.push == 'function') a.push(v);

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

  //(there's no arrow function syntax for this)
  async function* generator() {
    for(;;) {
      if(!queue.length) {
        //there's nothing in the queue, wait until push()
        await new Promise(r => (resolve = r));
      }
      yield queue.shift();
    }
  }

  return {
    push(...args) {
      for(let event of args) {
        queue.push(event);
        if(queue.length === 1) resolve(); //allow the generator to resume
      }
      return this;
    },
    loop: generator(),

    process: async function run() {
      for await(const event of this.loop) {
        console.info('event:', event);
      }
    }
  };
};
Util.isEmail = function(v) {
  return /^[\-\w]+(\.[\-\w]+)*@[\-\w]+(\.[\-\w]+)+$/.test(v);
};
Util.isString = function(v) {
  return Object.prototype.toString.call(v) == '[object String]';
};

/**
 * Determines whether the specified v is numeric.
 *
 * @param      {<type>}   v       { parameter_description }
 * @return     {boolean}  True if the specified v is numeric, False otherwise.
 */
Util.isNumeric = v => /^[-+]?(0x|0b|0o|)[0-9]*\.?[0-9]+(|[Ee][-+]?[0-9]+)$/.test(v + '');

Util.isUndefined = arg => arg === undefined;
Util.isObject = obj => !(obj === null) && { object: obj, function: obj }[typeof obj];
Util.isPrimitive = obj => !(obj === null) && obj !== false && obj !== true && { number: obj, string: obj, boolean: obj, undefined: obj }[typeof obj];
Util.isFunction = arg => {
  if(arg !== undefined) return typeof arg == 'function' || !!(arg && arg.constructor && arg.call && arg.apply);

  /*
  let fn = arg => Util.isFunction(arg);
  fn.inverse = arg => !Util.isFunction(arg);
  return fn;*/
};
Util.not = fn =>
  function(...args) {
    return !fn(...args);
  };
Util.isAsync = fn => typeof fn == 'function' && /^[\n]*async/.test(fn + '') /*|| fn() instanceof Promise*/;

Util.isArrowFunction = fn => (Util.isFunction(fn) && !('prototype' in fn)) || /\ =>\ /.test(('' + fn).replace(/\n.*/g, ''));

Util.isEmptyString = v => Util.isString(v) && (v == '' || v.length == 0);

Util.isEmpty = (...args) => {
  function empty(v) {
    if(typeof v == 'object' && !!v && v.constructor == Object && Object.keys(v).length == 0) return true;
    if(!v || v === null) return true;
    if(typeof v == 'object' && v.length !== undefined && v.length === 0) return true;
    return false;
  }
  return args.length ? empty(args[0]) : empty;
};
Util.isNonEmpty = (...args) => {
  const empty = Util.isEmpty();
  const nonEmpty = v => !empty(v);
  return args.length ? nonEmpty(args[0]) : nonEmpty;
};
Util.isIpAddress = v => {
  const n = (v + '').split('.').map(i => +i);
  return n.length == 4 && n.every(i => !isNaN(i) && i >= 0 && i <= 255);
};
Util.isPortNumber = v => {
  const n = +v;
  return !isNaN(n) && n >= 0 && n <= 65535;
};

Util.hasProps = function(obj, props) {
  const keys = Object.keys(obj);
  return props ? props.every(prop => 'prop' in obj) : keys.length > 0;
};
Util.validatePassword = function(value) {
  return value.length > 7 && new RegExp('^(?![d]+$)(?![a-zA-Z]+$)(?![!#$%^&*]+$)[da-zA-Z!#$ %^&*]').test(value) && !/\s/.test(value);
};
Util.clone = function(obj, proto) {
  if(Array.isArray(obj)) return obj.slice();
  try {
    let ret = new obj.constructor(obj);
    return ret;
  } catch(err) {}
  if(typeof obj == 'object') return Object.create(proto || obj.constructor.prototype || Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};
//deep copy
Util.deepClone = function(data) {
  return JSON.parse(JSON.toString(data));
};
//Function
Util.findVal = function(object, propName, maxDepth = 10) {
  if(maxDepth <= 0) return null;
  for(let key in object) {
    if(key === propName) {
      //console.log(propName);
      //console.log(object[key]);
      return object[key];
    }
    let value = Util.findVal(object[key], propName, maxDepth - 1);
    if(value !== undefined) return value;
  }
};
//Deep copy for ObservableArray/Object == There is a problem
Util.deepCloneObservable = function(data) {
  let o;
  const t = typeof data;
  if(t === 'object') return data;

  if(t === 'object') {
    if(data.length) {
      for(const value of data) {
        o.push(this.deepCloneObservable(value));
      }
      return o;
    }
    for(const i in data) {
      o[i] = this.deepCloneObservable(data[i]);
    }
    return o;
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
  const arr = [];
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
    a[i].children = [];
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
Util.move = function(src, dst = []) {
  let items = src.splice(0, src.length);
  dst.splice(dst.length, 0, ...items);
  return dst;
};
Util.moveIf = function(src, pred, dst = []) {
  let items = src.splice(0, src.length);
  let i = 0;
  for(let item of items) (pred(item, i++) ? src : dst).push(item);

  return dst;
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
  let arr = cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
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
  return Util.setCookies(
    Object.keys(Util.parseCookie(c)).reduce(
      (acc, name) =>
        Object.assign(acc, {
          [name]: `; max-age=0; expires=${new Date().toUTCString()}`
        }),
      {}
    )
  );
};
Util.deleteCookie = function(name) {
  const w = Util.tryCatch(
    () => globalThis.window,
    w => w,
    () => null
  );

  if(w) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
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
  result = result || [];
  searched = searched || [];
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
              JSON.toString(object[property]);
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
Util.getURL = Util.memoize((req = {}) =>
  Util.tryCatch(
    () => process.argv[1],
    () => 'file://' + Util.scriptDir(),

    Util.tryCatch(
      () => window.location.href,

      url => url,

      () => {
        let proto = Util.tryCatch(() => (process.env.NODE_ENV === 'production' ? 'https' : null)) || 'http';
        let port = Util.tryCatch(() => (process.env.PORT ? parseInt(process.env.PORT) : process.env.NODE_ENV === 'production' ? 443 : null)) || 3000;
        let host = Util.tryCatch(() => globalThis.ip) || Util.tryCatch(() => globalThis.host) || Util.tryCatch(() => window.location.host.replace(/:.*/g, '')) || 'localhost';
        if(req && req.headers && req.headers.host !== undefined) host = req.headers.host.replace(/:.*/, '');
        else Util.tryCatch(() => process.env.HOST !== undefined && (host = process.env.HOST));
        if(req.url !== undefined) return req.url;
        const url = `${proto}://${host}:${port}`;
        return url;
      }
    )
  )
);
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
  for(let d in data) if(data[d] !== undefined) ret.push(`${encodeURIComponent(d)}=${encodeURIComponent(data[d])}`);
  return ret.join('&');
};
Util.parseURL = function(href = this.getURL()) {
  //console.debug('href:', href);
  const matches = new RegExp('^([^:]+://)?([^/:]*)(:[0-9]*)?(/?[^#]*)?(#.*)?', 'g').exec(href);
  const [all, proto, host, port, location = '', fragment] = matches;
  //console.debug('matches:', matches);
  if(!matches) return null;
  const argstr = location.indexOf('?') != -1 ? location.replace(/^[^?]*\?/, '') : ''; /* + "&test=1"*/
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
      : [];
  const params = [...pmatches].reduce((acc, m) => {
    acc[m[0]] = m[1];
    return acc;
  }, {});
  //console.log("PARAMS: ", { argstr, pmatches, params });
  const ret = {
    protocol: proto ? proto.replace('://', '') : 'http',
    host,
    location: location.replace(/\?.*/, ''),
    query: params
  };
  Object.assign(ret, {
    href(override) {
      if(typeof override === 'object') Object.assign(this, override);
      const qstr = Util.encodeQuery(this.query);
      return (this.protocol ? `${this.protocol}://` : '') + (this.host ? this.host : '') + (this.port ? `:${this.port}` : '') + `${this.location}` + (qstr != '' ? `?${qstr}` : '');
    }
  });
  if(typeof port === 'string') ret.port = parseInt(port.substring(1));
  else if(ret.protocol == 'https') ret.port = 443;
  else if(ret.protocol == 'http') ret.port = 80;
  if(fragment) ret.fragment = fragment;
  return ret;
};
Util.makeURL = function(...args) {
  let href = typeof args[0] == 'string' ? args.shift() : Util.getURL();
  let url = Util.parseURL(href);
  let obj = typeof args[0] == 'object' ? args.shift() : {};
  if('host' in obj /*|| 'protocol' in obj*/) url = Util.filterOutKeys(url, [/*'protocol',*/ 'host', 'port']);
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

Util.tryFunction = (fn, resolve = a => a, reject = () => null) => {
  if(typeof resolve != 'function') {
    let rval = resolve;
    resolve = () => rval;
  }
  if(typeof reject != 'function') {
    let cval = reject;
    reject = () => cval;
  }
  return Util.isAsync(fn)
    ? async function(...args) {
        let ret;
        try {
          ret = await fn(...args);
        } catch(err) {
          return reject(err, ...args);
        }
        return resolve(ret, ...args);
      }
    : function(...args) {
        let ret;
        try {
          ret = fn(...args);
        } catch(err) {
          return reject(err, ...args);
        }
        return resolve(ret, ...args);
      };
};
Util.tryCatch = (fn, resolve = a => a, reject = () => null, ...args) => {
  if(Util.isAsync(fn))
    return fn(...args)
      .then(resolve)
      .catch(reject);

  return Util.tryFunction(fn, resolve, reject)(...args);
};

Util.putError = err => {
  let e = Util.isObject(err) && err instanceof Error ? err : Util.exception(err);
  (console.info || console.log)('Util.putError ', e);
  let s = err.stack ? Util.stack(err.stack) : null;

  (console.error || console.log)('ERROR:\n' + err.message + (s ? '\nstack:\n' + s.toString() : s));
};
Util.putStack = (stack = new Util.stack().slice(3)) => {
  stack = stack instanceof Util.stack ? stack : Util.stack(stack);
  console.log('Util.putStack', Util.className(stack));

  console.log('STACK TRACE:\n' + stack.toString());
};

Util.trap = (() => {
  Error.stackTraceLimit = 100;
  return fn => /* prettier-ignore */ Util.tryFunction(fn, ret => ret, Util.putError);
})();

Util.tryPredicate = (fn, defaultRet) =>
  Util.tryFunction(
    fn,
    ret => ret,
    () => defaultRet
  );

Util.isBrowser = function() {
  let ret = false;

  Util.tryCatch(
    () => window,
    w => (Util.isObject(w) ? (ret = true) : undefined),
    () => {}
  );
  Util.tryCatch(
    () => document,
    d => (d == window.document && Util.isObject(d) ? (ret = true) : undefined),
    () => {}
  );
  return ret;
  //return !!(globalThis.window && globalThis.window.document);
};

Util.waitFor = async function waitFor(msecs) {
  if(!globalThis.setTimeout) {
    await import('os').then(({ setTimeout, clearTimeout, setInterval, clearInterval }) => {
      //console.log('', { setTimeout, clearTimeout, setInterval, clearInterval });
      Object.assign(globalThis, {
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval
      });
    });
  }
  if(msecs <= 0) return;

  let promise, clear, timerId;
  promise = new Promise(async (resolve, reject) => {
    timerId = setTimeout(() => resolve(), msecs);
    clear = () => {
      clearTimeout(timerId);
      reject();
    };
  });
  promise.clear = clear;
  return promise;
};

Util.timeout = async (msecs, promises, promiseClass = Promise) => await promiseClass.race([Util.waitFor(msecs)].concat(Array.isArray(promises) ? promises : [promises]));
Util.isServer = function() {
  return !Util.isBrowser();
};
Util.isMobile = function() {
  return true;
};
Util.uniquePred = (cmp = null) => (typeof cmp == 'function' ? (el, i, arr) => arr.findIndex(item => cmp(el, item)) == i : (el, i, arr) => arr.indexOf(el) == i);

Util.unique = (arr, cmp) => arr.filter(Util.uniquePred(cmp));
Util.allEqual = (arr, cmp = (a, b) => a == b) => arr.every((e, i, a) => cmp(e, a[0]));

Util.zip = a => a.reduce((a, b) => (a.length > b.length ? a : b), []).map((_, i) => a.map(arr => arr[i]));

Util.histogram = (...args) => {
  let arr = args.shift();
  const t = typeof args[0] == 'function' ? args.shift() : (k, v) => k;
  let [out = false ? {} : new Map(), initVal = () => 0 /* new Set()*/, setVal = v => v] = args;

  const set = /*Util.isObject(out) && typeof out.set == 'function' ? (k, v) => out.set(k, v) :*/ Util.setter(out);
  const get = Util.getOrCreate(out, initVal, set);
  let ctor = Object.getPrototypeOf(out) !== Object.prototype ? out.constructor : null;
  let tmp;

  if(Util.isObject(arr) && !Array.isArray(arr) && typeof arr.entries == 'function') arr = arr.entries();
  arr = [...arr];
  let entries = arr.map((it, i) => [i, it]);
  let x = {};
  let iv = initVal();
  const add = Util.adder(iv);
  const upd = Util.updater(out, get, set);

  let r = arr.map((item, i) => {
    let arg;
    let key;
    tmp = t(item, i);
    if(tmp) {
      key = tmp;
      if(Array.isArray(tmp) && tmp.length >= 2) [key, arg] = tmp.slice(-2);
      else arg = tmp;
    }
    [key, arg] = [key].concat(setVal(arg, i)).slice(-2);
    return [
      key,
      upd(key, (entry, idx, key) => {
        return add(entry, typeof entry == 'number' ? 1 : item);
      })
    ];
  });
  return out;
  //console.debug('r:', r);
  if(ctor) {
    let entries = r;
    let keys = r.map(([k, v]) => k);
    entries = [...entries].sort((a, b) => b[1] - a[1]);
    let tmp = new ctor(entries);
    r = tmp;
  }
  return r;
};
Util.concat = function* (...args) {
  for(let arg of args) {
    if(Util.isGenerator(arg)) {
      console.error('isGenerator:', arg);
      yield* arg;
    } else {
      /* if(Array.isArray(arg))*/
      for(let item of arg) yield item;
    }

    /*   else  else {
      throw new Error("No such arg type:"+typeof(arg));
    }*/
  }
};
Util.distinct = function(arr) {
  return Array.prototype.filter.call(arr, (value, index, me) => me.indexOf(value) === index);
};
Util.rangeMinMax = function(arr, field) {
  const numbers = [...arr].map(obj => obj[field]);
  return [Math.min(...numbers), Math.max(...numbers)];
};

Util.remap = (...args) => {
  const getR = () => (Array.isArray(args[0]) ? args.shift() : args.splice(0, 2));
  const _from = getR(),
    to = getR();

  const f = [to[1] - to[0], _from[1] - _from[0]];
  const factor = f[0] / f[1];

  const r = val => (val - _from[0]) * factor + to[0];

  return r;
};
Util.mergeLists = function(arr1, arr2, key = 'id') {
  let hash = {};

  for(let obj of arr1) hash[obj[key]] = obj;
  for(let obj of arr2) hash[obj[key]] = obj;
  return Object.values(hash);

  /* let hash = arr1.reduce((acc, it) => Object.assign({ [it[key]]: it }, acc), {});
  hash = arr2.reduce((acc, it) => Object.assign({ [it[key]]: it }, acc), {});
  let ret = [];
  for(let k in hash) {
    if(hash[k][key]) ret.push(hash[k]);
  }
  return ret;*/
};

Util.foreach = function(o, fn) {
  for(let [k, v] of Util.entries(o)) {
    if(fn(v, k, o) === false) break;
  }
};
Util.all = function(obj, pred) {
  for(let k in obj) if(!pred(obj[k])) return false;
  return true;
};
Util.isGenerator = function(fn) {
  return (typeof fn == 'function' && /^[^(]*\*/.test(fn.toString())) || (['function', 'object'].indexOf(typeof fn) != -1 && fn.next !== undefined);
};
Util.isIterator = obj => Util.isObject(obj) && typeof obj.next == 'function';

Util.isIterable = obj => {
  try {
    for(let item of obj) return true;
  } catch(err) {}
  return false;
};
Util.isNativeFunction = Util.tryFunction(x => typeof x == 'function' && /^[^\n]*\[(native\ code|[a-z\ ]*)\]/.test(x + ''));

Util.isConstructor = x => {
  if(x !== undefined) {
    let ret,
      members = [];
    const handler = {
      construct(target, args) {
        return Object.create(target.prototype);
      }
    };
    try {
      ret = new new Proxy(x, handler)();
    } catch(e) {
      ret = false;
    }
    let proto = (x && x.prototype) || Object.getPrototypeOf(ret);
    members = Util.getMemberNames(proto).filter(m => m !== 'constructor');
    //console.log('members:', !!ret, members, Util.fnName(x));
    return !!ret && members.length > 0;
  }
};

Util.filter = function(a, pred) {
  if(typeof pred != 'function') pred = Util.predicate(pred);
  if(Array.isArray(a)) return a.filter(pred);
  /*return (function* () {
      for(let [k, v] of a.entries()) if(pred(v, k, a)) yield v;
    })();*/

  if(Util.isGenerator(a))
    return (function* () {
      for(let item of a) if(pred(item)) yield item;
    })();
  let isa = Array.isArray(a);
  let ret = {};
  let fn = (k, v) => (ret[k] = v);
  for(let [k, v] of Util.entries(a)) if(pred(v, k, a)) fn(k, v);
  return Object.setPrototypeOf(ret, Object.getPrototypeOf(a));
};
Util.reduce = (obj, fn, accu) => {
  if(Util.isGenerator(obj)) {
    let i = 0;
    for(let item of obj) accu = fn(accu, item, i++, obj);
    return accu;
  }
  for(let key in obj) accu = fn(accu, obj[key], key, obj);
  return accu;
};
Util.mapFunctional = fn =>
  function* (arg) {
    for(let item of arg) yield fn(item);
  };
Util.map = (...args) => {
  let [obj, fn] = args;
  let ret = a => a;

  if(Util.isIterator(obj)) {
    return ret(function* () {
      let i = 0;
      for(let item of obj) yield fn(item, i++, obj);
    })();
  }
  if(typeof obj == 'function') return Util.mapFunctional(...args);

  if(typeof obj.map == 'function') return obj.map(fn);

  if(typeof obj.entries == 'function') {
    const ctor = obj.constructor;
    obj = obj.entries();
    ret = a => new ctor([...a]);
    //    ret = a => new ctor(a);
  }

  /*console.log("obj",(obj));
console.log("isGenerator",Util.isGenerator(obj));*/

  if(Util.isGenerator(obj))
    return ret(
      (function* () {
        let i = 0;
        for(let item of obj) yield fn(item, i++, obj);
      })()
    );
  //  if(typeof fn != 'function') return Util.toMap(...arguments);

  ret = {};
  for(let key in obj) {
    if(obj.hasOwnProperty(key)) {
      let item = fn(key, obj[key], obj);
      if(item) ret[item[0]] = item[1];
    }
  }
  return ret; //Object.setPrototypeOf(ret,Object.getPrototypeOf(obj));
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
  //return /^[0-9]+$/.test(d) ? Util.fromUnixTime(d) : new Date(d);
};
Util.isoDate = function(date) {
  try {
    if(typeof date == 'number') date = new Date(date);
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
  if(typeof date == 'number') date = new Date(date);
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
  ret = `${('0' + hours).substring(0, 2)}:${('0' + minutes).substring(0, 2)}:${('0' + seconds).substring(0, 2)}`;
  if(days) ret = `${days} days ${ret}`;
  if(weeks) ret = `${weeks} weeks ${ret}`;
  return ret;
};
Util.rng = Math.random;
Util.randFloat = function(min, max, rnd = Util.rng) {
  return rnd() * (max - min) + min;
};
Util.randInt = (...args) => {
  let range = args.splice(0, 2);
  let rnd = args.shift() || Util.rng;
  if(range.length < 2) range.unshift(0);
  return Math.round(Util.randFloat(...range, rnd));
};
Util.randStr = (len, charset, rnd = Util.rng) => {
  let o = '';
  if(!charset) charset = '_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  while(--len >= 0) {
    o += charset[Math.round(rnd() * (charset.length - 1))];
  }
  return o;
};

Util.hex = function(num, numDigits) {
  let v = typeof num == 'number' ? num : parseInt(num);
  let s = v.toString(16);
  numDigits = numDigits || Math.floor((s.length + 1) / 2) * 2;
  return ('0'.repeat(numDigits) + s).slice(-numDigits);
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
Util.roundDigits = precision => {
  if(typeof precision == 'number') return -Math.log10(precision);

  precision = precision + '';
  let index = precision.indexOf('.');
  let frac = index == -1 ? '' : precision.slice(index + 1);
  return frac.length;

  return -Util.clamp(-Infinity, 0, Math.floor(Math.log10(precision - Number.EPSILON)));
};

Util.roundFunction = (prec, digits, type) => {
  digits = digits || Util.roundDigits(prec);
  type = type || 'round';

  const fn = Math[type];
  if(prec == 1) return fn;

  return function(value) {
    let ret = fn(value / prec) * prec;
    if(typeof digits == 'number' && digits >= 1 && digits <= 100) ret = +ret.toFixed(digits);
    return ret;
  };
};

Util.roundTo = function(value, prec, digits, type) {
  if(!isFinite(value)) return value;
  digits = digits || Util.roundDigits(prec);
  type = type || 'round';
  const fn = Math[type];
  if(prec == 1) return fn(value);
  let ret = prec > Number.EPSILON ? fn(value / prec) * prec : value;
  if(typeof digits == 'number' && digits >= 1 && digits <= 100) ret = +ret.toFixed(digits);
  //else ret = Math[type](ret);
  return ret;
};

Util.base64 = (() => {
  const g = Util.getGlobalObject();

  return {
    encode: Util.tryFunction(
      utf8 => g.btoa(g.unescape(g.encodeURIComponent(utf8))),
      v => v,
      utf8 => Buffer.from(utf8).toString('base64')
    ),
    decode: Util.tryFunction(
      base64 => g.decodeURIComponent(g.escape(g.atob(base64))),
      v => v,
      string => Buffer.from(string, 'base64').toString('utf-8')
    )
  };
})();

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
Array.isArray =
  Array.isArray ||
  function(obj) {
    if(obj.constructor === Array) return true;
    return (
      (obj && !Util.isGetter(obj, 'length') && Util.isObject(obj) && 'length' in obj && !(obj instanceof String) && !(obj instanceof Function) && typeof obj == 'function') || obj instanceof Array
    );
  };
Array.isArrayLike = obj => typeof obj == 'object' && obj !== null && 'length' in obj;

Util.equals = function(a, b) {
  if(Array.isArray(a) && Array.isArray(b)) {
    return a.length == b.length && a.every((e, i) => b[i] === e);
  } else if(Util.isObject(a) && Util.isObject(b)) {
    const size_a = Util.size(a);

    if(size_a != Util.size(b)) return false;

    for(let k in a) if(!Util.equals(a[k], b[k])) return false;

    return true;
  }
  return a == b;
};
/*#define _GNU_SOURCE
#include <ctype.h>
#include <string.h>

int
strverscmp(const char* a0, const char* b0) {
  const unsigned char* a = (const void*)a0;
  const unsigned char* b = (const void*)b0;
  size_t i, dp, j;
  int z = 1;
  for(dp = i = 0; a[i] == b[i]; i++) {
    int c = a[i];
    if(!c)
      return 0;
    if(!isdigit(c))
      dp = i + 1, z = 1;
    else if(c != '0')
      z = 0;
  }
  if(a[dp] != '0' && b[dp] != '0') {
    for(j = i; isdigit(a[j]); j++)
      if(!isdigit(b[j]))
        return 1;
    if(isdigit(b[j]))
      return -1;
  } else if(z && dp < i && (isdigit(a[i]) || isdigit(b[i]))) {
    return (unsigned char)(a[i] - '0') - (unsigned char)(b[i] - '0');
  }
  return a[i] - b[i];
}*/
Util.versionCompare = (a, b) => {
  // console.log("Util.versionCompare",{a,b});
  if(typeof a != 'string') a = a + '';
  if(typeof b != 'string') b = b + '';

  let i,
    dp,
    j,
    z = 1;
  const isdigit = c => /^[0-9]$/.test(c);

  for(dp = i = 0; a[i] == b[i]; i++) {
    let c;
    if(!(c = a[i])) return 0;
    if(!isdigit(c)) (dp = i + 1), (z = 1);
    else if(c != '0') z = 0;
  }
  if(a[dp] != '0' && b[dp] != '0') {
    for(j = i; isdigit(a[j]); j++) if(!isdigit(b[j])) return 1;
    if(isdigit(b[j])) return -1;
  } else if(z && dp < i && (isdigit(a[i]) || isdigit(b[i]))) {
    return a.codePointAt(i) - 0x30 - (b.codePointAt(i) - 0x30);
  }

  return a.codePointAt(i) - b.codePointAt(i);
};

/*
Util.isObject = function(obj) {
  const type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
};*/

Util.isGetter = (obj, propName) => {
  while(obj) {
    let desc = Object.getOwnPropertyDescriptor(obj, propName);
    if(desc && 'get' in desc) return true;
    obj = Object.getPrototypeOf(obj);
  }
  return false;
};
Util.isBool = value => value === true || value === false;
Util.size = (...args) => {
  function size(obj) {
    if(Util.isObject(obj)) {
      if(obj instanceof Map) return obj.size;
      else if('length' in obj) return obj.length;
      else return Object.keys(obj).length;
    }
  }
  if(args.length == 0) return size;
  return size(args[0]);
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
  return Util.mergeObjects([
    initialState,
    [...document.forms].reduce(
      (acc, { elements }) => [...elements].reduce((acc2, { name, value }) => (name == '' || value == undefined || value == 'undefined' ? acc2 : Object.assign(acc2, { [name]: value })), acc),
      {}
    )
  ]);
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
Util.increment = function(obj, key) {
  if(obj[key] >= 1) obj[key] == 0;
  obj[key]++;
  return obj[key];
};
Util.counter = function() {
  let i = 0;
  let self = function() {
    return i++;
  };
  return self;
};
Util.filterKeys = function(obj, pred = k => true) {
  let ret = {};
  if(pred instanceof RegExp) {
    let re = pred;
    pred = str => re.test(str);
  } else if(Array.isArray(pred)) {
    let a = pred;
    pred = str => a.indexOf(str) != -1;
  }
  for(let key in obj) if(pred(key, obj[key], obj)) ret[key] = obj[key];
  //Object.setPrototypeOf(ret, Object.getPrototypeOf(obj));
  return ret;
};
Util.filterMembers = function(obj, fn) {
  const pred = (k, v, o) => fn(v, k, o);
  return Util.filterKeys(obj, pred);
};
Util.filterOutMembers = function(obj, fn) {
  const pred = (v, k, o) => !fn(v, k, o);
  return Util.filterMembers(obj, pred);
};
Util.dumpMembers = obj => Util.filterOutMembers(obj, Util.isFunction);

Util.filterOutKeys = function(obj, arr) {
  if(typeof obj != 'object') return obj;
  const pred =
    typeof arr == 'function' ? (v, k, o) => arr(k, v, o) : arr instanceof RegExp ? (k, v) => arr.test(k) /*|| arr.test(v)*/ : Array.isArray(arr) ? key => arr.indexOf(key) != -1 : () => ({});
  return Util.filterOutMembers(obj, (v, k, o) => pred(k, v, o));
};
Util.removeKeys = function(obj, arr) {
  if(typeof obj != 'object') return obj;
  const pred = typeof arr == 'function' ? (v, k, o) => arr(k, v, o) : arr instanceof RegExp ? (k, v) => arr.test(k) /*|| arr.test(v)*/ : key => arr.indexOf(key) != -1;
  for(let key in obj) {
    if(pred(key, obj[key], obj)) delete obj[key];
  }
};
Util.getKeys = function(obj, arr) {
  let ret = {};
  for(let key of arr) ret[key] = obj[key];

  return ret;
};
Util.numbersConvert = function(str) {
  return str
    .split('')
    .map((ch, i) => (new RegExp('[ :,./]').test(ch) ? ch : String.fromCharCode((str.charCodeAt(i) & 0x0f) + 0x30)))
    .join('');
};
Util.entries = function(arg) {
  if(Array.isArray(arg) || Util.isObject(arg)) {
    if(typeof arg.entries == 'function') return arg.entries();
    else if(Util.isIterable(arg))
      return (function* () {
        for(let key in arg) yield [key, arg[key]];
      })();
    return Object.entries(arg);
  }
};
Util.keys = function(arg) {
  let ret;
  if(Util.isObject(arg)) {
    ret =
      typeof arg.keys == 'function'
        ? arg.keys
        : function* () {
            for(let key in this) yield key;
          };
  }
  if(ret) return ret.call(arg);
};
Util.values = function(arg) {
  let ret;
  if(Util.isObject(arg)) {
    ret =
      typeof arg.values == 'function'
        ? arg.values
        : function* () {
            for(let key in arg) yield arg[key];
          };
  }
  if(ret) return ret.call(arg);
};
Util.removeEqual = function(a, b) {
  let c = {};
  for(let key of Util.keys(a)) {
    if(b[key] === a[key]) continue;
    //console.log(`removeEqual '${a[key]}' === '${b[key]}'`);
    c[key] = a[key];
  }
  //console.log(`removeEqual`,c);

  return c;
};
Util.clear = obj => (typeof obj.splice == 'function' ? obj.splice(0, obj.length) : obj.clear());

Util.remove = (arr, item) => Util.removeIf(arr, (other, i, arr) => item === other);
Util.removeIf = function(arr, pred) {
  let count = 0;
  if(Util.isObject(arr) && typeof arr.splice == 'function') {
    let idx;
    for(count = 0; (idx = arr.findIndex(pred)) != -1; count++) arr.splice(idx, idx + 1);
  } else {
    for(let [key, value] of arr) {
      if(pred(value, key, arr)) {
        arr.delete(key);
        count++;
      }
    }
  }
  return count;
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

Util.pushUnique = (arr, ...args) => args.reduce((acc, item) => (arr.indexOf(item) == -1 ? (arr.push(item), acc + 1) : acc), 0);

Util.insertSorted = function(arr, item, cmp = (a, b) => b - a) {
  let i = 0,
    len = arr.length;
  while(i < len) {
    if(cmp(item, arr[i]) >= 0) break;
    i++;
  }
  i < len ? arr.splice(i, 0, item) : arr.push(item);
  return i;
};
Util.inserter = (dest, next = (k, v) => {}) => {
  // if(typeof dest == 'function' && dest.map !== undefined) dest = dest.map;

  const insert =
    /*dest instanceof Map ||
    dest instanceof WeakMap ||*/
    typeof dest.set == 'function' && dest.set.length >= 2 ? (k, v) => dest.set(k, v) : Array.isArray(dest) ? (k, v) => dest.push([k, v]) : (k, v) => (dest[k] = v);
  let fn;
  fn = function(key, value) {
    insert(key, value);
    next(key, value);
    return fn;
  };
  fn.dest = dest;
  fn.insert = insert;
  return fn;
};

Util.keyIterator = obj => {
  let it;
  if(typeof obj.keys == 'function' && Util.isIterator((it = obj.keys()))) {
    return it;
  } else if(Array.isArray(obj)) {
    return Array.prototype.keys.call(obj);
  } else if('length' in obj) {
    return Array.prototype[Symbol.iterator].call(obj);
  }
};

Util.entryIterator = obj => {
  let it;
  if(typeof obj.entries == 'function' && Util.isIterator((it = obj.entries()))) {
    return it;
  } else if(Array.isArray(obj)) {
    return Array.prototype.entries.call(obj);
  } else if('length' in obj) {
    return (function* () {
      for(let key of Array.prototype[Symbol.iterator].call(obj)) yield [key, obj[key]];
    })();
  }
};

/*Util.bitIterator = function BitIterator(source, inBits, outBits) {
  const iterator = this instanceof BitIterator ? this : Object.create(BitIterator.prototype);

  iterator.bits = [0];
  iterator.size = 0;
  iterator.next = function(bitsWanted = outBits) {
    let output = { bits: [0], size: 0 };
    for(;;) {
      if(iterator.size == 0) fillBits(iterator);
      //console.log("iterator.bits =",iterator.bits, " iterator.size =",iterator.size);
      moveBits(iterator, output, bitsWanted);
      if(output.size == bitsWanted) break;
    }
    return output.bits;
  };
  function readBits(buffer, n) {
    n = Math.min(buffer.size, n);
    let size = 0,
      bits = [];
    while(n >= 16) {
      bits.push(buffer.bits.shift());
      buffer.size -= 16; n -= 16;
      size += 16;
    }

    if(n > 0) {
      const mask = (1 << n) - 1;
      bits.push(buffer.bits & mask);
      size += n;
      buffer.bits >>= n;
      buffer.size -= n;
    }
    return [bits, size];
  }
  const pad = '00000000000000000000000000000000';
  function writeBits(buffer, value, size) {
    buffer.bits = [...Util.partition((pad + value.toString(2)).slice(-32), 16)].map(n => parseInt(n, 2)).reverse();

    buffer.size = size;
    console.log("buffer.bits:",buffer.bits,"buffer.size:",buffer.size);
  }
  function moveBits(input, output, len) {
    let [bits, size] = readBits(input, len);
    writeBits(output, bits, size);
  }
  function fillBits(buffer) {
    const value = source();
    writeBits(buffer, value, inBits);
  }
  return iterator;
};
*/
Util.mapAdapter = getSetFunction => {
  let r = {
    get(key) {
      return getSetFunction(key);
    },
    set(key, value) {
      getSetFunction(key, value);
      return this;
    }
  };
  let tmp = getSetFunction();
  if(Util.isIterable(tmp) || Util.isPromise(tmp)) r.keys = () => getSetFunction();

  if(getSetFunction[Symbol.iterator]) r.entries = getSetFunction[Symbol.iterator];
  else {
    let g = getSetFunction();
    if(Util.isIterable(g) || Util.isGenerator(g)) r.entries = () => getSetFunction();
  }

  return Util.mapFunction(r);
};

/**
 * @param Array   forward
 * @param Array   backward
 *
 * component2path,  path2eagle  => component2eagle
 *  eagle2path, path2component =>
 */
Util.mapFunction = map => {
  let fn;
  fn = function(...args) {
    const [key, value] = args;
    switch (args.length) {
      case 0:
        return fn.keys();
      case 1:
        return fn.get(key);
      case 2:
        return fn.set(key, value);
    }
  };

  fn.map = (m => {
    while(Util.isFunction(m) && m.map !== undefined) m = m.map;
    return m;
  })(map);

  if(map instanceof Map || (Util.isObject(map) && typeof map.get == 'function' && typeof map.set == 'function')) {
    fn.set = (key, value) => (map.set(key, value), (k, v) => fn(k, v));
    fn.get = key => map.get(key);
  } else if(map instanceof Cache || (Util.isObject(map) && typeof map.match == 'function' && typeof map.put == 'function')) {
    fn.set = (key, value) => (map.put(key, value), (k, v) => fn(k, v));
    fn.get = key => map.match(key);
  } else if(Util.isObject(map) && typeof map.getItem == 'function' && typeof map.setItem == 'function') {
    fn.set = (key, value) => (map.setItem(key, value), (k, v) => fn(k, v));
    fn.get = key => map.getItem(key);
  } else {
    fn.set = (key, value) => ((map[key] = value), (k, v) => fn(k, v));
    fn.get = key => map[key];
  }

  fn.update = function(key, fn = (k, v) => v) {
    let oldValue = this.get(key);
    let newValue = fn(oldValue, key);
    if(oldValue != newValue) {
      if(newValue === undefined && typeof map.delete == 'function') map.delete(key);
      else this.set(key, newValue);
    }
    return newValue;
  };

  if(typeof map.entries == 'function') {
    fn.entries = function* () {
      for(let [key, value] of map.entries()) yield [key, value];
    };
    fn.values = function* () {
      for(let [key, value] of map.entries()) yield value;
    };
    fn.keys = function* () {
      for(let [key, value] of map.entries()) yield key;
    };
    fn[Symbol.iterator] = fn.entries;
    fn[Util.inspectSymbol] = function() {
      return new Map(this.map(([key, value]) => [Array.isArray(key) ? key.join('.') : key, value]));
    };
  } else if(typeof map.keys == 'function') {
    if(Util.isAsync(map.keys) || Util.isPromise(map.keys())) {
      fn.keys = async () => [...(await map.keys())];

      fn.entries = async () => {
        let r = [];
        for(let key of await fn.keys()) r.push([key, await fn.get(key)]);
        return r;
      };
      fn.values = async () => {
        let r = [];
        for(let key of await fn.keys()) r.push(await fn.get(key));
        return r;
      };
    } else {
      fn.keys = function* () {
        for(let key of map.keys()) yield key;
      };

      fn.entries = function* () {
        for(let key of fn.keys()) yield [key, fn(key)];
      };
      fn.values = function* () {
        for(let key of fn.keys()) yield fn(key);
      };
    }
  }

  if(typeof fn.entries == 'function') {
    fn.filter = function(pred) {
      return Util.mapFunction(
        new Map(
          (function* () {
            let i = 0;
            for(let [key, value] of fn.entries()) if(pred([key, value], i++)) yield [key, value];
          })()
        )
      );
    };
    fn.map = function(t) {
      return Util.mapFunction(
        new Map(
          (function* () {
            let i = 0;

            for(let [key, value] of fn.entries()) yield t([key, value], i++);
          })()
        )
      );
    };
    fn.forEach = function(fn) {
      let i = 0;

      for(let [key, value] of this.entries()) fn([key, value], i++);
    };
  }
  if(typeof map.delete == 'function') fn.delete = key => map.delete(key);

  if(typeof map.has == 'function') fn.has = key => map.has(key);
  return fn;
};

Util.mapWrapper = (map, toKey = key => key, fromKey = key => key) => {
  let fn = Util.mapFunction(map);
  fn.set = (key, value) => (map.set(toKey(key), value), (k, v) => fn(k, v));
  fn.get = key => map.get(toKey(key));
  if(typeof map.keys == 'function') fn.keys = () => [...map.keys()].map(fromKey);
  if(typeof map.entries == 'function')
    fn.entries = function* () {
      for(let [key, value] of map.entries()) yield [fromKey(key), value];
    };
  if(typeof map.values == 'function')
    fn.values = function* () {
      for(let value of map.values()) yield value;
    };
  if(typeof map.has == 'function') fn.has = key => map.has(toKey(key));
  if(typeof map.delete == 'function') fn.delete = key => map.delete(toKey(key));

  fn.map = (m => {
    while(Util.isFunction(m) && m.map !== undefined) m = m.map;
    return m;
  })(map);

  return fn;
};

/**
 * @param Array   forward
 * @param Array   backward
 *
 * component2path,  path2eagle  => component2eagle
 *  eagle2path, path2component =>
 */
Util.mapCombinator = (forward, backward) => {
  let fn;
  fn = function(key, value) {
    if(value === undefined) return fn.get(key);
    return fn.set(key, value);
  };

  /* prettier-ignore */
  fn.get=  forward.reduceRight((a,m) => makeGetter(m, key => a(key)), a => a);
  return fn;
  function makeGetter(map, next = a => a) {
    return key => (false && console.log('getter', { map, key }), next(map.get(key)));
  }
};

Util.predicate = (fn_or_regex, pred) => {
  let fn = fn_or_regex;
  if(typeof fn_or_regex == 'string') fn_or_regex = new RegExp('^' + fn_or_regex + '$');
  if(fn_or_regex instanceof RegExp) {
    fn = arg => fn_or_regex.test(arg + '');
    fn.valueOf = function() {
      return fn_or_regex;
    };
  }
  if(typeof pred == 'function') return arg => pred(arg, fn);
  return fn;
};
Util.some = predicates => {
  predicates = predicates.map(Util.predicate);
  return value => predicates.some(pred => pred(value));
};
Util.every = predicates => {
  predicates = predicates.map(Util.predicate);
  return value => predicates.every(pred => pred(value));
};

Util.iterateMembers = function* (obj, predicate = (name, depth, obj, proto) => true, depth = 0) {
  let names = [];
  let pred = Util.predicate(predicate);
  const proto = Object.getPrototypeOf(obj);

  /* for(let name in obj) if(pred(name, depth, obj)) yield name;
   */
  let descriptors = Object.getOwnPropertyDescriptors(obj);
  for(let name in descriptors) {
    const { value, get, set, enumerable, configurable, writable } = descriptors[name];

    if(typeof get == 'function') continue;

    if(pred(name, depth, obj)) yield name;
  }
  //for(let symbol of Object.getOwnPropertySymbols(obj)) if(pred(symbol, depth, obj)) yield symbol;
  if(proto) yield* Util.iterateMembers(proto, predicate, depth + 1);
};

Util.and =
  (...predicates) =>
  (...args) =>
    predicates.every(pred => pred(...args));
Util.or =
  (...predicates) =>
  (...args) =>
    predicates.some(pred => pred(...args));

Util.members = Util.curry((pred, obj) => Util.unique([...Util.iterateMembers(obj, Util.tryPredicate(pred))]));

Util.memberNameFilter = (depth = 1, start = 0) =>
  Util.and(
    (m, l, o) => start <= l && l < depth + start,
    (m, l, o) => typeof m != 'string' || ['caller', 'callee', 'constructor', 'arguments'].indexOf(m) == -1,
    (name, depth, obj, proto) => obj != Object.prototype
  );

Util.getMemberNames = (obj, ...args) => {
  let filters = [];
  let depth = 1,
    start = 0;
  while(args.length > 0) {
    if(args.length >= 2 && typeof args[0] == 'number') {
      const n = args.splice(0, 2);
      depth = n[0];
      start = n[1];
      continue;
    }
    filters.push(args.shift());
  }
  filters.unshift(Util.memberNameFilter(depth, start));
  return Util.members(Util.and(...filters))(obj);
};
Util.getMemberEntries = (obj, ...args) => Util.getMemberNames(obj, ...args).map(name => [name, obj[name]]);

Util.objectReducer =
  (filterFn, accFn = (a, m, o) => ({ ...a, [m]: o[m] }), accu = {}) =>
  (obj, ...args) =>
    Util.members(filterFn(...args), obj).reduce(
      Util.tryFunction(
        (a, m) => accFn(a, m, obj),
        (r, a, m) => r,
        (r, a) => a
      ),
      accu
    );
Util.incrementer = (incFn = (c, n, self) => (self.count = c + n)) => {
  let self, incr;
  if(typeof incFn == 'number') {
    incr = incFn;
    incFn = (c, n, self) => (self.count = +c + +n * incr);
  }
  const inc = (i, n = 1) => self.incFn.call(self, i || 0, n, self);
  self = function Count(n = 1) {
    self.count = inc(self.count, n, self);
    return self;
  };
  self.incFn = incFn;
  self.valueOf = function() {
    return this.count;
  };
  return self;
};

Util.mapReducer = (setFn, filterFn = (key, value) => true, mapObj = new Map()) => {
  setFn = setFn || Util.setter(mapObj);
  let fn;
  let next = Util.tryFunction(((acc, mem, idx) => (filterFn(mem, idx) ? (setFn(idx, mem), acc) : null), r => r, () => mapObj));
  fn = function ReduceIntoMap(arg, acc = mapObj) {
    if(Util.isObject(arg) && typeof arg.reduce == 'function') return arg.reduce((acc, arg) => (Array.isArray(arg) ? arg : Util.members(arg)).reduce(reducer, acc), self.map);
    let c = Util.counter();
    for(let mem of arg) acc = next(acc, mem, c());
    return acc;
  };
  return Object.assign(fn, { setFn, filterFn, mapObj, next });
};

Util.getMembers = Util.objectReducer(Util.memberNameFilter);

Util.getMemberDescriptors = Util.objectReducer(Util.memberNameFilter, (a, m, o) => ({
  ...a,
  [m]: Object.getOwnPropertyDescriptor(o, m)
}));

Util.methodNameFilter = (depth = 1, start = 0) =>
  Util.and(
    (m, l, o) =>
      Util.tryCatch(
        () => typeof o[m] == 'function',
        b => b,
        () => false
      ),
    Util.memberNameFilter(depth, start)
  );

Util.getMethodNames = (obj, depth = 1, start = 0) => Util.members(Util.methodNameFilter(depth, start))(obj);

Util.getMethods = Util.objectReducer(Util.methodNameFilter);

Util.getMethodDescriptors = Util.objectReducer(Util.methodNameFilter, (a, m, o) => ({
  ...a,
  [m]: Object.getOwnPropertyDescriptor(o, m)
}));

Util.inherit = (dst, src, depth = 1) => {
  for(let k of Util.getMethodNames(src, depth)) dst[k] = src[k];
  return dst;
};
Util.inherits =
  typeof Object.create === 'function'
    ? function inherits(ctor, superCtor) {
        if(superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      } // old school shim for old browsers
    : function inherits(ctor, superCtor) {
        if(superCtor) {
          ctor.super_ = superCtor;
          let TempCtor = function() {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
//Util.bindMethods = (obj, methods, dest = {}) => Util.bindMethodsTo(obj, methods ?? obj, dest);
Util.bindMethods = (obj, methods, dest) => {
  dest ??= obj;
  if(Array.isArray(methods)) {
    for(let name of methods) if(typeof obj[name] == 'function') dest[name] = obj[name].bind(obj);
    return dest;
  }
  let names = Util.getMethodNames(methods);
  for(let name of names) if(typeof methods[name] == 'function') dest[name] = methods[name].bind(obj);
  return dest;
};
Util.getConstructor = obj => obj.constructor || Object.getPrototypeOf(obj).constructor;
Util.getPrototypeChain = function(obj, fn = p => p) {
  let ret = [];
  let proto;
  do {
    proto = obj.__proto__ || Object.getPrototypeOf(obj);
    ret.push(fn(proto, obj));
    if(proto === Object.prototype || proto.constructor === Object) break;
    obj = proto;
  } while(obj);

  return ret;
};
Util.getObjectChain = (obj, fn = p => p) => [fn(obj)].concat(Util.getPrototypeChain(obj, fn));

Util.getPropertyDescriptors = function(obj) {
  return Util.getObjectChain(obj, p => Object.getOwnPropertyDescriptors(p));
};

Util.getConstructorChain = (ctor, fn = (c, p) => c) => Util.getPrototypeChain(ctor, (p, o) => fn(o, p));

Util.weakAssign = function(...args) {
  let obj = args.shift();
  args.forEach(other => {
    for(let key in other) {
      if(obj[key] === undefined && other[key] !== undefined) obj[key] = other[key];
    }
  });
  return obj;
};

/*Util.getErrorStack = function(position = 2) {
  let stack=[];
  let error;
    Error.stackTraceLimit = 100;
     const oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
 try {

  throw new Error('my error');

 } catch(e) {
  console.log("e.stack",[...e.stack]);
  stack = e.stack;
 }
 Error.prepareStackTrace = oldPrepareStackTrace;

 return stack;
}*/
Util.exception = function Exception(...args) {
  let e, stack;
  let proto = Util.exception.prototype;

  if(args[0] instanceof Error) {
    let exc = args.shift();
    const { message, stack: callerStack } = exc;
    e = { message };
    //   e.proto = Object.getPrototypeOf(exc);

    if(callerStack) stack = callerStack;
  } else {
    const [message, callerStack] = args;
    e = { message };
    if(callerStack) stack = callerStack;
  }
  if(stack) e.stack = Util.stack(stack);

  return Object.setPrototypeOf(e, proto);
};

Util.define(
  Util.exception.prototype,
  {
    toString(color = false) {
      const { message, stack, proto } = this;
      return `${Util.fnName((proto && proto.constructor) || this.constructor)}: ${message}
Stack:${Util.stack.prototype.toString.call(stack, color, stack.columnWidths)}`;
    },
    [Symbol.toStringTag]() {
      return this.toString(false);
    },
    [Util.inspectSymbol]() {
      return Util.exception.prototype.toString.call(this, true);
    }
  },
  true
);
Util.location = function Location(...args) {
  console.log('Util.location(', ...args, ')');
  let ret = this instanceof Util.location ? this : Object.setPrototypeOf({}, Util.location.prototype);
  if(args.length == 3) {
    const [fileName, lineNumber, columnNumber, functionName] = args;
    Object.assign(ret, { fileName, lineNumber, columnNumber, functionName });
  } else if(args.length == 1 && args[0].fileName !== undefined) {
    const { fileName, lineNumber, columnNumber, functionName } = args.shift();
    Object.assign(ret, { fileName, lineNumber, columnNumber, functionName });
  }
  if(Util.colorCtor) ret.colorCtor = Util.colorCtor;

  return ret;
};

// prettier-ignore
Util.location.palettes = [[[128, 128, 0], [255, 0, 255], [0, 255, 255] ], [[9, 119, 18], [139, 0, 255], [0, 165, 255]]];

Util.define(Util.location.prototype, {
  toString(color = false) {
    let { fileName, lineNumber, columnNumber, functionName } = this;
    console.log('this:', this, {
      fileName,
      lineNumber,
      columnNumber,
      functionName
    });
    fileName = fileName.replace(Util.makeURL({ location: '' }), '');
    let text = /*color ? new this.colorCtor() : */ '';
    const c = /*color ? (t, color) => text.write(t, color) :*/ t => (text += t);
    const palette = Util.location.palettes[Util.isBrowser() ? 1 : 0];
    if(functionName) c(functionName.replace(/\s*\[.*/g, '').replace(/^Function\./, '') + ' ', palette[1]);

    c(fileName, palette[0]);
    c(':', palette[1]);
    c(lineNumber, palette[2]);
    c(':', palette[1]);
    c(columnNumber, palette[2]);
    return text;
  },
  [Symbol.toStringTag]() {
    return Util.location.prototype.toString.call(this, false);
  },
  [Util.inspectSymbol]() {
    return Util.location.prototype.toString.call(this, !Util.isBrowser());
  },
  getFileName() {
    return this.fileName;
  },
  getLineNumber() {
    return this.lineNumber;
  },
  getColumnNumber() {
    return this.columnNumber;
  }
});

Util.stackFrame = function StackFrame(frame) {
  //   console.debug('Util.stackFrame', frame, frame.getFunctionName, frame.getFileName);
  ['methodName', 'functionName', 'fileName', 'lineNumber', 'columnNumber', 'typeName', 'thisObj'].forEach(prop => {
    let fn = prop == 'thisObj' ? 'getThis' : 'get' + Util.ucfirst(prop);
    if(frame[prop] === undefined && typeof frame[fn] == 'function') frame[prop] = frame[fn]();
  });
  if(Util.colorCtor) frame.colorCtor = Util.colorCtor;

  return Object.setPrototypeOf(frame, Util.stackFrame.prototype);
};

Util.define(Util.stackFrame, {
  methodNames: [
    'getThis',
    'getTypeName',
    'getFunction',
    'getFunctionName',
    'getMethodName',
    'getFileName',
    'getLineNumber',
    'getColumnNumber',
    'getEvalOrigin',
    'isToplevel',
    'isEval',
    'isNative',
    'isConstructor',
    'isAsync',
    'isPromiseAll',
    'getPromiseIndex'
  ]
});
Util.memoizedProperties(Util.stackFrame, {
  propertyMap() {
    return this.methodNames.map(method => [method, Util.lcfirst(method.replace(/^get/, ''))]).map(([method, func]) => [method, func == 'this' ? 'thisObj' : func]);
  }
});

Util.define(
  Util.stackFrame.prototype,
  {
    getFunction() {
      if(this.isConstructor) return this.functionName + '.constructor';

      return this.typeName ? `${this.typeName}.${this.methodName}` : this.functionName;
    },
    getMethodName() {
      return this.methodName;
    },
    getFunctionName() {
      return this.functionName;
    },
    getTypeName() {
      return this.typeName;
    },
    getFileName() {
      return this.fileName;
    },
    getLineNumber() {
      return this.lineNumber;
    },
    getColumnNumber() {
      return this.columnNumber;
    }
  },
  true
);

Util.define(
  Util.stackFrame.prototype,
  {
    colorCtor: null,
    get() {
      const { fileName, columnNumber, lineNumber } = this;
      return fileName ? `${fileName}:${lineNumber}:${columnNumber}` : null;
    },
    toString(color, opts = {}) {
      const { columnWidths = [0, 0, 0, 0], stripUrl } = opts;

      let text = color && this.colorCtor ? new this.colorCtor() : '';
      const c = color && this.colorCtor ? (t, color) => text.write(t, color) : t => (text += t);
      let fields = ['functionName', 'fileName', 'lineNumber', 'columnNumber'];
      const colors = [
        [0, 255, 0],
        [255, 255, 0],
        [0, 255, 255],
        [0, 255, 255]
      ];
      let { functionName, methodName, typeName, fileName, lineNumber, columnNumber } = this;
      //  console.log('toString:', { functionName, methodName, typeName, fileName, lineNumber, columnNumber });
      if(stripUrl && typeof fileName == 'string') fileName = fileName.replace(typeof stripUrl == 'string' ? stripUrl : /.*:\/\/[^\/]*\//, '');
      let colonList = [fileName, lineNumber, columnNumber]
        .map(p => ('' + p == 'undefined' ? undefined : p))
        .filter(p => p !== undefined && p != 'undefined' && ['number', 'string'].indexOf(typeof p) != -1)
        .join(':');
      let columns = [typeof this.getFunction == 'function' ? this.getFunction() : this.function, colonList];
      columns = columns.map((f, i) => (f + '')[i >= 2 ? 'padStart' : 'padEnd'](columnWidths[i] || 0, ' '));
      return columns.join(' ') + c('', 0);
    },
    getLocation() {
      return new Util.location(this);
    },
    /* prettier-ignore */ get location() {
      return this.getLocation();
    },
    [Symbol.toStringTag]() {
      return this.toString(false);
    },
    [Util.inspectSymbol](...args) {
      return Util.stackFrame.prototype.toString.call(this, true, this.columnWidths);
    }
  },
  true
);
Util.scriptName = () =>
  Util.tryCatch(
    () => scriptArgs,
    args => args[0],
    () => Util.getURL()
  );
Util.getFunctionName = () => {
  const frame = Util.getCallerStack(2)[0];
  return frame.getFunctionName() || frame.getMethodName();
};
Util.getFunctionArguments = fn => {
  let head = (fn + '').replace(/(=>|{\n).*/g, '').replace(/^function\s*/, '');
  let args = head.replace(/^\((.*)\)\s*$/g, '$1').split(/,\s*/g);
  return args;
};

Util.scriptDir = () =>
  Util.tryCatch(
    () => Util.scriptName(),
    script => (script + '').replace(new RegExp('\\/[^/]*$', 'g'), ''),
    () => Util.getURL()
  );
Util.stack = function Stack(stack, offset) {
  //console.log('Util.stack (1)', stack);

  if(typeof stack == 'number') return Object.setPrototypeOf(new Array(stack), Util.stack.prototype);

  if(Util.platform == 'quickjs') {
    if(!stack) stack = getStack();
    if(!(typeof stack == 'string')) stack = stack + '';
  } else if(!stack) {
    if(offset === undefined) offset = 1;
    stack = getStack();
    const { propertyMap } = Util.stackFrame;
    //console.log('stack', stack + '');
    stack = [...stack].map(frame =>
      propertyMap
        .filter(([m, p]) => typeof frame[m] == 'function' && frame[m]() !== undefined)
        .reduce(
          (acc, [method, property]) => ({
            ...acc,
            /* prettier-ignore */ get [property]() {
              return frame[method]();
            }
          }),
          {}
        )
    );

    //console.debug('stack ctor:', [...stack]);
    //console.debug('stack frame[0]:', [...stack][0]);
  } else if(!(typeof stack == 'string')) stack = stackToString(stack, 0);
  function getStack() {
    let stack;
    const oldPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    Error.stackTraceLimit = Infinity;

    stack = new Error().stack;
    Error.prepareStackTrace = oldPrepareStackTrace;
    return stack;
  }

  function stackToString(st, start = 0) {
    if(Array.isArray(st)) {
      st = [
        ...(function* () {
          for(let i = start; i < st.length; i++) yield st[i];
        })()
      ].join('\n');
    }
    return st;
  }

  //console.log('stack String:', offset, typeof stack, stack);

  if(typeof stack == 'number') {
    throw new Error();
  }
  //console.debug('stack:', typeof stack, stack);

  if(typeof stack == 'string') {
    stack = stack.trim().split(lineSplit);
    const re = new RegExp('.* at ([^ ][^ ]*) \\(([^)]*)\\)');
    stack = stack.map(frame =>
      typeof frame == 'string'
        ? frame
            .replace(/^\s*at\s+/, '')
            .split(/[()]+/g)
            .map(part => part.trim())
        : frame
    );
    stack = stack.map(frame => (Array.isArray(frame) ? (frame.length < 2 ? ['', ...frame] : frame).slice(0, 2) : frame));
    stack = stack.map(([func, file]) => [
      func,
      file
        .split(/:/g)
        .reverse()
        .map(n => (!isNaN(+n) ? +n : n))
    ]);
    stack = stack.map(([func, file]) => [func, file.length >= 3 ? file : file.length >= 2 ? ['', ...file] : ['', '', ...file]]);
    stack = stack.map(([func, [columnNumber, lineNumber, ...file]]) => ({
      functionName: func.replace(/Function\.Util/, 'Util'),
      methodName: func.replace(/.*\./, ''),
      fileName: file.reverse().join(':'),
      lineNumber,
      columnNumber
    }));
    //    console.log('Util.stack (2)', inspect(stack[0]  ));

    stack = stack.map(({ methodName, functionName: func, fileName: file, columnNumber: column, lineNumber: line }) => ({
      functionName: func,
      methodName,
      fileName: file.replace(/.*:\/\/[^\/]*/g, ''),
      lineNumber: Util.ifThenElse(
        s => s != '',
        s => +s,
        () => undefined
      )(line + file.replace(/.*[^0-9]([0-9]*)$/g, '$1')),
      columnNumber: Util.ifThenElse(
        s => s != '',
        s => +s,
        () => undefined
      )(column)
    }));
  } else {
    //console.log('stack:', stack[0]);
    stack = stack.map(frame => new Util.stackFrame(frame)); //Util.getCallers(1, Number.MAX_SAFE_INTEGER, () => true, stack);
  }
  //  stack = stack.map(frame => Object.setPrototypeOf(frame, Util.stackFrame.prototype));
  stack = stack.map(frame => new Util.stackFrame(frame));

  if(offset > 0) stack = stack.slice(offset);
  stack = Object.setPrototypeOf(stack, Util.stack.prototype);
  //stack.forEach(frame => console.log("stack frame:",frame));
  //
  return stack;
};

Util.stack.prototype = Object.assign(Util.stack.prototype, Util.getMethods(new Array(), 1, 1));
Object.defineProperty(Util.stack, Symbol.species, { get: () => Util.stack });
Object.defineProperty(Util.stack.prototype, Symbol.species, {
  get: () => Util.stack
});
Object.defineProperty(Util.stack.prototype, Symbol.iterator, {
  *value() {
    for(let i = 0; i < this.length; i++) yield this[i];
  }
});

Util.stack.prototype = Object.assign(Util.stack.prototype, {
  toString(opts = {}) {
    const { colors = false, stripUrl = Util.makeURL({ location: '/' }) } = opts;
    const { columnWidths } = this;
    let a = [];

    for(let i = 0; i < this.length; i++)
      a.push(
        Util.stackFrame.prototype.toString.call(this[i], colors, {
          columnWidths,
          stripUrl
        })
      );
    let s = a.join('\n');
    return s + '\n';
  },
  [Symbol.toStringTag]() {
    return Util.stack.prototype.toString.call(this);
  },
  [Util.inspectSymbol](...args) {
    const { columnWidths } = this;
    return '\n' + this.map(f => f.toString(!Util.isBrowser(), { columnWidths })).join('\n');
  },
  getFunctionName() {
    return this.functionName;
  },
  getMethodName() {
    return this.methodName;
  },
  getFileName() {
    return this.fileName;
  },
  getLineNumber() {
    return this.lineNumber;
  }
});

Object.defineProperties(Util.stack.prototype, {
  columnWidths: {
    get() {
      // console.log('this:', [...this]);
      return this.reduce((a, f) => ['getFunction'].map((fn, i) => Math.max(a[i], ((typeof f[fn] == 'function' ? f[fn]() : '') + '').length)), [0, 0, 0, 0]);
    }
  }
});

Util.getCallerStack = function(position = 2, limit = 1000, stack) {
  Error.stackTraceLimit = position + limit;
  if(position >= Error.stackTraceLimit) {
    throw new TypeError(`getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: '${position}' and Error.stackTraceLimit was: '${Error.stackTraceLimit}'`);
  }
  const oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;

  stack = Util.stack(stack, position);

  return stack.slice(0, limit);
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
      const method = frame.getMethodName();
      ret.push(method ? frame.getFunction() + '.' + method : frame.getFunctionName());
    }
    return ret;
  }
};
Util.getCaller = function(index = 1, stack) {
  const methods = [
    'getThis',
    'getTypeName',
    'getFunction',
    'getFunctionName',
    'getMethodName',
    'getFileName',
    'getLineNumber',
    'getColumnNumber',
    'getEvalOrigin',
    'isToplevel',
    'isEval',
    'isNative',
    'isConstructor'
  ];
  stack = stack || Util.getCallerStack(2, 1 + index, stack);
  let thisIndex = stack.findIndex(f => f.functionName.endsWith('getCaller'));
  index += thisIndex + 1;
  const frame = stack[index];
  return frame;
};
Util.getCallers = function(index = 1, num = Number.MAX_SAFE_INTEGER, stack) {
  const methods = [
    'getThis',
    'getTypeName',
    'getFunction',
    'getFunctionName',
    'getMethodName',
    'getFileName',
    'getLineNumber',
    'getColumnNumber',
    'getEvalOrigin',
    'isToplevel',
    'isEval',
    'isNative',
    'isConstructor'
  ];
  stack = stack || Util.getCallerStack(2, num + index, stack);
  let thisIndex = stack.findIndex(f => ((f.functionName || f.methodName) + '').endsWith('getCaller'));
  index += thisIndex + 1;
  return stack.slice(index);
};

/*Object.defineProperty(Util, 'stackFrame', {
  get: function() {
  return this.getCallerStack(2);
  }
});*/
Util.getStackFrames = function(offset = 2) {
  let frames = Util.getCallerStack(0);
  frames = frames.map(frame => {
    if(Object.getPrototypeOf(frame) !== Util.stackFrame.prototype) frame = Util.stackFrame(frame);
    return frame;
  });

  return frames.slice(offset);
};
Util.getStackFrame = function(offset = 2) {
  return Util.getStackFrames(offset)[0];
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
  if(Util.isObject(tree.children) && tree.children.length > 0) for(let child of tree.children) Util.traverseTree(child, fn, depth + 1, tree);
};

Util.walkTree = function(node, pred, t, depth = 0, parent = null) {
  return (function* () {
    if(!pred) pred = i => true;
    if(!t)
      t = function(i) {
        i.depth = depth;
        return i;
      };
    if(pred(node, depth, parent)) {
      yield t(node);
      if(typeof node == 'object' && node !== null && typeof node.children == 'object' && node.children.length) {
        for(let child of [...node.children]) {
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
      .catch(err => observer.error(err));
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
    tooDark: (options.tooDark || 0.03) * 255 * 3 /* How dark is too dark for a pixel */,
    tooLight: (options.tooLight || 0.97) * 255 * 3 /*How light is too light for a pixel */,
    tooAlpha: (options.tooAlpha || 0.1) * 255 /*How transparent is too transparent for a pixel */
  };
  const w = imageElement.width;
  let h = imageElement.height;
  //Setup canvas and draw image onto it
  const context = document.createElement('canvas').getContext('2d');
  context.drawImage(imageElement, 0, 0, w, h);
  //Extract the rgba data for the image from the canvas
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
  let luma = 0; //Having luma in the pixel object caused ~10% performance penalty for some reason
  //Loop through the rgba data
  for(let i = 0, l = w * h * 4; i < l; i += 4) {
    pixel.r = subpixels[i];
    pixel.g = subpixels[i + 1];
    pixel.b = subpixels[i + 2];
    pixel.a = subpixels[i + 4];
    //Only consider pixels that aren't black, white, or too transparent
    if(
      pixel.a > settings.tooAlpha &&
      (luma = pixel.r + pixel.g + pixel.b) > settings.tooDark && //Luma is assigned inside the conditional to avoid re-calculation when alpha is not met
      luma < settings.tooLight
    ) {
      pixels.r += pixel.r;
      pixels.g += pixel.g;
      pixels.b += pixel.b;
      pixels.a += pixel.a;
      processedPixels++;
    }
  }
  //Values of the channels that make up the average color
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
      //Returns a CSS compatible RGB string (e.g. '255, 255, 255')
      const { r, g, b } = this;
      return [r, g, b].join(', ');
    },
    toStringRgba() {
      //Returns a CSS compatible RGBA string (e.g. '255, 255, 255, 1.0')
      const { r, g, b, a } = this;
      return [r, g, b, a].join(', ');
    },
    toStringHex() {
      //Returns a CSS compatible HEX coloor string (e.g. 'FFA900')
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
      .replace(/.*position\ ([0-9]+).*/, '$1');
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
Util.splitAt = function* (str, ...indexes) {
  let prev = 0;
  for(let index of indexes.sort((a, b) => a - b).concat([str.length])) {
    if(index >= prev) {
      yield str.substring(prev, index);
      if(index >= str.length) break;
      prev = index;
    }
  }
};
Util.decodeEscapes = function(text) {
  let matches = [...Util.matchAll(/([^\\]*)(\\u[0-9a-f]{4}|\\)/gi, text)];
  if(matches.length) {
    matches = matches.map(m => [...m].slice(1)).map(([s, t]) => s + String.fromCodePoint(parseInt(t.substring(2), 16)));
    text = matches.join('');
  }
  return text;
};

Util.stripXML = text =>
  text
    .replace(/<br(|\ *\/)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[\t\ ]+/g, ' ')
    .replace(/(\n[\t\ ]*)+\n/g, '\n');

Util.stripHTML = html =>
  html
    .replace(/\s*\n\s*/g, ' ')
    .replace(/<[^>]*>/g, '\n')
    .split(lineSplit)
    .map(p => p.trim())
    .filter(p => p != '');

Util.stripNonPrintable = text => text.replace(/[^\x20-\x7f\x0a\x0d\x09]/g, '');
Util.decodeHTMLEntities = function(text) {
  let entities = {
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
  return text.replace(new RegExp('&([^;]+);', 'gm'), (match, entity) => entities[entity] || match);
};
Util.encodeHTMLEntities = (str, charset = '\u00A0-\u9999<>&') => str.replace(new RegExp(`[${charset}](?!#)`, 'gim'), i => '&#' + i.charCodeAt(0) + ';');

Util.stripAnsi = function(str) {
  return (str + '').replace(new RegExp('\x1b[[(?);]{0,2}(;?[0-9])*.', 'g'), '');
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

Util.propertyLookup = (obj = {}, handler = key => null) =>
  Util.proxy(obj, {
    get(target, key, receiver) {
      return handler(key);
    }
  });

Util.traceProxy = (obj, handler) => {
  let proxy;
  handler = /*handler || */ function(name, args) {
    console.log(`Calling method '${name}':`, ...args);
  };
  //console.log('handler', { handler }, handler + '');
  proxy = new Proxy(obj, {
    get(target, key, receiver) {
      let member = Reflect.get(obj, key, receiver);
      if(0 && typeof member == 'function') {
        let method = member; // member.bind(obj);
        member = function() {
          //          handler.call(receiver, key, arguments);
          return method.apply(obj, arguments);
        };
        member = method.bind(obj);
        console.log('Util.traceProxy', key, (member + '').replace(/\n\s+/g, ' ').split(lineSplit)[0]);
      }
      return member;
    }
  });
  return proxy;
};

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

/*
 * Calls a constructor with an arbitrary number of arguments.
 *
 * This idea was borrowed from a StackOverflow answer:
 * http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible/1608546#1608546
 *
 * And from this MDN doc:
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/function/apply
 *
 * @param constructor- Constructor to call
 * @param arguments- any number of arguments
 * @return A 'new' instance of the constructor with the arguments passed
 */
Util.construct = constructor => {
  function F(args) {
    return constructor.apply(this, args);
  }

  F.prototype = constructor.prototype;

  // since arguments isn't a first-class array, we'll use a shim
  // Big thanks to Felix Geisendörfer for the idea:
  // http://debuggable.com/posts/turning-javascript-s-arguments-object-into-an-array:4ac50ef8-3bd0-4a2d-8c2e-535ccbdd56cb
  return new F(Array.prototype.slice.call(arguments, 1));
};

/*
 * Calls construct() with a constructor and an array of arguments.
 *
 * @param constructor- Constructor to call
 * @param array- an array of arguments to apply
 * @return A 'new' instance of the constructor with the arguments passed
 */
Util.constructApply = (constructor, array) => {
  let args = [].slice.call(array);
  return construct.apply(null, [constructor].concat(args));
};

Util.immutable = args => {
  const argsType = typeof args === 'object' && Array.isArray(args) ? 'array' : 'object';
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

Util.immutableClass = (orig, ...proto) => {
  let name = Util.fnName(orig).replace(/Mutable/g, '');
  let imName = 'Immutable' + name;
  proto = proto || [];
  let initialProto = proto.map(p =>
    Util.isArrowFunction(p)
      ? p
      : ctor => {
          for(let n in p) ctor.prototype[n] = p[n];
        }
  );
  let body = `class ${imName} extends ${name} {\n  constructor(...args) {\n    super(...args);\n    if(new.target === ${imName})\n      return Object.freeze(this);\n  }\n};\n\n${imName}.prototype.constructor = ${imName};\n\nreturn ${imName};`;
  for(let p of initialProto) p(orig);
  let ctor; // = new Function(name, body)(orig);

  let imm = base => {
    let cls;
    cls = class extends base {
      constructor(...args) {
        super(...args);
        if(new.target === cls) return Object.freeze(this);
      }
    };
    return cls;
  };
  ctor = imm(orig);

  //console.log('immutableClass', { initialProto, body }, orig);
  let species = ctor;

  /* prettier-ignore */ //Object.assign(ctor, { [Symbol.species]: ctor });

  return ctor;
};

Util.partial = function partial(fn /*, arg1, arg2 etc */) {
  let partialArgs = [].slice.call(arguments, 1);
  if(!partialArgs.length) {
    return fn;
  }
  return function() {
    let args = [].slice.call(arguments);
    let derivedArgs = [];
    for(let i = 0; i < partialArgs.length; i++) {
      let thisPartialArg = partialArgs[i];
      derivedArgs[i] = thisPartialArg === undefined ? args.shift() : thisPartialArg;
    }
    return fn.apply(this, derivedArgs.concat(args));
  };
};

Util.clamp = Util.curry((min, max, value) => Math.max(min, Math.min(max, value)));

Util.coloring = (useColor = true) =>
  !useColor
    ? {
        code(...args) {
          return '';
        },
        text(text) {
          return text;
        },
        concat(...args) {
          let out = args.shift() || [''];
          if(typeof out == 'string') out = [out];
          for(let arg of args) {
            if(Array.isArray(arg)) {
              for(let subarg of arg) out[0] += subarg;
            } else out[0] += arg;
          }
          return out;
        }
      }
    : Util.isBrowser()
    ? {
        palette: [
          'rgb(0,0,0)',
          'rgb(80,0,0)',
          'rgb(0,80,0)',
          'rgb(80,80,0)',
          'rgb(0,0,80)',
          'rgb(80,0,80)',
          'rgb(0,80,80)',
          'rgb(80,80,80)',
          'rgb(0,0,0)',
          'rgb(160,0,0)',
          'rgb(0,160,0)',
          'rgb(160,160,0)',
          'rgb(0,0,160)',
          'rgb(160,0,160)',
          'rgb(0,160,160)',
          'rgb(160,160,160)'
        ],
        /*Util.range(0, 15).map(i =>
            `rgb(${Util.range(0, 2)
              .map(bitno => Util.getBit(i, bitno) * (i & 0x08 ? 160 : 80))
              .join(',')})`
        )*/ code(...args) {
          let css = '';
          let bold = 0;
          for(let arg of args) {
            let c = (arg % 10) + bold;
            let rgb = this.palette[c];
            //console.realLog("code:", {arg, c, rgb});
            if(arg >= 40) css += `background-color:${rgb};`;
            else if(arg >= 30) css += `color:${rgb};`;
            else if(arg == 1) bold = 8;
            else if(arg == 0) bold = 0;
            else throw new Error('No such color code:' + arg);
          }
          css += 'padding: 2px 0 2px 0;';
          return css;
        },
        text(text, ...color) {
          return [`%c${text}`, this.code(...color)];
        },
        concat(...args) {
          let out = args.shift() || [''];
          for(let arg of args) {
            if(Array.isArray(arg) && typeof arg[0] == 'string') out[0] += arg.shift();
            else if(Util.isObject(arg)) {
              out.push(arg);
              continue;
            }

            out = out.concat(arg);
          }
          return out;
        }
      }
    : {
        code(...args) {
          return `\x1b[${[...args].join(';')}m`;
        },
        text(text, ...color) {
          return this.code(...color) + text + this.code(0);
        },
        concat(...args) {
          return args.join('');
        }
      };

let color;
Util.colorText = (...args) => {
  if(!color) color = Util.coloring();
  return color.text(...args);
};
Util.decodeAnsi = (str, index) => {
  let ret = [];
  const len = str.length;
  if(index === undefined) index = str.lastIndexOf('\x1b');
  const isDigit = c => '0123456789'.indexOf(c) != -1;
  const notDigit = c => !isDigit(c);
  const findIndex = (pred, start) => {
    let i;
    for(i = start; i < len; i++) if(pred(str[i])) break;
    return i;
  };
  if(str[++index] == '[') {
    let newIndex;
    for(++index; index < len; index = newIndex) {
      let isNum = isDigit(str[index]);
      newIndex = isNum ? findIndex(notDigit, index) : index + 1;
      if(isNum) {
        let num = parseInt(str.substring(index, newIndex));
        ret.push(num);
      } else {
        ret.push(str[index]);
        break;
      }
      if(str[newIndex] == ';') newIndex++;
    }
  }
  return ret;
};
Util.stripAnsi = str => {
  let o = '';
  for(let i = 0; i < str.length; i++) {
    if(str[i] == '\x1b' && str[i + 1] == '[') {
      while(!/[A-Za-z]/.test(str[i])) i++;
      continue;
    }
    o += str[i];
  }
  return o;
};

Util.ansiCode = (...args) => {
  if(!color) color = Util.coloring();
  return color.code(...args);
};
Util.ansi = Util.coloring(true);
Util.wordWrap = (str, width, delimiter) => {
  // use this on single lines of text only
  if(str.length > width) {
    let p = width;
    for(; p > 0 && str[p] != ' '; p--) {}
    if(p > 0) {
      let left = str.substring(0, p);
      let right = str.substring(p + 1);
      return left + delimiter + Util.wordWrap(right, width, delimiter);
    }
  }
  return str;
};
Util.multiParagraphWordWrap = (str, width, delimiter) => {
  // use this on multi-paragraph lines of xcltext
  let arr = str.split(delimiter);
  for(let i = 0; i < arr.length; i++) if(arr[i].length > width) arr[i] = Util.wordWrap(arr[i], width, delimiter);
  return arr.join(delimiter);
};
Util.defineInspect = (proto, ...props) => {
  if(!Util.isBrowser()) {
    const c = Util.coloring();
    proto[Util.inspectSymbol] = function() {
      const obj = this;
      return (
        c.text(Util.fnName(proto.constructor) + ' ', 1, 31) +
        inspect(
          props.reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
          }, {}),
          {
            multiline: false,
            colors: true,
            colon: ':',
            spacing: '',
            separator: ', ',
            padding: ' '
          }
        )
      );
    };
  }
};

Util.inRange = Util.curry((a, b, value) => value >= a && value <= b);

Util.bindProperties = (proxy, target, props, gen) => {
  if(props instanceof Array) props = Object.fromEntries(props.map(name => [name, name]));
  const [propMap, propNames] = Array.isArray(props) ? [props.reduce((acc, name) => ({ ...acc, [name]: name }), {}), props] : [props, Object.keys(props)];

  gen ??= p => v => v === undefined ? target[propMap[p]] : (target[propMap[p]] = v);
  const propGetSet = propNames
    .map(k => [k, propMap[k]])

    .reduce(
      (a, [k, v]) => ({
        ...a,
        [k]: Util.isFunction(v) ? (...args) => v.call(target, k, ...args) : (gen && gen(k)) || ((...args) => (args.length > 0 ? (target[k] = args[0]) : target[k]))
      }),
      {}
    );

  /*  console.log(`Util.bindProperties`, { proxy, target, props, gen });*/
  //console.log(`Util.bindProperties`, { propMap, propNames, propGetSet });
  Object.defineProperties(
    proxy,
    propNames.reduce(
      (a, k) => {
        const prop = props[k];
        const get_set = propGetSet[k]; //typeof prop == 'function' ? prop : gen(prop);
        return {
          ...a,
          [k]: {
            get: get_set,
            set: get_set,
            enumerable: true
          }
        };
      },
      {
        __getter_setter__: { get: () => gen, enumerable: false },
        __bound_target__: { get: () => target, enumerable: false }
      }
    )
  );
  return proxy;
};

Util.weakKey = (function () {
  const map = new WeakMap();
  let index = 0;
  return obj => {
    let key = map.get(obj);
    if(!key) {
      key = 'weak-key-' + index++;
      map.set(obj, key);
    }
    return key;
  };
})();

Object.assign(Util.is, {
  array: Array.isArray,
  bool: Util.isBool,
  constructor: Util.isConstructor,
  date: Util.isDate,
  email: Util.isEmail,
  empty: Util.isEmpty,
  nonEmpty: Util.isNonEmpty,
  emptyString: Util.isEmptyString,
  generator: Util.isGenerator,
  iterable: Util.isIterable,
  map: Util.isMap,
  nativeFunction: Util.isNativeFunction,
  object: Util.isObject,
  promise: Util.isPromise,
  function: Util.isFunction,
  string: Util.isString,
  on: val => val == 'on' || val == 'yes' || val === 'true' || val === true,
  off: val => val == 'off' || val == 'no' || val === 'false' || val === false,
  true: val => val === 'true' || val === true,
  false: val => val === 'false' || val === false
});

class AssertionFailed extends Error {
  constructor(message, stack) {
    super(/*'@ ' + location + ': ' +*/ message);
    //this.location = location;
    this.type = 'Assertion failed';

    stack = stack || this.stack;

    this.stack = stack;
  }
}

Util.assert = function assert(val, message) {
  if(typeof val == 'function') {
    message = message || val + '';
    val = val();
  }
  if(!val) throw new AssertionFailed(message || `val == ${val}`);
};
Util.assertEqual = function assertEqual(val1, val2, message) {
  if(val1 != val2) throw new AssertionFailed(message || `${val1} != ${val2}`);
};

Util.assignGlobal = () => Util.weakAssign(Util.getGlobalObject(), Util);

Util.weakMapper = function(createFn, map = new WeakMap(), hitFn) {
  let self = function(obj, ...args) {
    let ret;
    if(map.has(obj)) {
      ret = map.get(obj);
      if(typeof hitFn == 'function') hitFn(obj, ret);
    } else {
      ret = createFn(obj, ...args);
      //if(ret !== undefined)
      map.set(obj, ret);
    }
    return ret;
  };
  self.set = (k, v) => map.set(k, v);
  self.get = k => map.get(k);
  self.map = map;
  return self;
};

Util.merge = function(...args) {
  let ret;
  let isMap = args[0] instanceof Map;
  let t = isMap ? a => new Map(Object.entries(a)) : a => a;

  if(isMap) {
    /*  if(!args.every(arg => Util.isObject(arg) && arg instanceof Map))
    args =args.map(arg => new Map(Util.entries(arg)));
*/
    ret = new Map();

    for(let arg of args) for (let [key, value] of Util.entries(arg)) ret.set(key, value);
  } else {
    ret = args.reduce((acc, arg) => ({ ...acc, ...arg }), {});
  }

  return ret;
};

Util.transformer = (a, ...l) =>
  (l || []).reduce(
    (c, f) =>
      function(...v) {
        return f.call(this, c.call(this, ...v), ...v);
      },
    a
  );

/* XXX */ Util.copyTextToClipboard = (i, t) => {
  if(!Util.isBrowser()) {
    return import('./childProcess.js').then(async module => {
      let fs, std;
      let childProcess = await module.PortableChildProcess((a, b, c) => {
        fs = b;
        std = c;
      });
      console.log('childProcess', { childProcess, fs, std });
      let proc = childProcess('xclip', ['-in'], {
        block: false,
        stdio: ['pipe'],
        env: { DISPLAY: Util.getEnv('DISPLAY') }
      });
      console.log('proc.stdin', proc.stdin);

      console.log('write =', await fs.write(proc.stdin, i));
      await fs.close(proc.stdin);
      return await proc.wait();
    });
  }
  let doc = Util.tryCatch(() => document);
  if(!doc) return;
  if(!t) t = doc.body;
  const e = doc.createElement('textarea');
  const prev = doc.activeElement;
  e.value = i + '';
  e.setAttribute('readonly', '');
  e.style.contain = 'strict';
  e.style.position = 'absolute';
  e.style.left = '-9999px';
  e.style.fontSize = '12pt';
  const s = doc.getSelection();
  let orig = false;
  if(s.rangeCount > 0) {
    orig = s.getRangeAt(0);
  }
  t.append(e);
  e.select();
  e.selectionStart = 0;
  e.selectionEnd = i.length;
  let isSuccess = false;
  try {
    isSuccess = doc.execCommand('copy');
  } catch(_) {}
  e.remove();
  if(orig) {
    s.removeAllRanges();
    s.addRange(orig);
  }
  if(prev) {
    prev.focus();
  }
  return isSuccess;
};

Util.toPlainObject = obj => Util.toPlainObjectT(obj, v => (Util.isObject(v) ? Util.toPlainObject(v) : v));

Util.toBuiltinObject = obj => (Array.isArray(obj) ? obj.map(Util.toBuiltinObject) : Util.toPlainObjectT(obj, v => (Util.isObject(v) ? Util.toBuiltinObject(v) : v)));

Util.toPlainObjectT = (obj, t = (v, n) => v) => [...Object.getOwnPropertyNames(obj)].reduce((acc, k) => ({ ...acc, [k]: t(obj[k], k) }), {});

Util.timer = msecs => {
  let ret, id, rej, createdTime, startTime, stopTime, endTime, res, delay, n, timer;
  createdTime = new Date();
  const remaining = () => {
    let r = startTime + msecs - (typeof stopTime == 'number' ? stopTime : new Date());
    return r >= 0 ? r : 0;
  };
  const finish = callback => {
    stopTime = new Date();
    if(stopTime.valueOf() > endTime.valueOf()) stopTime = endTime;
    if(typeof callback == 'function') callback(stopTime);
    res((n = remaining()));
  };
  const log = (method, ...args) =>
    console.log(`${Date.now() - createdTime.valueOf()} timer#${id}.${method}`, ...args.map(obj => Util.toPlainObject(obj || {}, v => v || (v instanceof Date ? `+${v.valueOf() - createdTime}` : v))));
  const timeout = (msecs, tmr = timer) => {
    let now = Date.now();
    if(!startTime) startTime = new Date(now);
    endTime = new Date(now + msecs);
    stopTime = undefined;
    id = setTimeout(() => {
      finish(typeof tmr.callback == 'function' ? (...args) => tmr.callback(...args) : () => {});
      log(`finish`, tmr);
    }, msecs);
    log('start', tmr);
  };
  const add = (arr, ...items) => [...(arr ? arr : []), ...items];

  timer = {
    subscribers: [],
    /* prettier-ignore */ get delay() {
      return delay;
    },
    /* prettier-ignore */ get created() {
      return createdTime;
    },
    /* prettier-ignore */ get start() {
      return startTime || new Date(endTime.valueOf() - delay);
    },
    /* prettier-ignore */ get stop() {
      return stopTime instanceof Date ? stopTime : undefined;
    },
    /* prettier-ignore */ get elapsed() {
      return delay + (stopTime || new Date()).valueOf() - endTime.valueOf();
    },
    /* prettier-ignore */ get end() {
      return endTime;
    },
    /* prettier-ignore */ get remain() {
      return endTime.valueOf() - (stopTime || new Date()).valueOf();
    },
    cancel() {
      log('cancel', this);
      clearTimeout(id);
      finish();
      return this;
    },
    pause() {
      let { remain, pause } = this;
      stopTime = new Date();
      clearTimeout(id);
      this.resume = function() {
        timeout(remain, this);
        this.pause = pause;
        delete this.resume;
        delete this.restart;
        log('resume', this);
        return this;
      };
      this.restart = function() {
        timeout(delay, this);
        this.pause = pause;
        delete this.resume;
        delete this.restart;
        log('restart', this);
        return this;
      };
      delete this.pause;
      log('pause', this);
      return this;
    },
    callback(...args) {
      log('callback', this);
      const { subscribers } = this;
      for(let f of subscribers) f.call(this, ...args);
      return this;
    },
    subscribe(f) {
      const { subscribers } = this;
      if(subscribers.indexOf(f) == -1) subscribers.push(f);
      return this;
    },
    unsubscribe(f) {
      const { subscribers } = this;
      let idx = subscribers.indexOf(f);
      if(idx != -1) subscribers.splice(idx, idx + 1);
      return this;
    }
  };
  const start = () =>
    new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
      timeout((delay = msecs));
    });
  ret = start();
  return Util.define(ret, timer);
};
/**
 * ???????????''
 * new Promise(Util.thenableReject('ERROR').then)
 *
 * @param      {<type>}  error   The error
 */
Util.thenableReject = error => ({
  then: (resolve, reject) => reject(error)
});
Util.wrapGenerator = fn =>
  Util.isGenerator(fn)
    ? function(...args) {
        return [...fn.call(this, ...args)];
      }
    : fn;

Util.wrapGeneratorMethods = obj => {
  for(let name of Util.getMethodNames(obj, 1, 0)) obj[name] = Util.wrapGenerator(obj[name]);
  return obj;
};

Util.decorateIterable = (proto, generators = false) => {
  const methods = {
    forEach(fn, thisArg) {
      for(let [i, item] of this.entries()) fn.call(thisArg, item, i, this);
    },
    *map(fn, thisArg) {
      for(let [i, item] of this.entries()) yield fn.call(thisArg, item, i, this);
    },
    *filter(pred, thisArg) {
      for(let [i, item] of this.entries()) if(pred.call(thisArg, item, i, this)) yield item;
    },
    findIndex(pred, thisArg) {
      for(let [i, item] of this.entries()) if(pred(item, i, this)) return i;
      return -1;
    },
    indexOf(item, startIndex = -1) {
      return this.findIndex((e, i) => i >= startIndex && e == item);
    },
    find(pred, thisArg) {
      let idx = this.findIndex(pred, thisArg);
      if(idx != -1) return typeof this.item == 'function' ? this.item(idx) : this[idx];
    },
    every(pred, thisArg) {
      for(let [i, item] of this.entries()) if(!pred(item, i++, this)) return false;
      return true;
    },
    some(pred, thisArg) {
      for(let [i, item] of this.entries()) if(pred(item, i, this)) return true;
      return false;
    },
    reduce(fn, accu) {
      for(let [i, item] of this.entries()) accu = fn(accu, item, i, this);
      return accu;
    },
    *entries() {
      let i = 0;
      for(let item of this) yield [i++, item];
    },
    *keys() {
      for(let [i, item] of this.entries()) yield i;
    },
    *values() {
      for(let [i, item] of this.entries()) yield item;
    }
  };
  Util.define(proto, methods, false);
  if(!generators) {
    for(let name in methods) {
      if(typeof name == 'symbol') continue;
      if(name == 'entries') continue;
      let gen = proto[name];
      proto[name] = Util.wrapGenerator(gen);
    }
  }

  return proto;
};

Util.swap = (a, b) => [b, a];
Util.swapArray = ([a, b]) => [b, a];

Util.cacheAdapter = (st, defaultOpts = {}) => {
  if(typeof st == 'string')
    st = Util.tryCatch(
      () => window.caches,
      async c => c.open(st),
      () => null
    );
  return {
    async getItem(request, opts = {}) {
      if(typeof request == 'number') request = await this.key(request);
      return await (await st).match(request, { ...defaultOpts, ...opts });
    },
    async setItem(request, response) {
      return await (await st).put(request, response);
    },
    async addItem(request) {
      await (await st).add(request);
      let response = await this.getItem(request);
      if(response) response = response.clone();
      return response;
    },
    async removeItem(request, opts = {}) {
      if(typeof request == 'number') request = await this.key(request);
      return await (await st).delete(request, { ...defaultOpts, ...opts });
    },
    async key(index) {
      return (await (await st).keys())[index];
    },
    async keys(urls = false, t = a => a) {
      let keys = await (await st).keys();
      if(urls) keys = keys.map(response => response.url);
      if(typeof t == 'function') keys = keys.map(r => t(r));

      return keys;
    },
    async clear() {
      let keys = await (await st).keys();
      for(let key of keys) await this.removeItem(key);
    }
  };
};
Util.cachedFetch = (allOpts = {}) => {
  let { cache = 'fetch', fetch = Util.getGlobalObject('fetch'), debug, print, ...opts } = allOpts;
  const storage = Util.cacheAdapter(cache);
  const baseURL = Util.memoize(() => Util.makeURL({ location: '' }));

  let self = async function CachedFetch(request, opts = {}) {
    let response;
    try {
      if(typeof request == 'string') request = new Request(request, { ...self.defaultOpts, ...opts });

      if(!request.url.startsWith(baseURL())) {
        request = new Request(request.url, { ...request, mode: 'no-cors' });
      }
      response = await storage.getItem(request, {
        ...self.defaultOpts,
        ...opts
      });

      if(response == undefined) {
        response = await /*self.*/ fetch(request, {
          ...self.defaultOpts,
          ...opts
        });

        if(response) {
          let item = response.clone();
          item.time = new Date();
          storage.setItem(request, item);
        }
      } else {
        response.cached = true;
      }
    } catch(err) {
      throw new Error(`CachedFetch: ` + (request.url || request) + ' ' + err.message);
    }
    return response;
  };
  if(debug)
    self = Util.printReturnValue(self, {
      print: print || ((returnValue, fn, ...args) => console.debug(`cachedFetch[${cache}] (`, ...args, `) =`, returnValue))
    });

  Util.define(self, { fetch, cache, storage, opts });
  return self;
};

Util.proxyObject = (root, handler) => {
  const ptr = path => path.reduce((a, i) => a[i], root);
  const nodes = Util.weakMapper(
    (value, path) =>
      new Proxy(value, {
        get(target, key) {
          let prop = value[key];
          if(Util.isObject(prop) || Array.isArray(prop)) return new node([...path, key]);
          return handler && handler.get ? handler.get(prop, key) : prop;
        }
      })
  );
  function node(path) {
    let value = ptr(path);
    //console.log("node:",{path,value});
    return nodes(value, path);
  }
  return node([]);
};
Util.parseXML = function(xmlStr) {
  return Util.tryCatch(
    () => new DOM(),
    parser => parser.parseFromString(xmlStr, 'application/xml')
  );
};

Util.weakAssoc = (fn = (value, ...args) => Object.assign(value, ...args)) => {
  let mapper = Util.tryCatch(
    () => new WeakMap(),
    map => Util.weakMapper((obj, ...args) => Util.merge(...args), map),
    () =>
      (obj, ...args) =>
        Util.define(obj, ...args)
  );
  let self = (obj, ...args) => {
    let value = mapper(obj, ...args);
    return fn(value, ...args);
  };
  self.mapper = mapper;

  return self;
};
Util.getArgv = Util.memoize(() =>
  Util.tryCatch(
    () => {
      let a = process.argv;
      if(!Array.isArray(a)) throw new Error();
      return a;
    },
    a => a,
    () =>
      Util.tryCatch(
        () => thisFilename(),
        fn => [fn],
        () =>
          Util.tryCatch(
            () => scriptArgs,
            a => ['qjs', ...a]
          )
      )
  )
);
Util.getArgs = Util.memoize(() =>
  Util.tryCatch(
    () => {
      let a = process.argv;
      if(!Array.isArray(a)) throw new Error();
      return a;
    },
    a => a.slice(1),
    () => Util.tryCatch(() => scriptArgs)
  )
);
/*  options Object/Map

    option Array [has_arg,callback,val]

*/
Util.getOpt = (options = {}, args) => {
  let short, long;
  let result = {};
  let positional = (result['@'] = []);
  if(!(options instanceof Array)) options = Object.entries(options);
  const findOpt = arg => options.find(([optname, option]) => (Array.isArray(option) ? option.indexOf(arg) != -1 : false) || arg == optname);
  let [, params] = options.find(opt => opt[0] == '@') || [];
  if(typeof params == 'string') params = params.split(',');
  // console.log('Util.getOpt options', options);
  // console.log('Util.getOpt params', params);
  for(let i = 0; i < args.length; i++) {
    const arg = args[i];
    let opt;
    if(arg[0] == '-') {
      let name, value, start, end;
      if(arg[1] == '-') long = true;
      else short = true;
      //console.log('Util.getOpt', { arg, short, long });
      start = short ? 1 : 2;
      if(short) end = 2;
      else if((end = arg.indexOf('=')) == -1) end = arg.length;
      name = arg.substring(start, end);
      //console.log('Util.getOpt', { start, end, name });
      if((opt = findOpt(name))) {
        //console.log('Util.getOpt', { opt });
        const [has_arg, handler] = opt[1];
        if(has_arg) {
          if(arg.length > end) value = arg.substring(end + (arg[end] == '='));
          else value = args[++i];
        } else {
          value = true;
        }
        //console.log('Util.getOpt #1', { name, handler });
        Util.tryCatch(
          () => handler(value, result[opt[0]], options, result),
          v => (value = v),
          () => null
        );
        //console.log('Util.getOpt #2', { name, value, fn: typeof opt[1] + ' ' + opt[1] + '' });
        result[opt[0]] = value;
        continue;
      }
    }
    if(params.length) {
      const param = params.shift();
      // console.log('Util.getOpt', { positional, param });
      if((opt = findOpt(param))) {
        const [, [, handler]] = opt;
        let value = arg;
        //console.log('Util.getOpt #3', { param, handler });
        if(typeof handler == 'function')
          value = Util.tryCatch(
            () => handler(value, result[opt[0]], options, result),
            v => v
          );
        const name = opt[0];
        //console.log('Util.getOpt #4', { name, value });
        result[opt[0]] = value;
        continue;
      }
    }
    result['@'] = [...(result['@'] ?? []), arg];
  }
  //console.log('Util.getOpt', { result });
  return result;
};
Util.getEnv = async varName =>
  Util.tryCatch(
    () => process.env,
    async e => e[varName],
    () => false /* XXX (globalThis.std ? std.getenv(varName) : Util.tryCatch(async () => await import('std').then(std => std.getenv(varName)))) */
  );
Util.getEnvVars = async () =>
  Util.tryCatch(
    () => process.env,
    async e => e,
    () => false
    // XXX     Util.tryCatch(
    //        async () =>
    //          await import('./childProcess.js').then(async ({ PortableChildProcess }) => {
    //            let childProcess = await PortableChildProcess();
    //            (await import('./filesystem.js')).default(fs => (Util.globalThis().filesystem = fs));
    //            let proc = childProcess('env', [], {
    //              block: false,
    //              stdio: [null, 'pipe']
    //            });
    //            let data = '\n';
    //            for await(let output of await filesystem.asyncReader(proc.stdout)) data += filesystem.bufferToString(output);
    //            let matches = [...Util.matchAll(/(^|\n)[A-Za-z_][A-Za-z0-9_]*=.*/gm, data)];
    //            let indexes = matches.map(match => match.index);
    //            let ranges = indexes.reduce((acc, idx, i, a) => [...acc, [idx + 1, a[i + 1]]], []);
    //            let vars = ranges
    //              .map(r => data.substring(...r))
    //              .map(line => {
    //                let eqPos = line.indexOf('=');
    //                return [line.substring(0, eqPos), line.substring(eqPos + 1)];
    //              });
    //            return Object.fromEntries(vars);
    //          })
    //      )
  );

Util.safeFunction = (fn, trapExceptions, thisObj) => {
  const isAsync = Util.isAsync(fn);
  let exec = isAsync
    ? async function(...args) {
        return await fn.call(this || thisObj, ...args);
      }
    : function(...args) {
        return fn.call(this || thisObj, ...args);
      };
  if(trapExceptions) {
    const handleException = typeof trapExceptions == 'function' ? trapExceptions : Util.putError;
    Error.stackTraceLimit = Infinity;
    exec = Util.tryFunction(
      exec, //async (...args) => { Error.stackTraceLimit=Infinity;  return await exec(...args); },
      a => a,
      error => {
        if(Util.isObject(error)) {
          if(error.stack !== undefined) error.stack = new Util.stack(error.stack);
          handleException(error);
        }
      }
    );
  }
  return exec;
};
Util.safeCall = (fn, ...args) => Util.safeApply(fn, args);
Util.safeApply = (fn, args = []) => Util.safeFunction(fn, true)(...args);

Util.exit = exitCode => {
  const { callExitHandlers } = Util;
  //console.log('Util.exit', { exitCode, callExitHandlers });
  if(callExitHandlers) callExitHandlers(exitCode);
  const stdExit = std => {
    std.gc();
    std.exit(exitCode);
  };
  if(globalThis.std) return stdExit(globalThis.std);
  return;
  /* XXX import('std')
    .then(stdExit)
    .catch(() =>*/ Util.tryCatch(
    () => [process, process.exit],
    ([obj, exit]) => exit.call(obj, exitCode),
    () => false
  );
};
Util.atexit = handler => {
  const { handlers } = Util.callMain;
  Util.pushUnique(handlers, handler);
  if(typeof Util.trapExit == 'function') Util.trapExit();
};
Util.callMain = async (fn, trapExceptions) =>
  await Util.safeFunction(
    async (...args) => {
      Util.callMain.handlers = [];
      const { handlers } = Util.callMain;
      const callExitHandlers = (Util.callExitHandlers = Util.once(async ret => {
        if(handlers) for(const handler of handlers) await handler(ret);
        // Util.exit(ret);
      }));
      Util.trapExit = Util.once(() => Util.signal(15, callExitHandlers));
      /* XXX if(Util.getPlatform() == 'quickjs') await import('std').then(module => module.gc()); */
      let ret = await fn(...args);
      await callExitHandlers(ret);
    },
    trapExceptions &&
      (typeof trapExceptions == 'function'
        ? trapExceptions
        : err => {
            let { message, stack } = err;
            stack = new Util.stack(err.stack);
            const scriptDir = Util.tryCatch(
              () => process.argv[1],
              argv1 => argv1.replace(/\/[^\/]*$/g, '')
            );
            console.log('Exception:', message, '\nStack:' + (stack.toString({ colors: true, stripUrl: `file://${scriptDir}/` }) + '').replace(/(^|\n)/g, '\n  '));
            Util.exit(1);
          })
  )(...scriptArgs.slice(1));

Util.printReturnValue = (fn, opts = {}) => {
  const {
    print = (returnValue, fn, ...args) => {
      let stack = Util.getCallerStack();

      (console.debug || console.log)('RETURN VAL:', /*inspect(*/ returnValue /*, { colors: false })*/, {
        /*fn,
         */ args /*,
        stack*/
      });
    }
  } = opts;
  let self;
  self = (...args) => {
    let returnValue = fn(...args);

    print.call(self, returnValue, fn, ...args);
    return returnValue;
    /*fn = Util.tryFunction(fn, (returnValue, ...args) => {
      print.call(self, returnValue, fn, ...args);
      return returnValue;
    });

    return fn(...args);*/
  };
  Util.define(self, { fn, opts });
  return self;
};
Util.callMain.handlers = [];

Util.replaceAll = (needles, haystack) => {
  return Util.entries(needles)
    .map(([re, str]) => [typeof re == 'string' ? new RegExp(re, 'g') : re, str])
    .reduce((acc, [match, replacement]) => acc.replace(match, replacement), haystack);
};

Util.quote = (str, q = '"') => {
  return q + str.replace(new RegExp(q, 'g'), '\\' + q) + q;
};

Util.escape = (str, pred = codePoint => codePoint < 32 || codePoint > 0xff) => {
  let s = '';
  for(let i = 0; i < str.length; i++) {
    let code = str.codePointAt(i);
    if(!pred(code)) {
      s += str[i];
      continue;
    }

    if(code == 0) s += `\\0`;
    else if(code == 10) s += `\\n`;
    else if(code == 13) s += `\\r`;
    else if(code == 9) s += `\\t`;
    else if(code <= 0xff) s += `\\x${('0' + code.toString(16)).slice(-2)}`;
    else s += `\\u${('0000' + code.toString(16)).slice(-4)}`;
  }
  return s;
};
Util.escapeRegex = string => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

Util.consolePrinter = function ConsolePrinter(log = console.log) {
  let self;

  self = function(...args) {
    self.add(...args);
    self.print();
    self.clear();
  };

  delete self.length;

  Object.setPrototypeOf(self, Util.extend(Util.consolePrinter.prototype, Util.getMethods(Object.getPrototypeOf(self), 1, 0)));
  self.splice(0, self.length, '');
  self.log = (...args) => log(...args);

  return self;
};
Object.assign(Util.consolePrinter.prototype, Util.getMethods(Array.prototype));

Util.consoleJoin = function(...args) {
  let out = 'push' in this ? this : [];
  if(out.length == 0) out.push('');
  let match = Util.matchAll(/%(?:o|O|d|i|s|f|s|d|c)/g);
  for(let [fmt, ...styles] of args) {
    console.log('Util.consoleJoin', { fmt, styles, out });
    let substs = [...match(fmt)];
    if(substs.length != styles.length) {
      const code = [substs.length, styles.length];
      //console.log("substs:",substs);
      throw new Error(`${code.join(' != ')} ${code.join(', ')}`);
    }
    if(out[0]) out[0] += ' ';
    out[0] += fmt;

    for(let style of styles) Array.prototype.push.call(out, style);
    // Array.prototype.splice.call(out, out.length, 0, ...styles);
    //console.log('Util.consoleJoin', [...out]);
  }
  return out;
};

Util.consoleConcat = function(...args) {
  let self;
  self = function ConsoleConcat(...args) {
    if(args.length == 1 && Array.isArray(args[0])) args = args[0];
    return self.add(...args);
  };
  self.add = Util.consoleJoin;
  /*  function concat(out, args) {
 console.log('concat', { out: [...out], args: [...args] });
   while(args.length) {
      let arg = args.shift();
      if(typeof arg == 'string') {
        let matches = [...Util.matchAll(/%[cos]/g, arg)];
        if(matches.length > 0 && args.length >= matches.length) {
          out[0] += arg;
          out.splice(out.length, 0, ...args.splice(0, matches.length));
        } else {
          out[0] += arg.replace(/%/g, '%%');
        }
      } else if(Array.isArray(arg) && typeof arg[0] == 'string' && /%[cos]/.test(arg[0])) {
        concat(out, arg);
      } else {
        out[0] += ' %o';
        out.push(arg);
      }
    }
    return out;
  }
*/ delete self.length;
  Object.setPrototypeOf(self, Util.extend(Util.consoleConcat.prototype, Object.getPrototypeOf(self)));
  //self.push('');
  if(args.length) self.add(...args);
  return self;
};

Util.consoleConcat.prototype = Object.assign(Util.consoleConcat.prototype, Util.getMethods(Array.prototype, 1, 0), {
  [Util.inspectSymbol]() {
    return [this, [...this]];
  },
  [Symbol.iterator]() {
    return Array.prototype[Symbol.iterator].call(this);
  },
  clear() {
    return this.splice(0, this.length);
  },
  print(log = (...args) => console.info(...args)) {
    log(...this);
  }
});
Util.consolePrinter.prototype.length = 1;
Util.consolePrinter.prototype[0] = '';
Object.assign(Util.consolePrinter.prototype, Util.consoleConcat.prototype, {
  print() {
    const a = [...this];
    const i = a.map(i => inspect(i));
    console.debug('a: ' + i.shift(), ...i);

    Util.consoleConcat.prototype.print.call(this, this.log);
  },
  output() {
    const a = [...this];
    this.clear();
    return a;
  },
  add(...args) {
    let { i = 0 } = this;

    for(; args.length > 0; i++) {
      let arg = args.shift();
      //  console.debug('arg:', i, typeof(arg) == 'string'  ? Util.abbreviate(arg) : arg);

      if(Array.isArray(arg) && /%c/.test(arg[0])) {
        this.i = i;
        this.add(...arg);
        continue;
      }
      if(i > 0) this[0] += ' ';
      if(typeof arg != 'string') {
        this[0] += '%o';
        this.push(arg);
      } else {
        this[0] += arg;
        if(/color:/.test(this[0])) {
          throw new Error(`this[0] is CSS: i=${i}\nthis[0] = "${this[0]}"\narg= ${typeof arg} "${(arg + '').replace(lineSplit, '\\n')}"`);
        }

        const matches = [...Util.matchAll(['%c', '%o'], arg)];
        console.debug('matches.length:', matches.length, ' args.length:', args.length);

        if(matches.length > 0) {
          const styles = args.splice(0, matches.length);
          this.splice(this.length, 0, ...styles);
        }
      }
    }
  }
});

Util.booleanAdapter = (getSetFn, trueValue = 1, falseValue = 0) =>
  function(value) {
    if(value !== undefined) {
      getSetFn(value ? trueValue : falseValue);
    } else {
      let ret = getSetFn();
      if(ret === trueValue) return true;
      if(ret === falseValue) return false;
    }
  };

Util.getSet = (get, set = () => {}, thisObj) =>
  function(...args) {
    if(args.length > 0) return set.call(thisObj || this, ...args);
    return get.call(thisObj || this);
  };

Util.deriveGetSet = (fn, get = v => v, set = v => v, thisObj) =>
  Util.getSet(
    () => get(fn()),
    v => fn(set(v)),
    thisObj
  );
Util.extendFunction = (handler = () => {}) =>
  class ExFunc extends Function {
    constructor() {
      super('...args', 'return this.__self__.__call__(...args)');
      var self = this.bind(this);
      this.__self__ = self;
      return self;
    }

    // Example `__call__` method.
    __call__(...args) {
      return handler(...args);
    }
  };
Util.isatty = async fd => {
  let ret;
  for(let module of ['os', 'tty']) {
    try {
      ret = await import(module).then(mod => mod.isatty(fd));
    } catch(err) {
      ret = undefined;
    }
    if(ret !== undefined) break;
  }
  return ret;
};
Util.ttyGetWinSize = (fd = 1) => {
  let ret;
  if(Util.getPlatform() == 'quickjs') return import('os').then(m => m.ttyGetWinSize(fd));
  const stream = process[['stdin', 'stdout', 'stderr'][fd] || 'stdout'];
  return new Promise(stream.cols ? (resolve, reject) => resolve([stream.cols, stream.rows]) : (resolve, reject) => resolve(stream?.getWindowSize?.()));
};
Util.ttySetRaw = globalThis.os
  ? os.ttySetRaw
  : (fd = 0, mode = true) => {
      let ret;
      const stream = typeof fd == 'number' ? process[['stdin', 'stdout', 'stderr'][fd] || 'stdin'] : fd;
      return stream?.setRawMode?.(mode);
    };
Util.stdio = (fd, mode = true) => {
  if(Util.getPlatform() == 'quickjs') return std[['in', 'out', 'err'][fd]];

  let ret;
  const stream = typeof fd == 'number' ? process[['stdin', 'stdout', 'stderr'][fd] || 'stdin'] : fd;
  return stream?.setRawMode?.(mode);
};

Util.signal = (num, act) => {
  //console.log('Util.signal', { num, act });
  let ret;
  return import('os')
    .then(m => {
      if(typeof num == 'string' && num in m) num = m[num];

      m.signal(num, act);
    })
    .catch(() => process.on(num, act));
};

/**
 * Measure the average execution time of a function
 * @param {Function} fn A function for performance measurement
 * @param {Array} args Function arguments
 * @param {Object} options
 * @returns {Number} Result in milliseconds
 */
Util.timeit = (fn, args = [], options = {}) => {
  const valid = fn && typeof fn === 'function';
  if(!valid) throw new Error('No function provided.');

  const NS_PER_SEC = 1e9;
  const { e, r, l, d } = { e: 1000, r: 1, l: true, d: 6, ...options };
  const { hrtime } = Util;

  let results = [];
  for(let i = 0; i < r; i++) {
    const start = hrtime();
    for(let i = 1; i < e; i++) {
      fn(args);
    }
    const diff = hrtime(start);
    const elapsed = (diff[0] * NS_PER_SEC + diff[1]) * 0.000001;
    const result = elapsed / e;
    results.push(+(Math.round(result + `e+${6}`) + `e-${6}`));
  }
  const ms = results.reduce((p, c) => p + c, 0) / results.length;

  if(l) {
    console.log(`Function   : ${fn.name}()`);
    console.log(`Average    : ${ms.toFixed(d)}ms`);
    console.log(`Repetitions: ${r}`);
    console.log(`Executions : ${e}`);
  }

  return ms;
};

Util.lazyProperty = (obj, name, getter, opts = {}) => {
  const replaceProperty = value => {
    delete obj[name];
    Object.defineProperty(obj, name, { value, ...opts });
    return value;
  };
  const isAsync = Util.isAsync(getter);
  //console.log(`Util.lazyProperty name=${name} isAsync=${isAsync} getter=${getter}`);

  return Object.defineProperty(obj, name, {
    get: isAsync
      ? async function() {
          return replaceProperty(await getter.call(obj, name));
        }
      : function() {
          const value = getter.call(obj, name);
          let isPromise = Util.isObject(value) && value instanceof Promise;
          //console.log(`Util.lazyProperty`, name, value, isPromise);
          if(isPromise) {
            value.then(v => {
              replaceProperty(v);
              //console.log(`Util.lazyProperty resolved `, obj[name]);
              return v;
            });
            return value;
          }
          return replaceProperty(value);
        },
    configurable: true,
    ...opts
  });
};

Util.lazyProperties = (obj, gettersObj, opts = {}) => {
  opts = { enumerable: false, ...opts };
  for(let prop in gettersObj) {
    // console.log('Util.lazyProperties', { prop });
    Util.lazyProperty(obj, prop, gettersObj[prop], opts);
  }
  return obj;
};

Util.calcHRTime = (f = (a, b) => a + b) =>
  function(a, b) {
    const ms = f(a[1], b[1]);
    const div = Math.floor(ms / 1e9);
    const rem = ms % 1e9;

    return [f(a[0], b[0]) + div, rem];
  };
Util.addHRTime = Util.calcHRTime((a, b) => a + b);
Util.subHRTime = Util.calcHRTime((a, b) => a - b);

Util.getHRTime = Util.memoize(() => {
  const { now } = Util;

  class HighResolutionTime extends Array {
    constructor(secs = 0, nano = 0) {
      super(2);
      this[0] = secs;
      this[1] = nano;
      return Object.freeze(this);
    }
    static create(s, n) {
      const sign = Math.sign(s * 1e3 + n * 1e-6);
      s *= sign;
      n *= sign;
      if(n < 0) {
        s--;
        n += 1e9;
      }
      if(n >= 1e9) {
        s++;
        n -= 1e9;
      }
      return new HighResolutionTime(s * sign, n * sign);
    }
    /* prettier-ignore */ get seconds() {
      const [s, n] = this;
      return s + n * 1e-9;
    }
    /* prettier-ignore */ get milliseconds() {
      const [s, n] = this;
      return s * 1e3 + n * 1e-6;
    }
    /* prettier-ignore */ get nanoseconds() {
      const [s, n] = this;
      return s * 1e9 + n;
    }
    [Symbol.toPrimitive]() {
      return this.milliseconds;
    }
    diff(o) {
      let s = o[0] - this[0];
      let n = o[1] - this[1];
      return HighResolutionTime.create(s, n);
    }
    sum(o) {
      /*     let s = o[0] + this[0];
      let n = o[1] + this[1];*/
      return HighResolutionTime.create(...Util.addHRTime(o, this));
    }
    since(o) {
      let s = this[0] - o[0];
      let n = this[1] - o[1];
      return HighResolutionTime.create(s, n);
    }
    toString() {
      let secs = this.seconds;
      let msecs = (secs % 1) * 1e3;
      let nsecs = (msecs % 1) * 1e6;
      let ret = secs >= 1 ? `${Math.floor(secs)}s ` : '';
      return ret + `${Util.roundTo(msecs, 0.001)}ms`;
    }
    inspect() {
      return [this.seconds, this.nanoseconds];
    }
    [Util.inspectSymbol]() {
      return [this.seconds, this.nanoseconds];
      let secs = this.seconds;
      let msecs = (secs % 1) * 1e3;
      let nsecs = (msecs % 1) * 1e6;
      return `${Math.floor(secs)}s ${Util.roundTo(msecs, 0.001)}ms`;
      return `${Math.floor(secs)}s ${Math.floor(msecs)}ms ${Math.floor(nsecs)}ns`;
    }
  }
  Util.getGlobalObject().HighResolutionTime = HighResolutionTime;

  return Util.isAsync(now)
    ? async function hrtime(previousTimestamp) {
        var clocktime = await now();
        var secs = Math.floor(Number(clocktime / 1000));
        var nano = Math.floor(Number(clocktime % 1000) * 1e6);
        let ts = new HighResolutionTime(secs, nano);
        if(previousTimestamp) ts = ts.since(previousTimestamp);
        return ts;
      }
    : function hrtime(previousTimestamp) {
        var clocktime = now();
        var secs = Math.floor(clocktime / 1000);
        var nano = Math.floor((clocktime % 1000) * 1e6);
        let ts = new HighResolutionTime(secs, nano);
        if(previousTimestamp) ts = ts.since(previousTimestamp);
        return ts;
      };
});

Util.lazyProperty(Util, 'animationFrame', () => {
  const { now } = Util;

  return (minDelay = 0) => {
    if(minDelay <= 0) return new Promise(resolve => requestAnimationFrame(resolve));
    const start = now();

    return new Promise(resolve => {
      requestAnimationFrame(animationFrame);

      function animationFrame(t) {
        if(t - start >= minDelay) resolve(t);
        requestAnimationFrame(animationFrame);
      }
    });
  };
});

Util.lazyProperty(Util, 'hrtime', Util.getHRTime);
//Util.startTime = Util.hrtime();

Util.lazyProperty(
  Util,
  'now',
  (Util.getNow = () => {
    const g = Util.getGlobalObject();
    // polyfil for window.performance.now
    var performance = g.performance || {};
    var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow;

    if(performanceNow) {
      //console.log('performanceNow', performanceNow);
      performanceNow = performanceNow.bind(performance); //Util.bind(performanceNow, performance);
    }

    if(!performanceNow && g.cv?.getTickCount) {
      const freq = g.cv.getTickFrequency() / 1000;
      const mul = 1 / freq;
      const getTicks = g.cv.getTickCount;
      performanceNow = () => getTicks() * mul;
    }
    if(!performanceNow && Util.getPlatform() == 'quickjs') {
      let gettime;
      const CLOCK_REALTIME = 0;
      const CLOCK_MONOTONIC = 1;
      const CLOCK_MONOTONIC_RAW = 4;
      const CLOCK_BOOTTIME = 7;

      console.log('STACK:', Util.getCallerStack());

      performanceNow = async function(clock = CLOCK_MONOTONIC_RAW) {
        if(!gettime) {
          const { dlsym, RTLD_DEFAULT, define, call } = await import('ffi.so');
          const clock_gettime = dlsym(RTLD_DEFAULT, 'clock_gettime');
          define('clock_gettime', clock_gettime, null, 'int', 'int', 'void *');
          gettime = (clk_id, tp) => call('clock_gettime', clk_id, tp);
        }
        let data = new ArrayBuffer(16);

        gettime(clock, data);
        let [secs, nsecs] = new BigUint64Array(data, 0, 2);

        let t = /*BigFloat*/ secs * 1e3 + nsecs * 1e-6;
        return t;
      };
    }

    if(!performanceNow) {
      const getTime = Date.now;
      performanceNow = getTime;
    }

    return performanceNow;
  })
);

Util.formatColumns = a => {
  let maxWidth = a.reduce((acc, row, i) => row.map((col, j) => Math.max(acc[j] || 0, (col + '').length)));

  // console.debug(maxWidth);

  return a.map(row => row.map((col, j) => (col + '').padEnd(maxWidth[j])).join(' ')).join('\n');
};

Util.getPlatform = () =>
  Util.tryCatch(
    () => process.versions.node,
    () => 'node',
    Util.tryCatch(
      () => globalThis.scriptArgs[0],
      () => 'quickjs',
      Util.tryCatch(
        () => window.navigator,
        () => 'browser',
        () => undefined
      )
    )
  );

Util.defineGetter(Util, 'platform', Util.memoize(Util.getPlatform));
Util.defineGetter(
  Util,
  'env',
  Util.memoize(async () => {
    let env = await Util.getEnvVars();
    Util.define(Util, 'env', env);
    return env;
  })
);

Util.colIndexes = line => [...line].reduce(([prev, cols], char, i) => [char, [...cols, ...(/\s/.test(prev) && /[^\s]/.test(char) ? [i] : [])]], [' ', []])[1];

Util.colSplit = (line, indexes) => {
  indexes = indexes || Util.colIndexes(line);
  let ret = [];
  for(let i = 0; i < indexes.length; i++) {
    let col = indexes[i];
    let next = indexes[i + 1] || line.length;

    ret.push(line.substring(col, next));
  }
  return ret;
};

Util.bitsToNames = (flags, map = (name, flag) => name) => {
  const entries = [...Util.entries(flags)];

  return function* (value) {
    for(let [name, flag] of entries) if(value & flag && (value & flag) == flag) yield map(name, flag);
  };
};

// time a given function
Util.instrument = (
  fn,
  log = (duration, name, args, ret) => console.log(`function '${name}'` + (ret !== undefined ? ` {= ${Util.abbreviate(Util.escape(ret + ''))}}` : '') + ` timing: ${duration.toFixed(3)}ms`),
  logInterval = 0 //1000
) => {
  const { now, hrtime, functionName } = Util;
  let last = now();
  let duration = 0,
    times = 0;
  const name = functionName(fn) || '<anonymous>';
  const isAsync = Util.isAsync(fn) || Util.isAsync(now);
  const doLog = isAsync
    ? async (args, ret) => {
        let t = await now();
        if(t - (await last) >= logInterval) {
          log(duration / times, name, args, ret);
          duration = times = 0;
          last = t;
        }
      }
    : (args, ret) => {
        let t = now();
        //console.log('doLog', { passed: t - last, logInterval });
        if(t - last >= logInterval) {
          log(duration / times, name, args, ret);
          duration = times = 0;
          last = t;
        }
      };

  return isAsync
    ? async function(...args) {
        const start = await now();
        let ret = await fn.apply(this, args);
        duration += (await now()) - start;
        times++;
        await doLog(args, ret);
        return ret;
      }
    : function(...args) {
        const start = hrtime();
        let ret = fn.apply(this, args);
        duration += now() - start;
        times++;
        doLog(args, ret);
        return ret;
      };
};

Util.trace = (fn, enter, leave, both = () => {}) => {
  enter = enter || ((name, args) => console.log(`function '${name}' (${args.map(arg => inspect(arg)).join(', ')}`));

  leave = leave || ((name, ret) => console.log(`function '${name}'` + (ret !== undefined ? ` {= ${Util.abbreviate(Util.escape(ret + ''))}}` : '')));

  let orig = fn;

  return function(...args) {
    let ret;
    both('enter', fn.name, args);
    enter(fn.name, args);

    ret = orig.call(this, ...args);
    both('leave', fn.name, ret);
    leave(fn.name, ret);
    return ret;
  };
};

Util.bind = function(f, ...args) {
  let ret,
    boundThis = args[0];

  if(args.length < 2)
    ret = function() {
      if(new.target /*this instanceof ret*/) {
        let ret_ = f.apply(this, arguments);
        return Object(ret_) === ret_ ? ret_ : this;
      } else return f.apply(boundThis, arguments);
    };
  else {
    let boundArgs = new Array(args.length - 1);
    for(let i = 1; i < args.length; i++) boundArgs[i - 1] = args[i];

    ret = function() {
      let boundLen = boundArgs.length,
        args = new Array(boundLen + arguments.length),
        i;
      for(i = 0; i < boundLen; i++) args[i] = boundArgs[i];
      for(i = 0; i < arguments.length; i++) args[boundLen + i] = arguments[i];

      if(new.target /*this instanceof ret*/) {
        let ret_ = f.apply(this, args);
        return Object(ret_) === ret_ ? ret_ : this;
      } else return f.apply(boundThis, args);
    };
  }

  ret.prototype = f.prototype;
  return ret;
};

Util.bytesToUTF8 = function* (bytes) {
  if(bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes);
  let state = 0,
    val = 0;
  for(const c of bytes) {
    if(state !== 0 && c >= 0x80 && c < 0xc0) {
      val = (val << 6) | (c & 0x3f);
      state--;
      if(state === 0) yield val;
    } else if(c >= 0xc0 && c < 0xf8) {
      state = 1 + (c >= 0xe0) + (c >= 0xf0);
      val = c & ((1 << (6 - state)) - 1);
    } else {
      state = 0;
      yield c;
    }
  }
};
Util.codePointsToString = codePoints => {
  let s = '';
  for(let c of codePoints) s += String.fromCodePoint(c);
  return s;
};
Util.bufferToString = b => Util.codePointsToString(Util.bytesToUTF8(b));

Util.levenshteinDistance = function levenshteinDistance(a, b) {
  if(!a || !b) return (a || b).length;
  var m = [];
  for(var i = 0; i <= b.length; i++) {
    m[i] = [i];
    if(i === 0) continue;
    for(var j = 0; j <= a.length; j++) {
      m[0][j] = j;
      if(j === 0) continue;
      m[i][j] = b.charAt(i - 1) == a.charAt(j - 1) ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
};

Util.padTrunc = (...args) => {
  let [len, s] = args;
  const end = len >= 0;
  len = Math.abs(len);
  if(args.length < 2) {
    return (s, pad = ' ') => {
      s = s + '';
      len ??= s.length;
      return s.length > len ? s.slice(0, len) : s['pad' + (end ? 'End' : 'Start')](len, pad);
    };
  } else {
    s = s + '';
    len ??= s.length;
    return s.length > len ? s.slice(0, len) : s['pad' + (end ? 'End' : 'Start')](len, ' ');
  }
};

Util.setReadHandler = (fd, handler) => (Util.getPlatform() == 'quickjs' ? import('os').then(os => os.setReadHandler(fd, handler)) : fd.on('data', handler));

export default Util();
