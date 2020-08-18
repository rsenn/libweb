import { Repeater } from './repeater.js';

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

var InMemoryPubSub = /** @class */ (function () {
  function InMemoryPubSub() {
    this.publishers = {};
  }
  InMemoryPubSub.prototype.publish = function (topic, value) {
    var e_1, _a;
    var publishers = this.publishers[topic];
    if(publishers != null) {
      try {
        for(var publishers_1 = __values(publishers), publishers_1_1 = publishers_1.next(); !publishers_1_1.done; publishers_1_1 = publishers_1.next()) {
          var _b = publishers_1_1.value,
            push = _b.push,
            stop_1 = _b.stop;
          try {
            push(value).catch(stop_1);
          } catch(err) {
            // push queue is full
            stop_1(err);
          }
        }
      } catch(e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if(publishers_1_1 && !publishers_1_1.done && (_a = publishers_1.return)) _a.call(publishers_1);
        } finally {
          if(e_1) throw e_1.error;
        }
      }
    }
  };
  InMemoryPubSub.prototype.unpublish = function (topic, reason) {
    var e_2, _a;
    var publishers = this.publishers[topic];
    if(publishers == null) {
      return;
    }
    try {
      for(var publishers_2 = __values(publishers), publishers_2_1 = publishers_2.next(); !publishers_2_1.done; publishers_2_1 = publishers_2.next()) {
        var stop_2 = publishers_2_1.value.stop;
        stop_2(reason);
      }
    } catch(e_2_1) {
      e_2 = { error: e_2_1 };
    } finally {
      try {
        if(publishers_2_1 && !publishers_2_1.done && (_a = publishers_2.return)) _a.call(publishers_2);
      } finally {
        if(e_2) throw e_2.error;
      }
    }
    publishers.clear();
  };
  InMemoryPubSub.prototype.subscribe = function (topic, buffer) {
    var _this = this;
    if(this.publishers[topic] == null) {
      this.publishers[topic] = new Set();
    }
    return new Repeater(function (push, stop) {
      return __awaiter(_this, void 0, void 0, function () {
        var publisher;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              publisher = { push: push, stop: stop };
              this.publishers[topic].add(publisher);
              return [4 /*yield*/, stop];
            case 1:
              _a.sent();
              this.publishers[topic].delete(publisher);
              return [2 /*return*/];
          }
        });
      });
    }, buffer);
  };
  InMemoryPubSub.prototype.close = function (reason) {
    var e_3, _a;
    try {
      for(var _b = __values(Object.keys(this.publishers)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var topic = _c.value;
        this.unpublish(topic, reason);
      }
    } catch(e_3_1) {
      e_3 = { error: e_3_1 };
    } finally {
      try {
        if(_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if(e_3) throw e_3.error;
      }
    }
  };
  return InMemoryPubSub;
})();

export { InMemoryPubSub };
//# sourceMappingURL=pubsub.esm.js.map
