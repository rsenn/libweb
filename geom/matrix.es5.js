"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Matrix = Matrix;
exports.isMatrix = exports.MatrixProps = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.array.from");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es7.object.entries");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _util = require("../util.es5.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function Matrix(arg) {
  let ret = this instanceof Matrix || new.target === Matrix ? this : [undefined, 0, 0, undefined, 0, 0, undefined, 0, 0];

  if (arg instanceof Array) {
    Matrix.prototype.init.call(ret, arg);
  } else if (typeof arg === 'number') {
    Matrix.prototype.init.apply(ret, arguments);
  } else if (typeof arg === 'string') {
    if (/matrix\([^)]*\)/.test(arg)) {
      let _map = [...arg.matchAll(/[-.0-9]+/g)].map(m => parseFloat(m[0])),
          _map2 = (0, _slicedToArray2.default)(_map, 6),
          xx = _map2[0],
          xy = _map2[1],
          x0 = _map2[2],
          yx = _map2[3],
          yy = _map2[4],
          y0 = _map2[5];

      ret[0] = xx;
      ret[1] = xy;
      ret[2] = x0;
      ret[3] = yx;
      ret[4] = yy;
      ret[5] = y0;
    }
  } else if (arg && typeof arg == 'object') {
    if (arg.xx !== undefined && arg.yx !== undefined && arg.xy !== undefined && arg.yy !== undefined && arg.x0 !== undefined && arg.y0 !== undefined) {
      ret[0] = arg.xx;
      ret[1] = arg.xy;
      ret[2] = arg.x0;
      ret[3] = arg.yx;
      ret[4] = arg.yy;
      ret[5] = arg.y0;
    } else if (arg.a !== undefined && arg.b !== undefined && arg.c !== undefined && arg.d !== undefined && arg.e !== undefined && arg.f !== undefined) {
      ret[0] = arg.a;
      ret[1] = arg.c;
      ret[2] = arg.e;
      ret[3] = arg.b;
      ret[4] = arg.d;
      ret[5] = arg.f;
    }
  } else {
    Array.prototype.splice.call(ret, 0, ret.length, 1, 0, 0, 0, 1, 0, 0, 0, 1);
  }

  for (let i = 0; i < 9; i++) if (ret[i] === undefined) ret[i] = [1, 0, 0, 0, 1, 0, 0, 0, 1][i];

  if (!(this instanceof Matrix)) return ret;
}

Matrix.prototype.splice = Array.prototype.splice;
Object.defineProperty(Matrix.prototype, 'length', {
  value: 9,
  enumerable: false,
  writable: true,
  configurable: false
});
Matrix.prototype.keys = ['xx', 'xy', 'x0', 'yx', 'yy', 'y0'];
Matrix.prototype.keySeq = ['xx', 'yx', 'xy', 'yy', 'x0', 'y0'];
Matrix.prototype.keyIndex = {
  xx: 0,
  a: 0,
  xy: 1,
  c: 1,
  x0: 2,
  tx: 2,
  e: 2,
  yx: 3,
  b: 3,
  yy: 4,
  d: 4,
  y0: 5,
  ty: 5,
  f: 5
};

Matrix.prototype.at = function (key) {
  return this[Matrix.prototype.keyIndex[key]];
};

const MatrixProps = Object.entries(Matrix.prototype.keyIndex).reduce((acc, [k, i]) => _objectSpread({}, acc, {
  [k]: {
    get: function get() {
      return this[i];
    },
    set: function set(v) {
      this[i] = v;
    },
    enumerable: true
  }
}), {});
exports.MatrixProps = MatrixProps;
Matrix.propDescriptors = MatrixProps;

Matrix.prototype.init = function (...args) {
  if (args.length == 1) args = args[0];
  if (args.length < 9) args = args.concat(Array.prototype.slice.call(Matrix.IDENTITY, args.length));
  Array.prototype.splice.call(this, 0, this.length, ...args);
  return this;
};

Matrix.prototype.set_row = function (...args) {
  const start = args.shift() * 3;
  const end = Math.max(3, args.length);

  for (let i = 0; i < end; i++) this[start + i] = args[i];

  return this;
};

Matrix.prototype.multiply = function (...args) {
  let ret = new Matrix(this);

  for (var _i = 0, _args = args; _i < _args.length; _i++) {
    let m = _args[_i];
    if (!(m instanceof Matrix)) m = new Matrix(m);
    ret = new Matrix({
      xx: ret[0] * m[0] + ret[1] * m[3],
      xy: ret[0] * m[1] + ret[1] * m[4],
      x0: ret[0] * m[2] + ret[1] * m[5] + ret[2],
      yx: ret[3] * m[0] + ret[4] * m[3],
      yy: ret[3] * m[1] + ret[4] * m[4],
      y0: ret[3] * m[2] + ret[4] * m[5] + ret[5]
    });
  }

  return ret;
};

Matrix.prototype.multiply_self = function (...args) {
  for (var _i2 = 0, _args2 = args; _i2 < _args2.length; _i2++) {
    let m = _args2[_i2];
    if (!(m instanceof Matrix)) m = new Matrix(m);
    Matrix.prototype.init.call(this, this[0] * m[0] + this[1] * m[3], this[0] * m[1] + this[1] * m[4], this[0] * m[2] + this[1] * m[5] + this[2], this[3] * m[0] + this[4] * m[3], this[3] * m[1] + this[4] * m[4], this[3] * m[2] + this[4] * m[5] + this[5]);
  }

  return this;
};

Matrix.prototype.toObject = function () {
  const xx = this.xx,
        xy = this.xy,
        x0 = this.x0,
        yx = this.yx,
        yy = this.yy,
        y0 = this.y0;
  return {
    xx,
    xy,
    x0,
    yx,
    yy,
    y0
  };
};

Matrix.prototype.entries = function () {
  return Object.entries(Matrix.prototype.toObject.call(this));
};

Matrix.prototype.clone = function () {
  return new Matrix(Array.from(this));
};

Matrix.prototype.row = function (row) {
  let i = row * 3;
  return Array.prototype.slice.call(this, i, i + 3);
};

Matrix.prototype.rows = function () {
  let ret = [];

  for (let i = 0; i < 9; i += 3) ret.push([this[i + 0], this[i + 1], this[i + 2]]);

  return ret;
};

Matrix.prototype.toArray = function () {
  return Array.from(this);
};

Matrix.prototype.isIdentity = function () {
  return _util.Util.equals(this, Matrix.IDENTITY);
};

Matrix.prototype.determinant = function () {
  return this[0] * (this[4] * this[8] - this[5] * this[7]) + this[1] * (this[5] * this[6] - this[3] * this[8]) + this[2] * (this[3] * this[7] - this[4] * this[6]);
};

Matrix.prototype.invert = function () {
  const det = Matrix.prototype.determinant.call(this);
  return new Matrix([(this[4] * this[8] - this[5] * this[7]) / det, (this[2] * this[7] - this[1] * this[8]) / det, (this[1] * this[5] - this[2] * this[4]) / det, (this[5] * this[6] - this[3] * this[8]) / det, (this[0] * this[8] - this[2] * this[6]) / det, (this[2] * this[3] - this[0] * this[5]) / det, (this[3] * this[7] - this[4] * this[6]) / det, (this[6] * this[1] - this[0] * this[7]) / det, (this[0] * this[4] - this[1] * this[3]) / det]);
};

Matrix.prototype.scalar_product = function (f) {
  return new Matrix({
    xx: this[0] * f,
    xy: this[1] * f,
    x0: this[2] * f,
    yx: this[3] * f,
    yy: this[4] * f,
    y0: this[5] * f
  });
};

Matrix.prototype.toSource = function (construct = false, multiline = true) {
  const nl = multiline ? '\n' : '';
  const rows = Matrix.prototype.rows.call(this);
  const src = "".concat(rows.map(row => row.join(',')).join(multiline ? ',\n ' : ','));
  return construct ? "new Matrix([".concat(nl).concat(src).concat(nl, "])") : "[".concat(src, "]");
};

Matrix.prototype.toString = function (separator = ' ') {
  let rows = Matrix.prototype.rows.call(this);
  let name = rows[0].length == 3 ? 'matrix' : 'matrix3d';

  if (rows[0].length == 3) {
    rows = [['a', 'b', 'c', 'd', 'e', 'f'].map(k => this[Matrix.prototype.keyIndex[k]])];
  }

  return "".concat(name, "(") + rows.map(row => row.join(',' + separator)).join(',' + separator) + ')';
};

Matrix.prototype.toSVG = function () {
  return 'matrix(' + ['a', 'b', 'c', 'd', 'e', 'f'].map(k => this[Matrix.prototype.keyIndex[k]]).join(',') + ')';
};

Matrix.prototype.equals = function (other) {
  return Array.prototype.every.call((n, i) => other[i] == n);
};

Matrix.prototype.transform_distance = function (d) {
  const k = 'x' in d && 'y' in d ? ['x', 'y'] : 'width' in d && 'height' in d ? ['width', 'height'] : [0, 1];
  const x = this[0] * d[k[0]] + this[2] * d[k[1]];
  const y = this[1] * d[k[0]] + this[3] * d[k[1]];
  d[k[0]] = x;
  d[k[1]] = y;
  return d;
};

Matrix.prototype.transform_xy = function (x, y) {
  const m0 = this.row(0);
  const m1 = this.row(1);
  return [m0[0] * x + m0[1] * y + m0[2], m1[0] * x + m1[1] * y + m0[2]];
};

Matrix.prototype.transform_point = function (p) {
  const k = 'x' in p && 'y' in p ? ['x', 'y'] : [0, 1];
  const m0 = this.row(0);
  const m1 = this.row(1);
  const x = m0[0] * p[k[0]] + m0[1] * p[k[1]] + m0[2];
  const y = m1[0] * p[k[0]] + m1[1] * p[k[1]] + m1[2];
  p[k[0]] = x;
  p[k[1]] = y;
  return p;
};

Matrix.prototype.transform_points = function (list) {
  for (let i = 0; i < list.length; i++) list[i] = Matrix.prototype.transform_point.call(this, list[i]);

  return this;
};

Matrix.prototype.transform_wh = function (width, height) {
  const w = this[0] * width + this[1] * height;
  const h = this[3] * width + this[4] * height;
  return [w, h];
};

Matrix.prototype.transform_size = function (s) {
  const w = this[0] * s.width + this[1] * s.height;
  const h = this[3] * s.width + this[4] * s.height;
  s.width = w;
  s.height = h;
  return s;
};

Matrix.prototype.transform_rect = function (rect) {
  if ('x' in rect && 'y' in rect) {
    Matrix.prototype.transform_point.call(this, rect);
  } else if ('x1' in rect && 'y1' in rect) {
    const _Matrix$prototype$tra = Matrix.prototype.transform_xy.call(this, rect.x1, rect.y1),
          _Matrix$prototype$tra2 = (0, _slicedToArray2.default)(_Matrix$prototype$tra, 2),
          x = _Matrix$prototype$tra2[0],
          y = _Matrix$prototype$tra2[1];

    rect.x1 = x;
    rect.y1 = y;
  }

  if ('width' in rect && 'width' in rect) {
    Matrix.prototype.transform_size.call(this, rect);
  } else if ('x2' in rect && 'y2' in rect) {
    const _Matrix$prototype$tra3 = Matrix.prototype.transform_xy.call(this, rect.x2, rect.y2),
          _Matrix$prototype$tra4 = (0, _slicedToArray2.default)(_Matrix$prototype$tra3, 2),
          x = _Matrix$prototype$tra4[0],
          y = _Matrix$prototype$tra4[1];

    rect.x2 = x;
    rect.y2 = y;
  }

  return rect;
};

Matrix.prototype.point_transformer = function () {
  const matrix = this;
  return point => matrix.transform_point(point);
};

Matrix.prototype.transformer = function () {
  const matrix = this;
  return {
    point: _point => matrix.transform_point(_point),
    xy: (x, y) => matrix.transform_xy(x, y),
    size: s => matrix.transform_size(s),
    wh: (w, h) => matrix.transform_wh(w, h),
    rect: _rect => matrix.transform_rect(_rect),
    points: list => matrix.transform_points(list),
    distance: d => matrix.transform_distance(d)
  };
};

Matrix.prototype.scale_sign = function () {
  return this[0] * this[4] < 0 || this[1] * this[3] > 0 ? -1 : 1;
};

Matrix.prototype.affine_transform = function (a, b) {
  var xx, yx, xy, yy, tx, ty;
  if (typeof a == 'object' && a.toPoints !== undefined) a = a.toPoints();
  if (typeof b == 'object' && b.toPoints !== undefined) b = b.toPoints();
  xx = (b[0].x * a[1].y + b[1].x * a[2].y + b[2].x * a[0].y - b[0].x * a[2].y - b[1].x * a[0].y - b[2].x * a[1].y) / (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
  yx = (b[0].y * a[1].y + b[1].y * a[2].y + b[2].y * a[0].y - b[0].y * a[2].y - b[1].y * a[0].y - b[2].y * a[1].y) / (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
  xy = (a[0].x * b[1].x + a[1].x * b[2].x + a[2].x * b[0].x - a[0].x * b[2].x - a[1].x * b[0].x - a[2].x * b[1].x) / (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
  yy = (a[0].x * b[1].y + a[1].x * b[2].y + a[2].x * b[0].y - a[0].x * b[2].y - a[1].x * b[0].y - a[2].x * b[1].y) / (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
  tx = (a[0].x * a[1].y * b[2].x + a[1].x * a[2].y * b[0].x + a[2].x * a[0].y * b[1].x - a[0].x * a[2].y * b[1].x - a[1].x * a[0].y * b[2].x - a[2].x * a[1].y * b[0].x) / (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
  ty = (a[0].x * a[1].y * b[2].y + a[1].x * a[2].y * b[0].y + a[2].x * a[0].y * b[1].y - a[0].x * a[2].y * b[1].y - a[1].x * a[0].y * b[2].y - a[2].x * a[1].y * b[0].y) / (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
  this.set_row.call(this, 0, xx, xy, tx);
  this.set_row.call(this, 1, yx, yy, ty);
  this.set_row.call(this, 2, 0, 0, 1);
  return this;
};

Matrix.getAffineTransform = (a, b) => {
  var matrix = new Matrix();
  matrix.affine_transform(a, b);
  return matrix;
};

Matrix.prototype.decompose = function (degrees = false, useLU = true) {
  var a = this[0],
      b = this[3],
      c = this[1],
      d = this[4];
  var translate = {
    x: this[2],
    y: this[5]
  },
      rotation = 0,
      scale = {
    x: 1,
    y: 1
  },
      skew = {
    x: 0,
    y: 0
  };
  var determ = a * d - b * c,
      r,
      s;

  const calcFromValues = (r1, m1, r2, m2) => {
    if (!isFinite(r1)) return r2;else if (!isFinite(r2)) return r1;
    m1 = Math.abs(m1), m2 = Math.abs(m2);
    return _util.Util.roundTo((m1 * r1 + m2 * r2) / (m1 + m2), 0.0001);
  };

  let sign = Matrix.prototype.scale_sign.call(this);
  rotation = (Math.atan2(this[3], this[4]) + Math.atan2(-sign * this[1], sign * this[0])) / 2;
  const cos = Math.cos(rotation),
        sin = Math.sin(rotation);
  scale = {
    x: calcFromValues(this[0] / cos, cos, -this[1] / sin, sin),
    y: calcFromValues(this[4] / cos, cos, this[3] / sin, sin)
  };
  return {
    translate,
    rotate: degrees === true ? _util.Util.roundTo(Matrix.rad2deg(rotation), 0.1) : rotation,
    scale: scale,
    skew: skew
  };
};

Matrix.prototype.init_identity = function () {
  return Matrix.prototype.init.call(this, 1, 0, 0, 0, 1, 0, 0, 0, 1);
};

Matrix.prototype.is_identity = function () {
  return Matrix.prototype.equals.call(this, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
};

Matrix.prototype.init_translate = function (tx, ty) {
  return Matrix.prototype.init.call(this, 1, 0, tx, 0, 1, ty);
};

Matrix.prototype.init_scale = function (sx, sy) {
  if (sy === undefined) sy = sx;
  return Matrix.prototype.init.call(this, sx, 0, 0, 0, sy, 0);
};

Matrix.prototype.init_rotate = function (angle, deg = false) {
  const rad = deg ? Matrix.deg2rad(angle) : angle;
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  return Matrix.prototype.init.call(this, c, -s, 0, s, c, 0);
};

Matrix.prototype.init_skew = function (x, y, deg = false) {
  const ax = Math.tan(deg ? Matrix.deg2rad(x) : x);
  const ay = Math.tan(deg ? Matrix.deg2rad(y) : y);
  return Matrix.prototype.init.call(this, 1, ax, 0, ay, 1, 0);
};

Matrix.identity = () => new Matrix([1, 0, 0, 0, 1, 0, 0, 0, 1]);

Matrix.IDENTITY = Object.freeze(Matrix.identity());

Matrix.rad2deg = radians => radians * 180 / Math.PI;

Matrix.deg2rad = degrees => degrees * Math.PI / 180;

for (var _i3 = 0, _arr = ['toObject', 'init', 'toArray', 'isIdentity', 'determinant', 'invert', 'multiply', 'scalar_product', 'toSource', 'toString', 'toSVG', 'equals', 'init_identity', 'is_identity', 'init_translate', 'init_scale', 'init_rotate', 'scale_sign', 'decompose', 'transformer']; _i3 < _arr.length; _i3++) {
  let name = _arr[_i3];

  Matrix[name] = (...args) => Matrix.prototype[name].call(...args);
}

for (var _i4 = 0, _arr2 = ['translate', 'scale', 'rotate', 'skew']; _i4 < _arr2.length; _i4++) {
  let name = _arr2[_i4];

  Matrix[name] = (...args) => Matrix.prototype['init_' + name].call(new Matrix(), ...args);
}

for (var _i5 = 0, _arr3 = ['translate', 'scale', 'rotate', 'skew']; _i5 < _arr3.length; _i5++) {
  let name = _arr3[_i5];

  Matrix.prototype[name] = function (...args) {
    return Matrix.prototype.multiply.call(this, new Matrix()['init_' + name](...args));
  };

  Matrix.prototype[name + '_self'] = function (...args) {
    return Matrix.prototype.multiply_self.call(this, new Matrix()['init_' + name](...args));
  };
}

for (var _i6 = 0, _arr4 = ["transform_distance", "transform_xy", "transform_point", "transform_points", "transform_wh", "transform_size", "transform_rect", "affine_transform"]; _i6 < _arr4.length; _i6++) {
  let name = _arr4[_i6];
  const method = Matrix.prototype[name];

  if (method.length == 2) {
    Matrix[name] = _util.Util.curry((m, a, b) => Matrix.prototype[name].call(m, a, b));
  } else if (method.length == 1) {
    Matrix[name] = _util.Util.curry((m, a) => Matrix.prototype[name].call(m, a));
  }
}

const isMatrix = m => _util.Util.isObject(m) && (m instanceof Matrix || m.length !== undefined && (m.length == 6 || m.length == 9) && m.every(el => typeof el == 'number'));

exports.isMatrix = isMatrix;
