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

    if(map.get(obj))
      return;

    if(!(path instanceof ctor)) path = new ctor(path);
    // if(path.length === 0) this.root = obj;
    map.set(obj, path);
  /*  let properties = 'tagName' in obj ? ['children', 'attributes'] : Object.keys(obj);

    for(let prop of properties) if(prop in obj && Util.isObject(obj[prop])) map.set(obj[prop], path.concat([prop]));*/
  }

  get(obj) {
        const { map } = this;
    return map.get(obj);
  }

  at(path) {
    let { root } = this;
    for(let prop of path)
      root = root[prop];
    this.set(root, path);
    return root;
  }

  walk(obj, fn = path => path) {
            const { map,ctor } = this;

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

  /*setFactory(fn) {
    this.factory = (typeof(fn) == 'function') ? fn : null;
  }*/
}
