import { ImmutablePath } from './path.js';
import Util from '../util.js';
import { ImmutableXPath, MutableXPath, XPath, findXPath, parseXPath } from '../xml/xpath.js';

export class PathMapper {
  map = null;
  root = null;
  parser = null;

  constructor(parser) {
    this.map = new WeakMap();
    if (parser)
      this.parser = parser;
  }

  at(path, parser = this.parser) {
    if (typeof path == 'string' && path[0] == '/') path = parser(path);
    if (!(path instanceof ImmutablePath)) path = new ImmutablePath(path);
    return path.apply(this.root, true);
  }

  xpath(obj) {
    let path = this.get(obj);
    return path ? ImmutableXPath.from(path, this.root) : null;
  }

  set(obj, path) {
    if (!(path instanceof ImmutablePath)) path = new ImmutablePath(path);
    if (path.length === 0) this.root = obj;
    this.map.set(obj, path);
    let properties = 'tagName' in obj ? ['children', 'attributes'] : Object.keys(obj);

    for (let prop of properties) if (prop in obj && Util.isObject(obj[prop])) this.map.set(obj[prop], path.concat([prop]));
  }

  get(obj) {
    let path = this.map.get(obj) || null;
    return path;
  }

  walk(obj, fn = path => path) {
    let path = this.get(obj);
    if (path === null) return null;
    path = fn(path);
    if (path === null) return null;
    if (!(path instanceof ImmutablePath)) path = new ImmutablePath(path);
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
