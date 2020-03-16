var _regeneratorRuntime = require("@babel/runtime/regenerator");

var axios = require("axios");

var Util = require("./util.es5.js");

var httpClient = (function() {
  var client = axios.create({
    withCredentials: true
  });
  client.interceptors.response.use(
    function(res) {
      var data = res.data,
        status = res.status,
        statusText = res.statusText,
        headers = res.headers,
        config = res.config,
        request = res.request; // console.error("axios SUCCESS:", { status, statusText, data });

      return res;
    },
    function _callee(err) {
      var _ref, code, config, request, _ref2, url, method, data;

      return _regeneratorRuntime.async(
        function _callee$(_context) {
          while(1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                _context.next = 2;
                return _regeneratorRuntime.awrap(err);

              case 2:
                _ref = _context.sent;
                code = _ref.code;
                config = _ref.config;
                request = _ref.request;
                _context.next = 8;
                return _regeneratorRuntime.awrap(config);

              case 8:
                _context.t0 = _context.sent;

                if(_context.t0) {
                  _context.next = 11;
                  break;
                }

                _context.t0 = {};

              case 11:
                _ref2 = _context.t0;
                url = _ref2.url;
                method = _ref2.method;
                data = _ref2.data;
                console.error("axios ERROR:", {
                  code: code,
                  url: url,
                  method: method,
                  data: data
                }); // throw new Error(err.response.data.message);

              case 16:
              case "end":
                return _context.stop();
            }
          }
        },
        null,
        null,
        null,
        Promise
      );
    }
  );

  var request = function request(fn) {
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "call";
    return function _callee2() {
      var args,
        _args2 = arguments;
      return _regeneratorRuntime.async(
        function _callee2$(_context2) {
          while(1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                args = Array.prototype.slice.call(_args2);

                if(typeof args[0] == "string" && args[0].startsWith("/")) {
                  args[0] = Util.makeURL({
                    location: args[0]
                  });
                } //  console.error(`axios ${name}:`, args);

                _context2.next = 4;
                return _regeneratorRuntime.awrap(fn.apply(client, args));

              case 4:
                return _context2.abrupt("return", _context2.sent);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        },
        null,
        null,
        null,
        Promise
      );
    };
  };

  var ret = request(client);
  ret.post = request(client.post, "post");
  ret.get = request(client.get, "get");
  ret.head = request(client.head, "head");
  return ret;
})();

if(global.window) window.axios = httpClient;
module.exports = httpClient;
module.exports["default"] = httpClient;
module.exports.axios = httpClient;
module.exports.httpClient = httpClient;
