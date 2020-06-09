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
    super(owner);
    if(Util.isObject(ref) && !('path' in ref)) {
      console.log('EagleNode.constructor ', { ref, owner, raw });
      ref = new EagleRef(owner.root, [...(ref.path || ref)]);
    }
    if(!raw) raw = ref.dereference();
     {
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
    // console.log('raw:', { ref, root, owner, path });

    let r = ref.path.apply(root, true) || ref.path.apply(owner, true);
    if(!r) {
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

    //console.log('fields:', fields);
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

    let cond = (...args) => {
      //console.log('args:', args[0]);
      return pred(...args);
    };

    for(let [v, p, o] of deep.iterate(this.raw, cond, [])) {
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
    let l = [''];

    let a = this.raw.attributes || this.attributes;
    if(a) l = Object.keys(a).reduce((l, attr) => concat(l, text(attr, 1, 33), text(':', 1, 36), text("'" + a[attr] + "'", 1, 32)), l);
    let c = this.raw.children || this.children;
    console.log("c:", c);
    let n = Util.isObject(c) ? c.length : 0;
    let r = [''];
    //S+    r = concat(r, this.xpath().slice(0, -1));
    let t = this.raw.tagName || this.tagName;
    if(t) r = concat(r, text('<', 1, 36), text(t + ' ', 1, 31), l, text(n == 0 ? '/>' : '>', 1, 36));
    if(this.filename) r = concat(r, ` filename="${this.filename}"`);
    if(n > 0) r = concat(r, `{...${n} children...}</${this.tagName}>`);
    return (r = concat(r, text('', 0)));
  }

  inspect() {
    return EagleNode.prototype[Symbol.for('nodejs.util.inspect.custom')].apply(this, arguments);
  }
}
