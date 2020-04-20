import Util from "../util.js";

import { ansi, text, inspect, toXML, dump } from "./common.js";

export function DereferenceError(object, member, pos, part, locator) {
  let error = this instanceof DereferenceError ? this : new DereferenceError(object.index);

  return Util.extend(
    error,
    { object, member, pos, locator },
    {
      message: `Error dereferencing ${Util.className(object)} @ ${locator.map((part, i) => (i == pos ? `<<${part}>>` : part)).join(",")} w/ keys={${Object.keys(part).join(",")}} no member '${member}' `,
      stack: Util.getCallerStack()
        .filter(frame => null !== frame.getFileName())
        .map(frame => `${("" + frame.getFileName()).replace(/.*plot-cv\//, "")}:${frame.getLineNumber()}:${frame.getColumnNumber()}`)
    }
  );
}

DereferenceError.prototype.toString = function() {
  const { message, object, member, pos, locator, stack } = this;
  return `${message}\n${dump({ object, member, pos, locator, stack }, 2)}`;
};

export const EaglePath = Util.immutableClass(
  class EaglePath extends Array {
    constructor(path = []) {
      super(/*path.length*/);
      for(let i = 0; i < path.length; i++) {
        let value = /^[0-9]+$/.test(path[i]) ? parseInt(path[i]) : path[i];

        Array.prototype.push.call(this, value); // this.push(value); //[i] = value;
      }
      //      this.length = path.length;
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
      /*      let i = this.lastId,
        l = this.slice();
      if(i >= 0) l[i] = l[i] + 1;
      return l;*/
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
      return this.down("children", i);
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

    apply(obj) {
      let o = obj;
      if(o === undefined) throw new Error(`Object ${o}`);

      return this.reduce(
        (a, i) => {
          let r = i < 0 && a.o instanceof Array ? a.o[a.o.length + i] : a.o[i];
          if(r === undefined) throw new DereferenceError(obj, i, a.n, a.o, this);
          a.o = r;
          a.n++;
          return a;
        },
        { o, n: 0 }
      ).o;
    }

    existsIn(root) {
      let i,
        obj = root;
      for(i = 0; i + 1 < this.length; i++) {
        const key = this[i];
        if(!(key in obj)) throw new Error(`No path ${this.join(",")} in ${typeof root}`);
        obj = obj[this[i]];
      }
      return this[i] in obj;
    }

    toString(hl = -1) {

      let y = this.map(item => (item == "children" ? "⎿" : item)).map((part, i) => text(part, ...(hl == i ? [38, 5, 124] : [38, 5, 82])));

      y = text("♈ ", 38, 5, 45) + y.join("") + text(" 🔚", 38, 5, 172);
      return y.trim();
    }

    [Symbol.for("nodejs.util.inspect.custom")]() {
      return `EaglePath [${this.map(part => text(typeof part == "number" ? part : `'${part}'`, 1, typeof part == "number" ? 33 : 32)).join(", ")}]`;
    }
    inspect() {
      return EaglePath.prototype[Symbol.for("nodejs.util.inspect.custom")].apply(this, arguments);
    }

    toSource() {
      return `[${this.filter(item => item != "children").join(",")}]`;
    }

    split(pred) {
      let i = 0;
      let a = [],
        b = [];
      let n;
      if(typeof pred == "number") {
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
    reduce(fn, acc) {
      for(let i = 0; i < this.length; i++) acc = fn(acc, this[i], i, this);
      return acc;
    }
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
    // path = path instanceof EaglePath ? path : new EaglePath(path);

    this.path = /*path instanceof EaglePath ? path : */ new EaglePath(path);
    this.root = root;
  }
  get type() {
    return typeof this.path.last == "number" ? Array : Object;
  }

  dereference() {
    return this.path.apply(this.root);
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

  down() {
    return new EagleReference(this.root, [...this.path.toArray(), ...arguments]);
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

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `EagleReference { root:${toXML(this.root, 0)}, path:${this.path.inspect()} }`;
  }
  inspect() {
    return this[Symbol.for("nodejs.util.inspect.custom")](...arguments);
  }
  /* toString() {
      return `Immutable EagleRef { path: ${this.path.toString()} , root: ${util.inspect(this.root)} }`;
    }*/
}

export const EagleRef = function EagleRef(root, path) {
  /* path = path instanceof EaglePath ? path : new EaglePath(path);
   */
  /* if(!EaglePath.prototype.existsIn.call(path, root))
    return null;*/

  if(Util.isObject(root) && Util.isObject(root.root)) root = root.root;

  let obj = new EagleReference(root, path);
  return Object.freeze(obj);
};
/*-;

  if(this instanceof EagleRef) {
    this.root = root;
    this.path = path;
  }

    let obj = this instanceof EagleRef ? this : { root, path };

  if(!(obj instanceof EagleRef))
    Util.extend(obj, EagleRef.prototype);

    obj.root = root;
  root = root !== null && root.ref ? root.ref.root : root;

 

  return Object.freeze(obj);
};*/
/*
["up", "down", "left", "right", "slice"].forEach(
  method =>
    (EagleReference.prototype[method] = function(...args) {
      return EagleRef(this.root, this.path[method](...args));
    })
);*/
Object.assign(EagleReference.prototype, {});

/*let props = ["nextSibling", "prevSibling", "parent", "parentNode", "firstChild", "lastChild", "depth"].reduce(
  (acc, method) => ({
    ...acc,
    [method]: {
      get: function(...args) {
        let path = this.path[method](...args); //EaglePath.prototype[method].apply(this.path, args);
        console.log(method+" path:",path.join(','), " this.path:",this.path.join(','));
        return path.existsIn(this.root) ? new EagleRef(this.root, path) : null;
      }
    }
  }),
  {}
);

console.log("props:", props);
Object.defineProperties(EagleReference.prototype, props);
*/
