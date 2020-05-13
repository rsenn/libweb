import { hydrate, Fragment, createRef, isValidElement, cloneElement, toChildArray } from "../../modules/preact/dist/preact.mjs";
import { h, html, render, Component, createContext, useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue } from "../../modules/htm/preact/standalone.mjs";

import { Element } from "./element.js";
import Util from "../util.js";

const React = { hydrate, Fragment, createRef, isValidElement, cloneElement, toChildArray };

export class ReactComponent {
  static create(...args) {
    let Tag, props;
    if(typeof args[0] == "string") {
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
    if(typeof render_to === "string") render_to = Element.find(append_to);
    if(typeof render_to !== "function") {
      root = root || render_to;
      render_to = component => require("react-dom").render(component, root || render_to);
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
      if(!typeof arg == "object" || arg === null || !arg) continue;

      let tagName;

      if(typeof arg.type == "function") tagName = arg.type;
      else tagName = arg.type + "";

      let { children, ...props } = arg.props || {};
      let obj = { tagName, ...props };
      if(typeof arg.key == "string") obj.key = arg.key;
      if(!children) children = arg.children;
      const arr = React.toChildArray(children);

      const numChildren = arr.length;

      /*    if(obj.tagName == 'React.Fragment' && numChildren == 1) {
 obj =  ReactComponent.toObject(arr[0]);
      } else*/ if(numChildren > 0) {
        obj.children = ReactComponent.toObject(...arr);
      }
      ret.push(obj);
    }
    return ret;
  }
  /*
   */
  dummy() {
    x = h(React.Fragment, { id: "test" }, [h("blah", { className: "test" }), h("p", { style: { width: "100%" } })]);
  }

  static stringify(obj, opts = {}) {
    let { fmt } = opts;
    let s = "";
    if(obj.__ === null && "key" in x && "ref" in x) obj = this.toObject(obj);
    if(Util.isArray(obj)) {
      for(let item of obj) {
        s += fmt == 0 ? "" : s == "" ? "" : `, `;
        s += this.stringify(item);
      }
      return s;
    }
    let { tagName, children, ...props } = obj;
    for(let prop in props) {
      let value = Util.toString(props[prop]);
      /*      if(typeof value == "function") {
        value =  "" + value;
      } else if(typeof value == "object") {
        value = Util.inspect(value, {
          indent: "",
          newline: "\n",
          depth: 10,
          spacing: " "
        });
        value = value.replace(/(,?)(\n?[\s]+|\s+)/g, "$1 ");
      } else if(typeof value == "string") {
        value = `'${value}'`;
      }*/
      s += fmt == 0 ? ` ${prop}={${value}}` : (s == "" ? "" : `, `) + ` ${prop}: ${value}`;
    }
    if(typeof tagName == "function") tagName = (tagName === Fragment && "React.Fragment") || Util.fnName(tagName) || tagName + "";

    s = fmt == 0 ? `<${tagName} ${s}` : `h('${tagName}', { ${s}`;
    if(!children || !children.length) {
      s += fmt == 0 ? " />" : ` })`;
    } else {
      s += fmt == 0 ? `>` : ` }, [ `;
      s += this.stringify(children);
      s += fmt == 0 ? `</${tagName}>` : ` ])`;
    }
    return s;
  }
}
