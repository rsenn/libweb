import { MutablePath, DereferenceError, toXML }from '../json.js';
import Util from '../util.js';

export class MutableXPath extends MutablePath {
  static get [Symbol.species]() {
    return MutableXPath;
  }

  static [Symbol.hasInstance](instance) {
    return ['MutableXPath', 'ImmutableXPath', 'XPath'].indexOf(Util.className(instance)) != -1;
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

  toString() {
    let a = super.slice();
    let r = [].concat(a.filter(p => p != 'children'));
    let s = Array.prototype.join.call(r, '/');
    s = s.replace(/,/g, '/').replace(/\/\[/g, '[');
    s = ((this.descendand > 0 || this.absolute) && !s.startsWith('/') ? (this.descendand ? '//' : '/') : '') + s;
    return s;
  }

  toRegExp() {
    let s = this.toString();
    s = s.replace(/\/\//g, '/?(.*/|)(');
    s = s.replace(/(\[|\])/g, '\\$1');
    s = s.replace(/\//g, '[./]');
    s = s.replace(/['"`]/g, `['"\`]?`);
    return new RegExp('' + s + ')([^/.][^/.]*|)$', 'gi');
  }
}


export const XPath = Util.immutableClass(MutableXPath);
export const ImmutableXPath = XPath;
