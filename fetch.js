import { define, isObject, mapFunction } from './misc.js';
//import Util from './util.js';

export async function NormalizeResponse(resp) {
  resp = await resp;

  if(Util.isObject(resp)) {
    let { cached, status, ok, redirected, url, headers } = resp;
    let disp = headers.get('Content-Disposition');
    let type = headers.get('Content-Type');
    if(ok) {
      if(!disp && /json/.test(type) && typeof resp.json == 'function') resp = { data: await resp.json() };
      else if(typeof resp.text == 'function') resp = { data: await resp.text() };
      if(disp && !resp.file) resp.file = disp.replace(/.*['"]([^"]+)['"].*/, '$1');
      if(disp && type) resp.type = type;
      if(resp.file) if (!/tmp\//.test(resp.file)) resp.file = 'tmp/' + resp.file;
    } else {
      resp = { ...resp, error: resp.statusText };
    }
    if(cached) resp.cached = true;
    if(redirected) resp.redirected = true;

    let fn = mapFunction(headers);
    //let { keys, get } = fn;
    resp.headers = define(Object.fromEntries(fn.entries()), {
      keys: fn,
      get: fn
    });
  }
  return resp;
}

export async function ResponseData(resp) {
  resp = await NormalizeResponse(resp);
  if(resp.data) return resp.data;
}

export const FetchCached = (url, options) => {
  return fetch(url, options);
};

export async function FetchURL(url, allOpts = {}) {
  let { nocache = false, ...opts } = allOpts;
  let result;
  let ret;
  if(opts.method && opts.method.toUpperCase() == 'POST') nocache = true;
  //let fetch = nocache ? window.fetch : FetchCached;
  if(/tmp\//.test(url)) {
    url = url.replace(/.*tmp\//g, 'tmp/');
  } else if(/^\//.test(url)) {
    url = url.slice(1);
  } else if(/:\/\//.test(url)) {
  } else {
    url = 'static/' + url;
  }
  try {
    if(!ret) ret = result = await fetch(url, opts);
  } catch(error) {
    console.log('FetchURL ERROR:', error.message + '\n' + error.stack);
    throw error;
  }
  return ret;
}
