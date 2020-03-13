"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.Select = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/inherits"));

var _react = _interopRequireDefault(require("react"));

var _jsxFileName = "/home/roman/the-wild-beauty-company/lib/dom/select.js";
var __jsx = _react["default"].createElement;

var Select = /*#__PURE__*/ (function(_React$Component) {
  (0, _inherits2["default"])(Select, _React$Component);

  function Select(props) {
    (0, _classCallCheck2["default"])(this, Select);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Select).call(this, props));
  }

  (0, _createClass2["default"])(Select, [
    {
      key: "render",
      value: function render() {
        var _this$props = this.props,
          options = _this$props.options,
          props = (0, _objectWithoutProperties2["default"])(_this$props, ["options"]); //console.log('Select.render ', { options, props });

        var Option = function Option(_ref) {
          var children = _ref.children,
            props = (0, _objectWithoutProperties2["default"])(_ref, ["children"]);
          //console.log('Select.render Option ', { children, props });
          return __jsx(
            "option",
            (0, _extends2["default"])({}, props, {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 14
              },
              __self: this
            }),
            children
          );
        }; //return <select {...props}>{
        //Object.keys(options).map(key =>
        //<Option value={key}>{options[key]}</Option>
        //)
        //}</select>
      }
    }
  ]);
  return Select;
})(_react["default"].Component);

exports.Select = Select;
