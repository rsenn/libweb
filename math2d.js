/*
 * 2d-math stuff;
 */

let inc = function(t, s) {
  t[0] += s[0];
  t[1] += s[1];
  return t;
};
let dec = function(t, s) {
  t[0] -= s[0];
  t[1] -= s[1];
  return t;
};
let mul = function(t, s) {
  t[0] *= s;
  t[1] *= s;
  return t;
};
let sqrlen = function(t) {
  let t0 = t[0],
    t1 = t[1];
  return t0 * t0 + t1 * t1;
};
let len = function(t) {
  let t0 = t[0],
    t1 = t[1];
  return Math.sqrt(t0 * t0 + t1 * t1);
};
let setlen = function(t, newlen) {
  let t0 = t[0],
    t1 = t[1],
    k;
  if(t0 === 0 || t1 === 0) {
    return t;
  }
  k = newlen / Math.sqrt(t0 * t0 + t1 * t1);
  t[0] *= k;
  t[1] *= k;
  return t;
};

let rectptmid = function(r) {
  return [r[0] + r[2] / 2, r[1] + r[3] / 2];
};

export default {
  inc,
  dec,
  mul,
  sqrlen,
  len,
  setlen,
  rectptmid,
};
