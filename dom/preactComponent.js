import { className, functionName } from '../misc.js';
import { Component, createContext, h, html, options, render, useCallback, useContext, useDebugValue, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useReducer, useRef, useState } from '../preact.mjs';
import { forwardRef } from '../preact/forwardRef.js';
import { Element } from './element.js';

export { forwardRef } from '../preact/forwardRef.js';

export {
  h,
  options,
  html,
  render,
  Component,
  createContext,
  createRef,
  useState,
  useReducer,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  useContext,
  useDebugValue,
  cloneElement
} from '../preact.mjs';

export const Fragment = props => props.children;

export const React = {
  create: h,
  options,
  html,
  render,
  Component,
  Fragment,
  createContext,
  useState,
  useReducer,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  useContext,
  useDebugValue,
  forwardRef
};
export default React;

function indent(text, space = '  ') {
  text = text.trim();
  if(!/\n/.test(text)) return text;
  return text.replace(/(\n)/g, '\n' + space) + '\n';
}

const add = (arr, ...items) => [...ReactComponent.toChildArray(arr), ...items];

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
    if(children)
      children = children.map(c => {
        console.log('child:', c, ReactComponent.isComponent(c));
        if(!ReactComponent.isComponent(c)) c = ReactComponent.create(...c);
        return c;
      });
    console.log('children:', children);

    const elem = h(Tag, props, children);
    return elem;
  }

  static flatten(obj, dest = new Map(), path = [], pathFn = '.') {
    if(typeof pathFn == 'string') {
      const sep = pathFn;
      pathFn = p => p.join(sep);
    }

    const insert = {
      Array: (p, v) => dest.push([p, v]),
      Map: (p, v) => dest.set(pathFn(p), v),
      Object: (p, v) => (dest[pathFn(p)] = v)
    }[className(dest)];

    flatten(obj, path);

    function flatten(obj, path) {
      insert(path, obj);
      if(obj.props) {
        let children = ReactComponent.toChildArray(obj.props.children).map((child, i) => [child, [...path, 'props', 'children', i++]]);
        children.forEach(args => flatten(...args));
      }
    }

    return dest;
  }

  static isComponent(obj) {
    return typeof obj == 'object' && obj != null && ['__', '__v', 'ref', 'props', 'key'].every(prop => obj[prop] !== undefined);
  }

  static factory(render_to, root) {
    if(typeof render_to === 'string') render_to = Element.find(render_to);
    if(typeof render_to !== 'function') {
      root = root || render_to;
      render_to = component => require('react-dom').render(component, root || render_to);
    }
    let ret = function(...args) {
      let ret = ReactComponent.create(...args);
      return ret;
    };
    ret.root = root;
    return ret.bind(ret);
  }

  static append(...args) {
    //console.log('PreactComponent.append', ...args.reduce((acc, a) => [...acc, '\n', a], []));
    let tag, elem, parent, attr;
    if(args.length == 2 && ReactComponent.isComponent(args[0])) {
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

  static fromObject(obj) {
    const { tagName, attributes = {}, children = [] } = obj;

    let component = h(
      tagName,
      attributes,
      children.map(child => (typeof child == 'object' ? ReactComponent.fromObject(child) : child + ''))
    );

    return component;
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
      if(typeof arg.props == 'object' && arg.props != null && 'key' in arg.props && key !== undefined) obj.key = key;

      if(!children) children = arg.children;

      let a = this.toChildArray(children);
      //console.log('a:', a);
      children = a.length > 0 ? this.toObject(...a) : [];
      //console.log('children:', children);
      obj.children = Array.isArray(children) ? children : [children];
      if(innerHTML) obj.children.push(innerHTML);
      ret.push(obj);
    }
    return Array.isArray(ret) && ret.length == 1 ? ret[0] : ret;
  }

  /*
   */
  /*  dummy() {
    x = h(React.Fragment, { id: 'test' }, [h('blah', { className: 'test' }), h('p', { style: { width: '100%' } })]);
  }*/

  static formats = {
    HTML: 0,
    JSX: 1,
    H: 2
  };

  static toChildArray(a) {
    return Array.isArray(a) ? a : a ? [a] : [];
  }

  static toSource(obj, opts = {}, depth = 0) {
    const { quote = "'" } = opts;
    const { type, props: allProps } = obj;
    console.log('allProps:', allProps);
    let { children, ...props } = allProps || {};

    let o = `h('${type}', {`;
    let nl = '\n' + ' '.repeat(depth * 2);
    let p = Object.entries(props)
      .map(([name, value]) => {
        if(/-/.test(name)) name = `'${name}'`;
        return `${nl}  ${name}: ${this.toSource(value, { quote })}`;
      })
      .join(',');
    if(p != '') o += ` ${p}${nl}`;
    o += `}`;
    let s = ReactComponent.toSource;
    let c = Array.isArray(children) ? `[${children.map(obj => nl + '  ' + s(obj, opts, depth + 1)).join(',')}]` : children ? '  ' + s(children, opts, depth + 1) : '';
    if(c != '') o += `,${nl}${c}`;
    o += (c != '' ? nl : '') + ')';
    return o;
  }

  static toString(obj, opts = {}) {
    let { fmt = 0 } = opts;
    let s = '';
    if(typeof obj == 'object' && obj != null && '__' in obj && 'key' in obj && 'ref' in obj) obj = this.toObject(obj);
    if(Array.isArray(obj)) {
      for(let item of obj) {
        s += fmt < 2 ? '\n' : s == '' ? '' : `, `;
        s += this.toString(item);
      }
      return s;
    } else if(typeof obj == 'string') {
      return obj;
    }
    let { tagName, children, ...props } = obj;
    if(props.className) {
      props.class = props.className;
      delete props.className;
    }
    for(let prop in props) {
      let value = props[prop];
      if(value === false) continue;
      if(value === true) s += ` ${prop}`;
      else s += fmt == 0 ? ` ${prop}="${value + ''}"` : fmt == 1 ? ` ${prop}={${inspect(value)}}` : (s == '' ? '' : `, `) + ` ${prop}: ${inspect(value)}`;
    }
    if(typeof tagName == 'function') tagName = tagName === Fragment ? 'React.Fragment' : functionName(tagName);

    //console.log('tagName:', tagName);

    tagName += '';

    s = fmt == 0 ? `<${tagName}${s}` : `h('${tagName}', {${s}`;
    if(!children || !children.length) {
      s += fmt == 0 ? ' />' : ` })`;
    } else {
      s += fmt < 2 ? `>` : ` }, [ `;
      s += '\n  ' + indent(this.toString(children)).trimRight() + '\n';
      s += fmt < 2 ? `</${tagName}>` : ` ])`;
    }
    return s;
  }
}

/** Redirect rendering of descendants into the given CSS selector.
 *  @example
 *    <Portal into="body">
 *      <div>I am rendered into document.body</div>
 *    </Portal>
 */
export class Portal extends Component {
  componentDidUpdate(props) {
    for(let i in props) {
      if(props[i] !== this.props[i]) {
        return setTimeout(this.renderLayer);
      }
    }
  }

  componentDidMount() {
    this.isMounted = true;
    this.renderLayer = this.renderLayer.bind(this);
    this.renderLayer();
  }

  componentWillUnmount() {
    this.renderLayer(false);
    this.isMounted = false;
    if(this.remote && this.remote.parentNode) this.remote.parentNode.removeChild(this.remote);
  }

  findNode(node) {
    return typeof node === 'string' ? document.querySelector(node) : node;
  }

  renderLayer(show = true) {
    if(!this.isMounted) return;

    // clean up old node if moving bases:
    if(this.props.into !== this.intoPointer) {
      this.intoPointer = this.props.into;
      if(this.into && this.remote) {
        this.remote = render(h(PortalProxy), this.into, this.remote);
      }
      this.into = this.findNode(this.props.into);
    }

    this.remote = render((h(PortalProxy, { context: this.context }), (show && this.props.children) || null), this.into, this.remote);
  }

  render() {
    return null;
  }
}

// high-order component that renders its first child if it exists.
// used as a conditional rendering proxy.
class PortalProxy extends Component {
  getChildContext() {
    return this.props.context;
  }
  render({ children }) {
    return (children && children[0]) || null;
  }
}

export const toChildArray = ReactComponent.toChildArray;
export const isComponent = ReactComponent.isComponent;