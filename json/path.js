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
  console.log('member:', member);
  return Object.assign(
    error,
    { object, member, pos, locator },
    {
      message:
        `Error dereferencing ${Util.className(object)} @ ${locator + ''}
xml: ${Util.abbreviate(toXML(locator.root))}
no member '${Util.inspect(member, { colors: false })}' in ${Util.toString(object, { depth: 2, multiline: true, indent: '  ', colors: false })} \n` + stack.join('\n'),
      stack
    }
  );
}

DereferenceError.prototype.toString = function() {
  const { message, object, member, pos, locator, stack } = this;
  return `${message}\n${Util.inspect({ object, member, pos, locator, stack }, { depth: 2, colors: false })}`;
};

export const IsChildren = a => a === MutablePath.CHILDREN_GLYPH || a === MutablePath.CHILDREN_STR || a === MutablePath.CHILDREN_SYM;

const CHILDREN_SPACE = '';

export class MutablePath extends Array {
  //'\u2b21', '\u274a', '\u229b', '\u273d', '\u20f0', '\u20f0', '\u272a', '\u262a',  '\u21f9', '\u29bf','\u25c7', '\u2b20', '\u267d', '\u267c', '\u267b', '\u2693','\u0fd6', '\u0fd5', '\u2620', '\u0e1e'
  static CHILDREN_GLYPH /* */ = '➟' /* '▻'*/ /*'∍'*/ /*'⬡'*/ /*'⊛'*/ /*'▸'*/;
  //    '\u00bb'
  static CHILDREN_FN = args => {
    for(let i = 0; i < args.length; i++) args[i] = (args[i] + '').replace(/children/g, this.CHILDREN_GLYPH);
    return '';
  };
  static CHILDREN_SYM = Symbol.for('children');
  static CHILDREN_STR = 'children';

  static isChildren(arg) {
    return IsChildren(arg);
  }

  static [Symbol.hasInstance](instance) {
    const name = Util.className(instance);
    return ['MutablePath', 'ImmutablePath', 'Path'].indexOf(name) != -1;
  }

  constructor(p = [], absolute) {
    super(typeof p == 'number' ? p : 0);

    MutablePath.parse(p, this);
    //   console.log('this:',this);

    //console.log(`\nnew Path(${[...arguments].length}):  length:`,  length,"", (first ? "first:" : ''), first||'',(last ? "  last:" : ''), last || '',"array:",a);
  }

  static parse(path, out) {
    const len = path.length;
    if(typeof path != 'number') {
      if(typeof path == 'string') {
        path = path.replace(/[./]\[/g, '[');
        path = path.split(/[./]/g);
      }
      const len = path.length;
      path = [...path];

      for(let i = 0; i < len; i++) {
        let part = path[i];

        if(typeof part == 'string' && ((part && part.codePointAt && part.codePointAt(0) >= 256) || part == 'children')) {
          part = 'children';
        } else if(typeof part == 'number' || (typeof part == 'string' && !isNaN(part))) {
          part = +part;
        } else if(typeof part == 'string') {
          if(/\[.*\]/.test(part + '')) {
            p = part.substring(1, part.length - 0);
          } else if(/^[A-Za-z]/.test(part)) {
            const idx = ['attributes', 'tagName', 'children'].indexOf(part);
            if(idx == -1) part = { tagName: part };
          }
        }

        // if(out[out.length - 1] !== part)
        Array.prototype.push.call(out, part);
      }
    }
  }

  static partToString(a, sep = '/', childrenStr, c = (text, c = 33, b = 0) => `\x1b[${b};${c}m${text}\x1b[0m`) {
    if(a.length == 0) return null;
    let s = '';
    let part = a.shift();
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

  static get [Symbol.species]() {
    return this;
  }

  clone() {
    const ctor = this.constructor[Symbol.species];
    return new ctor(this, this.absolute);
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
    if(this.last + n < this.length) {
      const ctor = this.constructor[Symbol.species];
      return new ctor(this.splice(-1, 1, Math.min(this.length, this.last + n)));
    }
  }

  /**
   * @brief Return new locator advanced to left
   *
   * @param      {number}  [n=1]   Number of steps to left
   * @return     {Path}
   */
  left(n = 1) {
    if(this.last >= n) {
      const ctor = this.constructor[Symbol.species];
      return new ctor(this.splice(-1, 1, Math.max(0, this.last - n)));
    }
  }

  /**
   * @brief Return new locator advanced upwards
   *
   * @param      {number}  [n=1]   Number of steps up
   * @return     {Path}
   */
  up(n = 1) {
    if(this.length >= n) return this.slice(0, this.length - n);
  }

  down(...args) {
    return this.concat(args);
  }

  /**
   * @brief Return new locator for n-th child
   *
   * @param      {number}  [i]   Index of child
   * @return     {Path}
   */
  nthChild(i) {
    return this.down(MutablePath.CHILDREN_SYM, i);
  }

  diff(other) {
    let i;
    const ctor = this.constructor[Symbol.species];
    for(i = 0; i < this.length; i++) {
      if(this[i] != other[i]) return null;
    }
    return new ctor(other.slice(i, other.length - i), this.absolute);
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

  static compareObj(obj, other) {
    //console.log("MutablePath.compareObj",{obj,other});
    let ret = true;
    for(let prop in other) {
      const value = other[prop];
      if(Util.isObject(value)) {
        if(!this.compareObj(obj[prop], value)) {
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
    let a = this.toArray();

    //console.log("MutablePath.apply",this, {o,a});

    while(a.length >= 1 && a[0] === '') a = a.slice(1);

    a = a.reduce(
      (a, i) => {
        if(a.o) {
          let r;
          //console.log(`MutablePath.apply[`,a.n,`]`,Util.isArray(a.o),a.o,i);
          if(MutablePath.isChildren(i)) {
            i = 'children';
          } else if(Util.isArray(a.o)) {
            if(typeof i == 'object') {
              //console.log(`MutablePath.apply findIndex`,a.o,i);

              i = a.o.findIndex(child => MutablePath.compareObj(child, i));
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

  toString(...args) {
    const color = Util.isBrowser() ? text => text : (text, ...c) => `\x1b[${c.join(';') || 0}m${text}`;
    const [sep = '.', partToStr = MutablePath.partToString, childrenStr = MutablePath['CHILDREN_GLYPH'] + CHILDREN_SPACE] = args;
    let a = [...this];
    //console.log("toString",{sep,partToStr, childrenStr});
    while(a.length > 0 && a[0] === '') a.shift();
    let n = a.length;
    let r = [];
    for(let i = 0; ; i++) {
      let p = partToStr(a, '/', childrenStr, color);
      if(!p) break;
      r = r.concat(p);
    }
    const pad = (s, n = 1) => ' '.repeat(n) + s + ' '.repeat(n);
    //console.log("r:",r);

    /*
    r = r.reduce(
      (acc, p) => [...acc, ...(/^[A-Za-z]/.test(p) ? [pad(color(['\u2b21', '\u274a', '\u229b', '\u273d', '\u20f0', '\u20f0', '\u272a', '\u262a',  '\u21f9', '\u29bf','\u25c7', '\u2b20', '\u267d', '\u267c', '\u267b', '\u2693','\u0fd6', '\u0fd5', '\u2620', '\u0e1e'][10], 1, 35)), color(p || "''", 1, 33)] : [sep, p])],
      []
    );*/

    r = r.join(color(sep, 1, 36) + color('', 1, 30)); //.replace(/[/\.]\[/g, '[');
    r = (this.absolute && r != '' && sep == '/' ? sep : '') + r;
    return r.replace(/\//g, sep);
    /*     .replace(new RegExp(childrenStr + '.', 'g'), childrenStr + ' \x1b[1;36m')
      .replace(new RegExp('.' + childrenStr, 'g'), ` \x1b[1;30m` + childrenStr)*/
  }

  toSource(sep = ',') {
    return `[${this.filter(item => !MutablePath.isChildren(item)).join(sep)}]`;
  }

  get absolute() {
    return this[0] === '';
  }

  makeAbsolute(parent) {
    const ctor = this.constructor[Symbol.species];
    if(this.absolute) return this;
    let r = [...parent, ...this];
    if(r[0] !== '') r.unshift('');
    return new ctor(r, parent.absolute);
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    const sep = '.',
      childrenStr = '\u220a' + CHILDREN_SPACE,
      color = true;

    let p = MutablePath.prototype.toString.call(this /*, sep || '\u2571' || '\u29f8', childrenStr, text => text*/);
    let n = Util.className(this);
    let c = n.startsWith('Mutable') ? 31 : 32;
    let t = color ? (text, ...args) => `\u001b[${args.join(';')}m` + text : text => text;
    let max = 100;

    if(Util.stripAnsi(p).length > max) {
      let pos = p.length - max;
      if(p.substring(pos).indexOf(sep) != -1) pos += p.substring(pos).indexOf(sep) + 1;
      const num = p.substring(0, pos - 1).split(sep).length;
      p = t(`... ${num} components ...`, 1, 36) + ' | ' + p.substring(pos, p.length);
    }
    return color ? `\x1b[1;${c}m${n.replace(/^Immutable/, '')}\x1b[1;30m ${p}\x1b[0m` : p;
  }

  [Symbol.toStringTag]() {
    return MutablePath.prototype.toString.call('.', '\u220a' + CHILDREN_SPACE);
  }

  existsIn(root) {
    let i,
      obj = root;
    for(i = 0; i + 1 < this.length; i++) {
      const key = this.at(i);
      if(!(key in obj)) throw new Error(`No path ${this.join(',')} in ${typeof root}`);
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

  /**
   * { function_description }
   *
   * @param      {number}  [start=0]          The start
   * @param      {number}  [end=this.length]  The end
   * @return     {Path}    { description_of_the_return_value }
   */
  slice(start = 0, end = this.length) {
    const ctor = this.constructor[Symbol.species];
    let a = this.toArray();
    if(start < 0) start = a.length + start;
    if(end < 0) end = a.length + end;
    a = Array.prototype.slice.call(a, start, end);
    return new ctor(a, a[0] === '');
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
    const ctor = this.constructor[Symbol.species];

    return new ctor(this.toArray().concat(Array.from(a)), this.absolute);
  }

  /* reduce(fn, acc) {
      for(let i = 0; i < this.length; i++) acc = fn(acc, this[i], i, this);
      return acc;
    }*/
  map(fn) {
    let ret = [];
    for(let i = 0; i < this.length; i++) {
      let r = fn(this.at(i), i, this);
      ret.push(r === 'children' ? MutablePath.CHILDREN_SYM : r);
    }
    return ret;
  }
  filter(fn) {
    let ret = [];
    for(let i = 0; i < this.length; i++) if(fn(this.at(i), i, this)) ret.push(this[i]);
    return ret;
  }

  at(i) {
    const part = this[i];
    return MutablePath.isChildren(part) ? 'children' : part;
  }

  offset(predicate = (p, i) => p === '' || p === '/') {
    let i = 0;
    for(; i < this.length; i++) {
      const part = this.at(i);
      if(!predicate(part, i, this)) break;
    }
    return i;
  }

  toArray(skip = true, n = 1) {
    let ret = [];
    let i = this.offset();
    for(; i < this.length; i += n) {
      if(n > 1) ret = ret.concat(Array.prototype.slice.call([...this], i, i + 2));
      else ret.push(this[i]);
    }
    return ret;
  }

  equals(other = []) {
    const thisPath = this;
    /*console.log('equal', { thisPath, other });
    //console.log('thisPath', thisPath.length, ...[...thisPath]);
    //console.log('other', other.length, ...[...other]);*/
    if(/*other.absolute &&*/ other.length != this.length) return false;
    if(!other.absolute && other.length < this.length) {
      let prepend = this.slice(0, this.length - other.length);
      other = prepend.concat(other);
    }
    for(let i = 0; i < other.length; i++) {
      if(typeof this[i] != 'object') {
        if(this[i] != other[i]) return false;
      } else if(!Util.equals(this[i], other[i])) {
        return false;
      }
    }

    return true;
  }

  get parent() {
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
}

Util.defineGetter(MutablePath, Symbol.species, function() {
  return MutablePath;
});

export const Path = Util.immutableClass(MutablePath);

export const ImmutablePath = Path;

Util.defineGetter(Path, Symbol.species, function() {
  return ImmutablePath;
});
