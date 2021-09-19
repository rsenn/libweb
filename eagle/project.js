import Util from '../util.js';
import { EagleDocument } from './document.js';
import { EagleElement } from './element.js';
import { EagleNodeMap } from './nodeMap.js';
import { dump } from './common.js';
import path from '../path.js';
import * as fs from '../filesystem.js';

export class EagleProject {
  //basename = null;

  constructor(file, fs) {
    fs = fs || this.fs || globalThis.fs;
    //super();

    this.filenames = [];

    Util.define(this, {
      file,
      //  ...(file ? { dir: path.dirname(file) } : {}),
      documents: {},
      list: [],
      data: { sch: null, brd: null, lbr: {} },
      fs
    });

    const loadFile = file => {
      if(typeof file == 'string') {
        if(/\.(brd|sch)$/.test(file) || !/\.lbr$/.test(file)) this.basename = file.replace(/\.(brd|sch|lbr)$/i, '');
      }

      let dir = path.dirname(file);
      let libraryPath = [dir];
      dir = path.join(dir, 'lbr');
      if(fs.existsSync(dir)) libraryPath.push(dir);
      this.libraryPath = libraryPath;
      console.log('loadFile', file, this.basename);
      if(fs.existsSync(file)) this.lazyOpen(file);
      /*else*/ this.load();
    };

    EagleProject.determineEaglePath(fs).then(eaglePath => {
      this.eaglePath = eaglePath;
      console.log('EagleProject.constructor', { file }, this.eaglePath);

      if(file) {
        if(Array.isArray(file)) file.forEach(loadFile);
        else loadFile(file);
        if(!this.failed) console.log('Opened project:', this.basename, this.eaglePath);
      }
    });
  }

  load() {
    this.lazyOpen(this.basename + '.sch');
    this.lazyOpen(this.basename + '.brd');
    // this.loadLibraries() ;
    // if(!this.schematic || !this.board) this.failed = true;
    return !this.failed;
  }

  lazyOpen(file) {
    //console.log('EagleProject.lazyOpen', file);
    let index = this.filenames.length;
    this.filenames.push(file);
    Util.lazyProperty(
      this.documents,
      path.basename(file),
      () => {
        let doc = EagleDocument.open(file, this.fs);
        this.list[index] = doc;
        if(doc.libraries) this.addLibraries(doc.libraries.list.map(l => l.name));
        return doc;
      },
      { enumerable: true, configurable: true }
    );
  }

  addLibraries(libs) {
    for(let lib of libs) {
      let file = this.findLibrary(lib);
      if(file && this.filenames.indexOf(file) == -1) this.lazyOpen(file);
    }
  }

  /**
   * @brief  Opens a ownerDocument
   *
   * @param      {string}         basename  Document basename
   * @return     {EagleDocument}  The eagle ownerDocument.
   */
  open(file) {
    console.log('EagleProject.open', file);
    let doc, err;

    Util.tryCatch();

    try {
      doc = EagleDocument.open(file, this.fs);
    } catch(error) {
      err = error;
      console.log('ERROR:', err);
    }
    if(doc) {
      console.log('Opened document', file);
      this.filenames.push(file);
      this.list[path.basename(file)] = doc;
    } else throw new Error(`EagleProject: error opening '${file}': ${err}`);
    if(doc.type == 'lbr') {
      this.data[doc.type][doc.basename] = doc;
      console.log('Opened library:', doc.basename);
    } else this.data[doc.type] = doc;
    this.failed = !doc;
    return doc;
  }

  static async determineEaglePath(fs) {
    const envVar = await Util.getEnv('PATH');
    // console.log('envVar', { envVar });

    let searchPath = envVar.split(/:/g);
    let bin;
    for(let dir of searchPath) {
      bin = dir + '/eagle';
      if(!fs.existsSync(bin)) continue;
      if(!/(eagle)/i.test(dir)) {
        bin = fs.realpathSync(bin);
        dir = bin.replace(/\/[^\/]+$/, '');
      }
      dir = dir.replace(/[\\\/]bin$/i, '');
      console.log('dir:', dir, bin);
      return dir;
    }
  }

  findDocument(pred) {
    if(typeof pred == 'string') {
      let name = pred;
      if(name.indexOf('/') == -1) name = '(^|/)' + name;

      let re = new RegExp(name + '$');
      pred = name => re.test(name);
    }
    let names = Object.getOwnPropertyNames(this.documents);
    const name = names.find(pred);
    //console.log('findDocument', { names, name, pred: pred + '' });
    return this.documents[name];
  }
  getLibrary(name) {
    return this.findDocument(name + '.lbr');
  }

  get schematic() {
    return this.findDocument(name => /\.sch$/i.test(name));
  }
  get board() {
    return this.findDocument(name => /\.brd$/i.test(name));
  }
  get libraries() {
    return this.list.filter(doc => doc.type == 'lbr');
  }
  get root() {
    let children = this.list;
    return { children };
  }
  get children() {
    let children = this.list;
    return children;
  }

  *iterator(t = ([v, l, d]) => [typeof v == 'object' ? EagleElement.get(d, l, v) : v, l, d]) {
    const project = this;
    for(let doc of this.list) {
      let prefix = EagleProject.documentKey(doc);
      yield* doc.iterator(t);
    }
  }

  /* prettier-ignore */ static documentLocation(d) { return d.type == 'lbr' ? ['lbr',d.basename] : [d.type]; }

  static documentKey(d) {
    switch (d.type) {
      case 'sch':
        return ['schematic'];
      case 'brd':
        return ['board'];
      case 'lbr':
        return ['library', d.basename];
    }
    return null;
  }

  getDocumentDirectories() {
    return Util.unique(this.filenames.map(file => path.dirname(file)));
  }

  getLibraryPath() {
    let docDirs = this.getDocumentDirectories();
    let path = [...docDirs, ...docDirs.map(dir => `${dir}/lbr`)]; //.filter(fs.existsSync);
    if(this.eaglePath) path.push(this.eaglePath + '/lbr');
    return path;
  }

  getLibraryNames() {
    let libraryNames = [];

    Util.tryCatch(
      () => this.schematic.libraries.keys(),
      names => (libraryNames = libraryNames.concat(names))
    );
    Util.tryCatch(
      () => this.board.libraries.keys(),
      names => (libraryNames = libraryNames.concat(names))
    );

    return Util.unique(libraryNames);
  }

  findLibrary(name, dirs = this.libraryPath) {
    dirs ??= this.getLibraryPath();

    for(let dir of dirs) {
      const file = `${dir}/${name}.lbr`;
      if(this.fs.existsSync(file)) return file;
    }
    return null;
  }

  /*loadLibraries(dirs = this.libraryPath) {
    const names = this.getLibraryNames();
     for(let name of names) {
      let lib = this.findLibrary(name, dirs);
      if(!lib)
        throw new Error(`EagleProject library '${name}' not found in:  \n${dirs.join('\n  ')}`);
      this.lazyOpen(lib);
    }
  }*/

  updateLibrary(name) {
    const l = this.library;

    const { schematic, board } = this;

    let libraries = {
      file: this.getLibrary(name),
      schematic: schematic.libraries[name],
      board: board.libraries[name]
    };

    /*  let layers = {
      schematic: Util.toMap(schematic.layers.list.filter(l => l.active == 'yes'),
        l => [l.number, l]
      ),
      board: Util.toMap(board.layers.list.filter(l => l.active == 'yes'),
        l => [l.number, l]
      )
    };*/

    //console.log('libraries.schematic:', libraries.schematic);
    for(let destDoc of ['schematic', 'board']) {
      //console.log(`project[${destDoc}].libraries:`, this[destDoc].libraries);
      //console.log(`libraries[${destDoc}]:`, libraries[destDoc]);
      //console.log(`libraries[${destDoc}].packages:`, libraries[destDoc].packages);
      const libProps = lib => lib;

      /*  const { packages, devicesets, symbols } = lib;
        return Object.fromEntries(['packages', 'symbols', 'devicesets'].map(destDoc => [destDoc, lib[destDoc]]).filter(([destDoc, v]) => v));
      };*/
      const destLib = libProps(libraries[destDoc]);
      const srcLib = libProps(libraries.file);
      //console.log('libraries', libraries);
      //console.log('destLib', destLib);
      for(let entity of ['packages', 'symbols', 'devicesets']) {
        if(!(entity in destLib)) continue;
        if(!(destLib[entity] instanceof EagleNodeMap)) continue;

        /*console.log('destLib', destLib);
        //console.log('destLib[entity]', destLib[entity]);*/
        const dstMap = destLib[entity];
        let ent = srcLib[entity].entries();
        let m = new Map(ent);
        //console.log(`dstMap:`, dstMap);
        //console.log(`dstMap:`, Util.className(dstMap));
        let numUpdated = 0;
        for(let value of srcLib[entity].values()) {
          const key = value.name;
          //         console.log("set",{key,value});
          dstMap.set(key, value);
          numUpdated++;
        }
        console.log('update', { destDoc, destLib, entity, numUpdated });
        //console.log('dstMap.ref:', dump(dstMap.ref, 2));
        //console.log('dstMap.raw:', dump(dstMap.raw, 2));
        //console.log('dstMap.keys:', dump(dstMap.raw.map(item => item.attributes.name).sort(), 2));
        //console.log('dstMap.keys:', dump(dstMap.keys().length, 2));
        //console.log('dstMap.map:', dump(dstMap.map().size, 2));
      }
    }
  }

  index(l) {
    let path = [...l];
    let key = path.shift();
    let doc, name;

    if(path.length == 0) return this;

    switch (key) {
      case 'board':
      case 'schematic':
        doc = this[key];
        break;
      case 'library':
        name = path.shift();
        doc = this[key][name];
        break;
      default:
        break;
    }
    if(!doc || !doc.index) {
      throw new Error('ERROR: project.index(' + l.join(', ') + ' )');
      return null;
    }
    if(path.length == 0) return doc;
    return doc.index(path);
  }

  saveTo(dir = '.', overwrite = false) {
    return new Promise((resolve, reject) => {
      let promises = this.list.map(doc => [doc.basename, doc.saveTo([dir, doc.basename].join('/'), overwrite, this.fs)]);

      return Promise.all(promises).then(result => {
        console.log('result:', result);
        resolve(Object.fromEntries(result));
      });
    });
  }
}
