import Util from './util.js';

export const isPlainObject = obj => {
  if((obj != null ? obj.constructor : void 0) == null) return false;
  return obj.constructor.name === 'Object';
};

export const clone = obj => {
  let out, v, key;
  out = Array.isArray(obj) ? [] : {};
  for(key in obj) {
    v = obj[key];
    out[key] = typeof v === 'object' && v !== null ? clone(v) : v;
  }
  return out;
};

export const equals = (a, b) => {
  let i, k, size_a, j, ref;
  if(a === b) {
    return true;
  } else if(Util.isArray(a)) {
    if(!(Util.isArray(b) && a.length === b.length)) {
      return false;
    }
    for(i = j = 0, ref = a.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if(!equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  } else if(isPlainObject(a)) {
    size_a = Util.size(a);
    if(!(isPlainObject(b) && size_a === Util.size(b))) {
      return false;
    }
    for(k in a) {
      if(!equals(a[k], b[k])) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const extend = (...args) => {
  let destination, k, source, sources, j, len;
  (destination = args[0]), (sources = 2 <= args.length ? Array.prototype.slice.call(args, 1) : []);
  for(j = 0, len = sources.length; j < len; j++) {
    source = sources[j];
    for(k in source) {
      if(isPlainObject(destination[k]) && isPlainObject(source[k])) {
        extend(destination[k], source[k]);
      } else {
        destination[k] = clone(source[k]);
      }
    }
  }
  return destination;
};

export const select = (root, filter, path) => {
  let elementPath,
    k,
    selected = [],
    v;
  path = typeof path == 'string' ? path.split(/\.\//) : path;
  if(!path) path = [];
  if(filter(root, path)) selected.push({ path, value: root });
  else if(Util.isObject(root)) for(k in root) selected = selected.concat(select(root[k], filter, path.concat([isNaN(+k) ? k : +k])));
  return selected;
};

export const find = (node, filter, path, root) => {
  let k,
    ret,
    result = null;
  path = (typeof path == 'string' ? path.split(/[\.\/]/) : path) || [];
  if(!root) {
    root = node;
    result = { path: null, value: null };
  }
  ret = filter(node, path, root);

  if(ret === -1) return -1;
  else if(ret) result = { path, value: node };
  else if(typeof node == 'object' && node != null) {
    for(k in node) {
      result = find(node[k], filter, [...path, k], root);
      if(result) break;
    }
  }
  return result;
};

export const forEach = function(...args) {
  const [value, fn, path = []] = args;
  let root = args[3] ?? value;

  fn(value, path, root);

  if(Util.isObject(value)) for(let k in value) forEach(value[k], fn, path.concat([isNaN(+k) ? k : +k]), root);
};

export const iterate = function* (...args) {
  const [value, filter = v => true, path = []] = args;
  let root = args[3] ?? value,
    r;

  if((r = filter(value, path, root))) yield [value, path, root];
  if(r !== -1)
    if(Util.isObject(value)) {
      for(let k in value) yield* iterate(value[k], filter, path.concat([isNaN(+k) ? k : +k]), root);
    }
};

export const flatten = (iter, dst = {}, filter = (v, p) => typeof v != 'object' && v != null, map = (p, v) => [p.join('.'), v]) => {
  let insert;
  if(!iter.next) iter = iterate(iter, filter);

  if(typeof dst.set == 'function') insert = (name, value) => dst.set(name, value);
  else if(typeof dst.push == 'function') insert = (name, value) => dst.push([name, value]);
  else insert = (name, value) => (dst[name] = value);

  for(let [value, path] of iter) insert(...map(path, value));

  return dst;
};

export const get = (root, path) => {
  let len;
  path = typeof path == 'string' ? path.split(/[\.\/]/) : path;
  path = Util.clone(path);
  for(let j = 0, len = path.length; j < len; j++) {
    let pathElement = path[j];
    root = root[pathElement];
  }
  return root;
};

export const set = (root, path, value) => {
  //console.log("deep.set", { root,path,value });
  path = typeof path == 'string' ? path.split(/[\.\/]/) : [...path];

  if(path.length == 0) return Object.assign(root, value);

  for(let j = 0, len = path.length; j + 1 < len; j++) {
    let pathElement = isNaN(+path[j]) ? path[j] : +path[j];
    //console.log("path element:",pathElement);
    if(!(pathElement in root)) root[pathElement] = /^[0-9]+$/.test(path[j + 1]) ? [] : {};
    root = root[pathElement];
  }
  let lastPath = path.pop();
  root[lastPath] = value;
  return root;
  return (root[lastPath] = value);
};

export const delegate = (root, path) => {
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
};

export const transform = (obj, filter, t) => {
  let k,
    transformed,
    v,
    j,
    len,
    path = arguments[3] == [];
  if(filter(obj, path)) {
    return t(obj, path);
  } else if(Util.isArray(obj)) {
    transformed = [];
    for(j = 0, len = obj.length; j < len; j++) {
      v = obj[j];
      transformed.push(transform(v, filter, t, [...path, j]));
    }
    return transformed;
  } else if(isPlainObject(obj)) {
    transformed = {};
    q;
    for(k in obj) {
      v = obj[k];
      transformed[k] = transform(v, filter, [...path, k]);
    }
    return transformed;
  }
  return obj;
};

export const unset = (object, path) => {
  if(object && typeof object === 'object') {
    let parts = typeof path == 'string' ? path.split('.') : path;

    if(parts.length > 1) {
      unset(object[parts.shift()], parts);
    } else {
      if(Util.isArray(object) && Util.isNumeric(path)) object.splice(+path, 1);
      else delete object[path];
    }
  }
  return object;
};

export const unflatten = (map, obj = {}) => {
  for(let [path, value] of map) {
    set(obj, path, value);
  }
  return obj;
};

export default {
  isPlainObject,
  clone,
  equals,
  extend,
  select,
  forEach,
  find,
  get,
  set,
  transform,
  iterate,
  flatten,
  unflatten,
  unset
};
