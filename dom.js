//import ReactDOM from "react-dom";
import { SvgPath } from "./svg/path.js";
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
import { Element, isElement } from "./dom/element.js";
import { CSS } from "./dom/css.js";
import { SVG } from "./dom/svg.js";
import { ReactComponent } from "./dom/reactComponent.js";
import { Container } from "./dom/container.js";
import { Layer, Renderer } from "./dom/layer.js";
import { Select } from "./dom/select.js";
import { ElementPosProps, ElementRectProps, ElementRectProxy, ElementSizeProps, ElementWHProps, ElementXYProps } from "./dom/elementRect.js";

export function dom() {
  let args = [...arguments];
  let ret = Util.array();

  const extend = (e, functions) => {
    const keys = [...Util.members(functions)].filter(key => ["callee", "caller", "arguments", "call", "bind", "apply", "prototype", "constructor", "length"].indexOf(key) == -1 && typeof functions[key] == "function");
    for(let key of keys) if(e[key] === undefined) e[key] = functions[key].bind(functions, e);
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
export const isTRBL = inst => {};
export const isTimer = inst => {};
export const isTree = inst => {};
export const isCSS = inst => {};
export const isContainer = inst => {};
export const isSVG = inst => inst.tagName.toLowerCase() == "svg";

export const isReactComponent = inst => {};
export const isRenderer = inst => {};
export const isSelect = inst => {};
*/

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
export { Element, isElement } from "./dom/element.js";
export { CSS } from "./dom/css.js";
export { SVG } from "./dom/svg.js";
export { ReactComponent } from "./dom/reactComponent.js";
export { Container } from "./dom/container.js";
export { Layer, Renderer } from "./dom/layer.js";
export { Select } from "./dom/select.js";
export { ElementPosProps, ElementRectProps, ElementRectProxy, ElementSizeProps, ElementWHProps, ElementXYProps } from "./dom/elementRect.js";

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
  isElement,
  isHSLA,
  isLine,
  isMatrix,
  isNumber,
  isPoint,
  isRect,
  isRGBA,
  isSize,
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
