import Util from './util.js';
import { write as toXML } from './xml.js';

export function DereferenceError(object, member, pos, prev, locator) {
  let error = this instanceof DereferenceError ? this : new DereferenceError(object.index);
  let stack = Util.getCallerStack()
    .filter(frame => null !== frame.fileName)
    .map(frame => {
      let method = frame.methodName;
      if(method) method = (frame.typeName || Util.className(frame.thisObj)) + '.' + method;
      else method = frame.getFunctionName();

      return (
        ('' + frame.getFileName()).replace(new RegExp('.*plot-cv/'), '') +
        ':' +
        frame.getLineNumber() +
        ':' +
        frame.getColumnNumber() +
        ' ' +
        method
      );
    });
  //console.log('member:', member);
  return Object.assign(
    error,
    { object, member, pos, locator },
    {
      message:
        `Error dereferencing ${Util.className(object)} @ ${Pointer.prototype.toString.call(
          locator,
          '/',
          Pointer.partToString,
          'children'
        )}
xml: ${Util.abbreviate(toXML(locator.root || object))}
no member '${Util.inspect(member, { colors: false })}' in ${Util.inspect(prev, {
          depth: 2,
          multiline: true,
          indent: '  ',
          colors: false
        })} \n` + stack.join('\n'),
      stack
    }
  );
}

DereferenceError.prototype.toString = function() {
  const { message, object, member, pos, locator, stack } = this;
  return `${message}\n${Util.inspect({ object, member, pos, locator, stack }, { depth: 2, colors: false })}`;
};

export const IsChildren = a => a === Pointer.CHILDREN_GLYPH || a === Pointer.CHILDREN_STR || a === Pointer.CHILDREN_SYM;

const CHILDREN_SPACE = '';

export class Pointer extends Array {
  constructor(arr) {
    const n = arr?.length | 0;
    super(n);

    for(let i = 0; i < n; i++) this[i] = arr[i];
  }

  deref(obj, noThrow) {
    let o = obj;
    if(o === undefined && !noThrow) {
      let stack = Util.getCallers(1, 10);
      throw new Error(`Object ${o}` + stack.join('\n'));
    }
    let a = this;
    a = a.reduce(
      (a, i) => {
        if(a.o) {
          let r;
          let t = typeof i;
          //console.log(`Pointer.deref[`,a.n,`]`,Util.isArray(a.o),a.o,i);
          if(t != 'string') {
            if(a.o.length !== undefined) {
              if(t == 'function') {
                const pred = i;
                i = a.o.findIndex((e, i, a) => pred(e, i, a));
              } else if(t == 'object') {
                //console.log(`Pointer.deref findIndex`,a.o,i);
                i = a.o.findIndex(child => Pointer.compareObj(child, i));
              } else if(t == 'number' && i < 0) {
                i = a.o.length + i;
              } else i = +i;
            }
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
    if(a.o == null && !noThrow) throw new DereferenceError(obj, a.i, a.n, a.p, this);
    return a.o;
  }

  static partToString(a, sep = '/', childrenStr, c = (text, c = 33, b = 0) => `\x1b[${b};${c}m${text}\x1b[0m`) {
    if(a.length == 0) return null;
    let s = '';
    let part = a.shift();
    if(typeof part == 'function' && part.object !== undefined) part = part.object;

    if(Util.isObject(part)) {
      let { tagName, ...partObj } = part;
      let keys = Object.keys(partObj);
      if(keys.length == 0) part = tagName;
    }
    let type = typeof part;
    switch (type) {
      case 'symbol':
      case 'string':
        if(IsChildren(part)) {
          let sym = childrenStr;
          s += c(sym, 33, 1);
          s += c('', 1, 34);
          break;
        } else {
          if(Util.isNumeric(part)) part = +part;
          else s += `${part}`;
          break;
        }
      case 'object': {
        s += `[@`;
        let attrs = Object.entries(part.attributes || {}).map(([name, value]) => `${name}='${value}'`);
        s += attrs.join(',');
        s += ']';
        break;
      }
      case 'number': {
        s += `${part}`;
        break;
      }
    }
    return [s];
  }

  toSource(opts = {}) {
    const { sep = ',', filterChildren = false } = opts;
    let r = this.toArray();
    if(filterChildren) r = r.filter(item => !Pointer.isChildren(item));
    return `[${r.map(p => (typeof p == 'number' ? p : typeof p == 'string' ? `'${p}'` : p)).join(sep)}]`;
  }
  toCode(name) {
    return this.reduce((acc, part) => acc + (Util.isNumeric(part) ? `[${part}]` : `.${part}`), name || '');
  }
  toReduce(name = '') {
    return this.toSource() + `.reduce((a,p)=>a[p],${name})`;
  }

  /* prettier-ignore */ get absolute() {
    return this[0] === '';
  }

  makeAbsolute(parent) {
    const ctor = this.constructor[Symbol.species];
    if(this.absolute) return this;
    let r = [...parent, ...this];
    if(r[0] !== '') r.unshift('');
    return new ctor(r, parent.absolute);
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, options = {}) {
    let t = options.colors ? (text, ...args) => `\x1b[${args.join(';')}m` + text : text => text;
    return (
      Array.prototype.reduce
        .call(
          this,
          (acc, item) => {
            if(isNaN(+item)) {
              acc.push(t('.', 1, 36));
              acc.push(t(item, 1, 33));
            } else {
              acc.push(t(`[`, 1, 36) + t(item, 0) + t(']', 1, 36));
            }
            return acc;
          },
          []
        )
        .join('') + t('', 0)
    );
  }

  toString(sep = ' ', partToStr = Pointer.partToString, childrenStr = Pointer.CHILDREN_GLYPH + CHILDREN_SPACE) {
    // console.log("Pointer.toString",{sep,partToStr, childrenStr});
    const color = true || Util.isBrowser() ? text => text : (text, ...c) => `\x1b[${c.join(';') || 0}m${text}`;
    let a = [...this];
    //   if(this[0] == 'children') sep = ' ';
    while(a.length > 0 && a[0] === '') a.shift();
    let n = a.length;
    let r = [];
    for(let i = 0; ; i++) {
      let p = partToStr(a, '/', childrenStr, color);
      if(!p) break;
      r = r.concat(p);
    }
    const pad = (s, n = 1) => ' '.repeat(n) + s + ' '.repeat(n);
    r = r.join(color(sep, 1, 36) + color('', 1, 30)); //.replace(/[/\.]\[/g, '[');
    r = (this.absolute && r != '' && sep == '/' ? sep : '') + r;
    return r.replace(/\//g, sep);
  }

  [Symbol.toStringTag]() {
    return Pointer.prototype.toString.call('.', '\u220a' + CHILDREN_SPACE);
  }

  existsIn(root) {
    let i,
      obj = root;
    for(i = 0; i + 1 < this.length; i++) {
      const key = this.at(i);
      if(!(key in obj)) throw new Error(`No pointer ${this.join(',')} in ${typeof root}`);
      obj = obj[key];
    }
    return this.at(i) in obj;
  }

  split(pred) {
    let i = 0,
      a = [],
      b = [],
      n;
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

  slice(start = 0, end = this.length) {
    const ctor = this.constructor[Symbol.species] || this.constructor;
    let r = Array.prototype.slice.call(Pointer.prototype.toArray.call(this), start, end);
    r = Object.setPrototypeOf(r, ctor.prototype);
    //if(ctor == ImmutablePointer) r = Object.freeze(r);
    return r;
  }

  splice(start = 0, remove = this.length, ...insert) {
    const ctor = this.constructor[Symbol.species];
    let a = this.toArray();
    if(start < 0) start = a.length + start;
    if(remove < 0) remove = a.length - (-remove - 1);
    remove = Math.min(this.length - start, remove);
    Array.prototype.splice.call(a, start, remove, ...insert);
    return new ctor(a, a[0] === '');
  }

  push(...args) {
    const species = this.constructor[Symbol.species];
    let arr = this.toArray();
    let ctor = this.constructor;
    return new species(arr, this.absolute);
  }

  pop(n = 1) {
    return this.slice(0, this.length - n);
  }

  unshift(...args) {
    const ctor = this.constructor[Symbol.species];
    return new ctor(args.concat(this.toArray()), args[0] === '');
  }

  shift(n = 1) {
    const ctor = this.constructor[Symbol.species];
    return new ctor(this.toArray().slice(n), this.absolute && n < 1);
  }

  concat(a) {
    const ctor = this.constructor[Symbol.species] || this.constructor;
    return Object.setPrototypeOf([...this].concat(a), ctor.prototype);
  }

  map(fn) {
    const ctor = this.constructor[Symbol.species] || this.constructor;
    let ret = [];
    for(let i = 0; i < this.length; i++) {
      let r = fn(this.at(i), i, this);
      ret.push(r);
    }
    return Object.setPrototypeOf(ret, ctor.prototype);
  }

  filter(fn) {
    const ctor = this.constructor[Symbol.species] || this.constructor;
    let ret = [];
    for(let i = 0; i < this.length; i++) if(fn(this.at(i), i, this)) ret.push(this[i]);
    return Object.setPrototypeOf(ret, ctor.prototype);
  }

  at(i) {
    const part = this[i];
    return Pointer.isChildren(part) ? 'children' : part;
  }

  offset(predicate = (p, i) => p === '' || p === '/') {
    let i = 0;
    for(; i < this.length; i++) {
      const part = Pointer.prototype.at.call(this, i);
      if(!predicate(part, i, this)) break;
    }
    return i;
  }

  toArray(skip = true, n = 1) {
    let ret = [];
    let i = Pointer.prototype.offset.call(this);
    for(; i < this.length; i += n) {
      if(n > 1) ret = ret.concat(Array.prototype.slice.call([...this], i, i + 2));
      else ret.push(this[i]);
    }
    return ret;
  }

  equals(other = []) {
    const thisPointer = this;
    if(other.length != this.length) return false;
    if(!other.absolute && other.length < this.length) {
      let prepend = this.slice(0, this.length - other.length);
      other = prepend.concat(other);
    }
    for(let i = 0; i < other.length; i++) {
      if(typeof this[i] != 'object') {
        if(this[i] != other[i]) return false;
        else if(!Util.equals(this[i], other[i])) return false;
      }
    }
    return true;
  }

  /*  startsWith(other = []) {
    let a = this.slice(0, other.length);
    return Pointer.prototype.equals.call(this, a);
  }

  endsWith(other = []) {
    let n = this.length;
    let a = this.slice(n - other.length, n);
    return Pointer.prototype.equals.call(this, a);
  }*/

  /* prettier-ignore */ get parent() {
    let r = this.slice(0, this.length - 1);
    return r;
  }

  *walk(t = p => p.up(1)) {
    let p = this;
    let run = true;
    let skip;
    let next;
    const abort = () => (run = false);
    const set = v => (p = v);
    const ignore = () => (skip = true);
    for(let p = this, i = 0; p; p = next) {
      next = t(p, i++, abort, ignore);
      if(!skip) yield p;
      if(!run) break;
      skip = false;
    }
  }

  static compare(a, b) {
    if(a.length != b.length) return a.length - b.length;
    for(let i = 0, len = a.length; i < len; i++) {
      if(a[i] < b[i]) return -1;
      if(a[i] > b[i]) return 1;
    }
    return 0;
  }

  static equal = (a, b) => this.compare(a, b) === 0;

  [Symbol.iterator]() {
    return Array.prototype[Symbol.iterator].call(this);
  }
}

export default Pointer;
