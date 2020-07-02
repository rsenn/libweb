import Util from '../util.js';
import { toXML, dump } from './common.js';
import { ImmutablePath, MutablePath } from '../json.js';

export function DereferenceError(object, member, pos, locator) {
  let error = this instanceof DereferenceError ? this : new DereferenceError(object.index);
  //console.log('DereferenceError', { object, member, locator });
  //console.log('DereferenceError', { ref });
  let stack = Util.getCallerStack()
    .filter(frame => null !== frame.getFileName())
    .map(frame => {
      let method = frame.getMethodName();
      if(method) method = (frame.getTypeName() || Util.className(frame.getThis())) + '.' + method;
      else method = frame.getFunctionName();

      return `${('' + frame.getFileName()).replace(/.*plot-cv\//, '')}:${frame.getLineNumber()}:${frame.getColumnNumber()} ${method}`;
    });

  return Object.assign(
    error,
    { object, member, pos, locator },
    {
      message: `Error dereferencing ${Util.className(object)} @ ${locator.toString() /*map((part, i) => (i == pos ? '<<' + part + '>>' : part)).join(',')*/}\nxml: ${Util.abbreviate(toXML(locator.root))}\nno member '${Util.inspect(member)}' in ${Util.inspect(object, 2)} \n` + stack.join('\n'),
      stack
    }
  );
}

DereferenceError.prototype.toString = function() {
  const { message, object, member, pos, locator, stack } = this;
  return `${message}\n${dump({ object, member, pos, locator, stack }, 2)}`;
};

export const ChildrenSym = Symbol('⊳');

//export const EaglePath = ImmutablePath || Util.immutableClass(MutablePath);

export class EagleReference {
  constructor(root, path) {
    this.path = path instanceof ImmutablePath ? path : new ImmutablePath(path);
    this.root = root;
    if(!this.dereference(false)) {
      //console.log('dereference:', { path, root: Util.abbreviate(toXML(root), 10) });
      throw new Error(this.path.join(','));
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
      r = (Util.isObject(root) && 'owner' in root && path.apply(root.owner, true)) || path.apply(root);
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

  get nextSibling() {
    return EagleRef(this.root, this.path.nextSibling);
  }

  get firstChild() {
    return EagleRef(this.root, this.path.firstChild);
  }

  down(...args) {
    return new EagleReference(this.root, [...this.path.toArray(), ...args]);
  }
  up(n = 1) {
    return new EagleReference(this.root, this.path.up(n));
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
    return `EagleReference { path:${this.path.inspect()}, root:${Util.abbreviate(toXML(this.root, 0), 40)}  }`;
  }
  inspect() {
    return this[Symbol.for('nodejs.util.inspect.custom')](...arguments);
  }
}

export const EagleRef = function EagleRef(root, path) {
  if(Util.isObject(root) && Util.isObject(root.root)) root = root.root;

  let obj = new EagleReference(root, path);
  return Object.freeze(obj);
};

/*
["up", "down", "left", "right", "slice"].forEach(method =>
    (EagleReference.prototype[method] = function(...args) {
      return EagleRef(this.root, this.path[method](...args));
    })
);*/
Object.assign(EagleReference.prototype, {});

/*let props = ["nextSibling", "prevSibling", "parent", "parentNode", "firstChild", "lastChild", "depth"].reduce((acc, method) => ({
    ...acc,
    [method]: {
      get: function(...args) {
        let path = this.path[method](...args); //ImmutablePath.prototype[method].apply(this.path, args);
        //console.log(method+" path:",path.join(','), " this.path:",this.path.join(','));
        return path.existsIn(this.root) ? new EagleRef(this.root, path) : null;
      }
    }
  }), {});

//console.log("props:", props);
Object.defineProperties(EagleReference.prototype, props);
*/
