import { Matrix, isMatrix } from "../geom/matrix.js";

export class Transformation {
  constructor(type) {
    this.type = type;
  }

  get axes() {
    let ret = ["x", "y", "z"].filter(axis => axis in this);
    if(this.axis !== undefined) ret.push(this.axis);
    return ret;
  }

  has(axis) {
    if(this.axis !== undefined) return axis === this.axis;
    return axis in this;
  }

  get is3D() {
    return this.has("z");
  }

  entries() {
    return this.axes.map(axis => [axis, this[axis]]);
  }

  vector(unit) {
    return (this.is3D ? ["x", "y", "z"] : ["x", "y"]).map(
      unit ? axis => this[axis] + unit : axis => this[axis]
    );
  }

  toString(unit) {
    return `${this.type}${this.is3D ? "3d" : ""}(${this.vector(unit).join(",")})`;
  }

  clone() {
    return this.constructor.fromString(this.toString());
  }

  static fromString(arg) {
    let args = arg.split(/[^-+0-9A-Za-z.]+/g);
    let cmd = args.shift().toLowerCase();
    let t;
    args = args.filter(arg => /^[-+0-9.]+$/.test(arg)).map(arg => +arg);

    if(cmd.startsWith("rotate")) {
      const axis = cmd.slice(6);
      args = axis != "" ? [args[0], axis] : args;
      t = new Rotation(...args);
    } else if(cmd.startsWith("translate")) {
      const axis = cmd.slice(9);
      args = axis != "" ? [args[0], axis] : args;
      t = new Translation(...args);
    } else if(cmd.startsWith("scale")) {
      const axis = cmd.slice(5);
      args = axis != "" ? [args[0], axis] : args;
      t = new Scaling(...args);
    } else if(cmd.startsWith("matrix")) {
      t = new MatrixTransformation(...args);
    }

    return t;
  }
  /*
  static translate(...args) {
    return new Translation(...args);
  }

  static rotate(...args) {
    return new Rotation(...args);
  }

  static scale(...args) {
    return new Scaling(...args);
  }

  static transform(...args) {
    return new MatrixTransformation(...args);
  }*/

  static RAD2DEG = 180 / Math.PI;
  static DEG2RAD = Math.PI / 180;

  static rad2deg(radians) {
    return radians * this.RAD2DEG;
  }

  static deg2rad(degrees) {
    return degrees * this.DEG2RAD;
  }

  [Symbol.toStringTag]() {
    return this.toString();
  }
  /*
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
  }*/
}

export class Rotation extends Transformation {
  angle = 0;
  //axis = undefined;

  constructor(angle, axis) {
    super("rotate");
    if(typeof axis == "string" && ["x", "y", "z"].indexOf(axis.toLowerCase()) != -1)
      this.axis = axis.toLowerCase();
    // else this.axis = 'z';
    this.angle = angle;
  }

  get values() {
    return { [this.axis || "z"]: this.angle };
  }

  get is3D() {
    return this.axis == "z";
  }

  toString(unit = "") {
    const axis = this.axis !== undefined ? this.axis.toUpperCase() : "";
    const angle = this.constructor.convertAngle(this.angle, unit);
    return `rotate${this.is3D ? axis : ""}(${angle}${unit})`;
  }

  toMatrix() {
    return Matrix.rotate(this.constructor.deg2rad(this.angle));
  }

  invert() {
    return new this.constructor(-this.angle, this.axis);
  }

  accumulate(other) {
    if(this.type !== other.type && this.axis !== other.axis)
      throw new Error(Util.className(this) + ": accumulate mismatch");
    return new Rotation(this.angle + other.angle, this.axis);
  }

  static convertAngle(angle, unit) {
    switch (unit) {
      case "deg":
        return angle;
      case "rad":
        return this.deg2rad(angle);
      case "turn":
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
    super("translate");

    if(typeof args[1] == "string" && ["x", "y", "z"].indexOf(args[1].toLowerCase()) != -1) {
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
    return "z" in this ? { x, y, z } : { x, y };
  }

  toMatrix(matrix = Matrix.identity()) {
    return matrix.translate_self(this.x, this.y, this.z);
  }

  invert() {
    return this.z !== undefined
      ? new Translation(-this.x, -this.y, -this.z)
      : new Translation(-this.x, -this.y);
  }

  accumulate(other) {
    if(this.type !== other.type) throw new Error(Util.className(this) + ": accumulate mismatch");

    if(this.is3D) return new Translation(this.x + other.x, this.y + other.y, this.z + other.z);
    return new Translation(this.x + other.x, this.y + other.y);
  }
}

export class Scaling extends Transformation {
  x = 1;
  y = 1;
  //z = undefined;

  constructor(...args) {
    super("scale");

    if(typeof args[1] == "string" && ["x", "y", "z"].indexOf(args[1].toLowerCase()) != -1) {
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
    return "z" in this ? { x, y, z } : { x, y };
  }

  toMatrix(matrix = Matrix.identity()) {
    return matrix.scale_self(this.x, this.y, this.z);
  }

  invert() {
    return this.z !== undefined
      ? new Scaling(1 / this.x, 1 / this.y, 1 / this.z)
      : new Scaling(1 / this.x, 1 / this.y);
  }

  accumulate(other) {
    if(this.type !== other.type) throw new Error(Util.className(this) + ": accumulate mismatch");

    if(this.is3D) return new Translation(this.x * other.x, this.y * other.y, this.z * other.z);
    return new Translation(this.x * other.x, this.y * other.y);
  }
}

export class MatrixTransformation extends Transformation {
  matrix = Matrix.IDENTITY;

  constructor(init) {
    super("matrix");

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
    return this.matrix.toString("");
  }

  invert() {
    return new MatrixTransformation(this.matrix.invert());
  }

  accumulate(other) {
    if(this.type !== other.type) throw new Error(Util.className(this) + ": accumulate mismatch");

    return new MatrixTransformation(this.matrix.multiply(other.matrix));
  }
}

export class TransformationList extends Array {
  constructor(init) {
    super(0);

    if(init !== undefined) {
      if(typeof init == "number") while(this.length < init) this.push(undefined);
      else if(typeof init == "string") TransformationList.prototype.fromString.call(this, init);
      else if(init instanceof Array) TransformationList.prototype.fromArray.call(this, init);
      else throw new Error("No such initialization: " + init);
    }
  }

  get [Symbol.isConcatSpreadable]() {
    return true;
  }

  [Symbol.toStringTag]() {
    return TransformationList.prototype.toString.call(this);
  }

  static get [Symbol.species]() {
    return this;
  }

  fromString(str) {
    let n;
    let a = [];
    for(let i = 0; i < str.length; i += n) {
      let s = str.slice(i);
      n = s.indexOf(")") + 1;
      if(n == 0) n = str.length;
      s = s.slice(0, n).trim();
      if(s != "") a.push(s);
    }
    str = a;

    TransformationList.prototype.fromArray.call(this, a);
    return this;
  }

  fromArray(arr) {
    for(let i = 0; i < arr.length; i++) {
      const arg = arr[i];

      if(arg instanceof Transformation) this.push(arg);
      else if(typeof arg == "string") this.push(Transformation.fromString(arg));
      else throw new Error("No such transformation: " + arg);
    }
    return this;
  }

  static fromString(str) {
    return TransformationList.prototype.fromString.call(new TransformationList(), str);
  }

  static fromArray(arr) {
    return TransformationList.prototype.fromArray.call(new TransformationList(), arr);
  }

  static fromMatrix(matrix) {
    const transformations = Matrix.decompose(matrix, true);
    Util.define(transformations.scale, "toArray", function toArray() {
      return [this.x, this.y];
    });
    Util.define(transformations.translate, "toArray", function toArray() {
      return [this.x, this.y];
    });

    let ret = new TransformationList();

    ret.translate(...transformations.translate.toArray());
    ret.rotate(transformations.rotate);
    ret.scale(...transformations.scale.toArray());

    return ret;
  }

  push(...args) {
    for(let arg of args) {
      if(typeof arg == "string") arg = Transformation.fromString(arg);
      Array.prototype.push.call(this, arg);
    }
    return this;
  }

  clone() {
    return this.slice();
  }

  unshift(...args) {
    for(let arg of args.reverse()) {
      if(typeof arg == "string") arg = Transformation.fromString(arg);
      Array.prototype.unshift.call(this, arg);
    }
    return this;
  }

  rotate(...args) {
    Array.prototype.push.call(this, new Rotation(...args));
    return this;
  }

  translate(...args) {
    Array.prototype.push.call(this, new Translation(...args));
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
    return this.map(t =>
      t.toString(t instanceof Translation ? tUnit : t instanceof Rotation ? rUnit : undefined)
    ).join(" ");
  }

  toMatrices() {
    return [...this].map(t => t.toMatrix());
  }

  toMatrix() {
    let matrix = Matrix.identity();
    for(let other of this.toMatrices()) matrix.multiply_self(other);

    return matrix;
  }

  undo() {
    let ret = new TransformationList();
    for(let i = this.length - 1; i >= 0; i--) {
      Array.prototype.push.call(ret, this[i].invert());
    }
    return ret;
  }

  merge(...args) {
    for(let arg of args) {
      if(typeof arg == "string") arg = TransformationList.fromString(arg);

      TransformationList.prototype.push.apply(this, arg);
    }
    return this;
  }
  /*
  undo(...args) {
     for(let arg of args.reverse()) {
      if(typeof arg == 'string') arg = Transformation.fromString(arg);
      Array.prototype.push.call(this, arg);
    }
    return this;
    }
*/
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
    return this.findLast(item => item.type == "rotate");
  }

  get scaling() {
    return this.findLast(item => item.type == "scale");
  }

  get translation() {
    return this.findLast(item => item.type == "translation");
  }

  map(...args) {
    return Array.prototype.map.apply(Array.from(this), args);
  }

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
    let matrix = this.toMatrix();
    return this.constructor.fromMatrix(matrix);
  }
}
