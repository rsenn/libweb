import { Util } from '../util.js';

export function Matrix(arg) {
  let ret = this instanceof Matrix || new.target === Matrix ? this : [undefined, 0, 0, undefined, 0, 0, undefined, 0, 0];

  if(arg instanceof Array) {
    Matrix.prototype.init.call(ret, arg);
  } else if(typeof arg === 'number') {
    Matrix.prototype.init.apply(ret, arguments);
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
    Array.prototype.splice.call(ret, 0, ret.length, 1, 0, 0, 0, 1, 0, 0, 0, 1);
  }
  for(let i = 0; i < 9; i++) if(ret[i] === undefined) ret[i] = [1, 0, 0, 0, 1, 0, 0, 0, 1][i];

  /*if(ret.length !== 9)
  ret.length = 9;
*/
  /*delete ret.length;
if(!('length' in ret))
    Object.defineProperty(ret, "length", { value: 9, enumerable: false, writable: true, configurable: false });
*/
  /*
  if(ret[0] === undefined) { Matrix.prototype.set_row.call(ret, 0, 1, 0, 0);
  if(ret[3] === undefined) Matrix.prototype.set_row.call(ret, 1, 0, 1, 0);
  if(ret[6] === undefined) Matrix.prototype.set_row.call(ret, 2, 0, 0, 1);*/

  if(!(this instanceof Matrix)) return ret;

  // if(!(this instanceof Matrix)) return Object.assign(ret, Matrix.prototype);
}

Matrix.prototype.splice = Array.prototype.splice;
/*Util.copyEntries(Matrix.prototype, Util.getMethods(new Array(9), 1, (k,v) => typeof(k) ==  'string' && [k,v], r => r).slice(-18,-17));
Matrix.prototype.constructor = Matrix;
*/
//Matrix.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

//Object.assign(Matrix.prototype, new Array());

//Util.getMethods(new Array(9), 1, (k,v)=>(typeof(k) == 'symbol' || /(String|values)/i.test(k)) && [k,v]));

//new Array(9); //[ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];

/*   Matrix.prototype.constructor = Matrix;
                                 
delete Matrix.prototype.some;*/

Object.defineProperty(Matrix.prototype, 'length', { value: 9, enumerable: false, writable: true, configurable: false });

//Matrix.prototype = new Array(9);
//Object.assign(Matrix.prototype, Array.prototype);
/*
Object.assign(Matrix.prototype, {[0]:undefined, [1]:undefined, [2]:undefined, [3]:undefined, [4]:undefined, [5]:undefined, [6]:undefined, [7]:undefined, [8]:undefined });*/
/*
Matrix.prototype.constructor = Array;*/
// sed "s|this\[0\]|this.xx|g ;; s|this\[1\]|this.yx|g ;; s|this\[2\]|this.xy|g ;; s|this\[3\]|this.yy|g ;; s|this\[4\]|this.x0|g ;; s|this\[5\]|this.y0|g"
// sed "s|this\[0\]|xx|g ;; s|this\[1\]|yx|g ;; s|this\[2\]|xy|g ;; s|this\[3\]|yy|g ;; s|this\[4\]|x0|g ;; s|this\[5\]|y0|g"
// "s|this\[0\]|a|g ;; s|this\[1\]|b|g ;; s|this\[2\]|c|g ;; s|this\[3\]|d|g ;; s|this\[4\]|e|g ;; s|this\[5\]|f|g ;; s|this\[6\]|g|g ;; s|this\[7\]|h|g ;; s|this\[8\]|i|g"
//

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

export const MatrixProps = Object.entries(Matrix.prototype.keyIndex).reduce((acc, [k, i]) => ({
    ...acc,
    [k]: {
      get: function() {
        return this[i];
      }, set: function(v) {
        this[i] = v;
      }, enumerable: true
    }
  }),
  {}
);

//Object.defineProperties(Matrix.prototype, MatrixProps);

// prettier-ignore
/*Object.defineProperties(Matrix.prototype, {
  xx: {get: function() { return this[0]; }, set: function(v) {this[0] = v; }, enumerable: true },
  xy: {get: function() { return this[1]; }, set: function(v) {this[1] = v; }, enumerable: true },
  x0: {get: function() { return this[2]; }, set: function(v) {this[2] = v; }, enumerable: true },
  yx: {get: function() { return this[3]; }, set: function(v) {this[3] = v; }, enumerable: true },
  yy: {get: function() { return this[4]; }, set: function(v) {this[4] = v; }, enumerable: true },
  y0: {get: function() { return this[5]; }, set: function(v) {this[5] = v; }, enumerable: true }
});*/

//Object.defineProperties(Matrix.prototype,['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].reduce((acc,prop,i) => ({ ...acc, [prop]: { get: function() { return this[i]; }, set: function(v) { this[i] = v; } } }), {}));

Matrix.propDescriptors =MatrixProps;

Matrix.prototype.init = function(...args) {
  if(args.length == 1) args = args[0];
  if(args.length < 9) args = args.concat(Array.prototype.slice.call(Matrix.IDENTITY, args.length));

  Array.prototype.splice.call(this, 0, this.length, ...args);
  return this;
};

Matrix.prototype.set_row = function(...args) {
  const start = args.shift() * 3;
  const end = Math.max(3, args.length);
  for(let i = 0; i < end; i++) this[start + i] = args[i];
  return this;
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
Matrix.prototype.multiply_self = function(...args) {
  for(let m of args) {
    if(!(m instanceof Matrix)) m = new Matrix(m);
    Matrix.prototype.init.call(this, this[0] * m[0] + this[1] * m[3], this[0] * m[1] + this[1] * m[4], this[0] * m[2] + this[1] * m[5] + this[2], this[3] * m[0] + this[4] * m[3], this[3] * m[1] + this[4] * m[4], this[3] * m[2] + this[4] * m[5] + this[5]);
  }
  return this;
};

/*Matrix.prototype.values = function() {
  return Array.from({ ...this, length: 9 });
};*/
Matrix.prototype.toObject = function() {
  const { xx, xy, x0, yx, yy, y0 } = this;
  return { xx, xy, x0, yx, yy, y0 };
};
Matrix.prototype.entries = function() {
  return Object.entries(Matrix.prototype.toObject.call(this));
};
Matrix.prototype.clone = function() {
  return new Matrix(Array.from(this));
};
Matrix.prototype.row = function(row) {
  let i = row * 3;
  return Array.prototype.slice.call(this, i, i + 3);
};

Matrix.prototype.rows = function() {
  let ret = [];
  for(let i = 0; i < 9; i += 3) ret.push([this[i + 0], this[i + 1], this[i + 2]]);
  return ret;
};
Matrix.prototype.toArray = function() {
  return Array.from(this);
};
Matrix.prototype.isIdentity = function() {
  return Util.equals(this, Matrix.IDENTITY);
};

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

Matrix.prototype.toSource = function(construct = false, multiline = true) {
  const nl = multiline ? '\n' : '';
  const rows = Matrix.prototype.rows.call(this);
  const src = `${rows.map(row => row.join(',')).join(multiline ? ',\n ' : ',')}`;
  return construct ? `new Matrix([${nl}${src}${nl}])` : `[${src}]`;
};

Matrix.prototype.toString = function(separator = ' ') {
  let rows = Matrix.prototype.rows.call(this);
  let name = rows[0].length == 3 ? 'matrix' : 'matrix3d';

  if(rows[0].length == 3) {
    rows = [['a', 'b', 'c', 'd', 'e', 'f'].map(k => this[Matrix.prototype.keyIndex[k]])];
  }

  return `${name}(` + rows.map(row => row.join(',' + separator)).join(',' + separator) + ')';
};

Matrix.prototype.toSVG = function() {
  return 'matrix(' + ['a', 'b', 'c', 'd', 'e', 'f'].map(k => this[Matrix.prototype.keyIndex[k]]).join(',') + ')';
};

Matrix.prototype.equals = function(other) {
  return Array.prototype.every.call((n, i) => other[i] == n);
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

Matrix.prototype.transform_point = function(p) {
  const k = 'x' in p && 'y' in p ? ['x', 'y'] : [0, 1];
  const x = this[0] * p[k[0]] + this[1] * p[k[1]] + this[2];
  const y = this[3] * p[k[0]] + this[4] * p[k[1]] + this[5];
  p[k[0]] = x;
  p[k[1]] = y;
  return p;
};

Matrix.prototype.transform_points = function(list) {
  for(let i = 0; i < list.length; i++) list[i] = Matrix.prototype.transform_point.call(this, list[i]);
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
  const matrix = this;
  return function(...args) {
    return matrix.transform_point(...args);
  };
};

Matrix.prototype.scale_sign = function() {
  return this[0] * this[4] < 0 || this[1] * this[3] > 0 ? -1 : 1;
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

Matrix.prototype.decompose = function(degrees = false, useLU = true) {
  var a = this[0],
    b = this[3],
    c = this[1], d = this[4];

  var translate = { x: this[2], y: this[5] },
    rotation = 0,
    scale = { x: 1, y: 1 }, skew = { x: 0, y: 0 };

  var determ = a * d - b * c,
    r,
    s;

  const calcFromValues = (r1, m1, r2, m2) => {
    if(!isFinite(r1)) return r2;
    else if(!isFinite(r2)) return r1;
    (m1 = Math.abs(m1)), (m2 = Math.abs(m2));
    return Util.roundTo((m1 * r1 + m2 * r2) / (m1 + m2), 0.0001);
  };

  //if(useLU) {
  let sign = Matrix.prototype.scale_sign.call(this);
  rotation = (Math.atan2(this[3], this[4]) + Math.atan2(-sign * this[1], sign * this[0])) / 2;
  const cos = Math.cos(rotation), sin = Math.sin(rotation);
  scale = {
    x: calcFromValues(this[0] / cos, cos, -this[1] / sin, sin),
    y: calcFromValues(this[4] / cos, cos, this[3] / sin, sin)
  };
  /*  } else if(a) {
      skew = { x: Math.atan(c / a), y: Math.atan(b / a) };
      scale = { x: a, y: determ / a };
    } else {
      scale = { x: c, y: d };
      skew.x = Math.PI * 0.25;
    }*/
  /* } else {
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
      scale = { x: 0, y: 0 };
    }
  }*/

  return {
    translate,
    rotate: degrees === true ? Util.roundTo(Matrix.rad2deg(rotation), 0.1) : rotation,
    scale: scale,
    skew: skew
  };
};

Matrix.prototype.init_identity = function() {
  return Matrix.prototype.init.call(this, 1, 0, 0, 0, 1, 0, 0, 0, 1);
};
Matrix.prototype.is_identity = function() {
  return Matrix.prototype.equals.call(this, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
};
Matrix.prototype.init_translate = function(tx, ty) {
  return Matrix.prototype.init.call(this, 1, 0, tx, 0, 1, ty);
};

Matrix.prototype.init_scale = function(sx, sy) {
  if(sy === undefined) sy = sx;
  return Matrix.prototype.init.call(this, sx, 0, 0, 0, sy, 0);
};

Matrix.prototype.init_rotate = function(angle, deg = false) {
  const rad = deg ? Matrix.deg2rad(angle) : angle;
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  return Matrix.prototype.init.call(this, c, -s, 0, s, c, 0);
};
Matrix.prototype.init_skew = function(x, y, deg = false) {
  const ax = Math.tan(deg ? Matrix.deg2rad(x) : x);
  const ay = Math.tan(deg ? Matrix.deg2rad(y) : y);
  return Matrix.prototype.init.call(this, 1, ax, 0, ay, 1, 0);
};

Matrix.identity = () => new Matrix([1, 0, 0, 0, 1, 0, 0, 0, 1]);

Matrix.IDENTITY = Object.freeze(Matrix.identity());
Matrix.rad2deg = radians => (radians * 180) / Math.PI;
Matrix.deg2rad = degrees => (degrees * Math.PI) / 180;

for(let name of ['toObject', 'init', 'toArray', 'isIdentity', 'determinant', 'invert', 'multiply', 'scalar_product', 'toSource', 'toString', 'toSVG', 'equals', 'init_identity', 'is_identity', 'init_translate', 'init_scale', 'init_rotate', 'scale_sign', 'decompose', 'affine_transform']) {
  Matrix[name] = (...args) => Matrix.prototype[name].call(...args);
}

for(let name of ['translate', 'scale', 'rotate', 'skew']) {
  Matrix[name] = (...args) => Matrix.prototype['init_' + name].call(new Matrix(), ...args);
}

for(let name of ['translate', 'scale', 'rotate', 'skew']) {
  Matrix.prototype[name] = function(...args) {
    return Matrix.prototype.multiply.call(this, new Matrix()['init_' + name](...args));
  };
  Matrix.prototype[name + '_self'] = function(...args) {
    return Matrix.prototype.multiply_self.call(this, new Matrix()['init_' + name](...args));
  };
}

export const isMatrix = m => Util.isObject(m) && (m instanceof Matrix || (m.length !== undefined && (m.length == 6 || m.length == 9) && m.every(el => typeof el == 'number')));