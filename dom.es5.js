"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.dom = dom;
exports.Align = Align;
exports.Unit = Unit;
exports.ScalarValue = ScalarValue;
exports.ElementRectProxy = ElementRectProxy;

_Object$defineProperty2(exports, "Point", {
  enumerable: true,
  get: function get() {
    return _point.Point;
  }
});

_Object$defineProperty2(exports, "isPoint", {
  enumerable: true,
  get: function get() {
    return _point.isPoint;
  }
});

_Object$defineProperty2(exports, "Size", {
  enumerable: true,
  get: function get() {
    return _size.Size;
  }
});

_Object$defineProperty2(exports, "isSize", {
  enumerable: true,
  get: function get() {
    return _size.isSize;
  }
});

_Object$defineProperty2(exports, "Line", {
  enumerable: true,
  get: function get() {
    return _line.Line;
  }
});

_Object$defineProperty2(exports, "isLine", {
  enumerable: true,
  get: function get() {
    return _line.isLine;
  }
});

_Object$defineProperty2(exports, "Rect", {
  enumerable: true,
  get: function get() {
    return _rect.Rect;
  }
});

_Object$defineProperty2(exports, "isRect", {
  enumerable: true,
  get: function get() {
    return _rect.isRect;
  }
});

_Object$defineProperty2(exports, "PointList", {
  enumerable: true,
  get: function get() {
    return _pointList.PointList;
  }
});

_Object$defineProperty2(exports, "RGBA", {
  enumerable: true,
  get: function get() {
    return _rgba.RGBA;
  }
});

_Object$defineProperty2(exports, "isRGBA", {
  enumerable: true,
  get: function get() {
    return _rgba.isRGBA;
  }
});

_Object$defineProperty2(exports, "HSLA", {
  enumerable: true,
  get: function get() {
    return _hsla.HSLA;
  }
});

_Object$defineProperty2(exports, "isHSLA", {
  enumerable: true,
  get: function get() {
    return _hsla.isHSLA;
  }
});

_Object$defineProperty2(exports, "Matrix", {
  enumerable: true,
  get: function get() {
    return _matrix.Matrix;
  }
});

_Object$defineProperty2(exports, "isMatrix", {
  enumerable: true,
  get: function get() {
    return _matrix.isMatrix;
  }
});

_Object$defineProperty2(exports, "MatrixProps", {
  enumerable: true,
  get: function get() {
    return _matrix.MatrixProps;
  }
});

_Object$defineProperty2(exports, "BBox", {
  enumerable: true,
  get: function get() {
    return _bbox.BBox;
  }
});

_Object$defineProperty2(exports, "TRBL", {
  enumerable: true,
  get: function get() {
    return _trbl.TRBL;
  }
});

_Object$defineProperty2(exports, "Timer", {
  enumerable: true,
  get: function get() {
    return _timer.Timer;
  }
});

_Object$defineProperty2(exports, "Tree", {
  enumerable: true,
  get: function get() {
    return _tree.Tree;
  }
});

_Object$defineProperty2(exports, "Node", {
  enumerable: true,
  get: function get() {
    return _node.Node;
  }
});

_Object$defineProperty2(exports, "Element", {
  enumerable: true,
  get: function get() {
    return _element.Element;
  }
});

_Object$defineProperty2(exports, "isElement", {
  enumerable: true,
  get: function get() {
    return _element.isElement;
  }
});

_Object$defineProperty2(exports, "CSS", {
  enumerable: true,
  get: function get() {
    return _css.CSS;
  }
});

_Object$defineProperty2(exports, "SVG", {
  enumerable: true,
  get: function get() {
    return _svg.SVG;
  }
});

exports["default"] = exports.RandomColor = exports.TransitionList = exports.Transition = exports.CSSTransformSetters = exports.ElementTransformation = exports.ElementRectProps = exports.ElementSizeProps = exports.ElementPosProps = exports.ElementWHProps = exports.ElementXYProps = exports.Select = exports.Renderer = exports.ReactComponent = exports.Container = exports.Anchor = exports.isNumber = void 0;

var _react = _interopRequireDefault(require("react"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/wrapNativeSuper"));

var _construct2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/construct"));

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/extends"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/getPrototypeOf"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/possibleConstructorReturn"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/inherits"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _getIterator2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/get-iterator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _util = _interopRequireDefault(require("./util.js"));

var _point = require("./dom/point.js");

var _size = require("./dom/size.js");

var _line = require("./dom/line.js");

var _rect = require("./dom/rect.js");

var _pointList = require("./dom/pointList.js");

var _rgba = require("./dom/rgba.js");

var _hsla = require("./dom/hsla.js");

var _matrix = require("./dom/matrix.js");

var _bbox = require("./dom/bbox.js");

var _trbl = require("./dom/trbl.js");

var _timer = require("./dom/timer.js");

var _tree = require("./dom/tree.js");

var _node = require("./dom/node.js");

var _element = require("./dom/element.js");

var _css = require("./dom/css.js");

var _svg = require("./dom/svg.js");

var _jsxFileName = "/home/roman/the-wild-beauty-company/lib/dom.js",
    _Object$assign2;

var __jsx = _react["default"].createElement;

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

var ReactDOM = require("react-dom").ReactDOM;

var SvgPath = require("./svg-path.js");

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
      for (var _iterator = (0, _getIterator2["default"])(keys), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;
        if (e[key] === undefined) e[key] = functions[key].bind(functions, e);
      }
      /* function() {
            return functions[key].apply(functions, [this, ...arguments]);
          };*/

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
    for (var _iterator2 = (0, _getIterator2["default"])(args), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var e = _step2.value;
      if (e instanceof SVGSVGElement) extend(e, _svg.SVG);else if (e instanceof HTMLElement) {
        extend(e, _element.Element);
        ElementPosProps(e);
        ElementSizeProps(e);
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
/**
 * Determines if number.
 *
 * @return     {(Object|Point|boolean|string)}  True if number, False otherwise.
 */


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

var Container = /*#__PURE__*/function () {
  function Container() {
    (0, _classCallCheck2["default"])(this, Container);
  }

  (0, _createClass2["default"])(Container, null, [{
    key: "factory",
    value: function factory(parent) {
      var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var delegate = {
        root: null,
        append_to: function append_to(elem) {
          var p = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          if (p == null) {
            if (this.root == null) {
              this.root = document.createElement("div");
              this.append_to(this.root, parent);
            }

            p = this.root;
          }

          p.appendChild(elem);
        }
      };
      return _element.Element.factory(delegate);
    }
  }]);
  return Container;
}();

exports.Container = Container;

var ReactComponent = /*#__PURE__*/function () {
  function ReactComponent() {
    (0, _classCallCheck2["default"])(this, ReactComponent);
  }

  (0, _createClass2["default"])(ReactComponent, null, [{
    key: "object",
    value: function object() {
      var ret = [];

      for (var _i = 0, _arr = Array.prototype.slice.call(arguments); _i < _arr.length; _i++) {
        var arg = _arr[_i];
        if (!typeof arg == "object" || arg === null || !arg) continue;
        var tagName = arg.type && arg.type.name;

        var _ref = arg.props || {},
            children = _ref.children,
            props = (0, _objectWithoutProperties2["default"])(_ref, ["children"]);

        var obj = _objectSpread({
          tagName: tagName
        }, props);

        if (typeof arg.key == "string") obj.key = arg.key;
        if (!children) children = arg.children;

        if (_react["default"].Children.count(children) > 0) {
          var arr = _react["default"].Children.toArray(children);

          obj.children = ReactComponent.object.apply(ReactComponent, (0, _toConsumableArray2["default"])(arr));
        }

        ret.push(obj);
      }

      return ret;
    }
  }, {
    key: "stringify",
    value: function stringify(obj) {
      var tagName = obj.tagName,
          children = obj.children,
          props = (0, _objectWithoutProperties2["default"])(obj, ["tagName", "children"]);
      var str = "<".concat(tagName);

      for (var prop in props) {
        var value = props[prop];

        if (typeof value == "function") {
          value = " ()=>{} ";
        } else if (typeof value == "object") {
          value = _util["default"].inspect(value, {
            indent: "",
            newline: "\n",
            depth: 10,
            spacing: " "
          });
          value = value.replace(/(,?)(\n?[\s]+|\s+)/g, "$1 ");
        } else if (typeof value == "string") {
          value = "'".concat(value, "'");
        }

        str += " ".concat(prop, "={").concat(value, "}");
      }

      if (!children || !children.length) {
        str += " />";
      } else {
        str += ">";
        str += "</".concat(tagName, ">");
      }

      return str;
    }
  }]);
  return ReactComponent;
}();
/**
 *
 */


exports.ReactComponent = ReactComponent;

ReactComponent.factory = function (_render_to, root) {
  if (typeof _render_to === "string") _render_to = _element.Element.find(append_to);

  if (typeof _render_to !== "function") {
    root = root || _render_to;

    _render_to = function render_to(component) {
      return require("react-dom").render(component, root || _render_to);
    };
  }

  var ret = function render_factory(Tag, _ref3) {
    var is_root = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var parent = _ref3.parent,
        children = _ref3.children,
        props = (0, _objectWithoutProperties2["default"])(_ref3, ["parent", "children"]);

    var elem = __jsx(Tag, (0, _extends2["default"])({}, props, {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 120
      },
      __self: this
    }), (0, _isArray["default"])(children) ? children.map(function (child, key) {
      if (typeof child === "object") {
        var tagName = child.tagName,
            _props = (0, _objectWithoutProperties2["default"])(child, ["tagName"]);

        return render_factory(tagName, _objectSpread({
          key: key
        }, _props), false);
      }

      return child;
    }) : undefined); //console.log('elem: ', elem);


    if (is_root && _render_to) _render_to(elem, parent || this.root);
    return elem;
  };

  ret.root = root;
  return ret.bind(ret);
};

var Layer = /*#__PURE__*/function (_Element) {
  (0, _inherits2["default"])(Layer, _Element);

  function Layer(arg, attr) {
    var _this;

    (0, _classCallCheck2["default"])(this, Layer);
    _this.elm = _element.Element.isElement(arg) && arg || _element.Element.create(arg);
    _this.rect = _element.Element.rect(_this.elm);
    return (0, _possibleConstructorReturn2["default"])(_this);
  }

  return Layer;
}(_element.Element);

var Renderer = /*#__PURE__*/function () {
  function Renderer(component, root_node) {
    (0, _classCallCheck2["default"])(this, Renderer);
    this.component = component;
    this.root_node = root_node;
  }

  (0, _createClass2["default"])(Renderer, [{
    key: "refresh",
    value: function refresh() {
      this.clear();
      ReactDOM.render(this.component, this.root_node);
      var e = this.element = this.root_node.firstChild;

      var xpath = _element.Element.xpath(e); //console.log('Renderer.refresh ', { xpath, e });


      return e;
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this.element) {
        var parent = this.element.parentNode;
        parent.removeChild(this.element);
        this.element = null;
      }
    }
  }]);
  return Renderer;
}();

exports.Renderer = Renderer;

var Select = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2["default"])(Select, _React$Component);

  function Select(props) {
    (0, _classCallCheck2["default"])(this, Select);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Select).call(this, props));
  }

  (0, _createClass2["default"])(Select, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          options = _this$props.options,
          props = (0, _objectWithoutProperties2["default"])(_this$props, ["options"]); //console.log('Select.render ', { options, props });

      var Option = function Option(_ref2) {
        var children = _ref2.children,
            props = (0, _objectWithoutProperties2["default"])(_ref2, ["children"]);
        //console.log('Select.render Option ', { children, props });
        return __jsx("option", (0, _extends2["default"])({}, props, {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 232
          },
          __self: this
        }), children);
      }; //return <select {...props}>{
      //Object.keys(options).map(key =>
      //<Option value={key}>{options[key]}</Option>
      //)
      //}</select>

    }
  }]);
  return Select;
}(_react["default"].Component); //Create an object:


exports.Select = Select;

function ElementRectProxy(element) {
  this.element = element;
}

ElementRectProxy.prototype = {
  element: null,
  getPos: function getPos() {
    var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (rect) {
      return rect;
    };
    return fn(_element.Element.position(this.element));
  },
  getRect: function getRect() {
    var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (rect) {
      return rect;
    };
    return fn(_element.Element.rect(this.element, {
      round: false
    }));
  },
  setPos: function setPos(pos) {
    _element.Element.move.apply(_element.Element, [this.element].concat(Array.prototype.slice.call(arguments)));
  },
  setSize: function setSize(size) {
    _element.Element.resize.apply(_element.Element, [this.element].concat(Array.prototype.slice.call(arguments)));
  },
  changeRect: function changeRect() {
    var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (rect, e) {
      return rect;
    };

    var r = _element.Element.getRect(this.element);

    if (typeof fn == "function") r = fn(r, this.element);

    _element.Element.setRect(this.element, r);
  },
  setRect: function setRect(arg) {
    var rect = arg;

    if (typeof arg == "function") {
      rect = arg(this.getRect());
    }

    _element.Element.rect(this.element, rect);
    /*    rect = new Rect(rect);
    Element.setCSS(this.element, { ...rect.toCSS(rect), position: 'absolute' });
    */

  }
};

var propSetter = function propSetter(prop, proxy) {
  return function (value) {
    //proxy.changeRect(rect => { rect[prop] = value; return rect; })
    var r = proxy.getRect();
    r[prop] = value; //console.log('New rect: ', r);

    proxy.setRect(r);
  };
};

var computedSetter = function computedSetter(proxy, compute) {
  return function (value) {
    var r = proxy.getRect();
    r = compute(value, r);
    if (r && r.x !== undefined) proxy.setRect(function (oldrect) {
      return r;
    });
    return r;
  };
};

var ElementXYProps = function ElementXYProps(element) {
  _util["default"].defineGetterSetter(element, "x", function () {
    return _element.Element.getRect(this).x;
  }, function (val) {
    this.style.left = "".concat(val, "px");
  });

  _util["default"].defineGetterSetter(element, "y", function () {
    return _element.Element.getRect(this).y;
  }, function (val) {
    this.style.top = "".concat(val, "px");
  });
};

exports.ElementXYProps = ElementXYProps;

var ElementWHProps = function ElementWHProps(element) {
  _util["default"].defineGetterSetter(element, "w", function () {
    return _element.Element.getRect(this).width;
  }, function (val) {
    this.style.width = "".concat(val, "px");
  });

  _util["default"].defineGetterSetter(element, "h", function () {
    return _element.Element.getRect(this).height;
  }, function (val) {
    this.style.height = "".concat(val, "px");
  });
};

exports.ElementWHProps = ElementWHProps;

var ElementPosProps = function ElementPosProps(element, proxy) {
  proxy = proxy || new ElementRectProxy(element);

  _util["default"].defineGetterSetter(element, "x", function () {
    return proxy.getPos().x;
  }, function (x) {
    return proxy.setPos({
      x: x
    });
  });

  _util["default"].defineGetterSetter(element, "x1", function () {
    return proxy.getPos().x;
  }, function (value) {
    return proxy.setRect(function (rect) {
      var extend = rect.x - value;
      rect.width += extend;
      return rect;
    });
  });

  _util["default"].defineGetterSetter(element, "x2", function () {
    return proxy.getRect(function (rect) {
      return rect.x + rect.width;
    });
  }, function (value) {
    return proxy.setRect(function (rect) {
      var extend = value - (rect.x + rect.w);
      rect.width += extend;
      return rect;
    });
  });

  _util["default"].defineGetterSetter(element, "y", function () {
    return proxy.getPos().y;
  }, function (y) {
    return proxy.setPos({
      y: y
    });
  });

  _util["default"].defineGetterSetter(element, "y1", function () {
    return proxy.getPos().y;
  }, function (value) {
    return proxy.setRect(function (rect) {
      var y = rect.y - value;
      rect.height += y;
      return rect;
    });
  });

  _util["default"].defineGetterSetter(element, "y2", function () {
    return proxy.getRect(function (rect) {
      return rect.y + rect.height;
    });
  }, function (value) {
    return proxy.setRect(function (rect) {
      var y = value - (rect.y + rect.height);
      rect.height += y;
      return rect;
    });
  });
};

exports.ElementPosProps = ElementPosProps;

var ElementSizeProps = function ElementSizeProps(element, proxy) {
  proxy = proxy || new ElementRectProxy(element);

  _util["default"].defineGetterSetter(element, "w", function () {
    return proxy.getRect().width;
  }, function (width) {
    return proxy.setSize({
      width: width
    });
  });

  _util["default"].defineGetterSetter(element, "width", function () {
    return proxy.getRect().width;
  }, function (width) {
    return proxy.setSize({
      width: width
    });
  });

  _util["default"].defineGetterSetter(element, "h", function () {
    return proxy.getRect().height;
  }, function (width) {
    return proxy.setSize({
      height: height
    });
  });

  _util["default"].defineGetterSetter(element, "height", function () {
    return proxy.getRect().height;
  }, function (width) {
    return proxy.setSize({
      height: height
    });
  });
};

exports.ElementSizeProps = ElementSizeProps;

var ElementRectProps = function ElementRectProps(element, proxy) {
  /*Util.defineGetterSetter(element, 'w', () => proxy.getRect().width, propSetter('width', proxy)); Util.defineGetterSetter(element, 'width', () => proxy.getRect().width, propSetter('width', proxy));
    Util.defineGetterSetter(element, 'h', () => proxy.getRect().height, propSetter('height', proxy)); Util.defineGetterSetter(element, 'height', () => proxy.getRect().height, propSetter('height', proxy) });*/
};

exports.ElementRectProps = ElementRectProps;

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

var Transition = /*#__PURE__*/function () {
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

var TransitionList = /*#__PURE__*/function (_Array) {
  (0, _inherits2["default"])(TransitionList, _Array);

  function TransitionList() {
    var _this2;

    (0, _classCallCheck2["default"])(this, TransitionList);
    var args = Array.prototype.slice.call(arguments);
    args.forEach(function (arg) {
      return _this2.push(arg);
    });
    return (0, _possibleConstructorReturn2["default"])(_this2);
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
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Array));

exports.TransitionList = TransitionList;

var RandomColor = function RandomColor() {
  var c = _hsla.HSLA.random();

  return c.toString();
};
/*
    function(value) {
      element.transformation[transform_name]
      element.style.transform =
    }*/

/*export const isPointList = inst => {};
export const isTRBL = inst => {};
export const isTimer = inst => {};
export const isTree = inst => {};
export const isCSS = inst => {};
export const isContainer = inst => {};
export const isSVG = inst => inst.tagName.toLowerCase() == "svg";

export const isReactComponent = inst => {};
export const isRenderer = inst => {};
export const isSelect = inst => {};
*/


exports.RandomColor = RandomColor;

var _default = (0, _assign["default"])(dom, (_Object$assign2 = {
  Align: Align,
  Anchor: Anchor,
  Container: Container,
  CSS: _css.CSS,
  CSSTransformSetters: CSSTransformSetters,
  Node: _node.Node,
  Element: _element.Element,
  ElementPosProps: ElementPosProps,
  ElementRectProps: ElementRectProps,
  ElementRectProxy: ElementRectProxy,
  ElementSizeProps: ElementSizeProps,
  ElementTransformation: ElementTransformation,
  ElementWHProps: ElementWHProps,
  ElementXYProps: ElementXYProps,
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
  ReactComponent: ReactComponent,
  Rect: _rect.Rect,
  Renderer: Renderer,
  RGBA: _rgba.RGBA
}, (0, _defineProperty3["default"])(_Object$assign2, "HSLA", _hsla.HSLA), (0, _defineProperty3["default"])(_Object$assign2, "Select", Select), (0, _defineProperty3["default"])(_Object$assign2, "Size", _size.Size), (0, _defineProperty3["default"])(_Object$assign2, "SVG", _svg.SVG), (0, _defineProperty3["default"])(_Object$assign2, "Timer", _timer.Timer), (0, _defineProperty3["default"])(_Object$assign2, "Transition", Transition), (0, _defineProperty3["default"])(_Object$assign2, "TransitionList", TransitionList), (0, _defineProperty3["default"])(_Object$assign2, "TRBL", _trbl.TRBL), (0, _defineProperty3["default"])(_Object$assign2, "Tree", _tree.Tree), _Object$assign2));

exports["default"] = _default;

