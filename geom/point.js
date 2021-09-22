import Util from '../util.js';
const SymSpecies = Util.tryCatch(
  () => Symbol,
  sym => sym.species
);
const CTOR = obj => {
  if(obj[SymSpecies]) return obj[SymSpecies];
  let p = Object.getPrototypeOf(obj);
  if(p[SymSpecies]) return p[SymSpecies];
  return p.constructor;
};

export function Point(...args) {
  let isNew = this instanceof Point;
  args = args[0] instanceof Array ? args.shift() : args;
  let p = isNew ? this : new Point(...args);
  let arg = args.shift();

  if(!new.target) if (arg instanceof Point) return arg;

  if(typeof arg === 'undefined') {
    p.x = arg;
    p.y = args.shift();
  } else if(typeof arg === 'number') {
    p.x = parseFloat(arg);
    p.y = parseFloat(args.shift());
  } else if(typeof arg === 'string') {
    const matches = [...arg.matchAll(/([-+]?d*.?d+)(?:[eE]([-+]?d+))?/g)];

    p.x = parseFloat(matches[0]);
    p.y = parseFloat(matches[1]);
  } else if(typeof arg == 'object' && arg !== null && (arg.x !== undefined || arg.y !== undefined)) {
    p.x = arg.x;
    p.y = arg.y;
  } else if(typeof arg == 'object' && arg !== null && arg.length > 0 && x !== undefined && y !== undefined) {
    p.x = parseFloat(arg.shift());
    p.y = parseFloat(arg.shift());
  } else if(typeof args[0] === 'number' && typeof args[1] === 'number') {
    p.x = args[0];
    p.y = args[1];
    args.shift(2);
  } else {
    p.x = 0;
    p.y = 0;
  }
  if(p.x === undefined) p.x = 0;
  if(p.y === undefined) p.y = 0;
  if(isNaN(p.x)) p.x = undefined;
  if(isNaN(p.y)) p.y = undefined;

  if(!isNew) {
    /* if(p.prototype == Object) p.prototype = Point.prototype;
    else Object.assign(p, Point.prototype);*/
    return p;
  }
}
const getOther = args => (console.debug('getOther', ...args), typeof args[0] == 'number' ? [{ x: args[0], y: args[1] }] : args);

Object.defineProperties(Point.prototype, {
  X: {
    get() {
      return this.x;
    }
  },
  Y: {
    get() {
      return this.y;
    }
  }
});

Point.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  return this;
};
Point.prototype.moveTo = function(x, y) {
  this.x = x;
  this.y = y;
  return this;
};
Point.prototype.clear = function(x, y) {
  this.x = 0;
  this.y = 0;
  return this;
};
Point.prototype.set = function(fn) {
  if(typeof fn != 'function') {
    Point.apply(this, [...arguments]);
    return this;
  }
  return fn(this.x, this.y);
};
Point.prototype.clone = function() {
  const ctor = this[Symbol.species] || this.constructor[Symbol.species];

  return new ctor({ x: this.x, y: this.y });
};
Point.prototype.sum = function(...args) {
  const p = new Point(...args);
  let r = new Point(this.x, this.y);
  r.x += p.x;
  r.y += p.y;
  return r;
};
Point.prototype.add = function(...args) {
  const other = new Point(...args);
  this.x += other.x;
  this.y += other.y;
  return this;
};
Point.prototype.diff = function(arg) {
  let { x, y } = this;
  let fn = function(other) {
    let r = new Point(x, y);
    return r.sub(other);
  };
  if(arg) return fn(arg);
  return fn;
};
Point.prototype.sub = function(...args) {
  const other = new Point(...args);
  this.x -= other.x;
  this.y -= other.y;
  return this;
};
Point.prototype.prod = function(f) {
  const o = isPoint(f) ? f : { x: f, y: f };
  return new Point(this.x * o.x, this.y * o.y);
};
Point.prototype.mul = function(f) {
  const o = isPoint(f) ? f : { x: f, y: f };
  this.x *= o.x;
  this.y *= o.y;
  return this;
};
Point.prototype.quot = function(other) {
  other = isPoint(other) ? other : { x: other, y: other };
  return new Point(this.x / other.x, this.y / other.y);
};
Point.prototype.div = function(other) {
  other = isPoint(other) ? other : { x: other, y: other };
  this.x /= other.x;
  this.y /= other.y;
  return this;
};
Point.prototype.comp = function() {
  return new Point({ x: -this.x, y: -this.y });
};
Point.prototype.neg = function() {
  this.x *= -1;
  this.y *= -1;
  return this;
};
Point.prototype.distanceSquared = function(other = { x: 0, y: 0 }) {
  return (other.y - this.y) * (other.y - this.y) + (other.x - this.x) * (other.x - this.x);
};
Point.prototype.distance = function(other = { x: 0, y: 0 }) {
  return Math.sqrt(Point.prototype.distanceSquared.call(this, Point(other)));
};
Point.prototype.equals = function(other) {
  let { x, y } = this;
  return +x == +other.x && +y == +other.y;
};
Point.prototype.round = function(precision = 0.001, digits, type) {
  let { x, y } = this;
  digits = digits || Util.roundDigits(precision);
  type = type || 'round';
  this.x = Util.roundTo(x, precision, digits, type);
  this.y = Util.roundTo(y, precision, digits, type);
  return this;
};
Point.prototype.ceil = function() {
  let { x, y } = this;
  this.x = Math.ceil(x);
  this.y = Math.ceil(y);
  return this;
};
Point.prototype.floor = function() {
  let { x, y } = this;
  this.x = Math.floor(x);
  this.y = Math.floor(y);
  return this;
};

Point.prototype.dot = function(other) {
  return this.x * other.x + this.y * other.y;
};

Point.prototype.values = function() {
  return [this.x, this.y];
};
Point.prototype.fromAngle = function(angle, dist = 1.0) {
  this.x = Math.cos(angle) * dist;
  this.y = Math.sin(angle) * dist;
  return this;
};
Point.prototype.toAngle = function(deg = false) {
  return Math.atan2(this.x, this.y) * (deg ? 180 / Math.PI : 1);
};
Point.prototype.angle = function(other, deg = false) {
  other = other || { x: 0, y: 0 };
  return Point.prototype.diff.call(this, other).toAngle(deg);
};
Point.prototype.rotate = function(angle, origin = { x: 0, y: 0 }) {
  this.x -= origin.x;
  this.y -= origin.y;
  let c = Math.cos(angle),
    s = Math.sin(angle);
  let xnew = this.x * c - this.y * s;
  let ynew = this.x * s + this.y * c;
  this.x = xnew;
  this.y = ynew;
  return this;
};
Util.defineGetter(Point.prototype, Symbol.iterator, function() {
  const { x, y } = this;
  let a = [x, y];
  return a[Symbol.iterator].bind(a);
});

/*Point.prototype.valueOf = function(shl = 16) {
  const { x, y } = this;
  return x | (y << shl);
};
*/ Point.prototype.toString = function(opts = {}) {
  const { precision = 0.001, unit = '', separator = ',', left = '', right = '', pad = 0 } = opts;
  let x = Util.roundTo(this.x, precision);
  let y = Util.roundTo(this.y, precision);
  if(pad > 0) {
    x = x + '';
    y = y + '';
    if(y[0] != '-') y = ' ' + y;
    if(x[0] != '-') x = ' ' + x;
  }
  //console.debug("toString", {x,y}, {pad});
  return `${left}${(x + '').padStart(pad, ' ')}${unit}${separator}${(y + '').padEnd(pad, ' ')}${unit}${right}`;
};
Point.prototype[Symbol.toStringTag] = 'Point';
Point.prototype.toSource = function(opts = {}) {
  const { asArray = false, plainObj = false, pad = a => a /*a.padStart(4, ' ')*/, showNew = true } = opts;
  let x = pad(this.x + '');
  let y = pad(this.y + '');
  let c = t => t;
  if(typeof this != 'object' || this === null) return '';
  if(asArray) return `[${x},${y}]`;
  if(plainObj) return `{x:${x},y:${y}}`;

  return `${c(showNew ? 'new ' : '', 1, 31)}${c('Point', 1, 33)}${c('(', 1, 36)}${c(x, 1, 32)}${c(',', 1, 36)}${c(y, 1, 32)}${c(')', 1, 36)}`;
};

/*Point.prototype.toSource = function() {
  return '{x:' + this.x + ',y:' + this.y + '}';
};*/
Point.prototype.toObject = function(proto = Point.prototype) {
  const { x, y } = this;
  const obj = { x, y };
  Object.setPrototypeOf(obj, proto);
  return obj;
};
Point.prototype.toCSS = function(precision = 0.001, edges = ['left', 'top']) {
  return {
    [edges[0]]: Util.roundTo(this.x, precision) + 'px',
    [edges[1]]: Util.roundTo(this.y, precision) + 'px'
  };
};
Point.prototype.toFixed = function(digits) {
  return new Point(+this.x.toFixed(digits), +this.y.toFixed(digits));
};
Point.prototype.isNull = function() {
  return this.x == 0 && this.y == 0;
};
Point.prototype.inside = function(rect) {
  return this.x >= rect.x && this.x < rect.x + rect.width && this.y >= rect.y && this.y < rect.y + rect.height;
};
Point.prototype.transform = function(m, round = true) {
  if(Util.isObject(m) && typeof m.toMatrix == 'function') m = m.toMatrix();
  //if(Util.isObject(m) && typeof m.transform_point == 'function') return m.transform_point(this);

  const x = m[0] * this.x + m[1] * this.y + m[2];
  const y = m[3] * this.x + m[4] * this.y + m[5];

  this.x = x;
  this.y = y;
  if(round) Point.prototype.round.call(this, 1e-13, 13);

  return this;
};
Point.prototype.scaleTo = function(minmax) {
  return new Point({
    x: (this.x - minmax.x1) / (minmax.x2 - minmax.x1),
    y: (this.y - minmax.y1) / (minmax.y2 - minmax.y1)
  });
};
Point.prototype.normalize = function() {
  let d = Point.prototype.distance.call(this);
  return Point.prototype.div.call(this, { x: d, y: d });
};
Point.prototype.normal = function() {
  let d = Point.prototype.distance.call(this);
  return new Point({ x: this.x / d, y: this.y / d });
};

Point.fromString = str => new Point(...str.split(/[^-.0-9]+/g).map(n => +n));
Point.move = (point, x, y) => Point.prototype.move.call(point, x, y);
Point.angle = (point, other, deg = false) => Point.prototype.angle.call(point, other, deg);
Point.inside = (point, rect) => Point.prototype.inside.call(point, rect);
Point.sub = (point, other) => Point.prototype.sub.call(point, other);
Point.prod = (a, b) => Point.prototype.prod.call(a, b);
Point.quot = (a, b) => Point.prototype.quot.call(a, b);
Point.equals = (a, b) => Point.prototype.equals.call(a, b);
Point.round = (point, prec, digits, type) => Point.prototype.round.call(point, prec, digits, type);
Point.fromAngle = (angle, f) => new Point().fromAngle(angle, f);

for(let name of [
  'clone',
  'comp',
  'neg',
  'sides',
  'dimension',
  'toString',
  //'toSource',
  'toCSS',
  'sub',
  'diff',
  'add',
  'sum',
  'distance'
]) {
  Point[name] = (point, ...args) => Point.prototype[name].call(Point(point), ...args);
}
Point.interpolate = (p1, p2, a) => {
  a = Util.clamp(0, 1, a);
  return new Point(p1.x * (1.0 - a) + p2.x * a, p1.y * (1.0 - a) + p2.y * a);
};

Point.toSource = (point, { space = ' ', padding = ' ', separator = ',' }) => `{${padding}x:${space}${point.x}${separator}y:${space}${point.y}${padding}}`;

export const isPoint = o => o && ((o.x !== undefined && o.y !== undefined) || ((o.left !== undefined || o.right !== undefined) && (o.top !== undefined || o.bottom !== undefined)) || o instanceof Point || Object.getPrototypeOf(o).constructor === Point);

Point.isPoint = isPoint;

Point.prototype[Util.inspectSymbol] = function(depth, options) {
  const { x, y } = this;
  return /*Object.setPrototypeOf*/({ x, y }/*, Point.prototype*/);
};

Point.bind = (...args) => {
  const keys = ['x', 'y'];
  let [o, p] = args;
  if(p == null) p = keys;
  //console.debug('Point.bind', { keys, o, p });
  const { x, y } = (Util.isArray(p) && p.reduce((acc, name, i) => ({ ...acc, [keys[i]]: name }), {})) || p;
  return Object.setPrototypeOf(Util.bindProperties({}, o, { x, y }), Point.prototype);
};
export default Point;

Util.defineGetter(Point, Symbol.species, function() {
  return this;
});

export const ImmutablePoint = Util.immutableClass(Point);
Util.defineGetter(ImmutablePoint, Symbol.species, () => ImmutablePoint);
