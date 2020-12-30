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
/* global Reflect, Promise */

var extendStatics = function(d, b) {
  extendStatics =
    Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array &&
      function(d, b) {
        d.__proto__ = b;
      }) ||
    function(d, b) {
      for(let p in b) if(b.hasOwnProperty(p)) d[p] = b[p];
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
  return new (P || (P = Promise))((resolve, reject) => {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch(e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator.throw(value));
      } catch(e) {
        reject(e);
      }
    }
    function step(result) {
      result.done
        ? resolve(result.value)
        : new P(resolve => {
            resolve(result.value);
          }).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  let _ = {
      label: 0,
      sent() {
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
  return ((g = { next: verb(0), throw: verb(1), return: verb(2) }),
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
        if(((f = 1),
          y &&
            (t =
              op[0] & 2
                ? y.return
                : op[0]
                ? y.throw || ((t = y.return) && t.call(y), 0)
                : y.next) &&
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
          default: if (
              !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
              (op[0] === 6 || op[0] === 2)
            ) {
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
  let m = typeof Symbol === 'function' && o[Symbol.iterator],
    i = 0;
  if(m) return m.call(o);
  return {
    next() {
      if(o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
}

function __read(o, n) {
  let m = typeof Symbol === 'function' && o[Symbol.iterator];
  if(!m) return o;
  let i = m.call(o),
    r,
    ar = [],
    e;
  try {
    while((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch(error) {
    e = { error };
  } finally {
    try {
      if(r && !r.done && (m = i.return)) m.call(i);
    } finally {
      if(e) throw e.error;
    }
  }
  return ar;
}

function __spread() {
  for(var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
  return ar;
}

function __await(v) {
  return this instanceof __await ? ((this.v = v), this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if(!Symbol.asyncIterator) throw new TypeError('Symbol.asyncIterator is not defined.');
  let g = generator.apply(thisArg, _arguments || []),
    i,
    q = [];
  return ((i = {}),
    verb('next'),
    verb('throw'),
    verb('return'),
    (i[Symbol.asyncIterator] = function() {
      return this;
    }),
    i
  );
  function verb(n) {
    if(g[n])
      i[n] = function(v) {
        return new Promise((a, b) => {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch(e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await
      ? Promise.resolve(r.value.v).then(fulfill, reject)
      : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume('next', value);
  }
  function reject(value) {
    resume('throw', value);
  }
  function settle(f, v) {
    if((f(v), q.shift(), q.length)) resume(q[0][0], q[0][1]);
  }
}

let FixedBuffer = /** @class */ (function () {
  function FixedBuffer(capacity) {
    this.capacity = capacity;
    this.arr = [];
    if(capacity < 0) {
      throw new RangeError('FixedBuffer capacity cannot be less than zero');
    }
  }
  Object.defineProperty(FixedBuffer.prototype, 'empty', {
    get() {
      return this.arr.length === 0;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(FixedBuffer.prototype, 'full', {
    get() {
      return this.arr.length >= this.capacity;
    },
    enumerable: true,
    configurable: true
  });
  FixedBuffer.prototype.add = function(value) {
    if(this.full) {
      throw new Error('Buffer full');
    } else {
      this.arr.push(value);
    }
  };
  FixedBuffer.prototype.remove = function() {
    if(this.empty) {
      throw new Error('Buffer empty');
    }
    return this.arr.shift();
  };
  return FixedBuffer;
})();
// TODO: use a circular buffer here
let SlidingBuffer = /** @class */ (function () {
  function SlidingBuffer(capacity) {
    this.capacity = capacity;
    this.arr = [];
    this.full = false;
    if(capacity <= 0) {
      throw new RangeError('SlidingBuffer capacity cannot be less than or equal to zero');
    }
  }
  Object.defineProperty(SlidingBuffer.prototype, 'empty', {
    get() {
      return this.arr.length === 0;
    },
    enumerable: true,
    configurable: true
  });
  SlidingBuffer.prototype.add = function(value) {
    while(this.arr.length >= this.capacity) {
      this.arr.shift();
    }
    this.arr.push(value);
  };
  SlidingBuffer.prototype.remove = function() {
    if(this.empty) {
      throw new Error('Buffer empty');
    }
    return this.arr.shift();
  };
  return SlidingBuffer;
})();
let DroppingBuffer = /** @class */ (function () {
  function DroppingBuffer(capacity) {
    this.capacity = capacity;
    this.arr = [];
    this.full = false;
    if(capacity <= 0) {
      throw new RangeError('DroppingBuffer capacity cannot be less than or equal to zero');
    }
  }
  Object.defineProperty(DroppingBuffer.prototype, 'empty', {
    get() {
      return this.arr.length === 0;
    },
    enumerable: true,
    configurable: true
  });
  DroppingBuffer.prototype.add = function(value) {
    if(this.arr.length < this.capacity) {
      this.arr.push(value);
    }
  };
  DroppingBuffer.prototype.remove = function() {
    if(this.empty) {
      throw new Error('Buffer empty');
    }
    return this.arr.shift();
  };
  return DroppingBuffer;
})();

let MAX_QUEUE_LENGTH = 1024;
let NOOP = function() {};
function isPromiseLike(value) {
  return value != null && typeof value.then === 'function';
}
function swallow(value) {
  if(isPromiseLike(value)) {
    Promise.resolve(value).catch(NOOP);
  }
}
let RepeaterOverflowError = /** @class */ (function (_super) {
  __extends(RepeaterOverflowError, _super);
  function RepeaterOverflowError(message) {
    let _newTarget = this.constructor;
    let _this = _super.call(this, message) || this;
    Object.defineProperty(_this, 'name', {
      value: 'RepeaterOverflowError',
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
  return RepeaterOverflowError;
})(Error);

/**
 * The functionality for repeaters is implemented in this helper class and
 * hidden using a private WeakMap to make repeaters themselves opaque and
 * maximally compatible with async generators.
 */
let RepeaterController = /** @class */ (function () {
  function RepeaterController(executor, buffer) {
    this.executor = executor;
    this.buffer = buffer;
    this.state = 0 /* Initial */;
    // pushQueue and pullQueue will never both contain operations at the same time.
    this.pushQueue = [];
    this.pullQueue = [];
    this.onnext = NOOP;
    this.onstop = NOOP;
  }

  /**
   * This method runs synchronously the first time next is called.
   *
   * Advances state to RepeaterState.Started
   */
  RepeaterController.prototype.execute = function() {
    let _this = this;
    if(this.state >= 1 /* Started */) {
      return;
    }
    this.state = 1 /* Started */;
    let push = this.push.bind(this);
    let stop = this.stop.bind(this);
    {
      let stopP = new Promise(resolve => (_this.onstop = resolve));
      stop.then = stopP.then.bind(stopP);
      stop.catch = stopP.catch.bind(stopP);
      stop.finally = stopP.finally.bind(stopP);
    }
    try {
      this.execution = Promise.resolve(this.executor(push, stop));
    } catch(err) {
      // sync err in executor
      this.execution = Promise.reject(err);
    }
    // We don’t have to call this.stop with the error because all that does is
    // reassign this.execution with the rejection.
    this.execution.catch(() => _this.stop());
  };

  /**
   * A helper method which builds IteratorResult objects from values.  This
   * method prevents types of Repeater<Promise<any>>, where the value property
   * is a promise, and mimics the promise unwrapping behavior of async
   * generators, where yield is equivalent to yield await.
   */
  RepeaterController.prototype.unwrap = function(value) {
    let _this = this;
    let done = this.state >= 3; /* Finished */
    return Promise.resolve(value).then(value => {
      if(!done && _this.state >= 4 /* Rejected */) {
        return _this.consume().then(value => ({ value, done: true }));
      }
      return { value, done };
    });
  };

  /**
   * A helper method used to mimic the behavior of async generators where the
   * final result or any error are consumed, so that further calls to next,
   * return or throw return { value: undefined, done: true }.
   */
  RepeaterController.prototype.consume = function() {
    let err = this.err;
    let execution = Promise.resolve(this.execution).then(value => {
      if(err != null) {
        throw err;
      }
      return value;
    });
    this.err = undefined;
    this.execution = execution.then(() => undefined,
      () => undefined
    );
    return this.pending === undefined ? execution : this.pending.then(() => execution);
  };

  /**
   * The difference between stopping a repeater vs finishing a repeater is that
   * stopping a repeater allows next to continue to drain values from the
   * pushQueue and buffer, while finishing a repeater will clear all pending
   * values and end iteration immediately. Once, a repeater is finished, all
   * results will have the done property set to true.
   *
   * Advances state to RepeaterState.Finished
   */
  RepeaterController.prototype.finish = function() {
    if(this.state >= 3 /* Finished */) {
      return;
    }
    if(this.state < 2 /* Stopped */) {
      this.stop();
    }
    this.state = 3 /* Finished */;
    this.pushQueue = [];
    this.buffer = new FixedBuffer(0);
  };

  /**
   * Called when a promise passed to push rejects, or when a push call is
   * unhandled.
   *
   * Advances state to RepeaterState.Rejected
   */
  RepeaterController.prototype.reject = function() {
    if(this.state >= 4 /* Rejected */) {
      return;
    }
    if(this.state < 3 /* Finished */) {
      this.finish();
    }
    this.state = 4 /* Rejected */;
  };

  /**
   * This method is bound and passed to the executor as the push argument.
   */
  RepeaterController.prototype.push = function(value) {
    let _this = this;
    swallow(value);
    if(this.pushQueue.length >= MAX_QUEUE_LENGTH) {
      throw new RepeaterOverflowError('No more than ' +
          MAX_QUEUE_LENGTH +
          ' pending calls to push are allowed on a single repeater.'
      );
    } else if(this.state >= 2 /* Stopped */) {
      return Promise.resolve(undefined);
    }
    let valueP =
      this.pending === undefined ? Promise.resolve(value) : this.pending.then(() => value);
    valueP = valueP.catch(err => {
      if(_this.state < 2 /* Stopped */) {
        _this.err = err;
      }
      _this.reject();
      // Explicitly return undefined to avoid typescript’s horrible void type
      return undefined;
    });
    let next;
    if(this.pullQueue.length) {
      let pull = this.pullQueue.shift();
      pull.resolve(this.unwrap(valueP));
      if(this.pullQueue.length) {
        next = Promise.resolve(this.pullQueue[0].value);
      } else {
        next = new Promise(resolve => (_this.onnext = resolve));
      }
    } else if(!this.buffer.full) {
      this.buffer.add(valueP);
      next = Promise.resolve(undefined);
    } else {
      next = new Promise(resolve => {
        _this.pushQueue.push({ resolve, value: valueP });
      });
    }
    // This method of catching unhandled rejections is adapted from
    // https://stackoverflow.com/a/57792542/1825413
    let floating = true;
    let err;
    let unhandled = next.catch(err1 => {
      if(floating) {
        err = err1;
      }
      // Explicitly return undefined to avoid typescript’s horrible void type
      return undefined;
    });
    next.then = function(onFulfilled, onRejected) {
      floating = false;
      return Promise.prototype.then.call(this, onFulfilled, onRejected);
    };
    this.pending = valueP
      .then(() => unhandled)
      .then(() => {
        if(err != null) {
          _this.err = err;
          _this.reject();
        }
        // Explicitly return undefined to avoid typescript’s horrible void type
        return undefined;
      });
    return next;
  };

  /**
   * This method is bound and passed to the executor as the stop argument.
   *
   * Advances state to RepeaterState.Stopped
   */
  RepeaterController.prototype.stop = function(err) {
    let e_1, _a, e_2, _b;
    let _this = this;
    if(this.state >= 2 /* Stopped */) {
      return;
    }
    this.state = 2 /* Stopped */;
    this.onnext();
    this.onstop();
    if(this.err == null) {
      this.err = err;
    }
    try {
      for(var _c = __values(this.pushQueue), _d = _c.next(); !_d.done; _d = _c.next()) {
        let push = _d.value;
        push.resolve();
      }
    } catch(e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if(_d && !_d.done && (_a = _c.return)) _a.call(_c);
      } finally {
        if(e_1) throw e_1.error;
      }
    }
    // If the pullQueue contains operations, the pushQueue and buffer are both
    // necessarily empty, so we don‘t have to worry about this.finish clearing
    // the pushQueue or buffer.
    if(this.pullQueue.length) {
      this.finish();
      try {
        for(var _e = __values(this.pullQueue), _f = _e.next(); !_f.done; _f = _e.next()) {
          let pull = _f.value;
          let execution =
            this.pending === undefined ? this.consume() : this.pending.then(() => _this.consume());
          pull.resolve(this.unwrap(execution));
        }
      } catch(e_2_1) {
        e_2 = { error: e_2_1 };
      } finally {
        try {
          if(_f && !_f.done && (_b = _e.return)) _b.call(_e);
        } finally {
          if(e_2) throw e_2.error;
        }
      }
    }
    this.pullQueue = [];
  };
  RepeaterController.prototype.next = function(value) {
    let _this = this;
    swallow(value);
    if(this.pullQueue.length >= MAX_QUEUE_LENGTH) {
      throw new RepeaterOverflowError('No more than ' +
          MAX_QUEUE_LENGTH +
          ' pending calls to Repeater.prototype.next are allowed on a single repeater.'
      );
    }
    if(this.state <= 0 /* Initial */) {
      this.execute();
    }
    this.onnext(value);
    if(!this.buffer.empty) {
      let result = this.unwrap(this.buffer.remove());
      if(this.pushQueue.length) {
        var push = this.pushQueue.shift();
        this.buffer.add(push.value);
        this.onnext = push.resolve;
      }
      return result;
    } else if(this.pushQueue.length) {
      var push = this.pushQueue.shift();
      this.onnext = push.resolve;
      return this.unwrap(push.value);
    } else if(this.state >= 2 /* Stopped */) {
      this.finish();
      return this.unwrap(this.consume());
    }
    return new Promise(resolve => _this.pullQueue.push({ resolve, value }));
  };
  RepeaterController.prototype.return = function(value) {
    swallow(value);
    this.finish();
    this.execution = Promise.resolve(this.execution).then(() => value);
    return this.unwrap(this.consume());
  };
  RepeaterController.prototype.throw = function(err) {
    if(this.state <= 0 /* Initial */ || this.state >= 2 /* Stopped */ || !this.buffer.empty) {
      this.finish();
      if(this.err == null) {
        this.err = err;
      }
      return this.unwrap(this.consume());
    }
    return this.next(Promise.reject(err));
  };
  RepeaterController.prototype[Symbol.asyncIterator] = function() {
    return this;
  };
  return RepeaterController;
})();
let controllers = new WeakMap();
// We do not export any types which use >=3.6 IteratorResult, AsyncIterator or
// AsyncGenerator types. This allows the code to be used with older versions of
// typescript. We cannot implement `AsyncIterator` or `AsyncIterableIterator`
// here because the default types are busted as hell.
//
// TODO: use typesVersions to ship stricter types.
let Repeater = /** @class */ (function () {
  function Repeater(executor, buffer) {
    if(buffer === void 0) {
      buffer = new FixedBuffer(0);
    }
    controllers.set(this, new RepeaterController(executor, buffer));
  }
  Repeater.prototype.next = function(value) {
    let controller = controllers.get(this);
    if(controller === undefined) {
      throw new Error('RepeaterController missing from controllers WeakMap');
    }
    return controller.next(value);
  };
  Repeater.prototype.return = function(value) {
    let controller = controllers.get(this);
    if(controller === undefined) {
      throw new Error('RepeaterController missing from controllers WeakMap');
    }
    return controller.return(value);
  };
  Repeater.prototype.throw = function(err) {
    let controller = controllers.get(this);
    if(controller === undefined) {
      throw new Error('RepeaterController missing from controllers WeakMap');
    }
    return controller.throw(err);
  };
  Repeater.prototype[Symbol.asyncIterator] = function() {
    return this;
  };
  Repeater.race = race;
  Repeater.merge = merge;
  Repeater.zip = zip;
  Repeater.latest = latest;
  return Repeater;
})();
function isAsyncIterable(value) {
  return value != null && typeof value[Symbol.asyncIterator] === 'function';
}
function isIterable(value) {
  return value != null && typeof value[Symbol.iterator] === 'function';
}
function asyncIterators(contenders, options) {
  let e_3, _a;
  let yieldValues = options.yieldValues,
    returnValues = options.returnValues;
  let iters = [];
  let _loop_1 = function(contender) {
    if(isAsyncIterable(contender)) {
      iters.push(contender[Symbol.asyncIterator]());
    } else if(isIterable(contender)) {
      let iter_1 = contender[Symbol.iterator]();
      iters.push((function syncToAsyncIterator() {
          return __asyncGenerator(this, arguments, function syncToAsyncIterator_1() {
            let result;
            return __generator(this, _a => {
              switch (_a.label) {
                case 0:
                  _a.trys.push([0, undefined, 6, 7]);
                  result = iter_1.next();
                  _a.label = 1;
                case 1:
                  if(result.done) return [3 /*break*/, 4];
                  return [4 /*yield*/, __await(result.value)];
                case 2:
                  return [4 /*yield*/, _a.sent()];
                case 3:
                  _a.sent();
                  result = iter_1.next();
                  return [3 /*break*/, 1];
                case 4:
                  return [4 /*yield*/, __await(result.value)];
                case 5:
                  return [2 /*return*/, _a.sent()];
                case 6:
                  iter_1.return && iter_1.return();
                  return [7 /*endfinally*/];
                case 7:
                  return [2 /*return*/];
              }
            });
          });
        })()
      );
    } else {
      iters.push((function valueToAsyncIterator() {
          return __asyncGenerator(this, arguments, function valueToAsyncIterator_1() {
            return __generator(this, _a => {
              switch (_a.label) {
                case 0:
                  if(!yieldValues) return [3 /*break*/, 3];
                  return [4 /*yield*/, __await(contender)];
                case 1:
                  return [4 /*yield*/, _a.sent()];
                case 2:
                  _a.sent();
                  _a.label = 3;
                case 3:
                  if(!returnValues) return [3 /*break*/, 5];
                  return [4 /*yield*/, __await(contender)];
                case 4:
                  return [2 /*return*/, _a.sent()];
                case 5:
                  return [2 /*return*/];
              }
            });
          });
        })()
      );
    }
  };
  try {
    for(var contenders_1 = __values(contenders), contenders_1_1 = contenders_1.next();
      !contenders_1_1.done;
      contenders_1_1 = contenders_1.next()
    ) {
      let contender = contenders_1_1.value;
      _loop_1(contender);
    }
  } catch(e_3_1) {
    e_3 = { error: e_3_1 };
  } finally {
    try {
      if(contenders_1_1 && !contenders_1_1.done && (_a = contenders_1.return))
        _a.call(contenders_1);
    } finally {
      if(e_3) throw e_3.error;
    }
  }
  return iters;
}
function race(contenders) {
  let _this = this;
  let iters = asyncIterators(contenders, { returnValues: true });
  return new Repeater((push, stop) =>
    __awaiter(_this, void 0, void 0, function() {
      let stopped, returned, results, results_1, results_1_1, result_1, result;
      let e_4, _a;
      return __generator(this, _b => {
        switch (_b.label) {
          case 0:
            if(!iters.length) {
              stop();
              return [2 /*return*/];
            }
            stopped = false;
            stop.then(() => (stopped = true));
            _b.label = 1;
          case 1:
            _b.trys.push([1, undefined, 7, 9]);
            _b.label = 2;
          case 2:
            if(stopped) return [3 /*break*/, 6];
            results = iters.map(iter => iter.next());
            try {
              for(results_1 = ((e_4 = void 0), __values(results)), results_1_1 = results_1.next();
                !results_1_1.done;
                results_1_1 = results_1.next()
              ) {
                result_1 = results_1_1.value;
                Promise.resolve(result_1).then(result => {
                    if(result.done && !stopped) {
                      stop();
                      stopped = true;
                      returned = result.value;
                    }
                  },
                  err => stop(err)
                );
              }
            } catch(e_4_1) {
              e_4 = { error: e_4_1 };
            } finally {
              try {
                if(results_1_1 && !results_1_1.done && (_a = results_1.return)) _a.call(results_1);
              } finally {
                if(e_4) throw e_4.error;
              }
            }
            return [4 /*yield*/, Promise.race(__spread([stop], results))];
          case 3:
            result = _b.sent();
            if(!(result !== undefined && !result.done)) return [3 /*break*/, 5];
            return [4 /*yield*/, push(result.value)];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            return [3 /*break*/, 2];
          case 6:
            return [2 /*return*/, returned];
          case 7:
            stop();
            return [4 /*yield*/, Promise.race(iters.map(iter => iter.return && iter.return()))];
          case 8:
            _b.sent();
            return [7 /*endfinally*/];
          case 9:
            return [2 /*return*/];
        }
      });
    })
  );
}
function merge(contenders) {
  let _this = this;
  let iters = asyncIterators(contenders, { yieldValues: true });
  return new Repeater((push, stop) =>
    __awaiter(_this, void 0, void 0, function() {
      let stopped, returned;
      let _this = this;
      return __generator(this, _a => {
        switch (_a.label) {
          case 0:
            if(!iters.length) {
              stop();
              return [2 /*return*/];
            }
            stopped = false;
            stop.then(() => (stopped = true));
            return [
              4 /*yield*/,
              Promise.all(iters.map(iter =>
                  __awaiter(_this, void 0, void 0, function() {
                    let result, _a;
                    return __generator(this, _b => {
                      switch (_b.label) {
                        case 0:
                          _b.trys.push([0, undefined, 6, 9]);
                          _b.label = 1;
                        case 1:
                          if(stopped) return [3 /*break*/, 5];
                          return [4 /*yield*/, Promise.race([iter.next(), stop])];
                        case 2:
                          result = _b.sent();
                          if(!(result !== undefined)) return [3 /*break*/, 4];
                          if(result.done) {
                            returned = result.value;
                            return [2 /*return*/];
                          }
                          return [4 /*yield*/, push(result.value)];
                        case 3:
                          _b.sent();
                          _b.label = 4;
                        case 4:
                          return [3 /*break*/, 1];
                        case 5:
                          return [3 /*break*/, 9];
                        case 6:
                          _a = iter.return;
                          if(!_a) return [3 /*break*/, 8];
                          return [4 /*yield*/, iter.return()];
                        case 7:
                          _a = _b.sent();
                          _b.label = 8;
                        case 8:
                          return [7 /*endfinally*/];
                        case 9:
                          return [2 /*return*/];
                      }
                    });
                  })
                )
              )
            ];
          case 1:
            _a.sent();
            stop();
            return [2 /*return*/, returned];
        }
      });
    })
  );
}
function zip(contenders) {
  let _this = this;
  let iters = asyncIterators(contenders, { returnValues: true });
  return new Repeater((push, stop) =>
    __awaiter(_this, void 0, void 0, function() {
      let stopped, resultsP, results, values;
      return __generator(this, _a => {
        switch (_a.label) {
          case 0:
            if(!iters.length) {
              stop();
              return [2 /*return*/, []];
            }
            stopped = false;
            stop.then(() => (stopped = true));
            _a.label = 1;
          case 1:
            _a.trys.push([1, undefined, 6, 8]);
            _a.label = 2;
          case 2:
            if(stopped) return [3 /*break*/, 5];
            resultsP = Promise.all(iters.map(iter => iter.next()));
            return [4 /*yield*/, Promise.race([stop, resultsP])];
          case 3:
            results = _a.sent();
            if(results === undefined) {
              return [2 /*return*/];
            }
            values = results.map(result => result.value);
            if(results.some(result => result.done)) {
              return [2 /*return*/, values];
            }
            return [4 /*yield*/, push(values)];
          case 4:
            _a.sent();
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 8];
          case 6:
            stop();
            return [4 /*yield*/, Promise.all(iters.map(iter => iter.return && iter.return()))];
          case 7:
            _a.sent();
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    })
  );
}
function latest(contenders) {
  let _this = this;
  let iters = asyncIterators(contenders, {
    yieldValues: true,
    returnValues: true
  });
  return new Repeater((push, stop) =>
    __awaiter(_this, void 0, void 0, function() {
      let stopped, resultsP, results_2, values_1;
      let _this = this;
      return __generator(this, _a => {
        switch (_a.label) {
          case 0:
            if(!iters.length) {
              stop();
              return [2 /*return*/, []];
            }
            stopped = false;
            stop.then(() => (stopped = true));
            _a.label = 1;
          case 1:
            _a.trys.push([1, undefined, 5, 7]);
            resultsP = Promise.all(iters.map(iter => iter.next()));
            return [4 /*yield*/, Promise.race([stop, resultsP])];
          case 2:
            results_2 = _a.sent();
            if(results_2 === undefined) {
              return [2 /*return*/];
            }
            values_1 = results_2.map(result => result.value);
            if(results_2.every(result => result.done)) {
              return [2 /*return*/, values_1];
            }
            return [4 /*yield*/, push(values_1.slice())];
          case 3:
            _a.sent();
            return [
              4 /*yield*/,
              Promise.all(iters.map((iter, i) =>
                  __awaiter(_this, void 0, void 0, function() {
                    let result;
                    return __generator(this, _a => {
                      switch (_a.label) {
                        case 0:
                          if(results_2[i].done) {
                            return [2 /*return*/, results_2[i].value];
                          }
                          _a.label = 1;
                        case 1:
                          if(stopped) return [3 /*break*/, 5];
                          return [4 /*yield*/, Promise.race([stop, iter.next()])];
                        case 2:
                          result = _a.sent();
                          if(!(result !== undefined)) return [3 /*break*/, 4];
                          if(result.done) {
                            return [2 /*return*/, result.value];
                          }
                          values_1[i] = result.value;
                          return [4 /*yield*/, push(values_1.slice())];
                        case 3:
                          _a.sent();
                          _a.label = 4;
                        case 4:
                          return [3 /*break*/, 1];
                        case 5:
                          return [2 /*return*/];
                      }
                    });
                  })
                )
              )
            ];
          case 4:
            return [2 /*return*/, _a.sent()];
          case 5:
            stop();
            return [4 /*yield*/, Promise.all(iters.map(iter => iter.return && iter.return()))];
          case 6:
            _a.sent();
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    })
  );
}

export {
  DroppingBuffer,
  FixedBuffer,
  MAX_QUEUE_LENGTH,
  Repeater,
  RepeaterOverflowError,
  SlidingBuffer
};
