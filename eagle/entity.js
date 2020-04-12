import Util from "../util.js";
import { trkl } from "../trkl.js";
import { lazyArray } from "../lazyInitializer.js";
import util from "util";
import { EagleDocument } from "./document.js";
import { EagleLocator } from "./locator.js";
import { ansi, text } from "./common.js";

const dump = (obj, depth = 1, breakLength = 100) => util.inspect(obj, { depth, breakLength, colors: true });

export class EagleEntity {
  tagName = "";
  attributes = {};
  children = [];
  document = null;

  constructor(d, l, o) {
    const { locator, document, handlers } = Util.extend(this, { document: d, locator: new EagleLocator(l), handlers: {} });
    if(o === undefined || (o.tagName === undefined && o.attributes === undefined)) o = this.locator.apply(d.root || d.xml[0]);
    let { tagName, attributes, children } = o;
    this.tagName = tagName;
    this.attributes = {};
    if(!Util.isEmpty(attributes)) {
      for(let key in attributes) {
        let prop = trkl(attributes[key]);
        let handler = Util.ifThenElse(
          v => v !== undefined,
          v => prop(v),
          v => (/^-?[0-9.]+$/.test(prop()) ? parseFloat(prop()) : prop())
        );
        this.handlers[key] = handler;
        trkl.bind(this.attributes, key, handler);
        if(EagleEntity.isRelation(key)) trkl.bind(this, key, v => (v ? this.handlers[key](v.name) : document.getByName(key, this.handlers[key]())));
      }
    }
    if(children instanceof Array) this.children = lazyArray(children.map((child, i) => () => new EagleEntity(document, this.locator.down("children", i))));
    else this.children = [];
  }

  get text() {
    return this.children.filter(child => typeof child == "string").join("\n");
  }

  toXML(depth = Number.MAX_SAFE_INTEGER) {
    const { tagName, children } = this;
    let attributes = {};
    for(let prop in this.attributes) attributes[prop] = this.attributes[prop];
    return EagleDocument.toXML({ tagName, attributes, children }, depth);
  }

  set(name, value) {
    if(value instanceof EagleEntity) value = value.get("name");
    else if(typeof value != "string") value = "" + value;
    return this.handlers[name](value);
  }

  get(name) {
    return this.handlers[name]();
  }

  static isRelation(name) {
    return ["class", "device", "deviceset", "element", "gate", "layer", "library", "package", "pad", "part", "pin", "symbol"].indexOf(name) != -1;
  }

  /* prettier-ignore */ static keys(entity) {return Object.keys(EagleEntity.toObject(entity)); }
  /* prettier-ignore */ static values(entity) {return Object.values(EagleEntity.toObject(entity)); }
  /* prettier-ignore */ static entries(entity) { return Object.entries(EagleEntity.toObject(entity)); }

  static toObject(e) {
    let { tagName, attributes, children, text } = e;
    let o = { ...attributes };
    if(typeof e == "object" && e !== null && "tagName" in e) o = { tagName, ...o };
    if(typeof children == "object" && children !== null && "length" in children && children.length > 0) {
      let a = children.filter(child => typeof child == "string");
      children = children.filter(child => typeof child != "string").map(EagleEntity.toObject);
      text = a.join("\n");
    }
    if(typeof text == "string" && text.length > 0)
      if("attributes" in o) o.attributes.text = text;
      else o.innerHTML = text;
    return o;
  }

  static toArray(e) {
    const { tagName, attributes, children } = e;
    return [tagName, attributes, children];
  }

  static dump(e, d, c = { depth: 0, breakLength: 400 }) {
    const { depth, breakLength } = c;
    let o = e;
   
    if(typeof e == "string") return text(e, 1, 36);
    if(e instanceof EagleEntity) o = EagleEntity.toObject(e);
    let x = util.inspect(o, { depth: depth * 2, breakLength, colors: true });
    let s = "⏐";
    x = x.replace(/.*tagName[^']*'([^']+)'[^,]*,?/g, "$1");
    x = x.replace(/([^ ]*):[^']*('[^']*')[^,]*,?/g, [text("$1", 33), text(s, 0, 37), text("$2", 1, 36)].join(""));
    let [p, ...arr] = x
      .replace(/[|\x]+/g, " ")
      .replace(/'([^'][^']*)'/g, "$1")
      .split(/ +/g);
    p = text(`〔`, 1, 37) + text(p.replace(/^[^a-z]*([a-z]+)[^a-z]*$/g, "$1"), 38, 5, 199);
    let l = e.locator + "",
      type = Util.lcfirst(d.type);
    return [l + Util.pad(l, 24, " "), text(type, 38, 5, 219), p, text("⧃❋⭗", 38, 5, 112), arr.join(" ").trimRight(), text(`〕`, 1, 37)].join(" ");
  }

  toString(entity = this) {
    const { text, document } = entity;
    return EagleEntity.dump(entity, document);
  }
}
