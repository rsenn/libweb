import Util from "../util.js";
import fs from "fs";
import path from "path";
import { EagleDocument } from "./document.js";
import { EagleInterface } from "./common.js";

export class EagleProject extends EagleInterface {
  documents = [];
  filename = null;
  data = { sch: null, brd: null, lbr: {} };

  constructor(file) {
    super();
    this.filename = file.replace(/\.(brd|sch)$/, "");
    this.open(this.filename + ".sch");
    this.open(this.filename + ".brd");
    this.loadLibraries();
    console.log("Opened project:", this.filename);
  }

  /**
   * @brief  Opens a ownerDocument
   *
   * @param      {string}         filename  Document filename
   * @return     {EagleDocument}  The eagle ownerDocument.
   */
  open(file) {
    let doc, err;
    try {
      doc = new EagleDocument(file, this);
    } catch(error) {
      err = error;
    }
    if(doc) this.documents.push(doc);
    else throw new Error(`EagleProject: error opening '${file}': ${err}`);
    //console.log("Opened ownerDocument:", filename);

    if(doc.type == "lbr") this.data[doc.type][doc.basename] = doc.root;
    else this.data[doc.type] = doc.root;
    return doc;
  }

  /* prettier-ignore */ get schematic() {return this.documents.find(doc => doc.type == "sch"); }
  /* prettier-ignore */ get board() {return this.documents.find(doc => doc.type == "brd"); }
  /* prettier-ignore */ get libraries() {return this.documents.filter(doc => doc.type == "lbr"); }
  /* prettier-ignore */ get root() { let children = this.documents; return { children }; }
  /* prettier-ignore */ get children() { let children = this.documents; return children; }
  /* prettier-ignore */ get library() { return this.data.lbr; }

  *iterator(t = ([v, l, h, d]) => [v.tagName ? new EagleEntity(d, l) : v, l, h, d]) {
    for(let d of this.documents) yield* d.iterator(([v, l, h, d]) => t([v, [...EagleProject.documentKey(d), ...l], h, this]));
  }

  /* prettier-ignore */ static documentLocation(d) { return d.type == 'lbr' ? ['lbr',d.filename] : [d.type]; }

  static documentKey(d) {
    switch (d.type) {
      case "sch":
        return ["schematic"];
      case "brd":
        return ["board"];
      case "lbr":
        return ["library", d.basename];
    }
  }

  getDocumentDirectories = () => Util.unique(this.documents.map(doc => doc.dirname));

  libraryPath() {
    let docDirs = this.getDocumentDirectories();
    return [...docDirs, ...docDirs.map(dir => `${dir}/lbr`)].filter(fs.existsSync);
  }

  getLibraryNames() {
    const { board, schematic } = this;
    const transform = ([v, l, h, d]) => v.attributes.name;
    const predicate = (v, l, h, d) => v.tagName == "library";
    return Util.concat(board.getAll(predicate, transform), schematic.getAll(predicate, transform));
  }

  findLibrary(name, dirs = this.libraryPath()) {
    for(let dir of dirs) {
      const file = `${dir}/${name}.lbr`;
      if(fs.existsSync(file)) return file;
    }
    return null;
  }

  loadLibraries(dirs = this.libraryPath()) {
    let names = this.getLibraryNames();
    //console.log("names:", names);
    for(let name of names) {
      let lib = this.findLibrary(name, dirs);
      if(!lib) throw new Error(`EagleProject library '${name}' not found in ${dirs.join(".")}`);
      this.open(lib);
    }
  }

  saveTo = (dir = ".", overwrite = false) => Promise.all(this.documents.map(doc => doc.saveTo(path.join(dir, doc.filename), overwrite)));
}