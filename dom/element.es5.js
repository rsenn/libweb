"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isElement = isElement;
exports.Element = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.object.entries");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _node = require("./node.es5.js");

var _trbl = require("../geom/trbl.es5.js");

var _point = require("../geom/point.es5.js");

var _rect = require("../geom/rect.es5.js");

var _size = require("../geom/size.es5.js");

var _align = require("../geom/align.es5.js");

var _util = _interopRequireDefault(require("../util.es5.js"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class Element extends _node.Node {
  static create() {
    let args = [...arguments];

    let _ref = typeof args[0] == "object" ? args.shift() : _objectSpread({
      tagName: args.shift()
    }, args.shift()),
        tagName = _ref.tagName,
        ns = _ref.ns,
        children = _ref.children,
        props = (0, _objectWithoutProperties2.default)(_ref, ["tagName", "ns", "children"]);

    let parent = args.shift();
    let d = document || window.document;
    let e = ns ? d.createElementNS(ns, tagName) : d.createElement(tagName);

    for (let k in props) {
      const value = props[k];

      if (k == "parent") {
        parent = props[k];
        continue;
      } else if (k == "className") k = "class";

      if (k == "style" && typeof value === "object") Element.setCSS(e, value);else if (k.startsWith("on") || k.startsWith("inner")) e[k] = value;else e.setAttribute(k, value);
    }

    if (children && children.length) children.forEach(obj => Element.create(obj, e));
    if (parent && parent.appendChild) parent.appendChild(e);
    return e;
  }

  static walkUp(elem, pred) {
    if (typeof elem == "string") elem = Element.find(elem);
    let n;

    if (typeof pred == "number") {
      n = pred;

      pred = () => n-- > 0;
    }

    while (!pred(elem)) elem = elem.parentElement;

    return elem;
  }

  static walk(elem, fn, accu = {}) {
    elem = Element.find(elem);
    const root = elem;
    const rootPath = Element.xpath(elem);
    let depth = 0;

    while (elem) {
      accu = fn(dom(elem), accu, root, depth);
      if (elem.firstElementChild) depth++;

      elem = elem.firstElementChild || elem.nextElementSibling || function () {
        do {
          if (!(elem = elem.parentElement)) break;
          depth--;
        } while (depth > 0 && !elem.nextElementSibling);

        return elem && elem != root ? elem.nextElementSibling : null;
      }();
    }

    return accu;
  }

  static toObject(elem, opts = {
    children: true
  }) {
    let e = Element.find(elem);
    let children = opts.children ? e.children && e.children.length ? {
      children: _util.default.array(e.children).map(child => Element.toObject(child, e))
    } : {} : {};
    let ns = (arguments[1] ? arguments[1].namespaceURI : document.body.namespaceURI) != e.namespaceURI ? {
      ns: e.namespaceURI
    } : {};
    let attributes = {};
    let a = Element.attr(e);

    for (let key in a) {
      let value = a[key];
      attributes[_util.default.camelize(key)] = value;
    }

    return _objectSpread({
      tagName: e.tagName
    }, attributes, {}, children, {}, ns);
  }

  static toCommand(elem, parent = "") {
    let o = Element.toObject(elem, {
      children: false
    });
    console.log("o:", o);
    let s = "";
    let tagName = o.tagName,
        ns = o.ns,
        children = o.children,
        attrs = (0, _objectWithoutProperties2.default)(o, ["tagName", "ns", "children"]);
    let v = "";

    if (elem.firstElementChild) {
      v = parent ? String.fromCharCode(parent.charCodeAt(0) + 1) : "e";
      s += "".concat(v, " = ");
    }

    s += "Element.create('".concat(tagName, "', { ").concat(Object.entries(attrs).map(([k, v]) => "".concat(k, ": ").concat(JSON.stringify(v))).join(", "), " }").concat(parent ? ", ".concat(parent) : "", ");");
    let child;

    for (child = elem.firstElementChild; child; child = child.nextElementSibling) {
      s += "\n" + Element.toCommand(child, v);
    }

    return s;
  }

  static find(arg, parent, globalObj = _util.default.getGlobalObject()) {
    if (!parent && globalObj.document) parent = globalObj.document;
    return typeof arg === "string" ? parent.querySelector(arg) : arg;
  }

  static findAll(arg, parent) {
    parent = Element.find(parent);
    return [...(parent && parent.querySelectorAll ? parent.querySelectorAll(arg) : document.querySelectorAll(arg))];
  }

  static attr(element, attrs_or_name) {
    const e = typeof element === "string" ? Element.find(element) : element;

    if (!_util.default.isArray(attrs_or_name) && typeof attrs_or_name === "object" && e) {
      for (let key in attrs_or_name) {
        const name = _util.default.decamelize(key, "-");

        const value = attrs_or_name[key];
        if (key.startsWith("on") && !/svg/.test(e.namespaceURI)) e[key] = value;else if (e.setAttribute) e.setAttribute(name, value);else e[key] = value;
      }

      return e;
    }

    if (typeof attrs_or_name === "function") {
      attrs_or_name(e.attributes, e);
      return e;
    } else if (typeof attrs_or_name === "string") {
      attrs_or_name = [attrs_or_name];
    } else {
      attrs_or_name = e.getAttributeNames();
    }

    let ret = attrs_or_name.reduce((acc, name) => {
      const key = name;
      const value = e && e.getAttribute ? e.getAttribute(name) : e[key];
      acc[key] = /^-?[0-9]*\.[0-9]\+$/.test(value) ? parseFloat(value) : value;
      return acc;
    }, {});
    if (typeof arguments[1] == "string") return ret[attrs_or_name[0]];
    return ret;
  }

  static getRect(elem) {
    let e = elem;

    while (e) {
      if (e.style) {
        if (e.style.position == "") e.style.position = "relative";
        if (e.style.left == "") e.style.left = "0px";
        if (e.style.top == "") e.style.top = "0px";
      }

      e = e.offsetParent || e.parentNode;
    }

    const bbrect = elem.getBoundingClientRect();
    return {
      x: bbrect.left + window.scrollX,
      y: bbrect.top + window.scrollY,
      width: bbrect.right - bbrect.left,
      height: bbrect.bottom - bbrect.top
    };
  }

  static rect(elem, options = {}) {
    let args = [...arguments];
    let element = args.shift();
    if (args.length > 0 && ((0, _rect.isRect)(args) || (0, _rect.isRect)(args[0]))) return Element.setRect.apply(Element, arguments);
    const _options$round = options.round,
          round = _options$round === void 0 ? true : _options$round,
          _options$relative_to = options.relative_to,
          relative_to = _options$relative_to === void 0 ? null : _options$relative_to,
          _options$scroll_offse = options.scroll_offset,
          scroll_offset = _options$scroll_offse === void 0 ? true : _options$scroll_offse;
    const e = typeof element === "string" ? Element.find(element) : element;

    if (!e || !e.getBoundingClientRect) {
      return new _rect.Rect(0, 0, 0, 0);
    }

    const bb = e.getBoundingClientRect();

    let r = _trbl.TRBL.toRect(bb);

    if (relative_to && relative_to !== null) {
        const off = Element.rect(relative_to);
        r.x -= off.x;
        r.y -= off.y;
      }

    if (options.border) {
      const border = Element.border(e);

      _rect.Rect.outset(r, border);
    }

    const _window = window,
          scrollTop = _window.scrollTop,
          scrollY = _window.scrollY;

    if (scroll_offset) {
      r.y += scrollY;
    }

    r = new _rect.Rect(round ? _rect.Rect.round(r) : r);
    return r;
  }

  static setRect(element, rect, anchor) {
    const e = typeof element === "string" ? Element.find(element) : element;

    if (typeof anchor == "string") {
      e.style.position = anchor;
      anchor = 0;
    }

    anchor = anchor || _align.Anchor.LEFT | _align.Anchor.TOP;
    const position = e.style.position;
    const pelement = position == "fixed" ? e.documentElement || document.body : e.parentNode;
    const prect = Element.rect(pelement, {
      round: false
    });

    const ptrbl = _rect.Rect.toTRBL(prect);

    const trbl = _rect.Rect.toTRBL(rect);

    let css = {};
    let remove;

    switch (_align.Anchor.horizontal(anchor)) {
      case _align.Anchor.LEFT:
      default:
        css.left = Math.round(trbl.left) + "px";
        remove = "right";
        break;

      case _align.Anchor.RIGHT:
        css.right = Math.round(trbl.right - ptrbl.right) + "px";
        remove = "left";
        break;
    }

    switch (_align.Anchor.vertical(anchor)) {
      case _align.Anchor.TOP:
      default:
        css.top = Math.round(trbl.top) + "px";
        remove = "bottom";
        break;

      case _align.Anchor.BOTTOM:
        css.bottom = Math.round(trbl.bottom - ptrbl.bottom) + "px";
        remove = "top";
        break;
    }

    if (e.style.removeProperty) e.style.removeProperty(remove);else e.style[remove] = undefined;
    css.width = Math.round(rect.width) + "px";
    css.height = Math.round(rect.height) + "px";
    Object.assign(e.style, css);
    return e;
  }

  static position(element, pos = "absolute") {
    if (typeof element == "string") element = Element.find(element);

    const _element$getBoundingC = element.getBoundingClientRect(),
          x = _element$getBoundingC.x,
          y = _element$getBoundingC.y;

    return new _point.Point({
      x,
      y
    });
  }

  static move(element, point, pos) {
    let _ref2 = [...arguments],
        e = _ref2[0],
        rest = _ref2.slice(1);

    let _ref3 = new _point.Point(rest),
        _ref3$x = _ref3.x,
        x = _ref3$x === void 0 ? Element.position(element).x : _ref3$x,
        _ref3$y = _ref3.y,
        y = _ref3$y === void 0 ? Element.position(element).y : _ref3$y;

    let to = {
      x,
      y
    };
    let position = rest.shift() || Element.getCSS(element, "position") || "relative";
    let off;

    const getValue = prop => {
      const property = dom.Element.getCSS(element, prop);
      if (property === undefined) return undefined;
      const matches = /([-0-9.]+)(.*)/.exec(property) || [];
      return parseFloat(matches[1]);
    };

    const current = new _point.Point({
      x: getValue("left") || 0,
      y: getValue("top") || 0
    });
    off = new _point.Point(Element.rect(element, {
      round: false
    }));

    _point.Point.add(current, _point.Point.diff(to, off));

    let css = _point.Point.toCSS(current);

    console.log("Element.move: ", {
      position,
      to,
      css,
      off,
      current
    });
    Element.setCSS(element, _objectSpread({}, css, {
      position
    }));
    return element;
  }

  static resize() {
    let args = [...arguments];
    let e = Element.find(args.shift());
    let size = new _size.Size(args);

    const css = _size.Size.toCSS(size);

    Element.setCSS(e, css);
    return e;
  }

  static getEdgesXYWH({
    x,
    y,
    w,
    h
  }) {
    return [{
      x,
      y
    }, {
      x: x + w,
      y
    }, {
      x: x + w,
      y: y + h
    }, {
      x,
      y: y + h
    }];
  }

  static getEdge({
    x,
    y,
    w,
    h
  }, which) {
    return [{
      x,
      y
    }, {
      x: x + w / 2,
      y
    }, {
      x: x + w,
      y
    }, {
      x: x + w,
      y: y + h / 2
    }, {
      x: x + w,
      y: y + h
    }, {
      x: x + w / 2,
      y: y + h
    }, {
      x,
      y: y + h
    }, {
      x,
      y: y + h / 2
    }][Math.floor(which * 2)];
  }

  static getPointsXYWH({
    x,
    y,
    w,
    h
  }) {
    return [{
      x,
      y
    }, {
      x: x + w,
      y: y + h
    }];
  }

  static cumulativeOffset(element, relative_to = null) {
    if (typeof element == "string") element = Element.find(element);
    let p = {
      x: 0,
      y: 0
    };

    do {
      p.y += element.offsetTop || 0;
      p.x += element.offsetLeft || 0;
    } while ((element = element.offsetParent) && element != relative_to);

    return p;
  }

  static getTRBL(element, prefix = "") {
    const names = ["Top", "Right", "Bottom", "Left"].map(pos => prefix + (prefix == "" ? pos.toLowerCase() : pos + (prefix == "border" ? "Width" : "")));
    return new _trbl.TRBL(Element.getCSS(element, names));
  }

  static setTRBL(element, trbl, prefix = "margin") {
    const attrs = ["Top", "Right", "Bottom", "Left"].reduce((acc, pos) => {
      const name = prefix + (prefix == "" ? pos.toLowerCase() : pos);
      return _objectSpread({}, acc, {
        [name]: trbl[pos.toLowerCase()]
      });
    }, {});
    return Element.setCSS(element, attrs);
  }

  static setCSS(element, prop, value) {
    if (typeof element == "string") element = Element.find(element);
    if (typeof prop == "string" && typeof value == "string") prop = {
      [prop]: value
    };

    for (let key in prop) {
      let value = prop[key];

      const propName = _util.default.decamelize(key);

      if (typeof value == "function") {
        if ("subscribe" in value) {
          value.subscribe = newval => element.style.setProperty(propName, newval);

          value = value();
        }
      }

      if (element.style) {
        if (element.style.setProperty) element.style.setProperty(propName, value);else element.style[_util.default.camelize(propName)] = value;
      }
    }

    return element;
  }

  static getCSS(element, property = undefined, receiver = null) {
    element = typeof element === "string" ? Element.find(element) : element;
    const w = window !== undefined ? window : global.window;
    const d = document !== undefined ? document : global.document;
    let parent = element.parentElement ? element.parentElement : element.parentNode;
    const estyle = w && w.getComputedStyle ? w.getComputedStyle(element) : d.getComputedStyle(element);
    const pstyle = parent && parent.tagName ? w && w.getComputedStyle ? w.getComputedStyle(parent) : d.getComputedStyle(parent) : {};
    console.log("Element.getCSS ", {
      estyle,
      pstyle
    });

    let style = _util.default.removeEqual(estyle, pstyle);

    let keys = Object.keys(style).filter(k => !/^__/.test(k));
    let ret = {};

    if (receiver == null) {
      receiver = result => {
        if (typeof result == "object") {
          try {
            Object.defineProperty(result, "cssText", {
              get: function get() {
                return Object.entries(this).map(([k, v]) => "".concat(_util.default.decamelize(k, "-"), ": ").concat(v, ";\n")).join("");
              },
              enumerable: false
            });
          } catch (err) {}
        }

        return result;
      };
    }

    if (property !== undefined) {
      ret = typeof property === "string" ? style[property] : property.reduce((ret, key) => {
        ret[key] = style[key];
        return ret;
      }, {});
    } else {
      for (let i = 0; i < keys.length; i++) {
        const stylesheet = keys[i];

        const key = _util.default.camelize(stylesheet);

        const val = style[stylesheet] || style[key];
        if (val && val.length > 0 && val != "none") ret[key] = val;
      }
    }

    return receiver(ret);
  }

  static xpath(elt, relative_to = null) {
    let path = "";

    for (; elt && elt.nodeType == 1; elt = elt.parentNode) {
      const xname = Element.unique(elt);
      path = xname + path;

      if (elt == relative_to) {
        break;
      }

      path = "/" + path;
    }

    return path;
  }

  static selector(elt, opts = {}) {
    const _opts$relative_to = opts.relative_to,
          relative_to = _opts$relative_to === void 0 ? null : _opts$relative_to,
          _opts$use_id = opts.use_id,
          use_id = _opts$use_id === void 0 ? false : _opts$use_id;
    let sel = "";

    for (; elt && elt.nodeType == 1; elt = elt.parentNode) {
      if (sel != "") sel = " > " + sel;
      let xname = Element.unique(elt, {
        idx: false,
        use_id
      });
      if (use_id === false) xname = xname.replace(/#.*/g, "");
      sel = xname + sel;
      if (elt == relative_to) break;
    }

    return sel;
  }

  static depth(elem, relative_to = document.body) {
    let count = 0;

    while (elem != relative_to && (elem = elem.parentNode)) count++;

    return count;
  }

  static dump(elem) {
    let str = "";

    function dumpElem(child, accu, root, depth) {
      const rect = _rect.Rect.round(Element.rect(child, elem));

      accu += "  ".repeat((depth > 0 ? depth : 0) + 1) + " " + Element.xpath(child, child);
      [...child.attributes].forEach(attr => accu += " " + attr.name + "='" + attr.value + "'");
      if (_rect.Rect.area(rect) > 0) accu += " " + _rect.Rect.toString(rect);
      ["margin", "border", "padding"].forEach(name => {
        let trbl = Element.getTRBL(elem, "margin");
        if (!trbl.null()) accu += " " + name + ": " + trbl + "";
      });
      return accu;
    }

    str = dumpElem(elem, "");
    str = Element.walk(elem.firstElementChild, (e, a, r, d) => {
      if (e && e.attributes) return dumpElem(e, a + "\n", r, d);
      return null;
    }, str);
    return str;
  }

  static skipper(fn, pred = (a, b) => a.tagName == b.tagName) {
    return function (elem) {
      let next = fn(elem);

      for (; next; next = fn(next)) if (pred(elem, next)) return next;

      return null;
    };
  }

  static prev_sibling(sib) {
    return sib.previousElementSibling;
  }

  static next_sibling(sib) {
    return sib.nextElementSibling;
  }

  static idx(elt) {
    let count = 1;
    let sib = elt.previousElementSibling;

    for (; sib; sib = sib.previousElementSibling) {
      if (sib.tagName == elt.tagName) count++;
    }

    return count;
  }

  static name(elem) {
    let name = elem.tagName.toLowerCase();
    if (elem.id && elem.id.length) name += "#" + elem.id;else if (elem.class && elem.class.length) name += "." + elem.class;
    return name;
  }

  static unique(elem, opts = {}) {
    const _opts$idx = opts.idx,
          idx = _opts$idx === void 0 ? true : _opts$idx,
          _opts$use_id2 = opts.use_id,
          use_id = _opts$use_id2 === void 0 ? true : _opts$use_id2;
    let name = elem.tagName.toLowerCase();
    if (use_id && elem.id && elem.id.length) return name + "#" + elem.id;
    const classNames = [...elem.classList];

    for (let i = 0; i < classNames.length; i++) {
      let res = document.getElementsByClassName(classNames[i]);
      if (res && res.length === 1) return name + "." + classNames[i];
    }

    if (idx) {
      if (elem.nextElementSibling || elem.previousElementSibling) {
        return name + "[" + Element.idx(elem) + "]";
      }
    }

    return name;
  }

  static factory(delegate = {}, parent = null) {
    let root = parent;

    if (root === null) {
      if (typeof delegate.append_to !== "function") {
        root = delegate;
        delegate = {};
      } else {
        root = "body";
      }
    }

    const _delegate = delegate,
          append_to = _delegate.append_to,
          create = _delegate.create,
          setattr = _delegate.setattr,
          setcss = _delegate.setcss;
    if (typeof root === "string") root = Element.find(root);
    if (!delegate.root) delegate.root = root;

    if (!delegate.append_to) {
      delegate.append_to = function (elem, parent) {
        if (!parent) parent = root;
        if (parent) parent.appendChild(elem);
        if (!this.root) this.root = elem;
      };
    }

    if (!delegate.create) delegate.create = tag => document.createElement(tag);

    if (!delegate.setattr) {
      delegate.setattr = (elem, attr, value) => {
        elem.setAttribute(attr, value);
      };
    }

    if (!delegate.setcss) delegate.setcss = (elem, css) => Object.assign(elem.style, css);

    delegate.bound_factory = (tag, attr = {}, parent = null) => {
      const tagName = attr.tagName,
            style = attr.style,
            children = attr.children,
            innerHTML = attr.innerHTML,
            props = (0, _objectWithoutProperties2.default)(attr, ["tagName", "style", "children", "innerHTML"]);
      let elem = delegate.create(tagName || tag);
      if (style) delegate.setcss(elem, style);

      if (children && children.length) {
        for (let i = 0; i < children.length; i++) {
          if (typeof children[i] === "string") {
            elem.innerHTML += children[i];
          } else {
            const _children$i = children[i],
                  tagName = _children$i.tagName,
                  parent = _children$i.parent,
                  childProps = (0, _objectWithoutProperties2.default)(_children$i, ["tagName", "parent"]);
            delegate.bound_factory(tagName, childProps, elem);
          }
        }
      }

      if (innerHTML) elem.innerHTML += innerHTML;

      for (let k in props) delegate.setattr(elem, k, props[k]);

      if (delegate.append_to) delegate.append_to(elem, parent);
      return elem;
    };

    delegate.bound_factory.delegate = delegate;
    return delegate.bound_factory;
  }

  static remove(element) {
    const e = typeof element === "string" ? Element.find(element) : element;

    if (e && e.parentNode) {
      const parent = e.parentNode;
      parent.removeChild(e);
      return true;
    }

    return false;
  }

  static isat(e, x, y, options) {
    let args = [...arguments];
    let element = args.shift();
    let point = (0, _point.Point)(args);
    const o = args[0] || {
      round: false
    };
    const rect = Element.rect(element, o);
    return _rect.Rect.inside(rect, point);
  }

  static at(x, y, options) {
    if (Element.isElement(x)) return Element.isat.apply(Element, arguments);
    let args = [...arguments];
    const p = (0, _point.Point)(args);
    const w = global.window;
    const d = w.document;
    const s = o.all ? e => {
      if (ret == null) ret = [];
      ret.push(e);
    } : (e, depth) => {
      e.depth = depth;
      if (ret === null || depth >= ret.depth) ret = e;
    };
    let ret = null;
    return new Promise((resolve, reject) => {
      let element = null;
      Element.walk(d.body, (e, accu, root, depth) => {
        const r = Element.rect(e, {
          round: true
        });
        if (_rect.Rect.area(r) == 0) return;
        if (_rect.Rect.inside(r, p)) s(e, depth);
      });
      if (ret !== null) resolve(ret);else reject();
    });
  }

  static transition(element, css, time, easing = "linear", callback = null) {
    let args = [...arguments];
    const e = typeof element === "string" ? Element.find(args.shift()) : args.shift();
    let a = [];
    const t = typeof time == "number" ? "".concat(time, "ms") : time;
    let ctx = {
      e,
      t,
      from: {},
      to: {},
      css
    };
    args.shift();
    args.shift();
    easing = typeof args[0] == "function" ? "linear" : aargs.shift();
    callback = args.shift();

    for (let prop in css) {
      const name = _util.default.decamelize(prop);

      a.push("".concat(name, " ").concat(t, " ").concat(easing));
      ctx.from[prop] = e.style.getProperty ? e.style.getProperty(name) : e.style[prop];
      ctx.to[name] = css[prop];
    }

    const tlist = a.join(", ");
    var cancel;
    let ret = new Promise((resolve, reject) => {
      var trun = function trun(e) {
        this.event = e;
        callback(this);
      };

      var tend = function tend(e) {
        this.event = e;
        this.e.removeEventListener("transitionend", this);
        this.e.style.setProperty("transition", "");
        delete this.cancel;
        resolve(this);
      };

      e.addEventListener("transitionend", (ctx.cancel = tend).bind(ctx));
      if (typeof callback == "function") e.addEventListener("transitionrun", (ctx.run = trun).bind(ctx));

      cancel = () => ctx.cancel();

      if (e.style && e.style.setProperty) e.style.setProperty("transition", tlist);else e.style.transition = tlist;
      Object.assign(e.style, css);
    });
    ret.cancel = cancel;
    return ret;
  }

}

exports.Element = Element;
Element.children = _regenerator.default.mark(function _callee(elem, tfn = e => e) {
  var e;
  return _regenerator.default.wrap(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        if (typeof elem == "string") elem = Element.find(elem);
        e = elem.firstElementChild;

      case 2:
        if (!e) {
          _context.next = 8;
          break;
        }

        _context.next = 5;
        return tfn(e);

      case 5:
        e = e.nextElementSibling;
        _context.next = 2;
        break;

      case 8:
      case "end":
        return _context.stop();
    }
  }, _callee);
});
Element.recurse = _regenerator.default.mark(function _callee2(elem, tfn = e => e) {
  var root;
  return _regenerator.default.wrap(function _callee2$(_context2) {
    while (1) switch (_context2.prev = _context2.next) {
      case 0:
        if (typeof elem == "string") elem = Element.find(elem);
        root = elem;

      case 2:
        elem = elem.firstElementChild || elem.nextElementSibling || function () {
          do {
            if (!(elem = elem.parentElement)) break;
          } while (!elem.nextSibling);

          return elem && elem != root ? elem.nextElementSibling : null;
        }();

        if (!(elem !== null)) {
          _context2.next = 6;
          break;
        }

        _context2.next = 6;
        return tfn(elem);

      case 6:
        if (elem) {
          _context2.next = 2;
          break;
        }

      case 7:
      case "end":
        return _context2.stop();
    }
  }, _callee2);
});
Element.EDGES = {
  upperLeft: 0,
  upperCenter: 0.5,
  upperRight: 1,
  centerRight: 1.5,
  lowerRight: 2,
  lowerCenter: 2.5,
  lowerLeft: 3,
  centerLeft: 3.5
};

Element.edges = arg => Element.getEdgesXYWH(Element.rect(arg));

Element.Axis = {
  H: 0,
  V: 2
};

Element.margin = element => Element.getTRBL(element, "margin");

Element.padding = element => Element.getTRBL(element, "padding");

Element.border = element => Element.getTRBL(element, "border");

function isElement(e) {
  return e.tagName !== undefined;
}
