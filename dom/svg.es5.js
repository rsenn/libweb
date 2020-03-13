"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.SVG = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/entries"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/map"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/inherits"));

var _element = require("./element.es5.js");

var _size2 = require("./size.es5.js");

var _rect = require("./rect.es5.js");

var _util = _interopRequireDefault(require("../util.es5.js"));

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

var SVG = /*#__PURE__*/function (_Element) {
  (0, _inherits2["default"])(SVG, _Element);

  function SVG() {
    (0, _classCallCheck2["default"])(this, SVG);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(SVG).apply(this, arguments));
  }

  (0, _createClass2["default"])(SVG, null, [{
    key: "create",
    value: function create(name, attr, parent) {
      var svg = document.createElementNS(SVG.ns, name);
      var text;

      if (attr.text !== undefined) {
        text = attr.text;
        delete attr.text;
      }

      if (name == "svg") {
        attr.version = "1.1";
        attr.xmlns = SVG.ns;
      }

      _util["default"].foreach(attr, function (value, name) {
        return svg.setAttribute(_util["default"].decamelize(name, "-"), value);
      });

      if (parent && parent.appendChild) parent.appendChild(svg);
      if (text) svg.innerHTML = text;
      return svg;
    }
  }, {
    key: "factory",
    value: function factory(parent) {
      var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var delegate = {
        create: function create(tag) {
          return document.createElementNS(SVG.ns, tag);
        },
        append_to: function append_to(elem) {
          return parent.appendChild(elem);
        },
        setattr: function setattr(elem, name, value) {
          return name != "ns" && elem.setAttributeNS(document.namespaceURI, _util["default"].decamelize(name, "-"), value);
        },
        setcss: function setcss(elem, css) {
          return elem.setAttributeNS(null, "style", css);
        }
      };
      if (size == null) size = (0, _size2.Size)(_rect.Rect.round(_element.Element.rect(parent)));
      var _size = size,
          width = _size.width,
          height = _size.height;
      if (parent && parent.tagName == "svg") delegate.root = parent;else if (this !== SVG && this && this.appendChild) delegate.root = this;else {
        delegate.root = SVG.create("svg", {
          width: width,
          height: height,
          viewBox: "0 0 " + width + " " + height + ""
        }, parent);
      }

      if (!delegate.root.firstElementChild || delegate.root.firstElementChild.tagName != "defs") {
        SVG.create("defs", {}, delegate.root);
      }

      delegate.append_to = function (elem, p) {
        var root = p || this.root;

        if (elem.tagName.indexOf("Gradient") != -1) {
          root = root.querySelector("defs");
        }

        if (typeof root.append == "function") root.append(elem);else root.appendChild(elem); //console.log('append_to ', elem, ', root=', root);
      };

      return _element.Element.factory(delegate);
    }
  }, {
    key: "matrix",
    value: function matrix(element) {
      var screen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var e = typeof element === "string" ? _element.Element.find(element) : element;
      var fn = screen ? "getScreenCTM" : "getCTM";
      if (e && e[fn]) return Matrix.fromDOMMatrix(e[fn]());
      return null;
    }
  }, {
    key: "bbox",
    value: function bbox(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        parent: null,
        absolute: false
      };
      var e = typeof element === "string" ? _element.Element.find(element, options.parent) : element;
      var bb;
      f;

      if (e && e.getBBox) {
        bb = new _rect.Rect(e.getBBox());

        if (options.absolute) {
          var r = _element.Element.rect(element.ownerSVGElement);

          bb.x += r.x;
          bb.y += r.y;
        }

        return bb;
      }

      return _element.Element.rect(e);
    }
  }, {
    key: "gradient",
    value: function gradient(type, _ref) {
      var stops = _ref.stops,
          _ref$factory = _ref.factory,
          factory = _ref$factory === void 0 ? SVG.create : _ref$factory,
          _ref$parent = _ref.parent,
          parent = _ref$parent === void 0 ? null : _ref$parent,
          _ref$line = _ref.line,
          line = _ref$line === void 0 ? false : _ref$line,
          props = (0, _objectWithoutProperties2["default"])(_ref, ["stops", "factory", "parent", "line"]);
      var defs = factory("defs", {}, parent);
      var map = new _map["default"](stops instanceof Array ? stops : (0, _entries["default"])(stops));
      var rect = {};

      if (line) {
        rect = new _rect.Rect(line);
        rect = {
          x1: rect.x,
          y1: rect.y,
          x2: rect.x2,
          y2: rect.y2
        };
      } //    const { x1, y1, x2, y2 } = line;


      var grad = factory(type + "-gradient", _objectSpread({}, props, {}, rect), defs);
      map.forEach(function (color, o) {
        //console.log('color:' + color + ' o:' + o);
        factory("stop", {
          offset: Math.round(o * 100) + "%",
          stopColor: color
        }, grad);
      });
      return grad;
    }
  }, {
    key: "owner",
    value: function owner(elem) {
      var ret = function ret(tag, props, parent) {
        if (tag === undefined) return this.element;
        return SVG.create.call(SVG, tag, props, parent || this.element);
      };

      ret.element = elem.ownerSVGElement;

      _util["default"].defineGetterSetter(ret, "rect", function () {
        return _element.Element.rect(this.element);
      });

      return ret;
    }
  }, {
    key: "path",
    value: function path() {
      return new SvgPath();
    }
  }]);
  return SVG;
}(_element.Element);

exports.SVG = SVG;
SVG.ns = "http://www.w3.org/2000/svg";
