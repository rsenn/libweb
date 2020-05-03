import { Point, isPoint } from './point.js';
import { Rect } from './rect.js';
import Util from '../util.js';

export function Line(x1, y1, x2, y2) {
  let obj = this instanceof Line ? this : null;
  let arg;
  let args = [...arguments];
  let ret;
  if(args.length >= 4 && args.every(arg => !isNaN(parseFloat(arg)))) {
    arg = { x1, y1, x2, y2 };
  } else if(args.length == 1) {
    arg = args[0];
  }

  if(obj === null) {
    obj = arg instanceof Line ? arg : new Line();
  }

  if(arg && arg.x1 !== undefined && arg.y1 !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    const { x1, y1, x2, y2 } = arg;
    obj.x1 = parseFloat(x1);
    obj.y1 = parseFloat(y1);
    obj.x2 = parseFloat(x2);
    obj.y2 = parseFloat(y2);
    ret = 1;
  } else if(isPoint(args[0]) && isPoint(args[1])) {
    obj.a = args[0];
    obj.b = args[1];

    /*    obj.x1 = parseFloat(args[0].x);
    obj.y1 = parseFloat(args[0].y);
    obj.x2 = parseFloat(args[1].x);
    obj.y2 = parseFloat(args[1].y);*/
    ret = 2;
  } else if(arg && arg.length >= 4 && arg.slice(0, 4).every(arg => !isNaN(parseFloat(arg)))) {
    obj.x1 = typeof x === 'number' ? x : parseFloat(x);
    obj.y1 = typeof y === 'number' ? y : parseFloat(y);
    obj.x2 = typeof w === 'number' ? w : parseFloat(w);
    obj.y2 = typeof h === 'number' ? h : parseFloat(h);
    ret = 4;
  } else {
    ret = 0;
  }
  if(!isLine(obj)) console.log('ERROR: is not a line: ', [...arguments]);

  if(this !== obj) return obj;
}

export const isLine = obj => ['x1', 'y1', 'x2', 'y2'].every(prop => obj[prop] !== undefined);

/*Object.defineProperty(Line.prototype, "a", { value: new Point(), enumerable: true });
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
Object.defineProperty(Line.prototype, 'x1', {
  get: function() {
    return this.a && this.a.x;
  },
  set: function(v) {
    if(!this.a)
      Object.defineProperty(this, 'a', {
        value: new Point(),
        enumerable: false
      });
    this.a.x = v;
  },
  enumerable: true
});
Object.defineProperty(Line.prototype, 'y1', {
  get: function() {
    return this.a && this.a.y;
  },
  set: function(v) {
    if(!this.a)
      Object.defineProperty(this, 'a', {
        value: new Point(),
        enumerable: false
      });
    this.a.y = v;
  },
  enumerable: true
});
Object.defineProperty(Line.prototype, 'x2', {
  get: function() {
    return this.b && this.b.x;
  },
  set: function(v) {
    if(!this.b)
      Object.defineProperty(this, 'b', {
        value: new Point(),
        enumerable: false
      });
    this.b.x = v;
  },
  enumerable: true
});
Object.defineProperty(Line.prototype, 'y2', {
  get: function() {
    return this.b && this.b.y;
  },
  set: function(v) {
    if(!this.b)
      Object.defineProperty(this, 'b', {
        value: new Point(),
        enumerable: false
      });
    this.b.y = v;
  },
  enumerable: true
});
Line.prototype.direction = function() {
  var dist = Point.prototype.distance.call(this.a, this.b);
  return Point.prototype.quot.call(Line.prototype.getSlope.call(this), dist);
};
Line.prototype.getVector = function() {
  return { x: this.x2 - this.x1, y: this.y2 - this.y1 };
};
Object.defineProperty(Line.prototype, 'vector', {
  get: Line.prototype.getVector
});
Line.prototype.getSlope = function() {
  return (this.y2 - this.y1) / (this.x2 - this.x1);
};
Object.defineProperty(Line.prototype, 'slope', {
  get: Line.prototype.getSlope
});
Line.prototype.yIntercept = function() {
  let v = Line.prototype.getVector.call(this);
  if(v.x !== 0) {
    let slope = v.y / v.x;
    return [this.a.y - this.a.x * slope, slope || 0];
  }
};
Line.prototype.xIntercept = function() {
  let v = Line.prototype.getVector.call(this);
  if(v.y !== 0) {
    let slope = v.x / v.y;
    return [this.a.x - this.a.y * slope, slope || 0];
  }
};
Line.prototype.isHorizontal = function() {
  return Line.prototype.getVector.call(this).y === 0;
};
Line.prototype.isVertical = function() {
  return Line.prototype.getVector.call(this).x === 0;
};

Line.prototype.equations = function() {
  let intercept = {
    y: Line.prototype.yIntercept.call(this),
    x: Line.prototype.xIntercept.call(this)
  };
  let equations = [];
  for(let axis in intercept) {
    if(intercept[axis]) {
      let [c0, m] = intercept[axis];
      let rhs = `${c0}`;
      if(m !== 0) rhs += ` + ${m} * ${axis == 'y' ? 'x' : 'y'}`;
      equations.push(`${axis} = ${rhs}`);
    }
  }
  return equations;
};
Line.prototype.functions = function() {
  let i;
  let fns = {};
  if((i = Line.prototype.yIntercept.call(this))) {
    let [y0, myx] = i;
    fns.y = x => y0 + myx * x;
  } else {
    let { y } = this.a;
    fns.y = new Function('x', `return ${y}`);
  }
  if((i = Line.prototype.xIntercept.call(this))) {
    let [x0, mxy] = i;
    fns.x = y => x0 + mxy * y;
  } else {
    let { x } = this.a;
    fns.x = new Function('y', `return ${x}`); //y => x;
  }
  return fns;
};
Line.prototype.angle = function() {
  return Point.prototype.angle.call(Line.prototype.getSlope.call(this));
};
Line.prototype.getLength = function() {
  return Point.prototype.distance.call(this.a, this.b);
};
Line.prototype.endpointDist = function(point) {
  return Math.min(point.distance(this.a), point.distance(this.b));
};
Line.prototype.matchEndpoints = function(arr) {
  const { a, b } = this;
  return [...arr.entries()].filter(([i, otherLine]) => !Line.prototype.equals.call(this, otherLine) && (Point.prototype.equals.call(a, otherLine.a) || Point.prototype.equals.call(b, otherLine.b) || Point.prototype.equals.call(b, otherLine.a) || Point.prototype.equals.call(a, otherLine.b)));
};

Line.prototype.distanceToPointSquared = function(p) {
  const { a, b } = this;
  var l2 = Point.prototype.distanceSquared.call(a, b);
  if(l2 === 0) return Point.prototype.distanceSquared.call(p, a);
  var t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Point.prototype.distanceSquared.call(p, new Point(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)));
};
Line.prototype.distanceToPoint = function(p) {
  return Math.sqrt(Line.prototype.distanceToPointSquared.call(this, p));
};

Object.defineProperty(Line.prototype, 'length', {
  get: Line.prototype.getLength
});
Object.defineProperty(Line.prototype, 'cross', {
  get: function() {
    const { x1, x2, y1, y2 } = this;
    return x1 * y2 - y1 * x2;
  }
});
Object.defineProperty(Line.prototype, 'dot', {
  get: function() {
    const { x1, x2, y1, y2 } = this;
    return x1 * x2 + y1 * y2;
  }
});

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
Line.prototype.diff = function(other) {
  other = Line(...arguments);
  return new Line(Point.diff(this.a, other.a), Point.diff(this.b, other.b));
};
Line.prototype.inspect = function() {
  const { x1, y1, x2, y2 } = this;
  return 'Line{ ' + inspect({ x1, y1, x2, y2 }) + ' }';
};
Line.prototype.toString = function() {
  let { a, b } = this;
  return Point.prototype.toString.call(this.a) + ' -> ' + Point.prototype.toString.call(this.b);
};
Line.prototype.toSource = function() {
  let { a, b } = this;
  return `new Line(${a.x},${a.y},${b.x},${b.y})`;
};
Line.prototype.reverse = function() {
  let tmp = this.b;
  this.b = this.a;
  this.a = tmp;
  return this;
};
Line.prototype.toObject = function() {
  const { x1, y1, x2, y2 } = this;
  const obj = { x1, y1, x2, y2 };
  Object.setPrototypeOf(obj, Line.prototype);
  return obj;
};
Line.prototype.clone = function() {
  const { x1, y1, x2, y2 } = this;
  return new Line(x1, y1, x2, y2);
};

Line.prototype.round = function(precision = 0.001) {
  let { x1, y1, x2, y2 } = this;
  this.a.x = Util.roundTo(x1, precision);
  this.a.y = Util.roundTo(y1, precision);
  this.b.x = Util.roundTo(x2, precision);
  this.b.y = Util.roundTo(y2, precision);
  return this;
};

Line.prototype.some = function(pred) {
  return pred(this.a) || pred(this.b);
};
Line.prototype.every = function(pred) {
  return pred(this.a) && pred(this.b);
};
Line.prototype.includes = function(point) {
  return Point.prototype.equals.call(this.a, point) || Point.prototype.equals.call(this.b, point);
};
Line.prototype.equals = function(other) {
  //console.log('Line.equals', this, other);
  other = Line(other);
  if(Point.equals(this.a, other.a) && Point.equals(this.b, other.b)) return 1;
  if(Point.equals(this.a, other.b) && Point.equals(this.b, other.a)) return -1;
  return false;
};
Line.prototype.indexOf = function(point) {
  let i = 0;
  for(let p of [this.a, this.b]) {
    if(Point.prototype.equals.call(p, point)) return i;
    i++;
  }
  return -1;
};
Line.prototype.lastIndexOf = function(point) {
  let i = 0;
  for(let p of [this.b, this.a]) {
    if(Point.prototype.equals.call(p, point)) return i;
    i++;
  }
  return -1;
};
Line.prototype.map = function(fn) {
  let i = 0;
  let r = [];
  for(let p of [this.a, this.b]) {
    r.push(fn(p, i, this));
    i++;
  }
  return new Line(...r);
};
Line.prototype.swap = function(fn) {
  return new Line(this.a, this.b).reverse();
};

for(let name of ['direction', 'round', 'slope', 'angle', 'bbox', 'points', 'inspect', 'toString', 'toObject', 'toSource', 'distanceToPointSquared', 'distanceToPoint']) {
  Line[name] = (...args) => Line.prototype[name].call(...args);
}

Util.defineInspect(Line.prototype, 'x1', 'y1', 'x2', 'y2');

Line.bind = (o, p, gen) => {
  if(!p) p = ['x1', 'y1', 'x2', 'y2'];
  if(!gen) gen = k => v => (v === undefined ? o[k] : (o[k] = v)); 
  let  a = Point.bind(o, p.slice(0,2), gen);
  let b = Point.bind(o, p.slice(2,4), gen);

  console.log("a:",a);
  let proxy = new Line(a, b);
  return proxy;
};
