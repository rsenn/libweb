import Util from '../util.js';
import trkl from '../trkl.js';
import { EagleNode } from './node.js';
import { EagleNodeList } from './nodeList.js';
import { EagleElementProxy } from './elementProxy.js';
import { EagleReference } from './ref.js';
import { RGBA } from '../color.js';
import { ImmutableXPath } from '../xml/xpath.js';
import { ImmutablePath } from '../json.js';
import { MakeRotation, Alignment, PinSizes } from './renderUtils.js';
import { lazyProperty } from '../lazyInitializer.js';
import {
  BBox,
  Point,
  Circle,
  Line,
  isLine,
  Rect,
  TransformationList,
  Transformation,
  PointList,
  Translation,
  Polygon,
  MakePolygon
} from '../geom.js';
import { Repeater } from '../repeater/repeater.js';

const add = (arr, ...items) => [...(arr || []), ...items];

const TList = (child, elem) => {
  let transformation = elem.transformation();
  let instance = { child, elem };
  let round = n => Util.roundTo(n, 0.0001, 4);
  return new Proxy(instance.child, {
    get(target, prop) {
      let v = Reflect.get(instance.child, prop);
      if(['x', 'y'].indexOf(prop) != -1) {
        v = instance.elem[prop] + target[prop];
        v = round(v);
      } else if(prop == elem.tagName) {
        v = elem;
      } else if(prop == 'geometry') {
        v = target[prop];
        v = v.clone();
        //console.log(`TList get(${prop})`, { elem, transformation, target });
        transformation.apply(v);
      }
      return v;
    }
  });
};

export class EagleElement extends EagleNode {
  tagName = '';
  subscribers = [];

  static list = [];
  static currentElement = null;

  static makeTransparent = new RGBA(255, 255, 255).toAlpha();
  static get(owner, ref, raw) {
    let root = ref.root || owner.raw ? owner.raw : owner;
    let doc = owner.document;
    const { pathMapper, raw2element } = doc;
    let insert = Util.inserter(pathMapper);
    if(typeof ref == 'string') ref = new ImmutablePath(ref, { separator: ' ' });
    if(!Util.isObject(ref) || !('dereference' in ref)) ref = new EagleReference(root, ref);
    if(!raw) raw = ref.path.apply(root, true);
    if(!raw) raw = ref.dereference();
    let inst = doc.raw2element(raw, owner, ref);
    insert(inst, ref.path);
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
    if(Util.className(owner) == 'Object') {
      throw new Error(`${Util.inspect(owner, 0)} ${Util.inspect(ref, 1)}`);
    }
    super(owner, ref, raw);
    EagleElement.list.push(this);
    Util.define(this, 'handlers', {});
    let path = this.ref.path;
    if(owner === null) throw new Error('owner == null');
    if(
      raw === undefined ||
      (raw.tagName === undefined && raw.attributes === undefined && raw.children === undefined)
    ) {
      try {
        raw = this.ref.dereference();
      } catch(error) {}
    }
    if(raw === null || typeof raw != 'object')
      throw new Error(
        'ref: ' + this.ref.inspect() + ' entity: ' + EagleNode.prototype.inspect.call(this)
      );
    let { tagName, attributes, children = [] } = raw;
    this.tagName = tagName;
    Util.define(this, 'attrMap', {});
    let doc = this.getDocument();
    let elem = this;
    const attributeList = EagleElement.attributeLists[tagName] || Object.keys(attributes || {});
    if(tagName == 'contactref') {
      lazyProperty(this, 'element', () => {
        const { element, pad } = attributes;
        return doc.elements[element];
      });
      lazyProperty(this, 'pad', () => {
        const { element, pad } = attributes;
        return doc.elements[element].pads[pad];
      });
    } else {
      const names = this.names();
      for(let key of attributeList) {
        let prop = trkl.property(this.attrMap, key);
        let handler;
        if(['visible', 'active'].indexOf(key) != -1)
          handler = Util.ifThenElse(
            v => v !== undefined,
            v => prop(v === true ? 'yes' : v === false ? 'no' : v),
            () => {
              let v = prop();
              if(v == 'yes') v = true;
              else if(v == 'no') v = false;
              return v;
            }
          );
        else if(key == 'diameter') {
          const getDiameter = Util.ifThenElse(
            v => isNaN(+v),
            () => 'auto',
            v => +v
          );
          handler = Util.ifThenElse(
            v => v !== undefined,
            v => prop(isNaN(+v) ? v : +v),
            () => getDiameter(prop())
          );
        } else
          handler = Util.ifThenElse(
            v => v !== undefined,
            v => prop(v + ''),
            () => {
              let v = prop();
              if(Util.isNumeric(v) && key != 'name') v = parseFloat(v);
              return v;
            }
          );

        prop(attributes[key]);
        prop.subscribe(value =>
          value !== undefined ? (raw.attributes[key] = '' + value) : delete raw.attributes[key]
        );
        prop.subscribe(value => (elem.pushEvent ? elem.pushEvent(elem, key, value) : void 0));
        this.handlers[key] = prop;

        if(
          Object.keys(names).indexOf(key) != -1 &&
          !(['instance', 'part'].indexOf(tagName) != -1 && ['name', 'value'].indexOf(key) != -1)
        ) {
          msg`key=${key} names=${names}`;
          trkl.bind(this, key, v =>
            v
              ? v.names.forEach(name => this.handlers[name](v.names[name]))
              : this.library[key + 's'][this.attrMap[key]]
          );
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
              const library = doc.libraries[attributes.library];
              const deviceset = library.devicesets[attributes.deviceset];
              const device = deviceset.devices[attributes.device];
              return device;
            }
          };
          trkl.bind(this, key, fn);
        } else if(tagName == 'layer' && key == 'color') {
          Util.defineGetter(this, 'color', () => {
            let colorIndex = attributes.color == undefined ? 15 : attributes.color;
            let color = doc.palette[colorIndex] || doc.palette[0b0110];
            //console.log('colorIndex', colorIndex, color);
            return color;
          });
        } else if(
          EagleElement.isRelation(key) ||
          ['package', 'library', 'layer'].indexOf(key) != -1
        ) {
          let fn;
          if(key == 'package') {
            fn = value => {
              const libName = elem.handlers.library();
              const pkgName = elem.handlers.package();
              const library = doc.libraries[libName]; //(e => e.tagName == 'library' && e.attributes['name'] == libName);
              //   console.log(this.tagName, { libName, pkgName, library, key });

              return library.packages[pkgName]; //({ tagName: 'package', name: pkgName });
            };
          } else if(tagName == 'part') {
            switch (key) {
              case 'name':
                fn = () => attributes.name;
                break;
              case 'library':
                fn = () => doc.libraries[attributes.library];
                break;
              case 'deviceset':
                fn = () => this.library.devicesets[attributes.deviceset];
                break;
              case 'value':
                fn = () => attributes.value || attributes.deviceset;
                break;
              case 'device':
                fn = () => this.deviceset.devices[attributes.device];
                break;
            }
          } else if(tagName == 'instance' || tagName == 'pinref') {
            const module = elem.chain.module || doc;

            /*        if(this.library === undefined) trkl.bind(this, 'library', () => this.part.library || this.document.libraries[this.part.attributes.library]);
              if(this.deviceset === undefined) trkl.bind(this, 'deviceset', () => this.part.deviceset || this.library.devicesets[this.part.attributes.deviceset]);
              if(this.value === undefined) trkl.bind(this, 'value', () => this.part.value || this.deviceset.name);
*/
            switch (key) {
              case 'part':
                fn = () => module.parts[attributes.part];
                break;
              case 'gate':
                fn = () => this.part.deviceset.gates[attributes.gate];
                break;
              case 'symbol':
                fn = () => this.gate.symbol;
                break;
              case 'pin':
                fn = () => this.gate.symbol.pins[attributes.pin];
                break;
            }
          } else if(key + 's' in doc) {
            fn = () => doc[key + 's'][elem.attrMap[key] + ''];
          } else {
            let id = key == 'layer' ? 'number' : 'name';
            fn = () => {
              let r,
                value = elem.attrMap[key];
              let list = key == 'library' ? 'libraries' : key + 's';
              r = list in doc ? doc[list][value] : doc.get({ tagName: key, [id]: value });
              //console.log(`relation get(${key}, ${attributes[id]}) = `, r);
              return r;
            };
            if(this[key] == undefined) this.initRelation(key, this.handlers[key], fn);
          }
          if(this[key] == undefined) trkl.bind(this, key, fn);
        } else {
          trkl.bind(this, key, handler);
        }
        // prop.subscribe(value => value !== undefined && this.event(key, value));

        //console.log("prop:",key,prop.subscribe);
      }
    }
    let childList = null;

    if(tagName == 'element')
      lazyProperty(this, 'children', () =>
        EagleNodeList.create(this.package, this.package.path.down('children'), null)
      );
    else if('children' in raw)
      lazyProperty(this, 'children', () =>
        EagleNodeList.create(this, this.path.down('children'), null)
      );

    if(tagName == 'pad') {
      trkl.bind(this, 'layer', () => {
        return doc.layers['Pads'];
      });
    } else if(tagName == 'via') {
      trkl.bind(this, 'layer', () => {
        return doc.layers['Vias'];
      });
    } else if(tagName == 'hole') {
      trkl.bind(this, 'layer', () => {
        return doc.layers['Holes'];
      });
    }
    if(tagName == 'part') lazyProperty(this, 'package', () => this.device.package);

    if(tagName == 'instance') lazyProperty(this, 'package', () => this.part.device.package);

    if(tagName == 'gate') {
      trkl.bind(this, 'symbol', () => {
        let chain = this.scope(/*(o, p, v) => [v.tagName, EagleElement.get(o, p, v)]*/);

        let library = chain.library;
        return library.symbols[attributes.symbol];
      });

      trkl.bind(this, 'pins', () => this.symbol.pins);
    } else if(tagName == 'instance') {
      trkl.bind(this, 'pins', () => this.symbol.pins);

      trkl.bind(this, 'symbol', () => this.gate.symbol);
    } else if(tagName == 'device') {
      lazyProperty(this, 'package', () => {
        const library = this.chain.library;

        if(!library.packages) console.log('', { tagName }, this.chain);
        let pkg = library.packages[attributes.package];
        return pkg;
      });
    }

    if(
      [
        'attribute',
        'element',
        'instance',
        'label',
        'moduleinst',
        'pad',
        'pin',
        'probe',
        'rectangle',
        'smd',
        'text'
      ].indexOf(tagName) != -1
    ) {
    }
    this.initCache(EagleElement, EagleNodeList.create);

    if(tagName == 'symbol') {
      lazyProperty(this, 'pins', () => {
        let list = EagleNodeList.create(this, this.path.down('children'), e => e.tagName == 'pin');
        return EagleNodeMap.create(list, 'name');
      });
    }
    if(tagName == 'element') {
      for(let key of ['pad', 'wire', 'circle', 'text', 'rectangle'])
        lazyProperty(this, key + 's', () => {
          let list = EagleNodeList.create(
            this,
            this.package.path.down('children'),
            e => e.tagName == key,
            (o, p, r) => TList(EagleElement.get(o, p, r), elem)
          );

          if(key != 'pad') return list;
          return EagleNodeMap.create(list, 'name');
        });

      trkl.bind(this, 'contacts', () =>
        Object.fromEntries(
          [
            ...doc.board.signals.getAll({
              tagName: 'contactref',
              element: attributes.name
            })
          ].map(cref => [cref.pad.name, cref.parentNode])
        )
      );
      trkl.bind(this, 'contactrefs', () =>
        Object.fromEntries(
          [
            ...doc.board.signals.getAll({
              tagName: 'contactref',
              element: attributes.name
            })
          ].map(cref => [cref.pad.name, cref])
        )
      );
    }
    if(tagName == 'signal') {
      for(let prop of ['via', 'wire', 'contactref'])
        lazyProperty(this, prop + 's', () =>
          EagleNodeList.create(this, this.path.down('children'), e => e.tagName == prop)
        );
    }
    if(tagName == 'package') {
      lazyProperty(this, 'vias', () =>
        EagleNodeList.create(this, this.path.down('children'), e => e.tagName == 'via')
      );
      lazyProperty(this, 'pads', () => {
        let list = EagleNodeList.create(this, this.path.down('children'), e => e.tagName == 'pad');
        return EagleNodeMap.create(list, 'name');
      });
      lazyProperty(this, 'wires', () =>
        EagleNodeList.create(this, this.path.down('children'), e => e.tagName == 'wire')
      );
    }

    if(tagName == 'layer') {
      this.getColor = function(element) {
        if(element) this.elements.add(element);
        return this.color;
      };
      this.isVisible = element => {
        if(element) this.elements.add(element);
        return this.visible;
      };
      this.setVisible = value =>
        value === undefined
          ? this.handlers.visible() == 'yes'
          : this.handlers.visible(value ? 'yes' : 'no');
      this.setVisible.subscribe = fn =>
        this.handlers.visible.subscribe(value => fn(value == 'yes'));
      this.setVisible.subscribe = fn =>
        this.handlers.visible.subscribe(value => fn(value == 'yes'));
    }
    //    let layer  = this.tagName == 'pad' ? this.document.layers['Pads'] :  this.layer;
    if(this.layer || this.tagName == 'pad' || this.tagName == 'via') {
      this.getColor = function() {
        let layer = this.layer || this.document.layers[Util.ucfirst(this.tagName) + 's'];
        layer.elements.add(this);
        let color = layer.color;
        if(['pad', 'via'].indexOf(this.tagName) != -1) color = EagleElement.makeTransparent(color);

        return color;
      };
    }

    if(tagName == 'layer') this.elements = new Set();

    if(tagName == 'pad') {
      trkl.bind(this, 'radius', value => {
        let prop = ['diameter', 'drill'].find(n => typeof this[n] == 'number');

        if(value === undefined) {
          let n = this[prop];
          if(prop == 'diameter' && Util.isNumeric(n)) return +n / 2;

          let radius = n / 2 + 0.45 / 2;
          return radius;
        } else {
          this.diameter = value * 2;
        }
      });
    }

    /*
    if(this.layer)
      this.layer.elements.add(this);*/
    let tmp = this.repeater;
  }

  /* prettier-ignore */ get repeater() {
    let pushFn;
    if(!this.r) {
      this.r = new Repeater(async (push, stop) => {
        push(this);
        pushFn = push;
        push(this);
        await stop;
      });
      this.r.next().then(({ value, done }) => {
        value.push = pushFn;
        value.pushEvent = function(...args) {
          const [e = this, k] = args;
          const v = e[k];

          // console.log(`pushEvent`, e);
          //console.log(`pushEvent`, {e,k,v});
          if(this.tagName == 'layer') this.elements.forEach((elem) => elem.pushEvent(...args));
          pushFn(this);
        };
      });
    }

    return this.r;
  }

  event(name) {
    const value = this[name];
    console.log('event:', this, { name, value });

    /*    for(let subscriber of this.subscribers) {
      subscriber.call(this, name, value);
    }
*/
  }

  subscribe(handler) {
    this.subscribers = add(this.subscribers, handler);
    return handler;
  }

  unsubscribe(handler) {
    this.subscribers = this.subscribers.filter(h => h != handler);
    return handler;
  }

  /* prettier-ignore */ get text() {
    const { children } = this;
    let text = '';
    for(let child of children.raw) {
      if(typeof child == 'string') text += child;
    }

    return Util.decodeHTMLEntities(text);
  }

  /* prettier-ignore */ get attributes() {
    return this.attrMap;
  }

  getLayer() {
    if(this.raw.attributes.layer) return this.raw.attributes.layer;
    if(this.raw.tagName == 'pad') return 'Pads';
    if(this.raw.tagName == 'hole') return 'Holes';
    if(this.raw.tagName == 'description') return 'Document';
  }

  lookup(xpath, create) {
    /* if(!(xpath instanceof ImmutableXPath))
    xpath = new ImmutableXPath([...xpath]);*/
    //console.log('EagleElement.lookup(', xpath, create, ')');
    let r = super.lookup(xpath, (o, p, v) => {
      if(create && !v) {
        const { tagName } = p.last;
        o.raw.children.push({ tagName, attributes: {}, children: [] });
      }
      if(!v) v = p.apply(o.raw, true);
      return EagleElement.get(o, p, v);
    });
    //console.log('EagleElement.lookup = ', r);
    return r;
  }

  getBounds(pred, opts = {}) {
    let bb = new BBox();
    if(!pred && ['sheet', 'schematic'].indexOf(this.tagName) != -1)
      pred = e => ['wire', 'instance'].indexOf(e.tagName) != -1;
    if(pred) {
      let ok = 0;
      for(let element of this.getAll(pred)) {
        ok |= bb.update(element) || true;
      }
      if(ok) return bb;
    }
    /*  let pos = this.geometry;
    if(pos) {
      if(pos.toObject) pos = pos.toObject();
      else if(pos.clone) pos = pos.clone();
      else pos = Util.clone(pos);
    }*/
    if(this.tagName == 'schematic') {
      let instances = [...this.getAll('instance')];
      return BBox.of(...instances);
    }
    if(this.tagName == 'board') {
      const measures = [...this.plain].filter(e => e.layer.name == 'Measures');
      if(measures.length >= 4) {
        bb.update(measures);
        console.log('bb', bb);
        return bb;
      }
    }
    if(this.tagName == 'pin') {
      const { rot, length, func, x, y } = this;

      const angle = +(rot || '0').replace(/R/, '');
      let veclen = PinSizes[length] * 2.54;
      if(func == 'dot') veclen -= 1.5;
      const dir = Point.fromAngle((angle * Math.PI) / 180);
      const vec = dir.prod(veclen);
      const pivot = new Point(+x, +y);
      const pp = dir.prod(veclen + 0.75).add(pivot);
      const l = new Line(pivot, vec.add(pivot));
      //const tp = pivot.diff(dir.prod(2.54));
      //
      bb.update(l.toPoints());
    } else if(this.tagName == 'element') {
      const { raw, ref, path, attributes, owner, document } = this;
      const libName = raw.attributes.library;
      let library = document.libraries[libName];
      let pkg = library.packages[raw.attributes.package];
      bb = pkg.getBounds();
      bb.move(this.x, this.y);
      bb = bb.round(v => Util.roundTo(v, 1.27));
    } else if(this.tagName == 'instance') {
      const { part, gate, rot, x, y } = this;
      const { symbol } = gate;
      let t = new TransformationList();
      t = t.concat(MakeRotation(rot));
      const name = part.name;
      const value = part.value || part.deviceset.name;
      let b = symbol.getBounds(e => true, { name, value });
      //b.move(x, y);
      //   console.log('symbol.getBounds():', symbol.name, b);
      let p = new Rect(b.rect).toPoints();
      let m = t.toMatrix();
      p = new PointList([...m.transform_points(p)]);
      bb.update(p);
      bb.move(x, y);
    } else if(this.tagName == 'sheet' || this.tagName == 'board') {
      const plain = this.find('plain');
      let list = [...plain.children].filter(e => e.tagName == 'wire' && e.attributes.layer == '47');
      /*      if(list.length <= 0)*/ list = list.concat([
        ...(this.tagName == 'sheet' ? this.instances.list : this.elements.list)
      ]);

      bb.updateList(
        list
          .map(e => e.getBounds())
          .map(b => new Rect(b))
          .map(r => r.toPoints())
          .flat()
      );

      /*  for(let instance of list) {
        bb.update(instance.getBounds(), 0, instance);
      }*/
    } else if(['package', 'signal', 'polygon', 'symbol'].indexOf(this.tagName) != -1) {
      for(let child of this.children) bb.update(child.getBounds(e => true, opts));
      /*} else if(pos) {
      const { x = 0, y = 0 } = opts;
      if(Util.isObject(pos) && typeof pos.bbox == 'function') pos = new Rect(pos.bbox());
      if(this.tagName == 'text') {
        let text = this.text;
        let align = this.align || 'bottom-left';
        if(opts.name) text = text.replace(/>NAME/, opts.name);
        if(opts.value) text = text.replace(/>VALUE/, opts.value);
        let width = text.length * 6;
        let height = 10;
        let rect = new Rect(pos.x, pos.y, width, height);
        if(false) return rect.bbox();
      }
      if(Util.isObject(pos) && typeof pos.bbox == 'function') pos = pos.bbox();
      bb.update(pos);*/
    } else if(
      this.geometry &&
      this.geometry.toPoints /*['wire', 'pad'].indexOf(this.tagName) != -1*/
    ) {
      let geom = this.geometry;
      bb.updateList(geom.toPoints());
    } else if(
      this.geometry &&
      this.geometry.bbox /*['wire', 'pad'].indexOf(this.tagName) != -1*/
    ) {
      let geom = this.geometry;
      bb.update(geom.bbox());
    } else if(this.tagName == 'circle') {
      let circle = this.geometry;

      bb.update(circle.bbox(this.width));
    } else if(['description'].indexOf(this.tagName) != -1) {
    } else {
      /*    if(['wire','text','rectangle'].indexOf(this.tagName) == -1)
      throw new Error(`No getBounds() for '${this.tagName}'`);*/
      bb.update(super.getBounds(pred));

      if(['x1', 'y1', 'x2', 'y2'].some(n => bb[n] === undefined))
        throw new Error(`No getBounds() for '${this.tagName}': ${bb}`);
    }
    return bb;
  }

  /* prettier-ignore */ get bounds() {
    return this.getBounds();
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

  /* prettier-ignore */ get geometry() {
    const { raw } = this;
    const keys = Object.keys(raw.attributes);
    const makeGetterSetter = (k) => (v) => (v === undefined ? +raw.attributes[k] : (raw.attributes[k] = v + ''));

    if(this.shape == 'octagon') {
      let { radius = 1.27, x = 0, y = 0 } = this;
      let octagon = MakePolygon(8, radius * 1.082392200292395, 0.5).map((p) => p.add(x, y).round(0.001));
      return octagon;
    } else if(['x', 'y', 'radius'].every((prop) => Util.isNumeric(this[prop]))) {
      return Circle.bind(this, null, (k) => (v) => (v === undefined ? +this[k] : (this[k] = +v)));
      /*  } else if(['diameter', 'drill'].find(prop => keys.includes(prop))) {
      return Circle.bind(this, null, makeGetterSetter);*/
    } else if(['x1', 'y1', 'x2', 'y2'].every((prop) => keys.includes(prop))) {
      let line = Line.bind(this, null, makeGetterSetter);
      trkl.bind(line, 'curve', this.handlers['curve']);
      trkl.bind(line, 'width', this.handlers['width']);
      return line;
    } else if(['x', 'y'].every((prop) => keys.includes(prop))) {
      const { x, y } = Point(this);
      if(keys.includes('radius')) return Circle.bind(this, null, makeGetterSetter);
      if(['width', 'height'].every((prop) => keys.includes(prop))) return Rect.bind(this, null, makeGetterSetter);
      return Point.bind(this, ['x', 'y'], makeGetterSetter);
    }

    if(['package', 'symbol'].indexOf(this.tagName) == -1) return;

    //    console.log('get geometry', this, this.children);

    if(this.raw.children && this.raw.children.length) {
      let ret = new Map();
      let entry = Util.getOrCreate(ret, () => []);

      for(let child of this.children) {
        let geometry = child.geometry;
        if(geometry && child.layer) {
          entry(child.layer.name).push(geometry);
        }
      }

      for(let [layer, geometry] of ret) {
        if(geometry.every((g) => isLine(g))) ret.set(layer, new LineList(geometry));
      }
      if(ret.size) return ret;
    }
  }

  position(offset = null) {
    const keys = Object.keys(this.attributes);
    const makeGetterSetter = k => v => v === undefined ? +this.handlers[k]() : this.handlers[k](+v);

    if(['x', 'y'].every(prop => keys.includes(prop))) {
      let pos = offset
        ? new Point(this.x, this.y).sum(offset)
        : Point.bind(this, null, makeGetterSetter);
      return pos;
    }
  }

  static isRelation(name) {
    let relationNames = [
      'class',
      'element',
      'gate',
      'layer',
      'library',
      'package',
      'pad',
      'part',
      'pin',
      'symbol',
      'deviceset',
      'device'
    ];
    return relationNames.indexOf(name) != -1;
  }

  scope(t = (o, p, v) => [v.tagName, EagleElement.get(o, p, v)], r = e => Object.fromEntries(e)) {
    return super.scope(t, r);
  }

  /* prettier-ignore */ get chain() {
    return this.scope();
  }

  getParent(tagName) {
    let e = this;
    do {
      if(e.tagName == tagName) return e;
    } while((e = e.parentNode));
  }

  /* prettier-ignore */ get sheet() {
    return this.getParent('sheet');
  }
  /* prettier-ignore */ get sheetNumber() {
    let sheet = this.sheet;
    if(sheet) return this.getParent('sheets').children.indexOf(sheet);
  }

  names() {
    return Object.entries(this.scope()).reduce(
      (acc, entry) => ({ ...acc, [entry[0]]: entry[1].attributes.name }),
      {}
    );
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
    if(
      typeof children == 'object' &&
      children !== null &&
      'length' in children &&
      children.length > 0
    ) {
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

  toString() {
    if(this.tagName == 'layer') return `${this.number} ${this.name}`;

    return super.toString();
  }

  *getAll(pred, transform = a => a) {
    const fn = Util.tryFunction(
      (v, p, o) => typeof v == 'object' && v !== null && EagleElement.get(o || this.owner, p, v),
      (r, v, p, o) => r && transform(r, p, o),
      () => undefined
    );

    if(typeof pred != 'function') pred = EagleNode.makePredicate(pred);
    yield* super.getAll(
      (v, p, o) => typeof v == 'object' && v !== null && 'tagName' in v && pred(v, p, o),
      fn
    );
  }

  find(pred, transform = a => a) {
    const fn = Util.tryFunction(
      (v, p, o) => EagleElement.get(o || this.owner, p),
      (r, v, p, o) => transform(r, p, o),
      () => undefined
    );
    return super.find(pred, fn);
  }

  setAttribute(name, value) {
    if(typeof value != 'string' && !value) this.removeAttribute(name);
    else this.raw.attributes[name] = value + '';
  }

  removeAttribute(name) {
    delete this.raw.attributes[name];
  }

  /* prettier-ignore */ get pos() {
    return `(${(this.x / 25.4).toFixed(1)} ${(this.y / 25.4).toFixed(1)})`;
  }

  /*
  static create(owner, ref, ...args) {
    if('length' in ref) ref = owner.ref.concat([...ref]);
    if(args.length > 0) ref = ref.concat([...args]);
    return EagleElement.get(owner, ref);
  }*/

  static attributeLists = {
    approved: ['hash'],
    attribute: [
      'name',
      'x',
      'y',
      'size',
      'layer',
      'rot',
      'align',
      'ratio',
      'font',
      'value',
      'constant',
      'display'
    ],
    bus: ['name'],
    circle: ['x', 'y', 'radius', 'width', 'layer'],
    class: ['number', 'name', 'width', 'drill'],
    clearance: ['class', 'value'],
    connect: ['gate', 'pin', 'pad', 'route'],
    contactref: ['element', 'pad', 'route', 'routetag'],
    description: ['language'],
    designrules: ['name'],
    device: ['name', 'package'],
    deviceset: ['name', 'prefix', 'uservalue'],
    dimension: [
      'x1',
      'y1',
      'x2',
      'y2',
      'x3',
      'y3',
      'textsize',
      'layer',
      'visible',
      'width',
      'extwidth',
      'unit',
      'textratio'
    ],
    eagle: ['version'],
    element: ['name', 'library', 'package', 'value', 'x', 'y', 'rot', 'smashed'],
    frame: ['x1', 'y1', 'x2', 'y2', 'columns', 'rows', 'layer'],
    gate: ['name', 'symbol', 'x', 'y', 'swaplevel', 'addlevel'],
    grid: [
      'distance',
      'unitdist',
      'unit',
      'style',
      'multiple',
      'display',
      'altdistance',
      'altunitdist',
      'altunit'
    ],
    hole: ['x', 'y', 'drill'],
    instance: ['part', 'gate', 'x', 'y', 'rot', 'smashed'],
    junction: ['x', 'y'],
    label: ['x', 'y', 'size', 'layer', 'rot', 'xref', 'ratio', 'font'],
    layer: ['number', 'name', 'color', 'fill', 'visible', 'active'],
    library: ['name'],
    moduleinst: ['name', 'module', 'x', 'y', 'rot'],
    module: ['name', 'prefix', 'dx', 'dy'],
    net: ['name', 'class'],
    note: ['version', 'minversion', 'severity'],
    package: ['name'],
    pad: ['name', 'x', 'y', 'drill', 'shape', 'diameter', 'rot', 'stop', 'first', 'thermals'],
    param: ['name', 'value'],
    part: ['name', 'library', 'deviceset', 'device', 'value', 'technology'],
    pass: ['name', 'refer', 'active'],
    pin: ['name', 'x', 'y', 'visible', 'length', 'direction', 'function', 'rot', 'swaplevel'],
    pinref: ['part', 'gate', 'pin'],
    polygon: ['width', 'layer', 'isolate', 'orphans', 'thermals'],
    port: ['name', 'side', 'coord', 'direction'],
    portref: ['moduleinst', 'port'],
    rectangle: ['x1', 'y1', 'x2', 'y2', 'layer', 'rot'],
    schematic: ['xreflabel', 'xrefpart'],
    setting: ['alwaysvectorfont', 'verticaltext'],
    signal: ['name', 'class'],
    smd: ['name', 'x', 'y', 'dx', 'dy', 'layer', 'rot', 'stop', 'cream', 'roundness'],
    symbol: ['name'],
    technology: ['name'],
    text: ['x', 'y', 'size', 'layer', 'ratio', 'rot', 'align', 'font', 'distance'],
    vertex: ['x', 'y', 'curve'],
    via: ['x', 'y', 'extent', 'drill', 'shape', 'diameter'],
    wire: ['x1', 'y1', 'x2', 'y2', 'width', 'layer', 'curve', 'style', 'cap', 'extent'],
    '?xml': ['version', 'encoding']
  };
}
globalThis.EagleElement = EagleElement;

export const makeEagleElement = (owner, ref, raw) => EagleElement.get(owner, ref, raw);
