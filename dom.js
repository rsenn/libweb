var ReactDOM = require("react-dom").ReactDOM;
var SvgPath = require("./svg-path.js");

import Util from "./util.js";

export function dom() {
  let args = [...arguments];
  let ret = Util.array();

  const extend = (e, functions) => {
    const keys = [...Util.members(functions)].filter(key => ["callee", "caller", "arguments", "call", "bind", "apply", "prototype", "constructor", "length"].indexOf(key) == -1 && typeof functions[key] == "function");
    for(let key of keys) if(e[key] === undefined) e[key] = functions[key].bind(functions, e);
    /* function() {
          return functions[key].apply(functions, [this, ...arguments]);
        };*/
  };

  args = args.map(arg => (typeof arg == "string" ? Element.findAll(arg) : arg));

  for(let e of args) {
    if(e instanceof SVGSVGElement) extend(e, SVG);
    else if(e instanceof HTMLElement) {
      extend(e, Element);
      ElementPosProps(e);
      ElementSizeProps(e);
    }

    ret.push(e);
  }
  if(ret.length == 1) ret = ret[0];
  return ret;
}

/**
 * Determines if number.
 *
 * @return     {(Object|Point|boolean|string)}  True if number, False otherwise.
 */
export const isNumber = a => {
  return String(a).replace(/^[0-9]*$/, "") == "";
};

export function Align(arg) {}

Align.CENTER = 0;
Align.LEFT = 1;
Align.RIGHT = 2;

Align.MIDDLE = 0;
Align.TOP = 4;
Align.BOTTOM = 8;

Align.horizontal = alignment => alignment & (Align.LEFT | Align.RIGHT);
Align.vertical = alignment => alignment & (Align.TOP | Align.BOTTOM);

export const Anchor = Align;

/**
 * Class for point.
 *
 * @class      Point (name)
 */
export function Point(arg) {
  let args = arg instanceof Array ? arg : [...arguments];
  let p = !this || this === Point ? {} : this;

  arg = args.shift();

  if(typeof arg === "number") {
    p.x = parseFloat(arg);
    p.y = parseFloat(args.shift());
  } else if(typeof arg === "string") {
    const matches = [...arg.matchAll(new RegExp("/([-+]?d*.?d+)(?:[eE]([-+]?d+))?/g"))];
    p.x = parseFloat(matches[0]);
    p.y = parseFloat(matches[1]);
  } else if(typeof arg == "object" && arg !== null && (arg.x !== undefined || arg.y !== undefined)) {
    p.x = arg.x;
    p.y = arg.y;
  } else if(typeof arg == "object" && arg !== null && arg.length > 0 && arg[0] !== undefined && arg[1] !== undefined) {
    p.x = parseFloat(arg.shift());
    p.y = parseFloat(arg.shift());
  } else if(typeof args[0] === "number" && typeof args[1] === "number") {
    p.x = args[0];
    p.y = args[1];
    args.shift(2);
  } else {
    p.x = 0;
    p.y = 0;
  }
  if(isNaN(p.x)) p.x = undefined;
  if(isNaN(p.y)) p.y = undefined;

  if(!this || this === Point) {
    if(p.prototype == Object) p.prototype = Point.prototype;
    else Object.assign(p, Point.prototype);
    return p;
  }
}

Point.move_to = (p, x, y) => {
  let args = [...arguments];
  /*p =*/ args.shift();
  let other = Point.call(Point, args);
  p.x = other.x;
  p.y = other.y;
  return p;
};
Point.move_rel = (p, x, y) => {
  let other = Point(x, y);
  p.x += other.x;
  p.y += other.y;
  return p;
};

Point.prototype.move_to = function(x, y) {
  return Point.move_to.apply(Point, [this, ...arguments]);
};
Point.prototype.move_rel = function(x, y) {
  return Point.move_rel.apply(Point, [this, ...arguments]);
};

Point.set = (p, fn) => {
  if(typeof fn != "function") return Point.apply(p, [...arguments]);

  return fn(p.x, p.y);
};
Point.prototype.set = function(fn) {
  if(typeof fn != "function") {
    Point.apply(this, [...arguments]);
    return this;
  }
  return fn(this.x, this.y);
};

Point.clone = ({ x, y }) => Point({ x, y });
Point.prototype.clone = function() {
  return new Point({ x: this.x, y: this.y });
};

Point.sum = (sum, pt) => new Point({ x: sum.x + pt.x, y: sum.y + pt.y });
Point.prototype.sum = function(other) {
  return new Point(this.x + other.x, this.y + other.y);
};
Point.prototype.add = function(other) {
  this.x += other.x;
  this.y += other.y;
  return this;
};
Point.add = (p, other) => Point.prototype.add.call(p, other);

Point.diff = (diff, pt) => Point({ x: diff.x - pt.x, y: diff.y - pt.y });
Point.prototype.diff = function(other) {
  return new Point(this.x - other.x, this.y - other.y);
};
Point.prototype.sub = function(other) {
  this.x -= other.x;
  this.y -= other.y;
  return this;
};
Point.sub = (p, other) => Point.prototype.sub.call(p, other);

Point.prod = (p, f) => {
  const o = isPoint(f) ? f : { x: f, y: f };
  return Point({ x: p.x * o.x, y: p.y * o.y });
};

Point.prototype.prod = function(f) {
  const o = isPoint(f) ? f : { x: f, y: f };
  return new Point(this.x * o.x, this.y * o.y);
};
Point.mul = (p, f) => {
  const o = isPoint(f) ? f : { x: f, y: f };
  p.x *= o.x;
  p.y *= o.y;
  return p;
};
Point.prototype.mul = function(f) {
  const o = isPoint(f) ? f : { x: f, y: f };
  this.x *= o.x;
  this.y *= o.y;
  return this;
};

Point.quot = (p, f) => Point({ x: p.x / f, y: p.y / f });
Point.prototype.quot = function(other) {
  return new Point(this.x / other.x, this.y / other.y);
};
Point.prototype.div = function(f) {
  this.x /= f;
  this.y /= f;
  return this;
};

Point.comp = p => Point({ x: -p.x, y: -p.y });
Point.prototype.neg = function() {
  this.x *= -1;
  this.y *= -1;
  return this;
};

Point.distance = (p1, p2 = { x: 0, y: 0 }) => Math.sqrt((p1.y - p2.y) * (p1.y - p2.y) + (p1.x - p2.x) * (p1.x - p2.x));
Point.prototype.distance = function() {
  return Point.distance(this);
};

Point.round = (p, precision = 1.0) => {
  p.x = Math.round(p.x / precision) * precision;
  p.y = Math.round(p.y / precision) * precision;
  return p;
};

Point.prototype.round = function(precision = 1.0) {
  this.x = Math.round(this.x / precision) * precision;
  this.y = Math.round(this.y / precision) * precision;
  return this;
};

Point.sides = p => ({
  top: p.y,
  right: p.x + p.w1idth,
  bottom: p.y + p.height,
  left: p.x
});

Point.dot = (a, b) => a.x * b.x + a.y * b.y;
Point.prototype.dot = function(other) {
  return Point.dot(this, other);
};

Point.fromAngle = (angle, dist = 1.0) =>
  new Point({
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist
  });

Point.toAngle = p => Math.atan2(p.x, p.y);
Point.prototype.toAngle = function() {
  return Point.toAngle(this);
};

Point.angle = (p1, p2 = { x: 0, y: 0 }) => Point.toAngle(Point.diff(p1, p2));
Point.prototype.angle = function(p2 = { x: 0, y: 0 }) {
  return Point.angle(this, p2);
};

Point.dimension = p => [p.width, p.height];

Point.toString = point => {
  if(point instanceof Array) return `[${point[0].toFixed(3)},${point[1].toFixed(3)}]`;
  return `${point.x},${point.y}`;
  //  return Point.prototype.toString.call(point);
};
Point.prototype.toString = function(prec) {
  return this.x.toFixed(prec) + " " + this.y.toFixed(prec);
};
Point.prototype.toSource = function() {
  return "{x:" + this.x.toFixed(3) + ",y:" + this.y.toFixed(3) + "}";
};

Point.toCSS = function() {
  const point = this instanceof Point ? this : Point.apply(Point, arguments);
  return {
    left: point.x + "px",
    top: point.y + "px"
  };
};
Point.prototype.toCSS = Point.toCSS;

Point.match = new RegExp("/([0-9.]+,[0-9.]+)/");

Point.inside = (p, rect) => p.x >= rect.x && p.x < rect.x + rect.width && p.y >= rect.y && p.y < rect.y + rect.height;

Point.transform = (p, m) => ({
  x: m.xx * p.x + m.yx * p.y + m.tx,
  y: m.xy * p.x + m.yy * p.y + m.ty
});

Point.prototype.transform = function(m) {
  const t = Point.transform(this, m);
  this.x = t.x;
  this.y = t.y;
  return this;
};

Point.prototype.normalize = function(minmax) {
  return new Point({
    x: (this.x - minmax.x1) / (minmax.x2 - minmax.x1),
    y: (this.y - minmax.y1) / (minmax.y2 - minmax.y1)
  });
};

export function Unit(str) {
  let u =
    this instanceof Unit
      ? this
      : {
          format(number) {
            return `${number}${this.name}`;
          }
        };
  u.name = str.replace(/^[a-z]*/, "");
  return u;
}

export function ScalarValue() {}

export const isPoint = o => o && ((o.x !== undefined && o.y !== undefined) || ((o.left !== undefined || o.right !== undefined) && (o.top !== undefined || o.bottom !== undefined)));

export function PointList(points) {
  let args = [...arguments];
  let ret = this instanceof PointList ? this : [];

  if(args.length == 1 && args[0] instanceof Array) args = args[0];

  if(typeof points === "string") {
    const matches = [...points.matchAll(/[-.0-9,]+/g)];

    //console.log('points: ', points);
    //console.log('matches: ', matches);

    for(let i = 0; i < matches.length; i++) {
      const coords = String(matches[i]).split(",");
      ret.push(Point(coords));
    }
  } else if(args[0] && args[0].length == 2) {
    for(let i = 0; i < args.length; i++) ret.push(this instanceof PointList ? new Point(args[i]) : Point(args[i]));
  } else if(isPoint(args[0])) {
    for(let i = 0; i < args.length; i++) ret.push(this instanceof PointList ? new Point(args[i]) : Point(args[i]));
  }

  if(!(this instanceof PointList)) {
    return ret;
  }
}

PointList.prototype = new Array();
PointList.prototype.push = function() {
  const args = [...arguments];
  args.forEach(arg => {
    if(!(arg instanceof Point)) arg = new Point(arg);
    Array.prototype.push.call(this, arg);
  });
};
PointList.push = (plist, points) => {
  let args = [...arguments];
  args.shift();
  return PointList.prototype.push.apply(plist, args);
};

PointList.prototype.splice = function() {
  let args = [...arguments];
  const start = args.shift();
  const remove = args.shift();
  return Array.prototype.splice.apply(this, [start, remove, ...args.map(arg => (arg instanceof Point ? arg : new Point(arg)))]);
};
PointList.splice = (plist, start, remove, points) => {
  let args = [...arguments];
  args.shift();
  return PointList.prototype.splice.apply(plist, args);
};
PointList.prototype.removeSegment = function(index) {
  let indexes = [PointList.prototype.getLineIndex.call(this, index - 1), PointList.prototype.getLineIndex.call(this, index), PointList.prototype.getLineIndex.call(this, index + 1)];

  let lines = indexes.map(i => PointList.prototype.getLine.call(this, i));

  let point = Line.intersect(lines[0], lines[2]);
  if(point) {
    PointList.prototype.splice.call(this, 0, 2, new Point(point));
  }
};

PointList.prototype.toPath = function(options = {}) {
  const { relative = false, close = false } = options;
  let out = "";
  for(let i = 0; i < this.length; i++) {
    out += (i == 0 ? "M" : "L") + this[i].x.toFixed(3) + "," + this[i].y.toFixed(3) + " ";
  }
  if(close) out += "Z";
  return out;
};

PointList.prototype.clone = function() {
  let ret = new PointList();
  ret.splice.apply(ret, [0, ret.length, ...this.map(p => new Point(p.x, p.y))]);
  return ret;
};

PointList.copy = plist => PointList.prototype.clone.call(plist);

PointList.prototype.toPolar = function(tfn) {
  //console.log('toPolar [' + this.length + ']');
  let ret = new PointList();
  let t = typeof tfn == "function" ? tfn : (x, y) => ({ x: (x * 180) / Math.PI, y });
  ret.splice.apply(ret, [
    0,
    ret.length,
    ...this.map(p => {
      const angle = Point.toAngle(p);
      // console.log("Angle: ", angle);
      return t(angle, Point.distance(p));
    })
  ]);
  return ret;
};

PointList.toPolar = plist => PointList.prototype.toPolar.call(plist);

PointList.prototype.fromPolar = function(tfn) {
  let ret = new PointList();
  let t = typeof tfn == "function" ? tfn : (x, y) => ({ x: (x * Math.PI) / 180, y });
  ret.splice.apply(ret, [
    0,
    ret.length,
    ...this.map(p => {
      let r = t(p.x, p.y);
      return Point.fromAngle(r.x, r.y);
    })
  ]);
  return ret;
};

PointList.fromPolar = plist => PointList.prototype.toPolar.call(plist);

PointList.prototype.draw = function(ctx, close = false) {
  ctx.to(this[0].x, this[0].y);
  for(let i = 1; i < this.length; i++) {
    ctx.line(this[i].x, this[i].y);
  }
  if(close) ctx.line(this[0].x, this[0].y);
  return this;
};

PointList.prototype.area = function() {
  var area = 0;
  var i;
  var j;
  var point1;
  var point2;

  for(i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
    point1 = this[i];
    point2 = this[j];
    area += point1.x * point2.y;
    area -= point1.y * point2.x;
  }
  area /= 2;

  return area;
};
PointList.prototype.centroid = function() {
  var x = 0;
  var y = 0;
  var i;
  var j;
  var f;
  var point1;
  var point2;

  for(i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
    point1 = this[i];
    point2 = this[j];
    f = point1.x * point2.y - point2.x * point1.y;
    x += (point1.x + point2.x) * f;
    y += (point1.y + point2.y) * f;
  }

  f = this.area() * 6;

  return new Point(x / f, y / f);
};
PointList.prototype.avg = function() {
  var ret = this.reduce((acc, p) => acc.add(p), new Point());
  return ret.div(this.length);
};
PointList.prototype.minmax = function() {
  if(!this.length) return {};
  var ret = {
    x1: this[0].x,
    x2: this[0].x,
    y1: this[0].y,
    y2: this[0].y,
    toString: function() {
      return `x ${this.x1.toFixed(3)}->${this.x2.toFixed(3)} y ${this.y1.toFixed(3)}->${this.y2.toFixed(3)}`;
    }
  };
  for(let i = 1; i < this.length; i++) {
    const x = this[i].x;
    const y = this[i].y;
    if(x < ret.x1) ret.x1 = x;
    if(x > ret.x2) ret.x2 = x;
    if(y < ret.y1) ret.y1 = y;
    if(y > ret.y2) ret.y2 = y;
  }
  return ret;
};
PointList.minmax = list => PointList.prototype.minmax.call(list);

PointList.prototype.xrange = function() {
  const minmax = this.minmax();
  return [minmax.x1, minmax.x2];
};
PointList.prototype.normalizeX = function(newVal = x => x) {
  const xrange = PointList.prototype.xrange.call(this);
  const xdiff = xrange[1] - xrange[0];
  this.forEach((p, i, l) => {
    l[i].x = newVal((l[i].x - xrange[0]) / xdiff);
  });
  return this;
};
PointList.prototype.yrange = function() {
  const minmax = this.minmax();
  return [minmax.y1, minmax.y2];
};
PointList.prototype.normalizeY = function(newVal = y => y) {
  const yrange = PointList.prototype.yrange.call(this);
  const ydiff = yrange[1] - yrange[0];

  //console.log('yrange ', yrange);
  this.forEach((p, i, l) => {
    l[i].y = newVal((l[i].y - yrange[0]) / ydiff);
  });
  return this;
};

PointList.prototype.boundingRect = function() {
  return new Rect(this.minmax());
};

PointList.prototype.transform = function(matrix) {
  let m = new Matrix(matrix).toDOMMatrix();
  for(let i = 0; i < this.length; i++) this[i] = m.transformPoint(this[i]);
  return this;
};

PointList.prototype.filter = function(pred) {
  let ret = new PointList();
  this.forEach((p, i, l) => pred(p, i, l) && ret.push(new Point(l[i])));
  return ret;
};

PointList.prototype[Symbol.iterator] = function() {
  var ret = class {
    pos = 0;
    constructor(list) {
      this.list = list;
    }

    next() {
      //  const ret = { get value() { return list[pos]; }, get done() { return  pos == list.length; } };
      const done = this.pos == this.list.length;
      const value = this.list[this.pos];
      let ret = { value, done, pos: this.pos };
      this.pos++;

      return ret;
    }
  };
  return new ret(this);
};

PointList.prototype.getLineIndex = function(index) {
  return (index < 0 ? this.length + index : index) % this.length;
};
PointList.prototype.getLine = function(index) {
  let a = PointList.prototype.getLineIndex.call(this, index);
  let b = PointList.prototype.getLineIndex.call(this, index + 1);
  return [this[a], this[b]];
};

PointList.prototype.lines = function(closed = false) {
  const points = this;
  const n = points.length - (closed ? 0 : 1);

  const iterableObj = {
    /*   * [Symbol.iterator](closed = false) {
  for(var i = 0; i < n ; i++) {
    const a = points[i], b = points[(i + 1) % n];

    yield [a,b];
  }
}*/
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

PointList.prototype.toString = function() {
  return "[" + this.map(point => Point.toString(point) /*.toString && !(point instanceof DOMPoint) ? point.toString() : Point.toString(point))*/).join(",\n  ") + "]";
};

PointList.toString = pointList => {
  return "[" + [...pointList].map(p => `[${p.x || p[0]},${p.y || p[1]}]`).join(",") + "]";
};

PointList.prototype.rotateRight = function(n) {
  return Util.rotateRight(this, n);
};

/**
 * Class for size.
 *
 * @class      Size (w, h)
 */
export function Size(arg) {
  let obj = this instanceof Size ? this : {};
  let args = [...arguments];

  if(args.length == 1 && args[0].length !== undefined) {
    args = args[0];
    arg = args[0];
  }
  //console.log.apply(console, ['Size(', ...args, ')']);

  if(typeof arg == "object") {
    if(arg.width !== undefined || arg.height !== undefined) {
      arg = args.shift();
      obj.width = arg.width;
      obj.height = arg.height;
    } else if(arg.x2 !== undefined && arg.y2 !== undefined) {
      arg = args.shift();
      obj.width = arg.x2 - arg.x;
      obj.height = arg.y2 - arg.y;
    } else if(arg.bottom !== undefined && arg.right !== undefined) {
      arg = args.shift();
      obj.width = arg.right - arg.left;
      obj.height = arg.bottom - arg.top;
    }
  } else {
    while(typeof arg == "object" && (arg instanceof Array || "length" in arg)) {
      args = [...arg];
      arg = args[0];
    }

    //console.log('Size ', { arg, args });
    /*
    if(typeof arg === 'string')
      arg = [...args.join(' ').matchAll(/[0-9.]+/g)].slice(-2).map(a => parseFloat(a));

    else if(typeof arg !== 'object') arg = arguments;
*/
    if(args && args.length >= 2) {
      let w = args.shift();
      let h = args.shift();

      if(typeof w == "object" && "baseVal" in w) w = w.baseVal.value;
      if(typeof h == "object" && "baseVal" in h) h = h.baseVal.value;

      obj.width = typeof w == "number" ? w : parseFloat(w.replace(/[^-.0-9]*$/, ""));
      obj.height = typeof h == "number" ? h : parseFloat(h.replace(/[^-.0-9]*$/, ""));

      obj.units = {
        width: typeof w == "number" ? "px" : w.replace(obj.width.toString(), ""),
        height: typeof h == "number" ? "px" : h.replace(obj.height.toString(), "")
      };
    }
  }
  if(isNaN(obj.width)) obj.width = undefined;
  if(isNaN(obj.height)) obj.height = undefined;

  //console.log('Size', obj, ' arg=', arg);

  if(!(obj instanceof Size)) return obj;
}

Size.convertUnits = (size, w = "window" in global ? window : null) => {
  if(w === null) return size;
  const view = {
    vw: w.innerWidth,
    vh: w.innerHeight,
    vmin: w.innerWidth < w.innerHeight ? w.innerWidth : w.innerHeight,
    vmax: w.innerWidth > w.innerHeight ? w.innerWidth : w.innerHeight
  };
  if(view[size.units.width] !== undefined) {
    size.width = (size.width / 100) * view[size.units.width];
    delete size.units.width;
  }
  if(view[size.units.height] !== undefined) {
    size.height = (size.height / 100) * view[size.units.height];
    delete size.units.height;
  }
  return size;
};

Size.aspect = function aspect(size) {
  size = this instanceof Size ? this : size;
  return size.width / size.height;
};

Size.toCSS = function(arg) {
  const size = arg && arg.width !== undefined ? arg : this;
  let ret = {};

  if(size.width !== undefined) ret.width = size.width + (size.units && "width" in size.units ? size.units.width : "px");
  if(size.height !== undefined) ret.height = size.height + (size.units && "height" in size.units ? size.units.height : "px");
  return ret;
};
Size.prototype.toCSS = Size.toCSS;

export const isSize = o => o && ((o.width !== undefined && o.height !== undefined) || (o.x !== undefined && o.x2 !== undefined && o.y !== undefined && o.y2 !== undefined) || (o.left !== undefined && o.right !== undefined && o.top !== undefined && o.bottom !== undefined));

Size.transform = (s, m) => ({
  width: m.xx * s.width + m.yx * s.height,
  height: m.xy * s.width + m.yy * s.height
});

Size.prototype.transform = function(m) {
  const t = Size.transform(this, m);
  this.width = t.width;
  this.height = t.height;
  return this;
};

Size.prototype.isSquare = function() {
  return Math.abs(this.width - this.height) < 1;
};

Size.prototype.area = function() {
  return this.width * this.height;
};
Size.area = size => {
  return size.width * size.height;
};

/**
 * Class for rectangle.
 *
 * @class      Rect (name)
 */
export function Rect(arg) {
  let obj = this instanceof Rect ? this : {}; // this === Rect || !this ? {} : this;
  let args = arg instanceof Array ? arg : [...arguments];
  let ret;

  if(typeof args[0] == "number") {
    arg = args;
  } else {
    arg = args.shift();
    if(arg && arg[0] && arg[0].length == 4) arg = arg[0];
  }

  /*
  ['x', 'y', 'width', 'height'].forEach(field => {
    if(typeof obj[field] != 'number') obj[field] = 0;
  });
*/
  if(arg && arg.x1 !== undefined && arg.y1 !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    const { x1, y1, x2, y2 } = arg;
    obj.x = x1;
    obj.y = y1;
    obj.width = x2 - x1;
    obj.height = y2 - y1;
    ret = 1;
  } else if(arg && arg.x !== undefined && arg.y !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    const { x, y, x2, y2 } = arg;
    obj.x = x;
    obj.y = y;
    obj.width = x2 - x;
    obj.height = y2 - y;
    ret = 1;
  } else if(isPoint(arg) && arg.y !== undefined && arg.width !== undefined && arg.height !== undefined) {
    obj.x = parseFloat(arg.x);
    obj.y = parseFloat(arg.y);
    obj.width = parseFloat(arg.width);
    obj.height = parseFloat(arg.height);
    ret = 1;
  } else if(arg && arg.length >= 4 && arg.slice(0, 4).every(arg => !isNaN(parseFloat(arg)))) {
    obj.x = typeof arg[0] === "number" ? arg[0] : parseFloat(arg[0]);
    obj.y = typeof arg[1] === "number" ? arg[1] : parseFloat(arg[1]);
    obj.width = typeof arg[2] === "number" ? arg[2] : parseFloat(arg[2]);
    obj.height = typeof arg[3] === "number" ? arg[3] : parseFloat(arg[3]);
    ret = 4;
  } else if(arg && arg.length >= 2 && arg.slice(0, 2).every(arg => !isNaN(parseFloat(arg)))) {
    obj.width = typeof arg[0] === "number" ? arg[0] : parseFloat(arg[0]);
    obj.height = typeof arg[1] === "number" ? arg[1] : parseFloat(arg[1]);
    ret = 2;
  } else if(arg instanceof Array) {
    let argc;
    let argi = 0;
    if(arg.length >= 4) {
      argc = typeof arg[0] == "number" ? 2 : 1;
      Point.apply(obj, arg.slice(0, argc));
      argi = argc;
    }
    argc = typeof arg[argi] == "number" ? 2 : 1;
    Size.apply(obj, arg.slice(argi, argc));

    ret = argi + argc;
  }

  if(obj.round === undefined) {
    Object.defineProperty(obj, "round", {
      value: function() {
        return Rect.round(this);
      },
      enumerable: true,
      writable: false
    });
  }
  //  if(!isRect(obj)) throw new Error('ERROR: is not a rect: '  + Util.inspect(obj));
  if(!(this instanceof Rect)) {
    /*    if(this === Rect && obj)*/ return obj;
    return ret;
  }
}

Rect.aspect = Size.aspect;

export const isRect = rect => isPoint(rect) && isSize(rect);
Rect.isRect = rect => isPoint(rect) && isSize(rect);
Rect.fromPoints = (p1, p2) => {
  return new Rect(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
};

Rect.clone = function clone(arg) {
  const { x, y, width, height } = this === Rect ? arg : this;
  return this === Rect ? { x, y, width, height } : new Rect(x, y, width, height);
};

Rect.corners = (rect = this) => [
  { x: rect.x, y: rect.y }, // top left
  { x: rect.x + rect.width, y: rect.y }, // top right
  { x: rect.x + rect.width, y: rect.y + rect.height }, // bottom right
  { x: rect.x, y: rect.y + rect.height } // bottom left
];

Rect.centered = (point, rx, ry = rx) => new Rect(point.x - rx * 0.5, point.y - ry * 0.5, rx * 2, ry * 2);

Rect.bbrect = () => {
  const ex = Rect.extrema(arguments);
  return {
    x: ex.x[0],
    y: ex.y[0],
    w: ex.x[1] - ex.x[0],
    h: ex.y[1] - ex.y[0]
  };
};

Rect.extrema = () => {
  let args = Array.from(arguments);
  const f = args.shift();
  return args.reduce(
    function(ex, pt) {
      return {
        x: [Math.min(ex.x[0], pt.x), Math.max(ex.x[1], pt.x + (pt.width || 0))],
        y: [Math.min(ex.y[0], pt.y), Math.max(ex.y[1], pt.y + (pt.height || 0))]
      };
    },
    { x: [f.x, f.x], y: [f.y, f.y] }
  );
};
/*
Rect.move_rel = (rect, point) => {
  let args = [...arguments];
  args.shift();
  let to = Point.call(Point, args);
  rect.x += to.x;
  rect.y += to.y;
  return rect;
};

Rect.move_to = (rect, point) => {
  let args = [...arguments];
  args.shift();
  let to = Point.call(Point, args);
  rect.x = to.x;
  rect.y = to.y;
  return rect;
};*/

Rect.resize = () => {
  let args = Array.from(arguments);
  let rect = this == Rect ? args.shift() : this;
  Size.apply(rect, args);
  return rect;
};
Object.assign(Rect.prototype, Point.prototype);
Object.assign(Rect.prototype, Size.prototype);

if (Rect.prototype.isSquare === undefined) {
  Rect.prototype.isSquare = function() {
    return Math.abs(this.width - this.height) < 1;
  };
}

Rect.prototype.constructor = Rect;

Rect.prototype.area = function() {
  return this.width * this.height;
};
Rect.prototype.toString = function() {
  return this.x + "," + this.y + " " + this.width + "x" + this.height;
};
Rect.toString = rect => rect.x + "," + rect.y + " " + rect.width + "x" + rect.height;

Rect.toSource = (r = this) => "{x:" + r.x + ",y:" + r.y + ",width:" + r.width + ",height:" + r.height + "}";
Rect.prototype.toSource = (r = this) => "new Rect(" + (r ? r.x + "," + r.y + "," + r.width + "," + r.height : "") + ")";

Rect.equal = (a, b) => a.x == b.x && a.y == b.y && a.width == b.width && a.height == b.height;

Rect.indexOf = (r, a, skip = () => false) =>
  a.reduce((accu, item, i) => {
    return accu == -1 && !skip(item) && Rect.equal(r, item) ? i : accu;
  }, -1);

Rect.lastIndexOf = (r, a, skip = () => false) =>
  a.reduceRight((accu, item, i) => {
    return accu == -1 && !skip(item) && Rect.equal(r, item) ? i : accu;
  }, -1);

Rect.onlyUnique = (item, i, arr, keep = () => true) => Rect.indexOf(item, arr, elem => !keep(elem)) == i;
Rect.uniq = (arr, keep = elem => false) => arr.filter((elem, i, arr) => keep(elem) || Rect.onlyUnique(elem, i, arr));

Rect.x2 = rect => rect.x + rect.width;
Rect.y2 = rect => rect.y + rect.height;

Rect.round = r =>
  new Rect({
    x: Math.round(r.x),
    y: Math.round(r.y),
    x2: Math.round(Rect.x2(r)),
    y2: Math.round(Rect.y2(r))
  });

Rect.prototype.round = function(precision = 1.0) {
  let { x, y, x2, y2 } = this;
  this.x = +x.toFixed(precision);
  this.y = +y.toFixed(precision);
  this.width = +x2.toFixed(precision) - this.x;
  this.height = +y2.toFixed(precision) - this.y;
  return this;
};

Rect.union = (a, b) => {
  let ret = {
    x: a.x < b.x ? a.x : b.x,
    y: a.y < b.y ? a.y : b.y
  };
  ret.width = Math.max(Rect.x2(a), Rect.x2(b)) - ret.x;
  ret.height = Math.max(Rect.y2(a), Rect.y2(b)) - ret.y;
  return Rect.round(ret);
};

Util.defineGetterSetter(
  Rect.prototype,
  "x1",
  function() {
    return this.x;
  },
  function(value) {
    const extend = this.x - value;
    this.width += extend;
    this.x -= extend;
  }
);

Object.defineProperty(Rect.prototype, "x2", {
  get: function() {
    return this.x + this.width;
  },
  set: function(value) {
    this.width = value - this.x;
  },
  enumerable: true
});
Object.defineProperty(Rect.prototype, "y1", {
  get: function() {
    return this.y;
  },
  set: function(value) {
    const extend = this.y - value;
    this.height += extend;
    this.y -= extend;
  }
});
Object.defineProperty(Rect.prototype, "y2", {
  get: function() {
    return this.y + this.height;
  },
  set: function(value) {
    this.height = value - this.y;
  }
});
Rect.area = r => r.width * r.height;
Object.defineProperty(Rect.prototype, "area", {
  get: function() {
    return Rect.area(this);
  }
});

Rect.center = r => new Point(r.x + r.width / 2, r.y + r.height / 2);
//Rect.prototype.center = function() { return new Point(this.x + this.width / 2, this.y + this.height / 2); }

Object.defineProperty(Rect.prototype, "center", {
  get: function() {
    return Rect.center(this);
  }
});

Rect.path = (r, clockwise = true) => ({
  d: clockwise ? "M" + r.x + " " + r.y + " h" + r.width + " v" + r.height + " h-" + r.width + "z" : "M" + r.x + " " + r.y + " v" + r.height + " h" + r.width + " v-" + r.height + "z"
});

Object.assign(Rect.prototype, {
  get points() {
    const c = Rect.corners(this);
    return new PointList(c);
  }
});

/*
get x2() {
  return this.x + this.width;
}
get y2() {
  return this.y + this.height;
}

get round() {
  const points = this.points;
  return new Rect(points[0].round, points[1].round);
}
*/
Rect.toCSS = function() {
  const rect = Rect.apply(Rect, arguments);
  return { ...Point.toCSS(rect), ...Size.toCSS(rect) };
};
Rect.prototype.toCSS = Rect.toCSS;

Rect.set = function(rect, element) {
  let e = typeof element === "string" ? Element.find(element) : element;
  Element.move(e, rect);
  Element.resize(e, rect);
  return rect;
};

Rect.outset = function(rect, trbl) {
  rect.x -= trbl.left;
  rect.y -= trbl.top;
  rect.width += trbl.left + trbl.right;
  rect.height += trbl.top + trbl.bottom;
  return rect;
};

Rect.inset = function(rect, trbl) {
  rect.x += trbl.left;
  rect.y += trbl.top;
  rect.width -= trbl.left + trbl.right;
  rect.height -= trbl.top + trbl.bottom;
  return rect;
};

Rect.align = function(rect, align_to, a) {
  const xdiff = align_to.width - rect.width;
  const ydiff = align_to.height - rect.height;

  switch (Align.horizontal(a)) {
    case Align.LEFT:
      rect.x = align_to.x;
      break;
    case Align.RIGHT:
      rect.x = align_to.x + xdiff;
      break;
    default:
      rect.x = align_to.x + xdiff / 2;
      break;
  }
  switch (Align.vertical(a)) {
    case Align.TOP:
      rect.y = align_to.y;
      break;
    case Align.BOTTOM:
      rect.y = align_to.y + ydiff;
      break;
    default:
      rect.y = align_to.y + ydiff / 2;
      break;
  }
  return rect;
};

Rect.inside = (rect, point) => point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
Rect.prototype.inside = function(point) {
  return Rect.inside(this, point);
};

Rect.toTRBL = rect => ({
  top: rect.y,
  right: rect.x + rect.width,
  bottom: rect.y + rect.height,
  left: rect.x
});

Rect.prototype.toPoints = function() {
  var list = new PointList();
  list.push(new Point(this.x, this.y));
  list.push(new Point(this.x, this.y2));
  list.push(new Point(this.x2, this.y2));
  list.push(new Point(this.x2, this.y));
  return list;
};

Rect.prototype.pointFromCenter = function(point) {
  Point.sub(point, this.center);
  point.x /= this.width;
  point.y /= this.height;
  return point;
};

Rect.transform = function(rect1, rect2) {
  let translate = Point.diff(rect1, rect2);
  let scale = { x: rect1.width / rect2.width, y: rect1.height / rect2.height };
  let matrix = Matrix.identity();
  // matrix = Matrix.scale(matrix, scale.x, scale.y);

  matrix.translate_self(translate.x, translate.y);
  matrix.scale_self(scale.x, scale.y);
  return matrix;
};

/**
 * Type for TopRightBottomLeft (paddings and margins)
 *
 * @param {string,object,array} arg [description]
 */
export function TRBL(arg) {
  let ret = this instanceof TRBL ? this : {};
  let args = [...arguments];

  if(typeof arg === "object") {
    Object.keys(arg).forEach(k => {
      const matches = /(top|right|bottom|left)$/i.exec(k);
      ret[matches[0].toLowerCase()] = parseInt(arg[k]);
    });
  } else if(arg) {
    if(typeof arg === "string") arg = [...arg.matchAll(/^[0-9.]+(|px|em|rem|pt|cm|mm)$/g)];
    else if(arg.length == 4) arg = arg.map(v => parseInt(v));

    ret.top = arg[0];
    ret.right = arg[1];
    ret.bottom = arg[2];
    ret.left = arg[3];
  }

  if(isNaN(ret.top)) ret.top = 0;
  if(isNaN(ret.right)) ret.right = 0;
  if(isNaN(ret.bottom)) ret.bottom = 0;
  if(isNaN(ret.left)) ret.left = 0;

  /*   ['toString','toSource'].forEach((name) =>
    Object.defineProperty(ret, name, { enumerable: true, value: TRBL.prototype[name] })
  ); */

  //console.log('ret: ', ret);

  if(!this || this === TRBL) return Object.assign(ret, TRBL.prototype);
}

TRBL.prototype.null = function() {
  return this.top == 0 && this.right == 0 && this.bottom == 0 && this.left == 0;
};
TRBL.null = trbl => TRBL.prototype.null.call(trbl);

TRBL.neg = (trbl = this) => ({
  top: -trbl.top,
  right: -trbl.right,
  bottom: -trbl.bottom,
  left: -trbl.left
});

TRBL.prototype.isNaN = function() {
  return isNaN(this.top) || isNaN(this.right) || isNaN(this.bottom) || isNaN(this.left);
};
Object.defineProperty(TRBL.prototype, "inset", {
  get() {
    return rect => Rect.inset(rect, this);
  }
});

Object.defineProperty(TRBL.prototype, "outset", {
  get() {
    return rect => Rect.outset(rect, this);
  }
});

/*TRBL.prototype.outset = function() {
  return this.inset.call(TRBL.neg(this));
};*/

TRBL.prototype.add = function(other) {
  this.top += other.top;
  this.right += other.right;
  this.bottom += other.bottom;
  this.left += other.left;
};

TRBL.prototype.union = function(other) {
  this.top = other.top < this.top ? other.top : this.top;
  this.right = other.right > this.right ? other.right : this.right;
  this.bottom = other.bottom > this.bottom ? other.bottom : this.bottom;
  this.left = other.left < this.left ? other.left : this.left;
};

TRBL.prototype.toRect = function() {
  return new Rect({
    x: this.left,
    y: this.top,
    width: this.right - this.left,
    height: this.bottom - this.top
  });
};

TRBL.union = (trbl, other) => ({
  top: other.top < trbl.top ? other.top : trbl.top,
  right: other.right > trbl.right ? other.right : trbl.right,
  bottom: other.bottom > trbl.bottom ? other.bottom : trbl.bottom,
  left: other.left < trbl.left ? other.left : trbl.left
});

TRBL.toRect = trbl => new Rect(trbl.left, trbl.top, trbl.right - trbl.left, trbl.bottom - trbl.top);

TRBL.prototype.toString = function(unit = "px") {
  return "" + this.top + "" + unit + " " + this.right + "" + unit + " " + this.bottom + "" + unit + " " + this.left;
  "" + unit;
};
TRBL.prototype.toSource = function() {
  return "{top:" + this.top + ",right:" + this.right + ",bottom:" + this.bottom + ",left:" + this.left + "}";
};

/**
 * Class for matrix.
 *
 * @class      Matrix (name)
 */
export function Matrix(arg) {
  let ret = this instanceof Matrix ? this : [0, 0, 0, 0, 0, 0];

  if(typeof arg === "string") {
    if(/matrix\([^)]*\)/.test(arg)) {
      let [a, b, c, d, tx, ty] = [...arg.matchAll(/[-.0-9]+/g)].map(m => parseFloat(m[0]));
      ret.xx = a;
      ret.yx = b;
      ret.xy = c;
      ret.yy = d;
      ret.x0 = tx;
      ret.y0 = ty;

      arg = ret;
    } else {
      const parts = arg.split(/[() ,]+/g);
      let i = 0;
      let cmd;
      let args;

      let m = new DOMMatrix();

      while(i < parts.length) {
        cmd = parts[i++];
        args = [];
        while(i < parts.length && parts[i].charCodeAt(0) <= 57) args.push(parseFloat(parts[i++]));
        if(cmd == "") break;

        if(cmd == "matrix") {
          const other = new DOMMatrix(args);
          m = m.multiply(other);
        } else {
          if(m[cmd + "Self"] === undefined) throw new Error("No such transform command: " + cmd);
          m[cmd + "Self"].apply(m, args);
        }
        //console.log('Matrix ', { cmd, args,  m });
      }
      arg = m;
    }
  }

  if(arg instanceof DOMMatrix) {
    ret.xx = arg.a;
    ret.yx = arg.b;
    ret.xy = arg.c;
    ret.yy = arg.d;
    ret.x0 = arg.e;
    ret.y0 = arg.f;
  } else if(arg !== undefined && arg.a !== undefined && arg.b !== undefined && arg.c !== undefined && arg.d !== undefined && arg.e !== undefined && arg.f !== undefined) {
    Matrix.init(ret, arg.a, arg.b, arg.c, arg.d, arg.e, arg.f);
  } else if(arg !== undefined && arg.tx !== undefined) {
    Matrix.init(ret, arg.a, arg.b, arg.c, arg.d, arg.tx, arg.ty);
  } else if(arg !== undefined && arg.xx !== undefined) {
    Matrix.keys.forEach((key, i) => (ret[i] = arg[key]));
  } else if(arg !== undefined && arg.length == 6) {
    Matrix.init.apply(Matrix, [ret, ...Array.from(arg)]);
  } else {
    Matrix.init(ret, 0, 0, 0, 0, 0, 0);
  }

  if(!(this instanceof Matrix)) return Object.assign(ret, Matrix.prototype);
}

export const isMatrix = m => m instanceof Matrix || (m.length !== undefined && m.length == 6 && m.every(el => typeof el == "number"));

Matrix.keys = ["xx", "xy", "x0", "yx", "yy", "y0"];
Matrix.keySeq = ["xx", "yx", "xy", "yy", "x0", "y0"];
Matrix.keyIndex = {
  xx: 0,
  a: 0,
  xy: 1,
  c: 1,
  x0: 2,
  tx: 2,
  e: 2,
  yx: 3,
  b: 3,
  yy: 4,
  d: 4,
  y0: 5,
  ty: 5,
  f: 5
};
//Matrix.keyABC = { a: 0, b: 3, c: 1, d: 4, e: 2, f: 5 };
Matrix.keyABC = ["a", "c", "e", "b", "d", "f"];

Matrix.prototype = new Array(6);
Matrix.prototype.constructor = Matrix;
Matrix.prototype.cols = 3;

Matrix.prototype.at = function(key) {
  return this[Matrix.keyIndex[key]];
};

export const MatrixProps = Object.keys(Matrix.keyIndex).reduce((acc, k) => {
  const i = Matrix.keyIndex[k];
  return {
    ...acc,
    [k]: {
      get: function() {
        return this[i];
      },
      set: function(v) {
        this[i] = v;
      },
      enumerable: true
    }
  };
}, {});
Matrix.prototype = Object.defineProperties(Matrix.prototype, MatrixProps);

Matrix.prototype.row = function(row) {
  return Array.prototype.slice.call(this, row * this.cols, cols);
};
Matrix.prototype.col = function(col) {
  let ret = [];
  for(let i = col; i < this.length; i += this.cols) ret.push(this[i]);
  return ret;
};
Matrix.create = function() {
  return new Matrix(arguments);
};

Matrix.multiply = function(a, b, fn = o => new Matrix(o)) {
  a = fn(a);
  b = fn(b);
  return fn({
    xx: a.xx * b.xx + a.xy * b.yx,
    xy: a.xx * b.xy + a.xy * b.yy,
    x0: a.xx * b.x0 + a.xy * b.y0 + a.x0,
    yx: a.yx * b.xx + a.yy * b.yx,
    yy: a.yx * b.xy + a.yy * b.yy,
    y0: a.yx * b.x0 + a.yy * b.y0 + a.y0
  });
};

Matrix.prototype.multiply = function(m) {
  if(!(m instanceof Matrix)) m = new Matrix(m);

  return Object.assign(this, {
    xx: this.xx * m.xx + this.xy * m.yx,
    xy: this.xx * m.xy + this.xy * m.yy,
    x0: this.xx * m.x0 + this.xy * m.y0 + this.x0,
    yx: this.yx * m.xx + this.yy * m.yx,
    yy: this.yx * m.xy + this.yy * m.yy,
    y0: this.yx * m.x0 + this.yy * m.y0 + this.y0
  });
};

Matrix.prototype.product = function(m) {
  if(!(m instanceof Matrix)) m = new Matrix(m);
  return new Matrix({
    xx: this.xx * m.xx + this.xy * m.yx,
    xy: this.xx * m.xy + this.xy * m.yy,
    x0: this.xx * m.x0 + this.xy * m.y0 + this.x0,
    yx: this.yx * m.xx + this.yy * m.yx,
    yy: this.yx * m.xy + this.yy * m.yy,
    y0: this.yx * m.x0 + this.yy * m.y0 + this.y0
  });
};

Matrix.prototype.scalar_multiply = function(f) {
  Matrix.keys.forEach((k, i) => (this[i] *= f));
  return this;
};
Matrix.prototype.scalar_product = function(f) {
  return new Matrix({
    xx: this.xx * f,
    yx: this.yx * f,
    xy: this.xy * f,
    yy: this.yy * f,
    x0: this.x0 * f,
    y0: this.y0 * f
  });
};

Matrix.scalar_multiply = (m, f) =>
  Object.assign(m, {
    xx: m[0] * f,
    yx: m[1] * f,
    xy: m[2] * f,
    yy: m[3] * f,
    x0: m[4] * f,
    y0: m[5] * f
  });

Matrix.invert = m => Matrix.fromDOMMatrix(Matrix.toDOMMatrix(m).invertSelf());

Matrix.prototype.invert = function() {
  let dom = Matrix.toDOMMatrix(this);
  Matrix.call(this, dom.invertSelf());
  return this;
};

Matrix.prototype.inverse = function() {
  return Matrix.fromDOMMatrix(this, Matrix.toDOMMatrix(this).inverse());
};

["multiply", "translate", "scale", "scale3d", "rotate", "rotateFromVector", "rotateAxisAngle", "skewX", "skewY"].forEach(method => {
  Matrix.prototype[method + "_self"] = function() {
    let dom = Matrix.toDOMMatrix(this);
    Matrix.call(this, dom[method + "Self"].apply(dom, arguments));
    console.log(method + "_self ", this);
    return this;
  };
  Matrix.prototype[method] = function() {
    let dom = Matrix.toDOMMatrix(this);
    dom[method].apply(dom, arguments);
    return Matrix.fromDOMMatrix(dom);
  };
});

Matrix.set = function(a) {
  return Matrix.init.apply(Matrix, [this, ...Array.from(a)]);
  //[ this.xx,this.yx, this.xy,this.yy, this.x0,this.y0 ] = a;
  //return this;
};

Matrix.operation = function(name) {
  return Matrix[name];
};

Matrix.t = function(op, ...args) {
  let fn = typeof op === "string" ? Matrix.operation(op) : op;
  let m = fn.apply(Matrix, Array.from(args));

  //console.log('transformation matrix: ' + this.toString());

  return Matrix.multiply(this, m, o => Object.assign(this, o));
};

Matrix.init = function() {
  let args = [...arguments];
  let matrix = args.length > 6 ? args.shift() : new Matrix();
  const abcdef = "abcdef";

  Matrix.keys.forEach((key, i) => (matrix[i] = args[Matrix.keySeq.indexOf(key)]));

  //matrix.splice.apply(matrix, [0, matrix.length, ...args]);
  return matrix;
};

Matrix.identity = function() {
  return new Matrix([1, 0, 0, 1, 0, 0]);
};

Matrix.translate = function(m, tx, ty) {
  let args = [...arguments];

  if(!isMatrix(args[0])) return Matrix.init_translate(tx, ty);

  m = args.shift();
  return Matrix.multiply(Matrix.init_translate(tx, ty), m);
};

Matrix.scale = function(m, sx, sy) {
  let args = [...arguments];
  //  if(typeof args[0] == "number") return Matrix.init_scale.call(new Matrix(), sx, sy);
  //  let m = args.shift();
  //let s = new Matrix(Matrix.init_scale(sx, sy));
  //return s.multiply(m);

  return Matrix.multiply(Matrix.init_scale(sx, sy), m);
};

Matrix.rotate = function(rad) {
  let args = [...arguments];
  if(!isMatrix(args[0])) return Matrix.init_rotate.call(new Matrix(), rad);
  let m = args.shift();
  return Matrix.prototype.multiply.call(m, Matrix.init_rotate.apply(Matrix, args));
};

Matrix.prototype.toArray = function() {
  let k;
  let arr = [];
  for(k = 0; k < Matrix.keys.length; k++) {
    let key = Matrix.keys[k];
    arr.push(this[key] || this[k]);
  }
  return arr;
};

Matrix.prototype.toString = function() {
  let r = Matrix.keys.map((key, i) => `${key}: ${this[i]}`).join(", ");
  return "{ " + r + " }";
};
Matrix.toString = m => {
  let r = "";
  for(let i = 0; i < m.length; i++) {
    if(r.length) r += ", ";
    if(i == Math.floor(m.length / 2)) r += "\n  ";
    r += Util.pad(m[i].toString(), 3) + m[i];
  }
  return "[" + r + " ]";
};

Matrix.prototype.toDOMMatrix = function() {
  return new DOMMatrix([this[Matrix.keyIndex.a], this[Matrix.keyIndex.b], this[Matrix.keyIndex.c], this[Matrix.keyIndex.d], this[Matrix.keyIndex.e], this[Matrix.keyIndex.f]]);
};
Matrix.toDOMMatrix = m => new DOMMatrix([m[Matrix.keyIndex.a], m[Matrix.keyIndex.b], m[Matrix.keyIndex.c], m[Matrix.keyIndex.d], m[Matrix.keyIndex.e], m[Matrix.keyIndex.f]]);

Matrix.fromDOMMatrix = dom => {
  let ret = new Matrix();
  Matrix.keyABC.forEach((k, i) => (ret[i] = dom[k]));
  return ret;
};

Matrix.prototype.toSVG = function() {
  return "matrix(" + ["a", "b", "c", "d", "e", "f"].map(k => this[Matrix.keyIndex[k]]).join(",") + ")";
};
Matrix.toSVG = m => Matrix.prototype.toSVG.call(m);

Matrix.prototype.init_identity = function() {
  return Matrix.init(this, 1, 0, 0, 1, 0, 0);
};
Matrix.init_identity = () => [1, 0, 0, 1, 0, 0];

Matrix.prototype.init_translate = function(tx, ty) {
  return Matrix.init(this, 1, 0, 0, 1, tx, ty);
};
Matrix.init_translate = (tx, ty) => new Matrix([1, 0, 0, 1, tx, ty]);

Matrix.prototype.init_scale = function(sx, sy) {
  return Matrix.init(this, sx, 0, 0, sy, 0, 0);
};
Matrix.init_scale = (sx, sy) => new Matrix([sx, 0, 0, sy, 0, 0]);

Matrix.prototype.init_rotate = function(rad) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  return Matrix.init(this, c, s, -s, c, 0, 0);
};
Matrix.init_rotate = rad => new Matrix([Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), 0, 0]);

Matrix.prototype.transform_distance = function(p) {
  const x = this.xx * p.x + this.xy * p.y;
  const y = this.yx * p.x + this.yy * p.y;
  p.x = x;
  p.y = y;
  return p;
};
Matrix.transform_distance = (m, p) => Matrix.prototype.transform_distance.call(m, p);

Matrix.prototype.transform_point = function(p) {
  const x = this.xx * p.x + this.xy * p.y + this.x0;
  const y = this.yx * p.x + this.yy * p.y + this.y0;
  p.x = x;
  p.y = y;
  return p;
};
Matrix.transform_point = (m, p) => Matrix.prototype.transform_point.call(m, p);

Matrix.prototype.transform_size = function(s) {
  const w = this.xx * s.width + this.xy * s.height;
  const h = this.yx * s.width + this.yy * s.height;
  s.width = w;
  s.height = h;
  return s;
};
Matrix.transform_size = (m, s) => Matrix.prototype.transform_size.call(m, s);

Matrix.prototype.transform_rect = function(rect) {
  Matrix.prototype.transform_point.call(this, rect);
  Matrix.prototype.transform_size.call(this, rect);
  return rect;
};

Matrix.transform_rect = (m, r) => Matrix.prototype.transform_rect.call(m, r);

Matrix.point_transformer = m =>
  function(arg) {
    var matrix = m;
    return matrix.transform_point(arg);
  };

Matrix.prototype.point_transformer = function() {
  return this.transform_point.bind(this);
};

Matrix.prototype.decompose = function() {
  let translate = {
    toString: function() {
      return `translate(${this.x.toFixed(3)} ${this.y.toFixed(3)})`;
    },
    x: this[Matrix.keyIndex.tx],
    y: this[Matrix.keyIndex.ty]
  };
  let scale = {
    toString: function() {
      return `scale(${this.x.toFixed(6)} ${this.y.toFixed(6)})`;
    },
    x: Math.sign(this[Matrix.keyIndex.a]) * Math.sqrt(Math.pow(this[Matrix.keyIndex.a], 2) + Math.pow(this[Matrix.keyIndex.b], 2)),
    y: Math.sign(this[Matrix.keyIndex.d]) * Math.sqrt(Math.pow(this[Matrix.keyIndex.c], 2) + Math.pow(this[Matrix.keyIndex.d], 2))
  };

  let rotate = {
    toString() {
      return `rotate(${this.deg.toFixed(2)}deg)`;
    },
    get deg() {
      return (this.rad * 180) / Math.PI;
    }
  };
  rotate.rad = Math.atan2(-this[Matrix.keyIndex.c] / scale.y, this[Matrix.keyIndex.a] / scale.x);
  return { translate, scale, rotate };
};

/**
 * Class for line.
 *
 * @class      Line (name)
 */
export function Line(x1, y1, x2, y2) {
  let obj = this instanceof Line ? this : {};
  let arg;
  let args = [...arguments];
  let ret;
  /*
  if(this instanceof Line) {
    Util.defineGetterSetter(this, 'x1', function() { return this.a.x; }, function(v) { this.a.x = v; }, true);
    Util.defineGetterSetter(this, 'y1', function() { return this.a.y; }, function(v) { this.a.y = v; }, true);
    Util.defineGetterSetter(this, 'x2', function() { return this.b.x; }, function(v) { this.b.x = v; }, true);
    Util.defineGetterSetter(this, 'y2', function() { return this.b.y; }, function(v) { this.b.y = v; }, true);
  }*/

  if(args.length >= 4 && args.every(arg => !isNaN(parseFloat(arg)))) {
    arg = { x1, y1, x2, y2 };
  } else if(args.length == 1) {
    arg = args[0];
  }

  if(arg && arg.x1 !== undefined && arg.y1 !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    const { x1, y1, x2, y2 } = arg;
    obj.x1 = parseFloat(x1);
    obj.y1 = parseFloat(y1);
    obj.x2 = parseFloat(x2);
    obj.y2 = parseFloat(y2);
    ret = 1;
  } else if(isPoint(args[0]) && isPoint(args[1])) {
    obj.x1 = parseFloat(args[0].x);
    obj.y1 = parseFloat(args[0].y);
    obj.x2 = parseFloat(args[1].x);
    obj.y2 = parseFloat(args[1].y);
    ret = 2;
  } else if(arg && arg.length >= 4 && arg.slice(0, 4).every(arg => !isNaN(parseFloat(arg)))) {
    obj.x1 = typeof arg[0] === "number" ? arg[0] : parseFloat(arg[0]);
    obj.y1 = typeof arg[1] === "number" ? arg[1] : parseFloat(arg[1]);
    obj.x2 = typeof arg[2] === "number" ? arg[2] : parseFloat(arg[2]);
    obj.y2 = typeof arg[3] === "number" ? arg[3] : parseFloat(arg[3]);
    ret = 4;
  } else {
    ret = 0;
  }

  if(!isLine(obj)) console.log("ERROR: is not a line: ", [...arguments]);
  if(!(this instanceof Line)) return obj;
}

export const isLine = obj => ["x1", "y1", "x2", "y2"].every(prop => obj[prop] !== undefined);

Line.intersect = (a, b) => {
  const ma = (a[0].y - a[1].y) / (a[0].x - a[1].x); // slope of line 1
  const mb = (b[0].y - b[1].y) / (b[0].x - b[1].x); // slope of line 2
  if(ma - mb < Number.EPSILON) return undefined;

  return new Point({
    x: (ma * a[0].x - mb * b[0].x + b[0].y - a[0].y) / (ma - mb),
    y: (ma * mb * (b[0].x - a[0].x) + mb * a[0].y - ma * b[0].y) / (mb - ma)
  });
};

Line.prototype[0] = Line.prototype.a = new Point();
Line.prototype[1] = Line.prototype.b = new Point();

/*Util.defineGetter(Line.prototype, 0, function() { return this.a; });
Util.defineGetter(Line.prototype, 1, function() { return this.b; });
*/
["a", 0].forEach(prop =>
  Util.defineGetterSetter(
    Line.prototype,
    prop,
    function() {
      let p = new Point(this.x1, this.y1);
      Util.defineGetterSetter(
        p,
        "x",
        () => {
          return this.x1;
        },
        v => {
          this.x1 = v;
        },
        true
      );
      Util.defineGetterSetter(
        p,
        "y",
        () => {
          return this.y1;
        },
        v => {
          this.y1 = v;
        },
        true
      );
      return p;
    },
    function(v) {
      this.x1 = v.x;
      this.y1 = v.y;
    },
    false
  )
);
["b", 1].forEach(prop =>
  Util.defineGetterSetter(
    Line.prototype,
    prop,
    function() {
      let p = new Point(this.x2, this.y2);
      Util.defineGetterSetter(
        p,
        "x",
        () => {
          return this.x2;
        },
        v => {
          this.x2 = v;
        },
        true
      );
      Util.defineGetterSetter(
        p,
        "y",
        () => {
          return this.y2;
        },
        v => {
          this.y2 = v;
        },
        true
      );
      return p;
    },
    function(v) {
      this.x2 = v.x;
      this.y2 = v.y;
    },
    false
  )
);

/*
Util.defineGetterSetter(Line.prototype, 'x1', function() { return this.a.x; }, function(v) { this.a.x = v; }, true);
Util.defineGetterSetter(Line.prototype, 'y1', function() { return this.a.y; }, function(v) { this.a.y = v; }, true);
Util.defineGetterSetter(Line.prototype, 'x2', function() { return this.b.x; }, function(v) { this.b.x = v; }, true);
Util.defineGetterSetter(Line.prototype, 'y2', function() { return this.b.y; }, function(v) { this.b.y = v; }, true);

*/
Line.prototype.direction = function() {
  var dist = Point.distance(this.a, this.b);
  return Point.diff(this.a, this.b) / dist;
};
Line.prototype.slope = function() {
  return Point.diff(this.a, this.b);
};
Line.prototype.angle = function() {
  return Point.angle(this.a, this.b);
};

Line.prototype.length = function() {
  return Point.distance(this.a, this.b);
};

Line.prototype.pointAt = function(pos) {
  return new Point(pos * (this.x2 - this.x1) + this.x1, pos * (this.y2 - this.y1) + this.y1);
};

Line.prototype.transform = function(m) {
  this.a = this.a.transform(m);
  this.b = this.b.transform(m);
  return this;
};
Line.transform = (line, matrix) => {
  const a = Point.transform({ x: line.x1, y: line.y1 }, matrix);
  const b = Point.transform({ x: line.x2, y: line.y2 }, matrix);
  return {
    x1: a.x,
    y1: a.y,
    x2: b.x,
    y2: b.y
  };
};

Line.prototype.inspect = function() {
  const { x1, y1, x2, y2 } = this;
  return "Line{ " + inspect({ x1, y1, x2, y2 }) + " }";
};

/*
var line1 = [{x:3, y:3},{x:17, y:8}],
    line2 = [{x:7, y:10},{x:11, y:2}];
//console.log(lineIntersect(line1, line2));*/

/**
 * @brief [brief description]
 * @param r  red value 0-255
 * @param g  green value 0-255
 * @param b  blue value 0-255
 * @param a  alpha value 0-1
 *
 * @return [description]
 */
export function RGBA(r = 0, g = 0, b = 0, a = 255) {
  const args = [...arguments];
  let ret = this instanceof RGBA ? this : {};
  let c = [];

  //console.log('RGBA(', args, ')');

  if(args.length >= 3) {
    ret.r = r;
    ret.g = g;
    ret.b = b;
    ret.a = a;
  } else if(args.length == 1) {
    const arg = args[0];
    if(typeof arg === "string") {
      if(arg.startsWith("#")) {
        c = arg.length >= 7 ? /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/i.exec(arg) : /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/i.exec(arg);

        let mul = arg.length >= 7 ? 1 : 17;

        //console.log('RGBA match:', c, ' mul:', mul);

        ret.r = parseInt(c[1], 16) * mul;
        ret.g = parseInt(c[2], 16) * mul;
        ret.b = parseInt(c[3], 16) * mul;
        ret.a = c.length > 3 ? parseInt(c[4], 16) * mul : 255;
      } else if(arg.toLowerCase().startsWith("rgb")) {
        c = arg.match(new RegExp("/[d.]+/g")).map(x => parseFloat(x));

        c = [...c].slice(1);

        ret.r = Math.round(c[0]);
        ret.g = Math.round(c[1]);
        ret.b = Math.round(c[2]);
        ret.a = Math.round(c.length > 3 && !isNaN(c[3]) ? c[3] : 255);
      } else if(typeof arg === "object" && arg.r !== undefined) {
        ret.r = arg.r;
        ret.g = arg.g;
        ret.b = arg.b;
        ret.a = arg.a !== undefined ? arg.a : 255;
      }
    }
  }
  if(isNaN(ret.a)) ret.a = 255;

  //console.log('RGBA ', {c, ret, args});
  if(!(ret instanceof RGBA)) return ret; //Object.setPrototypeOf(ret, RGBA.prototype);
}

RGBA.properties = ["r", "g", "b", "a"];
export const isRGBA = obj => RGBA.properties.every(prop => obj.hasOwnProperty(prop));

RGBA.fromHex = (hex, alpha = 255) => {
  const matches = hex && (hex.length >= 7 ? /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/i.exec(hex) : /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/i.exec(hex));
  if(matches === null) return null;
  let mul = hex.length >= 7 ? 1 : 17;

  const [r, g, b, a] = [...matches].slice(1).map(x => parseInt(x, 16) * mul);
  //console.log('RGBA.fromHex', { hex, matches, r, g, b, a });
  return new RGBA(r, g, b, matches.length > 3 && !isNaN(a) ? a : alpha);
};

RGBA.prototype.hex = function() {
  const { r, g, b, a } = RGBA.clamp(RGBA.round(this));
  return "#" + ("0000000" + ((r << 16) | (g << 8) | b).toString(16)).slice(-6) + (a !== undefined ? ("0" + a.toString(16)).slice(-2) : "");
};

RGBA.prototype.toRGB = function() {
  const { r, g, b } = this;
  return new RGBA(r, g, b, 255);
};

RGBA.toHex = rgba => RGBA.prototype.hex.call(rgba);

RGBA.clamp = rgba => RGBA(Math.min(Math.max(rgba.r, 0), 255), Math.min(Math.max(rgba.g, 0), 255), Math.min(Math.max(rgba.b, 0), 255), Math.min(Math.max(rgba.a, 0), 255));
RGBA.round = rgba => RGBA.prototype.round.call(rgba);
RGBA.prototype.round = function() {
  this.r = Math.round(this.r);
  this.g = Math.round(this.g);
  this.b = Math.round(this.b);
  this.a = Math.round(this.a);
  return this;
};
RGBA.normalize = (rgba, from = 255, to = 1.0) => ({
  r: (rgba.r * to) / from,
  g: (rgba.g * to) / from,
  b: (rgba.b * to) / from,
  a: (rgba.a * to) / from
});
RGBA.prototype.css = () => prop => (prop ? prop + ":" : "") + "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + (this.a / 255).toFixed(3) + ")";

RGBA.prototype.toString = function(a) {
  if(a === undefined) a = this.a;
  if(a >= 255) return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
  else return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + (a / 255).toFixed(3) + ")";
};

RGBA.prototype.normalize = function(from = 255, to = 1.0) {
  const mul = to / from;
  this.r *= mul;
  this.g *= mul;
  this.b *= mul;
  this.a *= mul;
  return this;
};

RGBA.blend = (a, b, o = 0.5) => {
  a = new RGBA(a);
  b = new RGBA(b);
  return new RGBA(Math.round(a.r * o + b.r * (1 - o)), Math.round(a.g * o + b.g * (1 - o)), Math.round(a.b * o + b.b * (1 - o)), Math.round(a.a * o + b.a * (1 - o)));
};

RGBA.prototype.toAlpha = function(color) {
  let src = RGBA.normalize(this);
  let alpha = {};

  alpha.a = src.a;
  if(color.r < 0.0001) alpha.r = src.r;
  else if(src.r > color.r) alpha.r = (src.r - color.r) / (1.0 - color.r);
  else if(src.r < color.r) alpha.r = (color.r - src.r) / color.r;
  else alpha.r = 0.0;
  if(color.g < 0.0001) alpha.g = src.g;
  else if(src.g > color.g) alpha.g = (src.g - color.g) / (1.0 - color.g);
  else if(src.g < color.g) alpha.g = (color.g - src.g) / color.g;
  else alpha.g = 0.0;
  if(color.b < 0.0001) alpha.b = src.b;
  else if(src.b > color.b) alpha.b = (src.b - color.b) / (1.0 - color.b);
  else if(src.b < color.b) alpha.b = (color.b - src.b) / color.b;
  else alpha.b = 0.0;
  if(alpha.r > alpha.g) {
    if(alpha.r > alpha.b) {
      src.a = alpha.r;
    } else {
      src.a = alpha.b;
    }
  } else if(alpha.g > alpha.b) {
    src.a = alpha.g;
  } else {
    src.a = alpha.b;
  }
  if(src.a >= 0.0001) {
    src.r = (src.r - color.r) / src.a + color.r;
    src.g = (src.g - color.g) / src.a + color.g;
    src.b = (src.b - color.b) / src.a + color.b;
    src.a *= alpha.a;
  }

  let dst = RGBA.normalize(src, 1.0, 255);
  //console.log({ src, dst });

  RGBA.round(dst);

  return new RGBA(dst.r, dst.g, dst.b, dst.a);
};

RGBA.prototype.toHSLA = function() {
  let { r, g, b, a } = this;

  r /= 255;
  g /= 255;
  b /= 255;
  a /= 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h;
  var s;
  var l = (max + min) / 2;

  if(max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h *= 360;
  s *= 100;
  l *= 100;

  //console.log("RGBA.toHSLA ", { h, s, l, a });

  return new HSLA(h, s, l, a);
};

/**
 * @brief [brief description]
 * @param h  hue value 0-360
 * @param s  saturation 0-100%
 * @param l  luminance 0-100%
 * @param a  alpha 0-1.0
 *
 * @return [description]
 */
export function HSLA(h = 0, s = 0, l = 0, a = 1.0) {
  const args = [...arguments];
  let c = [];
  let ret = this instanceof HSLA ? this : {};
  /*  if(!this) return Object.assign({}, HSLA.prototype, { h, s, l, a });*/

  if(args.length >= 3) {
    ret.h = Math.round(h);
    ret.s = s;
    ret.l = l;
    ret.a = a;
  } else {
    const arg = args[0];
    if(typeof arg === "string") {
      const matches = /hsla\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?),\s*([0-9.]+)\s*\)/g.exec(arg) || /hsl\(\s*([0-9.]+)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*\)/g.exec(arg);

      if(matches != null) matches = [...matches].slice(1);
    }
    ret.h = c[0];
    ret.s = c[1];
    ret.l = c[2];
    ret.a = c[3] !== undefined ? c[3] : 1.0;

    ["h", "s", "l", "a"].forEach(channel => {
      if(String(ret[channel]).endsWith("%")) ret[channel] = parseFloat(ret[channel].slice(0, ret[channel].length - 1));
      else ret[channel] = parseFloat(ret[channel]);
    });
  }

  //console.log('HSLA ', { c, ret, args });
  if(!(ret instanceof HSLA)) return ret;
}

HSLA.properties = ["h", "s", "l", "a"];
export const isHSLA = obj => HSLA.properties.every(prop => obj.hasOwnProperty(prop));

HSLA.setcss = hsla => prop => (prop ? prop + ":" : "") + "hsla(" + hsla.h + "," + hsla.s + "%," + hsla.l + "%," + hsla.a + ")";

HSLA.prototype.css = function() {
  const hsla = HSLA.clamp(HSLA.round(this));
  return HSLA.setcss(hsla)();
};
HSLA.prototype.toHSL = function() {
  const { h, s, l } = this;
  return new HSLA(h, s, l, 1.0);
};

HSLA.clamp = hsla => HSLA(hsla.h % 360, Math.min(Math.max(hsla.s, 0), 100), Math.min(Math.max(hsla.l, 0), 100), Math.min(Math.max(hsla.a, 0), 1));
HSLA.round = hsla => HSLA(Math.round(hsla.h), Math.round(hsla.s), Math.round(hsla.l), hsla.a);

HSLA.random = function(rand = Math.random) {
  return {
    get hue() {
      return Math.floor(rand() * 360);
    },
    get sat() {
      return Math.floor(rand() * 50) + 50;
    },
    get light() {
      return 50 + (25 - Math.floor(rand() * 50));
    },
    get alpha() {
      return 1.0;
    },
    toString() {
      return `hsla(${this.hue},${this.sat}%,${this.light}%,${this.alpha})`;
    }
  };
};

HSLA.prototype.toRGBA = function() {
  var { h, s, l, a } = this;

  var r, g, b, m, c, x;

  if(!isFinite(h)) h = 0;
  if(!isFinite(s)) s = 0;
  if(!isFinite(l)) l = 0;

  h /= 60;
  if(h < 0) h = 6 - (-h % 6);
  h %= 6;

  s = Math.max(0, Math.min(1, s / 100));
  l = Math.max(0, Math.min(1, l / 100));

  c = (1 - Math.abs(2 * l - 1)) * s;
  x = c * (1 - Math.abs((h % 2) - 1));

  if(h < 1) {
    r = c;
    g = x;
    b = 0;
  } else if(h < 2) {
    r = x;
    g = c;
    b = 0;
  } else if(h < 3) {
    r = 0;
    g = c;
    b = x;
  } else if(h < 4) {
    r = 0;
    g = x;
    b = c;
  } else if(h < 5) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  m = l - c / 2;
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  a = Math.round(a * 255);

  return new RGBA(r, g, b, a);
};
HSLA.toRGBA = hsla => HSLA.prototype.toRGBA.apply(hsla, arguments);

export let Timer = function(timeout, fn, props = {}, { create = setInterval, destroy = clearInterval }) {
  let t = {};

  return {
    ...t,
    timeout,
    fn,
    running: true,
    id: create(
      () => {
        return fn.call(t, t.stop);
      },
      timeout,
      fn,
      t
    ),
    started: Date.now(),
    stop: function stop() {
      if(this.id !== null) {
        destroy(this.id);
        this.id = null;
        this.running = false;
      }
    },
    ...props
  };
};
HSLA.prototype.toString = function() {
  if(this.a == 1) return `hsl(${this.h},${this.s}%,${this.l}%)`;
  return `hsla(${this.h},${this.s}%,${this.l}%,${this.a})`;
};

Timer.interval = (timeout, fn, props) => Timer(timeout, fn, props, {});

Timer.once = (timeout, fn, props) => Timer(timeout, fn, props, { create: setTimeout, destroy: clearTimeout });

Timer.promise = timeout =>
  new Promise((resolve, reject) =>
    Timer(
      timeout,
      resolve,
      {},
      {
        create: setTimeout,
        destroy: id => {
          clearTimeout(id);
          reject();
        }
      }
    )
  );

/**
 * DOM Tree
 * @param {[type]} root [description]
 */
export function Tree(root) {
  if(this instanceof Tree) {
    root = Object.assign(this, root, { realNode: root });
  }
  if(!(this instanceof Tree)) return tree;
}

Tree.walk = function walk(node, fn, accu = {}) {
  const root = node;
  const up = function(n) {
    const stopNode = root.parentNode;
    while(n != stopNode && (n = node.parentNode) && !n.nextSibling);
    return n ? n.nextSibling : null;
  };
  do {
    //console.log('walk: accu=', accu, ', node=', node);
    accu = fn(node, root, accu);
  } while((node = node.firstChild || node.nextSibling || up(node)));
  return accu;
};

const ifdef = (value, def, nodef) => (value !== undefined ? def : nodef);

export function isElement(e) {
  return e.tagName !== undefined;
}

export class Node {
  static parents(node) {
    return (function*() {
      var n = node;
      do {
        if(n) yield n;
      } while(n && (n = n.parentNode));
    })();
  }

  static depth(node) {
    let r = 0;
    while(node && node.parentNode) {
      r++;
      node = node.parentNode;
    }
    return r;
  }
}

/**
 * Class for element.
 *
 * @class      Element (name)
 */
export class Element extends Node {
  static create() {
    let args = [...arguments];
    let { tagName, ns, children, ...props } = typeof args[0] == "object" ? args.shift() : { tagName: args.shift(), ...args.shift() };
    let parent = args.shift();

    //console.log('Element.create ', { tagName, props, parent });

    let d = document || window.document;
    let e = ns ? d.createElementNS(ns, tagName) : d.createElement(tagName);
    for(let k in props) {
      const value = props[k];
      if(k == "parent") {
        parent = props[k];
        continue;
      } else if(k == "className") k = "class";
      if(k == "style" && typeof value === "object") Element.setCSS(e, value);
      else if(k.startsWith("on") || k.startsWith("inner")) e[k] = value;
      else e.setAttribute(k, value);
    }
    if(children && children.length) children.forEach(obj => Element.create(obj, e));

    if(parent && parent.appendChild) parent.appendChild(e);
    return e;
  }

  static walk(elem, fn, accu = {}) {
    elem = Element.find(elem);
    const root = elem;
    const rootPath = Element.xpath(elem);
    let depth = 0;
    while(elem) {
      accu = fn(dom(elem), accu, root, depth);
      if(elem.firstElementChild) depth++;
      elem =
        elem.firstElementChild ||
        elem.nextElementSibling ||
        (function() {
          do {
            if(!(elem = elem.parentElement)) break;
            depth--;
          } while(depth > 0 && !elem.nextElementSibling);
          return elem && elem != root ? elem.nextElementSibling : null;
        })();
    }
    return accu;
  }

  static toObject(elem) {
    let e = Element.find(elem);
    let children = e.children && e.children.length ? { children: Util.array(e.children).map(child => Element.toObject(child, e)) } : {};

    let ns = (arguments[1] ? arguments[1].namespaceURI : document.body.namespaceURI) != e.namespaceURI ? { ns: e.namespaceURI } : {};
    let { /*style,*/ ...attributes } = Element.attr(e);

    return {
      tagName: e.tagName,
      ...attributes,
      ...children,
      ...ns
    };
  }

  static find(arg, parent) {
    return typeof arg === "string" ? (parent ? parent.querySelector(arg) : document.querySelector(arg)) : arg;
  }

  static findAll(arg, parent) {
    parent = Element.find(parent);
    return Util.array(parent && parent.querySelectorAll ? parent.querySelectorAll(arg) : document.querySelectorAll(arg));
  }

  /**
   * Sets or gets attributes
   *
   * @param      {<type>}  element       The element
   * @param      {<type>}  [attrs=null]  The attributes
   * @return     {<type>}  { description_of_the_return_value }
   */
  static attr(element, attrs_or_name) {
    const e = typeof element === "string" ? Element.find(element) : element;
    if(!Util.isArray(attrs_or_name) && typeof attrs_or_name === "object" && e) {
      for(let key in attrs_or_name) {
        const name = Util.decamelize(key, "-");
        const value = attrs_or_name[key];
        /*        console.log('attr(', e, ', ', { name, key, value, }, ')')
         */ if(key.startsWith("on") && !/svg/.test(e.namespaceURI)) e[key] = value;
        else if(e.setAttribute) e.setAttribute(name, value);
        else e[key] = value;
      }
      return e;
    }
    if(typeof attrs_or_name === "function") {
      attrs_or_name(e.attributes, e);
      return e;
    } else if(typeof attrs_or_name === "string") {
      attrs_or_name = [attrs_or_name];
    } else {
      attrs_or_name = e.getAttributeNames();
    }
    let ret = attrs_or_name.reduce((acc, name) => {
      const key = /*Util.camelize*/ name;
      const value = e.getAttribute ? e.getAttribute(name) : e[key];
      acc[key] = isNaN(parseFloat(value)) ? value : parseFloat(value);
      return acc;
    }, {});
    if(typeof arguments[1] == "string") return ret[attrs_or_name[0]];
    return ret;
  }

  static getRect(elem) {
    let e = elem;
    while(e) {
      if(e.style) {
        if(e.style.position == "") e.style.position = "relative";
        if(e.style.left == "") e.style.left = "0px";
        if(e.style.top == "") e.style.top = "0px";
      }
      e = e.offsetParent || e.parentNode;
    }
    const bbrect = elem.getBoundingClientRect();
    //console.log('getRect: ', { bbrect });
    return {
      x: bbrect.left + window.scrollX,
      y: bbrect.top + window.scrollY,
      width: bbrect.right - bbrect.left,
      height: bbrect.bottom - bbrect.top
    };
  }

  /**
   * Gets the rectangle.
   *
   * @param      {<type>}  e
   * lement  The element
   * @return     {Object}  The rectangle.
   */
  static rect(elem, options = {}) {
    let args = [...arguments];
    let element = args.shift();
    if(args.length > 0 && (isRect(args) || isRect(args[0]))) return Element.setRect.apply(Element, arguments);
    const { round = true, relative_to = null, scroll_offset = true } = options;
    const e = typeof element === "string" ? Element.find(element) : element;
    if(!e || !e.getBoundingClientRect) {
      return new Rect(0, 0, 0, 0);
    }
    const bb = e.getBoundingClientRect();

    let r = TRBL.toRect(bb);
    if(relative_to && relative_to !== null /*&& Element.isElement(relative_to)*/) {
      const off = Element.rect(relative_to);
      r.x -= off.x;
      r.y -= off.y;
    }
    //console.log("Element.rect(",r,")");

    const { scrollTop, scrollY } = window;
    if(scroll_offset) {
      r.y += scrollY;
    }
    r = new Rect(round ? Rect.round(r) : r);
    //console.log('Element.rect(', element, ') =', r);
    return r;
  }

  static setRect(element, rect, anchor = Anchor.LEFT | Anchor.TOP) {
    const e = typeof element === "string" ? Element.find(element) : element;
    //console.log('Element.setRect(', element, ',', rect, ', ', anchor, ') ');
    if(typeof anchor == "string") e.style.position = anchor;
    const position = e.style.position || rect.position || "relative";
    const pelement = position == "fixed" ? e.documentElement || document.body : e.parentNode;
    const prect = Element.rect(pelement, { round: false });
    //Rect.align(rect, prect, anchor);

   /* const stack = Util.getCallers(3, 4);
    const ptrbl = Rect.toTRBL(prect);
    const trbl = Rect.toTRBL(rect);*/
    //console.log('Element.setRect ', { trbl, ptrbl, stack });
    let css = {};
    let remove;
    switch (Anchor.horizontal(anchor)) {
      case Anchor.LEFT:
      default:
        css.left = Math.round(trbl.left - ptrbl.left) + "px";
        remove = "right";
        break;
      case Anchor.RIGHT:
        css.right = Math.round(trbl.right - ptrbl.right) + "px";
        remove = "left";
        break;
    }
    switch (Anchor.vertical(anchor)) {
      case Anchor.TOP:
      default:
        css.top = Math.round(trbl.top - ptrbl.top) + "px";
        remove = "bottom";
        break;
      case Anchor.BOTTOM:
        css.bottom = Math.round(trbl.bottom - ptrbl.bottom) + "px";
        remove = "top";
        break;
    }
    if(e.style.removeProperty) e.style.removeProperty(remove);
    else e.style[remove] = undefined;
    css.position = position;
    css.width = Math.round(isNaN(rect.width) ? rect.width : prect.width) + "px";
    css.height = Math.round(isNaN(rect.height) ? rect.height : prect.height) + "px";
    //console.log('Element.setRect ', css);
    Element.setCSS(e, css);
    return e;
  }

  static position(element, pos = "absolute") {
    if(typeof element == "string") element = Element.find(element);
    const { x, y } = element.getBoundingClientRect();
    return new Point({ x, y });
  }

  static move(element, point, pos) {
    let [e, ...rest] = [...arguments];
    let { x = Element.position(element).x, y = Element.position(element).y } = new Point(rest);
    let to = { x, y };
    let position = pos || Element.getCSS(element, "position") || "relative";
    let off;
    //console.log('Element.move ', { element, to, position });
    const getValue = prop => {
      const property = dom.Element.getCSS(element, prop);
      if(property === undefined) return undefined;
      const matches = /([-0-9.]+)(.*)/.exec(property) || [];
      //console.log({ match, value, unit });
      return parseFloat(matches[1]);
    };

    const current = new Point({ x: getValue("left") || 0, y: getValue("top") || 0 });
    off = new Point(Element.rect(element, { round: false }));
    //   off = Point.diff(off, current);
    Point.add(current, Point.diff(to, off));
    /*
    if(position == 'relative') {
      to.x -= off.x;
      to.y -= off.y;
    }*/
    let css = Point.toCSS(current);
    //console.log("Element.move: ", { position, to, css, off, current });
    //console.log('move newpos: ', Point.toCSS(pt));
    Element.setCSS(element, { ...css, position });
    return element;
  }

  static resize() {
    let args = [...arguments];
    let e = Element.find(args.shift());
    let size = new Size(args);
    const css = Size.toCSS(size);
    console.log("Element.resize: ", { e, size, css });
    Element.setCSS(e, css);
    return e;
  }

  static EDGES = {
    upperLeft: 0,
    upperCenter: 0.5,
    upperRight: 1,
    centerRight: 1.5,
    lowerRight: 2,
    lowerCenter: 2.5,
    lowerLeft: 3,
    centerLeft: 3.5
  };

  static edges = arg => Element.getEdgesXYWH(Element.rect(arg));

  static getEdgesXYWH = ({ x, y, w, h }) => [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h }
  ];
  static getEdge = ({ x, y, w, h }, which) =>
    [
      { x, y },
      { x: x + w / 2, y },
      { x: x + w, y },
      { x: x + w, y: y + h / 2 },
      { x: x + w, y: y + h },
      { x: x + w / 2, y: y + h },
      { x, y: y + h },
      { x, y: y + h / 2 }
    ][Math.floor(which * 2)];

  static Axis = { H: 0, V: 2 };

  static getPointsXYWH = ({ x, y, w, h }) => [
    { x, y },
    { x: x + w, y: y + h }
  ];

  static cumulativeOffset = (element, relative_to = null) => {
    if(typeof element == "string") element = Element.find(element);
    let p = { x: 0, y: 0 };
    do {
      p.y += element.offsetTop || 0;
      p.x += element.offsetLeft || 0;
    } while((element = element.offsetParent) && element != relative_to);
    return p;
  };

  static getTRBL(element, prefix = "") {
    const names = ["Top", "Right", "Bottom", "Left"].map(pos => prefix + (prefix == "" ? pos.toLowerCase() : pos));
    return new TRBL(Element.getCSS(element, names));
  }

  static setTRBL(element, trbl, prefix = "margin") {
    const attrs = ["Top", "Right", "Bottom", "Left"].reduce((acc, pos) => {
      const name = prefix + (prefix == "" ? pos.toLowerCase() : pos);
      return { ...acc, [name]: trbl[pos.toLowerCase()] };
    }, {});
    //console.log('Element.setTRBL ', attrs);
    return Element.setCSS(element, attrs);
  }

  static margin = element => Element.getTRBL(element, "margin");
  static padding = element => Element.getTRBL(element, "padding");
  static border = element => Element.getTRBL(element, "border");

  static setCSS = (element, prop, value) => {
    if(typeof element == "string") element = Element.find(element);
    if(typeof prop == "string" && typeof value == "string") prop = { [prop]: value };

    //console.log('Element.setCSS ', { element, toCSS });
    for(let key in prop) {
      let value = prop[key];
      const propName = Util.decamelize(key);
      if(typeof value == "function") {
        if("subscribe" in value) {
          value.subscribe = newval => element.style.setProperty(propName, newval);
          value = value();
        }
      }
      element.style.setProperty(propName, value);
    }
    return element;
  };

  static getCSS = (element, property = undefined, receiver = null) => {
    element = typeof element === "string" ? Element.find(element) : element;

    const w = window !== undefined ? window : global.window;
    const d = document !== undefined ? document : global.document;
    //console.log('Element.getCSS ', { w, d, element });

    let parent = element.parentElement ? element.parentElement : element.parentNode;

    const estyle = Util.toHash(w && w.getComputedStyle ? w.getComputedStyle(element) : d.getComputedStyle(element));
    const pstyle = parent && parent.tagName ? Util.toHash(w && w.getComputedStyle ? w.getComputedStyle(parent) : d.getComputedStyle(parent)) : {};
    //console.log('Element.getCSS ', { estyle, pstyle });

    let style = Util.removeEqual(estyle, pstyle);
    let keys = Object.keys(style).filter(k => !/^__/.test(k));
    // console.log('style: ', style);

    let ret = {};
    if(receiver == null) {
      receiver = result => {
        if(typeof result == "object") {
          try {
            Object.defineProperty(result, "cssText", {
              get: function() {
                return Object.entries(this)
                  .map(([k, v]) => `${Util.decamelize(k, "-")}: ${v};\n`)
                  .join("");
              },
              enumerable: false
            });
          } catch(err) {}
        }
        return result;
      };
    }
    if(property !== undefined) {
      ret =
        typeof property === "string"
          ? style[property]
          : property.reduce((ret, key) => {
              ret[key] = style[key];
              return ret;
            }, {});
    } else {
      for(let i = 0; i < keys.length; i++) {
        const stylesheet = keys[i];
        const key = Util.camelize(stylesheet);
        const val = style[stylesheet] || style[key];
        if(val && val.length > 0 && val != "none") ret[key] = val;
      }
    }
    return receiver(ret);
  };

  static xpath(elt, relative_to = null) {
    let path = "";
    //console.log('relative_to: ', relative_to);
    for(; elt && elt.nodeType == 1; elt = elt.parentNode) {
      const xname = Element.unique(elt);
      path = xname + path;
      if(elt == relative_to) {
        break;
      }
      path = "/" + path;
    }
    return path;
  }

  static selector(elt, opts = {}) {
    const { relative_to = null, use_id = false } = opts;
    let sel = "";
    for(; elt && elt.nodeType == 1; elt = elt.parentNode) {
      if(sel != "") sel = " > " + sel;
      let xname = Element.unique(elt, { idx: false, use_id });
      if(use_id === false) xname = xname.replace(/#.*/g, "");
      sel = xname + sel;
      if(elt == relative_to) break;
    }
    return sel;
  }
  static depth(elem, relative_to = document.body) {
    let count = 0;
    while(elem != relative_to && (elem = elem.parentNode)) count++;
    return count;
  }

  static dump(elem) {
    let str = "";
    function dumpElem(child, accu, root, depth) {
      const rect = Rect.round(Element.rect(child, elem));
      accu += "  ".repeat((depth > 0 ? depth : 0) + 1) + " " + Element.xpath(child, child);
      [...child.attributes].forEach(attr => (accu += " " + attr.name + "='" + attr.value + "'"));
      if(Rect.area(rect) > 0) accu += " " + Rect.toString(rect);
      ["margin", "border", "padding"].forEach(name => {
        let trbl = Element.getTRBL(elem, "margin");
        if(!trbl.null()) accu += " " + name + ": " + trbl + "";
      });
      return accu;
    }
    str = dumpElem(elem, "");
    str = Element.walk(
      elem.firstElementChild,
      (e, a, r, d) => {
        if(e && e.attributes) return dumpElem(e, a + "\n", r, d);
        return null;
      },
      str
    );
    return str;
  }

  static skipper(fn, pred = (a, b) => a.tagName == b.tagName) {
    return function(elem) {
      let next = fn(elem);
      for(; next; next = fn(next)) if(pred(elem, next)) return next;
      return null;
    };
  }

  static prev_sibling = sib => sib.previousElementSibling;
  static next_sibling = sib => sib.nextElementSibling;

  static idx(elt) {
    let count = 1;
    let sib = elt.previousElementSibling;
    for(; sib; sib = sib.previousElementSibling) {
      if(sib.tagName == elt.tagName) count++;
    }
    return count;
  }

  static name(elem) {
    let name = elem.tagName.toLowerCase();
    if(elem.id && elem.id.length) name += "#" + elem.id;
    else if(elem.class && elem.class.length) name += "." + elem.class;
    return name;
  }

  static unique(elem, opts = {}) {
    const { idx = true, use_id = true } = opts;
    let name = elem.tagName.toLowerCase();
    if(use_id && elem.id && elem.id.length) return name + "#" + elem.id;
    const classNames = [...elem.classList]; //String(elem.className).split(new RegExp("/[ \t]/"));
    for(let i = 0; i < classNames.length; i++) {
      let res = document.getElementsByClassName(classNames[i]);
      if(res && res.length === 1) return name + "." + classNames[i];
    }
    if(idx) {
      if(elem.nextElementSibling || elem.previousElementSibling) {
        return name + "[" + Element.idx(elem) + "]";
      }
    }
    return name;
  }

  static factory(delegate = {}, parent = null) {
    let root = parent;
    if(root === null) {
      if(typeof delegate.append_to !== "function") {
        root = delegate;
        delegate = {};
      } else {
        root = "body";
      }
    }
    const { append_to, create, setattr, setcss } = delegate;
    if(typeof root === "string") root = Element.find(root);
    if(!delegate.root) delegate.root = root;
    if(!delegate.append_to) {
      delegate.append_to = function(elem, parent) {
        if(!parent) parent = root;
        if(parent) parent.appendChild(elem);
        if(!this.root) this.root = elem;
      };
    }
    if(!delegate.create) delegate.create = tag => document.createElement(tag);
    if(!delegate.setattr) {
      delegate.setattr = (elem, attr, value) => {
        //console.log('setattr ', { attr, value });
        elem.setAttribute(attr, value);
      };
    }

    if(!delegate.setcss) delegate.setcss = (elem, css) => Object.assign(elem.style, css); // Element.setCSS(elem, css);

    delegate.bound_factory = (tag, attr = {}, parent = null) => {
      const { tagName, style, children, innerHTML, ...props } = attr;
      let elem = delegate.create(tagName || tag);

      if(style) delegate.setcss(elem, style);
      if(children && children.length) {
        for(let i = 0; i < children.length; i++) {
          if(typeof children[i] === "string") {
            elem.innerHTML += children[i];
          } else {
            const { tagName, parent, ...childProps } = children[i];
            delegate.bound_factory(tagName, childProps, elem);
          }
        }
      }
      if(innerHTML) elem.innerHTML += innerHTML;
      for(let k in props) delegate.setattr(elem, k, props[k]);
      /*console.log("bound_factory: ", { _this: this, tag, style, children, parent, props, to, append_to: this.append_to });*/
      if(delegate.append_to) delegate.append_to(elem, parent);
      return elem;
    };

    /*  console.log("delegate: ", delegate);*/
    /*    let proxy = function() {
      let obj = this && this.create ? this : delegate;
      return obj.bound_factory.apply(obj, arguments);
    };*/
    return delegate.bound_factory; //.bind(delegate);
  }

  static remove(element) {
    const e = typeof element === "string" ? Element.find(element) : element;
    if(e && e.parentNode) {
      const parent = e.parentNode;
      parent.removeChild(e);
      return true;
    }
    return false;
  }

  static isat(e, x, y, options) {
    let args = [...arguments];
    let element = args.shift();
    let point = Point(args);
    const o = args[0] || { round: false };
    const rect = Element.rect(element, o);
    return Rect.inside(rect, point);
  }

  static at(x, y, options) {
    if(Element.isElement(x)) return Element.isat.apply(Element, arguments);
    let args = [...arguments];
    const p = Point(args);
    const w = global.window;
    const d = w.document;
    const s = o.all
      ? e => {
          if(ret == null) ret = [];
          ret.push(e);
        }
      : (e, depth) => {
          e.depth = depth;
          if(ret === null || depth >= ret.depth) ret = e;
        };
    let ret = null;
    return new Promise((resolve, reject) => {
      let element = null;
      Element.walk(d.body, (e, accu, root, depth) => {
        const r = Element.rect(e, { round: true });
        if(Rect.area(r) == 0) return;
        if(Rect.inside(r, p)) s(e, depth);
      });
      if(ret !== null) resolve(ret);
      else reject();
    });
  }
}

export class CSS {
  static list(doc) {
    if(!doc) doc = window.document;

    const getStyleMap = (obj, key) => {
      let rule = Util.find(obj, item => item["selectorText"] == key);
      return Util.adapter(
        rule,
        obj => (obj && obj.styleMap && obj.styleMap.size !== undefined ? obj.styleMap.size : 0),
        (obj, i) => [...obj.styleMap.keys()][i],
        (obj, key) =>
          obj.styleMap
            .getAll(key)
            .map(v => String(v))
            .join(" ")
      );
    };
    const getStyleSheet = (obj, key) => {
      let sheet = Util.find(obj, entry => entry.href == key || entry.ownerNode.id == key) || obj[key];

      return Util.adapter(
        sheet.rules,
        obj => (obj && obj.length !== undefined ? obj.length : 0),
        (obj, i) => obj[i].selectorText,
        getStyleMap
      );
    };
    return Util.adapter(
      [...doc.styleSheets],
      obj => obj.length,
      (obj, i) => obj[i].href || obj[i].ownerNode.id || i,
      getStyleSheet
    );
  }
  static styles(stylesheet) {
    const list = stylesheet && stylesheet.cssRules ? [stylesheet] : CSS.list(stylesheet);
    let ret = Util.array();

    list.forEach(s => {
      let rules = [...s.cssRules];

      rules.forEach(rule => {
        ret.push(rule.cssText);
      });
    });
    return ret;
  }
  static classes(selector = "*") {
    return Element.findAll(selector)
      .filter(e => e.classList.length)
      .map(e => [...e.classList])
      .flat()
      .unique();
  }
}

export class Container {
  static factory(parent, size = null) {
    let delegate = {
      root: null,
      append_to: function(elem, p = null) {
        if(p == null) {
          if(this.root == null) {
            this.root = document.createElement("div");
            this.append_to(this.root, parent);
          }
          p = this.root;
        }
        p.appendChild(elem);
      }
    };
    return Element.factory(delegate);
  }
}

export class SVG extends Element {
  static ns = "http://www.w3.org/2000/svg";

  static create(name, attr, parent) {
    var svg = document.createElementNS(SVG.ns, name);

    if(name == "svg") {
      attr.version = "1.1";
      attr.xmlns = SVG.ns;
    }

    Util.foreach(attr, (value, name) => svg.setAttribute(Util.decamelize(name, "-"), value));
    if(parent && parent.appendChild) parent.appendChild(svg);
    return svg;
  }

  static factory(parent, size = null) {
    let delegate = {
      create: tag => document.createElementNS(SVG.ns, tag),
      append_to: elem => parent.appendChild(elem),
      setattr: (elem, name, value) => name != "ns" && elem.setAttributeNS(document.namespaceURI, Util.decamelize(name, "-"), value),
      setcss: (elem, css) => elem.setAttributeNS(null, "style", css)
    };
    if(size == null) size = Size(Rect.round(Element.rect(parent)));
    const { width, height } = size;

    if(parent && parent.tagName == "svg") delegate.root = parent;
    else if(this !== SVG && this && this.appendChild) delegate.root = this;
    else {
      delegate.root = SVG.create("svg", { width, height, viewBox: "0 0 " + width + " " + height + "" }, parent);
    }

    if(!delegate.root.firstElementChild || delegate.root.firstElementChild.tagName != "defs") {
      SVG.create("defs", {}, delegate.root);
    }

    delegate.append_to = function(elem, p) {
      var root = p || this.root;

      if(elem.tagName.indexOf("Gradient") != -1) {
        root = root.querySelector("defs");
      }

      if(typeof root.append == "function") root.append(elem);
      else root.appendChild(elem);
      //console.log('append_to ', elem, ', root=', root);
    };
    return Element.factory(delegate);
  }

  static matrix(element, screen = false) {
    let e = typeof element === "string" ? Element.find(element) : element;
    let fn = screen ? "getScreenCTM" : "getCTM";
    if(e && e[fn]) return Matrix.fromDOMMatrix(e[fn]());
    return null;
  }

  static bbox(element, options = { parent: null, absolute: false }) {
    let e = typeof element === "string" ? Element.find(element, options.parent) : element;
    let bb;
    if(e && e.getBBox) {
      bb = new Rect(e.getBBox());
      if(options.absolute) {
        let r = Element.rect(element.ownerSVGElement);
        bb.x += r.x;
        bb.y += r.y;
      }
      return bb;
    }
    return Element.rect(e);
  }

  static gradient(type, { stops, factory = SVG.create, parent = null, line = false, ...props }) {
    var defs = factory("defs", {}, parent);
    const map = new Map(stops instanceof Array ? stops : Object.entries(stops));

    let rect = {};

    if(line) {
      rect = new Rect(line);
      rect = { x1: rect.x, y1: rect.y, x2: rect.x2, y2: rect.y2 };
    }
    //    const { x1, y1, x2, y2 } = line;

    let grad = factory(type + "-gradient", { ...props, ...rect }, defs);

    map.forEach((color, o) => {
      //console.log('color:' + color + ' o:' + o);
      factory("stop", { offset: Math.round(o * 100) + "%", stopColor: color }, grad);
    });

    return grad;
  }

  static owner(elem) {
    var ret = function(tag, props, parent) {
      if(tag === undefined) return this.element;
      return SVG.create.call(SVG, tag, props, parent || this.element);
    };
    ret.element = elem.ownerSVGElement;
    Util.defineGetterSetter(ret, "rect", function() {
      return Element.rect(this.element);
    });
    return ret;
  }

  static path() {
    return new SvgPath();
  }
}

export class ReactComponent {
  static factory = (render_to, root) => {
    if(typeof render_to === "string") render_to = Element.find(append_to);
    if(typeof render_to !== "function") {
      root = root || render_to;
      render_to = component => require("react-dom").render(component, root || render_to);
    }
    let ret = function render_factory(Tag, { parent, children, ...props }, is_root = true) {
      const elem = (
        <Tag {...props}>
          {Array.isArray(children)
            ? children.map((child, key) => {
                if(typeof child === "object") {
                  const { tagName, ...props } = child;
                  return render_factory(tagName, { key, ...props }, false);
                }
                return child;
              })
            : undefined}
        </Tag>
      );
      //console.log('elem: ', elem);
      if(is_root && render_to) render_to(elem, parent || this.root);
      return elem;
    };
    ret.root = root;
    return ret.bind(ret);
  };

  static object() {
    let ret = [];
    for(let arg of [...arguments]) {
      if(!typeof arg == "object" || arg === null || !arg) continue;

      const tagName = arg.type && arg.type.name;
      let { children, ...props } = arg.props || {};
      let obj = { tagName, ...props };
      if(typeof arg.key == "string") obj.key = arg.key;
      if(!children) children = arg.children;

      if(React.Children.count(children) > 0) {
        const arr = React.Children.toArray(children);
        obj.children = ReactComponent.object(...arr);
      }
      ret.push(obj);
    }
    return ret;
  }

  static stringify(obj) {
    const { tagName, children, ...props } = obj;
    var str = `<${tagName}`;
    for(let prop in props) {
      let value = props[prop];

      if(typeof value == "function") {
        value = " ()=>{} ";
      } else if(typeof value == "object") {
        value = Util.inspect(value, { indent: "", newline: "\n", depth: 10, spacing: " " });
        value = value.replace(/(,?)(\n?[\s]+|\s+)/g, "$1 ");
      } else if(typeof value == "string") {
        value = `'${value}'`;
      }
      str += ` ${prop}={${value}}`;
    }

    if(!children || !children.length) {
      str += " />";
    } else {
      str += ">";
      str += `</${tagName}>`;
    }
    return str;
  }
}

/**
 *
 */
class Layer extends Element {
  constructor(arg, attr) {
    this.elm = (Element.isElement(arg) && arg) || Element.create(arg);
    this.rect = Element.rect(this.elm);
  }
}

export class Renderer {
  constructor(component, root_node) {
    this.component = component;
    this.root_node = root_node;
  }
  refresh() {
    this.clear();
    ReactDOM.render(this.component, this.root_node);

    const e = (this.element = this.root_node.firstChild);
    const xpath = Element.xpath(e);

    //console.log('Renderer.refresh ', { xpath, e });
    return e;
  }
  clear() {
    if(this.element) {
      let parent = this.element.parentNode;
      parent.removeChild(this.element);
      this.element = null;
    }
  }
}

export class Select extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { options, ...props } = this.props;

    //console.log('Select.render ', { options, props });
    const Option = ({ children, ...props }) => {
      //console.log('Select.render Option ', { children, props });

      return <option {...props}>{children}</option>;
    };

    //return <select {...props}>{
    //Object.keys(options).map(key =>
    //<Option value={key}>{options[key]}</Option>
    //)
    //}</select>
  }
}

//Create an object:

export function ElementRectProxy(element) {
  this.element = element;
}
ElementRectProxy.prototype = {
  element: null,
  getPos: function(fn = rect => rect) {
    return fn(Element.position(this.element));
  },
  getRect: function(fn = rect => rect) {
    return fn(Element.rect(this.element, { round: false }));
  },
  setPos: function(pos) {
    Element.move.apply(Element, [this.element, ...arguments]);
  },
  setSize: function(size) {
    Element.resize.apply(Element, [this.element, ...arguments]);
  },
  changeRect: function(fn = (rect, e) => rect) {
    let r = Element.getRect(this.element);
    if(typeof fn == "function") r = fn(r, this.element);

    Element.setRect(this.element, r);
  },
  setRect: function(arg) {
    let rect = arg;
    if(typeof arg == "function") {
      rect = arg(this.getRect());
    }
    Element.rect(this.element, rect);
    /*    rect = new Rect(rect);
    Element.setCSS(this.element, { ...rect.toCSS(rect), position: 'absolute' });
*/
  }
};
const propSetter = (prop, proxy) => value => {
  //proxy.changeRect(rect => { rect[prop] = value; return rect; })
  let r = proxy.getRect();
  r[prop] = value;
  //console.log('New rect: ', r);
  proxy.setRect(r);
};

const computedSetter = (proxy, compute) =>
  function(value) {
    var r = proxy.getRect();
    r = compute(value, r);
    if(r && r.x !== undefined) proxy.setRect(oldrect => r);
    return r;
  };

export const ElementXYProps = element => {
  Util.defineGetterSetter(
    element,
    "x",
    function() {
      return Element.getRect(this).x;
    },
    function(val) {
      this.style.left = `${val}px`;
    }
  );
  Util.defineGetterSetter(
    element,
    "y",
    function() {
      return Element.getRect(this).y;
    },
    function(val) {
      this.style.top = `${val}px`;
    }
  );
};

export const ElementWHProps = element => {
  Util.defineGetterSetter(
    element,
    "w",
    function() {
      return Element.getRect(this).width;
    },
    function(val) {
      this.style.width = `${val}px`;
    }
  );
  Util.defineGetterSetter(
    element,
    "h",
    function() {
      return Element.getRect(this).height;
    },
    function(val) {
      this.style.height = `${val}px`;
    }
  );
};

export const ElementPosProps = (element, proxy) => {
  proxy = proxy || new ElementRectProxy(element);
  Util.defineGetterSetter(
    element,
    "x",
    () => proxy.getPos().x,
    x => proxy.setPos({ x })
  );
  Util.defineGetterSetter(
    element,
    "x1",
    () => proxy.getPos().x,
    value =>
      proxy.setRect(rect => {
        let extend = rect.x - value;
        rect.width += extend;
        return rect;
      })
  );
  Util.defineGetterSetter(
    element,
    "x2",
    () => proxy.getRect(rect => rect.x + rect.width),
    value =>
      proxy.setRect(rect => {
        let extend = value - (rect.x + rect.w);
        rect.width += extend;
        return rect;
      })
  );
  Util.defineGetterSetter(
    element,
    "y",
    () => proxy.getPos().y,
    y => proxy.setPos({ y })
  );
  Util.defineGetterSetter(
    element,
    "y1",
    () => proxy.getPos().y,
    value =>
      proxy.setRect(rect => {
        let y = rect.y - value;
        rect.height += y;
        return rect;
      })
  );
  Util.defineGetterSetter(
    element,
    "y2",
    () => proxy.getRect(rect => rect.y + rect.height),
    value =>
      proxy.setRect(rect => {
        let y = value - (rect.y + rect.height);
        rect.height += y;
        return rect;
      })
  );
};

export const ElementSizeProps = (element, proxy) => {
  proxy = proxy || new ElementRectProxy(element);
  Util.defineGetterSetter(
    element,
    "w",
    () => proxy.getRect().width,
    width => proxy.setSize({ width })
  );
  Util.defineGetterSetter(
    element,
    "width",
    () => proxy.getRect().width,
    width => proxy.setSize({ width })
  );
  Util.defineGetterSetter(
    element,
    "h",
    () => proxy.getRect().height,
    width => proxy.setSize({ height })
  );
  Util.defineGetterSetter(
    element,
    "height",
    () => proxy.getRect().height,
    width => proxy.setSize({ height })
  );
};

export const ElementRectProps = (element, proxy) => {
  /*Util.defineGetterSetter(element, 'w', () => proxy.getRect().width, propSetter('width', proxy)); Util.defineGetterSetter(element, 'width', () => proxy.getRect().width, propSetter('width', proxy));
    Util.defineGetterSetter(element, 'h', () => proxy.getRect().height, propSetter('height', proxy)); Util.defineGetterSetter(element, 'height', () => proxy.getRect().height, propSetter('height', proxy) });*/
};
export const ElementTransformation = () => ({
  rotate: 0,
  translate: new Point(0, 0),
  scale: new Size(0, 0),
  toString() {
    const { rotate, translate, scale } = this;
    return `rotate(${rotate}deg) translate(${translate.x}, ${translate.y}) scale(${scale.w},${scale.h})`;
  }
});

export const CSSTransformSetters = element => ({
  transformation: ElementTransformation(),
  get rotate() {
    return this.transformation.rotate;
  },
  set rotate(a) {
    this.transformation.rotate = a;
  },
  get translate() {
    return this.transformation.translate;
  },
  set translate(point) {
    this.transformation.translate.set(point.x, point.y);
  },
  get scale() {
    return this.transformation.scale;
  },
  set scale(size) {
    this.transformation.scale.set(size.width, size.height);
  },
  updateTransformation() {
    const t = this.transformation.toString();
    this.style.transform = t;
  }
});

export class Transition {
  property = "none";
  delay = "";
  duration = "";
  timing = "";

  constructor(property, delay, duration, timing) {
    this.property = property;
    this.delay = delay;
    this.duration = duration;
    this.timing = timing;
  }

  static list() {
    return new TransitionList(...arguments);
  }
}

export class TransitionList extends Array {
  constructor() {
    const args = [...arguments];

    args.forEach(arg => this.push(arg));
  }

  propertyList(name) {
    return this.map(transition => transition[name]);
  }

  get css() {
    return {
      transitionDelay: this.propertyList("delay").join(", "),
      transitionDuration: this.propertyList("duration").join(", "),
      transitionProperty: this.propertyList("property").join(", "),
      transitionTimingFunction: this.propertyList("timing").join(", ")
    };
  }
}

export const RandomColor = () => {
  const c = HSLA.random();
  return c.toString();
};
/*
    function(value) {
      element.transformation[transform_name]
      element.style.transform =
    }*/
export const isPointList = inst => {};
export const isTRBL = inst => {};
export const isTimer = inst => {};
export const isTree = inst => {};
export const isCSS = inst => {};
export const isContainer = inst => {};
export const isSVG = inst => inst.tagName.toLowerCase() == "svg";

export const isReactComponent = inst => {};
export const isRenderer = inst => {};
export const isSelect = inst => {};

export default Object.assign(dom, {
  Align,
  Anchor,
  Container,
  CSS,
  CSSTransformSetters,
  Node,
  Element,
  ElementPosProps,
  ElementRectProps,
  ElementRectProxy,
  ElementSizeProps,
  ElementTransformation,
  ElementWHProps,
  ElementXYProps,
  HSLA,
  isContainer,
  isCSS,
  isElement,
  isHSLA,
  isLine,
  isMatrix,
  isNumber,
  isPoint,
  isPointList,
  isReactComponent,
  isRect,
  isRenderer,
  isRGBA,
  isSelect,
  isSize,
  isSVG,
  isTimer,
  isTRBL,
  isTree,
  Line,
  Matrix,
  MatrixProps,
  Point,
  PointList,
  ReactComponent,
  Rect,
  Renderer,
  RGBA,
  Select,
  Size,
  SVG,
  Timer,
  Transition,
  TransitionList,
  TRBL,
  Tree
});
