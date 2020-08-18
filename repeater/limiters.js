import { Repeater, FixedBuffer } from './repeater.js';
import { delay } from './timers.js';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function () {
  __assign =
    Object.assign ||
    function __assign(t) {
      for(var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for(var p in s) if(Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
  return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch(e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator['throw'](value));
      } catch(e) {
        reject(e);
      }
    }
    function step(result) {
      result.done
        ? resolve(result.value)
        : new P(function (resolve) {
            resolve(result.value);
          }).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if(t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
    f,
    y,
    t,
    g;
  return (
    (g = { next: verb(0), throw: verb(1), return: verb(2) }),
    typeof Symbol === 'function' &&
      (g[Symbol.iterator] = function () {
        return this;
      }),
    g
  );
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if(f) throw new TypeError('Generator is already executing.');
    while(_)
      try {
        if(((f = 1), y && (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)) return t;
        if(((y = 0), t)) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if(!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if(op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
              _.label = op[1];
              break;
            }
            if(op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if(t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if(t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch(e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if(op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}

function __values(o) {
  var m = typeof Symbol === 'function' && o[Symbol.iterator],
    i = 0;
  if(m) return m.call(o);
  return {
    next: function () {
      if(o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
}

function __asyncValues(o) {
  if(!Symbol.asyncIterator) throw new TypeError('Symbol.asyncIterator is not defined.');
  var m = o[Symbol.asyncIterator],
    i;
  return m
    ? m.call(o)
    : ((o = typeof __values === 'function' ? __values(o) : o[Symbol.iterator]()),
      (i = {}),
      verb('next'),
      verb('throw'),
      verb('return'),
      (i[Symbol.asyncIterator] = function () {
        return this;
      }),
      i);
  function verb(n) {
    i[n] =
      o[n] &&
      function (v) {
        return new Promise(function (resolve, reject) {
          (v = o[n](v)), settle(resolve, reject, v.done, v.value);
        });
      };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function (v) {
      resolve({ value: v, done: d });
    }, reject);
  }
}

function semaphore(limit) {
  var _this = this;
  if(limit < 1) {
    throw new RangeError('limit cannot be less than 1');
  }
  var remaining = limit;
  var tokens = {};
  var bucket = new Repeater(function (push) {
    var nextId = 0;
    function release(id) {
      if(tokens[id] != null) {
        var id1 = nextId++;
        var token = __assign(__assign({}, tokens[id]), { id: id1, release: release.bind(null, id1) });
        push(token);
        delete tokens[id];
        remaining++;
      }
    }
    for(var i = 0; i < limit; i++) {
      var id = nextId++;
      var token = {
        id: id,
        limit: limit,
        remaining: remaining,
        release: release.bind(null, id)
      };
      push(token);
    }
  }, new FixedBuffer(limit));
  return new Repeater(function (push, stop) {
    return __awaiter(_this, void 0, void 0, function () {
      var stopped, _a, _b, token, e_1_1;
      var e_1, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            stopped = false;
            stop.then(function () {
              return (stopped = true);
            });
            _d.label = 1;
          case 1:
            _d.trys.push([1, 7, 8, 13]);
            _a = __asyncValues(Repeater.race([bucket, stop]));
            _d.label = 2;
          case 2:
            return [4 /*yield*/, _a.next()];
          case 3:
            if(!((_b = _d.sent()), !_b.done)) return [3 /*break*/, 6];
            token = _b.value;
            if(stopped) {
              return [3 /*break*/, 6];
            }
            remaining--;
            token = __assign(__assign({}, token), { remaining: remaining });
            tokens[token.id] = token;
            return [4 /*yield*/, push(token)];
          case 4:
            _d.sent();
            _d.label = 5;
          case 5:
            return [3 /*break*/, 2];
          case 6:
            return [3 /*break*/, 13];
          case 7:
            e_1_1 = _d.sent();
            e_1 = { error: e_1_1 };
            return [3 /*break*/, 13];
          case 8:
            _d.trys.push([8, , 11, 12]);
            if(!(_b && !_b.done && (_c = _a.return))) return [3 /*break*/, 10];
            return [4 /*yield*/, _c.call(_a)];
          case 9:
            _d.sent();
            _d.label = 10;
          case 10:
            return [3 /*break*/, 12];
          case 11:
            if(e_1) throw e_1.error;
            return [7 /*endfinally*/];
          case 12:
            return [7 /*endfinally*/];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  });
}
function throttler(wait, options) {
  var _this = this;
  if(options === void 0) {
    options = {};
  }
  var _a = options.limit,
    limit = _a === void 0 ? 1 : _a,
    _b = options.cooldown,
    cooldown = _b === void 0 ? false : _b;
  if(limit < 1) {
    throw new RangeError('options.limit cannot be less than 1');
  }
  return new Repeater(function (push, stop) {
    return __awaiter(_this, void 0, void 0, function () {
      function leak() {
        return __awaiter(this, void 0, void 0, function () {
          var tokens_1, tokens_1_1, token;
          var e_3, _a;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                if(leaking != null) {
                  return [2 /*return*/, leaking];
                }
                start = Date.now();
                return [4 /*yield*/, timer.next()];
              case 1:
                _b.sent();
                try {
                  for(tokens_1 = __values(tokens), tokens_1_1 = tokens_1.next(); !tokens_1_1.done; tokens_1_1 = tokens_1.next()) {
                    token = tokens_1_1.value;
                    token.release();
                  }
                } catch(e_3_1) {
                  e_3 = { error: e_3_1 };
                } finally {
                  try {
                    if(tokens_1_1 && !tokens_1_1.done && (_a = tokens_1.return)) _a.call(tokens_1);
                  } finally {
                    if(e_3) throw e_3.error;
                  }
                }
                tokens.clear();
                // eslint-disable-next-line require-atomic-updates
                leaking = undefined;
                return [2 /*return*/];
            }
          });
        });
      }
      var timer, tokens, start, leaking, stopped, _a, _b, token, token1, e_2_1;
      var e_2, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            timer = delay(wait);
            tokens = new Set();
            start = Date.now();
            stopped = false;
            stop.then(function () {
              return (stopped = true);
            });
            _d.label = 1;
          case 1:
            _d.trys.push([1, 9, 10, 15]);
            _a = __asyncValues(Repeater.race([semaphore(limit), stop]));
            _d.label = 2;
          case 2:
            return [4 /*yield*/, _a.next()];
          case 3:
            if(!((_b = _d.sent()), !_b.done)) return [3 /*break*/, 8];
            token = _b.value;
            if(stopped) {
              return [3 /*break*/, 8];
            }
            leaking = leak();
            token1 = __assign(__assign({}, token), { reset: start + wait });
            tokens.add(token1);
            if(!(cooldown && token.remaining === 0)) return [3 /*break*/, 5];
            return [4 /*yield*/, Promise.race([stop, leaking])];
          case 4:
            _d.sent();
            token1 = __assign(__assign({}, token1), { remaining: limit });
            _d.label = 5;
          case 5:
            return [4 /*yield*/, push(token1)];
          case 6:
            _d.sent();
            _d.label = 7;
          case 7:
            return [3 /*break*/, 2];
          case 8:
            return [3 /*break*/, 15];
          case 9:
            e_2_1 = _d.sent();
            e_2 = { error: e_2_1 };
            return [3 /*break*/, 15];
          case 10:
            _d.trys.push([10, , 13, 14]);
            if(!(_b && !_b.done && (_c = _a.return))) return [3 /*break*/, 12];
            return [4 /*yield*/, _c.call(_a)];
          case 11:
            _d.sent();
            _d.label = 12;
          case 12:
            return [3 /*break*/, 14];
          case 13:
            if(e_2) throw e_2.error;
            return [7 /*endfinally*/];
          case 14:
            return [7 /*endfinally*/];
          case 15:
            tokens.clear();
            return [4 /*yield*/, timer.return()];
          case 16:
            _d.sent();
            return [2 /*return*/];
        }
      });
    });
  });
}

export { semaphore, throttler };
//# sourceMappingURL=limiters.esm.js.map
