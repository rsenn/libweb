import { Util } from "./util.js";
import { trkl } from "./trkl.js";

export function Instance({ trackable = false, callback, initVal = null }) {
  let inst = trackable && trackable.subscribe !== undefined ? trackable : trkl(initVal);

  if(callback) inst.subscribe(value => callback(value, inst));
  inst.subscribe(newVal => {
    if(newVal) console.log("new instance: ", value);
  });
  /*else*/
  /*  inst.subscribe(value => {
    if(value) inst.current = value; 
  });
*/
  trkl.property(inst, "current", inst);
  return inst;
}

function TrackedInstance(initVal = null) {
  const callback = value => {};
  var inst = Instance({ trackable: true, callback, initVal });

  return inst;
}

export function lazyInitializer(fn, opts = {}) {
  var instance = trkl();
  var ret = (value = null) => {
    if(value === null) {
      if(!instance()) {
        const initVal = fn(instance);
        instance(initVal);
        //console.log("initialized to: ", initVal);
      }
      return instance();
    }
    return instance(value);
  };
  ret.subscribe = instance.subscribe.bind(instance);
  return ret;
}

export function lazyMembers(obj, members) {
  let initializers = {};

  for(let name in members) {
    initializers[name] = lazyInitializer(members[name]);

    Object.defineProperty(obj, name, {
      get: function() {
        return initializers[name]();
      },
      set: function(value) {
        initializers[name](value);
        return initializers[name]();
      },
      enumerable: true
    });
  }
}

export function lazyMap(arr, lookup = item => item.name, ctor = arg => arg, proto) {
  /*  let m = new Map();

  for(let [k,v] of entries)
    m.set(k, lazyInitializer(v));
*/
  var cache = {};
  let p = new Proxy(arr, {
    get(target, key, receiver) {
      // console.log("key:", key);
      let index = typeof key == "string" && /^[0-9]+$/.test(key) ? parseInt(key) : key;
      if(cache[key]) return cache[key];
      if(key == "length") {
        index = key;
      } else if(typeof index == "string") {
        index = Util.findKey(target, (v, k) => lookup(v) === key);
        if(typeof index == "string" && /^[0-9]+$/.test(index)) index = parseInt(index);

        if(typeof index != "number" || typeof index != "string") index = key;
      }

      let ret = Reflect.get(target, index);
      if(typeof ret == "object" && typeof index == "number") {
        key = lookup(ret);
        cache[key] = ctor(ret, index);
        ret = cache[key];
      }
      /*  if(typeof(index) == 'number' || typeof(index) == 'string')
       console.log(`getting  @${index} = ` + ret);*/
      return ret;
    },
    set(target, key, value, receiver) {
      console.log(`setting ${key}!`);
      // Reflect.set(target, key, value, receiver);
    },
    has(target, key) {
      if(Reflect.has(target, key)) return true;
      const len = Reflect.get(target, "length");
      if(typeof key == "number") return key >= 0 && key < len;

      for(let i = 0; i < len; i++) if(lookup(Reflect.get(target, i)) === key) return true;
      return false;
    },
    getPrototypeOf(target) {
      return proto;
    } /*,
      ownKeys(target) {
        let keys = [];
        for(let i = 0; i < Reflect.get(target, "length"); i++) {
          keys.push(lookup(Reflect.get(target, ''+i)));
        }
        return keys;
      }*/
  });

  return p;
}

export function lazyArray(elements) {
  let initializers = new Array(elements.length);
  let i = 0;
  let arr = new Array(elements.length);
  let props = {};

  for(let fn of elements) {
    let lazy = lazyInitializer(fn);
    props[i] = {
      get: function() {
        return lazy();
      },
      //set: function(value) {lazy(value); },
      enumerable: true
    };
    i++;
  }
  Object.defineProperties(arr, props);
  //  arr.length = elements.length;
  return arr;
}

export function valueInitializer(createFunction, onInit) {}
