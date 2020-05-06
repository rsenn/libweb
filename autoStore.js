import { autorun, toJS } from "mobx";

export const makeLocalStorage = () => {
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

export const logStoreAdapter = store => {
  return {
    store,
    get: function(name) {
      return this.store.get(name);
    },
    set: function(name, data) {
      return this.store && this.store.set ? this.store.set(name, data) : null;
    },
    remove: function(name) {
      return this.store && this.store.remove ? this.store.remove(name) : null;
    }
  };
};

export const makeLocalStore = name => ({
  name,
  storage: makeLocalStorage(),
  get() {
    //console.log(`localStore[${this.name}].get()`);
    return this.storage.get(this.name);
  },
  set(data) {
    //console.log(`localStore[${this.name}].set(data)`);

    return this.storage.set(this.name, data);
  },
  remove() {
    //console.log(`localStore[${this.name}].remove()`);

    return this.storage.remove(this.name);
  }
});

export const makeDummyStorage = () => ({
  get: name => null,
  set: (name, data) => {},
  remove: name => {}
});

export function getLocalStorage() {
  if(getLocalStorage.store === undefined) {
    getLocalStorage.store = global.window && window.localStorage ? makeLocalStorage() : makeDummyStorage();
  }
  return getLocalStorage.store;
}

export const makeAutoStoreHandler = (name, store) => {
  if(!store) store = getLocalStorage();
  var fn = function(_this, _member) {
    let firstRun = false; //true;
    // will run on change
    const disposer = autorun(() => {
      // on load check if there's an existing store on localStorage and extend the store
      if(firstRun) {
        const existingStore = store.get(name);
        if(existingStore) {
          _this[_member] = existingStore;
        }
      }
      const updatedStore = _this[_member];

      /*      console.log("AutoStoreHandler: ", {
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
  fn.update = function(updatedStore) {
    try {
      store.set(name, updatedStore);
    } catch(err) {
      //console.log("ERROR: ", err);
    }
  };

  fn.set = store.set;
  fn.get = store.get;
  fn.remove = store.remove;

  return fn;
};
