import Util from "../util.js";

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
    return this.list[pos];
  },
  get(name, key = this.key) {
    const list = this.list.raw;
    const idx = list.findIndex(item => item.attributes[key] == name);
    return idx == -1 ? null : this.list[idx];
  },
  set(name, value) {
    const list = this.list.raw;
    const idx = list.findIndex(item => item.attributes[this.key] == name);

    if("raw" in value) value = value.raw;
    //console.log("write map property:", idx, value);

    if(idx != -1) list[idx] = value;
    else list.push(value);
  },
  keys(key = this.key) {
    return (this.list.raw || this.list).map(item => item.attributes[key]);
  },
  size(key = this.key) {
    return (this.list.raw || this.list).length;
  },
  values() {
    return [...this.list];
  },
  entries(key = this.key) {
    return this.keys(key).map((key, i) => [key + "", this.list[i]]);
  },
  map(key = this.key) {
    return new Map(this.entries(key));
  },
  toObject(key = this.key) {
    return Object.fromEntries(this.entries(key));
  }
});

export function makeEagleNodeMap(list, key = "name") {
  const Ctor = EagleNodeMap;

  const instance = new Ctor(list, key);

  return new Proxy(instance, {
    get(target, prop, receiver) {
      let index;

      if(typeof prop == "string") {
        if(Util.isNumeric(prop)) return instance.list[prop];
        if(prop == "ref" || prop == "raw") return instance.list[prop];
        if(prop == "instance") return instance;
        if(prop == "length" || prop == "size") return (instance.list.raw || instance.list).length;
      }
      if(prop == Symbol.iterator) return instance.entries()[Symbol.iterator];

      if((index = instance.keys().indexOf(prop)) != -1) return instance.list[index];
      if(typeof instance[prop] == "function") return instance[prop].bind(instance);

      return Reflect.get(target, prop, receiver);
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(instance);
    } /*,
    ownKeys(target) {
      let keys = instance.keys();

      return keys;
    }*/
  });
}
