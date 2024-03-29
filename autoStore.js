import { mapAdapter, mapFunction, tryCatch, tryFunction } from './misc.js';

function LocalStore(obj) {
  Object.assign(this, obj);
  return this;
}

LocalStore.prototype.entries = function* () {
  for(let key of this.keys()) yield [key, this.get(key)];
};

LocalStore.prototype.getSetFunction = function() {
  return mapFunction(this);
};
LocalStore.prototype.adapter = function() {
  return mapAdapter(this.getSetFunction());
};

LocalStore.prototype.toMap = function() {
  return new Map(this.entries());
};
LocalStore.prototype.toObject = function() {
  return Object.fromEntries(this.entries());
};
LocalStore.prototype.toJSON = function() {
  return JSON.stringify(this.toObject());
};

export const makeLocalStorage = () => {
  let w;

  try {
    w = globalThis.window;
  } catch(e) {}
  if(!w)
    try {
      w = global.window;
    } catch(e) {}
  if(!w)
    try {
      w = navigator.window;
    } catch(e) {}

  if(w && w.localStorage)
    return new LocalStore({
      get: tryFunction(
        name => JSON.parse(w.localStorage.getItem(name)),
        v => v,
        (err, name) => (w.localStorage.removeItem(name), undefined)
      ),
      set: (name, data) => w.localStorage.setItem(name, JSON.stringify(data)),
      remove: name => w.localStorage.removeItem(name),
      keys: () => {
        let i = 0,
          key,
          r = [];
        while((key = localStorage.key(i++))) r.push(key);
        return r;
      }
    });
  return new LocalStore({
    get: name => ({}),
    set: (name, data) => undefined,
    remove: name => undefined,
    keys: () => []
  });
};

export const logStoreAdapter = store => ({
  store,
  get(name) {
    return this.store.get(name);
  },
  set(nam1e, data) {
    return this.store && this.store.set ? this.store.set(name, data) : null;
  },
  remove(name) {
    return this.store && this.store.remove ? this.store.remove(name) : null;
  }
});

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
  let w = tryCatch(() => globalThis.window);

  if(getLocalStorage.store === undefined) {
    getLocalStorage.store = w && w.localStorage ? makeLocalStorage() : makeDummyStorage();
  }
  return getLocalStorage.store;
}

export const makeAutoStoreHandler = (name, store, runner /* = mobx.autorun */) => {
  if(!store) store = getLocalStorage();
  var fn = function(_this, _member) {
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
