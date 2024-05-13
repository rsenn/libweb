export const IndexableDecorator = {
  reduceRight(cb, initialValue, thisArg) {
    let r = initialValue;
    for(let i = this.length - 1; i >= 0; i--) r = cb.call(thisArg, r, this[i], i, this);
    return r;
  },
  lastIndexOf(arg, fromIndex) {
    fromIndex ??= this.length - 1;
    for(let i = this.length - 1; i >= 0; i--) if(!(i > fromIndex)) if (this[i] == arg) return i;
    return -1;
  },
  at(i) {
    const { length } = this;
    if(i < -length) return undefined;
    if(i < 0) i = ((i + 1) % length) + length - 1;
    return this[i];
  },
  findLastIndex(cb, thisArg) {
    for(let i = this.length - 1; i >= 0; i--) if(cb.call(thisArg, this[i], i, this)) return i;
    return -1;
  }
};

export default IndexableDecorator;
