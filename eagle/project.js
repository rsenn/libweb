import Util from "../util.js";
import fs from "fs";
import path from "path";
import { EagleDocument } from "./document.js";
import { EagleEntity } from "./entity.js";
import { dump, inspect } from "./common.js";
import { SortedMap } from "../indexMap.js";
import deep from "../deep.js";

export class EagleProject {
  documents = [];
  filename = null;
  data = { sch: null, brd: null, lbr: {} };

  constructor(file) {
    //  super();
    this.filename = file.replace(/\.(brd|sch)$/, "");
    this.open(this.filename + ".sch");
    this.open(this.filename + ".brd");

    console.log("libraries:");
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

    if(doc.type == "lbr") this.data[doc.type][doc.basename] = doc;
    else this.data[doc.type] = doc;
    return doc;
  }

  /* prettier-ignore */ get schematic() {return this.documents.find(doc => doc.type == "sch"); }
  /* prettier-ignore */ get board() {return this.documents.find(doc => doc.type == "brd"); }
  /* prettier-ignore */ get libraries() {return this.documents.filter(doc => doc.type == "lbr"); }
  /* prettier-ignore */ get root() { let children = this.documents; return { children }; }
  /* prettier-ignore */ get children() { let children = this.documents; return children; }
  /* prettier-ignore */ get library() { return this.data.lbr; }

  *iterator(t = ([v, l, d]) => [typeof v == "object" ? new EagleEntity(d, l, v) : v, l, d]) {
    const project = this;
    for(let doc of this.documents) {
      let prefix = EagleProject.documentKey(doc);
      yield* doc.iterator(t);
    }
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
    return null;
  }

  getDocumentDirectories = () => Util.unique(this.documents.map(doc => doc.dirname));

  libraryPath() {
    let docDirs = this.getDocumentDirectories();
    return [...docDirs, ...docDirs.map(dir => `${dir}/lbr`)].filter(fs.existsSync);
  }

  *getLibraryNames() {
    for(let [v, l, d] of this.board.iterator()) {
      //[], it => it /*([v,l,d]) => [typeof(v) == 'string' ? v : new EagleEntity(d,l),l,d]*/)) {
      if(v.tagName != "library") continue;
      // console.log("it:", { v, l, d });

      yield v.attributes.name;
    }
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

  updateLibrary(name) {
    const library = this.library[name];
    const { schematic, board } = this;
    const entityNames = ["package", "symbol", "deviceset"];

    let libraries = {
      file: library,
      schematic: schematic.getByName("library", name),
      board: board.getByName("library", name)
    };
    let layers = {
      schematic: Util.toMap(
        schematic.layers.filter(l => l.active == "yes"),
        l => [l.number, l]
      ),
      board: Util.toMap(
        board.layers.filter(l => l.active == "yes"),
        l => [l.number, l]
      )
    };
    let entities = new Map(entityNames.map(entity => [entity, library.getMap(entity)]));
    console.log("entities:", entities);
    console.log("libraries.schematic:", libraries.schematic);

    for(let k of ["schematic", "board"]) {
      // const { packages = [], devicesets = destLib.appendChild("devicesets"), symbols = destLib.appendChild("symbols") } = destLib;

      const libProps = lib => {
        /*  const { packages, devicesets = new Map(), symbols = new Map() } =  */ return Object.fromEntries(
          ["packages", "symbols", "devicesets"]
            .map(k => [k, lib[k]])
            .filter(([k, v]) => v)
            .map(([k, v]) => [k, new Map(v.entries())])
        );
        return { packages, devicesets, symbols };
      };
      const destLib = libProps(libraries[k]);
      const srcLib = libProps(libraries.file);

      for(let entity in destLib) {
        console.log("srcLib[entity]:", entity);
        for(let [key, value] of srcLib[entity]) {
          destLib[entity].set(key, value);
          console.log("srcLib:", entity, key, value);
        }
        const values = [...destLib[entity].entries()].sort((a, b) => a[0].localeCompare(b[0]));
        console.log("destLib values:", values);
        const sorted = values.map(a => a[1]);
        const outLib = libraries[k][entity];

        console.log(`${k}.library destLib: `, sorted);
        console.log(`${k}.library destLib.${entity}: `, libraries[k][entity]);
        console.log(`${k}.library destLib.${entity}.ref: `, outLib.ref);

       outLib.ref.replace(sorted);
               console.log(`${k}.library destLib.${entity}.ref.dereference(): `, outLib.ref.dereference());

      }
    }

   //  console.log(layers.schematic.get(99).active, layers.schematic.get(250).active);
  }

  index(l) {
    let path = [...l];
    let key = path.shift();
    let doc, name;

    if(path.length == 0) return this;

    switch (key) {
      case "board":
      case "schematic":
        doc = this[key];
        break;
      case "library":
        name = path.shift();
        doc = this[key][name];
        break;
      default:
        break;
    }
    if(!doc || !doc.index) {
      throw new Error("ERROR: project.index(" + l.join(", ") + " )");
      return null;
    }
    if(path.length == 0) return doc;
    return doc.index(path);
  }

  saveTo = (dir = ".", overwrite = false) => Promise.all(this.documents.map(doc => doc.saveTo(path.join(dir, doc.filename), overwrite)));
}
