import Util from "../util.js";

export function DereferenceError(object, member, pos, locator) {
  let error = this instanceof DereferenceError ? this : new DereferenceError(object.index);

  error.message = `Error dereferencing Object @ ${locator.join("|")} w/ keys {${Object.keys(object).join(",")}} no member '${member}'`;
  error.toString = () => error.message;
  error.object = error;
  error.member = member;
  error.pos = pos;
  error.locator = locator;

  return error;
}

export class EagleLocator extends Array {
  constructor(location = []) {
    super();
    for(let i = 0; i < location.length; i++) this.push(location[i]);
  }

  clone() {
    return this.slice();
  }

  set(parts) {
    this.splice(0, this.length, ...parts);
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

  get lastId() {
    return this.length - 1;
  }
  get last() {
    return this[this.length - 1];
  }
  get first() {
    return this[0];
  }

  /* prettier-ignore */ get nextSibling() { return this.right(); }
  /* prettier-ignore */ get prevSibling() { return this.left(); }
  /* prettier-ignore */ get parent() { return this.up(1); }
  /* prettier-ignore */ get firstChild() { return this.nthChild(0); }
  /* prettier-ignore */ get lastChild() { return this.nthChild(-1); }
  /* prettier-ignore */ get depth() { return this.length; }

  apply(o) {
    return this.reduce(
      (a, i) => {
        let r = i < 0 && a.o instanceof Array ? a.o[a.o.length + i] : a.o[i];
        if(r === undefined) throw new DereferenceError(a.o, i, a.n, this);
        a.o = r;
        a.n++;
        return a;
      },
      { o, n: 0 }
    );
  }

  toString(hl = -1) {
     const ansi = function(n = 0) {return `\u001b[${[...arguments].join(";")}m`; };
  const text = (text, ...color) => ansi(...color) + text + ansi(0);

    let out = this.map(item => (item == "children" ? "⎿" : item)).map((part, i) => text(part, ...(hl == i ? [38,5,124] : [38,5,82])));

    return text(" ♈", 38,5,45) + out.join("") + text("🔚 ", 38,5,172);
  }
}
