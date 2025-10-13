import { bindProperties, defineGetter, immutableClass, isObject, memoize, roundTo } from '../misc.js';
import { isPoint, Point } from './point.js';

export function Line(...args) {
  if(!new.target) if (args[0] instanceof Line) return args[0];

  let [x1, y1, x2, y2] = args;
  let obj;
  let arg;
  let ret;
  if(args.length >= 4 && args.every(arg => !isNaN(parseFloat(arg)))) {
    arg = { x1, y1, x2, y2 };
  } else if(args.length == 1) {
    arg = args[0];
  }
  obj = new.target ? this : null /* new Line()*/;

  //obj = this || { ...arg };

  if(obj === null) obj = Object.create(Line.prototype);

  if(Object.getPrototypeOf(obj) !== Line.prototype) Object.setPrototypeOf(obj, Line.prototype);

  //if(!('a' in obj) || !('b' in obj)) throw new Error('no a/b prop');
  if(arg && arg.x1 !== undefined && arg.y1 !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    const { x1, y1, x2, y2 } = arg;
    obj.x1 = parseFloat(x1);
    obj.y1 = parseFloat(y1);
    obj.x2 = parseFloat(x2);
    obj.y2 = parseFloat(y2);
    ret = 1;
  } else if(isPoint(args[0]) && isPoint(args[1])) {
    args = args.map(a => Point(a));

    obj.x1 = args[0].x;
    obj.y1 = args[0].y;
    obj.x2 = args[1].x;
    obj.y2 = args[1].y;
    ret = 2;
  } else if(arg && arg.length >= 4 && arg.slice(0, 4).every(arg => !isNaN(+arg))) {
    const [x1, y1, x2, y2] = arg.map(a => +a);
    obj.x1 = x1;
    obj.y1 = y1;
    obj.x2 = x2;
    obj.y2 = y2;
    ret = 4;
  } else {
    ret = 0;
  }

  if(!('a' in obj) || obj.a === undefined)
    Object.defineProperty(obj, 'a', {
      value: new Point(obj.x1, obj.y1),
      enumerable: false,
    });
  if(!('b' in obj) || obj.b === undefined)
    Object.defineProperty(obj, 'b', {
      value: new Point(obj.x2, obj.y2),
      enumerable: false,
    });

  if(!isLine(obj)) {
    console.log('ERROR: is not a line: ', obj);
  }

  if(!['x1', 'y1', 'x2', 'y2'].every(prop => !isNaN(+obj[prop]))) return null;

  /*  if(this !== obj)*/ return obj;
}

export const isLine = obj => (isObject(obj) && ['x1', 'y1', 'x2', 'y2'].every(prop => obj[prop] !== undefined)) || ['a', 'b'].every(prop => isPoint(obj[prop]));

/*
Object.defineProperty(Line.prototype, 'a', { value: new Point(), enumerable: true });
Object.defineProperty(Line.prototype, 'b', { value: new Point(), enumerable: true });
*/

Line.prototype.intersect = function(other) {
  const ma = (this[0].y - this[1].y) / (this[0].x - this[1].x);
  const mb = (other[0].y - other[1].y) / (other[0].x - other[1].x);
  if(ma - mb < Number.EPSILON) return undefined;
  return new Point({
    x: (ma * this[0].x - mb * other[0].x + other[0].y - this[0].y) / (ma - mb),
    y: (ma * mb * (other[0].x - this[0].x) + mb * this[0].y - ma * other[0].y) / (mb - ma),
  });
};

Object.defineProperty(Line.prototype, 'a', {
  get() {
    return new Point(this.x1, this.y1);
  },
  set(value) {
    if(!(value instanceof Point)) value = Point(value);
    this.x1 = value.x;
    this.y1 = value.y;
  },
  enumerable: false,
});
Object.defineProperty(Line.prototype, 'b', {
  get() {
    return new Point(this.x2, this.y2);
  },
  set(value) {
    if(!(value instanceof Point)) value = Point(value);
    this.x2 = value.x;
    this.y2 = value.y;
  },
  enumerable: false,
});

Object.defineProperty(Line.prototype, 0, {
  get() {
    return this.a;
  },
  set(v) {
    this.a = v;
  },
  enumerable: false,
});
Object.defineProperty(Line.prototype, 1, {
  get() {
    return this.b;
  },
  set(v) {
    this.b = v;
  },
  enumerable: false,
});
/*Object.defineProperty(Line.prototype, 'x1', {get() {return this.a && this.a.x; }, set(v) {if(!this.a) Object.defineProperty(this, 'a', { value: new Point(), enumerable: false }); this.a.x = v; }, enumerable: true });
Object.defineProperty(Line.prototype, 'y1', {get() {return this.a && this.a.y; }, set(v) {if(!this.a) Object.defineProperty(this, 'a', {value: new Point(), enumerable: false }); this.a.y = v; }, enumerable: true });
Object.defineProperty(Line.prototype, 'x2', {get() {return this.b && this.b.x; }, set(v) {if(!this.b) Object.defineProperty(this, 'b', {value: new Point(), enumerable: false }); this.b.x = v; }, enumerable: true });
Object.defineProperty(Line.prototype, 'y2', {get() {return this.b && this.b.y; }, set(v) {if(!this.b) Object.defineProperty(this, 'b', {value: new Point(), enumerable: false }); this.b.y = v; }, enumerable: true });
*/
Line.prototype.direction = function() {
  let dist = Point.prototype.distance.call(this.a, this.b);
  return Point.prototype.quot.call(Line.prototype.getSlope.call(this), dist);
};
Line.prototype.getVector = function() {
  return { x: this.x2 - this.x1, y: this.y2 - this.y1 };
};
Object.defineProperty(Line.prototype, 'vector', {
  get: Line.prototype.getVector,
});
Line.prototype.getSlope = function() {
  return (this.y2 - this.y1) / (this.x2 - this.x1);
};
Object.defineProperty(Line.prototype, 'slope', {
  get() {
    return new Point(this.x2 - this.x1, this.y2 - this.y1);
  },
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

Line.prototype.isNull = function() {
  return this.x1 == 0 && this.y1 == 0 && this.x2 == 0 && this.y2 == 0;
};
Line.prototype.equations = function() {
  let intercept = {
    y: Line.prototype.yIntercept.call(this),
    x: Line.prototype.xIntercept.call(this),
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
  return Point.prototype.angle.call(Line.prototype.getVector.call(this));
};
Line.prototype.getLength = function() {
  const { a, b } = this;
  const { x1, y1, x2, y2 } = this;
  //console.log("a:",a, " b:",b);
  //console.log('a:', a, ' b:', b);
  //console.log('this:', this);
  return Point.prototype.distance.call(a, b);
};
Line.prototype.endpointDist = function(point) {
  return Math.min(point.distance(this.a), point.distance(this.b));
};
Line.prototype.matchEndpoints = function(arr) {
  const { a, b } = this;
  return [...arr.entries()].filter(
    ([i, otherLine]) =>
      !Line.prototype.equals.call(this, otherLine) &&
      (Point.prototype.equals.call(a, otherLine.a) || Point.prototype.equals.call(b, otherLine.b) || Point.prototype.equals.call(b, otherLine.a) || Point.prototype.equals.call(a, otherLine.b)),
  );
};

Line.prototype.distanceToPointSquared = function(p) {
  const { a, b } = this;
  let l2 = Point.prototype.distanceSquared.call(a, b);
  if(l2 === 0) return Point.prototype.distanceSquared.call(p, a);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Point.prototype.distanceSquared.call(p, new Point(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)));
};
Line.prototype.distanceToPoint = function(p) {
  return Math.sqrt(Line.prototype.distanceToPointSquared.call(this, p));
};

Object.defineProperty(Line.prototype, 'len', {
  get: Line.prototype.getLength,
});
Object.defineProperty(Line.prototype, 'cross', {
  get() {
    const { x1, x2, y1, y2 } = this;
    return x1 * y2 - y1 * x2;
  },
});
Object.defineProperty(Line.prototype, 'dot', {
  get() {
    const { x1, x2, y1, y2 } = this;
    return x1 * x2 + y1 * y2;
  },
});

Line.prototype.pointAt = function(pos) {
  return Point.interpolate(...this.toPoints(), pos);

  //return new Point(pos * (this.x2 - this.x1) + this.x1, pos * (this.y2 - this.y1) + this.y1);
};
Line.prototype.transform = function(m) {
  this.a = this.a.transform(m);
  this.b = this.b.transform(m);

  if(round) Line.prototype.round.call(this, 1e-13, 13);

  return this;
};
Line.prototype.bbox = function(proto = Object.prototype) {
  const { x1, y1, x2, y2 } = this;
  return Object.setPrototypeOf({ x1, y1, x2, y2 }, proto);
};

Line.prototype.points = function() {
  const { a, b } = this;
  return [a, b];
};

Line.prototype.toString = function(opts = {}) {
  let { separator = ', ', brackets, pad = 6, ...options } = opts;

  if(typeof brackets != 'function') brackets = brackets ? s => `[ ${s} ]` : s => s;

  const { x1, y1, x2, y2 } = this;
  return (
    brackets(
      Point.toString(this.a || Point(x1, y1), {
        ...options,
        /*separator,*/ pad: 0,
      }),
    ) +
    separator +
    brackets(
      Point.toString(this.b || Point(x2, y2), {
        ...options,
        /*separator,*/ pad: 0,
      }),
    )
  );
};
Line.prototype.toSource = function() {
  const { x1, y1, x2, y2 } = this;
  return `new Line(${[x1, y1, x2, y2].join(',')})`;
};
Line.prototype.reverse = function() {
  const { a, b } = this;
  this.b = a;
  this.a = b;
  if(this.curve !== undefined) this.curve = -this.curve;
  if(this.width !== undefined) this.width = this.width;
  return this;
};
Line.prototype.toObject = function(t = num => num) {
  const { x1, y1, x2, y2 } = this;
  const obj = { x1: t(x1), y1: t(y1), x2: t(x2), y2: t(y2) };
  //Object.setPrototypeOf(obj, Line.prototype);
  return obj;
};
Line.prototype.clone = function() {
  const ctor = this.constructor[Symbol.species];
  const { x1, y1, x2, y2 } = this;
  let ret = new ctor(x1, y1, x2, y2);

  if(this.curve !== undefined) ret.curve = this.curve;

  return ret;
};

Line.prototype.round = function(precision = 0.001, digits, type) {
  let { x1, y1, x2, y2 } = this;
  this.x1 = roundTo(x1, precision, digits, type);
  this.y1 = roundTo(y1, precision, digits, type);
  this.x2 = roundTo(x2, precision, digits, type);
  this.y2 = roundTo(y2, precision, digits, type);
  return this;
};

Line.prototype.roundTo = function(...args) {
  let ret = new Line();
  for(let prop of ['x1', 'y1', 'x2', 'y2']) ret[prop] = roundTo(this[prop], ...args);
  return ret;
};

Line.prototype.sum = function(...args) {
  let r = new Line(...this);
  return Line.prototype.add.call(r, ...args);
};
Line.prototype.add = function(...args) {
  let other;
  if((other = Line(...args))) {
    this.x1 += other.x1;
    this.y1 += other.y1;
    this.x2 += other.x2;
    this.y2 += other.y2;
  } else if((other = Point(...args))) {
    this.x1 += other.x;
    this.y1 += other.y;
    this.x2 += other.x;
    this.y2 += other.y;
  }
  return this;
};
Line.prototype.diff = function(...args) {
  let r = new Line(...this);
  return Line.prototype.sub.call(r, ...args);
};
Line.prototype.sub = function(...args) {
  let other;
  if((other = Line(...args))) {
    this.x1 -= other.x1;
    this.y1 -= other.y1;
    this.x2 -= other.x2;
    this.y2 -= other.y2;
  } else if((other = Point(...args))) {
    this.x1 -= other.x;
    this.y1 -= other.y;
    this.x2 -= other.x;
    this.y2 -= other.y;
  }
  return this;
};
Line.prototype.prod = function(...args) {
  let r = new Line(...this);
  return Line.prototype.mul.call(r, ...args);
};
Line.prototype.mul = function(...args) {
  const o = args.length == 1 && typeof args[0] == 'number' ? { x: args[0], y: args[0] } : new Point(...args);
  this.x1 *= o.x;
  this.y1 *= o.y;
  this.x2 *= o.x;
  this.y2 *= o.y;
  return this;
};
Line.prototype.quot = function(...args) {
  let r = new Line(...this);
  return Line.prototype.div.call(r, ...args);
};
Line.prototype.div = function(...args) {
  const o = args.length == 1 && typeof args[0] == 'number' ? { x: args[0], y: args[0] } : new Point(...args);
  this.x1 /= o.x;
  this.y1 /= o.y;
  this.x2 /= o.x;
  this.y2 /= o.y;
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
Line.prototype.equals = function(...args) {
  let other = Line(...args);
  if(Point.equals(this.a, other.a) && Point.equals(this.b, other.b)) return 1;
  if(Point.equals(this.a, other.b) && Point.equals(this.b, other.a)) return -1;
  return 0;
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
  let line = new Line(this.b, this.a);
  if(this.curve !== undefined) line.curve = -this.curve;
  if(this.width !== undefined) line.width = this.width;
  return line;
};
Line.prototype.toPoints = function(ctor = Array.of) {
  const { x1, y1, x2, y2 } = this;
  return ctor({ x: x1, y: y1 }, { x: x2, y: y2 });
};
Line.prototype[Symbol.iterator] = function() {
  const { x1, y1, x2, y2 } = this;
  return [x1, y1, x2, y2][Symbol.iterator]();
};

for(let name of ['direction', 'round', 'slope', 'angle', 'bbox', 'points', 'toString', 'toObject', 'toSource', 'distanceToPointSquared', 'distanceToPoint']) {
  Line[name] = (line, ...args) => Line.prototype[name].call(line || new Line(line), ...args);
}

Line.a = memoize(line => Point.bind(line, ['x1', 'y1']), new WeakMap());
Line.b = memoize(line => Point.bind(line, ['x2', 'y2']), new WeakMap());

Line.from = obj => {
  let l = new Line(obj);

  for(let extra of ['curve', 'width']) {
    if(typeof obj[extra] == 'number') l[extra] = obj[extra];
    else if(typeof obj[extra] == 'string' && !isNaN(+obj[extra])) l[extra] = +obj[extra];
  }
  return l;
};

Line.bind = (o, p, gen) => {
  const [x1, y1, x2, y2] = p || ['x1', 'y1', 'x2', 'y2'];
  if(!gen) gen = k => v => (v === undefined ? o[k] : (o[k] = v));

  let proxy = { a: Point.bind(o, [x1, y1]), b: Point.bind(o, [x2, y2]) };
  bindProperties(proxy, o, { x1, y1, x2, y2 }, gen);
  return Object.setPrototypeOf(proxy, Line.prototype);
};

defineGetter(Line, Symbol.species, function() {
  return this;
});

export const ImmutableLine = immutableClass(Line);
defineGetter(ImmutableLine, Symbol.species, () => ImmutableLine);
