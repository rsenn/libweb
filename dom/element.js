import { Node } from './node.js';
import { TRBL } from '../geom/trbl.js';
import { Point } from '../geom/point.js';
import { Rect, isRect } from '../geom/rect.js';
import { Size } from '../geom/size.js';
import { Anchor } from '../geom/align.js';
import { iterator } from './iterator.js';
import Util from '../util.js';

/**
 * Class for element.
 *
 * @class      Element (name)
 */
export class Element extends Node {
  static EDGES = { upperLeft: 0, upperCenter: 0.5, upperRight: 1, centerRight: 1.5, lowerRight: 2, lowerCenter: 2.5, lowerLeft: 3, centerLeft: 3.5 };

  static edges = (arg) => Element.getEdgesXYWH(Element.rect(arg));
  static Axis = { H: 0, V: 2 };

  static margin = (element) => Element.getTRBL(element, 'margin');
  static padding = (element) => Element.getTRBL(element, 'padding');
  static border = (element) => Element.getTRBL(element, 'border');

  static wrap(e) {
    let names;
    if(!names) names = Util.getMethodNames(Element, 1, 0);
    if(typeof e == 'string') e = Element.find(e);
    let props = names.reduce((acc, name) => {
      if(typeof acc[name] != 'function') {
        try {
          delete acc[name];
          acc[name] = function (...args) {
            args.unshift(this);
            return Element[name].call(Element, ...args);
          };
        } catch(err) {}
      }
      return acc;
    }, e);
    //console.log("props:",props);
    return e;
  }

  static create() {
    let args = [...arguments];
    let { tagName, ns, children, ...props } = typeof args[0] == 'object' ? args.shift() : { tagName: args.shift(), ...args.shift() };
    let parent = args.shift();
    parent = typeof parent == 'string' ? Element.find(parent) : parent;

    //console.log('Element.create ', { tagName, props, parent });

    let d = document || window.document;
    let e = ns ? d.createElementNS(ns, tagName) : d.createElement(tagName);
    for(let k in props) {
      const value = props[k];
      if(k == 'parent') {
        parent = props[k];
        continue;
      } else if(k == 'className') k = 'class';
      if(k == 'style' && typeof value === 'object') Element.setCSS(e, value);
      else if(k.startsWith('on') || k.startsWith('inner')) e[k] = value;
      else e.setAttribute(k, value);
    }
    if(children && children.length) children.forEach((obj) => Element.create(obj, e));

    if(parent && parent.appendChild) parent.appendChild(e);
    return e;
  }

  static walkUp(elem, pred = (e) => true) {
    if(typeof elem == 'string') elem = Element.find(elem);
    let depth = 0;
    if(typeof pred == 'number') {
      let n = pred;
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

  static *skip(elem, fn = (e, next) => next(e.parentElement)) {
    elem = typeof elem == 'string' ? Element.find(elem) : elem;
    //let [iter,push] = new iterator();
    let emit = (n) => (elem = n);

    while(elem) {
      yield elem;
      fn(elem, emit);
    }
  }

  static walk(elem, fn, accu = {}) {
    if(typeof elem == 'string') elem = Element.find(elem);
    const root = elem;
    //const rootPath = Element.xpath(elem);
    let depth = 0;
    while(elem) {
      accu = fn(this.wrap(elem), accu, root, depth);
      if(elem.firstElementChild) depth++;
      elem =
        elem.firstElementChild ||
        elem.nextElementSibling ||
        (function () {
          do {
            if(!(elem = elem.parentElement)) break;
            depth--;
          } while(depth > 0 && !elem.nextElementSibling);
          return elem && elem != root ? elem.nextElementSibling : null;
        })();
    }
    return accu;
  }

  static *iterator(elem, predicate = (e, d, r) => true, getProp) {
    if(getProp == 'node') getProp = (obj, prop) => obj[prop.replace(/Element$/, 'Node').replace(/Element/, '')];

    if(!getProp) getProp = (obj, prop) => obj[prop];
    if(typeof elem == 'string') elem = Element.find(elem);
    const root = elem;
    let depth = 0;
    while(elem) {
      if(predicate(elem, depth, root)) yield this.wrap(elem);
      if(getProp(elem, 'firstElementChild')) depth++;
      elem =
        getProp(elem, 'firstElementChild') ||
        getProp(elem, 'nextElementSibling') ||
        (function () {
          do {
            if(!(elem = getProp(elem, 'parentElement'))) break;
            depth--;
          } while(depth > 0 && !getProp(elem, 'nextElementSibling'));
          return elem && elem != root ? getProp(elem, 'nextElementSibling') : null;
        })();
    }
  }

  static *childIterator(elem) {
    if(elem.firstElementChild) {
      for(let c = elem.firstElementChild; c; c = c.nextElementSibling) yield c;
    } else {
      let children = [...elem.children];
      for(let i = 0; i < children.length; i++) yield children[i];
    }
  }

  static toObject(elem, opts = {}) {
    const { no_children = false, predicate } = opts;
    if(typeof elem == 'string') elem = Element.find(elem);
    let l = [];
    if(!no_children) {
      l = [...this.childIterator(elem)];
      if(predicate) l = l.filter(predicate);
      l = l.reduce((l, c) => (Util.isObject(c) && 'tagName' in c ? l.push(Element.toObject(c, elem, opts)) : (c.textContent + '').trim() != '' ? l.push(c.textContent) : undefined, l), l);
    }

    let attributes = (opts ? opts.namespaceURI : document.body.namespaceURI) != elem.namespaceURI ? { ns: elem.namespaceURI } : {};
    let a = 'length' in elem.attributes ? Element.attr(elem) : elem.attributes;
    for(let key in a) attributes[key] = '' + a[key];
    return {
      tagName: /[a-z]/.test(elem.tagName) ? elem.tagName : elem.tagName.toLowerCase(),
      ...attributes,
      ...(l.length > 0 ? { children: l } : {})
    };
  }

  static toCommand(elem, opts = {}) {
    let { parent = '', varName, recursive = true, cmd = 'Element.create', quote = "'" } = opts;
    let o = Element.toObject(elem, { children: false });
    let s = '';
    let { tagName, ns, children, ...attributes } = o;
    let v = '';
    s = Object.keys(ns ? { ns, ...attributes } : attributes)
      .map((k) => `${k}:${quote}${attributes[k]}${quote}`)
      .join(', ');
    s = `${cmd}('${tagName}', {${s}}`;
    let c = elem.children;
    if(c.length >= 1) s = `${s}, [\n  ${c.map((e) => Element.toCommand(e, opts).replace(/\n/g, '\n  ')).join(',\n  ')}\n]`;
    s += parent ? ', ' + parent : '';
    if(elem.firstElementChild && varName) {
      v = parent ? String.fromCharCode(parent.charCodeAt(0) + 1) : varName;
      s = `${v} = ${s}`;
    }
    return s.replace(new RegExp(';*$', 'g'), '');
  }

  static find(arg, parent, globalObj = Util.getGlobalObject()) {
    if(typeof parent == 'string') parent = Element.find(parent);
    if(!parent && globalObj.document)
      parent =
        globalObj.document ||
        Util.tryCatch(() => document,
          (d) => d
        );

    if(typeof arg != 'string') throw new Error(arg + '');

    if(arg.startsWith('/')) arg = arg.substring(1).replace(/\//g, ' > ');

    return parent.querySelector(arg);
  }

  static findAll(arg, parent) {
    parent = typeof parent == 'string' ? Element.find(parent) : parent;
    return [...(parent && parent.querySelectorAll ? parent.querySelectorAll(arg) : document.querySelectorAll(arg))];
  }

  /**
   * Sets or gets attributes
   *
   * @param      {<type>}  element       The element
   * @param      {<type>}  [attrs=null]  The attributes
   * @return     {<type>}  { description_of_the_return_value }
   */
  static attr(e, attrs_or_name) {
    const elem = typeof e === 'string' ? Element.find(e) : e;
    //console.log('Element.attr', { elem, attrs_or_name });
    if(!Util.isArray(attrs_or_name) && typeof attrs_or_name === 'object' && elem) {
      for(let key in attrs_or_name) {
        const name = Util.decamelize(key, '-');
        const value = attrs_or_name[key];
        /*        console.log('attr(', elem, ', ', { name, key, value, }, ')')
         */ if(key.startsWith('on') && !/svg/.test(elem.namespaceURI)) elem[key] = value;
        else if(elem.setAttribute) elem.setAttribute(name, value);
        else elem[key] = value;
      }
      return elem;
    }
    if(typeof attrs_or_name === 'function') {
      attrs_or_name(elem.attributes, elem);
      return elem;
    } else if(typeof attrs_or_name === 'string') {
      attrs_or_name = [attrs_or_name];
    } else if(Util.isObject(elem) && 'getAttributeNames' in elem) {
      attrs_or_name = elem.getAttributeNames();
    } else {
      attrs_or_name = [];
      if(Util.isObject(elem) && Util.isArray(elem.attributes)) for(let i = 0; i < elem.attributes.length; i++) attrs_or_name.push(elem.attributes[i].name);
    }
    let ret = attrs_or_name.reduce((acc, name) => {
      const key = /*Util.camelize*/ name;
      const value = elem && elem.getAttribute ? elem.getAttribute(name) : elem[key];
      acc[key] = /^-?[0-9]*\.[0-9]\+$/.test(value) ? parseFloat(value) : value;
      return acc;
    }, {});
    if(typeof arguments[1] == 'string') return ret[attrs_or_name[0]];
    return ret;
  }

  static getRect(elem) {
    let e = elem;
    while(e) {
      if(e.style) {
        if(e.style.position == '') e.style.position = 'relative';
        if(e.style.left == '') e.style.left = '0px';
        if(e.style.top == '') e.style.top = '0px';
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
    let { round = true, relative_to = null, relative = false, scroll_offset = true } = options;
    const e = typeof element === 'string' ? Element.find(element) : element;
    if(!e || !e.getBoundingClientRect) {
      return null; //new Rect(0, 0, 0, 0);
    }
    const bb = e.getBoundingClientRect();

    let r = TRBL.toRect(bb);
    if(relative) relative_to = e.parentElement;

    if(relative_to && relative_to !== null /*&& Element.isElement(relative_to)*/) {
      const off = Element.rect(relative_to);
      r.x -= off.x;
      r.y -= off.y;
    }

    //console.log("Element.rect(", r, ")");

    if(options.border === false) {
      const border = Element.border(e);
      Rect.inset(r, border);

      //console.log("Element.rect(", r, ") // with border = ", border);
    } else if(options.margin) {
      const margin = Element.margin(e);
      Rect.outset(r, margin);

      //console.log("Element.rect(", r, ") // with border = ", border);
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
    let { anchor, unit = 'px', scale } = opts;
    const e = typeof element === 'string' ? Element.find(element) : element;
    //console.log("Element.setRect(", element, ",", rect, ", ", anchor, ") ");
    if(typeof anchor == 'string') {
      e.style.position = anchor;
      anchor = 0;
    }
    if(scale) Rect.scale(rect, scale, scale);

    anchor = anchor || Anchor.LEFT | Anchor.TOP;
    const position = element.style && element.style.position;

    /*|| rect.position || "relative"*/
    const pelement = position == 'fixed' ? e.documentElement || document.body : e.parentNode;
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
      default: css.left = Math.round(trbl.left /* - ptrbl.left*/) + unit;
        remove = 'right';
        break;
      case Anchor.RIGHT:
        css.right = Math.round(trbl.right - ptrbl.right) + unit;
        remove = 'left';
        break;
    }
    switch (Anchor.vertical(anchor)) {
      case Anchor.TOP:
      default: css.top = Math.round(trbl.top /* - ptrbl.top*/) + unit;
        remove = 'bottom';
        break;
      case Anchor.BOTTOM:
        css.bottom = Math.round(trbl.bottom - ptrbl.bottom) + unit;
        remove = 'top';
        break;
    }
    if(e.style) {
      if(e.style.removeProperty) e.style.removeProperty(remove);
      else e.style[remove] = undefined;
    }
    //css.position = position;
    css.width = Math.round(rect.width) + (unit || unit);
    css.height = Math.round(rect.height) + (unit || unit);
    //console.log("Element.setRect ", css);
    Element.setCSS(e, css);
    //Object.assign(e.style, css);
    //Element.setCSS(e, css);
    return e;
  }

  static position(element, edges = ['left', 'top']) {
    console.log('Element.position ', { element, edges });
    const rect = Element.rect(element);
    if(rect) {
      //if(typeof element == 'string') element = Element.find(element);
      const trbl = rect.toTRBL();
      const [x, y] = edges.map((e) => (e == 'right' ? window.innerWidth - trbl[e] : e == 'bottom' ? window.innerHeight - trbl[e] : trbl[e]));
      return new Point({ x, y });
    }
  }

  static move(element, point, pos, edges = ['left', 'top']) {
    let [e, ...rest] = [...arguments];
    let { x = Element.position(element, edges).x, y = Element.position(element, edges).y } = new Point(rest);
    let to = { x, y };
    let position = rest.shift() || Element.getCSS(element, 'position') || 'relative';
    let off;
    //console.log('Element.move ', { element, to, position });
    const getValue = (prop) => {
      const property = Element.getCSS(element, prop);
      if(property === undefined) return undefined;
      const matches = /([-0-9.]+)(.*)/.exec(property) || [];
      //console.log({ match, value, unit });
      return parseFloat(matches[1]);
    };

    const current = new Point({
      x: getValue(edges[0]) || 0,
      y: getValue(edges[1]) || 0
    });
    off = new Point(Element.position(element, edges));
    //off = Point.diff(off, current);
    Point.add(current, Point.diff(to, off));

    /*
    if(position == 'relative') {
      to.x -= off.x;
      to.y -= off.y;
    }*/
    let css = Point.toCSS(current, 1, edges);
    console.log('Element.move: ', { position, to, css, off, current, edges });
    //console.log('move newpos: ', Point.toCSS(pt));
    Element.setCSS(element, { ...css, position });
    return element;
  }

  static moveRelative(element, to, edges = ['left', 'top']) {
    let e = typeof element == 'string' ? Element.find(element) : element;
    let origin = to ? new Point(to) : Element.position(e, edges);
    const f = [edges[0] == 'left' ? 1 : -1, edges[1] == 'top' ? 1 : -1];

    console.log('moveRelative', { e, to, edges, f, origin });

    function move(x, y) {
      let pos = new Point(origin.x + x * f[0], origin.y + y * f[1]);
      move.last = pos;
      let css = pos.toCSS(1, edges);
      //      console.log('move', { pos, css });
      return Element.setCSS(e, css);
      return Element.move(e, pos, 'absolute', edges);
    }

    move.origin = origin;
    move.cancel = () => move(0, 0);
    move.jump = () => Element.moveRelative(e, to, edges);

    return move;
  }

  static resize(element, ...dimensions) {
    let e = typeof element == 'string' ? Element.find(element) : element;
    let size = new Size(...dimensions);
    const css = Size.toCSS(size);
    //console.log("Element.resize: ", { e, size, css });
    Element.setCSS(e, css);
    return e;
  }

  static resizeRelative(element, to, f = 1) {
    let e = typeof element == 'string' ? Element.find(element) : element;
    let origin = new Size(to || Element.rect(e));
    console.log('resizeRelative', { e, to, origin, f });
    function resize(width, height, rel = true) {
      let size = new Size(width, height);
      if(rel) size = origin.sum(size.prod(f));
      let css = size.toCSS(1, ['px', 'px']);
      resize.css = css;
      console.log('resizeRelative', { size, css });
      resize.last = size;

      return Element.setCSS(e, css);
    }
    resize.origin = origin;
    resize.cancel = () => resize(0, 0);
    resize.jump = () => Element.resizeRelative(e, to);
    return resize;
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
    if(typeof element == 'string') element = Element.find(element);
    let p = { x: 0, y: 0 };
    do {
      p.y += element.offsetTop || 0;
      p.x += element.offsetLeft || 0;
    } while((element = element.offsetParent) && element != relative_to);
    return p;
  }

  static getTRBL(element, prefix = '') {
    if(typeof element == 'string') element = Element.find(element);

    const names = ['Top', 'Right', 'Bottom', 'Left'].map((pos) => prefix + (prefix == '' ? pos.toLowerCase() : pos + (prefix == 'border' ? 'Width' : '')));
    const getCSS = prefix == '' ? () => ({}) : Util.memoize(() => Element.getCSS(element));

    let entries = names.map((prop) => [Util.decamelize(prop).split('-'), element.style.getPropertyValue(prop) || getCSS()[prop]]);
    //console.log('getTRBL', { names, entries });
    entries = entries.map(([prop, value]) => [prop[1] || prop[0], typeof value == 'string' ? +value.replace(/px$/, '') : value]);

    return /*new TRBL*/ Object.fromEntries(entries);
  }

  static setTRBL(element, trbl, prefix = 'margin') {
    const attrs = ['Top', 'Right', 'Bottom', 'Left'].reduce((acc, pos) => {
      const name = prefix + (prefix == '' ? pos.toLowerCase() : pos);
      return { ...acc, [name]: trbl[pos.toLowerCase()] };
    }, {});
    //console.log('Element.setTRBL ', attrs);
    return Element.setCSS(element, attrs);
  }

  static setCSS(element, prop, value) {
    if(typeof element == 'string') element = Element.find(element);
    if(!isElement(element)) return false;
    if(typeof prop == 'string' && typeof value == 'string') prop = { [prop]: value };

    //console.log("Element.setCSS ", { element, prop });

    for(let key in prop) {
      let value = prop[key];
      const propName = Util.decamelize(key);
      if(typeof value == 'function') {
        if('subscribe' in value) {
          value.subscribe = (newval) => element.style.setProperty(propName, newval);
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
    element = typeof element == 'string' ? Element.find(element) : element;

    const w = window !== undefined ? window : global.window;
    const d = document !== undefined ? document : global.document;
    // console.log('Element.getCSS ', { element,property });

    let parent = Util.isObject(element) ? element.parentElement || element.parentNode : null;

    let estyle = Util.tryPredicate(() => (Util.isObject(w) && w.getComputedStyle ? w.getComputedStyle(element) : d.getComputedStyle(element)), null)();
    let pstyle = Util.tryPredicate(() => (parent && parent.tagName ? (/*Util.toHash*/ w && w.getComputedStyle ? w.getComputedStyle(parent) : d.getComputedStyle(parent)) : {}), null)();

    if(!estyle || !pstyle) return null;
    //let styles = [estyle,pstyle].map(s => Object.fromEntries([...Node.map(s)].slice(0,20)));

    let style = Util.tryPredicate(() => Util.removeEqual(estyle, pstyle), null)();

    if(!style) return null;
    let keys = Object.keys(style).filter((k) => !/^__/.test(k));
    //console.log("style: ", style);
    //console.log("Element.getCSS ", style);

    let ret = {};
    if(receiver == null) {
      receiver = (result) => {
        if(typeof result == 'object') {
          try {
            Object.defineProperty(result, 'cssText', {
              get() {
                return Object.entries(this)
                  .map(([k, v]) => `${Util.decamelize(k, '-')}: ${v};\n`)
                  .join('');
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
        typeof property === 'string'
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
        if(val && val.length > 0 && val != 'none') ret[key] = val;
      }
    }
    return receiver(ret);
  }

  static xpath(elt, relative_to = null) {
    let path = '';
    for(let e of this.skip(elt, (e, next) => next(e.parentElement !== relative_to && e.parentElement))) path = '/' + Element.unique(e) + path;

    //console.log('relative_to: ', relative_to);
    /*    for(; elt && elt.nodeType == 1; elt = elt.parentNode) {
      const xname = Element.unique(elt);
      path = xname + path;
      if(elt == relative_to) {
        break;
      }
      path = '/' + path;
    }*/
    return path;
  }

  static selector(elt, opts = {}) {
    const { relative_to = null, use_id = false } = opts;
    let sel = '';
    for(; elt && elt.nodeType == 1; elt = elt.parentNode) {
      if(sel != '') sel = ' > ' + sel;
      let xname = Element.unique(elt, { idx: false, use_id });
      if(use_id === false) xname = xname.replace(/#.*/g, '');
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
    let str = '';
    function dumpElem(child, accu, root, depth) {
      const rect = Rect.round(Element.rect(child, elem));
      accu += '  '.repeat((depth > 0 ? depth : 0) + 1) + ' ' + Element.xpath(child, child);
      [...child.attributes].forEach((attr) => (accu += ' ' + attr.name + "='" + attr.value + "'"));
      if(Rect.area(rect) > 0) accu += ' ' + Rect.toString(rect);
      ['margin', 'border', 'padding'].forEach((name) => {
        let trbl = Element.getTRBL(elem, 'margin');
        if(!trbl.null()) accu += ' ' + name + ': ' + trbl + '';
      });
      return accu;
    }
    str = dumpElem(elem, '');
    str = Element.walk(elem.firstElementChild,
      (e, a, r, d) => {
        if(e && e.attributes) return dumpElem(e, a + '\n', r, d);
        return null;
      },
      str
    );
    return str;
  }

  static skipper(fn, pred = (a, b) => a.tagName == b.tagName) {
    return function (elem) {
      let next = fn(elem);
      for(; next; next = fn(next)) if(pred(elem, next)) return next;
      return null;
    };
  }

  static prevSibling(sib) {
    return sib.previousElementSibling;
  }
  static nextSibling(sib) {
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
    if(elem.id && elem.id.length) name += '#' + elem.id;
    else if(elem.class && elem.class.length) name += '.' + elem.class;
    return name;
  }

  static unique(elem, opts = {}) {
    const { idx = false, use_id = true } = opts;
    let name = elem.tagName.toLowerCase();
    if(use_id && elem.id && elem.id.length) return name + '#' + elem.id;
    const classNames = [...elem.classList]; //String(elem.className).split(new RegExp("/[ \t]/"));
    for(let i = 0; i < classNames.length; i++) {
      let res = document.getElementsByClassName(classNames[i]);
      if(res && res.length === 1) return name + '.' + classNames[i];
    }
    if(idx) {
      if(elem.nextElementSibling || elem.previousElementSibling) {
        return name + '[' + Element.idx(elem) + ']';
      }
    }
    return name;
  }

  static factory(delegate = {}, parent = null) {
    let root = parent;
    if(root === null) {
      if(typeof delegate.append_to !== 'function') {
        root = delegate;
        delegate = {};
      } else {
        root = 'body';
      }
    }
    const { append_to, create, setattr, setcss } = delegate;
    if(typeof root === 'string') root = Element.find(root);
    if(!delegate.root) delegate.root = root;
    if(!delegate.append_to) {
      delegate.append_to = function (elem, parent) {
        if(!parent) parent = root;
        if(parent) parent.appendChild(elem);
        if(!this.root) this.root = elem;
      };
    }
    if(!delegate.create) delegate.create = (tag) => document.createElement(tag);
    if(!delegate.setattr) {
      delegate.setattr = (elem, attr, value) => {
        //console.log('setattr ', { attr, value });
        elem.setAttribute(attr, value);
      };
    }

    if(!delegate.setcss) delegate.setcss = (elem, css) => Object.assign(elem.style, css); //Element.setCSS(elem, css);

    delegate.bound_factory = (tag, attr = {}, parent = null) => {
      if(typeof tag == 'object') {
        const { tagName, ...a } = tag;
        attr = a;
        tag = tagName;
      }
      const { style, children, className, innerHTML, ...props } = attr;
      let elem = delegate.create(tag);
      if(style) delegate.setcss(elem, style);
      if(children && children.length) {
        for(let i = 0; i < children.length; i++) {
          if(typeof children[i] === 'string') {
            elem.innerHTML += children[i];
          } else {
            const { tagName, parent, ...childProps } = children[i];
            delegate.bound_factory(tagName, childProps, elem);
          }
        }
      }
      if(innerHTML) elem.innerHTML += innerHTML;
      if(className && elem) {
        if(elem.classList) elem.classList.add(className);
        else if(elem.attributes.class) elem.attributes.class.value += ' ' + className;
      }
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
    const e = typeof element === 'string' ? Element.find(element) : element;
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
    if(isElement(x)) return Element.isat.apply(Element, arguments);
    let args = [...arguments];
    const p = Point(args);
    const w = global.window;
    const d = w.document;
    const s = o.all
      ? (e) => {
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
  static transition(element, css, time, easing = 'linear', callback = null) {
    let args = [...arguments];
    const e = typeof element === 'string' ? Element.find(args.shift()) : args.shift();
    let a = [];
    const t = typeof time == 'number' ? `${time}ms` : time;
    let ctx = { e, t, from: {}, to: {}, css };
    args.shift();
    args.shift();

    easing = typeof args[0] == 'function' ? 'linear' : args.shift();
    callback = args.shift();

    for(let prop in css) {
      const name = Util.decamelize(prop);
      a.push(`${name} ${t} ${easing}`);
      ctx.from[prop] = e.style.getProperty ? e.style.getProperty(name) : e.style[prop];
      ctx.to[name] = css[prop];
    }
    const tlist = a.join(', ');

    //console.log("Element.transition", { ctx, tlist });

    let cancel;
    let ret = new Promise((resolve, reject) => {
      let trun = function (e) {
        this.event = e;
        //console.log("Element.transitionRun event", this);
        callback(this);
      };
      let tend = function (e) {
        this.event = e;
        //console.log("Element.transitionEnd event", this);
        this.e.removeEventListener('transitionend', this);
        this.e.style.setProperty('transition', '');
        delete this.cancel;
        resolve(this);
      };

      e.addEventListener('transitionend', (ctx.cancel = tend).bind(ctx));

      if(typeof callback == 'function') e.addEventListener('transitionrun', (ctx.run = trun).bind(ctx));

      cancel = () => ctx.cancel();

      if(e.style && e.style.setProperty) e.style.setProperty('transition', tlist);
      else e.style.transition = tlist;

      Object.assign(e.style, css);
    });
    ret.cancel = cancel;
    return ret;
  }

  static toString(e, opts = {}) {
    const { indent = '  ', newline = '', depth = 0 } = opts;

    let o = e.__proto__ === Object.prototype ? e : Element.toObject(e);
    const { tagName, ns, children = [], ...a } = o;
    let i = newline != '' ? indent.repeat(depth) : '';
    let s = i + `<${tagName}`;
    s += Object.entries(a)
      .map(([name, value]) => ` ${name}="${value}"`)
      .join('');
    s += children.length ? `>` : ` />`;
    if(children.length) s += newline + children.map((e) => Element.toString(e, { ...opts, depth: depth + 1 })).join(newline) + i + `</${tagName}>`;
    s += newline;
    return s;
  }

  static clipboardCopy = (text) =>
    new Promise((resolve, reject) => {
      if(navigator.clipboard) {
        return navigator.clipboard
          .writeText(text)
          .then(() => resolve(true))
          .catch((err) => reject(err !== undefined ? err : new DOMException('The request is not allowed', 'NotAllowedError')));
      }
      let ok = false;
      try {
        const d = document,
          w = window;
        let e = d.createElement('e');
        e.textContent = text;
        e.style.whiteSpace = 'pre';
        d.body.appendChild(e);
        let s = w.getSelection();
        let r = w.d.createRange();
        s.removeAllRanges();
        r.selectNode(e);
        s.addRange(r);
        try {
          ok = w.d.execCommand('copy');
        } catch(err) {
          console.log('error', err);
        }
        s.removeAllRanges();
        w.d.body.removeChild(e);
      } catch(err) {}
      if(ok) resolve(ok);
      else reject(new DOMException('The request is not allowed', 'NotAllowedError'));
    });

  static *children(elem, tfn = (e) => e) {
    if(typeof elem == 'string') elem = Element.find(elem);
    for(let e = elem.firstElementChild; e; e = e.nextElementSibling) yield tfn(e);
  }

  static *recurse(elem, tfn = (e) => e) {
    if(typeof elem == 'string') elem = Element.find(elem);
    let root = elem;
    do {
      elem =
        elem.firstElementChild ||
        elem.nextElementSibling ||
        (function () {
          do {
            if(!(elem = elem.parentElement)) break;
          } while(!elem.nextSibling);
          return elem && elem != root ? elem.nextElementSibling : null;
        })();

      if(elem !== null) yield tfn(elem);
    } while(elem);
  }
}

export function isElement(e) {
  return Util.isObject(e) && e.tagName !== undefined;
}
