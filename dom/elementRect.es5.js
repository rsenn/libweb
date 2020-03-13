"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.ElementRectProxy = ElementRectProxy;
exports.ElementRectProps = exports.ElementSizeProps = exports.ElementPosProps = exports.ElementWHProps = exports.ElementXYProps = void 0;

var _element.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js.es5.js = require("./element.js");

function ElementRectProxy(element) {
  this.element = element;
}

ElementRectProxy.prototype = {
  element: null,
  getPos: function getPos() {
    var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (rect) {
      return rect;
    };
    return fn(_element.Element.position(this.element));
  },
  getRect: function getRect() {
    var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (rect) {
      return rect;
    };
    return fn(_element.Element.rect(this.element, {
      round: false
    }));
  },
  setPos: function setPos(pos) {
    _element.Element.move.apply(_element.Element, [this.element].concat(Array.prototype.slice.call(arguments)));
  },
  setSize: function setSize(size) {
    _element.Element.resize.apply(_element.Element, [this.element].concat(Array.prototype.slice.call(arguments)));
  },
  changeRect: function changeRect() {
    var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (rect, e) {
      return rect;
    };

    var r = _element.Element.getRect(this.element);

    if (typeof fn == "function") r = fn(r, this.element);

    _element.Element.setRect(this.element, r);
  },
  setRect: function setRect(arg) {
    var rect = arg;

    if (typeof arg == "function") {
      rect = arg(this.getRect());
    }

    _element.Element.rect(this.element, rect);
    /*    rect = new Rect(rect);
    Element.setCSS(this.element, { ...rect.toCSS(rect), position: 'absolute' });
    */

  }
};

var propSetter = function propSetter(prop, proxy) {
  return function (value) {
    //proxy.changeRect(rect => { rect[prop] = value; return rect; })
    var r = proxy.getRect();
    r[prop] = value; //console.log('New rect: ', r);

    proxy.setRect(r);
  };
};

var computedSetter = function computedSetter(proxy, compute) {
  return function (value) {
    var r = proxy.getRect();
    r = compute(value, r);
    if (r && r.x !== undefined) proxy.setRect(function (oldrect) {
      return r;
    });
    return r;
  };
};

var ElementXYProps = function ElementXYProps(element) {
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

var ElementWHProps = function ElementWHProps(element) {
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

var ElementPosProps = function ElementPosProps(element, proxy) {
  proxy = proxy || new ElementRectProxy(element);
  Util.defineGetterSetter(element, "x", function () {
    return proxy.getPos().x;
  }, function (x) {
    return proxy.setPos({
      x: x
    });
  });
  Util.defineGetterSetter(element, "x1", function () {
    return proxy.getPos().x;
  }, function (value) {
    return proxy.setRect(function (rect) {
      var extend = rect.x - value;
      rect.width += extend;
      return rect;
    });
  });
  Util.defineGetterSetter(element, "x2", function () {
    return proxy.getRect(function (rect) {
      return rect.x + rect.width;
    });
  }, function (value) {
    return proxy.setRect(function (rect) {
      var extend = value - (rect.x + rect.w);
      rect.width += extend;
      return rect;
    });
  });
  Util.defineGetterSetter(element, "y", function () {
    return proxy.getPos().y;
  }, function (y) {
    return proxy.setPos({
      y: y
    });
  });
  Util.defineGetterSetter(element, "y1", function () {
    return proxy.getPos().y;
  }, function (value) {
    return proxy.setRect(function (rect) {
      var y = rect.y - value;
      rect.height += y;
      return rect;
    });
  });
  Util.defineGetterSetter(element, "y2", function () {
    return proxy.getRect(function (rect) {
      return rect.y + rect.height;
    });
  }, function (value) {
    return proxy.setRect(function (rect) {
      var y = value - (rect.y + rect.height);
      rect.height += y;
      return rect;
    });
  });
};

exports.ElementPosProps = ElementPosProps;

var ElementSizeProps = function ElementSizeProps(element, proxy) {
  proxy = proxy || new ElementRectProxy(element);
  Util.defineGetterSetter(element, "w", function () {
    return proxy.getRect().width;
  }, function (width) {
    return proxy.setSize({
      width: width
    });
  });
  Util.defineGetterSetter(element, "width", function () {
    return proxy.getRect().width;
  }, function (width) {
    return proxy.setSize({
      width: width
    });
  });
  Util.defineGetterSetter(element, "h", function () {
    return proxy.getRect().height;
  }, function (width) {
    return proxy.setSize({
      height: height
    });
  });
  Util.defineGetterSetter(element, "height", function () {
    return proxy.getRect().height;
  }, function (width) {
    return proxy.setSize({
      height: height
    });
  });
};

exports.ElementSizeProps = ElementSizeProps;

var ElementRectProps = function ElementRectProps(element, proxy) {
  /*Util.defineGetterSetter(element, 'w', () => proxy.getRect().width, propSetter('width', proxy)); Util.defineGetterSetter(element, 'width', () => proxy.getRect().width, propSetter('width', proxy));
    Util.defineGetterSetter(element, 'h', () => proxy.getRect().height, propSetter('height', proxy)); Util.defineGetterSetter(element, 'height', () => proxy.getRect().height, propSetter('height', proxy) });*/
};

exports.ElementRectProps = ElementRectProps;
