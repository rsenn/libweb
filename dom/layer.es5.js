"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.Renderer = exports.Layer = void 0;

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/possibleConstructorReturn"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/inherits"));

var _element = require("./element.es5.js");

/**
 *
 */
var Layer = /*#__PURE__*/ (function(_Element) {
  (0, _inherits2["default"])(Layer, _Element);

  function Layer(arg, attr) {
    var _this;

    (0, _classCallCheck2["default"])(this, Layer);
    _this.elm = (_element.Element.isElement(arg) && arg) || _element.Element.create(arg);
    _this.rect = _element.Element.rect(_this.elm);
    return (0, _possibleConstructorReturn2["default"])(_this);
  }

  return Layer;
})(_element.Element);

exports.Layer = Layer;

var Renderer = /*#__PURE__*/ (function() {
  function Renderer(component, root_node) {
    (0, _classCallCheck2["default"])(this, Renderer);
    this.component = component;
    this.root_node = root_node;
  }

  (0, _createClass2["default"])(Renderer, [
    {
      key: "refresh",
      value: function refresh() {
        this.clear();
        ReactDOM.render(this.component, this.root_node);
        var e = (this.element = this.root_node.firstChild);

        var xpath = _element.Element.xpath(e); //console.log('Renderer.refresh ', { xpath, e });

        return e;
      }
    },
    {
      key: "clear",
      value: function clear() {
        if(this.element) {
          var parent = this.element.parentNode;
          parent.removeChild(this.element);
          this.element = null;
        }
      }
    }
  ]);
  return Renderer;
})();

exports.Renderer = Renderer;
