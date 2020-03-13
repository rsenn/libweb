import { Element } from "./element.js";

/**
 *
 */
export class Layer extends Element {
  constructor(arg, attr) {
    this.elm = (Element.isElement(arg) && arg) || Element.create(arg);
    this.rect = Element.rect(this.elm);
  }
}

export class Renderer {
  constructor(component, root_node) {
    this.component = component;
    this.root_node = root_node;
  }
  refresh() {
    this.clear();
    ReactDOM.render(this.component, this.root_node);

    const e = (this.element = this.root_node.firstChild);
    const xpath = Element.xpath(e);

    //console.log('Renderer.refresh ', { xpath, e });
    return e;
  }
  clear() {
    if(this.element) {
      let parent = this.element.parentNode;
      parent.removeChild(this.element);
      this.element = null;
    }
  }
}
