export function* concat(...streams) {
  for(let s of streams) yield* s;
}

export function consume(iterable, fn = a => console.log(`consume =`, a)) {
  for(let n of iterable) fn(n);
}

export function every(iterable, fn) {
  return reduce((acc, n, i) => acc && fn(n, i, iterable), true);
}

export function* filter(iterable, predicate = n => {}) {
  let i = 0;
  for(let n of iterable) {
    if(predicate(n, i++, iterable)) yield n;
  }
}

export function find(iterable, predicate = n => {}) {
  let i = 0;
  for(let n of iterable) if(predicate(n, i++, iterable)) return n;
}

export function findIndex(iterable, predicate = n => {}) {
  let i = 0;
  for(let n of iterable) if(predicate(n, i++, iterable)) return i;
  return -1;
}

export function forEach(iterable, fn = n => {}) {
  let i = 0;
  for(let n of iterable) fn(n, i++, iterable);
}
export function* from(iterable, transform = (e, i) => e) {
  for(let n of iterable) yield transform(n);
}

export function includes(iterable, searchElement, fromIndex = -1) {
  let i = 0;
  for(let n of iterable) {
    if(i++ >= fromIndex && n === searchElement) return true;
  }
  return false;
}

export function indexOf(iterable, searchElement, fromIndex = -1) {
  let i = 0;
  for(let n of iterable) {
    if(i >= fromIndex && n === searchElement) return i;
    i++;
  }
  return -1;
}

export function lastIndexOf(iterable, searchElement, fromIndex = -1) {
  let i = 0,
    j = -1;
  for(let n of iterable) {
    if(i >= fromIndex && n === searchElement) j = i;
    i++;
  }
  return j;
}

export function* map(iterable, transform = a => a) {
  for(let n of iterable) {
    yield transform(n);
  }
}

export function reduce(iterable, fn, accu) {
  let i = 0;
  for(let n of iterable) accu = fn(accu, n, i++, iterable);
  return accu;
}

export function some(iterable, fn) {
  return reduce((acc, n, i) => acc || fn(n, i, iterable), false);
}

export function accumulate(iterable, accu) {
  return consume(iterable, a => accu.push(a)), accu;
}
