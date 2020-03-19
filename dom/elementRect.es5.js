"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ElementRectProxy = ElementRectProxy;
exports.ElementRectProps = exports.ElementSizeProps = exports.ElementPosProps = exports.ElementWHProps = exports.ElementXYProps = void 0;

var _element = require("./element.es5.js");

var _point = require("./point.es5.js");

var _size = require("./size.es5.js");

function ElementRectProxy(element) {
  this.element = element;

  if (element.style && element.style.position !== undefined) {
    if (element.style.position == "") element.style.position = "relative";
  }
}

ElementRectProxy.prototype = {
  element: null,
  getPos: function getPos(fn = rect => rect) {
    return fn(_element.Element.position(this.element));
  },
  getRect: function getRect(fn = rect => rect) {
    return fn(_element.Element.rect(this.element, {
      round: false
    }));
  },
  setPos: function setPos() {
    let pos = new _point.Point(...arguments);
    this.setRect(rect => {
      rect.x = pos.x;
      rect.y = pos.y;
      return rect;
    });
  },
  setSize: function setSize() {
    let size = new _size.Size(...arguments);
    this.setRect(rect => {
      rect.width = size.width;
      rect.height = size.height;
      return rect;
    });
  },
  changeRect: function changeRect(fn = (rect, e) => rect) {
    let r = _element.Element.getRect(this.element);

    if (typeof fn == "function") r = fn(r, this.element);

    _element.Element.setRect(this.element, r);
  },
  setRect: function setRect(arg) {
    let rect;
    if (typeof arg == "function") rect = arg(this.getRect(), this.element);else rect = new Rect(...arguments);

    _element.Element.setRect(this.element, rect);
  }
};

const propSetter = (prop, proxy) => value => {
  let r = proxy.getRect();
  r[prop] = value;
  proxy.setRect(r);
};

const computedSetter = (proxy, compute) => function (value) {
  var r = proxy.getRect();
  r = compute(value, r);
  if (r && r.x !== undefined) proxy.setRect(oldrect => r);
  return r;
};

const ElementXYProps = element => {
  Util.defineGetterSetter(element, "x", function () {
    return _element.Element.getRect(this).x;
  }, function (val) {
    this.style.left = "".concat(val, "px");
  });
  Util.defineGetterSetter(element, "y", function () {
    return _element.Element.getRect(this).y;
  }, function (val) {
    this.style.top = "".concat(val, "px");
  });
};

exports.ElementXYProps = ElementXYProps;

const ElementWHProps = element => {
  Util.defineGetterSetter(element, "w", function () {
    return _element.Element.getRect(this).width;
  }, function (val) {
    this.style.width = "".concat(val, "px");
  });
  Util.defineGetterSetter(element, "h", function () {
    return _element.Element.getRect(this).height;
  }, function (val) {
    this.style.height = "".concat(val, "px");
  });
};

exports.ElementWHProps = ElementWHProps;

const ElementPosProps = (element, proxy) => {
  proxy = proxy || new ElementRectProxy(element);
  Util.defineGetterSetter(element, "x", () => proxy.getPos().x, x => proxy.setPos({
    x
  }));
  Util.defineGetterSetter(element, "x1", () => proxy.getPos().x, value => proxy.setRect(rect => {
    let extend = rect.x - value;
    rect.width += extend;
    return rect;
  }));
  Util.defineGetterSetter(element, "x2", () => proxy.getRect(rect => rect.x + rect.width), value => proxy.setRect(rect => {
    let extend = value - (rect.x + rect.w);
    rect.width += extend;
    return rect;
  }));
  Util.defineGetterSetter(element, "y", () => proxy.getPos().y, y => proxy.setPos({
    y
  }));
  Util.defineGetterSetter(element, "y1", () => proxy.getPos().y, value => proxy.setRect(rect => {
    let y = rect.y - value;
    rect.height += y;
    return rect;
  }));
  Util.defineGetterSetter(element, "y2", () => proxy.getRect(rect => rect.y + rect.height), value => proxy.setRect(rect => {
    let y = value - (rect.y + rect.height);
    rect.height += y;
    return rect;
  }));
};

exports.ElementPosProps = ElementPosProps;

const ElementSizeProps = (element, proxy) => {
  proxy = proxy || new ElementRectProxy(element);
  Util.defineGetterSetter(element, "w", () => proxy.getRect().width, width => proxy.setSize({
    width
  }));
  Util.defineGetterSetter(element, "width", () => proxy.getRect().width, width => proxy.setSize({
    width
  }));
  Util.defineGetterSetter(element, "h", () => proxy.getRect().height, height => proxy.setSize({
    height
  }));
  Util.defineGetterSetter(element, "height", () => proxy.getRect().height, height => proxy.setSize({
    height
  }));
};

exports.ElementSizeProps = ElementSizeProps;

const ElementRectProps = (element, proxy) => {};

exports.ElementRectProps = ElementRectProps;
