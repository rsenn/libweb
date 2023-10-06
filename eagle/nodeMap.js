import { className, define, inspectSymbol, isFunction } from '../misc.js';
import { text } from './common.js';

const toArray = arg => (Array.isArray(arg) ? arg : [arg]);

export class EagleNodeMap {
  #keys = null;
  #get = null;

  constructor(list, key) {
    if(!list) throw new Error('List=' + list);

    define(this, { list });

    if(isFunction(key)) {
      this.#get = key;
    } else {
      this.#keys = toArray(key);
      this.#get = function(item) {
        for(let i = 0; i < this.#keys.length; i++) if(this.#keys[i] in item) return item[this.#keys[i]];
      };
    }
  }

  static makePredicate(name, keys) {
    if(isFunction(keys)) return item => keys(item) == name;

    keys = toArray(keys);
    return item => keys.some(key => item.attributes[key] == name);
  }

  item(pos) {
    return this.list.item(pos);
  }

  get(name) {
    const { owner, ref, raw } = this.list || {};
    const fn = EagleNodeMap.makePredicate(name, this.#keys ?? this.#get);

    const idx = raw.findIndex(fn);

    if(idx != -1) {
      let value = raw[idx];
      return raw[idx] ? this.item(idx) : null;
    }
  }

  set(name, value) {
    const list = this.list.raw;
    const fn = EagleNodeMap.makePredicate(name, this.#keys ?? this.#get);

    const idx = list.findIndex(fn);

    if('raw' in value) value = value.raw;

    if(idx != -1) list[idx] = value;
    else list.push(value);
  }

  get size() {
    return this.list.length;
  }

  *entries() {
    let i,
      size = this.size;

    for(i = 0; i < size; i++) {
      let item = this.list.item(i);
      yield [this.#get(item), item];
    }
  }

  *[Symbol.iterator]() {
    let i,
      size = this.size;

    for(i = 0; i < size; i++) {
      let item = this.list.item(i);
      yield [this.#get(item), item];
    }
  }

  toMap() {
    return new Map(this.entries());
  }

  toObject() {
    return Object.fromEntries(this.entries());
  }

  [Symbol.inspect]() {
    return (
      text(className(this), 1, 31) +
      text(`[${this.list.length}]`, 1, 36) +
      ` {\n  ${[...this.entries()].reduce((acc, [k, v]) => (acc ? acc + ',\n  ' : acc) + `'${text(k, 1, 32)}' => ` + (v[inspectSymbol] ?? v.inspect).call(v), '')}\n}`
    );
  }

  static create(list, key = 'name', filter) {
    const instance = new EagleNodeMap(list, key, filter);

    return new Proxy(instance, {
      get(target, prop, receiver) {
        let index;

        if(typeof prop != 'symbol') {
          let item = instance.get(prop, key) || instance.list.item(prop);
          if(item) return item;
        }

        if(typeof prop == 'string') {
          if(prop == 'ref' || prop == 'raw' || prop == 'owner') return instance.list[prop];
          if(prop == 'instance') return instance;
          if(prop == 'length') return instance.length;
        }

        if(typeof instance[prop] == 'function') return instance[prop].bind(instance);

        if(typeof instance.list[prop] == 'function') {
          if(typeof prop == 'symbol') return instance.list[prop];
          return instance.list[prop].bind(instance.list);
        }

        if(!(prop in instance)) if (instance.list[prop]) return instance.list[prop];

        return Reflect.get(target, prop, receiver);
      },
      getPrototypeOf(target) {
        return EagleNodeMap.prototype;
      }
    });
  }
}

EagleNodeMap.prototype[Symbol.toStringTag] = 'EagleNodeMap';
