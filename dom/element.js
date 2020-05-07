import { Node } from "./node.js";
import { TRBL } from "../geom/trbl.js";
import { Point, isPoint } from "../geom/point.js";
import { Rect, isRect } from "../geom/rect.js";
import { Size, isSize } from "../geom/size.js";
import { Align, Anchor } from "../geom/align.js";
import Util from "../util.js";
/**
 * Class for element.
 *
 * @class      Element (name)
 */
export class Element extends Node {
  static wrap(e) {
    if(!this.methods)
      this.methods = Util.static({}, this, this, (k, fn) => k != "wrap" && fn.length > 0);

    if(typeof e == "string") e = Element.find(e);
    return Util.extend(e, this.methods);
  }

  static create() {
    let args = [...arguments];
    let { tagName, ns, children, ...props } =
      typeof args[0] == "object" ? args.shift() : { tagName: args.shift(), ...args.shift() };
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

  static walkUp(elem, pred) {
    if(typeof elem == "string") elem = Element.find(elem);
    var depth = 0;
    if(typeof pred == "number") {
      var n = pred;
      pred = (e, d) => d == n;
    }
    let ret = [];
    while(elem) {
      if(pred(elem, depth)) ret.push(elem);
      elem = elem.parentElement;
      depth++;
    }
    return ret.length ? ret : null;
  }

  static walk(elem, fn, accu = {}) {
    if(typeof elem == "string") elem = Element.find(elem);
    const root = elem;
    // const rootPath = Element.xpath(elem);
    let depth = 0;
    while(elem) {
      accu = fn(this.wrap(elem), accu, root, depth);
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

  static *iterator(elem, predicate = (e, d, r) => true) {
    if(typeof elem == "string") elem = Element.find(elem);
    const root = elem;
    let depth = 0;
    while(elem) {
      if(predicate(elem, depth, root)) yield this.wrap(elem);
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
  }

  static toObject(elem, opts = { children: true }) {
    let e = Element.find(elem);
    let children = [];
    if(opts.children && e.firstChild) {
      for(let c = e.firstChild; c; c = c.nextSibling) {
        if(Util.isObject(c) && "tagName" in c) children.push(Element.toObject(c, e));
        else if((c.textContent + "").trim() != "") children.push(c.textContent);
      }
    }
    let ns =
      (arguments[1] ? arguments[1].namespaceURI : document.body.namespaceURI) != e.namespaceURI
        ? { ns: e.namespaceURI }
        : {};
    let attributes = {};
    let a = Element.attr(e);
    for(let key in a) {
      let value = a[key];
      attributes[key] = value;
    }
    return Object.assign(
      {
        tagName: /[a-z]/.test(e.tagName) ? e.tagName : e.tagName.toLowerCase()
      },
      attributes,
      children.length > 0 ? { children } : {}
    );
  }

  static toCommand(elem, opts = {}) {
    let { parent = "", varName, cmd = "Element.create" } = opts;
    let o = Element.toObject(elem, { children: false });
    let s = "";
    let { tagName, ns, children, ...attrs } = o;
    let v = "";
    if(elem.firstElementChild && varName) {
      v = parent ? String.fromCharCode(parent.charCodeAt(0) + 1) : varName;
      s += `${v} = `;
    }
    let a = Util.toString(ns ? { ns, ...attrs } : attrs, { quote: "'" });
    s += `${cmd}('${tagName}', ${a}${parent ? `, ${parent}` : ""})`;
    let c = elem.children; //Util.array(elem.children).map(child => Element.toObject(child, { ...opts, namespaceURI: ns }));
    if(c.length == 1) {
      s = Element.toCommand(c[0], { ...opts, parent: s });
    }
    return s.replace(/;*$/g, "") + ";";
  }

  static find(arg, parent, globalObj = Util.getGlobalObject()) {
    if(!parent && globalObj.document) parent = globalObj.document;

    return typeof arg === "string" ? parent.querySelector(arg) : arg;
  }

  static findAll(arg, parent) {
    parent = Element.find(parent);
    return [
      ...(parent && parent.querySelectorAll
        ? parent.querySelectorAll(arg)
        : document.querySelectorAll(arg))
    ];
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
    } else if("getAttributeNames" in e) {
      attrs_or_name = e.getAttributeNames();
    } else {
      attrs_or_name = [];
      console.log("e:", e);
      if(Util.isArray(e.attributes))
        for(let i = 0; i < e.attributes.length; i++) attrs_or_name.push(e.attributes[i].name);
    }
    let ret = attrs_or_name.reduce((acc, name) => {
      const key = /*Util.camelize*/ name;
      const value = e && e.getAttribute ? e.getAttribute(name) : e[key];
      acc[key] = /^-?[0-9]*\.[0-9]\+$/.test(value) ? parseFloat(value) : value;
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
    if(args.length > 0 && (isRect(args) || isRect(args[0])))
      return Element.setRect.apply(Element, arguments);
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

  static setRect(element, rect, opts = {}) {
    let { anchor, unit = "px", scale } = opts;
    const e = typeof element === "string" ? Element.find(element) : element;
    //console.log("Element.setRect(", element, ",", rect, ", ", anchor, ") ");
    if(typeof anchor == "string") {
      e.style.position = anchor;
      anchor = 0;
    }
    if(scale) Rect.scale(rect, scale, scale);

    anchor = anchor || Anchor.LEFT | Anchor.TOP;
    const position = element.style && element.style.position;
    /*|| rect.position || "relative"*/
    const pelement = position == "fixed" ? e.documentElement || document.body : e.parentNode;
    const prect = Element.rect(pelement, { round: false });
    //Rect.align(rect, prect, anchor);

    /* const stack = Util.getCallers(3, 4);*/
    const ptrbl = Rect.toTRBL(prect);
    const trbl = Rect.toTRBL(rect);
    //console.log("Element.setRect ", { trbl, ptrbl });
    let css = {};
    let remove;
    switch (Anchor.horizontal(anchor)) {
      case Anchor.LEFT:
      default:
        css.left = Math.round(trbl.left /* - ptrbl.left*/) + unit;
        remove = "right";
        break;
      case Anchor.RIGHT:
        css.right = Math.round(trbl.right - ptrbl.right) + unit;
        remove = "left";
        break;
    }
    switch (Anchor.vertical(anchor)) {
      case Anchor.TOP:
      default:
        css.top = Math.round(trbl.top /* - ptrbl.top*/) + unit;
        remove = "bottom";
        break;
      case Anchor.BOTTOM:
        css.bottom = Math.round(trbl.bottom - ptrbl.bottom) + unit;
        remove = "top";
        break;
    }
    if(e.style) {
      if(e.style.removeProperty) e.style.removeProperty(remove);
      else e.style[remove] = undefined;
    }
    //  css.position = position;
    css.width = Math.round(rect.width) + (unit || unit);
    css.height = Math.round(rect.height) + (unit || unit);
    //console.log("Element.setRect ", css);
    Element.setCSS(e, css);
    //  Object.assign(e.style, css);
    //    Element.setCSS(e, css);
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
    let position = rest.shift() || Element.getCSS(element, "position") || "relative";
    let off;
    //console.log('Element.move ', { element, to, position });
    const getValue = prop => {
      const property = Element.getCSS(element, prop);
      if(property === undefined) return undefined;
      const matches = /([-0-9.]+)(.*)/.exec(property) || [];
      //console.log({ match, value, unit });
      return parseFloat(matches[1]);
    };

    const current = new Point({
      x: getValue("left") || 0,
      y: getValue("top") || 0
    });
    off = new Point(Element.rect(element, { round: false }));
    //   off = Point.diff(off, current);
    Point.add(current, Point.diff(to, off));
    /*
    if(position == 'relative') {
      to.x -= off.x;
      to.y -= off.y;
    }*/
    let css = Point.toCSS(current);
    console.log("Element.move: ", { position, to, css, off, current });
    //console.log('move newpos: ', Point.toCSS(pt));
    Element.setCSS(element, { ...css, position });
    return element;
  }

  static resize(element, ...dimensions) {
    let e = Element.find(element);
    let size = new Size(...dimensions);
    const css = Size.toCSS(size);
    console.log("Element.resize: ", { e, size, css });
    Element.setCSS(e, css);
    return e;
  }

  static getEdgesXYWH({ x, y, w, h }) {
    return [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h }
    ];
  }

  static getEdge({ x, y, w, h }, which) {
    return [
      { x, y },
      { x: x + w / 2, y },
      { x: x + w, y },
      { x: x + w, y: y + h / 2 },
      { x: x + w, y: y + h },
      { x: x + w / 2, y: y + h },
      { x, y: y + h },
      { x, y: y + h / 2 }
    ][Math.floor(which * 2)];
  }

  static getPointsXYWH({ x, y, w, h }) {
    return [
      { x, y },
      { x: x + w, y: y + h }
    ];
  }

  static cumulativeOffset(element, relative_to = null) {
    if(typeof element == "string") element = Element.find(element);
    let p = { x: 0, y: 0 };
    do {
      p.y += element.offsetTop || 0;
      p.x += element.offsetLeft || 0;
    } while((element = element.offsetParent) && element != relative_to);
    return p;
  }

  static getTRBL(element, prefix = "") {
    const names = ["Top", "Right", "Bottom", "Left"].map(
      pos => prefix + (prefix == "" ? pos.toLowerCase() : pos + (prefix == "border" ? "Width" : ""))
    );
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

  static setCSS(element, prop, value) {
    if(typeof element == "string") element = Element.find(element);
    if(typeof prop == "string" && typeof value == "string") prop = { [prop]: value };

    console.log("Element.setCSS ", { element, prop });

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
  }

  static getCSS(element, property = undefined, receiver = null) {
    element = typeof element === "string" ? Element.find(element) : element;

    const w = window !== undefined ? window : global.window;
    const d = document !== undefined ? document : global.document;
    //console.log('Element.getCSS ', { w, d, element });

    let parent = element.parentElement ? element.parentElement : element.parentNode;

    const estyle =
      /*Util.toHash*/ w && w.getComputedStyle
        ? w.getComputedStyle(element)
        : d.getComputedStyle(element);
    const pstyle =
      parent && parent.tagName
        ? /*Util.toHash*/ w && w.getComputedStyle
          ? w.getComputedStyle(parent)
          : d.getComputedStyle(parent)
        : {};
    console.log("Element.getCSS ", { estyle, pstyle });

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
  }

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

  static prev_sibling(sib) {
    return sib.previousElementSibling;
  }
  static next_sibling(sib) {
    return sib.nextElementSibling;
  }

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
      if(typeof tag == "object") {
        const { tagName, ...a } = tag;
        attr = a;
        tag = tagName;
      }
      const { style, children, className, innerHTML, ...props } = attr;
      let elem = delegate.create(tag);
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
      if(className) elem.classList.add(className);
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
    delegate.bound_factory.delegate = delegate;
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
  /*
      e=Util.shuffle(Element.findAll('rect'))[0]; r=Element.rect(e); a=rect(r, new dom.HSLA(200,100,50,0.5));
      t=Element.transition(a, { transform: 'translate(100px,100px) scale(2,2) rotate(45deg)' }, 10000, ctx => console.log("run",ctx)); t.then(done => console.log({done}))

*/
  static transition(element, css, time, easing = "linear", callback = null) {
    let args = [...arguments];
    const e = typeof element === "string" ? Element.find(args.shift()) : args.shift();
    let a = [];
    const t = typeof time == "number" ? `${time}ms` : time;
    let ctx = { e, t, from: {}, to: {}, css };
    args.shift();
    args.shift();

    easing = typeof args[0] == "function" ? "linear" : aargs.shift();
    callback = args.shift();

    for(let prop in css) {
      const name = Util.decamelize(prop);
      a.push(`${name} ${t} ${easing}`);
      ctx.from[prop] = e.style.getProperty ? e.style.getProperty(name) : e.style[prop];
      ctx.to[name] = css[prop];
    }
    const tlist = a.join(", ");

    //console.log("Element.transition", { ctx, tlist });

    var cancel;
    let ret = new Promise((resolve, reject) => {
      var trun = function(e) {
        this.event = e;
        //console.log("Element.transitionRun event", this);
        callback(this);
      };
      var tend = function(e) {
        this.event = e;
        //console.log("Element.transitionEnd event", this);
        this.e.removeEventListener("transitionend", this);
        this.e.style.setProperty("transition", "");
        delete this.cancel;
        resolve(this);
      };

      e.addEventListener("transitionend", (ctx.cancel = tend).bind(ctx));

      if(typeof callback == "function")
        e.addEventListener("transitionrun", (ctx.run = trun).bind(ctx));

      cancel = () => ctx.cancel();

      if(e.style && e.style.setProperty) e.style.setProperty("transition", tlist);
      else e.style.transition = tlist;

      Object.assign(e.style, css);
    });
    ret.cancel = cancel;
    return ret;
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
Element.Axis = { H: 0, V: 2 };

Element.margin = element => Element.getTRBL(element, "margin");
Element.padding = element => Element.getTRBL(element, "padding");
Element.border = element => Element.getTRBL(element, "border");

export function isElement(e) {
  return e.tagName !== undefined;
}
