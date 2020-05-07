import Util from "../util.js";
import { Element } from "./element.js";

export class CSS {
  static list(doc) {
    if(!doc) doc = window.document;

    const getStyleMap = (obj, key) => {
      let rule = Util.find(obj, item => item["selectorText"] == key);
      return Util.adapter(
        rule,
        obj => (obj && obj.styleMap && obj.styleMap.size !== undefined ? obj.styleMap.size : 0),
        (obj, i) => [...obj.styleMap.keys()][i],
        (obj, key) =>
          obj.styleMap
            .getAll(key)
            .map(v => String(v))
            .join(" ")
      );
    };
    const getStyleSheet = (obj, key) => {
      let sheet =
        Util.find(obj, entry => entry.href == key || entry.ownerNode.id == key) || obj[key];

      return Util.adapter(
        sheet.rules,
        obj => (obj && obj.length !== undefined ? obj.length : 0),
        (obj, i) => obj[i].selectorText,
        getStyleMap
      );
    };
    return Util.adapter(
      [...doc.styleSheets],
      obj => obj.length,
      (obj, i) => obj[i].href || obj[i].ownerNode.id || i,
      getStyleSheet
    );
  }
  static styles(stylesheet) {
    const list = stylesheet && stylesheet.cssRules ? [stylesheet] : CSS.list(stylesheet);
    let ret = [];

    list.forEach(s => [...(s.cssRules||s.rules)].forEach(rule => {
        ret.push(rule.cssText);
          }));
    return ret;
  }

  static classes(selector = "*") {
    return Util.unique([...Element.findAll(selector)]
      .filter(e => e.classList.length)
      .map(e => [...e.classList])
      .flat());
  }

  static section(selector, props) {
    let s = `${selector} {\n`;
    for(let [name, value] of props) {
      s += `  ${Util.decamelize(name)}: ${value};\n`;
    }
    s += `}\n`;
    return s;
  }

  static create(parent = "head") {
    parent = typeof parent == "string" ? Element.find(parent) : parent;
    const element = Element.create("style", {}, parent);
    const proto = {
      element: null,
      map: null,
      set(selector, props) {
        const exists = this.map.has(selector);
        this.map.set(selector, Util.toMap(props));
        return this.update(exists);
      },
      get(selector) {
        const props = this.map.get(selector);
        return "toObject" in props ? props.toObject() : props;
      },
      keys() {
        return this.map.keys();
      },
      *entries() {
        for(let [selector, props] of this.map.entries()) yield [selector, props.toObject()];
      },
      update(text = "") {
        if(text != "") {
          let node = document.createTextNode("\n" + text);
          this.element.appendChild(node);
          return this;
        }
        return this.generate();
      },
      generate() {
        this.element.innerHTML = "";
        for(let [selector, props] of this.map) this.update(CSS.section(selector, props));
        return this;
      },
      get text() {
        return (this.element.innerText + "").trim();
      }
    };

    const obj = Object.create(null);
    Object.setPrototypeOf(obj, proto);
    Object.assign(obj, { element, map: new Map() });
    return obj;
  }
}
