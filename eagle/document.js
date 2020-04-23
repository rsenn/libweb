import tXml from '../tXml.js';
import Util from '../util.js';
import deepClone from '../clone.js';
import deepDiff from '../deep-diff.js';
import { EaglePath, EagleRef } from './locator.js';
import { EagleNode } from './node.js';
import { EagleElement } from './element.js';
import { toXML } from './common.js';

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
    if(filename) this.path = filename;
    Util.define(
      this,
      'type',
      /<library>/.test(xmlStr) ? 'lbr' : /<element /.test(xmlStr) ? 'brd' : 'sch'
    );
    if(project) this.owner = project;
    Util.define(this, 'xml', xml);
    const orig = xml[0];
    Util.define(this, 'orig', orig);
    this.initCache(EagleElement);
  }

  /* prettier-ignore */ get filename() { return this.path && this.path.replace(/.*\//g, ""); }
  /* prettier-ignore */ get dirname() { return this.path && this.path.replace(/\/[^/]*\/?$/g, "") || "."; }

  //get project() { return this.owner; }
  //  get orig() { return this.xml[0]; }

  get basename() {
    return this.path && this.filename.replace(/\.[a-z][a-z][a-z]$/i, '');
  }

  get changes() {
    return deepDiff(this.orig, this.root);
  }

  cacheFields() {
    switch (this.type) {
      case 'sch':
        return [
          'settings',
          'layers',
          'libraries',
          'classes',
          'parts',
          'sheets',
          'instances',
          'nets'
        ];
      case 'brd':
        return ['settings', 'layers', 'libraries', 'classes', 'designrules', 'elements', 'signals'];
      case 'lbr':
        return ['settings', 'layers', 'library', 'packages', 'symbols', 'devicesets'];
    }
    return super.cacheFields();
  }

  toString() {
    let xml = toXML(this.root /*dereference()*/);
    //console.log("xml:", toXML(this.root, 7));
    return xml; //.map(e => toXML(e)).join("\n") + "\n";
  }

  /* prettier-ignore */
  saveTo(path, overwrite = false) {
    let { fs } = this.project;
    fs.writeFile(path, this.toString());
  }

  index(path, transform = arg => arg) {
    if(!(path instanceof EaglePath)) path = new EaglePath(path);
    return transform(path.apply(this));
  }
}
