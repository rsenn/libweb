import { Point, isPoint } from './point.js';
//import { PointList } from './pointList.js';
import { Line } from './line.js';
import { Size, isSize } from './size.js';
import { Align } from './align.js';
import { TRBL } from './trbl.js';
import Util from '../util.js';

export function Rect(arg) {
  let obj = this instanceof Rect ? this : {};
  let args = arg instanceof Array ? arg : [...arguments];
  let ret;

  if(typeof args[0] == 'number') arg = args;
  else if(Util.isObject(args[0]) && args[0].length !== undefined) arg = args.shift();

  ['x', 'y', 'width', 'height'].forEach(field => {
    if(typeof obj[field] != 'number') obj[field] = 0;
  });

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
    let x = arg.shift();
    let y = arg.shift();
    let w = arg.shift();
    let h = arg.shift();
    obj.x = typeof x === 'number' ? x : parseFloat(x);
    obj.y = typeof y === 'number' ? y : parseFloat(y);
    obj.width = typeof w === 'number' ? w : parseFloat(w);
    obj.height = typeof h === 'number' ? h : parseFloat(h);
    ret = 4;
  } else if(arg && arg.length >= 2 && arg.slice(0, 2).every(arg => !isNaN(parseFloat(arg)))) {
    obj.x = 0;
    obj.y = 0;
    obj.width = typeof arg[0] === 'number' ? arg[0] : parseFloat(arg[0]);
    obj.height = typeof arg[1] === 'number' ? arg[1] : parseFloat(arg[1]);
    ret = 2;
  } else if(arg instanceof Array) {
    let argc;
    let argi = 0;
    if(arg.length >= 4) {
      argc = typeof x == 'number' ? 2 : 1;
      Point.apply(obj, arg.slice(0, argc));
      argi = argc;
    }
    argc = typeof arg[argi] == 'number' ? 2 : 1;
    Size.apply(obj, arg.slice(argi, argc));
    ret = argi + argc;
  }

  if(typeof obj.x != 'number' || isNaN(obj.x)) obj.x = 0;
  if(typeof obj.y != 'number' || isNaN(obj.y)) obj.y = 0;
  if(typeof obj.width != 'number' || isNaN(obj.width)) obj.width = 0;
  if(typeof obj.height != 'number' || isNaN(obj.height)) obj.height = 0;

  /*  if(obj.round === undefined) {
    Object.defineProperty(obj, 'round', {
      value: function() {
        return Rect.round(this);
      },
      enumerable: true,
      writable: false
    });
  }*/
  return obj;
  if(!(this instanceof Rect) || new.target === undefined) return obj;
}
Rect.prototype = {
  ...Size.prototype,
  ...Point.prototype,
  ...Rect.prototype
};
Rect.fromString = str => {
  const matches = [...Util.matchAll(/[-.\d]+/g, str)];
  return new Rect(...matches.map(m => +m[0]));
};
Rect.prototype.clone = function(fn) {
  const ctor = this.constructor[Symbol.species] || this.constructor;
  let ret = new ctor(this.x, this.y, this.width, this.height);
  if(fn) fn(ret);
  return ret;
};

Rect.prototype.corners = function() {
  const rect = this;
  return [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height }
  ];
};

if(Rect.prototype.isSquare === undefined) {
  Rect.prototype.isSquare = function() {
    return Math.abs(this.width - this.height) < 1;
  };
}
Rect.prototype.constructor = Rect;
Rect.prototype.getArea = function() {
  return this.width * this.height;
};
Rect.prototype.toSource = function(opts = {}) {
  const { color = true } = opts;
  const c = Util.coloring(color);
  const { x, y, width, height } = this;
  return c.concat(c.text('new', 1, 31), c.text('Rect', 1, 33), `(${x},${y},${width},${height})`);
};
Rect.prototype[Symbol.for('nodejs.util.inspect.custom')] = function(n, opts = {}) {
  const { color = true } = opts;
  const c = Util.coloring(color);
  const { x, y, width, height } = this;
  return (c.text('Rect', 1, 31) +
    ' ' +
    c.text(`{ `, 1, 36) +
    ['x', 'y', 'width', 'height'].map(prop => c.text(prop, 1, 33) + c.text(':', 1, 36) + ' ' + this[prop]).join(', ') +
    ' }'
  );
};
Object.defineProperty(Rect.prototype, 'x1', {
  get() {
    return this.x;
  },
  set(value) {
    const extend = this.x - value;
    this.width += extend;
    this.x -= extend;
  },
  enumerable: true
});
Object.defineProperty(Rect.prototype, 'x2', {
  get() {
    return this.x + this.width;
  },
  set(value) {
    this.width = value - this.x;
  },
  enumerable: true
});
Object.defineProperty(Rect.prototype, 'y1', {
  get() {
    return this.y;
  },
  set(value) {
    const extend = this.y - value;
    this.height += extend;
    this.y -= extend;
  }
});
Object.defineProperty(Rect.prototype, 'y2', {
  get() {
    return this.y + this.height;
  },
  set(value) {
    this.height = value - this.y;
  }
});
Object.defineProperty(Rect.prototype, 'area', {
  get() {
    return Rect.prototype.getArea.call(this);
  }
});

const getSize = Util.memoize(rect =>
  Util.bindProperties(new Size(0, 0), rect, ['width', 'height'], k => {
    // console.log('gen', { k });
    return v => {
      return v !== undefined ? (rect[k] = v) : rect[k];
    };
  })
);

const getPoint = Util.memoize(rect =>
  Util.bindProperties(new Point(0, 0), rect, ['x', 'y'], k => v => (v !== undefined ? (rect[k] = v) : rect[k]))
);

Object.defineProperty(Rect.prototype, 'center', {
  get() {
    return Rect.center(this);
  }
});
Rect.prototype.getSize = Util.memoize;
Object.defineProperty(Rect.prototype, 'size', {
  get() {
    let ret = getSize(this);
    //console.log('getSize( ) =', ret);
    return ret;
  }
});
Object.defineProperty(Rect.prototype, 'point', {
  get() {
    let ret = getPoint(this);
    //console.log('getPoint( ) =', ret);
    return ret;
  }
});
/*Object.defineProperty(Rect.prototype, 'size', {
  get() {
    const rect = this;
    const size = new Size(rect.width, rect.height);
    Object.defineProperties(size, {
      width: {
        get() {
          return rect.width;
        },
        set(value) {
          return (rect.width = +value);
        },
        enumerable: true
      },
      height: {
        get() {
          return rect.height;
        },
        set(value) {
          return (rect.height = +value);
        },
        enumerable: true
      }
    });
    return size;
  }
});*/
Rect.prototype.points = function(ctor = items => Array.from(items)) {
  const c = this.corners();
  return ctor(c);
};
Rect.prototype.toCSS = Rect.toCSS;
Rect.prototype.equals = function(...args) {
  return Point.prototype.equals.call(this, ...args) && Size.prototype.equals.call(this, ...args);
};
Rect.prototype.scale = function(factor) {
  let width = this.width * factor;
  let height = this.height * factor;

  this.x += (width - this.width) / 2;
  this.y += (height - this.height) / 2;
  this.width = width;
  this.height = height;
  return this;
};
Rect.prototype.mul = function(...args) {
  Point.prototype.mul.call(this, ...args);
  Size.prototype.mul.call(this, ...args);
  return this;
};

Rect.prototype.div = function(...args) {
  Point.prototype.div.call(this, ...args);
  Size.prototype.div.call(this, ...args);
  return this;
};
Rect.prototype.outset = function(trbl) {
  if(typeof trbl == 'number') trbl = { top: trbl, right: trbl, bottom: trbl, left: trbl };
  this.x -= trbl.left;
  this.y -= trbl.top;
  this.width += trbl.left + trbl.right;
  this.height += trbl.top + trbl.bottom;
  return this;
};
Rect.prototype.inset = function(trbl) {
  if(typeof trbl == 'number') trbl = new TRBL(trbl, trbl, trbl, trbl);
  if(trbl.left + trbl.right < this.width && trbl.top + trbl.bottom < this.height) {
    this.x += trbl.left;
    this.y += trbl.top;
    this.width -= trbl.left + trbl.right;
    this.height -= trbl.top + trbl.bottom;
  }
  return this;
};
Rect.prototype.inside = function(point) {
  return Rect.inside(this, point);
};
Rect.CONTAIN = 16;
Rect.COVER = 32;

Rect.prototype.fit = function(other, align = Align.CENTER | Align.MIDDLE | Rect.CONTAIN) {
  let factors = Size.prototype.fitFactors.call(this, new Size(other)).sort((a, b) => a - b);
  // console.log('Rect.prototype.fit:', this, ...factors, { factors, other, align });

  let rects = factors.reduce((acc, factor) => {
    let rect = new Rect(0, 0, this.width, this.height);
    rect.width *= factor;
    rect.height *= factor;

    rect.align(other, align & 0x0f);

    acc.push(rect);
    return acc;
  }, []);

  //console.log('rects:', rects);

  return rects;
};

Rect.prototype.pointFromCenter = function(point) {
  Point.prototype.sub.call(point, this.center);
  point.x /= this.width;
  point.y /= this.height;
  return point;
};
Rect.prototype.toCSS = function() {
  return {
    ...Point.prototype.toCSS.call(this),
    ...Size.prototype.toCSS.call(this)
  };
};

Rect.prototype.toTRBL = function() {
  return {
    top: this.y,
    right: this.x + this.width,
    bottom: this.y + this.height,
    left: this.x
  };
};
Rect.prototype.toArray = function() {
  const { x, y, width, height } = this;
  return [x, y, width, height];
};
Rect.prototype.toPoints = function(...args) {
  let ctor = Util.isConstructor(args[0])
    ? (() => {
        let arg = args.shift();
        return points => new arg(points);
      })()
    : points => Array.from(points);
  let num = typeof args[0] == 'number' ? args.shift() : 4;
  const { x, y, width, height } = this;
  let a =
    num == 2
      ? [new Point(x, y), new Point(x + width, y + height)]
      : [new Point(x, y), new Point(x + width, y), new Point(x + width, y + height), new Point(x, y + height)];
  return ctor(a);
};
Rect.prototype.toLines = function(ctor = lines => Array.from(lines, points => new Line(...points))) {
  let [a, b, c, d] = Rect.prototype.toPoints.call(this);
  return ctor([
    [a, b],
    [b, c],
    [c, d],
    [d, a]
  ]);
};
Rect.prototype.align = function(align_to, a = 0) {
  const xdiff = (align_to.width || 0) - this.width;
  const ydiff = (align_to.height || 0) - this.height;
  let oldx = this.x;
  let oldy = this.y;

  switch (Align.horizontal(a)) {
    case Align.LEFT:
      this.x = align_to.x;
      break;
    case Align.RIGHT:
      this.x = align_to.x + xdiff;
      break;
    default: this.x = align_to.x + xdiff / 2;
      break;
  }
  switch (Align.vertical(a)) {
    case Align.TOP:
      this.y = align_to.y;
      break;
    case Align.BOTTOM:
      this.y = align_to.y + ydiff;
      break;
    default: this.y = align_to.y + ydiff / 2;
      break;
  }

  /*  this.tx = this.x - oldx;
  this.ty = this.y - oldy;*/
  return this;
};

Rect.prototype.round = function(precision = 0.001, digits, type) {
  let { x1, y1, x2, y2 } = this.toObject(true);
  let a = Point.round({ x: -x1, y: -y1 }, precision, digits, type);
  let b = Point.round({ x: x2, y: y2 }, precision, digits, type);
  this.x = -a.x;
  this.y = -a.y;
  this.width = b.x - this.x;
  this.height = b.y - this.y;
  return this;
};
Rect.prototype.toObject = function(bb = false) {
  if(bb) {
    const { x1, y1, x2, y2 } = this;
    return { x1, y1, x2, y2 };
  }
  const { x, y, width, height } = this;
  return { x, y, width, height };
};
Rect.prototype.bbox = function() {
  return this.toObject(true);
};

Rect.prototype.transform = function(m) {
  if(Util.isObject(m) && typeof m.toMatrix == 'function') m = m.toMatrix();
  Matrix.prototype.transform_rect.call(m, this);
  return this;
};

Rect.prototype[Symbol.iterator] = function* () {
  let { x, y, width, height } = this;
  for(let prop of [x, y, width, height]) yield prop;
};

Rect.isBBox = rect => !(rect instanceof Rect) && ['x1', 'x2', 'y1', 'y2'].every(prop => prop in rect);
Rect.assign = (to, rect) => Object.assign(to, new Rect(rect).toObject(Rect.isBBox(to)));
Rect.align = (rect, align_to, a = 0) => Rect.prototype.align.call(rect, align_to, a);
Rect.toCSS = rect => Rect.prototype.toCSS.call(rect);

Rect.round = (rect, ...args) => Rect.assign(rect, new Rect(rect).round(...args));
Rect.inset = (rect, trbl) => Rect.assign(rect, new Rect(rect).inset(trbl));
Rect.outset = (rect, trbl) => Rect.assign(rect, new Rect(rect).outset(trbl));

Rect.center = rect => new Point(rect.x + rect.width / 2, rect.y + rect.height / 2);
Rect.bind = rect => {
  let obj = new Rect();
};

Rect.inside = (rect, point) =>
  point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
Rect.from = function(obj) {
  //const { x1,y1,x2,y2 } = obj;
  const fn = (v1, v2) => [Math.min(v1, v2), Math.max(v1, v2)];

  const h = fn(obj.x1, obj.x2);
  const v = fn(obj.y1, obj.y2);

  const [x1, x2, y1, y2] = [...h, ...v];

  return new Rect(x1, y1, x2 - x1, y2 - y1); //h[0], v[0], h[1] - h[0], v[1] - v[0]);
};

Rect.fromCircle = function(...args) {
  const { x, y } = Point(args);
  const radius = args.shift();

  return new Rect(x - radius, y - radius, radius * 2, radius * 2);
};

for(let name of [
  'clone',
  'corners',
  'isSquare',
  'getArea',
  // 'toString',
  //'toSource',
  'points',
  'toCSS',
  'toTRBL',
  'toPoints',
  'equals'
]) {
  Rect[name] = (rect, ...args) => Rect.prototype[name].call(rect || new Rect(rect), ...args);
}

Rect.toSource = (rect, opts = {}) => {
  const { sep = ', ', inner = false, spc = ' ', colon = ':' } = opts;
  let props = `x${colon}${spc}${rect.x}${sep}y${colon}${spc}${rect.y}${sep}width${colon}${spc}${rect.width}${sep}height${colon}${spc}${rect.height}`;
  if(inner) return props;
  return `{${sep}${props}${sep}}`;
};

Rect.bind = (...args) => {
  const [o, p, gen = k => v => (v === undefined ? o[k] : (o[k] = v))] =
    args[0] instanceof Rect ? [new Rect(), ...args] : args;

  const [x, y, width, height] = p || ['x', 'y', 'width', 'height'];
  let pt = Point.bind(o, ['x', 'y'], gen);
  let sz = Size.bind(o, ['width', 'height'], gen);
  let proxy = new Rect(pt, sz);
  return proxy;
};

Rect.scale = Util.curry((rect, sx, sy) => Matrix.scale(sx, sy).transform_rect(rect));
Rect.resize = Util.curry((rect, width, height) => {
  rect.width = width;
  rect.height = height;
  return rect;
});
Rect.translate = Util.curry((rect, x, y) => Matrix.translate(f, f).transform_rect(rect));

for(let f of ['scale', 'resize', 'translate']) {
  Rect.prototype[f] = function(...args) {
    Rect[f](this, ...args);
    return this;
  };
}

Util.defineInspect(Rect.prototype, 'x', 'y', 'width', 'height');

export const isRect = (rect, testFn = (prop, name, obj) => name in obj) =>
  Util.isObject(rect) && ['x', 'y', 'width', 'height'].every(n => testFn(rect[n], n, rect));

Util.defineGetter(Rect, Symbol.species, function() {
  return this;
});

export const ImmutableRect = Util.immutableClass(Rect);

delete ImmutableRect[Symbol.species];

Util.defineGetter(ImmutableRect, Symbol.species, () => ImmutableRect);

Rect.prototype.toString = function(opts = {}) {
  if(typeof opts == 'string') opts = { separator: opts };
  const { precision = 0.001, unit = '', separator = ' ', left = '', right = '' } = opts;
  let { x, y, width, height } = this;
  let props = [x, y, width, height];
  return left + props.map(p => p + unit).join(' ') + right;
};
