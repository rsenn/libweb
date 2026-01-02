import { RGBA } from '../color/rgba.js';
import deepDiff from '../deep-diff.js';
import * as deep from '../deep.js';
import { BBox } from '../geom.js';
import { Rect } from '../geom.js';
import { ImmutablePath } from '../json.js';
import { PathMapper } from '../json/pathMapper.js';
import { define } from '../misc.js';
import { lazyProperties } from '../misc.js';
import { lazyProperty } from '../misc.js';
import { mapAdapter } from '../misc.js';
import { mapFunction } from '../misc.js';
import { nonenumerable } from '../misc.js';
import { properties } from '../misc.js';
import { tryCatch } from '../misc.js';
import { weakMapper } from '../misc.js';
import { read as fromXML } from '../xml.js';
import { write as toXML } from '../xml.js';
import { Palette } from './common.js';
import { EagleElement } from './element.js';
import { EagleNode } from './node.js';
import { EagleNodeList } from './nodeList.js';
import { EagleNodeMap } from './nodeMap.js';
import { EagleRef } from './ref.js';
function GetProxy(fn = (prop, target) => null, handlers = {}) {
  return new Proxy(
    {},
    {
      get(target, prop, receiver) {
        let ret = fn(prop, target);
        return ret;
      },
      ...handlers,
    },
  );
}

export class EagleDocument extends EagleNode {
  static types = ['brd', 'sch', 'lbr'];
  xml = null;
  file = null;
  type = null;

  get typeName() {
    return {
      brd: 'board',
      sch: 'schematic',
      lbr: 'library',
    }[this.type];
  }

  static typeName(fileExtension) {
    return {
      brd: 'board',
      sch: 'schematic',
      lbr: 'library',
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
    const xml = readFn(filename);

    return new EagleDocument(xml, null, filename);
  }

  constructor(xmlStr, project, filename, type, fs) {
    const xml = fromXML(xmlStr); //parseXML(xmlStr);

    let xmlObj = deep.clone(xml[0]);

    //console.log('EagleDocument.constructor', console.config({ compact: 0, depth: 2 }), { xmlObj });

    super(project, EagleRef(xmlObj, []), xmlObj);

    define(
      this,
      nonenumerable({
        pathMapper: new PathMapper(xmlObj, ImmutablePath),
        data: xmlStr,
        raw2element: weakMapper((raw, owner, ref) => new EagleElement(owner, ref, raw)),
      }),
    );

    const { pathMapper, raw2element } = this;

    const [obj2path, path2obj] = pathMapper.maps.map(mapFunction);
    const [obj2eagle, path2eagle] = [mapFunction(raw2element), mapAdapter((key, value) => (value === undefined && key !== undefined ? this.lookup(key) : undefined))];
    const [eagle2path, eagle2obj] = [
      mapAdapter((key, value) => (value === undefined && key !== undefined ? key.path : undefined)),
      mapAdapter((key, value) => (value === undefined && key !== undefined ? key.raw : undefined)),
    ];

    define(this, nonenumerable({ maps: { eagle2obj, eagle2path, obj2eagle, obj2path, path2eagle, path2obj } }));

    type = type || /<library>/.test(xmlStr) ? 'lbr' : /(<element\ |<board)/.test(xmlStr) ? 'brd' : /(<instance\ |<sheets>|<schematic>)/.test(xmlStr) ? 'sch' : null;

    if(filename) {
      this.file = filename;
      type = type || filename.replace(/.*\//g, '').replace(/.*\./g, '');
    }

    this.type = type;

    if(project) this.owner = project;

    const orig = xml[0];

    define(
      this,
      nonenumerable({
        xml,
        orig,
        fs,
        palette: Palette[this.type == 'brd' ? 'board' : 'schematic']((r, g, b) => new RGBA(r, g, b)),
      }),
    );

    //lazyProperty(this, 'children', () => EagleNodeList.create(this, ['children'] /*, this.raw.children*/));

    if(this.type == 'sch') {
      const schematic = this.lookup('eagle/drawing/schematic') ?? this.get('schematic');
      define(
        this,
        properties(
          {
            plain: () => this.lookup('eagle/drawing/board/plain') ?? this.get('plain'),
            sheets: () => schematic.sheets,
            parts: () => schematic.parts,
            libraries: () => schematic.libraries,
          },
          { enumerable: false },
        ),
      );
    }

    lazyProperty(this, 'layers', () => EagleNodeMap.create(this./*lookup('eagle/drawing').lookup*/ get('layers').children, ['name', 'number']));
    //lazyProperties({ layers: () => EagleNodeMap.create(this.get('layers').children, ['name', 'number']) });

    if(this.type == 'brd') {
      let board = this.get('board');

      define(
        this,
        properties(
          {
            plain: () => this.lookup('eagle/drawing/board/plain') ?? this.get('plain'),
            board: () => board,
            elements: () => board.elements,
            libraries: () => board.libraries,
            signals: () => board.signals,
          },
          { enumerable: false },
        ),
      );
    }

    //lazyProperty(this, 'children', () => EagleNodeList.create(this, this.path.concat(['children']), null));
  }

  get raw() {
    if(Array.isArray(this.xml)) return this.xml[0];

    //console.log('EagleDocument.get raw', { this: this.orig, xml: this.xml });

    return this.xml;
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
          ['eagle', 'drawing', 'schematic'],
          ['eagle', 'drawing', 'schematic', 'libraries'],
          ['eagle', 'drawing', 'schematic', 'classes'],
          ['eagle', 'drawing', 'schematic', 'parts'],
          //['eagle', 'drawing', 'schematic', 'sheets']
        ];
      case 'brd':
        return [
          ['eagle', 'drawing', 'settings'],
          ['eagle', 'drawing', 'board'],
          ['eagle', 'drawing', 'board', 'libraries'],
          ['eagle', 'drawing', 'board', 'classes'],
          ['eagle', 'drawing', 'board', 'designrules'],
          ['eagle', 'drawing', 'board', 'elements'],
          ['eagle', 'drawing', 'board', 'signals'],
          ['eagle', 'drawing', 'board', 'plain'],
        ];
      case 'lbr':
        return [
          ['eagle', 'drawing', 'settings'],
          ['eagle', 'drawing', 'library'],
          ['eagle', 'drawing', 'library', 'packages'],
          ['eagle', 'drawing', 'library', 'symbols'],
          ['eagle', 'drawing', 'library', 'devicesets'],
        ];
    }
    return super.cacheFields();
  }

  saveTo(file, overwrite = false, fs) {
    const data = this.toXML('  ');

    if(!file) file = this.file;

    fs = fs || this.fs || globalThis.fs;
    fs.writeFileSync(file + '.json', JSON.stringify(this.raw, null, 2), true);

    //console.log('Saving', file, 'data: ',abbreviate(data));
    const ret = fs.writeFileSync(file, data, overwrite);

    if(ret < 0) throw new Error(`Writing file '${file}' failed: ${fs.errstr}`);

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
    return super.lookup(xpath, (owner, ref, value) => {
      ref = EagleRef(this.raw, ref, true);
      //console.log('EagleDocument.lookup',console.config({depth: 4}),{owner,ref});

      return EagleElement.get(owner ?? this, ref, value);
    });
  }

  getBounds(sheetNo = 0) {
    let bb = new BBox();

    if(this.type == 'sch') {
      const sheet = this.getSheet(sheetNo);

      return sheet.getBounds(v => /(instance|net)/.test(v.tagName));
    }

    if(this.type == 'brd') return this.board.getBounds();

    if(this.elements)
      for(let element of this.elements.list) {
        const bbrect = element.getBounds();

        bb.update(bbrect);
      }

    if(this.signals) {
      bb.update(
        [...this.signals.list]
          .map(sig => [...sig.children])
          .flat()
          .filter(c => !!c.geometry),
      );

      bb.update([...this.elements.list].map(e => e.package.getBounds().toRect(Rect.prototype).transform(e.transformation())));
    }

    /*if(this.plain)
      bb.update(this.plain.map(child => child.getBounds()));*/
    return bb;
  }

  getMeasures(options = {}) {
    try {
      const { sheet = 0 } = options;
      let ret,
        plain = (this.type == 'sch' ? this.sheets[sheet] : this).plain;

      for(let layer of ['Dimension', 'Measures', 'Document']) {
        if(!this.layers[layer]) continue;

        const layerId = this.layers[layer].number;

        ret = [...(plain?.children ?? plain)].filter(e => +e.attributes.layer == layerId && e.tagName == 'wire');

        if(ret.length >= 1) break;
      }

      if(options.bbox) if (ret) ret = BBox.from(ret);

      return ret;
    } catch(e) {
      console.error('EagleDocument.getMeasures', e.message);
      console.error(e.stack);
    }
  }

  get measures() {
    return tryCatch(() => this.getMeasures({ points: true, bbox: true }));
  }

  get dimensions() {
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
      }),
    );
  }

  getLayer(id) {
    let layers = this.get('layers'),
      i = 0;

    for(let layer of layers.raw.children) {
      const { number, name } = layer.attributes;

      if(number == id || name == id) return layers.children[i];

      i++;
    }

    return null;
  }

  getSheet(id) {
    const sheets = this.get('sheets');

    if(!sheets) return null;

    if(id in sheets.children) return sheets.children[id];

    let i = 0;

    for(let sheet of sheets.children) {
      if(i == id) return sheet;

      i++;
    }

    return null;
  }

  getLibrary(name) {
    try {
      return this.get(e => e.tagName == 'library' && e.attributes.name == name);
    } catch(e) {}
  }
}

define(EagleDocument.prototype, { [Symbol.toStringTag]: 'EagleDocument' });