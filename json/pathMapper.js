import { ImmutablePath } from './path.js';
import Util from '../util.js';

export class PathMapper {
  obj2path = new WeakMap();
  root = null;
  ctor = ImmutablePath;

  constructor(root, ctor = ImmutablePath) {
    if(root) this.root = root;
    if(ctor) Util.define(this, { ctor });
  }

  set(obj, path) {
    const { obj2path, ctor } = this;

    if(obj2path.get(obj)) return;

    if(!(path instanceof ctor)) path = new ctor(path);
    obj2path.set(obj, path);
  }

  get(obj) {
    const { obj2path } = this;
    return obj2path.get(obj);
  }

  at(path) {
    let { root, ctor } = this;
    if(!(path instanceof ctor)) path = new ctor(path);
    let obj = path.apply(root, true);
    if(typeof obj == 'object') this.set(obj, path);
    return obj;
  }

  walk(obj, fn = path => path) {
    const { obj2path, ctor } = this;

    let path = obj2path.get(obj);
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
