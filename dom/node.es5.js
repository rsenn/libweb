"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Node = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es6.array.from");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class Node {
  static parents(node) {
    return _regenerator.default.mark(function _callee() {
      var n;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
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
      }, _callee);
    })();
  }

  static depth(node) {
    let r = 0;

    while (node && node.parentNode) {
      r++;
      node = node.parentNode;
    }

    return r;
  }

  static attrs(node) {
    return node.attributes && node.attributes.length > 0 ? Array.from(node.attributes).reduce((acc, attr) => _objectSpread({}, acc, {
      [attr.name]: isNaN(parseFloat(attr.value)) ? attr.value : parseFloat(attr.value)
    }), {}) : {};
  }

}

exports.Node = Node;
var _default = Node;
exports.default = _default;
