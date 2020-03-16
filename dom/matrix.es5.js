"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Matrix = Matrix;
exports.isMatrix = exports.MatrixProps = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function Matrix(arg) {
  var ret = this instanceof Matrix ? this : [undefined, 0, 0, undefined, 0, 0, undefined, 0, 0];

  if (typeof arg === "string") {
    if (/matrix\([^)]*\)/.test(arg)) {
      var _map = (0, _toConsumableArray2["default"])(arg.matchAll(/[-.0-9]+/g)).map(function (m) {
        return parseFloat(m[0]);
      }),
          _map2 = (0, _slicedToArray2["default"])(_map, 6),
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
  } else if (arg && typeof arg == "object") {
    if (arg.xx !== undefined && arg.yx !== undefined && arg.xy !== undefined && arg.yy !== undefined && arg.x0 !== undefined && arg.y0 !== undefined) {
      ret[0] = arg.xx;
      ret[1] = arg.xy;
      ret[2] = arg.x0;
      ret[3] = arg.yx;
      ret[4] = arg.yy;
      ret[5] = arg.y0;
    } else if (arg.a !== undefined && arg.b !== undefined && arg.c !== undefined && arg.d !== undefined && arg.e !== undefined && arg.f !== undefined) {
      ret[0] = arg.a; // xx

      ret[3] = arg.b; // yx

      ret[1] = arg.c; // xy

      ret[4] = arg.d; // yy

      ret[2] = arg.e; // x0

      ret[5] = arg.f; // y0
    }
  } else {
    ret[0] = 1;
    ret[1] = 0;
    ret[2] = 0;
    ret[3] = 0;
    ret[4] = 1;
    ret[5] = 0;
  }

  if (ret[0] === undefined) Matrix.prototype.set_row.call(ret, 0, 1, 0, 0);
  if (ret[3] === undefined) Matrix.prototype.set_row.call(ret, 1, 0, 1, 0);
  if (ret[6] === undefined) Matrix.prototype.set_row.call(ret, 2, 0, 0, 1);
  if (!(this instanceof Matrix)) return Object.assign(ret, Matrix.prototype);
}

Matrix.prototype = [1, 0, 0, 0, 1, 0, 0, 0, 1];
Matrix.prototype.keys = ["xx", "xy", "x0", "yx", "yy", "y0"];
Matrix.prototype.keySeq = ["xx", "yx", "xy", "yy", "x0", "y0"];
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

var MatrixProps = Object.keys(Matrix.prototype.keyIndex).reduce(function (acc, k) {
  var i = Matrix.prototype.keyIndex[k];
  return _objectSpread({}, acc, (0, _defineProperty2["default"])({}, k, {
    get: function get() {
      return this[i];
    },
    set: function set(v) {
      this[i] = v;
    },
    enumerable: true
  }));
}, {}); // prettier-ignore

exports.MatrixProps = MatrixProps;
Object.defineProperties(Matrix.prototype, {
  xx: {
    get: function get() {
      return this[0];
    },
    set: function set(v) {
      this[0] = v;
    },
    enumerable: true
  },
  xy: {
    get: function get() {
      return this[1];
    },
    set: function set(v) {
      this[1] = v;
    },
    enumerable: true
  },
  x0: {
    get: function get() {
      return this[2];
    },
    set: function set(v) {
      this[2] = v;
    },
    enumerable: true
  },
  yx: {
    get: function get() {
      return this[3];
    },
    set: function set(v) {
      this[3] = v;
    },
    enumerable: true
  },
  yy: {
    get: function get() {
      return this[4];
    },
    set: function set(v) {
      this[4] = v;
    },
    enumerable: true
  },
  y0: {
    get: function get() {
      return this[5];
    },
    set: function set(v) {
      this[5] = v;
    },
    enumerable: true
  }
});

Matrix.prototype.row = function (row) {
  var i = row * 3;
  return Array.prototype.slice.call(this, i, i + 3);
};

Matrix.prototype.init = function () {
  var args = Array.prototype.slice.call(arguments);
  if (args.length == 6) args.push(0);
  if (args.length == 7) args.push(0);
  if (args.length == 8) args.push(1);

  for (var i = 0; i < args.length; i++) {
    this[i] = args[i];
  }

  return this;
};

Matrix.prototype.set_row = function () {
  var args = Array.prototype.slice.call(arguments);
  var row = args.shift();
  var start = row * 3;

  for (var i = 0; i < args.length; i++) {
    this[start + i] = args[i];
  }

  return this;
};

Matrix.prototype.rows = function () {
  var ret = [];

  for (var i = 0; i < this.length; i += 3) {
    var row = [];

    for (var j = 0; j < 3; j++) {
      row.push(this[i + j]);
    }

    ret.push(row);
  }

  return ret;
};

Matrix.prototype.multiply = function (m) {
  var r = [this[0] * m[0] + this[1] * m[3], this[0] * m[1] + this[1] * m[4], this[0] * m[2] + this[1] * m[5] + this[2], this[3] * m[0] + this[4] * m[3], this[3] * m[1] + this[4] * m[4], this[3] * m[2] + this[4] * m[5] + this[5]];
  return this.init.apply(this, r);
};

Matrix.prototype.product = function (m) {
  if (!(m instanceof Matrix)) m = new Matrix(m);
  return new Matrix({
    xx: this[0] * m[0] + this[1] * m[3],
    xy: this[0] * m[1] + this[1] * m[4],
    x0: this[0] * m[2] + this[1] * m[5] + this[2],
    yx: this[3] * m[0] + this[4] * m[3],
    yy: this[3] * m[1] + this[4] * m[4],
    y0: this[3] * m[2] + this[4] * m[5] + this[5]
  });
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

Matrix.prototype.translate = function (tx, ty) {
  var m = new Matrix({
    xx: 1,
    xy: 0,
    x0: tx,
    yx: 0,
    yy: 1,
    y0: ty
  });
  return Matrix.prototype.multiply.call(this, m);
};

Matrix.prototype.scale = function (sx, sy) {
  var m = new Matrix({
    xx: sx,
    xy: 0,
    x0: 0,
    yx: 0,
    yy: sy,
    y0: 0
  });
  return Matrix.prototype.multiply.call(this, m);
};

Matrix.prototype.rotate = function (rad) {
  var m = new Matrix();
  Matrix.prototype.init_rotate.call(m, rad);
  return Matrix.prototype.multiply.call(this, m);
};

Matrix.prototype.toArray = function () {
  var k;
  var arr = [];

  for (k = 0; k < Matrix.prototype.keys.length; k++) {
    var key = Matrix.prototype.keys[k];
    arr.push(this[key] || this[k]);
  }

  return arr;
};

Matrix.prototype.toString = function () {
  var rows = Matrix.prototype.rows.call(this);
  return "[\n  " + rows.map(function (row) {
    return "[" + row.join(", ") + "]";
  }).join(",\n  ") + "\n]";
};

Matrix.prototype.toSVG = function () {
  var _this = this;

  return "matrix(" + ["a", "b", "c", "d", "e", "f"].map(function (k) {
    return _this[Matrix.prototype.keyIndex[k]];
  }).join(",") + ")";
};

Matrix.prototype.init_identity = function () {
  Matrix.prototype.set_row.call(this, 0, 1, 0, 0);
  Matrix.prototype.set_row.call(this, 1, 0, 1, 0);
  Matrix.prototype.set_row.call(this, 2, 0, 0, 1);
  return this;
};

Matrix.prototype.init_translate = function (tx, ty) {
  Matrix.prototype.splice.call(this, 0, this.length, 1, 0, tx, 0, 1, ty, 0, 0, 1);
  return this;
};

Matrix.prototype.init_scale = function (sx, sy) {
  Matrix.prototype.set_row.call(this, 0, sx, 0, 0);
  Matrix.prototype.set_row.call(this, 1, 0, sy, 0);
  Matrix.prototype.set_row.call(this, 2, 0, 0, 1);
  return this;
};

Matrix.prototype.init_rotate = function (rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  Matrix.prototype.set_row.call(this, 0, c, -s, 0);
  Matrix.prototype.set_row.call(this, 1, s, c, 0);
  Matrix.prototype.set_row.call(this, 2, 0, 0, 1);
  return this;
};

Matrix.prototype.transform_distance = function (p) {
  var x = this.xx * p.x + this.xy * p.y;
  var y = this.yx * p.x + this.yy * p.y;
  p.x = x;
  p.y = y;
  return p;
};

Matrix.prototype.transform_point = function (p) {
  var x = this[0] * p.x + this[1] * p.y + this[2];
  var y = this[3] * p.x + this[4] * p.y + this[5];
  p.x = x;
  p.y = y;
  return p;
};

Matrix.prototype.transform_points = function (pointList) {
  for (var i = 0; i < pointList.length; i++) {
    var p = Matrix.prototype.transform_point.call(this, pointList[i]);
    pointList[i].x = p.x;
    pointList[i].y = p.y;
  }

  return this;
};

Matrix.prototype.transform_size = function (s) {
  var w = this[0] * s.width + this[1] * s.height;
  var h = this[3] * s.width + this[4] * s.height;
  s.width = w;
  s.height = h;
  return s;
};

Matrix.prototype.transform_rect = function (rect) {
  Matrix.prototype.transform_point.call(this, rect);
  Matrix.prototype.transform_size.call(this, rect);
  return rect;
};

Matrix.prototype.point_transformer = function () {
  var m = this;
  return function (p) {
    var matrix = m;
    return matrix.transform_point(p);
  };
};

Matrix.prototype.decompose = function () {
  var useLU = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
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

  if (useLU) {
    if (a) {
      skew = {
        x: Math.atan(c / a),
        y: Math.atan(b / a)
      };
      scale = {
        x: a,
        y: determ / a
      };
    } else if (b) {
      rotation = Math.PI * 0.5;
      scale = {
        x: b,
        y: determ / b
      };
      skew.x = Math.atan(d / b);
    } else {
      // a = b = 0
      scale = {
        x: c,
        y: d
      };
      skew.x = Math.PI * 0.25;
    }
  } else {
    // Apply the QR-like decomposition.
    if (a || b) {
      r = Math.sqrt(a * a + b * b);
      rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
      scale = {
        x: r,
        y: determ / r
      };
      skew.x = Math.atan((a * c + b * d) / (r * r));
    } else if (c || d) {
      s = Math.sqrt(c * c + d * d);
      rotation = Math.PI * 0.5 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
      scale = {
        x: determ / s,
        y: s
      };
      skew.y = Math.atan((a * c + b * d) / (s * s));
    } else {
      // a = b = c = d = 0
      scale = {
        x: 0,
        y: 0
      };
    }
  }

  return {
    translate: translate,
    rotation: rotation,
    scale: scale,
    skew: skew
  };
};

Matrix.prototype.affine_transform = function (a, b) {
  var xx, yx, xy, yy, tx, ty;
  if (typeof a == "object" && a.toPoints !== undefined) a = a.toPoints();
  if (typeof b == "object" && b.toPoints !== undefined) b = b.toPoints();
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

Matrix.getAffineTransform = function (a, b) {
  var matrix = new Matrix();
  matrix.affine_transform(a, b);
  return matrix;
};

Matrix.init_identity = function (matrix) {
  return Matrix.prototype.init_identity.call(matrix);
};

Matrix.init_translate = function (matrix, tx, ty) {
  return Matrix.prototype.init_translate.call(matrix, tx, ty);
};

Matrix.init_scale = function (matrix, sx, sy) {
  return Matrix.prototype.init_identity.call(matrix, sx, sy);
};

Matrix.init_rotate = function (matrix, rad) {
  return Matrix.prototype.init_rotate.call(matrix, rad);
};

Matrix.translate = function (matrix, tx, ty) {
  return Matrix.prototype.translate.call(matrix, tx, ty);
};

Matrix.scale = function (matrix, sx, sy) {
  return Matrix.prototype.identity.call(matrix, sx, sy);
};

Matrix.rotate = function (matrix, rad) {
  return Matrix.prototype.rotate.call(matrix, rad);
};

var _loop = function _loop() {
  var name = _arr[_i];

  Matrix[name] = function (points) {
    return Matrix.prototype[name].call(points);
  };
};

for (var _i = 0, _arr = ["toArray", "toString", "toSVG", "point_transformer"]; _i < _arr.length; _i++) {
  _loop();
}

var isMatrix = function isMatrix(m) {
  return m instanceof Matrix || m.length !== undefined && m.length == 6 && m.every(function (el) {
    return typeof el == "number";
  });
};

exports.isMatrix = isMatrix;
