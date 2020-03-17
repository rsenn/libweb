"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SvgPathTracer = SvgPathTracer;
exports["default"] = exports.SvgOverlay = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _react = _interopRequireDefault(require("react"));

var _dom = require("./dom.es5.js");

var _trkl = require("./trkl.es5.js");

var _lazyInitializer = require("./lazyInitializer.es5.js");

var _jsxFileName = "/home/roman/the-wild-beauty-company/lib/svg-overlay.js";
var __jsx = _react["default"].createElement;

function SvgPathTracer(path) {
  var bbox = _dom.SVG.bbox(path);

  var rect = _dom.Element.rect(_dom.SVG.owner(path).element);

  var length = path.getTotalLength();
  var steps = 100;
  var center = bbox.center;
  var self = (0, _defineProperty2["default"])(
    {
      length: length,
      center: center,
      entries: _regenerator["default"].mark(function entries() {
        return _regenerator["default"].wrap(function entries$(_context) {
          while(1) {
            switch ((_context.prev = _context.next)) {
              case 0:
              case "end":
                return _context.stop();
            }
          }
        }, entries);
      })
    },
    Symbol.iterator,
    _regenerator["default"].mark(function _callee() {
      var i, offset, point, relative, angle, distance;
      return _regenerator["default"].wrap(function _callee$(_context2) {
        while(1) {
          switch ((_context2.prev = _context2.next)) {
            case 0:
              i = 0;

            case 1:
              if(!(i < steps)) {
                _context2.next = 12;
                break;
              }

              offset = (i * length) / steps;
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
        }
      }, _callee);
    })
  );
  return self;
}

var SvgOverlay = (function(_React$Component) {
  (0, _inherits2["default"])(SvgOverlay, _React$Component);

  function SvgOverlay(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, SvgOverlay);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(SvgOverlay).call(this, props));
    _this.svg = (0, _lazyInitializer.lazyInitializer)(function(rect, root) {
      var svg = _dom.SVG.create(
        "svg",
        {
          parent: root,
          width: rect.width,
          height: rect.height,
          viewBox: "0 0 ".concat(rect.width, " ").concat(rect.height),
          style: "width: ".concat(rect.width, "px; height: ").concat(rect.height, "px")
        },
        root
      );

      var f = _this.factory();

      if(f) f.root = svg;

      _dom.SVG.create("defs", {}, svg);

      ReactDOM.render(_this.props.children, svg);
      return svg;
    });
    _this.factory = (0, _lazyInitializer.lazyInitializer)(function(root) {
      return _dom.SVG.factory(root || _this.svg());
    });
    _this.paths = [];

    _this.createPaths = function() {
      var f = _this.factory();

      if(typeof f == "function")
        f("rect", {
          width: 100,
          height: 100,
          x: 50,
          y: 50,
          stroke: "red",
          strokeWidth: "4"
        });
    };

    _this.layerRef = {};
    var svgRef = _this.props.svgRef;

    _trkl.trkl.property(_this.layerRef, "current").subscribe(function(ref) {
      var rect = _dom.Element.rect(ref);

      var svg = _dom.SVG.create(
        "svg",
        {
          width: rect.width,
          height: rect.height,
          viewBox: "0 0 ".concat(rect.width, " ").concat(rect.height),
          style: "width: ".concat(rect.width, "px; height: ").concat(rect.height, "px")
        },
        ref
      );

      _dom.SVG.create("defs", {}, svg);

      _this.svg(svg);

      var f = _this.factory();

      f.root = svg;
      if(typeof svgRef == "function")
        svgRef({
          svg: svg,
          factory: f
        });
    });

    if(global.window) {
      window.svgOverlay = (0, _assertThisInitialized2["default"])(_this);
    }

    return _this;
  }

  (0, _createClass2["default"])(SvgOverlay, [
    {
      key: "render",
      value: function render() {
        if(global.window) this.createPaths();
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
  ]);
  return SvgOverlay;
})(_react["default"].Component);

exports.SvgOverlay = SvgOverlay;
var _default = SvgOverlay;
exports["default"] = _default;
