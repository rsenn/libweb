import Util from '../util.js';

export const toXML = function(o, z = 10000, q = '"') {
  if(typeof o == 'object' && o !== null && 'raw' in o) o = o.raw;
  if(o instanceof Array) return o.map(toXML).join('\n');
  else if(typeof o == 'string') return o;
  else if(typeof o != 'object' || o.tagName === undefined) return '';
  let { tagName, attributes, children, ...obj } = o;
  let s = `<${tagName}`;
  let attrs = attributes || obj;
  for(let k in attrs) s += ` ${k}=${q}${attrs[k]}${q}`;
  const a = children && children.length !== undefined ? children : [];
  if(a && a.length > 0) {
    s += tagName[0] != '?' ? '>' : '?>';
    const textChildren = typeof a[0] == 'string';
    let nl = textChildren ? '' : tagName == 'text' && a.length == 1 ? '' : tagName[0] != '?' ? '\n  ' : '\n';
    if(textChildren) s += a.join('\n') + `</${tagName}>`;
    else if(z > 0) {
      for(let child of a) s += nl + toXML(child, z > 0 ? z - 1 : z).replace(/>\n/g, '>' + nl);
      if(tagName[0] != '?') s += `${nl.replace(/ /g, '')}</${tagName}>`;
    }
  } else if(Object.keys(attrs).length == 0) s += `></${tagName}>`;
  else s += ' />';
  return s.trim();
};

export class Iterator {
  [Symbol.iterator]() {
    if(typeof this.next == 'function') return this;
    if(this.gen !== undefined) return this.gen;
  }
}

export class IteratorAdapter extends Iterator {
  constructor(gen) {
    super();
    if(gen) Util.define(this, { gen });
  }
}

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
// prettier-ignore
Object.assign(XMLObject.prototype, Util.filterKeys(Util.getMembers(Array.prototype), k => typeof k == 'symbol' || ['slice', 'splice', 'toLocaleString', 'toString', 'back', 'front'].indexOf(k) != -1) );
// prettier-ignore
Util.define(XMLObject.prototype, { get [Symbol.species]() {return XMLObject; } });
Util.define(XMLObject.prototype, {
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return [this[0], this[1], ...(Util.isArray(this[2]) ? this[2] : [])];
  },
  [Symbol.toStringTag]() {
    return this.toString();
  }
});
export const XmlObject = XMLObject;
export const XmlAttr = XMLAttribute;
export const XmlIterator = XMLIterator;
