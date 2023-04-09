import { Point, isPoint } from './point.js';
import { Rect } from './rect.js';
import { Line, isLine } from './line.js';
import { PointList } from './pointList.js';
import { SVG } from '../dom/svg.js';
import {  memoize } from '../misc.js';

let createFactory = memoize((...args) => SVG.factory(...args));

export class Polyline extends PointList {
  constructor(lines = []) {
    super(typeof lines == 'string' ? lines : undefined);

    if(this.length > 0) return this;

    /*if(typeof(lines) == 'string'){
       lines = [...lines.matchAll(/(-?[.0-9]+)[^-0-9.](-?[.0-9]+)/g)].map(m => m[0]);
    }*/

    const addUnique = point => {
      if(typeof point == 'string') point = new Point(point);

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

  toSVG(factory, attrs = { stroke: '#000', fill: 'none' }, parent = null, prec) {
    if(!factory) factory = createFactory(document.body);
    console.log('Polyline.toSVG', factory);

    return factory(this.closed ? 'polygon' : 'polyline', { points: PointList.prototype.toString.call(this), ...attrs }, parent, prec);
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

  isClosed() {
    let first = this[0];
    let last = this[this.length - 1];

    return Point.equals(first, last);
  }

  get closed() {
    return this.isClosed();
  }

  close() {
    if(!this.closed) this.push(this[0]);
    return this;
  }

  get [Symbol.species]() {
    return Polyline;
  }

  pointAt(pos) {
    const { totalLength } = this;
    return this.atIndex((pos * (this.length - 1)) / totalLength);
  }

  atIndex(i) {
    i = Math.min(this.length - 1, i < 0 ? this.length + i : i);
    let fract = i - Math.floor(i);
    i = Math.floor(i);
    let ret = new Point(this[i]);
    if(fract > 0) {
      let next = this[i + 1];
      ret.x = ret.x * (1.0 - fract) + next.x * fract;
      ret.y = ret.y * (1.0 - fract) + next.y * fract;
    }
    return ret;
  }

  getTotalLength() {
    return this.slice(1).reduce((a, p, i) => a + Point.distance(this[i], p), 0);
  }
  get totalLength() {
    return this.getTotalLength();
  }
}

export default Polyline;
