import Util from '../util.js';
import { EagleElement } from './element.js';

export class EagleNodeMap {
  constructor(list, key) {
    //Util.log('EagleNodeMap.constructor', { list, key });
    if(!list) throw new Error('List=' + list);
    this.list = list;
    this.key = key;
  }
  /*
Object.defineProperties(EagleNodeMap.prototype, {
  list: { writable: true, configurable: true, enumerable: false, value: null },
  key: { writable: true, configurable: true, enumerable: false, value: null }
});
*/
  static makePredicate(name, key) {
    const a = Util.isArray(key) ? key : [key];
    return key == 'tagName' ? item => item.tagName == name : item => a.some(key => item.attributes[key] == name);
  }

  item(pos) {
    return this.list.item(pos);
  }
  get(name, key = this.key) {
    const { owner, ref, raw } = this.list || {};
    //Util.log('EagleNodeMap', { raw, name });
    if(raw) {
      const fn = EagleNodeMap.makePredicate(name, key);
      const idx = raw.findIndex(fn);
      let value = raw[idx];
      return raw[idx] ? EagleElement.get(owner, ref.down(idx), value) : null;
    }
  }
  set(name, value) {
    const list = this.list.raw;
    const fn = EagleNodeMap.makePredicate(name, key);

    const idx = list.findIndex(fn);

    if('raw' in value) value = value.raw;
    //Util.log("write map property:", idx, value);

    if(idx != -1) list[idx] = value;
    else list.push(value);
  }
  keys(key = this.key) {
    const fn = key == 'tagName' ? item => item.tagName : item => item.attributes[key];
    return Util.unique((this.list && [...this.list]) || [...this]).map(fn);
  }
  size(key = this.key) {
    return (this.list.raw || this.list).length;
  }
  values() {
    return this.list; //[...this.list];
  }
  entries(key = this.key) {
    return [...this[Symbol.iterator](key)];
  }
  *[Symbol.iterator](keyAttr = this.key) {
    const list = this.list && this.list.raw ? this.list.raw : this.list;
    //Util.log('NodeMap ', this.list);
    const fn = keyAttr == 'tagName' ? item => item.tagName : item => item.attributes[keyAttr];

    for(let i = 0; i < this.list.length; i++) yield [fn(list[i]), this.item(i)];
  }
  toMap(key = this.key) {
    return new Map(this.entries(key));
  }
  toObject(key = this.key) {
    return Object.fromEntries(this.entries(key));
  }

  static create(list, key = 'name') {
    const Ctor = EagleNodeMap;
    //Util.log('EagleNodeMap.create', { list, key });
    const instance = new Ctor(list, key);
    return new Proxy(instance, {
      get(target, prop, receiver) {
        let index;
        let item = instance.get(prop);
        if(item) {
          //Util.log("EagleNodeMap.get", {prop, item});
          return item;
        }

        if(typeof prop == 'number' || (typeof prop == 'string' && /^[0-9]+$/.test(prop))) {
          return instance.item(+prop);
        } else if(typeof prop == 'string') {
          if(prop == 'ref' || prop == 'raw' || prop == 'owner') return instance.list[prop];
          if(prop == 'instance') return instance;
          if(prop == 'length' || prop == 'size') return (instance.list.raw || instance.list).length;
          if(prop == 'entries') return instance.entries;
        }
        //if(prop == Symbol.iterator) return instance.entries()[Symbol.iterator];

        if((index = instance.keys().indexOf(prop)) != -1) return instance.list[index];
        if(typeof instance[prop] == 'function') return instance[prop] /*.bind(instance)*/;
        if(typeof instance.list[prop] == 'function') return instance.list[prop].bind(instance.list);

        return Reflect.get(target, prop, receiver);
      },
      getPrototypeOf(target) {
        return Reflect.getPrototypeOf(instance);
      }
    });
  }
}

//Util.decorateIterable(EagleNodeMap.prototype);
