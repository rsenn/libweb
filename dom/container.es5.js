"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Container = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _element = require("./element.es5.js");

var Container = function () {
  function Container() {
    (0, _classCallCheck2["default"])(this, Container);
  }

  (0, _createClass2["default"])(Container, null, [{
    key: "factory",
    value: function factory(parent) {
      var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var delegate = {
        root: null,
        append_to: function append_to(elem) {
          var p = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          if (p == null) {
            if (this.root == null) {
              this.root = document.createElement("div");
              this.append_to(this.root, parent);
            }

            p = this.root;
          }

          p.appendChild(elem);
        }
      };
      return _element.Element.factory(delegate);
    }
  }]);
  return Container;
}();

exports.Container = Container;
