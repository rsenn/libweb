"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports["default"] = exports.Node = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _parseFloat2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-float"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _from = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/from"));

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

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

var Node = /*#__PURE__*/ (function() {
  function Node() {
    (0, _classCallCheck2["default"])(this, Node);
  }

  (0, _createClass2["default"])(Node, null, [
    {
      key: "parents",
      value: function parents(node) {
        return /*#__PURE__*/ _regenerator["default"].mark(function _callee() {
          var n;
          return _regenerator["default"].wrap(function _callee$(_context) {
            while(1) {
              switch ((_context.prev = _context.next)) {
                case 0:
                  n = node;

                case 1:
                  if(!n) {
                    _context.next = 4;
                    break;
                  }

                  _context.next = 4;
                  return n;

                case 4:
                  if(n && (n = n.parentNode)) {
                    _context.next = 1;
                    break;
                  }

                case 5:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        })();
      }
    },
    {
      key: "depth",
      value: function depth(node) {
        var r = 0;

        while(node && node.parentNode) {
          r++;
          node = node.parentNode;
        }

        return r;
      }
    },
    {
      key: "attrs",
      value: function attrs(node) {
        return node.attributes && node.attributes.length > 0
          ? (0, _from["default"])(node.attributes).reduce(function(acc, attr) {
              return _objectSpread({}, acc, (0, _defineProperty3["default"])({}, attr.name, isNaN((0, _parseFloat2["default"])(attr.value)) ? attr.value : (0, _parseFloat2["default"])(attr.value)));
            }, {})
          : {};
      }
    }
  ]);
  return Node;
})();

exports.Node = Node;
var _default = Node;
exports["default"] = _default;
