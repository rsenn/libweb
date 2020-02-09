import Util from "./util.js";

export class ScrollController {
  static keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];

  static preventDefault(e) {
    e = e || this.element.event;
    e.returnValue = false;

    //console.log('preventDefault ', Util.className(e));
    if(e.preventDefault) e.preventDefault();
  }

  static preventDefaultForScrollKeys(e) {
    if(ScrollController.keys[e.keyCode]) {
      ScrollController.preventDefault(e);
      return false;
    }
    return true;
  }

  constructor(element) {
    this.element = element || global.window;
    this.disabled = false;

    this.disable = this.disable.bind(this);
    this.enable = this.enable.bind(this);
    this.set = this.set.bind(this);
  }

  disable() {
    if(this.element.addEventListener) {
      //older FF
      this.element.addEventListener("DOMMouseScroll", this.constructor.preventDefault, false);
    }
    ["wheel", "mousemove", /*'touchstart','touchcancel','touchend',*/ "touchmove"].forEach(name => this.element.addEventListener(name, this.constructor.preventDefault, { passive: false }));
    this.element.addEventListener("keydown", this.constructor.preventDefaultForScrollKeys, {
      passive: true
    });
    this.element.document.onkeydown = this.constructor.preventDefaultForScrollKeys;
    console.log("Scrolling disabled");
    this.disabled = true;
  }

  enable() {
    if(this.element.removeEventListener) {
      this.element.removeEventListener("DOMMouseScroll", this.constructor.preventDefault, false);
    }
    ["wheel", "mousemove", /*'touchstart','touchcancel','touchend',*/ "touchmove"].forEach(name => removeEventListener(name, this.constructor.preventDefault, { passive: false }));
    this.element.removeEventListener("keydown", this.constructor.preventDefaultForScrollKeys);
    this.element.document.onkeydown = null;
    console.log("Scrolling enabled");

    this.disabled = false;
  }

  set(enable) {
    const enabled = !this.disabled;
    if(enable == enabled) return;
    return enable ? this.enable() : this.disable();
  }
}

export default ScrollController;
