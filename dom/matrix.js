import { Util } from '../util.js';

export function Matrix(arg) {
  let ret = this instanceof Matrix ? this : [undefined, 0, 0, undefined, 0, 0, undefined, 0, 0];

  if(arg instanceof Array) {
    for(let i = 0; i < arg.length; i++) ret[i] = arg[i];
  } else if(typeof arg === 'string') {
    if(/matrix\([^)]*\)/.test(arg)) {
      let [xx, xy, x0, yx, yy, y0] = [...arg.matchAll(/[-.0-9]+/g)].map(m => parseFloat(m[0]));
      ret[0] = xx;
      ret[1] = xy;
      ret[2] = x0;
      ret[3] = yx;
      ret[4] = yy;
      ret[5] = y0;
    }
  } else if(arg && typeof arg == 'object') {
    if(arg.xx !== undefined && arg.yx !== undefined && arg.xy !== undefined && arg.yy !== undefined && arg.x0 !== undefined && arg.y0 !== undefined) {
      ret[0] = arg.xx;
      ret[1] = arg.xy;
      ret[2] = arg.x0;
      ret[3] = arg.yx;
      ret[4] = arg.yy;
      ret[5] = arg.y0;
    } else if(arg.a !== undefined && arg.b !== undefined && arg.c !== undefined && arg.d !== undefined && arg.e !== undefined && arg.f !== undefined) {
      ret[0] = arg.a; // xx
      ret[1] = arg.c; // xy
      ret[2] = arg.e; // x0
      ret[3] = arg.b; // yx
      ret[4] = arg.d; // yy
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
  if(ret[0] === undefined) Matrix.prototype.set_row.call(ret, 0, 1, 0, 0);
  if(ret[3] === undefined) Matrix.prototype.set_row.call(ret, 1, 0, 1, 0);
  if(ret[6] === undefined) Matrix.prototype.set_row.call(ret, 2, 0, 0, 1);

  if(!(this instanceof Matrix)) return Object.assign(ret, Matrix.prototype);
}

Matrix.prototype = [
  /*1, 0, 0, 0, 1, 0, 0, 0, 1*/
];

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

Matrix.prototype.at = function(key) {
  return this[Matrix.prototype.keyIndex[key]];
};

export const MatrixProps = Object.keys(Matrix.prototype.keyIndex).reduce((acc, k) => {
  const i = Matrix.prototype.keyIndex[k];
  return {
    ...acc,
    [k]: {
      get: function() {
        return this[i];
      },
      set: function(v) {
        this[i] = v;
      },
      enumerable: true
    }
  };
}, {});

// prettier-ignore
Object.defineProperties(Matrix.prototype, {
  xx: {get: function() { return this[0]; }, set: function(v) {this[0] = v; }, enumerable: true },
  xy: {get: function() { return this[1]; }, set: function(v) {this[1] = v; }, enumerable: true },
  x0: {get: function() { return this[2]; }, set: function(v) {this[2] = v; }, enumerable: true },
  yx: {get: function() { return this[3]; }, set: function(v) {this[3] = v; }, enumerable: true },
  yy: {get: function() { return this[4]; }, set: function(v) {this[4] = v; }, enumerable: true },
  y0: {get: function() { return this[5]; }, set: function(v) {this[5] = v; }, enumerable: true }
});

Matrix.prototype.row = function(row) {
  let i = row * 3;
  return Array.prototype.slice.call(this, i, i + 3);
};

Matrix.prototype.init = function() {
  let args = [...arguments];
  if(args.length == 6) args.push(0);
  if(args.length == 7) args.push(0);
  if(args.length == 8) args.push(1);
  for(let i = 0; i < args.length; i++) this[i] = args[i];
  return this;
};
Matrix.prototype.set_row = function() {
  let args = [...arguments];
  let row = args.shift();
  let start = row * 3;
  for(let i = 0; i < args.length; i++) this[start + i] = args[i];
  return this;
};
Matrix.prototype.rows = function() {
  let ret = [];
  for(let i = 0; i < 9; i += 3) {
    let row = [];
    for(let j = 0; j < 3; j++) {
      row.push(this[i + j]);
    }
    ret.push(row);
  }
  return ret;
};
/*Matrix.prototype.multiply = function(m) {
  const r = [this[0] * m[0] + this[1] * m[3], this[0] * m[1] + this[1] * m[4], this[0] * m[2] + this[1] * m[5] + this[2], this[3] * m[0] + this[4] * m[3], this[3] * m[1] + this[4] * m[4], this[3] * m[2] + this[4] * m[5] + this[5]];
  return this.init.apply(this, r);
};*/
Matrix.prototype.determinant = function() {
  return this[0] * (this[4] * this[8] - this[5] * this[7]) + this[1] * (this[5] * this[6] - this[3] * this[8]) + this[2] * (this[3] * this[7] - this[4] * this[6]);
};

Matrix.prototype.invert = function() {
  const det = Matrix.prototype.determinant.call(this);
  return new Matrix([
    (this[4] * this[8] - this[5] * this[7]) / det,
    (this[2] * this[7] - this[1] * this[8]) / det,
    (this[1] * this[5] - this[2] * this[4]) / det,

    (this[5] * this[6] - this[3] * this[8]) / det,
    (this[0] * this[8] - this[2] * this[6]) / det,
    (this[2] * this[3] - this[0] * this[5]) / det,

    (this[3] * this[7] - this[4] * this[6]) / det,
    (this[6] * this[1] - this[0] * this[7]) / det,
    (this[0] * this[4] - this[1] * this[3]) / det
  ]);
};
Matrix.prototype.multiply = function(...args) {
  let ret = new Matrix(this);
  for(let m of args) {
    if(!(m instanceof Matrix)) m = new Matrix(m);
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

Matrix.prototype.scalar_product = function(f) {
  return new Matrix({
    xx: this[0] * f,
    xy: this[1] * f,
    x0: this[2] * f,
    yx: this[3] * f,
    yy: this[4] * f,
    y0: this[5] * f
  });
};

Matrix.prototype.translate = function(tx, ty) {
  const m = new Matrix({ xx: 1, xy: 0, x0: tx, yx: 0, yy: 1, y0: ty });
  return Matrix.prototype.multiply.call(this, m);
};

Matrix.prototype.scale = function(sx, sy) {
  if(sy === undefined) sy = sx;
  const m = new Matrix({ xx: sx, xy: 0, x0: 0, yx: 0, yy: sy, y0: 0 });
  return Matrix.prototype.multiply.call(this, m);
};

Matrix.prototype.rotate = function(rad) {
  let m = new Matrix();
  Matrix.prototype.init_rotate.call(m, rad);
  return Matrix.prototype.multiply.call(this, m);
};

Matrix.prototype.toArray = function() {
  let k;
  let arr = [];
  for(k = 0; k < Matrix.prototype.keys.length; k++) {
    let key = Matrix.prototype.keys[k];
    arr.push(this[key] || this[k]);
  }
  return arr;
};

Matrix.prototype.toSource = function() {
  let rows = Matrix.prototype.rows.call(this);
  return `new Matrix([\n  ` + rows.map(row => row.join(', ')).join(',\n  ') + '\n])';
};

Matrix.prototype.toString = function() {
  /*
  if(Matrix.prototype.is_identity.call(this))
    return '';
*/
  let rows = Matrix.prototype.rows.call(this);
  let name = rows[0].length == 3 ? 'matrix' : 'matrix3d';

  if(rows[0].length == 3) {
    rows = [['a', 'b', 'c', 'd', 'e', 'f'].map(k => this[Matrix.prototype.keyIndex[k]])];
  }

  return `${name}(` + rows.map(row => row.join(', ')).join(', ') + ')';
};

Matrix.prototype.toSVG = function() {
  return 'matrix(' + ['a', 'b', 'c', 'd', 'e', 'f'].map(k => this[Matrix.prototype.keyIndex[k]]).join(',') + ')';
};

Matrix.prototype.equals = function(other) {
  for(let i = 0; i < 9; i++) {
    if(this[i] != other[i]) return false;
  }
  return true;
};

Matrix.prototype.init_identity = function() {
  Matrix.prototype.set_row.call(this, 0, 1, 0, 0);
  Matrix.prototype.set_row.call(this, 1, 0, 1, 0);
  Matrix.prototype.set_row.call(this, 2, 0, 0, 1);
  return this;
};
Matrix.prototype.is_identity = function() {
  return Matrix.prototype.equals.call(this, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
};

Matrix.prototype.init_translate = function(tx, ty) {
  Matrix.prototype.splice.call(this, 0, this.length, 1, 0, tx, 0, 1, ty, 0, 0, 1);
  return this;
};

Matrix.prototype.init_scale = function(sx, sy) {
  if(sy === undefined) sy = sx;
  Matrix.prototype.set_row.call(this, 0, sx, 0, 0);
  Matrix.prototype.set_row.call(this, 1, 0, sy, 0);
  Matrix.prototype.set_row.call(this, 2, 0, 0, 1);
  return this;
};

Matrix.prototype.init_rotate = function(rad) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  Matrix.prototype.set_row.call(this, 0, c, -s, 0);
  Matrix.prototype.set_row.call(this, 1, s, c, 0);
  Matrix.prototype.set_row.call(this, 2, 0, 0, 1);
  return this;
};

Matrix.prototype.transform_distance = function(p) {
  const x = this.xx * p.x + this.xy * p.y;
  const y = this.yx * p.x + this.yy * p.y;
  p.x = x;
  p.y = y;
  return p;
};

Matrix.prototype.transform_xy = function(x, y) {
  return [this[0] * x + this[1] * y + this[2], this[3] * x + this[4] * y + this[5]];
};

Matrix.prototype.transform_point = function(...args) {
  const p = args.length == 2 ? { x: args[0], y: args[1] } : args[0];
  const x = this[0] * p.x + this[1] * p.y + this[2];
  const y = this[3] * p.x + this[4] * p.y + this[5];
  p.x = x;
  p.y = y;
  return p;
};

Matrix.prototype.transform_points = function(pointList) {
  for(let i = 0; i < pointList.length; i++) {
    const p = Matrix.prototype.transform_point.call(this, pointList[i]);
    pointList[i].x = p.x;
    pointList[i].y = p.y;
  }
  return this;
};

Matrix.prototype.transform_wh = function(width, height) {
  const w = this[0] * width + this[1] * height;
  const h = this[3] * width + this[4] * height;
  return [w, h];
};

Matrix.prototype.transform_size = function(s) {
  const w = this[0] * s.width + this[1] * s.height;
  const h = this[3] * s.width + this[4] * s.height;
  s.width = w;
  s.height = h;
  return s;
};

Matrix.prototype.transform_rect = function(rect) {
  if('x' in rect && 'y' in rect) {
    Matrix.prototype.transform_point.call(this, rect);
  } else if('x1' in rect && 'y1' in rect) {
    const [x, y] = Matrix.prototype.transform_xy.call(this, rect.x1, rect.y1);
    rect.x1 = x;
    rect.y1 = y;
  }
  if('width' in rect && 'width' in rect) {
    Matrix.prototype.transform_size.call(this, rect);
  } else if('x2' in rect && 'y2' in rect) {
    const [x, y] = Matrix.prototype.transform_xy.call(this, rect.x2, rect.y2);
    rect.x2 = x;
    rect.y2 = y;
  }
  return rect;
};

Matrix.prototype.point_transformer = function() {
  const m = this;
  return function(...args) {
    var matrix = m;
    return matrix.transform_point(...args);
  };
};

Matrix.prototype.scale_sign = function() {
  return this[0] * this[4] < 0 || this[1] * this[3] > 0 ? -1 : 1; // Number
};
Matrix.prototype.decompose = function(degrees = false, useLU = true) {
  var a = this[0],
    b = this[3],
    c = this[1],
    d = this[4];

  var translate = { x: this[2], y: this[5] },
    rotation = 0,
    scale = { x: 1, y: 1 },
    skew = { x: 0, y: 0 };

  var determ = a * d - b * c,
    r,
    s;

  const calcFromValues = (r1, m1, r2, m2) => {
    if(!isFinite(r1)) return r2;
    else if(!isFinite(r2)) return r1;
    (m1 = Math.abs(m1)), (m2 = Math.abs(m2));
    return (m1 * r1 + m2 * r2) / (m1 + m2);
  };

  if(useLU) {
    if(b) {
      let sign = Matrix.prototype.scale_sign.call(this);
      rotation = (Math.atan2(this[3], this[4]) + Math.atan2(-sign * this[1], sign * this[0])) / 2;
      const cos = Math.cos(rotation),
        sin = Math.sin(rotation);
      scale = {
        x: calcFromValues(this[0] / cos, cos, -this[1] / sin, sin),
        y: calcFromValues(this[4] / cos, cos, this[3] / sin, sin)
      };
    } else if(a) {
      skew = { x: Math.atan(c / a), y: Math.atan(b / a) };
      scale = { x: a, y: determ / a };
    } else {
      // a = b = 0
      scale = { x: c, y: d };
      skew.x = Math.PI * 0.25;
    }
  } else {
    // Apply the QR-like decomposition.
    if(a || b) {
      r = Math.sqrt(a * a + b * b);
      rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
      scale = { x: r, y: determ / r };
      skew.x = Math.atan((a * c + b * d) / (r * r));
    } else if(c || d) {
      s = Math.sqrt(c * c + d * d);
      rotation = Math.PI * 0.5 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
      scale = { x: determ / s, y: s };
      skew.y = Math.atan((a * c + b * d) / (s * s));
    } else {
      // a = b = c = d = 0
      scale = { x: 0, y: 0 };
    }
  }

  return {
    translate: translate,
    rotation: degrees ? Matrix.rad2deg(rotation) : rotation,
    scale: scale,
    skew: skew
  };
};

Matrix.prototype.affine_transform = function(a, b) {
  var xx, yx, xy, yy, tx, ty;
  if(typeof a == 'object' && a.toPoints !== undefined) a = a.toPoints();
  if(typeof b == 'object' && b.toPoints !== undefined) b = b.toPoints();
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

Matrix.init_identity = matrix => Matrix.prototype.init_identity.call(matrix);
Matrix.init_translate = (matrix, tx, ty) => Matrix.prototype.init_translate.call(matrix, tx, ty);
Matrix.init_scale = (matrix, sx, sy) => Matrix.prototype.init_identity.call(matrix, sx, sy);
Matrix.init_rotate = (matrix, rad) => Matrix.prototype.init_rotate.call(matrix, rad);

Matrix.translate = (matrix, tx, ty) => Matrix.prototype.translate.call(matrix, tx, ty);
Matrix.scale = (matrix, sx, sy) => Matrix.prototype.scale.call(matrix, sx, sy);
Matrix.rotate = (matrix, rad) => Matrix.prototype.rotate.call(matrix, rad);

Matrix.identity = Object.freeze(new Matrix().init_identity());
Matrix.rad2deg = radians => Util.roundTo((radians * 180) / Math.PI, 0.1);
Matrix.deg2rad = degrees => (degrees * Math.PI) / 180;

for(let name of ['toArray', 'toString', 'toSVG', 'point_transformer', 'product']) {
  Matrix[name] = points => Matrix.prototype[name].call(points);
}

export const isMatrix = m => m instanceof Matrix || (m.length !== undefined && m.length == 6 && m.every(el => typeof el == 'number'));
