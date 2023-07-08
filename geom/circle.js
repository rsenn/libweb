import { bindProperties } from '../misc.js';
import { className } from '../misc.js';
import { defineGetter } from '../misc.js';
import { inspectSymbol } from '../misc.js';
import { isObject } from '../misc.js';
import { roundDigits } from '../misc.js';
import { roundTo } from '../misc.js';
import { isPoint } from './point.js';
import { Point } from './point.js';

export function Circle(x, y, radius) {
  let obj = this || null;
  let arg;
  let args = [...arguments];
  let ret;
  if(args.length >= 3 && args.every(arg => !isNaN(parseFloat(arg)))) {
    arg = { x: +args[0], y: +args[1], radius: +args[2] };
  } else if(args.length == 1) {
    arg = args[0];

    obj.x = +arg.x;
    obj.y = +arg.y;
    obj.radius = +arg.radius;
  }

  //console.log('arguments:', [...arguments]);

  if(obj === null) obj = Object.create(Circle.prototype);

  if(Object.getPrototypeOf(obj) !== Circle.prototype) Object.setPrototypeOf(obj, Circle.prototype);

  //if(!('a' in obj) || !('b' in obj)) throw new Error('no a/b prop');

  if(arg && arg.x !== undefined && arg.y !== undefined && arg.radius !== undefined) {
    obj.x = +arg.x;
    obj.y = +arg.y;
    obj.radius = +arg.radius;
    ret = 1;
  } else if(isPoint(args[0]) && typeof args[1] == 'number') {
    obj.x = +args[0].x;
    obj.y = +args[0].y;
    obj.radius = +args[1];

    /*    obj.x1 = parseFloat(args[0].x);
    obj.y1 = parseFloat(args[0].y);
    obj.x2 = parseFloat(args[1].x);
    obj.y2 = parseFloat(args[1].y);*/
    ret = 2;
  } else if(arg && arg.length >= 3 && arg.slice(0, 3).every(arg => !isNaN(parseFloat(arg)))) {
    obj.x = +arg[0];
    obj.y = +arg[1];
    obj.radius + arg[2];
    ret = 3;
  } else {
    obj.x = 0;
    obj.y = 0;
    obj.radius = 0;
    ret = 0;
  }

  if(!isCircle(obj)) {
    //console.log('ERROR: is not a circle: ', className(obj), inspect(arg), inspect(obj));
  }

  /*  if(this !== obj)*/ return obj;
}

export const isCircle = obj => ['x', 'y', 'radius'].every(prop => obj[prop] !== undefined);
Circle.prototype[Symbol.toStringTag] = 'Circle';

Object.defineProperty(Circle.prototype, 'x', {
  value: 0,
  enumerable: true,
  writable: true
});
Object.defineProperty(Circle.prototype, 'y', {
  value: 0,
  enumerable: true,
  writable: true
});
Object.defineProperty(Circle.prototype, 'radius', {
  value: 0,
  enumerable: true,
  writable: true
});

Object.defineProperty(Circle.prototype, 'center', {
  get() {
    return Point.bind(this, null, value => {
      if(value === undefined) return new Point(this.x, this.y);

      this.x = value.x;
      this.y = value.y;
    });
  }
});

Circle.prototype.bbox = function(width = 0) {
  const { x, y, radius } = this;
  let distance = radius + width / 2;

  return {
    x1: x - distance,
    x2: x + distance,
    y1: y - distance,
    y2: y + distance
  };
};
Circle.prototype.clone = function() {
  const ctor = this[Symbol.species] || this.constructor[Symbol.species];
  //console.log("ctor:", ctor);
  return new (ctor || Circle)({ x: this.x, y: this.y, radius: this.radius });
};

Circle.prototype.transform = function(m, round = true) {
  if(isObject(m) && typeof m.toMatrix == 'function') m = m.toMatrix();
  Matrix.prototype.transformPoint.call(m, this);
  const [w, h] = Matrix.prototype.transformWH.call(m, this.radius, this.radius);
  this.radius = Math.abs(Math.max(w, h));
  if(round) Circle.prototype.round.call(this, 1e-13, 13);
  return this;
};
Circle.prototype.toObject = function(proto = Object.prototype) {
  const { x, y, radius } = this;
  return Object.setPrototypeOf({ x, y, radius }, proto);
};
Circle.prototype.round = function(precision = 0.001, digits, type) {
  let { x, y, radius } = this;
  digits = digits || roundDigits(precision);
  type = type || 'round';
  this.x = roundTo(x, precision, digits, type);
  this.y = roundTo(y, precision, digits, type);
  this.radius = roundTo(radius, precision, digits, type);
  return this;
};
Circle.prototype.toString = function(opts = {}) {
  const { precision = 0.001, unit = '', separator = ' \u2300 ' } = opts;

  let s = Point.prototype.toString.call(this, opts);
  let r = roundTo(this.radius, precision);

  s += separator + r + unit;
  return s;
};
defineGetter(Point, Symbol.species, function() {
  return this;
});

Circle.prototype[inspectSymbol] = function(depth, options) {
  const { x, y, radius } = this;
  return Object.setPrototypeOf({ x, y, radius }, Circle.prototype);
};

Circle.bind = (o, p, gen) => {
  const [x, y, radius] = p || ['x', 'y', 'radius'];
  if(!gen) gen = k => v => v === undefined ? o[k] : (o[k] = v);
  return bindProperties(new Circle(0, 0, 0), o, { x, y, radius }, gen);
};