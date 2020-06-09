import { hydrate, Fragment, createRef, isValidElement, cloneElement, toChildArray } from '../../node_modules/preact/dist/preact.mjs';
import { h, html, render, Component, createContext, useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue } from '../../node_modules/htm/preact/standalone.mjs';

import { Element } from './element.js';
import Util from '../util.js';

const React = { hydrate, Fragment, createRef, isValidElement, cloneElement, toChildArray };

const add = (arr, ...items) => [...(arr || []), ...items];

export class ReactComponent {
  static create(...args) {
    let Tag, props;
    if(typeof args[0] == 'string') {
      Tag = args.shift();
      props = args.shift();
    } else {
      props = args.shift();
      Tag = props.tagName;
      delete props.tagName;
    }
    let children = args.shift();

    const elem = h.create(Tag, restOfProps, children);
    return elem;
  }

  static factory(render_to, root) {
    if(typeof render_to === 'string') render_to = Element.find(render_to);
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

  static append(tag, attr, parent) {
    let { children, ...props } = attr;
    let elem = h(tag, props, children);
    if(parent) {
      const { props } = parent;

      props.children = add(props.children, elem);
      /*
      if(Util.isArray(props.children))  props.children.push(elem);
      else if(props.children) props.children = [props.children, elem];
      else props.children = elem;*/
    }
    return elem;
  }

  static toObject(...args) {
    let ret = [];
    for(let arg of args) {
      if(typeof arg == 'string') {
        ret.push(arg);
        continue;
      }
      if(!typeof arg == 'object' || arg === null || !arg) continue;

      let tagName;

      if(arg.type && arg.type.name) tagName = arg.type.name;
      else if(typeof arg.type == 'function') tagName = arg.type;
      else tagName = arg.type + '';

      let { children, key, innerHTML, ...props } = arg.props || {};

      let obj = { tagName, ...props };
      if(Util.isObject(arg.props) && 'key' in arg.props && key !== undefined) obj.key = key;

      if(!children) children = arg.children;

      let a = toChildArray(children);
      //console.log('a:', a);
      children = a.length > 0 ? this.toObject(...a) : [];
      //console.log('children:', children);
      obj.children = Util.isArray(children) ? children : [children];
      if(innerHTML) obj.children.push(innerHTML);
      ret.push(obj);
    }
    return Util.isArray(ret) && ret.length == 1 ? ret[0] : ret;
  }
  /*
   */
  dummy() {
    x = h(React.Fragment, { id: 'test' }, [h('blah', { className: 'test' }), h('p', { style: { width: '100%' } })]);
  }

  static formats = {
    HTML: 0,
    JSX: 1,
    H: 2
  };

  static stringify(obj, opts = {}) {
    let { fmt = 0 } = opts;
    let s = '';
    if(obj && obj.__ === null && 'key' in obj && 'ref' in obj) obj = this.toObject(obj);
    if(Util.isArray(obj)) {
      for(let item of obj) {
        s += fmt < 2 ? '\n' : s == '' ? '' : `, `;
        s += this.stringify(item);
      }
      return s;
    } else if(typeof obj == 'string') {
      return obj;
    }
    let { tagName, children, ...props } = obj;
    if(props['className']) {
      props['class'] = props['className'];
      delete props['className'];
    }
    for(let prop in props) {
      let value = props[prop];
      if(value === false) continue;
      if(value === true) s += ` ${prop}`;
      else s += fmt == 0 ? ` ${prop}="${value + ''}"` : fmt == 1 ? ` ${prop}={${Util.toString(value)}}` : (s == '' ? '' : `, `) + ` ${prop}: ${Util.toString(value)}`;
    }
    if(typeof tagName == 'function') tagName = tagName === Fragment ? 'React.Fragment' : Util.fnName(tagName);

    //console.log('tagName:', tagName);

    tagName += '';

    s = fmt == 0 ? `<${tagName}${s}` : `h('${tagName}', {${s}`;
    if(!children || !children.length) {
      s += fmt == 0 ? ' />' : ` })`;
    } else {
      s += fmt < 2 ? `>` : ` }, [ `;
      s += '\n  ' + Util.indent(this.stringify(children)).trimRight() + '\n';
      s += fmt < 2 ? `</${tagName}>` : ` ])`;
    }
    return s;
  }
}
