import tXml from "../tXml.js";
import Util from "../util.js";
import { trkl } from "../trkl.js";
import fs, { promises as fsPromises } from "fs";

import { lazyInitializer, lazyMembers, lazyArray } from "../lazyInitializer.js";
import { EagleEntity } from "./entity.js";
import util from "util";
import path from "path";
import { EagleLocator } from "./locator.js";

const dump = (obj, depth = 1) => util.inspect(obj, { depth, breakLength: 400, colors: true });

const parseArgs = args => {
  let ret = { location: [], transform: arg => arg };
  while(args.length > 0) {
    if(args[0] instanceof EagleLocator) ret.location = args.shift();
    else if(typeof args[0] == "function") {
      if(ret.predicate === undefined) ret.predicate = args.shift();
      else ret.transform = args.shift();
    } else if(ret.element === undefined) {
      ret.element = args.shift();
    } else if(typeof args[0] == "string") {
      ret.name = args.shift();
    } else throw new Error("unhandled");
  }
  // if(!ret.predicate)  ret.predicate = (...args) => args;
  return ret;
};

export class EagleDocument {
  xml = null;
  path = null;

  constructor(filename) {
    let xmlStr = "";
    try {
      if(!/<\?children.*<eagle /.test(filename)) {
        xmlStr = fs.readFileSync(filename);
        xmlStr = xmlStr.toString();
      }
    } catch(error) {
      throw new Error("EagleDocument: " + error);
    }
    this.path = filename;
    this.type = /<library>/.test(xmlStr) ? "lbr" : /<element /.test(xmlStr) ? "brd" : "sch";
    this.xml = new tXml(xmlStr);
    this.root = this.xml[0];
  }

  /* prettier-ignore */ get filename() { return path.basename(this.path); }
  /* prettier-ignore */ get dirname() { return path.dirname(this.path); }

  /* prettier-ignore */
  saveTo = (path, overwrite = false) => new Promise((resolve, reject) => fsPromises .writeFile(path, this.toString(), { flag: overwrite ? "w" : "wx" }) .then(() => resolve(path)) .catch(reject) );

  *tagNames() {
    let names = [];
    for(let [v, k, o, p] of Util.traverseWithPath(this.xml))
      if(k == "tagName" && names.indexOf(v) == -1) {
        yield v;
        names.push(v);
      }
  }

  tagCounts() {
    let counts = {};
    for(let [v, k, o, p] of Util.traverseWithPath(this.xml))
      if(k == "tagName") {
        if(v in counts) counts[v]++;
        else counts[v] = 1;
      }
    return counts;
  }

  index(location, transform = arg => arg) {
    if(!(location instanceof EagleLocator)) location = new EagleLocator(location);
    return transform(location.apply(this.root));

    /*
    for(let i = 0; i < loc.length; i++) {
      const idx = loc[i];
      switch (typeof idx) {
        case "number":
          obj = obj.children ? obj.children[idx] : obj[idx];
          break;
        case "string":
          obj = obj[idx];
          break;
        case "object":
          if(idx.name !== undefined) {
            obj = obj.children.find(child => child.attributes.name == idx.name);
            break;
          }
        default:
          throw new Error(`EagleDocument index ${i} ${loc.length} '${idx}' not found`);
      }
    }
    if(!obj) throw new Error(`EagleDocument index(${dump(loc)}) returned ${obj}`);
    return obj;*/
  }

  static nodeName(e, l, hier) {
    let out = "";
    do {
      let str = e.tagName || "";
      let key = l && l.length > 0 ? l[path.length - 1] : [];
      let next = hier[0] || [null, []];
      let parent = next[0];
      if(str.startsWith("?")) break;
      if(typeof e == "object" && e.tagName && "children" in e && parent && parent.children.filter(child => (typeof child.tagName == "string" && child.tagName.length > 0 ? child.tagName == e.tagName : false)).length == 1) {
      } else if(typeof e == "object" && "attributes" in e && "name" in e.attributes) {
        let cmp = Object.keys(e.attributes)
          .filter(k => k == "name")
          .map(key => `@${key}="${e.attributes[key]}"`)
          .join(",");
        if(cmp != "") str += `[${cmp}]`;
      } else if(typeof key == "number") {
        str += `[${key}]`;
      }
      if(out.length > 0) str += "/";
      out = str + out;
      if(!hier || !hier.length) break;
      e = parent;
      l = l.slice(0, -1);
      hier = hier.slice(1);
    } while(true);
    return out;
  }

  static *traverse(o, l = [], hier = [], d) {
    if(!(l instanceof EagleLocator)) l = new EagleLocator(l);
    if(false && typeof o == "object") if (o !== null && "name" in o.attributes) l[l.length - 1] = { name: o.attributes.name };
    if(d === undefined) d = hier[0] && hier[0][0];
    yield [o, l, hier, d];
    if(typeof o == "object") {
      let h = [[o, l.last, d], ...hier];
      if(o instanceof Array || "length" in o) for(let i = 0; i < o.length; i++) yield* EagleDocument.traverse(o[i], l.down(i), h, d);
      else if("children" in o) for(let i = 0; i < o.children.length; i++) yield* EagleDocument.traverse(o.children[i], l.down("children", i), h, d);
    }
  }
  /*
  nextSibling(loc) {
    let obj = this.index(loc.nextSibling);
    return obj ? [obj, p] : null;
  }

  prevSibling(loc) {
    let obj = this.index(loc.prevSibling);
    return obj ? [obj, p] : null;
  }

  parent(loc) {
    let obj = this.index(loc.parent);
    return obj ? [obj, p] : null;
  }

  firstChild(loc) {
    let obj = this.index(loc.firstChild);
    return obj ? [obj, p] : null;
  }

  lastChild(loc) {
    let obj = this.index(loc.lastChild);
    return obj ? [obj, p] : null;
  }*/

  find(...args) {
    let { element, location, predicate, transform } = parseArgs(args);
    for(let [v, p, h] of EagleDocument.traverse(this.xml[0], location)) if(predicate(v, p, h)) return transform([v, p, h]);
    return transform([null, [], []]);
  }

  *findAll(...args) {
    let { location, predicate, transform } = parseArgs(args);

    for(let [v, l, h] of EagleDocument.traverse(this.xml[0], location)) if(predicate(v, l, h)) yield transform([v, l, h, this]);
  }

  locate(...args) {
    let { element, location, predicate } = parseArgs(args);
    return predicate(this.find((v, l, h, d) => v === element, location));
  }

  getAll(...args) {
    let e = typeof args[0] == "string" ? args.shift() : undefined;
    let n = typeof args[0] == "string" ? args.shift() : undefined;
    let p = typeof e == "string" ? (v, l, h, d) => (n !== undefined && v.tagName === n) || (e !== undefined && v.tagName === e) : typeof args[0] == "function" ? args.shift() : arg => true;
    let t = typeof n == "string" ? ([v, l, h, d]) => v.attributes && v.attributes[n] : typeof args[0] == "function" ? args.shift() : x => x;
    return this.findAll(p, t);
  }

  getByName(...args) {
    let { location, element } = parseArgs(args);
    return transform(this.find(v => v.tagName == element && v.attributes.name == name));
  }

  xpath(l) {
    let s = "",
      o = this.xml;
    for(let i = 0; i < l.length; i++) {
      let part = l[i];
      o = o[part];
      if(o.tagName !== undefined /*&& o.tagName[0] != '?'*/) {
        if(o.tagName[0] == "?") continue;
        s += `/${o.tagName}`;
        if(o.attributes && o.attributes.name !== undefined) s += `[@name="${o.attributes.name}"]`;
      } else if(part != "children") {
        s += "/" + part;
      }
      if(typeof part == "number") s += `[${part}]`;
    }
    return s;
  }

  toString = () => this.xml.map(e => EagleDocument.toXML(e)).join("\n") + "\n";
  /*
  static pathStr(path) {
    let str = "";
    for(let part of path) str += typeof part == "number" ? `[${part}]` : "." + part;
    return str;
  }*/

  static toXML(o, z = Number.MAX_SAFE_INTEGER) {
    if(o instanceof Array) return o.map(EagleDocument.toXML).join("\n");
    else if(typeof o == "string") return o;
    else if(typeof o != "object" || o.tagName === undefined) return "";

    let s = `<${o.tagName}`;
    for(let k in o.attribues) s += ` ${k}="${o.attributes[k]}"`;

    const a = o.children && o.children.length !== undefined ? o.children : [];
    if(a && a.length > 0) {
      s += o.tagName[0] != "?" ? ">" : "?>";
      let nl = o.tagName == "text" && a.length == 1 ? "" : o.tagName[0] != "?" ? "\n  " : "\n";
      for(let child of a) s += nl + EagleDocument.toXML(child, z - 1).replace(/\n/g, nl);
      if(o.tagName[0] != "?") s += `${nl.replace(/ /g, "")}</${o.tagName}>`;
    } else {
      s += " />";
    }
    return s.replace(/\n *\n/g, "\n").trim();
  }

  entries(t) {
    if(!t) t = ([v, l, h, d]) => new EagleEntity(d, l);
    return this[Symbol.iterator](t);
  }

  *[Symbol.iterator](t) {
    let d = this;
    let { xml } = d;
    if(typeof t != "function")
      t = ([v, l, h, d = d]) => {
        let o = v instanceof EagleEntity ? EagleEntity.toObject(v) : v;
        if(!(v instanceof EagleEntity)) v = new EagleEntity(d, l);
        let { tagName, children, attributes } = o;
        return [tagName || null, attributes || null, children || []];
      };
    if(!this.root) this.root = xml[0];

    for(let e of EagleDocument.traverse(xml[0], [], undefined, d)) yield t(e);
  }
}
