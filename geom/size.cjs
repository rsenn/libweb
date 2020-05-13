"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Size = Size;
exports.isSize = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es6.string.sub");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.regexp.replace");

var _util = require("../util.cjs");

function Size(arg) {
  let obj = this instanceof Size ? this : {};
  let args = [...arguments];

  if (args.length == 1 && args[0].length !== undefined) {
    args = args[0];
    arg = args[0];
  }

  if (typeof arg == "object") {
    if (arg.width !== undefined || arg.height !== undefined) {
      arg = args.shift();
      obj.width = arg.width;
      obj.height = arg.height;
    } else if (arg.x2 !== undefined && arg.y2 !== undefined) {
      arg = args.shift();
      obj.width = arg.x2 - arg.x;
      obj.height = arg.y2 - arg.y;
    } else if (arg.bottom !== undefined && arg.right !== undefined) {
      arg = args.shift();
      obj.width = arg.right - arg.left;
      obj.height = arg.bottom - arg.top;
    }
  } else {
    while (typeof arg == "object" && (arg instanceof Array || "length" in arg)) {
      args = [...arg];
      arg = args[0];
    }

    if (args && args.length >= 2) {
      let w = args.shift();
      let h = args.shift();
      if (typeof w == "object" && "baseVal" in w) w = w.baseVal.value;
      if (typeof h == "object" && "baseVal" in h) h = h.baseVal.value;
      obj.width = typeof w == "number" ? w : parseFloat(w.replace(/[^-.0-9]*$/, ""));
      obj.height = typeof h == "number" ? h : parseFloat(h.replace(/[^-.0-9]*$/, ""));
      Object.defineProperty(obj, "units", {
        value: {
          width: typeof w == "number" ? "px" : w.replace(obj.width.toString(), ""),
          height: typeof h == "number" ? "px" : h.replace(obj.height.toString(), "")
        },
        enumerable: false
      });
    }
  }

  if (isNaN(obj.width)) obj.width = undefined;
  if (isNaN(obj.height)) obj.height = undefined;
  if (!(obj instanceof Size)) return obj;
}

Size.prototype.width = NaN;
Size.prototype.height = NaN;
Size.prototype.units = null;

Size.prototype.convertUnits = function (w = "window" in global ? window : null) {
  if (w === null) return this;
  const view = {
    vw: w.innerWidth,
    vh: w.innerHeight,
    vmin: w.innerWidth < w.innerHeight ? w.innerWidth : w.innerHeight,
    vmax: w.innerWidth > w.innerHeight ? w.innerWidth : w.innerHeight
  };

  if (view[this.units.width] !== undefined) {
    this.width = this.width / 100 * view[this.units.width];
    delete this.units.width;
  }

  if (view[this.units.height] !== undefined) {
    this.height = this.height / 100 * view[this.units.height];
    delete this.units.height;
  }

  return size;
};

Size.prototype.aspect = function () {
  return this.width / this.height;
};

Size.prototype.toCSS = function (units) {
  let ret = {};
  units = units || this.units || {
    width: "px",
    height: "px"
  };
  if (this.width !== undefined) ret.width = this.width + (units.width || "px");
  if (this.height !== undefined) ret.height = this.height + (units.height || "px");
  return ret;
};

Size.prototype.transform = function (m) {
  this.width = m.xx * this.width + m.yx * this.height;
  this.height = m.xy * this.width + m.yy * this.height;
  return this;
};

Size.prototype.isSquare = function () {
  return Math.abs(this.width - this.height) < 1;
};

Size.prototype.area = function () {
  return this.width * this.height;
};

Size.prototype.resize = function (width, height) {
  this.width = width;
  this.height = height;
  return this;
};

Size.prototype.sum = function (other) {
  return new Size(this.width + other.width, this.height + other.height);
};

Size.prototype.add = function () {
  for (var _i = 0, _arr = [...arguments]; _i < _arr.length; _i++) {
    let other = _arr[_i];
    this.width += other.width;
    this.height += other.height;
  }

  return this;
};

Size.prototype.diff = function (other) {
  return new Size(this.width - other.width, this.height - other.height);
};

Size.prototype.sub = function () {
  for (var _i2 = 0, _arr2 = [...arguments]; _i2 < _arr2.length; _i2++) {
    let other = _arr2[_i2];
    this.width -= other.width;
    this.height -= other.height;
  }

  return this;
};

Size.prototype.prod = function (f) {
  const o = isPoint(f) ? f : {
    width: f,
    height: f
  };
  return new Size(this.width * o.width, this.height * o.height);
};

Size.prototype.mul = function (f) {
  for (var _i3 = 0, _arr3 = [...arguments]; _i3 < _arr3.length; _i3++) {
    let f = _arr3[_i3];
    const o = isPoint(f) ? f : {
      width: f,
      height: f
    };
    this.width *= o.width;
    this.height *= o.height;
  }

  return this;
};

Size.prototype.quot = function (other) {
  return new Size(this.width / other.width, this.height / other.height);
};

Size.prototype.div = function (f) {
  for (var _i4 = 0, _arr4 = [...arguments]; _i4 < _arr4.length; _i4++) {
    let f = _arr4[_i4];
    this.width /= f;
    this.height /= f;
  }

  return this;
};

Size.prototype.round = function (precision = 0.001) {
  const prec = -Math.ceil(Math.log10(precision));
  this.width = precision == 1 ? Math.round(this.width) : +this.width.toFixed(prec);
  this.height = precision == 1 ? Math.round(this.height) : +this.height.toFixed(prec);
  return this;
};

Size.area = sz => Size.prototype.area.call(sz);

Size.aspect = sz => Size.prototype.aspect.call(sz);

Size.bind = (o, p, gen) => {
  const _ref = p || ["width", "height"],
        _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        width = _ref2[0],
        height = _ref2[1];

  if (!gen) gen = k => v => v === undefined ? o[k] : o[k] = v;
  return _util.Util.bindProperties(new Size(0, 0), o, {
    width,
    height
  }, gen);
};

const isSize = o => o && (o.width !== undefined && o.height !== undefined || o.x !== undefined && o.x2 !== undefined && o.y !== undefined && o.y2 !== undefined || o.left !== undefined && o.right !== undefined && o.top !== undefined && o.bottom !== undefined);

exports.isSize = isSize;

for (var _i5 = 0, _arr5 = ["toCSS", "isSquare", "round", "sum", "add", "diff", "sub", "prod", "mul", "quot", "div"]; _i5 < _arr5.length; _i5++) {
  let name = _arr5[_i5];

  Size[name] = points => Size.prototype[name].call(points);
}
