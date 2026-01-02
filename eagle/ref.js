import { toXML } from '../json.js';
import { abbreviate } from '../misc.js';
import { className } from '../misc.js';
import { define } from '../misc.js';
import { isObject } from '../misc.js';
import { nonenumerable } from '../misc.js';
import inspect from '../objectInspect.js';
import { Pointer } from '../pointer.js';
import { ImmutableXPath } from '../xml/xpath.js';
import { concat } from './common.js';
import { text } from './common.js';

export const ChildrenSym = Symbol('⊳');

export class EagleReference {
  constructor(root, path, check = true) {
    if(path instanceof ImmutableXPath) path = path.toPointer(root);

    try {
      if(!path.deref) path = new Pointer([...path]);
    } catch(e) {}

    //console.log('new EagleReference', { path, root });

    while(isObject(path) && 'path' in path && 'root' in path) path = path.path;

    this.path = path;
    this.root = root;

    if(check && !this.dereference(true)) throw new Error((this.root?.tagName ?? '<?doc?>') + ' ' + inspect([...path]));
  }

  get type() {
    return typeof this.path.last == 'number' ? Array : Object;
  }

  getPath(root) {
    const path = new Pointer(),
      ref = this;

    do {
      path = ref.path.concat(path);
      if(root === undefined || root == ref) break;
    } while(true);

    return path;
  }

  dereference(noThrow) {
    const { path, root } = this;
    let r;

    if(path.length === 0) return root;

    try {
      r = (isObject(root) && 'owner' in root && path.deref(root.owner, false)) || path.deref(root, false);
    } catch(err) {
      if(!noThrow) throw err;
      //console.log('err:', err.message, err.stack);
    }

    return r;
  }

  replace(value) {
    const obj = this.path.slice(0, -1).apply(this.root);

    return (obj[this.path.last] = value);
  }

  entry() {
    if(this.path.size > 0) {
      const key = this.path[this.path.length - 1];
      const obj = this.path.slice(0, -1).apply(this.root);

      return [obj[key], key, obj];
    }
    return [this.root];
  }

  get parent() {
    return EagleRef(this.root, this.path.slice(0, -1));
  }

  get prevSibling() {
    return EagleRef(this.root, this.path.prevSibling);
  }
  get nextSibling() {
    return EagleRef(this.root, this.path.nextSibling);
  }

  get firstChild() {
    return EagleRef(this.root, this.path.firstChild);
  }
  get lastChild() {
    return EagleRef(this.root, this.path.lastChild);
  }

  down(...args) {
    return new EagleReference(this.root, this.path.concat(args), false);
  }

  up(n = 1) {
    let { root, path } = this;

    while(isObject(path) && 'path' in path) path = path.path;

    return new EagleReference(root, path.slice(0, -n), false);
  }

  shift(n = 1) {
    let root = this.root;
    if(n < 0) n = this.path.length + n;

    for(let i = 0; i < n; i++) {
      const k = this.path[i];
      root = root[k];
    }

    return new EagleReference(root, this.path.slice(n));
  }

  [Symbol.inspect]() {
    return text(className(this), 38, 5, 219) + ' { ' + this.path[Symbol.inspect]() + ` , root:${abbreviate(toXML(this.root, 0), 40)}  }`;
  }

  inspect() {
    return this[Symbol.inspect](...arguments);
  }
}

define(EagleReference.prototype, nonenumerable({ [Symbol.toStringTag]: 'EagleReference' }));

export function EagleRef(root, path, check = false) {
  if(isObject(root) && isObject(root.root)) root = root.root;
  if(isObject(path) && path instanceof EagleReference) {
    root = path.root;
    path = path.path;
  }

  if(root === null && check) throw new Error(`EagleRef root==null`);

  const obj = new EagleReference(root, path, check);

  Object.freeze(obj);

  //console.log('EagleRef', console.config({ depth: 2 }), { root: obj.root, path: obj.path });

  return obj;
}

define(EagleReference.prototype, nonenumerable({ deref: EagleReference.prototype.dereference }));