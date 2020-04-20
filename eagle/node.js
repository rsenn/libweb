import { EaglePath, EagleRef, EagleReference } from "./locator.js";
//import {  makeEagleElement } from "./element.js";
import Util from "../util.js";
import deep from "../deep.js";
import { lazyMembers, lazyMap } from "../lazyInitializer.js";
import { text, inspect, EagleInterface } from "./common.js";
//import { EagleNodeList } from "./nodeList.js";
import { makeEagleNodeMap } from "./nodeMap.js";

export const makeEagleNode = (owner, ref, ctor) => {
  /// console.log(`makeEagleNode(`,owner,', ',ref,', ',ctor,`)`);
  let e = new ctor(owner, ref);
  return e;
};

export class EagleNode extends EagleInterface {
  ref = null;

  constructor(owner, ref) {
    super(owner);
    /*  if(d !== null && d.ref !== undefined && d.ref.root)
      d = d.ref.root;
*/
    ref = ref instanceof EagleReference ? ref : EagleRef(owner.ref.root, ref);
    //let root = 'ref' in d ? d.ref.root : 'root' in d ? d.root : d;
    Util.define(this, "ref", ref);
  }

  get path() {
    return this.ref.path;
  }
  get root() {
    let root = this.ref.root;
    /*
       while(root.ref !== undefined && root.ref.root)
         root = root.ref.root;*/

    return root;
  }

  get document() {
    let doc = this.owner;

    while(doc.owner !== undefined && doc.xml === undefined) doc = doc.owner;

    return doc;
  }

  get chain() {
    let doc = this.owner;
    let ret = [];

    while(doc !== undefined) {
      ret.push(doc);
      doc = doc.owner;
    }

    return ret;
  }

  getDocument() {
    let l = this.path.clone();
    let d = this.owner;

    if(!(d instanceof EagleDocument) && this.path.length) {
      while(!(d instanceof EagleDocument)) d = d[l.shift()];
    }

    return d;
  }

  get project() {
    if(Util.className(this.owner) == "EagleProject") return this.owner;
    return this.document.owner;
  }

  get node() {
    //  let root = this.root !== null && this.root.ref !== undefined && this.root.ref.root || this.root;
    let node = this.path.apply(this.root.raw);

    return node;
  }

  get raw() {
    return this.ref.dereference();
    let ret = {};

    if(this.xml && this.xml[0]) {
      ret = this.xml[0];
    } else {
      ret.tagName = this.tagName;
      if(this.attributes) ret.attributes = Util.map(this.attributes, (k, v) => [k, this.handlers[k]()]);
      if(this.context) ret.text = this.text;
      let children = [];
      if(this.children && "map" in this.children) children = this.children.map(child => child.raw || child.text).filter(child => child !== undefined);
      /* if(children.length > 0) */ ret.children = children;
    } /*else {
      throw new Error("Cannot get raw");
    }*/

    return ret;
  }

  cacheFields() {
    switch (this.tagName) {
      case "schematic":
        return ["settings", "layers", "libraries", "classes", "parts", "sheets"];
      case "sheet":
        return ["busses", "nets", "instances"];
      case "deviceset":
        return ["gates", "devices"];
      case "device":
        return ["connects", "technologies"];
      case "library":
        return ["packages", "symbols", "devicesets"];
    }
  }

  get childConstructor() {
    let protos = Util.getPrototypeChain(this);
    if(Util.fnName(protos[0].constructor) == "EagleDocument") protos.shift();
    let ctor = protos[0].constructor;
    console.log("ctor:", ctor);
    return ctor;
  }

  initCache(ctor = this.childConstructor) {
    let fields = this.cacheFields();
    //console.log(`initCache(${Util.fnName(ctor)}) this:`, Util.className(this));

    if(fields) {
      Util.define(this, "cache", {});
      Util.define(this, "lists", {});

      let lazy = {};
      let lists = {};
      let maps = {};
      let ref = this.ref;

      for(let [value, path] of deep.iterate(ref.dereference(), v => v && fields.indexOf(v.tagName) != -1)) {
        const key = value.tagName;
        // console.log(`cache list ${key}:`, path);

        lazy[key] = () => makeEagleNode(this, ref.down(...path), ctor);

        lists[key] = () => lazy[key]().children;

        if(key == 'sheets')
   maps[key] = lists[key];
 else
        maps[key] = () => makeEagleNodeMap(lazy[key]().children, key == 'instances' ? 'part' : key == "layers" ? "number" : "name");
      }
      lazyMembers(this.lists, lists);
      lazyMembers(this.cache, lazy);
      lazyMembers(this, maps);
    }
  }

  appendChild(node, attributes = {}) {
    if(typeof node == "string") {
      node = {
        tagName: node,
        children: []
      };
    }
    node.attributes = attributes;
    this.ref
      .down("children")
      .dereference()
      .push(node);
    return this.lastChild;
  }

  replace(node) {
    this.ref.replace(node);
  }

  get(name, pred, attr = "name", transform = (o, l) => makeEagleElement(this, l)) {
    //  if(this.cache[name]) return this.cache[name];
    let i = name == "library" ? "libraries" : name + "s";
    let p = this[i];
    let children = p; //||this.document[i].children);
    if(typeof attr != "function") {
      const attrName = "" + attr;
      attr = e => e.attributes[attrName];
    }
    if(typeof pred != "function") {
      let value = pred;
      pred = e => attr(e) === "" + value;
    }
    if(p && children) for(let j = 0; j < children.length; j++) if (pred(children[j])) return transform(this, ["children", j]);
  }

  *getAll(name, transform) {
    transform =
      transform ||
      function() {
        return [...arguments];
      };

    for(let [v, p, o] of deep.iterate(this.ref.dereference(), e => e.tagName === name)) yield transform(v, p, o);

    //     name = name == "library" ? "libraries" : name + "s";
    /* let a = this.cache[name + "s"];

    if(a !== undefined) {
      //   return EagleNodeList(a.ref, 'children');

      for(let e of a.children) yield transform(e, e.name);

      return;
    }*/

    //for(let [v, l, p] in this.findAll(e => e.tagName === name)) yield transform(v, l, p);
  }

  getMap(entity) {
    let a = this.cache[entity + "s"];
    if(a && a.children) return new Map([...a.children].map(e => [e.name, e]));
    return null;
  }

  getByName(element, name, attr = "name", t = ([v, l, d]) => makeEagleNode(d, this.ref.down(...l), this.childConstructor)) {
    /*if(this.cache[element+'s']) {
  console.log(`this.cache[${element+'s'}]:`,this.cache[element+'s']);

  for(let i = 0; i < this.cache[element+'s'].length; i++)  {
    const obj = this.cache[element+'s'][i];
    if(obj[attr] == name)
      return obj;
  }

}*/

    for(let [v, l, d] of this.iterator([], it => it)) {
      if(typeof v == "object" && "tagName" in v && "attributes" in v && attr in v.attributes) {
        if(v.tagName == element && v.attributes[attr] == name) return t([v, l, d]);
      }
    }
    return null;
  }

  get names() {
    let names = [];
    let ref = this.ref;
    do {
      let node = ref.dereference();
      if(node.attributes.name !== undefined) names.push([node.tagName, node.attributes.name]);
      ref = ref.up(2);
    } while(ref.path.length);
    return Object.fromEntries(names);
  }

  get nextSibling() {
    const ref = this.ref.nextSibling;
    return ref ? new EagleElement(this, ref) : null;
  }

  get prevSibling() {
    const ref = this.ref.prevSibling;
    return ref ? new EagleElement(this, ref) : null;
  }

  get parentNode() {
    const ref = this.ref.up(2);
    return ref ? new EagleElement(this, ref) : null;
  }

  get firstChild() {
    const ref = this.ref.firstChild;
    return ref ? new EagleElement(this, ref) : null;
  }

  get lastChild() {
    const ref = this.ref.lastChild;
    return ref ? new EagleElement(this, ref) : null;
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    let attrs = "";
    if(this.attributes) for(let attr in this.attributes) attrs += ` ${text(attr, 1, 33)}${text(":", 1, 36)}${text(`'${this.attributes[attr]}'`, 1, 32)}`;
    let numChildren = this.raw.children && this.raw.children.length;
    if(numChildren == 0) attrs += " /";
    let ret = `${Util.className(this)}`;

    if(this.tagName || attrs != "") ret += ` <${this.tagName + attrs}>`;

    if(this.filename) ret += ` filename="${this.filename}"`;
    if(numChildren > 0) {
      ret += `{...${numChildren} children...}</${this.tagName}>`;
    }
    return ret;
  }
  inspect() {
    return EagleNode.prototype[Symbol.for("nodejs.util.inspect.custom")].apply(this, arguments);
  }
}
