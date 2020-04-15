import Util from "../util.js";
import { trkl } from "../trkl.js";
import { lazyArray } from "../lazyInitializer.js";
import util from "util";
import { text, EagleNode, inspect, toXML } from "./common.js";

const dump = (obj, depth = 1, breakLength = 100) => util.inspect(obj, { depth, breakLength, colors: true });

export class EagleEntity extends EagleNode {
  tagName = "";
  attributes = {};
  children = [];

  constructor(d, l, o) {
    super(d, l);
    Object.defineProperty(this, "handlers", { value: {}, enumerable: false });
    let owner = this.owner;

    /*  console.log("this.ref:",this.ref);
    console.log("this.path:",Util.className(this.path));*/
    let path = this.path.clone();

    if(owner === null) throw new Error("owner == null");

    if(o === undefined || (o.tagName === undefined && o.attributes === undefined && o.children === undefined)) {
      try {
        o = path.apply(owner); //.index(path);
      } catch(error) {
        throw new Error("EagleEntity index\n  " + path[0] + "\n  error=" + error.toString().split(/\n/g)[0] + "\n  owner=" + Util.className(owner).replace(/\s+/g, " ") + "\n  path=[" + path.join(",") + "]");
      }
    }

    if(o === null || typeof o != "object") throw new Error("eagleentity " + path.join(",") + " " + Util.className(owner) + " " + Util.className(this.document));

    let { tagName, attributes, children } = o;
    this.tagName = tagName;
    this.attributes = /* attributes; */ {};
    // Util.define(this, "data", o);
    //this.data = o;    // this.data = o;

    if(!Util.isEmpty(attributes)) {
      for(let key in attributes) {
        let prop = trkl.property(this.attributes, key);
        let handler = Util.ifThenElse(
          v => v !== undefined,
          v => prop(v),
          v => (/^-?[0-9.]+$/.test(prop()) ? parseFloat(prop()) : prop())
        );
        handler(attributes[key]);
        prop.subscribe(value => (value !== undefined ? (attributes[key] = value) : undefined));

        this.handlers[key] = prop;

        if(EagleEntity.isRelation(key)) {
          trkl.bind(this, key, v => {
            return v ? this.handlers[key](typeof v == "string" ? v : v.name) : this.owner.getByName(key, this.handlers[key]());
          });
        } else if(key == "device") {
          trkl.bind(this, key, v => {
            if(v !== undefined) return this.handlers[key](typeof v == "string" ? v : v.name);
            const device = this.deviceset.getByName("device", this.attributes.device);
            return device;
          });
        } else {
          trkl.bind(this, key, handler);
        }
      }
    }

    if(o.children && typeof o.children[0] == "string") {
      //this.text = o.children[0];
      this.children = o.children;
      //   console.log(`${tagName}: ${children.length}`, this.text);
    } else if(Util.isArray(children)) {
      let childHandlers = children.map((child, i) => (typeof child == "object" ? () => new EagleEntity(owner, path.down("children", i)) : () => children[i]));
      this.children = lazyArray(childHandlers);
      //   Util.define(this, 'childHandlers', childHandlers);
    } else this.children = children;

    this.initCache();
  }

  get text() {
    let idx = this.children.findIndex(child => typeof child == "string");
    let txt = this.children[idx];

    return txt;
  }
  set text(value) {
    let idx = this.children.findIndex(child => typeof child == "string");
    this.children[idx] = value;
  }

  toXML(depth = Number.MAX_SAFE_INTEGER) {
    // let o = this.document.index(this.path);
    return toXML(this.raw, depth);
  }
  /*
  set(name, value) {
    if(value instanceof EagleEntity) value = value.get("name");
    else if(typeof value != "string") value = "" + value;
    return this.handlers[name](value);
  }

  get(name) {
    return this.handlers[name]();
  }*/

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
