import { arrayFacade } from '../misc.js'


export class ArrayFacade {
  #nodelist = null;
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
      node = this.#parent['first' + this.#element + 'Child'];

    for(let i = 0; i < length; i++) {
      next = node['next' + this.#element + 'Sibling'];

      if(i == start + count) break;

      if(i >= start) {
        this.#parent.removeChild(node);
        result.push(this.#from_node(node));
      }

      node = next;
    }

    for(let n of insert) {
      this.#parent.insertBefore(this.#to_node(n), next);
      next = n;
    }

    return result;
  }

  slice(start, end) {
    const { length } = this.#parent.children;

    let result = [],
      node = this.#parent['first' + this.#element + 'Child'];

    for(let i = 0; i < length; i++) {
      if(i >= end) break;
      if(i >= start) result.push(this.#from_node(node));

      node = node['next' + this.#element + 'Sibling'];
    }

    return result;
  }

  push(...args) {
    for(let n of args) this.#parent.appendChild(this.#to_node(n));
  }

  unshift(...args) {
    const before = this.#parent['first' + this.#element + 'Child'];

    for(let n of args) this.#parent.insertBefore(before);
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
    return this.#from_node(this.#parent.children[i]);
  }

  indexOf(obj) {
    const n = this.#to_node(obj);
    const { length } = this.#parent.children;

    let node = this.#parent['first' + this.#element + 'Child'];

    for(let i = 0; i < length; i++) {
      if(this.#parent.children[i] == n) return i;
    }

    return -1;
  }

  lastIndexOf(obj) {
    const n = this.#to_node(obj);
    const { length } = this.#parent.children;

    let node = this.#parent['last' + this.#element + 'Child'];

    for(let i = length-1; i >=0; i--) {
      if(this.#parent.children[i] == n) return i;
    }

    return -1;
  }
}

arrayFacade(ArrayFacade.prototype);
