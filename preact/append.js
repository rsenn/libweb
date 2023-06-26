
import { isComponent } from './is-component.js';

  export function append(...args) {
    //console.log('PreactComponent.append', ...args.reduce((acc, a) => [...acc, '\n', a], []));
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
      //console.log('PreactComponent.append\nparent:', parent, '\nelement:', elem);
      const { props } = parent;
      props.children = add(props.children, elem);
    }
    //      console.log('PreactComponent.append', {tag, props, children,parent });
    return elem;
  }
