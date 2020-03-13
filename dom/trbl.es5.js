"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.TRBL = TRBL;

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _rect.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js = require("./rect.js");

var _this = void 0;

/**
 * Type for TopRightBottomLeft (paddings and margins)
 *
 * @param {string,object,array} arg [description]
 */
function TRBL(arg) {
  var ret = this instanceof TRBL ? this : {};
  var args = Array.prototype.slice.call(arguments);

  if (typeof arg === "object") {
    (0, _keys["default"])(arg).forEach(function (k) {
      var matches = /(top|right|bottom|left)/i.exec(k);
      ret[matches[0].toLowerCase()] = (0, _parseInt2["default"])(arg[k]);
    });
  } else if (arg) {
    if (args.length > 1) arg = args;
    if (typeof arg === "string") arg = (0, _toConsumableArray2["default"])(arg.matchAll(/^[0-9.]+(|px|em|rem|pt|cm|mm)$/g));else if (arg.length == 4) arg = arg.map(function (v) {
      return (0, _parseInt2["default"])(v);
    });
    ret.top = arg[0];
    ret.right = arg[1];
    ret.bottom = arg[2];
    ret.left = arg[3];
  }

  if (isNaN(ret.top)) ret.top = 0;
  if (isNaN(ret.right)) ret.right = 0;
  if (isNaN(ret.bottom)) ret.bottom = 0;
  if (isNaN(ret.left)) ret.left = 0;
  /*   ['toString','toSource'].forEach((name) =>
    Object.defineProperty(ret, name, { enumerable: true, value: TRBL.prototype[name] })
  ); */
  //console.log('ret: ', ret);

  if (!this || this === TRBL) return (0, _assign["default"])(ret, TRBL.prototype);
}

TRBL.prototype["null"] = function () {
  return this.top == 0 && this.right == 0 && this.bottom == 0 && this.left == 0;
};

TRBL["null"] = function (trbl) {
  return TRBL.prototype["null"].call(trbl);
};

TRBL.neg = function () {
  var trbl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this;
  return {
    top: -trbl.top,
    right: -trbl.right,
    bottom: -trbl.bottom,
    left: -trbl.left
  };
};

TRBL.prototype.isNaN = function () {
  return isNaN(this.top) || isNaN(this.right) || isNaN(this.bottom) || isNaN(this.left);
};

(0, _defineProperty["default"])(TRBL.prototype, "inset", {
  get: function get() {
    var _this2 = this;

    return function (rect) {
      return _rect.Rect.inset(rect, _this2);
    };
  }
});
(0, _defineProperty["default"])(TRBL.prototype, "outset", {
  get: function get() {
    var _this3 = this;

    return function (rect) {
      return _rect.Rect.outset(rect, _this3);
    };
  }
});
/*TRBL.prototype.outset = function() {
  return this.inset.call(TRBL.neg(this));
};*/

TRBL.prototype.add = function (other) {
  this.top += other.top;
  this.right += other.right;
  this.bottom += other.bottom;
  this.left += other.left;
};

TRBL.prototype.union = function (other) {
  this.top = other.top < this.top ? other.top : this.top;
  this.right = other.right > this.right ? other.right : this.right;
  this.bottom = other.bottom > this.bottom ? other.bottom : this.bottom;
  this.left = other.left < this.left ? other.left : this.left;
};

TRBL.prototype.toRect = function () {
  return new _rect.Rect({
    x: this.left,
    y: this.top,
    width: this.right - this.left,
    height: this.bottom - this.top
  });
};

TRBL.union = function (trbl, other) {
  return {
    top: other.top < trbl.top ? other.top : trbl.top,
    right: other.right > trbl.right ? other.right : trbl.right,
    bottom: other.bottom > trbl.bottom ? other.bottom : trbl.bottom,
    left: other.left < trbl.left ? other.left : trbl.left
  };
};

TRBL.toRect = function (trbl) {
  return new _rect.Rect(trbl.left, trbl.top, trbl.right - trbl.left, trbl.bottom - trbl.top);
};

TRBL.prototype.toString = function () {
  var unit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "px";
  return "" + this.top + "" + unit + " " + this.right + "" + unit + " " + this.bottom + "" + unit + " " + this.left + unit;
};

TRBL.prototype.toSource = function () {
  return "{top:" + this.top + ",right:" + this.right + ",bottom:" + this.bottom + ",left:" + this.left + "}";
};
