"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.ReactComponent = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/extends"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _react = _interopRequireDefault(require("react"));

var _element = require("./element.es5.js");

var _util = _interopRequireDefault(require("../util.es5.js"));

var _jsxFileName = "/home/roman/the-wild-beauty-company/lib/dom/reactComponent.js";
var __jsx = _react["default"].createElement;

function ownKeys(object, enumerableOnly) {
  var keys = (0, _keys["default"])(object);
  if(_getOwnPropertySymbols["default"]) {
    var symbols = (0, _getOwnPropertySymbols["default"])(object);
    if(enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable;
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
        (0, _defineProperty3["default"])(target, key, source[key]);
      });
    } else if(_getOwnPropertyDescriptors["default"]) {
      (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key));
      });
    }
  }
  return target;
}

var ReactComponent = /*#__PURE__*/ (function() {
  function ReactComponent() {
    (0, _classCallCheck2["default"])(this, ReactComponent);
  }

  (0, _createClass2["default"])(ReactComponent, null, [
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

        var ret = function render_factory(Tag, _ref) {
          var is_root = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
          var parent = _ref.parent,
            children = _ref.children,
            props = (0, _objectWithoutProperties2["default"])(_ref, ["parent", "children"]);

          var elem = __jsx(
            Tag,
            (0, _extends2["default"])({}, props, {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 14
              },
              __self: this
            }),
            (0, _isArray["default"])(children)
              ? children.map(function(child, key) {
                  if(typeof child === "object") {
                    var tagName = child.tagName,
                      _props = (0, _objectWithoutProperties2["default"])(child, ["tagName"]);

                    return render_factory(
                      tagName,
                      _objectSpread(
                        {
                          key: key
                        },
                        _props
                      ),
                      false
                    );
                  }

                  return child;
                })
              : undefined
          ); //console.log('elem: ', elem);

          if(is_root && _render_to) _render_to(elem, parent || this.root);
          return elem;
        };

        ret.root = root;
        return ret.bind(ret);
      }
    },
    {
      key: "object",
      value: function object() {
        var ret = [];

        for(var _i = 0, _arr = Array.prototype.slice.call(arguments); _i < _arr.length; _i++) {
          var arg = _arr[_i];
          if(!typeof arg == "object" || arg === null || !arg) continue;
          var tagName = arg.type && arg.type.name;

          var _ref2 = arg.props || {},
            children = _ref2.children,
            props = (0, _objectWithoutProperties2["default"])(_ref2, ["children"]);

          var obj = _objectSpread(
            {
              tagName: tagName
            },
            props
          );

          if(typeof arg.key == "string") obj.key = arg.key;
          if(!children) children = arg.children;

          if(_react["default"].Children.count(children) > 0) {
            var arr = _react["default"].Children.toArray(children);

            obj.children = ReactComponent.object.apply(ReactComponent, (0, _toConsumableArray2["default"])(arr));
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
