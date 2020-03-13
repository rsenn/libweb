"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.Tree = Tree;

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

/**
 * DOM Tree
 * @param {[type]} root [description]
 */
function Tree(root) {
  if(this instanceof Tree) {
    root = (0, _assign["default"])(this, root, {
      realNode: root
    });
  }

  if(!(this instanceof Tree)) return tree;
}

Tree.walk = function walk(node, fn) {
  var accu = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var elem = node;
  var root = elem;
  var depth = 0;

  while(elem) {
    accu = fn(elem, accu, root, depth);
    if(elem.firstChild) depth++;

    elem =
      elem.firstChild ||
      elem.nextSibling ||
      (function() {
        do {
          if(!(elem = elem.parentNode)) break;
          depth--;
        } while(depth > 0 && !elem.nextSibling);

        return elem && elem != root ? elem.nextSibling : null;
      })();
  }

  return accu;
};
