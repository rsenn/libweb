"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReactComponent = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.regexp.replace");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _element = require("./element.cjs");

var _util = _interopRequireDefault(require("../util.cjs"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class ReactComponent {
  static create() {}

  static factory(render_to, root) {
    if (typeof render_to === "string") render_to = _element.Element.find(append_to);

    if (typeof render_to !== "function") {
      root = root || render_to;

      render_to = component => require("react-dom").render(component, root || render_to);
    }

    let ret = function ret() {
      let args = [...arguments];
      let ret = ReactComponent.create.apply(ReactComponent, args);
      return ret;
    };

    ret.root = root;
    return ret.bind(ret);
  }

  static toObject() {
    let ret = [];

    for (var _i = 0, _arr = [...arguments]; _i < _arr.length; _i++) {
      let arg = _arr[_i];
      if (!typeof arg == "object" || arg === null || !arg) continue;
      const tagName = typeof arg.type == "string" ? arg.type : typeof arg.type == "function" ? arg.type.name : "React.Fragment";

      let _ref = arg.props || {},
          children = _ref.children,
          props = (0, _objectWithoutProperties2.default)(_ref, ["children"]);

      let obj = _objectSpread({
        tagName
      }, props);

      if (typeof arg.key == "string") obj.key = arg.key;
      if (!children) children = arg.children;

      const arr = _react.default.Children.toArray(children);

      const numChildren = _react.default.Children.count(children);

      if (numChildren > 0) {
        obj.children = ReactComponent.toObject(...arr);
      }

      ret.push(obj);
    }

    return ret;
  }

  static stringify(obj) {
    const tagName = obj.tagName,
          children = obj.children,
          props = (0, _objectWithoutProperties2.default)(obj, ["tagName", "children"]);
    var str = "<".concat(tagName);

    for (let prop in props) {
      let value = props[prop];

      if (typeof value == "function") {
        value = " ()=>{} ";
      } else if (typeof value == "object") {
        value = _util.default.inspect(value, {
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

}

exports.ReactComponent = ReactComponent;
