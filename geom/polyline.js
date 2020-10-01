import { Point, isPoint } from './point.js';
import { Rect } from './rect.js';
import { Line, isLine } from './line.js';
import { PointList } from './pointList.js';
import Util from '../util.js';

export class Polyline extends PointList {
  constructor(lines = []) {
    super();

    const addUnique = point => {
      const ok = this.length > 0 ? !Point.equals(this[this.length - 1], point) : true;
      if(ok) Array.prototype.push.call(this, Point.clone(point));
      return ok;
    };

    let prev;
    for(let i = 0; i < lines.length; i++) {
      const line = lines[i];
      //console.log(`Polyline lines[${i}] =`, line);
      if(isLine(line)) {
        if(i > 0) {
          const eq = [Point.equals(prev, line.a)];
          if(!eq[0] && !Point.equals(prev, line.b)) break;
        } else {
          addUnique(line.a);
        }
        addUnique(line.b);
        prev = line.b;
      } /* if(isPoint(line))*/ else {
        addUnique(line);
        prev = line;
      }
    }
  }

  toSVG(factory, attrs = {}, parent = null, prec) {
    return factory('polyline', { points: PointList.prototype.toString.call(this), ...attrs }, parent, prec);
  }

  push(...args) {
    const last = this[this.length - 1];
    for(let arg of args) {
      if(last && Point.equals(arg, last)) continue;
      PointList.prototype.push.call(this, arg);
    }
    return this;
  }

  inside(point) {
    let i,
      j,
      c = false,
      nvert = this.length;
    for(i = 0, j = nvert - 1; i < nvert; j = i++) {
      if(this[i].y > point.y !== this[j].y > point.y && point.x < ((this[j].x - this[i].x) * (point.y - this[i].y)) / (this[j].y - this[i].y) + this[i].x) {
        c = !c;
      }
    }
    return c;
  }

  static inside(a, b) {
    return a.every(point => b.inside(point));
  }

  isClockwise() {
    let sum = 0;
    for(let i = 0; i < this.length - 1; i++) {
      let cur = this[i],
        next = this[i + 1];
      sum += (next.x - cur.x) * (next.y + cur.y);
    }
    return sum > 0;
  }

  get clockwise() {
    let ret = new (this[Symbol.species] || this.constructor)().concat(this);
    return Polyline.prototype.isClockwise.call(this) ? ret : ret.reverse();
  }

  get counterClockwise() {
    let ret = new (this[Symbol.species] || this.constructor)().concat(this);
    return Polyline.prototype.isClockwise.call(this) ? ret.reverse() : ret;
  }

  static isClockwise(poly) {
    let sum = 0;
    for(let i = 0; i < poly.length - 1; i++) {
      let cur = poly[i],
        next = poly[i + 1];
      sum += (next.x - cur.x) * (next.y + cur.y);
    }
    return sum > 0;
  }

  get [Symbol.species]() {
    return Polyline;
  }
}

export default Polyline;
