"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HSLA = HSLA;
exports.isHSLA = void 0;

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

var _rgba = require("./rgba.es5.js");

function HSLA(h = 0, s = 0, l = 0, a = 1.0) {
  const args = [...arguments];
  let c = [];
  let ret = this instanceof HSLA ? this : {};

  if(args.length >= 3) {
    ret.h = Math.round(h);
    ret.s = s;
    ret.l = l;
    ret.a = a;
  } else {
    const arg = args[0];

    if(typeof arg === "string") {
      var matches = /hsla\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?),\s*([0-9.]+)\s*\)/g.exec(arg) || /hsl\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*\)/g.exec(arg);
      if(matches != null) matches = [...matches].slice(1);
    }

    ret.h = c[0];
    ret.s = c[1];
    ret.l = c[2];
    ret.a = c[3] !== undefined ? c[3] : 1.0;
    ["h", "s", "l", "a"].forEach(channel => {
      if(String(ret[channel]).endsWith("%")) ret[channel] = parseFloat(ret[channel].slice(0, ret[channel].length - 1));
      else ret[channel] = parseFloat(ret[channel]);
    });
  }

  if(!(ret instanceof HSLA)) return ret;
}

HSLA.prototype.properties = ["h", "s", "l", "a"];

HSLA.prototype.css = function() {
  const hsla = HSLA.clamp(HSLA.round(this));
  return HSLA.setcss(hsla)();
};

HSLA.prototype.toHSL = function() {
  const h = this.h,
    s = this.s,
    l = this.l;
  return new HSLA(h, s, l, 1.0);
};

HSLA.prototype.clamp = function() {
  this.h = this.h % 360;
  this.s = Math.min(Math.max(this.s, 0), 100);
  this.l = Math.min(Math.max(this.l, 0), 100);
  this.a = Math.min(Math.max(this.a, 0), 1);
  return this;
};

HSLA.prototype.round = function() {
  this.h = Math.round(this.h);
  this.s = Math.round(this.s);
  this.l = Math.round(this.l);
  this.a = Math.round(this.a);
  return this;
};

HSLA.prototype.hex = function() {
  return _rgba.RGBA.prototype.hex.call(HSLA.prototype.toRGBA.call(this));
};

HSLA.prototype.toRGBA = function() {
  var h = this.h,
    s = this.s,
    l = this.l,
    a = this.a;
  var r, g, b, m, c, x;
  if(!isFinite(h)) h = 0;
  if(!isFinite(s)) s = 0;
  if(!isFinite(l)) l = 0;
  h /= 60;
  if(h < 0) h = 6 - (-h % 6);
  h %= 6;
  s = Math.max(0, Math.min(1, s / 100));
  l = Math.max(0, Math.min(1, l / 100));
  c = (1 - Math.abs(2 * l - 1)) * s;
  x = c * (1 - Math.abs((h % 2) - 1));

  if(h < 1) {
    r = c;
    g = x;
    b = 0;
  } else if(h < 2) {
    r = x;
    g = c;
    b = 0;
  } else if(h < 3) {
    r = 0;
    g = c;
    b = x;
  } else if(h < 4) {
    r = 0;
    g = x;
    b = c;
  } else if(h < 5) {
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

HSLA.prototype.toString = function() {
  if(this.a == 1)
    return "hsl("
      .concat(this.h, ",")
      .concat(this.s, "%,")
      .concat(this.l, "%)");
  return "hsla("
    .concat(this.h, ",")
    .concat(this.s, "%,")
    .concat(this.l, "%,")
    .concat(this.a, ")");
};

for(var _i = 0, _arr = ["css", "toHSL", "clamp", "round", "hex", "toRGBA", "toString"]; _i < _arr.length; _i++) {
  let name = _arr[_i];

  HSLA[name] = points => HSLA.prototype[name].call(points);
}

const isHSLA = obj => HSLA.properties.every(prop => obj.hasOwnProperty(prop));

exports.isHSLA = isHSLA;
