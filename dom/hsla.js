import { RGBA } from './rgba.js';
import Util from '../util.js';

/**
 * @brief [brief description]
 * @param h  hue value 0-360
 * @param s  saturation 0-100%
 * @param l  luminance 0-100%
 * @param a  alpha 0-1.0
 *
 * @return [description]
 */
export function HSLA(h = 0, s = 0, l = 0, a = 1.0) {
  const args = [...arguments];
  let c = [];
  let ret = this instanceof HSLA ? this : {};

  /*  if(!this) return Object.assign({}, HSLA.prototype, { h, s, l, a });*/

  if(typeof args[0] == 'object' && 'h' in args[0] && 's' in args[0] && 'l' in args[0]) {
    ret.h = args[0].h;
    ret.s = args[0].s;
    ret.l = args[0].l;
    ret.a = args[0].a || 1.0;
  } else if(args.length >= 3) {
    ret.h = Math.round(h);
    ret.s = s;
    ret.l = l;
    ret.a = a;
  } else if(typeof args[0] == 'string') {
    const arg = args[0];
    if(typeof arg === 'string') {
      let matches = /hsla\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?),\s*([0-9.]+)\s*\)/g.exec(arg) || /hsl\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*\)/g.exec(arg);

      if(matches != null) c = [...matches].slice(1);
    }

    if(c.length < 3) throw new Error('Invalid HSLA color:' + args);
    ret.h = c[0];
    ret.s = c[1];
    ret.l = c[2];
    ret.a = c[3] !== undefined ? c[3] : 1.0;

    ['h', 's', 'l', 'a'].forEach((channel) => {
      if(String(ret[channel]).endsWith('%')) ret[channel] = parseFloat(ret[channel].slice(0, -1));
      else ret[channel] = parseFloat(ret[channel]) * (channel == 'a' || channel == 'h' ? 1 : 100);
    });
  } else {
    ret.h = 0;
    ret.s = 0;
    ret.l = 0;
    ret.a = 0;
  }

  //console.log('HSLA ', { c, ret, args });
  if(!(ret instanceof HSLA)) return ret;
}

HSLA.prototype.properties = ['h', 's', 'l', 'a'];

//export const isHSLA = obj => HSLA.properties.every(prop => obj.hasOwnProperty(prop));

HSLA.prototype.css = function() {
  const hsla = HSLA.clamp(HSLA.round(this));
  return HSLA.setcss(hsla)();
};
HSLA.prototype.toHSL = function() {
  const { h, s, l } = this;
  return new HSLA(h, s, l, 1.0);
};

HSLA.prototype.clamp = function() {
  this.h = (this.h % 360) + (this.h < 0 ? 360 : 0);
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
HSLA.prototype.add = function(h, s = 0, l = 0, a = 0) {
  this.h += h;
  this.s += s;
  this.l += l;
  this.a += a;
  return this.clamp();
};
HSLA.prototype.hex = function() {
  return RGBA.prototype.hex.call(HSLA.prototype.toRGBA.call(this));
};

HSLA.prototype.toRGBA = function() {
  let { h, s, l, a } = this;

  let r, g, b, m, c, x;

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

  return new RGBA(r, g, b, a);
};

HSLA.prototype.toString = function() {
  const h = Util.roundTo(this.h, 360 / 255, 0);
  const s = Util.roundTo(this.s, 100 / 255, 2);
  const l = Util.roundTo(this.l, 100 / 255, 2);
  const a = Util.roundTo(this.a, 1 / 255, 4);

  if(this.a == 1) return `hsl(${h},${s}%,${l}%)`;
  return `hsla(${h},${s}%,${l}%,${a})`;
};

HSLA.random = function(h = [0, 360], s = [0, 100], l = [0, 100], a = [1, 1], rng = Math.random) {
  return new HSLA(Util.randInt(h, rng), Util.randInt(s, rng), Util.randInt(l, rng), Util.randInt(a, rng));
};
HSLA.prototype.dump = function() {
  console.log(`[%c    %c]`, `background: ${this.toString()};`, `background: none`, this);
  return this;
};

for(let name of ['css', 'toHSL', 'clamp', 'round', 'hex', 'toRGBA', 'toString']) {
  HSLA[name] = (hsla) => HSLA.prototype[name].call(hsla || new HSLA());
}

export const isHSLA = (obj) => HSLA.properties.every((prop) => obj.hasOwnProperty(prop));
