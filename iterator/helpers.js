export function* map(stream, transform = a => a) {
  for(let n of stream) {
    yield transform(n);
  }
}

export function consume(stream, fn = a => console.log(`consume =`, a)) {
  for(let n of stream) fn(n);
}

export function accumulate(stream, accu) {
  return consume(stream, a => accu.push(a)), accu;
}
