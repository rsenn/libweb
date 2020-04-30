import { Matrix, isMatrix } from "../dom/matrix.js";

export class Transformation {
  constructor(type) {
    this.type = type;
  }

  get axes() {
    let ret = ["x", "y", "z"].filter(axis => this[axis] !== undefined);
    if(this.axis !== undefined) ret.push(this.axis);
    return ret;
  }

  get values() {
    return Object.fromEntries(this.axes.map(axis => [axis, this[axis]]));
  }

  static fromString(arg) {
    let args = arg.split(/[^-0-9A-Za-z.]+/g);
    let cmd = args.shift().toLowerCase();
    let t;
    args = args.filter(arg => /^[-0-9.]+$/.test(arg)).map(arg => +arg);

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
    }

    return t;
  }
}
Transformation.rad2deg = radians => (radians * 180) / Math.PI;
Transformation.deg2rad = degrees => (degrees * Math.PI) / 180;

export class Rotation extends Transformation {
  angle = 0;
  //axis = undefined;

  constructor(angle, axis) {
    super("rotate");
    if(typeof axis == "string" && ["x", "y", "z"].indexOf(axis.toLowerCase()) != -1)
      this.this.axis = axis.toLowerCase();
    // else this.axis = 'z';
    this.angle = angle;
  }

  get values() {
    return { [this.axis]: this.angle };
  }

  toString() {
    const axis = this.axis !== undefined ? this.axis.toUpperCase() : "";
    return `rotate${axis}(${this.angle})`;
  }

  toMatrix(matrix = Matrix.identity) {
    return Matrix.rotate(matrix, (this.angle * Math.PI) / 180);
  }

  invert() {
    return new Rotation(-this.angle, this.axis);
  }
}

Rotation.rad2deg = radians => (radians * 180) / Math.PI;
Rotation.deg2rad = degrees => (degrees * Math.PI) / 180;

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

  toString() {
    const is3D = this.z !== undefined;
    return `translate${is3D ? "3d" : ""}(${this.x},${this.y}${is3D ? `,${this.z}` : ""})`;
  }

  toMatrix(matrix = Matrix.identity) {
    return Matrix.translate(matrix, this.x, this.y, this.z);
  }

  invert() {
    return this.z !== undefined
      ? new Translation(-this.x, -this.y, -this.z)
      : new Translation(-this.x, -this.y);
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

  toString() {
    const is3D = this.z !== undefined;

    return `scale${is3D ? "3d" : ""}(${this.x},${this.y}${is3D ? `,${this.z}` : ""})`;
  }

  toMatrix(matrix = Matrix.identity) {
    return Matrix.scale(matrix, this.x, this.y, this.z);
  }

  invert() {
    return this.z !== undefined
      ? new Scaling(1 / this.x, 1 / this.y, 1 / this.z)
      : new Scaling(1 / this.x, 1 / this.y);
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

  push(...args) {
    for(let arg of args) {
      if(typeof arg == "string") arg = Transformation.fromString(arg);
      Array.prototype.push.call(this, arg);
    }
    return this;
  }

  clone() {
    return this.slice();
    /*    let ret = new TransformationList();
    for(let i = 0; i < this.length; i++)
       Array.prototype.push.call(ret, this[i]);
    return ret;
*/
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

  toString() {
    return this.map(t => t.toString()).join(" ");
  }

  toMatrices() {
    return [...this].map(t => t.toMatrix());
  }

  toMatrix() {
    let ret = new Matrix(Matrix.identity);
    return Matrix.prototype.multiply.apply(ret, this.toMatrices());
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
    return matrix.decompose(degrees);
  }

  get rotation() {
    return this.decompose().rotation;
  }

  get scaling() {
    return {
      ...this.decompose().scale,
      toArray() {
        return [this.x, this.y];
      }
    };
  }

  get translation() {
    return this.decompose().translate;
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
}
