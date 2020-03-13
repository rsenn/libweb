"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.PointList = PointList;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _iterator = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/symbol/iterator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _point.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js = require("./point.js");

var _rect.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js = require("./rect.js");

var _util = _interopRequireDefault(require("../util.es5.js.js"));

function PointList(points) {
  var args = Array.prototype.slice.call(arguments);
  var ret = this instanceof PointList ? this : [];
  if (args.length == 1 && args[0] instanceof Array) args = args[0];

  if (typeof points === "string") {
    var matches = (0, _toConsumableArray2["default"])(points.matchAll(/[-.0-9,]+/g));

    for (var i = 0; i < matches.length; i++) {
      var coords = String(matches[i]).split(",");
      ret.push((0, _point.Point)(coords));
    }
  } else if (args[0] && args[0].length == 2) {
    for (var _i = 0; _i < args.length; _i++) {
      ret.push(this instanceof PointList ? new _point.Point(args[_i]) : (0, _point.Point)(args[_i]));
    }
  } else if ((0, _point.isPoint)(args[0])) {
    for (var _i2 = 0; _i2 < args.length; _i2++) {
      ret.push(this instanceof PointList ? new _point.Point(args[_i2]) : (0, _point.Point)(args[_i2]));
    }
  }

  if (!(this instanceof PointList)) {
    return ret;
  }
}

PointList.prototype = new Array();

PointList.prototype.push = function () {
  var _this = this;

  var args = Array.prototype.slice.call(arguments);
  args.forEach(function (arg) {
    if (!(arg instanceof _point.Point)) arg = new _point.Point(arg);
    Array.prototype.push.call(_this, arg);
  });
};

PointList.prototype.splice = function () {
  var args = Array.prototype.slice.call(arguments);
  var start = args.shift();
  var remove = args.shift();
  return Array.prototype.splice.apply(this, [start, remove].concat((0, _toConsumableArray2["default"])(args.map(function (arg) {
    return arg instanceof _point.Point ? arg : new _point.Point(arg);
  }))));
};

PointList.prototype.removeSegment = function (index) {
  var _this2 = this;

  var indexes = [PointList.prototype.getLineIndex.call(this, index - 1), PointList.prototype.getLineIndex.call(this, index), PointList.prototype.getLineIndex.call(this, index + 1)];
  var lines = indexes.map(function (i) {
    return PointList.prototype.getLine.call(_this2, i);
  });
  var point = Line.intersect(lines[0], lines[2]);

  if (point) {
    PointList.prototype.splice.call(this, 0, 2, new _point.Point(point));
  }
};

PointList.prototype.toPath = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$relative = options.relative,
      relative = _options$relative === void 0 ? false : _options$relative,
      _options$close = options.close,
      close = _options$close === void 0 ? false : _options$close;
  var out = "";

  for (var i = 0; i < this.length; i++) {
    out += (i == 0 ? "M" : "L") + this[i].x.toFixed(3) + "," + this[i].y.toFixed(3) + " ";
  }

  if (close) out += "Z";
  return out;
};

PointList.prototype.clone = function () {
  var ret = new PointList();
  ret.splice.apply(ret, [0, ret.length].concat((0, _toConsumableArray2["default"])(this.map(function (p) {
    return new _point.Point(p.x, p.y);
  }))));
  return ret;
};

PointList.prototype.toPolar = function (tfn) {
  var ret = new PointList();
  var t = typeof tfn == "function" ? tfn : function (x, y) {
    return {
      x: x * 180 / Math.PI,
      y: y
    };
  };
  ret.splice.apply(ret, [0, ret.length].concat((0, _toConsumableArray2["default"])(this.map(function (p) {
    var angle = _point.Point.prototype.toAngle.call(p);

    return t(angle, _point.Point.prototype.distance.call(p));
  }))));
  return ret;
};

PointList.prototype.fromPolar = function (tfn) {
  var ret = new PointList();
  var t = typeof tfn == "function" ? tfn : function (x, y) {
    return {
      x: x * Math.PI / 180,
      y: y
    };
  };
  ret.splice.apply(ret, [0, ret.length].concat((0, _toConsumableArray2["default"])(this.map(function (p) {
    var r = t(p.x, p.y);
    return _point.Point.prototype.fromAngle.call(r.x, r.y);
  }))));
  return ret;
};

PointList.prototype.draw = function (ctx) {
  var close = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  ctx.to(this[0].x, this[0].y);

  for (var i = 1; i < this.length; i++) {
    ctx.line(this[i].x, this[i].y);
  }

  if (close) ctx.line(this[0].x, this[0].y);
  return this;
};

PointList.prototype.area = function () {
  var area = 0;
  var i;
  var j;
  var point1;
  var point2;

  for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
    point1 = this[i];
    point2 = this[j];
    area += point1.x * point2.y;
    area -= point1.y * point2.x;
  }

  area /= 2;
  return area;
};

PointList.prototype.centroid = function () {
  var x = 0;
  var y = 0;
  var i;
  var j;
  var f;
  var point1;
  var point2;

  for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
    point1 = this[i];
    point2 = this[j];
    f = point1.x * point2.y - point2.x * point1.y;
    x += (point1.x + point2.x) * f;
    y += (point1.y + point2.y) * f;
  }

  f = this.area() * 6;
  return new _point.Point(x / f, y / f);
};

PointList.prototype.avg = function () {
  var ret = this.reduce(function (acc, p) {
    return acc.add(p);
  }, new _point.Point());
  return ret.div(this.length);
};

PointList.prototype.bbox = function () {
  if (!this.length) return {};
  var ret = {
    x1: this[0].x,
    x2: this[0].x,
    y1: this[0].y,
    y2: this[0].y,
    toString: function toString() {
      return "{x1:".concat((this.x1 + "").padStart(4, " "), ",x2:").concat((this.x2 + "").padStart(4, " "), ",y1:").concat((this.y1 + "").padStart(4, " "), ",y2:").concat((this.y2 + "").padStart(4, " "), "}");
    }
  };

  for (var i = 1; i < this.length; i++) {
    var x = this[i].x;
    var y = this[i].y;
    if (x < ret.x1) ret.x1 = x;
    if (x > ret.x2) ret.x2 = x;
    if (y < ret.y1) ret.y1 = y;
    if (y > ret.y2) ret.y2 = y;
  }

  return ret;
};

PointList.prototype.rect = function () {
  return new _rect.Rect(PointList.prototype.bbox.call(this));
};

PointList.prototype.xrange = function () {
  var bbox = this.bbox();
  return [bbox.x1, bbox.x2];
};

PointList.prototype.normalizeX = function () {
  var newVal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (x) {
    return x;
  };
  var xrange = PointList.prototype.xrange.call(this);
  var xdiff = xrange[1] - xrange[0];
  this.forEach(function (p, i, l) {
    l[i].x = newVal((l[i].x - xrange[0]) / xdiff);
  });
  return this;
};

PointList.prototype.yrange = function () {
  var bbox = this.bbox();
  return [bbox.y1, bbox.y2];
};

PointList.prototype.normalizeY = function () {
  var newVal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (y) {
    return y;
  };
  var yrange = PointList.prototype.yrange.call(this);
  var ydiff = yrange[1] - yrange[0];
  this.forEach(function (p, i, l) {
    l[i].y = newVal((l[i].y - yrange[0]) / ydiff);
  });
  return this;
};

PointList.prototype.boundingRect = function () {
  return new _rect.Rect(this.bbox());
};

PointList.prototype.translate = function (x, y) {
  for (var i = 0; i < this.length; i++) {
    _point.Point.prototype.move.call(this[i], x, y);
  }

  return this;
};

PointList.prototype.filter = function (pred) {
  var ret = new PointList();
  this.forEach(function (p, i, l) {
    return pred(p, i, l) && ret.push(new _point.Point(l[i]));
  });
  return ret;
};

PointList.prototype.getLineIndex = function (index) {
  return (index < 0 ? this.length + index : index) % this.length;
};

PointList.prototype.getLine = function (index) {
  var a = PointList.prototype.getLineIndex.call(this, index);
  var b = PointList.prototype.getLineIndex.call(this, index + 1);
  return [this[a], this[b]];
};

PointList.prototype.lines = function () {
  var closed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var points = this;
  var n = points.length - (closed ? 0 : 1);
  var iterableObj = (0, _defineProperty2["default"])({}, _iterator["default"], function () {
    var step = 0;
    return {
      next: function next() {
        var value;
        var done = step >= n;

        if (!done) {
          value = new Line(points[step], points[(step + 1) % points.length]);
          step++;
        }

        return {
          value: value,
          done: done
        };
      }
    };
  });
  return iterableObj;
};

PointList.prototype.toString = function (prec) {
  return "PointList([" + this.map(function (point) {
    return _point.Point.prototype.toString.call(point, prec);
  }).join(",") + "])";
};

PointList.prototype.rotateRight = function (n) {
  return _util["default"].rotateRight(this, n);
};

PointList.prototype.add = function (pt) {
  var args = Array.prototype.slice.call(arguments);
  if (!(pt instanceof _point.Point)) pt = new _point.Point(args);

  for (var i = 0; i < this.length; i++) {
    _point.Point.prototype.add.call(this[i], pt);
  }

  return this;
};

PointList.prototype.sum = function (pt) {
  var ret = this.clone();
  return PointList.prototype.add.apply(ret, arguments);
};

PointList.prototype.sub = function (pt) {
  var args = Array.prototype.slice.call(arguments);
  if (!(pt instanceof _point.Point)) pt = new _point.Point(args);

  for (var i = 0; i < this.length; i++) {
    _point.Point.prototype.sub.call(this[i], pt);
  }

  return this;
};

PointList.prototype.diff = function (pt) {
  var ret = this.clone();
  return PointList.prototype.sub.apply(ret, arguments);
};
