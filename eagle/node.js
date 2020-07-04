import { EagleRef, EagleReference } from './ref.js';
import Util from '../util.js';
import deep from '../deep.js';
import { lazyMembers } from '../lazyInitializer.js';
import { trkl } from '../trkl.js';
import { text, EagleInterface, concat } from './common.js';

import { makeEagleNodeMap } from './nodeMap.js';
//import { makeEagleNodeList } from './nodeList.js';

export const makeEagleNode = (owner, ref, ctor) => {
  if(!ctor) ctor = owner.constructor[Symbol.species];
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
    {
      if(!(ref instanceof EagleReference)) ref = new EagleRef(owner && 'ref' in owner ? owner.ref.root : owner, [...ref]);
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
    let r = ref.path.apply(root, true);
    if(!r) {
      r = ref.path.apply(root) || ref.path.apply(owner);
    }
    return r;
  }

  cacheFields() {
    switch (this.tagName) {
      case 'schematic':
        return [['settings'], ['layers'], ['libraries'], ['classes'], ['parts'], ['sheets']];
      case 'board':
        return [['plain'], ['libraries']];
      case 'sheet':
        return [['busses'], ['nets'], ['instances'], ['plain']];
      case 'deviceset':
        return [['gates'], ['devices']];
      case 'device':
        return [['connects'], ['technologies']];
      case 'library':
        return [['packages'], ['symbols'], ['devicesets']];
    }
  }

  get childConstructor() {
    let protos = Util.getPrototypeChain(this);
    if(Util.fnName(protos[0].constructor) == 'EagleDocument') protos.shift();
    let ctor = protos[0].constructor;
    //console.log('ctor:', ctor);
    return ctor;
  }

  initCache(ctor = this.childConstructor, listCtor = (o, p, v) => v) {
    let fields = this.cacheFields();
    let node = this;

    if(fields && fields.length) {
      Util.define(this, 'cache', {});
      Util.define(this, 'lists', {});

      let lazy = {};
      let lists = {};
      let maps = {};
      let ref = this.ref;
      let owner = this.document;

      for(let xpath of fields) {
        let key = xpath[xpath.length - 1];
        lazy[key] = () =>
          //console.log('lookup', key, this.ref);
          this.lookup(xpath, true);
        lists[key] = () => listCtor(this, this.ref.down('children'), lazy[key]().children);

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
      .concat(['children'])
      .dereference()
      .push(node);
    return this.lastChild;
  }

  replace(node) {
    this.ref.replace(node);
  }

  static makePredicate(predicate) {
    let pred = predicate;
    if(pred instanceof RegExp) {
      let re = pred;
      pred = (v, p, o) => re.test(v.tagName);
    } else if(typeof pred == 'string') {
      let name = pred;
      pred = (v, p, o) => v.tagName === name;
    } else if(Util.isObject(pred) && typeof pred != 'function') {
      let keys = Util.isArray(pred) ? pred : Object.keys(pred);
      let values = keys.reduce((acc, key) => [...acc, pred[key]], []);

      pred = (v, p, o) => keys.every((key, i) => (key == 'tagName' ? v[key] == values[i] : v.attributes[key] == values[i]));
    }
    return pred;
  }

  *getAll(predicate, transform) {
    let name;
    let pred = EagleNode.makePredicate(predicate);
    let ctor = this[Symbol.species];
    transform = transform || ((...args) => args);
    let cond = pred;
    for(let [v, p, o] of deep.iterate(this.raw, cond, [...this.path])) {
      yield transform(v, p, o);
    }
  }

  get(pred, transform) {
    //console.log('get', this, pred);

    pred = EagleNode.makePredicate(pred);
    let it = this.getAll((v, p, o) => (pred(v, p, o) ? -1 : false), transform);
    let a = [...it];
    const { root, path, raw } = this;

    //console.log("EagleNode.get",{className: Util.className(this), root,path,raw,pred: pred+'',it,a});

    return a[0] || null;
  }

  find(name, transform) {
    console.log('find', this, name + '');

    let pred = EagleNode.makePredicate(name);

    const a = [...this.getAll((v, p, o) => (pred(v, p, o) ? -1 : false), transform)];
    return a[0];
  }

  getMap(entity) {
    let a = this.cache[entity + 's'];
    if(a && a.children) return new Map([...a.children].map(e => [e.name, e]));
    return null;
  }

  getByName(element, name, attr = 'name', t = ([v, l, d]) => makeEagleNode(d, this.ref.concat([...l]), this.childConstructor)) {
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
    let doc = this.getDocument();
    //console.log('parentNode', path + '', doc);
    return this[Symbol.species].get(doc, ref.up(2));
  }

  get firstChild() {
    const ref = this.ref.firstChild;
    return ref ? new this[Symbol.species](this, ref) : null;
  }

  get lastChild() {
    const ref = this.ref.lastChild;
    return ref ? new this[Symbol.species](this, ref) : null;
  }

  [Symbol.toStringTag]() {
    return this[Symbol.for('nodejs.util.inspect.custom')]();
  }
  toString() {
    return this[Symbol.toStringTag]();
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let attrs = [''];
    //console.log('Inspect:', this.path, this.raw);

    let r = this; //'tagName' in this ? this : this.raw; // this.ref ? this.ref.dereference()  : this;
    let a = r.attrMap ? r.attrMap : r.attributes;
    if(a) {
      attrs = Object.getOwnPropertyNames(a)
        .filter(name => typeof a[name] != 'function')
        .reduce((attrs, attr) => concat(attrs, ' ', text(attr, 1, 33), text(':', 1, 36), text("'" + a[attr] + "'", 1, 32)), attrs);

      //console.log('Inspect:', a, a.keys ? a.keys() : Object.getOwnPropertyNames(a));
    }

    let children = r.children;
    let numChildren = children.length;
    let ret = ['']; //`${Util.className(this)} `;
    let tag = r.tagName || r.raw.tagName;
    //console.realLog("attrs:",attrs);
    if(tag) ret = concat(ret, text('<', 1, 36), text(tag, 1, 31), attrs, text(numChildren == 0 ? ' />' : '>', 1, 36));
    if(this.filename) ret = concat(ret, ` filename="${this.filename}"`);
    if(numChildren > 0) ret = concat(ret, `{...${numChildren} children...}</${tag}>`);
    return (ret = concat(text(Util.className(r) + ' ', 0), ret));
  }

  inspect(...args) {
    return EagleNode.prototype[Symbol.for('nodejs.util.inspect.custom')].apply(this, args);
  }
}
