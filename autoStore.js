import Util from './util.js';

export const makeLocalStorage = () => {
  let w = Util.tryCatch(() => window);

  if(w && w.localStorage)
    return {
      get: (name) => JSON.parse(w.localStorage.getItem(name)),
      set: (name, data) => w.localStorage.setItem(name, JSON.stringify(data)),
      remove: (name) => w.localStorage.removeItem(name),
      keys: () => {
        let i = 0,
          key,
          r = [];
        while((key = localStorage.key(i++))) r.push(key);
        return r;
      }
    };
  return {
    get: (name) => ({}),
    set: (name, data) => undefined,
    remove: (name) => undefined,
    keys: () => []
  };
};

export const logStoreAdapter = (store) => {
  return {
    store,
    get: function (name) {
      return this.store.get(name);
    },
    set: function (name, data) {
      return this.store && this.store.set ? this.store.set(name, data) : null;
    },
    remove: function (name) {
      return this.store && this.store.remove ? this.store.remove(name) : null;
    }
  };
};

export const makeLocalStore = (name) => ({
  name,
  storage: makeLocalStorage(),
  get() {
    //Util.log(`localStore[${this.name}].get()`);
    return this.storage.get(this.name);
  },
  set(data) {
    //Util.log(`localStore[${this.name}].set(data)`);

    return this.storage.set(this.name, data);
  },
  remove() {
    //Util.log(`localStore[${this.name}].remove()`);

    return this.storage.remove(this.name);
  }
});

export const makeDummyStorage = () => ({
  get: (name) => null,
  set: (name, data) => {},
  remove: (name) => {}
});

export function getLocalStorage() {
  let w = Util.tryCatch(() => global.window);

  if(getLocalStorage.store === undefined) {
    getLocalStorage.store = w && w.localStorage ? makeLocalStorage() : makeDummyStorage();
  }
  return getLocalStorage.store;
}

export const makeAutoStoreHandler = (name, store, runner /* = mobx.autorun */) => {
  if(!store) store = getLocalStorage();
  var fn = function (_this, _member) {
    let firstRun = false; //true;
    //will run on change
    const disposer = runner(() => {
      //on load check if there's an existing store on localStorage and extend the store
      if(firstRun) {
        const existingStore = store.get(name);
        if(existingStore) {
          _this[_member] = existingStore;
        }
      }
      const updatedStore = _this[_member];

      /*      Util.log("AutoStoreHandler: ", {
        name,
        obj: toJS(_this),
        key: _member,
        value: toJS(updatedStore)
      });*/

      if(updatedStore) {
        fn.update ? fn.update(updatedStore) : store.set(name, updatedStore);
      } else {
        store.remove(name);
      }
    });
    firstRun = false;
    return disposer;
  };
  fn.update = function (updatedStore) {
    try {
      store.set(name, updatedStore);
    } catch(err) {
      //Util.log("ERROR: ", err);
    }
  };

  fn.set = store.set;
  fn.get = store.get;
  fn.remove = store.remove;

  return fn;
};
