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
    for(let [v, l, d] of this.board.iterator([], it => it /*([v,l,d]) => [typeof(v) == 'string' ? v : new EagleEntity(d,l),l,d]*/)) {
      if(v.tagName != "library") continue;
      // console.log("it:", {v,l,d});

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
      file: library.get("library"),
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
      const destLib = libraries[k];
      const { packages = [], devicesets = destLib.appendChild("devicesets"), symbols = destLib.appendChild("symbols") } = destLib;
      const lib = { packages, devicesets, symbols };
      console.log("lib:", lib);

      for(let node of library.findAll(node => entityNames.indexOf(node.tagName) !== -1)) {
     //   console.log("node:", node);
      }
      /* const getLibraryNodes = lib => lib.children.filter(child => ["package", "symbol", "deviceset"].indexOf(child.tagName.substring(0, child.tagName.length-1)) !== -1).map(node => [node.tagName.substring(0, node.tagName.length-1),node]);

     const getLibraryContent = lib => getLibraryNodes(lib).map(([tag,node]) => [tag, Object.fromEntries(node.children.map(child => [child.name, child]))]);
     const getLibraryElements = lib => getLibraryNodes(lib).map(([tag,children]) => children).flat();

      let libFile = Object.fromEntries(getLibraryNodes(libraries.file));
      let libFileContent = Object.fromEntries(getLibraryContent(libraries.file));

      const lib = Object.fromEntries(getLibraryNodes(libraries[k]));  
      const libContent = Object.fromEntries(getLibraryContent(libraries[k]));  
      const layerMap = layers[k];


      console.log(`${k}.library libFile: `, Object.keys(libFile));
      console.log(`${k}.library libContent: `, Object.keys(libContent));
      console.log(`${k}.library lib: `, Object.keys(lib));

      for(let src of getLibraryElements(libraries.file)) {
      const { tagName, name } = src;
      const entity = Util.trimRight( tagName, 's');
       let dstObj = libContent[entity];
            console.log("src:",{tagName, entity,name, dstObj});
       let dst = dstObj[src.name];

      console.log("src:",src," dst:",dst);*/

      console.log(`${k}.library lib: `, lib); //console.log("packages.parentNode.firstChild:",packages.parentNode.firstChild  ); //console.log("packages.parentNode.firstChild:",packages.parentNode.firstChild  );

      //  console.log(`${k}.library lib.packages.keys(): `, [...lib.packages.keys()]);
      ////

      //let packages = lib.find('packages');
      //const { packages, devicesets, symbols } = lib;
      /*console.log("lib.children:",children);


   elem.ref.down('children').replace(children.filter(child => ('layer' in child ? layerMap.has(child.layer) : true)).map(child => ({ ...child })));

*/
    }

    /*let symbols = packages.ref.parent;
console.log("lib.children:",dump(lib.children,2));
console.log("packages.ref:",packages.ref);
console.log("packages.parentNode:",packages.parentNode);
*/ //console.log("packages.parentNode.firstChild.nextSibling:",packages.parentNode.firstChild.nextSibling  );
    /*console.log("packages.parentNode.firstChild.nextSibling.nextSibling:",packages.parentNode.firstChild.nextSibling.nextSibling  );*/
    /*console.log("packages.ref.parent:",packages.ref.parent);
console.log("packages.ref.up(2).dereference():",packages.ref.up(2).dereference());
console.log("packages.ref.parent.dereference():",packages.ref.parent.dereference());
console.log("packages.ref.path:",packages.ref.path);
console.log("packages.ref:",packages.ref);
console.log("packages.ref.parent:",packages.ref.parent);
console.log("packages.ref.path.parent:",packages.ref.path.parent);
console.log("packages.ref.parent.dereference():",packages.ref.parent.dereference());
console.log("packages.ref.nextSibling.dereference():",packages.ref.nextSibling.dereference());*/
    //console.log("packages.ref.nextSibling:",packages.ref.nextSibling);
    /*console.log("packages.ref.nextSibling.dereference():",packages.ref.nextSibling.dereference());
console.log("packages.ref.parent:",packages.ref.parent.dereference());
console.log("packages.path.nextSibling:",packages.path.nextSibling);
console.log("packages.path.split:",packages.path.right());
  console.log("symbols:",symbols);*/
    /*
let children = ["packages", "symbols", "devicesets"].map(e => lib.find(e) );
console.log("children:",[...children]);*/
    /*  for(let entity of ["package", "symbol", "deviceset"]) {
        const l = lib[entity + "s"];
        if(l) {
          for(let i = 0; i < l.length; i++) {
            const elem = l[i];
                    const newEntity = entities.get(entity).get(elem.name).node;
                    const oldEntity = elem.node;
*/

    // console.log(layers.schematic.get(99).active, layers.schematic.get(250).active);
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
