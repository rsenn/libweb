import { Point, isPoint } from './point.js';
import { Rect } from './rect.js';
import Util from '../util.js';

export function Circle(x, y, radius) {
  let obj = this || null;
  let arg;
  let args = [...arguments];
  let ret;
  if(args.length >= 3 && args.every((arg) => !isNaN(parseFloat(arg)))) {
    arg = { x: +args[0], y: +args[1], radius: +args[2] };
  } else if(args.length == 1) {
    arg = args[0];

    obj.x = +arg.x;
    obj.y = +arg.y;
    obj.radius = +arg.radius;
  }

  //Util.log('arguments:', [...arguments]);

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
  } else if(arg && arg.length >= 3 && arg.slice(0, 3).every((arg) => !isNaN(parseFloat(arg)))) {
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
    //Util.log('ERROR: is not a circle: ', Util.className(obj), Util.toString(arg), Util.toString(obj));
  }

  /*  if(this !== obj)*/ return obj;
}

export const isCircle = (obj) => ['x', 'y', 'radius'].every((prop) => obj[prop] !== undefined);

Object.defineProperty(Circle.prototype, 'x', { value: 0, enumerable: true, writable: true });
Object.defineProperty(Circle.prototype, 'y', { value: 0, enumerable: true, writable: true });
Object.defineProperty(Circle.prototype, 'radius', { value: 0, enumerable: true, writable: true });

Object.defineProperty(Circle.prototype, 'center', {
  get() {
    return Point.bind(this, null, (value) => {
      if(value === undefined) return new Point(this.x, this.y);

      this.x = value.x;
      this.y = value.y;
    });
  }
});

Circle.prototype.bbox = function (width = 0) {
  const { x, y, radius } = this;
  let distance = radius + width;

  return new Rect({
    x1: x - distance,
    x2: x + distance,
    y1: y - distance,
    y2: y + distance
  });
};
Circle.prototype.transform = function (m) {
  if(Util.isObject(m) && typeof m.toMatrix == 'function') m = m.toMatrix();
  Matrix.prototype.transform_point.call(m, this);
  this.radius = Matrix.prototype.transform_wh.call(m, this.radius, this.radius)[0];
  return this;
};

Util.defineInspect(Circle.prototype, 'x', 'y', 'radius');

Circle.bind = (o, p, gen) => {
  const [x, y, radius] = p || ['x', 'y', 'radius'];
  if(!gen) gen = (k) => (v) => (v === undefined ? o[k] : (o[k] = v));
  return Util.bindProperties(new Circle(0, 0, 0), o, { x, y, radius }, gen);
};
