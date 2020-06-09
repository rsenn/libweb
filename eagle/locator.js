import Util from '../util.js';
import { text, inspect, toXML, dump } from './common.js';

export function DereferenceError(object, member, pos, locator) {
  let error = this instanceof DereferenceError ? this : new DereferenceError(object.index);
  let { owner, ref } = object;
  console.log('DereferenceError', { object, member, locator });
  console.log('DereferenceError', { ref });
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
      message: `Error dereferencing ${Util.className(object)} @ ${locator.toString() /*map((part, i) => (i == pos ? '<<' + part + '>>' : part)).join(',')*/} xml: ${Util.abbreviate(toXML(locator.root))}  no member '${member}' \n` + stack.join('\n'),
      stack
    }
  );
}

DereferenceError.prototype.toString = function() {
  const { message, object, member, pos, locator, stack } = this;
  return `${message}\n${dump({ object, member, pos, locator, stack }, 2)}`;
};

const ChildrenSym = Symbol('⊳');

export const EaglePath = Util.immutableClass(
  class EaglePath extends Array {
    constructor(path = []) {
      super(/*path.length*/);
      for(let i = 0; i < path.length; i++) {
        let value = /*(path[i] == 'children' || path[i] === ChildrenSym) ? ChildrenSym : */ typeof path[0] == 'string' && /^[0-9]+$/.test(path[i]) ? parseInt(path[i]) : path[i];

        Array.prototype.push.call(this, value); // this.push(value); //[i] = value;
      }
      //      this.length = path.length;
    }

    get [Symbol.species]() {
      return EaglePath;
    }

    clone() {
      return new EaglePath(this);
    }

    get size() {
      return this.length;
    }

    /**
     * @brief Return new locator advanced to right
     *
     * @param      {number}  [n=1]   Number of steps to right
     * @return     {EaglePath}
     */
    right(n = 1) {
      const [base, last] = this.split(-1);
      return new EaglePath([...base, this.last + 1]);
    }

    /**
     * @brief Return new locator advanced to left
     *
     * @param      {number}  [n=1]   Number of steps to left
     * @return     {EaglePath}
     */
    left(n = 1) {
      let i = this.lastId,
        l = this.slice();
      if(i >= 0) {
        l[i] = Math.max(0, l[i] - n);
        return l;
      }
    }

    /**
     * @brief Return new locator advanced upwards
     *
     * @param      {number}  [n=1]   Number of steps up
     * @return     {EaglePath}
     */
    up(n = 1) {
      //   const i = Math.max(1, Math.min(this.size, n));
      return new EaglePath(this.toArray().slice(0, this.length - n));
    }

    down(...args) {
      return new EaglePath(this.toArray().concat(args));
    }

    /**
     * @brief Return new locator for n-th child
     *
     * @param      {number}  [i]   Index of child
     * @return     {EaglePath}
     */
    nthChild(i) {
      return this.down('children', i);
    }

    diff(other) {
      let i;
      for(i = 0; i < this.length; i++) {
        if(this[i] != other[i]) return null;
      }
      return new EaglePath(other.slice(i, other.length - i));
    }

    /* prettier-ignore */ get lastId() {return this.length - 1; }
    /* prettier-ignore */ get last() {return this[this.length - 1]; }
    /* prettier-ignore */ get first() {return this[0]; }

    /* prettier-ignore */ get nextSibling() { return this.right(); }
    /* prettier-ignore */ get prevSibling() { return this.left(); }
    /* prettier-ignore */ get parent() { return this.up(1); }
    /* prettier-ignore */ get parentNode() { return this.up(2); }
    /* prettier-ignore */ get firstChild() { return this.nthChild(0); }
    /* prettier-ignore */ get lastChild() { return this.nthChild(-1); }
    /* prettier-ignore */ get depth() { return this.length; }

    apply(obj, noThrow) {
      let o = obj;
      if(o === undefined && !noThrow) {
        let stack = Util.getCallers(1, 10);
        throw new Error(`Object ${o}` + stack.join('\n'));
      }
      let a = this.reduce(
        (a, i) => {
          if(a.o) {
            let r = i === ChildrenSym ? a.o.children : i < 0 && a.o instanceof Array ? a.o[a.o.length + i] : a.o[i];
            a.o = r;
            a.n++;
          }
          return a;
        },
        { o, n: 0 }
      );
      if(a.o == null && !noThrow) throw new DereferenceError(obj, a.n, a.n, this);
      //console.log("path.apply", this.toString(), Util.abbreviate(toXML(o), 40) );
      return a.o;
    }

    xpath(obj) {
      let s = [];
      let o = obj;
      let n;
      for(let i = 0; i < this.length; i++) {
        const p = this[i];
        if(!o || !(p in o)) {
          console.log(!o || !(p in o) ? 'failed:' : 'xpart:', { i, p, o: Util.className(o), ...(o.length !== undefined ? { l: o.length } : {}) });
          if(!o || !(p in o)) return null;
        }
        const e = o[p];
        if(p == 'children') {
          //  s += '/';
          n = e.length;
        } else {
          let pt = [];
          if(e.tagName) {
            s.push(e.tagName);
            pt = o.filter(sib => sib.tagName == e.tagName);
          }
          if(Util.isObject(e.attributes) && e.attributes.name) s.push(`[@name='${e.attributes.name}']`);
          else if(pt.length != 1) {
            if(typeof p == 'number' && n != 1) s.push(`[${p + 1}]`);
          }
          n = undefined;
        }
        o = e;
      }
      s.toString = function() {
        return '/' + this.join('/');
      };
      return s;
    }

    existsIn(root) {
      let i,
        obj = root;
      for(i = 0; i + 1 < this.length; i++) {
        const key = this[i];
        if(!(key in obj)) throw new Error(`No path ${this.join(',')} in ${typeof root}`);
        obj = obj[this[i]];
      }
      return this[i] in obj;
    }

    toString(hl = -1) {
      let y = this.map(item => (item == 'children' ? '⎿' : item == 'attributes' ? '＠' : item)).map((part, i) => text(part, ...(hl == i ? [38, 5, 124] : [38, 5, 82])));

      y = text('♈ ', 38, 5, 45) + y.join('') + text(' 🔚', 38, 5, 172);
      return y.trim();
    }

    [Symbol.for('nodejs.util.inspect.custom')]() {
      return `EaglePath [${this.map(part => (part === ChildrenSym ? String.fromCharCode(10143) : text(typeof part == 'number' ? part : "'" + part + "'", 1, typeof part == 'number' ? 33 : 32))).join(', ')}]`;
    }

    inspect() {
      return EaglePath.prototype[Symbol.for('nodejs.util.inspect.custom')].apply(this, arguments);
    }

    toSource() {
      return `[${this.filter(item => item != 'children').join(',')}]`;
    }

    split(pred) {
      let i = 0;
      let a = [],
        b = [];
      let n;
      if(typeof pred == 'number') {
        n = pred < 0 ? this.length + pred : pred;
        pred = (part, index) => index === n;
      }
      while(i < this.length && !pred(this[0], i, this)) a.push(this[i++]);
      while(i < this.length) b.push(this[i++]);
      return [a, b];
    }

    slice(start = 0, end = this.length) {
      return new EaglePath(Array.prototype.slice.call(this.toArray(), start, end));
    }

    push(...args) {
      return new EaglePath(this.toArray().concat(args));
    }
    pop(n = 1) {
      return this.slice(0, this.length - n);
    }
    unshift(...args) {
      return new EaglePath(args.concat(this.toArray()));
    }
    shift(n = 1) {
      return this.slice(n);
    }
    concat(a) {
      return new EaglePath(this.toArray().concat(Array.from(a)));
    }
    /* reduce(fn, acc) {
      for(let i = 0; i < this.length; i++) acc = fn(acc, this[i], i, this);
      return acc;
    }*/
    map(fn) {
      let ret = [];
      for(let i = 0; i < this.length; i++) ret.push(fn(this[i], i, this));
      return ret;
    }
    filter(fn) {
      let ret = [];
      for(let i = 0; i < this.length; i++) if(fn(this[i], i, this)) ret.push(this[i]);
      return ret;
    }
    toArray() {
      let ret = [];
      for(let i = 0; i < this.length; i++) ret.push(this[i]);
      return ret;
    }
  }
);

export class EagleReference {
  constructor(root, path) {
    this.path = path instanceof EaglePath ? path : new EaglePath(path);
    this.root = root;
    if(!this.dereference(true)) {
      console.log('dereference:', { path, root: Util.abbreviate(toXML(root), 10) });
      throw new Error(this.path.join(','));
    }
  }

  get type() {
    return typeof this.path.last == 'number' ? Array : Object;
  }

  dereference(noThrow) {
    const { path, root } = this;
    let r;
    try {
      r = (Util.isObject(root) && 'owner' in root && path.apply(root.owner, true)) || path.apply(root);
    } catch(err) {
      console.log('err:', err.message, err.stack);
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
        let path = this.path[method](...args); //EaglePath.prototype[method].apply(this.path, args);
        //console.log(method+" path:",path.join(','), " this.path:",this.path.join(','));
        return path.existsIn(this.root) ? new EagleRef(this.root, path) : null;
      }
    }
  }), {});

//console.log("props:", props);
Object.defineProperties(EagleReference.prototype, props);
*/
