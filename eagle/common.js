import { EagleLocator } from "./locator.js";
import { EagleEntity } from "./entity.js";
import util from "util";
import Util from "../util.js";
import deep from "../deep.js";
import { lazyMembers, lazyMap } from "../lazyInitializer.js";

export const ansi = (...args) => `\u001b[${[...args].join(";")}m`;
export const text = (text, ...color) => ansi(...color) + text + ansi(0);
export const dingbatCode = digit => (digit % 10 == 0 ? circles[0] : String.fromCharCode((digit % 10) + circles[1].charCodeAt(0) - 1));
export const dump = (obj, depth = 1) => util.inspect(obj, { depth, breakLength: 400, colors: true });

export const parseArgs = args => {
  let ret = { location: [] /*, transform: arg => arg*/ };

  while(args.length > 0) {
    if(args[0] instanceof EagleLocator) {
      ret.location = args.shift();
    } else if(args[0] instanceof Array /*Util.isArray(args[0])*/) {
      ret.location = new EagleLocator(args.shift());
    } else if(typeof args[0] == "function") {
      if(ret.predicate === undefined) ret.predicate = args.shift();
      else ret.transform = args.shift();
    } else if(typeof args[0] == "string") {
      if(ret.element === undefined) ret.element = args.shift();
      else ret.name = args.shift();
    } else if(typeof args[0] == "object") {
      const { predicate, transform, element, name } = args.shift();
      Object.assign(ret, { predicate, transform, element, name });
    } else {
      throw new Error("unhandled: " + typeof args[0] + dump(args[0]));
    }
  }
  if(typeof ret.predicate != "function" && (ret.element || ret.name)) {
    if(ret.name) ret.predicate = v => v.tagName == ret.element && v.attributes.name == ret.name;
    else ret.predicate = v => v.tagName == ret.element;
  }
  return ret;
};

export const traverse = function*(o, l = [], d) {
  if(!(l instanceof EagleLocator)) l = new EagleLocator(l);
  /*console.log("o:",dump(o,1)," l:",l.join(','));
 if(l.size > 0)
  o = l.apply(o);*/

  //  if(l instanceof Array) l = new EagleLocator(l);
  if(false && typeof o == "object") if (o !== null && "name" in o.attributes) l[l.length - 1] = { name: o.attributes.name };
  yield [o, l, d];
  if(typeof o == "object") {
    if(o instanceof Array || "length" in o) for(let i = 0; i < o.length; i++) yield* traverse(o[i], l.down(i), d);
    else if("children" in o) for(let i = 0; i < o.children.length; i++) yield* traverse(o.children[i], l.down("children", i), d);
    //    else for(let k in o) yield* traverse(o[k], l.down(k), d);
  }
};
export const toXML = function(o, z = Number.MAX_SAFE_INTEGER) {
  if(o instanceof Array) return o.map(toXML).join("\n");
  else if(typeof o == "string") return o;
  else if(typeof o != "object" || o.tagName === undefined) return "";

  let s = `<${o.tagName}`;
  for(let k in o.attributes) s += ` ${k}="${o.attributes[k]}"`;

  const a = o.children && o.children.length !== undefined ? o.children : [];
  if(a && a.length > 0) {
    s += o.tagName[0] != "?" ? ">" : "?>";
    if(z > 0) {
      let nl = o.tagName == "text" && a.length == 1 ? "" : o.tagName[0] != "?" ? "\n  " : "\n";
      for(let child of a) s += nl + toXML(child, z - 1).replace(/\n/g, nl);
      if(o.tagName[0] != "?") s += `${nl.replace(/ /g, "")}</${o.tagName}>`;
    }
  } else {
    s += " />";
  }
  return s.trim();
  //  return s.replace(/\n *\n/g, "\n").trim();
};

export const inspect = (e, d, c = { depth: 0, breakLength: 400, location: true }) => {
  const { depth, breakLength } = c;
  let o = e;
if(Util.isArray(o) || (Util.isObject(o)  &&  o.length !== undefined)) {
    let s = "";
    for(let i of o) {
      if(s.length > 0) s += i instanceof EagleEntity ? ",\n" : ", ";
      s += i === undefined ? 'undefined' : inspect(i, undefined, { ...c, depth: c.depth - 1 });
    }
    return s;
  } 
  if(typeof e == "string") return text(e, 1, 36);
  if(e instanceof EagleEntity) o = EagleEntity.toObject(e);
  let x = util.inspect(o, { depth: depth * 2, breakLength, colors: true });
  let s = "⏐";
  x = x.substring(x.indexOf("tagName") + 14);
  //    x = x.replace(/.*tagName[^']*'([^']+)'[^,]*,?/g, "$1");

  x = Object.entries((e && e.attributes) || {}).map(([key, value]) => text(key, 33) + text(s, 0, 37) + text(value, 1, 36));
/*
if(!e  || !e.tagName)
  return o;*/
//  console.log(o);
  x.unshift(e.tagName);
  //x = x.replace(/([^ ]*):[^']*('[^']*')[^,]*,?/g, text("$1", 33)+text(s, 0, 37)+text("$2", 1, 36));

  let [p, ...arr] = x; /*
      .replace(/[|\x]+/g, " ")
      .replace(/'([^'][^']*)'/g, "$1")
      .split(/ +/g);*/
  p = text(`〔`, 1, 37) + text(p, 38, 5, 199);
  let l = e.location + "";
  let type = (e.nodeType || (d && d.type)) + "";
  let ret = [text(type, 38, 5, 219), p, text("⧃❋⭗", 38, 5, 112), arr.join(" ").trimRight(), text(`〕`, 1, 37)];
  if(c.location) ret.unshift(l + Util.pad(l, 40, " "));
  return ret.join(" ");
};

export class EagleInterface {
  //owner = null;

  constructor(owner) {
    //   this.owner = owner;
    Object.defineProperty(this, "owner", { value: owner, enumerable: false, configurable: true, writable: true });
    Object.defineProperty(this, "location", { value: new EagleLocator([]), enumerable: false, configurable: true, writable: true });
    Object.defineProperty(this, "children", {
      enumerable: true,
      configurable: true,
      get: function() {
        return this.root.children;
      }
    });
  }

  find(...args) {
    let { location, predicate, transform } = parseArgs([...arguments]);
    if(!transform) transform = ([v, l, d]) => (typeof v == "object" && v !== null && "tagName" in v ? new EagleEntity(d, l, v) : v);
    for(let [v, p, d] of this.iterator()) {
      if(typeof v == "string") continue;
      if(predicate(v, p, d)) return transform([v, p, d]);
    }
    return transform([null, [], []]);
  }

  *findAll(...args) {
    let { location, predicate, transform } = parseArgs(args);
    if(!transform) transform = ([v, l, d]) => (typeof v == "object" && v !== null && "tagName" in v ? new EagleEntity(d, l, v) : v);
    for(let [v, l, d] of this.iterator(predicate, [], it => it))
      if(predicate(v, l, d)) {
        if(transform) v = transform([v, l, d]);
        yield v;
      }
  }

  locate(...args) {
    let { element, location, predicate, transform } = parseArgs(args);
    return predicate(this.find((v, l, d) => v === element, location));
  }

  xpath() {
    let l = this.location,
      s = "",
      d = this.owner;
    let o = d.index([]),
      p = null;
    for(let i = 0; i < l.length; i++) {
      let part = l[i];
      p = o;
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
/*
  get nodeType() {
    if(typeof this.tagName == "string") return "EagleElement";
    else if(this instanceof EagleEntity) return "EagleText";
    else if(this instanceof EagleDocument) return "EagleDocument";
    else if(this instanceof EagleProject) return "EagleProject";
  }
*/
  /*
  static pathStr(path) {
    let str = "";
    for(let part of path) str += typeof part == "number" ? `[${part}]` : "." + part;
    return str;
  }*/

  entries(t = ([v, l, d]) => [l[l.length - 1], new EagleEntity(d, l)]) {
    return this.iterator([], t);
  }

  *iterator(...args) {
    let predicate = typeof args[0] == "function" ? args.shift() : arg => false;
    let location = (Util.isArray(args[0]) && args.shift()) || [];
    let t = typeof args[0] == "function" ? args.shift() : ([v, l, d]) => [typeof v == "object" && v !== null && "tagName" in v ? new EagleEntity(d, l) : v, l, d];
    let owner = this instanceof EagleEntity ? this.owner : this;
    let root = (owner.xml && owner.xml[0]) || this.root;
    let node = root;
    if(location.length > 0) node = deep.get(node, location);
    for(let [v, l] of deep.iterate(node, (v, p) => (predicate(v, p) ? -1 : p.length > 1 ? p[p.length - 2] == "children" : true))) if(typeof v == "object" && v !== null && "tagName" in v) yield [v, l, owner];
  }

  [Symbol.iterator]() {
    return this.iterator(a => a);
  }

  static name(e, l) {
    let out = "";
    let d = e.document || e.ownerDocument;
    if(!l) l = e.location;
    do {
      let str = e.tagName || "";
      let key = l && l.length > 0 ? l[l.length - 1] : [];
      let parent = d.index(l.slice(0, -2));
      let numSiblings = parent ? parent.children.length : 0;
      if(!str.startsWith("?")) {
        if(typeof e == "object" && e.tagName && "children" in e && parent && parent.children.filter(child => (typeof child.tagName == "string" && child.tagName.length > 0 ? child.tagName == e.tagName : false)).length == 1) {
        } else if(typeof e == "object" && "attributes" in e && "name" in e.attributes) {
          let cmp = Object.keys(e.attributes)
            .filter(k => k == "name")
            .map(key => `@${key}="${e.attributes[key]}"`)
            .join(",");
          if(cmp != "") str += `[${cmp}]`;
        } else if(typeof key == "number" && numSiblings > 1) {
          str += `[${key}]`;
        }
        if(out.length > 0) str += "/";
        out = str + out;
      }
      if(l.length <= 0) break;
      l = l.slice(0, -2);
      e = parent;
    } while(true);
    return out;
  }

  static toString(e) {
    return dump(e);
  }
}
export class EagleNodeList {}

export class EagleNode extends EagleInterface {
  location = null;
  //owner = null;

  constructor(d = null, l = []) {
    super(d);
    Util.define(this, "location", l instanceof EagleLocator ? l : new EagleLocator(l));
  }

  get document() {
    let l = this.location.clone();
    let d = this.owner;
    /*
    try {
      if(!(d instanceof EagleDocument) && this.location.length) {
        while(!(d instanceof EagleDocument)) d = d[l.shift()];
      }
    } catch(error) {
      //)       if(!(d instanceof EagleDocument))
      console.log("error:" + (error + "").split(/\n/g)[0]);
      throw new Error("document() " + Util.className(this.owner) + " [" + l.join(",") + "]");
    }*/
    return d;
  }

  getDocument() {
    let l = this.location.clone();
    let d = this.owner;

    if(!(d instanceof EagleDocument) && this.location.length) {
      while(!(d instanceof EagleDocument)) d = d[l.shift()];
    }

    return d;
  }

  get project() {
    if(this.owner instanceof EagleProject) return this.owner;
    return this.document.owner;
  }

  get raw() {
    let ret = {};
    if(this.tagName) {
      ret.tagName = this.tagName;
      if(this.attributes) ret.attributes = Util.map(this.attributes, (k, v) => [k, this.handlers[k]()]);
      let children = this.children.map(child => child.raw || child.text).filter(child => child !== undefined);
      if(children.length > 0) ret.children = children;
    } else if(this.xml[0]) {
      ret = this.xml[0];
    }  else {
      throw new Error("Cannot get raw");
    }
  //  console.log("raw:",ret);

    return ret;
  }
  cacheFields() {
    switch (this.tagName) {
      case "schematic":
        return ["settings", "layers", "libraries", "classes", "parts", "sheets"];
      case "sheet":
        return ["busses", "nets", "instances"];
      case "deviceset":
        return ["gates", "devices"];
      case "device":
        return ["connects", "technologies"];
      case "library":
        return ["packages", "symbols", "devicesets"];
    }
  }

  initCache() {
    let fields = this.cacheFields();

    if(fields) {
      //console.log(`${this.type || this.tagName}.fields: ` + fields.join(","));
      Util.define(this, "cache", {});

      let lazy = {},
        lists = {},
        maps = {},
        parent = this;

      for(let [value, path] of deep.iterate(this.raw, v => v && fields.indexOf(v.tagName) != -1)) {
        const key = value.tagName;
        lazy[key] = () => new EagleEntity(parent, path);
        //lists[key] = { enumerable: false, get: () => parent.cache[key].children };

        if(this[key] !== undefined) console.log(`${key} already defined`);
        else
          Util.define(
            this,
            key,
            lazyMap(
              value.children,
              item => item.attributes.name,
              (arg, key) => new EagleEntity(parent, [...path, "children", key]),
              EagleNodeList.prototype
            )
          );
      }

      lazyMembers(this.cache, lazy);

      // Object.defineProperties(this, maps);
    }
  }

  get(name, value, attr = "name") {
    if(this.cache[name]) return this.cache[name];
    let i = name == "library" ? "libraries" : name + "s";
    let p = this.cache[i];
    if(p && p.children) for(let e of p.children) if (e.attributes[attr] == value) return e;
  }

  *getAll(name, transform = arg => arg) {
    let a = this.cache[name + "s"];
    if(a && a.children) for(let e of a.children) yield transform(e, e.name);
  }
  /*
  index(location, transform = arg => arg) {
    if(!(location instanceof EagleLocator)) location = new EagleLocator(location);
    return transform(location.apply(this.root));
  }*/
  /*
  index(loc, transform = arg => arg) {

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
          throw new Error(`EagleNode index ${i} ${loc.length} '${idx}' not found`);
      }
    }
    if(!obj) throw new Error(`EagleDocument index(${dump(loc)}) returned ${obj}`);
    return obj;
  }
*/
  /*
  getAll(...args) {
    let e = typeof args[0] == "string" ? args.shift() : undefined;
    let n = typeof args[0] == "string" ? args.shift() : undefined;
    let predicate = typeof e == "string" ? (v, l, d) => (n !== undefined && v.tagName === n) || (e !== undefined && v.tagName === e) : typeof args[0] == "function" ? args.shift() : arg => true;
    let transform = typeof n == "string" ? ([v, l, d]) => v.attributes && v.attributes[n] : typeof args[0] == "function" ? args.shift() : ([v, l, d]) => new EagleEntity(d, l);
    console.log("t:", transform);
    return this.findAll({ predicate, transform });
  }*/

  getByName(element, name, attr = "name", t = ([v, l, d]) => new EagleEntity(d, l)) {
    // console.log(`getByName:`,{element,name,attr})  ;
    for(let [v, l, d] of this.iterator([], it => it)) {
      if(typeof v == "object" && "tagName" in v && "attributes" in v && attr in v.attributes) {
        // console.log(`   ${v.tagName} "${v.attributes[attr]}"`);
        if(v.tagName == element && v.attributes[attr] == name) return t([v, l, d]);
      }
    }
    return null;
  }

  get nextSibling() {
    let obj = this.document.index(this.location.nextSibling);
    return obj ? [obj, p] : null;
  }

  get prevSibling() {
    let obj = this.document.index(this.location.prevSibling);
    return obj ? [obj, p] : null;
  }

  get parentNode() {
    let obj = null,
      l = this.location;
    if(l.length >= 2 && l[l.length - 2] == "children") obj = this.document.index(l.slice(0, -2));
    return obj;
  }

  get firstChild() {
    let obj = this.document.index(this.location.firstChild);
    return obj ? [obj, p] : null;
  }

  get lastChild() {
    let obj = this.document.index(this.location.lastChild);
    return obj ? [obj, p] : null;
  }
}
