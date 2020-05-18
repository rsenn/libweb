import tXml from '../tXml.js';
import Util from '../util.js';
import deepClone from '../clone.js';
import deepDiff from '../deep-diff.js';
import { EaglePath, EagleRef } from './locator.js';
import { EagleNode } from './node.js';
import { EagleElement } from './element.js';
import { toXML } from './common.js';
import { BBox, Rect, PointList } from '../geom.js';

export class EagleDocument extends EagleNode {
  static types = ['brd', 'sch', 'lbr'];
  xml = null;
  path = null;
  type = null;

  constructor(xmlStr, project, filename, type) {
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

    type = type || /<library>/.test(xmlStr) ? 'lbr' : /<element /.test(xmlStr) ? 'brd' : 'sch';

    if(filename) {
      this.path = filename;

      type = type || filename.replace(/.*\//g, '').replace(/.*\./g, '');
    }
    //console.log('load document:', { project, xml: xmlStr.substring(0, 100), type });
    this.type = type;

    if(project) this.owner = project;
    Util.define(this, 'xml', xml);
    const orig = xml[0];
    Util.define(this, 'orig', orig);
    this.initCache(EagleElement);
  }

  /* prettier-ignore */ get filename() { return this.path && this.path.replace(/.*\//g, ""); }
  /* prettier-ignore */ get dirname() { return this.path &&  (/\//.test(this.path) ? this.path.replace(/\/[^/]*\/?$/g, "") : "."); }

  //get project() { return this.owner; }
  //  get orig() { return this.xml[0]; }

  get basename() {
    return this.path && this.filename.replace(/\.[a-z][a-z][a-z]$/i, '');
  }

  get changes() {
    return deepDiff(this.orig, this.raw);
  }

  cacheFields() {
    switch (this.type) {
      case 'sch':
        return ['settings', 'layers', 'libraries', 'classes', 'parts', 'sheets', 'instances', 'nets'];
      case 'brd':
        return ['settings', 'layers', 'libraries', 'classes', 'designrules', 'elements', 'signals', 'pads', 'plain'];
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
    const data = Buffer.from(this.toString());

   return new Promise((resolve,reject) => {
    fs.writeFile(path, data);
    resolve([path,data.length]);
  });
  }

  index(path, transform = arg => arg) {
    if(!(path instanceof EaglePath)) path = new EaglePath(path);
    return transform(path.apply(this));
  }

  *getAll(name) {
    yield* super.getAll(name, (v, l, p) => new EagleElement(this, l));
  }

  getBounds() {
    let bb = new BBox();

    /*
    for(let element of this.getAll((e, p) => e.tagName === "element")) {
//      if(/library/.test(element.xpath())) continue;
let layer = element.layer;

        if(element.attributes.package) {
          let pr = element.package.getBounds();
            console.log("getBounds", pr);
          }
    }*/

    for(let instance of this.getAll((e, p) => e.tagName == 'instance')) {
      let part = instance.part;
      let device = part.device;
      let deviceset = part.deviceset;
      let gate = deviceset.gates[instance.attributes.gate];
      let symbol = part.library.symbols[gate.attributes.symbol];

      let geometries = {
        gate: gate.geometry(),
        symbol: new Rect(symbol.getBounds()).toPoints(),
        instance: instance.transformation()
      };

      let matrix = geometries.instance.toMatrix();

      let points = new PointList([...matrix.transform_points(geometries.symbol)]);

      let bbrect = points.boundingRect();

      console.log(' points:', points);
      console.log(' bbrect:', bbrect);

      //  bb.update(bbrect);

      /*
      if(layer && (layer.number > 90))
        continue;*/
      /*
      let g = symbol.geometry();
      if(g) {
*/
      /*    console.log("getBounds", element, g);*/
      bb.update(g);
      // }
    }
    //console.log('getBounds', bb);
    return bb;
  }
}
