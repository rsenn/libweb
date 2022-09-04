import Util from '../util.js';
import { EagleElement } from './element.js';
import { text, concat, inspectSymbol } from './common.js';
import { Pointer } from '../pointer.js';
import { Pointer as ImmutablePath } from '../pointer.js';

const toArray = arg => (Array.isArray(arg) ? arg : [arg]);

export class EagleNodeMap {
  constructor(list, key) {
    //console.log('EagleNodeMap.constructor', { list, key });
    if(!list) throw new Error('List=' + list);
    this.list = list;
    this.keys = toArray(key);
  }

  static makePredicate(name, keys) {
    keys = toArray(keys);
    return item => keys.some(key => item.attributes[key] == name);
  }

  item(pos) {
    return this.list.item(pos);
  }

  get(name, keys = this.keys) {
    const { owner, ref, raw } = this.list || {};
    //console.log('EagleNodeMap.get', { name, key }, { owner, ref });
    const fn = EagleNodeMap.makePredicate(name, keys);
    const idx = raw.findIndex(fn);

    if(idx != -1) {
      let value = raw[idx];
      return raw[idx] ? this.item(idx) : null;
    }
  }

  set(name, value) {
    const list = this.list.raw;
    const fn = EagleNodeMap.makePredicate(name, this.keys);

    const idx = list.findIndex(fn);

    if('raw' in value) value = value.raw;
    console.log('write map property:', idx, value);

    if(idx != -1) list[idx] = value;
    else list.push(value);
  }

  get size() {
    return this.list.length;
  }

  /* *entries(key = this.key) {
    for(let [key, item] of this) yield [key || item.name, item];
  }*/

  *[Symbol.iterator](keyAttr = this.keys[0]) {
    const A0 = a => (Array.isArray(a) ? a[0] : a);

    const fn = keyAttr == 'tagName' ? item => item.tagName : item => item.attributes[A0(keyAttr)];
    for(let item of this.list) yield [fn(item), item];
  }

  toMap(key = this.keys[0]) {
    return new Map(this.entries(key));
  }
  toObject(key = this.keys[0]) {
    return Object.fromEntries(this.entries(key));
  }

  [inspectSymbol]() {
    //    console.log("this.entries", this.entries);
    return (
      text(Util.className(this), 0) +
      ` {\n  ` +
      [...this.entries()].reduce(
        (acc, [k, v]) => (acc ? acc + ',\n  ' : acc) + `'${text(k, 1, 32)}' => ` + v[inspectSymbol](),
        ''
      ) +
      `\n}`
    );
  }

  static create(list, key = 'name', filter) {
    const Ctor = EagleNodeMap;
    //console.log('EagleNodeMap.create', { list, key });
    const instance = new Ctor(list, key, filter);
    return new Proxy(instance, {
      get(target, prop, receiver) {
        let index;
        if(typeof prop != 'symbol') {
          let item = instance.get(prop) || instance.list.item(prop);
          if(item) return item;
        }
        if(typeof prop == 'string') {
          if(prop == 'ref' || prop == 'raw' || prop == 'owner') return instance.list[prop];
          if(prop == 'instance') return instance;
          if(prop == 'length') return instance.size();
        }
        if(typeof instance[prop] == 'function') return instance[prop];
        if(typeof instance.list[prop] == 'function') {
          if(typeof prop == 'symbol') return instance.list[prop];
          return instance.list[prop].bind(instance.list);
        }
        if(instance.list[prop]) return instance.list[prop];
        return Reflect.get(target, prop, receiver);
      },
      getPrototypeOf(target) {
        return EagleNodeMap.prototype;
      }
    });
  }
}

Util.decorateIterable(EagleNodeMap.prototype, false);
