"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.CSS = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _util = _interopRequireDefault(require("../util.es5.js.js"));

var CSS = /*#__PURE__*/function () {
  function CSS() {
    (0, _classCallCheck2["default"])(this, CSS);
  }

  (0, _createClass2["default"])(CSS, null, [{
    key: "list",
    value: function list(doc) {
      if (!doc) doc = window.document;

      var getStyleMap = function getStyleMap(obj, key) {
        var rule = _util["default"].find(obj, function (item) {
          return item["selectorText"] == key;
        });

        return _util["default"].adapter(rule, function (obj) {
          return obj && obj.styleMap && obj.styleMap.size !== undefined ? obj.styleMap.size : 0;
        }, function (obj, i) {
          return (0, _toConsumableArray2["default"])(obj.styleMap.keys())[i];
        }, function (obj, key) {
          return obj.styleMap.getAll(key).map(function (v) {
            return String(v);
          }).join(" ");
        });
      };

      var getStyleSheet = function getStyleSheet(obj, key) {
        var sheet = _util["default"].find(obj, function (entry) {
          return entry.href == key || entry.ownerNode.id == key;
        }) || obj[key];
        return _util["default"].adapter(sheet.rules, function (obj) {
          return obj && obj.length !== undefined ? obj.length : 0;
        }, function (obj, i) {
          return obj[i].selectorText;
        }, getStyleMap);
      };

      return _util["default"].adapter((0, _toConsumableArray2["default"])(doc.styleSheets), function (obj) {
        return obj.length;
      }, function (obj, i) {
        return obj[i].href || obj[i].ownerNode.id || i;
      }, getStyleSheet);
    }
  }, {
    key: "styles",
    value: function styles(stylesheet) {
      var list = stylesheet && stylesheet.cssRules ? [stylesheet] : CSS.list(stylesheet);

      var ret = _util["default"].array();

      list.forEach(function (s) {
        var rules = (0, _toConsumableArray2["default"])(s.cssRules);
        rules.forEach(function (rule) {
          ret.push(rule.cssText);
        });
      });
      return ret;
    }
  }, {
    key: "classes",
    value: function classes() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "*";
      return Element.findAll(selector).filter(function (e) {
        return e.classList.length;
      }).map(function (e) {
        return (0, _toConsumableArray2["default"])(e.classList);
      }).flat().unique();
    }
  }]);
  return CSS;
}();

exports.CSS = CSS;
