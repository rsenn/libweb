import { HSLA, RGBA } from './color.js';
import { Container } from './dom/container.js';
import { CSS } from './dom/css.js';
import { Element, isElement } from './dom/element.js';
import { ElementPosProps, ElementRectProps, ElementRectProxy, ElementSizeProps, ElementWHProps, ElementXYProps } from './dom/elementRect.js';
import { Event } from './dom/event.js';
import { Layer, Renderer } from './dom/layer.js';
import { Node } from './dom/node.js';
import { Select } from './dom/select.js';
import { SVG } from './dom/svg.js';
import Timer from './dom/timer.js';
import { Tree } from './dom/tree.js';
import { XPath } from './dom/xpath.js';
import { Align, Anchor } from './geom/align.js';
import { BBox } from './geom/bbox.js';
import { isLine, Line } from './geom/line.js';
import { isMatrix, Matrix } from './geom/matrix.js';
import { isPoint, Point } from './geom/point.js';
import { PointList } from './geom/pointList.js';
import { Polyline } from './geom/polyline.js';
import { isRect, Rect } from './geom/rect.js';
import { isSize, Size } from './geom/size.js';
import { TRBL } from './geom/trbl.js';

export { HSLA, RGBA } from './color.js';
export function dom() {
  let args = [...arguments];
  let ret = [];

  const extend = (e, functions) => {
    const keys = [...members(functions)].filter(
      key => ['callee', 'caller', 'arguments', 'call', 'bind', 'apply', 'prototype', 'constructor', 'length'].indexOf(key) == -1 && typeof functions[key] == 'function'
    );
    for(let key of keys) if(e[key] === undefined) e[key] = functions[key].bind(functions, e);
  };

  args = args.map(arg => (typeof arg == 'string' ? Element.findAll(arg) : arg));

  for(let e of args) {
    if(e instanceof SVGSVGElement) extend(e, SVG);
    if(isElement(e)) {
      extend(e, Element);
      ElementPosProps(e);
      ElementSizeProps(e);
      CSSTransformSetters(e);
    }

    ret.push(e);
  }
  if(ret.length == 1) ret = ret[0];
  return ret;
}

export const isNumber = a => String(a).replace(/^[0-9]*$/, '') == '';

export function Unit(str) {
  let u =
    this instanceof Unit
      ? this
      : {
          format(number) {
            return `${number}${this.name}`;
          }
        };
  u.name = str.replace(/^[a-z]*/, '');
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
    this.updateTransformation();
  },
  get translate() {
    return this.transformation.translate;
  },
  set translate(point) {
    this.transformation.translate.set(point.x, point.y);
    this.updateTransformation();
  },
  get scale() {
    return this.transformation.scale;
  },
  set scale(size) {
    this.transformation.scale.set(size.width, size.height);
    this.updateTransformation();
  },
  updateTransformation() {
    const t = this.transformation.toString();
    console.log('CSSTransformSetters.updateTransformation', t);
    this.style.transform = t;
  }
});

export class Transition {
  property = 'none';
  delay = '';
  duration = '';
  timing = '';

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
      transitionDelay: this.propertyList('delay').join(', '),
      transitionDuration: this.propertyList('duration').join(', '),
      transitionProperty: this.propertyList('property').join(', '),
      transitionTimingFunction: this.propertyList('timing').join(', ')
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

export { Point, isPoint } from './geom/point.js';
export { Size, isSize } from './geom/size.js';
export { Line, isLine } from './geom/line.js';
export { Rect, isRect } from './geom/rect.js';
export { PointList } from './geom/pointList.js';
export { Polyline } from './geom/polyline.js';
export { Matrix, isMatrix } from './geom/matrix.js';
export { BBox } from './geom/bbox.js';
export { TRBL } from './geom/trbl.js';
export { Timer } from './dom/timer.js';
export { Tree } from './dom/tree.js';
export { Node } from './dom/node.js';
export { XPath } from './dom/xpath.js';
export { Element, isElement } from './dom/element.js';
export { CSS } from './dom/css.js';
export { SVG } from './dom/svg.js';
//export { ReactComponent } from './dom/reactComponent.js';
export { Container } from './dom/container.js';
export { Layer, Renderer } from './dom/layer.js';
export { Select } from './dom/select.js';
export { ElementPosProps, ElementRectProps, ElementRectProxy, ElementSizeProps, ElementWHProps, ElementXYProps } from './dom/elementRect.js';
export { Align, Anchor } from './geom/align.js';

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
  isElement,
  isLine,
  isMatrix,
  isNumber,
  isPoint,
  isRect,
  isSize,
  Line,
  Matrix,
  Node,
  Point,
  PointList,
  Polyline,
  //ReactComponent,
  Rect,
  Renderer,

  //Select,
  Size,
  SVG,
  Timer,
  Transition,
  TransitionList,
  TRBL,
  Tree,
  Event,
  XPath
});
