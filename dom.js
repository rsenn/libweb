var ReactDOM = require("react-dom").ReactDOM;
var SvgPath = require("./svg-path.js");

import Util from "./util.js";

import { Point, isPoint } from "./dom/point.js";
import { Size, isSize } from "./dom/size.js";
import { Line, isLine } from "./dom/line.js";
import { Rect, isRect } from "./dom/rect.js";
import { PointList } from "./dom/pointList.js";
import { RGBA, isRGBA } from "./dom/rgba.js";
import { HSLA, isHSLA } from "./dom/hsla.js";
import { Matrix, isMatrix, MatrixProps } from "./dom/matrix.js";
import { BBox } from "./dom/bbox.js";
import { TRBL } from "./dom/trbl.js";
import { Timer } from "./dom/timer.js";
import { Tree } from "./dom/tree.js";
import { Node } from "./dom/node.js";
import { Element,isElement } from "./dom/element.js";
import { CSS } from "./dom/css.js";
import { SVG } from "./dom/svg.js";

export function dom() {
  let args = [...arguments];
  let ret = Util.array();

  const extend = (e, functions) => {
    const keys = [...Util.members(functions)].filter(key => ["callee", "caller", "arguments", "call", "bind", "apply", "prototype", "constructor", "length"].indexOf(key) == -1 && typeof functions[key] == "function");
    for(let key of keys) if(e[key] === undefined) e[key] = functions[key].bind(functions, e);
    /* function() {
          return functions[key].apply(functions, [this, ...arguments]);
        };*/
  };

  args = args.map(arg => (typeof arg == "string" ? Element.findAll(arg) : arg));

  for(let e of args) {
    if(e instanceof SVGSVGElement) extend(e, SVG);
    else if(e instanceof HTMLElement) {
      extend(e, Element);
      ElementPosProps(e);
      ElementSizeProps(e);
    }

    ret.push(e);
  }
  if(ret.length == 1) ret = ret[0];
  return ret;
}

/**
 * Determines if number.
 *
 * @return     {(Object|Point|boolean|string)}  True if number, False otherwise.
 */
export const isNumber = a => {
  return String(a).replace(/^[0-9]*$/, "") == "";
};

export function Align(arg) {}

Align.CENTER = 0;
Align.LEFT = 1;
Align.RIGHT = 2;

Align.MIDDLE = 0;
Align.TOP = 4;
Align.BOTTOM = 8;

Align.horizontal = alignment => alignment & (Align.LEFT | Align.RIGHT);
Align.vertical = alignment => alignment & (Align.TOP | Align.BOTTOM);

export const Anchor = Align;

export function Unit(str) {
  let u =
    this instanceof Unit
      ? this
      : {
          format(number) {
            return `${number}${this.name}`;
          }
        };
  u.name = str.replace(/^[a-z]*/, "");
  return u;
}

export function ScalarValue() {}


const ifdef = (value, def, nodef) => (value !== undefined ? def : nodef);



export class Container {
  static factory(parent, size = null) {
    let delegate = {
      root: null,
      append_to: function(elem, p = null) {
        if(p == null) {
          if(this.root == null) {
            this.root = document.createElement("div");
            this.append_to(this.root, parent);
          }
          p = this.root;
        }
        p.appendChild(elem);
      }
    };
    return Element.factory(delegate);
  }
}

export class ReactComponent {
  static factory = (render_to, root) => {
    if(typeof render_to === "string") render_to = Element.find(append_to);
    if(typeof render_to !== "function") {
      root = root || render_to;
      render_to = component => require("react-dom").render(component, root || render_to);
    }
    let ret = function render_factory(Tag, { parent, children, ...props }, is_root = true) {
      const elem = (
        <Tag {...props}>
          {Array.isArray(children)
            ? children.map((child, key) => {
                if(typeof child === "object") {
                  const { tagName, ...props } = child;
                  return render_factory(tagName, { key, ...props }, false);
                }
                return child;
              })
            : undefined}
        </Tag>
      );
      //console.log('elem: ', elem);
      if(is_root && render_to) render_to(elem, parent || this.root);
      return elem;
    };
    ret.root = root;
    return ret.bind(ret);
  };

  static object() {
    let ret = [];
    for(let arg of [...arguments]) {
      if(!typeof arg == "object" || arg === null || !arg) continue;

      const tagName = arg.type && arg.type.name;
      let { children, ...props } = arg.props || {};
      let obj = { tagName, ...props };
      if(typeof arg.key == "string") obj.key = arg.key;
      if(!children) children = arg.children;

      if(React.Children.count(children) > 0) {
        const arr = React.Children.toArray(children);
        obj.children = ReactComponent.object(...arr);
      }
      ret.push(obj);
    }
    return ret;
  }

  static stringify(obj) {
    const { tagName, children, ...props } = obj;
    var str = `<${tagName}`;
    for(let prop in props) {
      let value = props[prop];

      if(typeof value == "function") {
        value = " ()=>{} ";
      } else if(typeof value == "object") {
        value = Util.inspect(value, { indent: "", newline: "\n", depth: 10, spacing: " " });
        value = value.replace(/(,?)(\n?[\s]+|\s+)/g, "$1 ");
      } else if(typeof value == "string") {
        value = `'${value}'`;
      }
      str += ` ${prop}={${value}}`;
    }

    if(!children || !children.length) {
      str += " />";
    } else {
      str += ">";
      str += `</${tagName}>`;
    }
    return str;
  }
}

/**
 *
 */
class Layer extends Element {
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

export class Select extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { options, ...props } = this.props;

    //console.log('Select.render ', { options, props });
    const Option = ({ children, ...props }) => {
      //console.log('Select.render Option ', { children, props });

      return <option {...props}>{children}</option>;
    };

    //return <select {...props}>{
    //Object.keys(options).map(key =>
    //<Option value={key}>{options[key]}</Option>
    //)
    //}</select>
  }
}

//Create an object:

export function ElementRectProxy(element) {
  this.element = element;
}
ElementRectProxy.prototype = {
  element: null,
  getPos: function(fn = rect => rect) {
    return fn(Element.position(this.element));
  },
  getRect: function(fn = rect => rect) {
    return fn(Element.rect(this.element, { round: false }));
  },
  setPos: function(pos) {
    Element.move.apply(Element, [this.element, ...arguments]);
  },
  setSize: function(size) {
    Element.resize.apply(Element, [this.element, ...arguments]);
  },
  changeRect: function(fn = (rect, e) => rect) {
    let r = Element.getRect(this.element);
    if(typeof fn == "function") r = fn(r, this.element);

    Element.setRect(this.element, r);
  },
  setRect: function(arg) {
    let rect = arg;
    if(typeof arg == "function") {
      rect = arg(this.getRect());
    }
    Element.rect(this.element, rect);
    /*    rect = new Rect(rect);
    Element.setCSS(this.element, { ...rect.toCSS(rect), position: 'absolute' });
*/
  }
};
const propSetter = (prop, proxy) => value => {
  //proxy.changeRect(rect => { rect[prop] = value; return rect; })
  let r = proxy.getRect();
  r[prop] = value;
  //console.log('New rect: ', r);
  proxy.setRect(r);
};

const computedSetter = (proxy, compute) =>
  function(value) {
    var r = proxy.getRect();
    r = compute(value, r);
    if(r && r.x !== undefined) proxy.setRect(oldrect => r);
    return r;
  };

export const ElementXYProps = element => {
  Util.defineGetterSetter(
    element,
    "x",
    function() {
      return Element.getRect(this).x;
    },
    function(val) {
      this.style.left = `${val}px`;
    }
  );
  Util.defineGetterSetter(
    element,
    "y",
    function() {
      return Element.getRect(this).y;
    },
    function(val) {
      this.style.top = `${val}px`;
    }
  );
};

export const ElementWHProps = element => {
  Util.defineGetterSetter(
    element,
    "w",
    function() {
      return Element.getRect(this).width;
    },
    function(val) {
      this.style.width = `${val}px`;
    }
  );
  Util.defineGetterSetter(
    element,
    "h",
    function() {
      return Element.getRect(this).height;
    },
    function(val) {
      this.style.height = `${val}px`;
    }
  );
};

export const ElementPosProps = (element, proxy) => {
  proxy = proxy || new ElementRectProxy(element);
  Util.defineGetterSetter(
    element,
    "x",
    () => proxy.getPos().x,
    x => proxy.setPos({ x })
  );
  Util.defineGetterSetter(
    element,
    "x1",
    () => proxy.getPos().x,
    value =>
      proxy.setRect(rect => {
        let extend = rect.x - value;
        rect.width += extend;
        return rect;
      })
  );
  Util.defineGetterSetter(
    element,
    "x2",
    () => proxy.getRect(rect => rect.x + rect.width),
    value =>
      proxy.setRect(rect => {
        let extend = value - (rect.x + rect.w);
        rect.width += extend;
        return rect;
      })
  );
  Util.defineGetterSetter(
    element,
    "y",
    () => proxy.getPos().y,
    y => proxy.setPos({ y })
  );
  Util.defineGetterSetter(
    element,
    "y1",
    () => proxy.getPos().y,
    value =>
      proxy.setRect(rect => {
        let y = rect.y - value;
        rect.height += y;
        return rect;
      })
  );
  Util.defineGetterSetter(
    element,
    "y2",
    () => proxy.getRect(rect => rect.y + rect.height),
    value =>
      proxy.setRect(rect => {
        let y = value - (rect.y + rect.height);
        rect.height += y;
        return rect;
      })
  );
};

export const ElementSizeProps = (element, proxy) => {
  proxy = proxy || new ElementRectProxy(element);
  Util.defineGetterSetter(
    element,
    "w",
    () => proxy.getRect().width,
    width => proxy.setSize({ width })
  );
  Util.defineGetterSetter(
    element,
    "width",
    () => proxy.getRect().width,
    width => proxy.setSize({ width })
  );
  Util.defineGetterSetter(
    element,
    "h",
    () => proxy.getRect().height,
    width => proxy.setSize({ height })
  );
  Util.defineGetterSetter(
    element,
    "height",
    () => proxy.getRect().height,
    width => proxy.setSize({ height })
  );
};

export const ElementRectProps = (element, proxy) => {
  /*Util.defineGetterSetter(element, 'w', () => proxy.getRect().width, propSetter('width', proxy)); Util.defineGetterSetter(element, 'width', () => proxy.getRect().width, propSetter('width', proxy));
    Util.defineGetterSetter(element, 'h', () => proxy.getRect().height, propSetter('height', proxy)); Util.defineGetterSetter(element, 'height', () => proxy.getRect().height, propSetter('height', proxy) });*/
};
export const ElementTransformation = () => ({
  rotate: 0,
  translate: new Point(0, 0),
  scale: new Size(0, 0),
  toString() {
    const { rotate, translate, scale } = this;
    return `rotate(${rotate}deg) translate(${translate.x}, ${translate.y}) scale(${scale.w},${scale.h})`;
  }
});

export const CSSTransformSetters = element => ({
  transformation: ElementTransformation(),
  get rotate() {
    return this.transformation.rotate;
  },
  set rotate(a) {
    this.transformation.rotate = a;
  },
  get translate() {
    return this.transformation.translate;
  },
  set translate(point) {
    this.transformation.translate.set(point.x, point.y);
  },
  get scale() {
    return this.transformation.scale;
  },
  set scale(size) {
    this.transformation.scale.set(size.width, size.height);
  },
  updateTransformation() {
    const t = this.transformation.toString();
    this.style.transform = t;
  }
});

export class Transition {
  property = "none";
  delay = "";
  duration = "";
  timing = "";

  constructor(property, delay, duration, timing) {
    this.property = property;
    this.delay = delay;
    this.duration = duration;
    this.timing = timing;
  }

  static list() {
    return new TransitionList(...arguments);
  }
}

export class TransitionList extends Array {
  constructor() {
    const args = [...arguments];

    args.forEach(arg => this.push(arg));
  }

  propertyList(name) {
    return this.map(transition => transition[name]);
  }

  get css() {
    return {
      transitionDelay: this.propertyList("delay").join(", "),
      transitionDuration: this.propertyList("duration").join(", "),
      transitionProperty: this.propertyList("property").join(", "),
      transitionTimingFunction: this.propertyList("timing").join(", ")
    };
  }
}

export const RandomColor = () => {
  const c = HSLA.random();
  return c.toString();
};
/*
    function(value) {
      element.transformation[transform_name]
      element.style.transform =
    }*/
export const isPointList = inst => {};
export const isTRBL = inst => {};
export const isTimer = inst => {};
export const isTree = inst => {};
export const isCSS = inst => {};
export const isContainer = inst => {};
export const isSVG = inst => inst.tagName.toLowerCase() == "svg";

export const isReactComponent = inst => {};
export const isRenderer = inst => {};
export const isSelect = inst => {};


export { Point, isPoint } from "./dom/point.js";
export { Size, isSize } from "./dom/size.js";
export { Line, isLine } from "./dom/line.js";
export { Rect, isRect } from "./dom/rect.js";
export { PointList } from "./dom/pointList.js";
export { RGBA, isRGBA } from "./dom/rgba.js";
export { HSLA, isHSLA } from "./dom/hsla.js";
export { Matrix, isMatrix, MatrixProps } from "./dom/matrix.js";
export { BBox } from "./dom/bbox.js";
export { TRBL } from "./dom/trbl.js";
export { Timer } from "./dom/timer.js";
export { Tree } from "./dom/tree.js";
export { Node } from "./dom/node.js";
export { Element,isElement } from "./dom/element.js";
export { CSS } from "./dom/css.js";
export { SVG } from "./dom/svg.js";


export default Object.assign(dom, {
  Align,
  Anchor,
  Container,
  CSS,
  CSSTransformSetters,
  Node,
  Element,
  ElementPosProps,
  ElementRectProps,
  ElementRectProxy,
  ElementSizeProps,
  ElementTransformation,
  ElementWHProps,
  ElementXYProps,
  HSLA,
  isContainer,
  isCSS,
  isElement,
  isHSLA,
  isLine,
  isMatrix,
  isNumber,
  isPoint,
  isPointList,
  isReactComponent,
  isRect,
  isRenderer,
  isRGBA,
  isSelect,
  isSize,
  isSVG,
  isTimer,
  isTRBL,
  isTree,
  Line,
  Matrix,
  MatrixProps,
  Point,
  PointList,
  ReactComponent,
  Rect,
  Renderer,
  RGBA,
  HSLA,
  Select,
  Size,
  SVG,
  Timer,
  Transition,
  TransitionList,
  TRBL,
  Tree
});
