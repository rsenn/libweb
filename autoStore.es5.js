"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLocalStorage = getLocalStorage;
exports.makeAutoStoreHandler = exports.makeDummyStorage = exports.makeLocalStore = exports.logStoreAdapter = exports.makeLocalStorage = void 0;

var _mobx = require("mobx");

const makeLocalStorage = () => {
  if(global.window && window.localStorage)
    return {
      get: name => JSON.parse(window.localStorage.getItem(name)),
      set: (name, data) => window.localStorage.setItem(name, JSON.stringify(data)),
      remove: name => window.localStorage.removeItem(name)
    };
  return {
    get: name => ({}),
    set: (name, data) => undefined,
    remove: name => undefined
  };
};

exports.makeLocalStorage = makeLocalStorage;

const logStoreAdapter = store => {
  return {
    store,
    get: function get(name) {
      return this.store.get(name);
    },
    set: function set(name, data) {
      return this.store && this.store.set ? this.store.set(name, data) : null;
    },
    remove: function remove(name) {
      return this.store && this.store.remove ? this.store.remove(name) : null;
    }
  };
};

exports.logStoreAdapter = logStoreAdapter;

const makeLocalStore = name => ({
  name,
  storage: makeLocalStorage(),

  get() {
    return this.storage.get(this.name);
  },

  set(data) {
    return this.storage.set(this.name, data);
  },

  remove() {
    return this.storage.remove(this.name);
  }
});

exports.makeLocalStore = makeLocalStore;

const makeDummyStorage = () => ({
  get: name => null,
  set: (name, data) => {},
  remove: name => {}
});

exports.makeDummyStorage = makeDummyStorage;

function getLocalStorage() {
  if(getLocalStorage.store === undefined) {
    getLocalStorage.store = global.window && window.localStorage ? makeLocalStorage() : makeDummyStorage();
  }

  return getLocalStorage.store;
}

const makeAutoStoreHandler = (name, store) => {
  if(!store) store = getLocalStorage();

  var fn = function fn(_this, _member) {
    let firstRun = false;
    const disposer = (0, _mobx.autorun)(() => {
      if(firstRun) {
        const existingStore = store.get(name);

        if(existingStore) {
          _this[_member] = existingStore;
        }
      }

      const updatedStore = _this[_member];

      if(updatedStore) {
        fn.update ? fn.update(updatedStore) : store.set(name, updatedStore);
      } else {
        store.remove(name);
      }
    });
    firstRun = false;
    return disposer;
  };

  fn.update = function(updatedStore) {
    try {
      store.set(name, updatedStore);
    } catch(err) {}
  };

  fn.set = store.set;
  fn.get = store.get;
  fn.remove = store.remove;
  return fn;
};

exports.makeAutoStoreHandler = makeAutoStoreHandler;
