import { MutablePath, ImmutablePath } from '../json/path.js';
import Util from '../util.js';

export class MutableXPath extends MutablePath {
  static get [Symbol.species]() {
    return MutableXPath;
  }

  static [Symbol.hasInstance](instance) {
    return ['MutableXPath', 'ImmutableXPath', 'XPath'].indexOf(Util.className(instance)) != -1;
  }

  static from(path, obj) {
    let absolute = false;
    path = [...path];
    {
      while(path.length > 0 && path[0] === '') {
        path.shift();
        absolute = true;
      }
      if(absolute) if (path.length == 0 || path[0] !== '') path = [''].concat(path);
    }
    let o = obj,
      n,
      a = Util.isObject(path) && typeof path.toArray == 'function' ? path.toArray() : [...path];
    let e,
      s = [],
      i = 0;
    if(a.length > 0 && (a[0] === '' || a[0] === '/')) {
      if(a.shift() === '') absolute = true;
    }
    // if(absolute) s.push('');

    for(; i < a.length; i++) {
      let p = a[i];
      //console.log(i + '/' + a.length + ':', { p, o });
      if(MutablePath.isChildren(p)) p = 'children';
      e = o[p];
      //console.log(i + '/' + a.length + ':', { e });
      if(p == 'children') {
        s.push(p);
        n = e.length;
      } else if(Util.isObject(e) && e.tagName !== undefined) {
        let pt = [];
        if(e.tagName) {
          s.push(e.tagName);
          pt = o.filter(sib => sib.tagName == e.tagName);
        }
        if(Util.isObject(e.attributes) && e.attributes.name) {
          let name = e.attributes.name;
          name = name.replace('/', '&#47;').replace("'", '&#39;');
          s.push(`[@name='${name}']`);
        } else if(pt.length != 1) {
          if(typeof p == 'number' && n != 1) s.push(`[${p + 1}]`);
        }
        n = undefined;
      }
      o = e;
    }
    //console.log('XPath from:', a, "\n  to:", s);

    let r = new ImmutableXPath(s, absolute, obj);
    return r;
  }

  constructor(parts, absolute = false, root) {
    if(Util.isArray(parts)) {
      parts = parseXPath(parts);
      //console.log('MutableXPath.constructor', ...parts.reduce((acc,p) => acc =  acc.concat(acc.length ? [",",p] : [p]), []), {absolute});
    }
    super(parts, absolute);

    if(root !== undefined) Util.define(this, { root });
    return this;
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
    if(MutablePath.isChildren(p[0]) || p[0] == 'children') {
      p.shift();
      ret.push('children');
    }
    if(Util.isObject(p[0])) {
      const { tagName, children, attributes = {}, ...rest } = p[0];
      const keys = Object.keys(p[0]);
      let s = '';
      if(tagName) s += tagName;
      let a = Object.entries(attributes).map(([k, v]) => `@${k}='${v}'`);
      //console.log("attributes",a);
      if(a.length) s += `[${a.join('&&')}]`;
      if(s != '') ret.push(s);
    }
    if(ret.length) {
      p.shift();
      return ret;
    }
    return MutablePath.partToString(p, sep, childrenSym, c);
  }

  toArray() {
    return [...this];
  }

  toString(sep = '/', childrenVar = 'CHILDREN_STR', c = (text, c = 33, b = 0) => `\x1b[${b};${c}m${text}\x1b[0m`) {
    let a = Array.prototype.slice.call(this);
    a = a.map(p => (MutablePath.isChildren(p) && MutablePath[childrenVar]) || p);
    let r = [];
    while(a.length > 0) {
      let res = MutableXPath.partToString(a, '/', MutableXPath[childrenVar], c);
      if(!res) break;
      r = r.concat(res);
    }
    while(r.length > 1 && r[0] === '' && r[1] === '') r.shift();
    let s = Array.prototype.join.call(r, '/');
    s = s.replace(/\/\[/g, '[');
    s = s.replace(/\//g, sep);
    return s;
  }

  [Symbol.for('nodejs.util.inspect.custom')](c) {
    let { absolute } = this;
    c = typeof c == 'function' ? c : (text, ...colors) => `\x1b[${colors.join(';')}m${text}\x1b[0m`;
    let s = MutableXPath.prototype.toString.call(this, '/', '', c);
    let n = Util.className(this).replace(/Immutable/, '');
    //if(absolute) s = '/' + s;
    s = s.split(/[\/]/g);
    s = s
      .filter(i => !MutablePath.isChildren(i))
      .map(p => {
        const matches = /([^\[]*)(\[[^/]*\])?/.exec(p);
        let [tag, brack = ''] = [...matches].slice(1);
        brack = (brack + '').substring(1, brack.length - 1);
        let bmatches = /(@)?([-_A-Za-z][-_A-Za-z0-9]*)([^'"]*)(['"][^'"]*['"])?/g.exec(brack);
        let [total, at, name, op, value] = bmatches || ['', '', '', ''];
        //      console.log('matches:', { tag, brack, /*bmatches,*/ /*total,*/ name, op, value });
        if(total) {
          p = c(tag, 1, 32) + c('[', 38, 5, 243);
          p += c(at, 38, 5, 196) + c(name, 1, 33) + c(op, 1, 36) + c(value, 1, 35) + c(']', 38, 5, 243 /*1, 32*/);
        } else {
          p = c(p, 38, 5, 99 /*129 56*/);
        }
        return p;
      })
      .reduce((acc, p) => {
        /*console.log("",{acc,p});*/ if(p.startsWith('[') && acc.length) acc[acc.length - 1] += c(p, 1, 32);
        else acc.push(p);
        return acc;
      }, []);
    s = s.join(c('/', 38, 5, 51 /* 1, 36*/));
    s = c(n, 1, ...(/Mutable/.test(n) ? [38, 5, 124] /*[1,32]*/ : [38, 5, 214 /*1,31*/])) + ' ' + s;
    //console.log(`MutableXPath.prototype[Symbol.for('nodejs.util.inspect.custom')] s=`, [...this]);
    //console.log('inspect.custom', s);
    return s;
  }

  [Symbol.toStringTag]() {
    return MutableXPath.prototype[Symbol.for('nodejs.util.inspect.custom')].call(this, text => text);
  }

  toRegExp() {
    let s = this.toString();
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

export const parseXPath = s => {
  let l = Util.isArray(s) ? [...s] : s.split(/[.\/]/g);
  let r = [];
  // if(l[0] == '') l.shift();
  l = (l || []).reduce((acc, part) => {
    if(acc.length && part[0] == '[') acc[acc.length - 1] += part;
    else acc.push(part);
    return acc;
  }, []);
  //console.log('parseXPath:', {  r });
  let o;

  for(let p of l) {
    if(typeof p == 'string') {
      //console.log('parseXPath:', p);
      let j = p.indexOf('[');
      let i = j != -1 ? p.substring(j + 1, p.indexOf(']')) : '';
      let t = p.substring(0, j == -1 ? p.length : j);
      o = {};

      if(i) {
        if(!isNaN(+i)) {
          r.push('children');
          r.push(+i);
          continue;
        }

        if(i[0] == '@') {
          let ei = i.indexOf('=');
          let k = i.substring(1, ei);
          let v = i.substring(ei + 1, i.length);
          v = v.replace(/^['"](.*)['"]$/g, '$1');
          if(!o.attributes) o.attributes = {};

          o.attributes[k] = v;
        }
      }
      const isSpecialAttr = attr => ['children', 'attributes'].indexOf(attr) != -1;
      if(t != '') o.tagName = t;
      if(isSpecialAttr(t) || r[r.length - 1] == 'attributes') {
        p = t;
      } else {
        /*  if(r[r.length - 1] != 'children') 
        r.push('children');*/
        p = o;
      }
    }
    //console.log('p', r);
    r.push(p);
  }

  return r; //new ImmutableXPath(r);
};

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
    obj = tmp.apply(root);
    let xpath = ImmutableXPath.from(tmp, root); //(obj2path(obj));
    if(absolute && !(xpath + '').startsWith('/')) xpath = '/' + xpath;
    if(m(xpath)) r.push([xpath, obj]);
  }
  return entries ? r : new Map(r);
};
export const XPath = Util.immutableClass(MutableXPath);
export const ImmutableXPath = XPath;
