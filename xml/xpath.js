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

  static from(path, obj) {
    //console.log("MutableXPath.from",{path,obj});
    let absolute = false;
    path = [...path];
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
      let p = a[i];
      if(MutablePath.isChildren(p)) p = 'children';
      else if(Util.isObject(p) && Util.isArray(o)) p = o.findIndex(item => item.tagName === p.tagName);
      e = o[p];
      //console.log(`MutableXPath.from[${i}] `, p);
      if(p == 'children') {
        //s.push(p);
        n = e.length;
        counts = {};
        siblings = e.reduce((acc, sib, idx) => [...acc, [incr(counts, sib.tagName), sib.tagName]], []);
      } else if(Util.isObject(e) && e.tagName !== undefined) {
        const [number, tagName] = siblings[p];
        let x = '';
        if(tagName) x += tagName;
        if(Util.isObject(e.attributes) && e.attributes.name) {
          let name = e.attributes.name;
          name = name.replace('/', '&#47;').replace("'", '&#39;');
          //x =  this.matchObj(tagName, { name });
          x += `[@name='${name}']`;
        } else if(siblings.length > 1 && maxCount() > 1) {
          if(siblings[p]) p = siblings.slice(0, p).filter(([idx, tagName]) => tagName == e.tagName).length;
          else x = '';
          //console.log('', { p, x });
          x += '[' + (p + 1).toString(10) + `]`;
        } /* else {
          const uniform = Object.keys(counts).length == 1;
          if(!uniform || maxCount() > 1) {
            x += `[${number}]`;
          //console.log('MutableXPath.from: ', { i, x, max: maxCount(), number, tagName, counts, siblings });
        }
        }*/
        siblings = [];
        counts = {};
        s.push(x);
        n = undefined;
      }
      o = e;
    }
    let r = new ImmutableXPath(s, absolute, obj);
    //console.log('MutableXPath.from(', s, ')');
    //console.log('MutableXPath.from = ', r.toString());
    return r;
  }

  static matchObj = (tagName, attr_or_index = {}) => (typeof attr_or_index == 'number' ? [attr_or_index, tagName] : { tagName, attributes: attr_or_index });

  static parse(l) {
    l = Util.isArray(l) ? l : l.split(/[.\/]/g);
    if(l[0] == '') l.shift();
    if(l.indexOf('children') != -1) {
      l = l.filter(p => !ImmutablePath.isChildren(p));
      //  throw new Error('children');
    }
    //console.log('MutableXPath.parse', { l });
    l = l.map(p => {
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
            //r.push('children');
            o = t != '' ? [num, t] : num;
            //  continue;
          } else {
            if(i[0] == '@') {
              let ei = i.indexOf('=');
              let k = i.substring(1, ei);
              let v = i.substring(ei + 1, i.length);
              v = v.replace(/^['"](.*)['"]$/g, '$1');
              if(!o.attributes) o.attributes = {};
              o.attributes[k] = v;
            }
          }
        }
        //   if(isSpecialAttr(t) || r[r.length - 1] == 'attributes') o = t;
      }
      return o;
    });
    l = [...l].reduce((acc, part) => [...acc, 'children', part], []);
    //console.log(`MutableXPath.parse = `, l, ``);
    return l;
  }

  constructor(parts, absolute = false /*, root*/) {
    ///console.log('MutableXPath.parse = ', parts);
    let a = MutableXPath.parse(parts);

    super(a, absolute);
    //console.log('MutableXPath.parse = ',  this);
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
  /*
  slice(start, end) {
    let { descendand, absolute } = this;
    let i = this.offset();
    let a = this.toArray();
    let l = a.length;
    if(start < 0) start = l + start;
    if(start < 0) start = 0;
    if(start === undefined || isNaN(start)) start = 0;
    if(end === undefined || isNaN(end)) end = l;
    else if(end < 0) end = l + end;
    else if(end > l) end = l;
    if(start > 0) descendand = true;
    a = super.slice(start, end);
    let prefix = [];
    if(descendand) a = a.unshift('/');
    else if(absolute) a = a.unshift('');
    return a;
  }*/

  static partToString(p, sep = '/', childrenSym, c = (text, c = 33, b = 0) => `\x1b[${b};${c}m${text}\x1b[0m`) {
    let ret = [];
    if(MutablePath.isChildren(p[0])) {
      //console.log('p[0]:', p[0], 'p[1]:', p[1]);
      if(Util.isArray(p[1]) && p[1].length == 2) {
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

    return MutablePath.partToString(p, sep, childrenSym, c);
  }

  toArray() {
    return [...this];
  }

  toString(sep = '/', childrenSym = MutableXPath.CHILDREN_GLYPH, tfn = text => text) {
    let a = [...this];
    let r = [];
    while(a.length > 0) r = r.concat(MutableXPath.partToString(a, sep, childrenSym, tfn));
    let s = r.join('/');
    return sep + s;
  }

  [Symbol.for('nodejs.util.inspect.custom')](c) {
    let ctor = this.constructor;
    let { absolute } = this;
    c = typeof c == 'function' ? c : (text, ...colors) => `\x1b[${colors.join(';')}m${text}\x1b[0m`;
    let n = Util.className(this).replace(/Immutable/, '');
    let s = MutableXPath.prototype.toString.call(this, '/', MutableXPath.CHILDREN_GLYPH, c);
    s = s.split(/[\.\/]/g);
    s = s.filter(i => !MutableXPath.isChildren(i.replace(/\x1b\[[^a-z]*(.)/g, '')));
    s = s.reduce((acc, p) => {
      if(p.startsWith('[') && acc.length) acc[acc.length - 1] += c(p, 1, 32);
      else acc.push(p);
      return acc;
    }, []);
    s = s.join(c('/', 1, 36));
    s = c(n, 1, ...(/Mutable/.test(n) ? [38, 5, 124] : [38, 5, 214])) + ' ' + s;
    return s;
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

Util.defineGetter(MutableXPath, Symbol.species, function() {
  return MutableXPath;
});

export const parseXPath = s => ImmutableXPath.parse(s);

export const XPath = Util.immutableClass(MutableXPath);

export const ImmutableXPath = XPath;

Util.defineGetter(XPath, Symbol.species, function() {
  return ImmutableXPath;
});
