"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RGBA = RGBA;
exports.isRGBA = void 0;

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es6.regexp.match");

var _hsla = require("./hsla.cjs");

var _util = _interopRequireDefault(require("../util.cjs"));

function RGBA(r = 0, g = 0, b = 0, a = 255) {
  const args = [...arguments];
  let ret = this instanceof RGBA ? this : {};
  let c = [];

  if (args.length >= 3) {
    ret.r = r;
    ret.g = g;
    ret.b = b;
    ret.a = a;
  } else if (args.length == 1) {
    const arg = args[0];

    if (typeof arg === "string") {
      if (arg.startsWith("#")) {
        c = arg.length >= 7 ? /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/i.exec(arg) : /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/i.exec(arg);
        let mul = arg.length >= 7 ? 1 : 17;
        ret.r = parseInt(c[1], 16) * mul;
        ret.g = parseInt(c[2], 16) * mul;
        ret.b = parseInt(c[3], 16) * mul;
        ret.a = c.length > 3 ? parseInt(c[4], 16) * mul : 255;
      } else if (arg.toLowerCase().startsWith("rgb")) {
        c = arg.match(/[\d.%]+/g).map(x => x.endsWith("%") ? parseFloat(x.slice(0, -1)) * 2.55 : +x);
        c = [...c].slice();
        ret.r = Math.round(c[0]);
        ret.g = Math.round(c[1]);
        ret.b = Math.round(c[2]);
        ret.a = Math.round(c.length > 3 && !isNaN(c[3]) ? c[3] : 255);
      } else if (typeof arg === "object" && arg.r !== undefined) {
        ret.r = arg.r;
        ret.g = arg.g;
        ret.b = arg.b;
        ret.a = arg.a !== undefined ? arg.a : 255;
      } else {
        ret.r = 0;
        ret.g = 0;
        ret.b = 0;
        ret.a = 0;
      }
    }
  }

  if (isNaN(ret.a)) ret.a = 255;
  if (!(ret instanceof RGBA)) return ret;
}

RGBA.properties = ["r", "g", "b", "a"];

const isRGBA = obj => RGBA.properties.every(prop => obj.hasOwnProperty(prop));

exports.isRGBA = isRGBA;

RGBA.fromString = str => {
  let c = _util.default.tryCatch(() => new _hsla.HSLA(str), c => c.toRGBA(), () => undefined);

  if (!c) c = _util.default.tryCatch(() => new RGBA(str), c => c, () => undefined);
  return c;
};

RGBA.fromHex = (hex, alpha = 255) => {
  const matches = hex && (hex.length >= 7 ? /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/i.exec(hex) : /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/i.exec(hex));
  if (matches === null) return null;
  let mul = hex.length >= 7 ? 1 : 17;

  const _slice$map = [...matches].slice(1).map(x => parseInt(x, 16) * mul),
        _slice$map2 = (0, _slicedToArray2.default)(_slice$map, 4),
        r = _slice$map2[0],
        g = _slice$map2[1],
        b = _slice$map2[2],
        a = _slice$map2[3];

  return new RGBA(r, g, b, matches.length > 3 && !isNaN(a) ? a : alpha);
};

RGBA.prototype.hex = function () {
  const _RGBA$clamp = RGBA.clamp(RGBA.round(this)),
        r = _RGBA$clamp.r,
        g = _RGBA$clamp.g,
        b = _RGBA$clamp.b,
        a = _RGBA$clamp.a;

  return "#" + ("0000000" + (r << 16 | g << 8 | b).toString(16)).slice(-6) + (a !== undefined && a != 255 ? ("0" + a.toString(16)).slice(-2) : "");
};

RGBA.prototype.toRGB = function () {
  const r = this.r,
        g = this.g,
        b = this.b;
  return new RGBA(r, g, b, 255);
};

RGBA.toHex = rgba => RGBA.prototype.hex.call(rgba);

RGBA.clamp = rgba => RGBA(Math.min(Math.max(rgba.r, 0), 255), Math.min(Math.max(rgba.g, 0), 255), Math.min(Math.max(rgba.b, 0), 255), Math.min(Math.max(rgba.a, 0), 255));

RGBA.round = rgba => RGBA.prototype.round.call(rgba);

RGBA.prototype.round = function () {
  this.r = Math.round(this.r);
  this.g = Math.round(this.g);
  this.b = Math.round(this.b);
  this.a = Math.round(this.a);
  return this;
};

RGBA.normalize = (rgba, from = 255, to = 1.0) => ({
  r: rgba.r * to / from,
  g: rgba.g * to / from,
  b: rgba.b * to / from,
  a: rgba.a * to / from
});

RGBA.prototype.css = () => prop => (prop ? prop + ":" : "") + "rgba(" + (void 0).r + ", " + (void 0).g + ", " + (void 0).b + ", " + ((void 0).a / 255).toFixed(3) + ")";

RGBA.prototype.toString = function (sep = ",", fmt = num => +num.toFixed(3)) {
  const r = this.r,
        g = this.g,
        b = this.b,
        a = this.a;
  if (a >= 255) return "rgb(" + fmt(r) + sep + fmt(g) + sep + fmt(b) + ")";else return "rgba(" + fmt(r) + sep + fmt(g) + sep + fmt(b) + sep + a / 255 + ")";
};

RGBA.prototype.toSource = function (sep = ",") {
  let a = this.a;
  if (a >= 255) return "new RGBA(" + this.r + sep + this.g + sep + this.b + ")";else return "new RGBA(" + this.r + sep + this.g + sep + this.b + sep + (a / 255).toFixed(3) + ")";
};

RGBA.prototype.normalize = function (from = 255, to = 1.0) {
  const mul = to / from;
  this.r *= mul;
  this.g *= mul;
  this.b *= mul;
  this.a *= mul;
  return this;
};

RGBA.blend = (a, b, o = 0.5) => {
  a = new RGBA(a);
  b = new RGBA(b);
  return new RGBA(Math.round(a.r * o + b.r * (1 - o)), Math.round(a.g * o + b.g * (1 - o)), Math.round(a.b * o + b.b * (1 - o)), Math.round(a.a * o + b.a * (1 - o)));
};

RGBA.prototype.toAlpha = function (color) {
  let src = RGBA.normalize(this);
  let alpha = {};
  alpha.a = src.a;
  if (color.r < 0.0001) alpha.r = src.r;else if (src.r > color.r) alpha.r = (src.r - color.r) / (1.0 - color.r);else if (src.r < color.r) alpha.r = (color.r - src.r) / color.r;else alpha.r = 0.0;
  if (color.g < 0.0001) alpha.g = src.g;else if (src.g > color.g) alpha.g = (src.g - color.g) / (1.0 - color.g);else if (src.g < color.g) alpha.g = (color.g - src.g) / color.g;else alpha.g = 0.0;
  if (color.b < 0.0001) alpha.b = src.b;else if (src.b > color.b) alpha.b = (src.b - color.b) / (1.0 - color.b);else if (src.b < color.b) alpha.b = (color.b - src.b) / color.b;else alpha.b = 0.0;

  if (alpha.r > alpha.g) {
    if (alpha.r > alpha.b) {
      src.a = alpha.r;
    } else {
      src.a = alpha.b;
    }
  } else if (alpha.g > alpha.b) {
    src.a = alpha.g;
  } else {
    src.a = alpha.b;
  }

  if (src.a >= 0.0001) {
    src.r = (src.r - color.r) / src.a + color.r;
    src.g = (src.g - color.g) / src.a + color.g;
    src.b = (src.b - color.b) / src.a + color.b;
    src.a *= alpha.a;
  }

  let dst = RGBA.normalize(src, 1.0, 255);
  RGBA.round(dst);
  return new RGBA(dst.r, dst.g, dst.b, dst.a);
};

RGBA.prototype.toHSLA = function () {
  let r = this.r,
      g = this.g,
      b = this.b,
      a = this.a;
  r /= 255;
  g /= 255;
  b /= 255;
  a /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h;
  var s;
  var l = (max + min) / 2;

  if (max == min) {
    h = s = 0;
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;

      case g:
        h = (b - r) / d + 2;
        break;

      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  h *= 360;
  s *= 100;
  l *= 100;
  return new _hsla.HSLA(Math.round(h), _util.default.roundTo(s, 100 / 255), _util.default.roundTo(l, 100 / 255), _util.default.roundTo(a, 1 / 255));
};

RGBA.prototype.toCMYK = function () {
  var res = {};
  let r = this.r / 255;
  let g = this.g / 255;
  let b = this.b / 255;
  res.k = Math.min(1 - r, 1 - g, 1 - b);
  res.c = (1 - r - res.k) / (1 - res.k);
  res.m = (1 - g - res.k) / (1 - res.k);
  res.y = (1 - b - res.k) / (1 - res.k);
  return {
    c: Math.round(res.c * 100),
    m: Math.round(res.m * 100),
    y: Math.round(res.y * 100),
    k: Math.round(res.k * 100),
    a: this.a
  };
};

RGBA.prototype.toLAB = function () {
  var r = this.r / 255,
      g = this.g / 255,
      b = this.b / 255,
      x,
      y,
      z;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
    alpha: this.a
  };
};

RGBA.prototype.fromLAB = function (lab) {
  var y = (lab.l + 16) / 116,
      x = lab.a / 500 + y,
      z = y - lab.b / 200,
      r,
      g,
      b;
  x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787);
  y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787);
  z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787);
  r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  b = x * 0.0557 + y * -0.204 + z * 1.057;
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;
  this.r = Math.round(Math.max(0, Math.min(1, r)) * 255);
  this.g = Math.round(Math.max(0, Math.min(1, g)) * 255);
  this.b = Math.round(Math.max(0, Math.min(1, b)) * 255);
  this.a = lab.alpha || 255;
  return this;
};

RGBA.prototype.linear = function () {
  let r = this.r / 255.0;
  let g = this.g / 255.0;
  let b = this.b / 255.0;
  let gamma = 2.2;
  r = Math.pow(r, gamma);
  g = Math.pow(g, gamma);
  b = Math.pow(b, gamma);
  return {
    r,
    g,
    b
  };
};

RGBA.prototype.luminance = function () {
  let lin = RGBA.prototype.linear.call(this);
  let Y = 0.2126 * lin.r;
  Y = Y + 0.7152 * lin.g;
  Y = Y + 0.0722 * lin.b;
  return Y;
};

RGBA.prototype.invert = function () {
  let r = 255 - this.r;
  let g = 255 - this.g;
  let b = 255 - this.b;
  return new RGBA(r, g, b, this.a);
};

RGBA.prototype.distance = function (other) {
  return Math.sqrt(Math.pow(other.r - this.r, 2) + Math.pow(other.g - this.g, 2) + Math.pow(other.b - this.b, 2)) / 441.67295593006370984949;
};

RGBA.prototype.luminanace = function () {
  const r = this.r,
        g = this.g,
        b = this.b;
  var a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

RGBA.prototype.contrast = function contrast(other) {
  var lum1 = this.luminanace();
  var lum2 = RGBA.prototype.luminanace.call(other);
  var brightest = Math.max(lum1, lum2);
  var darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

RGBA.random = function (r = [0, 255], g = [0, 255], b = [0, 255], a = [255, 255], rng = Math.random) {
  return new RGBA(_util.default.randInt(...r, rng), _util.default.randInt(...g, rng), _util.default.randInt(...b, rng), _util.default.randInt(...a, rng));
};

for (var _i = 0, _arr = ["hex", "toRGB", "round", "toHSLA", "toCMYK", "toLAB", "linear", "luminance", "distance"]; _i < _arr.length; _i++) {
  let name = _arr[_i];

  RGBA[name] = (...args) => RGBA.prototype[name].call(...args);
}

for (var _i2 = 0, _arr2 = ["fromLAB"]; _i2 < _arr2.length; _i2++) {
  let name = _arr2[_i2];

  RGBA[name] = arg => {
    let ret = new RGBA();
    return RGBA.prototype[name].call(ret, arg);
  };
}