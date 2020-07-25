import Util from './lib/util.js';
import { Element } from './element.js';
import { Point } from '../geom/point.js';
import { Size } from '../geom/size.js';

export function ElementRectProxy(element) {
  this.element = element;

  if(element.style && element.style.position !== undefined) {
    if(element.style.position == '') element.style.position = 'relative';
  }
}
ElementRectProxy.prototype = {
  element: null,
  getPos: function(fn = rect => rect) {
    return fn(Element.position(this.element));
  },
  getRect: function(fn = rect => rect) {
    return fn(Element.rect(this.element, { round: false }));
  },
  setPos: function() {
    let pos = new Point(...arguments);
    this.setRect(rect => {
      rect.x = pos.x;
      rect.y = pos.y;
      return rect;
    });
  },
  setSize: function() {
    let size = new Size(...arguments);
    this.setRect(rect => {
      rect.width = size.width;
      rect.height = size.height;
      return rect;
    });
  },
  changeRect: function(fn = (rect, e) => rect) {
    let r = Element.getRect(this.element);
    if(typeof fn == 'function') r = fn(r, this.element);

    Element.setRect(this.element, r);
  },
  setRect: function(arg) {
    let rect;
    if(typeof arg == 'function') rect = arg(this.getRect(), this.element);
    else rect = new Rect(...arguments);
    Element.setRect(this.element, rect);
    /*    rect = new Rect(rect);
    Element.setCSS(this.element, { ...rect.toCSS(rect), position: 'absolute' });
*/
  }
};
const propSetter = (prop, proxy) => value => {
  //proxy.changeRect(rect => { rect[prop] = value; return rect; })
  let r = proxy.getRect();
  r[prop] = value;
  //Util.log('New rect: ', r);
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
    'x',
    function() {
      return Element.getRect(this).x;
    },
    function(val) {
      this.style.left = `${val}px`;
    }
  );
  Util.defineGetterSetter(
    element,
    'y',
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
    'w',
    function() {
      return Element.getRect(this).width;
    },
    function(val) {
      this.style.width = `${val}px`;
    }
  );
  Util.defineGetterSetter(
    element,
    'h',
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
    'x',
    () => proxy.getPos().x,
    x => proxy.setPos({ x })
  );
  Util.defineGetterSetter(
    element,
    'x1',
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
    'x2',
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
    'y',
    () => proxy.getPos().y,
    y => proxy.setPos({ y })
  );
  Util.defineGetterSetter(
    element,
    'y1',
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
    'y2',
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
    'w',
    () => proxy.getRect().width,
    width => proxy.setSize({ width })
  );
  Util.defineGetterSetter(
    element,
    'width',
    () => proxy.getRect().width,
    width => proxy.setSize({ width })
  );
  Util.defineGetterSetter(
    element,
    'h',
    () => proxy.getRect().height,
    height => proxy.setSize({ height })
  );
  Util.defineGetterSetter(
    element,
    'height',
    () => proxy.getRect().height,
    height => proxy.setSize({ height })
  );
};

export const ElementRectProps = (element, proxy) => {
  /*Util.defineGetterSetter(element, 'w', () => proxy.getRect().width, propSetter('width', proxy)); Util.defineGetterSetter(element, 'width', () => proxy.getRect().width, propSetter('width', proxy));
    Util.defineGetterSetter(element, 'h', () => proxy.getRect().height, propSetter('height', proxy)); Util.defineGetterSetter(element, 'height', () => proxy.getRect().height, propSetter('height', proxy) });*/
};
