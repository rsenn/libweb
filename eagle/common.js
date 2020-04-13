import { EagleLocator } from "./locator.js";
import { EagleEntity } from "./entity.js";
import { EagleDocument } from "./document.js";
import util from "util";
import Util from "../util.js";

export const ansi = (...args) => `\u001b[${[...args].join(";")}m`;
export const text = (text, ...color) => ansi(...color) + text + ansi(0);
export const dingbatCode = digit => (digit % 10 == 0 ? circles[0] : String.fromCharCode((digit % 10) + circles[1].charCodeAt(0) - 1));
export const dump = (obj, depth = 1) => util.inspect(obj, { depth, breakLength: 400, colors: true });

export const parseArgs = args => {
  let ret = { location: [], transform: arg => arg };
  while(args.length > 0) {
    if(args[0] instanceof EagleLocator) ret.location = args.shift();
    else if(args[0] instanceof Array) ret.location = new EagleLocator(args.shift());
    else if(typeof args[0] == "function") {
      if(ret.predicate === undefined) ret.predicate = args.shift();
      else ret.transform = args.shift();
    } else if(ret.element === undefined) {
      ret.element = args.shift();
    } else if(typeof args[0] == "string") {
      ret.name = args.shift();
    } else throw new Error("unhandled: "+ dump(args[0]));
  }
  // if(!ret.predicate)  ret.predicate = (...args) => args;
  return ret;
};

export const traverse = function*(o, l = [], hier = [], d) {
  /*if(!(l instanceof EagleLocator)) l = new EagleLocator(l);*/
  if(l instanceof Array) l = new EagleLocator(l);
  if(false && typeof o == "object") if (o !== null && "name" in o.attributes) l[l.length - 1] = { name: o.attributes.name };
  if(d === undefined) d = hier[0] && hier[0][0];
  yield [o, l, hier, d];
  if(typeof o == "object") {
    let h = [[o, l.last, d], ...hier];
    if(o instanceof Array || "length" in o) for(let i = 0; i < o.length; i++) yield* traverse(o[i], l.down(i), h, d);
    else if("children" in o) for(let i = 0; i < o.children.length; i++) yield* traverse(o.children[i], l.down("children", i), h, d);
     else for(let k in o)  yield* traverse(o[k], l.down(k), h, d);
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

export const inspect = (e, d, c = { depth: 0, breakLength: 400 }) => {
  const { depth, breakLength } = c;
  let o = e;

  if(typeof e == "string") return text(e, 1, 36);
  if(e instanceof EagleEntity) o = EagleEntity.toObject(e);
  let x = util.inspect(o, { depth: depth * 2, breakLength, colors: true });
  let s = "⏐";
  x = x.substring(x.indexOf("tagName") + 14);
  //    x = x.replace(/.*tagName[^']*'([^']+)'[^,]*,?/g, "$1");

  x = Object.entries(e.attributes || {}).map(([key, value]) => text(key, 33) + text(s, 0, 37) + text(value, 1, 36));
  x.unshift(e.tagName);
  //x = x.replace(/([^ ]*):[^']*('[^']*')[^,]*,?/g, text("$1", 33)+text(s, 0, 37)+text("$2", 1, 36));

  let [p, ...arr] = x; /*
      .replace(/[|\x]+/g, " ")
      .replace(/'([^'][^']*)'/g, "$1")
      .split(/ +/g);*/
  p = text(`〔`, 1, 37) + text(p, 38, 5, 199);
  let l = e.location+'';
  let type = (e.nodeType || (d && d.type)) + "";
  return [l + Util.pad(l, 40, " "), text(type, 38, 5, 219), p, text("⧃❋⭗", 38, 5, 112), arr.join(" ").trimRight(), text(`〕`, 1, 37)].join(" ");
};

export class EagleInterface {

  //owner = null;

  constructor(owner) {
 //   this.owner = owner;
       Object.defineProperty(this, 'owner',  {value: owner, enumerable: false, configurable: true, writable: true });
  }
  find(...args) {
    let { element, location, predicate, transform } = parseArgs(args);
    for(let [v, p, h, d] of this.iterator()) if(predicate(v, p, h, d)) return transform([v, p, h, d]);
    return transform([null, [], []]);
  }

  *findAll(obj) {
   console.log("predicate: "+obj.predicate);
   console.log("transform: "+obj.transform);
    let { location, predicate, transform } = obj instanceof Array ? parseArgs(obj) : obj;
    for(let [v, l, h, d] of this.iterator()) 
      if(predicate(v, l, h)) {
        if(transform)
          v = transform([v, l, h, this]);
        //   console.log("v: ",v);

        yield v;
      }
  }

  locate(...args) {
    let { element, location, predicate, transform } = parseArgs(args);
    return predicate(this.find((v, l, h, d) => v === element, location));
  }

  getAll(...args) {
    let e = typeof args[0] == "string" ? args.shift() : undefined;
    let n = typeof args[0] == "string" ? args.shift() : undefined;
    let predicate = typeof e == "string" ? (v, l, h, d) => (n !== undefined && v.tagName === n) || (e !== undefined && v.tagName === e) : typeof args[0] == "function" ? args.shift() : arg => true;
    let transform = typeof n == "string" ? ([v, l, h, d]) => v.attributes && v.attributes[n] : typeof args[0] == "function" ? args.shift() : x => x;
    console.log("t:", transform);
    return this.findAll({ location: [], predicate, transform });
  }

  getByName(...args) {
    let { location, element, name, transform, predicate } = parseArgs(args);
    //console.log("getByName:", element,name);
    return this.find(
      v => v.tagName == element && v.attributes.name == name,
      ([v, l, h, d]) => [new EagleEntity(d, l, v), l, h, d]
    );
  }

  xpath() {
    let l = this.location,
      s = "",
      d = this.document;
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


  get nodeType() {
    if(typeof this.tagName == "string") return "EagleElement";
    else if(this instanceof EagleEntity) return "EagleText";
    else if(this instanceof EagleDocument) return "EagleDocument";
    else if(this instanceof EagleProject) return "EagleProject";
  }

  /*
  static pathStr(path) {
    let str = "";
    for(let part of path) str += typeof part == "number" ? `[${part}]` : "." + part;
    return str;
  }*/

  entries(t = ([v, l, h, d]) => [l[l.length - 1], new EagleEntity(d, l)]) {
    return this.iterator(t);
  }

  *iterator(t = ([v, l, h, d]) => [v.tagName ? new EagleEntity(d, l) : v, l, h, d]) {
    let doc = this.document;
    let root = this; //(doc && doc.root) || this.root;
    for(let e of traverse(root, [], undefined, doc)) yield t(e);
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

export class EagleNode extends EagleInterface {
  location = new EagleLocator();
  //owner = null;

  constructor(d = null, l = []) {
    super(d);
    this.location = l instanceof EagleLocator ? l : new EagleLocator(l);
  }

  get document() {
    let l = this.location.clone();
    let d =  this.owner;

    if((!(d instanceof EagleDocument)) && this.location.length) {
      while(!(d instanceof EagleDocument))
        d = d[l.shift()];
    }

 /*       if(!(d instanceof EagleDocument))
          throw new Error("document() "+ Util.className(d)+" "+l.join(","));
*/
    return d;
  }

  getDocument() {
    let l = this.location.clone();
    let d =  this.owner;

    if((!(d instanceof EagleDocument)) && this.location.length) {
      while(!(d instanceof EagleDocument))
        d = d[l.shift()];
    }

    return d;
  }

    get project() { if(this.owner instanceof EagleProject) return this.owner; return this.document.owner; }

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
