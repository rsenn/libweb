import tXml from "../tXml.js";
import Util from "../util.js";
//import fs, { promises as fsPromises } from "fs";
//import path from "path";
import deepClone from "../clone.js";
import deepDiff from "../deep-diff.js";
import { EagleEntity } from "./element.js";
import { EaglePath, EagleRef } from "./locator.js";
import { EagleNode } from "./node.js";
import { toXML, inspect } from "./common.js";
import deep from "../deep.js";

export class EagleDocument extends EagleNode {
  xml = null;
  path = null;

  constructor(xmlStr, project, filename) {
//  let xmlStr = "";
  /*  try {
      if(!/<\?.*<eagle /.test(filename)) {
        xmlStr = fs.readFileSync(filename);
        xmlStr = xmlStr.toString();
      }
    } catch(error) {
      throw new Error("EagleDocument: " + error);
    }*/
    const xml = new tXml(xmlStr);

    super(project, EagleRef(deepClone(xml[0]), []));

if(filename)
    this.filename = filename;
    Util.define(this, "type", /<library>/.test(xmlStr) ? "lbr" : /<element /.test(xmlStr) ? "brd" : "sch");
    // this.path.push(this.type == "lbr" ? "library" : this.type == "brd" ? "board" : "schematic");
    // if(this.type == "lbr") this.path.push(this.basename);
    if(project) this.owner = project;
    Util.define(this, "xml", xml);
    const orig = xml[0];

    Util.define(this, "orig", orig);

    //  Object.defineProperty(this, "ownerDocument", { value: null, enumerable: false });

    //console.log("" + deepDiff.diff);
    //
    //

    /* let counts = {};
  for(let value of f) {
    if(!value.children || value.children.length == 0) continue;
    if(counts[value.tagName] === undefined)
counts[value.tagName] = 0;

counts[value.tagName]++;
  }
 counts = Object.entries(counts).filter(([key,value]) => value === 1).map(([key,value]) => key);
    console.log(`counts.${this.type}: ['`+counts.join("','")+"']");
*/
    this.initCache();
  }

  /* prettier-ignore */ get filename() { return this.path.replace(/.*\//g, ""); }
  /* prettier-ignore */ get dirname() { return this.path.replace(/\/[^/]*\/?$/g, ""); }

  //get project() { return this.owner; }
  //  get orig() { return this.xml[0]; }

  get basename() {
    return path.basename(this.filename).replace(/\.[a-z][a-z][a-z]$/i, "");
  }

  get changes() {
    return deepDiff(this.orig, this.root);
  }

  cacheFields() {
    switch (this.type) {
      case "sch":
        return ["settings", "layers", "libraries", "classes", "parts", "sheets", "instances", "nets"];
      case "brd":
        return ["settings", "layers", "libraries", "classes", "designrules", "elements", "signals"];
      case "lbr":
        return ["settings", "layers", "library", "packages", "symbols", "devicesets"];
    }
    return super.cacheFields();
  }

  toString() {
    let xml = toXML(this.root /*dereference()*/);
    //console.log("xml:", toXML(this.root, 7));
    return xml; //.map(e => toXML(e)).join("\n") + "\n";
  }

  /* prettier-ignore */
  saveTo(path, overwrite = false) {return new Promise((resolve, reject) => fsPromises .writeFile(path, this.toString(), { flag: overwrite ? "w" : "wx" }) .then(() => resolve(path)) .catch(reject) ); }

  index(path, transform = arg => arg) {
    if(!(path instanceof EaglePath)) path = new EaglePath(path);
    return transform(path.apply(this));
  }
}
