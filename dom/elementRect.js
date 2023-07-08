import { Point } from '../geom/point.js';
import { Size } from '../geom/size.js';
import { Element } from './element.js';

export function ElementRectProxy(element) {
  this.element = element;

  if(element.style && element.style.position !== undefined) {
    if(element.style.position == '') element.style.position = 'relative';
  }
}

ElementRectProxy.prototype = {
  element: null,
  getPos(fn = rect => rect) {
    const { x, y } = this.element.getBoundingClientRect();
    return fn({ x, y }, this.element);
  },
  getRect(fn = rect => rect) {
    const { x, y, width, height } = this.element.getBoundingClientRect();
    return fn({ x, y, width, height }, this.element);
  },
  setPos() {
    let pos = new Point(...arguments);
    this.setRect(rect => {
      rect.x = pos.x;
      rect.y = pos.y;
      return rect;
    });
  },
  setSize() {
    let size = new Size(...arguments);
    this.setRect(rect => {
      rect.width = size.width;
      rect.height = size.height;
      return rect;
    });
  },
  changeRect(fn = (rect, e) => rect) {
    let r = this.getRect();
    if(typeof fn == 'function') r = fn(r, this.element);

    Element.setRect(this.element, r);
  },
  setRect(arg) {
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
  //console.log('New rect: ', r);
  proxy.setRect(r);
};

const computedSetter = (proxy, compute) =>
  function(value) {
    let r = proxy.getRect();
    r = compute(value, r);
    if(r && r.x !== undefined) proxy.setRect(oldrect => r);
    return r;
  };

export const ElementXYProps = element => {
  Object.defineProperty(element, 'x', {
    get() {
      return Element.getRect(this).x;
    },
    set(val) {
      this.style.left = `${val}px`;
    }
  });
  Object.defineProperty(element, 'y', {
    get() {
      return Element.getRect(this).y;
    },
    set(val) {
      this.style.top = `${val}px`;
    }
  });
};

export const ElementWHProps = element => {
  Object.defineProperty(element, 'w', {
    get() {
      return Element.getRect(this).width;
    },
    set(val) {
      this.style.width = `${val}px`;
    }
  });
  Object.defineProperty(element, 'h', {
    get() {
      return Element.getRect(this).height;
    },
    set(val) {
      this.style.height = `${val}px`;
    }
  });
};

export const ElementPosProps = (element, proxy) => {
  proxy = proxy || new ElementRectProxy(element);
  ElementXYProps(element, proxy);
  Object.defineProperty(element, 'x1', {
    get: () => proxy.getPos().x,
    set: value =>
      proxy.setRect(rect => {
        let extend = rect.x - value;
        rect.width += extend;
        return rect;
      })
  });
  Object.defineProperty(element, 'x2', {
    get: () => proxy.getRect(rect => rect.x + rect.width),
    set: value =>
      proxy.setRect(rect => {
        let extend = value - (rect.x + rect.w);
        rect.width += extend;
        return rect;
      })
  });

  Object.defineProperty(element, 'y1', {
    get: () => proxy.getPos().y,
    set: value =>
      proxy.setRect(rect => {
        let y = rect.y - value;
        rect.height += y;
        return rect;
      })
  });
  Object.defineProperty(element, 'y2', {
    get: () => proxy.getRect(rect => rect.y + rect.height),
    set: value =>
      proxy.setRect(rect => {
        let y = value - (rect.y + rect.height);
        rect.height += y;
        return rect;
      })
  });
};

export const ElementSizeProps = (element, proxy) => {
  proxy = proxy || new ElementRectProxy(element);
  Object.defineProperty(element, 'w', {
    get: () => proxy.getRect().width,
    set: width => proxy.setSize({ width })
  });
  Object.defineProperty(element, 'width', {
    get: () => proxy.getRect().width,
    set: width => proxy.setSize({ width })
  });
  Object.defineProperty(element, 'h', {
    get: () => proxy.getRect().height,
    set: height => proxy.setSize({ height })
  });
  Object.defineProperty(element, 'height', {
    get: () => proxy.getRect().height,
    set: height => proxy.setSize({ height })
  });
};

export const ElementRectProps = (element, proxy) => {
  /*Object.defineProperty(element, 'w', { get: () => proxy.getRect().width, set: propSetter('width', proxy) });
  Object.defineProperty(element, 'width', { get: () => proxy.getRect().width, set: propSetter('width', proxy) });
  Object.defineProperty(element, 'h', { get: () => proxy.getRect().height, set: propSetter('height', proxy) });
  Object.defineProperty(element, 'height', { get: () => proxy.getRect().height, set: propSetter('height', proxy) });*/
};