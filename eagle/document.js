import parseXML from '../xml/parse.js';
import tXml from '../tXml.js';
import Util from '../util.js';
import * as deep from '../deep.js';
import deepDiff from '../deep-diff.js';
import { EagleRef } from './ref.js';
import { ImmutablePath } from '../json.js';
import { EagleNode } from './node.js';
import { EagleElement } from './element.js';
import { LinesToPath } from './renderUtils.js';
import { isBBox, BBox, Rect, Point, PointList, Line } from '../geom.js';
import { RGBA } from '../color.js';
import { EagleNodeList } from './nodeList.js';
import { PathMapper } from '../json/pathMapper.js';
import { Palette } from './common.js';
import { lazyProperty } from '../lazyInitializer.js';
import { read as fromXML, write as toXML } from '../xml.js';

export class EagleDocument extends EagleNode {
  static types = ['brd', 'sch', 'lbr'];
  xml = null;
  file = null;
  type = null;

  /* prettier-ignore */ get typeName() {
    return {
      brd: 'board',
      sch: 'schematic',
      lbr: 'library'
    }[this.type];
  }

  static typeName(fileExtension) {
    return {
      brd: 'board',
      sch: 'schematic',
      lbr: 'library'
    }[fileExtension];
  }

  static baseOf(filename) {
    return filename.replace(/\.(brd|sch|lbr)$/i, '');
  }

  static typeOf(filename) {
    return this.typeName(filename.replace(/.*\./g, '').toLowerCase());
  }

  static get [Symbol.species]() {
    return EagleElement;
  }

  static open(filename, fs) {
    fs = fs || this.fs || globalThis.fs;

    let xml = fs.readFileSync(filename, 'utf-8');

    return new EagleDocument(/*Util.bufferToString*/ xml, null, filename);
  }

  constructor(xmlStr, project, filename, type, fs) {
    console.debug('EagleDocument.constructor', { data: Util.abbreviate(xmlStr), project, filename, type });

    const xml = fromXML(xmlStr); //parseXML(xmlStr);
    // console.log('EagleDocument.constructor', { xml });

    let xmlObj = deep.clone(xml[0]);
    super(project, EagleRef(xmlObj, []), xmlObj);
    this.pathMapper = new PathMapper(xmlObj, ImmutablePath);
    this.data = xmlStr;

    Util.define(this, {
      raw2element: Util.weakMapper((raw, owner, ref) => new EagleElement(owner, ref, raw))
    });

    const { pathMapper, raw2element } = this;

    const [obj2path, path2obj] = pathMapper.maps.map(Util.mapFunction);
    const [obj2eagle, path2eagle] = [Util.mapFunction(raw2element), Util.mapAdapter((key, value) => (value === undefined && key !== undefined ? this.lookup(key) : undefined))];
    const [eagle2path, eagle2obj] = [Util.mapAdapter((key, value) => (value === undefined && key !== undefined ? key.path : undefined)), Util.mapAdapter((key, value) => (value === undefined && key !== undefined ? key.raw : undefined))];

    // prettier-ignore
    this.maps = { eagle2obj, eagle2path, obj2eagle, obj2path, path2eagle, path2obj };

    type = type || /<library>/.test(xmlStr) ? 'lbr' : /(<element\ |<board)/.test(xmlStr) ? 'brd' : /(<instance\ |<sheets>|<schematic>)/.test(xmlStr) ? 'sch' : null;

    if(filename) {
      this.file = filename;
      type = type || filename.replace(/.*\//g, '').replace(/.*\./g, '');
    }

    //console.log('load document:', { filename, xml: xmlStr.substring(0, 100), type });
    this.type = type;
    if(project) this.owner = project;
    if(fs) Util.define(this, { fs });
    Util.define(this, 'xml', xml);
    const orig = xml[0];
    Util.define(this, 'orig', orig);

    Util.define(
      this,
      'palette',
      Palette[this.type == 'brd' ? 'board' : 'schematic']((r, g, b) => new RGBA(r, g, b))
    );

    //console.log("EagleDocument.constructor", {xmlStr,project,filename,type});
   // this.initCache(EagleElement, EagleNodeList.create);

    lazyProperty(this, 'children', () => EagleNodeList.create(this, ['children'] /*, this.raw.children*/));
  }

  /* prettier-ignore */ get raw() {
    return this.xml[0];
  }
  /* prettier-ignore */ get filename() {
    return this.file && this.file.replace(/.*\//g, '');
  }
  /* prettier-ignore */ get dirname() {
    return this.file && (/\//.test(this.file) ? this.file.replace(/\/[^\/]*\/?$/g, '') : '.');
  }

  /* prettier-ignore */ get basename() {
    return this.file && this.filename.replace(/\.[a-z][a-z][a-z]$/i, '');
  }

  /* prettier-ignore */ get changes() {
    return deepDiff(this.orig, this.raw);
  }

  cacheFields() {
    switch (this.type) {
      case 'sch':
        return [
          ['eagle', 'drawing', 'settings'],
          ['eagle', 'drawing', 'layers'],
          ['eagle', 'drawing', 'schematic'],
          ['eagle', 'drawing', 'schematic', 'libraries'],
          ['eagle', 'drawing', 'schematic', 'classes'],
          ['eagle', 'drawing', 'schematic', 'parts'],
          ['eagle', 'drawing', 'schematic', 'sheets']
        ];
      case 'brd':
        return [
          ['eagle', 'drawing', 'settings'],
          ['eagle', 'drawing', 'layers'],
          ['eagle', 'drawing', 'board'],
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

  /* prettier-ignore */
  saveTo(file, overwrite = false, fs) {
    const data = this.toXML('  ');

    if(!file)
      file = this.file;

    fs = fs || this.fs || globalThis.fs;
    fs.writeFileSync(file+'.json', JSON.stringify(this.raw,null,2), true);

    console.log('Saving', file, 'data: ',Util.abbreviate(data));
    let ret = fs.writeFileSync(file, data, overwrite);
  //  console.log('ret',ret);

    if(ret < 0)
      throw new Error(`Writing file '${file}' failed: ${fs.errstr}`);
    return ret;
  }

  index(path, transform = arg => arg) {
    if(!(path instanceof ImmutablePath)) path = new ImmutablePath(path);
    return transform(path.apply(this));
  }

  *getAll(pred, transform) {
    yield* super.getAll(pred, transform || ((v, p, o) => EagleElement.get(this, p, v)));
  }

  find(pred, transform) {
    return super.find(pred, transform || ((v, p, o) => EagleElement.get(this, p, v)));
  }

  lookup(xpath) {
    // console.log('EagleDocument.lookup(', xpath, Util.className(xpath), ')');

    let doc = this;
    return super.lookup(xpath, (o, p, v) => EagleElement.get(o, p, v));
  }

  getBounds(sheetNo = 0) {
    let bb = new BBox();
    /*    if(this.type == 'brd') {
      const board = this.lookup(['eagle', 'drawing', 'board']);
      const plain = board.lookup(['plain']);
      //console.debug('plain:', plain);
      const measures = plain.children.filter(e => e.layer && e.layer.name == 'Measures');
      let ret;
      if(measures.length >= 4) ret = bb.update(measures);
      else ret = board.getBounds();
      return ret;
    }*/

    let sheet = this.sheets ? this.sheets[sheetNo] : null;

    if(this.type == 'sch') {
      return this.sheets[sheetNo].getBounds(v => /(instance|net)/.test(v.tagName));
    } else if(this.elements) {
      for(let element of this.elements.list) {
        // console.log(Util.className(this) + '.getBounds', element.path + '', `<${element.tagName}>`);
        let bbrect = element.getBounds();
        bb.update(bbrect);
      }
    } else if(this.signals) {
      /*for(let signal of this.signals.list) {
        let bbrect = signal.getBounds();*/
      bb.update(
        [...project.doc.signals.list]
          .map(sig => [...sig.children])
          .flat()
          .filter(c => !!c.geometry)
      );
      bb.update([...project.doc.elements.list].map(e => e.package.getBounds().toRect(Rect.prototype).transform(e.transformation())));

      /*      }*/
    }

    return bb;
  }

  getMeasures(options = {}) {
    const { bbox, geometry, points } = typeof options == 'boolean' ? { bbox: true } : options;
    //console.log("this.type", this.type);
    let plain = this.plain;

    if(!plain && (plain = this.find('plain'))) plain = [...plain.children];

    if(plain) plain = plain.filter(e => e.tagName == 'wire');

    if(plain) {
      let measures = plain.filter(obj => obj.layer && ['Dimension', 'Measures'].indexOf(obj.layer.name) != -1);

      if(measures.length) {
        if(bbox) {
          measures = measures.map(e => (typeof e.getBounds == 'function' ? e.getBounds() : e.geometry));
          measures = BBox.from(measures);
          //console.log('measures bbox:', measures);

          if(!isBBox(measures, v => Number.isFinite(v))) return undefined;
        } else {
          if(geometry || points) measures = measures.map(e => e.geometry);

          if(points)
            measures = measures
              .map(l => [...l])
              .flat()
              .filter(Util.uniquePred(Point.equals));
        }

        return measures;
      }
    }
  }

  /* prettier-ignore */ get measures() {
    return this.getMeasures({ points: true, bbox: true });
  }

  /* prettier-ignore */ get dimensions() {
    let size = new Rect(this.measures).size;
    size.units.width = size.units.height = 'mm';
    return size;
  }

  signalMap() {
    return new Map(
      [...this.signals].map(([name, signal]) => {
        let objects = [...signal.children]
          .map(child => [child, child.geometry])
          .filter(([child, geometry]) => !!geometry || child.tagName == 'contactref')
          .map(([child, geometry]) => child);

        return [name, objects];
      })
    );
  }

  getLayer(id) {
    for(let name_or_id of (id + '').split(/\s+/g).map(n => (+n !== NaN ? +n : n))) {
      const layer = this.layers[name_or_id];
      if(layer) return layer;
    }
  }

  getMainElement = Util.memoize(function () {
    //console.log('this:', this);
    switch (this.type) {
      case 'brd':
        return this.lookup('eagle/drawing/board');
      case 'sch':
        return this.lookup('eagle/drawing/schematic');
      case 'lbr':
        return this.lookup('eagle/drawing/library');
    }
  });

  /* prettier-ignore */ get mainElement() {
    return this.getMainElement();
  }
}
