import React from "react";
import { Element } from "./element.js";
import Util from "../util.js";

export class ReactComponent {
  static create(Tag, { parent, children, ...props }, is_root = true) {
    const elem = (
      <Tag {...props}>
        {Array.isArray(children)
          ? children.map((child, key) => {
              if(typeof child === "object") {
                const { tagName, ...props } = child;
                return render_factory(tagName, { key, ...props }, false);
              }
              return child;
            })
          : undefined}
      </Tag>
    );
    //console.log('elem: ', elem);
    if(is_root && render_to) render_to(elem, parent || this.root);
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

  static object() {
    let ret = [];
    for(let arg of [...arguments]) {
      if(!typeof arg == "object" || arg === null || !arg) continue;

      const tagName = arg.type && arg.type.name;
      let { children, ...props } = arg.props || {};
      let obj = { tagName, ...props };
      if(typeof arg.key == "string") obj.key = arg.key;
      if(!children) children = arg.children;

      if(React.Children.count(children) > 0) {
        const arr = React.Children.toArray(children);
        obj.children = ReactComponent.object(...arr);
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

      if(typeof value == "function") {
        value = " ()=>{} ";
      } else if(typeof value == "object") {
        value = Util.inspect(value, { indent: "", newline: "\n", depth: 10, spacing: " " });
        value = value.replace(/(,?)(\n?[\s]+|\s+)/g, "$1 ");
      } else if(typeof value == "string") {
        value = `'${value}'`;
      }
      str += ` ${prop}={${value}}`;
    }

    if(!children || !children.length) {
      str += " />";
    } else {
      str += ">";
      str += `</${tagName}>`;
    }
    return str;
  }
}
