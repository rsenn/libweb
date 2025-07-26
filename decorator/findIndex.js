export const FindIndexDecorator = {
  find(cb, thisArg) {
    return this[this.findIndex(cb, thisArg)];
  },
  findLast(cb, thisArg) {
    return this[this.findLastIndex(cb, thisArg)];
  },
};

export default FindIndexDecorator;
