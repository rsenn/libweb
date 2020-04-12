import Util from "../util.js";
import fs from "fs";
import path from "path";
import { EagleDocument } from "./document.js";

export class EagleProject {
  documents = [];

  constructor(filename) {
    this.filename = filename.replace(/\.(brd|sch)$/, "");

    this.open(this.filename + ".sch");
    this.open(this.filename + ".brd");

    this.loadLibraries();

    console.log("Opened project:", this.filename);
  }

  /**
   * @brief  Opens a document
   *
   * @param      {string}         filename  Document filename
   * @return     {EagleDocument}  The eagle document.
   */
  open(filename) {
    let doc, err;
    try {
      doc = new EagleDocument(filename);
    } catch(error) {
      err = error;
    }
    if(doc) this.documents.push(doc);
    else throw new Error("EagleProject: error opening " + filename);
    //console.log("Opened document:", filename);
    return doc;
  }

  get schematic() {
    return this.documents.find(doc => doc.type == "sch");
  }
  get board() {
    return this.documents.find(doc => doc.type == "brd");
  }
  get libraries() {
    return this.documents.filter(doc => doc.type == "lbr");
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
    return Util.unique([
      ...board.getAll(predicate, transform),
      ...schematic.getAll(predicate, transform)
    ]);
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
    console.log("names:", names);
    for(let name of names) {
      let lib = this.findLibrary(name, dirs);
      if(!lib) throw new Error(`EagleProject library '${name}' not found in ${dirs.join(".")}`);
      this.open(lib);
    }
  }

  saveTo = (dir = ".", overwrite = false) =>
    Promise.all(this.documents.map(doc => doc.saveTo(path.join(dir, doc.filename), overwrite)));
}
