// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

var singleton = null;

function Alea() {
  let rnd = singleton || AleaClass.impl(...arguments);
  return rnd == null ? undefined : rnd.double();
}

Alea.uint32 = function() {
  let rnd = singleton || AleaClass.impl(...arguments);
  return rnd == null ? undefined : rnd.uint32();
};

Alea.singleton = function() {
  let rnd = singleton || AleaClass.impl(...arguments);
  return rnd;
};

class AleaClass {
  s0 = NaN;
  s1 = NaN;
  s2 = NaN;
  c = NaN;

  next() {
    var t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
    this.s0 = this.s1;
    this.s1 = this.s2;
    return (this.s2 = t - (this.c = t | 0));
  }

  static copy(f, t) {
    t.c = f.c;
    t.s0 = f.s0;
    t.s1 = f.s1;
    t.s2 = f.s2;
    return t;
  }

  static Mash() {
    var n = 0xefc8249d;

    var mash = function(data) {
      data = String(data);
      for(var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };

    return mash;
  }
  constructor(seed) {
    var me = this;
    var mash = AleaClass.Mash();

    // Apply the seeding algorithm from Baagoe.
    this.c = 1;
    this.s0 = mash(" ");
    this.s1 = mash(" ");
    this.s2 = mash(" ");
    this.s0 -= mash(seed);
    if(this.s0 < 0) {
      this.s0 += 1;
    }
    this.s1 -= mash(seed);
    if(this.s1 < 0) {
      this.s1 += 1;
    }
    this.s2 -= mash(seed);
    if(this.s2 < 0) {
      this.s2 += 1;
    }
    mash = null;

    this.next = this.next.bind(this);
  }

  static impl(seed = Date.now(), opts) {
    var xg = new AleaClass(seed);
    var state = opts && opts.state;
    var prng = xg.next;
    prng.int32 = function() {
      return (xg.next() * 0x100000000) | 0;
    };
    prng.uint32 = function() {
      return (xg.next() * 0x080000000) | 0;
    };
    prng.double = function() {
      return prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16; // 2^-53
    };
    prng.quick = prng;
    if(state) {
      if(typeof state == "object") copy(state, xg);
      prng.state = function() {
        return copy(xg, {});
      };
    }
    return prng;
  }
  static singleton(seed = Date.now(), opts) {
    if(!Alea.instance) Alea.instance = AleaClass.impl(seed, opts);
    return Alea.instance;
  }
}

Object.assign(Alea, AleaClass);
Object.assign(Alea.prototype, AleaClass.prototype);

module.exports = Alea;
