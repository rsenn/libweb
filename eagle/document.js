import tXml from '../tXml.js';
import Util from '../util.js';
import deepClone from '../clone.js';
import deepDiff from '../deep-diff.js';
import { EagleRef } from './ref.js';
import { toXML, ImmutablePath } from '../json.js';
import { EagleNode } from './node.js';
import { EagleElement } from './element.js';
import { BBox, Rect, PointList } from '../geom.js';
import { makeEagleNodeList } from './nodeList.js';
import { lazyProperty } from '../lazyInitializer.js';

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

    lazyProperty(this, 'children', () => makeEagleNodeList(this, ['children'], this.raw.children));
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
        return [
          ['eagle', 'drawing', 'settings'],
          ['eagle', 'drawing', 'layers'],
          ['eagle', 'drawing', 'schematic', 'libraries'],
          ['eagle', 'drawing', 'schematic', 'classes'],
          ['eagle', 'drawing', 'schematic', 'parts'],
          ['eagle', 'drawing', 'schematic', 'sheets']
        ];
      case 'brd':
        return [
          ['eagle', 'drawing', 'settings'],
          ['eagle', 'drawing', 'layers'],
          ['eagle', 'drawing', 'board', 'libraries'],
          ['eagle', 'drawing', 'board', 'classes'],
          ['eagle', 'drawing', 'board', 'designrules'],
          ['eagle', 'drawing', 'board', 'elements'],
          ['eagle', 'drawing', 'board', 'signals'],
          ['eagle', 'drawing', 'board', 'plain']
        ];
      case 'lbr':
        return [
          ['eagle', 'drawing', 'settings'],
          ['eagle', 'drawing', 'layers'],
          ['eagle', 'drawing', 'library'],
          ['eagle', 'drawing', 'library', 'packages'],
          ['eagle', 'drawing', 'library', 'symbols'],
          ['eagle', 'drawing', 'library', 'devicesets']
        ];
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
    if(!(path instanceof ImmutablePath)) path = new ImmutablePath(path);
    return transform(path.apply(this));
  }

  *getAll(pred, transform) {
    yield* super.getAll(pred, transform || ((v, l, p) => EagleElement.get(this, l, v)));
  }

  lookup(xpath) {
    let doc = this;
    return super.lookup(xpath, (o, p, v) => EagleElement.get(o, p, v));
  }

  getBounds(sheetNo = 0) {
    let bb = new BBox();

    let sheet = this.sheets ? this.sheets[sheetNo] : null;

    if(sheet) {
      for(let instance of sheet.instances.list) {
        let { gate, part } = instance;
        let symbol = gate.symbol;

        //console.log('symbol:', symbol);
        let geometries = {
          gate: gate.geometry(),
          symbol: new Rect(symbol.getBounds()).toPoints(),
          instance: instance.transformation()
        };

        //console.log('geometries:', geometries);
        let matrix = geometries.instance.toMatrix();
        let points = new PointList([...matrix.transform_points(geometries.symbol)]);
        let bbrect = points.boundingRect();

        let sb = symbol.getBounds();
        let sbr = new Rect(sb);

        bb.update(bbrect, 0, instance);
      }
    }

    if(this.type == 'brd') {
      const board = this.lookup(['eagle', 'drawing', 'board']);
      return board.getBounds();
    }

    if(this.elements) {
      for(let element of this.elements.list) {
        let bbrect = element.getBounds();

        bb.update(bbrect);
      }
    }

    if(this.signals) {
      for(let signal of this.signals.list) {
        //console.log('signal:', signal);
        let bbrect = signal.getBounds();

        bb.update(bbrect);
      }
    }

    return bb;
  }
}
