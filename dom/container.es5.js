"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Container = void 0;

var _element = require("./element.es5.js");

class Container {
  static factory(parent, size = null) {
    let delegate = {
      root: null,
      append_to: function append_to(elem, p = null) {
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

}

exports.Container = Container;
