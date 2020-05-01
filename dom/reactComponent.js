import React from 'react';
import { Element } from './element.js';
import Util from '../util.js';

export class ReactComponent {
  static create() {
    let args = [...arguments];
    let Tag, props;
    if(typeof args[0] == 'string') {
      Tag = args.shift();
      props = args.shift();
    } else {
      props = args.shift();
      Tag = props.tagName;
      delete props.tagName;
    }
    let { children, parent, ...restOfProps } = props;
    if(!children) children = args.shift();
    if(!Array.isArray(children)) children = [children];
    const elem = (<Tag {...restOfProps}>
        {children.map((child, key) => {
          if(typeof child === 'object' && child.tagName !== undefined) {
            const { tagName, ...props } = child;
            return ReactComponent.create(tagName, { key, ...props });
          }
          return child;
        })}
      </Tag>
    );
    return elem;
  }

  static factory(render_to, root) {
    if(typeof render_to === 'string') render_to = Element.find(append_to);
    if(typeof render_to !== 'function') {
      root = root || render_to;
      render_to = component => require('react-dom').render(component, root || render_to);
    }
    let ret = function() {
      let args = [...arguments];
      let ret = ReactComponent.create.apply(ReactComponent, args);
      return ret;
    };
    ret.root = root;
    return ret.bind(ret);
  }

  static toObject() {
    let ret = [];
    for(let arg of [...arguments]) {
      if(!typeof arg == 'object' || arg === null || !arg) continue;

      const tagName = typeof arg.type == 'string' ? arg.type : typeof arg.type == 'function' ? arg.type.name : 'React.Fragment';
      let { children, ...props } = arg.props || {};
      let obj = { tagName, ...props };
      if(typeof arg.key == 'string') obj.key = arg.key;
      if(!children) children = arg.children;
      const arr = React.Children.toArray(children);

      const numChildren = React.Children.count(children);

      /*    if(obj.tagName == 'React.Fragment' && numChildren == 1) {
 obj =  ReactComponent.toObject(arr[0]);
      } else*/ if(numChildren > 0) {
        obj.children = ReactComponent.toObject(...arr);
      }
      ret.push(obj);
    }
    return ret;
  }

  static stringify(obj) {
    const { tagName, children, ...props } = obj;
    var str = `<${tagName}`;
    for(let prop in props) {
      let value = props[prop];

      if(typeof value == 'function') {
        value = ' ()=>{} ';
      } else if(typeof value == 'object') {
        value = Util.inspect(value, {
          indent: '',
          newline: '\n',
          depth: 10,
          spacing: ' '
        });
        value = value.replace(/(,?)(\n?[\s]+|\s+)/g, '$1 ');
      } else if(typeof value == 'string') {
        value = `'${value}'`;
      }
      str += ` ${prop}={${value}}`;
    }

    if(!children || !children.length) {
      str += ' />';
    } else {
      str += '>';
      str += `</${tagName}>`;
    }
    return str;
  }
}
