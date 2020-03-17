"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReactComponent = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _react = _interopRequireDefault(require("react"));

var _element = require("./element.es5.js");

var _util = _interopRequireDefault(require("../util.es5.js"));

var _jsxFileName = "/home/roman/the-wild-beauty-company/lib/dom/reactComponent.js";
var __jsx = _react["default"].createElement;

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if(Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if(enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for(var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if(i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        (0, _defineProperty2["default"])(target, key, source[key]);
      });
    } else if(Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}

var ReactComponent = (function() {
  function ReactComponent() {
    (0, _classCallCheck2["default"])(this, ReactComponent);
  }

  (0, _createClass2["default"])(ReactComponent, null, [
    {
      key: "create",
      value: function create() {
        var args = Array.prototype.slice.call(arguments);
        var Tag, props;

        if(typeof args[0] == "string") {
          Tag = args.shift();
          props = args.shift();
        } else {
          props = args.shift();
          Tag = props.tagName;
          delete props.tagName;
        }

        var _props = props,
          children = _props.children,
          parent = _props.parent,
          restOfProps = (0, _objectWithoutProperties2["default"])(_props, ["children", "parent"]);
        if(!children) children = args.shift();
        if(!Array.isArray(children)) children = [children];

        var elem = __jsx(
          Tag,
          (0, _extends2["default"])({}, restOfProps, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 21
            },
            __self: this
          }),
          children.map(function(child, key) {
            if(typeof child === "object" && child.tagName !== undefined) {
              var tagName = child.tagName,
                _props2 = (0, _objectWithoutProperties2["default"])(child, ["tagName"]);

              return ReactComponent.create(
                tagName,
                _objectSpread(
                  {
                    key: key
                  },
                  _props2
                )
              );
            }

            return child;
          })
        );

        return elem;
      }
    },
    {
      key: "factory",
      value: function factory(_render_to, root) {
        if(typeof _render_to === "string") _render_to = _element.Element.find(append_to);

        if(typeof _render_to !== "function") {
          root = root || _render_to;

          _render_to = function render_to(component) {
            return require("react-dom").render(component, root || _render_to);
          };
        }

        var ret = function ret() {
          var args = Array.prototype.slice.call(arguments);
          var ret = ReactComponent.create.apply(ReactComponent, args);
          return ret;
        };

        ret.root = root;
        return ret.bind(ret);
      }
    },
    {
      key: "toObject",
      value: function toObject() {
        var ret = [];

        for(var _i = 0, _arr = Array.prototype.slice.call(arguments); _i < _arr.length; _i++) {
          var arg = _arr[_i];
          if(!typeof arg == "object" || arg === null || !arg) continue;
          var tagName = typeof arg.type == "string" ? arg.type : typeof arg.type == "function" ? arg.type.name : "React.Fragment";

          var _ref = arg.props || {},
            children = _ref.children,
            props = (0, _objectWithoutProperties2["default"])(_ref, ["children"]);

          var obj = _objectSpread(
            {
              tagName: tagName
            },
            props
          );

          if(typeof arg.key == "string") obj.key = arg.key;
          if(!children) children = arg.children;

          var arr = _react["default"].Children.toArray(children);

          var numChildren = _react["default"].Children.count(children);

          if(numChildren > 0) {
            obj.children = ReactComponent.toObject.apply(ReactComponent, (0, _toConsumableArray2["default"])(arr));
          }

          ret.push(obj);
        }

        return ret;
      }
    },
    {
      key: "stringify",
      value: function stringify(obj) {
        var tagName = obj.tagName,
          children = obj.children,
          props = (0, _objectWithoutProperties2["default"])(obj, ["tagName", "children"]);
        var str = "<".concat(tagName);

        for(var prop in props) {
          var value = props[prop];

          if(typeof value == "function") {
            value = " ()=>{} ";
          } else if(typeof value == "object") {
            value = _util["default"].inspect(value, {
              indent: "",
              newline: "\n",
              depth: 10,
              spacing: " "
            });
            value = value.replace(/(,?)(\n?[\s]+|\s+)/g, "$1 ");
          } else if(typeof value == "string") {
            value = "'".concat(value, "'");
          }

          str += " ".concat(prop, "={").concat(value, "}");
        }

        if(!children || !children.length) {
          str += " />";
        } else {
          str += ">";
          str += "</".concat(tagName, ">");
        }

        return str;
      }
    }
  ]);
  return ReactComponent;
})();

exports.ReactComponent = ReactComponent;
