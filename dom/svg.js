import { Element } from "./element.js";
import { Size } from "../geom/size.js";
import { Point } from "../geom/point.js";
import { Rect } from "../geom/rect.js";
import { Line } from "../geom/line.js";
import { parseSVG, makeAbsolute } from "../svg/path-parser.js";
import Util from "../util.js";

export class SVG extends Element {
  static create(name, attr, parent) {
    var svg = document.createElementNS(SVG.ns, name);
    let text, attrfn;
    if(attr.text !== undefined) {
      text = attr.text;
      delete attr.text;
    }
    if(name == "svg") {
      attr.version = "1.1";
      attr.xmlns = SVG.ns;
      attrfn = n => n;
    } else {
      attrfn = arg => arg; //Util.decamelize;
    }
    Util.foreach(attr, (value, name) => svg.setAttribute(attrfn(name, "-"), value));

    if(parent && parent.appendChild) parent.appendChild(svg);
    if(text) svg.innerHTML = text;
    return svg;
  }

  static factory(...args) {
    let delegate = "appendChild" in args[0] ? {} : args.shift();
    let parent = args.shift();
    let size = args.length > 0 ? args.shift() : null;
    delegate = {
      create: tag => document.createElementNS(SVG.ns, tag),
      append_to: elem => parent.appendChild(elem),
      setattr: (elem, name, value) =>
        name != "ns" &&
        elem.setAttributeNS(document.namespaceURI, Util.decamelize(name, "-"), value),
      setcss: (elem, css) => elem.setAttributeNS(null, "style", css),
      ...delegate
    };
    if(size == null) size = Size(Rect.round(Element.rect(parent)));
    const { width, height } = size;

    if(parent && parent.tagName == "svg") delegate.root = parent;
    else if(this !== SVG && this && this.appendChild) delegate.root = this;
    else
      delegate.root = SVG.create(
        "svg",
        { width, height, viewBox: `0 0 ${width} ${height}` },
        parent
      );

    if(!delegate.root.firstElementChild || delegate.root.firstElementChild.tagName != "defs")
      SVG.create("defs", {}, delegate.root);

    const { append_to } = delegate;

    delegate.append_to = function(elem, p) {
      var root = p || this.root;

      if(elem.tagName.indexOf("Gradient") != -1) root = root.querySelector("defs");

      append_to(elem, root);

      /*if(typeof root.append == "function") root.append(elem);
      else root.appendChild(elem);*/
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

  /*
       
    paths = dom.Element.findAll("path", await img("action-save-new.svg"));
    lines = [...dom.SVG.lineIterator(paths[1])];
    pl = new dom.Polyline(lines);


*/
  static *lineIterator(e) {
    let pathStr;
    if(typeof e == "string") pathStr = e;
    else pathStr = e.getAttribute("d");
    let path = makeAbsolute(parseSVG(pathStr));
    let prev;
    for(let i = 0; i < path.length; i++) {
      let cmd = path[i];
      let { code, x, y, x0, y0 } = cmd;
      if(x == undefined) x = x0;
      if(y == undefined) y = y0;
      const move = cmd.code.toLowerCase() == "m";
      if(prev && !move) {
        //              const swap = !Point.equals(prev, { x: x0, y: y0 });

        let line = new Line({ x: x0, y: y0 }, cmd);
        console.log("lineIterator", { i, code, x, y, x0, y0 }, line.toString());
        yield line;
      }
      prev = cmd;
    }
  }

  static *pathIterator(e, numPoints, fn = p => p) {
    const len = e.getTotalLength();

    if(!numPoints) numPoints = Math.ceil(len / 2);

    let p,
      y,
      prev = {};
    const pos = i => (i * len) / numPoints;

    var do_point = point => {
      const { x, y, slope, next, prev, i, isin } = point;
      let d = (point.distance = slope ? Point.distance(slope) : Number.POSITIVE_INFINITY);
      point.angle = slope ? slope.toAngle(true) : NaN;
      point.move = !(isin.stroke && isin.fill);
      point.ok = !point.move && prev.angle != point.angle;
      const pad = Util.padFn(12, " ", (str, pad) => `${pad}${str}`);
      if(point.ok) {
        //console.log(`pos: ${pad(i, 3)}, move: ${isin || point.move} point: ${pad(point )}, slope: ${pad(slope && slope.toFixed(3) )}, angle: ${point.angle.toFixed(3)}, d: ${d.toFixed(3)}` );
        let ret;

        try {
          ret = fn(point);
        } catch(err) {}
        return ret;
      }
    };

    for(let i = 0; i < numPoints - 1; i++) {
      const point = e.getPointAtLength(pos(i));
      const next = e.getPointAtLength(pos(i + 1));
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
    p = new Point(e.getPointAtLength(pos(numPoints - 1)));
    p = Object.assign(p, {
      slope: null,
      next: null,
      prev,
      isin: { stroke: true, fill: true }
    });

    y = do_point(p);
    if(y) yield y;
  }

  static viewbox(element, rect) {
    if(typeof element == "string") element = Element.find(element);
    if(element.ownerSVGElement) element = element.ownerSVGElement;
    let vbattr;
    if(rect) element.setAttribute("viewBox", "toString" in rect ? rect.toString() : rect);
    vbattr = Element.attr(element, "viewBox");
    return new Rect(vbattr.split(/\s+/g).map(parseFloat));
  }
}
SVG.ns = "http://www.w3.org/2000/svg";
