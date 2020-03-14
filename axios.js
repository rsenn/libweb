const axios = require("axios");
const Util = require("./util.js");

const httpClient = (() => {
  var client = axios.create({ withCredentials: true });

  client.interceptors.response.use(
    res => {
      const { data, status, statusText, headers, config, request } = res;
      // console.error("axios SUCCESS:", { status, statusText, data });

      return res;
    },
    async err => {
      const { code, config, request } = await err;
      const { url, method, data } = (await config) || {};
      console.error("axios ERROR:", { code, url, method, data });
      // throw new Error(err.response.data.message);
    }
  );

  let request = (fn, name = "call") =>
    async function() {
      let args = [...arguments];

      if(typeof args[0] == "string" && args[0].startsWith("/")) {
        args[0] = Util.makeURL({ location: args[0] });
      }
      console.error(`axios ${name}:`, args);

      return await fn.apply(client, args);
    };

  let ret = request(client);

  ret.post = request(client.post, "post");
  ret.get = request(client.get, "get");

  return ret;
})();

if(global.window) window.axios = httpClient;

module.exports = httpClient;

module.exports.default = httpClient;
module.exports.axios = httpClient;
module.exports.httpClient = httpClient;
