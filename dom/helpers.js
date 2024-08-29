import { arrayFacade } from '../misc.js';

export class ArrayFacade {
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

arrayFacade(ArrayFacade.prototype);

export class ObjectFacade {
  constructor(element) {}
}
