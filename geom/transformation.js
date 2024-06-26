import { isMatrix, Matrix } from '../geom/matrix.js';
import { Point } from '../geom/point.js';
import { className, define, defineGetter, functionName, immutableClass, isObject } from '../misc.js';

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export class Transformation {
  //typeName = null;

  constructor(transformation) {
    if(transformation instanceof Transformation) return transformation;
    if(transformation instanceof TransformationList) return transformation;

    if(typeof transformation == 'string') return Transformation.fromString(transformation);
    //define(this, { typeName });
    //this.type = type;
    //
    throw new TypeError('Transformation');

    return this;
  }

  get [Symbol.toStringTag]() {
    return functionName(this.constructor);
  }

  get type() {
    let type =
      this.typeName ||
      className(this)
        .toLowerCase()
        .replace(/transform(ation)?/, '')
        .replace(/(ion|ing)$/, 'e');
    return type;
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
    if(unit === undefined) unit = this.unit;
    return (this.is3D ? ['x', 'y', 'z'] : ['x', 'y']).map(unit ? axis => this[axis] + unit : axis => this[axis]);
  }

  toString(tUnit) {
    return `${this.type}${this.is3D ? '3d' : ''}(${this.vector(tUnit).join(', ')})`;
  }

  clone() {
    let desc = Object.getOwnPropertyDescriptors(this);
    let props = this.props.reduce((acc, prop) => ({ ...acc, [prop]: desc[prop] }), {});
    return Object.create(Object.getPrototypeOf(this), props);
  }

  static fromString(arg) {
    let cmdLen = arg.indexOf('(');
    let argStr = arg.slice(cmdLen + 1, arg.indexOf(')'));
    let args = argStr.split(/[,\s\ ]+/g);
    let cmd = arg.substring(0, cmdLen);
    let t;
    let unit;

    args = args
      .filter(arg => /^[-+0-9.]+[a-z]*$/.test(arg))
      .map(arg => {
        if(/[a-z]$/.test(arg)) {
          unit = arg.replace(/[-+0-9.]*/g, '');
          arg = arg.replace(/[a-z]*$/g, '');
        }

        return +arg;
      });
    //console.log('fromString', { cmd, args });

    const is3D = cmd.toLowerCase().endsWith('3d');
    if(is3D) cmd = cmd.slice(0, -2);

    if(cmd.startsWith('rotat')) {
      const axis = is3D ? '' : cmd.slice(6);
      args = axis != '' ? [args[0], axis] : args;
      t = new Rotation(...args);
    } else if(cmd.startsWith('translat')) {
      const axis = is3D ? '' : cmd.slice(9);
      args = axis != '' ? [args[0], axis] : args;
      t = new Translation(...args);
    } else if(cmd.startsWith('scal')) {
      const axis = is3D ? '' : cmd.slice(5);
      args = axis != '' ? [args[0], axis] : args;
      t = new Scaling(...args);
    } else if(cmd.startsWith('matrix')) {
      const [a, b, c, d, e, f] = args;
      t = new MatrixTransformation(a, c, e, b, d, f);
    }
    if(unit) t.unit = unit;
    return t;
  }

  /*[Symbol.toStringTag]() {
    return this.toString();
  }*/

  [Symbol.toPrimitive](hint) {
    // console.log("hint:",hint);
    if(hint == 'string' || hint == 'default') return this.toString();

    return this.toString() != '';
  }

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

//Transformation.prototype[Symbol.toStringTag]='Transformation';

Object.defineProperty(Transformation, Symbol.hasInstance, {
  value(inst) {
    return [Transformation, MatrixTransformation, Rotation, Translation, Scaling, TransformationList].some(ctor => Object.getPrototypeOf(inst) == ctor.prototype);
  }
});

export const ImmutableTransformation = immutableClass(Transformation);

export class Rotation extends Transformation {
  angle = 0;
  //axis = undefined;

  constructor(angle, x, y) {
    super('rotate');

    if(typeof x == 'string' && ['x', 'y', 'z'].indexOf(x.toLowerCase()) != -1) {
      this.axis = x.toLowerCase();
    } else if(!isNaN(+x) && !isNaN(+y)) {
      this.center = [+x, +y];
    }
    //else this.axis = 'z';
    this.angle = angle;
  }

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
    return `rotate${this.is3D ? axis : ''}(${angle}${rUnit}${this.center ? this.center.map(coord => `, ${coord}`).join('') : ''})`;
  }

  toSource() {
    let o = 'new ' + className(this) + '(' + this.angle + ')';
    return o;
  }

  toMatrix(matrix = Matrix.identity()) {
    const { center, angle } = this;
    if(center) matrix = matrix.translate(...[...center].map(coord => -coord));
    matrix = matrix.rotate(DEG2RAD * angle);
    if(center) matrix = matrix.translate(...center);
    return matrix.round();
  }

  accumulate(other) {
    if(this.type !== other.type && this.axis !== other.axis) throw new Error(className(this) + ': accumulate mismatch');
    return new Rotation(this.angle + other.angle, this.axis);
  }

  static convertAngle(angle, unit) {
    switch (unit) {
      case 'deg':
        return angle;
      case 'rad':
        return DEG2RAD * angle;
      case 'turn':
        return angle / 360;
      default:
        return angle;
    }
  }
}

Object.defineProperty(Rotation.prototype, Symbol.toStringTag, {
  value: 'Rotation',
  enumerable: false
});

export const ImmutableRotation = immutableClass(Rotation);

export class Translation extends Transformation {
  x = 0;
  y = 0;
  //z = undefined;

  constructor(...args) {
    super('translate');

    if(typeof args[1] == 'string' && ['x', 'y', 'z'].indexOf(args[1].toLowerCase()) != -1) {
      const n = args.shift();
      const axis = args.shift().toLowerCase();
      this[axis] = n;
    } else {
      let numDim = [...args, '.'].findIndex(a => isNaN(+a));
      const [x = 0, y = 0, z] = args.splice(0, numDim);
      this.x = +x;
      this.y = +y;
      if(z !== undefined) this.z = +z;
    }
    if(args.length > 0 && typeof args[0] == 'string') this.unit = args.shift();
  }

  get values() {
    const { x, y, z } = this;
    return 'z' in this ? { x, y, z } : { x, y };
  }

  isZero() {
    const { x, y, z } = this;
    return 'z' in this ? x == 0 && y == 0 && z == 0 : x == 0 && y == 0;
  }

  toMatrix(matrix = Matrix.identity()) {
    const { x, y } = this;
    return matrix.translate(x, y);
  }

  /*clone() {
    const { x, y, z } = this;
    return z !== undefined ? new Translation(x, y, z) : new Translation(x, y);
  }*/

  invert() {
    const { x, y, z } = this;
    return z !== undefined ? new Translation(-x, -y, -z) : new Translation(Math.abs(x) == 0 ? 0 : -x, Math.abs(y) == 0 ? 0 : -y);
  }

  accumulate(other) {
    if(this.type !== other.type) throw new Error(className(this) + ': accumulate mismatch');

    if(this.is3D) return new Translation(this.x + other.x, this.y + other.y, this.z + other.z);
    return new Translation(this.x + other.x, this.y + other.y);
  }
}

Object.defineProperty(Translation.prototype, Symbol.toStringTag, {
  value: 'Translation',
  enumerable: false
});

export const ImmutableTranslation = immutableClass(Translation);

export class Scaling extends Transformation {
  x = 1;
  y = 1;
  //z = undefined;

  constructor(...args) {
    super('scale');

    if(typeof args[1] == 'string' && ['x', 'y', 'z'].indexOf(args[1].toLowerCase()) != -1) {
      const n = args.shift();
      const axis = args.shift().toLowerCase();
      this[axis] = n;
    } else {
      const [x = 1, y, z] = args.splice(0, 3);
      this.x = +x;
      this.y = y === undefined ? this.x : +y;
      if(z !== undefined) this.z = +z;
    }
  }

  get values() {
    const { x, y, z } = this;
    return 'z' in this ? { x, y, z } : { x, y };
  }

  toMatrix(matrix = Matrix.identity()) {
    const { x, y } = this;
    return matrix.scale(x, y);
  }

  isZero() {
    const { x, y, z } = this;
    return 'z' in this ? x == 1 && y == 1 && z == 1 : x == 1 && y == 1;
  }

  toString() {
    const vector = this.vector('');
    const coords = vector.join(', ');

    return `${this.type}${this.is3D ? '3d' : ''}(${coords})`;
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
    if(this.type !== other.type) throw new Error(className(this) + ': accumulate mismatch');

    if(this.is3D) return new Scaling(this.x * other.x, this.y * other.y, this.z * other.z);
    return new Scaling(this.x * other.x, this.y * other.y);
  }
}

Object.defineProperty(Scaling.prototype, Symbol.toStringTag, {
  value: 'Scaling',
  enumerable: false
});

export const ImmutableScaling = immutableClass(Scaling);

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

  toMatrix(matrix = Matrix.identity()) {
    return matrix.multiplySelf(this.matrix);
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
    if(this.type !== other.type) throw new Error(className(this) + ': accumulate mismatch');

    return new MatrixTransformation(this.matrix.multiply(other.matrix));
  }
}

Object.defineProperty(MatrixTransformation.prototype, Symbol.toStringTag, {
  value: 'MatrixTransformation',
  enumerable: false
});

export const ImmutableMatrixTransformation = immutableClass(MatrixTransformation);

export class TransformationList extends Array {
  constructor(init, tUnit, rUnit) {
    super();
    if(isObject(init)) {
      if(tUnit === undefined) tUnit = init.translationUnit || init.tUnit;
      if(rUnit == undefined) rUnit = init.rotationUnit || init.rUnit;
    }
    if(init) {
      this.initialize(init);
    }
    if(typeof tUnit == 'string') this.translationUnit = tUnit;
    if(typeof rUnit == 'string') this.rotationUnit = rUnit;

    return this;
  }

  initialize(init) {
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

  get [Symbol.species]() {
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

      if(arg instanceof Transformation || ['Rotation', 'Scaling'].indexOf(className(arg)) != -1) this.push(arg);
      else if(typeof arg == 'string') this.push(Transformation.fromString(arg));
      else {
        console.log('TransformationList.fromArray', { arg });
        throw new Error('No such transformation: ' + arg + ` ${className(arg)} ${arg instanceof Rotation}`);
      }
    }

    return this;
  }

  get translationUnit() {
    return (isObject(this.translation) && this.translation.unit) || this.tUnit;
  }
  set translationUnit(value) {
    if(isObject(this.translation)) this.translation.unit = value;
    else this.tUnit = value;
  }

  get rotationUnit() {
    return (isObject(this.rotation) && this.rotation.unit) || this.rUnit;
  }
  set rotationUnit(value) {
    if(isObject(this.rotation)) this.rotation.unit = value;
    else this.rUnit = value;
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

    define(transformations.scale, {
      toArray() {
        return [this.x, this.y];
      }
    });
    define(transformations.translate, {
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
    return this.map(t => t.clone()); // this.slice();
  }

  map(fn) {
    return this.baseCall(Array.prototype.map)(fn);
  }

  slice(...args) {
    return this.baseCall(Array.prototype.slice)(...args);
  }

  splice(...args) {
    return this.baseCall(Array.prototype.splice)(...args);
  }

  concat(...args) {
    let t = new TransformationList();
    t.push(...this);
    for(let arg of args) {
      if(Symbol.iterator in arg) t.push(...arg);
      else t.push(arg);
    }
    return t;
  }

  filter(pred) {
    return this.baseCall(Array.prototype.filter)(pred);
  }

  baseCall(c = Array.prototype.map) {
    return (...args) => {
      const { tUnit, rUnit } = this;
      let r = c.call(this, ...args);
      if(tUnit) r.tUnit = tUnit;
      if(rUnit) r.rUnit = rUnit;
      return r;
    };
  }

  unshift(...args) {
    for(let arg of args.reverse()) {
      if(typeof arg == 'string') arg = Transformation.fromString(arg);
      Array.prototype.unshift.call(this, arg);
    }
    return this;
  }

  rotate(...args) {
    let rotation = new Rotation(...args);
    if(!rotation.isZero()) Array.prototype.push.call(this, rotation);
    return this;
  }

  translate(x, y) {
    let trans = this.filter(t => !t.type.startsWith('translat'));
    let vec = new Point(x, y);

    //trans.toMatrix().transformPoint(vec);

    vec = vec.round(0.00001, 5);
    //console.log("from:", new Point(x,y), " to:", vec);
    let translation = new Translation(vec.x, vec.y);

    if(!translation.isZero()) /*    if(Math.abs(vec.x) != 0 || Math.abs(vec.y) != 0) */ Array.prototype.push.call(this, translation);

    return this;
  }

  scale(...args) {
    let scaling = new Scaling(...args);
    if(!scaling.isZero()) Array.prototype.push.call(this, scaling);
    return this;
  }

  matrix(...args) {
    let matrixTransformation = new MatrixTransformation(...args);
    if(!matrixTransformation.isZero()) Array.prototype.push.call(this, matrixTransformation);
    return this;
  }

  toString(tUnit, rUnit) {
    if(this.length > 0) {
      tUnit = tUnit || this.translationUnit;
      rUnit = rUnit || this.rotationUnit;
      let r = this.map(t => t && t.type && t.toString(t.type.startsWith('scal') ? '' : t.type.startsWith('rotat') ? rUnit : tUnit)).join(' ');
      return r;
    }
    return '';
  }

  toDOM() {
    return this.toString('px', 'deg');
  }

  /*  [Symbol.toStringTag]() {
    return this.toString();
  }*/

  toSource() {
    let s = 'new ' + className(this) + '([';

    s += this.map(t => t.toSource()).join(', ');
    return s + '])';
  }

  toMatrices() {
    return [...this.map(t => t.toMatrix())];
  }

  toMatrix() {
    return new Matrix().multiply(...this.toMatrices());
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

  decompose(degrees = true, transformationList = true) {
    let matrix = this.toMatrix();
    const { translate, rotate, scale } = matrix.decompose(degrees);
    let decomposed = { translate, rotate, scale };

    if(transformationList) {
      let ret = new TransformationList();
      ret.translate(translate.x, translate.y, translate.z);
      ret.rotate(rotate);
      ret.scale(scale.x, scale.y, scale.z);
      return ret;
    }

    decomposed.scale.toArray = decomposed.translate.toArray = function toArray() {
      return [this.x, this.y];
    };
    return decomposed;
  }

  findLastIndex(predicate) {
    for(let i = this.length - 1; i >= 0; --i) {
      const x = this[i];
      if(predicate(x)) return i;
    }
    return null;
  }

  findLast(predicate) {
    let index = this.findLastIndex(predicate);
    return this[index];
  }

  get rotation() {
    return this.findLast(item => item && item.type && item.type.startsWith('rotat'));
  }
  set rotation(value) {
    let index = this.findLastIndex(item => item.type.startsWith('rotat'));
    value = value instanceof Rotation ? value : new Rotation(value);
    Array.prototype.splice.call(this, index, 1, value);
  }

  get scaling() {
    return this.findLast(item => item && item.type && item.type.startsWith('scal'));
  }
  set scaling(value) {
    let index = this.findLastIndex(item => item.type.startsWith('scal'));
    value = value instanceof Scaling ? value : new Scaling(value);
    Array.prototype.splice.call(this, index, 1, value);
  }

  get translation() {
    return this.findLast(item => item && item.type && typeof item.type == 'string' && item.type.startsWith('translat'));
  }

  set translation(value) {
    let index = this.findLastIndex(item => item && item.type && item.type.startsWith('transl'));
    value = value instanceof Translation ? value : new Translation(value);
    Array.prototype.splice.call(this, index, 1, value);
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

  get angle() {
    let matrix = this.toMatrix();
    let t = matrix.decompose();
    let { rotate } = t;
    //console.log('ROTATION:', rotate);
    return rotate;
  }

  invert() {
    //return this.reduce((acc, t) => [t.invert(), ...acc], []);
    return new TransformationList(this.reduceRight((acc, t) => [...acc, t.invert()], []));
  }

  join(sep = ' ') {
    return Array.prototype.join.call(this, sep);
  }

  clear() {
    Array.prototype.splice.call(this, 0, this.length);
    return this;
  }

  apply(obj, round = true) {
    if(typeof obj.transform == 'function') {
      const matrix = this.toMatrix();
      return obj.transform(matrix, round);
    }
  }
}

Object.defineProperty(TransformationList.prototype, Symbol.toStringTag, {
  value: 'TransformationList',
  enumerable: false
});

const { concat, copyWithin, find, findIndex, lastIndexOf, pop, push, shift, unshift, slice, splice, includes, indexOf, entries, filter, map, every, some, reduce, reduceRight } = Array.prototype;

define(
  TransformationList.prototype,
  {
    copyWithin,
    find,
    findIndex,
    lastIndexOf,
    pop,
    shift,
    includes,
    indexOf,
    entries,
    every,
    some,
    reduce,
    reduceRight
  },
  {
    [Symbol.iterator]() {
      return Array.prototype[Symbol.iterator].call(this);
    },
    [Symbol.isConcatSpreadable]() {
      return true;
    }
  }
);

//Object.setPrototypeOf(TransformationList.prototype, Transformation.prototype);

export const ImmutableTransformationList = immutableClass(TransformationList);

ImmutableTransformationList.prototype.rotate = function(...args) {
  return this.concat([new ImmutableRotation(...args)]);
};

ImmutableTransformationList.prototype.translate = function(...args) {
  return this.concat([new ImmutableTranslation(...args)]);
};

ImmutableTransformationList.prototype.scale = function(...args) {
  return this.concat([new ImmutableScaling(...args)]);
};

defineGetter(ImmutableTransformationList, Symbol.species, () => ImmutableTransformationList);
