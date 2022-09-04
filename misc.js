import Util from './util.js';
//export { types } from  '../quickjs/qjs-modules/lib/util.js';

const slice = (x, s, e) => (typeof x == 'object' ? (isArrayBuffer(x) ? dupArrayBuffer(x, s, e) : Array.isArray(x) ? Array.prototype.slice.call(x, s, e) : x.slice(s, e)) : String.prototype.slice.call(x, s, e));
const stringify = v => `${v}`;
const protoOf = Object.getPrototypeOf;
const formatNumber = n => (n === -0 ? '-0' : `${n}`);
const isNative = fn => /\[native\scode\]/.test(stringify(fn));

/*export default*/ function util() {
  return util;
}

util.prototype.constructor = util;

const AsyncFunction = async function x() {}.constructor;
const GeneratorFunction = function* () {}.constructor;
const AsyncGeneratorFunction = async function* () {}.constructor;
const TypedArray = protoOf(protoOf(new Uint16Array(10))).constructor;

const SetIteratorPrototype = protoOf(new Set().values());
const MapIteratorPrototype = protoOf(new Map().entries());
//const GeneratorPrototype = protoOf((function* () {})());

// prettier-ignore
export const errors = [null, 'EPERM', 'ENOENT', 'ESRCH', 'EINTR', 'EIO', 'ENXIO', 'E2BIG', 'ENOEXEC', 'EBADF', 'ECHILD', 'EAGAIN', 'ENOMEM', 'EACCES', 'EFAULT', 'ENOTBLK', 'EBUSY', 'EEXIST', 'EXDEV', 'ENODEV', 'ENOTDIR', 'EISDIR', 'EINVAL', 'ENFILE', 'EMFILE', 'ENOTTY', 'ETXTBSY', 'EFBIG', 'ENOSPC', 'ESPIPE', 'EROFS', 'EMLINK', 'EPIPE', 'EDOM', 'ERANGE', 'EDEADLK', 'ENAMETOOLONG', 'ENOLCK', 'ENOSYS', 'ENOTEMPTY', null, null, 'ENOMSG', 'EIDRM', 'ECHRNG', 'EL2NSYNC', 'EL3HLT', 'EL3RST', 'ELNRNG', 'EUNATCH', 'ENOCSI', 'EL2HLT', 'EBADE', 'EBADR', 'EXFULL', 'ENOANO', 'EBADRQC', null, '', 'EBFONT', 'ENOSTR', 'ENODATA', 'ETIME', 'ENOSR', 'ENONET', 'ENOPKG', 'EREMOTE', 'ENOLINK', 'EADV', 'ESRMNT', 'ECOMM', 'EPROTO', 'EMULTIHOP', 'EDOTDOT', 'EBADMSG', 'EOVERFLOW', 'ENOTUNIQ', 'EBADFD', 'EREMCHG', 'ELIBACC', 'ELIBBAD', 'ELIBSCN', 'ELIBMAX', 'ELIBEXEC', 'EILSEQ', 'ERESTART', 'ESTRPIPE', 'EUSERS', 'ENOTSOCK', 'EDESTADDRREQ', 'EMSGSIZE', 'EPROTOTYPE', 'ENOPROTOOPT', 'EPROTONOSUPPORT', 'ESOCKTNOSUPPORT', 'EOPNOTSUPP', 'EPFNOSUPPORT', 'EAFNOSUPPORT', 'EADDRINUSE', 'EADDRNOTAVAIL', 'ENETDOWN', 'ENETUNREACH', 'ENETRESET', 'ECONNABORTED', 'ECONNRESET', 'ENOBUFS', 'EISCONN', 'ENOTCONN', 'ESHUTDOWN', 'ETOOMANYREFS', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTDOWN', 'EHOSTUNREACH', 'EALREADY', 'EINPROGRESS', 'ESTALE', 'EUCLEAN', 'ENOTNAM', 'ENAVAIL', 'EISNAM', 'EREMOTEIO', 'EDQUOT', 'ENOMEDIUM', 'EMEDIUMTYPE', 'ECANCELED', 'ENOKEY', 'EKEYEXPIRED', 'EKEYREVOKED', 'EKEYREJECTED', 'EOWNERDEAD', 'ENOTRECOVERABLE', 'ERFKILL'];

export const types = {
  isAnyArrayBuffer(v) {
    return isObject(v) && (v instanceof ArrayBuffer || v instanceof SharedArrayBuffer);
  },
  isArrayBuffer(v) {
    return isObject(v) && v instanceof ArrayBuffer;
  },
  isBigInt64Array(v) {
    return isObject(v) && v instanceof BigInt64Array;
  },
  isBigUint64Array(v) {
    return isObject(v) && v instanceof BigUint64Array;
  },
  isDate(v) {
    return isObject(v) && v instanceof Date;
  },
  isFloat32Array(v) {
    return isObject(v) && v instanceof Float32Array;
  },
  isFloat64Array(v) {
    return isObject(v) && v instanceof Float64Array;
  },
  isInt8Array(v) {
    return isObject(v) && v instanceof Int8Array;
  },
  isInt16Array(v) {
    return isObject(v) && v instanceof Int16Array;
  },
  isInt32Array(v) {
    return isObject(v) && v instanceof Int32Array;
  },
  isMap(v) {
    return isObject(v) && v instanceof Map;
  },
  isPromise(v) {
    return isObject(v) && v instanceof Promise;
  },
  isProxy(v) {
    return isObject(v) && v instanceof Proxy;
  },
  isRegExp(v) {
    return isObject(v) && v instanceof RegExp;
  },
  isSet(v) {
    return isObject(v) && v instanceof Set;
  },
  isSharedArrayBuffer(v) {
    return isObject(v) && v instanceof SharedArrayBuffer;
  },
  isUint8Array(v) {
    return isObject(v) && v instanceof Uint8Array;
  },
  isUint8ClampedArray(v) {
    return isObject(v) && v instanceof Uint8ClampedArray;
  },
  isUint16Array(v) {
    return isObject(v) && v instanceof Uint16Array;
  },
  isUint32Array(v) {
    return isObject(v) && v instanceof Uint32Array;
  },
  isWeakMap(v) {
    return isObject(v) && v instanceof WeakMap;
  },
  isWeakSet(v) {
    return isObject(v) && v instanceof WeakSet;
  },
  isDataView(v) {
    return isObject(v) && v instanceof DataView;
  },
  isBooleanObject(v) {
    return isObject(v) && v instanceof Boolean;
  },
  isAsyncFunction(v) {
    return isObject(v) && v instanceof AsyncFunction;
  },
  isGeneratorFunction(v) {
    return isObject(v) && v instanceof GeneratorFunction;
  },
  isAsyncGeneratorFunction(v) {
    return isObject(v) && v instanceof AsyncGeneratorFunction;
  },
  isNumberObject(v) {
    return isObject(v) && v instanceof Number;
  },
  isBigIntObject(v) {
    return isObject(v) && v instanceof BigInt;
  },
  isSymbolObject(v) {
    return v && v instanceof Symbol;
  },
  isNativeError(v) {
    return isObject(v) && v instanceof Error && isNative(v.constructor);
  },
  isMapIterator(v) {
    return isObject(v) && protoOf(v) == MapIteratorPrototype;
  },
  isSetIterator(v) {
    return isObject(v) && protoOf(v) == SetIteratorPrototype;
  },
  isStringObject(v) {
    return isObject(v) && v instanceof String;
  },
  isArrayBufferView(v) {
    return isObject(v) && ArrayBuffer.isView(v);
  },
  isArgumentsObject(v) {
    return Object.prototype.toString.call(v) == '[object Arguments]';
  },

  /* isExternal(v) {
    return isObject(v) && v instanceof External;
  },*/

  isBoxedPrimitive(v) {
    return isObject(v) && [Number, String, Boolean, BigInt, Symbol].some(ctor => v instanceof ctor);
  },

  isGeneratorObject(v) {
    return isObject(v) && protoOf(v) == GeneratorPrototype;
  },
  isTypedArray(v) {
    return isObject(v) && v instanceof TypedArray;
  },
  isModuleNamespaceObject(v) {
    return isObject(v) && v[Symbol.toStringTag] == 'Module';
  }
};

export function isObject(arg) {
  return typeof arg == 'object' && arg !== null;
}

const UTF8FirstCodeMask = [0x1f, 0xf, 0x7, 0x3, 0x1];
const UTF8MinCode = [0x80, 0x800, 0x10000, 0x00200000, 0x04000000];

/* prettier-ignore */ const errorSymbols = [ 0, 'EPERM', 'ENOENT', 'ESRCH', 'EINTR', 'EIO', 'ENXIO', 'E2BIG', 'ENOEXEC', 'EBADF', 'ECHILD', 'EAGAIN', 'ENOMEM', 'EACCES', 'EFAULT', 'ENOTBLK', 'EBUSY', 'EEXIST', 'EXDEV', 'ENODEV', 'ENOTDIR', 'EISDIR', 'EINVAL', 'ENFILE', 'EMFILE', 'ENOTTY', 'ETXTBSY', 'EFBIG', 'ENOSPC', 'ESPIPE', 'EROFS', 'EMLINK', 'EPIPE', 'EDOM', 'ERANGE', 'EDEADLK', 'ENAMETOOLONG', 'ENOLCK', 'ENOSYS', 'ENOTEMPTY', 0, 0, 'ENOMSG', 'EIDRM', 'ECHRNG', 'EL2NSYNC', 'EL3HLT', 'EL3RST', 'ELNRNG', 'EUNATCH', 'ENOCSI', 'EL2HLT', 'EBADE', 'EBADR', 'EXFULL', 'ENOANO', 'EBADRQC', 0, 0, 'EBFONT', 'ENOSTR', 'ENODATA', 'ETIME', 'ENOSR', 'ENONET', 'ENOPKG', 'EREMOTE', 'ENOLINK', 'EADV', 'ESRMNT', 'ECOMM', 'EPROTO', 'EMULTIHOP', 'EDOTDOT', 'EBADMSG', 'EOVERFLOW', 'ENOTUNIQ', 'EBADFD', 'EREMCHG', 'ELIBACC', 'ELIBBAD', 'ELIBSCN', 'ELIBMAX', 'ELIBEXEC', 'EILSEQ', 'ERESTART', 'ESTRPIPE', 'EUSERS', 'ENOTSOCK', 'EDESTADDRREQ', 'EMSGSIZE', 'EPROTOTYPE', 'ENOPROTOOPT', 'EPROTONOSUPPORT', 'ESOCKTNOSUPPORT', 'EOPNOTSUPP', 'EPFNOSUPPORT', 'EAFNOSUPPORT', 'EADDRINUSE', 'EADDRNOTAVAIL', 'ENETDOWN', 'ENETUNREACH', 'ENETRESET', 'ECONNABORTED', 'ECONNRESET', 'ENOBUFS', 'EISCONN', 'ENOTCONN', 'ESHUTDOWN', 'ETOOMANYREFS', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTDOWN', 'EHOSTUNREACH', 'EALREADY', 'EINPROGRESS', 'ESTALE', 'EUCLEAN', 'ENOTNAM', 'ENAVAIL', 'EISNAM', 'EREMOTEIO', 'EDQUOT', 'ENOMEDIUM', 'EMEDIUMTYPE', 'ECANCELED', 'ENOKEY', 'EKEYEXPIRED', 'EKEYREVOKED', 'EKEYREJECTED', 'EOWNERDEAD', 'ENOTRECOVERABLE', 'ERFKILL' ];

export function SyscallError(syscall, errnum) {
  let obj = new.target ? this : new SyscallError();
  if(syscall) obj.syscall = syscall;
  if(errnum != undefined) {
    if(typeof errnum == 'number') {
      obj.errno = errnum;
      obj.code = errorSymbols[errnum];
    } else {
      obj.errno = errorSymbols.indexOf(errnum);
      obj.code = errnum;
    }
  }
  Error.call(obj, `SyscallError: '${obj.syscall}' errno = ${obj.code} (${obj.errno})`);
  return obj;
}

SyscallError.prototype = new Error();

define(SyscallError.prototype, {
  get message() {
    return `SyscallError: '${this.syscall}' errno = ${this.code} (${this.errno})`;
  },
  [Symbol.toStringTag]: 'SyscallError'
});

globalThis.SyscallError = SyscallError;
export function extendArray(proto = Array.prototype) {
  define(proto, {
    get last() {
      return this[this.length - 1];
    },
    at(index) {
      const { length } = this;
      return this[((index % length) + length) % length];
    },
    clear() {
      this.splice(0, this.length);
    },
    findLastIndex(predicate) {
      for(let i = this.length - 1; i >= 0; --i) {
        const x = this[i];
        if(predicate(x, i, this)) return i;
      }
      return -1;
    },
    findLast(predicate) {
      let i;
      if((i = this.findLastIndex(predicate)) == -1) return null;
      return this[i];
    },
    unique() {
      return [...new Set(this)];
    },
    pushUnique(...args) {
      for(let arg of args) if(this.indexOf(arg) === -1) this.push(arg);
    }
  });
}

export function toString(arrayBuf, encoding = 'utf-8') {
  if(globalThis.TextDecoder) {
    let dec = new TextDecoder(encoding);
    return dec.decode(arrayBuf);
  }

  if(encoding == 'latin1') {
    let binary = '';
    let bytes = new Uint8Array(arrayBuf);
    let len = bytes.byteLength;
    for(let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return binary;
  }

  let a = new Uint8Array(arrayBuf);
  let p = 0;
  let o = '';
  let len = a.length;
  for(p = 0; p < len; ) {
    let max_len = len - p;
    let l, c, b, i;

    c = a[p++];
    if(c < 0x80) {
      o += String.fromCodePoint(c);
      continue;
    }

    switch (c) {
      case 0xc0:
      case 0xc1:
      case 0xc2:
      case 0xc3:
      case 0xc4:
      case 0xc5:
      case 0xc6:
      case 0xc7:
      case 0xc8:
      case 0xc9:
      case 0xca:
      case 0xcb:
      case 0xcc:
      case 0xcd:
      case 0xce:
      case 0xcf:
      case 0xd0:
      case 0xd1:
      case 0xd2:
      case 0xd3:
      case 0xd4:
      case 0xd5:
      case 0xd6:
      case 0xd7:
      case 0xd8:
      case 0xd9:
      case 0xda:
      case 0xdb:
      case 0xdc:
      case 0xdd:
      case 0xde:
      case 0xdf:
        l = 1;
        break;
      case 0xe0:
      case 0xe1:
      case 0xe2:
      case 0xe3:
      case 0xe4:
      case 0xe5:
      case 0xe6:
      case 0xe7:
      case 0xe8:
      case 0xe9:
      case 0xea:
      case 0xeb:
      case 0xec:
      case 0xed:
      case 0xee:
      case 0xef:
        l = 2;
        break;
      case 0xf0:
      case 0xf1:
      case 0xf2:
      case 0xf3:
      case 0xf4:
      case 0xf5:
      case 0xf6:
      case 0xf7:
        l = 3;
        break;
      case 0xf8:
      case 0xf9:
      case 0xfa:
      case 0xfb:
        l = 4;
        break;
      case 0xfc:
      case 0xfd:
        l = 5;
        break;
      default:
        return null;
    }
    /* check that we have enough characters */
    if(l > max_len - 1) return -1;

    c &= UTF8FirstCodeMask[l - 1];
    for(i = 0; i < l; i++) {
      b = a[p++];
      if(b < 0x80 || b >= 0xc0) return -1;

      c = (c << 6) | (b & 0x3f);
    }
    if(c < UTF8MinCode[l - 1]) return -1;
    o += String.fromCodePoint(c);
  }
  return o;
}

const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64chs = [...b64ch];
const b64tab = (a => {
  let tab = {};
  a.forEach((c, i) => (tab[c] = i));
  return tab;
})(b64chs);
const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

export function btoa(bin) {
  let u32,
    c0,
    c1,
    c2,
    asc = '';
  const pad = bin.length % 3;
  for(let i = 0; i < bin.length; i += 0) {
    if((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255) throw new TypeError('invalid character found');
    u32 = (c0 << 16) | (c1 << 8) | c2;
    asc += b64chs[(u32 >> 18) & 63] + b64chs[(u32 >> 12) & 63] + b64chs[(u32 >> 6) & 63] + b64chs[u32 & 63];
  }
  return pad ? asc.slice(0, pad - 3) + '==='.substring(pad) : asc;
}

export function atob(asc) {
  asc = asc.replace(/\s+/g, '');
  if(!b64re.test(asc)) throw new TypeError('malformed base64.');
  asc += '=='.slice(2 - (asc.length & 3));
  let u24,
    bin = '',
    r1,
    r2;
  for(let i = 0; i < asc.length; i += 0) {
    u24 = (b64tab[asc.charAt(i++)] << 18) | (b64tab[asc.charAt(i++)] << 12) | ((r1 = b64tab[asc.charAt(i++)]) << 6) | (r2 = b64tab[asc.charAt(i++)]);
    bin += r1 === 64 ? String.fromCharCode((u24 >> 16) & 255) : r2 === 64 ? String.fromCharCode((u24 >> 16) & 255, (u24 >> 8) & 255) : String.fromCharCode((u24 >> 16) & 255, (u24 >> 8) & 255, u24 & 255);
  }
  return bin;
}
export function assert(actual, expected, message) {
  if(arguments.length == 1) expected = true;

  if(actual === expected) return;

  if(actual !== null && expected !== null && typeof actual == 'object' && typeof expected == 'object' && actual.toString() === expected.toString()) return;

  throw Error('assertion failed: got |' + actual + '|' + ', expected |' + expected + '|' + (message ? ' (' + message + ')' : ''));
}

export function escape(str, chars = []) {
  const table = {
    ['\n']: 'n',
    ['\r']: 'r',
    ['\t']: 't',
    ['\v']: 'v',
    ['\b']: 'b'
  };
  for(let ch of chars) table[ch] = ch;
  let s = '';
  for(let ch of str) {
    if(table[ch]) s += '\\' + (table[ch] ?? ch);
    else s += ch;
  }
  return s;
}

export function quote(str, q = '"') {
  return q + escape(str, [q]) + q;
}

export function memoize(fn) {
  let cache = {};
  return (n, ...rest) => {
    if(n in cache) return cache[n];
    return (cache[n] = fn(n, ...rest));
  };
}

export function once(fn, thisArg, memoFn) {
  let ret,
    ran = false;

  return function(...args) {
    if(!ran) {
      ran = true;
      ret = fn.apply(thisArg || this, args);
    } else if(typeof memoFn == 'function') {
      ret = memoFn(ret);
    }
    return ret;
  };
}

const atexit_functions = [];
const atexit_install = once(callback => {
  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  callback = callback || noOp;
  process.on('cleanup', callback);

  // do app specific cleaning before exiting
  process.on('exit', function() {
    process.emit('cleanup');
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', function() {
    console.log('Ctrl-C...');
    process.exit(2);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function(e) {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
  });
});

export function atexit(fn) {
  atexit_functions.push(fn);

  if(globalThis.process && 'on' in process) {
    atexit_install(() => {
      for(let fn of atexit_functions) fn();
    });
  }
}

export function waitFor(ms) {
  return new Promise(resolve => os.setTimeout(resolve, ms));
}

export function define(obj, ...args) {
  for(let props of args) {
    let desc = Object.getOwnPropertyDescriptors(props);
    for(let prop in desc) {
      const { value } = desc[prop];
      desc[prop].enumerable = false;
      if(typeof value == 'function') desc[prop].writable = false;
    }
    Object.defineProperties(obj, desc);
  }
  return obj;
}

export function weakAssign(obj, ...args) {
  let desc = {};
  for(let other of args) {
    let otherDesc = Object.getOwnPropertyDescriptors(other);
    for(let key in otherDesc) if(!(key in obj) && desc[key] === undefined && otherDesc[key] !== undefined) desc[key] = otherDesc[key];
  }
  return Object.defineProperties(obj, desc);
}

export function getConstructorChain(obj) {
  let ret = [];
  let chain = getPrototypeChain(obj);
  if(obj.constructor && obj.constructor != chain[0].constructor) chain.unshift(obj);
  for(let proto of chain) ret.push(proto.constructor);
  return ret;
}

export function hasPrototype(obj, proto) {
  return getPrototypeChain(obj).indexOf(proto) != -1;
}

export function filter(seq, pred, thisArg) {
  if(isObject(pred) && pred instanceof RegExp) {
    let re = pred;
    pred = (el, i) => re.test(el);
  }
  let r = [],
    i = 0;
  for(let el of seq) {
    if(pred.call(thisArg, el, i++, seq)) r.push(el);
  }
  return r;
}

export const curry =
  (f, arr = [], length = f.length) =>
  (...args) =>
    (a => (a.length === length ? f(...a) : curry(f, a)))([...arr, ...args]);

export function* split(buf, ...points) {
  points.sort();
  const splitAt = (b, pos, len) => {
    let r = pos < b.byteLength ? [slice(b, 0, pos), slice(b, pos)] : [null, b];
    return r;
  };
  let prev,
    len = 0;
  for(let offset of points) {
    let at = offset - len;
    [prev, buf] = splitAt(buf, at, len);
    if(prev) {
      yield prev;
      len = offset;
    }
  }
  if(buf) yield buf;
}

export const unique = (arr, cmp) => arr.filter(typeof cmp == 'function' ? (el, i, arr) => arr.findIndex(item => cmp(el, item)) == i : (el, i, arr) => arr.indexOf(el) == i);

export const getFunctionArguments = fn =>
  (fn + '')
    .replace(/\n.*/g, '')
    .replace(/(=>|{|\n).*/g, '')
    .replace(/^function\s*/, '')
    .replace(/^\((.*)\)\s*$/g, '$1')
    .split(/,\s*/g);

const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 =
  (offset = 0) =>
  code =>
    `\x1b[${code + offset}m`;

const wrapAnsi256 =
  (offset = 0) =>
  code =>
    `\x1b[${38 + offset};5;${code}m`;

const wrapAnsi16m =
  (offset = 0) =>
  (red, green, blue) =>
    `\x1b[${38 + offset};2;${red};${green};${blue}m`;

function getAnsiStyles() {
  const codes = new Map();
  const styles = {
    modifier: {
      reset: [0, 0],
      // 21 isn't widely supported and 22 does the same thing
      bold: [1, 22],
      dim: [2, 22],
      italic: [3, 23],
      underline: [4, 24],
      overline: [53, 55],
      inverse: [7, 27],
      hidden: [8, 28],
      strikethrough: [9, 29]
    },
    color: {
      black: [30, 39],
      red: [31, 39],
      green: [32, 39],
      yellow: [33, 39],
      blue: [34, 39],
      magenta: [35, 39],
      cyan: [36, 39],
      white: [37, 39],

      // Bright color
      blackBright: [90, 39],
      redBright: [91, 39],
      greenBright: [92, 39],
      yellowBright: [93, 39],
      blueBright: [94, 39],
      magentaBright: [95, 39],
      cyanBright: [96, 39],
      whiteBright: [97, 39]
    },
    bgColor: {
      bgBlack: [40, 49],
      bgRed: [41, 49],
      bgGreen: [42, 49],
      bgYellow: [43, 49],
      bgBlue: [44, 49],
      bgMagenta: [45, 49],
      bgCyan: [46, 49],
      bgWhite: [47, 49],

      // Bright color
      bgBlackBright: [100, 49],
      bgRedBright: [101, 49],
      bgGreenBright: [102, 49],
      bgYellowBright: [103, 49],
      bgBlueBright: [104, 49],
      bgMagentaBright: [105, 49],
      bgCyanBright: [106, 49],
      bgWhiteBright: [107, 49]
    }
  };

  // Alias bright black as gray (and grey)
  styles.color.gray = styles.color.blackBright;
  styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
  styles.color.grey = styles.color.blackBright;
  styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

  for(const [groupName, group] of Object.entries(styles)) {
    for(const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\u001B[${style[0]}m`,
        close: `\u001B[${style[1]}m`
      };

      group[styleName] = styles[styleName];

      codes.set(style[0], style[1]);
    }

    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }

  Object.defineProperty(styles, 'codes', {
    value: codes,
    enumerable: false
  });

  styles.color.close = '\u001B[39m';
  styles.bgColor.close = '\u001B[49m';

  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

  // From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value: (red, green, blue) => {
        // We use the extended greyscale palette here, with the exception of
        // black and white. normal palette only has 4 greyscale shades.
        if(red === green && green === blue) {
          if(red < 8) {
            return 16;
          }

          if(red > 248) {
            return 231;
          }

          return Math.round(((red - 8) / 247) * 24) + 232;
        }
        const c = [red, green, blue].map(c => (c / 255) * 5);
        return 16 + 36 * c[0] + 6 * c[1] + c[2];
      },
      enumerable: false
    },
    hexToRgb: {
      value: hex => {
        const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
        if(!matches) {
          return [0, 0, 0];
        }

        let { colorString } = matches.groups;

        if(colorString.length === 3) {
          colorString = colorString
            .split('')
            .map(character => character + character)
            .join('');
        }

        const integer = Number.parseInt(colorString, 16);

        return [(integer >> 16) & 0xff, (integer >> 8) & 0xff, integer & 0xff];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: hex => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value: code => {
        if(code < 8) {
          return 30 + code;
        }

        if(code < 16) {
          return 90 + (code - 8);
        }

        let red;
        let green;
        let blue;

        if(code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;

          const remainder = code % 36;

          red = Math.floor(code / 36) * 0.2;
          green = Math.floor(remainder / 6) * 0.2;
          blue = (remainder % 6) * 0.2;
        }

        const value = Math.max(red, green, blue) * 2;

        if(value === 0) {
          return 30;
        }

        let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

        if(value === 2) {
          result += 60;
        }

        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: hex => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });

  return styles;
}

export function randInt(...args) {
  let range = args.splice(0, 2);
  let rng = args.shift() ?? Math.random;
  if(range.length < 2) range.unshift(0);
  return Math.round(misc.rand(range[1] - range[0] + 1) + range[0]);
}

export function randFloat(min, max, rng = Math.random) {
  return rng() * (max - min) + min;
}

export function randStr(n, set = '_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', rng = Math.random) {
  let o = '';

  while(--n >= 0) o += set[Math.round(rng() * (set.length - 1))];
  return o;
}

export function toBigInt(arg) {
  if(types.isArrayBuffer(arg)) {
    const bits = misc.bits(arg).join('');
    return eval(`0b${bits}n`);
  }
  return BigInt(arg);
}

export function lazyProperty(obj, name, getter, opts = {}) {
  return Object.defineProperty(obj, name, {
    get: types.isAsyncFunction(getter)
      ? async function() {
          return replaceProperty(await getter.call(this ?? obj, name));
        }
      : function() {
          const value = getter.call(this ?? obj, name);
          if(types.isPromise(value)) {
            value.then(v => {
              replaceProperty(v);
              console.log(`util.lazyProperty resolved `, obj[name]);
              return v;
            });
            return value;
          }
          return replaceProperty(value);
        },
    configurable: true,
    ...opts
  });

  function replaceProperty(value) {
    delete obj[name];
    Object.defineProperty(obj, name, { value, ...opts });
    return value;
  }
}

export function lazyProperties(obj, gettersObj, opts = {}) {
  opts = { enumerable: false, ...opts };
  for(let prop of Object.getOwnPropertyNames(gettersObj)) lazyProperty(obj, prop, gettersObj[prop], opts);
  return obj;
}

export function getOpt(options = {}, args) {
  let short, long;
  let result = {};
  let positional = (result['@'] = []);
  if(!(options instanceof Array)) options = Object.entries(options);
  const findOpt = arg => options.find(([optname, option]) => (Array.isArray(option) ? option.indexOf(arg) != -1 : false) || arg == optname);
  let [, params] = options.find(opt => opt[0] == '@') || [];
  if(typeof params == 'string') params = params.split(',');
  for(let i = 0; i < args.length; i++) {
    const arg = args[i];
    let opt;
    if(arg[0] == '-') {
      let name, value, start, end;
      if(arg[1] == '-') long = true;
      else short = true;
      start = short ? 1 : 2;
      if(short) end = 2;
      else if((end = arg.indexOf('=')) == -1) end = arg.length;
      name = arg.substring(start, end);
      if((opt = findOpt(name))) {
        const [has_arg, handler] = opt[1];
        if(has_arg) {
          if(arg.length > end) value = arg.substring(end + (arg[end] == '='));
          else value = args[++i];
        } else {
          value = true;
        }
        try {
          value = handler(value, result[opt[0]], options, result);
        } catch(e) {}
        result[opt[0]] = value;
        continue;
      }
    }
    if(params.length) {
      const param = params.shift();
      if((opt = findOpt(param))) {
        const [, [, handler]] = opt;
        let value = arg;
        if(typeof handler == 'function') {
          try {
            value = handler(value, result[opt[0]], options, result);
          } catch(e) {}
        }
        const name = opt[0];
        result[opt[0]] = value;
        continue;
      }
    }
    result['@'] = [...(result['@'] ?? []), arg];
  }
  return result;
}

export function toUnixTime(dateObj, utc = false) {
  if(!(dateObj instanceof Date)) dateObj = new Date(dateObj);
  let epoch = Math.floor(dateObj.getTime() / 1000);
  if(utc) epoch += dateObj.getTimezoneOffset() * 60;
  return epoch;
}

export function unixTime(utc = false) {
  return toUnixTime(new Date(), utc);
}

export function fromUnixTime(epoch, utc = false) {
  let t = parseInt(epoch);
  let d = new Date(0);
  utc ? d.setUTCSeconds(t) : d.setSeconds(t);
  return d;
}

export function range(...args) {
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
  return ret;
}

export function repeater(n, what) {
  if(typeof what == 'function')
    return (function* () {
      for(let i = 0; i < n; i++) yield what();
    })();
  return (function* () {
    for(let i = 0; i < n; i++) yield what;
  })();
}

export function repeat(n, what) {
  return [...repeater(n, what)];
}

export function chunkArray(arr, size) {
  const fn = (a, v, i) => {
    const j = i % size;
    if(j == 0) a.push([]);
    a[a.length - 1].push(v);
    return a;
  };

  return arr.reduce(fn, []);
}

export function camelize(str, delim = '') {
  return str.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2, offset) => {
    if(p2) return delim + p2.toUpperCase();
    return p1.toLowerCase();
  });
}

export function decamelize(str, delim = '-') {
  return /.[A-Z]/.test(str)
    ? str
        .replace(/([a-z\d])([A-Z])/g, '$1' + delim + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + delim + '$2')
        .toLowerCase()
    : str;
}

export function Location(line, column, pos, file, freeze = true) {
  let obj = this || new.target.test || this ? this : {};

  /*console.log("obj.constructor:",obj.constructor);
  //console.log("freeze:",freeze);*/
  Object.assign(obj, {
    line,
    column,
    pos,
    file
  });
  if(this !== obj) Object.setPrototypeOf(obj, Location.prototype);

  return freeze && obj.constructor === Location ? Object.freeze(obj) : obj;
}

export function format(...args) {
  return formatWithOptionsInternal({ hideKeys: ['constructor'] }, args);
}

export function formatWithOptions(opts, ...args) {
  if(!isObject(opts)) throw new TypeError(`options argument is not an object`);
  return formatWithOptionsInternal(opts, args);
}

function formatWithOptionsInternal(o, v) {
  const x = v[0];
  let a = 0;
  let s = '';
  let j = '';
  if(typeof x === 'string') {
    if(v.length === 1) return x;
    let t;
    let p = 0;
    for(let i = 0; i < x.length - 1; i++) {
      if(x[i] == '%') {
        let f = '';
        while('sjxdOoifc%'.indexOf(x[i + 1]) == -1) {
          f += x[i + 1];
          ++i;
        }
        if(p < i) s += slice(x, p, i);
        p = i + 1;

        const c = String.prototype.charCodeAt.call(x, ++i);
        if(a + 1 !== v.length) {
          switch (c) {
            case 115: // %s
              const y = v[++a];
              if(typeof y === 'number') t = formatNumber(y);
              else if(typeof y === 'bigint') t = `${y}n`;
              else if(typeof y !== 'object' || y === null || !hasBuiltIn(y, 'toString')) t = String(y);
              else t = inspect(y, { ...o, compact: 3, colors: false, depth: 0 });
              break;
            case 106: // %j
              t = stringify(v[++a]);
              break;
            case 120: // %x
            case 100: // %d
              const n = v[++a];
              if(typeof n === 'bigint') t = `${n}n`;
              else if(typeof n === 'symbol') t = 'NaN';
              else t = formatNumber(c == 120 ? Number(n).toString(16) : Number(n));
              break;
            case 79: // %O
              t = inspect(v[++a], o);
              break;
            case 111: // %o
              t = /*v[++a]+'' ?? */ inspect(v[++a], {
                ...o,
                showHidden: true,
                showProxy: true,
                depth: 1,
                protoChain: false
              });
              break;
            case 105: // %i
              const k = v[++a];
              if(typeof k === 'bigint') t = `${k}`;
              else if(typeof k === 'symbol') t = 'NaN';
              else t = formatNumber(parseInt(k));
              break;
            case 102: // %f
              const d = v[++a];
              if(typeof d === 'symbol') t = 'NaN';
              else t = formatNumber(parseFloat(d));
              break;
            case 99: // %c
              a += 1;
              t = '';
              break;
            case 37: // %%
              s += slice(x, p, i);
              p = i + 1;
              continue;
            default:
              continue;
          }
          if(p !== i - 1) s += slice(x, p, i - 1);
          let pad = parseInt(f);
          if(Math.abs(pad) > 0) t = t['pad' + (pad < 0 ? 'End' : 'Start')](Math.abs(pad), /^-?0/.test(f) ? '0' : ' ');
          s += t;
          p = i + 1;
        } else if(c === 37) {
          s += slice(x, p, i);
          p = i + 1;
        }
      }
    }
    if(p !== 0) {
      a++;
      j = ' ';
      if(p < x.length) s += slice(x, p);
    }
  }
  while(a < v.length) {
    const y = v[a];
    s += j;
    s += typeof y !== 'string' ? inspect(y, o) : y;
    j = ' ';
    a++;
  }
  return s;
}

export function isNumeric(value) {
  for(let f of [v => +v, parseInt, parseFloat]) if(!isNaN(f(value))) return true;
  return false;
}

export function functionName(fn) {
  if(typeof fn == 'function' && typeof fn.name == 'string') return fn.name;
  try {
    const matches = /function\s*([^(]*)\(.*/g.exec(fn + '');
    if(matches && matches[1]) return matches[1];
  } catch {}
  return null;
}

export function className(obj) {
  if(isObject(obj)) {
    if('constructor' in obj) return functionName(obj.constructor);
    if(Symbol.toStringTag in obj) return obj[Symbol.toStringTag];
  }
  return null;
}

export const isArrowFunction = fn => (isFunction(fn) && !('prototype' in fn)) || /\ =>\ /.test(('' + fn).replace(/\n.*/g, ''));

export function immutableClass(orig, ...proto) {
  let name = functionName(orig).replace(/Mutable/g, '');
  let imName = 'Immutable' + name;
  proto = proto || [];
  let initialProto = proto.map(p =>
    isArrowFunction(p)
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
  let species = ctor;
  return ctor;
}

export const isArray = a => Array.isArray(a);

export class ArrayFacade {
  *[Symbol.iterator]() {
    const { length } = this;
    for(let i = 0; i < length; i++) yield itemFn(this, i);
  }
  *keys() {
    const { length } = this;
    for(let i = 0; i < length; i++) yield i;
  }
  *entries() {
    const { length } = this;
    for(let i = 0; i < length; i++) yield [i, itemFn(this, i)];
  }
  *values() {
    const { length } = this;
    for(let i = 0; i < length; i++) yield itemFn(this, i);
  }
  forEach(callback, thisArg) {
    const { length } = this;
    for(let i = 0; i < length; i++) callback.call(thisArg, itemFn(this, i), i, this);
  }
  reduce(callback, accu, thisArg) {
    const { length } = this;
    for(let i = 0; i < length; i++) accu = callback.call(thisArg, accu, itemFn(this, i), i, this);
    return accu;
  }
}

export function arrayFacade(proto, itemFn = (container, i) => container.at(i)) {
  return define(proto, ArrayFacade.prototype);
}

export function bits(buffer) {
  let a = new Uint8Array(buffer);
  let bit,
    bits = buffer.byteLength << 3;
  let ret = [];
  for(bit = 0; bit < bits; bit++) {
    let shift = bit & 0x7;
    let bpos = bit >> 3;

    ret.push(a[bit >> 3] & (1 << shift) ? 1 : 0);
  }
  return ret;
}

export function dupArrayBuffer(buf, start, length) {
  let a = new Uint8Array(buf, start, length);
  return new Uint8Array([...a]);
}
export function getTypeName(v) {
  return typeof v;
}
export function isArrayBuffer(buf) {
  return isObject(buf) && buf instanceof ArrayBuffer;
}

export function isBigDecimal(num) {
  return typeof num == 'bigdecimal' || num[Symbol.toStringTag] == 'BigDecimal';
}

export function isBigFloat(num) {
  return typeof num == 'bigfloat' || num[Symbol.toStringTag] == 'BigFloat';
}

export function isBigInt(num) {
  return typeof num == 'bigint' || num[Symbol.toStringTag] == 'isBigInt';
}

export function isBool(value) {
  return typeof value == 'boolean';
}

export function isCFunction(fn) {
  return false;
}

export function isConstructor(fn) {
  return typeof fn == 'function' && 'prototype' in fn;
}

export function isEmptyString(value) {
  return value === '';
}

export function isError(value) {
  return value instanceof Error || value[Symbol.toStringTag].endsWith('Error');
}

export function isException(value) {
  return false;
}

export function isExtensible(value) {
  return typeof value == 'object' && value !== null && Object.isExtensible(value);
}

export function isFunction(value) {
  return typeof value == 'function';
}

export function isHTMLDDA(value) {
  return false;
}

export function isInstanceOf(value, ctor) {
  if(ctor[Symbol.hasInstance]) {
    return ctor[Symbol.hasInstance](value);
  }
  return typeof value == 'object' && value !== null && value instanceof ctor;
}

export function isInteger(value) {
  return Math.abs(value) % 1 == 0;
}

export function isJobPending(id) {
  return false;
}

export function isLiveObject(obj) {
  return true;
}

export function isNull(value) {
  return value === null;
}

export function isNumber(value) {
  return typeof value == 'number';
}
export function isUndefined(value) {
  return typeof value == 'undefined';
}

export function isString(value) {
  return typeof value == 'string';
}
export function isUninitialized(value) {
  return false;
}

export function isSymbol(value) {
  return typeof value == 'symbol' || value[Symbol.toStringTag] == 'Symbol';
}

export function isUncatchableError(value) {
  return false;
}

export function isRegisteredClass(id) {
  return false;
}
export function rand() {
  return Math.random() * 2 ** 32;
}

export function randi() {
  return rand() - 2 ** 31;
}

export function randf() {
  return Math.random();
}

export function srand(seed) {}

export function toArrayBuffer(value) {
  if(typeof value == 'object' && value !== null && 'buffer' in value && isArrayBuffer(value.buffer)) return value.buffer;

  if(typeof value == 'string') {
    const encoder = new TextEncoder();
    const view = encoder.encode(value);
    return view.buffer;
  }
  return value;
}

Location.prototype.clone = function(freeze = false, withFilename = true) {
  const { line, column, pos, file } = this;

  return new Location(line, column, pos, withFilename ? file : null, freeze);
};
Location.prototype[Symbol.toStringTag] = 'Location';

/*function(n, opts) {
  const { showFilename = true, colors = false } = opts || {};
  let c = Util.coloring(colors);

  let v =
    typeof this.column == 'number' ? [this.file, this.line, this.column] : [this.file, this.line];
  if((!showFilename || v[0] == undefined) && v.length >= 3) v.shift();
  v = v.map((f, i) => c.code(...(i == 0 ? [38, 5, 33] || [1, 33] : [1,  36])) + f);
  return v.join(c.code(...([1, 30] || [1, 36])) + ':') + c.code(0);
};*/

Location.prototype[Symbol.iterator] = function* () {
  let { file, line, column } = this;
  let v = file ? [file, line, column] : [line, column];
  yield* v;
};
Location.prototype.toString = function(opts = {}) {
  const { line, column, file } = this;
  return (file ? file + ':' : '') + line + ':' + column;
};
Location.prototype.valueOf = function() {
  return this.pos;
};
Location.prototype[Symbol.toPrimitive] = function(hint) {
  if(hint == 'number') return this.pos;
  if(hint == 'string') return this.toString();
};
Location.prototype[Symbol.for('nodejs.util.inspect.custom')] = function(n, opts) {
  return this.toString({ colors: true });
  return Util.inspect(this, {
    colors: true,
    ...opts,
    toString: Symbol.toStringTag
  });
};
/*
Location.prototype.valueOf = function() {
  return this.pos;
};*/

define(Location.prototype, {
  /* prettier-ignore */ get offset() {
    return this.valueOf();
  }
});
