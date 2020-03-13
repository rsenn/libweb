import { Element } from "./element.js";
import { Size } from "./size.js";
import { Rect } from "./rect.js";
import Util from "../util.js";
export class SVG extends Element {
  static create(name, attr, parent) {
    var svg = document.createElementNS(SVG.ns, name);
    let text;

    if (attr.text !== undefined) {
      text = attr.text;
      delete attr.text;
    }

    if (name == "svg") {
      attr.version = "1.1";
      attr.xmlns = SVG.ns;
    }

    Util.foreach(attr, (value, name) => svg.setAttribute(Util.decamelize(name, "-"), value));
    if (parent && parent.appendChild) parent.appendChild(svg);
    if (text) svg.innerHTML = text;
    return svg;
  }

  static factory(parent, size = null) {
    let delegate = {
      create: tag => document.createElementNS(SVG.ns, tag),
      append_to: elem => parent.appendChild(elem),
      setattr: (elem, name, value) => name != "ns" && elem.setAttributeNS(document.namespaceURI, Util.decamelize(name, "-"), value),
      setcss: (elem, css) => elem.setAttributeNS(null, "style", css)
    };
    if (size == null) size = Size(Rect.round(Element.rect(parent)));
    const {
      width,
      height
    } = size;
    if (parent && parent.tagName == "svg") delegate.root = parent;else if (this !== SVG && this && this.appendChild) delegate.root = this;else {
      delegate.root = SVG.create("svg", {
        width,
        height,
        viewBox: "0 0 " + width + " " + height + ""
      }, parent);
    }

    if (!delegate.root.firstElementChild || delegate.root.firstElementChild.tagName != "defs") {
      SVG.create("defs", {}, delegate.root);
    }

    delegate.append_to = function (elem, p) {
      var root = p || this.root;

      if (elem.tagName.indexOf("Gradient") != -1) {
        root = root.querySelector("defs");
      }

      if (typeof root.append == "function") root.append(elem);else root.appendChild(elem); //console.log('append_to ', elem, ', root=', root);
    };

    return Element.factory(delegate);
  }

  static matrix(element, screen = false) {
    let e = typeof element === "string" ? Element.find(element) : element;
    let fn = screen ? "getScreenCTM" : "getCTM";
    if (e && e[fn]) return Matrix.fromDOMMatrix(e[fn]());
    return null;
  }

  static bbox(element, options = {
    parent: null,
    absolute: false
  }) {
    let e = typeof element === "string" ? Element.find(element, options.parent) : element;
    let bb;
    f;

    if (e && e.getBBox) {
      bb = new Rect(e.getBBox());

      if (options.absolute) {
        let r = Element.rect(element.ownerSVGElement);
        bb.x += r.x;
        bb.y += r.y;
      }

      return bb;
    }

    return Element.rect(e);
  }

  static gradient(type, {
    stops,
    factory = SVG.create,
    parent = null,
    line = false,
    ...props
  }) {
    var defs = factory("defs", {}, parent);
    const map = new Map(stops instanceof Array ? stops : Object.entries(stops));
    let rect = {};

    if (line) {
      rect = new Rect(line);
      rect = {
        x1: rect.x,
        y1: rect.y,
        x2: rect.x2,
        y2: rect.y2
      };
    } //    const { x1, y1, x2, y2 } = line;


    let grad = factory(type + "-gradient", { ...props,
      ...rect
    }, defs);
    map.forEach((color, o) => {
      //console.log('color:' + color + ' o:' + o);
      factory("stop", {
        offset: Math.round(o * 100) + "%",
        stopColor: color
      }, grad);
    });
    return grad;
  }

  static owner(elem) {
    var ret = function (tag, props, parent) {
      if (tag === undefined) return this.element;
      return SVG.create.call(SVG, tag, props, parent || this.element);
    };

    ret.element = elem.ownerSVGElement;
    Util.defineGetterSetter(ret, "rect", function () {
      return Element.rect(this.element);
    });
    return ret;
  }

  static path() {
    return new SvgPath();
  }

}
SVG.ns = "http://www.w3.org/2000/svg";

