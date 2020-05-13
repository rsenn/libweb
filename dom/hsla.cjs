"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HSLA = HSLA;
exports.isHSLA = void 0;

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

var _rgba = require("./rgba.cjs");

var _util = _interopRequireDefault(require("../util.cjs"));

function HSLA(h = 0, s = 0, l = 0, a = 1.0) {
  const args = [...arguments];
  let c = [];
  let ret = this instanceof HSLA ? this : {};

  if (typeof args[0] == "object" && "h" in args[0] && "s" in args[0] && "l" in args[0]) {
    ret.h = args[0].h;
    ret.s = args[0].s;
    ret.l = args[0].l;
    ret.a = args[0].a || 1.0;
  } else if (args.length >= 3) {
    ret.h = Math.round(h);
    ret.s = s;
    ret.l = l;
    ret.a = a;
  } else {
    const arg = args[0];

    if (typeof arg === "string") {
      var matches = /hsla\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?),\s*([0-9.]+)\s*\)/g.exec(arg) || /hsl\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*\)/g.exec(arg);
      if (matches != null) c = [...matches].slice(1);
    }

    if (c.length < 3) throw new Error("Invalid HSLA color:" + args);
    ret.h = c[0];
    ret.s = c[1];
    ret.l = c[2];
    ret.a = c[3] !== undefined ? c[3] : 1.0;
    ["h", "s", "l", "a"].forEach(channel => {
      if (String(ret[channel]).endsWith("%")) ret[channel] = parseFloat(ret[channel].slice(0, -1));else ret[channel] = parseFloat(ret[channel]) * (channel == "a" || channel == "h" ? 1 : 100);
    });
  }

  if (!(ret instanceof HSLA)) return ret;
}

HSLA.prototype.properties = ["h", "s", "l", "a"];

HSLA.prototype.css = function () {
  const hsla = HSLA.clamp(HSLA.round(this));
  return HSLA.setcss(hsla)();
};

HSLA.prototype.toHSL = function () {
  const h = this.h,
        s = this.s,
        l = this.l;
  return new HSLA(h, s, l, 1.0);
};

HSLA.prototype.clamp = function () {
  this.h = this.h % 360 + (this.h < 0 ? 360 : 0);
  this.s = Math.min(Math.max(this.s, 0), 100);
  this.l = Math.min(Math.max(this.l, 0), 100);
  this.a = Math.min(Math.max(this.a, 0), 1);
  return this;
};

HSLA.prototype.round = function () {
  this.h = Math.round(this.h);
  this.s = Math.round(this.s);
  this.l = Math.round(this.l);
  this.a = Math.round(this.a);
  return this;
};

HSLA.prototype.add = function (h, s = 0, l = 0, a = 0) {
  this.h += h;
  this.s += s;
  this.l += l;
  this.a += a;
  return this.clamp();
};

HSLA.prototype.hex = function () {
  return _rgba.RGBA.prototype.hex.call(HSLA.prototype.toRGBA.call(this));
};

HSLA.prototype.toRGBA = function () {
  var h = this.h,
      s = this.s,
      l = this.l,
      a = this.a;
  var r, g, b, m, c, x;
  if (!isFinite(h)) h = 0;
  if (!isFinite(s)) s = 0;
  if (!isFinite(l)) l = 0;
  h /= 60;
  if (h < 0) h = 6 - -h % 6;
  h %= 6;
  s = Math.max(0, Math.min(1, s / 100));
  l = Math.max(0, Math.min(1, l / 100));
  c = (1 - Math.abs(2 * l - 1)) * s;
  x = c * (1 - Math.abs(h % 2 - 1));

  if (h < 1) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 2) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 3) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 4) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 5) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  m = l - c / 2;
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  a = Math.round(a * 255);
  return new _rgba.RGBA(r, g, b, a);
};

HSLA.prototype.toString = function () {
  const h = _util.default.roundTo(this.h, 360 / 255, 0);

  const s = _util.default.roundTo(this.s, 100 / 255, 2);

  const l = _util.default.roundTo(this.l, 100 / 255, 2);

  const a = _util.default.roundTo(this.a, 1 / 255, 4);

  if (this.a == 1) return "hsl(".concat(h, ",").concat(s, "%,").concat(l, "%)");
  return "hsla(".concat(h, ",").concat(s, "%,").concat(l, "%,").concat(a, ")");
};

HSLA.random = function (h = [0, 360], s = [0, 100], l = [0, 100], a = [1, 1], rng = Math.random) {
  return new HSLA(_util.default.randInt(h, rng), _util.default.randInt(s, rng), _util.default.randInt(l, rng), _util.default.randInt(a, rng));
};

HSLA.prototype.dump = function () {
  console.log("[%c    %c]", "background: ".concat(this.toString(), ";"), "background: none", this);
  return this;
};

for (var _i = 0, _arr = ["css", "toHSL", "clamp", "round", "hex", "toRGBA", "toString"]; _i < _arr.length; _i++) {
  let name = _arr[_i];

  HSLA[name] = points => HSLA.prototype[name].call(points);
}

const isHSLA = obj => HSLA.properties.every(prop => obj.hasOwnProperty(prop));

exports.isHSLA = isHSLA;
