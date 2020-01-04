const axios = require("axios");

const httpClient = axios.create({
  withCredentials: true
});

httpClient.interceptors.response.use(
  res => {
    const { data, status, statusText, headers, config, request } = res;
    // console.error("axios SUCCESS:", { status, statusText, data });

    return res;
  },
  err => {
    console.error("axios ERROR:", err.request.path);
    throw new Error(err.response.data.message);
  }
);

if (global.window) window.axios = httpClient;

module.exports = httpClient;

module.exports.default = httpClient;
module.exports.axios = httpClient;
module.exports.httpClient = httpClient;
