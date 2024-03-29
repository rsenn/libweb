import { clamp, curry, define, defineGetter, immutableClass, randInt, roundTo, tryCatch } from '../misc.js';

/**
 * @brief [brief description]
 * @param r  red value 0-255
 * @param g  green value 0-255
 * @param b  blue value 0-255
 * @param a  alpha value 0-1
 *
 * @return [description]
 */
export function RGBA(...args) {
  let ret = this instanceof RGBA ? this : {};
  let c = [];

  if(args.length == 1 && Array.isArray(args[0]) && args[0].length >= 3) args = args[0];
  //console.log('RGBA(', args, ')');

  if(args.length >= 3) {
    const [r = 0, g = 0, b = 0, a = 255] = args;
    ret.r = r;
    ret.g = g;
    ret.b = b;
    if(!isNaN(+a) /* && +a !== 255*/) ret.a = a;
  } else if(args.length <= 2) {
    const arg = args[0];
    if(typeof arg === 'number') {
      Object.assign(ret, RGBA.decode[args[1] !== undefined ? args[1] : RGBA.order.ABGR](arg));
    } else if(typeof arg === 'string') {
      if(arg.startsWith('#')) {
        c = arg.length >= 7 ? /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/i.exec(arg) : /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/i.exec(arg);

        let mul = arg.length >= 7 ? 1 : 17;

        //console.log('RGBA match:', c, ' mul:', mul);

        ret.r = parseInt(c[1], 16) * mul;
        ret.g = parseInt(c[2], 16) * mul;
        ret.b = parseInt(c[3], 16) * mul;
        if(c.length > 3) {
          let a = parseInt(c[4], 16) * mul;
          /*if(a !== 255)*/ ret.a = a;
        }
      } else if(arg.toLowerCase().startsWith('rgb')) {
        c = arg.match(/[\d.%]+/g).map(x => (x.endsWith('%') ? parseFloat(x.slice(0, -1)) * 2.55 : +x));

        c = [...c].slice();

        ret.r = Math.round(c[0]);
        ret.g = Math.round(c[1]);
        ret.b = Math.round(c[2]);
        if(c.length > 3) ret.a = Math.round(c[3] * 255);
      }
    } else if(typeof arg === 'object' && arg.r !== undefined) {
      ret.r = arg.r;
      ret.g = arg.g;
      ret.b = arg.b;
      if(arg.a !== undefined) ret.a = arg.a;
    } else {
      ret.r = 0;
      ret.g = 0;
      ret.b = 0;
      ret.a = 0;
    }
  }

  if(ret.a !== undefined && isNaN(+ret.a)) ret.a = 255;
  if(isNaN(ret.a)) ret.a = 255;

  //console.log('RGBA ', ret);
  if(!(ret instanceof RGBA)) return ret; //Object.setPrototypeOf(ret, RGBA.prototype);
}

RGBA.properties = ['r', 'g', 'b', 'a'];

export const isRGBA = obj => RGBA.properties.every(prop => obj.hasOwnProperty(prop));

RGBA.fromString = str => {
  if(/^rgba?\(/.test(str)) {
    let args = [...str.matchAll(/([0-9]+(\.[0-9]*|)%?)/g)].map(([, m]) => m).map(n => (n.endsWith('%') ? Math.round((+n.slice(0, -1) * 255) / 100) : +n));
    return new RGBA(...args);
  }

  let c = tryCatch(
    () => new HSLA(str),
    c => c.toRGBA(),
    () => undefined
  );
  if(!c)
    c = tryCatch(
      () => new RGBA(str),
      c => c,
      () => undefined
    );

  if(!c) {
  }
  return c;
};
RGBA.order = {
  RGBA: 0,
  BGRA: 1,
  ARGB: 2,
  ABGR: 3
};

RGBA.decode = [
  /*RGBA:*/ n => ({
    r: (n >> 24) & 0xff,
    g: (n >> 16) & 0xff,
    b: (n >> 8) & 0xff,
    a: n & 0xff
  }),
  /*BGRA:*/ n => ({
    b: (n >> 24) & 0xff,
    g: (n >> 16) & 0xff,
    r: (n >> 8) & 0xff,
    a: n & 0xff
  }),
  /*ARGB:*/ n => ({
    a: (n >> 24) & 0xff,
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff
  }),
  /*ABGR:*/ n => ({
    a: (n >> 24) & 0xff,
    b: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    r: n & 0xff
  })
];
RGBA.encode = [
  /*RGBA:*/ ({ r, g, b, a }) => [r, g, b, a].map(n => ('00' + (n & 0xff).toString(16)).slice(-2)).join(''),
  /*BGRA:*/ ({ r, g, b, a }) => [b, g, r, a].map(n => ('00' + (n & 0xff).toString(16)).slice(-2)).join(''),
  /*ARGB:*/ ({ r, g, b, a }) => [a, r, g, b].map(n => ('00' + (n & 0xff).toString(16)).slice(-2)).join(''),
  /*ABGR:*/ ({ r, g, b, a }) => [a, b, g, r].map(n => ('00' + (n & 0xff).toString(16)).slice(-2)).join('')
];
RGBA.fmt = [({ r, g, b, a }) => [r, g, b, a], ({ b, g, r, a }) => [b, g, r, a], ({ a, r, g, b }) => [a, r, g, b], ({ a, b, g, r }) => [a, b, g, r]];

RGBA.calculators = [
  ({ r, g, b, a }) => ((r * 256 + g) * 256 + b) * 256 + a,
  ({ b, g, r, a }) => ((b * 256 + g) * 256 + r) * 256 + a,
  ({ a, r, g, b }) => ((a * 256 + r) * 256 + g) * 256 + b,
  ({ a, b, g, r }) => ((a * 256 + b) * 256 + g) * 256 + r
];

RGBA.prototype.clone = function() {
  const ctor = this.constructor[Symbol.species];
  const { r, g, b, a } = this;
  return new ctor(r, g, b, a);
};
RGBA.prototype.binaryValue = function(order = 0) {
  const { r, g, b, a } = this;
  return RGBA.calculators[order](RGBA.clamp(this));
};
RGBA.prototype.valid = function() {
  const { r, g, b, a } = this;
  return [r, g, b, a].every(n => {
    n = +n;
    return !isNaN(n) && n >= 0 && n <= 255;
  });
};

RGBA.prototype.compareTo = function(other) {
  let d = RGBA.prototype.binaryValue.call(other) - RGBA.prototype.binaryValue.call(this);
  return d < 0 ? -1 : d > 0 ? 1 : 0;
};
RGBA.prototype.interpolate = function(other, a = 0.5) {
  a = Math.max(0, Math.min(1, 0.5));

  return new RGBA(this.r * (1 - a) + other.r * a, this.g * (1 - a) + other.g * a, this.b * (1 - a) + other.b * a, this.a * (1 - a) + other.a * a);
};
RGBA.fromHex = (hex, alpha = 255) => {
  if(hex[0] != '#') hex = ('ffffffff' + hex).slice(-8);

  const matches =
    hex && (hex.length >= 7 ? /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/i.exec(hex) : /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/i.exec(hex));
  if(matches === null) return null;
  let mul = hex.length >= 7 ? 1 : 17;

  const [r, g, b, a] = [...matches].slice(1).map(x => parseInt(x, 16) * mul);
  //console.log('RGBA.fromHex', { hex, matches, r, g, b, a });
  return new RGBA(r, g, b, matches.length > 3 && !isNaN(a) ? a : alpha);
};

RGBA.prototype.hex = function(opts = {}) {
  const { bits, prefix = '#', order = RGBA.order.RGBA } = opts;
  const { r, g, b, a } = RGBA.clamp(RGBA.round(this));
  const n = RGBA.encode[order]({ r, g, b, a });
  return prefix + ('0000000000' + n.toString(16)).slice(-8).slice(0, a === 255 || a === undefined ? 6 : 8);
};

/*RGBA.prototype.valueOf = function() {
  const hex = RGBA.prototype.hex.call(this);
  return parseInt('0x' + hex.slice(1));
};*/

RGBA.prototype.toRGB = function() {
  const { r, g, b } = this;
  return new RGBA(r, g, b, 255);
};

RGBA.toHex = rgba => RGBA.prototype.hex.call(rgba);

RGBA.clamp = rgba => RGBA(Math.min(Math.max(rgba.r, 0), 255), Math.min(Math.max(rgba.g, 0), 255), Math.min(Math.max(rgba.b, 0), 255), Math.min(Math.max(rgba.a, 0), 255));
RGBA.round = rgba => RGBA.prototype.round.call(rgba);

RGBA.prototype.round = function() {
  const { r, g, b, a } = this;
  let x = [r, g, b, a].map(n => Math.round(n));
  if(Object.isFrozen(this)) return new RGBA(...x);
  this.r = x[0];
  this.g = x[1];
  this.b = x[2];
  this.a = x[3];
  return this;
};
RGBA.prototype.setOpacity = function(a) {
  this.a = clamp(0, 255, a * 255);
  return this;
};
RGBA.normalize = function(rgba, src = 255, dst = 1.0) {
  return {
    r: (rgba.r * dst) / src,
    g: (rgba.g * dst) / src,
    b: (rgba.b * dst) / src,
    a: (rgba.a * dst) / src
  };
};
RGBA.prototype.css = () => prop => (prop ? prop + ':' : '') + 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + (this.a / 255).toFixed(3) + ')';

RGBA.prototype.toCSS = function(fmt = num => +num.toFixed(3)) {
  const { r, g, b, a } = this;
  const sep = ',';
  if(a === undefined || a == 255) return 'rgb(' + fmt(r) + sep + fmt(g) + sep + fmt(b) + ')';
  return 'rgba(' + fmt(r) + sep + fmt(g) + sep + fmt(b) + sep + (a * 100) / 255 + '%)';
};
RGBA.prototype.toString = function(opts) {
  return RGBA.prototype.hex.call(this, opts);
};
defineGetter(RGBA.prototype, Symbol.toStringTag, function() {
  const { r, g, b, a } = this;
  return `[object RGBA ${r},${g},${b},${a}]`;
});
RGBA.prototype[Symbol.toPrimitive] = function(hint) {
  //console.log("RGBA.toPrimitive", {hint});
  if(hint == 'number') return +RGBA.prototype.hex.call(this, { prefix: '0x' });
  if(hint == 'string') return RGBA.prototype.toString.call(this);
  if(hint == 'default') return RGBA.prototype.hex.call(this, { prefix: '#' });
};
function toHex(n) {
  return '0x' + ('00' + (+n).toString(16)).slice(-2);
}

RGBA.prototype.toSource = function(sep = ',') {
  let a = this.a;
  if(a === undefined) return 'new RGBA(' + this.r + sep + this.g + sep + this.b + ')';
  let s = 'new RGBA(' + toHex(this.r) + sep + toHex(this.g) + sep + toHex(this.b);

  if(a != 255) s += sep + toHex(a);

  s += ')';
  return s;
};

RGBA.prototype.normalize = function(src = 255, dst = 1.0) {
  return new RGBA((this.r * dst) / src, (this.g * dst) / src, (this.b * dst) / src, (this.a * dst) / src);
};

RGBA.blend = (a, b, o = 0.5) => {
  a = new RGBA(a);
  b = new RGBA(b);
  return new RGBA(Math.round(a.r * (1 - o) + b.r * o), Math.round(a.g * (1 - o) + b.g * o), Math.round(a.b * (1 - o) + b.b * o), Math.round(a.a * (1 - o) + b.a * o));
};

RGBA.prototype.toAlpha = curry(function (other) {
  let color = RGBA.normalize(this);
  let src = new RGBA(other).normalize();
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

  let dst = new RGBA(src.r * 255, src.g * 255, src.b * 255, src.a * 255);

  return dst.round();
});
RGBA.prototype.toRGB = function() {
  const ctor = this.constructor[Symbol.species];
  const { r, g, b } = this;
  return new ctor(r, g, b, 255);
};
RGBA.prototype.toBGRA = function() {
  const { r, g, b, a } = this;
  return [b, g, r, a];
};
RGBA.prototype.toHSLA = function() {
  let { r, g, b, a } = this;
  r /= 255;
  g /= 255;
  b /= 255;
  a /= 255;
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h;
  let s;
  let l = (max + min) / 2;
  if(max == min) {
    h = s = 0; //achromatic
  } else {
    let d = max - min;
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

  //console.log("RGBA.toHSLA ", { h, s, l, a });

  return { h: Math.round(h), s: roundTo(s, 100 / 255), l: roundTo(l, 100 / 255), a: roundTo(a, 1 / 255) };
};

RGBA.prototype.toCMYK = function() {
  let res = {};
  let { r, g, b } = RGBA.prototype.normalize.call(this, 255);

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

RGBA.prototype.toLAB = function() {
  let { r, g, b } = RGBA.prototype.normalize.call(this, 255);
  let x, y, z;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return { l: 116 * y - 16, A: 500 * (x - y), B: 200 * (y - z), a: this.a };
};
RGBA.fromLAB = function(lab) {
  let y = (lab.l + 16) / 116,
    x = lab.A / 500 + y,
    z = y - lab.B / 200,
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

  return new this(Math.round(Math.max(0, Math.min(1, r)) * 255), Math.round(Math.max(0, Math.min(1, g)) * 255), Math.round(Math.max(0, Math.min(1, b)) * 255), lab.a || 255);
  return this;
};

RGBA.prototype.linear = function() {
  let { r, g, b } = RGBA.prototype.normalize.call(this, 255);

  //apply gamma
  let gamma = 2.2;
  r = Math.pow(r, gamma); //linearize red
  g = Math.pow(g, gamma); //linearize green
  b = Math.pow(b, gamma); //linearize blue
  return { r, g, b };
};

RGBA.prototype.luminance = function() {
  let lin = RGBA.prototype.linear.call(this);
  let Y = 0.2126 * lin.r; //red channel
  Y = Y + 0.7152 * lin.g; //green channel
  Y = Y + 0.0722 * lin.b; //blue channel
  return Y;
};
RGBA.prototype.invert = function() {
  const { r, g, b, a } = RGBA.clamp(this);
  return new RGBA(255 - r, 255 - g, 255 - b, a);
};
RGBA.prototype.blackwhite = function(a = this.a) {
  return this.luminanace() >= 0.558 ? new RGBA(255, 255, 255, a) : new RGBA(0, 0, 0, a);
};
RGBA.prototype.distance = function(other) {
  return Math.sqrt(Math.pow(other.r - this.r, 2) + Math.pow(other.g - this.g, 2) + Math.pow(other.b - this.b, 2)) / 441.67295593006370984949;
};
RGBA.prototype.luminanace = function() {
  const { r, g, b } = RGBA.prototype.normalize.call(this, 255);
  let a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};
RGBA.prototype.contrast = function contrast(other) {
  let lum1 = this.luminanace();
  let lum2 = RGBA.prototype.luminanace.call(other);
  let brightest = Math.max(lum1, lum2);
  let darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};
RGBA.prototype.toConsole = function(fn = 'toString', css = []) {
  const textColor = this.invert().blackwhite();
  const bgColor = textColor.invert();
  if(typeof fn == 'string' && fn in this) {
    let method = fn;
    fn = () => this[method]();
  } else if(typeof fn == 'function') {
    let method = fn;
    fn = () => method.call(this, this);
  }
  let text = fn();
  let style = [`text-shadow: 1px 1px 1px ${bgColor.hex()}`, `border: 1px solid black`, `padding: 2px`, `background-color: ${this.hex()}`, `color: ${textColor}`, `background-color: none`, ...css];
  return [`%c${text}%c`, style.join(';'), `color: inherit; background-color: inherit;`];
};
RGBA.prototype.dump = function(...args) {
  console.log(...this.toConsole(...args));
};

RGBA.prototype.equals = function(other) {
  const { r, g, b, a } = this;
  return r == other.r && g == other.g && b == other.b && a == other.a;
};
RGBA.prototype.toObject = function() {
  const { r, g, b, a } = RGBA.clamp(this);
  return { r, g, b, a };
};
RGBA.prototype.toArray = function() {
  return Uint8Array.from(this);
};
RGBA.prototype.toAnsi = function(background = false) {
  const { r, g, b } = this;

  return `\u001b[${background ? 48 : 38};2;${[r, g, b].join(';')}m  `;
};
RGBA.fromAnsi256 = function(n) {
  let r, g, b;
  let c;
  if(n < 16) {
    r = n & 1;
    n >>= 1;
    g = n & 1;
    n >>= 1;
    b = n & 1;
    n >>= 1;
    c = [r, g, b].map(v => [n & 1 ? 85 : 0, n & 1 ? 255 : 170][v]);
  } else if(n >= 16 && n < 232) {
    n -= 16;
    b = n % 6;
    n /= 6;
    g = n % 6;
    n /= 6;
    r = n % 6;
    c = [r, g, b].map(n => (n * 255) / 5);
  } else if(n >= 232) {
    n -= 231;
    r = g = b = (n * 255) / (255 - 231);
    c = [r, g, b];
  }
  if(c) {
    c = c.map(Math.round);
    c = c.map(n => Math.min(255, n));
    return new RGBA(...c);
  }
};
RGBA.nearestColor = (color, palette, distFn = (a, b) => Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2))) => {
  if(!(color instanceof RGBA)) color = new RGBA(color);
  //console.log("RGBA.nearestColor", color.hex(),className(color),className(palette));
  if(!color) return null;
  let dist,
    minDist = Infinity,
    rgb,
    v,
    vi;
  palette || (palette = RGBA.palette16);
  for(let i = 0; i < palette.length; ++i) {
    rgb = palette[i];
    dist = distFn(color, rgb);
    if(dist < minDist) {
      minDist = dist;
      v = palette[i];
      vi = i;
    }
  }
  if(v) {
    return {
      value: v,
      index: vi,
      distance: minDist
    };
  }
  return v;
};
RGBA.prototype.toAnsi256 = function(background = false) {
  const { r, g, b } = this;
  const { index, distance } = RGBA.nearestColor(this, RGBA.palette16);
  if(distance == 0) {
    let bold = index & 0x08 ? 1 : 0;
    let num = (index & 0x07) + (background ? 40 : 30);

    return `\x1b[${bold};${num}m`;
  }
  const fromRGB = (r, g, b) => {
    if(r === g && g === b) {
      if(r < 8) return 16;

      if(r > 248) return 231;
      return Math.round(((r - 8) / 247) * 24) + 232;
    }
    return 16 + 36 * Math.round((r / 255) * 5) + 6 * Math.round((g / 255) * 5) + Math.round((b / 255) * 5);
  };
  let value = fromRGB(r, g, b);
  const toString = (background = false) => `\x1b[${background ? 48 : 38};5;${value}m`;
  let ret = toString(background);
  //ret.value = value;
  return ret;
};

RGBA.prototype[Symbol.iterator] = function* () {
  const { r, g, b, a } = this;
  yield* [r, g, b, a][Symbol.iterator]();
};

RGBA.prototype[Symbol.for('quickjs.inspect.custom')] = function() {
  const { r, g, b, a } = this;
  let arr = a !== undefined && a != 255 ? [r, g, b, a] : [r, g, b];
  let ret = arr
    .map(toHex) /*.map(n => (n + '').padStart(3, ' '))*/
    .join(',');
  const color = this.toAnsi(/*256*/ true);
  const l = this.toHSLA().l;
  let s = '';

  s += arr.map(n => `\x1b[0;33m${toHex(n)}\x1b[0m`).join('');
  s = color + s;

  return `\x1b[1;31mRGBA\x1b[1;36m` + `(${ret})`.padEnd(18, ' ') + ` ${color}    \x1b[0m`;
};

define(RGBA, {
  get palette16() {
    //const clamp = clamp(0, 255);
    // /* prettier-ignore */ const a = [[0, 0, 0], [2, 0, 0], [0, 2, 0], [2, 2, 0], [0, 0, 2], [2, 0, 2], [0, 2, 2], [3, 3, 3], [2, 2, 2], [4, 0, 0], [0, 4, 0], [4, 4, 0], [0, 0, 4], [4, 0, 4], [0, 4, 4], [4, 4, 4] ];
    // /* prettier-ignore */ const b = [[1, 1, 1], [4, 0, 0], [2, 3, 1], [4, 3, 0], [1, 2, 3], [2, 2, 2], [1, 3, 3], [4, 4, 4], [2, 2, 2], [4, 1, 1], [3, 4, 1], [4, 4, 2], [2, 3, 4], [3, 2, 3], [1, 4, 4], [4, 4, 4] ];
    //return b.map(c => new RGBA(c.map(n => Math.round(clamp(n * 64)))));
    return this.palette256.slice(0, 16);
  },
  get palette256() {
    /* prettier-ignore */ return [0x000000, 0xaa0000, 0x00aa00, 0xaaaa00, 0x0000aa, 0xaa00aa, 0x00aaaa, 0xaaaaaa, 0x555555, 0xff5555, 0x55ff55, 0xffff55, 0x5555ff, 0xff55ff, 0x55ffff, 0xffffff, 0x000000, 0x010933, 0x031166, 0x041a99, 0x0622cc, 0x072bff, 0x093300, 0x0a3c33, 0x0b4466, 0x0d4d99, 0x0e55cc, 0x105eff, 0x116600, 0x126f33, 0x147766, 0x158099, 0x1788cc, 0x1891ff, 0x1a9900, 0x1ba233, 0x1caa66, 0x1eb399, 0x1fbbcc, 0x21c4ff, 0x22cc00, 0x23d533, 0x25dd66, 0x26e699, 0x28eecc, 0x29f7ff, 0x2bff00, 0x2cff33, 0x2dff66, 0x2fff99, 0x30ffcc, 0x32ffff, 0x330000, 0x340933, 0x361166, 0x371a99, 0x3922cc, 0x3a2aff, 0x3c3300, 0x3d3c33, 0x3e4466, 0x404d99, 0x4155cc, 0x435dff, 0x446600, 0x456e33, 0x477766, 0x488099, 0x4a88cc, 0x4b91ff, 0x4d9900, 0x4ea133, 0x4faa66, 0x51b399, 0x52bbcc, 0x54c4ff, 0x55cc00, 0x56d433, 0x58dd66, 0x59e699, 0x5beecc, 0x5cf7ff, 0x5eff00, 0x5fff33, 0x60ff66, 0x62ff99, 0x63ffcc, 0x65ffff, 0x660000, 0x670833, 0x691166, 0x6a1a99, 0x6c22cc, 0x6d2bff, 0x6f3300, 0x703b33, 0x714466, 0x734d99, 0x7455cc, 0x765eff, 0x776600, 0x786e33, 0x7a7766, 0x7b8099, 0x7d88cc, 0x7e91ff, 0x809900, 0x81a133, 0x82aa66, 0x84b399, 0x85bbcc, 0x87c4ff, 0x88cc00, 0x89d533, 0x8bdd66, 0x8ce699, 0x8eeecc, 0x8ff6ff, 0x91ff00, 0x92ff33, 0x93ff66, 0x95ff99, 0x96ffcc, 0x98ffff, 0x990000, 0x9a0933, 0x9c1166, 0x9d1a99, 0x9f22cc, 0xa02aff, 0xa23300, 0xa33c33, 0xa44466, 0xa64d99, 0xa755cc, 0xa95dff, 0xaa6600, 0xab6f33, 0xad7766, 0xae8099, 0xb088cc, 0xb190ff, 0xb39900, 0xb4a233, 0xb5aa66, 0xb7b399, 0xb8bbcc, 0xbac3ff, 0xbbcc00, 0xbcd533, 0xbedd66, 0xbfe699, 0xc1eecc, 0xc2f6ff, 0xc4ff00, 0xc5ff33, 0xc6ff66, 0xc8ff99, 0xc9ffcc, 0xcbffff, 0xcc0000, 0xcd0933, 0xcf1166, 0xd01a99, 0xd222cc, 0xd32aff, 0xd53300, 0xd63c33, 0xd74466, 0xd94d99, 0xda55cc, 0xdc5dff, 0xdd6600, 0xde6f33, 0xe07766, 0xe18099, 0xe388cc, 0xe490ff, 0xe69900, 0xe7a233, 0xe8aa66, 0xeab399, 0xebbbcc, 0xedc3ff, 0xeecc00, 0xefd533, 0xf1dd66, 0xf2e699, 0xf4eecc, 0xf5f6ff, 0xf7ff00, 0xf8ff33, 0xf9ff66, 0xfbff99, 0xfcffcc, 0xfeffff, 0xff0000, 0xff0933, 0xff1166, 0xff1a99, 0xff22cc, 0xff2aff, 0xff3300, 0xff3c33, 0xff4466, 0xff4d99, 0xff55cc, 0xff5dff, 0xff6600, 0xff6e33, 0xff7766, 0xff8099, 0xff88cc, 0xff91ff, 0xff9900, 0xffa133, 0xffaa66, 0xffb399, 0xffbbcc, 0xffc4ff, 0xffcc00, 0xffd433, 0xffdd66, 0xffe699, 0xffeecc, 0xfff7ff, 0xffff00, 0xffff33, 0xffff66, 0xffff99, 0xffffcc, 0xffffff, 0x0b0b0b, 0x151515, 0x202020, 0x2b2b2b, 0x353535, 0x404040, 0x4a4a4a, 0x555555, 0x606060, 0x6a6a6a, 0x757575, 0x808080, 0x8a8a8a, 0x959595, 0x9f9f9f, 0xaaaaaa, 0xb5b5b5, 0xbfbfbf, 0xcacaca, 0xd5d5d5, 0xdfdfdf, 0xeaeaea, 0xf4f4f4, 0xffffff].map(n => new RGBA(n|0xff000000, RGBA.order.ARGB));
  }
});

RGBA.random = function(r = [0, 255], g = [0, 255], b = [0, 255], a = [255, 255], rng = Math.random) {
  return new RGBA(randInt(...r, rng), randInt(...g, rng), randInt(...b, rng), randInt(...a, rng));
};

for(let name of ['hex', 'toRGB', 'round', 'toHSLA', 'toCMYK', 'toLAB', 'linear', 'luminance', 'distance']) {
  RGBA[name] = (...args) => RGBA.prototype[name].call(...args);
}

/*
for(let name of ['fromLAB']) {
  RGBA[name] = arg => {
    let ret = new RGBA();
    return RGBA.prototype[name].call(ret, arg);
  };
}*/

defineGetter(RGBA, Symbol.species, function() {
  return this;
});
export const ImmutableRGBA = immutableClass(RGBA);
defineGetter(ImmutableRGBA, Symbol.species, () => ImmutableRGBA);

export default RGBA;
