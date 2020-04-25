import { Point, isPoint } from "./point.js";
import { Rect } from "./rect.js";
import { Line } from "./line.js";
import Util from "../util.js";

export function PointList(points, base = Array) {
  let args = [...arguments];
  let ret = this instanceof PointList ? this : [];
  if(Util.isArray(args[0]) || Util.isGenerator(args[0])) args = [...args[0]];

  if(typeof points === "string") {
    const matches = [...points.matchAll(/[-.0-9,]+/g)];
    for(let i = 0; i < matches.length; i++) {
      const coords = String(matches[i]).split(",");
      ret.push(Point(coords));
    }
  } else if(args[0] && args[0].length == 2) {
    for(let i = 0; i < args.length; i++)
      ret.push(this instanceof PointList ? new Point(args[i]) : Point(args[i]));
  } else if(args.length !== undefined) {
    for(let i = 0; i < args.length; i++) {
      ret.push(
        args[i] instanceof Point
          ? args[i]
          : this instanceof PointList
          ? new Point(args[i])
          : Point(args[i])
      );
    }
  }
  let proto = PointList.prototype;
  /*
  if(base !== Array) {
    proto = Util.clone(PointList.prototype);
    Object.setPrototypeOf(proto, base);
  }*/
  Object.setPrototypeOf(ret, proto);

  if(!(this instanceof PointList)) return ret;
}

Util.extend(
  //Object.assign
  PointList.prototype,
  Util.getMethods(Array.prototype, false)
);

console.log("Util.getMethodNames(Array.prototype, false):", [
  ...Util.getMethodNames(Array.prototype, false)
]);
console.log("Util.getMethods(Array.prototype, false):", Util.getMethods(Array.prototype, false));
console.log("PointList.prototype[Symbol.iterator]:", Array.prototype[Symbol.iterator]);

PointList.prototype.getLength = function() {
  return this.length;
};

Object.defineProperty(PointList.prototype, "size", {
  get: function() {
    return PointList.prototype.getLength.call(this);
  }
});

PointList.prototype.push = function() {
  const args = [...arguments];
  args.forEach(arg => {
    if(!(arg instanceof Point)) arg = new Point(arg);
    Array.prototype.push.call(this, arg);
  });
};
PointList.prototype.at = function(index) {
  return this[+index];
};
PointList.prototype.splice = function() {
  let args = [...arguments];
  const start = args.shift();
  const remove = args.shift();
  return Array.prototype.splice.apply(this, [
    start,
    remove,
    ...args.map(arg => (arg instanceof Point ? arg : new Point(arg)))
  ]);
};
PointList.prototype.slice = Array.prototype.slice;
PointList.prototype.removeSegment = function(index) {
  let indexes = [
    PointList.prototype.getLineIndex.call(this, index - 1),
    PointList.prototype.getLineIndex.call(this, index),
    PointList.prototype.getLineIndex.call(this, index + 1)
  ];
  let lines = indexes.map(i => PointList.prototype.getLine.call(this, i));
  let point = Line.intersect(lines[0], lines[2]);
  if(point) {
    PointList.prototype.splice.call(this, 0, 2, new Point(point));
  }
};
PointList.prototype.toPath = function(options = {}) {
  const { relative = false, close = false, precision = 0.001 } = options;
  let out = "";
  const point = relative
    ? i =>
        i > 0
          ? Point.diff(
              PointList.prototype.at.call(this, i),
              PointList.prototype.at.call(this, i - 1)
            )
          : PointList.prototype.at.call(this, i)
    : i => PointList.prototype.at.call(this, i);
  const cmd = i => (i == 0 ? "M" : "L"[relative ? "toLowerCase" : "toUpperCase"]());
  const len = PointList.prototype.getLength.call(this);
  for(let i = 0; i < len; i++) {
    out +=
      cmd(i) +
      Util.roundTo(point(i).x, precision) +
      "," +
      Util.roundTo(point(i).y, precision) +
      " ";
  }
  if(close) out += "Z";
  return out;
};
PointList.prototype.clone = function() {
  let ret = new PointList();
  ret.splice.apply(ret, [
    0,
    ret.length,
    ...PointList.prototype.map.call(this, p => new Point(p.x, p.y))
  ]);
  return ret;
};
PointList.prototype.toPolar = function(tfn) {
  let ret = new PointList();
  let t = typeof tfn == "function" ? tfn : (x, y) => ({ x: (x * 180) / Math.PI, y });
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
  let t = typeof tfn == "function" ? tfn : (x, y) => ({ x: (x * Math.PI) / 180, y });
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
  var area = 0;
  var i;
  var j;
  var point1;
  var point2;
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
  var x = 0;
  var y = 0;
  var i;
  var j;
  var f;
  var point1;
  var point2;
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
  var ret = PointList.prototype.reduce.call(this, (acc, p) => acc.add(p), new Point());
  return ret.div(PointList.prototype.getLength.call(this));
};
PointList.prototype.bbox = function() {
  const len = PointList.prototype.getLength.call(this);
  if(!len) return {};
  const first = PointList.prototype.at.call(this, 0);
  var ret = {
    x1: first.x,
    x2: first.x,
    y1: first.y,
    y2: first.y,
    toString: function() {
      return `{x1:${(this.x1 + "").padStart(4, " ")},x2:${(this.x2 + "").padStart(4, " ")},y1:${(
        this.y1 + ""
      ).padStart(4, " ")},y2:${(this.y2 + "").padStart(4, " ")}}`;
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
PointList.prototype.toString = function(sep = ",", prec) {
  return Point.prototype.map
    .call(this, point => Point.prototype.toString.call(point, prec, sep))
    .join(" ");
};
PointList.prototype.toSource = function() {
  return (
    "new PointList([" +
    PointList.prototype.map.call(this, point => Point.prototype.toSource.call(point)).join(",") +
    "])"
  );
};
PointList.prototype.rotateRight = function(n) {
  return Util.rotateRight(this, n);
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

PointList.prototype.round = function(prec) {
  PointList.prototype.forEach.call(this, it => Point.prototype.round.call(it, prec));
  return this;
};

if(!Util.isBrowser()) {
  let c = Util.color();
  PointList.prototype[
    /* util.inspect.custom || */ Symbol.for("nodejs.util.inspect.custom")
  ] = function() {
    return `${c.text("PointList", 1, 33)} ${c.text("(", 1, 36)}${c.text(this.getLength(), 1, 35) +
      c.code(1, 36)}) [\n  ${this.map(({ x, y }) =>
      Util.toString({ x, y }, { multiline: false, spacing: " " })
    ).join(",\n  ")}\n]`;
  };
}

for(let name of [
  "push",
  "splice",
  "clone",
  "area",
  "centroid",
  "avg",
  "bbox",
  "rect",
  "xrange",
  "yrange",
  "boundingRect"
]) {
  PointList[name] = points => PointList.prototype[name].call(points);
}
/*
for(let prop in Object.getOwnPropertyDescriptors(Array.prototype))
console.log("Array.prototype prop:",Util.getMethodNames(Array.prototype));*/
//console.log('Array.prototype getMethods:', Util.getMethods(Array.prototype));
//console.log('Array.prototype members:', [...Util.members(Array.prototype)]);
//console.log('PointList.prototype methods:', Util.methods(PointList.prototype));
//console.log('PointList.prototype getMethods:', Util.getMethods(PointList.prototype));

/*

paths = dom.Element.findAll("path", im = dom(await img("action-save-new.svg")));
lines = [...dom.SVG.lineIterator(paths[1])];
let p=new dom.ElementRectProxy(im);
e=dom(im.parentElement);
e.resize(200,200); im.resize('100%','100%')
new dom.Polyline(lines).toSVG(dom.SVG.factory(), { stroke: '#ffa000', fill: 'none', strokeWidth: 0.4 }, paths[0].parentElement);
new dom.Polyline(lines).toSVG(dom.SVG.factory(), { stroke: '#ff0000', fill: 'none', strokeWidth: 0.4 }, paths[0].parentElement);
new dom.Polyline(lines).toSVG(dom.SVG.factory(), { stroke: '#0050ff', fill: 'none', strokeWidth: 0.4 }, paths[0].parentElement);
*/
export function Polyline(lines) {
  let ret = this instanceof Polyline ? this : new PointList();
  const addUnique = point => {
    const ok = ret.length > 0 ? !Point.equals(ret[ret.length - 1], point) : true;
    if(ok) ret.push({ ...point });
    return ok;
  };
  let prev;
  for(let i = 0; i < lines.length; i++) {
    const line = lines.shift();
    console.log(`line[${i}]:`, line.toString());
    if(i > 0) {
      const eq = [Point.equals(prev, line.a)];

      console.log(`Point.equals(${prev},${line.a}) = ${eq[0]}`);
      if(!eq[0] && !Point.equals(prev, line.b)) break;
    } else {
      addUnique(line.a);
    }
    addUnique(line.b);
    prev = line.b;
  }
  return ret;
}

Polyline.prototype = new PointList();

Polyline.prototype.toSVG = function(factory, attrs = {}, parent = null) {
  return factory("polyline", { points: PointList.prototype.toString.call(this), ...attrs }, parent);
};
