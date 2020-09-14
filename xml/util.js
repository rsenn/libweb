import { IteratorAdapter } from '../json/util.js';
import Util from '../util.js';
import deep from '../deep.js';

export const Object2Array = (xmlObj, flat) => {
  let entries = [...deep.flatten(xmlObj, new Map()).entries()].map(([k, v]) => [Util.replaceAll({ attributes: 1, tagName: 0, children: 2 }, k), v]);

  if(!flat) entries = entries.reduce((acc, [k, v]) => (console.log('deep.set(', acc, k, Util.abbreviate(v, 10), ')'), deep.set(acc, k, v), acc), []);
  return entries;
};

export class XMLIterator extends IteratorAdapter {
  constructor(...args) {
    let gen = XMLIterator.iterate(...args);
    super(gen);
  }

  static *iterate(node, f = null, path = [], root) {
    if(!root) root = node;
    if(!f || f(node, path)) yield [node, path];
    if(node.children && node.children.length > 0) {
      let a = node.children;
      let p = (path || []).concat(['children']);
      for(let i = 0; i < a.length; i++) yield* this.iterate(a[i], f, p.concat([i]), root);
    }
  }
}

class XMLAttribute {
  name = '';
  value = null;

  static getAttributesFor = Util.weakMapper(obj => {
    let { length: l, 0: tagName, children, ...attributes } = obj;
    let keys = Object.keys(attributes);
    /* prettier-ignore */ let a = keys.reduce((acc, name, i) => ({ ...acc, get [i]() {return this[name]; } }), {} );
    let length = keys.length;
    let i = 0;
    Util.define(a, { length });

    for(let name of keys) if(a[name] === undefined) a[name] = new XMLAttribute(name, obj);

    return a;
  });

  static getByName(name, element) {
    return this.getAttributesFor(element)[name];
  }

  static getOrCreate(name, element, value) {
    const a = this.getAttributesFor(element);
    if(a[name] === undefined) {
      a[name] = new this(name, element, value);

      /* prettier-ignore */

      Util.defineGetter(a, a.length, () =>  a[name], true);
      a.length++;
    }
    return a[name];
  }

  constructor(name, element, value) {
    if(value === undefined) value = element[name];
    Object.assign(this, { name, value });
  }
}

class XMLObject {
  children = [];

  constructor({ attributes, children, tagName }) {
    Array.prototype.push.call(this, tagName);
    /* prettier-ignore */ Object.assign(this, Object.keys(attributes).reduce((acc, key) => ({ ...acc, [key]: attributes[key] }), {}) );
    if(Util.isObject(children) && children.length !== undefined) this.children = [].concat(children);
  }

  static toArray(...args) {
    return Object2Array(...args);
  }

  get attributes() {
    return XMLAttribute.getAttributesFor(this);
  }

  getAttribute(name) {
    const { value } = XMLAttribute.getAttributesFor(this)[name] || {};
    return value;
  }

  setAttribute(name, value) {
    let attr = XMLAttribute.getOrCreate(name, this, value);
    attr.value = value + '';
    return this;
  }

  toObject() {
    let { length, 0: tagName, children, ...attributes } = this;
    if(Util.isArray(children)) children = [].concat(children);

    return { tagName, attributes, children };
  }
}
//prettier-ignore
Object.assign(XMLObject.prototype, Util.filterKeys(Util.getMembers(Array.prototype), k => typeof k == 'symbol' || ['slice', 'splice', 'toLocaleString', 'toString', 'back', 'front'].indexOf(k) != -1) );
//prettier-ignore
Util.define(XMLObject.prototype, { get [Symbol.species]() {return XMLObject; } });
Util.define(XMLObject.prototype, {
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return [this[0], this[1], ...(Util.isArray(this[2]) ? this[2] : [])];
  }, [Symbol.toStringTag]() {
    return this.toString();
  }
});

export const XmlObject = XMLObject;
export const XmlAttr = XMLAttribute;
export const XmlIterator = XMLIterator;
