import Util from "../util.js";
import util from "util";
import { ansi, text, inspect } from "./common.js";

const dump = (obj, depth = 1, breakLength = 100) => util.inspect(obj, { depth, breakLength, colors: true });

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
  class EaglePath /*extends Array*/ {
    constructor(path = []) {
      //super(path.length);
      for(let i = 0; i < path.length; i++) this[i] = path[i];
      this.length = path.length;
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
      let i = this.lastId,
        l = this.slice();
      if(i >= 0) l[i] = l[i] + 1;
      return l;
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
      const i = Math.max(1, Math.min(this.size, n));
      return this.slice(0, -i);
    }

    down(...args) {
      return this.concat(args);
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

    existsIn(obj) {
      let i;
      for(i = 0; i + 1 < this.length; i++) obj = obj[this[i]];
      return this[i] in obj;
    }

    toString(hl = -1) {
      const ansi = (n = 0) => `\u001b[${[...arguments].join(";")}m`;
      const text = (text, ...color) => ansi(...color) + text + ansi(0);

      let y = this.map(item => (item == "children" ? "⎿" : item)).map((part, i) => text(part, ...(hl == i ? [38, 5, 124] : [38, 5, 82])));

      y = text("♈ ", 38, 5, 45) + y.join("") + text(" 🔚", 38, 5, 172);
      return y.trim();
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

    slice(start = 0, end) {
      let a = [];
      end = end < 0 ? Math.max(0, this.length + end) : Math.min(this.length, end);
      for(let i = 0; i < end; i++) a.push(this[i]);
      return new EaglePath(a);
    }

    push(...args) {
      return new EaglePath([...Array.from(this), ...args]);
    }
    pop(n = 1) {
      return this.slice(0, this.length - n);
    }
    unshift(...args) {
      return new EaglePath([...args, Array.from(this)]);
    }
    shift(n = 1) {
      return this.slice(n);
    }
    concat(a) {
      return new EaglePath([...Array.from(this), ...Array.from(a)]);
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
  }
);

export const EagleRef = function EagleRef(root, path) {
  /*
  if(!(this instanceof EagleRef))
    Util.extend(this, EagleRef.prototype);

    this.root = root;
    
};
*/
  path = path instanceof EaglePath ? path : new EaglePath(path);
  return {
    root,
    path,
    dereference: () => path.apply(root),
    get type() {
      return typeof path.last == "number" ? Array : Object;
    },
    replace: value => {
      const obj = path.up().apply(root);
      return (obj[path.last] = value);
    },
    entry: () => {
      if(path.size > 0) {
        let key = path.last;
        let obj = path.up().apply(root);
        return [obj[key], key, obj];
      }
      return [root];
    }
  };
};

["up", "down", "left", "right", "slice"].forEach(
  method =>
    (EagleRef.prototype[method] = function(...args) {
      let path = EaglePath.prototype.apply(this, args);
      return path ? new EagleRef(this.root, path) : path;
    })
);
let props = ["nextSibling", "prevSibling", "parent", "parentNode", "firstChild", "lastChild", "depth"].reduce(
    (acc, method) => ({
      ...acc,
      [method]: {
        get: function(...args) {
          return EagleRef(this.root, EaglePath.prototype[method].apply(this.path, args));
        }/*,
        writable: false,
        enumerable: false*/
      }
    }),
    {}
  );

  console.log("props:",props);
Object.defineProperties(
  EagleRef.prototype,
  props
);
