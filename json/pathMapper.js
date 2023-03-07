import { ImmutablePath } from './path.js';
import Util from '../util.js';

export class PathMapper {
  map = new WeakMap();
  root = null;
  ctor = ImmutablePath;

  constructor(root, ctor = ImmutablePath) {
    if(root) this.root = root;
    if(ctor) Util.define(this, { ctor });
  }

  set(obj, path) {
    const { map, ctor } = this;

    if(map.get(obj)) return;

    if(!(path instanceof ctor)) path = new ctor(path);
    try {
      map.set(obj, path);
    } catch(e) {
      console.log('PathMapper.set', { map, e });
      throw e;
    }
  }

  get(obj) {
    const { map } = this;
    return map.get(obj);
  }

  at(path) {
    let { root, ctor } = this;
    if(!(path instanceof ctor)) path = new ctor(path);
    let obj = path.apply(root, true);
    if(typeof obj == 'object') this.set(obj, path);
    return obj;
  }

  walk(obj, fn = path => path) {
    const { map, ctor } = this;

    let path = map.get(obj);
    if(path === null) return null;
    path = fn(path);
    if(path === null) return null;
    if(!(path instanceof ctor)) path = new ctor(path);
    return this.at(path);
  }

  parent(obj) {
    return this.walk(obj, path => path.parentNode);
  }
  firstChild(obj) {
    return this.walk(obj, path => path.firstChild);
  }
  lastChild(obj) {
    return this.walk(obj, path => path.lastChild);
  }
  nextSibling(obj) {
    return this.walk(obj, path => path.nextSibling);
  }
  previousSibling(obj) {
    return this.walk(obj, path => path.previousSibling);
  }

  get path2obj() {
    return {
      get: path => this.at(path),
      has: path => this.has(path),
      set: (path, obj) => this.set(obj, path)
    };
  }

  get obj2path() {
    return {
      map: this.map,
      get(obj) {
        const { map } = this;
        return map.get(obj);
      },
      has(obj) {
        const { map } = this;
        return map.has(obj);
      },
      set(obj, path) {
        const { map } = this;
        map.set(obj, path);
        return this;
      }
    };
  }

  get maps() {
    return [this.obj2path, this.path2obj];
  }

  /*setFactory(fn) {
    this.factory = (typeof(fn) == 'function') ? fn : null;
  }*/
}

export class WrapperMapper {
  obj2wrapper = new WeakMap();
  ctor = null;

  constructor(ctor) {
    if(ctor) Util.define(this, { ctor });
  }

  get(obj) {}
}
