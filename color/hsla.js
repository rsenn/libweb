import { RGBA, ImmutableRGBA } from './rgba.js';
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
      var matches = /hsla\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?),\s*([0-9.]+)\s*\)/g.exec(arg) || /hsl\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*\)/g.exec(arg);

      if(matches != null) c = [...matches].slice(1);
    }

    if(c.length < 3) throw new Error('Invalid HSLA color:' + args);
    ret.h = c[0];
    ret.s = c[1];
    ret.l = c[2];
    ret.a = c[3] !== undefined ? c[3] : 1.0;

    ['h', 's', 'l', 'a'].forEach(channel => {
      if(String(ret[channel]).endsWith('%')) ret[channel] = parseFloat(ret[channel].slice(0, -1));
      else ret[channel] = parseFloat(ret[channel]) * (channel == 'a' || channel == 'h' ? 1 : 100);
    });
  } else {
    ret.h = 0;
    ret.s = 0;
    ret.l = 0;
    ret.a = 0;
  }

  //Util.log('HSLA ', { c, ret, args });
  if(!(ret instanceof HSLA)) return ret;
}

HSLA.prototype.properties = ['h', 's', 'l', 'a'];

HSLA.prototype.clone = function() {
  const ctor = this.constructor[Symbol.species];
  const { h, s, l, a } = this;
  return new ctor(h, s, l, a);
};
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
  const { h, s, l, a } = this;
  let x = [h, s, l, a].map(n => Math.round(n));
  if(Object.isFrozen(this)) return new HSLA(...x);
  this.h = x[0];
  this.s = x[1];
  this.l = x[2];
  this.a = x[3];
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
  var { h, s, l, a } = this;

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

  return new (Object.isFrozen(this) ? ImmutableRGBA : RGBA)(r, g, b, a);
};

HSLA.prototype.toString = function() {
  const h = Util.roundTo(this.h, 360 / 255, 0);
  const s = Util.roundTo(this.s, 100 / 255, 2);
  const l = Util.roundTo(this.l, 100 / 255, 2);
  const a = Util.roundTo(this.a, 1 / 255, 4);

  if(this.a == 1) return `hsl(${h},${s}%,${l}%)`;
  return `hsla(${h},${s}%,${l}%,${a})`;
};

HSLA.fromString = str => {
  let c = Util.tryCatch(
    () => new RGBA(str),
    c => (c.valid() ? c : null),
    () => undefined
  );
  if(!c)
    c = Util.tryCatch(
      () => new HSLA(str),
      c => (c.valid() ? c : null),
      () => undefined
    );
  return c;
};

HSLA.prototype.valid = function() {
  const { h, s, l, a } = this;
  return [h, s, l, a].every(n => !isNaN(n) && typeof n == 'number');
};
HSLA.random = function(h = [0, 360], s = [0, 100], l = [0, 100], a = [0, 1], rng = Util.rng) {
  return new HSLA(Util.randInt(...h, rng), Util.randInt(...s, rng), Util.randInt(...l, rng), Util.randFloat(...a, rng));
};
HSLA.prototype.dump = function() {
  //Util.log(`[%c    %c]`, `background: ${this.toString()};`, `background: none`, this);
  return this;
};
HSLA.prototype.binaryValue = function() {
  const { h, s, l, a } = this;
  const byte = (() => {
    const clamp = Util.clamp(0, 255);
    return (val, range = 255) => clamp((val * 255) / range) % 256;
  })();

  return ((byte(h, 360) * 256 + byte(s)) * 256 + byte(l)) * 256 + byte(a, 1);
  //Util.log(`[%c    %c]`, `background: ${this.toString()};`, `background: none`, this);
  return this;
};

HSLA.prototype.compareTo = function(other) {
  let d = HSLA.prototype.binaryValue.call(other) - HSLA.prototype.binaryValue.call(this);
  return d < 0 ? -1 : d > 0 ? 1 : 0;
};
HSLA.prototype.toAnsi256 = function() {
  const rgba = HSLA.prototype.toRGBA.call(this);
  return RGBA.prototype.toAnsi256.call(rgba);
};
HSLA.prototype[Symbol.for('nodejs.util.inspect.custom')] = function() {
  const { h, s, l, a } = this;
  let arr = !isNaN(a) ? [h, s, l, a] : [h, s, l];
  let ret = arr.map((n, i) => (Util.roundTo(n, i == 3 ? 1 / 255 : i == 0 ? 1 : 100 / 255, 2) + '').padStart(i == 0 ? 3 : i < 3 ? i + 3 : 1, ' ')).join(', ');
  const color = this.toRGBA().toAnsi256(true);
  let o = '';
  o += arr.map(n => `\x1b[0;33m${n}\x1b[0m`).join('');
  o = color + o;

  return `\x1b[1;31mHSLA\x1b[1;36m` + `(${ret})`.padEnd(24, ' ') + ` ${color}    \x1b[0m`;
};

for(let name of ['css', 'toHSL', 'clamp', 'round', 'hex', 'toRGBA', 'toString']) {
  HSLA[name] = hsla => HSLA.prototype[name].call(hsla || new HSLA());
}

export const isHSLA = obj => HSLA.properties.every(prop => obj.hasOwnProperty(prop));

Util.defineGetter(HSLA, Symbol.species, function() {
  return this;
});
export const ImmutableHSLA = Util.immutableClass(HSLA);
Util.defineGetter(ImmutableHSLA, Symbol.species, function() {
  return ImmutableHSLA;
});
