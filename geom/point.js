import Util from "../util.js";

export function Point(arg) {
  let args = arg instanceof Array ? arg : [...arguments];
  let p = this instanceof Point ? this : null;
  arg = args.shift();

  if(p === null) {
    if(arg instanceof Point) return arg;
    p = {};
  }

  if(typeof arg === "undefined") {
    p.x = arg;
    p.y = args.shift();
  } else if(typeof arg === "number") {
    p.x = parseFloat(arg);
    p.y = parseFloat(args.shift());
  } else if(typeof arg === "string") {
    const matches = [...arg.matchAll(new RegExp("/([-+]?d*.?d+)(?:[eE]([-+]?d+))?/g"))];
    p.x = parseFloat(matches[0]);
    p.y = parseFloat(matches[1]);
  } else if(typeof arg == "object" && arg !== null && (arg.x !== undefined || arg.y !== undefined)) {
    p.x = arg.x;
    p.y = arg.y;
  } else if(typeof arg == "object" && arg !== null && arg.length > 0 && x !== undefined && y !== undefined) {
    p.x = parseFloat(arg.shift());
    p.y = parseFloat(arg.shift());
  } else if(typeof args[0] === "number" && typeof args[1] === "number") {
    p.x = args[0];
    p.y = args[1];
    args.shift(2);
  } else {
    p.x = 0;
    p.y = 0;
  }
  if(isNaN(p.x)) p.x = undefined;
  if(isNaN(p.y)) p.y = undefined;
  if(!this || this === Point) {
    if(p.prototype == Object) p.prototype = Point.prototype;
    else Object.assign(p, Point.prototype);
    return p;
  }
}
Point.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  return this;
};
Point.prototype.move_to = function(x, y) {
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
  if(typeof fn != "function") {
    Point.apply(this, [...arguments]);
    return this;
  }
  return fn(this.x, this.y);
};
Point.prototype.clone = function() {
  return new Point({ x: this.x, y: this.y });
};
Point.prototype.sum = function(...args) {
  const p = new Point(...args);
  return new Point(this.x + p.x, this.y + p.y);
};
Point.prototype.add = function(...args) {
  const other = new Point(...args);
  this.x += other.x;
  this.y += other.y;
  return this;
};
Point.prototype.diff = function(...args) {
  const other = Point(...args);
  return new Point(this.x - other.x, this.y - other.y);
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
Point.prototype.div = function(f) {
  this.x /= f;
  this.y /= f;
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
  return Math.sqrt(Point.prototype.distanceSquared.call(this, other));
};
Point.prototype.equals = function(other) {
  //console.log(`Point.equals ${this} ${other}`);
  return +this.x == +other.x && +this.y == +other.y;
};
Point.prototype.round = function(precision = 0.001) {
  let { x, y } = this;
  this.x = Util.roundTo(x, precision);
  this.y = Util.roundTo(y, precision);
  return this;
};
Point.prototype.sides = function() {
  return {
    top: this.y,
    right: this.x + this.w1idth,
    bottom: this.y + this.height,
    left: this.x
  };
};
Point.prototype.dot = function(other) {
  return this.x * other.x + this.y * other.y;
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
Point.prototype.dimension = function() {
  return [this.width, this.height];
};
Point.prototype.toString = function(opts = {}) {
  const { precision = 0.001, unit = "", separator = ",", left = "", right = "" } = opts;
  const x = Util.roundTo(this.x, precision);
  const y = Util.roundTo(this.y, precision);
  return `${left}${x}${unit}${separator}${y}${unit}${right}`;
};
Util.defineGetterSetter(
  Point.prototype,
  Symbol.toStringTag,
  function() {
    return `Point{ ${Point.prototype.toSource.call(this)}`;
  },
  () => {},
  false
);

Point.prototype.toSource = function(opts = {}) {
  const { asArray = false, pad = a => a /*a.padStart(4, ' ')*/, showNew = true } = opts;
  let x = pad(this.x + "");
  let y = pad(this.y + "");

  if(typeof this != "object" || this === null) return "";
  if(asArray) return `[${x},${y}]`;
  return `${Util.colorText(showNew ? "new " : "", 1, 31)}${Util.colorText("Point", 1, 33)}${Util.colorText("(", 1, 36)}${Util.colorText(x, 1, 32)}${Util.colorText(",", 1, 36)}${Util.colorText(y, 1, 32)}${Util.colorText(")", 1, 36)}`;
};
/*Point.prototype.toSource = function() {
  return '{x:' + this.x + ',y:' + this.y + '}';
};*/
Point.prototype.toObject = function() {
  const { x, y } = this;
  const obj = { x, y };
  Object.setPrototypeOf(obj, Point.prototype);
  return obj;
};
Point.prototype.toCSS = function(precision = 0.001) {
  return {
    left: Util.roundTo(this.x, precision) + "px",
    top: Util.roundTo(this.y, precision) + "px"
  };
};
Point.prototype.toFixed = function(digits) {
  return new Point(+this.x.toFixed(digits), +this.y.toFixed(digits));
};
Point.prototype.inside = function(rect) {
  return this.x >= rect.x && this.x < rect.x + rect.width && this.y >= rect.y && this.y < rect.y + rect.height;
};
/*Point.prototype.transform = function(m) {
  Matrix.prototype.transform_point.call(m, this);
  return this;
};*/
Point.prototype.normalize = function(minmax) {
  return new Point({
    x: (this.x - minmax.x1) / (minmax.x2 - minmax.x1),
    y: (this.y - minmax.y1) / (minmax.y2 - minmax.y1)
  });
};

Point.move = (point, x, y) => Point.prototype.move.call(point, x, y);
Point.angle = (point, other, deg = false) => Point.prototype.angle.call(point, other, deg);
Point.inside = (point, rect) => Point.prototype.inside.call(point, rect);
Point.sub = (point, other) => Point.prototype.sub.call(point, other);
Point.prod = (a, b) => Point.prototype.prod.call(a, b);
Point.quot = (a, b) => Point.prototype.quot.call(a, b);
Point.equals = (a, b) => {
  let ret = Point.prototype.equals.call(a, b);
  return ret;
};
Point.round = (point, prec) => Point.prototype.round.call(point, prec);
Point.fromAngle = (angle, f) => Point.prototype.fromAngle.call(new Point(0, 0), angle, f);

for(let name of [
  "clone",
  "comp",
  "neg",
  "sides",
  "dimension",
  "toString",
  // 'toSource',
  "toCSS",
  "sub",
  "diff",
  "add",
  "sum",
  "distance"
]) {
  Point[name] = (...args) => Point.prototype[name].call(...args);
}

Point.toSource = point => `{ x:${point.x}, y: ${point.y} }`;

export const isPoint = o => o && ((o.x !== undefined && o.y !== undefined) || ((o.left !== undefined || o.right !== undefined) && (o.top !== undefined || o.bottom !== undefined)));

Point.isPoint = isPoint;
Util.defineInspect(Point.prototype, "x", "y");

Point.bind = (o, p, gen) => {
  const [x, y] = p || ["x", "y"];
  if(!gen) gen = k => v => (v === undefined ? o[k] : (o[k] = v));
  return Util.bindProperties(new Point(0, 0), o, { x, y }, gen);
};
export default Point;
