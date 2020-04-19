import { EaglePath, EagleRef } from "./locator.js";
import { EagleEntity, EagleElement } from "./entity.js";
//import { EagleDocument } from "./document.js";
import util from "util";
import Util from "../util.js";
import deep from "../deep.js";
import { lazyMembers, lazyMap } from "../lazyInitializer.js";
import { ansi, text, dingbatCode, dump, parseArgs, traverse, toXML, inspect, EagleInterface } from "./common.js";

export function EagleNodeList() {
  let args = [...arguments];
  let ref,
    owner = args.shift();
  let down = [];

  if("ref" in owner) ref = owner.ref;

  // if(args.length > 0) ref = ref.down(...args);

  /*if(typeof args[0] == "object" && args[0] !== null && "root" in args[0] && "path" in args[0]) ref = args.shift();
  else
 */

  const Ctor = class EagleNodeList {
    ref = null;
    owner = null;

    constructor(owner, ref) {
      Util.define(this, "owner", owner);
      Util.define(this, "ref", ref);
    }
    /*
    static fromElement(element) {
      return EagleNodeList.fromRef(element.ref, "children");
    }
    static fromRef(ref, ...args) {
      return new EagleNodeList(ref.root, ref.path, ...args);
    }
*/
    get(value, key = "name") {
      return Util.find(this, value, key);
    }

    getKey(value, key = "name") {
      return this.indexOf(item => item[key] == value);
    }

    set(obj, prop = "name") {
      const value = obj[prop];
      let key = this.getKey(value, prop);
      if(key == -1) this.push(obj);
      else this[key].replace(obj);
    }
  };
  //ref = ref.shift(-2);
  //console.log(`EagleNodeList(${Util.className(owner)}, ${ref.inspect(", ")})`);
  const instance = new Ctor(owner, ref);
  const property = "name";
  return new Proxy(instance, {
    get(target, prop, receiver) {
      let index;
      let arr;

      if((typeof prop == "string" && /^([0-9]+|length)$/.test(prop)) || prop == Symbol.iterator || ["findIndex"].indexOf(prop) !== -1) {
        arr = instance.ref.dereference().children;

        /* console.log("arr:",instance.ref.up(1).dereference());*/
        if(typeof prop == "string" && /^[0-9]+$/.test(prop)) prop = parseInt(prop);
        if(typeof prop == "number") return prop in arr ? EagleElement(instance, instance.ref.concat(["children", prop])) : undefined;
        if(typeof Array.prototype[prop] == "function") return Array.prototype[prop].bind(arr);

        if(prop in arr) return arr[prop];

        prop = Util.findKey(arr, prop, property);
        if(prop in arr) return arr[prop];
      }

      return Reflect.get(target, prop, receiver);
    },
    ownKeys(target) {
      arr = instance.ref.dereference();
      return arr.map(child => child[property]);
    }
  });
}
