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

export function lazyArray(elements) {
  let initializers = new Array(elements.length);
  let i = 0;
  let arr = new Array(elements.length);

  for(let fn of elements) {
    initializers[i] = lazyInitializer(fn);

    Object.defineProperty(arr, i, {
      get: function() {
        return fn();
      },
      set: function(value) {
        fn(value);
      },
      enumerable: true
    });
    i++;
  }
  //  arr.length = elements.length;
  return arr;
}

export function valueInitializer(createFunction, onInit) {}
