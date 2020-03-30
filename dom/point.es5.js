"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Point = Point;
exports.default = exports.isPoint = void 0;

require("core-js/modules/es7.string.pad-start");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.string.sub");

require("core-js/modules/es6.regexp.constructor");

var _util = _interopRequireDefault(require("../util.es5.js"));

function Point(arg) {
  let args = arg instanceof Array ? arg : [...arguments];
  let p = !this || this === Point ? {} : this;
  arg = args.shift();

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
  return new Point({
    x: this.x,
    y: this.y
  });
};

Point.prototype.sum = function(other) {
  return new Point(this.x + other.x, this.y + other.y);
};

Point.prototype.add = function(other) {
  this.x += other.x;
  this.y += other.y;
  return this;
};

Point.prototype.diff = function(other) {
  return new Point(this.x - other.x, this.y - other.y);
};

Point.prototype.sub = function(other) {
  this.x -= other.x;
  this.y -= other.y;
  return this;
};

Point.prototype.prod = function(f) {
  const o = isPoint(f)
    ? f
    : {
        x: f,
        y: f
      };
  return new Point(this.x * o.x, this.y * o.y);
};

Point.prototype.mul = function(f) {
  const o = isPoint(f)
    ? f
    : {
        x: f,
        y: f
      };
  this.x *= o.x;
  this.y *= o.y;
  return this;
};

Point.prototype.quot = function(other) {
  return new Point(this.x / other.x, this.y / other.y);
};

Point.prototype.div = function(f) {
  this.x /= f;
  this.y /= f;
  return this;
};

Point.prototype.comp = function() {
  return new Point({
    x: -this.x,
    y: -this.y
  });
};

Point.prototype.neg = function() {
  this.x *= -1;
  this.y *= -1;
  return this;
};

Point.prototype.distance = function(
  other = {
    x: 0,
    y: 0
  }
) {
  return Math.sqrt((other.y - this.y) * (other.y - this.y) + (other.x - this.x) * (other.x - this.x));
};

Point.prototype.equal = function(other) {
  return this.x == other.x && this.y == other.y;
};

Point.prototype.round = function(precision = 0.001) {
  const prec = -Math.ceil(Math.log10(precision));
  this.x = precision == 1 ? Math.round(this.x) : +this.x.toFixed(prec);
  this.y = precision == 1 ? Math.round(this.y) : +this.y.toFixed(prec);
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
  other = other || {
    x: 0,
    y: 0
  };
  return Point.prototype.diff.call(this, other).toAngle(deg);
};

Point.prototype.dimension = function() {
  return [this.width, this.height];
};

Point.prototype.toString = function(precision = 0.001) {
  const x = _util.default.roundTo(this.x, precision);

  const y = _util.default.roundTo(this.y, precision);

  return "".concat(x, ",").concat(y);
};

_util.default.defineGetterSetter(
  Point.prototype,
  Symbol.toStringTag,
  function() {
    return "Point{ ".concat(Point.prototype.toSource.call(this));
  },
  () => {},
  false
);

Point.prototype.toSource = function(asArray = false) {
  let x = (this.x + "").padStart(4, " ");
  let y = (this.y + "").padStart(4, " ");
  if(typeof this != "object" || this === null) return "";
  if(asArray) return "[".concat(x, ",").concat(y, "]");
  return "{x:".concat(x, ",y:").concat(y, "}");
};

Point.prototype.toSource = function() {
  return "{x:" + this.x + ",y:" + this.y + "}";
};

Point.prototype.toCSS = function(precision = 0.001) {
  return {
    left: _util.default.roundTo(this.x, precision) + "px",
    top: _util.default.roundTo(this.y, precision) + "px"
  };
};

Point.prototype.toFixed = function(digits) {
  return new Point(+this.x.toFixed(digits), +this.y.toFixed(digits));
};

Point.prototype.inside = function(rect) {
  return this.x >= rect.x && this.x < rect.x + rect.width && this.y >= rect.y && this.y < rect.y + rect.height;
};

Point.prototype.normalize = function(minmax) {
  return new Point({
    x: (this.x - minmax.x1) / (minmax.x2 - minmax.x1),
    y: (this.y - minmax.y1) / (minmax.y2 - minmax.y1)
  });
};

Point.distance = point => Point.prototype.distance.call(point);

Point.move = (point, x, y) => Point.prototype.move.call(point, x, y);

Point.angle = (point, other, deg = false) => Point.prototype.angle.call(point, other, deg);

Point.distance = point => Point.prototype.distance.call(point);

Point.inside = (point, rect) => Point.prototype.inside.call(point, rect);

Point.add = (point, other) => Point.prototype.add.call(point, other);

Point.sub = (point, other) => Point.prototype.sub.call(point, other);

Point.sum = (a, b) => Point.prototype.sum.call(a, b);

Point.diff = (a, b) => Point.prototype.diff.call(a, b);

Point.prod = (a, b) => Point.prototype.prod.call(a, b);

Point.quot = (a, b) => Point.prototype.quot.call(a, b);

Point.equal = (a, b) => {
  let ret = Point.prototype.equal.call(a, b);
  return ret;
};

Point.round = (point, prec) => Point.prototype.round.call(point, prec);

Point.fromAngle = (angle, f) => Point.prototype.fromAngle.call(new Point(0, 0), angle, f);

for (var _i = 0, _arr = ["clone", "comp", "neg", "sides", "dimension", "toString", "toSource", "toCSS"]; _i < _arr.length; _i++) {
  let name = _arr[_i];

  Point[name] = (...args) => Point.prototype[name].call(...args);
}

const isPoint = o => o && ((o.x !== undefined && o.y !== undefined) || ((o.left !== undefined || o.right !== undefined) && (o.top !== undefined || o.bottom !== undefined)));

exports.isPoint = isPoint;
Point.isPoint = isPoint;
var _default = Point;
exports.default = _default;
