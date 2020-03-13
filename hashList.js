import { Element, Rect } from "../utils/dom.js";

export class HashList {
  constructor(keyfn, ctor) {
    this.keyfn = keyfn ? keyfn : item => (item.toString !== undefined ? item.toString() : String(item));
    this.ctor = ctor ? ctor : item => item;
    this.width = 0;
    this.keys = [];
  }

  add(arg, key = null) {
    let args = [...arguments];
    let obj = this.ctor.apply(this, args);
    if(!key) key = this.keyfn(obj);
    if(this[key] instanceof Array) {
      this[key].push(obj);
    } else {
      this[key] = [];
      this[key].push(obj);
    }
    if(this.keys.indexOf(key) == -1) this.keys.push(key);
    return this[key];
  }

  toArray() {
    return Object.values(this);
  }

  filter(fn) {
    return this.toArray().filter(img => fn(img));
  }

  reduce(fn, acc) {
    //let list = this;
    let delegate = (acc, key) => {
      const list = this;
      return fn(acc, list[key], key, list);
    };
    return Object.keys(this).reduce(delegate, acc);
  }

  map(fn) {
    return this.toArray().map(fn);
  }

  indexOf(name) {
    let i = Object.keys(this).indexOf(name);
    if(i != -1) return name;
    return Object.keys(this).reduce((acc, key) => (this[key] === name ? key : -1), -1);
  }

  at(index) {
    const key = Object.keys(this)[index];
    return this[key];
  }

  rectAt(name) {
    return this[name].reduce((acc, it) => Rect.union(acc, Element.rect(it.e)), this[name][0].r);
  }

  method(name, arg) {
    let args = [...arguments];
    let arr = this.toArray();
    name = args.shift();
    return arr[name].apply(arr, args);
  }

  filter(arg) {
    return this.method("filter", arg);
  }

  map(arg) {
    return this.method("map", arg);
  }

  find(a) {
    return this.method("find", typeof a === "function" ? (arg, i, arr) => a(arg, arg.name, this) : (arg, i, arr) => (a && arr[i] && a == arr[i].e) || (a instanceof RegExp && (key.match(a) || String(arr[i]).match(a) || arr[i].id == a || arr[i].e == a || Rect.equal(arr[i].rect, arr[i].rect))));
  }

  remap(fn) {
    const arr = this.toArray();
    let ret = new HashList(
      obj => obj.key || obj.id,
      obj => obj
    );
    for(let i = 0; i < arr.length; i++) {
      ret.add(arr[i]);
    }
    return ret;
  }

  toString() {
    return Util.distinct(this.keys)
      .map(key => key + "[" + this[key].length + "]")
      .join(", ");
  }
}

export default HashList;
