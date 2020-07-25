import Util from '../util.js';
import trkl from '../trkl.js';
import { EagleNode } from './node.js';
import { EagleNodeList } from './nodeList.js';
import { EagleReference } from './ref.js';
import { ImmutableXPath } from '../xml.js';
import { Rotation } from './common.js';
import { lazyProperty } from '../lazyInitializer.js';
import { BBox, Point, Circle, Line, Rect, TransformationList, Transformation, PointList } from '../geom.js';

const add = (arr, ...items) => [...(arr || []), ...items];

export class EagleElement extends EagleNode {
  tagName = '';
  subscribers = [];

  static list = [];
  static currentElement = null;

  //new WeakMap();

  static get(owner, ref, raw) {
    let root = ref.root || owner.raw ? owner.raw : owner;

    let doc = owner.document;

    const { pathMapper, elementMapper } = doc;

    let insert = Util.inserter(pathMapper); //doc.maps.obj2path);
    //console.log('mapper:', mapper);

    //Util.log('EagleElement.get(', { owner, ref, raw }, ')');

    if(!Util.isObject(ref) || !('dereference' in ref)) ref = new EagleReference(root, ref);
    if(!raw) raw = ref.path.apply(root, true);
    if(!raw) raw = ref.dereference();
    //Util.log('EagleElement.get', { owner, ref, raw });
    let inst = elementMapper(raw, owner, ref);

    insert(inst, ref.path);
    //Util.log("EagleElement.get =",inst);
    EagleElement.currentElement = inst;
    return inst;
  }

  static create(tagName, attributes = {}, children = []) {
    for(let name in attributes) {
      attributes[name] = attributes[name] + '';
    }
    return { tagName, attributes, children };
  }

  static get [Symbol.species]() {
    return EagleElement;
  }

  constructor(owner, ref, raw) {
    //Util.log('new EagleElement owner ', Util.className(owner), ' ', raw.tagName);
    if(Util.className(owner) == 'Object') {
      throw new Error(`${Util.inspect(owner, 0)} ${Util.inspect(ref, 1)}`);
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

    Util.define(this, 'attrMap', {});

    let doc = this.getDocument();
    let elem = this;

    if(!Util.isEmpty(attributes)) {
      const names = this.names();
      for(let key in attributes) {
        let prop = trkl.property(this.attrMap, key);
        let handler = [
          'active',
          'addlevel',
          'align',
          'altunit',
          'altunitdist',
          'alwaysvectorfont',
          'bgcolor',
          'cap',
          'color',
          'constant',
          'cream',
          'device',
          'deviceset',
          'direction',
          'display',
          'element',
          'encoding',
          'first',
          'font',
          'function',
          'gate',
          'href',
          'language',
          'length',
          'library',
          'module',
          'moduleinst',
          'name',
          'orphans',
          'package',
          'pad',
          'part',
          'pin',
          'port',
          'prefix',
          'refer',
          'route',
          'severity',
          'shape',
          'side',
          'smashed',
          'stop',
          'style',
          'symbol',
          'technology',
          'text',
          'thermals',
          'title',
          'unit',
          'unitdist',
          'uservalue',
          'valign',
          'value',
          'verticaltext',
          'visible',
          'xref',
          'xreflabel',
          'xrefpart'
        ].includes(key)
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
              const library = doc.libraries[this.attributes.library];
              const deviceset = library.devicesets[this.attributes.deviceset];
              const device = deviceset.devices[this.attributes.device];
              return device;
            }
          };
          trkl.bind(this, key, fn);
        } else if(tagName == 'layer' && key == 'color') {
          Util.defineGetter(this, 'color', () => {
            let colorIndex = elem.attributes.color == undefined ? 15 : elem.attributes.color;
            let color = doc.palette[colorIndex] || doc.palette[0b0110];
            //Util.log('colorIndex', colorIndex, color);
            return color;
          });
        } else if(EagleElement.isRelation(key) || ['package', 'library', 'layer'].indexOf(key) != -1) {
          let fn;
          if(key == 'package') {
            fn = value => {
              const libName = elem.handlers.library();
              const pkgName = elem.handlers.package();
              const library = doc.libraries[libName]; //(e => e.tagName == 'library' && e.attributes['name'] == libName);
              return library.packages[pkgName]; //({ tagName: 'package', name: pkgName });
            };
          } else if(tagName == 'part') {
            fn = value => {
              const library = doc.libraries[this.attributes.library];
              if(key == 'library') return library;
              const deviceset = library.devicesets[this.attributes.deviceset];
              if(key == 'deviceset') return deviceset;
              if(key == 'device') return deviceset.devices[this.attributes.device];
            };
          } else if(tagName == 'instance') {
            fn = value => {
              const module = elem.chain['module'] || doc;

              const part = module.parts[elem.attributes.part]; //get(e => e.tagName == 'part' && e.attributes['name']);

              if(key == 'part') return part;
              const library = doc.libraries[part.attributes.library];
              const deviceset = library.devicesets[part.attributes.deviceset];
              //Util.log('relation ', { part, library, deviceset, gate });
              if(key == 'gate') return deviceset.gates[part.attributes.gate];
            };
          } else if(key + 's' in doc) {
            fn = () => doc[key + 's'][elem.attrMap[key] + ''];
          } else {
            let id = key == 'layer' ? 'number' : 'name';
            fn = () => {
              let r,
                value = elem.attrMap[key];
              let list = key == 'library' ? 'libraries' : key + 's';
              r = list in doc ? doc[list][value] : doc.get({ tagName: key, [id]: value });
              //Util.log(`relation get(${key}, ${elem.attributes[id]}) = `, r);
              return r;
            };
            this.initRelation(key, this.handlers[key], fn);
          }
          trkl.bind(this, key, fn);
        } else {
          trkl.bind(this, key, handler);
        }
        prop.subscribe(value => value !== undefined && this.event(key, value));

        //Util.log("prop:",key,prop.subscribe);
      }
    }
    let childList = null;
    lazyProperty(this, 'children', () => EagleNodeList.create(this, this.path.down('children'), this.raw.children));

    /*    trkl.bind(this, 'children', value => {
      if(value === undefined) {
        if(childList === null) childList = EagleNodeList.create(this, ['children'], this.raw.children);
        return childList;
      } else {
        o.children = value.raw || [];
      }
    });*/
    if(tagName == 'gate') {
      lazyProperty(this, 'symbol', () => {
        let chain = this.elementChain(/*(o, p, v) => [v.tagName, EagleElement.get(o, p, v)]*/);

        let library = chain.library;
        return library.symbols[elem.attributes.symbol];
      });
    } else if(tagName == 'instance') {
      let { tagName } = this;

      const module = this.chain['module'] || doc;

      /*   if(!part) {
        let parts = doc.find('parts');
        //Util.log('parts:', parts.children);
        //Util.log('doc.parts:', doc.parts);
        //Util.log('instance', this.attributes.part, doc.parts.keys().indexOf(this.attributes.part));
      }
      if(!part.attributes) Util.log('instance', this.raw, { doc, owner, tagName });
*/

      lazyProperty(this, 'gate', () => {
        const part = module.parts[this.attributes.part];

        const library = doc.libraries[part.attributes.library];
        const deviceset = library.devicesets[part.attributes.deviceset];
        const device = deviceset.devices[part.attributes.device];
        return deviceset.gates[elem.attributes.gate];
      });

      Util.defineGetter(this, 'symbol', () => this.gate.symbol);
    } else if(tagName == 'device') {
      lazyProperty(this, 'package', () => {
        const library = this.chain.library;

        if(!library.packages) Util.log('', { tagName }, this.chain);
        let pkg = library.packages[this.attributes['package']];
        return pkg;
      });
    }

    if(['attribute', 'element', 'instance', 'label', 'moduleinst', 'pad', 'pin', 'probe', 'rectangle', 'smd', 'text'].indexOf(tagName) != -1) {
    }
    this.initCache(EagleElement, EagleNodeList.create);
  }

  event(name) {
    const value = this[name];
    Util.log('event:', this, { name, value });

    for(let subscriber of this.subscribers) {
      subscriber.call(this, name, value);
    }
  }

  subscribe(handler) {
    this.subscribers = add(this.subscribers, handler);
    return handler;
  }

  unsubscribe(handler) {
    this.subscribers = this.subscribers.filter(h => h != handler);
    return handler;
  }

  get text() {
    const { children } = this;
    let text = '';
    for(let child of children.raw) {
      if(typeof child == 'string') text += child;
    }

    return Util.decodeHTMLEntities(text);
  }

  get attributes() {
    let attributeHandlers = this.handlers;
    let attributeNames = Object.keys(attributeHandlers);
    const Attributes = () => {
      class EagleAttributes {
        constructor(props) {
          //Object.defineProperties(this, props);
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
    /* if(!(xpath instanceof ImmutableXPath))
    xpath = new ImmutableXPath([...xpath]);*/
    //Util.log('EagleElement.lookup(', xpath, create, ')');
    let r = super.lookup(xpath, (o, p, v) => {
      if(create && !v) {
        const { tagName } = p.last;
        o.raw.children.push({ tagName, attributes: {}, children: [] });
      }
      if(!v) v = p.apply(o.raw, true);
      return EagleElement.get(o, p, v);
    });
    //Util.log('EagleElement.lookup = ', r);
    return r;
  }

  getBounds(pred = e => true) {
    let bb = new BBox(),
      pos = this.geometry();
    if(this.tagName == 'element') {
      const { raw, ref, path, attributes, owner, document } = this;
      const libName = raw.attributes.library;
      //Util.log("document.libraries", document.libraries);
      let library = document.libraries[libName];

      let pkg = library.packages[raw.attributes.package];
      bb = pkg.getBounds();
      bb.move(pos.x, pos.y);
      bb = bb.round(v => Util.roundTo(v, 1.27));
    } else if(this.tagName == 'instance') {
      const { part, gate, rot } = this;
      const { symbol } = gate;
      //Util.log('instance', { gate, symbol });
      let t = new TransformationList();
      t.translate(+this.x, +this.y);
      t = t.concat(Rotation(rot));

      let b = symbol.getBounds(e => e.tagName != 'text');
      let p = new Rect(b.rect).toPoints();
      let m = t.toMatrix();
      p = new PointList([...m.transform_points(p)]);
      bb.update(p.bbox());
    } else if(this.tagName == 'sheet' || this.tagName == 'board') {
      const plain = this.find('plain');
      let list = [...plain.children].filter(e => e.tagName == 'wire' && e.attributes.layer == '47');
      if(list.length <= 0) list = this.tagName == 'sheet' ? this.instances.list : this.elements.list;

      for(let instance of list) {
        bb.update(instance.getBounds(), 0, instance);
      }
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
    const { raw } = this;
    const keys = Object.keys(raw.attributes);
    const makeGetterSetter = k => v => (v === undefined ? +raw.attributes[k] : (raw.attributes[k] = v + ''));

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
    let relationNames = ['class', 'element', 'gate', 'layer', 'library', 'package', 'pad', 'part', 'pin', 'symbol', 'deviceset', 'device'];
    return relationNames.indexOf(name) != -1;
  }

  elementChain(t = (o, p, v) => [v.tagName, EagleElement.get(o, p, v)]) {
    return super.elementChain(t);
  }

  get chain() {
    return this.elementChain();
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
    return EagleNode.inspect(entity, document);
  }

  *getAll(pred, transform) {
    yield* super.getAll(pred, transform || ((v, p, o) => EagleElement.get(o || this.owner, p, v)));
  }

  find(pred, transform) {
    return super.find(pred, transform || ((v, p, o) => EagleElement.get(o || this.owner, p, v)));
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
