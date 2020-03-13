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


export function Timer(timeout, fn, props = {}, { create = setInterval, destroy = clearInterval }) {
  let t = {
    timeout,
    fn,
    running: true,
    id: create(() => fn.call(t, t), timeout, fn, t),
    started: Date.now(),
    stop() {
      if(this.id !== null) {
        destroy(this.id);
        this.id = null;
        this.running = false;
      }
    },
    ...props
  };

  if(this instanceof Timer) Object.assign(this, t);
  else return t;
}


Timer.interval = (timeout, fn, props) => new Timer(timeout, fn, props, { destroy: clearTimeout });

Timer.once = (timeout, fn, props) => new Timer(timeout, fn, props, { create: setTimeout, destroy: clearTimeout });
Timer.until = (deadline, fn, props) => Timer.once(deadline - Date.now(), fn, props);

Timer.std = { create: (fn, interval) => setTimeout(fn, interval), destroy: id => clearTimeout(id) };

Timer.debug = (impl = Timer.std) => ({
  log: msg => console.log(msg),
  create(fn, timeout) {
    var id, str;
    id = impl.create(() => {
      this.log(`Timer #${id} END`);
      impl.destroy(id);
      fn();
    }, timeout);
    this.log(`Timer #${id} START ${timeout}ms`);
    return id;
  },
  destroy(id) {
    impl.destroy(id);
    this.log(`Timer #${id} STOP`);
  }
});

Timer.promise = (timeout, impl = Timer.std /*Timer.debug(Timer.std)*/) =>
  new Promise((resolve, reject) =>
    Timer(
      timeout,
      resolve,
      {},
      {
        create: (fn, timeout) => impl.create(fn, timeout),
        destroy: id => {
          impl.destroy(id);
          reject();
        }
      }
    )
  );

/**
 * DOM Tree
 * @param {[type]} root [description]
 */
export function Tree(root) {
  if(this instanceof Tree) {
    root = Object.assign(this, root, { realNode: root });
  }
  if(!(this instanceof Tree)) return tree;
}

Tree.walk = function walk(node, fn, accu = {}) {
  var elem = node;
  const root = elem;
  let depth = 0;
  while(elem) {
    accu = fn(elem, accu, root, depth);
    if(elem.firstChild) depth++;
    elem =
      elem.firstChild ||
      elem.nextSibling ||
      (function() {
        do {
          if(!(elem = elem.parentNode)) break;
          depth--;
        } while(depth > 0 && !elem.nextSibling);
        return elem && elem != root ? elem.nextSibling : null;
      })();
  }
  return accu;
};

const ifdef = (value, def, nodef) => (value !== undefined ? def : nodef);

export function isElement(e) {
  return e.tagName !== undefined;
}

export class Node {
  static parents(node) {
    return (function*() {
      var n = node;
      do {
        if(n) yield n;
      } while(n && (n = n.parentNode));
    })();
  }

  static depth(node) {
    let r = 0;
    while(node && node.parentNode) {
      r++;
      node = node.parentNode;
    }
    return r;
  }

  static attrs(node) {
    return node.attributes && node.attributes.length > 0 ? Array.from(node.attributes).reduce((acc, attr) => ({ ...acc, [attr.name]: isNaN(parseFloat(attr.value)) ? attr.value : parseFloat(attr.value) }), {}) : {};
  }
}

/**
 * Class for element.
 *
 * @class      Element (name)
 */
export class Element extends Node {
  static create() {
    let args = [...arguments];
    let { tagName, ns, children, ...props } = typeof args[0] == "object" ? args.shift() : { tagName: args.shift(), ...args.shift() };
    let parent = args.shift();

    //console.log('Element.create ', { tagName, props, parent });

    let d = document || window.document;
    let e = ns ? d.createElementNS(ns, tagName) : d.createElement(tagName);
    for(let k in props) {
      const value = props[k];
      if(k == "parent") {
        parent = props[k];
        continue;
      } else if(k == "className") k = "class";
      if(k == "style" && typeof value === "object") Element.setCSS(e, value);
      else if(k.startsWith("on") || k.startsWith("inner")) e[k] = value;
      else e.setAttribute(k, value);
    }
    if(children && children.length) children.forEach(obj => Element.create(obj, e));

    if(parent && parent.appendChild) parent.appendChild(e);
    return e;
  }

  static walk(elem, fn, accu = {}) {
    elem = Element.find(elem);
    const root = elem;
    const rootPath = Element.xpath(elem);
    let depth = 0;
    while(elem) {
      accu = fn(dom(elem), accu, root, depth);
      if(elem.firstElementChild) depth++;
      elem =
        elem.firstElementChild ||
        elem.nextElementSibling ||
        (function() {
          do {
            if(!(elem = elem.parentElement)) break;
            depth--;
          } while(depth > 0 && !elem.nextElementSibling);
          return elem && elem != root ? elem.nextElementSibling : null;
        })();
    }
    return accu;
  }

  static toObject(elem, opts = { children: true }) {
    let e = Element.find(elem);
    let children = opts.children ? (e.children && e.children.length ? { children: Util.array(e.children).map(child => Element.toObject(child, e)) } : {}) : {};
    let ns = (arguments[1] ? arguments[1].namespaceURI : document.body.namespaceURI) != e.namespaceURI ? { ns: e.namespaceURI } : {};
    let attributes = {};
    let a = Element.attr(e);
    for(let key in a) {
      let value = a[key];
      attributes[Util.camelize(key)] = value;
    }
    return {
      tagName: e.tagName,
      ...attributes,
      ...children,
      ...ns
    };
  }

  static toCommand(elem, parent = "") {
    let o = Element.toObject(elem, { children: false });
    console.log("o:", o);
    let s = "";
    let { tagName, ns, children, ...attrs } = o;
    let v = "";
    if(elem.firstElementChild) {
      v = parent ? String.fromCharCode(parent.charCodeAt(0) + 1) : "e";
      s += `${v} = `;
    }
    s += `Element.create('${tagName}', { ${Object.entries(attrs)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(", ")} }${parent ? `, ${parent}` : ""});`;
    let child;
    for(child = elem.firstElementChild; child; child = child.nextElementSibling) {
      s += "\n" + Element.toCommand(child, v);
    }
    return s;
  }

  static find(arg, parent) {
    if(!parent && global.window) parent = window.document;

    return typeof arg === "string" ? parent.querySelector(arg) : arg;
  }

  static findAll(arg, parent) {
    parent = Element.find(parent);
    return Util.array(parent && parent.querySelectorAll ? parent.querySelectorAll(arg) : document.querySelectorAll(arg));
  }

  /**
   * Sets or gets attributes
   *
   * @param      {<type>}  element       The element
   * @param      {<type>}  [attrs=null]  The attributes
   * @return     {<type>}  { description_of_the_return_value }
   */
  static attr(element, attrs_or_name) {
    const e = typeof element === "string" ? Element.find(element) : element;
    if(!Util.isArray(attrs_or_name) && typeof attrs_or_name === "object" && e) {
      for(let key in attrs_or_name) {
        const name = Util.decamelize(key, "-");
        const value = attrs_or_name[key];
        /*        console.log('attr(', e, ', ', { name, key, value, }, ')')
         */ if(key.startsWith("on") && !/svg/.test(e.namespaceURI)) e[key] = value;
        else if(e.setAttribute) e.setAttribute(name, value);
        else e[key] = value;
      }
      return e;
    }
    if(typeof attrs_or_name === "function") {
      attrs_or_name(e.attributes, e);
      return e;
    } else if(typeof attrs_or_name === "string") {
      attrs_or_name = [attrs_or_name];
    } else {
      attrs_or_name = e.getAttributeNames();
    }
    let ret = attrs_or_name.reduce((acc, name) => {
      const key = /*Util.camelize*/ name;
      const value = e.getAttribute ? e.getAttribute(name) : e[key];
      acc[key] = isNaN(parseFloat(value)) ? value : parseFloat(value);
      return acc;
    }, {});
    if(typeof arguments[1] == "string") return ret[attrs_or_name[0]];
    return ret;
  }

  static getRect(elem) {
    let e = elem;
    while(e) {
      if(e.style) {
        if(e.style.position == "") e.style.position = "relative";
        if(e.style.left == "") e.style.left = "0px";
        if(e.style.top == "") e.style.top = "0px";
      }
      e = e.offsetParent || e.parentNode;
    }
    const bbrect = elem.getBoundingClientRect();
    //console.log('getRect: ', { bbrect });
    return {
      x: bbrect.left + window.scrollX,
      y: bbrect.top + window.scrollY,
      width: bbrect.right - bbrect.left,
      height: bbrect.bottom - bbrect.top
    };
  }

  /**
   * Gets the rectangle.
   *
   * @param      {<type>}  e
   * lement  The element
   * @return     {Object}  The rectangle.
   */
  static rect(elem, options = {}) {
    let args = [...arguments];
    let element = args.shift();
    if(args.length > 0 && (isRect(args) || isRect(args[0]))) return Element.setRect.apply(Element, arguments);
    const { round = true, relative_to = null, scroll_offset = true } = options;
    const e = typeof element === "string" ? Element.find(element) : element;
    if(!e || !e.getBoundingClientRect) {
      return new Rect(0, 0, 0, 0);
    }
    const bb = e.getBoundingClientRect();

    let r = TRBL.toRect(bb);
    if(relative_to && relative_to !== null /*&& Element.isElement(relative_to)*/) {
      const off = Element.rect(relative_to);
      r.x -= off.x;
      r.y -= off.y;
    }

    // console.log("Element.rect(", r, ")");

    if(options.border) {
      const border = Element.border(e);
      Rect.outset(r, border);

      // console.log("Element.rect(", r, ") // with border = ", border);
    }

    const { scrollTop, scrollY } = window;
    if(scroll_offset) {
      r.y += scrollY;
    }
    r = new Rect(round ? Rect.round(r) : r);
    //console.log('Element.rect(', element, ') =', r);
    return r;
  }

  static setRect(element, rect, anchor = Anchor.LEFT | Anchor.TOP) {
    const e = typeof element === "string" ? Element.find(element) : element;
    //console.log('Element.setRect(', element, ',', rect, ', ', anchor, ') ');
    if(typeof anchor == "string") e.style.position = anchor;
    const position = e.style.position || rect.position || "relative";
    const pelement = position == "fixed" ? e.documentElement || document.body : e.parentNode;
    const prect = Element.rect(pelement, { round: false });
    //Rect.align(rect, prect, anchor);

    /* const stack = Util.getCallers(3, 4);*/
    const ptrbl = Rect.toTRBL(prect);
    const trbl = Rect.toTRBL(rect);
    //console.log('Element.setRect ', { trbl, ptrbl, stack });
    let css = {};
    let remove;
    switch (Anchor.horizontal(anchor)) {
      case Anchor.LEFT:
      default:
        css.left = Math.round(trbl.left - ptrbl.left) + "px";
        remove = "right";
        break;
      case Anchor.RIGHT:
        css.right = Math.round(trbl.right - ptrbl.right) + "px";
        remove = "left";
        break;
    }
    switch (Anchor.vertical(anchor)) {
      case Anchor.TOP:
      default:
        css.top = Math.round(trbl.top - ptrbl.top) + "px";
        remove = "bottom";
        break;
      case Anchor.BOTTOM:
        css.bottom = Math.round(trbl.bottom - ptrbl.bottom) + "px";
        remove = "top";
        break;
    }
    if(e.style.removeProperty) e.style.removeProperty(remove);
    else e.style[remove] = undefined;
    css.position = position;
    css.width = Math.round(isNaN(rect.width) ? rect.width : prect.width) + "px";
    css.height = Math.round(isNaN(rect.height) ? rect.height : prect.height) + "px";
    //console.log('Element.setRect ', css);
    Element.setCSS(e, css);
    return e;
  }

  static position(element, pos = "absolute") {
    if(typeof element == "string") element = Element.find(element);
    const { x, y } = element.getBoundingClientRect();
    return new Point({ x, y });
  }

  static move(element, point, pos) {
    let [e, ...rest] = [...arguments];
    let { x = Element.position(element).x, y = Element.position(element).y } = new Point(rest);
    let to = { x, y };
    let position = pos || Element.getCSS(element, "position") || "relative";
    let off;
    //console.log('Element.move ', { element, to, position });
    const getValue = prop => {
      const property = dom.Element.getCSS(element, prop);
      if(property === undefined) return undefined;
      const matches = /([-0-9.]+)(.*)/.exec(property) || [];
      //console.log({ match, value, unit });
      return parseFloat(matches[1]);
    };

    const current = new Point({ x: getValue("left") || 0, y: getValue("top") || 0 });
    off = new Point(Element.rect(element, { round: false }));
    //   off = Point.diff(off, current);
    Point.add(current, Point.diff(to, off));
    /*
    if(position == 'relative') {
      to.x -= off.x;
      to.y -= off.y;
    }*/
    let css = Point.toCSS(current);
    //console.log("Element.move: ", { position, to, css, off, current });
    //console.log('move newpos: ', Point.toCSS(pt));
    Element.setCSS(element, { ...css, position });
    return element;
  }

  static resize() {
    let args = [...arguments];
    let e = Element.find(args.shift());
    let size = new Size(args);
    const css = Size.toCSS(size);
    //console.log("Element.resize: ", { e, size, css });
    Element.setCSS(e, css);
    return e;
  }

  static EDGES = {
    upperLeft: 0,
    upperCenter: 0.5,
    upperRight: 1,
    centerRight: 1.5,
    lowerRight: 2,
    lowerCenter: 2.5,
    lowerLeft: 3,
    centerLeft: 3.5
  };

  static edges = arg => Element.getEdgesXYWH(Element.rect(arg));

  static getEdgesXYWH = ({ x, y, w, h }) => [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h }
  ];
  static getEdge = ({ x, y, w, h }, which) =>
    [
      { x, y },
      { x: x + w / 2, y },
      { x: x + w, y },
      { x: x + w, y: y + h / 2 },
      { x: x + w, y: y + h },
      { x: x + w / 2, y: y + h },
      { x, y: y + h },
      { x, y: y + h / 2 }
    ][Math.floor(which * 2)];

  static Axis = { H: 0, V: 2 };

  static getPointsXYWH = ({ x, y, w, h }) => [
    { x, y },
    { x: x + w, y: y + h }
  ];

  static cumulativeOffset = (element, relative_to = null) => {
    if(typeof element == "string") element = Element.find(element);
    let p = { x: 0, y: 0 };
    do {
      p.y += element.offsetTop || 0;
      p.x += element.offsetLeft || 0;
    } while((element = element.offsetParent) && element != relative_to);
    return p;
  };

  static getTRBL(element, prefix = "") {
    const names = ["Top", "Right", "Bottom", "Left"].map(pos => prefix + (prefix == "" ? pos.toLowerCase() : pos + (prefix == "border" ? "Width" : "")));
    return new TRBL(Element.getCSS(element, names));
  }

  static setTRBL(element, trbl, prefix = "margin") {
    const attrs = ["Top", "Right", "Bottom", "Left"].reduce((acc, pos) => {
      const name = prefix + (prefix == "" ? pos.toLowerCase() : pos);
      return { ...acc, [name]: trbl[pos.toLowerCase()] };
    }, {});
    //console.log('Element.setTRBL ', attrs);
    return Element.setCSS(element, attrs);
  }

  static margin = element => Element.getTRBL(element, "margin");
  static padding = element => Element.getTRBL(element, "padding");
  static border = element => Element.getTRBL(element, "border");

  static setCSS = (element, prop, value) => {
    if(typeof element == "string") element = Element.find(element);
    if(typeof prop == "string" && typeof value == "string") prop = { [prop]: value };

    //console.log('Element.setCSS ', { element, toCSS });
    for(let key in prop) {
      let value = prop[key];
      const propName = Util.decamelize(key);
      if(typeof value == "function") {
        if("subscribe" in value) {
          value.subscribe = newval => element.style.setProperty(propName, newval);
          value = value();
        }
      }
      if(element.style) {
        if(element.style.setProperty) element.style.setProperty(propName, value);
        else element.style[Util.camelize(propName)] = value;
      }
    }
    return element;
  };

  static getCSS = (element, property = undefined, receiver = null) => {
    element = typeof element === "string" ? Element.find(element) : element;

    const w = window !== undefined ? window : global.window;
    const d = document !== undefined ? document : global.document;
    //console.log('Element.getCSS ', { w, d, element });

    let parent = element.parentElement ? element.parentElement : element.parentNode;

    const estyle = Util.toHash(w && w.getComputedStyle ? w.getComputedStyle(element) : d.getComputedStyle(element));
    const pstyle = parent && parent.tagName ? Util.toHash(w && w.getComputedStyle ? w.getComputedStyle(parent) : d.getComputedStyle(parent)) : {};
    //console.log('Element.getCSS ', { estyle, pstyle });

    let style = Util.removeEqual(estyle, pstyle);
    let keys = Object.keys(style).filter(k => !/^__/.test(k));
    //console.log('style: ', style);

    let ret = {};
    if(receiver == null) {
      receiver = result => {
        if(typeof result == "object") {
          try {
            Object.defineProperty(result, "cssText", {
              get: function() {
                return Object.entries(this)
                  .map(([k, v]) => `${Util.decamelize(k, "-")}: ${v};\n`)
                  .join("");
              },
              enumerable: false
            });
          } catch(err) {}
        }
        return result;
      };
    }
    if(property !== undefined) {
      ret =
        typeof property === "string"
          ? style[property]
          : property.reduce((ret, key) => {
              ret[key] = style[key];
              return ret;
            }, {});
    } else {
      for(let i = 0; i < keys.length; i++) {
        const stylesheet = keys[i];
        const key = Util.camelize(stylesheet);
        const val = style[stylesheet] || style[key];
        if(val && val.length > 0 && val != "none") ret[key] = val;
      }
    }
    return receiver(ret);
  };

  static xpath(elt, relative_to = null) {
    let path = "";
    //console.log('relative_to: ', relative_to);
    for(; elt && elt.nodeType == 1; elt = elt.parentNode) {
      const xname = Element.unique(elt);
      path = xname + path;
      if(elt == relative_to) {
        break;
      }
      path = "/" + path;
    }
    return path;
  }

  static selector(elt, opts = {}) {
    const { relative_to = null, use_id = false } = opts;
    let sel = "";
    for(; elt && elt.nodeType == 1; elt = elt.parentNode) {
      if(sel != "") sel = " > " + sel;
      let xname = Element.unique(elt, { idx: false, use_id });
      if(use_id === false) xname = xname.replace(/#.*/g, "");
      sel = xname + sel;
      if(elt == relative_to) break;
    }
    return sel;
  }
  static depth(elem, relative_to = document.body) {
    let count = 0;
    while(elem != relative_to && (elem = elem.parentNode)) count++;
    return count;
  }

  static dump(elem) {
    let str = "";
    function dumpElem(child, accu, root, depth) {
      const rect = Rect.round(Element.rect(child, elem));
      accu += "  ".repeat((depth > 0 ? depth : 0) + 1) + " " + Element.xpath(child, child);
      [...child.attributes].forEach(attr => (accu += " " + attr.name + "='" + attr.value + "'"));
      if(Rect.area(rect) > 0) accu += " " + Rect.toString(rect);
      ["margin", "border", "padding"].forEach(name => {
        let trbl = Element.getTRBL(elem, "margin");
        if(!trbl.null()) accu += " " + name + ": " + trbl + "";
      });
      return accu;
    }
    str = dumpElem(elem, "");
    str = Element.walk(
      elem.firstElementChild,
      (e, a, r, d) => {
        if(e && e.attributes) return dumpElem(e, a + "\n", r, d);
        return null;
      },
      str
    );
    return str;
  }

  static skipper(fn, pred = (a, b) => a.tagName == b.tagName) {
    return function(elem) {
      let next = fn(elem);
      for(; next; next = fn(next)) if(pred(elem, next)) return next;
      return null;
    };
  }

  static prev_sibling = sib => sib.previousElementSibling;
  static next_sibling = sib => sib.nextElementSibling;

  static idx(elt) {
    let count = 1;
    let sib = elt.previousElementSibling;
    for(; sib; sib = sib.previousElementSibling) {
      if(sib.tagName == elt.tagName) count++;
    }
    return count;
  }

  static name(elem) {
    let name = elem.tagName.toLowerCase();
    if(elem.id && elem.id.length) name += "#" + elem.id;
    else if(elem.class && elem.class.length) name += "." + elem.class;
    return name;
  }

  static unique(elem, opts = {}) {
    const { idx = true, use_id = true } = opts;
    let name = elem.tagName.toLowerCase();
    if(use_id && elem.id && elem.id.length) return name + "#" + elem.id;
    const classNames = [...elem.classList]; //String(elem.className).split(new RegExp("/[ \t]/"));
    for(let i = 0; i < classNames.length; i++) {
      let res = document.getElementsByClassName(classNames[i]);
      if(res && res.length === 1) return name + "." + classNames[i];
    }
    if(idx) {
      if(elem.nextElementSibling || elem.previousElementSibling) {
        return name + "[" + Element.idx(elem) + "]";
      }
    }
    return name;
  }

  static factory(delegate = {}, parent = null) {
    let root = parent;
    if(root === null) {
      if(typeof delegate.append_to !== "function") {
        root = delegate;
        delegate = {};
      } else {
        root = "body";
      }
    }
    const { append_to, create, setattr, setcss } = delegate;
    if(typeof root === "string") root = Element.find(root);
    if(!delegate.root) delegate.root = root;
    if(!delegate.append_to) {
      delegate.append_to = function(elem, parent) {
        if(!parent) parent = root;
        if(parent) parent.appendChild(elem);
        if(!this.root) this.root = elem;
      };
    }
    if(!delegate.create) delegate.create = tag => document.createElement(tag);
    if(!delegate.setattr) {
      delegate.setattr = (elem, attr, value) => {
        //console.log('setattr ', { attr, value });
        elem.setAttribute(attr, value);
      };
    }

    if(!delegate.setcss) delegate.setcss = (elem, css) => Object.assign(elem.style, css); // Element.setCSS(elem, css);

    delegate.bound_factory = (tag, attr = {}, parent = null) => {
      const { tagName, style, children, innerHTML, ...props } = attr;
      let elem = delegate.create(tagName || tag);

      if(style) delegate.setcss(elem, style);
      if(children && children.length) {
        for(let i = 0; i < children.length; i++) {
          if(typeof children[i] === "string") {
            elem.innerHTML += children[i];
          } else {
            const { tagName, parent, ...childProps } = children[i];
            delegate.bound_factory(tagName, childProps, elem);
          }
        }
      }
      if(innerHTML) elem.innerHTML += innerHTML;
      for(let k in props) delegate.setattr(elem, k, props[k]);
      /*console.log("bound_factory: ", { _this: this, tag, style, children, parent, props, to, append_to: this.append_to });*/
      if(delegate.append_to) delegate.append_to(elem, parent);
      return elem;
    };

    /*  console.log("delegate: ", delegate);*/
    /*    let proxy = function() {
      let obj = this && this.create ? this : delegate;
      return obj.bound_factory.apply(obj, arguments);
    };*/
    return delegate.bound_factory; //.bind(delegate);
  }

  static remove(element) {
    const e = typeof element === "string" ? Element.find(element) : element;
    if(e && e.parentNode) {
      const parent = e.parentNode;
      parent.removeChild(e);
      return true;
    }
    return false;
  }

  static isat(e, x, y, options) {
    let args = [...arguments];
    let element = args.shift();
    let point = Point(args);
    const o = args[0] || { round: false };
    const rect = Element.rect(element, o);
    return Rect.inside(rect, point);
  }

  static at(x, y, options) {
    if(Element.isElement(x)) return Element.isat.apply(Element, arguments);
    let args = [...arguments];
    const p = Point(args);
    const w = global.window;
    const d = w.document;
    const s = o.all
      ? e => {
          if(ret == null) ret = [];
          ret.push(e);
        }
      : (e, depth) => {
          e.depth = depth;
          if(ret === null || depth >= ret.depth) ret = e;
        };
    let ret = null;
    return new Promise((resolve, reject) => {
      let element = null;
      Element.walk(d.body, (e, accu, root, depth) => {
        const r = Element.rect(e, { round: true });
        if(Rect.area(r) == 0) return;
        if(Rect.inside(r, p)) s(e, depth);
      });
      if(ret !== null) resolve(ret);
      else reject();
    });
  }

  static transition(element, css, time, easing = "linear") {
    const e = typeof element === "string" ? Element.find(element) : element;
    let a = [];
    const t = typeof time == "number" ? `${time}ms` : time;
    let ctx = { e, t, from: {}, to: {}, css };

    for(let prop in css) {
      const name = Util.decamelize(prop);
      a.push(`${name} ${t} ${easing}`);
      ctx.from[prop] = e.style.getProperty ? e.style.getProperty(name) : e.style[prop];
      ctx.to[name] = css[prop];
    }
    const tlist = a.join(", ");
    //console.log("Element.transition", ctx);

    return new Promise((resolve, reject) => {
      var tend = function(e) {
        this.event = e;
        //console.log("Element.transitionEnd event", this);
        this.e.removeEventListener("transitionend", this.fn);
        this.e.style.setProperty("transition", "");
        delete this.fn;
        resolve(this);
      };
      ctx.fn = tend;
      if(e.style && e.style.setProperty) e.style.setProperty("transition", tlist);
      else e.style.transition = tlist;

      e.addEventListener("transitionend", tend.bind(ctx));
      Object.assign(e.style, css);
    });
  }
}

Element.children = function*(elem, tfn = e => e) {
  if(typeof elem == "string") elem = Element.find(elem);
  for(let e = elem.firstElementChild; e; e = e.nextElementSibling) yield tfn(e);
};

Element.recurse = function*(elem, tfn = e => e) {
  if(typeof elem == "string") elem = Element.find(elem);
  let root = elem;
  do {
    elem =
      elem.firstElementChild ||
      elem.nextElementSibling ||
      (function() {
        do {
          if(!(elem = elem.parentElement)) break;
        } while(!elem.nextSibling);
        return elem && elem != root ? elem.nextElementSibling : null;
      })();

    if(elem !== null) yield tfn(elem);
  } while(elem);
};

export class CSS {
  static list(doc) {
    if(!doc) doc = window.document;

    const getStyleMap = (obj, key) => {
      let rule = Util.find(obj, item => item["selectorText"] == key);
      return Util.adapter(
        rule,
        obj => (obj && obj.styleMap && obj.styleMap.size !== undefined ? obj.styleMap.size : 0),
        (obj, i) => [...obj.styleMap.keys()][i],
        (obj, key) =>
          obj.styleMap
            .getAll(key)
            .map(v => String(v))
            .join(" ")
      );
    };
    const getStyleSheet = (obj, key) => {
      let sheet = Util.find(obj, entry => entry.href == key || entry.ownerNode.id == key) || obj[key];

      return Util.adapter(
        sheet.rules,
        obj => (obj && obj.length !== undefined ? obj.length : 0),
        (obj, i) => obj[i].selectorText,
        getStyleMap
      );
    };
    return Util.adapter(
      [...doc.styleSheets],
      obj => obj.length,
      (obj, i) => obj[i].href || obj[i].ownerNode.id || i,
      getStyleSheet
    );
  }
  static styles(stylesheet) {
    const list = stylesheet && stylesheet.cssRules ? [stylesheet] : CSS.list(stylesheet);
    let ret = Util.array();

    list.forEach(s => {
      let rules = [...s.cssRules];

      rules.forEach(rule => {
        ret.push(rule.cssText);
      });
    });
    return ret;
  }
  static classes(selector = "*") {
    return Element.findAll(selector)
      .filter(e => e.classList.length)
      .map(e => [...e.classList])
      .flat()
      .unique();
  }
}

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

export class SVG extends Element {
  static ns = "http://www.w3.org/2000/svg";

  static create(name, attr, parent) {
    var svg = document.createElementNS(SVG.ns, name);
    let text;
    if(attr.text !== undefined) {
      text = attr.text;
      delete attr.text;
    }

    if(name == "svg") {
      attr.version = "1.1";
      attr.xmlns = SVG.ns;
    }

    Util.foreach(attr, (value, name) => svg.setAttribute(Util.decamelize(name, "-"), value));

    if(parent && parent.appendChild) parent.appendChild(svg);

    if(text) svg.innerHTML = text;

    return svg;
  }

  static factory(parent, size = null) {
    let delegate = {
      create: tag => document.createElementNS(SVG.ns, tag),
      append_to: elem => parent.appendChild(elem),
      setattr: (elem, name, value) => name != "ns" && elem.setAttributeNS(document.namespaceURI, Util.decamelize(name, "-"), value),
      setcss: (elem, css) => elem.setAttributeNS(null, "style", css)
    };
    if(size == null) size = Size(Rect.round(Element.rect(parent)));
    const { width, height } = size;

    if(parent && parent.tagName == "svg") delegate.root = parent;
    else if(this !== SVG && this && this.appendChild) delegate.root = this;
    else {
      delegate.root = SVG.create("svg", { width, height, viewBox: "0 0 " + width + " " + height + "" }, parent);
    }

    if(!delegate.root.firstElementChild || delegate.root.firstElementChild.tagName != "defs") {
      SVG.create("defs", {}, delegate.root);
    }

    delegate.append_to = function(elem, p) {
      var root = p || this.root;

      if(elem.tagName.indexOf("Gradient") != -1) {
        root = root.querySelector("defs");
      }

      if(typeof root.append == "function") root.append(elem);
      else root.appendChild(elem);
      //console.log('append_to ', elem, ', root=', root);
    };
    return Element.factory(delegate);
  }

  static matrix(element, screen = false) {
    let e = typeof element === "string" ? Element.find(element) : element;
    let fn = screen ? "getScreenCTM" : "getCTM";
    if(e && e[fn]) return Matrix.fromDOMMatrix(e[fn]());
    return null;
  }

  static bbox(element, options = { parent: null, absolute: false }) {
    let e = typeof element === "string" ? Element.find(element, options.parent) : element;
    let bb;
    f;
    if(e && e.getBBox) {
      bb = new Rect(e.getBBox());
      if(options.absolute) {
        let r = Element.rect(element.ownerSVGElement);
        bb.x += r.x;
        bb.y += r.y;
      }
      return bb;
    }
    return Element.rect(e);
  }

  static gradient(type, { stops, factory = SVG.create, parent = null, line = false, ...props }) {
    var defs = factory("defs", {}, parent);
    const map = new Map(stops instanceof Array ? stops : Object.entries(stops));

    let rect = {};

    if(line) {
      rect = new Rect(line);
      rect = { x1: rect.x, y1: rect.y, x2: rect.x2, y2: rect.y2 };
    }
    //    const { x1, y1, x2, y2 } = line;

    let grad = factory(type + "-gradient", { ...props, ...rect }, defs);

    map.forEach((color, o) => {
      //console.log('color:' + color + ' o:' + o);
      factory("stop", { offset: Math.round(o * 100) + "%", stopColor: color }, grad);
    });

    return grad;
  }

  static owner(elem) {
    var ret = function(tag, props, parent) {
      if(tag === undefined) return this.element;
      return SVG.create.call(SVG, tag, props, parent || this.element);
    };
    ret.element = elem.ownerSVGElement;
    Util.defineGetterSetter(ret, "rect", function() {
      return Element.rect(this.element);
    });
    return ret;
  }

  static path() {
    return new SvgPath();
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
