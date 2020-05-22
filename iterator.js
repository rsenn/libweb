export const isIterator = arg => {
  return typeof arg == 'object' && arg !== null && typeof arg.next == 'function';
};

export const isIterable = arg => {
  return typeof arg == 'object' && arg !== null && arg[Symbol.iterator] !== undefined;
};

export function Iterator(arg) {
  if(isIterable(arg)) return arg[Symbol.iterator]();
  if(isIterator(arg))
    return (function*() {
      yield* arg;
    })();
  if(
    ((typeof arg == 'object' && arg !== null) || typeof arg == 'string') &&
    arg.length !== undefined
  )
    return (function*() {
      for(let i = 0; i < arg.length; i++) yield arg[i];
    })();
  if(typeof arg == 'number')
    return (function*() {
      for(let i = 0; i < arg; i++) yield i;
    })();
}

Iterator.map = function*(it, fn = (x, i, it) => x) {
  let i = 0;
  for(let item of it) yield fn(item, i++, it);
};

Iterator.reduce = function(it, fn = (acc, x, i, it) => x, acc) {
  let i = 0;
  for(let item of it) acc = fn(acc, item, i++, it);
  return acc;
};

Iterator.filter = function*(it, fn = (x, i, it) => true) {
  let i = 0;
  for(let item of it) if(fn(item, i++, it)) yield item;
};

Iterator.some = function*(it, fn = (x, i, it) => false) {
  let i = 0;
  for(let item of it) if(fn(item, i++, it)) return true;
  return false;
};

Iterator.every = function*(it, fn = (x, i, it) => false) {
  let i = 0;
  for(let item of it) if(!fn(item, i++, it)) return false;
  return true;
};

Iterator.forEach = function*(it, fn = (x, i, it) => true) {
  let i = 0;
  for(let item of it) fn(item, i++, it);
};

export default Iterator;
