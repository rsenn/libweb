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
var CACHE_PREFIX = 'lscache-';

// Suffix for the key name on the expiration items in localStorage
var CACHE_SUFFIX = '-cacheexpiration';

// expiration date radix (set to Base-36 for most space savings)
var EXPIRY_RADIX = 10;

// Determines if localStorage is supported in the browser;
// result is cached for better performance instead of being run each time.
// Feature detection is based on how Modernizr does it;
// it's not straightforward due to FF4 issues.
// It's not run at parse-time as it takes 200ms in Android.
function supportsStorage() {
  var key = '__lscachetest__';
  var value = key;

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
    setItem.call(this, key, value);
    removeItem.call(this, key);
    this.cachedStorage = true;
  } catch(e) {
    // If we hit the limit, and we don't have an empty localStorage then it means we have support
    if(isOutOfSpace.call(this, e) && localStorage.length) {
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

function getItem(key) {
  return localStorage.getItem(CACHE_PREFIX + this.cacheBucket + key);
}

function setItem(key, value) {
  // Fix for iPad issue - sometimes throws QUOTA_EXCEEDED_ERR on setItem.
  localStorage.removeItem(CACHE_PREFIX + this.cacheBucket + key);
  localStorage.setItem(CACHE_PREFIX + this.cacheBucket + key, value);
}

function removeItem(key) {
  localStorage.removeItem(CACHE_PREFIX + this.cacheBucket + key);
}

function eachKey(fn) {
  var prefixRegExp = new RegExp('^' + CACHE_PREFIX + escapeRegExpSpecialCharacters.call(this, this.cacheBucket) + '(.*)');
  // Loop in reverse as removing items will change indices of tail
  for(var i = localStorage.length - 1; i >= 0; --i) {
    var key = localStorage.key(i);
    key = key && key.match(prefixRegExp);
    key = key && key[1];
    if(key && key.indexOf(CACHE_SUFFIX) < 0) {
      fn(key, expirationKey.call(this, key));
    }
  }
}

function flushItem(key) {
  var exprKey = expirationKey.call(this, key);

  removeItem.call(this, key);
  removeItem.call(this, exprKey);
}

function flushExpiredItem(key) {
  var exprKey = expirationKey.call(this, key);
  var expr = getItem.call(this, exprKey);

  if(expr) {
    var expirationTime = parseInt(expr, EXPIRY_RADIX);

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

export function lscache(key, value) {
  if(!new.target && key !== undefined) {
    if(value === undefined) return lscache.get(key);
    else return lscache.set(key, value);
  }

  if(new.target) return this;
}

const proto = {
  expiryMilliseconds: 60 * 1000,
  // ECMAScript max Date (epoch + 1e8 days)
  get maxDate() {
    return calculateMaxDate(this.expiryMilliseconds);
  },
  cacheBucket: '',
  warnings: false,

  get supportsStorage() {
    return supportsStorage.call(this);
  },
  get supportsJSON() {
    return supportsJSON.call(this);
  },

  /**
   * Stores the value in localStorage. Expires after specified number of minutes.
   * @param {string} key
   * @param {Object|string} value
   * @param {number} time
   * @return {boolean} whether the value was inserted successfully
   */
  set(key, value, time) {
    if(!this.supportsStorage) return false;

    // If we don't get a string value, try to stringify
    // In future, localStorage may properly support storing non-strings
    // and this can be removed.

    if(!this.supportsJSON) return false;
    try {
      value = JSON.stringify(value);
    } catch(e) {
      // Sometimes we can't stringify due to circular refs
      // in complex objects, so we won't bother storing then.
      return false;
    }

    try {
      setItem.call(this, key, value);
    } catch(e) {
      if(isOutOfSpace.call(this, e)) {
        // If we exceeded the quota, then we will sort
        // by the expire time, and then remove the N oldest
        var storedKeys = [];
        var storedKey;
        eachKey.call(this, function(key, exprKey) {
          var expiration = getItem.call(this, exprKey);
          if(expiration) {
            expiration = parseInt(expiration, EXPIRY_RADIX);
          } else {
            // TODO: Store date added for non-expiring items for smarter removal
            expiration = this.maxDate;
          }
          storedKeys.push({
            key: key,
            size: (getItem.call(this, key) || '').length,
            expiration: expiration
          });
        });
        // Sorts the keys with oldest expiration time last
        storedKeys.sort(function(a, b) {
          return b.expiration - a.expiration;
        });

        var targetSize = (value || '').length;
        while(storedKeys.length && targetSize > 0) {
          storedKey = storedKeys.pop();
          warn.call(this, "Cache is full, removing item with key '" + key + "'");
          flushItem.call(this, storedKey.key);
          targetSize -= storedKey.size;
        }
        try {
          setItem.call(this, key, value);
        } catch(e) {
          // value may be larger than total quota
          warn.call(this, "Could not add item with key '" + key + "', perhaps it's too big?", e);
          return false;
        }
      } else {
        // If it was some other error, just give up.
        warn.call(this, "Could not add item with key '" + key + "'", e);
        return false;
      }
    }

    // If a time is specified, store expiration info in localStorage
    if(time) {
      setItem.call(this, expirationKey.call(this, key), (currentTime.call(this) + time).toString(EXPIRY_RADIX));
    } else {
      // In case they previously set a time, remove that info from localStorage.
      removeItem.call(this, expirationKey.call(this, key));
    }
    return true;
  },

  /**
   * Retrieves specified value from localStorage, if not expired.
   * @param {string} key
   * @return {string|Object}
   */
  get(key) {
    if(!this.supportsStorage) return null;

    // Return the de-serialized item if not expired
    if(flushExpiredItem.call(this, key)) {
      return null;
    }

    // Tries to de-serialize stored value if its an object, and returns the normal value otherwise.
    var value = getItem.call(this, key);
    if(!value || !this.supportsJSON) {
      return value;
    }

    try {
      // We can't tell if its JSON or a string, so we try to parse
      return JSON.parse(value);
    } catch(e) {
      // If we can't parse, it's probably because it isn't an object
      return value;
    }
  },

  /**
   * Removes a value from localStorage.
   * Equivalent to 'delete' in memcache, but that's a keyword in JS.
   * @param {string} key
   */
  remove(key) {
    if(!this.supportsStorage) return;

    flushItem.call(this, key);
  },

  /**
   * Returns whether local storage is supported.
   * Currently exposed for testing purposes.
   * @return {boolean}
   */
  supported() {
    return this.supportsStorage;
  },

  /**
   * Flushes all lscache items and expiry markers without affecting rest of localStorage
   */
  flush() {
    if(!this.supportsStorage) return;

    eachKey.call(this, function(key) {
      flushItem.call(this, key);
    });
  },

  /**
   * Flushes expired lscache items and expiry markers without affecting rest of localStorage
   */
  flushExpired() {
    if(!this.supportsStorage) return;

    eachKey.call(this, function(key) {
      flushExpiredItem.call(this, key);
    });
  },

  /**
   * Appends CACHE_PREFIX so lscache will partition data in to different buckets.
   * @param {string} bucket
   */
  setBucket(bucket) {
    this.cacheBucket = bucket;
  },

  /**
   * Resets the string being appended to CACHE_PREFIX so lscache will use the default storage behavior.
   */
  resetBucket() {
    this.cacheBucket = '';
  },

  /**
   * @returns {number} The currently set number of milliseconds each time unit represents in
   *   the set() function's "time" argument.
   */
  getExpiryMilliseconds() {
    return this.expiryMilliseconds;
  },

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
    this.maxDate = calculateMaxDate.call(this, this.expiryMilliseconds);
  },

  /**
   * Sets whether to display this.warnings when an item is removed from the cache or not.
   */
  enableWarnings(enabled) {
    this.warnings = enabled;
  },

  keys() {
    let keys = [];
    let lscache = this;
    console.log('keys()', { lscache });

    eachKey.call(this, key => keys.push(key));
    return keys;
  }
};

Object.assign(lscache.prototype, proto);
Object.assign(lscache, proto);

export default lscache;
