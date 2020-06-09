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
  file = null;
  type = null;

  constructor(xmlStr, project, filename, type) {
    const xml = new tXml(xmlStr);
    super(project, EagleRef(deepClone(xml[0]), []));
    type = type || /<library>/.test(xmlStr) ? 'lbr' : /<element\ /.test(xmlStr) ? 'brd' : 'sch';
    if(filename) {
      this.file = filename;
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

  get filename() {
    return this.file && this.file.replace(/.*\//g, '');
  }
  get dirname() {
    return this.file && (/\//.test(this.file) ? this.file.replace(/\/[^\/]*\/?$/g, '') : '.');
  }

  get basename() {
    return this.file && this.filename.replace(/\.[a-z][a-z][a-z]$/i, '');
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
  saveTo(file, overwrite = false) {
    let { fs } = this.project;
    const data = Buffer.from(this.toString());

   return new Promise((resolve,reject) => {
    fs.writeFile(file, data);
    resolve([file,data.length]);
  });
  }

  index(path, transform = arg => arg) {
    if(!(path instanceof EaglePath)) path = new EaglePath(path);
    return transform(path.apply(this));
  }

  *getAll(name) {
    yield* super.getAll(name, (v, l, p) => EagleElement.get(this, l, v));
  }

  getBounds() {
    let bb = new BBox();

    for(let instance of this.getAll((e, p) => e.tagName == 'instance')) {
      let part = instance.part;
      let library = this.document.find(e => e.tagName == 'library' && e.attributes.name == part.attributes.library);

      let deviceset = library.find(e => e.tagName == 'deviceset' && e.attributes.name == part.attributes.deviceset);
      let device = library.find(e => e.tagName == 'device' && e.attributes.name == part.attributes.device);

      let gate = deviceset.find(e => e.tagName == 'gate' && e.attributes.name == instance.attributes.gate);

      let symbol = library.find(e => e.tagName == 'symbol' && e.attributes.name == gate.attributes.symbol);
      let geometries = {
        gate: gate.geometry(),
        symbol: new Rect(symbol.getBounds()).toPoints(),
        instance: instance.transformation()
      };
      let matrix = geometries.instance.toMatrix();
      let points = new PointList([...matrix.transform_points(geometries.symbol)]);
      let bbrect = points.boundingRect();

      let sb = symbol.getBounds();
      let sbr = new Rect(sb);

      bb.update(bbrect, 0, instance);
    }

    for(let element of this.getAll((e, p) => e.tagName == 'element')) {
      let bbrect = element.getBounds();

      bb.update(bbrect);
    }

    for(let signal of this.getAll(e => e.tagName == 'signal')) {
      //console.log('signal:', signal);
      let bbrect = signal.getBounds();

      bb.update(bbrect);
    }

    return bb;
  }
}
