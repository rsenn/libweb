import { Element, isElement } from './element.js';
import { Size, isSize } from '../geom/size.js';
import { Point } from '../geom/point.js';
import { Rect } from '../geom/rect.js';
import { Line } from '../geom/line.js';
//import { parseSVG, makeAbsolute } from '../svg/path-parser.js';
import SvgPath from '../svg/path.js';
import Util from '../util.js';
import { RGBA } from '../color/rgba.js';

export class SVG extends Element {
  static create(name, { outerHTML, innerHTML, text, ...attr }, parent) {
    let svg = document.createElementNS(SVG.ns, name);
    let attrfn;

    if(name == 'svg') {
      attr.version = '1.1';
      attr.xmlns = SVG.ns;
      attrfn = (n) => n;
    } else {
      attrfn = (arg) => arg; //Util.decamelize;
    }
    Util.foreach(attr, (value, name) => svg.setAttribute(attrfn(name, '-'), value));

    if(parent && parent.appendChild) {
      parent.appendChild(svg);
      if(outerHTML) svg.outerHTML = outerHTML;
    }
    /*    if(innerHTML) svg.innerHTML = text;
else */ if(text) svg.innerHTML = innerHTML;
    return svg;
  }

  static factory(...args) {
    let arg = [...arguments];

    let delegate = Util.isObject(args[0]) && ('append_to' in args[0] || 'create' in args[0] || 'setattr' in args[0]) ? args.shift() : {};
    let parent = Util.isObject(args[0]) ? ('tagName' in args[0] || 'appendChild' in args[0] ? args.shift() : null) : null;
    let size = isSize(args[0]) ? args.shift() : null;

    delegate = {
      create: (tag) => document.createElementNS(SVG.ns, tag),
      append_to: (elem, root = parent) => root && root.appendChild(elem),
      setattr: (elem, name, value) => name != 'ns' && elem.setAttributeNS(document.namespaceURI, /*Util.decamelize*/ name, value),
      setcss: (elem, css) => delegate.setattr(elem, 'style', css),
      ...delegate
    };
    //if(size == null) size = new Size(Element.rect(parent));

    const { width, height } = size || {};
    console.log('factory', { delegate, parent, size, arg });
    if(parent && parent.tagName.toLowerCase() == 'svg') delegate.root = parent;
    else if(this !== SVG && this && this.appendChild) delegate.root = this;
    else
      delegate.root = delegate.create('svg', {
        ...size,
        viewBox: `0 0 ${width || 0} ${height || 0}`
      });

    if(delegate.root && parent) delegate.append_to(delegate.root, parent);

    if(delegate.root) delegate.append_to(delegate.create('defs'), delegate.root);

    const { append_to } = delegate;

    delegate.append_to = function(elem, p) {
      let root = p || this.root;

      if(elem.tagName.indexOf('Gradient') != -1) root = root.querySelector('defs');

      append_to(elem, root);

      /*if(typeof root.append == "function") root.append(elem);
      else root.appendChild(elem);*/
      //console.log('append_to ', elem, ', root=', root);
    };
    let factory = function(tag, attr, children) {
      const create = (tag, attr, parent) => {
        let e = this.create(tag);
        for(let a in attr) this.setattr(e, a, attr[a]);

        if(parent) this.append_to(e, parent);
        return e;
      };

      let elem = create(tag, attr, this.root);

      children = children ? children : [];

      for(let child of children) {
        factory.apply({ ...delegate, root: elem }, child);
      }
      return elem;
    };
    return (...args) => factory.apply(delegate, args);
  }

  static matrix(element, screen = false) {
    let e = typeof element === 'string' ? Element.find(element) : element;
    let fn = screen ? 'getScreenCTM' : 'getCTM';
    let ctm = e[fn]();
    console.log('ctm:', ctm);
    if(e && e[fn]) return new Matrix(ctm);
    return null;
  }

  static bbox(element, options = { parent: null, absolute: false, client: false, screen: false }) {
    let e = typeof element === 'string' ? Element.find(element, options.parent) : element;
    let bb;
    if(Util.isObject(e)) {
      if(options.client && e.getBoundingClientRect) {
        bb = new Rect(e.getBoundingClientRect());
      } else if(e.getBBox) {
        bb = new Rect(e.getBBox());
        if(options.absolute) {
          let r = SVG.bbox(e.ownerSVGElement ? e.ownerSVGElement : e);
          bb.x -= r.x;
          bb.y -= r.y;
        }
      }

      if(options.screen && typeof e.getScreenCTM == 'function') {
        let m = new Matrix(e.getScreenCTM());
        bb.transform(m);
      }
      if(!bb) bb = Element.rect(e);
    }

    return bb;
  }

  static gradient(type, { stops, factory = SVG.create, parent = null, line = false, ...props }) {
    let defs = factory('defs', {}, parent);
    const map = new Map(stops instanceof Array ? stops : Object.entries(stops));

    let rect = {};

    if(line) {
      rect = new Rect(line);
      rect = { x1: rect.x, y1: rect.y, x2: rect.x2, y2: rect.y2 };
    }
    //const { x1, y1, x2, y2 } = line;

    let grad = factory(type + '-gradient', { ...props, ...rect }, defs);

    map.forEach((color, o) => {
      //console.log('color:' + color + ' o:' + o);
      factory('stop', { offset: Math.round(o * 100) + '%', stopColor: color }, grad);
    });

    return grad;
  }

  static owner(elem) {
    let ret = function(tag, props, parent) {
      if(tag === undefined) return this.element;
      return SVG.create.call(SVG, tag, props, parent || this.element);
    };
    ret.element = elem.ownerSVGElement;
    Util.defineGetterSetter(ret, 'rect', function() {
      return Element.rect(this.element);
    });
    return ret;
  }

  static path() {
    return new SvgPath();
  }

  static getProperty(elem, name) {
    if(!elem.style[name] && elem.hasAttribute(name)) return elem.getAttribute(name);
    let props = window.getComputedStyle(elem);
    return props[name];
  }

  static getProperties(elem, properties) {
    let ret = {};
    for(let name of properties) {
      ret[name] = this.getProperty(elem, name);
    }
    return ret;
  }

  static *coloredElements(elem) {
    for(let item of Element.iterator(elem, (e, d) => ['fill', 'stroke'].some((a) => e.hasAttribute(a)))) {
      const { fill, stroke } = this.getProperties(item, ['fill', 'stroke']);
      const a = Object.entries({ fill, stroke }).filter(([k, v]) => v !== undefined && v !== 'none');
      if(a.length == 0) continue;

      const value = {
        item,
        props: a.reduce((acc, [name, value]) => (/#/.test(value) ? acc : { ...acc, [name]: value }), {})
      };
      yield value;
      //console.log(value);
    }
  }
  static allColors(elem) {
    let map = new Map();
    const addColor = (c, item, prop) => {
      if(!map.has(c)) map.set(c, []);
      map.get(c).push([item, prop]);
    };
    for(let { item, props } of this.coloredElements(elem)) {
      for(let prop in props) addColor(props[prop], item, prop);
    }

    let list = [...map.keys()].map((color) => ({ color, elements: map.get(color) }));
    return {
      list,
      get colors() {
        return this.list.map((item) => item.color);
      },
      index(name) {
        return typeof name == 'number' && this.list[name] ? name : this.list.findIndex((item) => item.color === name);
      },
      name(i) {
        return typeof i == 'number' ? this.list[i].name : typeof i == 'string' ? i : null;
      },
      get(arg) {
        return this.list[arg] || this.list.find((item) => item.color == arg);
      },
      set(index, color, elements) {
        this.list[index] = color ? { color, elements } : color;
        return this;
      },
      dump() {
        for(let i = 0; i < this.list.length; i++) {
          const { color, elements } = this.list[i];
          console.log(`${i}: %c    %c ${color}`, `background: ${color};`, `background: none`);
        }
        return this;
      },
      adjacencyMatrix() {
        let ret = [];
        for(let i = 0; i < this.list.length; i++) {
          ret.push([]);
          ret[i].fill(null, 0, this.list.length);
        }

        for(let i = 0; i < this.list.length; i++) {
          for(let j = 0; j < this.list.length; j++) {
            const dist = RGBA.fromString(this.list[i].color).contrast(RGBA.fromString(this.list[j].color));

            if(/*ret[i][j] == null &&*/ j != i) ret[j][i] = +dist.toFixed(3);
            else ret[j][i] = Number.POSITIVE_INFINITY;
          }
        }
        return ret;
      },
      replace(color, newColor) {
        let name = this.name(color);
        let index = this.index(color);
        let a = this.get(color);

        this.set(index, null);

        if(typeof newColor != 'function') {
          let newC = newColor;
          newColor = () => newC;
        }
        let c = newColor(RGBA.fromString(a.color), index, a.color);
        if(typeof c != 'string') c = c.toString();
        //console.log('new color:', c);

        for(let [elem, prop] of a.elements) elem.setAttribute(prop, c);

        return this.set(index, c, a.elements);
      },
      replaceAll(fn) {
        const colors = this.list.map((item) => item.color);
        if(!fn) fn = Util.shuffle(colors);

        if(fn instanceof Array) {
          let a = fn.concat(colors.slice(fn.length, colors.length));
          fn = (rgba, index, color) => a[index];
        }
        for(let i = 0; i < colors.length; i++) this.replace(i, fn);
        return this;
      }
    };
  }

  /*

    paths = dom.Element.findAll("path", await img("action-save-new.svg"));
    lines = [...dom.SVG.lineIterator(paths[1])];
    pl = new dom.Polyline(lines);


*/
  static *lineIterator(e) {
    let pathStr;
    if(typeof e == 'string') pathStr = e;
    else pathStr = e.getAttribute('d');
    let path = makeAbsolute(parseSVG(pathStr));
    let prev;
    for(let i = 0; i < path.length; i++) {
      let cmd = path[i];
      let { code, x, y, x0, y0 } = cmd;
      if(x == undefined) x = x0;
      if(y == undefined) y = y0;
      const move = cmd.code.toLowerCase() == 'm';
      if(prev && !move) {
        //const swap = !Point.equals(prev, { x: x0, y: y0 });

        let line = new Line({ x: x0, y: y0 }, cmd);
        console.log('lineIterator', { i, code, x, y, x0, y0 }, line.toString());
        yield line;
      }
      prev = cmd;
    }
  }

  static *pathIterator(e, opts, fn = (p) => p) {
    opts = typeof opts == 'number' ? { numPoints: opts } : opts;
    let { numPoints, step } = opts;
    let len = e.getTotalLength();

    let pos = (i) => (i * len) / (numPoints - 1);

    if(step !== undefined) {
      numPoints = Math.floor(len / step);
      //len = numPoints * step;
      pos = (i) => (i == numPoints ? len : i * step);
    } else if(!numPoints) numPoints = Math.ceil(len / 2);

    let p,
      y,
      prev = {};

    let do_point = (point) => {
      const { x, y, slope, next, prev, i, isin } = point;
      let d = (point.distance = slope ? Point.distance(slope) : Number.POSITIVE_INFINITY);
      point.angle = slope ? slope.toAngle(true) : NaN;
      point.move = !(isin.stroke && isin.fill);
      point.ok = !point.move && prev.angle != point.angle;
      const pad = Util.padFn(12, ' ', (str, pad) => `${pad}${str}`);
      if(point.ok) {
        //console.log(`pos: ${pad(i, 3)}, move: ${isin || point.move} point: ${pad(point )}, slope: ${pad(slope && slope.toFixed(3) )}, angle: ${point.angle.toFixed(3)}, d: ${d.toFixed(3)}` );
        let ret;

        try {
          ret = fn(point);
        } catch(err) {}
        return ret;
      }
    };

    for(let i = 0; i < numPoints; i++) {
      const point = e.getPointAtLength(pos(i));
      const next = e.getPointAtLength(pos(i + 1));
      console.log('iterator', point, next);
      const isin = {
        stroke: e.isPointInStroke(point),
        fill: e.isPointInFill(point),
        toString() {
          return `${this.stroke},${this.fill}`;
        }
      };
      p = new Point(point);
      Object.assign(p, { slope: Point.diff(next, point), next, prev, i, isin });
      y = do_point(p);
      if(y) {
        yield y;
      }
      prev = p;
    }
    p = new Point(e.getPointAtLength(len));
    p = Object.assign(p, {
      slope: null,
      next: null,
      prev,
      isin: { stroke: true, fill: true }
    });

    y = do_point(p);
    if(y) yield y;
  }
  static pathCmd = {
    length: { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 },
    segment: /([astvzqmhlc])([^astvzqmhlc]*)/gi
  };

  /**
   * parse an svg path data string. Generates an Array
   * of commands where each command is an Array of the
   * form `[command, arg1, arg2, ...]`
   *
   * @param {String} path
   * @return {Array}
   */

  static parsePath(path) {
    let { length, segment } = this.pathCmd;
    const number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;
    const parseValues = (args) => {
      let numbers = args.match(number);
      return numbers ? numbers.map(Number) : [];
    };
    let data = new SvgPath();

    path.replace(segment, (_, command, args) => {
      let type = command.toLowerCase();
      args = parseValues(args);
      //overloaded moveTo
      if(type == 'm' && args.length > 2) {
        data.cmd(...[command].concat(args.splice(0, 2)));
        type = 'l';
        command = command == 'm' ? 'l' : 'L';
      }
      while(true) {
        if(args.length == length[type]) {
          args.unshift(command);
          data.cmd(...args);
          return;
        }
        if(args.length < length[type]) throw new Error('malformed path data');
        data.cmd(...[command].concat(args.splice(0, length[type])));
      }
    });
    return data;
  }

  static viewbox(element, rect) {
    if(typeof element == 'string') element = Element.find(element);
    if(element.ownerSVGElement) element = element.ownerSVGElement;
    let vbattr;
    if(rect) element.setAttribute('viewBox', 'toString' in rect ? rect.toString() : rect);
    vbattr = Element.attr(element, 'viewBox');
    return new Rect(vbattr.split(/\s+/g).map(parseFloat));
  }

  static splitPath(path, tfn) {
    if(isElement(path) && typeof path.getAttribute == 'function') path = path.getAttribute('d');
    else if(Util.isObject(path) && 'd' in path) path = path.d;
    let ret = [...(path + '').matchAll(/[A-Za-z][^A-Za-z]*/g)].map((command) => [...command][0].trim().split(/[,\s+]/g));
    if(tfn) ret = ret.map(tfn);
    return ret;
  }

  static pathToPoints(path) {
    return SVG.splitPath(path, (cmd) => new Point(...cmd.slice(-2).map((n) => +n)));
  }
}
SVG.ns = 'http://www.w3.org/2000/svg';
