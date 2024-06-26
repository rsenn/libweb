import { bindProperties, define, defineGetter, getMethodNames, immutableClass, isObject, keys, matchAll, roundTo } from '../misc.js';
import { isPoint } from './point.js';

export function Size(...args) {
  let arg,
    obj = this instanceof Size ? this : {};
  if(args.length == 1 && isObject(args[0]) && args[0].length !== undefined) args = args[0];

  arg = args[0];

  if(typeof arg == 'object') {
    if(arg.width !== undefined || arg.height !== undefined) {
      arg = args[0];
      obj.width = arg.width;
      obj.height = arg.height;
    } else if(arg.x2 !== undefined && arg.y2 !== undefined) {
      arg = args[0];
      obj.width = arg.x2 - arg.x;
      obj.height = arg.y2 - arg.y;
    } else if(arg.bottom !== undefined && arg.right !== undefined) {
      arg = args[0];
      obj.width = arg.right - arg.left;
      obj.height = arg.bottom - arg.top;
    }
  } else {
    while(typeof arg == 'object' && (arg instanceof Array || 'length' in arg)) {
      args = [...arg];
      arg = args[0];
    }
    if(args && args.length >= 2) {
      let [w, h] = args;
      if(typeof w == 'object' && 'baseVal' in w) w = w.baseVal.value;
      if(typeof h == 'object' && 'baseVal' in h) h = h.baseVal.value;
      obj.width = typeof w == 'string' ? parseFloat(w.replace(/[^-.0-9]*$/, '')) : Number(w);
      obj.height = typeof h == 'string' ? parseFloat(h.replace(/[^-.0-9]*$/, '')) : Number(h);
      Object.defineProperty(obj, 'units', {
        value: {
          width: typeof w == 'string' ? w.replace(obj.width.toString(), '') : 'px',
          height: typeof h == 'string' ? h.replace(obj.height.toString(), '') : 'px'
        },
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
  }
  //console.log('Size.constructor', { args, obj, units: obj.units });
  if(isNaN(obj.width) || isNaN(obj.height)) throw new Error(`NaN`);
  if(isNaN(obj.width)) obj.width = undefined;
  if(isNaN(obj.height)) obj.height = undefined;
  if(!(obj instanceof Size)) return obj;
}

Size.getOther = args => (/*console.debug('getOther', ...args), */ typeof args[0] == 'number' ? [{ width: args[0], height: typeof args[1] == 'number' ? args[1] : args[0] }] : args);

/*Size.prototype.width = NaN;
Size.prototype.height = NaN;*/
Size.prototype.units = null;
Size.prototype[Symbol.toStringTag] = 'Size';

Size.prototype.convertUnits = function(w = 'window' in globalThis ? window : null) {
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
  units = typeof units == 'string' ? { width: units, height: units } : units || this.units || { width: 'px', height: 'px' };
  if(this.width !== undefined) ret.width = this.width + (units.width || 'px');
  if(this.height !== undefined) ret.height = this.height + (units.height || 'px');
  return ret;
};
Size.prototype.transform = function(m) {
  const [xx, xy, , yx, yy] = m;
  const { width, height } = this;

  //console.log("Size.transform", { width, height, xx, xy, yx, yy});
  this.width = xx * width + xy * height;
  this.height = yx * width + yy * height;
  if(round) Size.prototype.round.call(this, 1e-13, 13);
  return this;
};
Size.prototype.isSquare = function() {
  return Math.abs(this.width - this.height) < 1;
};
Size.prototype.isNull = function() {
  return this.width == 0 && this.height == 0;
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
  for(let other of Size.getOther(args)) {
    this.width += other.width;
    this.height += other.height;
  }
  return this;
};
Size.prototype.diff = function(other) {
  return new Size(this.width - other.width, this.height - other.height);
};
Size.prototype.sub = function(...args) {
  for(let other of Size.getOther(args)) {
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
  for(let f of Size.getOther(args)) {
    const o = isSize(f) ? f : isPoint(f) ? { width: f.x, height: f.y } : { width: f, height: f };
    this.width *= o.width;
    this.height *= o.height;
  }
  return this;
};
Size.prototype.quot = function(other) {
  if(typeof other == 'number') return new Size(this.width / other, this.height / other);

  return new Size(this.width / other.width, this.height / other.height);
};
Size.prototype.inverse = function(other) {
  return new Size(1 / this.width, 1 / this.height);
};
Size.prototype.div = function(...args) {
  let other = Size.getOther(args);
  for(let f of other) {
    this.width /= f.width;
    this.height /= f.height;
  }
  return this;
};
Size.prototype.round = function(precision = 1, digits, type) {
  let { width, height } = this;
  this.width = roundTo(width, precision, digits, type);
  this.height = roundTo(height, precision, digits, type);
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
  return `${left}${width}${(isObject(units) && units.width) || unit}${separator}${height}${(isObject(units) && units.height) || unit}${right}`;
};
if(Symbol.inspect)
  Size.prototype[Symbol.inspect] = function(depth, options) {
    const { width, height } = this;
    return define({ width, height }, { [Symbol.toStringTag]: 'Size' });
  };
Size.prototype[Symbol.iterator] = function* () {
  const { width, height } = this;
  yield width;
  yield height;
};
Size.fromString = str => {
  const matches = [...str.matchAll(/[-.\d]+/g)];
  return new Size(...matches.map(m => +m[0]));
};
Size.prototype.toObject = function(useUnit = false) {
  if(useUnit) {
    return { width: this.width + this.units.width, height: this.height + this.units.height };
  }
  const { width, height } = this;
  return { width, height };
};
Size.area = sz => Size.prototype.area.call(sz);
Size.aspect = sz => Size.prototype.aspect.call(sz);

Size.bind = (o, keys, g) => {
  keys ??= ['width', 'width'];
  o ??= new Size();
  g ??= k => value => value !== undefined ? (o[k] = value) : o[k];

  const { width, height } = Array.isArray(keys) ? keys.reduce((acc, name, i) => ({ ...acc, [keys[i]]: name }), {}) : keys;
  //console.debug('Size.bind', { keys, o, p, x, y });
  //
  return Object.setPrototypeOf(bindProperties({}, o, { width, height }), Size.prototype);
};

for(let method of getMethodNames(Size.prototype)) if(method != 'toString') Size[method] = (size, ...args) => Size.prototype[method].call(size || new Size(size), ...args);

export const isSize = o =>
  o &&
  ((o.width !== undefined && o.height !== undefined) ||
    (o.x !== undefined && o.x2 !== undefined && o.y !== undefined && o.y2 !== undefined) ||
    (o.left !== undefined && o.right !== undefined && o.top !== undefined && o.bottom !== undefined));

for(let name of ['toCSS', 'isSquare', 'round', 'sum', 'add', 'diff', 'sub', 'prod', 'mul', 'quot', 'div']) {
  Size[name] = (size, ...args) => Size.prototype[name].call(size || new Size(size), ...args);
}

defineGetter(Size, Symbol.species, function() {
  return this;
});

export const ImmutableSize = immutableClass(Size);
defineGetter(ImmutableSize, Symbol.species, () => ImmutableSize);
