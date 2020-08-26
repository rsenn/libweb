const DEQUE_MIN_CAPACITY = 16;
const DEQUE_MAX_CAPACITY = 1024;

export function Deque(capacity) {
  this._capacity = getCapacity(capacity);
  this._length = 0;
  this._front = 0;
  if (isArray(capacity)) {
    let len = capacity.length;
    for (let i = 0; i < len; ++i) {
      this[i] = capacity[i];
    }
    this._length = len;
  }
}

Deque.prototype.toArray = function Deque$toArray() {
  let len = this._length;
  let ret = new Array(len);
  let front = this._front;
  let capacity = this._capacity;
  for (let j = 0; j < len; ++j) {
    ret[j] = this[(front + j) & (capacity - 1)];
  }
  return ret;
};

Deque.prototype.push = function Deque$push(item) {
  let argsLength = arguments.length;
  let length = this._length;
  if (argsLength > 1) {
    let capacity = this._capacity;
    if (length + argsLength > capacity) {
      for (var i = 0; i < argsLength; ++i) {
        this._checkCapacity(length + 1);
        var j = (this._front + length) & (this._capacity - 1);
        this[j] = arguments[i];
        length++;
        this._length = length;
      }
      return length;
    }
    var j = this._front;
    for (var i = 0; i < argsLength; ++i) {
      this[(j + length) & (capacity - 1)] = arguments[i];
      j++;
    }
    this._length = length + argsLength;
    return length + argsLength;
    
  }

  if (argsLength === 0) return length;

  this._checkCapacity(length + 1);
  var i = (this._front + length) & (this._capacity - 1);
  this[i] = item;
  this._length = length + 1;
  return length + 1;
};

Deque.prototype.pop = function Deque$pop() {
  let length = this._length;
  if (length === 0) {
    return void 0;
  }
  let i = (this._front + length - 1) & (this._capacity - 1);
  let ret = this[i];
  this[i] = void 0;
  this._length = length - 1;
  return ret;
};

Deque.prototype.shift = function Deque$shift() {
  let length = this._length;
  if (length === 0) {
    return void 0;
  }
  let front = this._front;
  let ret = this[front];
  this[front] = void 0;
  this._front = (front + 1) & (this._capacity - 1);
  this._length = length - 1;
  return ret;
};

Deque.prototype.unshift = function Deque$unshift(item) {
  let length = this._length;
  let argsLength = arguments.length;

  if (argsLength > 1) {
    var capacity = this._capacity;
    if (length + argsLength > capacity) {
      for (var i = argsLength - 1; i >= 0; i--) {
        this._checkCapacity(length + 1);
        var capacity = this._capacity;
        var j = (((this._front - 1) & (capacity - 1)) ^ capacity) - capacity;
        this[j] = arguments[i];
        length++;
        this._length = length;
        this._front = j;
      }
      return length;
    }
    let front = this._front;
    for (var i = argsLength - 1; i >= 0; i--) {
      var j = (((front - 1) & (capacity - 1)) ^ capacity) - capacity;
      this[j] = arguments[i];
      front = j;
    }
    this._front = front;
    this._length = length + argsLength;
    return length + argsLength;
    
  }

  if (argsLength === 0) return length;

  this._checkCapacity(length + 1);
  var capacity = this._capacity;
  var i = (((this._front - 1) & (capacity - 1)) ^ capacity) - capacity;
  this[i] = item;
  this._length = length + 1;
  this._front = i;
  return length + 1;
};

Deque.prototype.peekBack = function Deque$peekBack() {
  let length = this._length;
  if (length === 0) {
    return void 0;
  }
  let index = (this._front + length - 1) & (this._capacity - 1);
  return this[index];
};

Deque.prototype.peekFront = function Deque$peekFront() {
  if (this._length === 0) {
    return void 0;
  }
  return this[this._front];
};

Deque.prototype.get = function Deque$get(index) {
  let i = index;
  if (i !== (i | 0)) {
    return void 0;
  }
  let len = this._length;
  if (i < 0) {
    i = i + len;
  }
  if (i < 0 || i >= len) {
    return void 0;
  }
  return this[(this._front + i) & (this._capacity - 1)];
};

Deque.prototype.isEmpty = function Deque$isEmpty() {
  return this._length === 0;
};

Deque.prototype.clear = function Deque$clear() {
  let len = this._length;
  let front = this._front;
  let capacity = this._capacity;
  for (let j = 0; j < len; ++j) {
    this[(front + j) & (capacity - 1)] = void 0;
  }
  this._length = 0;
  this._front = 0;
};

Deque.prototype.toString = function Deque$toString() {
  return this.toArray().toString();
};

Deque.prototype.valueOf = Deque.prototype.toString;
Deque.prototype.removeFront = Deque.prototype.shift;
Deque.prototype.removeBack = Deque.prototype.pop;
Deque.prototype.insertFront = Deque.prototype.unshift;
Deque.prototype.insertBack = Deque.prototype.push;
Deque.prototype.enqueue = Deque.prototype.push;
Deque.prototype.dequeue = Deque.prototype.shift;
Deque.prototype.toJSON = Deque.prototype.toArray;

Object.defineProperty(Deque.prototype, 'length', {
  get () {
    return this._length;
  },
  set () {
    throw new RangeError('');
  }
});

Deque.prototype._checkCapacity = function Deque$_checkCapacity(size) {
  if (this._capacity < size) {
    this._resizeTo(getCapacity(this._capacity * 1.5 + 16));
  }
};

Deque.prototype._resizeTo = function Deque$_resizeTo(capacity) {
  let oldCapacity = this._capacity;
  this._capacity = capacity;
  let front = this._front;
  let length = this._length;
  if (front + length > oldCapacity) {
    let moveItemsCount = (front + length) & (oldCapacity - 1);
    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
  }
};

var isArray = Array.isArray;

function arrayMove(src, srcIndex, dst, dstIndex, len) {
  for (let j = 0; j < len; ++j) {
    dst[j + dstIndex] = src[j + srcIndex];
    src[j + srcIndex] = void 0;
  }
}

function pow2AtLeast(n) {
  n = n >>> 0;
  n = n - 1;
  n = n | (n >> 1);
  n = n | (n >> 2);
  n = n | (n >> 4);
  n = n | (n >> 8);
  n = n | (n >> 16);
  return n + 1;
}

function getCapacity(capacity) {
  if (typeof capacity !== 'number') {
    if (isArray(capacity)) {
      capacity = capacity.length;
    }
    else {
      return DEQUE_MIN_CAPACITY;
    }
  }
  return pow2AtLeast(Math.min(Math.max(DEQUE_MIN_CAPACITY, capacity), DEQUE_MAX_CAPACITY));
}

export default Deque;
