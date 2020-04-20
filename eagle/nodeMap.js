import { EagleRef, EagleReference } from "./locator.js";
import { EagleElement } from "./element.js";
import { EagleNodeList } from "./nodeList.js";
import Util from "../util.js";
import { inspect } from "./common.js";

export function EagleNodeMap(arr, key) {
  Util.define(this, "arr", arr);
  Util.define(this, "key", key);
}

Object.defineProperties(EagleNodeMap.prototype, {
  arr: { writable: true, configurable: true, enumerable: false, value: null },
  key: { writable: true, configurable: true, enumerable: false, value: null }
});

Util.extend(EagleNodeMap.prototype, {
  at(pos) {   
    return this.arr[pos];
  }, 
  get(name, key = this.key) {    
    const arr = this.arr.raw;
    const idx = arr.findIndex(item => item.attributes[key] == name);
    return idx == -1 ? null : this.arr[idx];
  },
  set(name, value) {
    const arr = this.arr.raw;
    const idx = arr.findIndex(item => item.attributes[this.key] == name);

    if(idx != -1) arr[idx] = value;
    else
       arr.push(value);
    console.log(`${idx == -1 ? "push" : "assign"} property ${name} [${idx}]`);
  },
  keys(key = this.key) {
    return this.arr.raw.map(item => item.attributes[key]);
  },
  values() {
    return [...this.arr];
  },
  entries(key = this.key) {
    return this.keys(key).map((key, i) => [key+'', this.arr[i]]);
  },
  map(key = this.key) {
    return new Map(this.entries(key));
  },
  toObject(key = this.key) {
    return Object.fromEntries(this.entries(key));
  }
});

export function makeEagleNodeMap(arr, key = "name") {
  const Ctor = EagleNodeMap;
  const instance = new Ctor(arr, key);

  return new Proxy(instance, {
    get(target, prop, receiver) {
      
      let index; 

      if(prop == "ref" || prop == "raw") return instance.arr[prop];
      if(prop == "instance") return instance;
      if(prop == "length" || prop == 'size') return instance.arr.raw.length;
      /*if(/^[0-9]+$/.test(prop)) {
        index = parseInt(prop);
        if(index >= 0 && index < instance.arr.raw.length)
          return instance.arr[prop];
      }*/
      if((index=instance.keys().indexOf(prop)) != -1) return instance.arr[index];
      if(typeof instance[prop] == "function") return instance[prop].bind(instance);

      return Reflect.get(target, prop, receiver);
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(instance);
    },
    ownKeys(target) {
      return instance.keys();
    }
  });
}
