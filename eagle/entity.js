import tXml from "../tXml.js";
import Util from "../util.js";
import { trkl } from "../trkl.js";
import fs from "fs";
import { lazyInitializer, lazyMembers, lazyArray } from "../lazyInitializer.js";
import util from "util";
import { EagleDocument } from "./document.js";
import { EagleLocator } from "./locator.js";

const dump = (obj, depth = 1, breakLength = 100) =>
  util.inspect(obj, { depth, breakLength, colors: true });

export class EagleEntity {
  tagName = "";

  constructor(d, location, obj) {
    const { locator, document, handlers } = Util.extend(this, {
      document: d,
      locator: new EagleLocator(location),
      handlers: {}
    });

    if(obj === undefined || (obj.tagName === undefined && obj.attributes === undefined)) {
      let r = this.locator.apply(d.root || d.xml[0]);
      ///    console.log(`EagleEntity.constructor  \n`, locator.toString(),"\n",dump(r));

      obj = r;
    }

    let { tagName, attributes, children } = obj;

    this.tagName = tagName;
    this.attributes = {};

    if(!Util.isEmpty(attributes)) {
      for(let key in attributes) {
        let prop = trkl(attributes[key]);
        let handler = Util.ifThenElse(
          value => value !== undefined,
          value => prop(value),
          value => (/^-?[0-9.]+$/.test(prop()) ? parseFloat(prop()) : prop())
        );
        this.handlers[key] = handler;
        trkl.bind(this.attributes, key, handler);
        if(EagleEntity.isRelation(key))
          trkl.bind(this, key, value =>
            value ? this.handlers[key](value.name) : document.getByName(key, this.handlers[key]())
          );
      }
    }
    this.children = [];
    if(children instanceof Array)
      this.children = lazyArray(
        children.map((child, i) => () =>
          new EagleEntity(document, this.locator.down("children", i))
        )
      );
  }

  get text() {
    return this.children.filter(child => typeof child == "string").join("\n");

    /*  for(let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
     // console.log(`child #${i}:`, child);
    }*/
  }

  toXML(depth = Number.MAX_SAFE_INTEGER) {
    const { tagName, children } = this;
    const attributes = {};
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
    return (
      [
        "class",
        "device",
        "deviceset",
        "element",
        "gate",
        "layer",
        "library",
        "package",
        "pad",
        "part",
        "pin",
        "symbol"
      ].indexOf(name) != -1
    );
  }

  /* prettier-ignore */ static keys(entity) {return Object.keys(EagleEntity.toObject(entity)); }
  /* prettier-ignore */ static values(entity) {return Object.values(EagleEntity.toObject(entity)); }
  /* prettier-ignore */ static entries(entity) { return Object.entries(EagleEntity.toObject(entity)); }

  static toObject(entity) {
    let { tagName, attributes, children, text } = entity;
    let o = { ...attributes };
    if(typeof entity == "object" && entity !== null && "tagName" in entity) o = { tagName, ...o };
    if(
      typeof children == "object" &&
      children !== null &&
      "length" in children &&
      children.length > 0
    ) {
      let lines = children.filter(child => typeof child == "string");
      children = children.filter(child => typeof child != "string").map(EagleEntity.toObject);
      text = lines.join("\n");
    }

    if(typeof text == "string" && text.length > 0) {
      if("attributes" in o) o.attributes.text = text;
      else o.innerHTML = text;
    }
    return o;
  }

  static toArray(entity) {
    const { tagName, attributes, children } = entity;
    return [tagName, attributes, children];
  }

  static dump(entity, depth = 0, breakLength = 400) {
    let obj = entity;

    const ansi = (...args) => `\u001b[${[...args].join(";")}m`;
    const text = (text, ...color) => ansi(...color) + text + ansi(0);

    if(typeof entity == "string") return text(entity, 1, 36);

    if(entity instanceof EagleEntity) obj = EagleEntity.toObject(entity);

    let s = util.inspect(obj, { depth: depth * 2, breakLength, colors: true });

    let sep = "⏐";
    s = s.replace(/.*tagName[^']*'([^']+)'[^,]*,?/g, "$1");
    s = s.replace(
      /([^ ]*):[^']*('[^']*')[^,]*,?/g,
      `${text("$1", 33)}${text(sep, 0, 37)}${text("$2", 1, 36)}`
    );
    let [part, ...arr] = s
      .replace(/[|\s]+/g, " ")
      .replace(/'([^'][^']*)'/g, "$1")
      .split(/ +/g);

    part = part.replace(/^[^a-z]*([a-z]+)[^a-z]*$/g, "$1");
    //part = `〈${part}〉`;
    part = text(part, 38, 5, 199);
    part = text(`〔`, 1, 37) + part;

    let location = entity.locator + "";
    return (
      `${location + Util.pad(location, 24, " ")}  ${text("EagleEntity", 38, 5, 219)}${part} ${text(
        "⧃❋⭗",
        38,
        5,
        112
      )}  ${arr.join(" ").trimRight()}` + text(`〕`, 1, 37)
    );
  }

  toString(entity = this) {
    const { text } = entity;
    /*  if(typeof text == "string" && text.length > 0) {
      if(entity.attributes) entity.attributes.innerHTML = text;
      else entity.innerHTML = text;
    }*/
    //      if(entity instanceof EagleEntity) entity = EagleEntity.toObject(entity);

    return EagleEntity.dump(entity);
    /*

    const { locator, attributes, children, tagName, text } = entity;
    let props = { tagName, ...attributes };
    if(children) props.children = children;
    if(tagName) props.tagName = tagName;
    if(text) props.text = text;
    locator.toString() + "\t" + EagleEntity.dump(EagleEntity.toObject(props), 3, 10000);*/
  }
}
