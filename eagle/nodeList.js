import { EagleRef } from './ref.js';
import { EagleElement } from './element.js';
import Util from '../util.js';

export class EagleNodeList {
  constructor(owner, ref, raw) {
    //Util.log('EagleNodeList.constructor', { owner, ref, raw });

    if(Util.isObject(ref) && !('dereference' in ref)) ref = EagleRef(owner, ref);

    if(!raw) raw = ref.dereference();
    let species = Util.getConstructor(owner);
    Util.define(this, { ref, owner, raw /*, [Symbol.species]: species*/ });
  }

  item(pos) {
    const { owner, ref, raw } = this;

    if(pos < 0) pos += raw.length;

    //Util.log(`EagleNodeList.item(${pos})`, { owner, ref, raw });
    if(raw && Util.isObject(raw[pos]) && 'tagName' in raw[pos]) return EagleElement.get(owner.document, ref.down(pos), raw[pos]);
  }

  *[Symbol.iterator]() {
    let { ref, owner, raw } = this;
    for(let i = 0; i < raw.length; i++) yield EagleElement.get(owner, ref.down(i), raw[i]);
  }

  get length() {
    const { ref, owner, raw } = this;
    return raw ? raw.length : 0;
  }

  iterator() {
    const instance = this;
    return function*() {
      const list = instance.ref.dereference();
      for(let i = 0; i < list.length; i++) yield EagleElement.get(this.owner, instance.ref.concat([i]));
    };
  }

  entries() {
    return [...this[Symbol.iterator]()].map((v, i) => [i, v]);
  }

  remove(pred) {
    let { raw } = this;
    if(typeof pred == 'number') {
      let num = pred;
      pred = (child, i, list) => i === num;
    }
    for(let i = raw.length - 1; i >= 0; i--) {
      if(pred(raw[i], i, this)) raw.splice(i, 1);
    }
    return this;
  }

  append(...args) {
    let { raw, ref } = this;
    let parent = ref.parent.dereference();
    args = args.map(({ tagName, attributes, children }) => EagleElement.create(tagName, attributes, children));
    parent.children.splice(parent.children.length, parent.children.length, ...args);
    return this;
  }

  toXML() {
    let s = '';
    for(let elem of this[Symbol.iterator]()) {
      if(s != '') s += '\n';
      s += elem.toXML();
    }
    return s;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.entries().map(([k, v]) => v);
  }

  static create(owner, ref, raw) {
    let instance = new EagleNodeList(owner, ref, raw);
    return new Proxy(instance, {
      set(target, prop, value) {
        if(typeof prop == 'number' || (typeof prop == 'string' && /^[0-9]+$/.test(prop))) {
          prop = +prop;
          let list = instance.ref.dereference();
          if(typeof value == 'object' && 'raw' in value) value = value.raw;
          Reflect.set(list, prop, value);
          return true;
        }
        return Reflect.set(target, prop, value);
      },
      get(target, prop, receiver) {
        let index;
        let is_symbol = typeof prop == 'symbol';
        let e;

        //Util.log("EagleNodeList get", {target, prop });

        if(typeof prop == 'number' || (typeof prop == 'string' && /^-?[0-9]+$/.test(prop))) {
          prop = +prop;

          return instance.item(prop);
        }
        if(prop == 'length' && instance.raw) {
          return instance.raw.length;
        }
        if(prop == 'raw') {
          const { raw, ref } = instance;
          //Util.log("prop raw", {raw, ref });
          return raw || (ref && ref.dereference());
        }
        if(prop == 'instance') return instance;
        if(typeof EagleNodeList.prototype[prop] == 'function') return EagleNodeList.prototype[prop] /*.bind(instance)*/;

        if(prop == 'path') return instance.ref.path;

        if(instance[prop] !== undefined) return instance[prop];

        let list = instance && instance.ref ? instance.ref.dereference() : null;
        if(prop == 'find')
          return name => {
            const idx = list.findIndex(e => e.attributes.name == name);
            return idx == -1 ? null : EagleElement.get(instance, instance.ref.concat([idx]));
          };
        if(prop == 'entries') return () => list.map((item, i) => [item.attributes.name, item]);

        //if(typeof Array.prototype[prop] == 'function') return Array.prototype[prop].bind(instance);
        if((list && !is_symbol && /^([0-9]+|length)$/.test('' + prop)) || /* prop == Symbol.iterator ||*/ ['findIndex'].indexOf(prop) !== -1) {
          if(prop in list) return list[prop];
        }

        return Reflect.get(target, prop, receiver);
      },
      getPrototypeOf(target) {
        return EagleNodeList.prototype;
      }
    });
  }
}
