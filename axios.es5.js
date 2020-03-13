var axios = require("axios");

var httpClient = axios.create({
  withCredentials: true
});
httpClient.interceptors.response.use(
  function(res) {
    var data = res.data,
      status = res.status,
      statusText = res.statusText,
      headers = res.headers,
      config = res.config,
      request = res.request; // console.error("axios SUCCESS:", { status, statusText, data });

    return res;
  },
  function(err) {
    console.error("axios ERROR:", err.request.path); // throw new Error(err.response.data.message);
  }
);
if(global.window) window.axios = httpClient;
module.exports = httpClient;
module.exports["default"] = httpClient;
module.exports.axios = httpClient;
module.exports.httpClient = httpClient;
