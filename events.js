import { fnmatch, PATH_FNM_MULTI } from './fnmatch.js';
const indexOf = (haystack, needle) => Array.prototype.indexOf.call(haystack, needle);

function define(obj, prop, value) {
  Object.defineProperty(obj, prop, {
    value,
    enumerable: false,
    writable: true,
    configurable: true
  });
}

export const LogWrap = (globalThis.LogWrap = function LogWrap(log) {
  if(typeof log == 'string') {
    let str = log;
    log = (...args) => console.log(str, ...args);
  } else if(!log) {
    log = (...args) => console.log(...args);
  }
  return (value, ...args) => (log(value, ...args), value);
});

export class EventEmitter {
  events = {};

  constructor() {
    delete this.events;
    define(this, 'events', this.events || {});
  }

  on(event, listener) {
    define(this, 'events', this.events || {});
    let a = (this.events[event] = this.events[event] ?? []);

    if(a.indexOf(listener) == -1) a.push(listener);
    return this;
  }

  removeListener(event, listener) {
    define(this, 'events', this.events || {});

    if(listener === undefined) return this.removeAllListeners(event);

    let a = (this.events[event] = this.events[event] ?? []);
    if(a.length) {
      let { length } = a;
      for(let i = length - 1; i >= 0; i--) if(listener == undefined || a[i] == listener) a.splice(i, 1);
    }
  }

  removeAllListeners(type) {
    define(this, { events: this.events ?? {} });

    if(type) delete this.events[type];
    else this.events = {};
    return this;
  }

  off(...args) {
    return args.length > 1 ? this.removeListener(...args) : this.removeAllListeners(...args);
  }

  emit(event, ...args) {
    define(this, { events: this.events ?? {} });
    for(let pattern in this.events) {
      let a = this.events[pattern];

      if(fnmatch(pattern, event, PATH_FNM_MULTI)) continue;
      //  console.log('emit', { pattern, event });

      if(a.length) {
        let { length } = a;
        for(let i = 0; i < length; i++) if(typeof a[i] == 'function') a[i].apply(this, args);
      }
    }
  }

  once(event, listener) {
    let callback;
    callback = e => {
      this.removeListener(event, callback);
      listener.call(this, e);
    };
    this.on(event, callback);
  }

  iterator(type) {
    return new Repeater(async (push, stop) => {
      let ret;
      while((ret = await this.next(type))) {
        if(!ret || ret.done == true) break;
        await push(ret.value);
      }
      await stop();
    });
  }

  eventNames() {
    return Object.keys(this.events);
  }
  listenerCount(type) {
    return this.events[type].length;
  }
  listeners(type) {
    return this.events[type];
    p;
  }

  [Symbol.asyncIterator]() {
    return {
      next: type => new Promise(async resolve => this.once(type, e => resolve({ done: false, value: e })))
    };
  }

  waitFor(type) {
    return new Promise((resolve, reject) => {
      this.once(type, resolve);
    });
  }

  static [Symbol.hasInstance](obj) {
    if(typeof obj == 'object' && obj != null) {
      if(obj instanceof EventEmitter) return true;
    }
    if(['on', 'once', 'emit'].every(method => typeof obj[method] == 'function')) return true;
    return false;
  }
}

const PRIVATE = Symbol('EventTarget');

export class EventTarget {
  /*constructor() {
    Object.defineProperty(this, PRIVATE, {
      value: {
        listeners: new Map()
      }
    });
  }*/
  #listeners = new Map();

  #typedListeners(type) {
    const l = this.#listeners;
    if(!l.has(type)) l.set(type, []);
    return l.get(type);
  }

  addEventListener(type, listener) {
    if(typeof type !== 'string') throw new TypeError('`type` must be a string');
    if(typeof listener !== 'function') throw new TypeError('`listener` must be a function');
    this.#typedListeners(type).push(listener);
  }

  removeEventListener(type, listener) {
    if(typeof type !== 'string') throw new TypeError('`type` must be a string');
    if(typeof listener !== 'function') throw new TypeError('`listener` must be a function');
    const typedListeners = this.#typedListeners(type);
    for(let i = typedListeners.length; i >= 0; i--) if(typedListeners[i] === listener) typedListeners.splice(i, 1);
  }

  dispatchEvent(type, event) {
    const typedListeners = this.#typedListeners(type);
    if('target' in event || 'detail' in event) event.target = this;
    const queue = [];
    for(let i = 0; i < typedListeners.length; i++) queue[i] = typedListeners[i];
    for(let listener of queue) listener(event);
    // Also fire if this EventTarget has an `on${EVENT_TYPE}` property
    // that's a function
    if(typeof this[`on${type}`] === 'function') this[`on${type}`](event);
  }

  static [Symbol.hasInstance](obj) {
    if(typeof obj == 'object' && obj != null) {
      if(obj instanceof EventTarget) return true;
    }
    if(['addEventListener', 'removeEventListener', 'dispatchEvent'].every(method => typeof obj[method] == 'function')) return true;
    return false;
  }
}

const getMethods = obj =>
  Object.getOwnPropertyNames(obj)
    .filter(n => n != 'constructor')
    .reduce((acc, n) => ({ ...acc, [n]: obj[n] }), {});

export const eventify = self => {
  let methods = getMethods(EventEmitter.prototype);
  console.log(methods);

  return Object.assign(self, {
    events: {},
    ...methods
  });
};

export default { EventEmitter, EventTarget, eventify };
