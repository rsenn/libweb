import { EagleRef, EagleReference } from "./locator.js";
import { EagleElement, makeEagleElement } from "./element.js";
import Util from "../util.js";
import { inspect } from "./common.js";

export function EagleNodeList(owner, ref) {
  this.ref = ref;
  Util.define(this, "owner", owner);
}

Object.defineProperties(EagleNodeList.prototype, {
  ref: { writable: true, configurable: true, enumerable: false, value: null },
  owner: { writable: true, configurable: true, enumerable: false, value: null }
});

Util.extend(EagleNodeList.prototype, {
  /* get(value, key = "name") {
    return Util.find(this, value, key);
  },

  getKey(value, key = "name") {
    return this.indexOf(item => item[key] == value);
  },

  set(obj, prop = "name") {
    const value = obj[prop];
    let key = this.getKey(value, prop);
    if(key == -1) this.push(obj);
    else this[key].replace(obj);
  },
*/
  *[Symbol.iterator]() {
    const list = this.ref.dereference();
    for(let i = 0; i < list.length; i++) yield makeEagleElement(instance, this.ref.down(i));
  },

  iterator() {
    const instance = this;

    return function*() {
      const list = instance.ref.dereference();
      for(let i = 0; i < list.length; i++) yield makeEagleElement(instance, instance.ref.down(i));
    };
  },
  *entries() {
    const instance = this;
    const list = instance.ref.dereference();
    for(let i = 0; i < list.length; i++) yield [i, makeEagleElement(instance, instance.ref.down(i))];
  }
});

EagleNodeList.make = function() {
  let args = [...arguments];
  let ref;
  let owner = args.shift();
  let down = [];
  if("ref" in owner && "length" in args[0]) ref = EagleRef(owner.ref.root, args.shift());
  else if(args[0] instanceof EagleReference) ref = args.shift();

  //ref = ref.shift(-2);
  //console.log(`EagleNodeList(${Util.className(owner)}, ${ref.inspect(", ")})`);

  if(ref.path.last != "children") ref = ref.down("children");

  const Ctor = EagleNodeList;
  return { instance: new Ctor(owner, ref), Ctor };
};

export function makeEagleNodeList(...args) {
  const { Ctor, instance } = EagleNodeList.make(...args);
  return new Proxy(instance, {
    /* defineProperty(target,key,descriptor) {
      console.log("new property:", key);
      return Reflect.defineProperty(instance.ref.dereference(), key, descriptor);

    },*/
    set(target, prop, value) {
      if(/^[0-9]+$/.test(prop + "")) prop = parseInt(prop);
      console.log("write property:", prop);
      if(typeof prop == "number") {
        let list = instance.ref.dereference();

        let len = list.length;
        /* console.log(`ref:`, dump(instance.ref, 0));
        console.log(`list:`, dump(list, 0));*/
        console.log(`${prop + 1 == len ? "push" : "replace"} property ${prop}/${len}:`, dump(value, 0));
        /* if(prop + 1 == len)
          list.push(value);
        else*/
        if(typeof value == "object" && "raw" in value) value = value.raw;

        Reflect.set(list, prop, value);
        //        list[prop] = value;
        return true;
      } else {
        return Reflect.set(target, prop, value);
      }
    },
    get(target, prop, receiver) {
      let index;

      if(prop == "raw") return instance.ref.dereference();
      if(prop == "instance") return instance;
      if(prop == "iterator") return instance.iterator();
      if(prop == Symbol.iterator) return instance.iterator();
      if(typeof Ctor.prototype[prop] == "function") return Ctor.prototype[prop].bind(instance);
      let list = instance.ref.dereference();
      if(prop == "find")
        return name => {
          const idx = list.findIndex(e => e.attributes.name == name);
          return idx == -1 ? null : makeEagleElement(instance, instance.ref.down(idx));
        };
      if(prop == "entries") return () => list.map((item, i) => [item.attributes.name, item]);
      // if(typeof list[prop] == "function") return list[prop].bind(list);
      if(/^[0-9]+$/.test(prop + "")) {
        let r = instance.ref.down(prop);
        //console.log("read property:", prop, r.dereference());
        return makeEagleElement(instance, r);
      }
      if(typeof Array.prototype[prop] == "function") return Array.prototype[prop].bind(target);

      if(((typeof prop == "string" || typeof prop == "number") && /^([0-9]+|length)$/.test("" + prop)) || prop == Symbol.iterator || ["findIndex"].indexOf(prop) !== -1) {
        if(prop in list) return list[prop];
      }

      return Reflect.get(target, prop, receiver);
    },
    ownKeys(target) {
      let list = instance.ref.dereference();
      return ["owner", "length"]; //Reflect.ownKeys(list);
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(instance);
    }
  });
}
