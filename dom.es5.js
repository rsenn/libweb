"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dom = dom;
exports.Align = Align;
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
Object.defineProperty(exports, "ReactComponent", {
  enumerable: true,
  get: function get() {
    return _reactComponent.ReactComponent;
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
exports["default"] = exports.RandomColor = exports.TransitionList = exports.Transition = exports.CSSTransformSetters = exports.ElementTransformation = exports.Anchor = exports.isNumber = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _svgPath = require("./svg-path.es5.js");

var _util = _interopRequireDefault(require("./util.es5.js"));

var _point = require("./dom/point.es5.js");

var _size = require("./dom/size.es5.js");

var _line = require("./dom/line.es5.js");

var _rect = require("./dom/rect.es5.js");

var _pointList = require("./dom/pointList.es5.js");

var _rgba = require("./dom/rgba.es5.js");

var _hsla = require("./dom/hsla.es5.js");

var _matrix = require("./dom/matrix.es5.js");

var _bbox = require("./dom/bbox.es5.js");

var _trbl = require("./dom/trbl.es5.js");

var _timer = require("./dom/timer.es5.js");

var _tree = require("./dom/tree.es5.js");

var _node = require("./dom/node.es5.js");

var _element = require("./dom/element.es5.js");

var _css = require("./dom/css.es5.js");

var _svg = require("./dom/svg.es5.js");

var _reactComponent = require("./dom/reactComponent.es5.js");

var _container = require("./dom/container.es5.js");

var _layer = require("./dom/layer.es5.js");

var _select = require("./dom/select.es5.js");

var _elementRect = require("./dom/elementRect.es5.js");

var _Object$assign;

function dom() {
  var args = Array.prototype.slice.call(arguments);

  var ret = _util["default"].array();

  var extend = function extend(e, functions) {
    var keys = (0, _toConsumableArray2["default"])(_util["default"].members(functions)).filter(function (key) {
      return ["callee", "caller", "arguments", "call", "bind", "apply", "prototype", "constructor", "length"].indexOf(key) == -1 && typeof functions[key] == "function";
    });
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;
        if (e[key] === undefined) e[key] = functions[key].bind(functions, e);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  args = args.map(function (arg) {
    return typeof arg == "string" ? _element.Element.findAll(arg) : arg;
  });
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = args[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var e = _step2.value;
      if (e instanceof SVGSVGElement) extend(e, _svg.SVG);else if (e instanceof HTMLElement) {
        extend(e, _element.Element);
        (0, _elementRect.ElementPosProps)(e);
        (0, _elementRect.ElementSizeProps)(e);
      }
      ret.push(e);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  if (ret.length == 1) ret = ret[0];
  return ret;
}

var isNumber = function isNumber(a) {
  return String(a).replace(/^[0-9]*$/, "") == "";
};

exports.isNumber = isNumber;

function Align(arg) {}

Align.CENTER = 0;
Align.LEFT = 1;
Align.RIGHT = 2;
Align.MIDDLE = 0;
Align.TOP = 4;
Align.BOTTOM = 8;

Align.horizontal = function (alignment) {
  return alignment & (Align.LEFT | Align.RIGHT);
};

Align.vertical = function (alignment) {
  return alignment & (Align.TOP | Align.BOTTOM);
};

var Anchor = Align;
exports.Anchor = Anchor;

function Unit(str) {
  var u = this instanceof Unit ? this : {
    format: function format(number) {
      return "".concat(number).concat(this.name);
    }
  };
  u.name = str.replace(/^[a-z]*/, "");
  return u;
}

function ScalarValue() {}

var ifdef = function ifdef(value, def, nodef) {
  return value !== undefined ? def : nodef;
};

var ElementTransformation = function ElementTransformation() {
  return {
    rotate: 0,
    translate: new _point.Point(0, 0),
    scale: new _size.Size(0, 0),
    toString: function toString() {
      var rotate = this.rotate,
          translate = this.translate,
          scale = this.scale;
      return "rotate(".concat(rotate, "deg) translate(").concat(translate.x, ", ").concat(translate.y, ") scale(").concat(scale.w, ",").concat(scale.h, ")");
    }
  };
};

exports.ElementTransformation = ElementTransformation;

var CSSTransformSetters = function CSSTransformSetters(element) {
  return {
    transformation: ElementTransformation(),

    get rotate() {
      return this.transformation.rotate;
    },

    set rotate(a) {
      this.transformation.rotate = a;
    },

    get translate() {
      return this.transformation.translate;
    },

    set translate(point) {
      this.transformation.translate.set(point.x, point.y);
    },

    get scale() {
      return this.transformation.scale;
    },

    set scale(size) {
      this.transformation.scale.set(size.width, size.height);
    },

    updateTransformation: function updateTransformation() {
      var t = this.transformation.toString();
      this.style.transform = t;
    }
  };
};

exports.CSSTransformSetters = CSSTransformSetters;

var Transition = function () {
  function Transition(property, delay, duration, timing) {
    (0, _classCallCheck2["default"])(this, Transition);
    this.property = "none";
    this.delay = "";
    this.duration = "";
    this.timing = "";
    this.property = property;
    this.delay = delay;
    this.duration = duration;
    this.timing = timing;
  }

  (0, _createClass2["default"])(Transition, null, [{
    key: "list",
    value: function list() {
      return (0, _construct2["default"])(TransitionList, Array.prototype.slice.call(arguments));
    }
  }]);
  return Transition;
}();

exports.Transition = Transition;

var TransitionList = function (_Array) {
  (0, _inherits2["default"])(TransitionList, _Array);

  function TransitionList() {
    var _this;

    (0, _classCallCheck2["default"])(this, TransitionList);
    var args = Array.prototype.slice.call(arguments);
    args.forEach(function (arg) {
      return _this.push(arg);
    });
    return (0, _possibleConstructorReturn2["default"])(_this);
  }

  (0, _createClass2["default"])(TransitionList, [{
    key: "propertyList",
    value: function propertyList(name) {
      return this.map(function (transition) {
        return transition[name];
      });
    }
  }, {
    key: "css",
    get: function get() {
      return {
        transitionDelay: this.propertyList("delay").join(", "),
        transitionDuration: this.propertyList("duration").join(", "),
        transitionProperty: this.propertyList("property").join(", "),
        transitionTimingFunction: this.propertyList("timing").join(", ")
      };
    }
  }]);
  return TransitionList;
}((0, _wrapNativeSuper2["default"])(Array));

exports.TransitionList = TransitionList;

var RandomColor = function RandomColor() {
  var c = _hsla.HSLA.random();

  return c.toString();
};

exports.RandomColor = RandomColor;

var _default = Object.assign(dom, (_Object$assign = {
  Align: Align,
  Anchor: Anchor,
  Container: _container.Container,
  CSS: _css.CSS,
  CSSTransformSetters: CSSTransformSetters,
  Node: _node.Node,
  Element: _element.Element,
  ElementPosProps: _elementRect.ElementPosProps,
  ElementRectProps: _elementRect.ElementRectProps,
  ElementRectProxy: _elementRect.ElementRectProxy,
  ElementSizeProps: _elementRect.ElementSizeProps,
  ElementTransformation: ElementTransformation,
  ElementWHProps: _elementRect.ElementWHProps,
  ElementXYProps: _elementRect.ElementXYProps,
  HSLA: _hsla.HSLA,
  isElement: _element.isElement,
  isHSLA: _hsla.isHSLA,
  isLine: _line.isLine,
  isMatrix: _matrix.isMatrix,
  isNumber: isNumber,
  isPoint: _point.isPoint,
  isRect: _rect.isRect,
  isRGBA: _rgba.isRGBA,
  isSize: _size.isSize,
  Line: _line.Line,
  Matrix: _matrix.Matrix,
  MatrixProps: _matrix.MatrixProps,
  Point: _point.Point,
  PointList: _pointList.PointList,
  ReactComponent: _reactComponent.ReactComponent,
  Rect: _rect.Rect,
  Renderer: _layer.Renderer,
  RGBA: _rgba.RGBA
}, (0, _defineProperty2["default"])(_Object$assign, "HSLA", _hsla.HSLA), (0, _defineProperty2["default"])(_Object$assign, "Select", _select.Select), (0, _defineProperty2["default"])(_Object$assign, "Size", _size.Size), (0, _defineProperty2["default"])(_Object$assign, "SVG", _svg.SVG), (0, _defineProperty2["default"])(_Object$assign, "Timer", _timer.Timer), (0, _defineProperty2["default"])(_Object$assign, "Transition", Transition), (0, _defineProperty2["default"])(_Object$assign, "TransitionList", TransitionList), (0, _defineProperty2["default"])(_Object$assign, "TRBL", _trbl.TRBL), (0, _defineProperty2["default"])(_Object$assign, "Tree", _tree.Tree), _Object$assign));

exports["default"] = _default;
