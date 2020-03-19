"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TRBL = TRBL;

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

var _rect = require("./rect.es5.js");

function TRBL(arg) {
  let ret = this instanceof TRBL ? this : {};
  let args = [...arguments];

  if(typeof arg === "object") {
    Object.keys(arg).forEach(k => {
      const matches = /(top|right|bottom|left)/i.exec(k);
      ret[matches[0].toLowerCase()] = parseInt(arg[k]);
    });
  } else if(arg) {
    if(args.length > 1) arg = args;
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
  if(!this || this === TRBL) return Object.assign(ret, TRBL.prototype);
}

TRBL.prototype.null = function() {
  return this.top == 0 && this.right == 0 && this.bottom == 0 && this.left == 0;
};

TRBL.null = trbl => TRBL.prototype.null.call(trbl);

TRBL.neg = (trbl = void 0) => ({
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
    return rect => _rect.Rect.inset(rect, this);
  }
});
Object.defineProperty(TRBL.prototype, "outset", {
  get() {
    return rect => _rect.Rect.outset(rect, this);
  }
});

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
  return new _rect.Rect({
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

TRBL.toRect = trbl => new _rect.Rect(trbl.left, trbl.top, trbl.right - trbl.left, trbl.bottom - trbl.top);

TRBL.prototype.toString = function(unit = "px") {
  return "" + this.top + "" + unit + " " + this.right + "" + unit + " " + this.bottom + "" + unit + " " + this.left + unit;
};

TRBL.prototype.toSource = function() {
  return "{top:" + this.top + ",right:" + this.right + ",bottom:" + this.bottom + ",left:" + this.left + "}";
};

for(var _i = 0, _arr = ["null", "isNaN", "outset", "toRect", "toSource"]; _i < _arr.length; _i++) {
  let name = _arr[_i];

  TRBL[name] = points => TRBL.prototype[name].call(points);
}
