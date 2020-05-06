"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Line = Line;
exports.isLine = void 0;

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _point = require("./point.es5.js");

var _rect = require("./rect.es5.js");

var _util = _interopRequireDefault(require("../util.es5.js"));

function Line(x1, y1, x2, y2) {
  let obj = this instanceof Line ? this : null;
  let arg;
  let args = [...arguments];
  let ret;

  if (args.length >= 4 && args.every(arg => !isNaN(parseFloat(arg)))) {
    arg = {
      x1,
      y1,
      x2,
      y2
    };
  } else if (args.length == 1) {
    arg = args[0];
  }

  if (obj === null) {
    obj = arg instanceof Line ? arg : new Line();
  }

  if (arg && arg.x1 !== undefined && arg.y1 !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    const _arg = arg,
          x1 = _arg.x1,
          y1 = _arg.y1,
          x2 = _arg.x2,
          y2 = _arg.y2;
    obj.x1 = parseFloat(x1);
    obj.y1 = parseFloat(y1);
    obj.x2 = parseFloat(x2);
    obj.y2 = parseFloat(y2);
    ret = 1;
  } else if ((0, _point.isPoint)(args[0]) && (0, _point.isPoint)(args[1])) {
    obj.a = args[0];
    obj.b = args[1];
    ret = 2;
  } else if (arg && arg.length >= 4 && arg.slice(0, 4).every(arg => !isNaN(parseFloat(arg)))) {
    obj.x1 = typeof x === "number" ? x : parseFloat(x);
    obj.y1 = typeof y === "number" ? y : parseFloat(y);
    obj.x2 = typeof w === "number" ? w : parseFloat(w);
    obj.y2 = typeof h === "number" ? h : parseFloat(h);
    ret = 4;
  } else {
    ret = 0;
  }

  if (!isLine(obj)) console.log("ERROR: is not a line: ", [...arguments]);
  if (this !== obj) return obj;
}

const isLine = obj => ["x1", "y1", "x2", "y2"].every(prop => obj[prop] !== undefined);

exports.isLine = isLine;

Line.prototype.intersect = function (other) {
  const ma = (this[0].y - this[1].y) / (this[0].x - this[1].x);
  const mb = (other[0].y - other[1].y) / (other[0].x - other[1].x);
  if (ma - mb < Number.EPSILON) return undefined;
  return new _point.Point({
    x: (ma * this[0].x - mb * other[0].x + other[0].y - this[0].y) / (ma - mb),
    y: (ma * mb * (other[0].x - this[0].x) + mb * this[0].y - ma * other[0].y) / (mb - ma)
  });
};

Object.defineProperty(Line.prototype, 0, {
  get: function get() {
    return this.a;
  },
  set: function set(v) {
    this.a.x = v.x;
    this.a.y = v.y;
  },
  enumerable: false
});
Object.defineProperty(Line.prototype, 1, {
  get: function get() {
    return this.b;
  },
  set: function set(v) {
    this.b.x = v.x;
    this.b.y = v.y;
  },
  enumerable: false
});
Object.defineProperty(Line.prototype, "x1", {
  get: function get() {
    return this.a && this.a.x;
  },
  set: function set(v) {
    if (!this.a) Object.defineProperty(this, "a", {
      value: new _point.Point(),
      enumerable: false
    });
    this.a.x = v;
  },
  enumerable: true
});
Object.defineProperty(Line.prototype, "y1", {
  get: function get() {
    return this.a && this.a.y;
  },
  set: function set(v) {
    if (!this.a) Object.defineProperty(this, "a", {
      value: new _point.Point(),
      enumerable: false
    });
    this.a.y = v;
  },
  enumerable: true
});
Object.defineProperty(Line.prototype, "x2", {
  get: function get() {
    return this.b && this.b.x;
  },
  set: function set(v) {
    if (!this.b) Object.defineProperty(this, "b", {
      value: new _point.Point(),
      enumerable: false
    });
    this.b.x = v;
  },
  enumerable: true
});
Object.defineProperty(Line.prototype, "y2", {
  get: function get() {
    return this.b && this.b.y;
  },
  set: function set(v) {
    if (!this.b) Object.defineProperty(this, "b", {
      value: new _point.Point(),
      enumerable: false
    });
    this.b.y = v;
  },
  enumerable: true
});

Line.prototype.direction = function () {
  var dist = _point.Point.prototype.distance.call(this.a, this.b);

  return _point.Point.prototype.quot.call(Line.prototype.getSlope.call(this), dist);
};

Line.prototype.getVector = function () {
  return {
    x: this.x2 - this.x1,
    y: this.y2 - this.y1
  };
};

Object.defineProperty(Line.prototype, "vector", {
  get: Line.prototype.getVector
});

Line.prototype.getSlope = function () {
  return (this.y2 - this.y1) / (this.x2 - this.x1);
};

Object.defineProperty(Line.prototype, "slope", {
  get: Line.prototype.getSlope
});

Line.prototype.yIntercept = function () {
  let v = Line.prototype.getVector.call(this);

  if (v.x !== 0) {
    let slope = v.y / v.x;
    return [this.a.y - this.a.x * slope, slope || 0];
  }
};

Line.prototype.xIntercept = function () {
  let v = Line.prototype.getVector.call(this);

  if (v.y !== 0) {
    let slope = v.x / v.y;
    return [this.a.x - this.a.y * slope, slope || 0];
  }
};

Line.prototype.isHorizontal = function () {
  return Line.prototype.getVector.call(this).y === 0;
};

Line.prototype.isVertical = function () {
  return Line.prototype.getVector.call(this).x === 0;
};

Line.prototype.equations = function () {
  let intercept = {
    y: Line.prototype.yIntercept.call(this),
    x: Line.prototype.xIntercept.call(this)
  };
  let equations = [];

  for (let axis in intercept) {
    if (intercept[axis]) {
      let _intercept$axis = (0, _slicedToArray2.default)(intercept[axis], 2),
          c0 = _intercept$axis[0],
          m = _intercept$axis[1];

      let rhs = "".concat(c0);
      if (m !== 0) rhs += " + ".concat(m, " * ").concat(axis == "y" ? "x" : "y");
      equations.push("".concat(axis, " = ").concat(rhs));
    }
  }

  return equations;
};

Line.prototype.functions = function () {
  let i;
  let fns = {};

  if (i = Line.prototype.yIntercept.call(this)) {
    let _i = i,
        _i2 = (0, _slicedToArray2.default)(_i, 2),
        y0 = _i2[0],
        myx = _i2[1];

    fns.y = x => y0 + myx * x;
  } else {
    let y = this.a.y;
    fns.y = new Function("x", "return ".concat(y));
  }

  if (i = Line.prototype.xIntercept.call(this)) {
    let _i3 = i,
        _i4 = (0, _slicedToArray2.default)(_i3, 2),
        x0 = _i4[0],
        mxy = _i4[1];

    fns.x = y => x0 + mxy * y;
  } else {
    let x = this.a.x;
    fns.x = new Function("y", "return ".concat(x));
  }

  return fns;
};

Line.prototype.angle = function () {
  return _point.Point.prototype.angle.call(Line.prototype.getSlope.call(this));
};

Line.prototype.getLength = function () {
  return _point.Point.prototype.distance.call(this.a, this.b);
};

Line.prototype.endpointDist = function (point) {
  return Math.min(point.distance(this.a), point.distance(this.b));
};

Line.prototype.matchEndpoints = function (arr) {
  const a = this.a,
        b = this.b;
  return [...arr.entries()].filter(([i, otherLine]) => !Line.prototype.equals.call(this, otherLine) && (_point.Point.prototype.equals.call(a, otherLine.a) || _point.Point.prototype.equals.call(b, otherLine.b) || _point.Point.prototype.equals.call(b, otherLine.a) || _point.Point.prototype.equals.call(a, otherLine.b)));
};

Line.prototype.distanceToPointSquared = function (p) {
  const a = this.a,
        b = this.b;

  var l2 = _point.Point.prototype.distanceSquared.call(a, b);

  if (l2 === 0) return _point.Point.prototype.distanceSquared.call(p, a);
  var t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return _point.Point.prototype.distanceSquared.call(p, new _point.Point(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)));
};

Line.prototype.distanceToPoint = function (p) {
  return Math.sqrt(Line.prototype.distanceToPointSquared.call(this, p));
};

Object.defineProperty(Line.prototype, "length", {
  get: Line.prototype.getLength
});
Object.defineProperty(Line.prototype, "cross", {
  get: function get() {
    const x1 = this.x1,
          x2 = this.x2,
          y1 = this.y1,
          y2 = this.y2;
    return x1 * y2 - y1 * x2;
  }
});
Object.defineProperty(Line.prototype, "dot", {
  get: function get() {
    const x1 = this.x1,
          x2 = this.x2,
          y1 = this.y1,
          y2 = this.y2;
    return x1 * x2 + y1 * y2;
  }
});

Line.prototype.pointAt = function (pos) {
  return new _point.Point(pos * (this.x2 - this.x1) + this.x1, pos * (this.y2 - this.y1) + this.y1);
};

Line.prototype.transform = function (m) {
  this.a = this.a.transform(m);
  this.b = this.b.transform(m);
  return this;
};

Line.prototype.bbox = function () {
  return new _rect.Rect({
    x1: this.x1 < this.x2 ? this.x1 : this.x2,
    x2: this.x1 > this.x2 ? this.x1 : this.x2,
    y1: this.y1 < this.y2 ? this.y1 : this.y2,
    y2: this.y1 > this.y2 ? this.y1 : this.y2
  });
};

Line.prototype.points = function () {
  const a = this.a,
        b = this.b;
  return [a, b];
};

Line.prototype.diff = function (other) {
  other = Line(...arguments);
  return new Line(_point.Point.diff(this.a, other.a), _point.Point.diff(this.b, other.b));
};

Line.prototype.inspect = function () {
  const x1 = this.x1,
        y1 = this.y1,
        x2 = this.x2,
        y2 = this.y2;
  return "Line{ " + inspect({
    x1,
    y1,
    x2,
    y2
  }) + " }";
};

Line.prototype.toString = function () {
  let a = this.a,
      b = this.b;
  return _point.Point.prototype.toString.call(this.a) + " -> " + _point.Point.prototype.toString.call(this.b);
};

Line.prototype.toSource = function () {
  let a = this.a,
      b = this.b;
  return "new Line(".concat(a.x, ",").concat(a.y, ",").concat(b.x, ",").concat(b.y, ")");
};

Line.prototype.reverse = function () {
  let tmp = this.b;
  this.b = this.a;
  this.a = tmp;
  return this;
};

Line.prototype.toObject = function () {
  const x1 = this.x1,
        y1 = this.y1,
        x2 = this.x2,
        y2 = this.y2;
  const obj = {
    x1,
    y1,
    x2,
    y2
  };
  Object.setPrototypeOf(obj, Line.prototype);
  return obj;
};

Line.prototype.clone = function () {
  const x1 = this.x1,
        y1 = this.y1,
        x2 = this.x2,
        y2 = this.y2;
  return new Line(x1, y1, x2, y2);
};

Line.prototype.round = function (precision = 0.001) {
  let x1 = this.x1,
      y1 = this.y1,
      x2 = this.x2,
      y2 = this.y2;
  this.a.x = _util.default.roundTo(x1, precision);
  this.a.y = _util.default.roundTo(y1, precision);
  this.b.x = _util.default.roundTo(x2, precision);
  this.b.y = _util.default.roundTo(y2, precision);
  return this;
};

Line.prototype.some = function (pred) {
  return pred(this.a) || pred(this.b);
};

Line.prototype.every = function (pred) {
  return pred(this.a) && pred(this.b);
};

Line.prototype.includes = function (point) {
  return _point.Point.prototype.equals.call(this.a, point) || _point.Point.prototype.equals.call(this.b, point);
};

Line.prototype.equals = function (other) {
  other = Line(other);
  if (_point.Point.equals(this.a, other.a) && _point.Point.equals(this.b, other.b)) return 1;
  if (_point.Point.equals(this.a, other.b) && _point.Point.equals(this.b, other.a)) return -1;
  return false;
};

Line.prototype.indexOf = function (point) {
  let i = 0;

  for (var _i5 = 0, _arr = [this.a, this.b]; _i5 < _arr.length; _i5++) {
    let p = _arr[_i5];
    if (_point.Point.prototype.equals.call(p, point)) return i;
    i++;
  }

  return -1;
};

Line.prototype.lastIndexOf = function (point) {
  let i = 0;

  for (var _i6 = 0, _arr2 = [this.b, this.a]; _i6 < _arr2.length; _i6++) {
    let p = _arr2[_i6];
    if (_point.Point.prototype.equals.call(p, point)) return i;
    i++;
  }

  return -1;
};

Line.prototype.map = function (fn) {
  let i = 0;
  let r = [];

  for (var _i7 = 0, _arr3 = [this.a, this.b]; _i7 < _arr3.length; _i7++) {
    let p = _arr3[_i7];
    r.push(fn(p, i, this));
    i++;
  }

  return new Line(...r);
};

Line.prototype.swap = function (fn) {
  return new Line(this.a, this.b).reverse();
};

Line.prototype.toPoints = function () {
  const x1 = this.x1,
        y1 = this.y1,
        x2 = this.x2,
        y2 = this.y2;
  var list = new PointList();
  list.push(new _point.Point(x1, y1));
  list.push(new _point.Point(x2, y1));
  list.push(new _point.Point(x2, y2));
  list.push(new _point.Point(x1, y2));
  return list;
};

for (var _i8 = 0, _arr4 = ["direction", "round", "slope", "angle", "bbox", "points", "inspect", "toString", "toObject", "toSource", "distanceToPointSquared", "distanceToPoint"]; _i8 < _arr4.length; _i8++) {
  let name = _arr4[_i8];

  Line[name] = (...args) => Line.prototype[name].call(...args);
}

_util.default.defineInspect(Line.prototype, "x1", "y1", "x2", "y2");

Line.bind = (o, p, gen) => {
  const _ref = p || ["x1", "y1", "x2", "y2"],
        _ref2 = (0, _slicedToArray2.default)(_ref, 4),
        x1 = _ref2[0],
        y1 = _ref2[1],
        x2 = _ref2[2],
        y2 = _ref2[3];

  if (!gen) gen = k => v => v === undefined ? o[k] : o[k] = v;

  let a = _point.Point.bind(o, [x1, y1], gen);

  let b = _point.Point.bind(o, [x2, y2], gen);

  let proxy = new Line(a, b);
  return proxy;
};
