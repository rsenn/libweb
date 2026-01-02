import { arrayFacade } from '../misc.js';
import { isObject } from '../misc.js';
import { isString } from '../misc.js';

const inspectSymbol = Symbol.for('quickjs.inspect.custom');

export function parseXML(str, mime = 'text/xml') {
  const p = new DOMParser();

  return p.parseFromString(str, 'text/xml');
}

export function* walkNodes(node, prop = 'parentNode', t = a => a) {
  do {
    yield t(node);

    node = node[prop];
  } while(node);
}

export function getAttributes(node) {
  const obj = {},
    names = node.getAttributeNames();

  if(!isObject(names) || names.length == 0) return null;

  for(let name of names) obj[name] = node.getAttribute(name);

  return obj;
}

export class ArrayInterface {
  #parent = null;
  #to_node = null;
  #from_node = null;
  #element = '';

  constructor(parent, to_node = a => a, from_node = a => a, element = '') {
    this.#parent = parent;
    this.#to_node = to_node;
    this.#from_node = from_node;
    this.#element = element;
  }

  splice(start, count, ...insert) {
    const { length } = this.#parent.children;

    let result = [],
      next,
      m = this.#parent['first' + this.#element + 'Child'];

    for(let i = 0; i < length; i++) {
      if(i == start + count) break;

      next = m['next' + this.#element + 'Sibling'];

      if(i >= start) {
        this.#parent.removeChild(m);
        result.push(this.#from_node(m));
      }

      m = next;
    }

    for(let n of insert) {
      if(next) this.#parent.insertBefore(this.#to_node(n), next);
      else this.#parent.appendChild(this.#to_node(n));

      next = n;
    }

    return result;
  }

  slice(start, end) {
    const { length } = this.#parent.children;

    let result = [],
      m = this.#parent['first' + this.#element + 'Child'];

    for(let i = 0; i < length; i++) {
      if(i >= end) break;
      if(i >= start) result.push(this.#from_node(m));

      m = m['next' + this.#element + 'Sibling'];
    }

    return result;
  }

  push(...args) {
    for(let n of args) this.#parent.appendChild(this.#to_node(n));
  }

  unshift(...args) {
    const before = this.#parent['first' + this.#element + 'Child'];

    for(let n of args) this.#parent.insertBefore(this.#to_node(n), before);
  }

  pop() {
    const n = this.#parent['last' + this.#element + 'Child'];
    this.#parent.removeChild(n);
    return this.#from_node(n);
  }

  shift() {
    const n = this.#parent['first' + this.#element + 'Child'];
    this.#parent.removeChild(n);
    return this.#from_node(n);
  }

  get length() {
    return this.#parent.children.length;
  }

  at(i) {
    const n = this.#parent.children[i];
    return n ? this.#from_node(n) : null;
  }

  indexOf(obj, fromIndex = 0) {
    const n = this.#to_node(obj);
    const { length } = this.#parent.children;

    let m = this.#parent['first' + this.#element + 'Child'];

    for(let i = fromIndex; i < length; i++) {
      if(m == n) return i;
      if(typeof m.isSameNode == 'function' && m.isSameNode(n)) return i;

      m = m['next' + this.#element + 'Sibling'];
    }

    return -1;
  }

  lastIndexOf(obj, fromIndex) {
    const n = this.#to_node(obj);
    const { length } = this.#parent.children;

    fromIndex ??= length - 1;

    let m = this.#parent['last' + this.#element + 'Child'];

    for(let i = fromIndex; i >= 0; i--) {
      if(m == n) return i;
      if(typeof m.isSameNode == 'function' && m.isSameNode(n)) return i;

      m = m['previous' + this.#element + 'Sibling'];
    }

    return -1;
  }

  findIndex(pred) {
    const { length } = this.#parent.children;

    let m = this.#parent['first' + this.#element + 'Child'];

    for(let i = 0; i < length; i++) {
      if(pred(this.#from_node(m), i, this)) return i;

      m = m['next' + this.#element + 'Sibling'];
    }

    return -1;
  }

  findLastIndex(pred) {
    const { length } = this.#parent.children;

    let m = this.#parent['last' + this.#element + 'Child'];

    for(let i = length - 1; i >= 0; i--) {
      if(pred(this.#from_node(m), i, this)) return i;

      m = m['previous' + this.#element + 'Sibling'];
    }

    return -1;
  }

  find(...args) {
    return itemFn(this, this.findIndex(...args));
  }

  findLast(...args) {
    return itemFn(this, this.findLastIndex(...args));
  }

  includes(obj, fromIndex = 0) {
    return this.indexOf(obj, fromIndex) != -1;
  }
}

arrayFacade(ArrayInterface.prototype);

export class ObjectInterface {
  constructor(element, desc = {}) {
    this[Symbol.for('element')] = element;
    this[Symbol.for('descriptor')] = desc;

    let obj = new Proxy(this, {
      get: (target, prop, receiver) => (prop in this ? Reflect.get(target, prop, receiver) : isString(prop) && (prop in desc ? desc[prop].get.call(this, element) : element.getAttribute(prop))),
      set: (target, prop, value) =>
        prop in this ? Reflect.set(target, prop, value) : isString(prop) && (prop in desc ? desc[prop].set.call(this, element, value) : element.setAttribute(prop, value)),
      has: (target, prop) => (prop in this ? Reflect.has(target, prop) : isString(prop) && (prop in desc ? true : element.hasAttribute(prop))),
      getPrototypeOf: target => ObjectInterface.prototype,
      ownKeys: target => [...element.getAttributeNames(), ...Object.keys(desc).filter(k => desc[k].enumerable == true)],
    });

    return obj;
  }

  [inspectSymbol](depth, opts) {
    const el = this[Symbol.for('element')];

    const name = this[Symbol.toStringTag] ?? 'ObjectInterface';

    return `\x1b[1;31m${name}\x1b[1;36m {\x1b[0m ${el.getAttributeNames().reduce((acc, k, i) => (acc ? acc + ' ' : acc) + `${k}="${el.getAttribute(k)}"`, '')} \x1b[1;36m}\x1b[0m`;
  }

  static element(obj) {
    return obj[Symbol.for('element')];
  }
}

ObjectInterface.prototype[Symbol.toStringTag] = 'ObjectInterface';