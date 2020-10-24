import { MutablePath } from '../json/path.js';
import Util from '../util.js';

const incr = (o, p, i = 1) => (o[p] = (o[p] || 0) + i);
const isSpecialAttr = attr => ['children', 'attributes'].indexOf(attr) != -1;

export class MutableXPath extends MutablePath {
  /* static get [Symbol.species]() {
    return MutableXPath;
  }*/

  static [Symbol.hasInstance](instance) {
    return ['MutableXPath', 'ImmutableXPath', 'XPath'].indexOf(Util.className(instance)) != -1;
  }

  static partMatcher(part) {
    if(typeof part == 'string') part = ImmutableXPath.strToPart(part);
    if(Util.isArray(part)) {
      let [nth, tagName] = part;
      let fn = eval(`(n =>  (e,i) => (n = i == 0 ? -1 : n, e.tagName == '${tagName}' && ++n == ${nth}))()`);

      fn.object = part;
      part = fn;
      //console.log("part",part+'')
    } else if(Util.isObject(part) && typeof part.tagName == 'string') {
      const { tagName, attributes } = part;
      let fn;
      if(tagName.startsWith('undefined')) throw new Error(tagName);

      if(attributes) fn = ImmutableXPath.matchObj(tagName, attributes);
      else fn = eval(`e => e.tagName=='${tagName}';`);
      let fnStr = fn + '';
      //  new Function('e', `return e.tagName == '${tagName}'`);
      fn.object = part;
      Util.define(fn, {
        toString() {
          return fnStr;
        }
      });
      part = fn;
    }
    return part;
  }

  static isMemberName(name, out = {}) {
    return ['attributes', out.tagField || 'tagName', 'children', ...(out.specialFields || [])].indexOf(name) != -1;
  }

  static from(path, obj) {
    //console.log('MutableXPath.from', { path, obj });
    let absolute = false;
    path = [...path]; //.filter(part => part != 'children');
    while(path.length > 0 && path[0] === '') {
      path.shift();
      absolute = true;
    }
    if(absolute) if (path.length == 0 || path[0] !== '') path = [''].concat(path);
    let o = obj;
    let n;
    let a = Util.isObject(path) && typeof path.toArray == 'function' ? path.toArray() : [...path];
    let e;
    let s = [];
    let i = 0;
    let siblings, counts;
    const maxCount = () => Math.max(...Object.values(counts));
    if(a.length > 0 && (a[0] === '' || a[0] === '/')) if (a.shift() === '') absolute = true;
    for(; i < a.length; i++) {
      let x = '';
      let p = a[i];
      if(MutablePath.isChildren(p)) p = 'children';
      else if(Util.isObject(p) && Util.isArray(o)) p = o.findIndex(item => item.tagName === p.tagName);
      //console.log(`MutableXPath.from[${i}] `, { p, o, f: p + '' });
      e = typeof p == 'function' ? o.find(p) : o[p];
      if(p == 'children' || Util.isArray(e)) {
        n = e.length;
        counts = {};
        siblings = e.reduce((acc, sib, idx) => [...acc, [incr(counts, sib.tagName), sib.tagName]], []);
      } else if(Util.isObject(e) && e.tagName !== undefined) {
        const [number, tagName] = siblings[p] || [0, e.tagName];
        //console.log('MutableXPath.from', { e, tagName, number });
        if(tagName) x += tagName;
        if(Util.isObject(e.attributes) && e.attributes.name) {
          let name = e.attributes.name;
          name = name.replace('/', '&#47;').replace("'", '&#39;');
          x += `[@name='${name}']`;
        } else if(siblings.length > 1 && maxCount() > 1) {
          if(siblings[p]) p = siblings.slice(0, p).filter(([idx, tagName]) => tagName == e.tagName).length;
          else x = '';
          //console.log('', { p, x });
          x += '[' + (p + 1).toString(10) + `]`;
        }
        siblings = [];
        counts = {};
        s.push(x);
        n = undefined;
      }
      o = e;
    }
    //console.log('MutableXPath.from(', s, ')');
    s = s.reduce((x, p) => [...x, 'children', p], []);
    let r = new ImmutableXPath(Object.setPrototypeOf(s, ImmutableXPath.prototype), absolute, obj);
    //console.log('MutableXPath.from = ', r);
    return r;
  }
  /*
  static matchObj = (tagName, attr_or_index = {}) =>
    typeof attr_or_index == 'number' ? [attr_or_index, tagName] : { tagName, attributes: attr_or_index };
*/
  static matchObj(tagName, attr_or_index, tagField = 'tagName') {
    if(typeof attr_or_index == 'number') return [attr_or_index, tagName];
    if(Util.isObject(attr_or_index)) return { tagName, attributes: attr_or_index };
    let cmd = `e => e.${tagField} === '${tagName}'`;
    //console.log('typeof(tagName):', typeof tagName);
    let ret = eval(cmd);
    //console.log('matchObj:', cmd, ret);
    return ret;
  }

  static strToPart(p) {
    let o = p;
    if(typeof p == 'string') {
      let j = p.indexOf('[');
      let i = j != -1 ? p.substring(j + 1, p.indexOf(']')) : '';
      let t = p.substring(0, j == -1 ? p.length : j);
      let s = '';
      o = {};
      if(t != '') o.tagName = t;
      if(i != '') {
        const num = isNaN(+i) ? -1 : +i - 1;
        if(num >= 0) {
          o = t != '' ? [num, t] : num;
        } else if(i[0] == '@') {
          let ei = i.indexOf('=');
          let k = i.substring(1, ei);
          let v = i.substring(ei + 1, i.length);
          v = v.replace(/^['"](.*)['"]$/g, '$1');
          if(!o.attributes) o.attributes = {};
          o.attributes[k] = v;
        }
      }
    }
    return o;
  }

  static parse(l) {
    l = Util.isArray(l)
      ? l
      : l.split(new RegExp(`\\s?[.\\/${this.CHILDREN_GLYPH}]\\s?`, 'g')).map(p => (isNaN(+p) ? p : +p));
    //console.log('MutableXPath.parse', { l });
    if(l[0] == '') l.shift();
    if(l.indexOf('children') != -1) {
      l = l.filter(p => !ImmutablePath.isChildren(p));
    }
    //console.log('MutableXPath.parse', { l });
    l = l.map(ImmutableXPath.strToPart);
    l = [...l].reduce((acc, part) => [...acc, 'children', part], []);
    //console.log(`MutableXPath.parse = `, l, ``);
    return l;
  }

  constructor(a, absolute = false) {
    //console.log('ImmutableXPath.constructor:', a);
    if(!(a instanceof ImmutableXPath)) a = ImmutableXPath.parse(a);
    //console.log("a:", a);
    a = a.map(part => {
      //console.log("part:", part);
      return typeof part == 'symbol' || part == 'children' ? part : ImmutableXPath.partMatcher(part);
    });
    super(a, absolute);
    //console.log(Util.className(this) + '.constructor', a);
  }

  get descendand() {
    let i = this.offset(v => v === '');
    if(i < this.length && this[i] === '/') return 1;
    return 0;
  }

  get absolute() {
    let i = this.offset(v => v === '/');
    if(i < this.length && this[i] === '') return 1;
    return 0;
  }
  slice(start = 0, end = this.length) {
    const ctor = this.constructor[Symbol.species];
    let r = super.slice(start, end);
    if(ctor == ImmutableXPath) r = Object.freeze(r);
    return r;
  } 
  
  static partToString(p, sep = '/', childrenSym, c = (text, c = 33, b = 0) => `\x1b[${b};${c}m${text}\x1b[0m`) {
    let ret = [];
    if(MutableXPath.isChildren(p[0])) {
      //console.log('p[0]:', p[0], 'p[1]:', p[1]);
      if(typeof p[1] == 'function' && p[1].object) p[1] = p[1].object;

      if(p[1] && p[1].length == 2) {
        p.shift();
        let arr = p.shift();
        ret.push(childrenSym);
        ret.push(c(arr[1], 1, 31) + c(`[${arr[0] + 1}]`, 1, 35));
      } else if(Util.isObject(p[1])) {
        p.shift();
        ret.push(childrenSym);
        const { tagName, children, attributes = {}, ...rest } = p[0];
        const keys = Object.keys(p[0]);
        let s = '';
        if(tagName) s += c(tagName, 1, 31);
        let a = Object.entries(attributes).map(([k, v]) => `@${k}='${v}'`);
        if(a.length) s += `[${a.join('&&')}]`;
        if(s != '') {
          ret.push(s);
          p.shift();
        }
      } else if(Util.isNumeric(p[1])) {
        p.shift();
        let num = +p.shift();
        ret.push(childrenSym);
        ret.push(c(`[${num + 1}]`, 1, 36));
      }
      if(ret.length) return ret;
    }
    return [];
    //return MutablePath.partToString(p, sep, childrenSym, c);
  }

  toArray() {
    return [...this];
  }

  toString(sep = '/', childrenSym = this.constructor.CHILDREN_GLYPH, tfn = text => text) {
    let ctor = this.constructor;
    let a = [...this];
    let r = [];
    while(a.length > 0) {
      let p = ctor.partToString([...a], sep, childrenSym, tfn);
      //console.log("p:", p);
      r = r.concat(p);
      a.splice(0, p.length);
      //console.log("r:", r);
    }
    let s = r.join('/');
    return (sep + s).replace(new RegExp(ctor.CHILDREN_GLYPH + '(//*)', 'g'), '$1').replace(/(\/+)/g, '/');
  }

  toCode(name = '', opts = {}) {
    const { spacing = '', perline = 2, function: fn = false } = opts;
    let n = this.length;
    const y = i => -(i - (n - 1)) % perline != 0;
    if(fn && name == '') name = 'arg';
    let r = this.toArray();
    r = r.reduce((acc, part, i) => acc + (y(i) ? spacing : '') + partToStr(part), name);
    if(fn) {
      const code = `${name} => ${r}`;
      //console.log('code:', code, { r });
      r = eval(code);
    }
    return r;
    function partToStr(part) {
      if(typeof part == 'symbol') part = Symbol.keyFor(part);
      if(typeof part == 'number' || Util.isNumeric(part)) return `[${part}]`;
      if(typeof part == 'function' && part.object) part = part.object;
      if(Util.isArray(part)) {
        part = `find(${ImmutableXPath.partMatcher(part)})`;
      } else if(part.tagName) {
        const cond = `tagName=='${part.tagName}'`;
        const attrs = part.attributes
          ? Object.entries(part.attributes).map(([k, v]) => `attributes.${k} == '${v}'`)
          : [];
        const pred = `({tagName${attrs.length ? ',attributes' : ''}}) => ${[cond, ...attrs].join(' & ')}`;
        part = `find(${pred})`;
      }
      return `.${part}`;
    }
  }

  [Symbol.for('nodejs.util.inspect.custom')](c) {
    let ctor = this.constructor;
    let { absolute } = this;
    c = typeof c == 'function' ? c : (text, ...colors) => `\x1b[${colors.join(';')}m${text}\x1b[0m`;
    let n = Util.className(this).replace(/Immutable/, '');
    let s = MutableXPath.prototype.toString.call(this, '/', ctor.CHILDREN_GLYPH, c);
    s = s.split(/[\.\/]/g);
    s = s.filter(i => !ctor.isChildren(i.replace(/\x1b\[[^a-z]*(.)/g, '')));
    s = s.reduce((acc, p) => {
      if(p.startsWith('[') && acc.length) acc[acc.length - 1] += c(p, 1, 32);
      else if(p !== undefined) acc.push(p);
      return acc;
    }, []);
    s = s.join(c('/', 1, 36));
    s = c(n, 1, ...(/Mutable/.test(n) ? [38, 5, 124] : [38, 5, 214])) + ' ' + s;
    return s.replace(new RegExp('/' + ctor.CHILDREN_GLYPH, 'g'), '/');
  }

  [Symbol.toStringTag]() {
    return MutableXPath.prototype[Symbol.for('nodejs.util.inspect.custom')].call(this, text => text);
  }

  toRegExp() {
    let s = MutableXPath.prototype.toString.call(this);
    s = s.replace(/\/\//g, '/?(.*/|)');
    s = s.replace(/(\[|\])/g, '\\$1');
    s = s.replace(/\//g, '[./]');
    s = s.replace(/['"`]/g, '[\'"`]');
    s = '(' + s + ')([^/.][^/.]*|)$';
    let re = new RegExp(s, 'gi');
    //console.log("toRegExp",{s,re})
    return re;
  }
}

export const findXPath = (xpath, flat, { root, recursive = true, entries = false }) => {
  let r = [];
  let absolute = xpath.startsWith('/');
  let s = (xpath + '').substring(0, xpath.length) + (recursive ? '([[/].*|)' : '[^/]*');
  s = s.replace(/[_:'%]/g, '[^/]');
  if(s[s.length - 1] != '$') s += '$';
  s = s.replace(/^\/\//, '/(|.*/)');

  if(s[0] != '^' && xpath.substring(0, 2) != '//') s = '^' + s;
  //console.log('', { s });
  let re = new RegExp(s);
  let m = other => re.test(other);

  for(let [path, obj] of flat) {
    let tmp = new Path(path == '' ? [] : path, true);
    obj = tmp.apply(root, true);
    let xpath = ImmutableXPath.from(tmp, root); //(obj2path(obj));
    if(absolute && !(xpath + '').startsWith('/')) xpath = '/' + xpath;
    if(m(xpath)) r.push([xpath, obj]);
  }
  return entries ? r : new Map(r);
};

Util.defineGetter(MutableXPath, Symbol.species, () => MutableXPath);

export const parseXPath = s => ImmutableXPath.parse(s);

export const XPath = Util.immutableClass(MutableXPath);

export const ImmutableXPath = XPath;

Util.defineGetter(XPath, Symbol.species, () => ImmutableXPath);
