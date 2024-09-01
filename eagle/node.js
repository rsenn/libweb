import * as deep from '../deep.js';
import { BBox } from '../geom/bbox.js';
import { className, define, defineGettersSetters, functionName, getPrototypeChain, isArray, isObject, isFunction, memoize, tryCatch, types, nonenumerable } from '../misc.js';
import { Pointer } from '../pointer.js';
import { trkl } from '../trkl.js';
import { write as toXML } from '../xml.js';
import { ImmutableXPath } from '../xml/xpath.js';
import { concat, text } from './common.js';
import { EagleNodeMap } from './nodeMap.js';
import { EagleRef, EagleReference } from './ref.js';
//import { Attr, CSSStyleDeclaration, Comment, Document, Element, Entities, Factory, GetType, Interface, NamedNodeMap, Node, NodeList, Parser, Prototypes, Serializer, Text, TokenList, nodeTypes } from 'dom';

const node2raw = new WeakMap();
const raw2node = new WeakMap();

export const makeEagleNode = (owner, ref, ctor) => {
  if(!ctor) ctor = owner.constructor[Symbol.species];
  let e = ctor.get ? ctor.get(owner, ref) : new ctor(owner, ref);
  return e;
};

function* walkPath(p, t = p => p.up(1)) {
  let run = true,
    skip,
    next;

  const abort = () => (run = false);
  const set = v => (p = v);
  const ignore = () => (skip = true);

  for(let p = this, i = 0; p; p = next) {
    next = t(p, i++, abort, ignore);
    if(!skip) yield p;
    if(!run) break;
    skip = false;
  }
}

export class EagleNode {
  get [Symbol.species]() {
    return EagleNode;
  }

  constructor(owner, ref, raw) {
    //console.log('EagleNode.constructor(1)', console.config({ compact: false, depth: 4 }), { owner, ref });

    let o = owner && 'ref' in owner && 'root' in owner.ref ? owner.ref.root : owner;

    if(!(ref instanceof EagleReference)) {
      ref = new EagleRef((isObject(owner) && owner.raw) || o, /*(ref && isObject(ref) && ('path' in ref)) ?  [...ref.path] : */ ref);
    }

    if(!raw) raw = ref.dereference();

    //console.log('EagleNode.constructor(2)',console.config({ compact: false, depth: 4 }), { owner, ref });

    define(this, nonenumerable({ ref, owner }));
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

  scope(t = (o, p, v) => [v.tagName, v]) {
    const { owner, path, document } = this;
    let chain = Object.fromEntries(
      [
        ...walkPath(path, (p, i, abort, ignore) => {
          let value = p.deref(owner.raw, true);
          if(i == 0) ignore();
          if(!value || !value.attributes || !(value.tagName == 'library' || value.tagName == 'sheet' || value.attributes.name)) ignore();
          return p.up(2);
        })
      ].map(path => {
        let v = path.deref(owner.raw, true);
        return t(owner, path, v);
      })
    );

    return chain;
  }

  get project() {
    if(className(this.owner) == 'EagleProject') return this.owner;
    return this.document.owner;
  }

  get node() {
    let node = this.path.deref(this.root.raw);
    return node;
  }

  get raw() {
    const { ref, path, root } = this;
    let ret, error;

    if(ref)
      try {
        ret = ref.dereference();
      } catch(e) {
        error = e;
      }

    if(!ret)
      if(path && root)
        try {
          ret = path.deref(root.raw);
        } catch(e) {
          error = e;
        }

    /*if(!ret) ret = this.getRaw();
    else*/ node2raw.set(this, ret);
    if(isObject(ret)) raw2node.set(ret, this);

    //if(!ret) throw error;

    return ret;
  }

  cacheFields() {
    const { tagName } = this;

    switch (tagName) {
      case 'schematic':
        return [/*['settings'], ['layers'],['libraries'],*/ ['classes'], ['parts'], ['sheets']];
      case 'board':
        return [['libraries'], ['classes']];
      //return [['plain'], ['libraries'], ['classes'], ['elements'], ['signals']];
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
    let protos = getPrototypeChain(this);
    if(functionName(protos[0].constructor) == 'EagleDocument') protos.shift();
    let ctor = protos[0].constructor;

    return ctor;
  }

  initCache(ctor = this.childConstructor, listCtor = (o, p, v) => v) {
    let fields = this.cacheFields();
    let node = this;

    if(fields && fields.length) {
      define(this, nonenumerable({ cache: {}, lists: {} }));

      let lazy = {},
        lists = {},
        maps = {};
      let owner = this.document;
      let { raw, ref } = this;

      for(let xpath of fields) {
        try {
          let key = xpath[xpath.length - 1];
          let path = new Pointer([...new ImmutableXPath(xpath).toPointer(raw)].concat(['children']));
          lazy[key] = () => this.lookup(xpath, true);

          if(!path.deref(raw, true)) continue;

          lists[key] = () => listCtor(owner, this.ref.down(...path));

          maps[key] =
            ['sheets', 'connects', 'plain'].indexOf(key) != -1
              ? lists[key]
              : () => EagleNodeMap.create(lists[key](), ['board', 'schematic', 'library'].indexOf(key) != -1 ? 'tagName' : key == 'instances' ? 'part' : key == 'layers' ? ['number', 'name'] : 'name');
        } catch(e) {}
      }

      defineGettersSetters(this.lists, lists);
      defineGettersSetters(this.cache, lazy);
      defineGettersSetters(this, maps);
    }
  }

  initRelation(key, handler, fn) {
    let elem = this;

    trkl.bind(this, key, v => {
      if(v !== undefined) return handler(typeof v == 'string' ? v : v.name);
      let value = handler() || elem.attrMap[key] || elem.attributes[key];
      return fn(value, elem, elem.document);
    });

    return this;
  }

  appendChild(node, attributes = {}) {
    if(typeof node == 'string')
      node = {
        tagName: node,
        children: []
      };

    node.attributes = attributes;
    this.ref.concat(['children']).dereference().push(node);
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
    } else if(isObject(pred) && !isFunction(pred)) {
      let keys = Array.isArray(pred) ? pred : Object.keys(pred);
      let values = keys.reduce((acc, key) => [...acc, pred[key]], []);

      pred = (v, p, o) => keys.every((key, i) => (key == 'tagName' ? v[key] == values[i] : v.attributes[key] == values[i]));
    }

    return pred;
  }

  *getAll(predicate, transform = (...args) => args) {
    let pred = EagleNode.makePredicate(predicate),
      ctor = this[Symbol.species];

    for(let [v, p] of deep.iterate(this.raw, pred)) yield transform(v, [...this.path, ...p], this.document ?? this.root);
  }

  get(pred, transform = (...args) => args) {
    const found = deep.find(this.raw, EagleNode.makePredicate(pred));

    if(found) {
      const [v, p] = found;
      return transform(v, [...this.path, ...p], this.document ?? this.root);
    }

    return found;
  }

  find(name, transform = a => a) {
    const result = deep.find(this.raw, EagleNode.makePredicate(name), [...this.path]);

    if(result) {
      const { path, value } = result;
      return value ? transform(value, path) : value;
    }
  }

  getMap(entity) {
    let a = this.cache[entity + 's'];

    if(a && a.children) return new Map([...a.children].map(e => [e.name, e]));

    return null;
  }

  getByName(element, name, attr = 'name', t = ([v, l, d]) => makeEagleNode(d, this.ref.concat([...l]), this.childConstructor)) {
    for(let [v, l, d] of this.iterator([], it => it))
      if(typeof v == 'object' && 'tagName' in v && 'attributes' in v && attr in v.attributes) if (v.tagName == element && v.attributes[attr] == name) return t([v, l, d]);

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
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
  }

  get prevSibling() {
    const ref = this.ref.prevSibling;
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
  }

  get parentNode() {
    if(this.path.length == 0) return null;

    const { ref, path, root, raw } = this;
    let doc = this.getDocument();
    return this.constructor[Symbol.species].get(doc, ref.up(2));
  }

  get firstChild() {
    const ref = this.ref.down('children', 0);
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
  }

  get lastChild() {
    const ref = this.ref.down('children', this.children.length - 1);
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
  }

  toString() {
    return toXML(this.raw);
  }

  [Symbol.inspect](depth, options) {
    let attrs = [''];

    const { raw } = this;
    const { children, tagName, attributes = {} } = raw;
    const { attributeLists = {} } = this.constructor;
    const attributeList = attributeLists[tagName] || Object.keys(attributes);
    const getAttr = name => {
      for(let attrMap of [attributes, this, raw]) if(name in attrMap) return attrMap[name];
    };

    if(true) {
      attrs = attributeList
        .filter(name => getAttr(name) !== undefined)
        .reduce(
          (attrs, attr) =>
            concat(
              attrs,
              ' ',
              text(attr, 1, 33),
              text(':', 1, 36),
              /^(altdistance|class|color|curve|diameter|distance|drill|fill|layer|multiple|number|radius|ratio|size|width|x[1-3]?|y[1-3]?)$/.test(attr)
                ? text(getAttr(attr), 1, 36)
                : text("'" + getAttr(attr) + "'", 1, 32)
            ),
          attrs
        );
    }

    let numChildren = children ? children.length : 0;
    let ret = [''];
    let tag = this.tagName || raw.tagName;

    if(tag) ret = concat(ret, text('<', 1, 36), text(tag, 1, 31), attrs, text(numChildren == 0 ? ' />' : '>', 1, 36));

    if(this.filename) ret = concat(ret, ` filename="${this.filename}"`);

    if(numChildren > 0) {
      /*if(depth < 1) {
        ret += ('\n' + toXML(children, options.depth - depth)).replace(/\n/g, '\n  ');
        ret += '\n';
      } else*/ {
        ret = concat(ret, `{...${numChildren} children...}`);
      }
      ret += `</${tag}>`;
    }

    const name = this[Symbol.toStringTag];

    return (ret = concat(text(name + ' ', 0), ret));
  }

  lookup(xpath, t = (o, p, v) => [o, p]) {
    if(typeof xpath == 'string') xpath = new ImmutableXPath(xpath);

    const path = xpath.toPointer(this.raw);
    const value = xpath.deref(this.raw, true);
    const ret = t(this, path, value);

    return ret;
  }

  getBounds(pred = e => true) {
    let bb = new BBox();

    if(this.children && this.children.length)
      for(let element of this.getAll(e => e.tagName !== undefined && pred(e))) {
        let g = element?.geometry;

        if(g) {
          let bound = isFunction(g.bbox) ? g.bbox() : g;
          bb.update(bound, 0, element);
        }
      }

    let g = this.geometry;

    if(g) bb.update(g);

    return bb;
  }

  get geometry() {
    const { attributes } = this.raw;
    const keys = Object.keys(attributes);
    const makeGetterSetter = k => v => v === undefined ? this[k] : (this[k] = v);

    if(['x1', 'y1', 'x2', 'y2'].every(prop => keys.includes(prop))) return Line.bind(this, null, makeGetterSetter);

    if(['x', 'y'].every(prop => keys.includes(prop))) {
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
    return tryCatch(
      () => ImmutableXPath.from(this.path, this.document),
      xpath => xpath,
      tryCatch(
        () => ImmutableXPath.from(this.path, this.document.raw),
        xpath => xpath,
        () => Object.setPrototypeOf([...this.path], ImmutableXPath.prototype)
      )
    );
  }

  entries(t = ([v, l, d]) => [l[l.length - 1], EagleElement.get(d, l)]) {
    return this.iterator([], t);
  }

  *iterator(...args) {
    const predicate = isFunction(args[0]) ? args.shift() : arg => true;
    let path = (Array.isArray(args[0]) && args.shift()) || [];
    let t = isFunction(args[0]) ? args.shift() : ([v, l, d]) => [typeof v == 'object' && v !== null && 'tagName' in v ? new this.constructor[Symbol.species](d, l) : v, l, d];
    let owner = isObject(this) && 'owner' in this ? this.owner : this;
    let root = this.root || (owner.xml && owner.xml[0]);
    let node = root;

    if(path.length > 0) node = deep.get(node, path);

    for(let [v, l] of deep.iterate(node, (v, p) => (predicate(v, p) ? -1 : p.length > 1 ? p[p.length - 2] == 'children' : true))) {
      if(!(l instanceof ImmutablePath)) l = new ImmutablePath(l);
      if(typeof v == 'object' && v !== null && 'tagName' in v) if (predicate(v, l, owner)) yield t([v, l, owner]);
    }
  }

  toXML(indent = '') {
    return toXML(this.raw);
  }
}

define(
  EagleNode.prototype,
  nonenumerable({
    [Symbol.toStringTag]: 'EagleNode',
    ref: null
  })
);

define(
  EagleNode,
  nonenumerable({
    raw: node => node2raw.get(node),
    get: raw => raw2node.get(raw)
  })
);
