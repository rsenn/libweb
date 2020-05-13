"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BBox = void 0;

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _rect = require("../geom/rect.cjs");

var _util = _interopRequireDefault(require("../util.cjs"));

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

class BBox {
  static fromPoints(pts) {
    let pt = pts.shift();
    let bb = new BBox(pt.x, pt.y, pt.x, pt.y);
    bb.update(pts);
    return bb;
  }

  constructor(x1, y1, x2, y2) {
    if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
      this.x1 = Math.min(x1, x2);
      this.y1 = Math.min(y1, y2);
      this.x2 = Math.max(x1, x2);
      this.y2 = Math.max(y1, y2);
    } else {
      this.x1 = 0;
      this.y1 = 0;
      this.x2 = 0;
      this.y2 = 0;
    }
  }

  updateList(list, offset = 0.0) {
    var _iterator = _createForOfIteratorHelper(list),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        let arg = _step.value;
        this.update(arg, offset);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return this;
  }

  update(arg, offset = 0.0) {
    if (_util.default.isArray(arg)) return this.updateList(arg, offset);
    if (arg.x !== undefined && arg.y != undefined) this.updateXY(arg.x, arg.y, offset);
    if (arg.x1 !== undefined && arg.y1 != undefined) this.updateXY(arg.x1, arg.y1, 0);
    if (arg.x2 !== undefined && arg.y2 != undefined) this.updateXY(arg.x2, arg.y2, 0);
    return this;
  }

  updateXY(x, y, offset = 0) {
    let updated = {};

    if (this.x1 === undefined || this.x1 > x - offset) {
      this.x1 = x - offset;
      updated.x1 = true;
    }

    if (this.x2 === undefined || this.x2 < x + offset) {
      this.x2 = x + offset;
      updated.x2 = true;
    }

    if (this.y1 === undefined || this.y1 > y - offset) {
      this.y1 = y - offset;
      updated.y1 = true;
    }

    if (this.y2 === undefined || this.y2 < y + offset) {
      this.y2 = y + offset;
      updated.y2 = true;
    }

    return this;
  }

  get center() {
    return new Point({
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    });
  }

  relative_to(x, y) {
    return new BBox(this.x1 - x, this.y1 - y, this.x2 - x, this.y2 - y);
  }

  get x() {
    return this.x1;
  }

  get width() {
    return this.x2 - this.x1;
  }

  get y() {
    return this.y1 < this.y2 ? this.y1 : this.y2;
  }

  get height() {
    return this.y2 - this.y1;
  }

  set x(x) {
    let ix = x - this.x1;
    this.x1 += ix;
    this.x2 += ix;
  }

  set width(w) {
    this.x2 = this.x1 + w;
  }

  set y(y) {
    let iy = y - this.y1;
    this.y1 += iy;
    this.y2 += iy;
  }

  set height(h) {
    this.y2 = this.y1 + h;
  }

  get rect() {
    return new _rect.Rect(this);
  }

  toString() {
    return "".concat(this.x1, " ").concat(this.y1, " ").concat(this.x2, " ").concat(this.y2);
  }

  transform(fn = arg => arg, out) {
    if (!out) out = this;

    for (var _i = 0, _arr = ["x1", "y1", "x2", "y2"]; _i < _arr.length; _i++) {
      let prop = _arr[_i];
      const v = this[prop];
      out[prop] = fn(v);
    }

    return this;
  }

  round(fn = arg => Math.round(arg)) {
    let ret = new BBox();
    this.transform(fn, ret);
    return ret;
  }

  move(x, y) {
    this.x1 += x;
    this.y1 += y;
    this.x2 += x;
    this.y2 += y;
    return this;
  }

  static from(iter, tp = p => p) {
    if (typeof iter == "object" && iter[Symbol.iterator]) iter = iter[Symbol.iterator]();
    let r = new BBox();
    let result = iter.next();
    let p;

    if (result.value) {
      p = tp(result.value);
      r.x1 = p.x;
      r.x2 = p.x;
      r.y1 = p.y;
      r.y2 = p.y;
    }

    while (true) {
      result = iter.next();
      if (!result.value) break;
      p = tp(result.value);
      r.update(p);
    }

    return r;
  }

}

exports.BBox = BBox;
