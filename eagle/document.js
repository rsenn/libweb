import tXml from "../tXml.js";
import Util from "../util.js";
import fs, { promises as fsPromises } from "fs";
import { EagleEntity } from "./entity.js";
import util from "util";
import path from "path";
import { EagleLocator } from "./locator.js";
import { text, traverse, toXML, parseArgs, dump, EagleNode } from "./common.js";

export class EagleDocument extends EagleNode {
  xml = null;
  path = null;

  constructor(filename) {
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
    this.path = filename;
    this.type = /<library>/.test(xmlStr) ? "lbr" : /<element /.test(xmlStr) ? "brd" : "sch";
    Util.define(this, "xml", new tXml(xmlStr));
  }

  /* prettier-ignore */ get filename() { return path.basename(this.path); }
  /* prettier-ignore */ get dirname() { return path.dirname(this.path); }
  /* prettier-ignore */ get children() { return this.root.children; }
  /* prettier-ignore */ get root() {
    if(this.xml.length == 1) {
            const e = this.xml[0];
            if(e.tagName.startsWith('?'))
    return e;
}
  }

  toString = () => this.xml.map(e => toXML(e)).join("\n") + "\n";

  /* prettier-ignore */
  saveTo = (path, overwrite = false) => new Promise((resolve, reject) => fsPromises .writeFile(path, this.toString(), { flag: overwrite ? "w" : "wx" }) .then(() => resolve(path)) .catch(reject) );

  index(location, transform = arg => arg) {
    if(!(location instanceof EagleLocator)) location = new EagleLocator(location);
    return transform(location.apply(this.root));
  }
}
