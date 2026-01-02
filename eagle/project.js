import * as fs from '../filesystem.js';
import { define } from '../misc.js';
import { properties } from '../misc.js';
import { tryCatch } from '../misc.js';
import { unique } from '../misc.js';
import { weakDefine } from '../misc.js';
import * as path from '../path.js';
import process from '../process.js';
import { EagleDocument } from './document.js';
import { EagleElement } from './element.js';
import { EagleNodeMap } from './nodeMap.js';

export class EagleProject {
  constructor(file, fs) {
    fs = fs || this.fs || globalThis.fs;

    this.filenames = [];

    define(this, {
      file,

      documents: {},
      list: [],
      data: { sch: null, brd: null, lbr: {} },
      fs,
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

      if(fs.existsSync(file)) this.lazyOpen(file);
      this.load();
    };

    this.eaglePath = EagleProject.determineEaglePath(fs);

    if(file) {
      if(Array.isArray(file)) file.forEach(loadFile);
      else loadFile(file);
      //if(!this.failed) console.log('Opened project:', this.basename, this.eaglePath);
    }
  }

  load(name = this.basename) {
    this.basename = name;
    this.lazyOpen(this.basename + '.sch');
    this.lazyOpen(this.basename + '.brd');

    return !this.failed;
  }

  lazyOpen(file) {
    let index;

    if((index = this.filenames.indexOf(file)) == -1) {
      index = this.filenames.length;
      this.filenames.push(file);
    }

    weakDefine(
      this.documents,
      properties(
        {
          [path.basename(file)]: () => {
            const doc = EagleDocument.open(file);

            //console.log('EagleProject.lazyOpen', console.config({ depth: 1 }), { file,  index });

            this.list[index] = doc;

            if(doc.libraries) this.addLibraries([...doc.libraries.list].map(l => l.name));

            return doc;
          },
        },
        { memoize: true, configurable: true, enumerable: true },
      ),
    );
  }

  close(file) {
    let index;

    if((index = this.filenames.indexOf(file)) != -1) {
      [index] = this.filenames.splice(index, 1);

      delete this.documents[path.basename(file)];
    }
    return index;
  }

  closeAll() {
    while(this.filenames.length > 0) this.close(this.filenames[0]);
  }

  addLibraries(libs) {
    for(let lib of libs) {
      let file = this.findLibrary(lib);
      if(file && this.filenames.indexOf(file) == -1) this.lazyOpen(file);
    }
  }

  /** @brief  Opens a ownerDocument
   *
   * @param      {string}         basename  Document basename
   * @return     {EagleDocument}  The eagle ownerDocument.
   */
  open(file) {
    let doc, err;

    tryCatch();

    try {
      doc = EagleDocument.open(file, this.fs);
    } catch(error) {
      err = error;
      //console.log('ERROR:', err);
    }
    if(doc) {
      console.log('Opened document', file);
      if(this.filenames.indexOf(file) == -1) this.filenames.push(file);
      this.list[path.basename(file)] = doc;
    } else throw new Error(`EagleProject: error opening '${file}': ${err}`);
    if(doc.type == 'lbr') {
      this.data[doc.type][doc.basename] = doc;
      console.log('Opened library:', doc.basename);
    } else this.data[doc.type] = doc;
    this.failed = !doc;
    return doc;
  }

  static determineEaglePath(fs) {
    let envVar;
    if(!envVar)
      try {
        envVar = process.env['PATH'];
      } catch(e) {}
    envVar ??= '';

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

    return this.documents[name];
  }

  getLibrary(name) {
    return this.findDocument(name + '.lbr');
  }

  get schematic() {
    const { documents, filenames } = this;
    const name = filenames.find(f => /\.sch$/i.test(f));
    if(name) return documents[name.replace(/.*[\/\\]/g, '')];
  }

  get board() {
    const { documents, filenames } = this;
    const name = filenames.find(f => /\.brd$/i.test(f));
    if(name) return documents[name.replace(/.*[\/\\]/g, '')];
  }

  get libraries() {
    const { documents, filenames } = this;
    const names = filenames.filter(f => /\.lbr$/i.test(f)).map(f => f.replace(/.*[\/\\]/g, ''));
    return names.map(n => documents[n]);
  }

  get root() {
    const { list: children } = this;
    return { children };
  }

  get children() {
    const { list: children } = this;
    return children;
  }

  *iterator(t = ([v, l, d]) => [typeof v == 'object' ? EagleElement.get(d, l, v) : v, l, d]) {
    const project = this;
    for(let doc of this.list) {
      let prefix = EagleProject.documentKey(doc);
      yield* doc.iterator(t);
    }
  }

  static documentLocation(d) {
    return d.type == 'lbr' ? ['lbr', d.basename] : [d.type];
  }

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
    return unique(this.filenames.map(file => path.dirname(file)));
  }

  getLibraryPath() {
    let docDirs = this.getDocumentDirectories();
    let path = [...docDirs, ...docDirs.map(dir => `${dir}/lbr`)];
    if(this.eaglePath) path.push(this.eaglePath + '/lbr');
    return path;
  }

  getLibraryNames() {
    let libraryNames = [];

    tryCatch(
      () => this.schematic.libraries.keys(),
      names => (libraryNames = libraryNames.concat(names)),
    );
    tryCatch(
      () => this.board.libraries.keys(),
      names => (libraryNames = libraryNames.concat(names)),
    );

    return unique(libraryNames);
  }

  findLibrary(name, dirs = this.libraryPath) {
    dirs ??= this.getLibraryPath();

    for(let dir of dirs) {
      const file = `${dir}/${name}.lbr`;
      if(this.fs.existsSync(file)) return file;
    }
    return null;
  }

  updateLibrary(name) {
    const l = this.library;

    const { schematic, board } = this;

    let libraries = {
      file: this.getLibrary(name),
      schematic: schematic.getLibrary(name),
      board: board.getLibrary(name),
    };

    for(let destDoc of ['schematic', 'board']) {
      const libProps = lib => lib;

      const destLib = libProps(libraries[destDoc]);
      const srcLib = libProps(libraries.file);

      for(let entity of ['packages', 'symbols', 'devicesets']) {
        if(!(entity in destLib)) continue;
        if(!(destLib[entity] instanceof EagleNodeMap)) continue;

        const dstMap = destLib[entity];
        let ent = srcLib[entity].entries();
        let m = new Map(ent);

        let numUpdated = 0;
        for(let value of srcLib[entity].values()) {
          const key = value.name;

          dstMap.set(key, value);
          numUpdated++;
        }
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
        resolve(Object.fromEntries(result));
      });
    });
  }
}

EagleProject.prototype[Symbol.toStringTag] = 'EagleProject';