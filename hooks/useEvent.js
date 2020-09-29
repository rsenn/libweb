import { Component, useEffect } from '../dom/preactComponent.js';

export function eventSubscriber(names, handler) {
  if(typeof names == 'string') names = [names];
  let func = action => element => names.forEach(name => element[action + 'EventListener'](name, handler));
  return ['add', 'remove'].map(func);
}

export function eventTracker(names, handler) {
  let element = trkl(null);
  let [add, remove] = eventSubscriber(names, handler);

  element.subscribe((newValue, oldValue) => {
    if(oldValue) remove(oldValue);
    if(newValue) add(newValue);
  });
  return element;
}

export function useEvent(...args) {
  let index = args.findIndex(it => typeof it == 'function');

  let element = index == 2 ? args.shift() : window;
  let [name, handler, parent = useEffect] = args;
  let track = eventTracker(name, handler);

  return parent(() => {
    track(element);
    return () => track(null);
  });
}
