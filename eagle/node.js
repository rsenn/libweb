import { EagleRef, EagleReference } from './locator.js';
import Util from '../util.js';
import deep from '../deep.js';
import { lazyMembers } from '../lazyInitializer.js';
import { text, inspect, EagleInterface } from './common.js';

import { makeEagleNodeMap } from './nodeMap.js';

export const makeEagleNode = (owner, ref, ctor) => {
  if(!ctor) ctor = owner[Symbol.species];

  let e = ctor.get ? ctor.get(owner, ref) : new ctor(owner, ref);
  return e;
};

export class EagleNode extends EagleInterface {
  ref = null;

  get [Symbol.species]() {
    return EagleNode;
  }

  constructor(owner, ref, raw) {
    super(owner);

    if(ref) {
      if(!(ref instanceof EagleReference)) {
        ref = new EagleRef(owner && 'ref' in owner ? owner.ref.root : owner, [...ref]);
        console.log('EagleNode.constructor ', { owner, ref, raw });
      }

      Util.define(this, 'ref', ref);
    }
  }

  get path() {
    return this.ref.path;
  }

  get root() {
    let root = this.ref.root;
    return root;
  }

  get document() {
    let doc = this;
    while(doc.owner !== undefined) doc = doc.owner;
    return doc;
  }

  get chain() {
    let doc = this.owner;
    let ret = [];
    while(doc !== undefined) {
      ret.push(doc);
      doc = doc.owner;
    }
    return ret;
  }

  getDocument() {
    let l = this.path.clone();
    let d = this.owner;
    if(!(d instanceof EagleDocument) && this.path.length) while(!(d instanceof EagleDocument)) d = d[l.shift()];
    return d;
  }

  get project() {
    if(Util.className(this.owner) == 'EagleProject') return this.owner;
    return this.document.owner;
  }

  get node() {
    let node = this.path.apply(this.root.raw);
    return node;
  }

  get raw() {
    if(this.xml && this.xml[0]) return this.xml[0];

    let obj = this;
    while('ref' in obj) {
      let ref = obj.ref;
      obj = ref.dereference();
      if('raw' in obj) {
        obj = obj.raw;
        break;
      }
    }
    return obj;
  }

  cacheFields() {
    switch (this.tagName) {
      case 'schematic':
        return ['settings', 'layers', 'libraries', 'classes', 'parts', 'sheets'];
      case 'board':
        return ['plain', 'libraries'];
      case 'sheet':
        return ['busses', 'nets', 'instances'];
      case 'deviceset':
        return ['gates', 'devices'];
      case 'device':
        return ['connects', 'technologies'];
      case 'library':
        return ['packages', 'symbols', 'devicesets'];
    }
  }

  get childConstructor() {
    let protos = Util.getPrototypeChain(this);
    if(Util.fnName(protos[0].constructor) == 'EagleDocument') protos.shift();
    let ctor = protos[0].constructor;
    console.log('ctor:', ctor);
    return ctor;
  }

  initCache(ctor = this.childConstructor) {
    let fields = this.cacheFields();

    if(fields) {
      Util.define(this, 'cache', {});
      Util.define(this, 'lists', {});

      let lazy = {};
      let lists = {};
      let maps = {};
      let ref = this.ref;

      for(let [value, path] of deep.iterate(ref.dereference(), v => v && fields.indexOf(v.tagName) != -1)) {
        const key = value.tagName;
        lazy[key] = () => makeEagleNode(this, ref.down(...path), ctor);
        lists[key] = () => lazy[key]().children;

        maps[key] = ['sheets', 'connects', 'plain'].indexOf(key) != -1 ? lists[key] : () => makeEagleNodeMap(lazy[key]().children, key == 'instances' ? 'part' : key == 'layers' ? 'number' : 'name');
      }
      lazyMembers(this.lists, lists);
      lazyMembers(this.cache, lazy);
      lazyMembers(this, maps);
    }
  }

  appendChild(node, attributes = {}) {
    if(typeof node == 'string') {
      node = {
        tagName: node,
        children: []
      };
    }
    node.attributes = attributes;
    this.ref
      .down('children')
      .dereference()
      .push(node);
    return this.lastChild;
  }

  replace(node) {
    this.ref.replace(node);
  }

  *getAll(pred, transform) {
    let name;
    if(pred instanceof RegExp) {
      name = pred;
      pred = (v, p, o) => name.test(v.tagName);
    } else if(typeof pred == 'string') {
      name = pred;
      pred = (v, p, o) => v.tagName === name;
    }

    let ctor = this[Symbol.species];

    transform = transform || ((...args) => args);

    for(let [v, p, o] of deep.iterate(this.raw, pred, [])) {
      yield transform(v, p, o);
    }
  }

  get(pred, transform) {
    return [...this.getAll(pred, transform)][0] || null;
  }

  find(name) {
    const a = [...this.getAll(name)];
    return a[0];
  }

  getMap(entity) {
    let a = this.cache[entity + 's'];
    if(a && a.children) return new Map([...a.children].map(e => [e.name, e]));
    return null;
  }

  getByName(element, name, attr = 'name', t = ([v, l, d]) => makeEagleNode(d, this.ref.down(...l), this.childConstructor)) {
    for(let [v, l, d] of this.iterator([], it => it)) {
      if(typeof v == 'object' && 'tagName' in v && 'attributes' in v && attr in v.attributes) {
        if(v.tagName == element && v.attributes[attr] == name) return t([v, l, d]);
      }
    }
    return null;
  }

  get names() {
    let names = [];
    let ref = this.ref;
    do {
      let node = ref.dereference();
      if(node.attributes.name !== undefined) names.push([node.tagName, node.attributes.name]);
      ref = ref.up(2);
    } while(ref.path.length);
    return Object.fromEntries(names);
  }

  get nextSibling() {
    const ref = this.ref.nextSibling;
    return ref ? new this[Symbol.species](this, ref) : null;
  }

  get prevSibling() {
    const ref = this.ref.prevSibling;
    return ref ? new this[Symbol.species](this, ref) : null;
  }

  get parentNode() {
    const ref = this.ref.up(2);
    if(this.path.length == 0) return null;

    return ref ? this[Symbol.species].create(this, ref) : null;
  }

  get firstChild() {
    const ref = this.ref.firstChild;
    return ref ? new this[Symbol.species](this, ref) : null;
  }

  get lastChild() {
    const ref = this.ref.lastChild;
    return ref ? new this[Symbol.species](this, ref) : null;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let attrs = '';
    let a = this.raw.attributes || this.attributes;
    if(a) attrs = Object.keys(a).reduce((attrs, attr) => attrs + ` ${text(attr, 1, 33)}${text(':', 1, 36)}${text("'" + a[attr] + "'", 1, 32)}`, ``);
    let children = this.raw.children || this.children;
    let numChildren = children.length;
    if(numChildren == 0) attrs += ' /';
    let ret = `${Util.className(this)}`;
    let tag = this.raw.tagName || this.tagName;

    if(tag) ret += ` <${tag + attrs}>`;
    if(this.filename) ret += ` filename="${this.filename}"`;
    if(numChildren > 0) ret += `{...${numChildren} children...}</${this.tagName}>`;
    return ret;
  }

  inspect() {
    return EagleNode.prototype[Symbol.for('nodejs.util.inspect.custom')].apply(this, arguments);
  }
}
