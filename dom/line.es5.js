"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.Line = Line;
exports.isLine = void 0;

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _epsilon = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/number/epsilon"));

var _parseFloat2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-float"));

var _point.es5.js = require("./point.js");

function Line(x1, y1, x2, y2) {
  var obj = this instanceof Line ? this : {};
  var arg;
  var args = Array.prototype.slice.call(arguments);
  var ret;

  if (args.length >= 4 && args.every(function (arg) {
    return !isNaN((0, _parseFloat2["default"])(arg));
  })) {
    arg = {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2
    };
  } else if (args.length == 1) {
    arg = args[0];
  }

  if (arg && arg.x1 !== undefined && arg.y1 !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    var _arg = arg,
        _x = _arg.x1,
        _y = _arg.y1,
        _x2 = _arg.x2,
        _y2 = _arg.y2;
    obj.x1 = (0, _parseFloat2["default"])(_x);
    obj.y1 = (0, _parseFloat2["default"])(_y);
    obj.x2 = (0, _parseFloat2["default"])(_x2);
    obj.y2 = (0, _parseFloat2["default"])(_y2);
    ret = 1;
  } else if ((0, _point.isPoint)(args[0]) && (0, _point.isPoint)(args[1])) {
    obj.x1 = (0, _parseFloat2["default"])(args[0].x);
    obj.y1 = (0, _parseFloat2["default"])(args[0].y);
    obj.x2 = (0, _parseFloat2["default"])(args[1].x);
    obj.y2 = (0, _parseFloat2["default"])(args[1].y);
    ret = 2;
  } else if (arg && arg.length >= 4 && arg.slice(0, 4).every(function (arg) {
    return !isNaN((0, _parseFloat2["default"])(arg));
  })) {
    obj.x1 = typeof x === "number" ? x : (0, _parseFloat2["default"])(x);
    obj.y1 = typeof y === "number" ? y : (0, _parseFloat2["default"])(y);
    obj.x2 = typeof w === "number" ? w : (0, _parseFloat2["default"])(w);
    obj.y2 = typeof h === "number" ? h : (0, _parseFloat2["default"])(h);
    ret = 4;
  } else {
    ret = 0;
  }

  if (!isLine(obj)) console.log("ERROR: is not a line: ", Array.prototype.slice.call(arguments));
  if (!(this instanceof Line)) return obj;
}

var isLine = function isLine(obj) {
  return ["x1", "y1", "x2", "y2"].every(function (prop) {
    return obj[prop] !== undefined;
  });
};

exports.isLine = isLine;

Line.prototype.intersect = function (other) {
  var ma = (this[0].y - this[1].y) / (this[0].x - this[1].x);
  var mb = (other[0].y - other[1].y) / (other[0].x - other[1].x);
  if (ma - mb < _epsilon["default"]) return undefined;
  return new _point.Point({
    x: (ma * this[0].x - mb * other[0].x + other[0].y - this[0].y) / (ma - mb),
    y: (ma * mb * (other[0].x - this[0].x) + mb * this[0].y - ma * other[0].y) / (mb - ma)
  });
};

(0, _defineProperty["default"])(Line.prototype, "x1", {
  get: function get() {
    return this.a && this.a.x;
  },
  set: function set(v) {
    if (!this.a) this.a = new _point.Point();
    this.a.x = v;
  },
  enumerable: true
});
(0, _defineProperty["default"])(Line.prototype, "y1", {
  get: function get() {
    return this.a && this.a.y;
  },
  set: function set(v) {
    if (!this.a) this.a = new _point.Point();
    this.a.y = v;
  },
  enumerable: true
});
(0, _defineProperty["default"])(Line.prototype, "x2", {
  get: function get() {
    return this.b && this.b.x;
  },
  set: function set(v) {
    if (!this.b) this.b = new _point.Point();
    this.b.x = v;
  },
  enumerable: true
});
(0, _defineProperty["default"])(Line.prototype, "y2", {
  get: function get() {
    return this.b && this.b.y;
  },
  set: function set(v) {
    if (!this.b) this.b = new _point.Point();
    this.b.y = v;
  },
  enumerable: true
});

Line.prototype.direction = function () {
  var dist = _point.Point.prototype.distance.call(this.a, this.b);

  return _point.Point.prototype.diff.call(this.a, this.b) / dist;
};

Line.prototype.slope = function () {
  return _point.Point.prototype.diff.call(this.a, this.b);
};

Line.prototype.angle = function () {
  return _point.Point.prototype.angle.call(Line.prototype.slope.call(this));
};

Line.prototype.length = function () {
  return _point.Point.prototype.distance.call(this.a, this.b);
};

Line.prototype.pointAt = function (pos) {
  return new _point.Point(pos * (this.x2 - this.x1) + this.x1, pos * (this.y2 - this.y1) + this.y1);
};

Line.prototype.transform = function (m) {
  this.a = this.a.transform(m);
  this.b = this.b.transform(m);
  return this;
};

Line.prototype.bbox = function () {
  return {
    x1: this.x1 < this.x2 ? this.x1 : this.x2,
    x2: this.x1 > this.x2 ? this.x1 : this.x2,
    y1: this.y1 < this.y2 ? this.y1 : this.y2,
    y2: this.y1 > this.y2 ? this.y1 : this.y2
  };
};

Line.prototype.points = function () {
  var a = this.a,
      b = this.b;
  return [a, b];
};

Line.prototype.inspect = function () {
  var x1 = this.x1,
      y1 = this.y1,
      x2 = this.x2,
      y2 = this.y2;
  return "Line{ " + inspect({
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2
  }) + " }";
};

Line.prototype.toString = function () {
  var a = this.a,
      b = this.b;

  if (a.x > b.x) {
    var tmp = this.b;
    this.b = this.a;
    this.a = tmp;
  }

  return _point.Point.prototype.toString.call(this.a) + " -> " + _point.Point.prototype.toString.call(this.b);
};
