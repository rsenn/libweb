"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Select = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _jsxFileName = "/home/roman/Dokumente/Sources/plot-cv/lib/dom/select.js";
var __jsx = _react.default.createElement;

class Select extends _react.default.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const _this$props = this.props,
          options = _this$props.options,
          props = (0, _objectWithoutProperties2.default)(_this$props, ["options"]);

    const Option = (_ref) => {
      let children = _ref.children,
          props = (0, _objectWithoutProperties2.default)(_ref, ["children"]);
      return __jsx("option", (0, _extends2.default)({}, props, {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 14,
          columnNumber: 14
        }
      }), children);
    };
  }

}

exports.Select = Select;
