"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dom = dom;
exports.Unit = Unit;
exports.ScalarValue = ScalarValue;
Object.defineProperty(exports, "Point", {
  enumerable: true,
  get: function get() {
    return _point.Point;
  }
});
Object.defineProperty(exports, "isPoint", {
  enumerable: true,
  get: function get() {
    return _point.isPoint;
  }
});
Object.defineProperty(exports, "Size", {
  enumerable: true,
  get: function get() {
    return _size.Size;
  }
});
Object.defineProperty(exports, "isSize", {
  enumerable: true,
  get: function get() {
    return _size.isSize;
  }
});
Object.defineProperty(exports, "Line", {
  enumerable: true,
  get: function get() {
    return _line.Line;
  }
});
Object.defineProperty(exports, "isLine", {
  enumerable: true,
  get: function get() {
    return _line.isLine;
  }
});
Object.defineProperty(exports, "Rect", {
  enumerable: true,
  get: function get() {
    return _rect.Rect;
  }
});
Object.defineProperty(exports, "isRect", {
  enumerable: true,
  get: function get() {
    return _rect.isRect;
  }
});
Object.defineProperty(exports, "PointList", {
  enumerable: true,
  get: function get() {
    return _pointList.PointList;
  }
});
Object.defineProperty(exports, "Polyline", {
  enumerable: true,
  get: function get() {
    return _pointList.Polyline;
  }
});
Object.defineProperty(exports, "RGBA", {
  enumerable: true,
  get: function get() {
    return _rgba.RGBA;
  }
});
Object.defineProperty(exports, "isRGBA", {
  enumerable: true,
  get: function get() {
    return _rgba.isRGBA;
  }
});
Object.defineProperty(exports, "HSLA", {
  enumerable: true,
  get: function get() {
    return _hsla.HSLA;
  }
});
Object.defineProperty(exports, "isHSLA", {
  enumerable: true,
  get: function get() {
    return _hsla.isHSLA;
  }
});
Object.defineProperty(exports, "Matrix", {
  enumerable: true,
  get: function get() {
    return _matrix.Matrix;
  }
});
Object.defineProperty(exports, "isMatrix", {
  enumerable: true,
  get: function get() {
    return _matrix.isMatrix;
  }
});
Object.defineProperty(exports, "MatrixProps", {
  enumerable: true,
  get: function get() {
    return _matrix.MatrixProps;
  }
});
Object.defineProperty(exports, "BBox", {
  enumerable: true,
  get: function get() {
    return _bbox.BBox;
  }
});
Object.defineProperty(exports, "TRBL", {
  enumerable: true,
  get: function get() {
    return _trbl.TRBL;
  }
});
Object.defineProperty(exports, "Timer", {
  enumerable: true,
  get: function get() {
    return _timer.Timer;
  }
});
Object.defineProperty(exports, "Tree", {
  enumerable: true,
  get: function get() {
    return _tree.Tree;
  }
});
Object.defineProperty(exports, "Node", {
  enumerable: true,
  get: function get() {
    return _node.Node;
  }
});
Object.defineProperty(exports, "Element", {
  enumerable: true,
  get: function get() {
    return _element.Element;
  }
});
Object.defineProperty(exports, "isElement", {
  enumerable: true,
  get: function get() {
    return _element.isElement;
  }
});
Object.defineProperty(exports, "CSS", {
  enumerable: true,
  get: function get() {
    return _css.CSS;
  }
});
Object.defineProperty(exports, "SVG", {
  enumerable: true,
  get: function get() {
    return _svg.SVG;
  }
});
Object.defineProperty(exports, "Container", {
  enumerable: true,
  get: function get() {
    return _container.Container;
  }
});
Object.defineProperty(exports, "Layer", {
  enumerable: true,
  get: function get() {
    return _layer.Layer;
  }
});
Object.defineProperty(exports, "Renderer", {
  enumerable: true,
  get: function get() {
    return _layer.Renderer;
  }
});
Object.defineProperty(exports, "Select", {
  enumerable: true,
  get: function get() {
    return _select.Select;
  }
});
Object.defineProperty(exports, "Align", {
  enumerable: true,
  get: function get() {
    return _align.Align;
  }
});
Object.defineProperty(exports, "Anchor", {
  enumerable: true,
  get: function get() {
    return _align.Anchor;
  }
});
Object.defineProperty(exports, "ElementPosProps", {
  enumerable: true,
  get: function get() {
    return _elementRect.ElementPosProps;
  }
});
Object.defineProperty(exports, "ElementRectProps", {
  enumerable: true,
  get: function get() {
    return _elementRect.ElementRectProps;
  }
});
Object.defineProperty(exports, "ElementRectProxy", {
  enumerable: true,
  get: function get() {
    return _elementRect.ElementRectProxy;
  }
});
Object.defineProperty(exports, "ElementSizeProps", {
  enumerable: true,
  get: function get() {
    return _elementRect.ElementSizeProps;
  }
});
Object.defineProperty(exports, "ElementWHProps", {
  enumerable: true,
  get: function get() {
    return _elementRect.ElementWHProps;
  }
});
Object.defineProperty(exports, "ElementXYProps", {
  enumerable: true,
  get: function get() {
    return _elementRect.ElementXYProps;
  }
});
exports.default = exports.RandomColor = exports.TransitionList = exports.Transition = exports.CSSTransformSetters = exports.ElementTransformation = exports.isNumber = void 0;

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.regexp.replace");

var _util = _interopRequireDefault(require("./util.cjs"));

var _point = require("./geom/point.cjs");

var _size = require("./geom/size.cjs");

var _line = require("./geom/line.cjs");

var _rect = require("./geom/rect.cjs");

var _pointList = require("./geom/pointList.cjs");

var _rgba = require("./dom/rgba.cjs");

var _hsla = require("./dom/hsla.cjs");

var _matrix = require("./geom/matrix.cjs");

var _bbox = require("./geom/bbox.cjs");

var _trbl = require("./geom/trbl.cjs");

var _timer = require("./dom/timer.cjs");

var _tree = require("./dom/tree.cjs");

var _node = require("./dom/node.cjs");

var _element = require("./dom/element.cjs");

var _css = require("./dom/css.cjs");

var _svg = require("./dom/svg.cjs");

var _container = require("./dom/container.cjs");

var _layer = require("./dom/layer.cjs");

var _select = require("./dom/select.cjs");

var _align = require("./geom/align.cjs");

var _elementRect = require("./dom/elementRect.cjs");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function dom() {
  let args = [...arguments];
  let ret = [];

  const extend = (e, functions) => {
    const keys = [..._util.default.members(functions)].filter(key => ["callee", "caller", "arguments", "call", "bind", "apply", "prototype", "constructor", "length"].indexOf(key) == -1 && typeof functions[key] == "function");

    var _iterator = _createForOfIteratorHelper(keys),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        let key = _step.value;
        if (e[key] === undefined) e[key] = functions[key].bind(functions, e);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  args = args.map(arg => typeof arg == "string" ? _element.Element.findAll(arg) : arg);

  var _iterator2 = _createForOfIteratorHelper(args),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      let e = _step2.value;
      if (e instanceof SVGSVGElement) extend(e, _svg.SVG);

      if ((0, _element.isElement)(e)) {
        extend(e, _element.Element);
        (0, _elementRect.ElementPosProps)(e);
        (0, _elementRect.ElementSizeProps)(e);
        CSSTransformSetters(e);
      }

      ret.push(e);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  if (ret.length == 1) ret = ret[0];
  return ret;
}

const isNumber = a => {
  return String(a).replace(/^[0-9]*$/, "") == "";
};

exports.isNumber = isNumber;

function Unit(str) {
  let u = this instanceof Unit ? this : {
    format(number) {
      return "".concat(number).concat(this.name);
    }

  };
  u.name = str.replace(/^[a-z]*/, "");
  return u;
}

function ScalarValue() {}

const ifdef = (value, def, nodef) => value !== undefined ? def : nodef;

const ElementTransformation = () => ({
  rotate: 0,
  translate: new _point.Point(0, 0),
  scale: new _size.Size(0, 0),

  toString() {
    const rotate = this.rotate,
          translate = this.translate,
          scale = this.scale;
    return "rotate(".concat(rotate, "deg) translate(").concat(translate.x, ", ").concat(translate.y, ") scale(").concat(scale.w, ",").concat(scale.h, ")");
  }

});

exports.ElementTransformation = ElementTransformation;

const CSSTransformSetters = element => ({
  transformation: ElementTransformation(),

  get rotate() {
    return this.transformation.rotate;
  },

  set rotate(a) {
    this.transformation.rotate = a;
    this.updateTransformation();
  },

  get translate() {
    return this.transformation.translate;
  },

  set translate(point) {
    this.transformation.translate.set(point.x, point.y);
    this.updateTransformation();
  },

  get scale() {
    return this.transformation.scale;
  },

  set scale(size) {
    this.transformation.scale.set(size.width, size.height);
    this.updateTransformation();
  },

  updateTransformation() {
    const t = this.transformation.toString();
    console.log("CSSTransformSetters.updateTransformation", t);
    this.style.transform = t;
  }

});

exports.CSSTransformSetters = CSSTransformSetters;

class Transition {
  constructor(property, delay, duration, timing) {
    this.property = "none";
    this.delay = "";
    this.duration = "";
    this.timing = "";
    this.property = property;
    this.delay = delay;
    this.duration = duration;
    this.timing = timing;
  }

  static list() {
    return new TransitionList(...arguments);
  }

}

exports.Transition = Transition;

class TransitionList extends Array {
  constructor() {
    const args = [...arguments];
    args.forEach(arg => this.push(arg));
  }

  propertyList(name) {
    return this.map(transition => transition[name]);
  }

  get css() {
    return {
      transitionDelay: this.propertyList("delay").join(", "),
      transitionDuration: this.propertyList("duration").join(", "),
      transitionProperty: this.propertyList("property").join(", "),
      transitionTimingFunction: this.propertyList("timing").join(", ")
    };
  }

}

exports.TransitionList = TransitionList;

const RandomColor = () => {
  const c = _hsla.HSLA.random();

  return c.toString();
};

exports.RandomColor = RandomColor;

var _default = Object.assign(dom, {
  Align: _align.Align,
  Anchor: _align.Anchor,
  Container: _container.Container,
  CSS: _css.CSS,
  CSSTransformSetters,
  Node: _node.Node,
  Element: _element.Element,
  ElementPosProps: _elementRect.ElementPosProps,
  ElementRectProps: _elementRect.ElementRectProps,
  ElementRectProxy: _elementRect.ElementRectProxy,
  ElementSizeProps: _elementRect.ElementSizeProps,
  ElementTransformation,
  ElementWHProps: _elementRect.ElementWHProps,
  ElementXYProps: _elementRect.ElementXYProps,
  HSLA: _hsla.HSLA,
  isElement: _element.isElement,
  isHSLA: _hsla.isHSLA,
  isLine: _line.isLine,
  isMatrix: _matrix.isMatrix,
  isNumber,
  isPoint: _point.isPoint,
  isRect: _rect.isRect,
  isRGBA: _rgba.isRGBA,
  isSize: _size.isSize,
  Line: _line.Line,
  Matrix: _matrix.Matrix,
  MatrixProps: _matrix.MatrixProps,
  Point: _point.Point,
  PointList: _pointList.PointList,
  Polyline: _pointList.Polyline,
  Rect: _rect.Rect,
  Renderer: _layer.Renderer,
  RGBA: _rgba.RGBA,
  HSLA: _hsla.HSLA,
  Size: _size.Size,
  SVG: _svg.SVG,
  Timer: _timer.Timer,
  Transition,
  TransitionList,
  TRBL: _trbl.TRBL,
  Tree: _tree.Tree
});

exports.default = _default;
