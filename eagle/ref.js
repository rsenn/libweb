import { toXML } from '../json.js';
import { abbreviate } from '../misc.js';
import { className } from '../misc.js';
import { isObject } from '../misc.js';
import inspect from '../objectInspect.js';
import { Pointer } from '../pointer.js';
import { ImmutableXPath } from '../xml/xpath.js';
import { concat } from './common.js';
import { text } from './common.js';

export const ChildrenSym = Symbol('⊳');

export class EagleReference {
  constructor(root, path, check = true) {
    if(path instanceof ImmutableXPath) {
      path = path.toPointer(root);
      //console.log('new EagleReference', { path });
    }
  
    try {
      if(!path.deref) path = new Pointer([...path]);
    } catch(e) {}
//path = new Pointer(path);
  
    //console.log('new EagleReference', { path, root });

    this.path = path;
    this.root = root;

    //console.log('EagleReference', { root: abbreviate(toXML(root), 10), path });

    if(check && !this.dereference(true)) {
      let pathStr = inspect([...this.path]);
      //console.log('dereference:', { path, pathStr });

      throw new Error(this.root.tagName + ' ' + pathStr);
    }
  }

  get type() {
    return typeof this.path.last == 'number' ? Array : Object;
  }

  getPath(root) {
    let path = new Pointer();
    let ref = this;
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
      r = (isObject(root) && 'owner' in root && path.deref(root.owner, true)) || path.deref(root);
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
      let key = this.path[this.path.length - 1];
      let obj = this.path.slice(0, -1).apply(this.root);
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
    // return Array.prototype.concat.call(this, args);
    return new EagleReference(this.root, this.path.concat(args), false);
  }
  up(n = 1) {
    return new EagleReference(this.root, this.path.slice(0, -n), false);
  }
  /*left(n) {
    return new EagleReference(this.root, this.path.left(n), false);
  }
  right(n) {
    return new EagleReference(this.root, this.path.right(n), false);
  }*/

  shift(n = 1) {
    let root = this.root;
    if(n < 0) n = this.path.length + n;
    for(let i = 0; i < n; i++) {
      let k = this.path[i];
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

export const EagleRef = function EagleRef(root, path) {
  if(isObject(root) && isObject(root.root)) root = root.root;
  let obj = new EagleReference(root, path);
  obj = Object.freeze(obj);
  //console.log('EagleRef', console.config({ depth: 2 }), { root: obj.root, path: obj.path });
  return obj;
};

Object.assign(EagleReference.prototype, { deref: EagleReference.prototype.dereference });