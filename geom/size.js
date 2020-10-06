import Util from '../util.js';
import { isPoint } from './point.js';

export function Size(arg) {
  let obj = this instanceof Size ? this : {};
  let args = [...arguments];
  if(args.length == 1 && Util.isObject(args[0]) && args[0].length !== undefined) {
    args = args[0];
    arg = args[0];
  }
  if(typeof arg == 'object') {
    if(arg.width !== undefined || arg.height !== undefined) {
      arg = args.shift();
      obj.width = arg.width;
      obj.height = arg.height;
    } else if(arg.x2 !== undefined && arg.y2 !== undefined) {
      arg = args.shift();
      obj.width = arg.x2 - arg.x;
      obj.height = arg.y2 - arg.y;
    } else if(arg.bottom !== undefined && arg.right !== undefined) {
      arg = args.shift();
      obj.width = arg.right - arg.left;
      obj.height = arg.bottom - arg.top;
    }
  } else {
    while(typeof arg == 'object' && (arg instanceof Array || 'length' in arg)) {
      args = [...arg];
      arg = args[0];
    }
    if(args && args.length >= 2) {
      let w = args.shift();
      let h = args.shift();
      if(typeof w == 'object' && 'baseVal' in w) w = w.baseVal.value;
      if(typeof h == 'object' && 'baseVal' in h) h = h.baseVal.value;
      obj.width = typeof w == 'number' ? w : parseFloat(w.replace(/[^-.0-9]*$/, ''));
      obj.height = typeof h == 'number' ? h : parseFloat(h.replace(/[^-.0-9]*$/, ''));
      Object.defineProperty(obj, 'units', {
        value: {
          width: typeof w == 'number' ? 'px' : w.replace(obj.width.toString(), ''),
          height: typeof h == 'number' ? 'px' : h.replace(obj.height.toString(), '')
        },
        enumerable: false
      });
    }
  }
  if(isNaN(obj.width)) obj.width = undefined;
  if(isNaN(obj.height)) obj.height = undefined;
  if(!(obj instanceof Size)) return obj;
}
const getArgs = args =>
  /*console.debug('getArgs', ...args), */ typeof args[0] == 'number' ? [{ width: args[0], height: args[1] }] : args;

Size.prototype.width = NaN;
Size.prototype.height = NaN;
Size.prototype.units = null;

Size.prototype.convertUnits = function(w = 'window' in global ? window : null) {
  if(w === null) return this;
  const view = {
    vw: w.innerWidth,
    vh: w.innerHeight,
    vmin: w.innerWidth < w.innerHeight ? w.innerWidth : w.innerHeight,
    vmax: w.innerWidth > w.innerHeight ? w.innerWidth : w.innerHeight
  };
  if(view[this.units.width] !== undefined) {
    this.width = (this.width / 100) * view[this.units.width];
    delete this.units.width;
  }
  if(view[this.units.height] !== undefined) {
    this.height = (this.height / 100) * view[this.units.height];
    delete this.units.height;
  }
  return size;
};

Size.prototype.aspect = function() {
  return this.width / this.height;
};
Size.prototype.toCSS = function(units) {
  let ret = {};
  units =
    typeof units == 'string' ? { width: units, height: units } : units || this.units || { width: 'px', height: 'px' };
  if(this.width !== undefined) ret.width = this.width + (units.width || 'px');
  if(this.height !== undefined) ret.height = this.height + (units.height || 'px');
  return ret;
};
Size.prototype.transform = function(m) {
  this.width = m.xx * this.width + m.yx * this.height;
  this.height = m.xy * this.width + m.yy * this.height;
  return this;
};
Size.prototype.isSquare = function() {
  return Math.abs(this.width - this.height) < 1;
};
Size.prototype.area = function() {
  return this.width * this.height;
};
Size.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;
  return this;
};
Size.prototype.equals = function(other) {
  let { width, height } = this;
  return +width == +other.width && +height == +other.height;
};
Size.prototype.sum = function(other) {
  return new Size(this.width + other.width, this.height + other.height);
};
Size.prototype.add = function(...args) {
  for(let other of getArgs(args)) {
    this.width += other.width;
    this.height += other.height;
  }
  return this;
};
Size.prototype.diff = function(other) {
  return new Size(this.width - other.width, this.height - other.height);
};
Size.prototype.sub = function(...args) {
  for(let other of getArgs(args)) {
    this.width -= other.width;
    this.height -= other.height;
  }
  return this;
};
Size.prototype.clone = function(__proto__ = Size.prototype) {
  const { width, height } = this;
  // return new Size(width, height); // { width,height, __proto__ };
  return Object.setPrototypeOf({ width, height }, __proto__);
};
Size.prototype.prod = function(...args) {
  return Size.prototype.clone.call(this).mul(...args);
};
Size.prototype.mul = function(...args) {
  for(let f of getArgs(args)) {
    const o = isSize(f) ? f : isPoint(f) ? { width: f.x, height: f.y } : { width: f, height: f };
    this.width *= o.width;
    this.height *= o.height;
  }
  return this;
};
Size.prototype.quot = function(other) {
  return new Size(this.width / other.width, this.height / other.height);
};
Size.prototype.inverse = function(other) {
  return new Size(1 / this.width, 1 / this.height);
};
Size.prototype.div = function(...args) {
  for(let f of getArgs(args)) {
    this.width /= f;
    this.height /= f;
  }
  return this;
};
Size.prototype.round = function(precision = 1, digits, type) {
  let { width, height } = this;
  this.width = Util.roundTo(width, precision, digits, type);
  this.height = Util.roundTo(height, precision, digits, type);
  return this;
};
Size.prototype.bounds = function(other) {
  let w = [Math.min(this.width, other.width), Math.max(this.width, other.width)];
  let h = [Math.min(this.height, other.height), Math.max(this.height, other.height)];

  let scale = h / this.height;
  this.mul(scale);
  return this;
};

Size.prototype.fit = function(size) {
  size = new Size(size);
  let factors = Size.prototype.fitFactors.call(this, size);
  let ret = [Size.prototype.prod.call(this, factors[0]), Size.prototype.prod.call(this, factors[1])];
  return ret;
};

Size.prototype.fitHeight = function(other) {
  other = new Size(other);
  let scale = other.height / this.height;
  this.mul(scale);
  return [this.width, other.width];
};
Size.prototype.fitWidth = function(other) {
  other = new Size(other);
  let scale = other.width / this.width;
  this.mul(scale);
  return [this.height, other.height];
};
Size.prototype.fitFactors = function(other) {
  const hf = other.width / this.width;
  const vf = other.height / this.height;
  return [hf, vf];
};
Size.prototype.toString = function(opts = {}) {
  const { unit = '', separator = ' \u2715 ', left = '', right = '' } = opts;
  const { width, height, units = { width: unit, height: unit } } = this;
  return `${left}${width}${unit || units.width || ''}${separator}${height}${unit || units.height || ''}${right}`;
};

/*Size.prototype[Symbol.iterator] = function() {
    let [width,height]= this;
    return [width,height][Symbol.iterator]();
  }*/
Size.fromString = str => {
  const matches = [...Util.matchAll(/[-.\d]+/g, str)];
  return new Size(...matches.map(m => +m[0]));
};
Size.prototype.toObject = function() {
  const { width, height } = this;
  return { width, height };
};
Size.area = sz => Size.prototype.area.call(sz);
Size.aspect = sz => Size.prototype.aspect.call(sz);

Size.bind = (...args) => {
  const o = args[0] instanceof Size ? args.shift() : new Size();
  const gen = Util.isFunction(args[args.length - 1]) && args.pop();
  const p = args.length > 1 ? args.pop() : ['width', 'height'];
  const t = args.pop();
  gen = gen || (k => v => (v === undefined ? t[k] : (t[k] = v)));

  // const [  p = ['width', 'height']  ] = args[0] instanceof Size ? args : [new Size(), ...args];
  console.debug('Size.bind', { args, o, t, p, gen });
  const { width, height } = Util.isArray(p) ? p.reduce((acc, name) => ({ ...acc, [name]: name }), {}) : p;
  return Util.bindProperties(new Size(0, 0), t, { width, height }, gen);
};

for(let method of Util.getMethodNames(Size.prototype))
  if(method != 'toString')
    Size[method] = (size, ...args) => Size.prototype[method].call(size || new Size(size), ...args);

export const isSize = o =>
  o &&
  ((o.width !== undefined && o.height !== undefined) ||
    (o.x !== undefined && o.x2 !== undefined && o.y !== undefined && o.y2 !== undefined) ||
    (o.left !== undefined && o.right !== undefined && o.top !== undefined && o.bottom !== undefined));

for(let name of ['toCSS', 'isSquare', 'round', 'sum', 'add', 'diff', 'sub', 'prod', 'mul', 'quot', 'div']) {
  Size[name] = (size, ...args) => Size.prototype[name].call(size || new Size(size), ...args);
}

Util.defineGetter(Size, Symbol.species, function() {
  return this;
});

export const ImmutableSize = Util.immutableClass(Size);
Util.defineGetter(ImmutableSize, Symbol.species, () => ImmutableSize);
