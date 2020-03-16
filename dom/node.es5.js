"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.Node = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var Node = function () {
  function Node() {
    (0, _classCallCheck2["default"])(this, Node);
  }

  (0, _createClass2["default"])(Node, null, [{
    key: "parents",
    value: function parents(node) {
      return _regenerator["default"].mark(function _callee() {
        var n;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                n = node;

              case 1:
                if (!n) {
                  _context.next = 4;
                  break;
                }

                _context.next = 4;
                return n;

              case 4:
                if (n && (n = n.parentNode)) {
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
  }, {
    key: "depth",
    value: function depth(node) {
      var r = 0;

      while (node && node.parentNode) {
        r++;
        node = node.parentNode;
      }

      return r;
    }
  }, {
    key: "attrs",
    value: function attrs(node) {
      return node.attributes && node.attributes.length > 0 ? Array.from(node.attributes).reduce(function (acc, attr) {
        return _objectSpread({}, acc, (0, _defineProperty2["default"])({}, attr.name, isNaN(parseFloat(attr.value)) ? attr.value : parseFloat(attr.value)));
      }, {}) : {};
    }
  }]);
  return Node;
}();

exports.Node = Node;
var _default = Node;
exports["default"] = _default;
