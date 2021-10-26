'use strict';
exports.__esModule = true;
exports.DroppingBuffer = exports.SlidingBuffer = exports.FixedBuffer = void 0;
var FixedBuffer = /** @class */ (function () {
  function FixedBuffer(capacity) {
    this.capacity = capacity;
    this.arr = [];
    if(capacity < 0) {
      throw new RangeError('FixedBuffer capacity cannot be less than zero');
    }
  }
  Object.defineProperty(FixedBuffer.prototype, 'empty', {
    get: function() {
      return this.arr.length === 0;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(FixedBuffer.prototype, 'full', {
    get: function() {
      return this.arr.length >= this.capacity;
    },
    enumerable: false,
    configurable: true
  });
  FixedBuffer.prototype.add = function(value) {
    if(this.full) {
      throw new Error('Buffer full');
    } else {
      this.arr.push(value);
    }
  };
  FixedBuffer.prototype.remove = function() {
    if(this.empty) {
      throw new Error('Buffer empty');
    }
    return this.arr.shift();
  };
  return FixedBuffer;
})();
exports.FixedBuffer = FixedBuffer;
// TODO: use a circular buffer here
var SlidingBuffer = /** @class */ (function () {
  function SlidingBuffer(capacity) {
    this.capacity = capacity;
    this.arr = [];
    this.full = false;
    if(capacity <= 0) {
      throw new RangeError('SlidingBuffer capacity cannot be less than or equal to zero');
    }
  }
  Object.defineProperty(SlidingBuffer.prototype, 'empty', {
    get: function() {
      return this.arr.length === 0;
    },
    enumerable: false,
    configurable: true
  });
  SlidingBuffer.prototype.add = function(value) {
    while(this.arr.length >= this.capacity) {
      this.arr.shift();
    }
    this.arr.push(value);
  };
  SlidingBuffer.prototype.remove = function() {
    if(this.empty) {
      throw new Error('Buffer empty');
    }
    return this.arr.shift();
  };
  return SlidingBuffer;
})();
exports.SlidingBuffer = SlidingBuffer;
var DroppingBuffer = /** @class */ (function () {
  function DroppingBuffer(capacity) {
    this.capacity = capacity;
    this.arr = [];
    this.full = false;
    if(capacity <= 0) {
      throw new RangeError('DroppingBuffer capacity cannot be less than or equal to zero');
    }
  }
  Object.defineProperty(DroppingBuffer.prototype, 'empty', {
    get: function() {
      return this.arr.length === 0;
    },
    enumerable: false,
    configurable: true
  });
  DroppingBuffer.prototype.add = function(value) {
    if(this.arr.length < this.capacity) {
      this.arr.push(value);
    }
  };
  DroppingBuffer.prototype.remove = function() {
    if(this.empty) {
      throw new Error('Buffer empty');
    }
    return this.arr.shift();
  };
  return DroppingBuffer;
})();
exports.DroppingBuffer = DroppingBuffer;
