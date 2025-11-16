import { DereferenceError, Pointer } from './pointer.js';
import { isObject, isNumeric } from './misc.js';

export const TYPE_ALL = 0b11111111111111;
export const TYPE_ARRAY = 1 << 13;
export const TYPE_BIG_DECIMAL = 1 << 9;
export const TYPE_BIG_FLOAT = 1 << 7;
export const TYPE_BIG_INT = 1 << 8;
export const TYPE_BOOL = 1 << 2;
export const TYPE_FLOAT64 = 1 << 10;
export const TYPE_FUNCTION = 1 << 12;
export const TYPE_INT = 1 << 3;
export const TYPE_NAN = 1 << 11;
export const TYPE_NULL = 1 << 1;
export const TYPE_NUMBER = 0b111110001 << 3;
export const TYPE_OBJECT = 1 << 4;
export const TYPE_PRIMITIVE = 0b111111101111;
export const TYPE_STRING = 1 << 5;
export const TYPE_SYMBOL = 1 << 6;
export const TYPE_UNDEFINED = 1;

export const FILTER_HAS_KEY = 0x40000000;
export const FILTER_KEY_OF = 0;
export const FILTER_NEGATE = 0x80000000;
export const NO_RECURSE = 2;
export const PATH_AS_ARRAY = 0;
export const PATH_AS_POINTER = 0x8000000;
export const RECURSE = 0;
export const YIELD = 1;
export const YIELD_NO_RECURSE = 3;

function ValueType(value) {
  return {
    bigdecimal: TYPE_BIG_DECIMAL,
    bigfloat: TYPE_BIG_FLOAT,
    bigint: TYPE_BIG_INT,
    boolean: TYPE_BOOL,
    number: isNaN(value) ? TYPE_NAN : Number.isInteger(value) ? TYPE_INT : TYPE_FLOAT64,
    undefined: TYPE_UNDEFINED,
    symbol: TYPE_SYMBOL,
    object: value === null ? TYPE_NULL : TYPE_OBJECT,
    function: TYPE_FUNCTION | TYPE_OBJECT,
  }[typeof value];
}

function ReturnValuePath(value, path, flags) {
  if(flags & PATH_AS_STRING) path = path.join('.');

  switch (flags & RETURN_MASK) {
    case RETURN_VALUE_PATH:
      return [value, path];
    case RETURN_PATH_VALUE:
      return [path, value];
    case RETURN_PATH:
      return path;
    case RETURN_VALUE:
      return value;
  }
}

function ReturnValuePathFunction(flags) {
  /*if(flags & PATH_AS_POINTER) {
    const fn = ReturnValuePathFunction(flags & ~PATH_AS_POINTER);
    return (value, path, root) => fn(value, new Pointer(path), root);
  }*/

  switch (flags & RETURN_MASK) {
    case RETURN_VALUE_PATH:
      return (value, path, root) => [value, path, root];
    case RETURN_PATH_VALUE:
      return (value, path, root) => [path, value, root];
    case RETURN_PATH:
      return (value, path) => path;
    case RETURN_VALUE:
      return (value, path) => value;
  }
}

export const RETURN_VALUE_PATH = 0;
export const RETURN_PATH = 1 << 24;
export const RETURN_VALUE = 2 << 24;
export const RETURN_PATH_VALUE = 3 << 24;
export const RETURN_MASK = 7 << 24;
export const PATH_AS_STRING = 1 << 28;
export const NO_THROW = 1 << 29;
export const MAXDEPTH_MASK = 0xffffff;

function isPlainObject(obj) {
  if((obj != null ? obj.constructor : void 0) == null) return false;
  return obj.constructor.name === 'Object';
}

export function clone(obj) {
  const out = Array.isArray(obj) ? [] : {};

  for(let key in obj) {
    const v = obj[key];
    out[key] = typeof v === 'object' && v !== null ? clone(v) : v;
  }

  return out;
}

export function equals(a, b) {
  if(a === b) return true;

  if(Array.isArray(a)) {
    if(!(Array.isArray(b) && a.length === b.length)) return false;

    for(let i = 0, j = 0, ref = a.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if(!equals(a[i], b[i])) return false;
    }

    return true;
  }

  if(isPlainObject(a)) {
    const size_a = Object.keys(a).length;

    if(!(isPlainObject(b) && size_a === Object.keys(b).length)) return false;

    for(let k in a) if(!equals(a[k], b[k])) return false;

    return true;
  }

  return false;
}

export function extend(...args) {
  const destination = args[0],
    sources = 2 <= args.length ? Array.prototype.slice.call(args, 1) : [];

  const { length } = sources;

  for(let j = 0; j < length; j++) {
    const source = sources[j];

    for(let k in source) {
      if(isPlainObject(destination[k]) && isPlainObject(source[k])) extend(destination[k], source[k]);
      else destination[k] = clone(source[k]);
    }
  }

  return destination;
}

export function select(root, filter, flags = 0, mask = TYPE_ALL, props = null, path = []) {
  const valuePathFn = ReturnValuePathFunction(flags);

  filter ??= v => true;

  const keyOf = Array.isArray(props) && (flags & FILTER_HAS_KEY) == FILTER_KEY_OF;
  const negate = !!(flags & FILTER_NEGATE);

  const selected = [];

  function recurse(value, path) {
    const ret = filter(value, path, root);

    if(ret === -1) return -1;
    if(ret) selected.push(valuePathFn(value, path, flags));

    if(isObject(value))
      for(let k in value) {
        const v = value[k];

        if(mask != TYPE_ALL && !(ValueType(v) & mask)) continue;
        if(keyOf && (props.indexOf(k) == -1) ^ negate) continue;

        recurse(v, path.concat([isNaN(+k) ? k : +k]));
      }
  }

  recurse(root, flags & PATH_AS_POINTER ? new Pointer(path) : path);
  return selected;
}

export function find(root, filter, flags = 0, mask = TYPE_ALL, props = null, path = []) {
  filter ??= v => true;

  const keyOf = Array.isArray(props) && (flags & FILTER_HAS_KEY) == FILTER_KEY_OF;
  const negate = !!(flags & FILTER_NEGATE);

  function recurse(value, path) {
    const ret = filter(value, path, root);

    if(ret === -1) return -1;
    if(ret) return ReturnValuePath(value, path, flags);

    if(typeof value == 'object' && value != null)
      for(let k in value) {
        const v = value[k];

        if(mask != TYPE_ALL && !(ValueType(v) & mask)) continue;
        if(keyOf && (props.indexOf(k) == -1) ^ negate) continue;

        const result = recurse(v, path.concat([isNaN(+k) ? k : +k]));
        if(result) return result;
      }
  }

  return recurse(root, flags & PATH_AS_POINTER ? new Pointer(path) : path);
}

export function forEach(...args) {
  const [value, fn, path = []] = args;
  let root = args[3] ?? value;

  fn(value, path, root);

  if(isObject(value)) for(let k in value) forEach(value[k], fn, path.concat([isNaN(+k) ? k : +k]), root);
}

export const iterate = (root, filter, flags = RETURN_VALUE_PATH, mask = TYPE_ALL, props) => {
  const valuePathFn = ReturnValuePathFunction(flags);

  filter ??= v => true;

  const keyOf = Array.isArray(props) && (flags & FILTER_HAS_KEY) == FILTER_KEY_OF;
  const negate = !!(flags & FILTER_NEGATE);

  function* gen(value, path) {
    let r;

    if((r = filter(value, path, root))) yield valuePathFn(value, path, root);

    if(r !== -1)
      if(typeof value == 'object' && value != null) {
        for(let k in value) {
          const v = value[k];

          if(mask != TYPE_ALL && !(ValueType(v) & mask)) continue;

          if(keyOf && (props.indexOf(k) == -1) ^ negate) continue;

          yield* gen(v, path.concat([isNaN(+k) ? k : +k]));
        }
      }
  }

  return gen(root, flags & PATH_AS_POINTER ? new Pointer([]) : []);
};

export const flatten = (iter, dst = {}, filter = (v, p) => typeof v != 'object' && v != null, map = (p, v) => [p.join('.'), v]) => {
  let insert;

  if(!iter.next) iter = iterate(iter, filter);

  if(typeof dst.set == 'function') insert = (name, value) => dst.set(name, value);
  else if(typeof dst.push == 'function') insert = (name, value) => dst.push([name, value]);
  else insert = (name, value) => (dst[name] = value);

  for(const [value, path] of iter) insert(...map(path, value));

  return dst;
};

export function get(root, path) {
  //console.log("deep.get", /*console.config({ depth:1}),*/{ root,path });
  path = typeof path == 'string' ? path.split(/[\.\/]/) : [...path];

  const { length } = path;

  for(let j = 0; j < length; j++) {
    const k = path[j];
    root = root[k];
  }

  return root;
}

export function set(root, path, value) {
  //console.log("deep.set", { root,path,value });
  path = typeof path == 'string' ? path.split(/[\.\/]/) : [...path];

  if(path.length == 0) return Object.assign(root, value);

  const { length } = path;

  for(let j = 0; j + 1 < length; j++) {
    let pathElement = isNaN(+path[j]) ? path[j] : +path[j];
    //console.log("path element:",pathElement);
    if(!(pathElement in root)) root[pathElement] = /^[0-9]+$/.test(path[j + 1]) ? [] : {};
    root = root[pathElement];
  }

  let lastPath = path.pop();
  root[lastPath] = value;
  return root;
  return (root[lastPath] = value);
}

export function delegate(root, path) {
  if(path) {
    const last = path.pop();
    const obj = get(root, path);

    return function(value) {
      return value !== undefined ? (obj[last] = value) : obj[last];
    };
  }

  return function(path, value) {
    return value !== undefined ? obj.set(root, path, value) : obj.get(root, path);
  };
}

export function transform(obj, filter, t, path = []) {
  if(filter(obj, path)) return t(obj, path);

  if(Array.isArray(obj)) {
    const transformed = [];

    const { length } = obj;
    for(let j = 0; j < length; j++) {
      const v = obj[j];
      transformed.push(transform(v, filter, t, path.concat([j])));
    }

    return transformed;
  }

  if(isPlainObject(obj)) {
    const transformed = {};

    for(let k in obj) {
      const v = obj[k];
      transformed[k] = transform(v, filter, path.concat([k]));
    }

    return transformed;
  }

  return obj;
}

export function unset(object, path) {
  if(isObject(object)) {
    let parts = typeof path == 'string' ? path.split('.') : path;

    if(parts.length > 1) {
      unset(object[parts.shift()], parts);
    } else {
      if(Array.isArray(object) && isNumeric(path)) object.splice(+path, 1);
      else delete object[path];
    }
  }

  return object;
}

export function unflatten(map, obj = {}) {
  for(const [path, value] of map) {
    set(obj, path, value);
  }

  return obj;
}
