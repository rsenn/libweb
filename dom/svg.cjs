"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SVG = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es6.regexp.to-string");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

require("core-js/modules/es7.object.entries");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.map");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _element = require("./element.cjs");

var _size = require("../geom/size.cjs");

var _point = require("../geom/point.cjs");

var _rect = require("../geom/rect.cjs");

var _line = require("../geom/line.cjs");

var _pathParser = require("../svg/path-parser.cjs");

var _util = _interopRequireDefault(require("../util.cjs"));

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class SVG extends _element.Element {
  static create(name, attr, parent) {
    var svg = document.createElementNS(SVG.ns, name);
    let text, attrfn;

    if (attr.text !== undefined) {
      text = attr.text;
      delete attr.text;
    }

    if (name == "svg") {
      attr.version = "1.1";
      attr.xmlns = SVG.ns;

      attrfn = n => n;
    } else {
      attrfn = arg => arg;
    }

    _util.default.foreach(attr, (value, name) => svg.setAttribute(attrfn(name, "-"), value));

    if (parent && parent.appendChild) parent.appendChild(svg);
    if (text) svg.innerHTML = text;
    return svg;
  }

  static factory(...args) {
    let arg = [...arguments];
    let delegate = "append_to" in args[0] || "create" in args[0] || "setattr" in args[0] ? args.shift() : {};
    let parent = "tagName" in args[0] || "appendChild" in args[0] ? args.shift() : null;
    let size = (0, _size.isSize)(args[0]) ? args.shift() : null;
    delegate = _objectSpread({
      create: tag => document.createElementNS(SVG.ns, tag),
      append_to: (elem, root = parent) => root.appendChild(elem),
      setattr: (elem, name, value) => name != "ns" && elem.setAttributeNS(document.namespaceURI, _util.default.decamelize(name, "-"), value),
      setcss: (elem, css) => elem.setAttributeNS(null, "style", css)
    }, delegate);

    const _ref = size || {},
          width = _ref.width,
          height = _ref.height;

    console.log("factory", {
      delegate,
      parent,
      size,
      arg
    });
    if (parent && parent.tagName.toLowerCase() == "svg") delegate.root = parent;else if (this !== SVG && this && this.appendChild) delegate.root = this;else delegate.append_to(delegate.root = SVG.create("svg", _objectSpread({}, size, {
      viewBox: "0 0 ".concat(width || 0, " ").concat(height || 0)
    })), parent);
    if (!delegate.root.firstElementChild || delegate.root.firstElementChild.tagName != "defs") SVG.create("defs", {}, delegate.root);
    const _delegate = delegate,
          append_to = _delegate.append_to;

    delegate.append_to = function (elem, p) {
      var root = p || this.root;
      if (elem.tagName.indexOf("Gradient") != -1) root = root.querySelector("defs");
      append_to(elem, root);
    };

    return _element.Element.factory(delegate);
  }

  static matrix(element, screen = false) {
    let e = typeof element === "string" ? _element.Element.find(element) : element;
    let fn = screen ? "getScreenCTM" : "getCTM";
    let ctm = e[fn]();
    console.log("ctm:", ctm);
    if (e && e[fn]) return new Matrix(ctm);
    return null;
  }

  static bbox(element, options = {
    parent: null,
    absolute: false
  }) {
    let e = typeof element === "string" ? _element.Element.find(element, options.parent) : element;
    let bb;

    if (e && e.getBBox) {
      bb = new _rect.Rect(e.getBBox());

      if (options.absolute) {
        let r = _element.Element.rect(element.ownerSVGElement);

        bb.x += r.x;
        bb.y += r.y;
      }

      return bb;
    }

    return _element.Element.rect(e);
  }

  static gradient(type, _ref2) {
    let stops = _ref2.stops,
        _ref2$factory = _ref2.factory,
        factory = _ref2$factory === void 0 ? SVG.create : _ref2$factory,
        _ref2$parent = _ref2.parent,
        parent = _ref2$parent === void 0 ? null : _ref2$parent,
        _ref2$line = _ref2.line,
        line = _ref2$line === void 0 ? false : _ref2$line,
        props = (0, _objectWithoutProperties2.default)(_ref2, ["stops", "factory", "parent", "line"]);
    var defs = factory("defs", {}, parent);
    const map = new Map(stops instanceof Array ? stops : Object.entries(stops));
    let rect = {};

    if (line) {
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
      factory("stop", {
        offset: Math.round(o * 100) + "%",
        stopColor: color
      }, grad);
    });
    return grad;
  }

  static owner(elem) {
    var ret = function ret(tag, props, parent) {
      if (tag === undefined) return this.element;
      return SVG.create.call(SVG, tag, props, parent || this.element);
    };

    ret.element = elem.ownerSVGElement;

    _util.default.defineGetterSetter(ret, "rect", function () {
      return _element.Element.rect(this.element);
    });

    return ret;
  }

  static path() {
    return new SvgPath();
  }

  static getProperty(elem, name) {
    if (!elem.style[name] && elem.hasAttribute(name)) elem.style.setProperty(name, elem.getAttribute(name));
    let props = window.getComputedStyle(elem);
    return props[name];
  }

  static getProperties(elem, properties) {
    var _iterator = _createForOfIteratorHelper(properties),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        let name = _step.value;
        if (!elem.style[name] && elem.hasAttribute(name)) elem.style.setProperty(name, elem.getAttribute(name));
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    let props = window.getComputedStyle(elem);
    return properties.reduce((acc, name) => _objectSpread({}, acc, {
      [name]: props[name]
    }), {});
  }

  static coloredElements(elem) {
    var _this = this;

    return _regenerator.default.mark(function _callee() {
      var _iterator2, _step2, item, _this$getProperties, fill, stroke, a, value;

      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _iterator2 = _createForOfIteratorHelper(_element.Element.iterator(elem, (e, d) => ["fill", "stroke"].some(a => e.hasAttribute(a))));
            _context.prev = 1;

            _iterator2.s();

          case 3:
            if ((_step2 = _iterator2.n()).done) {
              _context.next = 14;
              break;
            }

            item = _step2.value;
            _this$getProperties = _this.getProperties(item, ["fill", "stroke"]), fill = _this$getProperties.fill, stroke = _this$getProperties.stroke;
            a = Object.entries({
              fill,
              stroke
            }).filter(([k, v]) => v !== undefined && v !== "none");

            if (!(a.length == 0)) {
              _context.next = 9;
              break;
            }

            return _context.abrupt("continue", 12);

          case 9:
            value = {
              item,
              props: a.reduce((acc, [name, value]) => /#/.test(value) ? acc : _objectSpread({}, acc, {
                [name]: value
              }), {})
            };
            _context.next = 12;
            return value;

          case 12:
            _context.next = 3;
            break;

          case 14:
            _context.next = 19;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](1);

            _iterator2.e(_context.t0);

          case 19:
            _context.prev = 19;

            _iterator2.f();

            return _context.finish(19);

          case 22:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 16, 19, 22]]);
    })();
  }

  static allColors(elem) {
    let map = new Map();

    const addColor = (c, item, prop) => {
      if (!map.has(c)) map.set(c, []);
      map.get(c).push([item, prop]);
    };

    var _iterator3 = _createForOfIteratorHelper(this.coloredElements(elem)),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        let _step3$value = _step3.value,
            item = _step3$value.item,
            props = _step3$value.props;

        for (let prop in props) addColor(props[prop], item, prop);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    let list = [...map.keys()].map(color => ({
      color,
      elements: map.get(color)
    }));
    return {
      list,

      get colors() {
        return this.list.map(item => item.color);
      },

      index(name) {
        return typeof name == "number" && this.list[name] ? name : this.list.findIndex(item => item.color === name);
      },

      name(i) {
        return typeof i == "number" ? this.list[i].name : typeof i == "string" ? i : null;
      },

      get(arg) {
        return this.list[arg] || this.list.find(item => item.color == arg);
      },

      set(index, color, elements) {
        this.list[index] = color ? {
          color,
          elements
        } : color;
        return this;
      },

      dump() {
        for (let i = 0; i < this.list.length; i++) {
          const _this$list$i = this.list[i],
                color = _this$list$i.color,
                elements = _this$list$i.elements;
          console.log("".concat(i, ": %c    %c ").concat(color), "background: ".concat(color, ";"), "background: none");
        }

        return this;
      },

      adjacencyMatrix() {
        let ret = [];

        for (let i = 0; i < this.list.length; i++) {
          ret.push([]);
          ret[i].fill(null, 0, this.list.length);
        }

        for (let i = 0; i < this.list.length; i++) {
          for (let j = 0; j < this.list.length; j++) {
            const dist = RGBA.fromString(this.list[i].color).contrast(RGBA.fromString(this.list[j].color));
            if (j != i) ret[j][i] = +dist.toFixed(3);else ret[j][i] = Number.POSITIVE_INFINITY;
          }
        }

        return ret;
      },

      replace(color, newColor) {
        let name = this.name(color);
        let index = this.index(color);
        let a = this.get(color);
        this.set(index, null);

        if (typeof newColor != "function") {
          var newC = newColor;

          newColor = () => newC;
        }

        let c = newColor(RGBA.fromString(a.color), index, a.color);
        if (typeof c != "string") c = c.toString();

        var _iterator4 = _createForOfIteratorHelper(a.elements),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            let _step4$value = (0, _slicedToArray2.default)(_step4.value, 2),
                elem = _step4$value[0],
                prop = _step4$value[1];

            elem.style.setProperty(prop, c);
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }

        return this.set(index, c, a.elements);
      },

      replaceAll(fn) {
        const colors = this.list.map(item => item.color);
        if (!fn) fn = _util.default.shuffle(colors);

        if (fn instanceof Array) {
          var a = fn.concat(colors.slice(fn.length, colors.length));

          fn = (rgba, index, color) => a[index];
        }

        for (let i = 0; i < colors.length; i++) this.replace(i, fn);

        return this;
      }

    };
  }

  static lineIterator(e) {
    return _regenerator.default.mark(function _callee2() {
      var pathStr, path, prev, i, cmd, code, x, y, x0, y0, move, line;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            if (typeof e == "string") pathStr = e;else pathStr = e.getAttribute("d");
            path = (0, _pathParser.makeAbsolute)((0, _pathParser.parseSVG)(pathStr));
            i = 0;

          case 3:
            if (!(i < path.length)) {
              _context2.next = 18;
              break;
            }

            cmd = path[i];
            code = cmd.code, x = cmd.x, y = cmd.y, x0 = cmd.x0, y0 = cmd.y0;
            if (x == undefined) x = x0;
            if (y == undefined) y = y0;
            move = cmd.code.toLowerCase() == "m";

            if (!(prev && !move)) {
              _context2.next = 14;
              break;
            }

            line = new _line.Line({
              x: x0,
              y: y0
            }, cmd);
            console.log("lineIterator", {
              i,
              code,
              x,
              y,
              x0,
              y0
            }, line.toString());
            _context2.next = 14;
            return line;

          case 14:
            prev = cmd;

          case 15:
            i++;
            _context2.next = 3;
            break;

          case 18:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    })();
  }

  static pathIterator(e, numPoints, fn = p => p) {
    return _regenerator.default.mark(function _callee3() {
      var len, p, y, prev, pos, do_point, i, point, next, isin;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            len = e.getTotalLength();
            if (!numPoints) numPoints = Math.ceil(len / 2);
            prev = {};

            pos = i => i * len / numPoints;

            do_point = point => {
              const x = point.x,
                    y = point.y,
                    slope = point.slope,
                    next = point.next,
                    prev = point.prev,
                    i = point.i,
                    isin = point.isin;
              let d = point.distance = slope ? _point.Point.distance(slope) : Number.POSITIVE_INFINITY;
              point.angle = slope ? slope.toAngle(true) : NaN;
              point.move = !(isin.stroke && isin.fill);
              point.ok = !point.move && prev.angle != point.angle;

              const pad = _util.default.padFn(12, " ", (str, pad) => "".concat(pad).concat(str));

              if (point.ok) {
                let ret;

                try {
                  ret = fn(point);
                } catch (err) {}

                return ret;
              }
            };

            i = 0;

          case 6:
            if (!(i < numPoints - 1)) {
              _context3.next = 22;
              break;
            }

            point = e.getPointAtLength(pos(i));
            next = e.getPointAtLength(pos(i + 1));
            _context3.t0 = e.isPointInStroke(point);
            _context3.t1 = e.isPointInFill(point);
            isin = {
              stroke: _context3.t0,
              fill: _context3.t1,

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

            if (!y) {
              _context3.next = 18;
              break;
            }

            _context3.next = 18;
            return y;

          case 18:
            prev = p;

          case 19:
            i++;
            _context3.next = 6;
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

            if (!y) {
              _context3.next = 28;
              break;
            }

            _context3.next = 28;
            return y;

          case 28:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    })();
  }

  static viewbox(element, rect) {
    if (typeof element == "string") element = _element.Element.find(element);
    if (element.ownerSVGElement) element = element.ownerSVGElement;
    let vbattr;
    if (rect) element.setAttribute("viewBox", "toString" in rect ? rect.toString() : rect);
    vbattr = _element.Element.attr(element, "viewBox");
    return new _rect.Rect(vbattr.split(/\s+/g).map(parseFloat));
  }

}

exports.SVG = SVG;
SVG.ns = "http://www.w3.org/2000/svg";
