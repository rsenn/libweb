import Util from "../util.js";
//import fs from "fs";
//import path from "path";
import { EagleDocument } from "./document.js";
import { EagleEntity } from "./element.js";
import { inspect } from "./common.js";
import { makeEagleNodeMap, EagleNodeMap } from "./nodeMap.js";
import { SortedMap } from "../indexMap.js";
import { compareVersions } from "../compareVersions.js";
import deep from "../deep.js";
/*
//import util from "util";
const dump = (obj, depth = 1, breakLength = 100) => util.inspect(obj, { depth, breakLength, colors: true });
*/
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
    return [...docDirs, ...docDirs.map(dir => `${dir}/lbr`)]; //.filter(fs.existsSync);
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
        /*  const { packages, devicesets = new Map(), symbols = new Map() } =  */ return Object.fromEntries(["packages", "symbols", "devicesets"].map(k => [k, lib[k]]).filter(([k, v]) => v) /*
           .map(([k, v]) => [k, v])*/);
        return { packages, devicesets, symbols };
      };
      const destLib = libProps(libraries[k]);
      const srcLib = libProps(libraries.file);

      for(let entity in destLib) {
        console.log("entity:", entity);
        console.log("srcLib[entity]:", srcLib[entity]);
        const srcMap = makeEagleNodeMap(srcLib[entity]);
        const dstMap = makeEagleNodeMap(destLib[entity]);
        console.log("srcMap:", srcMap);
        //console.log("nodeMap.keys():", nodeMap.keys());
        console.log("srcMap.get():", srcMap.get("E5-4"));
        //  console.log("nodeMap.values():", nodeMap.values());
        //  console.log("nodeMap.entries():", nodeMap.entries ());

        const transformName = n => n.replace(/[.,][0-9]*/g, "").replace(/([^0-9])([0-9])([^0-9])/g, "$10$2$3");

        let ent = srcLib[entity]
          .map((v, i) => [transformName(v.attributes.name), v.attributes.name, i])
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(item => item.slice(1));
        let m = new Map(ent);

        console.log(`srcLib['${entity}']:`, Util.className(srcLib[entity]));
        console.log(`srcLib['${entity}']:`, srcLib[entity]);

        for(let value of srcMap.values()) {
          const key = value.attributes.name;

          console.log(`dstMap.set(${key},`, dump(value, 0), `):`);
          dstMap.set(key, value);
        }

        /*  console.log("srcMap.raw:", dump(srcMap.raw,2));*/
        console.log("dstMap.ref:", dump(dstMap.ref, 2));
        console.log("dstMap.raw:", dump(dstMap.raw, 2));
        console.log("dstMap.keys:", dump(dstMap.raw.map(item => item.attributes.name).sort(), 2));
        console.log("dstMap.keys:", dump(dstMap.keys().length, 2));
        console.log("dstMap.map:", dump(dstMap.map().size, 2));
        // console.log("dstMap.map:", dump(dstMap.map(), 2));
        // console.log("destLib[entity].raw:", dump(destLib[entity].raw,2));
        console.log("srcLib[entity].raw == srcMap.raw:", srcLib[entity].raw == srcMap.raw);
        console.log("destLib[entity].raw == dstMap.raw:", destLib[entity].raw === dstMap.raw);

        /*   console.log(`destLib['${entity}']:`, Util.className(destLib[entity]));
        console.log(`destLib['${entity}'].owner:`, destLib[entity].owner);

        const values = [...destLib[entity].entries()]
          .sort((a, b) => a[0] - b[0])
          .map(v => v[1])
          .sort((a, b) => compareVersions.compare(a.name, b.name, ">"));
        const map = Util.toMap(values, value => [value.name, value]);

        const sorted = values.map(a => a[1]);*/
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
