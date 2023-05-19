//export { types } from  '../quickjs/qjs-modules/lib/util.js';

const slice = (x, s, e) =>
  typeof x == 'object'
    ? isArrayBuffer(x)
      ? dupArrayBuffer(x, s, e)
      : Array.isArray(x)
      ? Array.prototype.slice.call(x, s, e)
      : x.slice(s, e)
    : String.prototype.slice.call(x, s, e);
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
  },
  isConstructor(v) {
    return isFunction(v) && 'prototype' in v;
  },
  isIterable(v) {
    return isObject(v) && isFunction(v[Symbol.iterator]);
  },
  isAsyncIterable(v) {
    return isObject(v) && isFunction(v[Symbol.asyncIterator]);
  },
  isIterator(v) {
    return isObject(v) && isFunction(v.next);
  },
  isArrayLike(v) {
    return isObject(v) && typeof v.length == 'number' && Number.isInteger(v.length);
  }
};

export function isObject(arg) {
  return typeof arg == 'object' && arg !== null;
}

export function isAsync(fn) {
  if(types.isAsyncFunction(fn) || types.isAsyncGeneratorFunction(fn)) return true;

  if(isFunction(fn)) return /^async\s+function/.test(fn + '');
}

export const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');

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
    if(
      (c0 = bin.charCodeAt(i++)) > 255 ||
      (c1 = bin.charCodeAt(i++)) > 255 ||
      (c2 = bin.charCodeAt(i++)) > 255
    )
      throw new TypeError('invalid character found');
    u32 = (c0 << 16) | (c1 << 8) | c2;
    asc +=
      b64chs[(u32 >> 18) & 63] +
      b64chs[(u32 >> 12) & 63] +
      b64chs[(u32 >> 6) & 63] +
      b64chs[u32 & 63];
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
    u24 =
      (b64tab[asc.charAt(i++)] << 18) |
      (b64tab[asc.charAt(i++)] << 12) |
      ((r1 = b64tab[asc.charAt(i++)]) << 6) |
      (r2 = b64tab[asc.charAt(i++)]);
    bin +=
      r1 === 64
        ? String.fromCharCode((u24 >> 16) & 255)
        : r2 === 64
        ? String.fromCharCode((u24 >> 16) & 255, (u24 >> 8) & 255)
        : String.fromCharCode((u24 >> 16) & 255, (u24 >> 8) & 255, u24 & 255);
  }
  return bin;
}

export function assert(actual, expected, message) {
  if(arguments.length == 1) expected = true;

  if(actual === expected) return;

  if(
    actual !== null &&
    expected !== null &&
    typeof actual == 'object' &&
    typeof expected == 'object' &&
    actual.toString() === expected.toString()
  )
    return;

  throw Error(
    'assertion failed: got |' +
      actual +
      '|' +
      ', expected |' +
      expected +
      '|' +
      (message ? ' (' + message + ')' : '')
  );
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

export function chain(first, ...fns) {
  return fns.reduce(
    (acc, fn) =>
      function(...args) {
        return fn.call(this, acc.call(this, ...args), args);
      },
    first
  );
}

export function chainRight(first, ...fns) {
  return fns.reduce(
    (acc, fn) =>
      function(...args) {
        return acc.call(this, fn.call(this, ...args), args);
      },
    first
  );
}

export function chainArray(tmp, ...fns) {
  for(let fn of fns) {
    let prev = tmp;
    tmp = function(...args) {
      return fn.call(this, ...prev.call(this, ...args));
    };
  }
  return tmp;
}

export function getset(target, ...args) {
  let ret = [];
  if(Array.isArray(target)) {
    ret = target.slice(0, 2);
  } else if(isFunction(target)) {
    ret = [target, isFunction(args[0]) ? args[0] : target];
  } else if(hasGetSet(target)) {
    if(target.get === target.set) {
      const GetSet = (...args) => target.set(...args);
      ret = [GetSet, GetSet];
    } else {
      ret = [key => target.get(key), (key, value) => target.set(key, value)];
      //console.log('getset', ret[1] + '', target.get === target.set);
    }
  } else if(Array.isArray(target)) {
    ret = [
      key => target.find(([k, v]) => key === k),
      (key, value) => {
        let i = target.findIndex(([k, v]) => k === key);
        if(i != -1) {
          if(value !== undefined) target[i][1] = value;
          else delete target[i];
        } else {
          target.push([key, value]);
        }
      }
    ];
  } else if(isObject(target)) {
    ret = [key => target[key], (key, value) => (target[key] = value)];
  } else {
    throw new TypeError(`getset unknown argument type '${typeof target}'`);
  }
  if(args.length) {
    let [get, set] = ret;
    ret = [() => get(...args), value => set(...args, value)];
  }
  return Object.setPrototypeOf(ret, getset.prototype);
}

Object.setPrototypeOf(
  define(getset.prototype, {
    bind(...args) {
      return Object.setPrototypeOf(
        this.map(fn => fn.bind(null, ...args)),
        getset.prototype
      );
    },
    transform(read, write) {
      const [get, set] = this;
      return Object.setPrototypeOf(
        [key => read(get(key)), (key, value) => set(key, write(value))],
        getset.prototype
      );
    },
    function(...args) {
      const [get, set] = this;
      return args.length <= 1 ? get(...args) : set(...args);
    },
    get object() {
      const [get, set] = this;
      return { get, set };
    }
  }),
  Array.prototype
);

export function modifier(...args) {
  let gs = gettersetter(...args);
  return fn => {
    let value = gs();
    return fn(value, newValue => gs(newValue));
  };
}

export function getter(target, ...args) {
  let ret;
  if(Array.isArray(target)) {
    ret = target[0];
  } else if(isObject(target) && isFunction(target.get)) {
    return () => target.get(...args);
  } else if(isFunction(target)) {
    ret = target;
  } else if(hasGetSet(target)) {
    ret = key => target.get(key);
  } else if(isObject(target)) {
    ret = key => target[key];
  } else {
    throw new TypeError(`getter unknown argument type '${typeof target}'`);
  }
  if(args.length) {
    let get = ret;
    ret = () => get(...args);
  }
  return ret;
}

export function setter(target, ...args) {
  let ret;
  if(Array.isArray(target)) {
    ret = target[1];
  } else if(isObject(target) && isFunction(target.set)) {
    return value => target.set(...args, value);
  } else if(isFunction(target)) {
    ret = target;
  } else if(hasGetSet(target)) {
    ret = (key, value) => target.set(key, value);
  } else if(isObject(target)) {
    ret = (key, value) => (target[key] = value);
  } else {
    throw new TypeError(`setter unknown argument type '${typeof target}'`);
  }
  if(args.length) {
    let set = ret;
    ret = value => set(...args, value);
  }
  return ret;
}

export function gettersetter(target, ...args) {
  let fn;

  if(Array.isArray(target)) {
    let [get, set] = target;
    fn = (...args) => (args.length < 2 ? get(...args) : set(...args));
  } else if(isObject(target) && isFunction(target.receiver)) {
    return (...args2) => target.receiver(...args, ...args2);
  } else if(isFunction(target)) {
    if(isFunction(args[0]) && args[0] !== target) {
      let setter = args.shift();
      fn = (...args) => (args.length == 0 ? target() : setter(...args));
    } else fn = target;
  } else if(hasGetSet(target)) {
    if(target.get === target.set) fn = (...args) => target.set(...args);
    else fn = (...args) => (args.length < 2 ? target.get(...args) : target.set(...args));
  } else if(isObject(target)) {
    fn = (...args) => {
      const [key, value] = args;
      if(args.length == 1) return target[key];
      target[key] = value;
    };
  } else {
    throw new TypeError(`gettersetter unknown argument type '${typeof target}'`);
  }
  if(fn !== target) define(fn, { receiver: target });
  if(args.length) return (...args2) => fn(...args, ...args2);
  return fn;
}

export function hasFn(target) {
  if(isObject(target))
    return isFunction(target.has) ? key => target.has(key) : key => key in target;
}

export function remover(target) {
  if(isObject(target))
    return isFunction(target.delete) ? key => target.delete(key) : key => delete target[key];
}

export function getOrCreate(target, create = () => ({}), set) {
  const get = getter(target),
    has = hasFn(target);
  set ??= setter(target);
  let value;
  return key =>
    (value = has.call(target, key)
      ? get.call(target, key)
      : ((value = create(key, target)), set.call(target, key, value), value));
}

export function hasGetSet(obj) {
  return isObject(obj) && ['get', 'set'].every(m => typeof obj[m] == 'function');
}

export function mapObject(target) {
  let obj;
  if(hasGetSet(target.receiver)) return target.receiver;
  if(hasGetSet(target)) obj = target;
  else if(typeof target == 'function') obj = { get: target, set: target };
  else if(isObject(target))
    obj = {
      set: (key, value) => (target[key] = value),
      get: key => target[key]
    };
  if(obj !== target) define(obj, { receiver: target });
  return obj;
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
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function extend(dst, src, options = { enumerable: false }) {
  if(typeof options != 'function') {
    let tmp = options;
    options = (desc, prop) => Object.assign(desc, tmp);
  }
  for(let prop of Object.getOwnPropertySymbols(src).concat(Object.getOwnPropertyNames(src))) {
    if(prop == '__proto__') {
      Object.setPrototypeOf(obj, props[prop]);
      continue;
    }
    let desc = Object.getOwnPropertyDescriptor(src, prop);
    options(desc, prop);
    Object.defineProperty(dst, prop, desc);
  }
  return dst;
}

export function define(obj, ...args) {
  for(let props of args)
    obj = extend(obj, props, desc => (delete desc.configurable, delete desc.enumerable));

  return obj;
}

export function defineGetter(obj, key, fn, enumerable = false) {
  if(!obj.hasOwnProperty(key))
    Object.defineProperty(obj, key, {
      enumerable,
      configurable: true,
      get: fn
    });
  return obj;
}

export function defineGetterSetter(obj, key, g, s, enumerable = false) {
  if(!obj.hasOwnProperty(key))
    Object.defineProperty(obj, key, {
      get: g,
      set: s,
      enumerable
    });
  return obj;
}

export function defineGettersSetters(obj, gettersSetters) {
  for(let name in gettersSetters)
    defineGetterSetter(obj, name, gettersSetters[name], gettersSetters[name]);
  return obj;
}

/*export function defineGettersSetters(obj, gettersSetters, enumerable = false) {
  let props = {};
  try {
    for(let name in gettersSetters) props[name] = { get: gettersSetters[name], set: gettersSetters[name], enumerable };
    return Object.defineProperties(obj, props);
  } catch(e) {
    for(let name in gettersSetters)
      try {
        defineGetterSetter(obj, name, gettersSetters[name], gettersSetters[name]);
      } catch(e) {
        console.log(`Failed setting property '${name}'`);
      }
    return obj;
  }
}*/

export function* prototypeIterator(obj, pred = (obj, depth) => true) {
  let depth = 0;

  while(obj) {
    if(pred(obj, depth)) yield obj;
    let tmp = Object.getPrototypeOf(obj);
    if(tmp === obj) break;
    obj = tmp;
    ++depth;
  }
}

export function pick(obj, keys) {
  const newObj = {};
  for(let key of keys) newObj[key] = obj[key];
  return newObj;
}

export function omit(obj, keys) {
  const newObj = Object.assign({}, obj);
  for(let key of keys) delete newObj[key];
  return newObj;
}

export function keys(obj, start = 0, end = obj => obj === Object.prototype) {
  let pred,
    a = [],
    depth = 0;

  if(!isFunction(end)) {
    let n = end;
    pred = (obj, depth) => depth >= start && depth < n;
    end = () => false;
  } else {
    pred = (obj, depth) => depth >= start;
  }

  for(let proto of prototypeIterator(obj, pred)) {
    if(end(proto, depth++)) break;
    a.push(...Object.getOwnPropertySymbols(proto).concat(Object.getOwnPropertyNames(proto)));
  }

  return [...new Set(a)];
}

export function entries(obj, start = 0, end = obj => obj === Object.prototype) {
  let a = [];
  for(let key of keys(obj, start, end)) a.push([key, obj[key]]);
  return a;
}

export function values(obj, start = 0, end = obj => obj === Object.prototype) {
  let a = [];
  for(let key of keys(obj, start, end)) a.push(obj[key]);
  return a;
}

export function getMethodNames(obj, depth = 1, start = 0) {
  let names = [];
  for(let n of keys(obj, start, start + depth)) {
    try {
      if(isFunction(obj[n])) names.push(n);
    } catch(e) {}
  }
  return names;
}

export function getMethods(obj, depth = 1, start = 0) {
  return pick(obj, getMethodNames(obj, depth, start));
}

export function bindMethods(obj, methods, target) {
  target ??= obj;
  for(let name of getMethodNames(methods)) target[name] = methods[name].bind(obj);
  return target;
}

export function properties(obj, options = { enumerable: true }) {
  let desc = {};
  const { memoize: memo = false, ...opts } = options;
  const mfn = memo ? fn => memoize(fn) : fn => fn;
  for(let prop of keys(obj)) {
    if(Array.isArray(obj[prop])) {
      const [get, set] = obj[prop];
      desc[prop] = { ...opts, get, set };
    } else if(isFunction(obj[prop])) {
      desc[prop] = { ...opts, get: mfn(obj[prop]) };
    }
  }
  return Object.defineProperties({}, desc);
}

export function weakDefine(obj, ...args) {
  let desc = {};
  for(let other of args) {
    let otherDesc = Object.getOwnPropertyDescriptors(other);
    for(let key in otherDesc)
      if(!(key in obj) && desc[key] === undefined && otherDesc[key] !== undefined)
        desc[key] = otherDesc[key];
  }
  return Object.defineProperties(obj, desc);
}

export function getPrototypeChain(obj, limit = -1, start = 0) {
  let i = -1,
    ret = [];
  do {
    if(i >= start && (limit == -1 || i < start + limit)) ret.push(obj);
    if(obj === Object.prototype || obj.constructor === Object) break;
    ++i;
  } while((obj = obj.__proto__ || Object.getPrototypeOf(obj)));
  return ret;
}

export function getConstructorChain(obj, ...range) {
  let ret = [];
  pushUnique(ret, obj.constructor);
  for(let proto of getPrototypeChain(obj, ...range)) pushUnique(ret, proto.constructor);
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
  if(types.isIterable(seq)) {
    let r = [],
      i = 0;
    for(let el of seq) if(pred.call(thisArg, el, i++, seq)) r.push(el);
    return r;
  } else if(isObject(seq)) {
    let r = {};
    for(let key in seq) if(pred.call(thisArg, seq[key], key, seq)) r[key] = seq[key];
    return r;
  }
}

export function filterKeys(r, needles, keep = true) {
  let pred;
  if(isFunction(needles)) {
    pred = needles;
  } else {
    if(!Array.isArray(needles)) needles = [...needles];
    pred = key => (needles.indexOf(key) != -1) === keep;
  }
  return Object.keys(r)
    .filter(pred)
    .reduce((obj, key) => {
      obj[key] = r[key];
      return obj;
    }, {});
}

export const curry = (f, arr = [], length = f.length) =>
  function(...args) {
    return (a => (a.length === length ? f.call(this, ...a) : curry(f.bind(this), a)))([
      ...arr,
      ...args
    ]);
  };

export const clamp = curry((min, max, value) => Math.max(min, Math.min(max, value)));

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

export const matchAll = curry(function* (re, str) {
  let match;
  re =
    re instanceof RegExp ? re : new RegExp(Array.isArray(re) ? '(' + re.join('|') + ')' : re, 'g');
  do {
    if((match = re.exec(str))) yield match;
  } while(match != null);
});

export function bindProperties(obj, target, props, gen) {
  if(props instanceof Array) props = Object.fromEntries(props.map(name => [name, name]));
  const [propMap, propNames] = Array.isArray(props)
    ? [props.reduce((acc, name) => ({ ...acc, [name]: name }), {}), props]
    : [props, Object.keys(props)];
  gen ??= p => v => v === undefined ? target[propMap[p]] : (target[propMap[p]] = v);
  const propGetSet = propNames
    .map(k => [k, propMap[k]])
    .reduce(
      (a, [k, v]) => ({
        ...a,
        [k]: isFunction(v)
          ? (...args) => v.call(target, k, ...args)
          : (gen && gen(k)) || ((...args) => (args.length > 0 ? (target[k] = args[0]) : target[k]))
      }),
      {}
    );
  Object.defineProperties(
    obj,
    propNames.reduce(
      (a, k) => {
        const prop = props[k];
        const get_set = propGetSet[k];
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
        __getter_setter__: { value: gen, enumerable: false },
        __bound_target__: { value: target, enumerable: false }
      }
    )
  );
  return obj;
}

export function immutableClass(orig, ...proto) {
  let name = functionName(orig).replace(/Mutable/g, '');
  let imName = 'Immutable' + name;
  proto = proto || [];
  let initialProto = proto.map(p =>
    isArrow(p)
      ? p
      : ctor => {
          for(let n in p) ctor.prototype[n] = p[n];
        }
  );
  let body = `class ${imName} extends ${name} {\n  constructor(...args) {\n    super(...args);\n    if(new.target === ${imName})\n      return Object.freeze(this);\n  }\n};\n\n${imName}.prototype.constructor = ${imName};\n\nreturn ${imName};`;
  for(let p of initialProto) p(orig);
  let ctor;
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

// time a given function
export function instrument(
  fn,
  log = (duration, name, args, ret) =>
    console.log(
      `function '${name}'` +
        (ret !== undefined ? ` {= ${escape(ret + '').substring(0, 100) + '...'}}` : '') +
        ` timing: ${duration.toFixed(3)}ms`
    ),
  logInterval = 0 //1000
) {
  // const { now, hrtime, functionName } = Util;
  let last = Date.now();
  let duration = 0,
    times = 0;
  const name = functionName(fn) || '<anonymous>';
  const asynchronous = isAsync(fn) || isAsync(now);
  const doLog = asynchronous
    ? async (args, ret) => {
        let t = Date.now();
        if(t - (await last) >= logInterval) {
          log(duration / times, name, args, ret);
          duration = times = 0;
          last = t;
        }
      }
    : (args, ret) => {
        let t = Date.now();
        //console.log('doLog', { passed: t - last, logInterval });
        if(t - last >= logInterval) {
          log(duration / times, name, args, ret);
          duration = times = 0;
          last = t;
        }
      };

  return asynchronous
    ? async function(...args) {
        const start = Date.now();
        let ret = await fn.apply(this, args);
        duration += Date.now() - start;
        times++;
        await doLog(args, ret);
        return ret;
      }
    : function(...args) {
        const start = Date.now();
        let ret = fn.apply(this, args);
        duration += Date.now() - start;
        times++;
        doLog(args, ret);
        return ret;
      };
}

export const hash = (newMap = () => new Map()) => {
  let map = newMap();
  let cache = memoize((...args) => gettersetter(newMap(...args)), new Map());

  // let [get, set] = getset(cache);

  return {
    get(path) {
      let i = 0,
        obj = map;
      for(let part of path) {
        let cachefn = cache(obj) ?? getter(obj);
        console.log('cache', { i, cache });
        obj = cachefn(part);
        console.log('cachefn', { i, cachefn });
      }
      return obj;
    },
    set(path, value) {
      let i = 0,
        obj = map;
      let key = path.pop();

      for(let part of path) {
        console.log('cache', { part, obj });
        let cachefn = cache(obj.receiver ?? obj);
        console.log('cachefn', { i, cachefn });
        obj = cachefn(part) ?? (cachefn(part, gettersetter(newMap())), cachefn(part));
        console.log('cachefn', { obj });
      }
      return obj(key, value);
    }
  };
};

export const catchable = function Catchable(self) {
  assert(isFunction(self));

  if(!(self instanceof catchable)) Object.setPrototypeOf(self, catchable.prototype);
  if('constructor' in self) self.constructor = catchable;

  return self;
};

Object.assign(catchable, {
  [Symbol.species]: catchable,
  prototype: Object.assign(function () {}, {
    then(fn) {
      return this.constructor[Symbol.species]((...args) => {
        let result;
        try {
          result = this(...args);
        } catch(e) {
          throw e;
          return;
        }
        return fn(result);
      });
    },
    catch(fn) {
      return this.constructor[Symbol.species]((...args) => {
        let result;
        try {
          result = this(...args);
        } catch(e) {
          return fn(e);
        }
        return result;
      });
    }
  })
});

export function isNumeric(value) {
  for(let f of [v => +v, parseInt, parseFloat]) if(!isNaN(f(value))) return true;
  return false;
}

export function isIndex(value) {
  return !isNaN(+value) && Math.floor(+value) + '' == value + '';
}

export function numericIndex(value) {
  return isIndex(value) ? +value : value;
}

export function histogram(arr, out = new Map()) {
  let [get, set] = getset(out);

  const incr = key => set(key, (get(key) ?? 0) + 1);
  for(let item of arr) {
    incr(item);
  }
  return out;
}

export function propertyLookupHandlers(getter = key => null, setter, thisObj) {
  let handlers = {
    get(target, key, receiver) {
      return getter.call(thisObj ?? target, key);
    }
  };
  let tmp;
  try {
    tmp = getter();
  } catch(e) {}

  if(setter)
    handlers.set = function(target, key, value) {
      setter.call(thisObj ?? target, key, value);
      return true;
    };

  if(!isString(tmp))
    try {
      let a = Array.isArray(tmp) ? tmp : [...tmp];
      if(a)
        handlers.ownKeys = function(target) {
          return getter.call(thisObj ?? target);
        };
    } catch(e) {}

  return handlers;
}

export function propertyLookup(...args) {
  let [obj = {}, getter, setter] = isFunction(args[0]) ? [{}, ...args] : args;

  return new Proxy(obj, propertyLookupHandlers(getter, setter));
}

export function abbreviate(str, max = 40, suffix = '...') {
  max = +max;
  if(isNaN(max)) max = Infinity;
  if(Array.isArray(str)) {
    return Array.prototype.slice.call(str, 0, Math.min(str.length, max)).concat([suffix]);
  }
  if(!isString(str) || !Number.isFinite(max) || max < 0) return str;
  str = '' + str;
  if(str.length > max) {
    return str.substring(0, max - suffix.length) + suffix;
  }
  return str;
}

export function tryFunction(fn, resolve = a => a, reject = () => null) {
  if(!isFunction(resolve)) {
    let rval = resolve;
    resolve = () => rval;
  }
  if(!isFunction(reject)) {
    let cval = reject;
    reject = () => cval;
  }
  return isAsync(fn)
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
}

export function tryCatch(fn, resolve = a => a, reject = () => null, ...args) {
  if(isAsync(fn))
    return fn(...args)
      .then(resolve)
      .catch(reject);

  return tryFunction(fn, resolve, reject)(...args);
}

export function mapAdapter(fn) {
  let r = {
    get(key) {
      return fn(key);
    },
    set(key, value) {
      fn(key, value);
      return this;
    }
  };
  let tmp = fn();
  if(types.isIterable(tmp) || types.isPromise(tmp)) r.keys = () => fn();

  if(fn[Symbol.iterator]) r.entries = fn[Symbol.iterator];
  else {
    let g = fn();
    if(types.isIterable(g) || types.isGeneratorFunction(g)) r.entries = () => fn();
  }

  return mapFunction(r);
}

/**
 * @param Array   forward
 * @param Array   backward
 *
 * component2path,  path2eagle  => component2eagle
 *  eagle2path, path2component =>
 */
export function mapFunction(map) {
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
    while(isFunction(m) && m.map !== undefined) m = m.map;
    return m;
  })(map);

  if(map instanceof Map || (isObject(map) && isFunction(map.get) && isFunction(map.set))) {
    fn.set = (key, value) => (map.set(key, value), (k, v) => fn(k, v));
    fn.get = key => map.get(key);
  } else if(isObject(map) && isFunction(map.match) && isFunction(map.put)) {
    fn.set = (key, value) => (map.put(key, value), (k, v) => fn(k, v));
    fn.get = key => map.match(key);
  } else if(isObject(map) && isFunction(map.getItem) && isFunction(map.setItem)) {
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
      if(newValue === undefined && isFunction(map.delete)) map.delete(key);
      else this.set(key, newValue);
    }
    return newValue;
  };

  if(isFunction(map.entries)) {
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
    fn[inspectSymbol] = function() {
      return new Map(this.map(([key, value]) => [Array.isArray(key) ? key.join('.') : key, value]));
    };
  } else if(isFunction(map.keys)) {
    if(isAsync(map.keys) || types.isPromise(map.keys())) {
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

  if(isFunction(fn.entries)) {
    fn.filter = function(pred) {
      return mapFunction(
        new Map(
          (function* () {
            let i = 0;
            for(let [key, value] of fn.entries()) if(pred([key, value], i++)) yield [key, value];
          })()
        )
      );
    };
    fn.map = function(t) {
      return mapFunction(
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
  if(isFunction(map.delete)) fn.delete = key => map.delete(key);

  if(isFunction(map.has)) fn.has = key => map.has(key);
  return fn;
}

export function mapWrapper(map, toKey = key => key, fromKey = key => key) {
  let fn = mapFunction(map);
  fn.set = (key, value) => (map.set(toKey(key), value), (k, v) => fn(k, v));
  fn.get = key => map.get(toKey(key));
  if(isFunction(map.keys)) fn.keys = () => [...map.keys()].map(fromKey);
  if(isFunction(map.entries))
    fn.entries = function* () {
      for(let [key, value] of map.entries()) yield [fromKey(key), value];
    };
  if(isFunction(map.values))
    fn.values = function* () {
      for(let value of map.values()) yield value;
    };
  if(isFunction(map.has)) fn.has = key => map.has(toKey(key));
  if(isFunction(map.delete)) fn.delete = key => map.delete(toKey(key));

  fn.map = (m => {
    while(isFunction(m) && m.map !== undefined) m = m.map;
    return m;
  })(map);

  return fn;
}

export function weakMapper(createFn, map = new WeakMap(), hitFn) {
  let self = function(obj, ...args) {
    let ret;
    if(map.has(obj)) {
      ret = map.get(obj);
      if(isFunction(hitFn)) hitFn(obj, ret);
    } else {
      ret = createFn(obj, ...args);
      map.set(obj, ret);
    }
    return ret;
  };
  self.set = (k, v) => map.set(k, v);
  self.get = k => map.get(k);
  self.map = map;
  return self;
}

export function wrapGenerator(fn) {
  return types.isGeneratorFunction(fn)
    ? function(...args) {
        return [...fn.call(this, ...args)];
      }
    : fn;
}

export function wrapGeneratorMethods(obj) {
  for(let name of keys(obj, 1, 0)) if(isFunction(obj[name])) obj[name] = wrapGenerator(obj[name]);

  return obj;
}

export const unique = (arr, cmp) =>
  arr.filter(
    typeof cmp == 'function'
      ? (el, i, arr) => arr.findIndex(item => cmp(el, item)) == i
      : (el, i, arr) => arr.indexOf(el) == i
  );

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
      blackBright: ['1;30', 39],
      redBright: ['1;31', 39],
      greenBright: ['1;32', 39],
      yellowBright: ['1;33', 39],
      blueBright: ['1;34', 39],
      magentaBright: ['1;35', 39],
      cyanBright: ['1;36', 39],
      whiteBright: ['1;37', 39]
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

export const ansiStyles = getAnsiStyles();

export function stripAnsi(str) {
  return (str + '').replace(new RegExp('\x1b[[(?);]{0,2}(;?[0-9])*.', 'g'), '');
}

export function padAnsi(str, n, s = ' ') {
  let { length } = stripAnsi(str);
  let pad = '';
  for(let i = length; i < n; i++) pad += s;
  return pad;
}

export function padStartAnsi(str, n, s = ' ') {
  return padAnsi(str, n, s) + str;
}

export function padEndAnsi(str, n, s = ' ') {
  return str + padAnsi(str, n, s);
}

export function randInt(...args) {
  let range = args.splice(0, 2);
  let rng = args.shift() ?? Math.random;
  if(range.length < 2) range.unshift(0);
  return Math.round(rand(range[1] - range[0] + 1) + range[0]);
}

export function randFloat(min, max, rng = Math.random) {
  return rng() * (max - min) + min;
}

export function randStr(n, set, rng = Math.random) {
  let o = '';
  set ??= '_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
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

export function roundDigits(precision) {
  if(typeof precision == 'number') return -Math.log10(precision);

  precision = precision + '';
  let index = precision.indexOf('.');
  let frac = index == -1 ? '' : precision.slice(index + 1);
  return frac.length;

  return -clamp(-Infinity, 0, Math.floor(Math.log10(precision - Number.EPSILON)));
}

export function roundTo(value, prec, digits, type = 'round') {
  if(!Number.isFinite(value)) return value;
  const fn = Math[type];
  if(prec == 1) return fn(value);
  if(prec < 1 && prec > 0 && !isNumber(digits)) digits = -Math.log10(prec);
  let ret = prec >= Number.EPSILON ? fn(value / prec) * prec : value;
  if(isNumber(digits) && digits >= 1 && digits <= 100) ret = +ret.toFixed(digits);
  return ret;
}

export function lazyProperty(obj, name, getter, opts = {}) {
  assert(Object.getOwnPropertyDescriptor(obj, name)?.configurable !== false);

  let value,
    replaceProperty = newValue => (
      delete obj[name],
      Object.defineProperty(obj, name, { newValue, writable: false, configurable: false, ...opts }),
      (replaceProperty = undefined),
      newValue
    );

  Object.defineProperty(obj, name, {
    get:
      opts.async || (opts.async !== false && types.isAsyncFunction(getter))
        ? async function() {
            value ??= Promise.resolve(await getter.call(this, name));
            return (replaceProperty && replaceProperty(value)) || value;
          }
        : function() {
            value ??= getter.call(this, name);
            return (replaceProperty && replaceProperty(value)) || value;
          },
    ...opts,
    configurable: true
  });
  return obj;
}

export function lazyProperties(obj, gettersObj, opts = {}) {
  opts = { enumerable: false, ...opts };
  for(let prop of Object.getOwnPropertyNames(gettersObj))
    lazyProperty(obj, prop, gettersObj[prop], opts);
  return obj;
}

export function decorate(decorators, obj, ...args) {
  if(!Array.isArray(decorators)) decorators = [decorators];
  for(let decorator of decorators)
    for(let prop of keys(obj))
      if(typeof obj[prop] == 'function') {
        let newfn = decorator(obj[prop], obj, prop, ...args);
        if(obj[prop] !== newfn) obj[prop] = newfn;
      }
  return obj;
}

export function getOpt(options = {}, args) {
  let short, long;
  let result = {};
  let positional = (result['@'] = []);
  if(!(options instanceof Array)) options = Object.entries(options);
  const findOpt = arg =>
    options.find(
      ([optname, option]) =>
        (Array.isArray(option) ? option.indexOf(arg) != -1 : false) || arg == optname
    );
  let [, params] = options.find(opt => opt[0] == '@') || [];
  if(typeof params == 'string') params = params.split(',');
  args = args.reduce((acc, arg) => {
    if(/^-[^-]/.test(arg)) {
      let opt = findOpt(arg[1]);
      if(!opt || !opt[1][0]) {
        for(let ch of arg.slice(1)) acc.push('-' + ch);
        return acc;
      }
    }
    acc.push(arg);
    return acc;
  }, []);
  //console.log('getOpt', { args });
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
          //console.log('getOpt', { name, value, arg, end });
          if(arg.length > end) value = arg.substring(end + (arg[end] == '='));
          else value = args[++i];
        } else {
          value = true;
        }
        if(isFunction(handler))
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
        if(isFunction(handler)) {
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

export function showHelp(opts, exitCode = 0) {
  let entries = Array.isArray(opts) ? opts : Object.entries(opts);
  let maxlen = entries.reduce((acc, [name]) => (acc > name.length ? acc : name.length), 0);

  let s = entries.reduce(
    (acc, [name, [hasArg, fn, shortOpt]]) =>
      acc +
      (
        `    ${(shortOpt ? '-' + shortOpt + ',' : '').padStart(4, ' ')} --${name.padEnd(
          maxlen,
          ' '
        )} ` + (hasArg ? (typeof hasArg == 'boolean' ? 'ARG' : hasArg) : '')
      ).padEnd(40, ' ') +
      '\n',
    `Usage: ${basename(scriptArgs[0])} [OPTIONS] <FILES...>\n\n`
  );

  process.stdout.write(s + '\n');
  process.exit(exitCode);
}

export function isoDate(d) {
  if(typeof d == 'number') d = new Date(d);
  const tz = d.getTimezoneOffset();
  const ms = d.valueOf() - tz * 60 * 1000;
  d = new Date(ms);
  return d.toISOString().replace(/T.*/, '');
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
  let [start, end, step = 1] = args.length == 1 ? [0, args[0] - 1] : args;
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

export function ucfirst(str) {
  if(typeof str != 'string') str = str + '';
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

export function lcfirst(str) {
  if(typeof str != 'string') str = str + '';
  return str.substring(0, 1).toLowerCase() + str.substring(1);
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

export function shorten(str, max = 40, suffix = '...') {
  max = +max;
  if(isNaN(max)) max = Infinity;
  if(Array.isArray(str))
    return Array.prototype.slice.call(str, 0, Math.min(str.length, max)).concat([suffix]);
  if(typeof str != 'string' || !Number.isFinite(max) || max < 0) return str;
  str = '' + str;

  if(str.length > max) {
    let n = Math.floor((max - (2 + suffix.length)) / 2);
    let tail = str.length - n;
    let len = Math.min(n, tail);
    let insert = ' ' + suffix + ' ' + (str.length - (len + n)) + ' bytes ' + suffix + ' ';

    return str.substring(0, len) + insert + str.substring(tail);
  }
  return str;
}

export function arraysInCommon(a) {
  let i,
    c,
    n = a.length,
    min = Infinity;
  while(n) {
    if(a[--n].length < min) {
      min = a[n].length;
      i = n;
    }
  }
  c = Array.from(a.splice(i, 1)[0]);
  return c.filter((itm, indx) => {
    if(c.indexOf(itm) == indx) return a.every(arr => arr.indexOf(itm) != -1);
  });
}

export function arrayFacade(proto, itemFn = (container, i) => container.at(i)) {
  return define(proto, {
    *[Symbol.iterator]() {
      const { length } = this;
      for(let i = 0; i < length; i++) yield itemFn(this, i);
    },
    *keys() {
      const { length } = this;
      for(let i = 0; i < length; i++) yield i;
    },
    *entries() {
      const { length } = this;
      for(let i = 0; i < length; i++) yield [i, itemFn(this, i)];
    },
    *values() {
      const { length } = this;
      for(let i = 0; i < length; i++) yield itemFn(this, i);
    },
    forEach(callback, thisArg) {
      const { length } = this;
      for(let i = 0; i < length; i++) callback.call(thisArg, itemFn(this, i), i, this);
    },
    reduce(callback, accu, thisArg) {
      const { length } = this;
      for(let i = 0; i < length; i++)
        accu = callback.call(thisArg, accu, itemFn(this, i), i, this);
      return accu;
    }
  });
}

export function mod(a, b) {
  return typeof b == 'number' ? ((a % b) + b) % b : n => ((n % a) + a) % a;
}

export function pushUnique(arr, ...args) {
  let reject = [];
  for(let arg of args)
    if(arr.indexOf(arg) == -1) arr.push(arg);
    else reject.push(arg);
  return reject;
}

export function inserter(dest, next = (k, v) => {}) {
  const insert =
    isFunction(dest.set) && dest.set.length >= 2
      ? (k, v) => dest.set(k, v)
      : Array.isArray(dest)
      ? (k, v) => dest.push([k, v])
      : (k, v) => (dest[k] = v);
  let fn;
  fn = function(key, value) {
    insert(key, value);
    next(key, value);
    return fn;
  };
  fn.dest = dest;
  fn.insert = insert;
  return fn;
}

export function intersect(a, b) {
  if(!Array.isArray(a)) a = [...a];
  return a.filter(Set.prototype.has, new Set(b));
}

export function symmetricDifference(a, b) {
  return [].concat(...difference(a, b));
}

export function* partitionArray(a, size) {
  for(let i = 0; i < a.length; i += size) yield a.slice(i, i + size);
}

export function difference(a, b, includes) {
  if(!Array.isArray(a)) a = [...a];
  if(!Array.isArray(b)) b = [...b];

  if(!isFunction(includes))
    return [a.filter(x => b.indexOf(x) == -1), b.filter(x => a.indexOf(x) == -1)];

  return [a.filter(x => !includes(b, x)), b.filter(x => !includes(a, x))];
}

export function intersection(a, b) {
  if(!(a instanceof Set)) a = new Set(a);
  if(!(b instanceof Set)) b = new Set(b);
  let intersection = new Set([...a].filter(x => b.has(x)));
  return Array.from(intersection);
}

export function union(a, b, equality) {
  if(equality === undefined) return [...new Set([...a, ...b])];

  return unique([...a, ...b], equality);
}

/**
 * accepts array and function returning `true` or `false` for each element
 *
 * @param  {[type]}   array    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
export function partition(array, callback) {
  const matches = [],
    nonMatches = [];

  // push each element into array depending on return value of `callback`
  for(let element of array) (callback(element) ? matches : nonMatches).push(element);

  return [matches, nonMatches];
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
              else if(typeof y !== 'object' || y === null || !hasBuiltIn(y, 'toString'))
                t = String(y);
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
          if(Math.abs(pad) > 0)
            t = t['pad' + (pad < 0 ? 'End' : 'Start')](Math.abs(pad), /^-?0/.test(f) ? '0' : ' ');
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

export const isArrowFunction = fn =>
  (isFunction(fn) && !('prototype' in fn)) || /\ =>\ /.test(('' + fn).replace(/\n.*/g, ''));

export function predicate(fn_or_regex, pred) {
  let fn = fn_or_regex;
  if(typeof fn_or_regex == 'string') fn_or_regex = new RegExp('^' + fn_or_regex + '$');
  if(isObject(fn_or_regex) && fn_or_regex instanceof RegExp) {
    fn = arg => fn_or_regex.test(arg + '');
    fn.valueOf = function() {
      return fn_or_regex;
    };
  }
  if(isFunction(pred)) return arg => pred(arg, fn);
  return fn;
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

/*export function arrayFacade(proto, itemFn = (container, i) => container.at(i)) {
  return define(proto, ArrayFacade.prototype);
}*/

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

export function isJSFunction(fn) {
  return isFunction(fn) && !isNative(fn);
}

export function isCFunction(fn) {
  return isFunction(fn) && isNative(fn);
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
  if(
    typeof value == 'object' &&
    value !== null &&
    'buffer' in value &&
    isArrayBuffer(value.buffer)
  )
    return value.buffer;

  if(typeof value == 'string') {
    const encoder = new TextEncoder();
    const view = encoder.encode(value);
    return view.buffer;
  }
  return value;
}

export function error() {
  return { errno: 0 };
}

Location.prototype.clone = function(freeze = false, withFilename = true) {
  const { line, column, pos, file } = this;

  return new Location(line, column, pos, withFilename ? file : null, freeze);
};
Location.prototype[Symbol.toStringTag] = 'Location';

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
  return inspect(this, {
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
