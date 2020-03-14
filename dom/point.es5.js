"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Point = Point;
exports.isPoint = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

function Point(arg) {
  var args = arg instanceof Array ? arg : Array.prototype.slice.call(arguments);
  var p = !this || this === Point ? {} : this;
  arg = args.shift();

  if(typeof arg === "number") {
    p.x = parseFloat(arg);
    p.y = parseFloat(args.shift());
  } else if(typeof arg === "string") {
    var matches = (0, _toConsumableArray2["default"])(arg.matchAll(new RegExp("/([-+]?d*.?d+)(?:[eE]([-+]?d+))?/g")));
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

Point.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  return this;
};

Point.prototype.set = function(fn) {
  if(typeof fn != "function") {
    Point.apply(this, Array.prototype.slice.call(arguments));
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
  var o = isPoint(f)
    ? f
    : {
        x: f,
        y: f
      };
  return new Point(this.x * o.x, this.y * o.y);
};

Point.prototype.mul = function(f) {
  var o = isPoint(f)
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

Point.prototype.distance = function() {
  var other =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : {
          x: 0,
          y: 0
        };
  return Math.sqrt((other.y - this.y) * (other.y - this.y) + (other.x - this.x) * (other.x - this.x));
};

Point.prototype.equal = function(other) {
  return this.x == other.x && this.y == other.y;
};

Point.prototype.round = function() {
  var precision = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;
  this.x = Math.round(this.x / precision) * precision;
  this.y = Math.round(this.y / precision) * precision;
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

Point.prototype.fromAngle = function(angle) {
  var dist = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;
  this.x = Math.cos(angle) * dist;
  this.y = Math.sin(angle) * dist;
  return this;
};

Point.prototype.toAngle = function() {
  var deg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  return Math.atan2(this.x, this.y) * (deg ? 180 / Math.PI : 1);
};

Point.prototype.angle = function(other) {
  other = other || {
    x: 0,
    y: 0
  };
  return Point.prototype.diff.call(this, other).toAngle();
};

Point.prototype.dimension = function() {
  return [this.width, this.height];
};

Point.prototype.toString = function() {
  var x = "" + this.x;
  var y = "" + this.y;
  return "".concat(x, ",").concat(y);
};

Point.prototype.toSource = function() {
  var asArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var x = (this.x + "").padStart(4, " ");
  var y = (this.y + "").padStart(4, " ");
  if(typeof this != "object" || this === null) return "";
  if(asArray) return "[".concat(x, ",").concat(y, "]");
  return "{x:".concat(x, ",y:").concat(y, "}");
};

Point.prototype.toSource = function() {
  return "{x:" + this.x.toFixed(3) + ",y:" + this.y.toFixed(3) + "}";
};

Point.prototype.toCSS = function() {
  return {
    left: this.x + "px",
    top: this.y + "px"
  };
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

Point.distance = function(point) {
  return Point.prototype.distance.call(point);
};

Point.move = function(point, x, y) {
  return Point.prototype.move.call(point, x, y);
};

Point.angle = function(point) {
  return Point.prototype.angle.call(point);
};

Point.distance = function(point) {
  return Point.prototype.distance.call(point);
};

Point.inside = function(point, rect) {
  return Point.prototype.inside.call(point, rect);
};

Point.add = function(point, other) {
  return Point.prototype.add.call(point, other);
};

Point.sub = function(point, other) {
  return Point.prototype.sub.call(point, other);
};

Point.sum = function(a, b) {
  return Point.prototype.sum.call(a, b);
};

Point.diff = function(a, b) {
  return Point.prototype.diff.call(a, b);
};

Point.prod = function(a, b) {
  return Point.prototype.prod.call(a, b);
};

Point.quot = function(a, b) {
  return Point.prototype.quot.call(a, b);
};

Point.equal = function(a, b) {
  return Point.prototype.equal.call(a, b);
};

Point.round = function(a, b) {
  return Point.prototype.round.call(a, b);
};

var _loop = function _loop() {
  var name = _arr[_i];

  Point[name] = function(points) {
    return Point.prototype[name].call(points);
  };
};

for(var _i = 0, _arr = ["clone", "comp", "neg", "sides", "dimension", "toString", "toSource", "toCSS"]; _i < _arr.length; _i++) {
  _loop();
}

var isPoint = function isPoint(o) {
  return o && ((o.x !== undefined && o.y !== undefined) || ((o.left !== undefined || o.right !== undefined) && (o.top !== undefined || o.bottom !== undefined)));
};

exports.isPoint = isPoint;
Point.isPoint = isPoint;
