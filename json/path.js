import Util from '../util.js';
import { toXML } from './util.js';

export function DereferenceError(object, member, pos, locator) {
  let error = this instanceof DereferenceError ? this : new DereferenceError(object.index);
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
      message: `Error dereferencing ${Util.className(object)} @ ${locator.toString()}\nxml: ${Util.abbreviate(toXML(locator.root))}\nno member '${Util.inspect(member)}' in ${Util.inspect(object, 2)} \n` + stack.join('\n'),
      stack
    }
  );
}

DereferenceError.prototype.toString = function() {
  const { message, object, member, pos, locator, stack } = this;
  return `${message}\n${Util.inspect({ object, member, pos, locator, stack }, 2)}`;
};
export const MutablePath = class Path extends Array {
  static CHILDREN_STR = '\u220d';
  static CHILDREN = Symbol('children');

  static SymToString(a) {
    if(typeof a == 'symbol' && a === this.CHILDREN) a = this.CHILDREN_STR; //'children';
    return a;
  }

  static StringToSym(a) {
    if(a === 'children') a = this.CHILDREN;
    return a;
  }

  static isChildren(a) {
    return a === 'children' || a === this.CHILDREN_STR || a === this.CHILDREN;
  }

  constructor(path = [], absolute) {
    super();
    let a;
    if(typeof path == 'string') {
      path = path /*.replace(new RegExp(Path.CHILDREN_STR, 'g'), 'children')*/
        .replace(/[./]\[/g, '[');
      a = path.split(/[./]/g);
    } else {
      a = [...path];
    }
    a = a || [];
    a = a.map(p => (Path.isChildren(p) ? 'children' : p));
    //   if(absolute===2) console.log('Path.constructor', a.join(" / "));
    if(absolute)
      if(a.length == 0 || a[0] !== '') a.unshift('');
      else while(a.length > 0 && a[0] === '') a.shift();
    for(let i = 0; i < a.length; i++) Array.prototype.push.call(this, /*Path.isChildren(a[i]) ? 'children' :*/ a[i] === '' ? '' : typeof a[i] == 'symbol' || isNaN(+a[i]) ? a[i] : +a[i]);
  }

  static parseXPath(s) {
    let l = s.replace(/\[([0-9])/g, '/[$1').split(/\//g);
    let r = [];
    // if(l[0] == '') l.shift();

    for(let p of l) {
      let j = p.indexOf('[');
      let i = j != -1 ? p.substring(j + 1, p.indexOf(']')) : '';
      let o = {};
      let t = p.substring(0, j == -1 ? p.length : j);

      if(i) {
        if(!isNaN(+i)) {
          r.push('children');
          r.push(+i);
          continue;
        } else if(i[0] == '@') {
          let ei = i.indexOf('=');
          let k = i.substring(1, ei);
          let v = i.substring(ei + 1, i.length);
          v = v.replace(/^['"](.*)['"]$/g, '$1');
          if(!o.attributes) o.attributes = {};

          o.attributes[k] = v;
        }
      }
      if(t != '') o.tagName = t;

      r.push(Path.CHILDREN_STR);
      r.push(o);
    }
    return new this(r);
  }

  static partToString(a, sep, childrenSym) {
    let s = '';
    let part = a.shift();
    switch (typeof part) {
      case 'object': {
        s += `[@`;
        let attrs = Object.entries(part.attributes || {}).map(([name, value]) => `${name}='${value}'`);
        s += attrs.join(',');
        s += ']';
        break;
      }
      case 'string':
        if(Path.isChildren(part)) {
          s += (childrenSym || part) + sep; //Path.CHILDREN_STR + ' ';
          part = a.shift();
        }
        if(Util.isNumeric(part)) {
          part = +part;
        } else {
          s += `${part}`;
          break;
        }
      case 'number': {
        s += `${part}`;
        break;
      }
      case 'symbol': {
        break;
      }
    }
    return s;
  }

  get [Symbol.species]() {
    return Path;
  }

  clone() {
    return new this.constructor(this, this.absolute);
  }

  get size() {
    return this.length;
  }

  /**
   * @brief Return new locator advanced to right
   *
   * @param      {number}  [n=1]   Number of steps to right
   * @return     {Path}
   */
  right(n = 1) {
    const [base, last] = this.split(-1);
    return new this.constructor([...base, this.last + 1], this.absolute);
  }

  /**
   * @brief Return new locator advanced to left
   *
   * @param      {number}  [n=1]   Number of steps to left
   * @return     {Path}
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
   * @return     {Path}
   */
  up(n = 1) {
    return new this.constructor(this.toArray().slice(0, this.length - n), this.absolute);
  }

  down(...args) {
    let r = new Path([...this], this.absolute);

    //  if(Path.isChildren(this.last) && Path.isChildren(args[0])) args.shift();

    //   for(let arg of args)      r = r.concat([arg]);

    return r.concat(args);
  }

  /**
   * @brief Return new locator for n-th child
   *
   * @param      {number}  [i]   Index of child
   * @return     {Path}
   */
  nthChild(i) {
    return this.down('children', i);
  }

  diff(other) {
    let i;
    for(i = 0; i < this.length; i++) {
      if(this[i] != other[i]) return null;
    }
    return new this.constructor(other.slice(i, other.length - i), this.absolute);
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

  static compare(obj, other) {
    let ret = true;
    for(let prop in other) {
      const value = other[prop];
      if(Util.isObject(value)) {
        if(!this.compare(obj[prop], value)) {
          ret = false;
          break;
        }
      } else if(value != obj[prop]) {
        ret = false;
        break;
      }
    }
    return ret;
  }

  apply(obj, noThrow) {
    if('raw' in obj) obj = obj.raw;

    let o = obj;
    if(o === undefined && !noThrow) {
      let stack = Util.getCallers(1, 10);
      throw new Error(`Object ${o}` + stack.join('\n'));
    }
    let a = [...this];

    while(a.length >= 1 && a[0] === '') a = a.slice(1);

    a = a.reduce(
      (a, i) => {
        if(a.o) {
          let r;
          if(i === Path.CHILDREN || i == 'children') r = 'raw' in a.o ? a.o.raw.children : a.o.children;
          else if(Util.isArray(a.o)) {
            if(typeof i == 'object') {
              i = a.o.findIndex(child => Path.compare(child, i)); //ent.every(([prop, value]) => (prop in child ? child[prop] == value : child.attributes && prop in child.attributes ? child.attributes[prop] == value : false)));
              //  if(i == -1) i = Object.fromEntries(ent);
            } else if(typeof i == 'number' && i < 0) i = a.o.length + i;
            else i = +i;
          }
          r = a.o[i];

          a.p = a.o;
          a.o = r;
          a.i = i;
          a.n++;
        }
        return a;
      },
      { o, n: 0 }
    );
    if(a.o == null && !noThrow) throw new DereferenceError(obj, a.i, a.n, this);
    return a.o;
  }

  toString(sep = '/', childrenVar /*= 'CHILDREN_STR'*/) {
    let a = this.toArray();

    while(a.length > 0 && a[0] === '') a.shift();
    let n = a.length;
    /*console.log(`n =`, n);
      console.log(`a =`, a);*/
    let r = [];
    for(let i = 0; ; i++) {
      let p = Path.partToString(a, sep, Path[childrenVar]);
      if(!p) break;
      //  console.log(`p[${r.length}] = ${p}`);
      r.push(p);
    }
    //if(this.length > 1) console.log("r:",r);
    r = r.join(sep).replace(/[/.]?\[/g, '[');
    return (this.absolute && r != '' && sep == '/' ? sep : '') + r;
  }

  inspect() {
    return Path.prototype[Symbol.for('nodejs.util.inspect.custom')].apply(this, arguments);
  }

  toSource(sep = ',') {
    return `[${this.filter(item => item != 'children').join(sep)}]`;
  }

  get absolute() {
    return this[0] === '';
  }

  makeAbsolute(parent) {
    if(this.absolute) return this;
    let r = [...parent, ...this];
    if(r[0] !== '') r.unshift('');
    return new this.constructor(r, parent.absolute);
  }

  xpath(obj) {
    let o = obj;
    let n;
    let thisPath = this;

    let XPath = Util.immutableClass(
      class XPath extends MutablePath {
        static get [Symbol.species]() {
          return this;
        }

        constructor(parts = [], absolute) {
          if(absolute && (parts.length == 0 || parts[0] !== '')) Array.prototype.unshift.call(parts, '');

          super(parts);
          return this;
        }

        toString() {
          let a = this.toArray();
          let abs = this.length > 0 && this[0] === '';
          let s = this.filter(p => p != '');
          s = Array.prototype.join.call(s, '/');
          s = s.replace(/,/g, '/').replace(/\/\[/g, '[');
          return (abs && !s.startsWith('/') ? '/' : '') + s;
        }
      }
    );

    let s = [];
    let i = 0;
    let a = [...thisPath];
    while(i < a.length && a[i] === '') i++;

    while(i < a.length) {
      let p = a[i++];
      //    console.log("i:",i );
      if(p == 'attributes') break;

      if(Path.isChildren(p)) p = 'children';
      let e = o[p];
      if(p == 'children') {
        n = e.length;
      } else if(Util.isObject(e) && e.tagName !== undefined) {
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
    let r = new XPath(s, this.absolute);
    //console.log("xpath", thisPath.absolute,{ a, r },r+'');
    return r;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toString('/', 'CHILDREN_STR');
  }

  [Symbol.toStringTag]() {
    return this.toString('.', 'CHILDREN_STR');
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

  relativeTo(other = []) {
    if([...other].every((part, i) => this[i] == part)) return this.slice(other.length, this.length);
    return null;
  }

  /**
   * { function_description }
   *
   * @param      {number}  [start=0]          The start
   * @param      {number}  [end=this.length]  The end
   * @return     {Path}    { description_of_the_return_value }
   */
  slice(start = 0, end = this.length) {
    if(start < 0) start = this.length + start;
    if(end < 0) end = this.length + end;
    let a = Array.prototype.slice.call([...this], start, end);
    return new this.constructor(a, a[0] === '');
  }

  push(...args) {
    return new this.constructor(this.toArray().concat(args), this.absolute);
  }
  pop(n = 1) {
    return this.slice(0, this.length - n);
  }
  unshift(...args) {
    return new this.constructor(args.concat(this.toArray()), args[0] === '' ? true : false);
  }
  shift(n = 1) {
    return new this.constructor([...this].slice(n), this.absolute && n < 1);
  }
  concat(a) {
    return new this.constructor(this.toArray().concat(Array.from(a)), this.absolute);
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

  equal(other = []) {
    if(other.length != this.length) return false;

    for(let i = 0; i < other.length; i++) {
      if(this[i] != other[i]) return false;
    }
    return true;
  }
  get parent() {
    let r = this.slice(0, this.length - 1);
    /*   if( Path.isChildren(r[r.length - 1]))
        r = r.slice(0, r.length - 1);*/
    return r;
  }
};

export const Path = Util.immutableClass(MutablePath);
