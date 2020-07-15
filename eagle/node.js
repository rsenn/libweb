import { EagleRef, EagleReference } from './ref.js';
import Util from '../util.js';
import deep from '../deep.js';
import { lazyMembers } from '../lazyInitializer.js';
import { trkl } from '../trkl.js';
import { text,  concat, parseArgs } from './common.js';

import { EagleNodeMap } from './nodeMap.js';
import { ImmutableXPath } from '../xml.js';
import { ImmutablePath } from '../json.js';

export const makeEagleNode = (owner, ref, ctor) => {
  if(!ctor) ctor = owner.constructor[Symbol.species];
  let e = ctor.get ? ctor.get(owner, ref) : new ctor(owner, ref);
  return e;
};

export class EagleNode  {
  ref = null;

  get [Symbol.species]() {
    return EagleNode;
  }

  constructor(owner, ref, raw) {
   // if(!owner) owner = new EagleReference(ref.root, []).dereference();

      if(!(ref instanceof EagleReference)) ref = new EagleRef(owner && 'ref' in owner ? owner.ref.root : owner, [...ref]);
    if(!raw) raw = ref.dereference();

//console.log("EagleNode.constructor",{owner,ref,raw});


      //Object.assign(this, { ref, owner });
    Object.defineProperty(this, 'owner', { value: owner, enumerable: false });
    Util.define(this, 'ref',ref);

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
    const { owner, ref } = this;
    // console.log(`${Util.className(this)}.raw`,  {owner},ref);
    if(this.xml && this.xml[0]) return this.xml[0];
    let r = ref.path.apply(owner, true);
    if(!r) {
      r = ref.path.apply(ref.root) || ref.path.apply(owner);
    }
    return r;
  }

  cacheFields() {
    switch (this.tagName) {
      case 'schematic':
        return [/*['settings'], ['layers'],*/ ['libraries'], ['classes'], ['parts'], ['sheets']/*, ['modules']*/];
      case 'board':
        return [['plain'], ['libraries'], ['classes'], ['elements'], ['signals']];
      case 'module':
        return [['ports'], ['variantdefs'], ['parts'], ['sheets']];
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
    console.log('childConstructor:', this, ctor);
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
      let raw = this.raw;

      for(let xpath of fields) {
        let key = xpath[xpath.length - 1];
        let path =new ImmutablePath(xpath.reduce((acc,p) => [...acc,'children',p], []).concat(['children']));


let value = path.apply(raw, true);

console.log('path', { path, value }, listCtor+'');
  /*      lazy[key] = () =>
          //
          this.lookup(xpath);*/
        lists[key] = () => listCtor(owner, this.path.down(...path), value);



        maps[key] = ['sheets', 'connects', 'plain'].indexOf(key) != -1 ? () => lists[key]() : () => EagleNodeMap.create(lists[key](), key == 'instances' ? 'part' : key == 'layers' ? ['number', 'name'] : 'name');
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
        console.log('find', this, name, Util.getCallers(0));

    //throw new Error("find");

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
    return this.constructor[Symbol.species].get(doc, ref.up(2));
  }

  get firstChild() {
    const ref = this.ref.firstChild;
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
  }

  get lastChild() {
    const ref = this.ref.lastChild;
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
  }

  [Symbol.toStringTag]() {
    return this[Symbol.for('nodejs.util.inspect.custom')]();
  }
  toString() {
    return this[Symbol.toStringTag]();
  }

 /* [Symbol.for('nodejs.util.inspect.custom')]() {
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
  }*/

  inspect(...args) {
    return EagleNode.prototype[Symbol.for('nodejs.util.inspect.custom')].apply(this, args);
  }

    *findAll(...args) {
    let { path, predicate, transform } = parseArgs(args);
    for(let [v, l, d] of this.iterator(
      e => true,
      [],
      arg => arg
    )) {
      if(!d) d = this;
      if(predicate(v, l, d)) {
        if(transform) v = transform([v, l, d]);
        yield v;
      }
    }
  }

  find(...args) {
    let { path, predicate, transform } = parseArgs([...arguments]);
    if(!transform) transform = ([v, l, d]) => (typeof v == 'object' && v !== null && 'tagName' in v ? new this.constructor[Symbol.species](d, l, v) : v);
    for(let [v, p, d] of this.iterator()) {
      if(typeof v == 'string') continue;
      if(predicate(v, p, d)) return transform([v, p, d]);
    }
    return transform([null, [], []]);
  }


  lookup(xpath, t = (o, p, v) => [o, p]) {
    console.log('lookup(', ...arguments, ')');

    const { tagName, owner, raw, document } = this;
    if(typeof xpath == 'string') xpath = xpath.split(/\//g);

    if(!(xpath instanceof ImmutableXPath)) xpath = new ImmutableXPath(xpath);

    console.log('lookup:', { xpath });
    let path = new ImmutablePath(xpath.toArray().reduce((acc, p) => [...acc, 'children', p], []));
    let value = this.path.concat(path).apply(raw, true);

    //  path = this.path.concat(path);
    //  value = path.apply(this.raw,true);
    console.log('lookup:', { tagName, owner,raw, path, value });

    let ret = t(this, path, value);
    //console.log('lookup =', ret);
    return ret;
  }

  getBounds(pred = e => true) {
    let bb = new BBox();

    if(this.children && this.children.length) {
      for(let element of this.getAll(e => e.tagName !== undefined && pred(e))) {
        let g = element.geometry();
        if(g) {
          let bound = typeof g.bbox == 'function' ? g.bbox() : g;
          bb.update(bound, 0, element);
        }
      }
    }
    let g = this.geometry();

    if(g) bb.update(g);

    return bb;
  }
  geometry() {
    const { attributes } = this.raw;
    const keys = Object.keys(attributes);
    const makeGetterSetter = k => v => (v === undefined ? this[k] : (this[k] = v));
    if(['x1', 'y1', 'x2', 'y2'].every(prop => keys.includes(prop))) {
      return Line.bind(this, null, makeGetterSetter);
    } else if(['x', 'y'].every(prop => keys.includes(prop))) {
      const { x, y } = Point(this);
      if(keys.includes('radius')) return Circle.bind(this, null, makeGetterSetter);
      if(['width', 'height'].every(prop => keys.includes(prop))) return Rect.bind(this, null, makeGetterSetter);
      return Point.bind(this, null, makeGetterSetter);
    }
  }
  getDocument() {
    let o = this;
    while(o.owner) {
      if(o.xml !== undefined) break;
      o = o.owner;
    }
    return o;
  }
  xpath() {
    const { ref, owner } = this;
    let x = ImmutableXPath.from(ref.path, owner.raw);
    //console.log('PATH', ref.path);
    //console.log('ARRAY', [...x]);
    //console.log('XPATH', x.toString());
    return x;
  }
  entries(t = ([v, l, d]) => [l[l.length - 1], EagleElement.get(d, l)]) {
    return this.iterator([], t);
  }
  *iterator(...args) {
    let predicate = typeof args[0] == 'function' ? args.shift() : arg => true;
    let path = (Util.isArray(args[0]) && args.shift()) || [];
    let t = typeof args[0] == 'function' ? args.shift() : ([v, l, d]) => [typeof v == 'object' && v !== null && 'tagName' in v ? new this.constructor(d, l) : v, l, d];
    let owner = Util.isObject(this) && 'owner' in this ? this.owner : this;
    let root = this.root || (owner.xml && owner.xml[0]);
    let node = root;
    if(path.length > 0) node = deep.get(node, path);
    for(let [v, l] of deep.iterate(node, (v, p) => (predicate(v, p) ? -1 : p.length > 1 ? p[p.length - 2] == 'children' : true))) {
      if(!(l instanceof ImmutablePath)) l = new ImmutablePath(l);
      if(typeof v == 'object' && v !== null && 'tagName' in v) if (predicate(v, l, owner)) yield t([v, l, owner]);
    }
  }

  toXML(depth = Number.MAX_SAFE_INTEGER) {
    return toXML(this.raw, depth);
  }
}
