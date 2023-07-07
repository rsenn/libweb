import parseXML from '../xml/parse.js';
import tXml from '../tXml.js';
import { define, properties, abbreviate, mapAdapter, mapFunction, memoize, weakMapper } from '../misc.js';
import * as deep from '../deep.js';
import deepDiff from '../deep-diff.js';
import { EagleRef } from './ref.js';
import { ImmutablePath } from '../json.js';
import { EagleNode } from './node.js';
import { EagleElement } from './element.js';
import { LinesToPath } from './renderUtils.js';
import { isBBox, BBox, Rect, Point, PointList, Line } from '../geom.js';
import { RGBA } from '../color/rgba.js';
import { EagleNodeList } from './nodeList.js';
import { EagleNodeMap } from './nodeMap.js';
import { PathMapper } from '../json/pathMapper.js';
import { Palette } from './common.js';
import { read as fromXML, write as toXML } from '../xml.js';
import { ImmutableXPath } from '../xml/xpath.js';
import { lazyProperty, lazyProperties } from '../misc.js';

function GetProxy(fn = (prop, target) => null, handlers = {}) {
  return new Proxy(
    {},
    {
      get(target, prop, receiver) {
        let ret = fn(prop, target);
        return ret;
      },
      ...handlers
    }
  );
}

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

  static open(filename, readFn = fn => std.loadFile(fn)) {
    let xml = readFn(filename);
    //console.log('EagleDocument.open', { filename, xml });
    return new EagleDocument(xml, null, filename);
  }

  constructor(xmlStr, project, filename, type, fs) {
    const xml = fromXML(xmlStr); //parseXML(xmlStr);
    // console.log('EagleDocument.constructor', { xml });

    let xmlObj = deep.clone(xml[0]);
    super(project, EagleRef(xmlObj, []), xmlObj);

    define(this, {
      pathMapper: new PathMapper(xmlObj, ImmutablePath),
      data: xmlStr,
      raw2element: weakMapper((raw, owner, ref) => new EagleElement(owner, ref, raw))
    });

    const { pathMapper, raw2element } = this;

    const [obj2path, path2obj] = pathMapper.maps.map(mapFunction);
    const [obj2eagle, path2eagle] = [mapFunction(raw2element), mapAdapter((key, value) => (value === undefined && key !== undefined ? this.lookup(key) : undefined))];
    const [eagle2path, eagle2obj] = [
      mapAdapter((key, value) => (value === undefined && key !== undefined ? key.path : undefined)),
      mapAdapter((key, value) => (value === undefined && key !== undefined ? key.raw : undefined))
    ];

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
    if(fs) define(this, { fs });
    define(this, { xml });
    const orig = xml[0];
    define(this, { orig });
    define(this, { palette: Palette[this.type == 'brd' ? 'board' : 'schematic']((r, g, b) => new RGBA(r, g, b)) });

    //console.log("EagleDocument.constructor", {xmlStr,project,filename,type});
    // this.initCache(EagleElement, EagleNodeList.create);

    //lazyProperty(this, 'children', () => EagleNodeList.create(this, ['children'] /*, this.raw.children*/));

    if(this.type == 'sch') {
      //   let schematic = this.lookup('eagle/drawing/schematic');

      let sheets = this.lookup('eagle/drawing/schematic/sheets');
      let parts = this.lookup('eagle/drawing/schematic/parts');
      let libraries = this.lookup('eagle/drawing/schematic/libraries');

      define(
        this,
        properties(
          {
            sheets: () => EagleNodeList.create(sheets, sheets.path.concat(['children'])),
            parts: () => EagleNodeMap.create(parts.children, 'name'), // EagleNodeList.create(parts, parts.path.concat(['children'])),
            libraries: () => EagleNodeMap.create(libraries.children, 'name')
          },
          { memoize: true }
        )
      );
    }
    if(this.type == 'brd') {
      const board = /*this.get('board') ??*/ this.lookup('eagle/drawing/board');
 
      lazyProperties(this, {
        signals: () => EagleNodeMap.create(board.lookup('signals').children, 'name'),
        plain: () => EagleNodeList.create(board.lookup('plain'), ['children']),
        elements: () => EagleNodeMap.create(board.lookup('elements').children, 'name'),
        libraries: () => EagleNodeMap.create(board.lookup('libraries').children, 'name')
      });
    }

    lazyProperty(this, 'children', () => EagleNodeList.create(this, this.path.concat(['children']), null));

    let drawing = this.lookup('eagle/drawing');
    //console.log('drawing', drawing.raw);

    let layers = /*drawing.get('layers') /*?? */ this.lookup('eagle/drawing/layers');
    //console.log('layers', layers);

    lazyProperties(this, {
      drawing: () => drawing,
      layers: () => EagleNodeMap.create(layers.children, 'name')
    });
  }

  /* prettier-ignore */ get raw() {
    if(Array.isArray(this.xml))
    return this.xml[0];
  //console.log('EagleDocument.get raw', { 'this': this.orig,xml: this.xml });
  return this.xml;

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

    //console.log('Saving', file, 'data: ',abbreviate(data));
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

  get(pred, transform) {
    return super.get(pred, transform || ((v, p, o) => EagleElement.get(this, p, v)));
  }

  find(pred, transform) {
    return super.find(pred, transform || ((v, p, o) => EagleElement.get(this, p, v)));
  }

  lookup(xpath) {
    let doc = this;
    return super.lookup(xpath, (o, p, v) => {
      //console.log('EagleDocument.lookup', console.config({ depth: 4 }), { o, p, v });
      return EagleElement.get(o, p, v);
    });
  }

  getBounds(sheetNo = 0) {
    let bb = new BBox();
    let sheet = this.sheets ? this.sheets[sheetNo] : null;
    if(this.type == 'sch') {
      return this.sheets[sheetNo].getBounds(v => /(instance|net)/.test(v.tagName));
    }

    if(this.elements) {
      console.log('this.elements', this.elements);
      for(let element of this.elements.list) {
        console.log('element', element);
        let bbrect = element.getBounds();
        bb.update(bbrect);
      }
    }
    if(this.signals) {
      bb.update(
        [...this.signals.list]
          .map(sig => [...sig.children])
          .flat()
          .filter(c => !!c.geometry)
      );
      bb.update([...this.elements.list].map(e => e.package.getBounds().toRect(Rect.prototype).transform(e.transformation())));
    }
    /*if(this.plain) {
      bb.update(this.plain.map(child => child.getBounds()));
    }*/
    console.log('bb', bb);
    return bb;
  }

  getMeasures(options = {}) {
    const { sheet = 0 } = options;
    let ret;
    let plain = (this.type == 'sch' ? this.sheets[sheet] : this).get('plain');

    //console.log('plain', plain);

    for(let layer of ['Dimension', 'Measures']) {
      let layerId = this.layers[layer].number;

      ret = [...plain.children].filter(e => e.attributes.layer == layerId);

      if(ret.length >= 1) break;
    }

    if(options.bbox) if (ret) ret = BBox.from(ret);
   //console.log('EagleDocument.getMeasures', ret);

    return ret;
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
    let layers = this.lookup('eagle/drawing/layers');
    let i = 0;

    for(let layer of layers.raw.children) {
      let { number, name } = layer.attributes;
      // console.log('layer', { number, name });
      if(number == id || name == id) return layers.children[i];
      i++;
    }
    return null;
  }

  getSheet(id) {
    let sheets = this.get('sheets');

    if(!sheets) return null;

    let i = 0;

    for(let sheet of sheets.children) {
      if(i == id) return sheet;
      i++;
    }
    return null;
  }

  getLibrary(name) {
    return this.libraries[name];
  }

  /*getMainElement = memoize(function () {
    switch (this.type) {
      case 'brd':
        return this.lookup('eagle/drawing/board');
      case 'sch':
        return this.lookup('eagle/drawing/schematic');
      case 'lbr':
        return this.lookup('eagle/drawing/library');
    }
  });

  get mainElement() {
    return this.getMainElement();
  }*/
}

define(EagleDocument.prototype, { [Symbol.toStringTag]: 'EagleDocument' });
