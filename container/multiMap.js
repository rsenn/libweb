/* global module, define */

function mapEach(map, operation) {
  let keys = map.keys();
  let next;
  while(!(next = keys.next()).done) {
    operation(map.get(next.value), next.value, map);
  }
}

let mapCtor;
if(typeof Map !== 'undefined') {
  mapCtor = Map;

  /*  if(!Map.prototype.keys) {
    Map.prototype.keys = function() {
      let keys = [];
      this.forEach((item, key) => {
        keys.push(key);
      });
      return keys;
    };
  }*/
}

export function Multimap(iterable) {
  let self = this;

  self._map = mapCtor;

  if(Multimap.Map) {
    self._map = Multimap.Map;
  }

  self._ = self._map ? new self._map() : {};

  if(iterable) {
    iterable.forEach(i => {
      self.set(i[0], i[1]);
    });
  }
}

/**
 * @param {Object} key
 * @return {Array} An array of values, undefined if no such a key;
 */
Multimap.prototype.get = function(key) {
  return this._map ? this._.get(key) : this._[key];
};

/**
 * @param {Object} key
 * @param {Object} val...
 */
Multimap.prototype.set = function(key, val) {
  let args = Array.prototype.slice.call(arguments);

  key = args.shift();

  let entry = this.get(key);
  if(!entry) {
    entry = [];
    if(this._map) this._.set(key, entry);
    else this._[key] = entry;
  }

  Array.prototype.push.apply(entry, args);
  return this;
};

/**
 * @param {Object} key
 * @param {Object=} val
 * @return {boolean} true if any thing changed
 */
Multimap.prototype.delete = function(key, val) {
  if(!this.has(key)) return false;

  if(arguments.length == 1) {
    this._map ? this._.delete(key) : delete this._[key];
    return true;
  }
  let entry = this.get(key);
  let idx = entry.indexOf(val);
  if(idx != -1) {
    entry.splice(idx, 1);
    return true;
  }

  return false;
};

/**
 * @param {Object} key
 * @param {Object=} val
 * @return {boolean} whether the map contains 'key' or 'key=>val' pair
 */
Multimap.prototype.has = function(key, val) {
  let hasKey = this._map ? this._.has(key) : this._.hasOwnProperty(key);

  if(arguments.length == 1 || !hasKey) return hasKey;

  let entry = this.get(key) || [];
  return entry.indexOf(val) != -1;
};

/**
 * @return {Array} all the keys in the map
 */
Multimap.prototype.keys = function() {
  if(this._map) return makeIterator(this._.keys());

  return makeIterator(Object.keys(this._));
};

/**
 * @return {Array} all the values in the map
 */
Multimap.prototype.values = function() {
  let vals = [];
  this.forEachEntry(entry => {
    Array.prototype.push.apply(vals, entry);
  });

  return makeIterator(vals);
};

/**
 *
 */
Multimap.prototype.forEachEntry = function(iter) {
  mapEach(this, iter);
};

Multimap.prototype.forEach = function(iter) {
  let self = this;
  self.forEachEntry((entry, key) => {
    entry.forEach(item => {
      iter(item, key, self);
    });
  });
};

Multimap.prototype.clear = function() {
  if(this._map) {
    this._.clear();
  } else {
    this._ = {};
  }
};

Object.defineProperty(Multimap.prototype, 'size', {
  configurable: false,
  enumerable: true,
  get() {
    let total = 0;

    mapEach(this, value => {
      total += value.length;
    });

    return total;
  }
});

Object.defineProperty(Multimap.prototype, 'count', {
  configurable: false,
  enumerable: true,
  get() {
    return this._.size;
  }
});

let safariNext;

try {
  safariNext = new Function('iterator',
    'makeIterator',
    'var keysArray = []; for(var key of iterator){keysArray.push(key);} return makeIterator(keysArray).next;'
  );
} catch(error) {
  //for of not implemented;
}

function makeIterator(iterator) {
  if(Array.isArray(iterator)) {
    let nextIndex = 0;

    return {
      next() {
        return nextIndex < iterator.length
          ? { value: iterator[nextIndex++], done: false }
          : { done: true };
      }
    };
  }

  //Only an issue in safari
  if(!iterator.next && safariNext) {
    iterator.next = safariNext(iterator, makeIterator);
  }

  return iterator;
}

/*
if(typeof exports === 'object' && module && module.exports)
  module.exports = Multimap;
else if(typeof define === 'function' && define.amd)
  define(function() { return Multimap; });
*/
export default Multimap;
