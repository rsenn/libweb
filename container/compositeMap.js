export class CompositeMap {
  constructor(entries, options) {
    if(!entries) {
      this.copiedSet = undefined;
      this.keyLength = 0;
      this.data = new Map();
    } else if(entries instanceof CompositeMap) {
      const copyMethod = (options && options.copy) || 'keys';
      switch (copyMethod) {
        case 'keys':
          this.copiedSet = undefined;
          this.keyLength = entries.keyLength;
          this.data = copyMaps(entries.data, entries.keyLength, 0);
          break;
        case 'on-write':
          // When using copy-on-write, map being copied must also use copy-on-write mode
          this.copiedSet = entries.copiedSet = new WeakSet();
          this.keyLength = entries.keyLength;
          this.data = entries.data;
          break;
        default:
          throw new Error(`Unrecognized copy method '${copyMethod}'`);
      }
    } else {
      this.keyLength = (options && options.keyLength) || 0;
      if(!this.keyLength) {
        throw new Error('Array inputs require a non-zero value for options.keyLength');
      }
      this.data = recursiveEntriesToRecursiveMap(this.keyLength - 1, entries, 0);
    }
  }
  set(key, value) {
    if(key.length !== this.keyLength) {
      if(!this.keyLength) {
        this.keyLength = key.length;
      } else {
        throw Error('Invalid key length');
      }
    }
    let map = this.data;
    if(this.copiedSet && !this.copiedSet.has(map)) {
      const temp = map;
      map = new Map();
      temp.forEach((v, k) => {
        map.set(k, v);
      });
      this.data = map;
      this.copiedSet.add(map);
    }
    const lastPartIndex = key.length - 1;
    for(let i = 0; i < lastPartIndex; i++) {
      const keyPart = key[i];
      let nextMap = map.get(keyPart);
      if(!nextMap) {
        nextMap = new Map();
        map.set(keyPart, nextMap);
        if(this.copiedSet) {
          this.copiedSet.add(nextMap);
        }
      } else if(this.copiedSet && !this.copiedSet.has(nextMap)) {
        nextMap = copyMap(nextMap);
        this.copiedSet.add(nextMap);
        map.set(keyPart, nextMap);
      }
      map = nextMap;
    }
    map.set(key[lastPartIndex], value);
    return this;
  }
  clear() {
    if(this.copiedSet && !this.copiedSet.has(this.data)) {
      this.copiedSet = undefined;
      this.data = new Map();
    } else {
      this.data.clear();
    }
    this.keyLength = 0;
  }
  delete(key) {
    if(!this.keyLength) {
      this.copiedSet = undefined;
      return false;
    }
    if(!key.length) {
      if(!this.data.size) {
        this.copiedSet = undefined;
        return false;
      }
      this.clear();
      return true;
    }
    if(key.length > this.keyLength) {
      throw Error('Invalid key length');
    }
    let map = this.data;
    const maps = [map];
    const lastKeyPos = key.length - 1;
    for(let i = 0; i < lastKeyPos; i++) {
      map = map.get(key[i]);
      if(!map) {
        return false;
      }
      maps[i + 1] = map;
    }
    if(!map.has(key[lastKeyPos])) {
      return false;
    }
    // Prune the tree
    let deletePoint = lastKeyPos;
    for(; deletePoint > 0; deletePoint--) {
      const map2 = maps[deletePoint];
      if(map2.size > 1) {
        // Every map has been checked that the corresponding key is present, so if there is only one
        // element, it must belong to the key we are removing.
        break;
      }
    }
    return this.copySection(maps, key, deletePoint).delete(key[deletePoint]);
  }
  has(key) {
    if(!this.keyLength) {
      return false;
    }
    if(!key.length) {
      return this.data.size > 0;
    }
    if(key.length > this.keyLength) {
      throw Error('Invalid key length');
    }
    let map = this.data;
    const lastKeyPos = key.length - 1;
    for(let i = 0; i < lastKeyPos; i++) {
      map = map.get(key[i]);
      if(!map) {
        return false;
      }
    }
    return map.has(key[lastKeyPos]);
  }
  get(key) {
    if(!key.length) {
      return this.data;
    }
    if(!this.keyLength || !key.length) {
      return undefined;
    }
    if(key.length > this.keyLength) {
      throw Error('Invalid key length');
    }
    let map = this.data;
    const lastKeyPos = key.length - 1;
    for(let i = 0; i < lastKeyPos; i++) {
      map = map.get(key[i]);
      if(!map) {
        return undefined;
      }
    }
    return map.get(key[lastKeyPos]);
  }
  forEach(callbackfn) {
    if(callbackfn.length < 2) {
      recurseForEachValue(callbackfn, this.keyLength - 1, this.data, 0);
    } else {
      recurseForEach(callbackfn, this.keyLength - 1, this.data, [], 0);
    }
  }
  keys() {
    let level = 0;
    const lastLevel = this.keyLength - 1;
    let levelIterator = lastLevel ? this.data.entries() : this.data.keys();
    const levelIterators = [levelIterator];
    // TODO: Is key reuse performant?
    const key = [];
    const iterator = {
      [Symbol.iterator]() {
        return iterator;
      }, next() {
        for (;;) {
          const result = levelIterator.next();
          if(result.done) {
            if(level <= 0) {
              return result;
            }
            levelIterator = levelIterators[--level];
          } else if(level < lastLevel) {
            key[level] = result.value[0];
            level++;
            levelIterator = level === lastLevel ? result.value[1].keys() : result.value[1].entries();
            levelIterators[level] = levelIterator;
          } else {
            const key2 = key.slice();
            key2[level] = result.value;
            return { value: key2, done: false };
          }
        }
      }
    };
    return iterator;
  }
  values() {
    let level = 0;
    let levelIterator = this.data.values();
    const levelIterators = [levelIterator];
    const lastLevel = this.keyLength - 1;
    const iterator = {
      [Symbol.iterator]() {
        return iterator;
      }, next() {
        for (;;) {
          const result = levelIterator.next();
          if(result.done) {
            if(level <= 0) {
              return result;
            }
            levelIterator = levelIterators[--level];
          } else if(level < lastLevel) {
            level++;
            levelIterator = result.value.values();
            levelIterators[level] = levelIterator;
          } else {
            return result;
          }
        }
      }
    };
    return iterator;
  }
  entries() {
    let level = 0;
    let levelIterator = this.data.entries();
    const levelIterators = [levelIterator];
    const lastLevel = this.keyLength - 1;
    const key = [];
    // TODO: Try using push/pop
    const iterator = {
      [Symbol.iterator]() {
        return iterator;
      }, next() {
        for (;;) {
          const result = levelIterator.next();
          if(result.done) {
            if(level <= 0) {
              return result;
            }
            levelIterator = levelIterators[--level];
          } else if(level < lastLevel) {
            key[level] = result.value[0];
            level++;
            levelIterator = result.value[1].entries();
            levelIterators[level] = levelIterator;
          } else {
            const key2 = key.slice();
            key2[level] = result.value[0];
            return { value: [key2, result.value[1]], done: false };
          }
        }
      }
    };
    return iterator;
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  toJSON() {
    return getRecursiveEntries(this.keyLength - 1, this.data, 0);
  }
  copySection(maps, key, keyPos) {
    if(!this.copiedSet) {
      return maps[keyPos];
    }
    let prevMap;
    for(let i = 0; i <= keyPos; i++) {
      let map = maps[i];
      if(!this.copiedSet.has(map)) {
        map = copyMap(map);
        this.copiedSet.add(map);
        if(i === 0) {
          this.data = map;
        } else {
          prevMap.set(key[i - 1], map);
        }
      }
      prevMap = map;
    }
    return prevMap;
  }
}
exports.CompositeMap = CompositeMap;
// tslint:disable:variable-name
exports.CompositeMap1 = CompositeMap;
exports.CompositeMap2 = CompositeMap;
exports.CompositeMap3 = CompositeMap;
exports.CompositeMap4 = CompositeMap;
exports.CompositeMap5 = CompositeMap;
exports.CompositeMap6 = CompositeMap;
exports.CompositeMap7 = CompositeMap;
exports.CompositeMap8 = CompositeMap;
exports.CompositeMap9 = CompositeMap;
// tslint:enable:variable-name
function copyMap(map) {
  const newMap = new Map();
  map.forEach((value, key) => {
    newMap.set(key, value);
  });
  return newMap;
}
function copyMaps(map, keyLength, level) {
  if(level >= keyLength - 1) {
    return copyMap(map);
  }
  const mapCopy = new Map();
  map.forEach((value, key) => {
    mapCopy.set(key, copyMaps(value, keyLength, level + 1));
  });
  return mapCopy;
}
function recurseForEach(callbackfn, lastKeyPart, map, keyPart, keyPos) {
  if(keyPos === lastKeyPart) {
    map.forEach((value, key) => {
      const key2 = keyPart.slice();
      key2[keyPos] = key;
      callbackfn(value, key2);
    });
  } else {
    map.forEach((value, key) => {
      keyPart[keyPos] = key;
      recurseForEach(callbackfn, lastKeyPart, value, keyPart, keyPos + 1);
    });
  }
}
function recurseForEachValue(callbackfn, lastKeyPart, map, keyPos) {
  if(keyPos === lastKeyPart) {
    map.forEach(value => {
      callbackfn(value);
    });
  } else {
    map.forEach(value => {
      recurseForEachValue(callbackfn, lastKeyPart, value, keyPos + 1);
    });
  }
}
function getRecursiveEntries(lastKeyPos, map, level) {
  const entries = [];
  if(level >= lastKeyPos) {
    map.forEach((value, key) => {
      entries.push([key, value]);
    });
    return entries;
  }
  map.forEach((value, key) => {
    entries.push([key, getRecursiveEntries(lastKeyPos, value, level + 1)]);
  });
  return entries;
}
function recursiveEntriesToRecursiveMap(lastKeyPos, entries, level) {
  const map = new Map();
  if(level >= lastKeyPos) {
    entries.forEach(entry => {
      map.set(entry[0], entry[1]);
    });
  } else {
    entries.forEach(entry => {
      map.set(entry[0], recursiveEntriesToRecursiveMap(lastKeyPos, entry[1], level + 1));
    });
  }
  return map;
}

export default CompositeMap;
