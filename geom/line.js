import { Point, isPoint } from "./point.js";
import { Rect } from "./rect.js";
import Util from "../util.js";

export function Line(x1, y1, x2, y2) {
  let obj = this instanceof Line ? this : {};
  let arg;
  let args = [...arguments];
  let ret;
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
    obj.x1 = typeof x === "number" ? x : parseFloat(x);
    obj.y1 = typeof y === "number" ? y : parseFloat(y);
    obj.x2 = typeof w === "number" ? w : parseFloat(w);
    obj.y2 = typeof h === "number" ? h : parseFloat(h);
    ret = 4;
  } else {
    ret = 0;
  }
  if(!isLine(obj)) console.log("ERROR: is not a line: ", [...arguments]);
  if(!(this instanceof Line)) return obj;
}

export const isLine = obj => ["x1", "y1", "x2", "y2"].every(prop => obj[prop] !== undefined);
/*
Object.defineProperty(Line.prototype, "a", { value: new Point(), enumerable: false });
Object.defineProperty(Line.prototype, "b", { value: new Point(), enumerable: true });*/

Line.prototype.intersect = function(other) {
  const ma = (this[0].y - this[1].y) / (this[0].x - this[1].x);
  const mb = (other[0].y - other[1].y) / (other[0].x - other[1].x);
  if(ma - mb < Number.EPSILON) return undefined;
  return new Point({
    x: (ma * this[0].x - mb * other[0].x + other[0].y - this[0].y) / (ma - mb),
    y: (ma * mb * (other[0].x - this[0].x) + mb * this[0].y - ma * other[0].y) / (mb - ma)
  });
};
Object.defineProperty(Line.prototype, 0, {
  get: function() {
    return this.a;
  },
  set: function(v) {
    this.a.x = v.x;
    this.a.y = v.y;
  },
  enumerable: false
});
Object.defineProperty(Line.prototype, 1, {
  get: function() {
    return this.b;
  },
  set: function(v) {
    this.b.x = v.x;
    this.b.y = v.y;
  },
  enumerable: false
});
Object.defineProperty(Line.prototype, "x1", {
  get: function() {
    return this.a && this.a.x;
  },
  set: function(v) {
    if(!this.a) Object.defineProperty(this, "a", { value: new Point(), enumerable: false });
    this.a.x = v;
  },
  enumerable: false
});
Object.defineProperty(Line.prototype, "y1", {
  get: function() {
    return this.a && this.a.y;
  },
  set: function(v) {
    if(!this.a) Object.defineProperty(this, "a", { value: new Point(), enumerable: false });
    this.a.y = v;
  },
  enumerable: false
});
Object.defineProperty(Line.prototype, "x2", {
  get: function() {
    return this.b && this.b.x;
  },
  set: function(v) {
    if(!this.b) Object.defineProperty(this, "b", { value: new Point(), enumerable: false });
    this.b.x = v;
  },
  enumerable: false
});
Object.defineProperty(Line.prototype, "y2", {
  get: function() {
    return this.b && this.b.y;
  },
  set: function(v) {
    if(!this.b) Object.defineProperty(this, "b", { value: new Point(), enumerable: false });
    this.b.y = v;
  },
  enumerable: false
});
Line.prototype.direction = function() {
  var dist = Point.prototype.distance.call(this.a, this.b);
  return Point.prototype.diff.call(this.a, this.b) / dist;
};
Line.prototype.slope = function() {
  return Point.prototype.diff.call(this.a, this.b);
};
Line.prototype.angle = function() {
  return Point.prototype.angle.call(Line.prototype.slope.call(this));
};
Line.prototype.length = function() {
  return Point.prototype.distance.call(this.a, this.b);
};
Line.prototype.pointAt = function(pos) {
  return new Point(pos * (this.x2 - this.x1) + this.x1, pos * (this.y2 - this.y1) + this.y1);
};
Line.prototype.transform = function(m) {
  this.a = this.a.transform(m);
  this.b = this.b.transform(m);
  return this;
};
Line.prototype.bbox = function() {
  return new Rect({
    x1: this.x1 < this.x2 ? this.x1 : this.x2,
    x2: this.x1 > this.x2 ? this.x1 : this.x2,
    y1: this.y1 < this.y2 ? this.y1 : this.y2,
    y2: this.y1 > this.y2 ? this.y1 : this.y2
  });
};

Line.prototype.points = function() {
  const { a, b } = this;
  return [a, b];
};
Line.prototype.inspect = function() {
  const { x1, y1, x2, y2 } = this;
  return "Line{ " + inspect({ x1, y1, x2, y2 }) + " }";
};
Line.prototype.toString = function() {
  let { a, b } = this;
  return Point.prototype.toString.call(this.a) + " -> " + Point.prototype.toString.call(this.b);
};
Line.prototype.toSource = function() {
  let { a, b } = this;
  return `new Line(${a.x},${a.y},${b.x},${b.y})`;
};
Line.prototype.swap = function() {
  let tmp = this.b;
  this.b = this.a;
  this.a = tmp;
  return this;
};
Line.prototype.toObject = function() {
  const { x1, y1, x2, y2 } = this;
  return { x1, y1, x2, y2 };
};

Line.prototype.round = function(precision = 0.001) {
  let { x1, y1, x2, y2 } = this;
  this.a.x = Util.roundTo(x1, precision);
  this.a.y = Util.roundTo(y1, precision);
  this.b.x = Util.roundTo(x2, precision);
  this.b.y = Util.roundTo(y2, precision);
  return this;
};

for (let name of ["direction", "round", "slope", "angle", "bbox", "points", "inspect", "toString"]) {
  Line[name] = points => Line.prototype[name].call(points);
}