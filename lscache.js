import { roundTo, tryCatch, tryFunction, mapFunction, mapAdapter, properties, keys, entries, values, errors, types, isObject, toString, btoa, atob, assert, escape, quote, memoize, getset, modifier, getter, setter, gettersetter, hasGetSet, mapObject, once, atexit, waitFor, define, weakDefine, getConstructorChain, hasPrototype, filter, curry, split, unique, getFunctionArguments, randInt, randFloat, randStr, toBigInt, lazyProperty, lazyProperties, getOpt, toUnixTime, unixTime, fromUnixTime, range, repeater, repeat, chunkArray, camelize, decamelize, Location, format, formatWithOptions, isNumeric, functionName, className, isArrowFunction, immutableClass, isArray, ArrayFacade, arrayFacade, bits, dupArrayBuffer, getTypeName, isArrayBuffer, isBigDecimal, isBigFloat, isBigInt, isBool, isCFunction, isConstructor, isEmptyString, isError, isException, isExtensible, isFunction, isHTMLDDA, isInstanceOf, isInteger, isJobPending, isLiveObject, isNull, isNumber, isUndefined, isString, isUninitialized, isSymbol, isUncatchableError, isRegisteredClass, rand, randi, randf, srand, toArrayBuffer, getMethods, isoDate, clamp } from './misc.js';

/**
 * lscache library
 * Copyright (c) 2011, Pamela Fox
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jshint undef:true, browser:true, node:true */
/* global define */

// Prefix for all lscache keys
let CACHE_PREFIX = 'lscache-';

// Suffix for the key name on the expiration items in localStorage
let CACHE_SUFFIX = '-cacheexpiration';

// expiration date radix (set to Base-36 for most space savings)
let EXPIRY_RADIX = 10;

// Determines if localStorage is supported in the browser;
// result is cached for better performance instead of being run each time.
// Feature detection is based on how Modernizr does it;
// it's not straightforward due to FF4 issues.
// It's not run at parse-time as it takes 200ms in Android.
function supportsStorage() {
  let key = '__lscachetest__';
  let value = key;

  if(this.cachedStorage !== undefined) {
    return this.cachedStorage;
  }

  // some browsers will throw an error if you try to access local storage (e.g. brave browser)
  // hence check is inside a try/catch
  try {
    if(!localStorage) {
      return false;
    }
  } catch(ex) {
    return false;
  }

  try {
    Implementations.localStorage.setItem.call(this, key, value);
    Implementations.localStorage.removeItem.call(this, key);
    this.cachedStorage = true;
  } catch(e) {
    // If we hit the limit, and we don't have an empty localStorage then it means we have support
    if(Implementations.localStorage.supported() /*isOutOfSpace.call(this, e) && localStorage.length*/) {
      this.cachedStorage = true; // just maxed it out and even the set test failed.
    } else {
      this.cachedStorage = false;
    }
  }
  return this.cachedStorage;
}

// Check to set if the error is us dealing with being out of space
function isOutOfSpace(e) {
  return e && (e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.name === 'QuotaExceededError');
}

// Determines if native JSON (de-)serialization is supported in the browser.
function supportsJSON() {
  /*jshint eqnull:true */
  if(this.cachedJSON === undefined) {
    this.cachedJSON = window.JSON != null;
  }
  return this.cachedJSON;
}

/**
 * Returns a string where all RegExp special characters are escaped with a \.
 * @param {String} text
 * @return {string}
 */
function escapeRegExpSpecialCharacters(text) {
  return text.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
}

/**
 * Returns the full string for the localStorage expiration item.
 * @param {String} key
 * @return {string}
 */
function expirationKey(key) {
  return key + CACHE_SUFFIX;
}

/**
 * Returns the number of minutes since the epoch.
 * @return {number}
 */
function currentTime() {
  return Math.floor(new Date().getTime() / this.expiryMilliseconds);
}

/**
 * Wrapper functions for localStorage methods
 */

const Implementations = {
  browserCache: {
    supported() {
      return /native/.test(window.caches.constructor + '');
    },

    async response(result, clone) {
      let tmp;

      if(clone && isObject(result) && typeof result.clone == 'function') {
        try {
          tmp = result.clone();
          if(!tmp) tmp = Object.create(Object.getPrototypeOf(result), Object.getOwnPropertyDescriptors());

          if(!tmp) throw new Error('clone failed');
          result = tmp;
        } catch(error) {}
      }

      return result;
    },

    request(obj) {
      if(obj instanceof Request || (isObject(obj) && typeof obj.url == 'string')) obj = obj.url;
      return obj;
    },

    /*    response(obj) {

    }
*/
    async getItem(request, opts = {}) {
      //console.info("getItem", {request,opts});

      if(request.url) request = request.url;
      let response = await this.cache.match(request, opts);
      //console.info("getItem", {request,response});
      //      if(response instanceof Response || (isObject(response) && typeof response.json == 'function')) response = await response.json();

      if(response) {
        let { status, type, ok, statusText, headers } = response;
        let text;

        response.cached = true;
      }
      return response;
    },

    async setItem(request, response) {
      const { cache } = this;

      //console.info('setItem:', { request, response }); // Fix for iPad issue - sometimes throws QUOTA_EXCEEDED_ERR on setItem.

      if(!cache) throw new Error(`Cache = ${cache}`);

      /*
      let type = 'text/html';
      if(typeof response != 'string' && !(response instanceof Response) && !(response instanceof Blob)) {
        response = JSON.stringify(response);
        type = 'application/json';
      }
      if(typeof response == 'string') response = new Blob([response], { type });*/
      //   console.log('setItem', { request, response });
      if(!(response instanceof Response))
        response = new Response(response, {
          url: request.url,
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': type }
        });
      if(typeof cache.put == 'function') return await cache.put(request, response);
    },

    async removeItem(request) {
      const { cache } = this;
      return await cache.delete(request, {});
    },

    async eachKey(fn) {
      const { cache } = this;
      //console.log('eachKey:', { cache }, this, fn + ''); // Fix for iPad issue - sometimes throws QUOTA_EXCEEDED_ERR on setItem.

      let keys = await cache.keys();
      for await(let request of keys) await fn(request);
    }
  },
  localStorage: {
    supported() {
      return /native/.test(localStorage.constructor + '');
    },

    response(r) {
      return r;
    },

    request(r) {
      return r;
    },

    getItem(key) {
      const { obj } = this;
      return localStorage.getItem(CACHE_PREFIX + obj.cacheBucket + key);
    },

    setItem(key, value) {
      const { obj } = this;
      // Fix for iPad issue - sometimes throws QUOTA_EXCEEDED_ERR on setItem.
      localStorage.removeItem(CACHE_PREFIX + obj.cacheBucket + key);
      localStorage.setItem(CACHE_PREFIX + obj.cacheBucket + key, value);
    },

    removeItem(key) {
      const { obj } = this;
      localStorage.removeItem(CACHE_PREFIX + obj.cacheBucket + key);
    },

    eachKey(fn) {
      const { obj } = this;
      let prefixRegExp = new RegExp('^' + CACHE_PREFIX + escapeRegExpSpecialCharacters(obj.cacheBucket) + '(.*)');
      // Loop in reverse as removing items will change indices of tail
      for(let i = localStorage.length - 1; i >= 0; --i) {
        let key = localStorage.key(i);
        key = key && key.match(prefixRegExp);
        key = key && key[1];
        if(key && key.indexOf(CACHE_SUFFIX) < 0) {
          fn.call(this, key, expirationKey.call(this, key));
        }
      }
    }
  }
};

function flushItem(key) {
  let exprKey = expirationKey.call(this, key);

  removeItem.call(this, key);
  removeItem.call(this, exprKey);
}

function flushExpiredItem(key) {
  //console.log('flushExpiredItem', 'key:', key, 'this:', this);
  let exprKey = expirationKey.call(this, key);
  let expr = this.getItem.call(this, exprKey);

  if(expr) {
    let expirationTime = parseInt(expr, EXPIRY_RADIX);

    // Check if we should actually kick item out of storage
    if(currentTime.call(this) >= expirationTime) {
      removeItem.call(this, key);
      removeItem.call(this, exprKey);
      return true;
    }
  }
}

function warn(message, err) {
  if(!this.warnings) return;
  if(!('console' in window) || typeof window.console.warn !== 'function') return;
  window.console.warn.call(this, 'lscache - ' + message);
  if(err) window.console.warn.call(this, 'lscache - The error was: ' + err.message);
}

function calculateMaxDate(expiryMilliseconds) {
  return Math.floor(8.64e15 / expiryMilliseconds);
}

export function lscache(cache) {
  const obj = new.target ? this : lscache;

  //  const cache = await window.caches.open(name);

  const impl = { ...Implementations.localStorage, cache };

  obj.impl = impl;
  return obj;
}

export function brcache(cache) {
  let cacheName, tmp;

  const obj = new.target ? this : brcache;

  //  const cache = await window.caches.open(name);

  let impl = {
    ...Implementations.browserCache /*, cache */ /*, get cacheBucket() { return obj.cacheBucket; } */
  };

  if(isObject(cache) && typeof cache.match == 'function') {
    impl.cache = cache;
  } else if(typeof cache == 'string') {
    cacheName = obj.cacheName = cache;
    tmp = tryCatch(() => window.caches);

    define(impl, {
      async getCache() {
        if(tmp && typeof tmp.open == 'function') return await tmp.open(cacheName);
      },
      get cache() {
        return this.getCache();
      }
    });
  }

  obj.impl = impl;
  obj.cache = cache;

  //  Object.assign(brcache, brcache.prototype);

  if(typeof obj.keys != 'function') Object.assign(obj, getMethods(BaseCache.prototype, 1, 0));

  Object.assign(obj, { cacheBucket: '', warnings: false, hits: {} });

  return obj;
}

//Object.assign(brcache.prototype, getMethods(BaseCache.prototype, 1, 0));

export class BaseCache {
  expiryMilliseconds = 60 * 1000;

  // ECMAScript max Date (epoch + 1e8 days)
  get maxDate() {
    return calculateMaxDate(this.expiryMilliseconds);
  }

  get supportsStorage() {
    return supportsStorage.call(this);
  }
  get supportsJSON() {
    return supportsJSON.call(this);
  }

  incrementHits(key) {
    let hits = mapFunction(this.hits);

    return hits.update(key, (v = 0) => v + 1);
  }

  /**
   * Stores the value in localStorage. Expires after specified number of minutes.
   * @param {string} key
   * @param {Object|string} value
   * @param {number} time
   * @return {boolean} whether the value was inserted successfully
   */
  set(key, value, time) {
    const { impl, cache, cacheBucket } = this;
    console.info('BaseCache.set', { key, value, time, impl, cache });

    // if(!this.supportsStorage) return false;

    // If we don't get a string value, try to stringify
    // In future, localStorage may properly support storing non-strings
    // and this can be removed.

    //if(!this.supportsJSON) return false;
    try {
      value = typeof value == 'string' ? value : value instanceof Response ? value : JSON.stringify(value);
    } catch(e) {
      // Sometimes we can't stringify due to circular refs
      // in complex objects, so we won't bother storing then.
      return false;
    }

    try {
      impl.setItem.call(this, key, value);
    } catch(e) {
      if(isOutOfSpace(e)) {
        // If we exceeded the quota, then we will sort
        // by the expire time, and then remove the N oldest
        let storedKeys = [];
        let storedKey;
        impl.eachKey.call(this, (key, exprKey) => {
          let expiration = impl.getItem.call(this, exprKey);
          if(expiration) {
            expiration = parseInt(expiration, EXPIRY_RADIX);
          } else {
            // TODO: Store date added for non-expiring items for smarter removal
            expiration = this.maxDate;
          }
          storedKeys.push({
            key,
            size: (impl.getItem.call(this, key) || '').length,
            expiration
          });
        });
        // Sorts the keys with oldest expiration time last
        storedKeys.sort((a, b) => b.expiration - a.expiration);

        let targetSize = (value || '').length;
        while(storedKeys.length && targetSize > 0) {
          storedKey = storedKeys.pop();
          impl.warn.call(this, "Cache is full, removing item with key '" + key + "'");
          impl.flushItem.call(this, storedKey.key);
          targetSize -= storedKey.size;
        }
        try {
          impl.setItem.call(this, key, value);
        } catch(e) {
          // value may be larger than total quota
          impl.warn.call(this, "Could not add item with key '" + key + "', perhaps it's too big?", e);
          return false;
        }
      } else {
        // If it was some other error, just give up.
        impl.warn.call(this, "Could not add item with key '" + key + "'", e);
        return false;
      }
    }

    // If a time is specified, store expiration info in localStorage
    if(time) {
      impl.setItem.call(this, expirationKey(key), (currentTime.call(this) + time).toString(EXPIRY_RADIX));
    } else {
      //console.log('impl.removeItem', impl.removeItem);
      // In case they previously set a time, remove that info from localStorage.
      impl.removeItem.call(this, expirationKey(key));
    }
    return true;
  }

  /**
   * Retrieves specified value from localStorage, if not expired.
   * @param {string} key
   * @return {string|Object}
   */
  get(key) {
    const { impl, cache } = this;

    console.info('BaseCache.get', { key, impl, cache });

    //    if(!this.supportsStorage) return null;
    // Return the de-serialized item if not expired
    if(flushExpiredItem.call(impl, key)) {
      return null;
    }
    // Tries to de-serialize stored value if its an object, and returns the normal value otherwise.
    return impl.getItem.call(this, key).then(response => {
      let time = Date.now();
      //if(!response || !this.supportsJSON) return response;
      this.incrementHits(response.url);

      // console.log('response:', response);

      // if(isObject(impl) && typeof impl.response == 'function') response = impl.response.call(this, response);

      //console.log('response:', response);
      /*
      try {
        // We can't tell if its JSON or a string, so we try to parse
        let obj = JSON.parse(response);
        response = obj;
      } catch(e) {
        // If we can't parse, it's probably because it isn't an object
      }*/

      response = response.clone();
      response.cached = true;
      response.time = time;
      return response;
    });
  }

  /*getOrCreate(createfn) {
    const { impl, cache } = this;
    const that = this;
    return (key, ...args) => {
      let value = that.get.call(that, key);
      if(!value) {
        value = createfn(key, ...args);
        that.set.call(that, key, value);
      }
      return value;
    };
  }*/

  /**
   * Removes a value from localStorage.
   * Equivalent to 'delete' in memcache, but that's a keyword in JS.
   * @param {string} key
   */
  remove(key) {
    const { impl, cache } = this;
    if(!this.supportsStorage) return;

    impl.removeItem.call(this, key);
  }
  async clear() {
    const { impl } = this;
    for(let key of await this.keys()) impl.removeItem.call(this, key);
  }

  /**
   * Returns whether local storage is supported.
   * Currently exposed for testing purposes.
   * @return {boolean}
   */
  supported() {
    return this.supportsStorage;
  }

  /**
   * Flushes all lscache items and expiry markers without affecting rest of localStorage
   */
  flush() {
    const { impl, cache } = this;
    if(!this.supportsStorage) return;

    impl.eachKey.call(this, key => impl.flushItem.call(this, key));
  }

  /**
   * Flushes expired lscache items and expiry markers without affecting rest of localStorage
   */
  flushExpired() {
    const { impl, cache } = this;
    if(!this.supportsStorage) return;

    impl.eachKey.call(this, key => flushExpiredItem.call(impl, key));
  }

  /**
   * Appends CACHE_PREFIX so lscache will partition data in to different buckets.
   * @param {string} bucket
   */
  setBucket(bucket) {
    this.cacheBucket = bucket;
  }

  /**
   * Resets the string being appended to CACHE_PREFIX so lscache will use the default storage behavior.
   */
  resetBucket() {
    this.cacheBucket = '';
  }

  /**
   * @returns {number} The currently set number of milliseconds each time unit represents in
   *   the set() function's "time" argument.
   */
  getExpiryMilliseconds() {
    return this.expiryMilliseconds;
  }

  /**
   * Sets the number of milliseconds each time unit represents in the set() function's
   *   "time" argument.
   * Sample values:
   *  1: each time unit = 1 millisecond
   *  1000: each time unit = 1 second
   *  60000: each time unit = 1 minute (Default value)
   *  360000: each time unit = 1 hour
   * @param {number} milliseconds
   */
  setExpiryMilliseconds(milliseconds) {
    this.expiryMilliseconds = milliseconds;
    this.maxDate = impl.calculateMaxDate.call(this, this.expiryMilliseconds);
  }

  /**
   * Sets whether to display this.warnings when an item is removed from the cache or not.
   */
  enableWarnings(enabled) {
    this.warnings = enabled;
  }
  async keys() {
    const { impl, cache } = this;
    let keys = [];
    let lscache = this;
    // console.log('keys()', { lscache });

    await impl.eachKey.call(this, key => keys.push(impl.request.call(this, key)));
    return keys;
  }
}

Object.setPrototypeOf(lscache.prototype, new (class LocalStorageCache extends BaseCache {})());

brcache.prototype = new (class BrowserCache extends BaseCache {})();

brcache.impl = Implementations.browserCache;

// https://api.github.com/repos/rsenn/an-tronics/contents/eagle

export async function CachedFetch(fn, cacheObj) {
  let request, response;
  let url, cacheName, tmp;

  if(typeof cacheObj == 'string') {
    cacheName = cacheObj;
    tmp = await tryCatch(() => window.caches.open(cacheName));
    if(isObject(tmp) && typeof tmp.match == 'function') cacheObj = tmp;

    //console.log('CachedFetch', fn + '', { cacheName, cacheObj, tmp });
  }

  let browserCache = new brcache(cacheObj);
  let { impl } = cacheObj;
  if(impl) {
    impl.obj = cacheObj;
    impl.cache = null;
  }

  //console.info('cache instance:', cacheObj);
  //console.info('cache impl:', impl);
  async function self(...args) {
    console.info('FetchCached', ...args);

    let cached = false;
    request = args[0] instanceof Request ? args.shift() : new Request(...args);
    request.time = Date.now();
    console.info('FetchCached', { request });
    response = null;
    try {
      response = await browserCache.get(request);
      url = impl.request.call(this, request);

      cacheObj.hits[url] = (cacheObj.hits[url] || 0) + 1;
    } catch(error) {}
    if(response) {
      cached = true;
    } else {
      try {
        response = await fetch(request);
        response.time = Date.now();
      } catch(error) {}
      if(response) {
        let r = await browserCache.set(request, response.clone());
        console.info('CachedFetch set', { request, response, r });
      }
    }

    console.info('cache ', cached ? 'hit' : 'miss', { request, response });
    if(cached) response.cached = true;
    response.request = request;

    return response;
  }
  self.cache = browserCache;
  self.impl = impl;

  return self;
}

export default lscache;
