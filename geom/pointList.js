import { Point, isPoint } from './point.js';
import { Rect } from './rect.js';
import { Line, isLine } from './line.js';
import Util from '../util.js';

export class PointList extends Array {
  constructor(points, tfn = (...args) => new Point(...args)) {
    super();
    const base = Array;
    let args = [...arguments];
    let ret = this instanceof PointList ? this : [];
    if(Util.isArray(args[0]) || Util.isGenerator(args[0])) args = [...args[0]];
    if(typeof points === 'string') {
      const matches = [...points.matchAll(/[-.0-9,]+/g)];
      //console.log("matches:",matches);
      for(let i = 0; i < matches.length; i++) {
        const coords = (matches[i][0] + '').split(/,/g).map(n => +n);
        // console.log(`matches[${i}]:`,matches[i], coords);
        ret.push(tfn(...coords));
      }
    } else if(args[0] && args[0].length == 2) {
      for(let i = 0; i < args.length; i++) ret.push(this instanceof PointList ? new Point(args[i]) : Point(args[i]));
    } else if(args.length !== undefined) {
      //&', args);
      for(let i = 0; i < args.length; i++) {
        ret.push(args[i] instanceof Point ? args[i] : tfn(args[i]));
      }
    }
    let proto = PointList.prototype;
    Object.setPrototypeOf(ret, proto);
    if(!(this instanceof PointList)) return ret;
  }
}
PointList.prototype[Symbol.toStringTag] = function() {
  return PointList.prototype.toString.apply(this, arguments);
};
Util.defineGetter(PointList, Symbol.species, () => PointList);
PointList.prototype[Symbol.isConcatSpreadable] = true;
PointList.prototype.rotateRight = function(n) {
  this.unshift(...this.splice(n % this.length, this.length));
  return this;
};
PointList.prototype.rotateLeft = function(n) {
  return this.rotateRight(this.length - (n % this.length));
};
PointList.prototype.rotate = function(n) {
  if(n < 0) return this.rotateLeft(-n);
  if(n > 0) return this.rotateRight(n);
  return this;
};
PointList.prototype.push = function(...args) {
  while(args.length > 0) Array.prototype.push.call(this, new Point(args));
  return this;
};
PointList.prototype.unshift = function(...args) {
  let points = [];
  while(args.length > 0) points.push(new Point(args));
  Array.prototype.splice.call(this, 0, 0, ...points);
  return this;
};
PointList.prototype.length = 0;
PointList.prototype.getLength = function() {
  return this.length;
};
Object.defineProperty(PointList.prototype, 'size', {
  get() {
    return PointList.prototype.getLength.call(this);
  }
});
PointList.prototype.at = function(index) {
  return this[+index];
};
PointList.prototype.splice = function() {
  let args = [...arguments];
  const start = args.shift();
  const remove = args.shift();
  return Array.prototype.splice.apply(this, [start, remove, ...args.map(arg => (arg instanceof Point ? arg : new Point(arg)))]);
};
PointList.prototype.slice = Array.prototype.slice;
PointList.prototype.removeSegment = function(index) {
  let indexes = [PointList.prototype.getLineIndex.call(this, index - 1), PointList.prototype.getLineIndex.call(this, index), PointList.prototype.getLineIndex.call(this, index + 1)];
  let lines = indexes.map(i => PointList.prototype.getLine.call(this, i));
  let point = Line.intersect(lines[0], lines[2]);
  if(point) {
    PointList.prototype.splice.call(this, 0, 2, new Point(point));
  }
};

/*PointList.prototype.toPath = function(options = {}) {
  const { relative = false, close = false, precision = 0.001 } = options;
  let out = '';
  const point = relative ? (i) => (i > 0 ? Point.diff(PointList.prototype.at.call(this, i), PointList.prototype.at.call(this, i - 1)) : PointList.prototype.at.call(this, i)) : (i) => PointList.prototype.at.call(this, i);
  const cmd = (i) => (i == 0 ? 'M' : 'L'[relative ? 'toLowerCase' : 'toUpperCase']());
  const len = PointList.prototype.getLength.call(this);
  for(let i = 0; i < len; i++) {
    out += cmd(i) + Util.roundTo(point(i).x, precision) + ',' + Util.roundTo(point(i).y, precision) + ' ';
  }
  if(close) out += 'Z';
  return out;
};*/
PointList.prototype.clone = function() {
  const ctor = this.constructor[Symbol.species];
  let points = PointList.prototype.map.call(this, p => Point.prototype.clone.call(p));
  return new ctor(points);
};
PointList.prototype.toPolar = function(tfn) {
  let ret = new PointList();
  let t = typeof tfn == 'function' ? tfn : (x, y) => ({ x /*: (x * 180) / Math.PI*/, y });
  ret.splice.apply(ret, [
    0,
    ret.length,
    ...PointList.prototype.map.call(this, p => {
      const angle = Point.prototype.toAngle.call(p);
      return t(angle, Point.prototype.distance.call(p));
    })
  ]);
  return ret;
};
PointList.prototype.fromPolar = function(tfn) {
  let ret = new PointList();
  let t = typeof tfn == 'function' ? tfn : (x, y) => ({ x /*: (x * Math.PI) / 180*/, y });
  ret.splice.apply(ret, [
    0,
    ret.length,
    ...PointList.prototype.map.call(this, p => {
      let r = t(p.x, p.y);
      return Point.prototype.fromAngle.call(r.x, r.y);
    })
  ]);
  return ret;
};
PointList.prototype.draw = function(ctx, close = false) {
  const first = PointList.prototype.at.call(this, 0);
  const len = PointList.prototype.getLength.call(this);
  ctx.to(first.x, first.y);
  for(let i = 1; i < len; i++) {
    const { x, y } = PointList.prototype.at.call(this, i);
    ctx.line(x, y);
  }
  if(close) ctx.line(first.x, first.y);
  return this;
};
PointList.prototype.area = function() {
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
};
PointList.prototype.centroid = function() {
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
};
PointList.prototype.avg = function() {
  let ret = PointList.prototype.reduce.call(this, (acc, p) => acc.add(p), new Point());
  return ret.div(PointList.prototype.getLength.call(this));
};
PointList.prototype.bbox = function() {
  const len = PointList.prototype.getLength.call(this);
  if(!len) return {};
  const first = PointList.prototype.at.call(this, 0);
  let ret = {
    x1: first.x,
    x2: first.x,
    y1: first.y,
    y2: first.y,
    toString() {
      return `{x1:${(this.x1 + '').padStart(4, ' ')},x2:${(this.x2 + '').padStart(4, ' ')},y1:${(this.y1 + '').padStart(4, ' ')},y2:${(this.y2 + '').padStart(4, ' ')}}`;
    }
  };
  for(let i = 1; i < len; i++) {
    const { x, y } = PointList.prototype.at.call(this, i);
    if(x < ret.x1) ret.x1 = x;
    if(x > ret.x2) ret.x2 = x;
    if(y < ret.y1) ret.y1 = y;
    if(y > ret.y2) ret.y2 = y;
  }
  return ret;
};
PointList.prototype.rect = function() {
  return new Rect(PointList.prototype.bbox.call(this));
};
PointList.prototype.xrange = function() {
  const bbox = PointList.prototype.bbox.call(this);
  return [bbox.x1, bbox.x2];
};
PointList.prototype.normalizeX = function(newVal = x => x) {
  const xrange = PointList.prototype.xrange.call(this);
  const xdiff = xrange[1] - xrange[0];
  PointList.prototype.forEach.call(this, (p, i, l) => {
    l[i].x = newVal((l[i].x - xrange[0]) / xdiff);
  });
  return this;
};
PointList.prototype.yrange = function() {
  const bbox = PointList.prototype.bbox.call(this);
  return [bbox.y1, bbox.y2];
};
PointList.prototype.normalizeY = function(newVal = y => y) {
  const yrange = PointList.prototype.yrange.call(this);
  const ydiff = yrange[1] - yrange[0];
  PointList.prototype.forEach.call(this, (p, i, l) => {
    l[i].y = newVal((l[i].y - yrange[0]) / ydiff);
  });
  return this;
};
PointList.prototype.boundingRect = function() {
  return new Rect(PointList.prototype.bbox.call(this));
};
PointList.prototype.translate = function(x, y) {
  PointList.prototype.forEach.call(this, it => Point.prototype.move.call(it, x, y));
  return this;
};
PointList.prototype.transform = function(m) {
  if(Util.isObject(m) && typeof m.toMatrix == 'function') m = m.toMatrix();
  if(Util.isObject(m) && typeof m.transform_point == 'function') {
    this.forEach(p => m.transform_point(p));
    return this;
  }
  for(let i = 0; i < this.length; i++) Point.prototype.transform.call(this[i], m);
  return this;
};

PointList.prototype.filter = function(pred) {
  let ret = new PointList();
  PointList.prototype.forEach.call(this, (p, i, l) => pred(p, i, l) && ret.push(new Point(l[i])));
  return ret;
};
PointList.prototype.getLineIndex = function(index) {
  const len = PointList.prototype.getLength.call(this);
  return (index < 0 ? len + index : index) % len;
};
PointList.prototype.getLine = function(index) {
  let a = PointList.prototype.getLineIndex.call(this, index);
  let b = PointList.prototype.getLineIndex.call(this, index + 1);
  return [PointList.prototype.at.call(this, a), PointList.prototype.at.call(this, b)];
};
PointList.prototype.lines = function(closed = false) {
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
};
PointList.prototype.sort = function(pred) {
  return Array.prototype.sort.call(this, pred || ((a, b) => Point.prototype.valueOf.call(a) - Point.prototype.valueOf.call(b)));
};
PointList.prototype.toString = function(sep = ',', prec) {
  return Array.prototype.map.call(this, point => (Point.prototype.toString ? Point.prototype.toString.call(point, prec, sep) : point + '')).join(' ');
};
PointList.prototype.toPath = function() {
  return Array.prototype.map.call(this, (point, i) => `${i > 0 ? 'L' : 'M'}${point}`).join(' ');
  return Array.prototype.reduce.call(this, (acc, point, i) => (acc ? acc + ' ' : '') + `${acc ? 'L' : 'M'}${point}`);
};
PointList.prototype.toSource = function(opts = {}) {
  if(opts.asString) return `new PointList("${this.toString(opts)}")`;

  let fn = opts.asArray ? p => `[${p.x},${p.y}]` : opts.plainObj ? p => Point.toSource(p, { space: '', padding: ' ', separator: ',' }) : point => Point.prototype.toSource.call(point, { ...opts, plainObj: true });
  return 'new PointList([' + PointList.prototype.map.call(this, fn).join(',') + '])';
};
PointList.prototype.add = function(pt) {
  if(!(pt instanceof Point)) pt = new Point(...arguments);
  PointList.prototype.forEach.call(this, it => Point.prototype.add.call(it, pt));
  return this;
};
PointList.prototype.sum = function(pt) {
  let ret = PointList.prototype.clone.call(this);
  return PointList.prototype.add.apply(ret, arguments);
};
PointList.prototype.sub = function(pt) {
  if(!(pt instanceof Point)) pt = new Point(...arguments);
  PointList.prototype.forEach.call(this, it => Point.prototype.sub.call(it, pt));
  return this;
};
PointList.prototype.diff = function(pt) {
  let ret = PointList.prototype.clone.call(this);
  return PointList.prototype.sub.apply(ret, arguments);
};
PointList.prototype.mul = function(pt) {
  if(typeof pt == 'number') pt = new Point({ x: pt, y: pt });
  if(!(pt instanceof Point)) pt = new Point(...arguments);
  PointList.prototype.forEach.call(this, it => Point.prototype.mul.call(it, pt));
  return this;
};
PointList.prototype.prod = function(pt) {
  let ret = PointList.prototype.clone.call(this);
  return PointList.prototype.mul.apply(ret, arguments);
};
PointList.prototype.div = function(pt) {
  if(typeof pt == 'number') pt = new Point({ x: pt, y: pt });
  if(!(pt instanceof Point)) pt = new Point(...arguments);
  PointList.prototype.forEach.call(this, it => Point.prototype.div.call(it, pt));
  return this;
};
PointList.prototype.quot = function(pt) {
  let ret = PointList.prototype.clone.call(this);
  return PointList.prototype.div.apply(ret, arguments);
};
PointList.prototype.round = function(prec) {
  PointList.prototype.forEach.call(this, it => Point.prototype.round.call(it, prec));
  return this;
};
PointList.prototype.ceil = function(prec) {
  PointList.prototype.forEach.call(this, it => Point.prototype.ceil.call(it, prec));
  return this;
};
PointList.prototype.floor = function(prec) {
  PointList.prototype.forEach.call(this, it => Point.prototype.floor.call(it, prec));
  return this;
};
PointList.prototype.toMatrix = function() {
  return Array.prototype.map.call(this, ({ x, y }) => Object.freeze([x, y]));
};
if(!Util.isBrowser()) {
  let c = Util.coloring();
  let sym = Symbol.for('nodejs.util.inspect.custom');
  PointList.prototype[sym] = function() {
    return `${c.text('PointList', 1, 31)}${c.text('(', 1, 36)}${c.text(this.getLength(), 1, 35) + c.code(1, 36)}) [\n  ${this.map(({ x, y } ///*Point.prototype.toSource.call(point, { plainObj: true, colors: true })  ||*/ Util.toSource(point, {colors: true }) || point[sym]() ||
    ) => Util.toString({ x, y }, { multiline: false, spacing: ' ' })).join(',\n  ')}\n${c.text(']', 1, 36)}`;
  };
}
for(let name of ['push', 'splice', 'clone', 'area', 'centroid', 'avg', 'bbox', 'rect', 'xrange', 'yrange', 'boundingRect']) {
  PointList[name] = points => PointList.prototype[name].call(points);
}
export function Polyline(lines) {
  let ret = this instanceof Polyline ? this : new PointList();
  const addUnique = point => {
    const ok = ret.length > 0 ? !Point.equals(ret[ret.length - 1], point) : true;
    if(ok) Array.prototype.push.call(ret, Point.clone(point));
    return ok;
  };
  let prev;
  for(let i = 0; i < lines.length; i++) {
    const line = lines.shift();
    if(isPoint(line)) {
      addUnique(line);
      prev = line;
    } else if(isLine(line)) {
      if(i > 0) {
        const eq = [Point.equals(prev, line.a)];
        if(!eq[0] && !Point.equals(prev, line.b)) break;
      } else {
        addUnique(line.a);
      }
      addUnique(line.b);
      prev = line.b;
    }
  }
  return ret;
}
Polyline.prototype = new PointList();
Polyline.prototype.toSVG = function(factory, attrs = {}, parent = null, prec) {
  return factory('polyline', { points: PointList.prototype.toString.call(this), ...attrs }, parent, prec);
};
Polyline.prototype.push = function(...args) {
  const last = this[this.length - 1];
  for(let arg of args) {
    if(last && Point.equals(arg, last)) continue;
    PointList.prototype.push.call(this, arg);
  }
  return this;
};
Polyline.prototype.inside = function(point) {
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
};
Polyline.inside = function(a, b) {
  return a.every(point => b.inside(point));
};
Polyline.prototype.isClockwise = function() {
  let sum = 0;
  for(let i = 0; i < this.length - 1; i++) {
    let cur = this[i],
      next = this[i + 1];
    sum += (next.x - cur.x) * (next.y + cur.y);
  }
  return sum > 0;
};
Util.defineGetter(Polyline.prototype, 'clockwise', function() {
  let ret = new (this[Symbol.species] || this.constructor)().concat(this);
  return Polyline.prototype.isClockwise.call(this) ? ret : ret.reverse();
});
Util.defineGetter(Polyline.prototype, 'counterClockwise', function() {
  let ret = new (this[Symbol.species] || this.constructor)().concat(this);
  return Polyline.prototype.isClockwise.call(this) ? ret.reverse() : ret;
});

Polyline.isClockwise = function isClockwise(poly) {
  let sum = 0;
  for(let i = 0; i < poly.length - 1; i++) {
    let cur = poly[i],
      next = poly[i + 1];
    sum += (next.x - cur.x) * (next.y + cur.y);
  }
  return sum > 0;
};
Util.define(PointList, {
  get [Symbol.species]() {
    return PointList;
  }
});

export const ImmutablePointList = Util.immutableClass(PointList);
Util.defineGetter(ImmutablePointList, Symbol.species, () => ImmutablePointList);
