'use strict';
//Adding remove to arrays
if(Array.prototype.remove === undefined || Array.prototype.removeIndex) {
  Object.defineProperties(Array.prototype, {
    remove: {
      value: function() {
        var result = [];
        for(var j = arguments.length - 1; j >= 0; j--) {
          var index = this.length - 1;
          while(index >= 0) {
            if(this[index] !== arguments[j]) {
              index--;
            } else {
              result.push(this.splice(index, 1)[0]);
            }
          }
        }
        return result;
      },
      enumerable: false
    },
    removeIndex: {
      value: function(index) {
        return this.splice(index, 1);
      },
      enumerable: false
    }
  });
}

export function HashMultimap() {
  this._keys = [];
  this._values = [];
  this.length = 0;
}

HashMultimap.prototype.clear = function() {
  this._keys = [];
  this._values = [];
  this.length = 0;
};

HashMultimap.prototype.get = function(key) {
  var i = this._keys.indexOf(key);

  if(i >= 0) {
    return this._values[i];
  }

  this._keys.push(key);
  var res = [];
  this._values.push(res);
  this.length++;
  return res;
};

HashMultimap.prototype.has = function(key) {
  return this._keys.indexOf(key) >= 0;
};

HashMultimap.prototype.put = function(key) {
  var values = this.get(key);
  var len = arguments.length;
  var i;

  for(i = 1; i < len; i++) {
    values.push(arguments[i]);
  }
};

HashMultimap.prototype.remove = function(key) {
  var values = this.get(key);
  var items = Array.prototype.slice.call(arguments, 1);
  values.remove(arguments[i]);
};

HashMultimap.prototype.removeAll = function(key) {
  var index = this._keys.indexOf(key);

  if(index >= 0) {
    this._keys.removeIndex(index);
    this._values.removeIndex(index);
  }
};

HashMultimap.prototype.replaceValues = function(key) {
  //TODO: get the rest of the values from the arguments
};

HashMultimap.prototype.keys = function() {
  return this._keys[Symbol.iterator]();
};

HashMultimap.prototype.values = function() {
  return this._values[Symbol.iterator]();
};
HashMultimap.prototype.entries = function() {
  return [...HashMultimap.prototype[Symbol.iterator].call(this)];
};
HashMultimap.prototype[Symbol.iterator] = function* () {
  const len = Math.max(this._values.length, this._keys.length);
  const { _keys, _values } = this;

  for(let i = 0; i < len; i++) yield [_keys[i], _values[i]];
};

export default HashMultimap;
