const hasMap = typeof Map === 'function' && Map.prototype;
const mapSizeDescriptor =
  Object.getOwnPropertyDescriptor && hasMap
    ? Object.getOwnPropertyDescriptor(Map.prototype, 'size')
    : null;
const mapSize =
  hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function'
    ? mapSizeDescriptor.get
    : null;
const mapForEach = hasMap && Map.prototype.forEach;
const hasSet = typeof Set === 'function' && Set.prototype;
const setSizeDescriptor =
  Object.getOwnPropertyDescriptor && hasSet
    ? Object.getOwnPropertyDescriptor(Set.prototype, 'size')
    : null;
const setSize =
  hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function'
    ? setSizeDescriptor.get
    : null;
const setForEach = hasSet && Set.prototype.forEach;
const hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
const weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
const hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
const weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
const booleanValueOf = Boolean.prototype.valueOf;
const objectToString = Object.prototype.toString;
const functionToString = Function.prototype.toString;
const match = String.prototype.match;
const bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
const gOPS = Object.getOwnPropertySymbols;
const symToString = typeof Symbol === 'function' ? Symbol.prototype.toString : null;
const isEnumerable = Object.prototype.propertyIsEnumerable;

const inspectCustom = ['inspect', Symbol.for('nodejs.util.inspect.custom')];
const inspectSymbol = inspectCustom && inspectCustom.every(s => isSymbol(s)) ? inspectCustom : null;

function inspect_(obj, options, depth, seen) {
  const opts = options || {};

  if(has(opts, 'quoteStyle') && opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double') {
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  }
  for(let optName of ['maxStringLength', 'maxArrayLength', 'breakLength']) {
    if(has(opts, optName) &&
      (typeof opts[optName] === 'number'
        ? opts[optName] < 0 && opts[optName] !== Infinity
        : opts[optName] !== null)
    ) {
      throw new TypeError(`option "${optName}", if provided, must be a positive integer, Infinity, or 'null'`
      );
    }
  }
  const customInspect = has(opts, 'customInspect') ? opts.customInspect : true;

  //console.reallog("customInspect:",customInspect);

  if(typeof customInspect !== 'boolean') {
    throw new TypeError('option "customInspect", if provided, must be `true` or `false`');
  }

  if(has(opts, 'indent') &&
    opts.indent !== null &&
    opts.indent !== '\t' &&
    !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
  ) {
    throw new TypeError('options "indent" must be "\\t", an integer > 0, or `null`');
  }
  //console.reallog('opts.colors', opts.colors);
  // console.reallog("obj:", obj, typeof obj);

  if(typeof obj === 'undefined') {
    let s = 'undefined';
    if(opts.colors) s = wrapColor(s, 1, 30);

    return s;
  }
  if(obj === null) {
    return 'null';
  }
  if(typeof obj === 'boolean') {
    let s = obj ? 'true' : 'false';
    if(opts.colors) s = wrapColor(s, 0, 33);
    return s;
  }

  if(typeof obj === 'string') {
    return inspectString(obj, opts);
  }
  if(typeof obj === 'number') {
    let s;
    if(obj === 0) s = Infinity / obj > 0 ? '0' : '-0';
    else s = String(obj);
    if(opts.colors) s = wrapColor(s, 0, 33);
    return s;
  }
  if(typeof obj === 'bigint') {
    return String(obj) + 'n';
  }

  const maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
  if(typeof depth === 'undefined') {
    depth = 0;
  }
  if(!Number.isFinite(depth)) {
    depth = Number.MAX_SAFE_INTEGER;
  }
  /* console.reallog("maxDepth:", maxDepth)
  console.reallog("opts.depth:", opts.depth)
  console.reallog("depth:", depth)*/
  if(depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
    return isArray(obj) ? '[Array]' : '[Object]';
  }

  const indent = getIndent(opts, depth);

  if(typeof seen === 'undefined') {
    seen = [];
  }
  if(indexOf(seen, obj) >= 0) {
    return '[Circular]';
  }

  function inspect(value, from, noIndent) {
    if(from) {
      seen = seen.slice();
      seen.push(from);
    }
    let newOpts = {
      ...opts,
      multiline: opts.multiline
        ? typeof opts.multiline == 'number'
          ? opts.multiline - 1
          : true
        : false
    };
    if(noIndent) {
      newOpts = {
        ...newOpts,
        depth: opts.depth
      };
      if(has(opts, 'quoteStyle')) {
        newOpts.quoteStyle = opts.quoteStyle;
      }
      return inspect_(value, newOpts, depth + 1, seen);
    }
    return inspect_(value, newOpts, depth + 1, seen);
  }

  let s = '';
  let inspectName;

  if(typeof obj === 'object' && customInspect && inspectCustom) {
    inspectName = inspectCustom.find(n => typeof obj[n] === 'function');

    if(inspectName) {
      let r = obj[inspectName]();
      /*  if(typeof r == 'string')*/ {
        s += r;
        return s;
      }

      obj = r;
      console.reallog('objectInspect', { obj });
    }
  }

  if(typeof obj === 'function') {
    const name = nameOf(obj);
    const keys = arrObjKeys(obj, inspect);
    s += '[Function' + (name ? ': ' + name : ' (anonymous)') + ']';

    if(opts.colors) s = wrapColor(s, 0, 36);
    if(keys.length > 0) s += ' { ' + keys.join(', ') + ' }';
  } else if(isSymbol(obj)) {
    const symString = symToString.call(obj);
    s += typeof obj === 'object' ? markBoxed(symString) : symString;
  } else if(isElement(obj)) {
    s += '<' + String(obj.nodeName).toLowerCase();
    const attrs = obj.attributes || [];
    for(let i = 0; i < attrs.length; i++) {
      s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
    }
    s += '>';
    if(obj.childNodes && obj.childNodes.length) {
      s += '...';
    }
    s += '</' + String(obj.nodeName).toLowerCase() + '>';
    return s;
  } else if(isArrayLike(obj)) {
    if(obj.length === 0) {
      s += '[]';
    } else {
      let xs = arrObjKeys(obj, inspect, opts);
      let multiline = indent && !singleLineValues(xs);
      //console.reallog('xs:', xs);
      if(Number.isFinite(opts.breakLength)) {
        if(xs.join(', ').length > opts.breakLength) {
          xs = xs.reduce((acc, item) => {
              // console.log("acc:",acc);
              let tail = acc[acc.length - 1];
              let len = stripAnsi(tail).length;

              if(len && len + stripAnsi(item).length > opts.breakLength) {
                acc.push('');
              }

              if(acc[acc.length - 1] != '') acc[acc.length - 1] += ', ';

              acc[acc.length - 1] += item;
              return acc;
            }, ['']
          );
          multiline = true;
        }
      }

      if(multiline) s += '[' + indentedJoin(xs, indent) + ']';
      else s += '[ ' + xs.join(', ') + ' ]';
    }
  } else if(isError(obj)) {
    const parts = arrObjKeys(obj, inspect);
    if(parts.length === 0) s += '[' + String(obj) + ']';
    else s += '{ [' + String(obj) + '] ' + parts.join(', ') + ' }';
  } else if(isMap(obj)) {
    let mapKeys = [],
      mapParts = [];
    mapForEach.call(obj, function(value, key) {
      mapKeys.push(inspect(key, obj, true));
    });
    let i = 0;
    if(opts.alignMap) {
      let maxKeyLen = mapKeys.reduce((a, k) => (k.length > a ? k.length : a), 0);
      mapKeys = mapKeys.map(key => key.padEnd(maxKeyLen));
    }

    mapForEach.call(obj, function(value, key) {
      mapParts.push(mapKeys[i++] + ' => ' + inspect(value, obj));
    });
    s += collectionOf('Map', mapSize.call(obj), mapParts, indent);
  } else if(isSet(obj)) {
    const setParts = [];
    setForEach.call(obj, function(value) {
      setParts.push(inspect(value, obj));
    });
    s += collectionOf('Set', setSize.call(obj), setParts, indent);
  } else if(isWeakMap(obj)) {
    s += weakCollectionOf('WeakMap');
  } else if(isWeakSet(obj)) {
    s += weakCollectionOf('WeakSet');
  } else if(isNumber(obj)) {
    s += markBoxed(inspect(Number(obj)));
  } else if(isBigInt(obj)) {
    s += markBoxed(inspect(bigIntValueOf.call(obj)));
  } else if(isBoolean(obj)) {
    s += markBoxed(booleanValueOf.call(obj));
  } else if(isString(obj)) {
    s += markBoxed(inspect(String(obj)));
  } else if(isGenerator(obj)) {
    s += `[object Generator]`;
  } else if(!isDate(obj) && !isRegExp(obj) && !isPromise(obj)) {
    const proto = Object.getPrototypeOf(obj);

    if(proto !== Object.prototype) {
      const className = proto === null ? `[Object: null prototype]` : nameOf(proto.constructor);
      if(className) s += className + ' ';
    }
    s += '{';
    const ys = arrObjKeys(obj, inspect, { ...opts });
    if(ys.length == 0) {
    } else if(indent && opts.multiline) {
      s += indentedJoin(ys, indent, opts);
    } else {
      s += ' ' + ys.join(', ') + ' ';
    }
    s += '}';
  } else {
    s += String(obj);
  }
  return s;
}

function wrapQuotes(s, defaultStyle, opts) {
  const quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
  return quoteChar + s + quoteChar;
}

function wrapColor(s, ...args) {
  s = `\x1b[${args.join(';')}m` + s + `\x1b[0m`;
  return s;
}

function quote(s) {
  return String(s).replace(/"/g, '&quot;');
}

function isArrayLike(obj) {
  return typeof obj == 'object' && obj != null && 'length' in obj;
}

function isArray(obj) {
  return toStr(obj) === '[object Array]';
}

function isPromise(obj) {
  return toStr(obj) === '[object Promise]';
}

function isDate(obj) {
  return toStr(obj) === '[object Date]';
}

function isRegExp(obj) {
  return toStr(obj) === '[object RegExp]';
}

function isError(obj) {
  return toStr(obj) === '[object Error]';
}

function isSymbol(obj) {
  return toStr(obj) === '[object Symbol]';
}

function isString(obj) {
  return toStr(obj) === '[object String]';
}

function isNumber(obj) {
  return toStr(obj) === '[object Number]';
}

function isBigInt(obj) {
  return toStr(obj) === '[object BigInt]';
}

function isBoolean(obj) {
  return toStr(obj) === '[object Boolean]';
}

function isGenerator(obj) {
  if(toStr(obj) === '[object Generator]') return true;

  if(typeof obj == 'object' && obj != null && typeof obj.next == 'function') return true;
}

const hasOwn =
  Object.prototype.hasOwnProperty ||
  function(key) {
    return key in this;
  };
function has(obj, key) {
  return obj[key] !== undefined || hasOwn.call(obj, key);
}

function toStr(obj) {
  return objectToString.call(obj);
}

function nameOf(f) {
  if(typeof f == 'function' && f.name) {
    return f.name;
  }
  const m = match.call(f + '' /*functionToString.call(f)*/, /^function\s*([\w$]+)/);
  if(m) {
    return m[1];
  }
  return null;
}

function indexOf(xs, x) {
  if(xs.indexOf) {
    return xs.indexOf(x);
  }
  for(let i = 0, l = xs.length; i < l; i++) {
    if(xs[i] === x) {
      return i;
    }
  }
  return -1;
}

function isMap(x) {
  if(!mapSize || !x || typeof x !== 'object') {
    return false;
  }
  try {
    mapSize.call(x);
    try {
      setSize.call(x);
    } catch(s) {
      return true;
    }
    return x instanceof Map; // core-js workaround, pre-v2.5.0
  } catch(e) {}
  return false;
}

function isWeakMap(x) {
  if(!weakMapHas || !x || typeof x !== 'object') {
    return false;
  }
  try {
    weakMapHas.call(x, weakMapHas);
    try {
      weakSetHas.call(x, weakSetHas);
    } catch(s) {
      return true;
    }
    return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
  } catch(e) {}
  return false;
}

function isSet(x) {
  if(!setSize || !x || typeof x !== 'object') {
    return false;
  }
  try {
    setSize.call(x);
    try {
      mapSize.call(x);
    } catch(m) {
      return true;
    }
    return x instanceof Set; // core-js workaround, pre-v2.5.0
  } catch(e) {}
  return false;
}

function isWeakSet(x) {
  if(!weakSetHas || !x || typeof x !== 'object') {
    return false;
  }
  try {
    weakSetHas.call(x, weakSetHas);
    try {
      weakMapHas.call(x, weakMapHas);
    } catch(s) {
      return true;
    }
    return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
  } catch(e) {}
  return false;
}

function isElement(x) {
  if(!x || typeof x !== 'object') {
    return false;
  }
  if(typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
    return true;
  }
  return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
  if(str.length > opts.maxStringLength) {
    const remaining = str.length - opts.maxStringLength;
    const trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
    return inspectString(str.slice(0, opts.maxStringLength), opts) + trailer;
  }
  //  let s = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte);
  let s = str
    .replace('\\', '\\\\')
    .replace("'", "\\'")
    .replace(/[\x00-\x1f]/g, lowbyte);
  s = wrapQuotes(s, 'single', opts);
  if(opts.colors) s = wrapColor(s, 1, 32);
  return s;
}

function lowbyte(c) {
  const n = c.charCodeAt(0);
  const x = {
    8: 'b',
    9: 't',
    10: 'n',
    12: 'f',
    13: 'r'
  }[n];
  if(x) {
    return '\\' + x;
  }
  return '\\x' + (n < 0x10 ? '0' : '') + n.toString(16).toUpperCase();
}

function markBoxed(str) {
  return 'Object(' + str + ')';
}

function weakCollectionOf(type) {
  const c = opts.colors ? wrapColor : s => s;
  return type + ' { ' + c('<items unknown>', 0, 36) + ' }';
}

function collectionOf(type, size, entries, indent) {
  const joinedEntries = indent ? indentedJoin(entries, indent) : entries.join(', ');
  return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
  for(let i = 0; i < xs.length; i++) {
    if(indexOf(xs[i], '\n') >= 0) {
      return false;
    }
  }
  return true;
}

function getIndent(opts, depth) {
  let baseIndent;
  if(opts.indent === '\t') {
    baseIndent = '\t';
  } else if(typeof opts.indent === 'number' && opts.indent > 0) {
    baseIndent = Array(opts.indent + 1).join(' ');
  } else {
    return null;
  }
  return {
    base: baseIndent,
    prev: Array(depth + 1).join(baseIndent)
  };
}

function indentedJoin(xs, indent, opts = {}) {
  if(xs.length === 0) {
    return '';
  }
  if(!(typeof indent == 'object' && indent != null)) indent = { prev: '', base: '' };
  const c = opts.colors ? wrapColor : s => s;

  const lineJoiner = '\n' + indent.prev + indent.base;
  return lineJoiner + xs.join(c(',', 1, 36) + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect, opts = {}) {
  const isArr = isArray(obj) || isArrayLike(obj);
  if(isArr && typeof opts == 'object' && opts != null && obj.length > opts.maxArrayLength) {
    const remaining = obj.length - opts.maxArrayLength;
    const trailer = '... ' + remaining + ' more items' + (remaining > 1 ? 's' : '');
    return arrObjKeys(obj.slice(0, opts.maxArrayLength), inspect, opts) + trailer;
  }
  let xs = [];

  if(isArr) {
    xs = new Array(obj.length);

    //xs.length = obj.length;
    for(let i = 0; i < obj.length; i++) xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
  }
  let c = opts.colors ? wrapColor : s => s;

  for(let key in obj) {
    if(!has(obj, key)) continue;

    if(isArr && String(Number(key)) === key && key < obj.length) continue;

    let s = '';

    if(isGetter(obj, key)) {
      s = '[Getter]';
      if(opts.colors) s = c(s, 0, 36) + ' ';
    }
    s += inspect(obj[key], obj);
    if(/[^\w$]/.test(key)) {
      xs.push(inspect(key, obj) + c(': ', 1, 36) + s);
    } else {
      xs.push(key + ': ' + s);
    }
  }
  if(typeof gOPS === 'function') {
    const syms = gOPS(obj);
    for(let j = 0; j < syms.length; j++) {
      if(isEnumerable.call(obj, syms[j])) {
        xs.push(c('[', 1, 36) + inspect(syms[j]) + c(']: ', 1, 36) + inspect(obj[syms[j]], obj));
      }
    }
  }
  return xs;
}

function isGetter(obj, propName) {
  while(obj) {
    const desc = Object.getOwnPropertyDescriptor(obj, propName);
    if(desc && 'get' in desc) return true;
    obj = Object.getPrototypeOf(obj);
  }
  return false;
}
function stripAnsi(str) {
  return (str + '').replace(new RegExp('\x1b[[(?);]{0,2}(;?[0-9])*.', 'g'), '');
}

export default inspect_;
