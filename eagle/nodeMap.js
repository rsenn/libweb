import Util from "../util.js";

export function EagleNodeMap(list, key) {
  this.list = list; //Util.define(this, "list", list);
  this.key = key; //  Util.define(this, "key", key);
}

Object.defineProperties(EagleNodeMap.prototype, {
  list: { writable: true, configurable: true, enumerable: false, value: null },
  key: { writable: true, configurable: true, enumerable: false, value: null }
});

Util.extend(EagleNodeMap.prototype, {
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

    if(idx != -1) list[idx] = value;
    else list.push(value);
    //console.log(`${idx == -1 ? "push" : "assign"} property ${name} [${idx}]`);
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

  //console.log("makeEagleNodeMap(", list, ", ", key, ")");

  const instance = new Ctor(list, key);

  return new Proxy(instance, {
    get(target, prop, receiver) {
      let index;

      if(prop == "ref" || prop == "raw") return instance.list[prop];
      if(prop == "instance") return instance;
      if(prop == "length" || prop == "size") return (instance.list.raw || instance.list).length;
      if(prop == Symbol.iterator) return instance.entries()[Symbol.iterator];
      /*if(/^[0-9]+$/.test(prop)) {
        index = parseInt(prop);
        if(index >= 0 && index < instance.list.raw.length)
          return instance.list[prop];
      }*/
      if((index = instance.keys().indexOf(prop)) != -1) return instance.list[index];
      if(typeof instance[prop] == "function") return instance[prop].bind(instance);

      return Reflect.get(target, prop, receiver);
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(instance);
    },
    ownKeys(target) {
      let keys = instance.keys();
      //  console.log("keys:",keys);
      return keys;
    }
  });
}
