export function* concat(...streams) {
  for(let iterator of streams) {
    let ret;
    while((ret = iterator.next(...args))) {
      const { done, value } = ret;

      if(done) break;

      yield value;
    }
  }
}

export function consume(iterator, fn = a => console.log(`consume =`, a), ...args) {
  let ret;
  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;

    fn(value);
  }
}

export function every(iterator, fn) {
  return reduce((acc, n, i) => acc && fn(n, i, iterator), true);
}

export function* filter(iterator, predicate = n => {}) {
  let ret,
    i = 0;
  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;

    if(predicate(value, i++, iterator)) yield value;
  }
}

export function find(iterator, predicate = n => {}) {
  let ret,
    i = 0;
  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;
    if(predicate(value, i++, iterator)) return value;
  }
}

export function findIndex(iterator, predicate = n => {}) {
  let ret,
    i = 0;

  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;
    if(predicate(value, i++, iterator)) return i;
  }
  return -1;
}

export function forEach(iterator, fn = n => {}) {
  let ret,
    i = 0;

  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;
    fn(value, i++, iterator);
  }
}

export function* from(iterator, transform = (e, i) => e) {
  let ret;

  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;
    yield transform(value);
  }
}

export function includes(iterator, searchElement, fromIndex = -1) {
  let i = 0;
  let ret;

  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;
    if(i++ >= fromIndex && value === searchElement) return true;
  }
  return false;
}

export function indexOf(iterator, searchElement, fromIndex = -1) {
  let ret,
    i = 0;

  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;
    if(i >= fromIndex && value === searchElement) return i;
    i++;
  }
  return -1;
}

export function lastIndexOf(iterator, searchElement, fromIndex = -1) {
  let ret,
    i = 0,
    j = -1;

  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;
    if(i >= fromIndex && value === searchElement) j = i;
    i++;
  }

  return j;
}

export function* map(iterator, ...args) {
  let ret;

  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;
    yield value;
  }
}

export function reduce(iterator, fn, accu) {
  let ret,
    i = 0;

  while((ret = iterator.next(...args))) {
    const { done, value } = ret;

    if(done) break;
    accu = fn(accu, n, i++, iterator);
  }
  return accu;
}

export function some(iterator, fn) {
  return reduce((acc, n, i) => acc || fn(n, i, iterator), false);
}

export function accumulate(iterator, accu) {
  return (consume(iterator, a => accu.push(a)), accu);
}

export function* take(iterator, n = 1) {
  while(n-- > 0) yield iterator.next().value;
}
