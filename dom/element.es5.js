"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isElement = isElement;
exports.Element = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _node = require("./node.es5.js");

var _trbl = require("./trbl.es5.js");

var _rect = require("./rect.es5.js");

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
        (0, _defineProperty2["default"])(target, key, source[key]);
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

/**
 * Class for element.
 *
 * @class      Element (name)
 */
var Element = /*#__PURE__*/ (function(_Node) {
  (0, _inherits2["default"])(Element, _Node);

  function Element() {
    (0, _classCallCheck2["default"])(this, Element);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Element).apply(this, arguments));
  }

  (0, _createClass2["default"])(Element, null, [
    {
      key: "create",
      value: function create() {
        var args = Array.prototype.slice.call(arguments);

        var _ref =
            typeof args[0] == "object"
              ? args.shift()
              : _objectSpread(
                  {
                    tagName: args.shift()
                  },
                  args.shift()
                ),
          tagName = _ref.tagName,
          ns = _ref.ns,
          children = _ref.children,
          props = (0, _objectWithoutProperties2["default"])(_ref, ["tagName", "ns", "children"]);

        var parent = args.shift(); //console.log('Element.create ', { tagName, props, parent });

        var d = document || window.document;
        var e = ns ? d.createElementNS(ns, tagName) : d.createElement(tagName);

        for(var k in props) {
          var value = props[k];

          if(k == "parent") {
            parent = props[k];
            continue;
          } else if(k == "className") k = "class";

          if(k == "style" && typeof value === "object") Element.setCSS(e, value);
          else if(k.startsWith("on") || k.startsWith("inner")) e[k] = value;
          else e.setAttribute(k, value);
        }

        if(children && children.length)
          children.forEach(function(obj) {
            return Element.create(obj, e);
          });
        if(parent && parent.appendChild) parent.appendChild(e);
        return e;
      }
    },
    {
      key: "walk",
      value: function walk(elem, fn) {
        var accu = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        elem = Element.find(elem);
        var root = elem;
        var rootPath = Element.xpath(elem);
        var depth = 0;

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
    },
    {
      key: "toObject",
      value: function toObject(elem) {
        var opts =
          arguments.length > 1 && arguments[1] !== undefined
            ? arguments[1]
            : {
                children: true
              };
        var e = Element.find(elem);
        var children = opts.children
          ? e.children && e.children.length
            ? {
                children: _util["default"].array(e.children).map(function(child) {
                  return Element.toObject(child, e);
                })
              }
            : {}
          : {};
        var ns =
          (arguments[1] ? arguments[1].namespaceURI : document.body.namespaceURI) != e.namespaceURI
            ? {
                ns: e.namespaceURI
              }
            : {};
        var attributes = {};
        var a = Element.attr(e);

        for(var key in a) {
          var value = a[key];
          attributes[_util["default"].camelize(key)] = value;
        }

        return _objectSpread(
          {
            tagName: e.tagName
          },
          attributes,
          {},
          children,
          {},
          ns
        );
      }
    },
    {
      key: "toCommand",
      value: function toCommand(elem) {
        var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var o = Element.toObject(elem, {
          children: false
        });
        console.log("o:", o);
        var s = "";
        var tagName = o.tagName,
          ns = o.ns,
          children = o.children,
          attrs = (0, _objectWithoutProperties2["default"])(o, ["tagName", "ns", "children"]);
        var v = "";

        if(elem.firstElementChild) {
          v = parent ? String.fromCharCode(parent.charCodeAt(0) + 1) : "e";
          s += "".concat(v, " = ");
        }

        s += "Element.create('"
          .concat(tagName, "', { ")
          .concat(
            Object.entries(attrs)
              .map(function(_ref2) {
                var _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
                  k = _ref3[0],
                  v = _ref3[1];

                return "".concat(k, ": ").concat(JSON.stringify(v));
              })
              .join(", "),
            " }"
          )
          .concat(parent ? ", ".concat(parent) : "", ");");
        var child;

        for(child = elem.firstElementChild; child; child = child.nextElementSibling) {
          s += "\n" + Element.toCommand(child, v);
        }

        return s;
      }
    },
    {
      key: "find",
      value: function find(arg, parent) {
        if(!parent && global.window) parent = window.document;
        return typeof arg === "string" ? parent.querySelector(arg) : arg;
      }
    },
    {
      key: "findAll",
      value: function findAll(arg, parent) {
        parent = Element.find(parent);
        return _util["default"].array(parent && parent.querySelectorAll ? parent.querySelectorAll(arg) : document.querySelectorAll(arg));
      }
      /**
       * Sets or gets attributes
       *
       * @param      {<type>}  element       The element
       * @param      {<type>}  [attrs=null]  The attributes
       * @return     {<type>}  { description_of_the_return_value }
       */
    },
    {
      key: "attr",
      value: function attr(element, attrs_or_name) {
        var e = typeof element === "string" ? Element.find(element) : element;

        if(!_util["default"].isArray(attrs_or_name) && typeof attrs_or_name === "object" && e) {
          for(var key in attrs_or_name) {
            var name = _util["default"].decamelize(key, "-");

            var value = attrs_or_name[key];
            /*        console.log('attr(', e, ', ', { name, key, value, }, ')')
             */

            if(key.startsWith("on") && !/svg/.test(e.namespaceURI)) e[key] = value;
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

        var ret = attrs_or_name.reduce(function(acc, name) {
          var key =
            /*Util.camelize*/
            name;
          var value = e && e.getAttribute ? e.getAttribute(name) : e[key];
          acc[key] = isNaN(parseFloat(value)) ? value : parseFloat(value);
          return acc;
        }, {});
        if(typeof arguments[1] == "string") return ret[attrs_or_name[0]];
        return ret;
      }
    },
    {
      key: "getRect",
      value: function getRect(elem) {
        var e = elem;

        while(e) {
          if(e.style) {
            if(e.style.position == "") e.style.position = "relative";
            if(e.style.left == "") e.style.left = "0px";
            if(e.style.top == "") e.style.top = "0px";
          }

          e = e.offsetParent || e.parentNode;
        }

        var bbrect = elem.getBoundingClientRect(); //console.log('getRect: ', { bbrect });

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
    },
    {
      key: "rect",
      value: function rect(elem) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var args = Array.prototype.slice.call(arguments);
        var element = args.shift();
        if(args.length > 0 && (isRect(args) || isRect(args[0]))) return Element.setRect.apply(Element, arguments);
        var _options$round = options.round,
          round = _options$round === void 0 ? true : _options$round,
          _options$relative_to = options.relative_to,
          relative_to = _options$relative_to === void 0 ? null : _options$relative_to,
          _options$scroll_offse = options.scroll_offset,
          scroll_offset = _options$scroll_offse === void 0 ? true : _options$scroll_offse;
        var e = typeof element === "string" ? Element.find(element) : element;

        if(!e || !e.getBoundingClientRect) {
          return new _rect.Rect(0, 0, 0, 0);
        }

        var bb = e.getBoundingClientRect();

        var r = _trbl.TRBL.toRect(bb);

        if(
          relative_to &&
          relative_to !== null
          /*&& Element.isElement(relative_to)*/
        ) {
          var off = Element.rect(relative_to);
          r.x -= off.x;
          r.y -= off.y;
        } // console.log("Element.rect(", r, ")");

        if(options.border) {
          var border = Element.border(e);

          _rect.Rect.outset(r, border); // console.log("Element.rect(", r, ") // with border = ", border);
        }

        var _window = window,
          scrollTop = _window.scrollTop,
          scrollY = _window.scrollY;

        if(scroll_offset) {
          r.y += scrollY;
        }

        r = new _rect.Rect(round ? _rect.Rect.round(r) : r); //console.log('Element.rect(', element, ') =', r);

        return r;
      }
    },
    {
      key: "setRect",
      value: function setRect(element, rect) {
        var anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Anchor.LEFT | Anchor.TOP;
        var e = typeof element === "string" ? Element.find(element) : element; //console.log('Element.setRect(', element, ',', rect, ', ', anchor, ') ');

        if(typeof anchor == "string") e.style.position = anchor;
        var position = e.style.position || rect.position || "relative";
        var pelement = position == "fixed" ? e.documentElement || document.body : e.parentNode;
        var prect = Element.rect(pelement, {
          round: false
        }); //Rect.align(rect, prect, anchor);

        /* const stack = Util.getCallers(3, 4);*/

        var ptrbl = _rect.Rect.toTRBL(prect);

        var trbl = _rect.Rect.toTRBL(rect); //console.log('Element.setRect ', { trbl, ptrbl, stack });

        var css = {};
        var remove;

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
        css.height = Math.round(isNaN(rect.height) ? rect.height : prect.height) + "px"; //console.log('Element.setRect ', css);

        Element.setCSS(e, css);
        return e;
      }
    },
    {
      key: "position",
      value: function position(element) {
        var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "absolute";
        if(typeof element == "string") element = Element.find(element);

        var _element$getBoundingC = element.getBoundingClientRect(),
          x = _element$getBoundingC.x,
          y = _element$getBoundingC.y;

        return new Point({
          x: x,
          y: y
        });
      }
    },
    {
      key: "move",
      value: function move(element, point, pos) {
        var _ref4 = Array.prototype.slice.call(arguments),
          e = _ref4[0],
          rest = _ref4.slice(1);

        var _ref5 = new Point(rest),
          _ref5$x = _ref5.x,
          x = _ref5$x === void 0 ? Element.position(element).x : _ref5$x,
          _ref5$y = _ref5.y,
          y = _ref5$y === void 0 ? Element.position(element).y : _ref5$y;

        var to = {
          x: x,
          y: y
        };
        var position = pos || Element.getCSS(element, "position") || "relative";
        var off; //console.log('Element.move ', { element, to, position });

        var getValue = function getValue(prop) {
          var property = dom.Element.getCSS(element, prop);
          if(property === undefined) return undefined;
          var matches = /([-0-9.]+)(.*)/.exec(property) || []; //console.log({ match, value, unit });

          return parseFloat(matches[1]);
        };

        var current = new Point({
          x: getValue("left") || 0,
          y: getValue("top") || 0
        });
        off = new Point(
          Element.rect(element, {
            round: false
          })
        ); //   off = Point.diff(off, current);

        Point.add(current, Point.diff(to, off));
        /*
      if(position == 'relative') {
        to.x -= off.x;
        to.y -= off.y;
      }*/

        var css = Point.toCSS(current); //console.log("Element.move: ", { position, to, css, off, current });
        //console.log('move newpos: ', Point.toCSS(pt));

        Element.setCSS(
          element,
          _objectSpread({}, css, {
            position: position
          })
        );
        return element;
      }
    },
    {
      key: "resize",
      value: function resize() {
        var args = Array.prototype.slice.call(arguments);
        var e = Element.find(args.shift());
        var size = new Size(args);
        var css = Size.toCSS(size); //console.log("Element.resize: ", { e, size, css });

        Element.setCSS(e, css);
        return e;
      }
    },
    {
      key: "getEdgesXYWH",
      value: function getEdgesXYWH(_ref6) {
        var x = _ref6.x,
          y = _ref6.y,
          w = _ref6.w,
          h = _ref6.h;
        return [
          {
            x: x,
            y: y
          },
          {
            x: x + w,
            y: y
          },
          {
            x: x + w,
            y: y + h
          },
          {
            x: x,
            y: y + h
          }
        ];
      }
    },
    {
      key: "getEdge",
      value: function getEdge(_ref7, which) {
        var x = _ref7.x,
          y = _ref7.y,
          w = _ref7.w,
          h = _ref7.h;
        return [
          {
            x: x,
            y: y
          },
          {
            x: x + w / 2,
            y: y
          },
          {
            x: x + w,
            y: y
          },
          {
            x: x + w,
            y: y + h / 2
          },
          {
            x: x + w,
            y: y + h
          },
          {
            x: x + w / 2,
            y: y + h
          },
          {
            x: x,
            y: y + h
          },
          {
            x: x,
            y: y + h / 2
          }
        ][Math.floor(which * 2)];
      }
    },
    {
      key: "getPointsXYWH",
      value: function getPointsXYWH(_ref8) {
        var x = _ref8.x,
          y = _ref8.y,
          w = _ref8.w,
          h = _ref8.h;
        return [
          {
            x: x,
            y: y
          },
          {
            x: x + w,
            y: y + h
          }
        ];
      }
    },
    {
      key: "cumulativeOffset",
      value: function cumulativeOffset(element) {
        var relative_to = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        if(typeof element == "string") element = Element.find(element);
        var p = {
          x: 0,
          y: 0
        };

        do {
          p.y += element.offsetTop || 0;
          p.x += element.offsetLeft || 0;
        } while((element = element.offsetParent) && element != relative_to);

        return p;
      }
    },
    {
      key: "getTRBL",
      value: function getTRBL(element) {
        var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var names = ["Top", "Right", "Bottom", "Left"].map(function(pos) {
          return prefix + (prefix == "" ? pos.toLowerCase() : pos + (prefix == "border" ? "Width" : ""));
        });
        return new _trbl.TRBL(Element.getCSS(element, names));
      }
    },
    {
      key: "setTRBL",
      value: function setTRBL(element, trbl) {
        var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "margin";
        var attrs = ["Top", "Right", "Bottom", "Left"].reduce(function(acc, pos) {
          var name = prefix + (prefix == "" ? pos.toLowerCase() : pos);
          return _objectSpread({}, acc, (0, _defineProperty2["default"])({}, name, trbl[pos.toLowerCase()]));
        }, {}); //console.log('Element.setTRBL ', attrs);

        return Element.setCSS(element, attrs);
      }
    },
    {
      key: "setCSS",
      value: function setCSS(element, prop, value) {
        if(typeof element == "string") element = Element.find(element);
        if(typeof prop == "string" && typeof value == "string") prop = (0, _defineProperty2["default"])({}, prop, value); //console.log('Element.setCSS ', { element, toCSS });

        var _loop = function _loop(key) {
          var value = prop[key];

          var propName = _util["default"].decamelize(key);

          if(typeof value == "function") {
            if("subscribe" in value) {
              value.subscribe = function(newval) {
                return element.style.setProperty(propName, newval);
              };

              value = value();
            }
          }

          if(element.style) {
            if(element.style.setProperty) element.style.setProperty(propName, value);
            else element.style[_util["default"].camelize(propName)] = value;
          }
        };

        for(var key in prop) {
          _loop(key);
        }

        return element;
      }
    },
    {
      key: "getCSS",
      value: function getCSS(element) {
        var property = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
        var receiver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        element = typeof element === "string" ? Element.find(element) : element;
        var w = window !== undefined ? window : global.window;
        var d = document !== undefined ? document : global.document; //console.log('Element.getCSS ', { w, d, element });

        var parent = element.parentElement ? element.parentElement : element.parentNode;

        var estyle = _util["default"].toHash(w && w.getComputedStyle ? w.getComputedStyle(element) : d.getComputedStyle(element));

        var pstyle = parent && parent.tagName ? _util["default"].toHash(w && w.getComputedStyle ? w.getComputedStyle(parent) : d.getComputedStyle(parent)) : {}; //console.log('Element.getCSS ', { estyle, pstyle });

        var style = _util["default"].removeEqual(estyle, pstyle);

        var keys = Object.keys(style).filter(function(k) {
          return !/^__/.test(k);
        }); //console.log('style: ', style);

        var ret = {};

        if(receiver == null) {
          receiver = function receiver(result) {
            if(typeof result == "object") {
              try {
                Object.defineProperty(result, "cssText", {
                  get: function get() {
                    return Object.entries(this)
                      .map(function(_ref9) {
                        var _ref10 = (0, _slicedToArray2["default"])(_ref9, 2),
                          k = _ref10[0],
                          v = _ref10[1];

                        return "".concat(_util["default"].decamelize(k, "-"), ": ").concat(v, ";\n");
                      })
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
              : property.reduce(function(ret, key) {
                  ret[key] = style[key];
                  return ret;
                }, {});
        } else {
          for(var i = 0; i < keys.length; i++) {
            var stylesheet = keys[i];

            var key = _util["default"].camelize(stylesheet);

            var val = style[stylesheet] || style[key];
            if(val && val.length > 0 && val != "none") ret[key] = val;
          }
        }

        return receiver(ret);
      }
    },
    {
      key: "xpath",
      value: function xpath(elt) {
        var relative_to = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var path = ""; //console.log('relative_to: ', relative_to);

        for(; elt && elt.nodeType == 1; elt = elt.parentNode) {
          var xname = Element.unique(elt);
          path = xname + path;

          if(elt == relative_to) {
            break;
          }

          path = "/" + path;
        }

        return path;
      }
    },
    {
      key: "selector",
      value: function selector(elt) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var _opts$relative_to = opts.relative_to,
          relative_to = _opts$relative_to === void 0 ? null : _opts$relative_to,
          _opts$use_id = opts.use_id,
          use_id = _opts$use_id === void 0 ? false : _opts$use_id;
        var sel = "";

        for(; elt && elt.nodeType == 1; elt = elt.parentNode) {
          if(sel != "") sel = " > " + sel;
          var xname = Element.unique(elt, {
            idx: false,
            use_id: use_id
          });
          if(use_id === false) xname = xname.replace(/#.*/g, "");
          sel = xname + sel;
          if(elt == relative_to) break;
        }

        return sel;
      }
    },
    {
      key: "depth",
      value: function depth(elem) {
        var relative_to = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;
        var count = 0;

        while(elem != relative_to && (elem = elem.parentNode)) {
          count++;
        }

        return count;
      }
    },
    {
      key: "dump",
      value: function dump(elem) {
        var str = "";

        function dumpElem(child, accu, root, depth) {
          var rect = _rect.Rect.round(Element.rect(child, elem));

          accu += "  ".repeat((depth > 0 ? depth : 0) + 1) + " " + Element.xpath(child, child);
          (0, _toConsumableArray2["default"])(child.attributes).forEach(function(attr) {
            return (accu += " " + attr.name + "='" + attr.value + "'");
          });
          if(_rect.Rect.area(rect) > 0) accu += " " + _rect.Rect.toString(rect);
          ["margin", "border", "padding"].forEach(function(name) {
            var trbl = Element.getTRBL(elem, "margin");
            if(!trbl["null"]()) accu += " " + name + ": " + trbl + "";
          });
          return accu;
        }

        str = dumpElem(elem, "");
        str = Element.walk(
          elem.firstElementChild,
          function(e, a, r, d) {
            if(e && e.attributes) return dumpElem(e, a + "\n", r, d);
            return null;
          },
          str
        );
        return str;
      }
    },
    {
      key: "skipper",
      value: function skipper(fn) {
        var pred =
          arguments.length > 1 && arguments[1] !== undefined
            ? arguments[1]
            : function(a, b) {
                return a.tagName == b.tagName;
              };
        return function(elem) {
          var next = fn(elem);

          for(; next; next = fn(next)) {
            if(pred(elem, next)) return next;
          }

          return null;
        };
      }
    },
    {
      key: "prev_sibling",
      value: function prev_sibling(sib) {
        return sib.previousElementSibling;
      }
    },
    {
      key: "next_sibling",
      value: function next_sibling(sib) {
        return sib.nextElementSibling;
      }
    },
    {
      key: "idx",
      value: function idx(elt) {
        var count = 1;
        var sib = elt.previousElementSibling;

        for(; sib; sib = sib.previousElementSibling) {
          if(sib.tagName == elt.tagName) count++;
        }

        return count;
      }
    },
    {
      key: "name",
      value: function name(elem) {
        var name = elem.tagName.toLowerCase();
        if(elem.id && elem.id.length) name += "#" + elem.id;
        else if(elem["class"] && elem["class"].length) name += "." + elem["class"];
        return name;
      }
    },
    {
      key: "unique",
      value: function unique(elem) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var _opts$idx = opts.idx,
          idx = _opts$idx === void 0 ? true : _opts$idx,
          _opts$use_id2 = opts.use_id,
          use_id = _opts$use_id2 === void 0 ? true : _opts$use_id2;
        var name = elem.tagName.toLowerCase();
        if(use_id && elem.id && elem.id.length) return name + "#" + elem.id;
        var classNames = (0, _toConsumableArray2["default"])(elem.classList); //String(elem.className).split(new RegExp("/[ \t]/"));

        for(var i = 0; i < classNames.length; i++) {
          var res = document.getElementsByClassName(classNames[i]);
          if(res && res.length === 1) return name + "." + classNames[i];
        }

        if(idx) {
          if(elem.nextElementSibling || elem.previousElementSibling) {
            return name + "[" + Element.idx(elem) + "]";
          }
        }

        return name;
      }
    },
    {
      key: "factory",
      value: function factory() {
        var delegate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var root = parent;

        if(root === null) {
          if(typeof delegate.append_to !== "function") {
            root = delegate;
            delegate = {};
          } else {
            root = "body";
          }
        }

        var _delegate = delegate,
          append_to = _delegate.append_to,
          create = _delegate.create,
          setattr = _delegate.setattr,
          setcss = _delegate.setcss;
        if(typeof root === "string") root = Element.find(root);
        if(!delegate.root) delegate.root = root;

        if(!delegate.append_to) {
          delegate.append_to = function(elem, parent) {
            if(!parent) parent = root;
            if(parent) parent.appendChild(elem);
            if(!this.root) this.root = elem;
          };
        }

        if(!delegate.create)
          delegate.create = function(tag) {
            return document.createElement(tag);
          };

        if(!delegate.setattr) {
          delegate.setattr = function(elem, attr, value) {
            //console.log('setattr ', { attr, value });
            elem.setAttribute(attr, value);
          };
        }

        if(!delegate.setcss)
          delegate.setcss = function(elem, css) {
            return Object.assign(elem.style, css);
          }; // Element.setCSS(elem, css);

        delegate.bound_factory = function(tag) {
          var attr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
          var tagName = attr.tagName,
            style = attr.style,
            children = attr.children,
            innerHTML = attr.innerHTML,
            props = (0, _objectWithoutProperties2["default"])(attr, ["tagName", "style", "children", "innerHTML"]);
          var elem = delegate.create(tagName || tag);
          if(style) delegate.setcss(elem, style);

          if(children && children.length) {
            for(var i = 0; i < children.length; i++) {
              if(typeof children[i] === "string") {
                elem.innerHTML += children[i];
              } else {
                var _children$i = children[i],
                  _tagName = _children$i.tagName,
                  _parent = _children$i.parent,
                  childProps = (0, _objectWithoutProperties2["default"])(_children$i, ["tagName", "parent"]);
                delegate.bound_factory(_tagName, childProps, elem);
              }
            }
          }

          if(innerHTML) elem.innerHTML += innerHTML;

          for(var k in props) {
            delegate.setattr(elem, k, props[k]);
          }
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
    },
    {
      key: "remove",
      value: function remove(element) {
        var e = typeof element === "string" ? Element.find(element) : element;

        if(e && e.parentNode) {
          var parent = e.parentNode;
          parent.removeChild(e);
          return true;
        }

        return false;
      }
    },
    {
      key: "isat",
      value: function isat(e, x, y, options) {
        var args = Array.prototype.slice.call(arguments);
        var element = args.shift();
        var point = Point(args);
        var o = args[0] || {
          round: false
        };
        var rect = Element.rect(element, o);
        return _rect.Rect.inside(rect, point);
      }
    },
    {
      key: "at",
      value: function at(x, y, options) {
        if(Element.isElement(x)) return Element.isat.apply(Element, arguments);
        var args = Array.prototype.slice.call(arguments);
        var p = Point(args);
        var w = global.window;
        var d = w.document;
        var s = o.all
          ? function(e) {
              if(ret == null) ret = [];
              ret.push(e);
            }
          : function(e, depth) {
              e.depth = depth;
              if(ret === null || depth >= ret.depth) ret = e;
            };
        var ret = null;
        return new Promise(function(resolve, reject) {
          var element = null;
          Element.walk(d.body, function(e, accu, root, depth) {
            var r = Element.rect(e, {
              round: true
            });
            if(_rect.Rect.area(r) == 0) return;
            if(_rect.Rect.inside(r, p)) s(e, depth);
          });
          if(ret !== null) resolve(ret);
          else reject();
        });
      }
    },
    {
      key: "transition",
      value: function transition(element, css, time) {
        var easing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "linear";
        var e = typeof element === "string" ? Element.find(element) : element;
        var a = [];
        var t = typeof time == "number" ? "".concat(time, "ms") : time;
        var ctx = {
          e: e,
          t: t,
          from: {},
          to: {},
          css: css
        };

        for(var prop in css) {
          var name = _util["default"].decamelize(prop);

          a.push(
            ""
              .concat(name, " ")
              .concat(t, " ")
              .concat(easing)
          );
          ctx.from[prop] = e.style.getProperty ? e.style.getProperty(name) : e.style[prop];
          ctx.to[name] = css[prop];
        }

        var tlist = a.join(", "); //console.log("Element.transition", ctx);

        return new Promise(function(resolve, reject) {
          var tend = function tend(e) {
            this.event = e; //console.log("Element.transitionEnd event", this);

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
  ]);
  return Element;
})(_node.Node);

exports.Element = Element;
Element.children = /*#__PURE__*/ _regenerator["default"].mark(function _callee(elem) {
  var tfn,
    e,
    _args = arguments;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while(1) {
      switch ((_context.prev = _context.next)) {
        case 0:
          tfn =
            _args.length > 1 && _args[1] !== undefined
              ? _args[1]
              : function(e) {
                  return e;
                };
          if(typeof elem == "string") elem = Element.find(elem);
          e = elem.firstElementChild;

        case 3:
          if(!e) {
            _context.next = 9;
            break;
          }

          _context.next = 6;
          return tfn(e);

        case 6:
          e = e.nextElementSibling;
          _context.next = 3;
          break;

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
});
Element.recurse = /*#__PURE__*/ _regenerator["default"].mark(function _callee2(elem) {
  var tfn,
    root,
    _args2 = arguments;
  return _regenerator["default"].wrap(function _callee2$(_context2) {
    while(1) {
      switch ((_context2.prev = _context2.next)) {
        case 0:
          tfn =
            _args2.length > 1 && _args2[1] !== undefined
              ? _args2[1]
              : function(e) {
                  return e;
                };
          if(typeof elem == "string") elem = Element.find(elem);
          root = elem;

        case 3:
          elem =
            elem.firstElementChild ||
            elem.nextElementSibling ||
            (function() {
              do {
                if(!(elem = elem.parentElement)) break;
              } while(!elem.nextSibling);

              return elem && elem != root ? elem.nextElementSibling : null;
            })();

          if(!(elem !== null)) {
            _context2.next = 7;
            break;
          }

          _context2.next = 7;
          return tfn(elem);

        case 7:
          if(elem) {
            _context2.next = 3;
            break;
          }

        case 8:
        case "end":
          return _context2.stop();
      }
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

Element.edges = function(arg) {
  return Element.getEdgesXYWH(Element.rect(arg));
};

Element.Axis = {
  H: 0,
  V: 2
};

Element.margin = function(element) {
  return Element.getTRBL(element, "margin");
};

Element.padding = function(element) {
  return Element.getTRBL(element, "padding");
};

Element.border = function(element) {
  return Element.getTRBL(element, "border");
};

function isElement(e) {
  return e.tagName !== undefined;
}
