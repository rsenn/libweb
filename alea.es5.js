require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

function Alea() {
  const args = [...arguments];
  var s0 = 0;
  var s1 = 0;
  var s2 = 0;
  var c = 1;

  var random = function random() {
    var t = 2091639 * s0 + c * 2.3283064365386963e-10;
    s0 = s1;
    s1 = s2;
    return s2 = t - (c = t | 0);
  };

  random.uint32 = function () {
    return random() * 0x100000000;
  };

  random.int32 = function () {
    return random() * 0x100000000 - 0x7fffffff;
  };

  random.signed = function () {
    return random() * 2 - 1.0;
  };

  random.fract53 = function () {
    return random() + (random() * 0x200000 | 0) * 1.1102230246251565e-16;
  };

  random.color = function () {
    return {
      h: random() * 360,
      s: random() * 100,
      l: random() * 100
    };
  };

  random.seed = function () {
    let args = [...arguments];

    if (args.length == 0) {
      args = [+new Date()];
    }

    var mash = Mash();
    s0 = mash(" ");
    s1 = mash(" ");
    s2 = mash(" ");

    for (var i = 0; i < args.length; i++) {
      s0 -= mash(args[i]);

      if (s0 < 0) {
        s0 += 1;
      }

      s1 -= mash(args[i]);

      if (s1 < 0) {
        s1 += 1;
      }

      s2 -= mash(args[i]);

      if (s2 < 0) {
        s2 += 1;
      }
    }

    mash = null;
  };

  random.version = "Alea 0.9";
  random.args = args;
  random.seed.apply(random, args);

  random.exportState = function () {
    return [s0, s1, s2, c];
  };

  random.importState = function (i) {
    s0 = +i[0] || 0;
    s1 = +i[1] || 0;
    s2 = +i[2] || 0;
    c = +i[3] || 0;
  };

  return random;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function mash(data) {
    data = data.toString();

    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000;
    }

    return (n >>> 0) * 2.3283064365386963e-10;
  };

  mash.version = "Mash 0.9";
  return mash;
}

Alea.importState = function (i) {
  var random = new Alea();
  random.importState(i);
  return random;
};

module.exports = Alea;
