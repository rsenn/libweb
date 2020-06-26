import Util from '../util.js';

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

export const Path = Util.immutableClass(
  class Path extends Array {
    static CHILDREN = ChildrenSym;
    constructor(path = []) {
      super(/*path.length*/);
      for(let i = 0; i < path.length; i++) {
        let value = /*(path[i] == 'children' || path[i] === ChildrenSym) ? ChildrenSym : */ typeof path[0] == 'string' && /^[0-9]+$/.test(path[i]) ? parseInt(path[i]) : path[i];

        Array.prototype.push.call(this, value); // this.push(value); //[i] = value;
      }
      //      this.length = path.length;
    }

    static parseXPath(pathStr) {
      let list = pathStr.replace(/\[/g, '/[').split(/\//g);
      let r = [];
      if(list[0] == '') {
        list.shift(); //list[0] = '?xml';
      }

      for(let part of list) {
        let bi = part.indexOf('[');
        let i = bi != -1 ? part.substring(bi + 1, part.indexOf(']')) : '';
        //console.log('part', part);

        if(i) {
          //console.log('i', i);
          if(Util.isNumeric(i)) {
            r.push('children');
            r.push(+i);
          } else if(i[0] == '@') {
            let k = i.substring(1, i.indexOf('='));
            let v = i.substring(i.indexOf('=') + 1, i.length);
            v = v.replace(/^['"]?(.*)['"]?$/, '$1');
            //console.log('k', { k, v });
            r.push({ [k]: v });
          }
        } else {
          r.push('children');
          r.push({ tagName: part });
        }
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
      //   const i = Math.max(1, Math.min(this.size, n));
      return new Path(this.toArray().slice(0, this.length - n));
    }

    down(...args) {
      return new Path(this.toArray().concat(args));
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
            if(i === ChildrenSym || i == 'children') r = 'raw' in a.o ? a.o.raw.children : a.o.children;
            else if(Util.isArray(a.o)) {
              if(typeof i == 'object') {
                let ent = Object.entries(i);
                i = a.o.findIndex(child => ent.every(([prop, value]) => child[prop] == value));
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
          //console.log(!o || !(p in o) ? 'failed:' : 'xpart:', { i, p, o: Util.className(o), ...(o.length !== undefined ? { l: o.length } : {}) });
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
        return '/' + this.join('/').replace(/\/\[/g, '[');
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
      let y = this.map(item => (item == 'children' || item == ChildrenSym ? '⎿' : item == 'attributes' ? '＠' : item)).map((part, i) => part);

      y = '❪ ' + y.map(x => (typeof x == 'object' ? `${x.tagName}` : `${x}`)).join('·') + ' ❫';
      return y.trim();
    }

    [Symbol.for('nodejs.util.inspect.custom')]() {
      return `Path [${this.map(part => (part === ChildrenSym ? String.fromCharCode(10143) : typeof part == 'number' ? part : Util.inspect(part))).join(', ')}]`;
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
