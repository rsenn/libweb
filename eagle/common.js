import { EagleLocator } from './locator.js';
import { EagleEntity } from './entity.js';
import util from "util";

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
    } else throw new Error("unhandled");
  }
  // if(!ret.predicate)  ret.predicate = (...args) => args;
  return ret;
};

  export const traverse = function *(o, l = [], hier = [], d) {
    /*if(!(l instanceof EagleLocator)) l = new EagleLocator(l);*/
    if(l instanceof Array) l = new EagleLocator(l);
    if(false && typeof o == "object") if (o !== null && "name" in o.attributes) l[l.length - 1] = { name: o.attributes.name };
    if(d === undefined) d = hier[0] && hier[0][0];
    yield [o, l, hier, d];
    if(typeof o == "object") {
      let h = [[o, l.last, d], ...hier];
      if(o instanceof Array || "length" in o) for(let i = 0; i < o.length; i++) yield* traverse(o[i], l.down(i), h, d);
      else if("children" in o) for(let i = 0; i < o.children.length; i++) yield* traverse(o.children[i], l.down("children", i), h, d);
    }
  };
  export const toXML = function(o, z = Number.MAX_SAFE_INTEGER) {
    if(o instanceof Array) return o.map(toXML).join("\n");
    else if(typeof o == "string") return o;
    else if(typeof o != "object" || o.tagName === undefined) return "";

    let s = `<${o.tagName}`;
    for(let k in o.attribues) s += ` ${k}="${o.attributes[k]}"`;

    const a = o.children && o.children.length !== undefined ? o.children : [];
    if(a && a.length > 0) {
      s += o.tagName[0] != "?" ? ">" : "?>";
      let nl = o.tagName == "text" && a.length == 1 ? "" : o.tagName[0] != "?" ? "\n  " : "\n";
      for(let child of a) s += nl + toXML(child, z - 1).replace(/\n/g, nl);
      if(o.tagName[0] != "?") s += `${nl.replace(/ /g, "")}</${o.tagName}>`;
    } else {
      s += " />";
    }
    return s.replace(/\n *\n/g, "\n").trim();
  };

export class EagleNode {
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
  }

  find(...args) {
    let { element, location, predicate, transform } = parseArgs(args);
    for(let [v, p, h] of traverse(this.xml[0],  )) if(predicate(v, p, h)) return transform([v, p, h]);
    return transform([null, [], []]);
  }

  *findAll(...args) {
    let { location, predicate, transform } = parseArgs(args);
console.log("location:",dump(location));
    for(let [v, l, h] of traverse(this.xml[0], location)) if(predicate(v, l, h)) yield transform([v, l, h, this]);
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

  /*
  static pathStr(path) {
    let str = "";
    for(let part of path) str += typeof part == "number" ? `[${part}]` : "." + part;
    return str;
  }*/


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

    for(let e of traverse(xml[0], [], undefined, d)) yield t(e);
  }
}