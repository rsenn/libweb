import { Point, isPoint } from './point.js';
import { PointList } from './pointList.js';
import { Size, isSize } from './size.js';
import { Align, Anchor } from './align.js';
import { TRBL, isTRBL } from './trbl.js';
import { Util } from '../util.js';

export function Rect(arg) {
  let obj = this instanceof Rect ? this : {};
  let args = arg instanceof Array ? arg : [...arguments];
  let ret;
  if(typeof args[0] == 'number') arg = args;
  else if(args[0].length !== undefined) arg = args.shift();
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
  if(obj.round === undefined) {
    Object.defineProperty(obj, 'round', {
      value: function() {
        return Rect.round(this);
      },
      enumerable: true,
      writable: false
    });
  }
  if(!(this instanceof Rect)) {
    return obj;
    return ret;
  }
}
Rect.prototype = {
  /*...Point.prototype,
  ...Size.prototype,*/
  ...Rect.prototype
};
Rect.prototype.clone = function() {
  return new Rect(this.x, this.y, this.width, this.height);
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
Rect.prototype.toString = function(prec = 0.000001, sep = ' ') {
  return `${Util.roundTo(this.x, prec)}${sep}${Util.roundTo(this.y, prec)}${sep}${Util.roundTo(this.width, prec)}${sep}${Util.roundTo(this.height, prec)}`;
};
Rect.prototype.toSource = function(opts = {}) {
  const { color = true } = opts;
  const c = Util.color(color);
  const { x, y, width, height } = this;
  return `${c.text('new', 1, 31)} ${c.text('Rect', 1, 33)}(${x},${y},${width},${height})`;
};
Object.defineProperty(Rect.prototype, 'x1', {
  get: function() {
    return this.x;
  },
  set: function(value) {
    const extend = this.x - value;
    this.width += extend;
    this.x -= extend;
  },
  enumerable: true
});
Object.defineProperty(Rect.prototype, 'x2', {
  get: function() {
    return this.x + this.width;
  },
  set: function(value) {
    this.width = value - this.x;
  },
  enumerable: true
});
Object.defineProperty(Rect.prototype, 'y1', {
  get: function() {
    return this.y;
  },
  set: function(value) {
    const extend = this.y - value;
    this.height += extend;
    this.y -= extend;
  }
});
Object.defineProperty(Rect.prototype, 'y2', {
  get: function() {
    return this.y + this.height;
  },
  set: function(value) {
    this.height = value - this.y;
  }
});
Object.defineProperty(Rect.prototype, 'area', {
  get: function() {
    return Rect.prototype.getArea.call(this);
  }
});
Object.defineProperty(Rect.prototype, 'center', {
  get: function() {
    return Rect.center(this);
  }
});
Object.defineProperty(Rect.prototype, 'size', {
  get: function() {
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
});
Rect.prototype.points = function() {
  const c = this.corners();
  return new PointList(c);
};
Rect.prototype.toCSS = Rect.toCSS;
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
Rect.prototype.toPoints = function() {
  const { x, y, width, height } = this;
  var list = new PointList();
  list.push(new Point(x, y));
  list.push(new Point(x, y + height));
  list.push(new Point(x + width, y + height));
  list.push(new Point(x + width, y));
  return list;
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
    default:
      this.x = align_to.x + xdiff / 2;
      break;
  }
  switch (Align.vertical(a)) {
    case Align.TOP:
      this.y = align_to.y;
      break;
    case Align.BOTTOM:
      this.y = align_to.y + ydiff;
      break;
    default:
      this.y = align_to.y + ydiff / 2;
      break;
  }
  /*  this.tx = this.x - oldx;
  this.ty = this.y - oldy;*/
  return this;
};

Rect.prototype.round = function(precision = 0.001) {
  let { x, y, x2, y2 } = this;
  this.x = Util.roundTo(x, precision);
  this.y = Util.roundTo(y, precision);
  this.width = Util.roundTo(x2 - this.x, precision);
  this.height = Util.roundTo(y2 - this.y, precision);
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

Rect.round = rect => Rect.prototype.round.call(rect);
Rect.align = (rect, align_to, a = 0) => Rect.prototype.align.call(rect, align_to, a);
Rect.toCSS = rect => Rect.prototype.toCSS.call(rect);
Rect.inset = (rect, trbl) => Rect.prototype.inset.call(rect, trbl);
Rect.outset = (rect, trbl) => Rect.prototype.outset.call(rect, trbl);

Rect.center = rect => new Point(rect.x + rect.width / 2, rect.y + rect.height / 2);
Rect.bind = rect => {
  let obj = new Rect();
};

Rect.inside = (rect, point) => {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
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
  'toString',
  // 'toSource',
  'points',
  'toCSS',
  'toTRBL',
  'toPoints'
]) {
  Rect[name] = points => Rect.prototype[name].call(points);
}

Rect.toSource = (rect, opts = {}) => {
  const { sep = ', ', inner = false, spc = ' ', colon = ':' } = opts;
  let props = `x${colon}${spc}${rect.x}${sep}y${colon}${spc}${rect.y}${sep}width${colon}${spc}${rect.width}${sep}height${colon}${spc}${rect.height}`;
  if(inner) return props;
  return `{${sep}${props}${sep}}`;
};

Rect.bind = (o, p, gen) => {
  const [x, y, width, height] = p || ['x', 'y', 'width', 'height'];
  if(!gen) gen = k => v => (v === undefined ? o[k] : (o[k] = v));
  let pt = Point.bind(o, [x, y], gen);
  let sz = Size.bind(o, [width, height], gen);
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

export const isRect = rect => isPoint(rect) && isSize(rect);
