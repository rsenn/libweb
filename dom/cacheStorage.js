const sep = '/';
//const fs = require('fs-extra')
import { Cache } from './cache.js';
//const tmpDir = require('os').tmpdir() + sep + 'fetch-cache' + sep
const strToBase64 = (str) => new Buffer(str).toString('base64');
const base64ToStr = (hex) => new Buffer(hex, 'base64').toString();
const requires = (i, args) => {
  if(args.length < i) throw new TypeError(`${i} argument required, but only ${args.length} present.`);
};

export class CacheStorage {
  /**
   * [delete description]
   * @return {[type]} [description]
   */
  delete(cacheName) {
    cacheName = strToBase64(cacheName);

    // Query the entry
    return new Promise((resolve, reject) => {
      fs.stat(tmpDir + cacheName, (err, stats) => {
        if(err) return resolve(false);

        if(stats.isDirectory()) {
          fs.remove(tmpDir + cacheName, (err) => (err ? reject(err) : resolve(true)));
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * [has description]
   * @return {Boolean} [description]
   */
  has(cacheName) {
    return this.keys().then((keys) => keys.includes(cacheName));
  }

  /**
   * resolves with an array containing strings corresponding to all of the named
   * Cache objects tracked by the CacheStorage.
   * Use this method to iterate over a list of all the Cache objects.
   *
   * @return <Promise>Array keyList
   */
  keys() {
    return new Promise((resolve, reject) =>
      fs.readdir(tmpDir, (err, files) =>
        err
          ? reject(err)
          : Promise.all(files.map(
                (file) =>
                  new Promise((resolve) =>
                    fs.stat(tmpDir + file, (_, stats) => {
                      resolve(stats.isDirectory() && file);
                    })
                  )
              )
            ).then((keys) => resolve(keys.filter((a) => a)))
      )
    ).then((keys) => keys.map(base64ToStr));
  }

  /**
   * Checks if a given Request is a key in any of the Cache objects
   * that the CacheStorage object tracks and returns a Promise that
   * resolves to that match.
   *
   * @return Promise
   */
  async match(...args) {
    let keys = await this.keys();

    for(let key of keys) {
      let cache = await this.open(key);
      let result = await cache.match(...args);
      if(result) return result;
    }
  }

  /**
   * Resolves to the Cache object matching the cacheName
   * (a new cache is created if it doesn't exist.)
   *
   * @return {[type]} [description]
   */
  async open(cacheName) {
    requires(1, arguments);

    let b64 = strToBase64(cacheName);
    let folder = tmpDir + b64;

    return new Promise((resolve, reject) => fs.mkdirs(folder, (err) => (err ? reject(err) : resolve(new Cache(cacheName, folder + '/')))));
  }

  /**
   * [description]
   * @return {[type]} [description]
   */
  [Symbol.toStringTag]() {
    return 'CacheStorage';
  }
}

export default new CacheStorage(); // eslint-disable-line
