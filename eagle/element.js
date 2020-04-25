import Util from "../util.js";
import trkl from "../trkl.js";
import { EagleNode } from "./node.js";
import { makeEagleNodeList } from "./nodeList.js";
import { toXML, inspect, dump } from "./common.js";

export class EagleElement extends EagleNode {
  tagName = "";
  attributes = {};
  children = [];

  constructor(d, l, o) {
    super(d, l);
    Object.defineProperty(this, "handlers", { value: {}, enumerable: false });
    let owner = this.owner;
    let path = this.ref.path.clone();
    if(owner === null) throw new Error("owner == null");
    if(
      o === undefined ||
      (o.tagName === undefined && o.attributes === undefined && o.children === undefined)
    ) {
      try {
        o = this.ref.dereference();
      } catch(error) {}
    }

    if(o === null || typeof o != "object")
      throw new Error(
        "ref: " + this.ref.inspect() + " entity: " + EagleNode.prototype.inspect.call(this)
      );

    let { tagName, attributes, children } = o;
    this.tagName = tagName;
    this.attributes = {};

    if(!Util.isEmpty(attributes)) {
      for(let key in attributes) {
        let prop = trkl.property(this.attributes, key);
        let handler = Util.ifThenElse(
          v => v !== undefined,
          v => prop(v),
          v => (/^-?[0-9.]+$/.test(prop()) ? parseFloat(prop()) : prop())
        );
        prop(attributes[key]);
        prop.subscribe(value =>
          value !== undefined ? (o.attributes[key] = value) : delete o.attributes[key]
        );
        this.handlers[key] = prop;
        if(key == "deviceset" || key == "package") {
          trkl.bind(this, key, v =>
            v
              ? v.names.forEach(name => this.handlers[name](v.names[name]))
              : this.library[key + "s"][this.attributes[key]]
          );
        } else if(key == "device") {
          const fn = v => {
            if(v) {
              const { names } = v;
              if(names !== undefined) {
                this.handlers.library(names.library);
                this.handlers.deviceset(names.deviceset);
                this.handlers.device(names.device);
              }
            } else {
              return this.deviceset.devices[this.attributes.device];
            }
          };
          trkl.bind(this, key, fn);
        } else if(EagleElement.isRelation(key)) {
          let doc = this.document;
          const fn = v =>
            v
              ? this.handlers[key](typeof v == "string" ? v : v.name)
              : doc[key == "library" ? "libraries" : key + "s"][this.handlers[key]()];
          trkl.bind(this, key, fn);
        } else {
          trkl.bind(this, key, handler);
        }
      }
    }
    this.children = makeEagleNodeList(this, this.ref);
    this.initCache(EagleElement);
  }

  get text() {
    let text = this.raw.children[0];
    if(typeof text == "string") return text;
  }

  static isRelation(name) {
    let relationNames = [
      "class",
      "element",
      "gate",
      "layer",
      "library",
      "package",
      "pad",
      "part",
      "pin",
      "symbol"
    ];

    return relationNames.indexOf(name) != -1;
  }

  /* prettier-ignore */ static keys(entity) {return Object.keys(EagleElement.toObject(entity)); }
  /* prettier-ignore */ static values(entity) {return Object.values(EagleElement.toObject(entity)); }
  /* prettier-ignore */ static entries(entity) { return Object.entries(EagleElement.toObject(entity)); }

  static toObject(e) {
    let { tagName, attributes, children, text } = e;
    let o = { ...attributes };
    if(typeof e == "object" && e !== null && "tagName" in e) o = { tagName, ...o };
    if(
      typeof children == "object" &&
      children !== null &&
      "length" in children &&
      children.length > 0
    ) {
      let a = children.filter(child => typeof child == "string");
      children = children.filter(child => typeof child != "string").map(EagleElement.toObject);
      text = a.join("\n");
    }
    if(typeof text == "string" && text.length > 0)
      if("attributes" in o) o.attributes.text = text;
      else o.innerHTML = text;
    o.type = e.nodeType;
    return o;
  }

  static toArray(e) {
    const { tagName, attributes, children } = e;
    return [tagName, attributes, children];
  }

  toString(entity = this) {
    const { text, ownerDocument } = entity;
    return inspect(entity, ownerDocument);
  }

  *getAll(name) {
    yield* super.getAll(name, (v, l, p) => new EagleElement(this, l));
  }

  setAttribute(name, value) {
    if(typeof value != "string" && !value) this.removeAttribute(name);
    else this.raw.attributes[name] = value + "";
  }

  removeAttribute(name) {
    delete this.raw.attributes[name];
  }

  get pos() {
    return `(${(this.x / 25.4).toFixed(1)} ${(this.y / 25.4).toFixed(1)})`;
  }
}

export const makeEagleElement = function makeEagleElement(owner, ref, ...args) {
  //console.log("makeEagleElement",{owner,ref,args});
  if("length" in ref) ref = owner.ref.down(...ref);

  if(args.length > 0) ref = ref.down(...args);

  //console.log("ref:", ref);

  let e = new EagleElement(owner, ref);
  return e;
};
