import { trkl } from "./trkl.js";

export function ScrollHandler(handler) {
  var start = {};
  var move = {};
  var end = {};
  var index = 0;
  var active = false;
  var starttime = 0;
  var points = [];

  var self = trkl();

  self.handler = handler;

  self.subscribe(event => {
    var type = event.type;

    //console.log("ScrollListener.event ", { type, event });

    return self.handler(event);
  });

  return self;
}

export const ScrollEvents = listener => ({
  onScroll: listener,
  onWheel: listener,
  DOMMouseScroll: listener,
  onKeyDown: listener,
  onTouchMove: listener
});

export const addScrollListeners = (listener, element, passive = false) => {
  if(window.devp) devp.logEntry("addScrollListeners");
  //console.log("adding scroll listeners ", { disabled: listener.disabledfn() });
  element.addEventListener("scroll", listener, { passive });
  element.addEventListener("wheel", listener, { passive });
  element.addEventListener("DOMMouseScroll", listener, { passive });
  element.addEventListener("keydown", listener, { passive });
  element.addEventListener("touchmove", listener, { passive });
  return element;
};

export const removeScrollListeners = (listener, element, passive = false) => {
  if(listener) {
    if(window.devp) devp.logEntry("removeScrollListeners");
    //console.log("removing scroll listeners ", { disabled: listener.disabledfn() });

    element.removeEventListener("scroll", listener, { passive });
    element.removeEventListener("wheel", listener, { passive });
    element.removeEventListener("DOMMouseScroll", listener, { passive });
    element.removeEventListener("keydown", listener, { passive });
    element.removeEventListener("touchmove", listener, { passive });
  }
  return element;
};

export function ScrollListener(handler) {
  /*  var fn = handler;
  if(fn && fn.subscribe === undefined) {
    fn = trkl();
    fn.subscribe(handler);
  }*/
  var listen = ScrollHandler(handler);
  listen.handler.listener = listen;
  listen.handler.events = ScrollEvents(listen);
  return listen.handler;
}

export function ScrollDisabler(disabledfn = () => true, element = global.window) {
  const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
  var listen = ScrollHandler(event => {
    let disabled = disabledfn();

    if(disabled) {
      if(event.keyCode !== undefined && keys.indexOf(event.keyCode) != -1) {
        event.preventDefault();
      } else if(event.type == "wheel" || event.type == "scroll" || event.type == "touchmove" || event.type == "DOMMouseScroll") {
        if(event.cancelable) event.preventDefault();
      }

      //  console.log('ScrollDisabler.event ', { disabled, event });
    }
    return true;
  });
  listen.disabledfn = disabledfn;
  listen.handler.listener = listen;
  if(element) listen.handler.element = addScrollListeners(listen, element);
  else listen.handler.events = ScrollEvents(listen);
  listen.handler.remove = () => removeScrollListeners(listen, element);
  listen.handler.add = () => addScrollListeners(listen, element);
  return listen.handler;
}

export default ScrollListener;
