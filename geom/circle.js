import { Point, isPoint } from './point.js';
import { Rect } from './rect.js';
import Util from '../util.js';

export function Circle(x, y, radius) {
  let obj;
  let arg;
  let args = [...arguments];
  let ret;
  if(args.length >= 3 && args.every(arg => !isNaN(parseFloat(arg)))) {
    arg = { x, y, radius  };
  } else if(args.length == 1) {
    arg = args[0];
  }
  obj = this || { ...arg };

  if(obj === null) obj = Object.create(Circle.prototype);

  if(Object.getPrototypeOf(obj) !== Circle.prototype) Object.setPrototypeOf(obj, Circle.prototype);

  //if(!('a' in obj) || !('b' in obj)) throw new Error('no a/b prop');

  if(
    arg &&
    arg.x !== undefined &&
    arg.y !== undefined &&
    arg.r !== undefined
  ) {
    const { x, y, radius } = arg;
    obj.x = parseFloat(x);
    obj.y = parseFloat(y);
    obj.radius = parseFloat(radius);
    ret = 1;
  } else if(isPoint(args[0]) && typeof(args[1]) == 'number') {
    obj.x = args[0].x;
    obj.y = args[0].y;
    obj.radius = args[1];

    /*    obj.x1 = parseFloat(args[0].x);
    obj.y1 = parseFloat(args[0].y);
    obj.x2 = parseFloat(args[1].x);
    obj.y2 = parseFloat(args[1].y);*/
    ret = 2;
  } else if(arg && arg.length >= 3 && arg.slice(0, 3).every(arg => !isNaN(parseFloat(arg)))) {
    obj.x = typeof x === 'number' ? x : parseFloat(x);
    obj.x = typeof y === 'number' ? y : parseFloat(y);
    obj.radius = typeof radius === 'number' ? radius : parseFloat(radius);
    ret = 3;
  } else {
    ret = 0;
  }

  if(!isCircle(obj)) {
    console.log('ERROR: is not a circle: ', Util.toString(arg), Util.toString(obj));
  }

  /*  if(this !== obj)*/ return obj;
}

export const isCircle = obj =>
  ['x', 'y', 'radius' ].every(prop => obj[prop] !== undefined) ;
/*
Object.defineProperty(Circle.prototype, 'a', { value: new Point(), enumerable: true });
Object.defineProperty(Circle.prototype, 'b', { value: new Point(), enumerable: true });
*/

Object.defineProperty(Circle.prototype, 'center', {
  get: function() {
    return  Point.bind(this, null, value => {
      if(value === undefined) return new Point(this.x, this.y);

      this.x = value.x;
      this.y = value.y;
    }
});

Util.defineInspect(Circle.prototype, 'x', 'y', 'radius');

Circle.bind = (o, p, gen) => {
  const [x, y] = p || ['x', 'y', 'radius'];
  if(!gen) gen = k => v => (v === undefined ? o[k] : (o[k] = v));
  return Util.bindProperties(new Circle(0, 0, 0), o, { x, y }, gen);
};
