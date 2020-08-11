//import { hydrate, Fragment, createRef, isValidElement, cloneElement, toChildArray } from '../../node_modules/preact/dist/preact.mjs';
import { h, html, render, Component, createContext, useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue } from '../../node_modules/htm/preact/standalone.mjs';
export { h, html, render, Component, createContext, useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue } from '../../node_modules/htm/preact/standalone.mjs';

import { Fragment } from '../preact.js';
export { Fragment } from '../preact.js';

import { Element } from './element.js';

export const React = { create: h, html, render, Component, Fragment, createContext, useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue };

import Util from '../util.js';

const add = (arr, ...items) => [...(Util.isArray(arr) ? arr : arr ? [arr] : []), ...items];

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
    }[Util.typeOf(dest)];

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
    return Util.isObject(obj) && ['__', '__v', 'ref', 'props', 'key'].every(prop => obj[prop] !== 'undefined');
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
    console.log('PreactComponent.append', ...args);
    let tag, elem, parent, attr;
    if(args.length == 2 && ReactComponent.isComponent(args[0])) {
      [elem, parent] = args;
    } else {
      [tag, attr, parent] = args.splice(0, 3);
      let { children, ...props } = attr;
      if(Util.isArray(parent)) {
        children = add(children, ...parent);
        parent = args[0];
      }
      elem = h(tag, props, children);
    }
    if(parent) {
      console.log('PreactComponent.append parent:', parent);
      const { props } = parent;
      props.children = add(props.children, elem);
    }
    //      console.log('PreactComponent.append', {tag, props, children,parent });
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

      let a = this.toChildArray(children);
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
  /*  dummy() {
    x = h(React.Fragment, { id: 'test' }, [h('blah', { className: 'test' }), h('p', { style: { width: '100%' } })]);
  }*/

  static formats = {
    HTML: 0,
    JSX: 1,
    H: 2
  };

  static toChildArray(a) {
    return Util.isArray(a) ? a : a ? [a] : [];
  }

  static toSource(obj, opts = {}, depth = 0) {
    const { quote = "'" } = opts;
    const {
      type,
      props: { children, ...props }
    } = obj;
    let o = `h('${type}', {`;
    let nl = '\n' + ' '.repeat(depth * 2);
    let p = Object.entries(props)
      .map(([name, value]) => `${nl}  ${name}: ${Util.toSource(value, { quote })}`)
      .join(',');
    if(p != '') o += ` ${p}${nl}`;
    o += `}`;
    let s = ReactComponent.toSource;
    let c = Util.isArray(children) ? `[${children.map(obj => nl + '  ' + s(obj, opts, depth + 1)).join(',')}]` : children ? '  ' + s(children, opts, depth + 1) : '';
    if(c != '') o += `,${nl}${c}`;
    o += (c != '' ? nl : '') + ')';
    return o;
  }

  static toString(obj, opts = {}) {
    let { fmt = 0 } = opts;
    let s = '';
    if(Util.isObject(obj) && '__' in obj && 'key' in obj && 'ref' in obj) obj = this.toObject(obj);
    if(Util.isArray(obj)) {
      for(let item of obj) {
        s += fmt < 2 ? '\n' : s == '' ? '' : `, `;
        s += this.toString(item);
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
      s += '\n  ' + Util.indent(this.toString(children)).trimRight() + '\n';
      s += fmt < 2 ? `</${tagName}>` : ` ])`;
    }
    return s;
  }

  static async parse(jsx) {
    let ecmascript = await import('../ecmascript.js');
    Object.assign(Util.getGlobalObject(), ecmascript);
    let parser = new ecmascript.ECMAScriptParser(jsx);
    let printer = new ecmascript.Printer();
    //console.log("parser", Util.getMethodNames(parser, 2, 1));
    let ast = parser.parseJSX();
    return printer.printNode(ast instanceof Array ? ast[0] : ast);
  }
}
