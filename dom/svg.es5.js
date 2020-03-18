"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SVG = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es7.object.entries");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.map");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _element = require("./element.es5.js");

var _size2 = require("./size.es5.js");

var _point = require("./point.es5.js");

var _rect = require("./rect.es5.js");

var _util = _interopRequireDefault(require("../util.es5.js"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class SVG extends _element.Element {
  static create(name, attr, parent) {
    var svg = document.createElementNS(SVG.ns, name);
    let text, attrfn;

    if (attr.text !== undefined) {
      text = attr.text;
      delete attr.text;
    }

    if (name == "svg") {
      attr.version = "1.1";
      attr.xmlns = SVG.ns;

      attrfn = n => n;
    } else {
      attrfn = _util.default.decamelize;
    }

    _util.default.foreach(attr, (value, name) => svg.setAttribute(attrfn(name, "-"), value));

    if (parent && parent.appendChild) parent.appendChild(svg);
    if (text) svg.innerHTML = text;
    return svg;
  }

  static factory(parent, size = null) {
    let delegate = {
      create: tag => document.createElementNS(SVG.ns, tag),
      append_to: elem => parent.appendChild(elem),
      setattr: (elem, name, value) => name != "ns" && elem.setAttributeNS(document.namespaceURI, _util.default.decamelize(name, "-"), value),
      setcss: (elem, css) => elem.setAttributeNS(null, "style", css)
    };
    if (size == null) size = (0, _size2.Size)(_rect.Rect.round(_element.Element.rect(parent)));
    const _size = size,
          width = _size.width,
          height = _size.height;
    if (parent && parent.tagName == "svg") delegate.root = parent;else if (this !== SVG && this && this.appendChild) delegate.root = this;else {
      delegate.root = SVG.create("svg", {
        width,
        height,
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

      if (typeof root.append == "function") root.append(elem);else root.appendChild(elem);
    };

    return _element.Element.factory(delegate);
  }

  static matrix(element, screen = false) {
    let e = typeof element === "string" ? _element.Element.find(element) : element;
    let fn = screen ? "getScreenCTM" : "getCTM";
    if (e && e[fn]) return Matrix.fromDOMMatrix(e[fn]());
    return null;
  }

  static bbox(element, options = {
    parent: null,
    absolute: false
  }) {
    let e = typeof element === "string" ? _element.Element.find(element, options.parent) : element;
    let bb;

    if (e && e.getBBox) {
      bb = new _rect.Rect(e.getBBox());

      if (options.absolute) {
        let r = _element.Element.rect(element.ownerSVGElement);

        bb.x += r.x;
        bb.y += r.y;
      }

      return bb;
    }

    return _element.Element.rect(e);
  }

  static gradient(type, _ref) {
    let stops = _ref.stops,
        _ref$factory = _ref.factory,
        factory = _ref$factory === void 0 ? SVG.create : _ref$factory,
        _ref$parent = _ref.parent,
        parent = _ref$parent === void 0 ? null : _ref$parent,
        _ref$line = _ref.line,
        line = _ref$line === void 0 ? false : _ref$line,
        props = (0, _objectWithoutProperties2.default)(_ref, ["stops", "factory", "parent", "line"]);
    var defs = factory("defs", {}, parent);
    const map = new Map(stops instanceof Array ? stops : Object.entries(stops));
    let rect = {};

    if (line) {
      rect = new _rect.Rect(line);
      rect = {
        x1: rect.x,
        y1: rect.y,
        x2: rect.x2,
        y2: rect.y2
      };
    }

    let grad = factory(type + "-gradient", _objectSpread({}, props, {}, rect), defs);
    map.forEach((color, o) => {
      factory("stop", {
        offset: Math.round(o * 100) + "%",
        stopColor: color
      }, grad);
    });
    return grad;
  }

  static owner(elem) {
    var ret = function ret(tag, props, parent) {
      if (tag === undefined) return this.element;
      return SVG.create.call(SVG, tag, props, parent || this.element);
    };

    ret.element = elem.ownerSVGElement;

    _util.default.defineGetterSetter(ret, "rect", function () {
      return _element.Element.rect(this.element);
    });

    return ret;
  }

  static path() {
    return new SvgPath();
  }

  static path_iterator(path, numPoints = 100, tr = p => new _point.Point(p)) {
    return _regenerator.default.mark(function _callee() {
      var len, i, pos, point;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            len = e.getTotalLength();
            i = 0;

          case 2:
            if (!(i < numPoints)) {
              _context.next = 10;
              break;
            }

            pos = i * len / numPoints;
            point = e.getPointAtLength(pos);
            _context.next = 7;
            return tr(point);

          case 7:
            i++;
            _context.next = 2;
            break;

          case 10:
          case "end":
            return _context.stop();
        }
      }, _callee);
    })();
  }

}

exports.SVG = SVG;
SVG.ns = "http://www.w3.org/2000/svg";
