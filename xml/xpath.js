import { MutablePath, DereferenceError } from '../json/path.js';
import Util from '../util.js';

export class MutableXPath extends MutablePath {
  static get [Symbol.species]() {
    return MutableXPath;
  }

  static [Symbol.hasInstance](instance) {
    return ['MutableXPath', 'ImmutableXPath', 'XPath'].indexOf(Util.className(instance)) != -1;
  }

  static from(path, obj) {
    //  if(!(path instanceof ImmutablePath)) path = new ImmutablePath(path, true);
    //console.log('path:', path);
    //console.log('obj:', obj);

    let o = obj,
      n,
      thisPath = Util.isObject(path) && typeof path.toArray == 'function' ? path.toArray() : [...path];

    while(thisPath.length > 0 && thisPath[0] === '') thisPath.shift();

    let s = [],
      i = 0,
      a = [...thisPath];

    //console.log('XPath from:',a);//    while(i < a.length && a[i] === '') i++;

    for(; i < a.length; i++) {
      let p = a[i];
      //console.log(i + '/'+a.length+':',  p, o);

      //if(p == 'attributes') break;
      if(MutablePath.isChildren(p)) p = 'children';

      let e = o[p];
      if(p == 'children') {
        s.push('children');
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
    }

    let r = new ImmutableXPath(s, this.absolute, obj);
    //console.log('xpath', thisPath.absolute, { a, r }, r + '');
    return r;
  }

  constructor(parts = [], absolute, root) {
    if(absolute && (parts.length == 0 || parts[0] !== '')) Array.prototype.unshift.call(parts, '');

    super(parts);
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

  static partToString(p) {
    if(typeof p == 'object') {
      let { tagName, ...attrs } = p;
      return tagName + (Object.keys(attrs).length == 0 ? '' : Util.toString(attrs, { spacing: '', padding: '' }));
    }
    return MutablePath.partToString([p]);
  }

  toString() {
    let a = super.slice();
    let r = [].concat(a /*.filter(p => p != 'children')*/).map((p, i, a) => MutableXPath.partToString(p));
    let s = Array.prototype.join.call(r, '/');
    s = s.replace(/,/g, '/').replace(/\/\[/g, '[');
    s = ((this.descendand > 0 || this.absolute) && !s.startsWith('/') ? (this.descendand ? '//' : '/') : '') + s;
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
