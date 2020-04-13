import tXml from "../tXml.js";
import Util from "../util.js";
import fs, { promises as fsPromises } from "fs";
import { EagleEntity } from "./entity.js";
import util from "util";
import path from "path";
import { EagleLocator } from "./locator.js";
import { text,traverse, toXML,parseArgs, dump, EagleNode } from "./common.js";


export class EagleDocument extends EagleNode {
  xml = null;
  path = null;

  constructor(filename) {
    super();
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

  toString = () => this.xml.map(e => toXML(e)).join("\n") + "\n";

  /* prettier-ignore */
  saveTo = (path, overwrite = false) => new Promise((resolve, reject) => fsPromises .writeFile(path, this.toString(), { flag: overwrite ? "w" : "wx" }) .then(() => resolve(path)) .catch(reject) );

/*  *tagNames() {
    let names = [];
    for(let [v, k, o, p] of Util.traverseWithPath(this.xml))
      if(k == "tagName" && names.indexOf(v) == -1) {
        yield v;
        names.push(v);
      }
  }

  tagCounts() {
    let counts = {};
    for(let [v, k, o, p] of Util.traverseWithPath(this.xml))
      if(k == "tagName") {
        if(v in counts) counts[v]++;
        else counts[v] = 1;
      }
    return counts;
  }*/

  index(location, transform = arg => arg) {
    if(!(location instanceof EagleLocator)) location = new EagleLocator(location);
    return transform(location.apply(this.root));

    /*
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
    return obj;*/
  }

  static nodeName(e, l, hier) {
    let out = "";
    do {
      let str = e.tagName || "";
      let key = l && l.length > 0 ? l[path.length - 1] : [];
      let next = hier[0] || [null, []];
      let parent = next[0];
      if(str.startsWith("?")) break;
      if(typeof e == "object" && e.tagName && "children" in e && parent && parent.children.filter(child => (typeof child.tagName == "string" && child.tagName.length > 0 ? child.tagName == e.tagName : false)).length == 1) {
      } else if(typeof e == "object" && "attributes" in e && "name" in e.attributes) {
        let cmp = Object.keys(e.attributes)
          .filter(k => k == "name")
          .map(key => `@${key}="${e.attributes[key]}"`)
          .join(",");
        if(cmp != "") str += `[${cmp}]`;
      } else if(typeof key == "number") {
        str += `[${key}]`;
      }
      if(out.length > 0) str += "/";
      out = str + out;
      if(!hier || !hier.length) break;
      e = parent;
      l = l.slice(0, -1);
      hier = hier.slice(1);
    } while(true);
    return out;
  }
}
