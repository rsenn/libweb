import Util from '../util.js';
export function Vector(init, n, base = Int32Array) {
  if(n === undefined) n = init.length;
  let buf = new ArrayBuffer(base.BYTES_PER_ELEMENT * n);
  let vec = new base(buf);
  for(let i = 0; i < n; i++) vec.set([init[i]], i);
  return vec;
}
