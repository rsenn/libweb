import tXml from "../tXml.js";
import Util from "../util.js";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import deepClone from "clone";
import deepDiff from "deep-diff";
import { EagleEntity } from "./entity.js";
import { EagleLocator } from "./locator.js";
import { toXML, EagleNode, inspect } from "./common.js";
import deep from "../deep.js";

export class EagleDocument extends EagleNode {
  xml = null;
  path = null;

  constructor(filename, project) {
    super(null, []);
    Object.defineProperty(this, "ownerDocument", { value: null, enumerable: false });

    let xmlStr = "";
    try {
      if(!/<\?children.*<eagle /.test(filename)) {
        xmlStr = fs.readFileSync(filename);
        xmlStr = xmlStr.toString();
      }
    } catch(error) {
      throw new Error("EagleDocument: " + error);
    }
    Util.define(this, "path", filename);
    Util.define(this, "type", /<library>/.test(xmlStr) ? "lbr" : /<element /.test(xmlStr) ? "brd" : "sch");
    // this.location.push(this.type == "lbr" ? "library" : this.type == "brd" ? "board" : "schematic");
    // if(this.type == "lbr") this.location.push(this.basename);
    if(project) this.owner = project;
    Util.define(this, "xml", new tXml(xmlStr));
    //  Util.define(this, "orig", deepClone(this.xml));
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

  /* prettier-ignore */ get filename() { return path.basename(this.path); }
  /* prettier-ignore */ get dirname() { return path.dirname(this.path); }
  /* prettier-ignore */ get root() {
    if(this.xml.length == 1) {
            const e = this.xml[0];
            if(e.tagName.startsWith('?'))
    return e;
}
  }

  //get project() { return this.owner; }

  get basename() {
    return path.basename(this.filename).replace(/\.[a-z][a-z][a-z]$/i, "");
  }

  get changes() {
    return deepDiff.diff(this.orig, this.xml);
  }

  cacheFields() {
    switch (this.type) {
      case "sch":
        return ["settings", "layers", "libraries", "classes", "parts", "sheets", "instances", "nets"];
      case "brd":
        return ["settings", "layers", "libraries", "classes", "designrules", "elements", "signals"];
      case "lbr":
        return ["settings", "layers", "packages", "symbols", "devicesets"];
    }
    return super.cacheFields();
  }

  toString() {
    return this.xml.map(e => toXML(e)).join("\n") + "\n";
  }

  /* prettier-ignore */
  saveTo(path, overwrite = false) {return new Promise((resolve, reject) => fsPromises .writeFile(path, this.toString(), { flag: overwrite ? "w" : "wx" }) .then(() => resolve(path)) .catch(reject) ); }

  index(location, transform = arg => arg) {
    if(!(location instanceof EagleLocator)) location = new EagleLocator(location);
    return transform(location.apply(this));
  }
}
