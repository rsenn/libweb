import { EaglePath } from "./locator.js";
//import { EagleElement } from "./element.js";
import Util from "../util.js";
import deep from "../deep.js";

const pathPadding = Util.isBrowser() ? 0 : 40;

export const ansi = Util.isBrowser() ? () => "" : (...args) => `\u001b[${[...args].join(";")}m`;
export const text = Util.isBrowser() ? (text, ...color) => (color.indexOf(1) != -1 ? `${text}` : text) : (text, ...color) => ansi(...color) + text + ansi(0);

export const dingbatCode = digit => (digit % 10 == 0 ? circles[0] : String.fromCharCode((digit % 10) + circles[1].charCodeAt(0) - 1));

export const dump = (o, depth = 2, breakLength = 400) => {
  //  if("toString" in o) return o.toString();
  const isElement = o => Util.isObject(o) && ["EagleElement", "EagleNode"].indexOf(Util.className(o)) != -1;
  let s;
  if(o instanceof Array) {
    s = "";
    for(let i of o) {
      if(s.length > 0) s += isElement(i) ? ",\n" : ", ";
      s += dump(i, depth - 1, breakLength);
    }
  } else if(isElement(o)) {
    s = inspect(o, undefined, { depth, path: false });
    depth * 4;
  } else s = Util.inspect(o, { depth, newline: "", colors: !Util.isBrowser(), breakLength });
  return s;
};

export const parseArgs = args => {
  let ret = { path: [] };

  while(args.length > 0) {
    if(args[0] instanceof EaglePath) {
      ret.path = args.shift();
    } else if(args[0] instanceof Array) {
      ret.path = new EaglePath(args.shift());
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
  if(!(l instanceof EaglePath)) l = new EaglePath(l);

  if(false && typeof o == "object") if (o !== null && "name" in o.attributes) l[l.length - 1] = { name: o.attributes.name };
  yield [o, l, d];
  if(typeof o == "object") {
    if(o instanceof Array || "length" in o) for(let i = 0; i < o.length; i++) yield* traverse(o[i], l.down(i), d);
    else if("children" in o) for(let i = 0; i < o.children.length; i++) yield* traverse(o.children[i], l.down("children", i), d);
  }
};
export const toXML = function(o, z = Number.MAX_SAFE_INTEGER) {
  if(typeof o == "object" && o !== null && "raw" in o) o = o.raw;
  //if(typeof o == "object" && o !== null && "root" in o) o = o.root;

  if(o instanceof Array) return o.map(toXML).join("\n");
  else if(typeof o == "string") return o;
  else if(typeof o != "object" || o.tagName === undefined) return "";

  let s = `<${o.tagName}`;
  for(let k in o.attributes) s += ` ${k}="${o.attributes[k]}"`;

  const a = o.children && o.children.length !== undefined ? o.children : [];
  const text = o.text;
  if(a && a.length > 0) {
    s += o.tagName[0] != "?" ? ">" : "?>";
    if(z > 0) {
      const textChildren = typeof a[0] == "string";
      let nl = textChildren ? "" : o.tagName == "text" && a.length == 1 ? "" : o.tagName[0] != "?" ? "\n  " : "\n";
      if(textChildren) s += a.join("\n") + `</${o.tagName}>`;
      else {
        for(let child of a) s += nl + toXML(child, z - 1).replace(/>\n/g, ">" + nl);
        if(o.tagName[0] != "?") s += `${nl.replace(/ /g, "")}</${o.tagName}>`;
      }
    }
  } else {
    if(Object.keys(o.attributes).length == 0) s += `></${o.tagName}>`;
    else s += " />";
  }
  return s.trim();
};

export const inspect = (e, d, c = { depth: 0, breakLength: 400, path: true }) => {
  const { depth, breakLength } = c;
  let o = e;

  if(typeof e == "string") return text(e, 1, 36);
  //if(e instanceof EagleElement) o = EagleElement.toObject(e);
  let x = Util.inspect(o, { depth: depth * 2, breakLength, colors: !Util.isBrowser() });
  let s = "⏐";
  x = x.substring(x.indexOf("tagName") + 14);

  x = Object.entries((e && e.attributes) || {}).map(([key, value]) => text(key, 33) + text(s, 0, 37) + text(value, 1, 36));

  x.unshift(e.tagName);

  let [p, ...arr] = x;
  p = text(`〔`, 1, 37) + text(p, 38, 5, 199);
  let l = e.path + "";
  let type = (e.nodeType || (d && d.type)) + "";
  let ret = [text(type, 38, 5, 219), p, text("⧃❋⭗", 38, 5, 112), arr.join(" ").trimRight(), text(`〕`, 1, 37)];
  if(c.path) ret.unshift(l + Util.pad(l, pathPadding, " "));
  return ret.join(" ");
};

export class EagleInterface {
  constructor(owner) {
    Object.defineProperty(this, "owner", { value: owner, enumerable: false, configurable: true, writable: true });

    Object.defineProperty(this, "children", {
      enumerable: true,
      configurable: true,
      get: function() {
        return this.root.children;
      }
    });
  }
  /*
  find(...args) {
    let { path, predicate, transform } = parseArgs([...arguments]);
    if(!transform) transform = ([v, l, d]) => (typeof v == "object" && v !== null && "tagName" in v ? new EagleElement(d, l, v) : v);
    for(let [v, p, d] of this.iterator()) {
      if(typeof v == "string") continue;
      if(predicate(v, p, d)) return transform([v, p, d]);
    }
    return transform([null, [], []]);
  }*/

  *findAll(...args) {
    let { path, predicate, transform } = parseArgs(args);
    if(!transform) transform = ([v, l, d]) => (typeof v == "object" && v !== null && "tagName" in v ? new EagleElement(d, l, v) : v);
    for(let [v, l, d] of this.iterator(predicate, [], it => it))
      if(predicate(v, l, d)) {
        if(transform) v = transform([v, l, d]);
        yield v;
      }
  }

  locate(...args) {
    let { element, path, predicate, transform } = parseArgs(args);
    return predicate(this.find((v, l, d) => v === element, path));
  }

  xpath() {
    let l = this.path,
      s = "",
      d = this.owner;
    let o = d.index([]),
      p = null;
    for(let i = 0; i < l.length; i++) {
      let part = l[i];
      p = o;
      o = o[part];
      if(o.tagName !== undefined) {
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
    return Util.className(this);
  }

  entries(t = ([v, l, d]) => [l[l.length - 1], new EagleElement(d, l)]) {
    return this.iterator([], t);
  }

  *iterator(...args) {
    /*   let obj = ref.dereference();

    yield [obj, ref,

    for(let k in obj) {
      yield* this.iterator(this.ref.down(k));
    }*/

    let predicate = typeof args[0] == "function" ? args.shift() : arg => false;
    let path = (Util.isArray(args[0]) && args.shift()) || [];
    let t = typeof args[0] == "function" ? args.shift() : ([v, l, d]) => [typeof v == "object" && v !== null && "tagName" in v ? new EagleElement(d, l) : v, l, d];
    let owner = Util.isObject(this) && "owner" in this ? this.owner : this;
    let root = this.root || (owner.xml && owner.xml[0]);
    let node = root;
    if(path.length > 0) node = deep.get(node, path);
    for(let [v, l] of deep.iterate(node, (v, p) => (predicate(v, p) ? -1 : p.length > 1 ? p[p.length - 2] == "children" : true))) if(typeof v == "object" && v !== null && "tagName" in v) yield [v, l, owner];
  }

  [Symbol.iterator]() {
    return this.iterator(a => a);
  }

  static name(e, l) {
    let out = "";
    let d = e.document || e.ownerDocument;
    if(!l) l = e.path;
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
