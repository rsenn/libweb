import { Repeater, SlidingBuffer, MAX_QUEUE_LENGTH, RepeaterOverflowError } from '@repeaterjs/repeater';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
  extendStatics =
    Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array &&
      function(d, b) {
        d.__proto__ = b;
      }) ||
    function(d, b) {
      for(var p in b) if(b.hasOwnProperty(p)) d[p] = b[p];
    };
  return extendStatics(d, b);
};

function __extends(d, b) {
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P
      ? value
      : new P(function (resolve) {
          resolve(value);
        });
  }
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
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = {
      label: 0,
      sent: function() {
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
      (g[Symbol.iterator] = function() {
        return this;
      }),
    g
  );
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if(f) throw new TypeError('Generator is already executing.');
    while(_)
      try {
        if(
          ((f = 1),
          y &&
            (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
            !(t = t.call(y, op[1])).done)
        )
          return t;
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
  var s = typeof Symbol === 'function' && Symbol.iterator,
    m = s && o[s],
    i = 0;
  if(m) return m.call(o);
  if(o && typeof o.length === 'number')
    return {
      next: function() {
        if(o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
  throw new TypeError(s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.');
}

var TimeoutError = /** @class */ (function (_super) {
  __extends(TimeoutError, _super);
  function TimeoutError(message) {
    var _newTarget = this.constructor;
    var _this = _super.call(this, message) || this;
    Object.defineProperty(_this, 'name', {
      value: 'TimeoutError',
      enumerable: false
    });
    if(typeof Object.setPrototypeOf === 'function') {
      Object.setPrototypeOf(_this, _newTarget.prototype);
    } else {
      _this.__proto__ = _newTarget.prototype;
    }
    if(typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(_this, _this.constructor);
    }
    return _this;
  }
  return TimeoutError;
})(Error);
var Timer = /** @class */ (function () {
  function Timer(wait) {
    var _this = this;
    this.wait = wait;
    this.promise = new Promise(function (resolve, reject) {
      _this.resolve = resolve;
      _this.reject = reject;
    });
  }
  Timer.prototype.run = function(fn) {
    var _this = this;
    if(this.timeout != null) {
      throw new Error('Cannot run a timer multiple times');
    }
    this.timeout = setTimeout(function () {
      try {
        var value = fn();
        _this.resolve(value);
      } catch(err) {
        _this.reject(err);
      }
    }, this.wait);
  };
  Timer.prototype.clear = function() {
    clearTimeout(this.timeout);
    // In code below, this method is only called after the repeater is
    // stopped. Because repeaters swallow rejections which settle after stop, we
    // use this mechanism to make any pending call which has received the
    // deferred promise resolve to `{ done: true }`.
    this.reject(new TimeoutError('Timer.clear called before stop'));
  };
  return Timer;
})();
function delay(wait) {
  var _this = this;
  return new Repeater(function (push, stop) {
    return __awaiter(_this, void 0, void 0, function() {
      var timers, stopped, _loop_1, timers_1, timers_1_1, timer;
      var e_1, _a;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            timers = new Set();
            stopped = false;
            stop.then(function () {
              return (stopped = true);
            });
            _b.label = 1;
          case 1:
            _b.trys.push([1, , 5, 6]);
            _loop_1 = function() {
              var timer;
              return __generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    timer = new Timer(wait);
                    timers.add(timer);
                    if(timers.size > MAX_QUEUE_LENGTH) {
                      throw new RepeaterOverflowError(
                        'No more than ' + MAX_QUEUE_LENGTH + ' calls to next are allowed on a single delay repeater.'
                      );
                    }
                    timer.run(function () {
                      timers.delete(timer);
                      return Date.now();
                    });
                    return [4 /*yield*/, push(timer.promise)];
                  case 1:
                    _a.sent();
                    return [2 /*return*/];
                }
              });
            };
            _b.label = 2;
          case 2:
            if(!!stopped) return [3 /*break*/, 4];
            return [5 /*yield**/, _loop_1()];
          case 3:
            _b.sent();
            return [3 /*break*/, 2];
          case 4:
            return [3 /*break*/, 6];
          case 5:
            try {
              for(
                timers_1 = __values(timers), timers_1_1 = timers_1.next();
                !timers_1_1.done;
                timers_1_1 = timers_1.next()
              ) {
                timer = timers_1_1.value;
                timer.clear();
              }
            } catch(e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if(timers_1_1 && !timers_1_1.done && (_a = timers_1.return)) _a.call(timers_1);
              } finally {
                if(e_1) throw e_1.error;
              }
            }
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  });
}
function timeout(wait) {
  var _this = this;
  return new Repeater(function (push, stop) {
    return __awaiter(_this, void 0, void 0, function() {
      var timer, stopped;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            stopped = false;
            stop.then(function () {
              return (stopped = true);
            });
            _a.label = 1;
          case 1:
            _a.trys.push([1, , 5, 6]);
            _a.label = 2;
          case 2:
            if(!!stopped) return [3 /*break*/, 4];
            if(timer !== undefined) {
              timer.resolve(undefined);
            }
            timer = new Timer(wait);
            timer.run(function () {
              throw new TimeoutError(wait + 'ms elapsed without next being called');
            });
            return [4 /*yield*/, push(timer.promise)];
          case 3:
            _a.sent();
            return [3 /*break*/, 2];
          case 4:
            return [3 /*break*/, 6];
          case 5:
            if(timer !== undefined) {
              timer.clear();
            }
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  });
}
function interval(wait, buffer) {
  var _this = this;
  if(buffer === void 0) {
    buffer = new SlidingBuffer(1);
  }
  return new Repeater(function (push, stop) {
    return __awaiter(_this, void 0, void 0, function() {
      var timer;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            push(Date.now());
            timer = setInterval(function () {
              return push(Date.now());
            }, wait);
            return [4 /*yield*/, stop];
          case 1:
            _a.sent();
            clearInterval(timer);
            return [2 /*return*/];
        }
      });
    });
  }, buffer);
}

export { TimeoutError, delay, interval, timeout };
//# sourceMappingURL=timers.esm.js.map
