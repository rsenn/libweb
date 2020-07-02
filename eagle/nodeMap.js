import Util from '../util.js';

export function EagleNodeMap(list, key) {
  this.list = list;
  this.key = key;
}

Object.defineProperties(EagleNodeMap.prototype, {
  list: { writable: true, configurable: true, enumerable: false, value: null },
  key: { writable: true, configurable: true, enumerable: false, value: null }
});

Object.assign(EagleNodeMap.prototype, {
  at(pos) {
    return this.list.at(pos);
  },
  get(name, key = this.key) {
    const { owner, ref, raw } = this.list;
    console.log("EagleNodeMap", {raw,name});
    if(raw) {
    const idx = raw.findIndex(item => item.attributes[key] == name);
    let value = raw[idx];
    return raw[idx] ? owner.constructor.get(owner, ['children', idx], value) : null;
  }
  },
  set(name, value) {
    const list = this.list.raw;
    const idx = list.findIndex(item => item.attributes[this.key] == name);

    if('raw' in value) value = value.raw;
    //console.log("write map property:", idx, value);

    if(idx != -1) list[idx] = value;
    else list.push(value);
  },
  keys(key = this.key) {
    return Util.unique((this.list.raw || this.list).map(item => item.attributes[key]));
  },
  size(key = this.key) {
    return (this.list.raw || this.list).length;
  },
  values() {
    return this.list; //[...this.list];
  },
  entries(key = this.key) {
    return [...this[Symbol.iterator](key)];
  },
  *[Symbol.iterator](keyAttr = this.key) {
    const { raw } = this.list;
    for(let i = 0; i < this.list.length; i++) yield [raw[i].attributes[keyAttr], this.at(i)];
  },
  toMap(key = this.key) {
    return new Map(this.entries(key));
  },
  toObject(key = this.key) {
    return Object.fromEntries(this.entries(key));
  }
});

export function makeEagleNodeMap(list, key = 'name') {
  const Ctor = EagleNodeMap;

  //console.log('makeEagleNodeMap', list, key);

  const instance = new Ctor(list, key);

  return new Proxy(instance, {
    get(target, prop, receiver) {
      let index;

      let item = instance.get(prop);

      if(item) {
        //console.log("EagleNodeMap.get", {prop, item});
        return item;
      }

      if(typeof prop == 'number' || (typeof prop == 'string' && /^[0-9]+$/.test(prop))) {
        return instance.at(+prop);
      } else if(typeof prop == 'string') {
        if(prop == 'ref' || prop == 'raw') return instance.list[prop];
        if(prop == 'instance') return instance;
        if(prop == 'length' || prop == 'size') return (instance.list.raw || instance.list).length;
        if(prop == 'entries') return instance.entries;
      }
      //  if(prop == Symbol.iterator) return instance.entries()[Symbol.iterator];

      if((index = instance.keys().indexOf(prop)) != -1) return instance.list[index];
      if(typeof instance[prop] == 'function') return instance[prop].bind(instance);

      return Reflect.get(target, prop, receiver);
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(instance);
    }
  });
}
