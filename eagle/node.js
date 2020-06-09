import { EagleRef, EagleReference } from './locator.js';
import Util from '../util.js';
import deep from '../deep.js';
import { lazyMembers } from '../lazyInitializer.js';
import { trkl } from '../trkl.js';
import { text, inspect, EagleInterface, concat, ansi } from './common.js';

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
    if(!owner) owner = new EagleReference(ref.root, []).dereference();
    super(owner);
    if(!raw) raw = ref.dereference();

    /*    if(ref)*/ {
      if(!(ref instanceof EagleReference)) ref = new EagleRef(owner && 'ref' in owner ? owner.ref.root : owner, [...ref]);
      Util.define(this, 'ref', ref);
    }
    //console.log('EagleNode.constructor ', { ref, raw });
  }

  get path() {
    return this.ref.path;
  }

  get root() {
    let root = this.ref.root;
    return root;
  }

  get document() {
    return this.getDocument();
    let doc = this;
    let i = 0;
    while(doc.owner !== undefined) {
      if(doc.xml !== undefined) break;
      doc = doc.owner;

      i++;
    }
    //  console.log('doc:', i, Util.className(doc), this);
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
    const { ref, owner, root, path } = this;

    let r = ref.path.apply(root, true) || ref.path.apply(owner, true);
    if(!r) {
      //console.log('raw:', { ref, root, owner, path });
      r = ref.path.apply(root) || ref.path.apply(owner);
    }

    return r;
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
    //console.log('ctor:', ctor);
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

  initRelation(key, handler, fn) {
    let elem = this;
    trkl.bind(this, key, v => {
      if(v !== undefined) return handler(typeof v == 'string' ? v : v.name);
      let value = handler() || elem.attrMap[key] || elem.attributes[key];

      return fn(value, elem, elem.document);
    });

    //console.log(`initRelation`,key,this[key]);
    return this;
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
    } else if(Util.isObject(pred) && typeof pred != 'function') {
      let keys = Object.keys(pred);
      let values = keys.reduce((acc, key) => [...acc, pred[key]], []);

      pred = (v, p, o) => keys.every((key, i) => (key == 'tagName' ? v[key] == values[i] : v.attributes[key] == values[i]));
    }

    let ctor = this[Symbol.species];

    transform = transform || ((...args) => args);

    //    pred = (...args)=> { console.log("args:", args[1].toString()); return pred(...args); }

    for(let [v, p, o] of deep.iterate(this.raw, pred, [])) {
      yield transform(v, p, o);
    }
  }

  get(pred, transform) {
    let it = this.getAll(pred, transform);
    let a = [...it];
    const { root, path, raw } = this;

    //   console.log("EagleNode.get",{className: Util.className(this), root,path,raw,pred: pred+'',it,a});

    return a[0] || null;
  }

  find(name, transform) {
    const a = [...this.getAll(name, transform)];
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
    if(this.path.length == 0) return null;

    /*   const ref = this.ref.up(2);*/
    const { ref, path, root, raw } = this;
    //console.log("parentNode", {path,root, raw});
    return this[Symbol.species].get(root, path.up(1));
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
    let attrs = [''];
    let a = this.raw.attributes || this.attributes;
    if(a) attrs = Object.keys(a).reduce((attrs, attr) => concat(attrs, text(attr, 1, 33), text(':', 1, 36), text("'" + a[attr] + "'", 1, 32)), attrs);
    let children = this.raw.children || this.children;
    let numChildren = children.length;
    let ret = ['']; //`${Util.className(this)} `;
    let tag = this.raw.tagName || this.tagName;
    //console.realLog("attrs:",attrs);
    if(tag) ret = concat(ret, text('<', 1, 36), text(tag + ' ', 1, 31), attrs, text(numChildren == 0 ? '/>' : '>', 1, 36));
    if(this.filename) ret = concat(ret, ` filename="${this.filename}"`);
    if(numChildren > 0) ret = concat(ret, `{...${numChildren} children...}</${this.tagName}>`);
    return (ret = concat(ret, text('', 0)));
  }

  inspect() {
    return EagleNode.prototype[Symbol.for('nodejs.util.inspect.custom')].apply(this, arguments);
  }
}
