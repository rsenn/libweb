import { Componentm useEffect } from '../dom/preactComponent.js';

export function eventSubscriber(names, handler) {
  if(typeof names == 'string') names = [names];
  let func = action => element => names.forEach(name => element[action + 'EventListener'](name, handler));
  return ['add', 'remove'].map(func);
}

export function useEvent(...args) {
  let index = args.findIndex(it => typeof it == 'function');

  let element = index == 2 ? args.shift() : window;
  let [name, handler, parent = useEffect] = args;
  let [add, remove] = eventSubscriber(name, handler);

  return parent(() => {
    add(element);
    return () => remove(element);
  });
}
