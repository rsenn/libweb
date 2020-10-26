const hasMap = typeof Map === 'function' && Map.prototype;
const mapSizeDescriptor =
  Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
const mapSize =
  hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
const mapForEach = hasMap && Map.prototype.forEach;
const hasSet = typeof Set === 'function' && Set.prototype;
const setSizeDescriptor =
  Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
const setSize =
  hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
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

//const inspectCustom = require('./util.inspect').custom;
const inspectSymbol = /* inspectCustom && isSymbol(inspectCustom) ? inspectCustom :*/ null;

function inspect_(obj, options, depth, seen) {
  var opts = options || {};

  if(has(opts, 'quoteStyle') && opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double') {
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  }
  if(has(opts, 'maxStringLength') &&
    (typeof opts.maxStringLength === 'number'
      ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity
      : opts.maxStringLength !== null)
  ) {
    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
  }
  var customInspect = has(opts, 'customInspect') ? opts.customInspect : true;
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

  var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
  if(typeof depth === 'undefined') {
    depth = 0;
  }
  /* console.reallog("maxDepth:", maxDepth)
  console.reallog("opts.depth:", opts.depth)
  console.reallog("depth:", depth)*/
  if(depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
    return isArray(obj) ? '[Array]' : '[Object]';
  }

  var indent = getIndent(opts, depth);

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
    if(noIndent) {
      var newOpts = {
        ...opts,
        depth: opts.depth
      };
      if(has(opts, 'quoteStyle')) {
        newOpts.quoteStyle = opts.quoteStyle;
      }
      return inspect_(value, newOpts, depth + 1, seen);
    }
    return inspect_(value, opts, depth + 1, seen);
  }
  // console.reallog("obj:", obj);

  if(typeof obj === 'function') {
    var name = nameOf(obj);
    var keys = arrObjKeys(obj, inspect);
    let s =
      '[Function' +
      (name ? ': ' + name : ' (anonymous)') +
      ']' +
      (keys.length > 0 ? ' { ' + keys.join(', ') + ' }' : '');
    if(opts.colors) s = wrapColor(s, 0, 36);

    return s;
  }
  if(isSymbol(obj)) {
    var symString = symToString.call(obj);
    return typeof obj === 'object' ? markBoxed(symString) : symString;
  }
  if(isElement(obj)) {
    var s = '<' + String(obj.nodeName).toLowerCase();
    var attrs = obj.attributes || [];
    for(var i = 0; i < attrs.length; i++) {
      s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
    }
    s += '>';
    if(obj.childNodes && obj.childNodes.length) {
      s += '...';
    }
    s += '</' + String(obj.nodeName).toLowerCase() + '>';
    return s;
  }
  if(isArray(obj)) {
    if(obj.length === 0) {
      return '[]';
    }
    var xs = arrObjKeys(obj, inspect);
    if(indent && !singleLineValues(xs)) {
      return '[' + indentedJoin(xs, indent) + ']';
    }
    return '[ ' + xs.join(', ') + ' ]';
  }
  if(isError(obj)) {
    var parts = arrObjKeys(obj, inspect);
    if(parts.length === 0) {
      return '[' + String(obj) + ']';
    }
    return '{ [' + String(obj) + '] ' + parts.join(', ') + ' }';
  }
  if(typeof obj === 'object' && customInspect) {
    if(inspectSymbol && typeof obj[inspectSymbol] === 'function') {
      return obj[inspectSymbol]();
    }
    if(typeof obj.inspect === 'function') {
      return obj.inspect();
    }
  }
  if(isMap(obj)) {
    var mapParts = [];
    mapForEach.call(obj, function(value, key) {
      mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
    });
    return collectionOf('Map', mapSize.call(obj), mapParts, indent);
  }
  if(isSet(obj)) {
    var setParts = [];
    setForEach.call(obj, function(value) {
      setParts.push(inspect(value, obj));
    });
    return collectionOf('Set', setSize.call(obj), setParts, indent);
  }
  if(isWeakMap(obj)) {
    return weakCollectionOf('WeakMap');
  }
  if(isWeakSet(obj)) {
    return weakCollectionOf('WeakSet');
  }
  if(isNumber(obj)) {
    return markBoxed(inspect(Number(obj)));
  }
  if(isBigInt(obj)) {
    return markBoxed(inspect(bigIntValueOf.call(obj)));
  }
  if(isBoolean(obj)) {
    return markBoxed(booleanValueOf.call(obj));
  }
  if(isString(obj)) {
    return markBoxed(inspect(String(obj)));
  }
  if(!isDate(obj) && !isRegExp(obj)) {
    var ys = arrObjKeys(obj, inspect, opts);
    if(ys.length === 0) {
      return '{}';
    }
    if(indent) {
      return '{' + indentedJoin(ys, indent) + '}';
    }
    return '{ ' + ys.join(', ') + ' }';
  }
  return String(obj);
}

function wrapQuotes(s, defaultStyle, opts) {
  var quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
  return quoteChar + s + quoteChar;
}
function wrapColor(s, ...args) {
  s = `\x1b[${args.join(';')}m` + s + `\x1b[0m`;
  return s;
}

function quote(s) {
  return String(s).replace(/"/g, '&quot;');
}

function isArray(obj) {
  return toStr(obj) === '[object Array]';
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

var hasOwn =
  Object.prototype.hasOwnProperty ||
  function(key) {
    return key in this;
  };
function has(obj, key) {
  return hasOwn.call(obj, key);
}

function toStr(obj) {
  return objectToString.call(obj);
}

function nameOf(f) {
  if(f.name) {
    return f.name;
  }
  var m = match.call(functionToString.call(f), /^function\s*([\w$]+)/);
  if(m) {
    return m[1];
  }
  return null;
}

function indexOf(xs, x) {
  if(xs.indexOf) {
    return xs.indexOf(x);
  }
  for(var i = 0, l = xs.length; i < l; i++) {
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
    var remaining = str.length - opts.maxStringLength;
    var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
    return inspectString(str.slice(0, opts.maxStringLength), opts) + trailer;
  }
  var s = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte);
  s = wrapQuotes(s, 'single', opts);
  if(opts.colors) s = wrapColor(s, 1, 32);
  return s;
}

function lowbyte(c) {
  var n = c.charCodeAt(0);
  var x = {
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
  return type + ' { ? }';
}

function collectionOf(type, size, entries, indent) {
  var joinedEntries = indent ? indentedJoin(entries, indent) : entries.join(', ');
  return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
  for(var i = 0; i < xs.length; i++) {
    if(indexOf(xs[i], '\n') >= 0) {
      return false;
    }
  }
  return true;
}

function getIndent(opts, depth) {
  var baseIndent;
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

function indentedJoin(xs, indent) {
  if(xs.length === 0) {
    return '';
  }
  var lineJoiner = '\n' + indent.prev + indent.base;
  return lineJoiner + xs.join(',' + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect, opts) {
  var isArr = isArray(obj);
  var xs = [];
  if(isArr) {
    xs.length = obj.length;
    for(var i = 0; i < obj.length; i++) {
      xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
    }
  }
  for(var key in obj) {
    if(!has(obj, key)) {
      continue;
    }
    if(isArr && String(Number(key)) === key && key < obj.length) {
      continue;
    }
    let s = '';
    if(isGetter(obj, key)) {
      s = '[Getter]';
      if(opts.colors) s = wrapColor(s, 0, 36) + ' ';
    }
    s += inspect(obj[key], obj);
    if(/[^\w$]/.test(key)) {
      xs.push(inspect(key, obj) + ': ' + s);
    } else {
      xs.push(key + ': ' + s);
    }
  }
  if(typeof gOPS === 'function') {
    var syms = gOPS(obj);
    for(var j = 0; j < syms.length; j++) {
      if(isEnumerable.call(obj, syms[j])) {
        xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
      }
    }
  }
  return xs;
}
function isGetter(obj, propName) {
  while(obj) {
    let desc = Object.getOwnPropertyDescriptor(obj, propName);
    if(desc && 'get' in desc) return true;
    obj = Object.getPrototypeOf(obj);
  }
  return false;
}
export default inspect_;
