import { EaglePath } from './locator.js';
//  import { EagleElement } from "./element.js";
import Util from '../util.js';
import deep from '../deep.js';
import { BBox, TransformationList } from '../geom.js';

const pathPadding = Util.isBrowser() ? 0 : 40;

export const coloring = Util.coloring(false);
//console.log('coloring: ', coloring);
export const ansi = coloring.code.bind(coloring); //Util.isBrowser() ? () => '' : (...args) => `\u001b[${[...args].join(';')}m`;

export const text = coloring.text.bind(coloring); //? (text, ...color) => (color.indexOf(1) != -1 ? `${text}` : text) : (text, ...color) => ansi(...color) + text + ansi(0);
export const concat = coloring.concat.bind(coloring); //? (text, ...color) => (color.indexOf(1) != -1 ? `${text}` : text) : (text, ...color) => ansi(...color) + text + ansi(0);

export const dingbatCode = digit => (digit % 10 == 0 ? circles[0] : String.fromCharCode((digit % 10) + circles[1].charCodeAt(0) - 1));

export const dump = (o, depth = 2, breakLength = 400) => {
  const isElement = o => Util.isObject(o) && ['EagleElement', 'EagleNode'].indexOf(Util.className(o)) != -1;
  let s;
  if(o instanceof Array) {
    s = '';
    for(let i of o) {
      if(s.length > 0) s += isElement(i) ? ',\n' : ', ';
      s += dump(i, depth - 1, breakLength);
    }
  } else if(isElement(o)) {
    s = inspect(o, undefined, { depth, path: false });
    depth * 4;
  } else
    s = Util.inspect(o, {
      depth,
      newline: '',
      colors: !Util.isBrowser(),
      breakLength
    });
  return s;
};

export const parseArgs = args => {
  let ret = { path: [] };

  while(args.length > 0) {
    if(args[0] instanceof EaglePath) {
      ret.path = args.shift();
    } else if(args[0] instanceof Array) {
      ret.path = new EaglePath(args.shift());
    } else if(typeof args[0] == 'function') {
      if(ret.predicate === undefined) ret.predicate = args.shift();
      else ret.transform = args.shift();
    } else if(typeof args[0] == 'string') {
      if(ret.element === undefined) ret.element = args.shift();
      else ret.name = args.shift();
    } else if(typeof args[0] == 'object') {
      const { predicate, transform, element, name } = args.shift();
      Object.assign(ret, { predicate, transform, element, name });
    } else {
      throw new Error('unhandled: ' + typeof args[0] + dump(args[0]));
    }
  }
  if(typeof ret.predicate != 'function' && (ret.element || ret.name)) {
    if(ret.name) ret.predicate = v => v.tagName == ret.element && v.attributes.name == ret.name;
    else ret.predicate = v => v.tagName == ret.element;
  }
  return ret;
};

export const traverse = function*(obj, path = [], doc) {
  if(!(path instanceof EaglePath)) path = new EaglePath(path);
  yield [obj, path, doc];
  if(typeof obj == 'object') {
    if(Util.isArray(obj)) {
      for(let i = 0; i < obj.length; i++) yield* traverse(obj[i], path.down(i), doc);
    } else if('children' in obj && Util.isArray(obj.children)) {
      for(let i = 0; i < obj.children.length; i++) yield* traverse(obj.children[i], path.down('children', i), doc);
    }
  }
};

export const toXML = function(o, z = 10000) {
  if(typeof o == 'object' && o !== null && 'raw' in o) o = o.raw;
  if(o instanceof Array) return o.map(toXML).join('\n');
  else if(typeof o == 'string') return o;
  else if(typeof o != 'object' || o.tagName === undefined) return '';
  let { tagName, attributes, children, ...obj } = o;
  let s = `<${tagName}`;
  let attrs = attributes || obj;
  for(let k in attrs) s += ` ${k}="${attrs[k]}"`;
  const a = children && children.length !== undefined ? children : [];
  if(a && a.length > 0) {
    s += tagName[0] != '?' ? '>' : '?>';
    const textChildren = typeof a[0] == 'string';
    let nl = textChildren ? '' : tagName == 'text' && a.length == 1 ? '' : tagName[0] != '?' ? '\n  ' : '\n';
    if(textChildren) s += a.join('\n') + `</${tagName}>`;
    else {
      for(let child of a) s += nl + toXML(child, z === true ? z : z - 1).replace(/>\n/g, '>' + nl);
      if(tagName[0] != '?') s += `${nl.replace(/ /g, '')}</${tagName}>`;
    }
  } else {
    if(Object.keys(attrs).length == 0) s += `></${tagName}>`;
    else s += ' />';
  }
  return s.trim();
};

export const Rotation = (rot, f = 1) => {
  let mirror, angle;
  if(!rot) {
    mirror = 0;
    angle = 0;
  } else {
    mirror = /M/.test(rot) ? 1 : 0;
    angle = +(rot || '').replace(/M?R/, '') || 0;
  }
  let transformations = new TransformationList();
  if(angle !== 0) transformations.rotate(-angle);
  if(mirror !== 0) transformations.scale(-1, 1);

  return transformations;
};

export class EagleInterface {
  static inspect = (e, d, c = { depth: 0, breakLength: 400, path: true }) => {
    const { depth, breakLength } = c;
    let o = e;
    if(typeof e == 'string') return text(e, 1, 36);
    let x = '';
    try {
      x = Util.inspect(o, {
        depth: depth * 2,
        breakLength,
        colors: !Util.isBrowser()
      });
    } catch(err) {}
    let s = '⏐';
    x = x.substring(x.indexOf('tagName') + 14);
    x = Object.entries((e && e.attributes) || {}).map(([key, value]) => text(key, 33) + text(s, 0, 37) + text(value, 1, 36));
    x.unshift(e.tagName);
    let [p, ...arr] = x;
    p = text(`〔`, 1, 37) + text(p, 38, 5, 199);
    let l = e.path + '';
    let type = (e.nodeType || (d && d.type)) + '';
    let ret = [text(type, 38, 5, 219), p, text('⧃❋⭗', 38, 5, 112), arr.join(' ').trimRight(), text(`〕`, 1, 37)];

    return (c.path ? l + '\n  ' : '') + ret.join(' ');
  };

  constructor(owner) {
    Util.define(this, { owner });

    Util.defineGetter(
      this,
      'children',
      function() {
        return this.root.children;
      },
      true
    );
  }

  *findAll(...args) {
    let { path, predicate, transform } = parseArgs(args);
    for(let [v, l, d] of this.iterator(
      e => true,
      [],
      arg => arg
    )) {
      if(!d) d = this;
      if(predicate(v, l, d)) {
        if(transform) v = transform([v, l, d]);
        yield v;
      }
    }
  }

  find(...args) {
    let { path, predicate, transform } = parseArgs([...arguments]);
    if(!transform) transform = ([v, l, d]) => (typeof v == 'object' && v !== null && 'tagName' in v ? new EagleElement(d, l, v) : v);
    for(let [v, p, d] of this.iterator()) {
      if(typeof v == 'string') continue;
      if(predicate(v, p, d)) return transform([v, p, d]);
    }
    return transform([null, [], []]);
  }

  lookup(xpath, t = (o,p,v) => [o,p]) {
    if(typeof(xpath) == 'string')
      xpath = xpath.split(/\//g);
    xpath = xpath.reduce((acc,p) => [...acc, 'children', typeof(p) == 'string' ? { tagName: p } : p ], []);



    let ret = t(...[this, new EaglePath(xpath)]);
      //console.log("lookup:", {xpath,ret});
return ret;
  }

  getBounds(pred = e => true) {
    let bb = new BBox();
    for(let element of this.getAll(e => e.tagName !== undefined && pred(e))) {
      let g = element.geometry();
      if(g) {
        let bound = typeof g.bbox == 'function' ? g.bbox() : g;
        bb.update(bound, 0, element);
      }
    }
    return bb;
  }

  geometry() {
    const { attributes } = this.raw;
    const keys = Object.keys(attributes);
    const makeGetterSetter = k => v => (v === undefined ? this[k] : (this[k] = v));
    if(['x1', 'y1', 'x2', 'y2'].every(prop => keys.includes(prop))) {
      return Line.bind(this, null, makeGetterSetter);
    } else if(['x', 'y'].every(prop => keys.includes(prop))) {
      const { x, y } = Point(this);
      if(keys.includes('radius')) return Circle.bind(this, null, makeGetterSetter);
      if(['width', 'height'].every(prop => keys.includes(prop))) return Rect.bind(this, null, makeGetterSetter);
      else return Point.bind(this, null, makeGetterSetter);
    }
  }
  /*
  locate(...args) {
    let { element, path, predicate, transform } = parseArgs(args);
    //console.log("locate", {element,path,predicate});
    return predicate(this.find((v, l, d) => v === element, path));
  }*/

  getDocument() {
    let o = this;
    while(o.owner) {
      if(o.xml !== undefined) break;
      o = o.owner;
    }
    return o;
  }

  xpath() {
    let p = new EaglePath();
    let o = this;
    do {
      p = o.ref.path.concat(p);
      if(!o.owner || o.xml != undefined) break;
      o = o.owner;
    } while(o.ref);
    let d = o;
    let x = p.xpath(d);
    return x;
  }

  get nodeType() {
    if(typeof this.tagName == 'string') return 'EagleElement';
    else if(typeof this.xml != 'undefined') return 'EagleDocument';
    return Util.className(this);
  }

  entries(t = ([v, l, d]) => [l[l.length - 1], EagleElement.get(d, l)]) {
    return this.iterator([], t);
  }

  *iterator(...args) {
    let predicate = typeof args[0] == 'function' ? args.shift() : arg => true;
    let path = (Util.isArray(args[0]) && args.shift()) || [];
    let t = typeof args[0] == 'function' ? args.shift() : ([v, l, d]) => [typeof v == 'object' && v !== null && 'tagName' in v ? new this.constructor(d, l) : v, l, d];
    let owner = Util.isObject(this) && 'owner' in this ? this.owner : this;
    let root = this.root || (owner.xml && owner.xml[0]);
    let node = root;
    if(path.length > 0) node = deep.get(node, path);
    for(let [v, l] of deep.iterate(node, (v, p) => (predicate(v, p) ? -1 : p.length > 1 ? p[p.length - 2] == 'children' : true))) {
      if(!(l instanceof EaglePath)) l = new EaglePath(l);
      if(typeof v == 'object' && v !== null && 'tagName' in v) if (predicate(v, l, owner)) yield t([v, l, owner]);
    }
  }

  [Symbol.iterator]() {
    return this.iterator(a => a);
  }

  static name(e, l) {
    let out = '';
    let d = e.document || e.ownerDocument;
    if(!l) l = e.path;
    do {
      let str = e.tagName || '';
      let key = l && l.length > 0 ? l[l.length - 1] : [];
      let parent = d.index(l.slice(0, -2));
      let numSiblings = parent ? parent.children.length : 0;
      if(!str.startsWith('?')) {
        if(typeof e == 'object' && e.tagName && 'children' in e && parent && parent.children.filter(child => (typeof child.tagName == 'string' && child.tagName.length > 0 ? child.tagName == e.tagName : false)).length == 1) {
        } else if(typeof e == 'object' && 'attributes' in e && 'name' in e.attributes) {
          let cmp = Object.keys(e.attributes)
            .filter(k => k == 'name')
            .map(key => `@${key}="${e.attributes[key]}"`)
            .join(',');
          if(cmp != '') str += `[${cmp}]`;
        } else if(typeof key == 'number' && numSiblings > 1) {
          str += `[${key}]`;
        }
        if(out.length > 0) str += '/';
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

  toXML(depth = Number.MAX_SAFE_INTEGER) {
    return toXML(this.ref.dereference(), depth);
  }
}
