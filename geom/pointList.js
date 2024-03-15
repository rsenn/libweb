import { className, define, immutableClass, inspectSymbol, isObject, mod, types } from '../misc.js';
import { Line } from './line.js';
import { Point } from './point.js';
import { Rect } from './rect.js';

export class PointList extends Array {
  _min = new Point(0, 0);
  _max = new Point(Infinity, Infinity);

  constructor(...args) {
    let [points, tfn = (...args) => new Point(...args)] = args;

    super();
    const base = Array;
    let ret = new.target ? this : [];

    if(Array.isArray(args[0]) || types.isIterable(args[0])) args = [...args[0]];

    if(typeof points === 'string') {
      const matches = [...points.matchAll(/[-.0-9,]+/g)];

      for(let i = 0; i < matches.length; i++) {
        const coords = (matches[i][0] + '').split(/,/g).map(n => +n);

        ret.push(tfn(...coords));
      }
    } else if(args[0] && Point(args[0])) {
      for(let i = 0; i < args.length; i++) ret.push(Point(args[i]));
    } else if(args.length !== undefined && typeof args[0] == 'number') {
      while(args.length > 0) {
        let coords = args.splice(0, 2);
        ret.push(Point(coords));
      }
    }
    if(!(ret instanceof PointList)) {
      let proto = PointList.prototype;
      Object.setPrototypeOf(ret, proto);
    }
    if(!(this instanceof PointList)) return ret;
  }

  getXseries() {
    const ret = [];
    for(let pt of this) ret.push(pt.x);

    return ret;
  }

  getYseries() {
    const ret = [];
    for(let pt of this) ret.push(pt.y);

    return ret;
  }
  /**
   * Update the posiiton of an existing point
   * @param {Number} index - index of the existing point to update
   * @param {Object} p - point that has coord we want to use as new coord. x and y values will be copied, no pointer association
   * @return {Number} new index, the changed point may have changed its index among the x-ordered list
   */
  updatePoint(index, p) {
    let newIndex = index;

    if(index >= 0 && index < this.length) {
      if(p.x >= this._min.x && p.x < this._max.x && p.y >= this._min.y && p.y < this._max.y) {
        if(!this[index].xLocked) this[index].x = p.x;

        if(!this[index].yLocked) this[index].y = p.y;

        let thePointInArray = this[index];
        this.sortPoints();

        // the point may have changed its index
        newIndex = this.indexOf(thePointInArray);
      }
    }

    return newIndex;
  }

  sortPoints() {
    // sorting the array upon x
    Array.prototype.sort.call(this, (p1, p2) => p1.x - p2.x);
  }

  /**
   * Remove the points at the given index.
   * @param {Number} index - index of the point to remove
   * @return {Object} the point that was just removed or null if out of bound
   */
  remove(index) {
    let removedPoint = null;

    if(index >= 0 && index < this.length) removedPoint = this.splice(index, 1);

    return removedPoint;
  }

  /**
   * Define the acceptable min and max bot both axis.
   * @param {String} bound - can be "min" or "max"
   * @param {String} axis - can be "x" or "y"
   * @param {Number} value - a number
   * Note that minimum boudaries are inclusive while max are exclusive
   */
  setBoundary(bound, axis, value) {
    this['_' + bound][axis] = value;
  }

  /**
   * Gets the point at such index
   * @param {Number} index - the index of the point we want
   * @return {Object} point that contains at least "x" and "y" properties.
   */
  getPoint(index) {
    if(index >= 0 && index < this.length) return this[index];

    return null;
  }

  /**
   * Get the number of points in the collection
   * @return {Number} the number of points
   */
  getNumberOfPoints() {
    return this.length;
  }

  getClosestFrom(point) {
    return this.nearest(point, (index, distance) => ({ index, distance }));
  }

  /**
   * Update the posiiton of an existing point
   * @param {Number} index - index of the existing point to update
   * @param {Object} p - point that has coord we want to use as new coord. x and y values will be copied, no pointer association
   * @return {Number} new index, the changed point may have changed its index among the x-ordered list
   */
  updatePoint(index, p) {
    let newIndex = index;

    if(index >= 0 && index < this.length) {
      if(p.x >= this._min.x && p.x < this._max.x && p.y >= this._min.y && p.y < this._max.y) {
        if(!this[index].xLocked) this[index].x = p.x;

        if(!this[index].yLocked) this[index].y = p.y;

        let thePointInArray = this[index];
        this.sortPoints();

        // the point may have changed its index
        newIndex = this.indexOf(thePointInArray);
      }
    }

    return newIndex;
  }

  /**
   *
   */
  addPoint(p) {
    let newIndex = null;

    if(p.x >= this._min.x && p.x <= this._max.x && p.y >= this._min.y && p.y <= this._max.y) {
      if(!('xLocked' in p)) p.xLocked = false;

      if(!('yLocked' in p)) p.yLocked = false;

      if(!('safe' in p)) p.safe = false;

      // adding the point
      Array.prototype.push.call(this, p);
      this.sortPoints();
      newIndex = this.indexOf(p);
    }

    return newIndex;
  }

  add(pt) {
    if(!(pt instanceof Point)) pt = new Point(...arguments);
    PointList.prototype.forEach.call(this, it => Point.prototype.add.call(it, pt));
    return this;
  }

  sum(pt) {
    return PointList.prototype.map.call(this, p2 => p2.sum(pt));
  }

  sub(pt) {
    if(!(pt instanceof Point)) pt = new Point(...arguments);
    PointList.prototype.forEach.call(this, it => Point.prototype.sub.call(it, pt));
    return this;
  }

  diff(pt) {
    return PointList.prototype.map.call(this, p2 => p2.diff(pt));
  }

  mul(pt) {
    if(typeof pt == 'number') pt = new Point({ x: pt, y: pt });
    if(!(pt instanceof Point)) pt = new Point(...arguments);
    PointList.prototype.forEach.call(this, it => Point.prototype.mul.call(it, pt));
    return this;
  }

  prod(pt) {
    return PointList.prototype.map.call(this, p2 => p2.prod(pt));
  }

  div(pt) {
    if(typeof pt == 'number') pt = new Point({ x: pt, y: pt });
    if(!(pt instanceof Point)) pt = new Point(...arguments);
    PointList.prototype.forEach.call(this, it => Point.prototype.div.call(it, pt));
    return this;
  }

  quot(pt) {
    return PointList.prototype.map.call(this, p2 => p2.qout(pt));
  }

  rotateRight(n) {
    this.unshift(...this.splice(n % this.length, this.length));
    return this;
  }

  rotateLeft(n) {
    return this.rotateRight(this.length - (n % this.length));
  }

  rotate(n) {
    if(n < 0) return this.rotateLeft(-n);
    if(n > 0) return this.rotateRight(n);
    return this;
  }

  push(...args) {
    while(args.length > 0) Array.prototype.push.call(this, new Point(args));
    return this;
  }

  unshift(...args) {
    let points = [];
    while(args.length > 0) points.push(new Point(args));
    Array.prototype.splice.call(this, 0, 0, ...points);
    return this;
  }

  getLength() {
    return this.length;
  }
  at(index) {
    return this[mod(+index, this.length)];
  }

  splice() {
    let args = [...arguments];
    const start = args.shift();
    const remove = args.shift();
    return Array.prototype.splice.apply(this, [start, remove, ...args.map(arg => (arg instanceof Point ? arg : new Point(arg)))]);
  }

  removeSegment(index) {
    let indexes = [PointList.prototype.getLineIndex.call(this, index - 1), PointList.prototype.getLineIndex.call(this, index), PointList.prototype.getLineIndex.call(this, index + 1)];
    let lines = indexes.map(i => PointList.prototype.getLine.call(this, i));
    let point = Line.intersect(lines[0], lines[2]);
    if(point) {
      PointList.prototype.splice.call(this, 0, 2, new Point(point));
    }
  }

  clone() {
    const ctor = this.constructor[Symbol.species];
    let points = PointList.prototype.map.call(this, p => Point.prototype.clone.call(p));
    return new ctor(points);
  }

  toPolar(tfn) {
    let t = typeof tfn == 'function' ? tfn : (x, y) => ({ x, y });
    return PointList.prototype.map.call(this, p => {
      const angle = Point.prototype.toAngle.call(p);
      return new Point(t(angle, Point.prototype.distance.call(p)));
    });

    let ret = [];
    ret.splice.apply(ret, [
      0,
      ret.length,
      ...PointList.prototype.map.call(this, p => {
        const angle = Point.prototype.toAngle.call(p);
        return t(angle, Point.prototype.distance.call(p));
      })
    ]);
    return ret;
  }

  fromPolar(tfn) {
    let t = typeof tfn == 'function' ? tfn : (x, y) => ({ x, y });
    return PointList.prototype.map.call(this, p => {
      let r = t(p.x, p.y);
      return new Point().fromAngle(r.x, r.y);
    });

    ret.splice.apply(ret, [
      0,
      ret.length,
      ...PointList.prototype.map.call(this, p => {
        let r = t(p.x, p.y);
        return Point.prototype.fromAngle.call(r.x, r.y);
      })
    ]);
    return ret;
  }

  draw(ctx, close = false) {
    const first = PointList.prototype.at.call(this, 0);
    const len = PointList.prototype.getLength.call(this);
    ctx.to(first.x, first.y);
    for(let i = 1; i < len; i++) {
      const { x, y } = PointList.prototype.at.call(this, i);
      ctx.line(x, y);
    }
    if(close) ctx.line(first.x, first.y);
    return this;
  }

  area() {
    let area = 0;
    let i;
    let j;
    let point1;
    let point2;
    const len = PointList.prototype.getLength.call(this);
    for(i = 0, j = len - 1; i < len; j = i, i += 1) {
      point1 = PointList.prototype.at.call(this, i);
      point2 = PointList.prototype.at.call(this, j);
      area += point1.x * point2.y;
      area -= point1.y * point2.x;
    }
    area /= 2;
    return area;
  }

  centroid() {
    let x = 0;
    let y = 0;
    let i;
    let j;
    let f;
    let point1;
    let point2;
    const len = PointList.prototype.getLength.call(this);
    for(i = 0, j = len - 1; i < len; j = i, i += 1) {
      point1 = PointList.prototype.at.call(this, i);
      point2 = PointList.prototype.at.call(this, j);
      f = point1.x * point2.y - point2.x * point1.y;
      x += (point1.x + point2.x) * f;
      y += (point1.y + point2.y) * f;
    }
    f = PointList.prototype.area.call(this) * 6;
    return new Point(x / f, y / f);
  }

  avg() {
    let ret = PointList.prototype.reduce.call(this, (acc, p) => acc.add(p), new Point());
    return ret.div(getLength.call(this));
  }

  bbox(
    proto = {
      constructor: PointList.prototype.bbox,
      toString() {
        return `{x1:${(this.x1 + '').padStart(4, ' ')},x2:${(this.x2 + '').padStart(4, ' ')},y1:${(this.y1 + '').padStart(4, ' ')},y2:${(this.y2 + '').padStart(4, ' ')}}`;
      }
    }
  ) {
    const len = PointList.prototype.getLength.call(this);
    if(!len) return {};
    const first = PointList.prototype.at.call(this, 0);
    let ret = {
      x1: first.x,
      x2: first.x,
      y1: first.y,
      y2: first.y
    };

    for(let i = 1; i < len; i++) {
      const { x, y } = PointList.prototype.at.call(this, i);
      if(x < ret.x1) ret.x1 = x;
      if(x > ret.x2) ret.x2 = x;
      if(y < ret.y1) ret.y1 = y;
      if(y > ret.y2) ret.y2 = y;
    }
    return Object.setPrototypeOf(ret, proto);
  }

  rect() {
    return new Rect(bbox.call(this));
  }

  xrange() {
    const bbox = PointList.prototype.bbox.call(this);
    return [bbox.x1, bbox.x2];
  }

  normalizeX(newVal = x => x) {
    const xrange = PointList.prototype.xrange.call(this);
    const xdiff = xrange[1] - xrange[0];
    PointList.prototype.forEach.call(this, (p, i, l) => {
      l[i].x = newVal((l[i].x - xrange[0]) / xdiff);
    });
    return this;
  }

  yrange() {
    const bbox = PointList.prototype.bbox.call(this);
    return [bbox.y1, bbox.y2];
  }

  normalizeY(newVal = y => y) {
    const yrange = PointList.prototype.yrange.call(this);
    const ydiff = yrange[1] - yrange[0];
    PointList.prototype.forEach.call(this, (p, i, l) => {
      l[i].y = newVal((l[i].y - yrange[0]) / ydiff);
    });
    return this;
  }

  boundingRect() {
    return new Rect(bbox.call(this));
  }

  translate(x, y) {
    PointList.prototype.forEach.call(this, it => Point.prototype.move.call(it, x, y));
    return this;
  }

  transform(m) {
    if(isObject(m) && typeof m.toMatrix == 'function') m = m.toMatrix();
    if(isObject(m) && typeof m.transformPoint == 'function') {
      this.forEach(p => m.transformPoint(p));
      return this;
    }
    for(let i = 0; i < this.length; i++) Point.prototype.transform.call(this[i], m);
    return this;
  }

  getLineIndex(index) {
    const len = PointList.prototype.getLength.call(this);
    return (index < 0 ? len + index : index) % len;
  }

  getLine(index) {
    let a = PointList.prototype.getLineIndex.call(this, index);
    let b = PointList.prototype.getLineIndex.call(this, index + 1);
    return [PointList.prototype.at.call(this, a), PointList.prototype.at.call(this, b)];
  }

  lines(closed = false) {
    const points = this;
    const n = points.length - (closed ? 0 : 1);
    const iterableObj = {
      [Symbol.iterator]() {
        let step = 0;
        return {
          next() {
            let value;
            let done = step >= n;
            if(!done) {
              value = new Line(points[step], points[(step + 1) % points.length]);
              step++;
            }
            return { value, done };
          }
        };
      }
    };
    return iterableObj;
  }

  sort(pred) {
    return Array.prototype.sort.call(this, pred || ((a, b) => Point.prototype.valueOf.call(a) - Point.prototype.valueOf.call(b)));
  }

  toString(sep = ',', prec) {
    return Array.prototype.map.call(this, point => (Point.prototype.toString ? Point.prototype.toString.call(point, prec, sep) : point + '')).join(' ');
  }

  /*PointList.prototype[Symbol.toStringTag] = function(sep = ',', prec) {
  return Array.prototype.map
    .call(this, point => point.round(prec))
    .map(point => `${point.x}${sep}${point.y}`)
    .join(' ');
};*/

  toPath() {
    return Array.prototype.map.call(this, (point, i) => `${i > 0 ? 'L' : 'M'}${point}`).join(' ');
    return Array.prototype.reduce.call(this, (acc, point, i) => (acc ? acc + ' ' : '') + `${acc ? 'L' : 'M'}${point}`);
  }

  toSource(opts = {}) {
    if(opts.asString) return `new PointList("${this.toString(opts)}")`;

    let fn = opts.asArray
      ? p => `[${p.x},${p.y}]`
      : opts.plainObj
      ? p =>
          Point.toSource(p, {
            space: '',
            padding: ' ',
            separator: ','
          })
      : point =>
          Point.prototype.toSource.call(point, {
            ...opts,
            plainObj: true
          });
    return 'new PointList([' + PointList.prototype.map.call(this, fn).join(',') + '])';
  }

  round(prec, digits, type) {
    PointList.prototype.forEach.call(this, it => Point.prototype.round.call(it, prec, digits, type));
    return this;
  }

  ceil(prec) {
    PointList.prototype.forEach.call(this, it => Point.prototype.ceil.call(it, prec));
    return this;
  }

  floor(prec) {
    PointList.prototype.forEach.call(this, it => Point.prototype.floor.call(it, prec));
    return this;
  }

  toMatrix() {
    return Array.prototype.map.call(this, ({ x, y }) => Object.freeze([x, y]));
  }

  toPoints(ctor = Array.of) {
    return ctor(...this);
  }

  nearest(pt, fn = (index, dist, pt) => index) {
    let dist = Infinity,
      index = -1,
      i = 0;
    for(let p of this) {
      const d = p.distance(pt);
      if(dist > d) {
        dist = d;
        index = i;
      }
      i++;
    }
    return fn(index, dist, this[index]);
  }
}

PointList.prototype[Symbol.toStringTag] = 'PointList';

define(PointList, {
  get [Symbol.species]() {
    return PointList;
  }
});

Object.defineProperty(PointList.prototype, 'size', {
  get() {
    return PointList.prototype.getLength.call(this);
  }
});

define(PointList.prototype, {
  slice: Array.prototype.slice,
  [Symbol.isConcatSpreadable]: true,
  length: 0,
  [inspectSymbol](depth, options) {
    const obj = Array.from(this);
    return `\x1b[1;31m${className(this)}\x1b[0;36m` + obj.reduce((acc, { x, y }) => acc + ` ${x},${y}`, '') + `\x1b[0m`;
  }
});

for(let name of ['push', 'splice', 'clone', 'area', 'centroid', 'avg', 'bbox', 'rect', 'xrange', 'yrange', 'boundingRect']) {
  PointList[name] = points => PointList.prototype[name].call(points);
}

export const ImmutablePointList = immutableClass(PointList);
