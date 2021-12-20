export function* concat(...streams) {
  for(let s of streams) yield* s;
}

export function consume(it, fn = a => console.log(`consume =`, a)) {
  for(let n of it) fn(n);
}

export function every(it, fn) {
  return reduce((acc, n, i) => acc && fn(n, i, it), true);
}

export function* filter(it, predicate = n => {}) {
  let i = 0;
  for(let n of it) {
    if(predicate(n, i++, it)) yield n;
  }
}

export function find(it, predicate = n => {}) {
  let i = 0;
  for(let n of it) if(predicate(n, i++, it)) return n;
}

export function findIndex(it, predicate = n => {}) {
  let i = 0;
  for(let n of it) if(predicate(n, i++, it)) return i;
  return -1;
}

export function forEach(it, fn = n => {}) {
  let i = 0;
  for(let n of it) fn(n, i++, it);
}
export function* from(it, transform = (e, i) => e) {
  for(let n of it) yield transform(n);
}

export function includes(it, searchElement, fromIndex = -1) {
  let i = 0;
  for(let n of it) {
    if(i++ >= fromIndex && n === searchElement) return true;
  }
  return false;
}

export function indexOf(it, searchElement, fromIndex = -1) {
  let i = 0;
  for(let n of it) {
    if(i >= fromIndex && n === searchElement) return i;
    i++;
  }
  return -1;
}

export function lastIndexOf(it, searchElement, fromIndex = -1) {
  let i = 0,
    j = -1;
  for(let n of it) {
    if(i >= fromIndex && n === searchElement) j = i;
    i++;
  }
  return j;
}

export function* map(it, transform = a => a) {
  for(let n of it) {
    yield transform(n);
  }
}

export function reduce(it, fn, accu) {
  let i = 0;
  for(let n of it) accu = fn(accu, n, i++, it);
  return accu;
}

export function some(it, fn) {
  return reduce((acc, n, i) => acc || fn(n, i, it), false);
}

export function accumulate(it, accu) {
  return consume(it, a => accu.push(a)), accu;
}
