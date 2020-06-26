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

export const Path = Util.immutableClass(
  class Path extends Array {
    static CHILDREN = Symbol('⊳');

    static SymToString(a) {
      if(typeof a == 'symbol' && a === this.CHILDREN) a = 'children';
      return a;
    }

    static StringToSym(a) {
      if(a === 'children') a = this.CHILDREN;
      return a;
    }

    static isChildren(a) {
      return a === 'children' || a === this.CHILDREN;
    }

    constructor(path = []) {
      super();
      for(let i = 0; i < path.length; i++) {
        let value = typeof path[0] == 'string' && /^[0-9]+$/.test(path[i]) ? parseInt(path[i]) : path[i];

        Array.prototype.push.call(this, value);
      }
    }

    static parseXPath(s) {
      let l = s.replace(/\[([0-9])/g, '/[$1').split(/\//g);
      let r = [];
      if(l[0] == '') l.shift();

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

        r.push('children');
        r.push(o);
      }
      return new this(r);
    }

    get [Symbol.species]() {
      return Path;
    }

    clone() {
      return new Path(this);
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
      return new Path([...base, this.last + 1]);
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
      return new Path(this.toArray().slice(0, this.length - n));
    }

    down(...args) {
      let r = new Path([...this]);

      if(Path.isChildren(this.last) && Path.isChildren(args[0])) args.shift();

      for(let arg of args) {
        r = r.concat([arg]);
      }

      return r;
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
      return new Path(other.slice(i, other.length - i));
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

      let a = this.reduce(
        (a, i) => {
          if(a.o) {
            let r;
            if(i === Path.CHILDREN || i == 'children') r = 'raw' in a.o ? a.o.raw.children : a.o.children;
            else if(Util.isArray(a.o)) {
              if(typeof i == 'object') {
                i = a.o.findIndex(child => Path.compare(child, i)); //ent.every(([prop, value]) => (prop in child ? child[prop] == value : child.attributes && prop in child.attributes ? child.attributes[prop] == value : false)));
                if(i == -1) i = Object.fromEntries(ent);
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

    xpath(obj) {
      let s = [];
      let o = obj;
      let n;
      for(let i = 0; i < this.length; i++) {
        const p = this[i];
        if(!o || !(p in o)) {
          if(!o || !(p in o)) return null;
        }
        const e = o[p];
        if(p == 'children') {
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
        return (
          '/' +
          this.filter(p => p != '')
            .join('/')
            .replace(/\/\[/g, '[')
        );
      };
      s[Symbol.for('nodejs.util.inspect.custom')] = s.toString;

      return s;
    }

    [Symbol.for('nodejs.util.inspect.custom')]() {
      return Path.prototype.toString.call(this);
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

    static partToString(part) {
      let s = '';
      switch (typeof part) {
        case 'object': {
          s += `[@`;
          let attrs = Object.entries(part.attributes || {}).map(([name, value]) => `${name}='${value}'`);
          s += attrs.join(',');
          s += ']';
          break;
        }
        case 'string':
          if(!Util.isNumeric(part)) {
            s += part;
            break;
          }
        case 'number': {
          s += `[${part}]`;
          break;
        }
        case 'symbol': {
          break;
        }
      }
      return s;
    }

    toString(hl = -1) {
      /*      let r = '';
          let s;
      for(let i = 0; i < this.length; i++) {
        let o = this[i];
        s='';
        if(o == 'children' || o == Path.CHILDREN) {
          r += '/children';
continue;
        }
                               const isObj = Util.isObject(o);
       let k = isObj ? Object.keys(o) : [];
          if(isObj && 'tagName' in o && typeof o.tagName == 'string') s += o.tagName;
         if(Util.isNumeric(o)) s += `[${o}]`;
        else if(isObj && 'attributes' in o) {
            s += `[@`;
            let attrs = Object.entries(o.attributes).map(([name, value]) => `${name}='${value}'`);
            s += attrs.join(',');
            s += ']';
          }   else if(typeof(o) == 'string') {
          s += o;
                } else {
                  s+=o;}
          r += `/${s}`;
        }
      return r;*/
      let r = this.map(part => Path.partToString(part)).join('/');
      //console.log("toString", r);
      return '/' + r;
    }

    inspect() {
      return Path.prototype[Symbol.for('nodejs.util.inspect.custom')].apply(this, arguments);
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
      return new Path(Array.prototype.slice.call(this.toArray(), start, end));
    }

    push(...args) {
      return new Path(this.toArray().concat(args));
    }
    pop(n = 1) {
      return this.slice(0, this.length - n);
    }
    unshift(...args) {
      return new Path(args.concat(this.toArray()));
    }
    shift(n = 1) {
      return this.slice(n);
    }
    concat(a) {
      return new Path(this.toArray().concat(Array.from(a)));
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
