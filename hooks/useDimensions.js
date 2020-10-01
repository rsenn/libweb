import { Component, useCallback, useLayoutEffect, useMemo, useState } from '../dom/preactComponent.js';
import { Event } from '../dom/event.js';

function getDimensionObject(element) {
  if(typeof element == 'object' && element != null && element.base) element = element.base;
  //  console.log('getDimensionObject', element);

  let rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: 'x' in rect ? rect.x : rect.top,
    left: 'y' in rect ? rect.y : rect.left,
    x: 'x' in rect ? rect.x : rect.left,
    y: 'y' in rect ? rect.y : rect.top,
    right: rect.right,
    bottom: rect.bottom
  };
}

export function useDimensions(arg = {}) {
  if(typeof arg == 'function') arg = arg();

  let liveRef = arg._ref$liveMeasure;
  let _ref$liveMeasure = liveRef === undefined ? true : liveRef;
  const [dimensions, setDimensions] = useState({});
  const [node, setNode] = useState(null);

  let ref = useCallback(node => setNode(node), []);
  const [add, remove] = useMemo(() => Event.subscriber(['resize', 'scroll'], measure));

  useLayoutEffect(() => {
    if(node) {
      measure();
      if(_ref$liveMeasure) {
        add(window);

        return () => remove(window);
      }
    }
  }, [node]);

  function measure() {
    return window.requestAnimationFrame(() => setDimensions(getDimensionObject(node)));
  }
  return [ref, dimensions, node];
}
