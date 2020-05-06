"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CSS = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.map");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

var _util = _interopRequireDefault(require("../util.es5.js"));

var _element = require("./element.es5.js");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

class CSS {
  static list(doc) {
    if (!doc) doc = window.document;

    const getStyleMap = (obj, key) => {
      let rule = _util.default.find(obj, item => item["selectorText"] == key);

      return _util.default.adapter(rule, obj => obj && obj.styleMap && obj.styleMap.size !== undefined ? obj.styleMap.size : 0, (obj, i) => [...obj.styleMap.keys()][i], (obj, key) => obj.styleMap.getAll(key).map(v => String(v)).join(" "));
    };

    const getStyleSheet = (obj, key) => {
      let sheet = _util.default.find(obj, entry => entry.href == key || entry.ownerNode.id == key) || obj[key];
      return _util.default.adapter(sheet.rules, obj => obj && obj.length !== undefined ? obj.length : 0, (obj, i) => obj[i].selectorText, getStyleMap);
    };

    return _util.default.adapter([...doc.styleSheets], obj => obj.length, (obj, i) => obj[i].href || obj[i].ownerNode.id || i, getStyleSheet);
  }

  static styles(stylesheet) {
    const list = stylesheet && stylesheet.cssRules ? [stylesheet] : CSS.list(stylesheet);

    let ret = _util.default.array();

    list.forEach(s => {
      let rules = [...s.cssRules];
      rules.forEach(rule => {
        ret.push(rule.cssText);
      });
    });
    return ret;
  }

  static classes(selector = "*") {
    return _element.Element.findAll(selector).filter(e => e.classList.length).map(e => [...e.classList]).flat().unique();
  }

  static section(selector, props) {
    let s = "".concat(selector, " {\n");

    var _iterator = _createForOfIteratorHelper(props),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        let _step$value = (0, _slicedToArray2.default)(_step.value, 2),
            name = _step$value[0],
            value = _step$value[1];

        s += "  ".concat(_util.default.decamelize(name), ": ").concat(value, ";\n");
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    s += "}\n";
    return s;
  }

  static create(parent = "head") {
    parent = typeof parent == "string" ? _element.Element.find(parent) : parent;

    const element = _element.Element.create("style", {}, parent);

    const proto = {
      element: null,
      map: null,

      set(selector, props) {
        const exists = this.map.has(selector);
        this.map.set(selector, _util.default.toMap(props));
        return this.update(exists);
      },

      get(selector) {
        const props = this.map.get(selector);
        return "toObject" in props ? props.toObject() : props;
      },

      keys() {
        return this.map.keys();
      },

      entries() {
        var _this = this;

        return _regenerator.default.mark(function _callee() {
          var _iterator2, _step2, _step2$value, selector, props;

          return _regenerator.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                _iterator2 = _createForOfIteratorHelper(_this.map.entries());
                _context.prev = 1;

                _iterator2.s();

              case 3:
                if ((_step2 = _iterator2.n()).done) {
                  _context.next = 9;
                  break;
                }

                _step2$value = (0, _slicedToArray2.default)(_step2.value, 2), selector = _step2$value[0], props = _step2$value[1];
                _context.next = 7;
                return [selector, props.toObject()];

              case 7:
                _context.next = 3;
                break;

              case 9:
                _context.next = 14;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](1);

                _iterator2.e(_context.t0);

              case 14:
                _context.prev = 14;

                _iterator2.f();

                return _context.finish(14);

              case 17:
              case "end":
                return _context.stop();
            }
          }, _callee, null, [[1, 11, 14, 17]]);
        })();
      },

      update(text = "") {
        if (text != "") {
          let node = document.createTextNode("\n" + text);
          this.element.appendChild(node);
          return this;
        }

        return this.generate();
      },

      generate() {
        this.element.innerHTML = "";

        var _iterator3 = _createForOfIteratorHelper(this.map),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            let _step3$value = (0, _slicedToArray2.default)(_step3.value, 2),
                selector = _step3$value[0],
                props = _step3$value[1];

            this.update(CSS.section(selector, props));
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        return this;
      },

      get text() {
        return (this.element.innerText + "").trim();
      }

    };
    const obj = Object.create(null);
    Object.setPrototypeOf(obj, proto);
    Object.assign(obj, {
      element,
      map: new Map()
    });
    return obj;
  }

}

exports.CSS = CSS;
