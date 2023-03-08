import { EagleRef } from './ref.js';
import { EagleElement } from './element.js';
//import Util from '../util.js';
import { className, define, getConstructor, isObject } from '../misc.js';

import { text, concat, inspectSymbol } from './common.js';

export class EagleNodeList {
  constructor(owner, ref, pred, getOrCreate = EagleElement.get) {
    //console.log('EagleNodeList.constructor', { owner: owner.raw, ref, pred });
    if(isObject(owner) && !('raw' in owner)) throw new Error('raw owner');
    if(isObject(ref) && !('dereference' in ref)) ref = EagleRef(owner, ref);
    let raw = ref.dereference();
    //     console.log('EagleNodeList.constructor', { owner, ref, pred, raw });
    //console.log('EagleNodeList.constructor', { owner, ref, pred, raw });
    let species = getConstructor(owner);
    define(this, { ref, owner, raw, getOrCreate });
    this.pred = typeof pred == 'function' ? pred : () => true;
  }

  item(pos) {
    let { owner, ref, raw, pred } = this;
    let entries = [...raw.entries()];
    if(pos < 0) pos += raw.length;
    if(typeof pred == 'function') {
      entries = entries.filter(([i, v]) => pred(v, i, raw));
      if(entries[pos]) pos = entries[pos][0];
    }
    //  let path = ref.path.concat([pos]);
    if(raw && isObject(raw[pos]) && 'tagName' in raw[pos]) {
      owner.document.raw2element.map.delete(raw[pos]);

      let element = this.getOrCreate(owner.document, ref.down(pos));
      // if(pred(element))
      return element;
    }
  }

  *[Symbol.iterator]() {
    const { ref, owner, raw, pred } = this;
    let j = 0;
    let { length } = this;

    for(let i = 0; i < length; i++) {
      let item = this.item(i);

      if(!item) break;

      if(pred && !pred(item, i, this)) continue;

      yield item;

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

  remove(cond) {
    let { raw, pred = i => true } = this;
    if(typeof cond == 'number') {
      let num = cond;
      cond = (child, i, list) => i === num;
    }
    console.log('cond:', cond);
    for(let i = raw.length - 1; i >= 0; i--) if(pred(raw[i], i, this) && cond(raw[i], i, this)) raw.splice(i, 1);

    return this;
  }

  append(...args) {
    let { raw, ref } = this;
    let parent = ref.parent.dereference();
    args = args.map(({ tagName, attributes, children }) => EagleElement.create(tagName, attributes, children));
    parent.children.splice(parent.children.length, parent.children.length, ...args);
    return this;
  }

  toXML(depth = Infinity) {
    let s = '';
    for(let elem of this[Symbol.iterator]()) {
      if(s != '') s += '\n';
      s += elem.toXML(Number.isFinite(depth) ? depth : Infinity);
    }

    return s;
  }

  [inspectSymbol]() {
    let { raw, ref } = this;
    return (
      text(className(this), 0) +
      ` [ ` +
      `...${this.length} items...` +
      //[...this.entries()].reduce((acc, [k, v]) => (acc ? acc + ',\n  ' : acc) + v[inspectSymbol](), '') +
      ` ]`
    );
  }

  static create(owner, ref, pred, getOrCreate) {
    let instance = new EagleNodeList(owner, ref, pred, getOrCreate);
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
        if(typeof instance[prop] == 'function') return instance[prop];
        if(instance[prop] !== undefined) return instance[prop];
        let list = instance && instance.ref ? instance.ref.dereference() : null;
        if(prop == 'find')
          return name => {
            const idx = list.findIndex(e => e.attributes.name == name);
            return idx == -1 ? null : this.getOrCreate(instance, instance.ref.concat([idx]));
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

EagleNodeList.prototype[Symbol.toStringTag] = 'EagleNodeList';

//Util.decorateIterable(EagleNodeList.prototype, false);
