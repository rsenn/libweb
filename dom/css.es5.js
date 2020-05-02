"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CSS = void 0;

require("core-js/modules/es6.map");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

var _util = _interopRequireDefault(require("../util.es5.js"));

var _element = require("./element.es5.js");

class CSS {
  static list(doc) {
    if (!doc) doc = window.document;

    const getStyleMap = (obj, key) => {
      let rule = _util.default.find(obj, item => item['selectorText'] == key);

      return _util.default.adapter(rule, obj => obj && obj.styleMap && obj.styleMap.size !== undefined ? obj.styleMap.size : 0, (obj, i) => [...obj.styleMap.keys()][i], (obj, key) => obj.styleMap.getAll(key).map(v => String(v)).join(' '));
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

  static classes(selector = '*') {
    return _element.Element.findAll(selector).filter(e => e.classList.length).map(e => [...e.classList]).flat().unique();
  }

  static section(selector, props) {
    let s = "".concat(selector, " {\n");
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = props[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let _step$value = (0, _slicedToArray2.default)(_step.value, 2),
            name = _step$value[0],
            value = _step$value[1];

        s += "  ".concat(_util.default.decamelize(name), ": ").concat(value, ";\n");
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    s += "}\n";
    return s;
  }

  static create(parent = 'head') {
    parent = typeof parent == 'string' ? _element.Element.find(parent) : parent;

    const element = _element.Element.create('style', {}, parent);

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
        return 'toObject' in props ? props.toObject() : props;
      },

      keys() {
        return this.map.keys();
      },

      entries() {
        var _this = this;

        return _regenerator.default.mark(function _callee() {
          var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _step2$value, selector, props;

          return _regenerator.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context.prev = 3;
                _iterator2 = _this.map.entries()[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context.next = 12;
                  break;
                }

                _step2$value = (0, _slicedToArray2.default)(_step2.value, 2), selector = _step2$value[0], props = _step2$value[1];
                _context.next = 9;
                return [selector, props.toObject()];

              case 9:
                _iteratorNormalCompletion2 = true;
                _context.next = 5;
                break;

              case 12:
                _context.next = 18;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](3);
                _didIteratorError2 = true;
                _iteratorError2 = _context.t0;

              case 18:
                _context.prev = 18;
                _context.prev = 19;

                if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                  _iterator2.return();
                }

              case 21:
                _context.prev = 21;

                if (!_didIteratorError2) {
                  _context.next = 24;
                  break;
                }

                throw _iteratorError2;

              case 24:
                return _context.finish(21);

              case 25:
                return _context.finish(18);

              case 26:
              case "end":
                return _context.stop();
            }
          }, _callee, null, [[3, 14, 18, 26], [19,, 21, 25]]);
        })();
      },

      update(text = '') {
        if (text != '') {
          let node = document.createTextNode('\n' + text);
          this.element.appendChild(node);
          return this;
        }

        return this.generate();
      },

      generate() {
        this.element.innerHTML = '';
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.map[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            let _step3$value = (0, _slicedToArray2.default)(_step3.value, 2),
                selector = _step3$value[0],
                props = _step3$value[1];

            this.update(CSS.section(selector, props));
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return this;
      },

      get text() {
        return (this.element.innerText + '').trim();
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
