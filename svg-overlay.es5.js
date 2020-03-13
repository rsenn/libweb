"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.SvgPathTracer = SvgPathTracer;
exports["default"] = exports.SvgOverlay = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _iterator = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/symbol/iterator"));

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _react = _interopRequireDefault(require("react"));

var _dom.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js = require("./dom.es5.js");

var _trkl.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js = require("./trkl.es5.js");

var _lazyInitializer.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js = require("./lazyInitializer.es5.js");

var __jsx = _react["default"].createElement;

function SvgPathTracer(path) {
  var bbox = _dom.SVG.bbox(path);

  var rect = _dom.Element.rect(_dom.SVG.owner(path).element);

  var length = path.getTotalLength();
  var steps = 100;
  var center = bbox.center; //console.log("SvgPathTracer ", { center, bbox, rect, length });

  var self = (0, _defineProperty2["default"])({
    length: length,
    center: center,
    entries: /*#__PURE__*/_regenerator["default"].mark(function entries() {
      return _regenerator["default"].wrap(function entries$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
            case "end":
              return _context.stop();
          }
        }
      }, entries);
    })
  }, _iterator["default"], /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var i, offset, point, relative, angle, distance;
    return _regenerator["default"].wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
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
      }
    }, _callee);
  }));
  return self;
}

var SvgOverlay = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2["default"])(SvgOverlay, _React$Component);

  //layer = lazyInitializer(() => Element.create('div', { id: 'svg-overlay', parent: document.body }));
  function SvgOverlay(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, SvgOverlay);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(SvgOverlay).call(this, props));
    _this.svg = (0, _lazyInitializer.lazyInitializer)(function (rect, root) {
      //console.log("lazyInitializer: ", { rect, root });
      var svg = _dom.SVG.create("svg", {
        parent: root,
        width: rect.width,
        height: rect.height,
        viewBox: "0 0 ".concat(rect.width, " ").concat(rect.height),
        style: "width: ".concat(rect.width, "px; height: ").concat(rect.height, "px")
      }, root);

      var f = _this.factory();

      if (f) f.root = svg;

      _dom.SVG.create("defs", {}, svg);

      ReactDOM.render(_this.props.children, svg); //

      return svg;
    });
    _this.factory = (0, _lazyInitializer.lazyInitializer)(function (root) {
      return _dom.SVG.factory(root || _this.svg());
    });
    _this.paths = [];

    _this.createPaths = function () {
      var f = _this.factory();

      if (typeof f == "function") f("rect", {
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

    _trkl.trkl.property(_this.layerRef, "current").subscribe(function (ref) {
      //console.log("layerRef: ", ref);
      var rect = _dom.Element.rect(ref);

      var svg = _dom.SVG.create("svg", {
        width: rect.width,
        height: rect.height,
        viewBox: "0 0 ".concat(rect.width, " ").concat(rect.height),
        style: "width: ".concat(rect.width, "px; height: ").concat(rect.height, "px")
      }, ref);

      _dom.SVG.create("defs", {}, svg);
      /* SVG.create(
        "rect",
        {
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          stroke: "#000",
          strokeWidth: 2,
          fill: "rgb(0,255,0)",
          "fill-opacity": 0.5
        },
        svg
      );*/


      _this.svg(svg);

      var f = _this.factory();

      f.root = svg;
      if (typeof svgRef == "function") svgRef({
        svg: svg,
        factory: f
        /*(name,props) => f(name,props, svg) */

      }); //console.log("SvgOverlay: ", { svg, rect });
      //   this.createPaths();
    });

    if (global.window) {
      window.svgOverlay = (0, _assertThisInitialized2["default"])(_this);
    }

    return _this;
  }

  (0, _createClass2["default"])(SvgOverlay, [{
    key: "render",
    value: function render() {
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
        }
      });
    }
  }]);
  return SvgOverlay;
}(_react["default"].Component);

exports.SvgOverlay = SvgOverlay;
var _default = SvgOverlay;
exports["default"] = _default;
