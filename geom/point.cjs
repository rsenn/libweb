"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Point = Point;
exports.default = exports.isPoint = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.string.sub");

require("core-js/modules/es6.regexp.constructor");

var _util = _interopRequireDefault(require("../util.cjs"));

function Point(arg) {
  let args = arg instanceof Array ? arg : [...arguments];
  let p = this instanceof Point ? this : null;
  arg = args.shift();

  if (p === null) {
    if (arg instanceof Point) return arg;
    p = {};
  }

  if (typeof arg === "undefined") {
    p.x = arg;
    p.y = args.shift();
  } else if (typeof arg === "number") {
    p.x = parseFloat(arg);
    p.y = parseFloat(args.shift());
  } else if (typeof arg === "string") {
    const matches = [...arg.matchAll(new RegExp("/([-+]?d*.?d+)(?:[eE]([-+]?d+))?/g"))];
    p.x = parseFloat(matches[0]);
    p.y = parseFloat(matches[1]);
  } else if (typeof arg == "object" && arg !== null && (arg.x !== undefined || arg.y !== undefined)) {
    p.x = arg.x;
    p.y = arg.y;
  } else if (typeof arg == "object" && arg !== null && arg.length > 0 && x !== undefined && y !== undefined) {
    p.x = parseFloat(arg.shift());
    p.y = parseFloat(arg.shift());
  } else if (typeof args[0] === "number" && typeof args[1] === "number") {
    p.x = args[0];
    p.y = args[1];
    args.shift(2);
  } else {
    p.x = 0;
    p.y = 0;
  }

  if (isNaN(p.x)) p.x = undefined;
  if (isNaN(p.y)) p.y = undefined;

  if (!this || this === Point) {
    if (p.prototype == Object) p.prototype = Point.prototype;else Object.assign(p, Point.prototype);
    return p;
  }
}

Point.prototype.move = function (x, y) {
  this.x += x;
  this.y += y;
  return this;
};

Point.prototype.move_to = function (x, y) {
  this.x = x;
  this.y = y;
  return this;
};

Point.prototype.clear = function (x, y) {
  this.x = 0;
  this.y = 0;
  return this;
};

Point.prototype.set = function (fn) {
  if (typeof fn != "function") {
    Point.apply(this, [...arguments]);
    return this;
  }

  return fn(this.x, this.y);
};

Point.prototype.clone = function () {
  return new Point({
    x: this.x,
    y: this.y
  });
};

Point.prototype.sum = function (...args) {
  const p = new Point(...args);
  return new Point(this.x + p.x, this.y + p.y);
};

Point.prototype.add = function (...args) {
  const other = new Point(...args);
  this.x += other.x;
  this.y += other.y;
  return this;
};

Point.prototype.diff = function (...args) {
  const other = Point(...args);
  return new Point(this.x - other.x, this.y - other.y);
};

Point.prototype.sub = function (...args) {
  const other = new Point(...args);
  this.x -= other.x;
  this.y -= other.y;
  return this;
};

Point.prototype.prod = function (f) {
  const o = isPoint(f) ? f : {
    x: f,
    y: f
  };
  return new Point(this.x * o.x, this.y * o.y);
};

Point.prototype.mul = function (f) {
  const o = isPoint(f) ? f : {
    x: f,
    y: f
  };
  this.x *= o.x;
  this.y *= o.y;
  return this;
};

Point.prototype.quot = function (other) {
  other = isPoint(other) ? other : {
    x: other,
    y: other
  };
  return new Point(this.x / other.x, this.y / other.y);
};

Point.prototype.div = function (f) {
  this.x /= f;
  this.y /= f;
  return this;
};

Point.prototype.comp = function () {
  return new Point({
    x: -this.x,
    y: -this.y
  });
};

Point.prototype.neg = function () {
  this.x *= -1;
  this.y *= -1;
  return this;
};

Point.prototype.distanceSquared = function (other = {
  x: 0,
  y: 0
}) {
  return (other.y - this.y) * (other.y - this.y) + (other.x - this.x) * (other.x - this.x);
};

Point.prototype.distance = function (other = {
  x: 0,
  y: 0
}) {
  return Math.sqrt(Point.prototype.distanceSquared.call(this, other));
};

Point.prototype.equals = function (other) {
  return +this.x == +other.x && +this.y == +other.y;
};

Point.prototype.round = function (precision = 0.001) {
  let x = this.x,
      y = this.y;
  this.x = _util.default.roundTo(x, precision);
  this.y = _util.default.roundTo(y, precision);
  return this;
};

Point.prototype.sides = function () {
  return {
    top: this.y,
    right: this.x + this.w1idth,
    bottom: this.y + this.height,
    left: this.x
  };
};

Point.prototype.dot = function (other) {
  return this.x * other.x + this.y * other.y;
};

Point.prototype.fromAngle = function (angle, dist = 1.0) {
  this.x = Math.cos(angle) * dist;
  this.y = Math.sin(angle) * dist;
  return this;
};

Point.prototype.toAngle = function (deg = false) {
  return Math.atan2(this.x, this.y) * (deg ? 180 / Math.PI : 1);
};

Point.prototype.angle = function (other, deg = false) {
  other = other || {
    x: 0,
    y: 0
  };
  return Point.prototype.diff.call(this, other).toAngle(deg);
};

Point.prototype.rotate = function (angle, origin = {
  x: 0,
  y: 0
}) {
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

Point.prototype.dimension = function () {
  return [this.width, this.height];
};

Point.prototype.toString = function (opts = {}) {
  const _opts$precision = opts.precision,
        precision = _opts$precision === void 0 ? 0.001 : _opts$precision,
        _opts$unit = opts.unit,
        unit = _opts$unit === void 0 ? "" : _opts$unit,
        _opts$separator = opts.separator,
        separator = _opts$separator === void 0 ? "," : _opts$separator,
        _opts$left = opts.left,
        left = _opts$left === void 0 ? "" : _opts$left,
        _opts$right = opts.right,
        right = _opts$right === void 0 ? "" : _opts$right;

  const x = _util.default.roundTo(this.x, precision);

  const y = _util.default.roundTo(this.y, precision);

  return "".concat(left).concat(x).concat(unit).concat(separator).concat(y).concat(unit).concat(right);
};

_util.default.defineGetterSetter(Point.prototype, Symbol.toStringTag, function () {
  return "Point{ ".concat(Point.prototype.toSource.call(this));
}, () => {}, false);

Point.prototype.toSource = function (opts = {}) {
  const _opts$asArray = opts.asArray,
        asArray = _opts$asArray === void 0 ? false : _opts$asArray,
        _opts$pad = opts.pad,
        pad = _opts$pad === void 0 ? a => a : _opts$pad,
        _opts$showNew = opts.showNew,
        showNew = _opts$showNew === void 0 ? true : _opts$showNew;
  let x = pad(this.x + "");
  let y = pad(this.y + "");
  if (typeof this != "object" || this === null) return "";
  if (asArray) return "[".concat(x, ",").concat(y, "]");
  return "".concat(_util.default.colorText(showNew ? "new " : "", 1, 31)).concat(_util.default.colorText("Point", 1, 33)).concat(_util.default.colorText("(", 1, 36)).concat(_util.default.colorText(x, 1, 32)).concat(_util.default.colorText(",", 1, 36)).concat(_util.default.colorText(y, 1, 32)).concat(_util.default.colorText(")", 1, 36));
};

Point.prototype.toObject = function () {
  const x = this.x,
        y = this.y;
  const obj = {
    x,
    y
  };
  Object.setPrototypeOf(obj, Point.prototype);
  return obj;
};

Point.prototype.toCSS = function (precision = 0.001) {
  return {
    left: _util.default.roundTo(this.x, precision) + "px",
    top: _util.default.roundTo(this.y, precision) + "px"
  };
};

Point.prototype.toFixed = function (digits) {
  return new Point(+this.x.toFixed(digits), +this.y.toFixed(digits));
};

Point.prototype.inside = function (rect) {
  return this.x >= rect.x && this.x < rect.x + rect.width && this.y >= rect.y && this.y < rect.y + rect.height;
};

Point.prototype.normalize = function (minmax) {
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

for (var _i = 0, _arr = ["clone", "comp", "neg", "sides", "dimension", "toString", "toCSS", "sub", "diff", "add", "sum", "distance"]; _i < _arr.length; _i++) {
  let name = _arr[_i];

  Point[name] = (...args) => Point.prototype[name].call(...args);
}

Point.toSource = point => "{ x:".concat(point.x, ", y: ").concat(point.y, " }");

const isPoint = o => o && (o.x !== undefined && o.y !== undefined || (o.left !== undefined || o.right !== undefined) && (o.top !== undefined || o.bottom !== undefined));

exports.isPoint = isPoint;
Point.isPoint = isPoint;

_util.default.defineInspect(Point.prototype, "x", "y");

Point.bind = (o, p, gen) => {
  const _ref = p || ["x", "y"],
        _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        x = _ref2[0],
        y = _ref2[1];

  if (!gen) gen = k => v => v === undefined ? o[k] : o[k] = v;
  return _util.default.bindProperties(new Point(0, 0), o, {
    x,
    y
  }, gen);
};

var _default = Point;
exports.default = _default;
