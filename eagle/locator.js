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
      message: `Error dereferencing ${Util.className(object)} @ ${locator.slice(0,pos+1).join("|")} w/ keys={${Object.keys(part).join(",")}} no member '${member}' in `,
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

export class EagleLocator extends Array {
  constructor(location = []) {
    super();
    for(let i = 0; i < location.length; i++) this.push(location[i]);
  }

  clone() {
    return this.slice();
  }

  set(a) {
    this.splice(0, this.length, ...a);
    return this;
  }

  /**
   * @brief Return new locator advanced to right
   *
   * @param      {number}  [n=1]   Number of steps to right
   * @return     {EagleLocator}
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
   * @return     {EagleLocator}
   */
  left(n = 1) {
    let i = this.lastId,
      l = this.slice();
    if(i >= 0) l[i] = Math.max(0, l[i] - n);
    return l;
  }

  /**
   * @brief Return new locator advanced upwards
   *
   * @param      {number}  [n=1]   Number of steps up
   * @return     {EagleLocator}
   */
  up(n = 1) {
    const i = Math.max(1, Math.min(this.depth, n));
    return this.slice(0, -i);
  }

  down(...args) {
    return this.slice().concat(args);
  }

  /**
   * @brief Return new locator for n-th child
   *
   * @param      {number}  [i]   Index of child
   * @return     {EagleLocator}
   */
  nthChild(i) {
    return this.down.apply(this, arguments);
  }

  /* prettier-ignore */ get lastId() {return this.length - 1; }
  /* prettier-ignore */ get last() {return this[this.length - 1]; }
  /* prettier-ignore */ get first() {return this[0]; }

  /* prettier-ignore */ get nextSibling() { return this.right(); }
  /* prettier-ignore */ get prevSibling() { return this.left(); }
  /* prettier-ignore */ get parent() { return this.up(1); }
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
    let a = new EagleLocator();
    let n;
    if(typeof(pred) == 'number') {
      n = pred;
      pred = (part,index) => index === n;
    }
    while(i < this.length && !pred(this[0], i)) {
      a.push(this.shift());
      i++;
    }
    return a;
  }
}
