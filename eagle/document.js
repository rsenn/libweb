import tXml from "../tXml.js";
import Util from "../util.js";
import { trkl } from "../trkl.js";
import fs, { promises as fsPromises } from "fs";

import { lazyInitializer, lazyMembers, lazyArray } from "../lazyInitializer.js";
import { EagleEntity } from "./entity.js";
import util from "util";
import path from "path";
import { EagleLocator } from "./locator.js";

const dump = (obj, depth = 1) => util.inspect(obj, { depth, breakLength: 400, colors: true });

export class EagleDocument {
  xml = null;
  path = null;

  constructor(filename) {
    let xmlStr = "";
    try {
      if(!/<\?children.*<eagle /.test(filename)) {
        xmlStr = fs.readFileSync(filename);
        xmlStr = xmlStr.toString();
      }
    } catch(error) {
      throw new Error("EagleDocument: " + error);
    }
    this.path = filename;
    this.type = /<library>/.test(xmlStr) ? "lbr" : /<element /.test(xmlStr) ? "brd" : "sch";
    this.xml = new tXml(xmlStr);
    this.root = this.xml[0];
  }

  /* prettier-ignore */ get filename() { return path.basename(this.path); }
  /* prettier-ignore */ get dirname() { return path.dirname(this.path); }

  saveTo = (path, overwrite = false) =>
    new Promise((resolve, reject) =>
      fsPromises
        .writeFile(path, this.toString(), { flag: overwrite ? "w" : "wx" })
        .then(() => resolve(path))
        .catch(reject)
    );

  *tagNames() {
    let names = [];
    for(let [v, k, o, p] of Util.traverseWithPath(this.xml)) {
      if(k == "tagName" && names.indexOf(v) == -1) {
        yield v;
        names.push(v);
      }
    }
  }

  tagCounts() {
    let counts = {};
    for(let [v, k, o, p] of Util.traverseWithPath(this.xml)) {
      if(k == "tagName") {
        if(v in counts) counts[v]++;
        else counts[v] = 1;
      }
    }
    return counts;
  }

  index(loc) {
    if(!loc) return null;
    let obj = this.root;
    for(let i = 0; i < loc.length; i++) {
      const idx = loc[i];
      switch (typeof idx) {
        case "number":
          obj = obj.children ? obj.children[idx] : obj[idx];
          break;
        case "string":
          obj = obj[idx];
          break;
        case "object":
          if(idx.name !== undefined) {
            obj = obj.children.find(child => child.attributes.name == idx.name);
            break;
          }
        default:
          throw new Error(`EagleDocument index ${i} ${loc.length} '${idx}' not found`);
      }
    }
    if(!obj) throw new Error(`EagleDocument index(${dump(loc)}) returned ${obj}`);
    return obj;
  }

  static nodeName(node, loc, hier) {
    let out = "";
    do {
      let str = node.tagName || "";
      let key = loc && loc.length > 0 ? loc[path.length - 1] : [];
      let next = hier[0] || [null, []];
      let parent = next[0];
      if(str.startsWith("?")) break;
      if(typeof node == "object" && node.tagName && "children" in node && parent && parent.children.filter(child => (typeof child.tagName == "string" && child.tagName.length > 0 ? child.tagName == node.tagName : false)).length == 1) {
      } else if(typeof node == "object" && "attributes" in node && "name" in node.attributes) {
        let cmp = Object.keys(node.attributes)
          .filter(k => k == "name")
          .map(key => `@${key}="${node.attributes[key]}"`)
          .join(",");

        if(cmp != "") str += `[${cmp}]`;
      } else if(typeof key == "number") {
        str += `[${key}]`;
      }
      if(out.length > 0) str += "/";
      out = str + out;
      if(!hier || !hier.length) break;
      node = parent;
      loc = loc.slice(0, -1);
      hier = hier.slice(1);
    } while(true);
    return out;
  }

  static *traverse(obj, loc = [], hier = []) {
    if(!(loc instanceof EagleLocator)) loc = new EagleLocator(loc);

    if(false && typeof obj == "object") {
      if(obj !== null && "name" in obj.attributes) {
        let key = { name: obj.attributes.name };
        loc[loc.length - 1] = key;
      }
    }
    let parent = hier[0] && hier[0][0];
    yield [obj, loc, hier, parent];

    if(typeof obj == "object") {
      if(obj instanceof Array || "length" in obj) {
        for(let i = 0; i < obj.length; i++) yield* EagleDocument.traverse(obj[i], loc.down(i), [[obj, loc.last, parent], ...hier]);
      } else if("children" in obj) {
        for(let i = 0; i < obj.children.length; i++) yield* EagleDocument.traverse(obj.children[i], loc.down("children", i), [[obj, loc.last, parent], ...hier]);
      }
    }
  }

  nextSibling(loc) {
    let obj = this.index(loc.nextSibling);
    return obj ? [obj, p] : null;
  }

  prevSibling(loc) {
    let obj = this.index(loc.prevSibling);
    return obj ? [obj, p] : null;
  }

  parent(loc) {
    let obj = this.index(loc.parent);
    return obj ? [obj, p] : null;
  }

  firstChild(loc) {
    let obj = this.index(loc.firstChild);
    return obj ? [obj, p] : null;
  }

  lastChild(loc) {
    let obj = this.index(loc.lastChild);
    return obj ? [obj, p] : null;
  }

  find(pred, rootLoc = []) {
    for(let [v, p, h] of EagleDocument.traverse(this.xml[0], rootLoc)) if(pred(v, p, h)) return [v, p, h];
    return [null, [], []];
  }

  *findAll(pred, rootLoc = []) {
    for(let [v, p, h] of EagleDocument.traverse(this.xml[0], rootLoc)) if(pred(v, p, h)) yield [v, p, h];
  }

  locate(obj, rootLoc = []) {
    let [value, path, hier] = this.find((value, path, hier) => value === obj, rootLoc);
    return path;
  }
  /*
  get(entity) {
    const [parent, loc] = this.find(v => v.tagName == entity);
    let elements = null;

    if(parent) {
      elements = [];

      for(let i = 0; i < parent.children.length; i++) {
        elements.push(new EagleEntity(this, [...loc, i]));
      }
    }
    return elements;
  }*/

  *getAll(entity, rootLoc, transform) {
    let arg = [...arguments];
    entity = arg.shift();
    rootLoc = arg[0] instanceof Array ? arg.shift() : [];
    transform =
      typeof arg[0] == "function"
        ? arg.shift()
        : function() {
            return [...arguments];
          };

    for(let [value, loc, hier] of this.findAll((v, p, h) => v.tagName == entity, rootLoc)) {
      yield transform(value, loc, hier, this);
      //       yield  new EagleEntity(this, loc);
    }
  }

  getByName(entity, name) {
    const [element, loc] = this.find(v => v.tagName == entity && v.attributes.name == name);
    return new EagleEntity(this, loc);
  }

  xpath(loc) {
    let str = "";
    let obj = this.xml;
    for(let i = 0; i < loc.length; i++) {
      let part = loc[i];
      obj = obj[part];

      if(obj.tagName !== undefined /*&& obj.tagName[0] != '?'*/) {
        if(obj.tagName[0] == "?") continue;

        str += `/${obj.tagName}`;
        if(obj.attributes && obj.attributes.name !== undefined) str += `[@name="${obj.attributes.name}"]`;
      } else if(part != "children") str += "/" + part;

      if(typeof part == "number") str += `[${part}]`;

      //console.log(obj);
    }
    return str;
  }

  toString = () => this.xml.map(elem => EagleDocument.toXML(elem)).join("\n") + "\n";

  static pathStr(path) {
    let str = "";
    for(let part of path) {
      if(typeof part == "number") str += `[${part}]`;
      else str += "." + part;
    }
    return str;
  }

  static toXML(obj, depth = Number.MAX_SAFE_INTEGER) {
    if(obj instanceof Array) return obj.map(EagleDocument.toXML).join("\n");
    else if(typeof obj == "string") return obj;
    else if(typeof obj != "object" || obj.tagName === undefined) return "";

    let str = `<${obj.tagName}`;
    for(let key in obj.attributes) str += ` ${key}="${obj.attributes[key]}"`;

    const children = obj.children && obj.children.length !== undefined ? obj.children : [];
    if(children && children.length > 0) {
      str += obj.tagName[0] != "?" ? ">" : "?>";
      let nl = obj.tagName == "text" && children.length == 1 ? "" : obj.tagName[0] != "?" ? "\n  " : "\n";
      for(let child of children) str += nl + EagleDocument.toXML(child, depth - 1).replace(/\n/g, nl);
      if(obj.tagName[0] != "?") str += `${nl.replace(/ /g, "")}</${obj.tagName}>`;
    } else {
      str += " />";
    }
    return str.replace(/\n *\n/g, "\n").trim();
  }
}
