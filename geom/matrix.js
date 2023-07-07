import { curry, define, defineGetter, getMethods, immutableClass, isObject, roundTo, inspectSymbol } from '../misc.js';

function matrixMultiply(a, b) {
  var result = [];
  for(let i = 0; i < a.length; i++) {
    result[i] = [];
    for(let j = 0; j < b[0].length; j++) {
      var sum = 0;
      for(let k = 0; k < a[0].length; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

function matrixMultiplyAll(r, ...args) {
  for(let m of args) r = matrixMultiply(r, m);
  return r;
}

export function Matrix(...args) {
  let arg = args[0];
  let ret = this instanceof Matrix || new.target === Matrix ? this : [undefined, 0, 0, undefined, 0, 0, undefined, 0, 0];

  const isObj = isObject(arg);

  if(isObj && arg.xx !== undefined && arg.yx !== undefined && arg.xy !== undefined && arg.yy !== undefined && arg.x0 !== undefined && arg.y0 !== undefined) {
    ret[0] = arg.xx;
    ret[1] = arg.xy;
    ret[2] = arg.x0;
    ret[3] = arg.yx;
    ret[4] = arg.yy;
    ret[5] = arg.y0;
  } else if(isObj && arg.a !== undefined && arg.b !== undefined && arg.c !== undefined && arg.d !== undefined && arg.e !== undefined && arg.f !== undefined) {
    ret[0] = arg.a; //xx
    ret[1] = arg.c; //xy
    ret[2] = arg.e; //x0
    ret[3] = arg.b; //yx
    ret[4] = arg.d; //yy
    ret[5] = arg.f; //y0
  } else if(args.length >= 6) {
    Matrix.prototype.init.call(ret, ...args);
    /*} else if(typeof arg === 'number') {
    Matrix.prototype.init.call(ret, ...args);*/
  } else if(typeof arg === 'string' && /matrix\([^)]*\)/.test(arg)) {
    let [xx, yx, xy, yy, x0, y0] = [...arg.matchAll(/[-.0-9]+([Ee][-+]?[0-9]+|)/g)].map(m => parseFloat(m[0]));
    ret[0] = xx;
    ret[1] = xy;
    ret[2] = x0;
    ret[3] = yx;
    ret[4] = yy;
    ret[5] = y0;
  } else {
    Array.prototype.splice.call(ret, 0, ret.length, 1, 0, 0, 0, 1, 0, 0, 0, 1);
  }
  for(let i = 0; i < 9; i++) if(ret[i] === undefined) ret[i] = [1, 0, 0, 0, 1, 0, 0, 0, 1][i];

  if(!(this instanceof Matrix)) return ret;
}

Matrix.DEG2RAD = Math.PI / 180;
Matrix.RAD2DEG = 180 / Math.PI;

/*
Object.assign(Matrix.prototype, Array.prototype);
  
Matrix.prototype.splice = Array.prototype.splice;
Matrix.prototype.slice = Array.prototype.slice;
*/

Object.assign(Matrix.prototype, new Array() || getMethods(Array.prototype));

Matrix.prototype.constructor = Matrix;

Object.defineProperty(Matrix, Symbol.species, {
  get() {
    return Matrix;
  }
});

defineGetter(Matrix.prototype, Symbol.toStringTag, function() {
  return `[object ${Matrix.prototype.toString.apply(this, arguments).replace(/^[^(]*/g, '')}]`;
});
Matrix.prototype[Symbol.isConcatSpreadable] = false;

Object.defineProperty(Matrix.prototype, 'length', {
  value: 6,
  enumerable: false,
  writable: true,
  configurable: false
});

Matrix.prototype.keys = ['xx', 'xy', 'x0', 'yx', 'yy', 'y0'];
Matrix.prototype.keySeq = ['xx', 'yx', 'xy', 'yy', 'x0', 'y0'];

const keyIndexes = {
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
Matrix.keyIndexes = keyIndexes;
Matrix.valueNames = ['a', 'c', 'e', 'b', 'd', 'f'];

define(Matrix.prototype, {
  at(col, row = 0) {
    return this[row * 3 + col];
  },
  get(field) {
    if(typeof field == 'number' && field < this.length) return this[field];

    if((field = keyIndexes[field])) return this[field];
  },
  init(...args) {
    if(args.length == 1) args = args[0];

    if(Array.isArray(args[0])) {
      const [row0 = [0, 0, 0], row1 = [0, 0, 0], row2 = [0, 0, 0]] = args;

      Array.prototype.splice.call(this, 0, row0.length, ...row0);
      Array.prototype.splice.call(this, 3, row1.length, ...row1);
      Array.prototype.splice.call(this, 6, row2.length, ...row2);
    } else {
      Array.prototype.splice.call(this, 0, Math.min(this.length, args.length), ...args);
    }
    return this;
  },

  setRow(...args) {
    const start = args.shift() * 3;
    const end = Math.max(3, args.length);
    for(let i = 0; i < end; i++) this[start + i] = args[i];
    return this;
  },

  multiply(...args) {
    return Object.setPrototypeOf(matrixMultiplyAll(this.rows(), ...args.map(arg => ('rows' in arg ? arg.rows() : arg))).flat(), Matrix.prototype);
  },

  multiplySelf(other) {
    Array.prototype.splice.call(this, 0, 6, ...matrixMultiply(this.rows(), other.rows()).flat());
    return this;
  },
  toObject() {
    const { xx, xy, x0, yx, yy, y0 } = this;
    return { xx, xy, x0, yx, yy, y0 };
  },
  entries() {
    return Object.entries(Matrix.prototype.toObject.call(this));
  },
  clone() {
    return new this.constructor[Symbol.species](this);
  },
  round(prec = 1e-12, digits = 12) {
    let m = new Matrix();
    m.init(
      ...this.toArray()
        .slice(0, 9)
        .map(n => roundTo(n, prec, digits))
    );
    return m;
  },
  roundSelf(prec = 1e-12, digits = 12) {
    Matrix.prototype.init.call(this, ...[...this].slice(0, 9).map(n => roundTo(n, prec, digits)));
    return this;
  },

  row(row) {
    let i = row * 3;
    return Array.prototype.slice.call(this, i, i + 3);
  },
  column(col) {
    let column = [];
    for(let row of Matrix.prototype.rows.call(this)) column.push(row[col]);
    return column;
  },
  columns() {
    let ret = [];
    for(let i = 0; i < 3; i++) ret.push(Matrix.prototype.column.call(this, i));
    return ret;
  },
  rows() {
    let ret = [];
    for(let i = 0; i < 9; i += 3) ret.push([this[i + 0], this[i + 1], this[i + 2]]);
    return ret;
  },

  toArray() {
    return Array.from(this);
  },
  isIdentity() {
    return this.equals(Matrix.IDENTITY);
  },

  determinant() {
    return this[0] * (this[4] * this[8] - this[5] * this[7]) + this[1] * (this[5] * this[6] - this[3] * this[8]) + this[2] * (this[3] * this[7] - this[4] * this[6]);
  },

  invert() {
    /* const det = Matrix.prototype.determinant.call(this);
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
  ]);*/
    let { a, b, c, d, e, f } = this;
    let den = a * d - b * c;

    return new Matrix({
      a: d / den,
      b: b / -den,
      c: c / -den,
      d: a / den,
      e: (d * e - c * f) / -den,
      f: (b * e - a * f) / den
    });
  },

  scalarProduct(f) {
    return new Matrix({
      xx: this[0] * f,
      xy: this[1] * f,
      x0: this[2] * f,
      yx: this[3] * f,
      yy: this[4] * f,
      y0: this[5] * f
    });
  },

  toSource(construct = false, multiline = true) {
    const nl = multiline ? '\n' : '';
    const rows = Matrix.prototype.rows.call(this);
    const src = `${rows.map(row => row.join(',')).join(multiline ? ',\n ' : ',')}`;
    return construct ? `new Matrix([${nl}${src}${nl}])` : `[${src}]`;
  },

  toString(separator = ' ') {
    let rows = Matrix.prototype.rows.call(this);
    let name = rows[0].length == 3 ? 'matrix' : 'matrix3d';

    if(rows[0].length == 3) {
      rows = [['a', 'b', 'c', 'd', 'e', 'f'].map(k => this[keyIndexes[k]])];
    }

    return `${name}(` + rows.map(row => row.join(',' + separator)).join(',' + separator) + ')';
  },

  toSVG() {
    return 'matrix(' + ['a', 'b', 'c', 'd', 'e', 'f'].map(k => this[keyIndexes[k]]).join(',') + ')';
  },

  toDOM(ctor = DOMMatrix) {
    const rows = Matrix.prototype.rows.call(this);
    const [a, c, e] = rows[0];
    const [b, d, f] = rows[1];
    return new ctor([a, b, c, d, e, f]);
  },
  toJSON() {
    const rows = Matrix.prototype.rows.call(this);
    const [a, c, e] = rows[0];
    const [b, d, f] = rows[1];
    return { a, b, c, d, e, f };
  },
  equals(other) {
    return this.length <= other.length && Array.prototype.every.call(this, (n, i) => other[i] == n);
  },

  transformDistance(d) {
    const k = 'x' in d && 'y' in d ? ['x', 'y'] : 'width' in d && 'height' in d ? ['width', 'height'] : [0, 1];
    const x = this[0] * d[k[0]] + this[2] * d[k[1]];
    const y = this[1] * d[k[0]] + this[3] * d[k[1]];
    d[k[0]] = x;
    d[k[1]] = y;
    return d;
  },

  transformXY(x, y) {
    const { a, b, c, d, e, f } = this;
    return [a * x + c * y + e, b * x + d * y + f];
  },

  transformPoint(p) {
    const { a, b, c, d, e, f } = this;
    const m0 = [a, c, e],
      m1 = [b, d, f];
    const k = 'x' in p && 'y' in p ? ['x', 'y'] : [0, 1];
    const x = m0[0] * p[k[0]] + m0[1] * p[k[1]] + m0[2];
    const y = m1[0] * p[k[0]] + m1[1] * p[k[1]] + m1[2];
    p[k[0]] = x;
    p[k[1]] = y;
    return p;
  },

  transformGenerator(what = 'point') {
    const matrix = Object.freeze(this.clone());
    return function* (list) {
      const method = Matrix.prototype['transform_' + what] || (typeof what == 'function' && what) || Matrix.prototype.transformXY;

      for(let item of list) yield item instanceof Array ? method.apply(matrix, [...item]) : method.call(matrix, { ...item });
    };
  },

  *transformPoints(list) {
    for(let i = 0; i < list.length; i++) yield Matrix.prototype.transformPoint.call(this, { ...list[i] });
  },

  transformWH(width, height) {
    const w = this[0] * width + this[1] * height;
    const h = this[3] * width + this[4] * height;
    return [w, h];
  },

  transformSize(s) {
    const [a, c, e, b, d, f] = this;

    const w = a * s.width + c * s.height;
    const h = b * s.width + d * s.height;
    s.width = w;
    s.height = h;
    return s;
  },

  transformXYWH(x, y, width, height) {
    return [...Matrix.prototype.transformXY.call(this, x, y), ...Matrix.prototype.transformWH.call(this, width, height)];
  },

  transformRect(rect) {
    let { x1, y1, x2, y2 } = rect;
    [x1, y1] = Matrix.prototype.transformXY.call(this, x1, y1);
    [x2, y2] = Matrix.prototype.transformXY.call(this, x2, y2);
    let xrange = [x1, x2];
    let yrange = [y1, y2];

    [x1, x2] = [Math.min, Math.max].map(fn => fn(...xrange));
    [y1, y2] = [Math.min, Math.max].map(fn => fn(...yrange));
    Object.assign(rect, { x1, x2, y1, y2 });
    return rect;
  },

  pointTransformer() {
    const matrix = this;
    return point => matrix.transformPoint(point);
  },

  transformer() {
    const matrix = this;
    return {
      point: point => matrix.transformPoint(point),
      xy: (x, y) => matrix.transformXY(x, y),
      size: s => matrix.transformSize(s),
      wh: (w, h) => matrix.transformWH(w, h),
      rect: rect => matrix.transformRect(rect),
      points: list => matrix.transformPoints(list),
      distance: d => matrix.transformDistance(d)
    };
  },

  scaleSign() {
    return this[0] * this[4] < 0 || this[1] * this[3] > 0 ? -1 : 1;
  },
  affineTransform(a, b) {
    let xx, yx, xy, yy, tx, ty;
    if(typeof a == 'object' && a.toPoints !== undefined) a = a.toPoints();
    if(typeof b == 'object' && b.toPoints !== undefined) b = b.toPoints();
    xx =
      (b[0].x * a[1].y + b[1].x * a[2].y + b[2].x * a[0].y - b[0].x * a[2].y - b[1].x * a[0].y - b[2].x * a[1].y) /
      (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
    yx =
      (b[0].y * a[1].y + b[1].y * a[2].y + b[2].y * a[0].y - b[0].y * a[2].y - b[1].y * a[0].y - b[2].y * a[1].y) /
      (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
    xy =
      (a[0].x * b[1].x + a[1].x * b[2].x + a[2].x * b[0].x - a[0].x * b[2].x - a[1].x * b[0].x - a[2].x * b[1].x) /
      (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
    yy =
      (a[0].x * b[1].y + a[1].x * b[2].y + a[2].x * b[0].y - a[0].x * b[2].y - a[1].x * b[0].y - a[2].x * b[1].y) /
      (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
    tx =
      (a[0].x * a[1].y * b[2].x + a[1].x * a[2].y * b[0].x + a[2].x * a[0].y * b[1].x - a[0].x * a[2].y * b[1].x - a[1].x * a[0].y * b[2].x - a[2].x * a[1].y * b[0].x) /
      (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
    ty =
      (a[0].x * a[1].y * b[2].y + a[1].x * a[2].y * b[0].y + a[2].x * a[0].y * b[1].y - a[0].x * a[2].y * b[1].y - a[1].x * a[0].y * b[2].y - a[2].x * a[1].y * b[0].y) /
      (a[0].x * a[1].y + a[1].x * a[2].y + a[2].x * a[0].y - a[0].x * a[2].y - a[1].x * a[0].y - a[2].x * a[1].y);
    this.setRow.call(this, 0, xx, xy, tx);
    this.setRow.call(this, 1, yx, yy, ty);
    this.setRow.call(this, 2, 0, 0, 1);
    return this;
  },

  decompose(degrees = false, useLU = true) {
    let { a, b, c, d, e, f } = this;

    let translate = { x: e, y: f },
      rotation = 0,
      scale = { x: 1, y: 1 },
      skew = { x: 0, y: 0 };

    let determ = a * d - b * c,
      r,
      s;

    const calcFromValues = (r1, m1, r2, m2) => {
      if(!isFinite(r1)) return r2;
      else if(!isFinite(r2)) return r1;
      (m1 = Math.abs(m1)), (m2 = Math.abs(m2));
      return roundTo((m1 * r1 + m2 * r2) / (m1 + m2), 0.0001);
    };

    //if(useLU) {
    let sign, cos, sin;
    sign = Matrix.prototype.scaleSign.call(this);
    rotation = (Math.atan2(this[3], this[4]) + Math.atan2(-sign * this[1], sign * this[0])) / 2;
    cos = Math.cos(rotation);
    sin = Math.sin(rotation);
    scale = {
      x: calcFromValues(this[0] / cos, cos, -this[1] / sin, sin),
      y: calcFromValues(this[4] / cos, cos, this[3] / sin, sin)
    };

    /*if(c || d) {
    if(a) {
      skew = { x: Math.atan(c / a), y: Math.atan(b / a) };
      scale = { x: a, y: determ / a };
    } else {
      scale = { x: c, y: d };
      skew.x = Math.PI * 0.25;
    }
  } else {
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
      rotate: degrees === true ? roundTo((rotation * 180) / Math.PI, 0.1) : rotation,
      scale,
      skew:
        degrees == true
          ? {
              x: roundTo((skew.x * 180) / Math.PI, 0.1),
              y: roundTo((skew.y * 180) / Math.PI, 0.1)
            }
          : skew
    };
  },

  initIdentity() {
    return Matrix.prototype.init.call(this, [
      [1, 0, 0],
      [0, 1, 0]
    ]);
  },
  isIdentity() {
    return Matrix.prototype.equals.call(
      this,
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ].flat()
    );
  },
  initTranslate(tx, ty) {
    return Matrix.prototype.init.call(this, 1, 0, tx, 0, 1, ty);
  },

  initScale(sx, sy) {
    if(sy === undefined) sy = sx;
    return Matrix.prototype.init.call(this, sx, 0, 0, 0, sy, 0);
  },

  initRotate(angle, deg = false) {
    const rad = deg ? DEG2RAD * angle : angle;
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    return Matrix.prototype.init.call(this, c, -s, 0, s, c, 0);
    /*  Matrix.prototype.setRow.call(this, 0, c, s, 0);
  Matrix.prototype.setRow.call(this, 1, -s, c, 0);
  Matrix.prototype.setRow.call(this, 2, 0,0,1);*/

    /*  Matrix.prototype.setRow.call(this, 0, c, -s, 0);
  Matrix.prototype.setRow.call(this, 1, s, c, 0);
  Matrix.prototype.setRow.call(this, 2, 0, 0, 1);*/

    return this;
  },
  initSkew(x, y, deg = false) {
    const ax = Math.tan(deg ? DEG2RAD * x : x);
    const ay = Math.tan(deg ? DEG2RAD * y : y);
    return Matrix.prototype.init.call(this, 1, ay, ax, 1, 0, 0);
  }
});

Matrix.prototype[Symbol.iterator] = function* () {
  for(let i = 0; i < 27; i++) {
    if(this[i] === undefined) break;
    yield this[i];
  }
};

Matrix.prototype[inspectSymbol] = function() {
  let columns = Matrix.prototype.columns.call(this);
  let numRows = Math.max(...columns.map(col => col.length));
  let numCols = columns.length;
  columns = columns.map(column => column.map(n => (typeof n == 'number' ? roundTo(n, 1e-12, 12) : undefined)));
  let pad = columns.map(column => Math.max(...column.map(n => (n + '').length)));
  let s = '│ ';
  for(let row = 0; row < numRows; row++) {
    if(row > 0) s += ` │\n│ `;
    for(let col = 0; col < numCols; col++) {
      if(col > 0) s += ', ';
      s += (columns[col][row] + '').padStart(pad[col]);
    }
  }
  s += ' │';
  let l = s.indexOf('\n');
  s = '\u250c' + ' '.repeat(l - 2) + '\u2510\n' + s;
  s = s + '\n\u2514' + ' '.repeat(l - 2) + '\u2518\n';

  return '\n' + s;
};

const MatrixProps = (obj = {}) =>
  Object.entries(keyIndexes).reduce(
    (acc, [k, i]) => ({
      ...acc,
      [k]: {
        get() {
          return this[i];
        },
        set(v) {
          this[i] = v;
        },
        enumerable: true
      }
    }),
    obj
  );

define(Matrix, {
  fromJSON: obj => new Matrix(obj),
  fromDOM: matrix => {
    const { a, b, c, d, e, f } = matrix;
    return new Matrix(a, c, e, b, d, f);
  },
  fromCSS: str => {
    let [xx, yx, xy, yy, x0, y0] = [...str.matchAll(/[-.0-9]+([Ee][-+]?[0-9]+|)/g)].map(m => parseFloat(m[0]));
    return new Matrix(xx, xy, x0, yx, yy, y0);
  },
  /* equals(other) {
    return this.length <= other.length && Array.prototype.every.call(this, (n, i) => other[i] == n);
  },*/
  getAffineTransform(a, b) {
    let matrix = new Matrix();
    matrix.affineTransform(a, b);
    return matrix;
  }
});

Object.defineProperties(Matrix.prototype, MatrixProps());

//prettier-ignore
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

Matrix.identity = () => new Matrix();

Matrix.IDENTITY = Object.freeze(Matrix.identity());

for(let name of [
  'toObject',
  'init',
  'toArray',
  'isIdentity',
  'determinant',
  'invert',
  'multiply',
  'scalarProduct',
  'toSource',
  // 'toString',
  'toSVG',
  'equals',
  'initIdentity',
  'isIdentity',
  'initTranslate',
  'initScale',
  'initRotate',
  'scaleSign',
  'decompose',
  'transformer'
]) {
  Matrix[name] = (matrix, ...args) => Matrix.prototype[name].call(matrix || new Matrix(matrix), ...args);
}

for(let name of ['Translate', 'Scale', 'Rotate', 'Skew']) {
  Matrix[name.toLowerCase()] = (...args) => Matrix.prototype['init' + name].call(new Matrix(), ...args);
}

for(let name of ['Translate', 'Scale', 'Rotate', 'Skew']) {
  Matrix.prototype[name.toLowerCase()] = function(...args) {
    return Matrix.prototype.multiply.call(this, new Matrix()['init' + name](...args));
  };
  /*  Matrix.prototype[name.toLowerCase() + 'Self'] = Matrix.prototype[name.toLowerCase + 'Self'] = function(...args) {
    return Matrix.prototype.multiplySelf.call(this, new Matrix()['init_' + name](...args));
  };*/
}

for(let name of ['transformDistance', 'transformXY', 'transformPoint', 'transformPoints', 'transformWH', 'transformSize', 'transformRect', 'affineTransform']) {
  const method = Matrix.prototype[name];

  if(method.length == 2) {
    Matrix[name] = curry((m, a, b) => Matrix.prototype[name].call(m || new Matrix(m), a, b));
  } else if(method.length == 1) {
    Matrix[name] = curry((m, a) => Matrix.prototype[name].call(m || new Matrix(m), a));
  }
}

defineGetter(Matrix, Symbol.species, function() {
  return this;
});

export const isMatrix = m => isObject(m) && (m instanceof Matrix || (m.length !== undefined && (m.length == 6 || m.length == 9) && m.every(el => typeof el == 'number')));

export const ImmutableMatrix = immutableClass(Matrix);
defineGetter(ImmutableMatrix, Symbol.species, () => ImmutableMatrix);
