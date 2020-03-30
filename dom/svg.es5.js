"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SVG = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("core-js/modules/es6.regexp.to-string");

require("regenerator-runtime/runtime");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es7.object.entries");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.map");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _element = require("./element.es5.js");

var _size2 = require("./size.es5.js");

var _point = require("./point.es5.js");

var _rect = require("./rect.es5.js");

var _line = require("./line.es5.js");

var _pathParser = require("../svg/path-parser.es5.js");

var _util = _interopRequireDefault(require("../util.es5.js"));

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if(Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if(enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for(var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if(i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        (0, _defineProperty2.default)(target, key, source[key]);
      });
    } else if(Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}

class SVG extends _element.Element {
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
      attrfn = _util.default.decamelize;
    }

    _util.default.foreach(attr, (value, name) => svg.setAttribute(attrfn(name, "-"), value));

    if(parent && parent.appendChild) parent.appendChild(svg);
    if(text) svg.innerHTML = text;
    return svg;
  }

  static factory(parent, size = null) {
    let delegate = {
      create: tag => document.createElementNS(SVG.ns, tag),
      append_to: elem => parent.appendChild(elem),
      setattr: (elem, name, value) => name != "ns" && elem.setAttributeNS(document.namespaceURI, _util.default.decamelize(name, "-"), value),
      setcss: (elem, css) => elem.setAttributeNS(null, "style", css)
    };
    if(size == null) size = (0, _size2.Size)(_rect.Rect.round(_element.Element.rect(parent)));
    const _size = size,
      width = _size.width,
      height = _size.height;
    if(parent && parent.tagName == "svg") delegate.root = parent;
    else if(this !== SVG && this && this.appendChild) delegate.root = this;
    else {
      delegate.root = SVG.create(
        "svg",
        {
          width,
          height,
          viewBox: "0 0 " + width + " " + height + ""
        },
        parent
      );
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
    };

    return _element.Element.factory(delegate);
  }

  static matrix(element, screen = false) {
    let e = typeof element === "string" ? _element.Element.find(element) : element;
    let fn = screen ? "getScreenCTM" : "getCTM";
    if(e && e[fn]) return Matrix.fromDOMMatrix(e[fn]());
    return null;
  }

  static bbox(
    element,
    options = {
      parent: null,
      absolute: false
    }
  ) {
    let e = typeof element === "string" ? _element.Element.find(element, options.parent) : element;
    let bb;

    if(e && e.getBBox) {
      bb = new _rect.Rect(e.getBBox());

      if(options.absolute) {
        let r = _element.Element.rect(element.ownerSVGElement);

        bb.x += r.x;
        bb.y += r.y;
      }

      return bb;
    }

    return _element.Element.rect(e);
  }

  static gradient(type, _ref) {
    let stops = _ref.stops,
      _ref$factory = _ref.factory,
      factory = _ref$factory === void 0 ? SVG.create : _ref$factory,
      _ref$parent = _ref.parent,
      parent = _ref$parent === void 0 ? null : _ref$parent,
      _ref$line = _ref.line,
      line = _ref$line === void 0 ? false : _ref$line,
      props = (0, _objectWithoutProperties2.default)(_ref, ["stops", "factory", "parent", "line"]);
    var defs = factory("defs", {}, parent);
    const map = new Map(stops instanceof Array ? stops : Object.entries(stops));
    let rect = {};

    if(line) {
      rect = new _rect.Rect(line);
      rect = {
        x1: rect.x,
        y1: rect.y,
        x2: rect.x2,
        y2: rect.y2
      };
    }

    let grad = factory(type + "-gradient", _objectSpread({}, props, {}, rect), defs);
    map.forEach((color, o) => {
      factory(
        "stop",
        {
          offset: Math.round(o * 100) + "%",
          stopColor: color
        },
        grad
      );
    });
    return grad;
  }

  static owner(elem) {
    var ret = function ret(tag, props, parent) {
      if(tag === undefined) return this.element;
      return SVG.create.call(SVG, tag, props, parent || this.element);
    };

    ret.element = elem.ownerSVGElement;

    _util.default.defineGetterSetter(ret, "rect", function() {
      return _element.Element.rect(this.element);
    });

    return ret;
  }

  static path() {
    return new SvgPath();
  }

  static line_iterator(e) {
    return _regenerator.default.mark(function _callee() {
      var pathStr, path, prev, i, cmd, code, x, y, x0, y0, move, line;
      return _regenerator.default.wrap(function _callee$(_context) {
        while(1)
          switch ((_context.prev = _context.next)) {
            case 0:
              if(typeof e == "string") pathStr = e;
              else pathStr = e.getAttribute("d");
              path = (0, _pathParser.makeAbsolute)((0, _pathParser.parseSVG)(pathStr));
              i = 0;

            case 3:
              if(!(i < path.length)) {
                _context.next = 18;
                break;
              }

              cmd = path[i];
              (code = cmd.code), (x = cmd.x), (y = cmd.y), (x0 = cmd.x0), (y0 = cmd.y0);
              if(x == undefined) x = x0;
              if(y == undefined) y = y0;
              move = cmd.code.toLowerCase() == "m";

              if(!(prev && !move)) {
                _context.next = 14;
                break;
              }

              line = new _line.Line(
                {
                  x: x0,
                  y: y0
                },
                cmd
              );
              console.log(
                "line_iterator",
                {
                  i,
                  code,
                  x,
                  y,
                  x0,
                  y0
                },
                line.toString()
              );
              _context.next = 14;
              return line;

            case 14:
              prev = cmd;

            case 15:
              i++;
              _context.next = 3;
              break;

            case 18:
            case "end":
              return _context.stop();
          }
      }, _callee);
    })();
  }

  static path_iterator(e, numPoints, fn = p => p) {
    return _regenerator.default.mark(function _callee2() {
      var len, p, y, prev, pos, do_point, i, point, next, isin;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while(1)
          switch ((_context2.prev = _context2.next)) {
            case 0:
              len = e.getTotalLength();
              if(!numPoints) numPoints = Math.ceil(len / 2);
              prev = {};

              pos = i => (i * len) / numPoints;

              do_point = point => {
                const x = point.x,
                  y = point.y,
                  slope = point.slope,
                  next = point.next,
                  prev = point.prev,
                  i = point.i,
                  isin = point.isin;
                let d = (point.distance = slope ? _point.Point.distance(slope) : Number.POSITIVE_INFINITY);
                point.angle = slope ? slope.toAngle(true) : NaN;
                point.move = !(isin.stroke && isin.fill);
                point.ok = !point.move && prev.angle != point.angle;

                const pad = _util.default.padFn(12, " ", (str, pad) => "".concat(pad).concat(str));

                if(point.ok) {
                  console.log(
                    "pos: "
                      .concat(pad(i, 3), ", move: ")
                      .concat(isin || point.move, " point: ")
                      .concat(pad(point), ", slope: ")
                      .concat(pad(slope && slope.toFixed(3)), ", angle: ")
                      .concat(point.angle.toFixed(3), ", d: ")
                      .concat(d.toFixed(3))
                  );
                  let ret;

                  try {
                    ret = fn(point);
                  } catch(err) {}

                  return ret;
                }
              };

              i = 0;

            case 6:
              if(!(i < numPoints - 1)) {
                _context2.next = 22;
                break;
              }

              point = e.getPointAtLength(pos(i));
              next = e.getPointAtLength(pos(i + 1));
              _context2.t0 = e.isPointInStroke(point);
              _context2.t1 = e.isPointInFill(point);
              isin = {
                stroke: _context2.t0,
                fill: _context2.t1,

                toString() {
                  return "".concat(this.stroke, ",").concat(this.fill);
                }
              };
              p = new _point.Point(point);
              Object.assign(p, {
                slope: _point.Point.diff(next, point),
                next,
                prev,
                i,
                isin
              });
              y = do_point(p);

              if(!y) {
                _context2.next = 18;
                break;
              }

              _context2.next = 18;
              return y;

            case 18:
              prev = p;

            case 19:
              i++;
              _context2.next = 6;
              break;

            case 22:
              p = new _point.Point(e.getPointAtLength(pos(numPoints - 1)));
              p = Object.assign(p, {
                slope: null,
                next: null,
                prev,
                isin: {
                  stroke: true,
                  fill: true
                }
              });
              y = do_point(p);

              if(!y) {
                _context2.next = 28;
                break;
              }

              _context2.next = 28;
              return y;

            case 28:
            case "end":
              return _context2.stop();
          }
      }, _callee2);
    })();
  }
}

exports.SVG = SVG;
SVG.ns = "http://www.w3.org/2000/svg";
