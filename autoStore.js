import { autorun } from "mobx";

export const makeLocalStorage = () => ({
  get: name => JSON.parse(localStorage.getItem(name)),
  set: (name, data) => localStorage.setItem(name, JSON.stringify(data)),
  remove: name => localStorage.removeItem(name)
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

export const makeAutoStoreHandler = (name, _class) => {
  const store = getLocalStorage();
  return (_this, _member) => {
    let firstRun = false; //true;
    // will run on change
    const disposer = autorun(() => {
      // on load check if there's an existing store on localStorage and extend the store
      if(firstRun) {
        const existingStore = store.get(name);
        if(existingStore) {
          /*          if(_class)
            _class.setState({ [name]: existingStore });
          else*/
          _this[_member] = existingStore;
          _class.setSource("local", _member);
          //console.log("AUTO RUN localStore '" + name + "' READ " + Object.keys(existingStore).length + ' keys');
        }
      }
      const updatedStore = _this[_member];

      if(updatedStore) {
        //console.log("AUTO store '" + name + "' WRITE " + Object.keys(updatedStore).length + ' keys');
        // from then on serialize and save to localStorage
        store.set(name, updatedStore);
      } else {
        store.remove(name);
      }
    });
    firstRun = false;
    return disposer;
  };
};
