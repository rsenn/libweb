"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SvgPathTracer = SvgPathTracer;
exports.default = exports.SvgOverlay = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

var _react = _interopRequireDefault(require("react"));

var _dom = require("./dom.es5.js");

var _trkl = require("./trkl.es5.js");

var _lazyInitializer = require("./lazyInitializer.es5.js");

var _jsxFileName = "/home/roman/the-wild-beauty-company/lib/svg-overlay.js";
var __jsx = _react.default.createElement;

function SvgPathTracer(path) {
  var bbox = _dom.SVG.bbox(path);

  var rect = _dom.Element.rect(_dom.SVG.owner(path).element);

  var length = path.getTotalLength();
  var steps = 100;
  var center = bbox.center;
  var self = {
    length,
    center,

    entries() {
      return _regenerator.default.mark(function _callee() {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
            case "end":
              return _context.stop();
          }
        }, _callee);
      })();
    },

    [Symbol.iterator]() {
      return _regenerator.default.mark(function _callee2() {
        var i, offset, point, relative, angle, distance;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              i = 0;

            case 1:
              if (!(i < steps)) {
                _context2.next = 12;
                break;
              }

              offset = i * length / steps;
              point = new _dom.Point(path.getPointAtLength(offset));
              relative = _dom.Point.diff(point, center);
              angle = _dom.Point.toAngle(relative);
              distance = _dom.Point.distance(relative);
              _context2.next = 9;
              return [offset, point];

            case 9:
              i++;
              _context2.next = 1;
              break;

            case 12:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      })();
    }

  };
  return self;
}

class SvgOverlay extends _react.default.Component {
  constructor(props) {
    super(props);
    this.svg = (0, _lazyInitializer.lazyInitializer)((rect, root) => {
      var svg = _dom.SVG.create("svg", {
        parent: root,
        width: rect.width,
        height: rect.height,
        viewBox: "0 0 ".concat(rect.width, " ").concat(rect.height),
        style: "width: ".concat(rect.width, "px; height: ").concat(rect.height, "px")
      }, root);

      const f = this.factory();
      if (f) f.root = svg;

      _dom.SVG.create("defs", {}, svg);

      ReactDOM.render(this.props.children, svg);
      return svg;
    });
    this.factory = (0, _lazyInitializer.lazyInitializer)(root => _dom.SVG.factory(root || this.svg()));
    this.paths = [];

    this.createPaths = () => {
      const f = this.factory();
      if (typeof f == "function") f("rect", {
        width: 100,
        height: 100,
        x: 50,
        y: 50,
        stroke: "red",
        strokeWidth: "4"
      });
    };

    this.layerRef = {};
    const svgRef = this.props.svgRef;

    _trkl.trkl.property(this.layerRef, "current").subscribe(ref => {
      var rect = _dom.Element.rect(ref);

      var svg = _dom.SVG.create("svg", {
        width: rect.width,
        height: rect.height,
        viewBox: "0 0 ".concat(rect.width, " ").concat(rect.height),
        style: "width: ".concat(rect.width, "px; height: ").concat(rect.height, "px")
      }, ref);

      _dom.SVG.create("defs", {}, svg);

      this.svg(svg);
      const f = this.factory();
      f.root = svg;
      if (typeof svgRef == "function") svgRef({
        svg,
        factory: f
      });
    });

    if (global.window) {
      window.svgOverlay = this;
    }
  }

  render() {
    if (global.window) this.createPaths();
    return __jsx("div", {
      className: "svg-overlay",
      ref: this.layerRef,
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100%",
        pointerEvents: "none"
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 118
      },
      __self: this
    });
  }

}

exports.SvgOverlay = SvgOverlay;
var _default = SvgOverlay;
exports.default = _default;
