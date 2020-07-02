import Util from '../util.js';
import trkl from '../trkl.js';
import { EagleNode } from './node.js';
import { makeEagleNodeList } from './nodeList.js';
import { EagleReference, EagleRef, EaglePath } from './locator.js';
import { EagleInterface, Rotation } from './common.js';
import { lazyProperty } from '../lazyInitializer.js';
import { BBox, Point, Circle, Line, Rect, TransformationList, Transformation, PointList } from '../geom.js';

export class EagleElement extends EagleNode {
  tagName = '';

  static map = Util.weakMapper((raw, owner, ref) => new EagleElement(owner, ref, raw));
  static list = [];

  //  new WeakMap();

  static get(owner, ref, raw) {
    if(!Util.isObject(ref) || !('dereference' in ref)) ref = new EagleReference(owner, ref);
    if(!raw) raw = ref.path.apply(ref.root, true);
    let inst = EagleElement.map(raw, owner, ref);
    return inst;
  }

  get [Symbol.species]() {
    return EagleElement;
  }

  constructor(owner, ref, raw) {
    //console.log('new EagleElement owner ', Util.className(owner), ' ', raw.tagName);
    if(Util.className(owner) == 'Object') {
      throw new Error(`${Util.inspect(owner, 1)}`);
    }

    super(owner, ref, raw);
    EagleElement.list.push(this);

    Util.define(this, 'handlers', {});
    let path = this.ref.path;
    if(owner === null) throw new Error('owner == null');
    if(raw === undefined || (raw.tagName === undefined && raw.attributes === undefined && raw.children === undefined)) {
      try {
        raw = this.ref.dereference();
      } catch(error) {}
    }
    if(raw === null || typeof raw != 'object') throw new Error('ref: ' + this.ref.inspect() + ' entity: ' + EagleNode.prototype.inspect.call(this));
    let { tagName, attributes, children = [] } = raw;
    this.tagName = tagName;
    this.attrMap = {};
    let doc = this.getDocument();
    let elem = this;

    if(!Util.isEmpty(attributes)) {
      const names = this.names();
      for(let key in attributes) {
        let prop = trkl.property(this.attrMap, key);
        let handler = ['deviceset', 'package', 'device'].includes(key)
          ? Util.ifThenElse(
              v => v !== undefined,
              v => prop('' + v),
              v => '' + prop()
            )
          : Util.ifThenElse(
              v => v !== undefined,
              v => prop(v),
              v => (/^[-+]?[0-9.]+$/.test(prop()) ? parseFloat(prop()) : prop())
            );
        prop(attributes[key]);
        prop.subscribe(value => (value !== undefined ? (raw.attributes[key] = '' + value) : delete raw.attributes[key]));
        this.handlers[key] = prop;
        if(Object.keys(names).indexOf(key) != -1) {
          msg`key=${key} names=${names}`;
          trkl.bind(this, key, v => (v ? v.names.forEach(name => this.handlers[name](v.names[name])) : this.library[key + 's'][this.attrMap[key]]));
        } else if(key == 'device') {
          const fn = v => {
            if(v) {
              const { names } = v;
              if(names !== undefined) {
                this.handlers.library(names.library);
                this.handlers.deviceset(names.deviceset);
                this.handlers.device(names.device);
              }
            } else {
              const library = this.document.find({ tagName: 'library', name: this.attributes.library });
              const deviceset = library.find({ tagName: 'deviceset', name: this.attrMap.deviceset });
              const device = deviceset.find({ tagName: 'device', name: this.attrMap.device });
              return device;
            }
          };
          trkl.bind(this, key, fn);
        } else if(EagleElement.isRelation(key) || ['package', 'library', 'layer'].indexOf(key) != -1) {
          let fn;
          if(key == 'package') {
            fn = value => {
              const libName = elem.handlers.library();
              const pkgName = elem.handlers.package();
              const library = doc.libraries[libName]; //(e => e.tagName == 'library' && e.attributes['name'] == libName);
              return library.packages[pkgName]; //({ tagName: 'package', name: pkgName });
            };
          } else if(tagName == 'instance') {
            fn = value => {
              const part = doc.parts[elem.attrMap.part]; // get(e => e.tagName == 'part' && e.attributes['name']);

              if(key == 'part') return part;
              const library = elem.document.libraries[part.attrMap.library];
              const deviceset = library.devicesets[part.attrMap.deviceset];
              const gate = deviceset.gates[part.attrMap.gate];
              //console.log('relation ', { part, library, deviceset, gate });
              if(key == 'gate') return gate;
            };
          } else if(key + 's' in this.document) {
            fn = () => this.document[key + 's'][elem.attrMap[key] + ''];
          } else {
            let id = key == 'layer' ? 'number' : 'name';
            fn = () => {
              let r,
                value = elem.attrMap[key];
              let list = key == 'library' ? 'libraries' : key + 's';
              r = list in doc ? doc[list][value] : doc.get({ tagName: key, [id]: value });
              //console.log(`relation get(${key}, ${elem.attributes[id]}) = `, r);
              return r;
            };
            this.initRelation(key, this.handlers[key], fn);
          }
          trkl.bind(this, key, fn);
        } else {
          trkl.bind(this, key, handler);
        }
      }
    }
    let childList = null;
    lazyProperty(this, 'children', () => makeEagleNodeList(elem, ['children'], children));

    /*    trkl.bind(this, 'children', value => {
      if(value === undefined) {
        if(childList === null) childList = makeEagleNodeList(this, ['children'], this.raw.children);
        return childList;
      } else {
        o.children = value.raw || [];
      }
    });*/
    if(tagName == 'gate') {
      /*  console.log('this.elementChain()', this.elementChain());
      console.log('this.xpath()', this.xpath());
      console.log('this.ref', this.ref);*/
      let library = this.elementChain().library || EagleElement.get(this.owner, path.up(8));

      lazyProperty(this, 'symbol', () => library.symbols[elem.attributes.symbol] /*library.find({ tagName: 'symbol', name: this.attributes.symbol })*/);
    } else if(tagName == 'instance') {
      let { tagName } = this;

            const part = doc.find({ tagName:'part', name:this.attributes.part }); //doc.parts[this.attributes.part];
console.log("part:",part);
      if(!part.attributes) console.log('instance', this.raw, { doc, owner, tagName });

      const library = doc.find({tagName:'library', name: part.attributes.library });

 
      const deviceset = library.find({tagName:'deviceset', name:part.attributes.deviceset });
      const device = deviceset.find({tagName:'device', name:part.attributes.device});

      //   lazyProperty(this, 'deviceset', () => deviceset.gates [elem.attributes.gate]);
      lazyProperty(this, 'gate', () => deviceset.gates[elem.attributes.gate]);

      Util.defineGetter(this, 'symbol', () => this.gate.symbol);
    } else if(tagName == 'device') {
      lazyProperty(this, 'package', () => {
        const library = this.parentNode.elementChain().library;
        let pkg = library.find(e => e.tagName == 'package' && e.attributes.name == this.attributes.package);
        return pkg;
      });
    }
    this.initCache(EagleElement, makeEagleNodeList);
  }

  get text() {
    let text = this.raw.children ? this.raw.children[0] : '';
    if(typeof text == 'string') return text;
  }

  get attributes() {
    let attributeHandlers = this.handlers;
    let attributeNames = Object.keys(attributeHandlers);
    const Attributes = () => {
      class EagleAttributes {
        constructor(props) {
          //  Object.defineProperties(this, props);
        }
        *[Symbol.iterator]() {
          for(let key of attributeNames) yield [key, attributeHandlers[key]()];
        }
      }
      Util.extend(EagleAttributes.prototype, {
        entries: () => attributeNames.map(key => [key, attributeHandlers[key]()]),
        keys: () => attributeNames,
        has: key => attributeNames.includes(key),
        values: () => attributeNames.map(key => attributeHandlers[key]())
      });

      /*Object.assign(
        EagleAttributes.prototype,
        attributeNames.reduce((acc, key) => ({ ...acc, [key]: attributeHandlers[key]() }), {})
      );*/
      return EagleAttributes;
    };
    let props = attributeNames.reduce(
      (acc, key) => ({
        ...acc,
        [key]: { get: attributeHandlers[key], set: attributeHandlers[key], enumerable: true }
      }),
      {}
    );
    let ret = new (Attributes())(props);
    Object.assign(
      ret,
      attributeNames.reduce((acc, key) => ({ ...acc, [key]: attributeHandlers[key]() }), {})
    );
    return ret;
  }

  getLayer() {
    if(this.raw.attributes.layer) return this.raw.attributes.layer;
    if(this.raw.tagName == 'pad') return 'Pads';
    if(this.raw.tagName == 'description') return 'Document';
  }

  lookup(xpath, create) {
    return super.lookup(xpath, (o, p, v) => {
      if(create && !v) {
        const { tagName } = p.last;
        o.raw.children.push({ tagName, attributes: {}, children: [] });
        //console.log("Element.lookup", {xpath,create, o, p, v})
      }
      return EagleElement.get(o, p, v);
    });
  }

  getBounds(pred = e => true) {
    let bb = new BBox(),
      pos = this.geometry();
    if(this.tagName == 'element') {
      const { raw, ref, path, attributes, owner, document } = this;
      const libName = raw.attributes.library;
      // console.log("document.libraries", document.libraries);
      let library = document.libraries[libName];

      let pkg = library.packages[raw.attributes.package];
      bb = pkg.getBounds();
      bb.move(pos.x, pos.y);
      bb = bb.round(v => Util.roundTo(v, 1.27));
    } else if(this.tagName == 'instance') {
      const { part, gate, rot } = this;
      const { symbol } = gate;
      // console.log('instance', { gate, symbol });
      let t = new TransformationList();
      t.translate(+this.x, +this.y);
      t = t.concat(Rotation(rot));

      let b = symbol.getBounds(e => e.tagName != 'text');
      let p = b.rect.toPoints();
      let m = t.toMatrix();
      p = new PointList([...m.transform_points(p)]);
      bb.update(p.bbox());
    } else if(this.tagName == 'sheet') {
      console.log('this', this, this.tagName);

      /* for(let instance of this['instances'].children) {
        bb.update(instance.getBounds(), 0, instance);
      }*/
    } else if(['package', 'signal', 'polygon', 'symbol'].indexOf(this.tagName) != -1) {
      for(let child of this.children) bb.update(child.getBounds());
    } else if(pos) {
      bb.update(pos);
    } else if(['description'].indexOf(this.tagName) != -1) {
    } else {
      bb.update(super.getBounds(pred));
    }
    return bb;
  }

  transformation() {
    let ret = new TransformationList();
    let rot = this.rot || '';
    if('x' in this && 'y' in this) ret.push(new Transformation.translation(this.x, this.y));
    if(/M/.test(rot)) ret.push(new Transformation.scaling(-1, 1));
    let angle = +rot.replace(/[MR]/g, '');
    if(angle > 0) ret.push(new Transformation.rotation(angle));
    return ret;
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
      return Point.bind(this, null, makeGetterSetter);
    }
  }

  static isRelation(name) {
    let relationNames = ['class', 'element', 'gate', 'layer', 'library', 'package', 'pad', 'part', 'pin', 'symbol'];
    return relationNames.indexOf(name) != -1;
  }

  elementChain() {
    let node = this;
    let ret = {};
    let prev = null;
    let i = 0;
    do {
      if(node == prev) break;
      if(node.attributes && node.attributes.name) ret[node.tagName] = node;
      prev = node;
      i++;
    } while((node = node.parentNode || node.owner));
    return ret;
  }

  names() {
    return Object.entries(this.elementChain()).reduce((acc, entry) => ({ ...acc, [entry[0]]: entry[1].attributes.name }), {});
  }

  static keys(entity) {
    return Object.keys(EagleElement.toObject(entity));
  }
  static values(entity) {
    return Object.values(EagleElement.toObject(entity));
  }
  static entries(entity) {
    return Object.entries(EagleElement.toObject(entity));
  }

  static toObject(e) {
    let { tagName, attributes, children, text } = e;
    let o = {};
    for(let [name, value] of attributes) {
      o[name] = value;
    }

    if(typeof e == 'object' && e !== null && 'tagName' in e) o = { tagName, ...o };
    if(typeof children == 'object' && children !== null && 'length' in children && children.length > 0) {
      let a = children.filter(child => typeof child == 'string');
      children = children.filter(child => typeof child != 'string').map(EagleElement.toObject);
      text = a.join('\n');
    }

    if(typeof text == 'string' && text.length > 0)
      if('attributes' in o) o.attributes.text = text;
      else o.innerHTML = text;
    o.type = e.nodeType;
    return o;
  }

  static toArray(e) {
    const { tagName, attributes, children } = e;
    return [tagName, attributes, children];
  }

  toString(entity = this) {
    const { document } = entity;
    return EagleInterface.inspect(entity, document);
  }

  *getAll(pred, transform) {
    yield* super.getAll(pred, transform || ((v, l, p) => EagleElement.get(this.owner, l, v)));
  }

  find(pred, transform) {
    return super.find(pred, transform || ((v, l, p) => EagleElement.get(this.owner, l, v)));
  }

  setAttribute(name, value) {
    if(typeof value != 'string' && !value) this.removeAttribute(name);
    else this.raw.attributes[name] = value + '';
  }

  removeAttribute(name) {
    delete this.raw.attributes[name];
  }

  get pos() {
    return `(${(this.x / 25.4).toFixed(1)} ${(this.y / 25.4).toFixed(1)})`;
  }

  /*
  static create(owner, ref, ...args) {
    if('length' in ref) ref = owner.ref.concat([...ref]);
    if(args.length > 0) ref = ref.concat([...args]);
    return EagleElement.get(owner, ref);
  }*/
}

export const makeEagleElement = (owner, ref, raw) => EagleElement.get(owner, ref, raw);
