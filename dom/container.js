import Util from '../util.js';
import { Element } from './element.js';

export class Container {
  static factory(parent, size = null) {
    let delegate = {
      root: null,
      append_to: function (elem, p = null) {
        if(p == null) {
          if(this.root == null) {
            this.root = document.createElement('div');
            this.append_to(this.root, parent);
          }
          p = this.root;
        }
        p.appendChild(elem);
      }
    };
    return Element.factory(delegate);
  }
}
