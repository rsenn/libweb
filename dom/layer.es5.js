"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Renderer = exports.Layer = void 0;

var _element = require("./element.es5.js");

class Layer extends _element.Element {
  constructor(arg, attr) {
    this.elm = _element.Element.isElement(arg) && arg || _element.Element.create(arg);
    this.rect = _element.Element.rect(this.elm);
  }

}

exports.Layer = Layer;

class Renderer {
  constructor(component, root_node) {
    this.component = component;
    this.root_node = root_node;
  }

  refresh() {
    this.clear();
    ReactDOM.render(this.component, this.root_node);
    const e = this.element = this.root_node.firstChild;

    const xpath = _element.Element.xpath(e);

    return e;
  }

  clear() {
    if (this.element) {
      let parent = this.element.parentNode;
      parent.removeChild(this.element);
      this.element = null;
    }
  }

}

exports.Renderer = Renderer;
