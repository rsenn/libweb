import { Element, isElement } from './element.js';
import { Rect } from '../geom/rect.js';
import { RGBA, HSLA } from '../color.js';
import { Pointer } from '../pointer.js';
import * as deep from '../deep.js';
import trkl from '../trkl.js';
import { Transformation, Rotation, Translation, Scaling, TransformationList } from '../geom/transformation.js';

const GetSet = (getFn, setFn) => value => value !== undefined ? setFn(value) : getFn();
const PropSetterGetter = (obj, property) =>
  GetSet(
    () => obj[property],
    value => (obj[property] = value)
  );
const PropGetter = (obj, property) => () => obj[property];

const cssSet = (elem, property) => value =>
  Element.setCSS(elem, { [property]: typeof value == 'number' ? value + 'px' : value });
const cssGet = (elem, property) => () => Element.getCSS(elem, property);
const cssGetSet = (elem, property) => GetSet(cssGet(elem, property), cssSet(elem, property));

/**
 *
 */
export class Layer {
  constructor(arg, ...args) {
    if(!isElement(arg)) {
      let [attr = {}, parent = document.body] = args;

      this.elm = Element.create(arg, attr, parent);
    } else {
      this.elm = arg;
    }
    this.transform = TransformationList.fromString(this.elm.style.transform);

    return trkl.object(
      (this._getset = {
        x: GetSet(PropGetter(this.elm, 'offsetLeft'), cssSet(this.elm, 'left')),
        y: GetSet(PropGetter(this.elm, 'offsetTop'), cssSet(this.elm, 'top')),
        width: GetSet(PropGetter(this.elm, 'offsetWidth'), cssSet(this.elm, 'width')),
        height: GetSet(PropGetter(this.elm, 'offsetHeight'), cssSet(this.elm, 'height')),
        border: cssGetSet(this.elm, 'border'),
        margin: cssGetSet(this.elm, 'margin'),
        padding: cssGetSet(this.elm, 'padding'),
        opacity: cssGetSet(this.elm, 'opacity'),
        display: cssGetSet(this.elm, 'display'),
        boxSizing: cssGetSet(this.elm, 'box-sizing')
      }),
      this
    );
  }

  get rect() {
    return Rect.bind({}, null, k => this._getset[k]);
  }
  set rect(value) {
    Element.setRect(this.elm, value);
  }
  get style() {
    return this.elm.style;
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
