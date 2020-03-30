"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CSS = void 0;

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

var _util = _interopRequireDefault(require("../util.es5.js"));

class CSS {
  static list(doc) {
    if(!doc) doc = window.document;

    const getStyleMap = (obj, key) => {
      let rule = _util.default.find(obj, item => item["selectorText"] == key);

      return _util.default.adapter(
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
      let sheet = _util.default.find(obj, entry => entry.href == key || entry.ownerNode.id == key) || obj[key];
      return _util.default.adapter(
        sheet.rules,
        obj => (obj && obj.length !== undefined ? obj.length : 0),
        (obj, i) => obj[i].selectorText,
        getStyleMap
      );
    };

    return _util.default.adapter(
      [...doc.styleSheets],
      obj => obj.length,
      (obj, i) => obj[i].href || obj[i].ownerNode.id || i,
      getStyleSheet
    );
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
    return Element.findAll(selector)
      .filter(e => e.classList.length)
      .map(e => [...e.classList])
      .flat()
      .unique();
  }
}

exports.CSS = CSS;
