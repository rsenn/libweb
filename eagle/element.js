import { RGBA } from '../color/rgba.js';
import { BBox, Circle, isLine, Line, MakePolygon, Point, PointList, Rect, Transformation, TransformationList } from '../geom.js';
import { className, define, getOrCreate, inserter, isNumeric, isObject, lazyProperties, lazyProperty, properties, roundTo, tryFunction, ucfirst } from '../misc.js';
import { Pointer as ImmutablePath } from '../pointer.js';
import { Repeater } from '../repeater/repeater.js';
import trkl from '../trkl.js';
import { EagleNode } from './node.js';
import { EagleNodeList } from './nodeList.js';
import { EagleNodeMap } from './nodeMap.js';
import { EagleReference, EagleRef } from './ref.js';
import { MakeRotation, PinSizes } from './renderUtils.js';

//const lazyProperty = (obj, name, getter) => define(obj, properties({ [name]: getter }));

const add = (arr, ...items) => [...(arr || []), ...items];

const decodeHTMLEntities = s =>
  s.replace(
    new RegExp('&([^;]+);', 'gm'),
    (match, entity) =>
      ({
        amp: '&',
        apos: "'",
        '#x27': "'",
        '#x2F': '/',
        '#39': "'",
        '#47': '/',
        lt: '<',
        gt: '>',
        nbsp: ' ',
        quot: '"'
      }[entity] || match)
  );

const TList = (child, elem) => {
  let transformation = elem.transformation();
  let instance = { child, elem };
  let round = n => roundTo(n, 0.0001, 4);
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
  static list = [];
  static currentElement = null;

  static makeTransparent = new RGBA(255, 255, 255).toAlpha();

  static get(owner, ref, raw) {
    if(ref.length === 0 || raw === undefined) {
      let root = 'root' in ref ? ref.root : null;
      let path = 'path' in ref ? ref.path : ref;
      globalThis.tmp = { owner, root, path, raw, ref };
      //if(owner instanceof EagleDocument && root == null && path.length === 0) throw new Error('EagleElement.get');
    }
    let root = ref.root || owner.raw ? owner.raw : owner;
    let doc = owner.document || owner;
    const { pathMapper, raw2element } = doc;
    let insert = inserter(pathMapper);

    if(typeof ref == 'string') ref = new ImmutablePath(ref, { separator: ' ' });

    if(isObject(ref) && /*Array.isArray(ref) &&*/ !(ref instanceof EagleReference)) {
      try {
        ref = EagleRef(owner.raw, ref, true);
      } catch(e) {
        try {
          ref = EagleRef(owner, ref, true);
        } catch(e) {
          ref = EagleRef(root, ref, true);
        }
      }
    }
    if(!isObject(ref) || !('dereference' in ref) || !(ref instanceof EagleReference)) {
      ref = EagleRef(root, ref.path || ref, false);
    }

    if(!raw) raw = ref.dereference();
    try {
      if(!raw && isObject(ref.path)) raw = ref.path.deref(root, true);
    } catch(e) {}

    let inst = doc.raw2element(raw, owner, ref);

    inst.ref = ref;

    let path = ref;

    while(isObject(path) && 'root' in path) path = path.path;

    insert(inst, path);
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
    if(className(owner) == 'Object') {
      throw new Error(`${inspect(owner, 0)} ${inspect(ref, 1)}`);
    }
    super(owner, ref, raw);
    //console.log('EagleElement.constructor(2)', {owner: this.owner, ref: this.ref,raw: this.raw});

    EagleElement.list.push(this);
    define(this, { handlers: {} });
    let path = this.ref.path;

    //console.log('new EagleElement', console.config({ depth:1, compact: 2 }),  {owner,ref,raw, path});

    if(owner === null) throw new Error('owner == null');
    if(raw === undefined || (raw.tagName === undefined && raw.attributes === undefined && raw.children === undefined)) {
      try {
        raw = this.ref.dereference();
      } catch(error) {}
    }
    if(raw === null || typeof raw != 'object') throw new Error('ref: ' + this.ref.inspect() + ' entity: ' + EagleNode.prototype.inspect.call(this));
    let { tagName, attributes, children = [] } = raw;
    //this.tagName = tagName;
    define(this, { attrMap: {} });

    Object.defineProperty(this, 'tagName', {
      get() {
        if(isObject(raw)) return raw.tagName;
      },
      enumerable: true,
      configurable: false
    });

    let doc = this.getDocument();
    let elem = this;
    const attributeList = EagleElement.attributeLists[tagName] || Object.keys(attributes || {});
    if(tagName == 'contactref') {
      define(
        this,
        properties({
          element: () => {
            const { element, pad } = attributes;
            return doc.elements[element];
          },
          pad: () => {
            const { element, pad } = attributes;
            return doc.elements[element].pads[pad];
          }
        })
      );
    } else {
      const names = this.names();
      for(let key of attributeList) {
        let prop = trkl.property(this.attrMap, key);
        let handler;
        if(['visible', 'active'].indexOf(key) != -1)
          handler = v =>
            v !== undefined
              ? prop(v === true ? 'yes' : v === false ? 'no' : v)
              : (() => {
                  let v = prop();
                  if(v == 'yes') v = true;
                  else if(v == 'no') v = false;
                  return v;
                })();
        else if(key == 'diameter') {
          const getDiameter = v => (isNaN(+v) ? 'auto' : +v);
          handler = v => (v !== undefined ? prop(isNaN(+v) ? v : +v) : getDiameter(prop()));
        } else
          handler = v =>
            v !== undefined
              ? prop(v + '')
              : (() => {
                  let v = prop();
                  if(isNumeric(v) && key != 'name') v = parseFloat(v);
                  return v;
                })();

        prop(attributes[key]);
        prop.subscribe(value => (value !== undefined ? (raw.attributes[key] = '' + value) : delete raw.attributes[key]));
        prop.subscribe(value => (elem.pushEvent ? elem.pushEvent(elem, key, value) : void 0));
        this.handlers[key] = prop;

        if(Object.keys(names).indexOf(key) != -1 && !(['instance', 'part', 'element'].indexOf(tagName) != -1 && ['name', 'value'].indexOf(key) != -1)) {
          msg`key=${key} names=${names}`;
          trkl.bind(this, key, v => (v ? v.names.forEach(name => this.handlers[name](v.names[name])) : this.library[key + 's'][this.attrMap[key]]));
        } else if(key == 'device') {
          trkl.bind(this, key, v => {
            if(v) {
              const { names } = v;
              if(names !== undefined) {
                this.handlers.library(names.library);
                this.handlers.deviceset(names.deviceset);
                this.handlers.device(names.device);
              }
            } else {
              const library = doc.getLibrary(attributes.library);
              const deviceset = library.devicesets[attributes.deviceset];
              const device = deviceset.devices[attributes.device];
              return device;
            }
          });
        } else if(tagName == 'layer' && key == 'color') {
          define(this, {
            get color() {
              let colorIndex = attributes.color == undefined ? 15 : attributes.color;
              let color = doc.palette[colorIndex] || doc.palette[0b0110];
              //console.log('colorIndex', colorIndex, color);
              return color;
            }
          });
        } else if(EagleElement.isRelation(key) || ['package', 'library', 'layer'].indexOf(key) != -1) {
          let hfn;
          if(key == 'package') {
            hfn = value => {
              const libName = elem.attributes.library;
              const pkgName = elem.handlers.package();
              const library = this.document.getLibrary(libName);

              console.log(this.tagName, { libName, pkgName, library, key });

              return library.packages[pkgName]; //({ tagName: 'package', name: pkgName });
            };
          } else if(tagName == 'part') {
            switch (key) {
              case 'name':
                hfn = () => attributes.name;
                break;
              case 'library':
                hfn = () => doc.getLibrary(attributes.library);
                break;
              case 'deviceset':
                hfn = () => this.library.devicesets[attributes.deviceset];
                break;
              case 'value':
                hfn = () => attributes.value || attributes.deviceset;
                break;
              case 'device':
                hfn = () => this.deviceset.devices[attributes.device];
                break;
            }
          } else if(tagName == 'instance' || tagName == 'pinref') {
            const module = elem.chain.module || doc;

            /*        if(this.library === undefined) trkl.bind(this, 'library', () => this.part.library || this.document.getLibrary(this.part.attributes.library));
              if(this.deviceset === undefined) trkl.bind(this, 'deviceset', () => this.part.deviceset || this.library.devicesets[this.part.attributes.deviceset]);
              if(this.value === undefined) trkl.bind(this, 'value', () => this.part.value || this.deviceset.name);
*/
            switch (key) {
              case 'part':
                hfn = () => this.document.get(e => e.tagName == 'part' && e.attributes.name == attributes.part);
                break;
              case 'gate':
                hfn = () => this.part.deviceset.gates[attributes.gate];
                break;
              case 'symbol':
                hfn = () => this.gate.symbol;
                break;
              case 'pin':
                hfn = () => this.gate.symbol.pins[attributes.pin];
                break;
            }
          } else if(key == 'layer') {
            define(this, {
              get layer() {
                return this.getLayer();
              }
            });
          } else if(key + 's' in doc) {
            hfn = () => doc[key + 's'][elem.attrMap[key] + ''];
          } else {
            let id = key == 'layer' ? 'number' : 'name';
            hfn = () => {
              let r,
                value = elem.attrMap[key];
              let list = key == 'library' ? 'libraries' : key + 's';
              r = list in doc ? doc[list][value] : doc.get({ tagName: key, [id]: value });
              //console.log(`relation get(${key}, ${attributes[id]}) = `, r);
              return r;
            };
            if(this[key] == undefined) this.initRelation(key, this.handlers[key], hfn);
          }
          //    console.log('hfn', {hfn:hfn+'',tagName,key});
          /*  let nfn = (...args) => {
            let ret;
            try {
              ret = hfn(...args);
            } catch(e) {
              ret = e;
            }
            return ret;
          };
*/
          if(this[key] == undefined) trkl.bind(this, key, hfn);
        } else {
          trkl.bind(this, key, handler);
        }
        // prop.subscribe(value => value !== undefined && this.event(key, value));

        //console.log("prop:",key,prop.subscribe);
      }
    }
    let childList = null;

    if(tagName == 'element') lazyProperty(this, 'children', () => EagleNodeList.create(this.package, this.package.path.concat(['children']), null));
    else if('children' in raw) lazyProperty(this, 'children', () => EagleNodeList.create(this, this.path.concat(['children']), null));

    if(tagName == 'drawing' /*|| tagName == 'schematic' || tagName == 'board'*/) {
      for(let child of raw.children) lazyProperty(this, child.tagName, () => this.get(e => e.tagName == child.tagName));
    }

    if(tagName == 'pad') {
      trkl.bind(this, 'layer', () => doc.layers['Pads']);
    } else if(tagName == 'via') {
      trkl.bind(this, 'layer', () => doc.layers['Vias']);
    } else if(tagName == 'hole') {
      trkl.bind(this, 'layer', () => doc.layers['Holes']);
    }
    if(tagName == 'part') lazyProperty(this, 'package', () => this.device.package);

    if(tagName == 'instance') lazyProperty(this, 'package', () => this.part.device.package);

    if(tagName == 'gate') {
      trkl.bind(this, 'symbol', () => {
        let { library } = this.scope2(/*(o, p, v) => [v.tagName, EagleElement.get(o, p, v)]*/);
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

    if(['attribute', 'element', 'instance', 'label', 'moduleinst', 'pad', 'pin', 'probe', 'rectangle', 'smd', 'text'].indexOf(tagName) != -1) {
    }

    this.initCache(EagleElement, EagleNodeList.create);

    if(this.tagName == 'board' || this.type == 'brd') {
      lazyProperties(this, {
        signals: () => {
          const signals = this.lookup(this.tagName == 'board' ? 'signals' : 'eagle/drawing/board/signals');
          if(signals) return EagleNodeMap.create(signals.children, 'name');
        },
        plain: () => {
          const plain = this.lookup(this.tagName == 'board' ? 'plain' : 'eagle/drawing/board/plain');
          if(plain) return EagleNodeList.create(plain, plain.ref.down('children'));
        },
        elements: () => {
          const elements = this.lookup(this.tagName == 'board' ? 'elements' : 'eagle/drawing/board/elements');
          if(elements) return EagleNodeMap.create(elements.children, 'name');
        },
        libraries: () => {
          const libraries = this.lookup(this.tagName == 'board' ? 'libraries' : 'eagle/drawing/board/libraries');
          if(libraries) return EagleNodeMap.create(libraries.children, 'name');
        }
      });
    }

    if(this.tagName == 'schematic' || this.type == 'sch') {
      lazyProperties(this, {
        sheets: () => {
          const sheets = this.lookup(this.tagName == 'schematic' ? 'sheets' : 'eagle/drawing/schematic/sheets');
          if(sheets) return EagleNodeList.create(this, sheets.path.down('children'));
        },
        parts: () => EagleNodeMap.create(this.lookup(this.tagName == 'schematic' ? 'parts' : 'eagle/drawing/schematic/parts').children, 'name'),
        libraries: () => {
          const libraries = this.lookup(this.tagName == 'schematic' ? 'libraries' : 'eagle/drawing/schematic/libraries');
          if(libraries) return EagleNodeMap.create(libraries.children, 'name');
        }
      });
    }

    if(this.type == 'lbr' || this.tagName == 'library') {
      lazyProperties(this, {
        packages() {
          const packages = this.lookup(this.tagName == 'library' ? 'packages' : 'eagle/drawing/library/packages');
          if(packages) {
            let list = EagleNodeList.create(this, packages.path.down('children'));

            return EagleNodeMap.create(list, 'name');
          }
        }
      });
    }

    if(tagName == 'symbol') {
      lazyProperty(this, 'pins', () => {
        let list = EagleNodeList.create(this, this.path.down('children'), e => e.tagName == 'pin');
        return EagleNodeMap.create(list, 'name');
      });
    }
    if(tagName == 'element') {
      if(this.package) {
        for(let key of ['pad', 'wire', 'circle', 'text', 'rectangle'])
          lazyProperty(this, key + 's', () => {
            let list = EagleNodeList.create(
              this,
              this.package.ref.down('children'),
              e => e.tagName == key,
              (o, p, r) => TList(EagleElement.get(o, p, r), elem)
            );

            if(key != 'pad') return list;
            return EagleNodeMap.create(list, 'name');
          });
      }

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
      for(let prop of ['via', 'wire', 'contactref']) {
        lazyProperty(this, prop + 's', () => EagleNodeList.create(this, this.path.down('children'), e => e.tagName == prop));
      }
    }
    if(tagName == 'package') {
      lazyProperty(this, 'vias', () => EagleNodeList.create(this, this.path.down('children'), e => e.tagName == 'via'));
      lazyProperty(this, 'pads', () => {
        let list = EagleNodeList.create(this, this.path.down('children'), e => e.tagName == 'pad');
        return EagleNodeMap.create(list, 'name');
      });
      lazyProperty(this, 'wires', () => EagleNodeList.create(this, this.path.down('children'), e => e.tagName == 'wire'));
    }

    if(tagName == 'layer') {
      this.getColor = element => {
        if(element) this.elements.add(element);
        return this.color;
      };
      this.isVisible = element => {
        if(element) this.elements.add(element);
        return this.visible;
      };
      this.setVisible = value => (value === undefined ? this.handlers.visible() == 'yes' : this.handlers.visible(value ? 'yes' : 'no'));
      this.setVisible.subscribe = f => this.handlers.visible.subscribe(value => f(value == 'yes'));
    }
    //    let layer  = this.tagName == 'pad' ? this.document.layers['Pads'] :  this.layer;
    if(this.layer || this.tagName == 'pad' || this.tagName == 'via') {
      this.getColor = function() {
        let layer = this.layer || this.document.layers[ucfirst(this.tagName) + 's'];
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
          if(prop == 'diameter' && isNumeric(n)) return +n / 2;

          let radius = n / 2 + 0.45 / 2;
          return radius;
        } else {
          this.diameter = value * 2;
        }
      });
    }

    if(tagName == 'sheet')
      if(!('instances' in this))
        lazyProperty(this, 'instances', () => {
          const { raw } = this;
          const { children } = raw;

          const index = children.findIndex(e => e.tagName == 'instances');
          const list = EagleNodeList.create(this, this.path.concat(['children', index + '', 'children']), e => e.tagName == 'instance');

          return EagleNodeMap.create(list, e => e.attributes.part);
        });

    /*
    if(this.layer)
      this.layer.elements.add(this);*/
    let tmp = this.repeater;
  }

  get repeater() {
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
          if(this.tagName == 'layer') this.elements.forEach(elem => elem.pushEvent(...args));
          pushFn(this);
        };
      });
    }

    return this.r;
  }

  event(name) {
    const value = this[name];
    //console.log('event:', this, { name, value });

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

  get text() {
    const { children } = this;
    let text = '';
    for(let child of children.raw) {
      if(typeof child == 'string') text += child;
    }

    return decodeHTMLEntities(text);
  }

  get attributes() {
    return this.attrMap;
  }

  getLayer() {
    if(this.raw) {
      if(this.raw.attributes?.layer) return this.document.getLayer(this.raw.attributes?.layer);
      if(this.raw.tagName == 'pad') return this.document.layers['Pads'];
      if(this.raw.tagName == 'hole') return this.document.layers['Holes'];
      if(this.raw.tagName == 'description') return 'Document';
    }
  }

  lookup(xpath, create) {
    /*if(!(xpath instanceof ImmutableXPath)) xpath = new ImmutableXPath(xpath); */
    //console.log('EagleElement.lookup', { xpath, create });

    let r = super.lookup(xpath, (o, p, v) => {
      if(create && !v) {
        const { tagName } = p.last;
        o.raw.children.push({
          tagName,
          attributes: {},
          children: []
        });
      }
      if(!v) v = p.deref(o.raw || o, true);
      const owner = this.document;
      const ref = this.ref.down(...p);
      const value = v;
      //console.log('EagleElement.lookup', console.config({ compact: 1 }),  {owner,ref,value});
      return EagleElement.get(owner, ref, value);
    });
    //console.log('EagleElement.lookup = ', r);
    return r;
  }

  getBounds(pred, opts = {}) {
    let bb = new BBox();

    if(!pred && ['sheet', 'schematic'].indexOf(this.tagName) != -1) pred = e => ['wire', 'instance'].indexOf(e.tagName) != -1;

    if(pred) {
      let ok = 0;
      for(let element of this.getAll(pred)) {
        ok |= bb.update(element) || true;
      }
      if(ok) return bb;
    }
    if(this.tagName == 'schematic') {
      let instances = [...this.getAll('instance')];
      return BBox.of(...instances);
    }
    if(this.tagName == 'board') {
      const measures = [...this.plain].filter(e => e.layer.name == 'Measures');
      if(measures.length >= 4) {
        bb.update(measures);
        //console.log('bb', bb);
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
      let library = document.getLibrary(libName);
      let pkg = library.packages[raw.attributes.package];
      bb = pkg.getBounds();
      bb.move(this.x, this.y);
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
      p = new PointList([...m.transformPoints(p)]);
      bb.update(p);
      bb.move(x, y);
    } else if(this.tagName == 'sheet' || this.tagName == 'board') {
      const plain = this.find('plain');

      let list = [...(plain?.children ?? [])].filter(e => e.tagName == 'wire' && e.attributes.layer == '47');
      /*      if(list.length <= 0)*/ list = list.concat([...(this.tagName == 'sheet' ? this.instances.list : this.elements.list)]);

      bb.updateList(
        list
          .map(e => {
            let ret;
            try {
              ret = e.getBounds();
            } catch(e) {}
            return ret;
          })
          .map(b => new Rect(b))
          .map(r => r.toPoints())
          .flat()
      );
    } else if(['package', 'signal', 'polygon', 'symbol'].indexOf(this.tagName) != -1) {
      for(let child of this.children) bb.update(child.getBounds(e => true, opts));
    } else if(this.geometry && this.geometry.toPoints /*['wire', 'pad'].indexOf(this.tagName) != -1*/) {
      let geom = this.geometry.toPoints();
      return new BBox().updateList(geom);
    } else if(this.geometry && this.geometry.bbox /*['wire', 'pad'].indexOf(this.tagName) != -1*/) {
      let geom = this.geometry.bbox();
      return new BBox().update(geom);
    } else if(this.tagName == 'circle') {
      let circle = this.geometry.bbox(this.width);

      bb.update(circle);
    } else if(['description'].indexOf(this.tagName) != -1) {
    } else {
      let tmp = super.getBounds(pred);
      bb.update(tmp);

      if(['x1', 'y1', 'x2', 'y2'].some(n => bb[n] === undefined)) throw new Error(`No getBounds() for '${this.tagName}': ${bb}`);
    }

    if('width' in this.attributes) {
      let half = this.attributes.width * 0.5;

      bb.x1 -= half;
      bb.x2 += half;
      bb.y1 -= half;
      bb.y2 += half;
    }

    return bb;
  }

  get bounds() {
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

  get geometry() {
    const { raw } = this;
    // console.log('raw.attributes',raw.attributes);
    const keys = Object.keys(raw.attributes ?? {});
    const makeGetterSetter = k => v => v === undefined ? +raw.attributes[k] : (raw.attributes[k] = v + '');

    if(this.shape == 'octagon') {
      let { radius = 1.27, x = 0, y = 0 } = this;
      let octagon = MakePolygon(8, radius * 1.082392200292395, 0.5).map(p => p.add(x, y).round(0.001));
      return octagon;
    } else if(['x', 'y', 'radius'].every(prop => isNumeric(this[prop]))) {
      return Circle.bind(this, null, k => v => v === undefined ? +this[k] : (this[k] = +v));
      /*  } else if(['diameter', 'drill'].find(prop => keys.includes(prop))) {
      return Circle.bind(this, null, makeGetterSetter);*/
    } else if(['x1', 'y1', 'x2', 'y2'].every(prop => keys.includes(prop))) {
      let line = Line.bind(this, null, makeGetterSetter);
      trkl.bind(line, 'curve', this.handlers['curve']);
      trkl.bind(line, 'width', this.handlers['width']);
      return line;
    } else if(['x', 'y'].every(prop => keys.includes(prop))) {
      const { x, y } = Point(this);
      if(keys.includes('radius')) return Circle.bind(this, null, makeGetterSetter);
      if(['width', 'height'].every(prop => keys.includes(prop))) return Rect.bind(this, null, makeGetterSetter);
      return Point.bind(this, ['x', 'y'], makeGetterSetter);
    }

    if(['package', 'symbol'].indexOf(this.tagName) == -1) return;

    //    console.log('get geometry', this, this.children);

    if(this.raw.children && this.raw.children.length) {
      let ret = new Map();
      let entry = getOrCreate(ret, () => []);

      for(let child of this.children) {
        let geometry = child.geometry;
        if(geometry && child.layer) {
          entry(child.layer.name).push(geometry);
        }
      }

      for(let [layer, geometry] of ret) {
        if(geometry.every(g => isLine(g))) ret.set(layer, new LineList(geometry));
      }
      if(ret.size) return ret;
    }
  }

  position(offset = null) {
    const keys = Object.keys(this.attributes);
    const makeGetterSetter = k => v => v === undefined ? +this.handlers[k]() : this.handlers[k](+v);

    if(['x', 'y'].every(prop => keys.includes(prop))) {
      let pos = offset ? new Point(this.x, this.y).sum(offset) : Point.bind(this, null, makeGetterSetter);
      return pos;
    }
  }

  static isRelation(name) {
    let relationNames = ['class', 'element', 'gate', 'layer', 'library', 'package', 'pad', 'part', 'pin', 'symbol', 'deviceset', 'device'];
    return relationNames.indexOf(name) != -1;
  }

  scope(t = (o, p, v) => [v.tagName, EagleElement.get(o, p, v)], r = e => Object.fromEntries(e)) {
    return super.scope(t, r);
  }
  scope2() {
    let elem = this;
    let obj = {},
      i = 0;
    do {
      if(elem.name) {
        obj[elem.tagName] = elem;
      }
    } while(elem.tagName != 'eagle' && (elem = elem.parentNode));
    return obj;
  }

  get chain() {
    let chain = this.scope2();
    if(this.name) chain[this.tagName] = this.name;
    return chain;
  }

  getParent(tagName) {
    let e = this;
    do {
      if(e.tagName == tagName) return e;
    } while((e = e.parentNode));
  }

  get sheet() {
    return this.getParent('sheet');
  }
  get sheetNumber() {
    let sheet = this.sheet;
    if(sheet) return this.getParent('sheets').children.indexOf(sheet);
  }

  names() {
    return Object.entries(this.scope()).reduce(
      (acc, entry) => ({
        ...acc,
        [entry[0]]: entry[1].attributes.name
      }),
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

  toString() {
    if(this.tagName == 'layer') return `${this.number} ${this.name}`;

    return super.toString();
  }

  *getAll(pred, transform = a => a) {
    const call = tryFunction(
      (v, p, o) => typeof v == 'object' && v !== null && EagleElement.get(o || this.owner, p, v),
      (r, v, p, o) => r && transform(r, p, o),
      () => undefined
    );

    if(typeof pred != 'function') pred = EagleNode.makePredicate(pred);
    yield* super.getAll((v, p, o) => typeof v == 'object' && v !== null && 'tagName' in v && pred(v, p, o), call);
  }

  get(pred, transform = a => a) {
    let it = this.getAll((v, p, o) => (pred(v, p, o) ? -1 : false), transform);
    let { value, done } = it.next();
    const { root, path, raw } = this;

    return value || null;
  }

  find(pred, transform = a => a) {
    const call = tryFunction(
      (v, p, o) => EagleElement.get(o || this.owner, p),
      (r, v, p, o) => transform(r, p, o),
      () => undefined
    );
    return super.find(pred, call);
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

  static attributeLists = {
    approved: ['hash'],
    attribute: ['name', 'x', 'y', 'size', 'layer', 'rot', 'align', 'ratio', 'font', 'value', 'constant', 'display'],
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
    dimension: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'textsize', 'layer', 'visible', 'width', 'extwidth', 'unit', 'textratio'],
    eagle: ['version'],
    element: ['name', 'library', 'package', 'value', 'x', 'y', 'rot', 'smashed'],
    frame: ['x1', 'y1', 'x2', 'y2', 'columns', 'rows', 'layer'],
    gate: ['name', 'symbol', 'x', 'y', 'swaplevel', 'addlevel'],
    grid: ['distance', 'unitdist', 'unit', 'style', 'multiple', 'display', 'altdistance', 'altunitdist', 'altunit'],
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

Object.assign(EagleElement, { subscribers: [], r: null, class: undefined });
Object.assign(EagleElement.prototype, { [Symbol.toStringTag]: 'EagleElement' });

export const makeEagleElement = (owner, ref, raw) => EagleElement.get(owner, ref, raw);
