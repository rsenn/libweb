import { bindProperties, curry, defineGetter, immutableClass, inspectSymbol, isConstructor, isObject, matchAll, memoize, roundTo, weakDefine } from '../misc.js';
import { Align } from './align.js';
import { Line } from './line.js';
import { isPoint, Point } from './point.js';
import { Size } from './size.js';

export function Rect(arg) {
  let obj = this instanceof Rect ? this : {};
  let args = arg instanceof Array ? arg : [...arguments];
  let ret;

  if(typeof args[0] == 'number') arg = args;
  else if(isObject(args[0]) && args[0].length !== undefined) arg = args.shift();

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

Rect.fromString = str => {
  const matches = [...matchAll(/[-.\d]+/g, str)];
  return new Rect(...matches.map(m => +m[0]));
};
Rect.prototype[Symbol.toStringTag] = 'Rect';

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
    { x: rect.x, y: rect.y + rect.height },
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
  const c = t => t; //coloring(color);
  const { x, y, width, height } = this;
  return c.concat(c.text('new', 1, 31), c.text('Rect', 1, 33), `(${x},${y},${width},${height})`);
};

Object.defineProperty(Rect.prototype, 'x1', {
  get() {
    return this.x;
  },
  set(value) {
    const extend = this.x - value;
    this.width += extend;
    this.x = value;
  },
  enumerable: true,
});
Object.defineProperty(Rect.prototype, 'x2', {
  get() {
    return this.x + this.width;
  },
  set(value) {
    this.width = value - this.x;
  },
  enumerable: true,
});
Object.defineProperty(Rect.prototype, 'y1', {
  get() {
    return this.y;
  },
  set(value) {
    const extend = this.y - value;
    this.height += extend;
    this.y -= extend;
  },
});
Object.defineProperty(Rect.prototype, 'y2', {
  get() {
    return this.y + this.height;
  },
  set(value) {
    this.height = value - this.y;
  },
});
Object.defineProperty(Rect.prototype, 'area', {
  get() {
    return Rect.prototype.getArea.call(this);
  },
});
Object.defineProperty(Rect.prototype, 'upperLeft', {
  get() {
    return new Point(this.x, this.y);
  },
});
Object.defineProperty(Rect.prototype, 'lowerRight', {
  get() {
    return new Point(this.x2, this.y2);
  },
});

const getSize = memoize(rect =>
  bindProperties(new Size(0, 0), rect, ['width', 'height'], k => {
    // console.log('gen', { k });
    return v => {
      return v !== undefined ? (rect[k] = v) : rect[k];
    };
  }),
);

const getPoint = memoize(rect => bindProperties(new Point(0, 0), rect, ['x', 'y'], k => v => (v !== undefined ? (rect[k] = v) : rect[k])));

Object.defineProperty(Rect.prototype, 'center', {
  get() {
    return Rect.center(this);
  },
});
Rect.prototype.getSize = memoize;
Object.defineProperty(Rect.prototype, 'size', {
  get() {
    let ret = getSize(this);
    //console.log('getSize( ) =', ret);
    return ret;
  },
});
Object.defineProperty(Rect.prototype, 'point', {
  get() {
    let ret = getPoint(this);
    //console.log('getPoint( ) =', ret);
    return ret;
  },
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
Rect.prototype.quot = function(...args) {
  let r = this.clone();
  Point.prototype.div.call(r, ...args);
  Size.prototype.div.call(r, ...args);
  return r;
};
Rect.prototype.prod = function(...args) {
  let r = this.clone();
  Point.prototype.mul.call(r, ...args);
  Size.prototype.mul.call(r, ...args);
  return r;
};
Rect.prototype.outset = function(...a) {
  let [top, right, bottom, left] = a.length >= 4 ? a : a.length >= 2 ? [a[0], a[1], a[0], a[1]] : [a[0], a[0], a[0], a[0]];
  this.x -= left;
  this.y -= top;
  this.width += left + right;
  this.height += top + bottom;
  return this;
};
Rect.prototype.inset = function(...a) {
  let [top, right, bottom, left] = a.length >= 4 ? a : a.length >= 2 ? [a[0], a[1], a[0], a[1]] : [a[0], a[0], a[0], a[0]];
  if(left + right < this.width && top + bottom < this.height) {
    this.x += left;
    this.y += top;
    this.width -= left + right;
    this.height -= top + bottom;
  }
  return this;
};
Rect.prototype.inside = function(point) {
  return Rect.inside(this, point);
};
Rect.CONTAIN = 16;
Rect.COVER = 32;

Rect.prototype.fit = function(other, align = Align.CENTER | Align.MIDDLE | Rect.CONTAIN) {
  let size = [...other];
  size = new Size(...size.slice(size.length - 2));
  let factors = Size.prototype.fitFactors.call(this, size).sort((a, b) => a - b);
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
    ...Size.prototype.toCSS.call(this),
  };
};

Rect.prototype.toSVG = function(factory = (tagName, attributes, children) => ({ tagName, attributes, children }), attrs = { stroke: '#000', fill: 'none' }, parent = null, prec) {
  const { x, y, width, height } = this;
  return factory('rect', { ...attrs, x, y, width, height }, [], prec);
};

Rect.prototype.toTRBL = function() {
  return {
    top: this.y,
    right: this.x + this.width,
    bottom: this.y + this.height,
    left: this.x,
  };
};
Rect.prototype.toArray = function() {
  const { x, y, width, height } = this;
  return [x, y, width, height];
};
Rect.prototype.toPoints = function(...args) {
  let ctor = isConstructor(args[0])
    ? (() => {
        let arg = args.shift();
        return points => new arg(points);
      })()
    : points => Array.from(points);
  let num = typeof args[0] == 'number' ? args.shift() : 4;
  const { x, y, width, height } = this;
  let a = num == 2 ? [new Point(x, y), new Point(x + width, y + height)] : [new Point(x, y), new Point(x + width, y), new Point(x + width, y + height), new Point(x, y + height)];
  return ctor(a);
};
Rect.prototype.toLines = function(ctor = lines => Array.from(lines, points => new Line(...points))) {
  let [a, b, c, d] = Rect.prototype.toPoints.call(this);
  return ctor([
    [a, b],
    [b, c],
    [c, d],
    [d, a],
  ]);
};
Rect.prototype.align = function(align_to, a = 0) {
  const xdiff = (align_to.width || 0) - this.width;
  const ydiff = (align_to.height || 0) - this.height;
  let oldx = this.x;
  let oldy = this.y;

  switch (Align.horizontal(a)) {
    case Align.LEFT:
      this.x = align_to.x ?? 0;
      break;
    case Align.RIGHT:
      this.x = (align_to.x ?? 0) + xdiff;
      break;
    default:
      this.x = (align_to.x ?? 0) + xdiff / 2;
      break;
  }
  switch (Align.vertical(a)) {
    case Align.TOP:
      this.y = align_to.y ?? 0;
      break;
    case Align.BOTTOM:
      this.y = (align_to.y ?? 0) + ydiff;
      break;
    default:
      this.y = (align_to.y ?? 0) + ydiff / 2;
      break;
  }

  /*  this.tx = this.x - oldx;
  this.ty = this.y - oldy;*/
  return this;
};

Rect.prototype.roundTo = function(...args) {
  let ret = new Rect();
  for(let prop of ['x', 'y', 'width', 'height']) ret[prop] = roundTo(this[prop], ...args);
  return ret;
};

Rect.prototype.round = function(precision = 0.001, digits, type) {
  const { x1, y1, x2, y2 } = this;

  let a = new Point(x1, y1).round(precision, undefined, type ?? 'floor');
  let b = new Point(x2, y2).round(precision, undefined, type ?? 'ceil');

  this.x = a.x;
  this.y = a.y;
  this.width = b.x - a.x;
  this.height = b.y - a.y;

  if(digits !== undefined) {
    this.x = +this.x.toFixed(digits);
    this.y = +this.y.toFixed(digits);
    this.width = +this.width.toFixed(digits);
    this.height = +this.height.toFixed(digits);
  }

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
  if(isObject(m) && typeof m.toMatrix == 'function') m = m.toMatrix();
  m.transformRect(this);
  // if(round) Rect.prototype.round.call(this, 1e-13, 13);
  return this;
};

Rect.prototype[Symbol.iterator] = function* () {
  let { x, y, width, height } = this;
  for(let prop of [x, y, width, height]) yield prop;
};
Rect.prototype[inspectSymbol] = function(depth, options) {
  const { x, y, width, height } = this;
  return { x, y, width, height, [Symbol.toStringTag]: 'Rect' };
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

Rect.inside = (rect, point) => point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
Rect.from = function(obj) {
  if(isObject(obj) && 'getBoundingClientRect' in obj) return new Rect(obj.getBoundingClientRect());

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
  'equals',
]) {
  Rect[name] = (rect, ...args) => Rect.prototype[name].call(rect || new Rect(rect), ...args);
}

Rect.toSource = (rect, opts = {}) => {
  const { sep = ', ', inner = false, spc = ' ', colon = ':' } = opts;
  let props = `x${colon}${spc}${rect.x}${sep}y${colon}${spc}${rect.y}${sep}width${colon}${spc}${rect.width}${sep}height${colon}${spc}${rect.height}`;
  if(inner) return props;
  return `{${sep}${props}${sep}}`;
};

Rect.bind = (o, p, gen) => {
  o ??= new Rect();
  //gen ??= k => v => v === undefined ? o[k] : (o[k] = v);
  p ??= ['x', 'y', 'width', 'height'];
  const [x, y, width, height] = p;
  Point.bind(o, [x, y], gen);
  Size.bind(o, [width, height], gen);
  return o;
  let proxy = new Rect(pt, sz);
  return proxy;
};

Rect.scale = curry((rect, sx, sy) => Matrix.scale(sx, sy).transformRect(rect));
Rect.resize = curry((rect, width, height) => {
  rect.width = width;
  rect.height = height;
  return rect;
});
Rect.translate = curry((rect, x, y) => Matrix.translate(f, f).transformRect(rect));

for(let f of ['scale', 'resize', 'translate']) {
  Rect.prototype[f] = function(...args) {
    Rect[f](this, ...args);
    return this;
  };
}

weakDefine(Rect.prototype, Size.prototype, Point.prototype);

export const isRect = (rect, testFn = (prop, name, obj) => name in obj) => isObject(rect) && ['x', 'y', 'width', 'height'].every(n => testFn(rect[n], n, rect));

defineGetter(Rect, Symbol.species, function() {
  return this;
});

export const ImmutableRect = immutableClass(Rect);

delete ImmutableRect[Symbol.species];

defineGetter(ImmutableRect, Symbol.species, () => ImmutableRect);

Rect.prototype.toString = function(opts = {}) {
  if(typeof opts == 'string') opts = { separator: opts };
  const { precision = 0.001, unit = '', separator = ' ', left = '', right = '' } = opts;
  let { x, y, width, height } = this;
  let props = [x, y, width, height];
  return left + props.map(p => p + unit).join(' ') + right;
};
