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

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.match");

var _hsla = require("./hsla.es5.js");

var _util = _interopRequireDefault(require("../util.es5.js"));

function RGBA(r = 0, g = 0, b = 0, a = 255) {
  const args = [...arguments];
  let ret = this instanceof RGBA ? this : {};
  let c = [];

  if(args.length >= 3) {
    ret.r = r;
    ret.g = g;
    ret.b = b;
    ret.a = a;
  } else if(args.length == 1) {
    const arg = args[0];

    if(typeof arg === "string") {
      if(arg.startsWith("#")) {
        c = arg.length >= 7 ? /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/i.exec(arg) : /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/i.exec(arg);
        let mul = arg.length >= 7 ? 1 : 17;
        ret.r = parseInt(c[1], 16) * mul;
        ret.g = parseInt(c[2], 16) * mul;
        ret.b = parseInt(c[3], 16) * mul;
        ret.a = c.length > 3 ? parseInt(c[4], 16) * mul : 255;
      } else if(arg.toLowerCase().startsWith("rgb")) {
        c = arg.match(new RegExp("/[d.]+/g")).map(x => parseFloat(x));
        c = [...c].slice(1);
        ret.r = Math.round(c[0]);
        ret.g = Math.round(c[1]);
        ret.b = Math.round(c[2]);
        ret.a = Math.round(c.length > 3 && !isNaN(c[3]) ? c[3] : 255);
      } else if(typeof arg === "object" && arg.r !== undefined) {
        ret.r = arg.r;
        ret.g = arg.g;
        ret.b = arg.b;
        ret.a = arg.a !== undefined ? arg.a : 255;
      }
    }
  }

  if(isNaN(ret.a)) ret.a = 255;
  if(!(ret instanceof RGBA)) return ret;
}

RGBA.properties = ["r", "g", "b", "a"];

const isRGBA = obj => RGBA.properties.every(prop => obj.hasOwnProperty(prop));

exports.isRGBA = isRGBA;

RGBA.fromHex = (hex, alpha = 255) => {
  const matches = hex && (hex.length >= 7 ? /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/i.exec(hex) : /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/i.exec(hex));
  if(matches === null) return null;
  let mul = hex.length >= 7 ? 1 : 17;

  const _slice$map = [...matches].slice(1).map(x => parseInt(x, 16) * mul),
    _slice$map2 = (0, _slicedToArray2.default)(_slice$map, 4),
    r = _slice$map2[0],
    g = _slice$map2[1],
    b = _slice$map2[2],
    a = _slice$map2[3];

  return new RGBA(r, g, b, matches.length > 3 && !isNaN(a) ? a : alpha);
};

RGBA.prototype.hex = function() {
  const _RGBA$clamp = RGBA.clamp(RGBA.round(this)),
    r = _RGBA$clamp.r,
    g = _RGBA$clamp.g,
    b = _RGBA$clamp.b,
    a = _RGBA$clamp.a;

  return "#" + ("0000000" + ((r << 16) | (g << 8) | b).toString(16)).slice(-6) + (a !== undefined && a != 255 ? ("0" + a.toString(16)).slice(-2) : "");
};

RGBA.prototype.toRGB = function() {
  const r = this.r,
    g = this.g,
    b = this.b;
  return new RGBA(r, g, b, 255);
};

RGBA.toHex = rgba => RGBA.prototype.hex.call(rgba);

RGBA.clamp = rgba => RGBA(Math.min(Math.max(rgba.r, 0), 255), Math.min(Math.max(rgba.g, 0), 255), Math.min(Math.max(rgba.b, 0), 255), Math.min(Math.max(rgba.a, 0), 255));

RGBA.round = rgba => RGBA.prototype.round.call(rgba);

RGBA.prototype.round = function() {
  this.r = Math.round(this.r);
  this.g = Math.round(this.g);
  this.b = Math.round(this.b);
  this.a = Math.round(this.a);
  return this;
};

RGBA.normalize = (rgba, from = 255, to = 1.0) => ({
  r: (rgba.r * to) / from,
  g: (rgba.g * to) / from,
  b: (rgba.b * to) / from,
  a: (rgba.a * to) / from
});

RGBA.prototype.css = () => prop => (prop ? prop + ":" : "") + "rgba(" + (void 0).r + ", " + (void 0).g + ", " + (void 0).b + ", " + ((void 0).a / 255).toFixed(3) + ")";

RGBA.prototype.toString = function(sep = ", ") {
  let a = this.a;
  if(a >= 255) return "rgb(" + this.r + sep + this.g + sep + this.b + ")";
  else return "rgba(" + this.r + sep + this.g + sep + this.b + sep + (a / 255).toFixed(3) + ")";
};

RGBA.prototype.normalize = function(from = 255, to = 1.0) {
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

RGBA.prototype.toAlpha = function(color) {
  let src = RGBA.normalize(this);
  let alpha = {};
  alpha.a = src.a;
  if(color.r < 0.0001) alpha.r = src.r;
  else if(src.r > color.r) alpha.r = (src.r - color.r) / (1.0 - color.r);
  else if(src.r < color.r) alpha.r = (color.r - src.r) / color.r;
  else alpha.r = 0.0;
  if(color.g < 0.0001) alpha.g = src.g;
  else if(src.g > color.g) alpha.g = (src.g - color.g) / (1.0 - color.g);
  else if(src.g < color.g) alpha.g = (color.g - src.g) / color.g;
  else alpha.g = 0.0;
  if(color.b < 0.0001) alpha.b = src.b;
  else if(src.b > color.b) alpha.b = (src.b - color.b) / (1.0 - color.b);
  else if(src.b < color.b) alpha.b = (color.b - src.b) / color.b;
  else alpha.b = 0.0;

  if(alpha.r > alpha.g) {
    if(alpha.r > alpha.b) {
      src.a = alpha.r;
    } else {
      src.a = alpha.b;
    }
  } else if(alpha.g > alpha.b) {
    src.a = alpha.g;
  } else {
    src.a = alpha.b;
  }

  if(src.a >= 0.0001) {
    src.r = (src.r - color.r) / src.a + color.r;
    src.g = (src.g - color.g) / src.a + color.g;
    src.b = (src.b - color.b) / src.a + color.b;
    src.a *= alpha.a;
  }

  let dst = RGBA.normalize(src, 1.0, 255);
  RGBA.round(dst);
  return new RGBA(dst.r, dst.g, dst.b, dst.a);
};

RGBA.prototype.toHSLA = function() {
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

  if(max == min) {
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

for (var _i = 0, _arr = ["hex", "toRGB", "round", "toHSLA"]; _i < _arr.length; _i++) {
  let name = _arr[_i];

  RGBA[name] = points => RGBA.prototype[name].call(points);
}
