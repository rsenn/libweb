import { EagleRef, EagleReference } from "./locator.js";
import { EagleElement } from "./entity.js";
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
  get(name) {
    const idx = this.arr.findIndex(item => item.attributes[this.key] == name);
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
  keys() {
    return this.arr.raw.map(item => item.attributes[this.key]);
  },
  values() {
    return [...this.arr];
  },
  entries() {
    return this.keys().map((key, i) => [key, this.arr[i]]);
  },
  map() {
    return new Map(this.entries());
  }
});

export function makeEagleNodeMap(arr, key = "name") {
  const Ctor = EagleNodeMap;
  const instance = new Ctor(arr, key);

  return new Proxy(instance, {
    get(target, prop, receiver) {
      if(prop == "ref" || prop == "raw") return instance.arr[prop];
      if(prop == "instance") return instance;
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
