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
  indexOf(arg, fromIndex) {
    let i = -1;
    fromIndex ??= 0;
    for(let item of this) if(!(++i < fromIndex)) if (item == arg) return i;
    return -1;
  },

  findIndex(cb, thisArg) {
    let i = -1;
    for(let item of this) if(cb.call(thisArg, item, ++i, this)) return i;
    return -1;
  },
};

export default IterableDecorator;
