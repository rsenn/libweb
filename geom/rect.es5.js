"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Rect = Rect;
exports.isRect = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.string.sub");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _point = require("./point.es5.js");

var _pointList = require("./pointList.es5.js");

var _size = require("./size.es5.js");

var _align = require("./align.es5.js");

var _trbl = require("./trbl.es5.js");

var _util = require("../util.es5.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function Rect(arg) {
  let obj = this instanceof Rect ? this : {};
  let args = arg instanceof Array ? arg : [...arguments];
  let ret;
  if (typeof args[0] == 'number') arg = args;else if (args[0].length !== undefined) arg = args.shift();
  ['x', 'y', 'width', 'height'].forEach(field => {
    if (typeof obj[field] != 'number') obj[field] = 0;
  });

  if (arg && arg.x1 !== undefined && arg.y1 !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    const _arg = arg,
          x1 = _arg.x1,
          y1 = _arg.y1,
          x2 = _arg.x2,
          y2 = _arg.y2;
    obj.x = x1;
    obj.y = y1;
    obj.width = x2 - x1;
    obj.height = y2 - y1;
    ret = 1;
  } else if (arg && arg.x !== undefined && arg.y !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    const _arg2 = arg,
          x = _arg2.x,
          y = _arg2.y,
          x2 = _arg2.x2,
          y2 = _arg2.y2;
    obj.x = x;
    obj.y = y;
    obj.width = x2 - x;
    obj.height = y2 - y;
    ret = 1;
  } else if ((0, _point.isPoint)(arg) && arg.y !== undefined && arg.width !== undefined && arg.height !== undefined) {
    obj.x = parseFloat(arg.x);
    obj.y = parseFloat(arg.y);
    obj.width = parseFloat(arg.width);
    obj.height = parseFloat(arg.height);
    ret = 1;
  } else if (arg && arg.length >= 4 && arg.slice(0, 4).every(arg => !isNaN(parseFloat(arg)))) {
    let x = arg.shift();
    let y = arg.shift();
    let w = arg.shift();
    let h = arg.shift();
    obj.x = typeof x === 'number' ? x : parseFloat(x);
    obj.y = typeof y === 'number' ? y : parseFloat(y);
    obj.width = typeof w === 'number' ? w : parseFloat(w);
    obj.height = typeof h === 'number' ? h : parseFloat(h);
    ret = 4;
  } else if (arg && arg.length >= 2 && arg.slice(0, 2).every(arg => !isNaN(parseFloat(arg)))) {
    obj.x = 0;
    obj.y = 0;
    obj.width = typeof arg[0] === 'number' ? arg[0] : parseFloat(arg[0]);
    obj.height = typeof arg[1] === 'number' ? arg[1] : parseFloat(arg[1]);
    ret = 2;
  } else if (arg instanceof Array) {
    let argc;
    let argi = 0;

    if (arg.length >= 4) {
      argc = typeof x == 'number' ? 2 : 1;

      _point.Point.apply(obj, arg.slice(0, argc));

      argi = argc;
    }

    argc = typeof arg[argi] == 'number' ? 2 : 1;

    _size.Size.apply(obj, arg.slice(argi, argc));

    ret = argi + argc;
  }

  if (obj.round === undefined) {
    Object.defineProperty(obj, 'round', {
      value: function value() {
        return Rect.round(this);
      },
      enumerable: true,
      writable: false
    });
  }

  if (!(this instanceof Rect)) {
    return obj;
    return ret;
  }
}

Rect.prototype = _objectSpread({}, _point.Point.prototype, {}, _size.Size.prototype, {}, Rect.prototype);

Rect.prototype.clone = function () {
  return new Rect(this.x, this.y, this.width, this.height);
};

Rect.prototype.corners = function () {
  const rect = this;
  return [{
    x: rect.x,
    y: rect.y
  }, {
    x: rect.x + rect.width,
    y: rect.y
  }, {
    x: rect.x + rect.width,
    y: rect.y + rect.height
  }, {
    x: rect.x,
    y: rect.y + rect.height
  }];
};

if (Rect.prototype.isSquare === undefined) {
  Rect.prototype.isSquare = function () {
    return Math.abs(this.width - this.height) < 1;
  };
}

Rect.prototype.constructor = Rect;

Rect.prototype.getArea = function () {
  return this.width * this.height;
};

Rect.prototype.toString = function (prec = 0.000001, sep = ' ') {
  return "".concat(_util.Util.roundTo(this.x, prec)).concat(sep).concat(_util.Util.roundTo(this.y, prec)).concat(sep).concat(_util.Util.roundTo(this.width, prec)).concat(sep).concat(_util.Util.roundTo(this.height, prec));
};

Rect.prototype.toSource = function (opts = {}) {
  const _opts$color = opts.color,
        color = _opts$color === void 0 ? true : _opts$color;

  const c = _util.Util.color(color);

  const x = this.x,
        y = this.y,
        width = this.width,
        height = this.height;
  return "".concat(c.text('new', 1, 31), " ").concat(c.text('Rect', 1, 33), "(").concat(x, ",").concat(y, ",").concat(width, ",").concat(height, ")");
};

Object.defineProperty(Rect.prototype, 'x1', {
  get: function get() {
    return this.x;
  },
  set: function set(value) {
    const extend = this.x - value;
    this.width += extend;
    this.x -= extend;
  },
  enumerable: true
});
Object.defineProperty(Rect.prototype, 'x2', {
  get: function get() {
    return this.x + this.width;
  },
  set: function set(value) {
    this.width = value - this.x;
  },
  enumerable: true
});
Object.defineProperty(Rect.prototype, 'y1', {
  get: function get() {
    return this.y;
  },
  set: function set(value) {
    const extend = this.y - value;
    this.height += extend;
    this.y -= extend;
  }
});
Object.defineProperty(Rect.prototype, 'y2', {
  get: function get() {
    return this.y + this.height;
  },
  set: function set(value) {
    this.height = value - this.y;
  }
});
Object.defineProperty(Rect.prototype, 'area', {
  get: function get() {
    return Rect.prototype.getArea.call(this);
  }
});
Object.defineProperty(Rect.prototype, 'center', {
  get: function get() {
    return Rect.center(this);
  }
});
Object.defineProperty(Rect.prototype, 'size', {
  get: function get() {
    const rect = this;
    const size = new _size.Size(rect.width, rect.height);
    Object.defineProperties(size, {
      width: {
        get() {
          return rect.width;
        },

        set(value) {
          return rect.width = +value;
        },

        enumerable: true
      },
      height: {
        get() {
          return rect.height;
        },

        set(value) {
          return rect.height = +value;
        },

        enumerable: true
      }
    });
    return size;
  }
});

Rect.prototype.points = function () {
  const c = this.corners();
  return new _pointList.PointList(c);
};

Rect.prototype.toCSS = Rect.toCSS;

Rect.prototype.outset = function (trbl) {
  if (typeof trbl == 'number') trbl = {
    top: trbl,
    right: trbl,
    bottom: trbl,
    left: trbl
  };
  this.x -= trbl.left;
  this.y -= trbl.top;
  this.width += trbl.left + trbl.right;
  this.height += trbl.top + trbl.bottom;
  return this;
};

Rect.prototype.inset = function (trbl) {
  if (typeof trbl == 'number') trbl = new _trbl.TRBL(trbl, trbl, trbl, trbl);

  if (trbl.left + trbl.right < this.width && trbl.top + trbl.bottom < this.height) {
    this.x += trbl.left;
    this.y += trbl.top;
    this.width -= trbl.left + trbl.right;
    this.height -= trbl.top + trbl.bottom;
  }

  return this;
};

Rect.prototype.inside = function (point) {
  return Rect.inside(this, point);
};

Rect.prototype.pointFromCenter = function (point) {
  _point.Point.prototype.sub.call(point, this.center);

  point.x /= this.width;
  point.y /= this.height;
  return point;
};

Rect.prototype.toCSS = function () {
  return _objectSpread({}, _point.Point.prototype.toCSS.call(this), {}, _size.Size.prototype.toCSS.call(this));
};

Rect.prototype.toTRBL = function () {
  return {
    top: this.y,
    right: this.x + this.width,
    bottom: this.y + this.height,
    left: this.x
  };
};

Rect.prototype.toPoints = function () {
  const { x, y, width, height } = this;
  var list = new _pointList.PointList();
  list.push(new _point.Point(x, y));
  list.push(new _point.Point(x, this+height));
  list.push(new _point.Point(x+width, y+height));
  list.push(new _point.Point(x+width, y));
  return list;
};

Rect.prototype.align = function (align_to, a = 0) {
  const xdiff = (align_to.width || 0) - this.width;
  const ydiff = (align_to.height || 0) - this.height;
  let oldx = this.x;
  let oldy = this.y;

  switch (_align.Align.horizontal(a)) {
    case _align.Align.LEFT:
      this.x = align_to.x;
      break;

    case _align.Align.RIGHT:
      this.x = align_to.x + xdiff;
      break;

    default:
      this.x = align_to.x + xdiff / 2;
      break;
  }

  switch (_align.Align.vertical(a)) {
    case _align.Align.TOP:
      this.y = align_to.y;
      break;

    case _align.Align.BOTTOM:
      this.y = align_to.y + ydiff;
      break;

    default:
      this.y = align_to.y + ydiff / 2;
      break;
  }

  return this;
};

Rect.prototype.round = function (precision = 0.001) {
  let x = this.x,
      y = this.y,
      x2 = this.x2,
      y2 = this.y2;
  this.x = _util.Util.roundTo(x, precision);
  this.y = _util.Util.roundTo(y, precision);
  this.width = _util.Util.roundTo(x2 - this.x, precision);
  this.height = _util.Util.roundTo(y2 - this.y, precision);
  return this;
};

Rect.prototype.toObject = function (bb = false) {
  if (bb) {
    const x1 = this.x1,
          y1 = this.y1,
          x2 = this.x2,
          y2 = this.y2;
    return {
      x1,
      y1,
      x2,
      y2
    };
  }

  const x = this.x,
        y = this.y,
        width = this.width,
        height = this.height;
  return {
    x,
    y,
    width,
    height
  };
};

Rect.round = rect => Rect.prototype.round.call(rect);

Rect.align = (rect, align_to, a = 0) => Rect.prototype.align.call(rect, align_to, a);

Rect.toCSS = rect => Rect.prototype.toCSS.call(rect);

Rect.inset = (rect, trbl) => Rect.prototype.inset.call(rect, trbl);

Rect.outset = (rect, trbl) => Rect.prototype.outset.call(rect, trbl);

Rect.center = rect => new _point.Point(rect.x + rect.width / 2, rect.y + rect.height / 2);

Rect.inside = (rect, point) => {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
};

for (var _i = 0, _arr = ['clone', 'corners', 'isSquare', 'getArea', 'toString', 'points', 'toCSS', 'toTRBL', 'toPoints']; _i < _arr.length; _i++) {
  let name = _arr[_i];

  Rect[name] = points => Rect.prototype[name].call(points);
}

Rect.toSource = (rect, opts = {}) => {
  const _opts$sep = opts.sep,
        sep = _opts$sep === void 0 ? ', ' : _opts$sep,
        _opts$inner = opts.inner,
        inner = _opts$inner === void 0 ? false : _opts$inner,
        _opts$spc = opts.spc,
        spc = _opts$spc === void 0 ? ' ' : _opts$spc,
        _opts$colon = opts.colon,
        colon = _opts$colon === void 0 ? ':' : _opts$colon;
  let props = "x".concat(colon).concat(spc).concat(rect.x).concat(sep, "y").concat(colon).concat(spc).concat(rect.y).concat(sep, "width").concat(colon).concat(spc).concat(rect.width).concat(sep, "height").concat(colon).concat(spc).concat(rect.height);
  if (inner) return props;
  return "{".concat(sep).concat(props).concat(sep, "}");
};

_util.Util.defineInspect(Rect.prototype, 'x', 'y', 'width', 'height');

const isRect = rect => (0, _point.isPoint)(rect) && (0, _size.isSize)(rect);

exports.isRect = isRect;
