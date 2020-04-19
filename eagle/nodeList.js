import { EaglePath, EagleRef, EagleReference } from "./locator.js";
import { EagleEntity, EagleElement } from "./entity.js";
//import { EagleDocument } from "./document.js";
import util from "util";
import Util from "../util.js";
import deep from "../deep.js";
import { lazyMembers, lazyMap } from "../lazyInitializer.js";
import { ansi, text, dingbatCode, dump, parseArgs, traverse, toXML, inspect, EagleInterface } from "./common.js";

export function EagleNodeList() {
  return (function() {
    let args = [...arguments];
    let ref;
    let owner = args.shift();
    let down = [];
    if("ref" in owner && "length" in args[0]) ref = EagleRef(owner.ref.root, args.shift());
    else if(args[0] instanceof EagleReference) ref = args.shift();

    // if(args.length > 0) ref = ref.down(...args);

    /*if(typeof args[0] == "object" && args[0] !== null && "root" in args[0] && "path" in args[0]) ref = args.shift();
  else
 */

    const Ctor = class EagleNodeList {
      ref = null;
      owner = null;

      constructor(owner, ref) {
        /*        this.owner = owner;*/
        this.ref = ref;
        Util.define(this, "owner", owner);
        // Util.define(this, "ref", ref);
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
      *[Symbol.iterator]() {
        const arr = this.ref.dereference();
        for(let i = 0; i < arr.length; i++) yield EagleElement(instance, this.ref.down(i));
      }
      iterator() {
        const instance = this;

        return function*() {
          const arr = instance.ref.dereference();
          for(let i = 0; i < arr.length; i++) yield EagleElement(instance, instance.ref.down(i));
        };
      }
    };
    //ref = ref.shift(-2);
    //console.log(`EagleNodeList(${Util.className(owner)}, ${ref.inspect(", ")})`);

    if(ref.path.last != "children") ref = ref.down("children");

    const instance = new Ctor(owner, ref);
    const property = "name";
    return new Proxy(instance, {
      get(target, prop, receiver) {
        let index;
        if(typeof Ctor.prototype[prop] == "function") return Ctor.prototype[prop].bind(instance);

        //  let node = instance.ref.up().dereference();
        let arr = instance.ref.dereference();

        if(prop == "find")
          return name => {
            const idx = arr.findIndex(e => e.attributes.name == name);
            return idx == -1 ? null : EagleElement(instance, instance.ref.down(idx));
          };
        if(prop == "entries") return () => arr.map((item, i) => [item.attributes.name, item]);

        if(typeof Array.prototype[prop] == "function") return Array.prototype[prop].bind(arr);

        if(prop == Symbol.iterator) return instance.iterator();
        /*      return (function*() {
            for(let i = 0; i < arr.length; i++) yield EagleElement(instance, instance.ref.down(i));
          })();
        }*/
        if(/^[0-9]+$/.test(prop + "")) {
          let r = instance.ref.down(prop);
          console.log("read property:", prop, r.dereference());
          return EagleElement(instance, r);
        }

        if(((typeof prop == "string" || typeof prop == "number") && /^([0-9]+|length)$/.test("" + prop)) || prop == Symbol.iterator || ["findIndex"].indexOf(prop) !== -1) {
          if(prop in arr) return arr[prop];
        }
        return Reflect.get(target, prop, receiver);
      },
      ownKeys(target) {
        let arr = instance.ref.dereference();
        return Reflect.ownKeys(arr);
      },
      getPrototypeOf(target) {
        return Reflect.getPrototypeOf((function*() {})());
      }
    });
  })(...arguments);
}
