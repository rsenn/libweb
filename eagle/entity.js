import tXml from "../tXml.js";
import Util from "../util.js";
import { trkl } from "../trkl.js";
import fs from "fs";
import { lazyInitializer, lazyMembers, lazyArray } from "../lazyInitializer.js";
import util from "util";
import { EagleDocument } from "./document.js";
import { EagleLocator } from "./locator.js";

const dump = (value, depth = 0, breakLength = 400) => {
  if(value instanceof EagleEntity) value = EagleEntity.toObject(value);

  let str = util.inspect(value, { depth: depth * 2, breakLength, colors: true });

  const ansi = function(n = 0) {return `\u001b[${[...arguments].join(";")}m`; };
  const text = (text, ...color) => ansi(...color) + text + ansi(0);
  let sep = "⏐";
  str = str.replace(/.*tagName[^']*'([^']+)'[^,]*,?/g, "$1");
  str = str.replace(/([^ ]*):[^']*'([^']*)'[^,]*,?/g, `${text("$1", 33)}${text(sep,0,37)}${text("$2", 1, 36)}`);
  let [ part, ...arr] = str.replace(/[|\s]+/g, " ").split(/ +/g);
  part = part.replace(/^[^a-z]*([a-z]+)[^a-z]*$/g, "$1");
  //part = `‹${part}›`;
  //part = `〈${part}〉`;
  part = text(part,38,5,160);
  return `  EagleEntity ${part} ${text('⧃❋⭗',38,5,112)}  ${arr.join(' ⎸')}  ⟩`;
};

export class EagleEntity {
  /*document = null;*/
  //locator = new EagleLocator();
  tagName = "";

  constructor(d, location, obj) {
    const { locator, document, handlers } = Util.extend(this, { document: d, locator: new EagleLocator(location), handlers: {} });

    if(obj === undefined) obj = this.locator.apply(this.document.xml[0]);

    // console.log("locator "+this.locator);
    console.log(`obj${this.locator}` + dump(EagleEntity.toObject(obj), 2, 10000));
    /// let attrs = obj.attributes || {};
    this.tagName = obj.tagName;
    this.attributes = {};
    if(!Util.isEmpty(obj.attributes)) {
      for(let key in obj.attributes) {
        let prop = trkl(obj.attributes[key]);
        let handler = Util.ifThenElse(
          value => value !== undefined,
          value => prop(value),
          value => (/^-?[0-9.]+$/.test(prop()) ? parseFloat(prop()) : prop())
        );
        this.handlers[key] = handler;
        trkl.bind(this.attributes, key, handler);
        if(EagleEntity.isRelation(key)) trkl.bind(this, key, value => (value ? this.handlers[key](value.name) : document.getByName(key, this.handlers[key]())));
      }
    }
    this.children = [];
    if(obj.children instanceof Array) this.children = lazyArray(obj.children.map((child, i) => () => new EagleEntity(document, this.locator.down("children", i))));
  }

  toXML(depth = Number.MAX_SAFE_INTEGER) {
    const { tagName, children } = this;
    const attributes = {};
    for(let prop in this.attributes) {
      attributes[prop] = this.attributes[prop];
    }
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

  static toObject(entity) {
    const { tagName, attributes, children } = entity;
    let o = { ...attributes };
    if("tagName" in entity) o = { tagName, ...o };
    if(typeof children == "object" && children !== null && "length" in children && children.length > 0) o.children = children.map(EagleEntity.toObject);
    return o;
  }

  static toArray(entity) {
    const { tagName, attributes, children } = entity;
    return [tagName, attributes, children];
  }
}
