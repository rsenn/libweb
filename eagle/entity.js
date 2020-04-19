import Util from "../util.js";
import { trkl } from "../trkl.js";
import { lazyArray } from "../lazyInitializer.js";
import util from "util";
import { text, inspect, toXML } from "./common.js";
import { EaglePath } from "./locator.js";
import { EagleNode } from "./node.js";
import { EagleNodeList } from "./nodeList.js";

const dump = (obj, depth = 1, breakLength = 100) => util.inspect(obj, { depth, breakLength, colors: true });

export class EagleEntity extends EagleNode {
  tagName = "";
  attributes = {};
  children = [];

  constructor(d, l, o) {
    super(d, l);
    Object.defineProperty(this, "handlers", { value: {}, enumerable: false });
    let owner = this.owner; /*    console.log("this.path:",Util.className(this.path));*/

    /*     console.log(`new Entity(`,d,', ',l,');');
     */ let path = this.ref.path.clone();

    if(owner === null) throw new Error("owner == null");

    if(o === undefined || (o.tagName === undefined && o.attributes === undefined && o.children === undefined)) {
      try {
        o = this.ref.dereference(); //.apply(owner); //.index(path);
      } catch(error) {
        /* throw new Error("EagleEntity index\n  " + path[0] + "\n  error=" + error.toString().split(/\n/g)[0] + "\n  owner=" + Util.className(owner).replace(/\s+/g, " ") + "\n  path=[" + path.join(",") + "]");*/
      }
    }

    if(o === null || typeof o != "object") throw new Error("ref: " + this.ref.inspect() + " entity: " + EagleNode.prototype.inspect.call(this) /*+" " + path.join(",") + " " + Util.className(owner) + " " + Util.className(this.document)*/);

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
          let doc = this.document;
          //   console.log(`this.document = ${Util.className(doc)}`);
          const fn = v => (v ? this.handlers[key](typeof v == "string" ? v : v.name) : doc.getByName(key, this.handlers[key]()));
          //  console.log(`this[${key}] = ${fn}`);
          trkl.bind(this, key, fn);
        } else if(key == "deviceset") {
          const fn = v => (v ? this.handlers[key](typeof v == "string" ? v : v.name) : this.library.getByName(key, this.handlers[key]()));
          trkl.bind(this, key, fn);
        } else if(key == "device") {
          const fn = v => (v ? this.handlers[key](typeof v == "string" ? v : v.name) : this.deviceset.getByName(key, this.handlers[key]()));
          trkl.bind(this, key, fn);
        } else {
          trkl.bind(this, key, handler);
        }

        /*  if(key == "device" || key == 'deviceset') {
          trkl.bind(this, key, v => {
            if(v !== undefined) return this.handlers[key](typeof v == "string" ? v : v.name);
            const device = this[key == 'deviceset' ? 'library' : 'devicesets'].getByName(key, this.attributes.device);
            return device;
          });*/
      }
    }

    /*  if(o.children && typeof o.children[0] == "string") {
      //this.text = o.children[0];
      this.children = o.children;
      //   console.log(`${tagName}: ${children.length}`, this.text);
    } else if(Util.isArray(children)) {
      const ref = this.ref.down("children");

      let prop = trkl.computed(() => lazyArray(ref.dereference().map((child, i) => () => new EagleEntity(owner, path.down("children", i)))));

      //  this.children = lazyArray(childHandlers);
      trkl.bind(this, "children", prop);
    }
*/
    this.children = EagleNodeList(this, this.ref);

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
    let relationNames = ["class", "element", "gate", "layer", "library", "package", "pad", "part", "pin", "symbol"];

    return relationNames.indexOf(name) != -1;
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
export const EagleElement = function EagleElement(owner, ref, ...args) {
  let e = new EagleEntity(owner, ref.concat(args));
  return e;
};
