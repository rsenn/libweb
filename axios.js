//import axios from "axios";
const axios = require('axios').default;

import Util from './util.js';

const httpClient = (() => {
  const client = axios.create({ withCredentials: true });

  client.interceptors.response.use(
    (res) => {
      const { data, status, statusText, headers, config, request } = res;
      //console.error("axios SUCCESS:", { status, statusText, data });

      return res;
    },
    async (err) => {
      const { code, config, request } = await err;
      const { url, method, data } = (await config) || {};
      console.error('axios ERROR:', { code, url, method, data });
      //throw new Error(err.response.data.message);
    }
  );

  let request = (fn, name = 'call') =>
    async function () {
      let args = [...arguments];

      if(typeof args[0] == 'string' && args[0].startsWith('/')) {
        args[0] = Util.makeURL({ location: args[0] });
      }
      //console.error(`axios ${name}:`, args);

      return await fn.apply(client, args);
    };

  let ret = request(client);

  ret.post = request(client.post, 'post');
  ret.get = request(client.get, 'get');
  ret.head = request(client.head, 'head');

  return ret;
})();

if(global.window) window.axios = httpClient;

export default httpClient;
export { httpClient as axios };
export { httpClient };
