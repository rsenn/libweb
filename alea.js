//From http://baagoe.com/en/RandomMusings/javascript/

export function Alea(...args) {
  //Johannes Baagøe <baagoe@baagoe.com>, 2010
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  let c = 1;
  let mash;

  let random = function() {
    let t = 2091639 * s0 + c * 2.3283064365386963e-10; //2^-32
    s0 = s1;
    s1 = s2;

    let r = (s2 = t - (c = t | 0));
    // console.log('Alea() =', r);
    return r;
  };
  random.uint32 = function() {
    return random() * 0x100000000; //2^32
  };
  random.int32 = function() {
    return random() * 0x100000000 - 0x7fffffff; //2^31-1
  };
  random.signed = function() {
    return random() * 2 - 1.0;
  };
  random.fract53 = function() {
    return random() + ((random() * 0x200000) | 0) * 1.1102230246251565e-16; //2^-53
  };
  random.color = function() {
    return {
      h: random() * 360,
      s: random() * 100,
      l: random() * 100
    };
  };
  random.seed = function(...args) {
    if(args.length == 0) {
      args = [+new Date()];
    }
    let mash = Mash();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for(let i = 0; i < args.length; i++) {
      s0 -= mash(args[i]);
      if(s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(args[i]);
      if(s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(args[i]);
      if(s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;
    return this;
  };

  random.seed = function(...args) {
    if(args.length == 0) {
      args = [+new Date()];
    }
    mash = Mash();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    return random.mash(args);
  };
  random.mash = function(...args) {
    mash = mash || Mash();

    for(let i = 0; i < args.length; i++) {
      s0 -= mash(args[i]);
      if(s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(args[i]);
      if(s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(args[i]);
      if(s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;
    return random;
  };

  random.version = 'Alea 0.9';
  random.args = args;
  random.seed.apply(random, args);

  //my own additions to sync state between two generators
  random.clone = function() {
    let r = new Alea();
    r.importState(this.exportState());
    return r;
  };
  random.exportState = function() {
    return [s0, s1, s2, c];
  };
  random.importState = function(i) {
    s0 = +i[0] || 0;
    s1 = +i[1] || 0;
    s2 = +i[2] || 0;
    c = +i[3] || 0;
  };

  return random;
}

function Mash() {
  let n = 0xefc8249d;

  let mash = function(data) {
    data = data.toString();
    for(let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; //2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; //2^-32
  };

  mash.version = 'Mash 0.9';
  return mash;
}

//importState to sync generator states
Alea.importState = function(i) {
  let random = new Alea();
  random.importState(i);
  return random;
};

Alea.uint32 = function(seed) {
  let random = new Alea(seed);
  return () => random.uint32();
};

export default Alea;
