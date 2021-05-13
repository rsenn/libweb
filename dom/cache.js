import Util from '../util.js';

const map = new WeakMap();
const wm = o => map.get(o);

let globalThis = Util.getGlobalObject();

//console.log('globalThis:', globalThis);

let { Request, Response, Headers } = globalThis;

//console.log('globalThis.fetch:', { Request, Response, Headers });
// Remove in fetch v2

const requires = (i, args) => {
  if(args.length < i)
    throw new TypeError(`${i} argument required, but only ${args.length} present.`
    );
};

const isReq = req => req && req[Symbol.toStringTag] === 'Request';
const isRes = res => res && res[Symbol.toStringTag] === 'Response';
const strToBase64 = str => new Buffer(str).toString('hex');
const base64ToStr = hex => new Buffer(hex, 'hex').toString();

export class Cache {
  constructor(cacheName, folder) {
    map.set(this, folder);
  }

  // Returns a Promise that resolves to the response associated
  // with the first matching request in the Cache object.
  async match(...args) {
    return (await this.matchAll(...args))[0];
  }

  // Returns a Promise that resolves to an array
  // of all matching requests in the Cache object.
  matchAll(req, options = {}) {
    let folder = wm(this);
    let buf = Buffer.alloc(1024 * 20);

    return new Promise((resolve, reject) => {
      fs.readdir(folder, (err, files) => {
        if(err) return reject(err);
        let result = [];

        for(let file of files) {
          if(req !== base64ToStr(file)) continue;

          let url = base64ToStr(file);
          let fullPath = folder + file;
          let fd = fs.openSync(fullPath, 'r');
          fs.readSync(fd, buf, 0, 4);
          let L = buf.readUInt32LE(0);
          fs.readSync(fd, buf, 0, L);
          let json = JSON.parse(buf.slice(0, L));
          let header = new Headers();
          for(let [key, val] of json.headers) {
            header.append(key, val);
          }
          json.headers = header;
          let res = new Response(fs.createReadStream(fullPath, { start: 4 + L }),
            json
          );
          result.push(res);
        }

        resolve(result);
      });
    });
  }

  // Takes a URL, retrieves it and adds the resulting response
  // object to the given cache. This is fuctionally equivalent
  // to calling fetch(), then using put() to add the results to the cache
  async add(request) {
    requires(1, arguments);
    return this.addAll([request]);
  }

  // Takes an array of URLs, retrieves them, and adds the
  // resulting response objects to the given cache.
  async addAll(requests) {
    requires(1, arguments);

    let results = [];

    for(let req of requests) {
      req = new Request(req);

      if(!/^((http|https):\/\/)/.test(req.url))
        throw new TypeError(`Add/AddAll does not support schemes other than "http" or "https"`
        );

      if(req.method !== 'GET')
        throw new TypeError(`Add/AddAll only supports the GET request method`);

      let clone = req.clone();

      await fetch(req).then(res => {
        if(res.status === 206)
          throw new TypeError('Partial response (status code 206) is unsupported'
          );

        if(!res.ok) throw new TypeError('Request failed');

        results.push([req, res]);
      });
    }

    await Promise.all(results.map(a => this.put(...a)));
  }

  /**
   * Takes both a request and its response and adds it to the given cache.
   *
   * @param  {Request|String}  req  [description]
   * @param  {Response}        res  [description]
   * @return {Promise}              [description]
   */
  async put(req, res) {
    requires(2, arguments);

    req = isReq(req) ? req : new Request(req);

    if(!/^((http|https):\/\/)/.test(req.url))
      throw new TypeError(`Request scheme '${req.url.split(':')[0]}' is unsupported`
      );

    if(req.method !== 'GET')
      throw new TypeError(`Request method '${req.method}' is unsupported`);

    if(res.status === 206)
      throw new TypeError('Partial response (status code 206) is unsupported');

    const varyHeaders = res.headers.get('Vary');

    if(varyHeaders && varyHeaders.indexOf('*') > -1) {
      throw new TypeError('Vary header contains *');
    }

    if(res.body != null)
      if(res.bodyUsed) throw new TypeError('Response body is already used');

    let folder = wm(this);
    let fileStream = fs.createWriteStream(folder + strToBase64(req.url.split('#')[0])
    );

    let map = []; // [...res.headers] < requires node-fetch v2
    res.headers.forEach((key, value) => map.push([key, value]));

    let head = JSON.stringify({
      headers: map,
      status: res.status,
      statusText: res.statusText
    });

    let buf = Buffer.alloc(4);
    buf.writeUInt32LE(head.length);
    fileStream.write(buf);
    fileStream.write(head);

    if(!res.body) {
      fileStream.end();
      return Promise.resolve();
    }

    res.body.pipe(fileStream);

    return new Promise(rs => fileStream.on('close', rs));
  }

  // Finds the Cache entry whose key is the request, and if found,
  // deletes the Cache entry and returns a Promise that resolves to true.
  // If no Cache entry is found, it returns false.
  async delete(request, options = {}) {
    requires(1, arguments);

    let { ignoreMethod } = options;
    let r = isReq(request) ? request : new Request(request);

    if(!['GET', 'HEAD'].includes(r.method) && ignoreMethod) return false;
  }

  // Returns a Promise that resolves to an array of Cache keys.
  keys(request, options = {}) {
    let folder = wm(this);
    let { ignoreMethod = false, ignoreSearch = false } = options;

    // using new Request to normalize fragment and trailing slash
    if(request !== undefined) {
      request = new Request(request);

      var url = request.url.split('#')[0];

      if(request.method !== 'GET' && !ignoreMethod) return [];
    }

    let search =
      request === undefined
        ? a => a
        : a =>
            a.filter(a => {
              a = base64ToStr(a);
              if(ignoreSearch) {
                a = a.split('?')[0];
                url = url.split('?')[0];
              }
              return a == url;
            });

    return new Promise((resolve, reject) => {
      fs.readdir(folder, (err, files) =>
        err
          ? reject(err)
          : resolve(search(files).map(file => new Request(base64ToStr(file))))
      );
    });
  }
}
