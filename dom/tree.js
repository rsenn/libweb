import Util from './lib/util.js';
/**
 * DOM Tree
 * @param {[type]} root [description]
 */
export function Tree(root) {
  if(this instanceof Tree) {
    root = Object.assign(this, root, { realNode: root });
  }
  if(!(this instanceof Tree)) return tree;
}

Tree.walk = function walk(node, fn, accu = {}) {
  var elem = node;
  const root = elem;
  let depth = 0;
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
