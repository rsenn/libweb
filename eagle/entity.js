import Util from "../util.js";
import { trkl } from "../trkl.js";
import { lazyArray } from "../lazyInitializer.js";
import util from "util";
import { EagleDocument } from "./document.js";
import { EagleLocator } from "./locator.js";
import { ansi, text, EagleNode, inspect, toXML } from "./common.js";

const dump = (obj, depth = 1, breakLength = 100) => util.inspect(obj, { depth, breakLength, colors: true });

export class EagleEntity extends EagleNode {
  tagName = "";
  attributes = {};
  children = [];

  constructor(d, l, o) {
    super(d, l);
    Object.defineProperty(this, "handlers", { value: {}, enumerable: false });

    //   console.error("EagleEntity\n  "+(o)+"  \n  "+Util.className(this.getDocument())+"\n  "+this.location.join(',')+"\n");
    let owner = this.owner;
    let location = this.location.clone();

    /*        if(owner instanceof EagleDocument && location.indexOf('children') != -1) {
            while(location.length > 0 && location[0] !== 'children')
              location.shift();
          }*/
    //if(location[0] !== 'children') owner = owner.owner;

    if(owner === null) throw new Error("owner == null");

    //  console.error("EagleEntity o="+(o)+" location=" + location.join(',') + " d=" + Util.className(d) + " owner=" + Util.className(owner) + " location=" + this.location.join(","));
    if(o === undefined || (o.tagName === undefined && o.attributes === undefined && o.children === undefined)) {
      try {
        o = location.apply(owner); //.index(location);
      } catch(error) {
        throw new Error("EagleEntity index\n  " + location[0] + "\n  error=" + error.toString().split(/\n/g)[0] + "\n  owner=" + Util.className(owner).replace(/\s+/g, " ") + "\n  location=[" + location.join(",") + "]");
      }
    }

    if(o === null || typeof o != "object") throw new Error("eagleentity " + location.join(",") + " " + Util.className(owner) + " " + Util.className(this.document));

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
        if(EagleEntity.isRelation(key)) {
          trkl.bind(this, key, v => {
            return v ? this.handlers[key](v.name) : this.owner.getByName(key, this.handlers[key]());
          });
        } else if(key == "device") {
          trkl.bind(this, key, v => {
            if(v !== undefined) return this.handlers[key](v.name);
            const device = this.deviceset.getByName("device", this.attributes.device);
            return device;
          });
        } else {
          trkl.bind(this, key, handler);
        }
      }
    }
    if(children instanceof Array)
      this.children = lazyArray(
        children.map((child, i) => {
          if(typeof child == "object") return () => new EagleEntity(owner, location.slice().down("children", i));
          return () => child;
        })
      );
    else this.children = [];
  }

  get text() {
    return this.children.filter(child => typeof child == "string").join("\n");
  }

  toXML(depth = Number.MAX_SAFE_INTEGER) {
    let o = this.document.index(this.location);
    return toXML(o, depth);
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
    return ["class", "deviceset", "element", "gate", "layer", "library", "package", "pad", "part", "pin", "symbol"].indexOf(name) != -1;
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
}
