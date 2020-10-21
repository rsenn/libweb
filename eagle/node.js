import { EagleRef, EagleReference } from './ref.js';
import Util from '../util.js';
import deep from '../deep.js';
import { lazyMembers } from '../lazyInitializer.js';
import { trkl } from '../trkl.js';
import { text, concat } from './common.js';
import { EagleNodeMap } from './nodeMap.js';
import { ImmutableXPath } from '../xml.js';
import { ImmutablePath, toXML } from '../json.js';
import tXml from '../tXml.js';

export const makeEagleNode = (owner, ref, ctor) => {
  if(!ctor) ctor = owner.constructor[Symbol.species];
  let e = ctor.get ? ctor.get(owner, ref) : new ctor(owner, ref);
  return e;
};

export class EagleNode {
  ref = null;

  get [Symbol.species]() {
    return EagleNode;
  }

  constructor(owner, ref, raw) {
    //if(!owner) owner = new EagleReference(ref.root, []).dereference();
    if(!(ref instanceof EagleReference))
      ref = new EagleRef(owner && 'ref' in owner ? owner.ref.root : owner, [...ref]);
    if(!raw) raw = ref.dereference();
    //console.log("EagleNode.constructor",{owner,ref,raw});
    //Object.assign(this, { ref, owner });
    Object.defineProperty(this, 'owner', { value: owner, enumerable: false, writable: true });
    Util.define(this, 'ref', ref);
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

  elementChain(t = (o, p, v) => [v.tagName, v]) {
    const { owner, path, document } = this;
    let chain = Object.fromEntries(Util.map(
        path.walk((p, i, abort, ignore) => {
          let value = p.apply(owner.raw, true);

          if(i == 0) ignore();
          if(!value ||
            !value.attributes ||
            !(value.tagName == 'library' || value.tagName == 'sheet' || value.attributes.name)
          )
            ignore();

          return p.up(2);
        }),
        path => {
          let v = path.apply(owner.raw, true);
          return t(owner, path, v);
        }
      )
    );

    return chain;

    /*    let node = this;
    let ret = {};
    let prev = null;
    let i = 0;
    do {
      if(node == prev) break;
      if((node.attributes && node.attributes.name) || node.tagName == 'sheet') ret[node.tagName] = node;
      prev = node;
      i++;
    } while((node = node.parentNode || node.owner));
    return ret;*/
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
    const { owner, ref, document } = this;
    let r;
    //console.log(`${Util.className(this)}.raw`,  {owner},ref);
    if(this.xml && this.xml[0]) return this.xml[0];
    r = ref.path.apply(owner.raw, true);
    if(!r) {
      r = ref.path.apply(ref.root) || ref.path.apply(owner);
      if(!r) r = document.mapper.at(ref.path);
    }
    return r;
  }

  cacheFields() {
    switch (this.tagName) {
      case 'schematic':
        return [/*['settings'], ['layers'],*/ ['libraries'], ['classes'], ['parts'], ['sheets'] /*, ['modules']*/];
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
    //console.log('childConstructor:', this, ctor);
    return ctor;
  }

  initCache(ctor = this.childConstructor, listCtor = (o, p, v) => v) {
    let fields = this.cacheFields();
    let node = this;
    if(fields && fields.length) {
      Util.define(this, { cache: {}, lists: {} });
      let lazy = {};
      let lists = {};
      let maps = {};
      let ref = this.ref;
      let owner = this.document;
      let raw = this.raw;
      for(let xpath of fields) {
        let key = xpath[xpath.length - 1];
        let path = new ImmutableXPath(xpath).concat(['children']);
        lazy[key] = () => this.lookup(xpath, true);
        if(!path.apply(raw, true)) {
          //   console.warn('path not found', path + '');
          continue;
        }
        path = this.ref.path.down(...path);
        lists[key] = () => listCtor(owner, path);
        maps[key] =
          ['sheets', 'connects', 'plain'].indexOf(key) != -1
            ? lists[key]
            : () =>
                EagleNodeMap.create(lists[key](),
                  ['board', 'schematic', 'library'].indexOf(key) != -1
                    ? 'tagName'
                    : key == 'instances'
                    ? 'part'
                    : key == 'layers'
                    ? ['number', 'name']
                    : 'name'
                );
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
    } else if(Util.isObject(pred) && typeof pred != 'function') {
      let keys = Util.isArray(pred) ? pred : Object.keys(pred);
      let values = keys.reduce((acc, key) => [...acc, pred[key]], []);

      pred = (v, p, o) =>
        keys.every((key, i) => (key == 'tagName' ? v[key] == values[i] : v.attributes[key] == values[i]));
    }
    return pred;
  }

  *getAll(predicate, transform) {
    //  throw new Error();
    let name;
    let pred = EagleNode.makePredicate(predicate);
    let ctor = this[Symbol.species];
    transform = transform || ((...args) => args);
    let cond = pred;
    for(let [v, p, o] of deep.iterate(this.raw, cond, [...this.path])) {
      yield transform(v, p, this.document || this);
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

  find(name, transform = a => a) {
    //console.log('find', this, name, Util.getCallers(0));
    //throw new Error("find");
    let pred = EagleNode.makePredicate(name);
    let result = deep.find(this.raw, pred, [...this.path]); //this.getAll((v, p, o) => (pred(v, p, o) ? -1 : false), transform))

    if(result) {
      const { path, value } = result;
      //console.log("found:",{path,value});
      return value ? transform(value, path) : value;
    }
  }

  getMap(entity) {
    let a = this.cache[entity + 's'];
    if(a && a.children) return new Map([...a.children].map(e => [e.name, e]));
    return null;
  }

  getByName(element,
    name,
    attr = 'name',
    t = ([v, l, d]) => makeEagleNode(d, this.ref.concat([...l]), this.childConstructor)
  ) {
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
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
  }

  get prevSibling() {
    const ref = this.ref.prevSibling;
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
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
    const ref = this.ref.down('children', 0);
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
  }

  get lastChild() {
    const ref = this.ref.down('children', -1);
    return ref ? new this.constructor[Symbol.species](this, ref) : null;
  }

  [Symbol.toStringTag]() {
    return EagleNode.inspect(this);
  }
  toString() {
    return tXml.toString([this.raw]);
  }

  inspect() {
    let attrs = [''];
    //console.log('Inspect:', this.path);

    let r = this; //'tagName' in this ? this : this.raw; // this.ref ? this.ref.dereference()  : this;
    let a = r.attrMap ? r.attrMap : r.attributes;
    if(a) {
      attrs = Object.getOwnPropertyNames(a)
        .filter(name => typeof a[name] != 'function')
        .reduce((attrs, attr) => concat(attrs, ' ', text(attr, 1, 33), text(':', 1, 36), text("'" + a[attr] + "'", 1, 32)),
          attrs
        );

      //console.log('Inspect:', a, a.keys ? a.keys() : Object.getOwnPropertyNames(a));
    }

    let children = r.children;
    let numChildren = children ? children.length : 0;
    let ret = ['']; //`${Util.className(this)} `;
    let tag = r.tagName || r.raw.tagName;
    //console.realLog("attrs:",attrs);
    if(tag) ret = concat(ret, text('<', 1, 36), text(tag, 1, 31), attrs, text(numChildren == 0 ? ' />' : '>', 1, 36));
    if(this.filename) ret = concat(ret, ` filename="${this.filename}"`);
    if(numChildren > 0) ret = concat(ret, `{...${numChildren} children...}</${tag}>`);
    return (ret = concat(text(Util.className(r) + ' ', 0), ret));
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    //  return this.raw;
    // return EagleNode.inspect(this);
    return this.inspect();
  }

  lookup(xpath, t = (o, p, v) => [o, p]) {
    //console.log('EagleNode.lookup(', ...arguments, ')');
    xpath = new ImmutableXPath(xpath);
    let path = new ImmutablePath(xpath);
    //console.log('EagleNode.lookup  xpath:', xpath, ' path:', path);
    let value = path.apply(this.raw, true);
    let ret = t(this, path, value);
    //console.log('EagleNode.lookup =', toXML(ret, 1));
    return ret;
  }

  getBounds(pred = e => true) {
    let bb = new BBox();
    if(this.children && this.children.length) {
      for(let element of this.getAll(e => e.tagName !== undefined && pred(e))) {
        let g = element.geometry;
        if(g) {
          let bound = typeof g.bbox == 'function' ? g.bbox() : g;
          bb.update(bound, 0, element);
        }
      }
    }
    let g = this.geometry;
    if(g) bb.update(g);
    return bb;
  }

  get geometry() {
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
    return Util.tryCatch(() => ImmutableXPath.from(this.path, this.document),
      xpath => xpath,
      () => Object.setPrototypeOf([...this.path], ImmutableXPath.prototype)
    );
  }

  entries(t = ([v, l, d]) => [l[l.length - 1], EagleElement.get(d, l)]) {
    return this.iterator([], t);
  }

  *iterator(...args) {
    let predicate = typeof args[0] == 'function' ? args.shift() : arg => true;
    let path = (Util.isArray(args[0]) && args.shift()) || [];
    let t =
      typeof args[0] == 'function'
        ? args.shift()
        : ([v, l, d]) => [
            typeof v == 'object' && v !== null && 'tagName' in v ? new this.constructor[Symbol.species](d, l) : v,
            l,
            d
          ];
    let owner = Util.isObject(this) && 'owner' in this ? this.owner : this;
    let root = this.root || (owner.xml && owner.xml[0]);
    let node = root;
    if(path.length > 0) node = deep.get(node, path);
    for(let [v, l] of deep.iterate(node, (v, p) =>
      predicate(v, p) ? -1 : p.length > 1 ? p[p.length - 2] == 'children' : true
    )) {
      if(!(l instanceof ImmutablePath)) l = new ImmutablePath(l);
      if(typeof v == 'object' && v !== null && 'tagName' in v) if (predicate(v, l, owner)) yield t([v, l, owner]);
    }
  }

  toXML(depth = Infinity) {
    return toXML(this.raw, depth);

    const { tagName, raw } = this;
    let attrNames = Object.keys(raw.attributes);
    let s = `<${tagName}`;
    for(let name of attrNames) {
      let value = this[name];
      if(Util.isObject(value)) {
        if(value.name) value = value.name;
        else value = raw.attributes[name];
      }

      s += ` ${name}="${value}"`;
    }
    if(!raw.children.length) {
      s += ' />';
    } else {
      s += '\n';
      [...this.children].map(child => '  '.repeat(depth + 1) + child.toXML(depth + 1)).join('\n');
      s += `\n</${tagName}>`;
    }
    return s;

    return toXML(this);
    return tXml.toString([this.raw], depth);
  }

  static inspect = (e, d, c = { depth: 0, breakLength: 400, path: true }) => {
    const { depth, breakLength } = c;
    let o = e;
    let r = (e && e.raw) || e;
    if(typeof r == 'string') return text(r, 1, 36);
    let x = '';
    try {
      x = Util.inspect(r, {
        depth: depth * 2,
        breakLength,
        colors: !Util.isBrowser()
      });
    } catch(err) {}
    let s = '⏐';
    x = x.substring(x.indexOf('tagName') + 14);
    x = Object.entries((r && r.attributes) || {}).map(([key, value]) => text(key, 33) + text(s, 0, 37) + text(value, 1, 36)
    );
    x.unshift(r.tagName);
    let [p, ...arr] = x;
    p = text(`〔`, 1, 37) + text(p, 38, 5, 199);
    let l = e.path + '';
    let type = Util.className(e);
    if(arr.length) arr.unshift('');
    let ret = [text(type, 38, 5, 219), p, text('⧃❋⭗', 38, 5, 112), ...arr, text(`〕`, 1, 37)];

    return (l.trim() ? l + '  ' : '') + ret.join(' ') + text('', 0);
  };
}
