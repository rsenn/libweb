import { Element, isElement } from './element.js';
import { Rect } from '../geom/rect.js';
import { Pointer } from '../pointer.js';
import * as deep from '../deep.js';
import trkl from '../trkl.js';

const GetSet = (getFn, setFn) => value => value !== undefined ? setFn(value) : getFn();
const PropSetterGetter = (obj, property) =>
  GetSet(
    () => obj[property],
    value => (obj[property] = value)
  );
const PropGetter = (obj, property) => () => obj[property];

const CSSSetter = (elem, property) => value => Element.setCSS(elem, { [property]: value + 'px' });
const CSSGetter = (elem, property) => () => Element.getCSS(elem, property);
const CSSGetSet = (elem, property) => GetSet(CSSGetter(elem, property), CSSSetter(elem, property));
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
    return trkl.object(
      {
        x: GetSet(PropGetter(this.elm, 'offsetLeft'), CSSSetter(this.elm, 'left')),
        y: GetSet(PropGetter(this.elm, 'offsetTop'), CSSSetter(this.elm, 'top')),
        width: GetSet(PropGetter(this.elm, 'offsetWidth'), CSSSetter(this.elm, 'width')),
        height: GetSet(PropGetter(this.elm, 'offsetHeight'), CSSSetter(this.elm, 'height'))
      },
      this
    );
  }

  get rect() {
    return trkl.object({
      x: CSSGetSet(this.elm, 'left'),
      y: CSSGetSet(this.elm, 'top'),
      width: CSSGetSet(this.elm, 'width'),
      height: CSSGetSet(this.elm, 'height')
    });
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
