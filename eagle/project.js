import Util from '../util.js';
import { EagleDocument } from './document.js';
import { EagleElement } from './element.js';
import { EagleNodeMap } from './nodeMap.js';
import { dump } from './common.js';

export class EagleProject {
  documents = [];
  filename = null;
  data = { sch: null, brd: null, lbr: {} };

  constructor(file, fs = { readFile: filename => '', exists: filename => false }) {
    //  super();
    this.filename = file.replace(/\.(brd|sch)$/, '');
    this.fs = fs;

    this.eaglePath = EagleProject.determineEaglePath(fs); //.then(path => this.eaglePath = path);

    Util.tryCatch(() => this.open(this.filename + '.sch'));
    Util.tryCatch(() => this.open(this.filename + '.brd'));

    Util.tryCatch(
      () => this.loadLibraries(),
      () => {},
      () => (this.failed = true)
    );

    if(!this.schematic || !this.board) this.failed = true;

    if(!this.failed) console.log('Opened project:', this.filename, this.pathPath);
  }

  /**
   * @brief  Opens a ownerDocument
   *
   * @param      {string}         filename  Document filename
   * @return     {EagleDocument}  The eagle ownerDocument.
   */
  open(file) {
    let str, doc, err;
    str = this.fs.readFile(file);
    if(typeof str != 'string' && 'toString' in str) str = str.toString();

    //console.log('EagleProject.open', { file });
    try {
      doc = new EagleDocument(str, this, file);
    } catch(error) {
      err = error;
    }
    if(doc) this.documents.push(doc);
    else throw new Error(`EagleProject: error opening '${file}': ${err}`);
    //console.log("Opened:", file);

    if(doc.type == 'lbr') {
      this.data[doc.type][doc.basename] = doc;
      //console.log("Opened library:", doc.basename);
    } else this.data[doc.type] = doc;
    return doc;
  }

  static determineEaglePath(fs) {
    let path = Util.tryCatch(
      () => process.env['PATH'],
      path => path.split(/:/g),
      []
    );
    let bin;

    for(let dir of path) {
      bin = dir + '/eagle';

      if(fs.exists(bin)) {
        if(!/(eagle)/i.test(dir)) {
          bin = fs.realpath(bin);
          dir = bin.replace(/\/[^\/]+$/, '');
        }
        dir = dir.replace(/[\\\/]bin$/i, '');
        console.log('dir:', dir, bin);

        return dir;
      }
    }
  }

  /* prettier-ignore */ get schematic() {return this.documents.find(doc => doc.type == 'sch'); }
  /* prettier-ignore */ get board() {return this.documents.find(doc => doc.type == 'brd'); }
  /* prettier-ignore */ get libraries() {return this.documents.filter(doc => doc.type == 'lbr'); }
  /* prettier-ignore */ get root() { let children = this.documents; return { children }; }
  /* prettier-ignore */ get children() { let children = this.documents; return children; }
  /* prettier-ignore */ get library() { return this.data.lbr; }

  *iterator(t = ([v, l, d]) => [typeof v == 'object' ? EagleElement.get(d, l, v) : v, l, d]) {
    const project = this;
    for(let doc of this.documents) {
      let prefix = EagleProject.documentKey(doc);
      yield* doc.iterator(t);
    }
  }

  /* prettier-ignore */ static documentLocation(d) { return d.type == 'lbr' ? ['lbr',d.filename] : [d.type]; }

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

  getDocumentDirectories = () => Util.unique(this.documents.map(doc => doc.dirname));

  libraryPath() {
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

  findLibrary(name, dirs = this.libraryPath()) {
    for(let dir of dirs) {
      const file = `${dir}/${name}.lbr`;
      if(this.fs.exists(file)) return file;
    }
    return null;
  }

  loadLibraries(dirs = this.libraryPath()) {
    const names = this.getLibraryNames();
    //console.log('loadLibraries:', dirs, names);
    for(let name of names) {
      let lib = this.findLibrary(name, dirs);
      if(!lib) throw new Error(`EagleProject library '${name}' not found in:  \n${dirs.join('\n  ')}`);
      this.open(lib);
    }
  }

  updateLibrary(name) {
    const l = this.library;
    //console.log('name:', name);
    //console.log('library:', l);
    //console.log('documents:', this.documents);

    const { schematic, board } = this;

    let libraries = {
      file: l[name],
      schematic: schematic.libraries[name],
      board: board.libraries[name]
    };
    /*  let layers = {
      schematic: Util.toMap(
        schematic.layers.list.filter(l => l.active == 'yes'),
        l => [l.number, l]
      ),
      board: Util.toMap(
        board.layers.list.filter(l => l.active == 'yes'),
        l => [l.number, l]
      )
    };*/

    //console.log('libraries.schematic:', libraries.schematic);
    for(let k of ['schematic', 'board']) {
      //console.log(`project[${k}].libraries:`, this[k].libraries);
      //console.log(`libraries[${k}]:`, libraries[k]);
      //console.log(`libraries[${k}].packages:`, libraries[k].packages);
      const libProps = lib => lib;
      /*  const { packages, devicesets, symbols } = lib;
        return Object.fromEntries(['packages', 'symbols', 'devicesets'].map(k => [k, lib[k]]).filter(([k, v]) => v));
      };*/
      const destLib = libProps(libraries[k]);
      const srcLib = libProps(libraries.file);
      console.log('libraries', libraries);
      console.log('destLib', destLib);
      for(let entity of ['packages', 'symbols', 'devicesets']) {
        if(!(entity in destLib)) continue;
        if(!(destLib[entity] instanceof EagleNodeMap)) continue;
        /*console.log('destLib', destLib);
        console.log('destLib[entity]', destLib[entity]);*/

        const dstMap = destLib[entity];
        let ent = srcLib[entity].entries();
        let m = new Map(ent);
        //console.log(`dstMap:`, dstMap);
        //console.log(`dstMap:`, Util.className(dstMap));
        for(let value of srcLib[entity].values()) {
          const key = value.name;
          dstMap.set(key, value);
        }
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

  saveTo = (dir = '.', overwrite = false) => new Promise((resolve, reject) => Promise.all(this.documents.map(doc => doc.saveTo([dir, doc.filename].join('/'), overwrite))).then(result => resolve(Object.fromEntries(result))));
}
