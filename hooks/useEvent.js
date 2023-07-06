import { Component, useEffect } from '../preact.mjs';
import { Event } from '../dom/event.js';

export function EventTracker(names, handler) {
  let element = trkl(null);
  let [add, remove] = Event.subscriber(names, handler);

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
  let track = EventTracker(name, handler);

  return parent(() => {
    track(element);
    return () => track(null);
  });
}
