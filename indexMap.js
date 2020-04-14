
  /**
   * Map subclass that efficiently maintains a sorted iteration order.
   */
  export class SortedMap extends Map {

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
      for (let [key, val] of entries) {
        let oldSize = this.size;
        super.set(key, val);
        if (oldSize !== this.size) {
          order.push(key);
        }
      }

      this[ORDER] = order.sort(cmp);
      this[CMP] = cmp;
    }

    clear() {
      super.clear();
      this[ORDER].length = 0;
    }

    delete(key) {
      let had = super.delete(key);
      if (had) {
        let order = this[ORDER];
        order.splice(bisect(order, this[CMP], key), 1);
      }
      return had;
    }

    * entries() {
      for (let key of this[ORDER]) {
        yield [key, this.get(key)];
      }
    }

    forEach(f, that) {
      for (let key of this[ORDER]) {
        f.call(that, this.get(key), key, this);
      }
    }

    keys() {
      return this[ORDER][Symbol.iterator]();
    }

    set(key, val) {
      let oldSize = this.size;
      super.set(key, val);
      if (oldSize !== this.size) {
        let order = this[ORDER];
        order.splice(bisect(order, this[CMP], key), 0, key);
      }
      return this;
    }

    * values() {
      for (let key of this[ORDER]) {
        yield this.get(key);
      }
    }
  }

  SortedMap.prototype[Symbol.iterator] = SortedMap.prototype.entries;

export default SortedMap;