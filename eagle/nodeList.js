import { EagleRef } from './ref.js';
import { EagleElement } from './element.js';
import Util from '../util.js';

export class EagleNodeList {
  constructor(owner, ref, pred) {
    if(Util.isObject(ref) && !('dereference' in ref)) ref = EagleRef(owner, ref);
    let raw = ref.dereference();
    //Util.log('EagleNodeList.constructor', { owner, ref, pred, raw });
    let species = Util.getConstructor(owner);
    Util.define(this, { ref, owner, raw });
    if(pred) this.pred = pred;
  }

  item(pos) {
    let { owner, ref, raw, pred } = this;
    if(typeof pred == 'function') raw = raw.filter(pred);

    if(pos < 0) pos += raw.length;
    if(raw && Util.isObject(raw[pos]) && 'tagName' in raw[pos]) return EagleElement.get(owner.document, ref.down(pos) /*, raw[pos]*/);
  }

  *[Symbol.iterator]() {
    let { ref, owner, raw, pred } = this;
    console.log('Symbol.iterator', { ref, owner, raw, pred: pred + '' });
    let j = 0;
    for(let i = 0; i < raw.length; i++) {
      if(pred && !pred(raw[i], j, this)) continue;
      yield EagleElement.get(owner, ref.down(i) /*, raw[i]*/);
      j++;
    }
  }

  get length() {
    let { ref, owner, raw, pred } = this;
    if(typeof pred == 'function') raw = raw.filter(pred);
    return raw ? raw.length : 0;
  }

  get iterator() {
    return this[Symbol.iterator];
  }

  remove(pred) {
    let { raw } = this;
    if(typeof pred == 'number') {
      let num = pred;
      pred = (child, i, list) => i === num;
    }

    for(let i = raw.length - 1; i >= 0; i--) if(this.pred(raw[i], i, this) && pred(raw[i], i, this)) raw.splice(i, 1);

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

  static create(owner, ref, pred) {
    let instance = new EagleNodeList(owner, ref, pred);
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
        if(typeof prop == 'number' || (typeof prop == 'string' && /^-?[0-9]+$/.test(prop))) {
          prop = +prop;
          return instance.item(prop);
        }

        if(prop == 'length') {
          return instance.length;
        }

        if(prop == 'raw') {
          const { raw, ref } = instance;
          return raw || (ref && ref.dereference());
        }

        if(prop == 'instance') return instance;
        if(typeof EagleNodeList.prototype[prop] == 'function') return EagleNodeList.prototype[prop];
        if(prop == 'path') return instance.ref.path;
        if(typeof instance[prop] == 'function') return instance[prop].bind(instance);
        if(instance[prop] !== undefined) return instance[prop];
        let list = instance && instance.ref ? instance.ref.dereference() : null;
        if(prop == 'find')
          return name => {
            const idx = list.findIndex(e => e.attributes.name == name);
            return idx == -1 ? null : EagleElement.get(instance, instance.ref.concat([idx]));
          };
        //      if(prop == 'entries') return () => list.map((item, i) => [item.attributes.name, item]);

        if((list && !is_symbol && /^([0-9]+|length)$/.test('' + prop)) || ['findIndex'].indexOf(prop) !== -1) {
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

Util.decorateIterable(EagleNodeList.prototype, true);
