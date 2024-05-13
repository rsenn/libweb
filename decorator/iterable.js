export const IterableDecorator = {
  map(cb, thisArg) {
    let r = [],
      i = 0;
    for(let item of this) r.push(cb.call(thisArg, item, i++, this));
    return r;
  },
  forEach(cb, thisArg) {
    let i = 0;
    for(let item of this) cb.call(thisArg, item, i++, this);
  },
  filter(cb, thisArg) {
    let r = [],
      i = 0;
    for(let item of this) if(cb.call(thisArg, item, i++, this)) r.push(item);
    return r;
  },
  reduce(cb, initialValue, thisArg) {
    let r = initialValue,
      i = 0;
    for(let item of this) r = cb.call(thisArg, r, item, i++, this);
    return r;
  },
  reduceRight(cb, initialValue, thisArg) {
    let r = initialValue;
    for(let i = this.length - 1; i >= 0; i--) r = cb.call(thisArg, r, this[i], i, this);
    return r;
  },
  indexOf(arg, fromIndex) {
    let i = -1;
    fromIndex ??= 0;
    for(let item of this) {
      if(++i < fromIndex) continue;
      if(item == arg) return i;
    }
    return -1;
  },
  lastIndexOf(arg, fromIndex) {
    fromIndex ??= this.length - 1;
    for(let i = this.length - 1; i >= 0; i--) {
      if(i > fromIndex) continue;
      if(this[i] == arg) return i;
    }
    return -1;
  },
  at(i) {
    const { length } = this;
    if(i < 0) {
      if(i < -this.length) return undefined;
      i = ((i + 1) % length) + length - 1;
    }
    return this[i];
  },
  findIndex(cb, thisArg) {
    let i = -1;
    for(let item of this) if(cb.call(thisArg, item, ++i, this)) return i;
    return -1;
  },
  findLastIndex(cb, thisArg) {
    for(let i = this.length - 1; i >= 0; i--) if(cb.call(thisArg, this[i], i, this)) return i;
    return -1;
  }
};
