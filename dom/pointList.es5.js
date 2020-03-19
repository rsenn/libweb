"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PointList = PointList;
exports.Polyline = Polyline;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/web.dom.iterable");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es6.string.sub");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es7.string.pad-start");

require("core-js/modules/es6.regexp.split");

var _point = require("./point.es5.js");

var _rect = require("./rect.es5.js");

var _line = require("./line.es5.js");

var _util = _interopRequireDefault(require("../util.es5.js"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function PointList(points) {
  let args = [...arguments];
  let ret = this instanceof PointList ? this : [];
  if (_util.default.isArray(args[0]) || _util.default.isGenerator(args[0])) args = [...args[0]];

  if (typeof points === "string") {
    const matches = [...points.matchAll(/[-.0-9,]+/g)];

    for (let i = 0; i < matches.length; i++) {
      const coords = String(matches[i]).split(",");
      ret.push((0, _point.Point)(coords));
    }
  } else if (args[0] && args[0].length == 2) {
    for (let i = 0; i < args.length; i++) ret.push(this instanceof PointList ? new _point.Point(args[i]) : (0, _point.Point)(args[i]));
  } else if (args.length !== undefined) {
    for (let i = 0; i < args.length; i++) {
      ret.push(args[i] instanceof _point.Point ? args[i] : this instanceof PointList ? new _point.Point(args[i]) : (0, _point.Point)(args[i]));
    }
  }

  if (!(this instanceof PointList)) {
    return ret;
  }
}

PointList.prototype = new Array();

PointList.prototype.push = function () {
  const args = [...arguments];
  args.forEach(arg => {
    if (!(arg instanceof _point.Point)) arg = new _point.Point(arg);
    Array.prototype.push.call(this, arg);
  });
};

PointList.prototype.splice = function () {
  let args = [...arguments];
  const start = args.shift();
  const remove = args.shift();
  return Array.prototype.splice.apply(this, [start, remove, ...args.map(arg => arg instanceof _point.Point ? arg : new _point.Point(arg))]);
};

PointList.prototype.removeSegment = function (index) {
  let indexes = [PointList.prototype.getLineIndex.call(this, index - 1), PointList.prototype.getLineIndex.call(this, index), PointList.prototype.getLineIndex.call(this, index + 1)];
  let lines = indexes.map(i => PointList.prototype.getLine.call(this, i));

  let point = _line.Line.intersect(lines[0], lines[2]);

  if (point) {
    PointList.prototype.splice.call(this, 0, 2, new _point.Point(point));
  }
};

PointList.prototype.toPath = function (options = {}) {
  const _options$relative = options.relative,
        relative = _options$relative === void 0 ? false : _options$relative,
        _options$close = options.close,
        close = _options$close === void 0 ? false : _options$close,
        _options$precision = options.precision,
        precision = _options$precision === void 0 ? 0.001 : _options$precision;
  let out = "";
  const point = relative ? i => i > 0 ? _point.Point.diff(this[i], this[i - 1]) : this[i] : i => this[i];

  const cmd = i => i == 0 ? "M" : "L"[relative ? "toLowerCase" : "toUpperCase"]();

  for (let i = 0; i < this.length; i++) {
    out += cmd(i) + _util.default.roundTo(point(i).x, precision) + "," + _util.default.roundTo(point(i).y, precision) + " ";
  }

  if (close) out += "Z";
  return out;
};

PointList.prototype.clone = function () {
  let ret = new PointList();
  ret.splice.apply(ret, [0, ret.length, ...this.map(p => new _point.Point(p.x, p.y))]);
  return ret;
};

PointList.prototype.toPolar = function (tfn) {
  let ret = new PointList();
  let t = typeof tfn == "function" ? tfn : (x, y) => ({
    x: x * 180 / Math.PI,
    y
  });
  ret.splice.apply(ret, [0, ret.length, ...this.map(p => {
    const angle = _point.Point.prototype.toAngle.call(p);

    return t(angle, _point.Point.prototype.distance.call(p));
  })]);
  return ret;
};

PointList.prototype.fromPolar = function (tfn) {
  let ret = new PointList();
  let t = typeof tfn == "function" ? tfn : (x, y) => ({
    x: x * Math.PI / 180,
    y
  });
  ret.splice.apply(ret, [0, ret.length, ...this.map(p => {
    let r = t(p.x, p.y);
    return _point.Point.prototype.fromAngle.call(r.x, r.y);
  })]);
  return ret;
};

PointList.prototype.draw = function (ctx, close = false) {
  ctx.to(this[0].x, this[0].y);

  for (let i = 1; i < this.length; i++) {
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
  var ret = this.reduce((acc, p) => acc.add(p), new _point.Point());
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

  for (let i = 1; i < this.length; i++) {
    const x = this[i].x;
    const y = this[i].y;
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
  const bbox = this.bbox();
  return [bbox.x1, bbox.x2];
};

PointList.prototype.normalizeX = function (newVal = x => x) {
  const xrange = PointList.prototype.xrange.call(this);
  const xdiff = xrange[1] - xrange[0];
  this.forEach((p, i, l) => {
    l[i].x = newVal((l[i].x - xrange[0]) / xdiff);
  });
  return this;
};

PointList.prototype.yrange = function () {
  const bbox = this.bbox();
  return [bbox.y1, bbox.y2];
};

PointList.prototype.normalizeY = function (newVal = y => y) {
  const yrange = PointList.prototype.yrange.call(this);
  const ydiff = yrange[1] - yrange[0];
  this.forEach((p, i, l) => {
    l[i].y = newVal((l[i].y - yrange[0]) / ydiff);
  });
  return this;
};

PointList.prototype.boundingRect = function () {
  return new _rect.Rect(this.bbox());
};

PointList.prototype.translate = function (x, y) {
  for (let i = 0; i < this.length; i++) _point.Point.prototype.move.call(this[i], x, y);

  return this;
};

PointList.prototype.filter = function (pred) {
  let ret = new PointList();
  this.forEach((p, i, l) => pred(p, i, l) && ret.push(new _point.Point(l[i])));
  return ret;
};

PointList.prototype.getLineIndex = function (index) {
  return (index < 0 ? this.length + index : index) % this.length;
};

PointList.prototype.getLine = function (index) {
  let a = PointList.prototype.getLineIndex.call(this, index);
  let b = PointList.prototype.getLineIndex.call(this, index + 1);
  return [this[a], this[b]];
};

PointList.prototype.lines = function (closed = false) {
  const points = this;
  const n = points.length - (closed ? 0 : 1);
  const iterableObj = {
    [Symbol.iterator]() {
      let step = 0;
      return {
        next() {
          let value;
          let done = step >= n;

          if (!done) {
            value = new _line.Line(points[step], points[(step + 1) % points.length]);
            step++;
          }

          return {
            value,
            done
          };
        }

      };
    }

  };
  return iterableObj;
};

PointList.prototype.toString = function (prec) {
  return this.map(point => _point.Point.prototype.toString.call(point, prec)).join(" ");
};

PointList.prototype.rotateRight = function (n) {
  return _util.default.rotateRight(this, n);
};

PointList.prototype.add = function (pt) {
  let args = [...arguments];
  if (!(pt instanceof _point.Point)) pt = new _point.Point(args);

  for (let i = 0; i < this.length; i++) _point.Point.prototype.add.call(this[i], pt);

  return this;
};

PointList.prototype.sum = function (pt) {
  let ret = this.clone();
  return PointList.prototype.add.apply(ret, arguments);
};

PointList.prototype.sub = function (pt) {
  let args = [...arguments];
  if (!(pt instanceof _point.Point)) pt = new _point.Point(args);

  for (let i = 0; i < this.length; i++) _point.Point.prototype.sub.call(this[i], pt);

  return this;
};

PointList.prototype.diff = function (pt) {
  let ret = this.clone();
  return PointList.prototype.sub.apply(ret, arguments);
};

for (var _i = 0, _arr = ["push", "splice", "clone", "area", "centroid", "avg", "bbox", "rect", "xrange", "yrange", "boundingRect"]; _i < _arr.length; _i++) {
  let name = _arr[_i];

  PointList[name] = points => PointList.prototype[name].call(points);
}

function Polyline(lines) {
  let ret = this instanceof Polyline ? this : new PointList();

  const addUnique = point => {
    const ok = ret.length > 0 ? !_point.Point.equal(ret[ret.length - 1], point) : true;
    if (ok) ret.push(_objectSpread({}, point));
    return ok;
  };

  let prev;

  for (let i = 0; i < lines.length; i++) {
    const line = lines.shift();
    console.log("line[".concat(i, "]:"), line.toString());

    if (i > 0) {
      const eq = [_point.Point.equal(prev, line.a)];
      console.log("Point.equal(".concat(prev, ",").concat(line.a, ") = ").concat(eq[0]));
      if (!eq[0] && !_point.Point.equal(prev, line.b)) break;
    } else {
      addUnique(line.a);
    }

    addUnique(line.b);
    prev = line.b;
  }

  return ret;
}

Polyline.prototype = new PointList();

Polyline.prototype.toSVG = function (factory, attrs = {}, parent = null) {
  return factory("polyline", _objectSpread({
    points: PointList.prototype.toString.call(this)
  }, attrs), parent);
};
