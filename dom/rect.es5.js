"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.Rect = Rect;
exports.isRect = void 0;

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _parseFloat2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-float"));

var _point = require("./point.es5.js");

var _pointList = require("./pointList.es5.js");

var _size = require("./size.es5.js");

function ownKeys(object, enumerableOnly) {
  var keys = (0, _keys["default"])(object);
  if(_getOwnPropertySymbols["default"]) {
    var symbols = (0, _getOwnPropertySymbols["default"])(object);
    if(enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for(var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if(i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        (0, _defineProperty2["default"])(target, key, source[key]);
      });
    } else if(_getOwnPropertyDescriptors["default"]) {
      (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        (0, _defineProperty3["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key));
      });
    }
  }
  return target;
}

function Rect(arg) {
  var obj = this instanceof Rect ? this : {};
  var args = arg instanceof Array ? arg : Array.prototype.slice.call(arguments);
  var ret;
  if(typeof args[0] == "number") arg = args;
  else if(args[0].length !== undefined) arg = args.shift();
  ["x", "y", "width", "height"].forEach(function(field) {
    if(typeof obj[field] != "number") obj[field] = 0;
  });

  if(arg && arg.x1 !== undefined && arg.y1 !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    var _arg = arg,
      x1 = _arg.x1,
      y1 = _arg.y1,
      x2 = _arg.x2,
      y2 = _arg.y2;
    obj.x = x1;
    obj.y = y1;
    obj.width = x2 - x1;
    obj.height = y2 - y1;
    ret = 1;
  } else if(arg && arg.x !== undefined && arg.y !== undefined && arg.x2 !== undefined && arg.y2 !== undefined) {
    var _arg2 = arg,
      _x = _arg2.x,
      _y = _arg2.y,
      _x2 = _arg2.x2,
      _y2 = _arg2.y2;
    obj.x = _x;
    obj.y = _y;
    obj.width = _x2 - _x;
    obj.height = _y2 - _y;
    ret = 1;
  } else if((0, _point.isPoint)(arg) && arg.y !== undefined && arg.width !== undefined && arg.height !== undefined) {
    obj.x = (0, _parseFloat2["default"])(arg.x);
    obj.y = (0, _parseFloat2["default"])(arg.y);
    obj.width = (0, _parseFloat2["default"])(arg.width);
    obj.height = (0, _parseFloat2["default"])(arg.height);
    ret = 1;
  } else if(
    arg &&
    arg.length >= 4 &&
    arg.slice(0, 4).every(function(arg) {
      return !isNaN((0, _parseFloat2["default"])(arg));
    })
  ) {
    var _x3 = arg.shift();

    var _y3 = arg.shift();

    var w = arg.shift();
    var h = arg.shift();
    obj.x = typeof _x3 === "number" ? _x3 : (0, _parseFloat2["default"])(_x3);
    obj.y = typeof _y3 === "number" ? _y3 : (0, _parseFloat2["default"])(_y3);
    obj.width = typeof w === "number" ? w : (0, _parseFloat2["default"])(w);
    obj.height = typeof h === "number" ? h : (0, _parseFloat2["default"])(h);
    ret = 4;
  } else if(
    arg &&
    arg.length >= 2 &&
    arg.slice(0, 2).every(function(arg) {
      return !isNaN((0, _parseFloat2["default"])(arg));
    })
  ) {
    obj.width = typeof x === "number" ? x : (0, _parseFloat2["default"])(x);
    obj.height = typeof y === "number" ? y : (0, _parseFloat2["default"])(y);
    ret = 2;
  } else if(arg instanceof Array) {
    var argc;
    var argi = 0;

    if(arg.length >= 4) {
      argc = typeof x == "number" ? 2 : 1;

      _point.Point.apply(obj, arg.slice(0, argc));

      argi = argc;
    }

    argc = typeof arg[argi] == "number" ? 2 : 1;

    _size.Size.apply(obj, arg.slice(argi, argc));

    ret = argi + argc;
  }

  if(obj.round === undefined) {
    (0, _defineProperty3["default"])(obj, "round", {
      value: function value() {
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

Rect.prototype = _objectSpread({}, _point.Point.prototype, {}, _size.Size.prototype, {}, Rect.prototype);

Rect.prototype.clone = function() {
  return new Rect(this.x, this.y, this.width, this.height);
};

Rect.prototype.corners = function() {
  var rect = this;
  return [
    {
      x: rect.x,
      y: rect.y
    },
    {
      x: rect.x + rect.width,
      y: rect.y
    },
    {
      x: rect.x + rect.width,
      y: rect.y + rect.height
    },
    {
      x: rect.x,
      y: rect.y + rect.height
    }
  ];
};

if (Rect.prototype.isSquare === undefined) {
  Rect.prototype.isSquare = function() {
    return Math.abs(this.width - this.height) < 1;
  };
}

Rect.prototype.constructor = Rect;

Rect.prototype.getArea = function() {
  return this.width * this.height;
};

Rect.prototype.toString = function() {
  return (this.x + "").padStart(4, " ") + "," + (this.y + "").padEnd(4, " ") + " " + (this.width + "").padStart(4, " ") + "x" + (this.height + "").padEnd(4, " ");
};

Rect.prototype.toSource = function() {
  return "new Rect(" + (this ? this.x + "," + this.y + "," + this.width + "," + this.height : "") + ")";
};

(0, _defineProperty3["default"])(Rect.prototype, "x1", {
  get: function get() {
    return this.x;
  },
  set: function set(value) {
    var extend = this.x - value;
    this.width += extend;
    this.x -= extend;
  },
  enumerable: true
});
(0, _defineProperty3["default"])(Rect.prototype, "x2", {
  get: function get() {
    return this.x + this.width;
  },
  set: function set(value) {
    this.width = value - this.x;
  },
  enumerable: true
});
(0, _defineProperty3["default"])(Rect.prototype, "y1", {
  get: function get() {
    return this.y;
  },
  set: function set(value) {
    var extend = this.y - value;
    this.height += extend;
    this.y -= extend;
  }
});
(0, _defineProperty3["default"])(Rect.prototype, "y2", {
  get: function get() {
    return this.y + this.height;
  },
  set: function set(value) {
    this.height = value - this.y;
  }
});
(0, _defineProperty3["default"])(Rect.prototype, "area", {
  get: function get() {
    return Rect.prototype.getArea.call(this);
  }
});
(0, _defineProperty3["default"])(Rect.prototype, "center", {
  get: function get() {
    return Rect.center(this);
  }
});

Rect.prototype.points = function() {
  var c = this.corners();
  return new _pointList.PointList(c);
};

Rect.prototype.toCSS = Rect.toCSS;

Rect.prototype.outset = function(trbl) {
  if(typeof trbl == "number") trbl = new TRBL(trbl, trbl, trbl, trbl);
  this.x -= trbl.left;
  this.y -= trbl.top;
  this.width += trbl.left + trbl.right;
  this.height += trbl.top + trbl.bottom;
  return this;
};

Rect.prototype.inset = function(trbl) {
  if(typeof trbl == "number") trbl = new TRBL(trbl, trbl, trbl, trbl);

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
  _point.Point.prototype.sub.call(point, this.center);

  point.x /= this.width;
  point.y /= this.height;
  return point;
};

Rect.prototype.toCSS = function() {
  return _objectSpread({}, _point.Point.prototype.toCSS.call(this), {}, _size.Size.prototype.toCSS.call(this));
};

Rect.prototype.toPoints = function() {
  var list = new _pointList.PointList();
  list.push(new _point.Point(this.x, this.y));
  list.push(new _point.Point(this.x, this.y2));
  list.push(new _point.Point(this.x2, this.y2));
  list.push(new _point.Point(this.x2, this.y));
  return list;
};

Rect.prototype.align = function(align_to) {
  var a = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var xdiff = align_to.width - this.width;
  var ydiff = align_to.height - this.height;
  var oldx = this.x;
  var oldy = this.y;

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

  this.tx = this.x - oldx;
  this.ty = this.y - oldy;
  return this;
};

Rect.prototype.round = function() {
  var precision = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var x = this.x,
    y = this.y,
    x2 = this.x2,
    y2 = this.y2;
  this.x = +x.toFixed(precision);
  this.y = +y.toFixed(precision);
  this.width = +x2.toFixed(precision) - this.x;
  this.height = +y2.toFixed(precision) - this.y;
  return this;
};

Rect.round = function(rect) {
  return Rect.prototype.round.call(rect);
};

Rect.align = function(rect, align_to) {
  var a = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  return Rect.prototype.align.call(rect, align_to, a);
};

Rect.toCSS = function(rect) {
  return Rect.prototype.toCSS.call(rect);
};

Rect.center = function(rect) {
  return new _point.Point(rect.x + rect.width / 2, rect.y + rect.height / 2);
};

Rect.inset = function(rect, trbl) {
  return Rect.prototype.inset.call(rect, trbl);
};

Rect.outset = function(rect, trbl) {
  return Rect.prototype.outset.call(rect, trbl);
};

var isRect = function isRect(rect) {
  return (0, _point.isPoint)(rect) && (0, _size.isSize)(rect);
};

exports.isRect = isRect;