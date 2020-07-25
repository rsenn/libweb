import { Matrix, isMatrix } from '../geom/matrix.js';
import { Point } from '../geom/point.js';
import Util from '../util.js';

export class Transformation {
  type = null;

  constructor(type) {
    Util.define(this, 'type', type);
    //this.type = type;

    return this;
  }

  get [Symbol.isConcatSpreadable]() {
    return this.constructor === TransformationList || Object.getPrototypeOf(this) == TransformationList.prototype || Object.getPrototypeOf(this).constructor == TransformationList;
  }
  get axes() {
    return this.axis !== undefined ? [this.axis] : ['x', 'y', 'z'].filter(axis => axis in this);
  }
  get props() {
    return this.axes.concat(['axis', 'angle'].filter(key => key in this));
  }

  has(axis) {
    if(this.axis !== undefined) return axis === this.axis;
    return axis in this;
  }

  get is3D() {
    return this.has('z');
  }

  entries() {
    return this.props.map(prop => [prop, this[prop]]);
  }

  toJSON() {
    return Object.fromEntries(this.entries());
  }

  vector(unit) {
    unit = this.unit || unit;
    return (this.is3D ? ['x', 'y', 'z'] : ['x', 'y']).map(unit ? axis => this[axis] + unit : axis => this[axis]);
  }

  toString(tUnit) {
    return `${this.type}${this.is3D ? '3d' : ''}(${this.vector(tUnit).join(', ')})`;
  }
  /*  toSource(unit) {
    return Util.colorText('new ',1,31)+Util.colorText(Util.className(this), 1,33) +Util.colorText('(' +this.vector(unit).join(', ') + ')', 1 ,36);
  }*/

  clone() {
    let desc = Object.getOwnPropertyDescriptors(this);
    let props = this.props.reduce((acc, prop) => ({ ...acc, [prop]: desc[prop] }), {});
    return Object.create(Object.getPrototypeOf(this), props);
  }

  static fromString(arg) {
    let cmdLen = arg.indexOf('(');
    let argStr = arg.slice(cmdLen + 1, arg.indexOf(')'));
    let args = argStr.split(/[,\s ]+/g);
    let cmd = arg.substring(0, cmdLen);
    let t;
    let unit;

    //Util.log("fromString",{arg,argStr,args});

    args = args
      .filter(arg => /^[-+0-9.]+[a-z]*$/.test(arg))
      .map(arg => {
        if(/[a-z]$/.test(arg)) {
          unit = arg.replace(/[-+0-9.]*/g, '');
          arg = arg.replace(/[a-z]*$/g, '');
        }

        return +arg;
      });

    if(cmd.startsWith('rotate')) {
      const axis = cmd.slice(6);
      args = axis != '' ? [args[0], axis] : args;
      t = new Rotation(...args);
    } else if(cmd.startsWith('translate')) {
      const axis = cmd.slice(9);
      args = axis != '' ? [args[0], axis] : args;
      t = new Translation(...args);
    } else if(cmd.startsWith('scale')) {
      const axis = cmd.slice(5);
      args = axis != '' ? [args[0], axis] : args;
      t = new Scaling(...args);
    } else if(cmd.startsWith('matrix')) {
      t = new MatrixTransformation(...args);
    }
    if(unit) t.unit = unit;
    return t;
  }
  /*

  static rad2deg(radians) {
    return radians * this.RAD2DEG;
  }

  static deg2rad(degrees) {
    return degrees * this.DEG2RAD;
  }*/
  /*
  [Symbol.toStringTag]() {
    return  this.toSource();
  }*/

  [Symbol.toPrimitive](hint) {
    if(hint == 'string') return this.toString();

    return this.toString() != '';
  }

  /* [Symbol.for('nodejs.util.inspect.custom')]() {
      return this;
    }*/

  static get rotation() {
    return Rotation;
  }
  static get translation() {
    return Translation;
  }
  static get scaling() {
    return Scaling;
  }
  static get matrix() {
    return MatrixTransformation;
  }
}

Object.defineProperty(Transformation, Symbol.hasInstance, {
  value: function(inst) {
    return [Transformation, MatrixTransformation, Rotation, Translation, Scaling, TransformationList].some(ctor => Object.getPrototypeOf(inst) == ctor.prototype);
  }
});

export class Rotation extends Transformation {
  angle = 0;
  //axis = undefined;

  static RAD2DEG = 180 / Math.PI;
  static DEG2RAD = 1 / Rotation.RAD2DEG;

  constructor(angle, axis) {
    super('rotate');

    if(typeof axis == 'string' && ['x', 'y', 'z'].indexOf(axis.toLowerCase()) != -1) this.axis = axis.toLowerCase();
    //else this.axis = 'z';
    this.angle = angle;
  }
  /*
  clone() {
    return new this.constructor[Symbol.species](angle, axis);
  }*/

  invert() {
    return new Rotation(-this.angle, this.axis);
  }

  get values() {
    return { [this.axis || 'z']: this.angle };
  }

  get is3D() {
    return this.axis == 'z';
  }

  isZero() {
    return this.angle == 0;
  }

  toString(rUnit) {
    rUnit = rUnit || this.unit || '';
    const axis = this.axis !== undefined ? this.axis.toUpperCase() : '';
    const angle = this.constructor.convertAngle(this.angle, rUnit);
    return `rotate${this.is3D ? axis : ''}(${angle}${rUnit})`;
  }

  toSource() {
    let o = Util.colorText('new ', 1, 31) + Util.colorText(Util.className(this), 1, 33) + Util.colorText('(' + this.angle + ')', 1, 36);

    return o;
  }

  toMatrix() {
    return Matrix.rotate(Rotation.DEG2RAD * this.angle);
  }

  accumulate(other) {
    if(this.type !== other.type && this.axis !== other.axis) throw new Error(Util.className(this) + ': accumulate mismatch');
    return new Rotation(this.angle + other.angle, this.axis);
  }

  static convertAngle(angle, unit) {
    switch (unit) {
      case 'deg':
        return angle;
      case 'rad':
        return this.DEG2RAD * angle;
      case 'turn':
        return angle / 360;
      default:
        return angle;
    }
  }
}

export class Translation extends Transformation {
  x = 0;
  y = 0;
  //z = undefined;

  constructor(...args) {
    super('translate');

    if(typeof args[1] == 'string' && ['x', 'y', 'z'].indexOf(args[1].toLowerCase()) != -1) {
      const axis = args[1].toLowerCase();
      this[axis] = args[0];
    } else {
      const [x = 0, y = 0, z] = args;
      this.x = x;
      this.y = y;
      if(z !== undefined) this.z = z;
    }
  }

  get values() {
    const { x, y, z } = this;
    return 'z' in this ? { x, y, z } : { x, y };
  }

  isZero() {
    const { x, y, z } = this;
    return 'z' in this ? x == 0 && y == 0 && z == 0 : x == 0 && y == 0;
  }

  toMatrix(matrix = Matrix.IDENTITY) {
    return matrix.translate(this.x, this.y, this.z);
  }

  /*clone() {
    const { x, y, z } = this;
    return z !== undefined ? new Translation(x, y, z) : new Translation(x, y);
  }*/

  invert() {
    const { x, y, z } = this;
    return z !== undefined ? new Translation(-x, -y, -z) : new Translation(-x, -y);
  }

  accumulate(other) {
    if(this.type !== other.type) throw new Error(Util.className(this) + ': accumulate mismatch');

    if(this.is3D) return new Translation(this.x + other.x, this.y + other.y, this.z + other.z);
    return new Translation(this.x + other.x, this.y + other.y);
  }
}

export class Scaling extends Transformation {
  x = 1;
  y = 1;
  //z = undefined;

  constructor(...args) {
    super('scale');

    if(typeof args[1] == 'string' && ['x', 'y', 'z'].indexOf(args[1].toLowerCase()) != -1) {
      const axis = args[1].toLowerCase();
      this[axis] = args[0];
    } else {
      const [x = 1, y, z] = args;
      this.x = x;
      this.y = y === undefined ? x : y;
      if(z !== undefined) this.z = z;
    }
  }

  get values() {
    const { x, y, z } = this;
    return 'z' in this ? { x, y, z } : { x, y };
  }

  toMatrix(matrix = Matrix.IDENTITY) {
    return matrix.scale(this.x, this.y, this.z);
  }

  isZero() {
    const { x, y, z } = this;
    return 'z' in this ? x == 0 && y == 0 && z == 0 : x == 0 && y == 0;
  }

  /*clone() {
    const { x, y, z } = this;
    return z !== undefined ? new Scaling(x, y, z) : new Scaling(x, y);
  }*/

  invert() {
    const { x, y, z } = this;
    return z !== undefined ? new Scaling(1 / x, 1 / y, 1 / z) : new Scaling(1 / x, 1 / y);
  }

  accumulate(other) {
    if(this.type !== other.type) throw new Error(Util.className(this) + ': accumulate mismatch');

    if(this.is3D) return new Translation(this.x * other.x, this.y * other.y, this.z * other.z);
    return new Translation(this.x * other.x, this.y * other.y);
  }
}

export class MatrixTransformation extends Transformation {
  matrix = Matrix.IDENTITY;

  constructor(init) {
    super('matrix');

    if(init instanceof Matrix) this.matrix = init;
    else if(isMatrix(init)) this.matrix = new Matrix(init);
    else this.matrix = new Matrix(...arguments);
  }

  get values() {
    return this.matrix.values();
  }

  toMatrix() {
    return this.matrix.clone();
  }

  toString() {
    return this.matrix.toString('');
  }

  invert() {
    return new MatrixTransformation(this.matrix.invert());
  }

  isZero() {
    return this.matrix.isIdentity();
  }

  accumulate(other) {
    if(this.type !== other.type) throw new Error(Util.className(this) + ': accumulate mismatch');

    return new MatrixTransformation(this.matrix.multiply(other.matrix));
  }
}

export class TransformationList extends Array {
  constructor(init, ...rest) {
    super();

    if(init !== undefined) this.initialize(init, ...rest);

    return this;
  }

  initialize(init, ...args) {
    if(typeof init == 'number') while(this.length < init) this.push(undefined);
    else if(typeof init == 'string') TransformationList.prototype.fromString.call(this, init);
    else if(init instanceof Array) TransformationList.prototype.fromArray.call(this, init);
    else throw new Error('No such initialization: ' + init);
    return this;
  }

  get [Symbol.isConcatSpreadable]() {
    return true;
  }
  /*
  [Symbol.toStringTag]() {
    return this.toSource();
  }*/

  static get [Symbol.species]() {
    return TransformationList;
  }

  fromString(str) {
    let n,
      a = [];

    for(let i = 0; i < str.length; i += n) {
      let s = str.slice(i);
      n = s.indexOf(')') + 1;
      if(n == 0) n = str.length;
      s = s.slice(0, n).trim();
      if(s != '') a.push(s);
    }
    return this.fromArray(a);
  }

  fromArray(arr) {
    for(let i = 0; i < arr.length; i++) {
      const arg = arr[i];

      if(arg instanceof Transformation) this.push(arg);
      else if(typeof arg == 'string') this.push(Transformation.fromString(arg));
      else throw new Error('No such transformation: ' + arg);
    }

    return this;
  }

  static fromString(str) {
    return new TransformationList().fromString(str);
  }

  static fromArray(arr) {
    return new TransformationList().fromArray(arr);
  }

  static fromMatrix(matrix) {
    matrix = matrix instanceof Matrix ? matrix : new Matrix(matrix);

    const transformations = Matrix.decompose(matrix, true);

    Util.extend(transformations.scale, {
      toArray() {
        return [this.x, this.y];
      }
    });
    Util.extend(transformations.translate, {
      toArray() {
        return [this.x, this.y];
      }
    });

    let ret = new TransformationList();

    ret.translate(...transformations.translate.toArray());
    ret.rotate(transformations.rotate);
    ret.scale(...transformations.scale.toArray());

    return ret;
  }

  push(...args) {
    for(let arg of args) {
      if(typeof arg == 'string') arg = Transformation.fromString(arg);
      else if(isMatrix(arg)) arg = new MatrixTransformation(arg);

      Array.prototype.push.call(this, arg);
    }
    return this;
  }

  clone() {
    return this.slice();
  }

  unshift(...args) {
    for(let arg of args.reverse()) {
      if(typeof arg == 'string') arg = Transformation.fromString(arg);
      Array.prototype.unshift.call(this, arg);
    }
    return this;
  }

  rotate(...args) {
    Array.prototype.push.call(this, new Rotation(...args));
    return this;
  }

  translate(x, y) {
    let trans = this.filter(t => !t.type.startsWith('translate'));
    let vec = new Point(x, y);

    //trans.toMatrix().transform_point(vec);

    vec = vec.round(0.00001, 5);
    //Util.log("from:", new Point(x,y), " to:", vec);

    Array.prototype.push.call(this, new Translation(vec.x, vec.y));
    return this;
  }

  scale(...args) {
    Array.prototype.push.call(this, new Scaling(...args));
    return this;
  }

  matrix(...args) {
    Array.prototype.push.call(this, new MatrixTransformation(...args));
    return this;
  }

  toString(tUnit, rUnit) {
    return this.map(t => t.toString(t.type.startsWith('scale') ? '' : t.type.startsWith('rotate') ? rUnit : tUnit)).join(' ');
  }

  [Symbol.toStringTag]() {
    return this.toString();
  }

  toSource() {
    let s = Util.colorText('new ', 1, 31) + Util.colorText(Util.className(this), 1, 33) + Util.colorText('([', 1, 36);

    s += this.map(t => t.toSource()).join(', ');
    return s + Util.colorText('])', 1, 36);
  }

  toMatrices() {
    return Array.prototype.map.call(this, t => t.toMatrix());
  }

  toMatrix() {
    let matrix = Matrix.IDENTITY;

    for(let other of this.toMatrices()) matrix = matrix.multiply(other);

    return matrix;
  }

  undo() {
    let ret = new TransformationList();

    for(let i = this.length - 1; i >= 0; i--) Array.prototype.push.call(ret, this[i].invert());

    return ret;
  }

  merge(...args) {
    for(let arg of args) {
      if(typeof arg == 'string') arg = TransformationList.fromString(arg);

      TransformationList.prototype.push.apply(this, arg);
    }
    return this;
  }

  decompose(degrees = true) {
    let matrix = this.toMatrix();
    const { translate, rotate, scale } = matrix.decompose(degrees);
    let ret = { translate, rotate, scale };
    ret.scale.toArray = ret.translate.toArray = function toArray() {
      return [this.x, this.y];
    };
    return ret;
  }

  findLast(predicate) {
    for(let i = this.length - 1; i >= 0; --i) {
      const x = this[i];
      if(predicate(x)) return x;
    }
    return null;
  }

  get rotation() {
    return this.findLast(item => item.type == 'rotate');
  }

  get scaling() {
    return this.findLast(item => item.type == 'scale');
  }

  get translation() {
    return this.findLast(item => item.type == 'translation');
  }

  /*  map(...args) {
    return Array.prototype.map.apply(Array.from(this), args);
  }*/

  get last() {
    return this.at(-1);
  }
  get first() {
    return this.at(0);
  }

  at(pos) {
    if(pos < 0) pos += this.length;
    return this[pos];
  }

  collapse() {
    let ret = new TransformationList();

    for(let i = 0; i < this.length; i++) {
      let item = this[i];
      if(i + 1 < this.length && this[i + 1].type == this[i].type) {
        item = item.accumulate(this[i + 1]);
        i++;
      } else {
        item = item.clone();
      }
      Array.prototype.push.call(ret, item);
    }
    return ret;
  }

  collapseAll() {
    return TransformationList.fromMatrix(this.toMatrix());
  }

  invert() {
    //return this.reduce((acc, t) => [t.invert(), ...acc], []);
    return this.reduceRight((acc, t) => [...acc, t.invert()], []);
  }

  join(sep = ' ') {
    return Array.prototype.join.call(this, sep);
  }

  clear() {
    return this.splice(0, this.length);
  }
}

const { concat, copyWithin, find, findIndex, lastIndexOf, pop, push, shift, unshift, slice, splice, includes, indexOf, entries, filter, map, every, some, reduce, reduceRight } = Array.prototype;

Util.inherit(
  TransformationList.prototype,
  {
    concat,
    copyWithin,
    find,
    findIndex,
    lastIndexOf,
    pop,
    shift,
    slice,
    splice,
    includes,
    indexOf,
    entries,
    filter,
    map,
    every,
    some,
    reduce,
    reduceRight
  },
  {
    [Symbol.iterator]() {
      return Array.prototype[Symbol.iterator];
    },
    [Symbol.isConcatSpreadable]() {
      return true;
    }
  }
);

//Object.setPrototypeOf(TransformationList.prototype, Transformation.prototype);
