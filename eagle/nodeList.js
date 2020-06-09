import { EagleRef, EagleReference } from './locator.js';
import { makeEagleElement } from './element.js';
import Util from '../util.js';
import { toXML } from './common.js';

export function EagleNodeList(owner, ref, raw) {
  if(!raw) {
    raw = ref.dereference();
    msg`raw = ${raw}, ref = ${ref}`;
  }

  let species = Util.getConstructor(owner);

  // console.log('EagleNodeList', { ref, owner, raw });
  Util.define(this, { ref, owner, raw, [Symbol.species]: species });
}

Object.defineProperties(EagleNodeList.prototype, {
  ref: { writable: true, configurable: true, enumerable: false, value: null },
  owner: { writable: true, configurable: true, enumerable: false, value: null },
  raw: { writable: true, configurable: true, enumerable: false, value: null }
});

Object.assign(EagleNodeList.prototype, {
  at(pos) {
    const { owner, ref, raw } = this;
    return raw[pos] ? owner.constructor.get(owner, ref.down(pos), raw[pos]) : null;
  },
  *[Symbol.iterator]() {
    const { ref, owner, raw } = this;
    const ctor = owner.constructor;
    //console.log("Symbol.iterator", {path: ref.path,ctor,owner,raw});
    for(let i = 0; i < raw.length; i++) {
      let childRef = new EagleRef(ref.root, [...ref.path, i]);

      let r = makeEagleElement(owner, childRef, raw[i]);
      // console.log('EagleNodeList  *[Symbol.iterator]()', { raw: raw[i], i, parent: owner.ref, root: r.path, ref: childRef, r });

      yield r;
    }
  },
  get length() {
    const { ref, owner, raw } = this;
    //console.log('get length', this.raw);
    return raw ? raw.length : 0;
  },
  iterator() {
    const instance = this;
    return function*() {
      const list = instance.ref.dereference();
      for(let i = 0; i < list.length; i++) yield makeEagleElement(this.owner, instance.ref.down(i));
    };
  },
  entries() {
    return [...this[Symbol.iterator]()].map((v, i) => [i, v]);
  },

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.entries().map(([k, v]) => v);
  }

  /*,
  findIndex(pred) {
    let i;
    const list = this; //.ref.dereference();
    for(i = 0; i < list.length; i++) {
      //console.log("findIndex", { i, list });
      if(pred(list[i])) return i;
    }
    return -1;
  }*/
});

EagleNodeList.make = function(owner, ref, raw) {
  const Ctor = EagleNodeList;
  return { instance: new Ctor(owner, ref, raw), Ctor };
};
export function makeEagleNodeList(owner, ref, raw) {
  const { Ctor, instance } = EagleNodeList.make(owner, ref, raw);
  return new Proxy(instance, {
    set(target, prop, value) {
      if(typeof prop == 'number' || (typeof prop == 'string' && /^[0-9]+$/.test(prop))) {
        prop = +prop;
        let list = instance.ref.dereference();
        let len = list.length;
        if(typeof value == 'object' && 'raw' in value) value = value.raw;
        Reflect.set(list, prop, value);
        return true;
      } else {
        return Reflect.set(target, prop, value);
      }
    },
    get(target, prop, receiver) {
      let index;
      let is_symbol = typeof prop == 'symbol';
      let e;
      if(typeof prop == 'number' || (typeof prop == 'string' && /^[0-9]+$/.test(prop))) {
        prop = +prop;
        return instance.at(prop);
      }
      if(prop == 'length') {
        return instance.raw.length;
      }
      if(prop == 'raw') return instance.ref.dereference();
      if(prop == 'instance') return instance;
      if(typeof Ctor.prototype[prop] == 'function') return Ctor.prototype[prop].bind(instance);
      let list = instance.ref.dereference();
      if(prop == 'find')
        return name => {
          const idx = list.findIndex(e => e.attributes.name == name);
          return idx == -1 ? null : makeEagleElement(instance, instance.ref.down(idx));
        };
      if(prop == 'entries') return () => list.map((item, i) => [item.attributes.name, item]);
      if(typeof Array.prototype[prop] == 'function') return Array.prototype[prop].bind(instance);
      if((!is_symbol && /^([0-9]+|length)$/.test('' + prop)) || prop == Symbol.iterator || ['findIndex'].indexOf(prop) !== -1) {
        if(prop in list) return list[prop];
      }
      return Reflect.get(instance, prop, receiver);
    },
    getPrototypeOf(target) {
      return EagleNodeList.prototype;
      return Reflect.getPrototypeOf(instance);
    }
  });
}
