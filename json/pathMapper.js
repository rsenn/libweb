import { Path } from './path.js';

export class PathMapper {
  map = null;
  root = null;

  constructor() {
    this.map = new WeakMap();
  }

  at(path) {
    if(typeof path == 'string' && path[0] == '/') path = Path.parseXPath(path);
    if(!(path instanceof Path)) path = new Path(path);
    return path.apply(this.root, true);
  }

  xpath(obj) {
    let path = this.get(obj);
    return path ? path.xpath(this.root) : null;
  }

  set(obj, path) {
    if(!(path instanceof Path)) path = new Path(path);
    if(path.length === 0) this.root = obj;
    this.map.set(obj, path);
  }

  get(obj) {
    let path = this.map.get(obj) || null;
    return path;
  }

  walk(obj, fn = path => path) {
    let path = this.get(obj);
    if(path === null) return null;
    path = fn(path);
    if(path === null) return null;
    if(!(path instanceof Path)) path = new Path(path);
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
}
