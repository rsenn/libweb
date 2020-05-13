"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Matrix = Matrix;
exports.isMatrix = exports.MatrixProps = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es7.object.entries");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _util = require("../util.cjs");

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
    return (m1 * r1 + m2 * r2) / (m1 + m2);
  };

  if (useLU) {
    if (b) {
      let sign = Matrix.prototype.scale_sign.call(this);
      rotation = (Math.atan2(this[3], this[4]) + Math.atan2(-sign * this[1], sign * this[0])) / 2;
      const cos = Math.cos(rotation),
            sin = Math.sin(rotation);
      scale = {
        x: calcFromValues(this[0] / cos, cos, -this[1] / sin, sin),
        y: calcFromValues(this[4] / cos, cos, this[3] / sin, sin)
      };
    } else if (a) {
      skew = {
        x: Math.atan(c / a),
        y: Math.atan(b / a)
      };
      scale = {
        x: a,
        y: determ / a
      };
    } else {
      scale = {
        x: c,
        y: d
      };
      skew.x = Math.PI * 0.25;
    }
  } else {
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
      scale = {
        x: 0,
        y: 0
      };
    }
  }

  return {
    translate: translate,
    rotation: degrees ? _util.Util.roundTo(Matrix.rad2deg(rotation), 0.1) : rotation,
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

Matrix.IDENTITY = Object.freeze(new Matrix([1, 0, 0, 0, 1, 0, 0, 0, 1]));

Matrix.rad2deg = radians => radians * 180 / Math.PI;

Matrix.deg2rad = degrees => degrees * Math.PI / 180;

for (var _i3 = 0, _arr = ['toObject', 'init', 'toArray', 'isIdentity', 'determinant', 'invert', 'multiply', 'scalar_product', 'toSource', 'toString', 'toSVG', 'equals', 'init_identity', 'is_identity', 'init_translate', 'init_scale', 'init_rotate', 'scale_sign', 'decompose', 'affine_transform']; _i3 < _arr.length; _i3++) {
  let name = _arr[_i3];

  Matrix[name] = (...args) => Matrix.prototype[name].call(...args);
}

for (var _i4 = 0, _arr2 = ['identity', 'translate', 'scale', 'rotate', 'skew']; _i4 < _arr2.length; _i4++) {
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

const isMatrix = m => _util.Util.isObject(m) && (m instanceof Matrix || m.length !== undefined && (m.length == 6 || m.length == 9) && m.every(el => typeof el == 'number'));

exports.isMatrix = isMatrix;
