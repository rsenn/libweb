import m2d from './math2d.js';

let vdec = m2d.inc;
let vinc = m2d.dec;
let vmul = m2d.mul;
let vlen = m2d.len;
var vset = m2d.set;
let vsetlen = m2d.setlen;

var vset = function(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  return a;
};
let rect = function(r) {
  return [r[0] + r[2] / 2, r[1] + r[3] / 2];
};
let rectmid = function(r) {
  return [r[0] + r[2] / 2, r[1] + r[3] / 2];
};

/**
 * calculates the area of overlap btw two rectangles;
 */
let rectoverlap = function(a, b) {
  //console.log("rectoverlap", {a,b});
  let x11 = a[0],
    y11 = a[1],
    x12 = a[0] + a[2],
    y12 = a[1] + a[3],
    x21 = b[0],
    y21 = b[1],
    x22 = b[0] + b[2],
    y22 = b[1] + b[3];
  let dx = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21)),
    dy = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
  return dx * dy;
};

/**
 *
 * opts = {
 *    bodies: array of rectangles, each rectangle is [left,top,width,height] array;
 *
 * }
 *
 */
export function Autoplacer(opts) {
  if(opts) {
    this.init(opts);
  }
}

Autoplacer.prototype.init = function(opts) {
  //deep cloning array of arrays;
  var b = (this.bodies_ = opts.bodies.slice(0)),
    i,
    len = b.length,
    s = (this.states_ = []),
    p,
    r;

  for(i = 0; i < len; i++) {
    r = b[i] = b[i].slice(0);
    var p = rectmid(b[i]);
    s[i] = {
      pos: p,
      fix: p.slice(0),
      prev: p.slice(0),
      vel: [0, 0],
      mass: r[2] * r[3] * 0.001
    };
  }
  this.limit_ = opts.limit || 200;
  this.count_ = 0;
  this.threshold_ = opts.threshold || 1;
  this.kin_ = 0;
  this.step_ = opts.step || 2;
  this.damp_ = opts.damp || 0.87;
  this.hookelaw_ = function(length) {
    return Math.pow(length, 0.86) * 0.001;
  };
};

/**
 * performs algorithm iteration
 *
 * return inner bodies array or null if cond() == false
 *
 */
Autoplacer.prototype.next = function() {
  if(this.count_ > 0 && !this.cond()) {
    return null;
  }
  this.count_++;

  let hookelaw = this.hookelaw_,
    i,
    j,
    b,
    s,
    vel,
    velmod,
    bb = this.bodies_,
    ss = this.states_,
    bj,
    sj,
    rj = [],
    total = bb.length,
    pos,
    fix,
    prev,
    step = this.step_,
    damp = this.damp_,
    vzero = [0, 0],
    f = [],
    d = [];

  for(i = 0; i < total; i++) {
    b = bb[i];
    s = ss[i];
    vel = s.vel;
    pos = s.pos; //pos is variable, current poisition
    fix = s.fix; //fix is an initial (constant) position
    prev = s.prev; //previous position;

    //attraction force calculation;
    vset(d, fix);
    vdec(d, pos);
    vsetlen(d, hookelaw(vlen(d)));
    vset(f, d);

    //console.log("pos:", pos);
    //console.log(":", { f, d });

    //repulsion force calculation

    for(j = 0; j < total; j++) {
      if(i === j) continue;
      bj = bb[j];
      sj = ss[j];
      rj[0] = sj.prev[0];
      rj[1] = sj.prev[1];
      rj[2] = bj[2];
      rj[3] = bj[3];

      //console.log("sj.prev:", sj.prev);

      let ov = rectoverlap(b, rj);
      vsetlen(vdec(vset(d, pos), sj.prev), 0.1 * Math.min(300, Math.pow(Math.max(ov), 0.5)));

      //console.log("ov:", ov);
      //console.log("f:", f);
      //console.log("d:", d);

      vinc(f, d);
    }

    //console.log("damp:", damp);
    //console.log("step:", step);

    //console.log("vel:", vel);
    //adjust coordinates/velocities

    //vel = (vel + f*step)*damp;
    vmul(vinc(vel, vmul(f, step)), damp);

    vset(prev, pos);
    //pos = pos + vel*step
    vinc(pos, vmul(vset(d, vel), step));
    vinc(b, d);

    velmod = vlen(vel);
    this.kin_ += s.mass * velmod * velmod;
  }

  return this.states_.map(b => b);
};

/**
 * retuns true if optimal placement has not been reached yet
 */
Autoplacer.prototype.cond = function() {
  return this.count_ < this.limit && this.kin_ > this.threshold_;
};

/**
 *
 */
Autoplacer.prototype.loop = function() {
  do {
    this.next();
  } while(this.cond());
  return this.bodies;
};

Autoplacer.prototype.animate = function(animator, interval) {
  let me = this;
  interval = interval || 100;
  let recur;
  recur = function() {
    me.next();
    animator(me.bodies);
    if(me.cond()) {
      setTimeout(recur, interval);
    }
  };
  recur();
};

export default Autoplacer;
