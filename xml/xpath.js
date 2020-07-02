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
    //   while(path.length > 0 && path[0] === '') path.shift();

    if(!(path instanceof ImmutablePath)) path = new ImmutablePath(path, true);
    /*   console.log('path:', [...path]);
    //console.log('obj:', obj);*/

    let o = obj,
      n,
      thisPath = Util.isObject(path) && typeof path.toArray == 'function' ? path.toArray() : [...path];

    let e,
      s = [],
      i = 0,
      a = [...thisPath];

    // console.log('XPath from:', a /*, "\n object:",o*/); //    while(i < a.length && a[i] === '') i++;

    for(; i < a.length; i++) {
      let p = a[i];

      //   console.log(i + '/' + a.length + ':', { p, o });
      if(MutablePath.isChildren(p)) p = 'children';

      e = o[p];
      // console.log(i + '/' + a.length + ':', { e });

      if(p == 'children') {
        s.push(p);
        //        s.push(MutablePath.CHILDREN_STR);
        n = e.length;
      } else if(Util.isObject(e) && e.tagName !== undefined) {
        let pt = [];
        if(e.tagName) {
          s.push(e.tagName);
          pt = o.filter(sib => sib.tagName == e.tagName);
        }
        if(Util.isObject(e.attributes) && e.attributes.name) {
          s.push(`[@name='${e.attributes.name}']`);
        } else if(pt.length != 1) {
          if(typeof p == 'number' && n != 1) s.push(`[${p + 1}]`);
        }
        n = undefined;
      }

      o = e;
      // if(p == 'attributes') break;
    }

    let r = new ImmutableXPath(s, this.absolute, obj);
    //   console.log('xpath', thisPath.absolute, { s, a, r }, r + '');
    return r;
  }

  constructor(parts = [], absolute, root) {

    if(absolute && (parts.length == 0 || parts[0] !== '')) Array.prototype.unshift.call(parts, '');

    super(parts);
    console.log('MutableXPath.constructor', MutablePath.prototype.toString.call(this, '/', 'CHILDREN_STR'));
    this.root = root;

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
  }

  static partToString(p, sep = '/', childrenSym, c = text => text/*(text, c = 33, b = 0) => `\x1b[${b};${c}m${text}\x1b[0m`*/) {
    let ret = [];
    if(MutablePath.isChildren(p[0]) || p[0] == 'children') {
      p.shift();
      ret.push('children');
    }

    if(Util.isObject(p[0])) {
      const keys = Object.keys(p[0]);
      //      console.log(Util.fnName(this) + '.partToString keys.length:',keys.length, ' keys[0]:',keys[0], 'obj:', p[0], 'keys:', keys);
      if(keys.length == 1 && keys.indexOf('tagName') !== -1) {
        /*       let prop = item[keys[0]];
    //console.log(Util.fnName(this) + '.partToString p[0]:', item, prop);
  //      return [prop];
*/ let item = p.shift();
        let prop = item[keys[0]];
        //   p.unshift(prop);
        return [prop];
      }
    }
    /*
      let { tagName, ...attrs } = p.shift();
      return tagName + (Object.keys(attrs).length == 0 ? '' : Util.toString(attrs, { spacing: '', padding: '' }));
    }*/
    return MutablePath.partToString(p, sep, childrenSym, c);
  }

  toString(sep = '/', childrenVar = 'CHILDREN_STR_') {
    let a = Array.prototype.slice.call(this); //Array.prototype.slice.call(this);
    //a = a.filter(p =>  p!== undefined);


    a = a.map(p => (MutablePath.isChildren(p) && MutablePath[childrenVar]) || p);
    let r = [];

    while(a.length > 0) {
      let res = MutableXPath.partToString(a, '/', MutableXPath[childrenVar], text => text);  if(!res) break;
       console.log("toString res",res);
      r = r.concat(res);
    }
    //console.log('r===', r);
    let s = Array.prototype.join.call(r, '/');

        s = s.replace(/,/g, '/').replace(/\/\[/g, '[');
    s = ((this.descendand > 0 || this.absolute) && !s.startsWith('/') ? (this.descendand ? '//' : '/') : '') + s;
    s = s.replace(/\//g, sep);
  console.log('r=', r, '\ns=', s, '\na=', a);

    return s;
  }

  toRegExp() {
    let s = this.toString();
    s = s.replace(/\/\//g, '/?(.*/|)');
    s = s.replace(/(\[|\])/g, '\\$1');
    s = s.replace(/\//g, '[./]');
    s = s.replace(/['"`]/g, '[\'"`]');
    s = '(' + s + ')([^/.][^/.]*|)$';
    let re = new RegExp(s, 'gi');
    // console.log("toRegExp",{s,re})
    return re;
  }
}

export const parseXPath = s => {
  //console.log('parseXPath:', s);
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

    r.push('children');
    r.push(o);
  }
  return new this(r);
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
