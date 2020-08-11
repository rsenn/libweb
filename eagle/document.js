import tXml from '../tXml.js';
import Util from '../util.js';
import deep from '../deep.js';
import deepDiff from '../deep-diff.js';
import { EagleRef } from './ref.js';
import { ImmutablePath } from '../json.js';
import { EagleNode } from './node.js';
import { EagleElement } from './element.js';
import { BBox, Rect, PointList } from '../geom.js';
import { RGBA } from '../color.js';
import { EagleNodeList } from './nodeList.js';
import { PathMapper } from '../json/pathMapper.js';
import { Palette } from './common.js';
import { lazyProperty } from '../lazyInitializer.js';

export class EagleDocument extends EagleNode {
  static types = ['brd', 'sch', 'lbr'];
  xml = null;
  file = null;
  type = null;

  get typeName() {
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

  elementMapper = Util.weakMapper((raw, owner, ref) => new EagleElement(owner, ref, raw));

  static get [Symbol.species]() {
    return EagleElement;
  }

  constructor(xmlStr, project, filename, type, fs) {
    Util.log('EagleDocument.constructor', { data: Util.abbreviate(xmlStr), project, filename, type });
    const xml = tXml(xmlStr);

    let xmlObj = deep.clone(xml[0]); //(xml[0]);
    //Util.log('EagleDocument.constructor', xmlObj);

    super(project, EagleRef(xmlObj, []), xmlObj);

    this.pathMapper = new PathMapper(xmlObj, ImmutablePath);

    this.data = xmlStr;

    const { pathMapper, elementMapper } = this;

    const [obj2path, path2obj] = pathMapper.maps.map(Util.mapFunction);
    const [obj2eagle, path2eagle] = [Util.mapFunction(elementMapper), Util.mapAdapter((key, value) => (value === undefined ? this.lookup(key) : undefined))];
    const [eagle2path, eagle2obj] = [Util.mapAdapter((key, value) => (value === undefined ? key.path : undefined)), Util.mapAdapter((key, value) => (value === undefined ? key.raw : undefined))];

    this.maps = {
      eagle2obj,
      eagle2path,
      obj2eagle,
      obj2path,
      path2eagle,
      path2obj
    };

    type = type || /<library>/.test(xmlStr) ? 'lbr' : /(<element\ |<board)/.test(xmlStr) ? 'brd' : /(<instance\ |<sheets>|<schematic>)/.test(xmlStr) ? 'sch' : null;

    if(filename) {
      this.file = filename;
      type = type || filename.replace(/.*\//g, '').replace(/.*\./g, '');
    }
    //Util.log('load document:', { filename, xml: xmlStr.substring(0, 100), type });
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

    //Util.log("EagleDocument.constructor", {xmlStr,project,filename,type});
    this.initCache(EagleElement, EagleNodeList.create);

    lazyProperty(this, 'children', () => EagleNodeList.create(this, ['children'] /*, this.raw.children*/));
  }

  get raw() {
    return this.xml[0];
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
  saveTo(file, overwrite = false) {
    let  fs  = this.project ? this.project.fs  : this.fs;
    const data = this.toXML();

    if(!file)
       file = this.file;
     console.log("saveTo data: ",Util.abbreviate(data));

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
    yield* super.getAll(pred, transform || ((v, p, o) => EagleElement.get(this, p, v)));
  }

  find(pred, transform) {
    return super.find(pred, transform || ((v, p, o) => EagleElement.get(this, p, v)));
  }

  lookup(xpath) {
    //Util.log("EagleDocument.lookup(",...arguments, ")");

    let doc = this;
    return super.lookup(xpath, (o, p, v) => EagleElement.get(o, p, v));
  }

  getBounds(sheetNo = 0) {
    let bb = new BBox();

    if(this.type == 'brd') {
      const board = this.lookup(['eagle', 'drawing', 'board']);

      const measures = [...this.plain].filter(e => e.layer && e.layer.name == 'Measures');

      let ret;

      if(measures.length >= 4) ret = bb.update(measures);
      else ret = board.getBounds();
      //      console.log('ret', ret);
      //Util.log("board:", board, ret.objects);
      return ret;
    }

    let sheet = this.sheets ? this.sheets[sheetNo] : null;

    if(sheet) {
      return sheet.getBounds();

      let instances = sheet.instances;

      for(let instance of instances.list) {
        bb.update(instance.getBounds());
        /*
        let { gate, part } = instance;
        let symbol = gate.symbol;

        //Util.log('symbol:', symbol);
        let geometries = {
          gate: gate.geometry,
          symbol: new Rect(symbol.getBounds()).toPoints(),
          instance: instance.transformation()
        };

        //Util.log('geometries:', geometries);
        let matrix = geometries.instance.toMatrix();
        let points = new PointList([...matrix.transform_points(geometries.symbol)]);
        let bbrect = points.boundingRect();

        let sb = symbol.getBounds();
        let sbr = new Rect(sb);

        bb.update(bbrect, 0, instance);*/
      }
    } else if(this.elements) {
      Util.log('elements:', this.elements);
      for(let element of this.elements.list) {
        let bbrect = element.getBounds();

        bb.update(bbrect);
      }
    } else if(this.signals) {
      for(let signal of this.signals.list) {
        //Util.log('signal:', signal);
        let bbrect = signal.getBounds();

        bb.update(bbrect);
      }
    }

    return bb;
  }

  getMeasures(geometry = false) {
    //Util.log("this.type", this.type);

    let bounds = this.getBounds();
    let values = [...bounds.getObjects().values()];
    let measures = values.filter(obj => obj.layer && obj.layer.name == 'Measures');
    if(geometry) measures = measures.map(e => e.geometry);
    return measures.length > 0 ? measures : null;
  }

  get measures() {
    let bb = new BBox().update(this.getMeasures(true));
    let rect = new Rect(bb.rect).round(0.00127, 3);
    return rect;
  }

  get dimensions() {
    let size = this.measures.size;
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
}
