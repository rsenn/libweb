import { h } from '../preact.js';
import { toChildArray } from '../preact.js';
import { isComponent } from './is-component.js';

const add = (arr, ...items) => [...toChildArray(arr), ...items];

export function append(...args) {
  let tag, elem, parent, attr;
  if(args.length == 2 && isComponent(args[0])) {
    [elem, parent] = args;
  } else {
    [tag, attr, parent] = args.splice(0, 3);
    let { children, ...props } = attr;
    if(Array.isArray(parent)) {
      children = add(children, ...parent);
      parent = args[0];
    }
    elem = h(tag, props, children);
  }
  if(parent) {
    const { props } = parent;
    props.children = add(props.children, elem);
  }
  return elem;
}