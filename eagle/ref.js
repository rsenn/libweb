import { toXML } from '../json.js';
import { text, concat } from './common.js';
import { Pointer as ImmutablePath } from '../pointer.js';
import { ImmutableXPath } from '../xml/xpath.js';

export const ChildrenSym = Symbol('⊳');

export class EagleReference {
  constructor(root, path, check = true) {
    if(path instanceof ImmutableXPath) path = [...path.toPointer(root)];

    if(!(path instanceof ImmutablePath)) path = new ImmutablePath(path);
    this.path = path;
    this.root = root;
    //console.log('EagleReference', { root: abbreviate(toXML(root), 10), path });
    if(check && !this.dereference(true)) {
      //console.log('dereference:', { path, root: abbreviate(toXML(root), 10) });
      throw new Error(this.root.tagName + ' ' + this.path);
    }
  }

  get type() {
    return typeof this.path.last == 'number' ? Array : Object;
  }

  getPath(root) {
    let path = new ImmutablePath();
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
    try {
      r = (isObject(root) && 'owner' in root && path.deref(root.owner, true)) || path.deref(root);
    } catch(err) {
      if(!noThrow) throw err;
      //console.log('err:', err.message, err.stack);
    }
    return r;
  }

  replace(value) {
    const obj = this.path.up().apply(this.root);
    return (obj[this.path.last] = value);
  }

  entry() {
    if(this.path.size > 0) {
      let key = this.path.last;
      let obj = this.path.up().apply(this.root);
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
    return new EagleReference(this.root, this.path.up(n), false);
  }
  left(n) {
    return new EagleReference(this.root, this.path.left(n), false);
  }
  right(n) {
    return new EagleReference(this.root, this.path.right(n), false);
  }

  shift(n = 1) {
    let root = this.root;
    if(n < 0) n = this.path.length + n;
    for(let i = 0; i < n; i++) {
      let k = this.path[i];
      root = root[k];
    }
    return new EagleReference(root, this.path.slice(n));
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return text(className(this), 38, 5, 219) + ' { ' + this.path[Symbol.for('nodejs.util.inspect.custom')]() + ` , root:${abbreviate(toXML(this.root, 0), 40)}  }`;
  }
  inspect() {
    return this[Symbol.for('nodejs.util.inspect.custom')](...arguments);
  }
}

export const EagleRef = function EagleRef(root, path) {
  if(isObject(root) && isObject(root.root)) root = root.root;
  //console.log('EagleRef', { root, path });
  let obj = new EagleReference(root, path);
  return Object.freeze(obj);
};

Object.assign(EagleReference.prototype, { deref: EagleReference.prototype.dereference });
