import Util from '../util.js';

//Module constants
const CMP = Symbol('insort.CMP');
const ORDER = Symbol('insort.ORDER');
const CMP_DEFAULT = (a, b) => String(a).localeCompare(b);

//Binary search
let floor = Math.floor;
function bisect(arr, cmp, val) {
  let lo = 0;
  let hi = arr.length;
  while(lo < hi) {
    let mid = floor((lo + hi) / 2);
    if(cmp(val, arr[mid]) > 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * Map subclass that efficiently maintains a sorted iteration order.
 */
export class SortedMap extends Map {
  /*[CMP] = null;
  [ORDER] = null;*/

  /**
   * Create a new SortedMap.
   *
   * @param {Iterable} [entries] - Key-value pairs to initialize map.  They
   * do not have to be pre-sorted.
   * @param {Function} [cmp] - Function to compare two keys, just as in
   * Array#sort().  Default uses String#localeCompare().
   */
  constructor(entries = [], cmp = CMP_DEFAULT) {
    super();

    let order = [];
    for(let [key, val] of entries) {
      let oldSize = this.size;
      super.set(key, val);
      if(oldSize !== this.size) {
        order.push(key);
      }
    }

    Util.define(this, { [ORDER]: order.sort(cmp), [CMP]: cmp });
  }

  clear() {
    super.clear();
    this[ORDER].length = 0;
  }

  delete(key) {
    let had = super.delete(key);
    if(had) {
      let order = this[ORDER];
      order.splice(bisect(order, this[CMP], key), 1);
    }
    return had;
  }

  *entries() {
    for(let key of this[ORDER]) {
      yield [key, this.get(key)];
    }
  }

  forEach(f, that) {
    for(let key of this[ORDER]) {
      f.call(that, this.get(key), key, this);
    }
  }

  keys() {
    return this[ORDER][Symbol.iterator]();
  }

  findKey(pred) {
    for(let key of this[ORDER]) {
      if(pred(this.get(key), key, this)) return key;
    }
  }

  keyOf(value) {
    return this.findKey(v => value === v);
  }

  find(pred) {
    for(let key of this[ORDER]) {
      const value = this.get(key);
      if(pred(value, key, this)) return value;
    }
  }

  set(key, val) {
    let oldSize = this.size;
    super.set(key, val);
    if(oldSize !== this.size) {
      let order = this[ORDER];
      order.splice(bisect(order, this[CMP], key), 0, key);
    }
    return this;
  }

  *values() {
    for(let key of this[ORDER]) {
      yield this.get(key);
    }
  }
}

SortedMap.prototype[Symbol.iterator] = SortedMap.prototype.entries;

export default SortedMap;
