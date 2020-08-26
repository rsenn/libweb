export class FixedBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.arr = [];
    if (capacity < 0) {
      throw new RangeError('FixedBuffer capacity cannot be less than zero');
    }
  }
  get empty() {
    return this.arr.length === 0;
  }
  get full() {
    return this.arr.length >= this.capacity;
  }
  add(value) {
    if (this.full) {
      throw new Error('Buffer full');
    }
    else {
      this.arr.push(value);
    }
  }
  remove() {
    if (this.empty) {
      throw new Error('Buffer empty');
    }
    return this.arr.shift();
  }
}
// TODO: use a circular buffer here
export class SlidingBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.arr = [];
    this.full = false;
    if (capacity <= 0) {
      throw new RangeError('SlidingBuffer capacity cannot be less than or equal to zero');
    }
  }
  get empty() {
    return this.arr.length === 0;
  }
  add(value) {
    while (this.arr.length >= this.capacity) {
      this.arr.shift();
    }
    this.arr.push(value);
  }
  remove() {
    if (this.empty) {
      throw new Error('Buffer empty');
    }
    return this.arr.shift();
  }
}
export class DroppingBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.arr = [];
    this.full = false;
    if (capacity <= 0) {
      throw new RangeError('DroppingBuffer capacity cannot be less than or equal to zero');
    }
  }
  get empty() {
    return this.arr.length === 0;
  }
  add(value) {
    if (this.arr.length < this.capacity) {
      this.arr.push(value);
    }
  }
  remove() {
    if (this.empty) {
      throw new Error('Buffer empty');
    }
    return this.arr.shift();
  }
}
