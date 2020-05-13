"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.httpClient = exports.axios = exports.default = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

var _util = _interopRequireDefault(require("./util.cjs"));

const axios = require("axios").default;

const httpClient = (() => {
  const client = axios.create({
    withCredentials: true
  });
  client.interceptors.response.use(res => {
    const data = res.data,
          status = res.status,
          statusText = res.statusText,
          headers = res.headers,
          config = res.config,
          request = res.request;
    return res;
  }, err => {
    var _await$err, code, config, request, _ref, url, method, data;

    return _regenerator.default.async(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return _regenerator.default.awrap(err);

        case 2:
          _await$err = _context.sent;
          code = _await$err.code;
          config = _await$err.config;
          request = _await$err.request;
          _context.next = 8;
          return _regenerator.default.awrap(config);

        case 8:
          _context.t0 = _context.sent;

          if (_context.t0) {
            _context.next = 11;
            break;
          }

          _context.t0 = {};

        case 11:
          _ref = _context.t0;
          url = _ref.url;
          method = _ref.method;
          data = _ref.data;
          console.error("axios ERROR:", {
            code,
            url,
            method,
            data
          });

        case 16:
        case "end":
          return _context.stop();
      }
    }, null, null, null, Promise);
  });

  let request = (fn, name = "call") => function _callee2() {
    var args,
        _args2 = arguments;
    return _regenerator.default.async(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          args = [..._args2];

          if (typeof args[0] == "string" && args[0].startsWith("/")) {
            args[0] = _util.default.makeURL({
              location: args[0]
            });
          }

          _context2.next = 4;
          return _regenerator.default.awrap(fn.apply(client, args));

        case 4:
          return _context2.abrupt("return", _context2.sent);

        case 5:
        case "end":
          return _context2.stop();
      }
    }, null, null, null, Promise);
  };

  let ret = request(client);
  ret.post = request(client.post, "post");
  ret.get = request(client.get, "get");
  ret.head = request(client.head, "head");
  return ret;
})();

exports.httpClient = exports.axios = httpClient;
if (global.window) window.axios = httpClient;
var _default = httpClient;
exports.default = _default;
