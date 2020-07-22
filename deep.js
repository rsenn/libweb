import Util from './util.js';

export const isPlainObject = obj => {
  if((obj != null ? obj.constructor : void 0) == null) return false;
  return obj.constructor.name === 'Object';
};

export const clone = obj => {
  let c, k, v, j, len;
  if(Util.isArray(obj)) {
    c = [];
    for(j = 0, len = obj.length; j < len; j++) {
      v = obj[j];
      c.push(clone(v));
    }
    return c;
  } else if(isPlainObject(obj)) {
    c = {};
    for(k in obj) {
      v = obj[k];
      c[k] = clone(v);
    }
    return c;
  } else {
    return obj;
  }
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
  } else {
    return false;
  }
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
  if(filter(root, path)) selected.push({ path: path, value: root });
  else if(Util.isObject(root)) for(k in root) selected = selected.concat(select(root[k], filter, [...path, k]));
  return selected;
};

export const find = (node, filter, path, root) => {
  let k,
    ret = null;
  path = (typeof path == 'string' ? path.split(/[\.\/]/) : path) || [];
  if(!root) { root = node; ret = {path:null,value: null}; }
  if(filter(node, path, root)) {
    ret = { path: path, value: node, root };
  } else if(Util.isObject(node)) {
    for(k in node) {
      ret = find(node[k], filter, [...path, k], root);
      if(ret) break;
    }
  }
  return ret;
};

export const iterate = function*(value, filter = v => true, path = []) {
  //throw new Error();
  let root = arguments[3] || value,
    selected = [],
    r;

  if((r = filter(value, path, root))) yield [value, path, root];
  if(r !== -1) if (Util.isObject(value)) for(let k in value) yield* iterate(value[k], filter, [...path, k], root);
};

export const flatten = function(iter, dst = {}, filter = (v, p) => typeof v != 'object', map = (p, v) => [p.join('.'), v]) {
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
  path = typeof path == 'string' ? path.split(/[\.\/]/) : [...path];

  if(path.length == 0) return Object.assign(root, value);

  for(let j = 0, len = path.length; j + 1 < len; j++) {
    let pathElement = isNaN(path[j]) ? path[j] : +path[j];
    if(!(pathElement in root)) root[pathElement] = /^[0-9]+$/.test(path[j + 1]) ? [] : {};
    root = root[pathElement];
  }
  let lastPath = path.pop();

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
    for(k in obj) {
      v = obj[k];
      transformed[k] = transform(v, filter, [...path, k]);
    }
    return transformed;
  } else {
    return obj;
  }
};

export default {
  isPlainObject,
  clone,
  equals,
  extend,
  select,
  find,
  get,
  set,
  transform,
  iterate,
  flatten
};
