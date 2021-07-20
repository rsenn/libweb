import { useState, useEffect } from '../dom/preactComponent.js';
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
        if(((f = 1), y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)) return t;
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

// Repeaters are lazy, hooks are eager.
// We need to return push and stop synchronously from the useRepeater hook so
// we prime the repeater by calling next immediately.
function createPrimedRepeater(buffer) {
  let push;
  let stop;
  let repeater = new Repeater((push1, stop1) => {
    push = push1;
    stop = stop1;
    // this value is thrown away
    push(null);
  }, buffer);
  // pull and throw away the first value so the executor above runs
  repeater.next();
  return [repeater, push, stop];
}
function useRepeater(buffer) {
  let _a = __read(
      useState(() => createPrimedRepeater(buffer)),
      1
    ),
    tuple = _a[0];
  return tuple;
}
function useAsyncIter(callback, deps) {
  if(deps === void 0) {
    deps = [];
  }
  let _a = __read(useRepeater(), 2),
    repeater = _a[0],
    push = _a[1];
  let _b = __read(
      useState(() => callback(repeater)),
      1
    ),
    iter = _b[0];
  useEffect(() => {
    push(deps);
  }, __spread([push], deps)); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(
    () =>
      function() {
        if(iter.return != null) {
          // TODO: handle return errors
          iter.return().catch();
        }
      },
    [iter]
  );
  return iter;
}
function useResult(callback, deps) {
  let _this = this;
  let iter = useAsyncIter(callback, deps);
  let _a = __read(useState(), 2),
    result = _a[0],
    setResult = _a[1];
  useEffect(() => {
    let mounted = true;
    (function () {
      return __awaiter(_this, void 0, void 0, function() {
        let result_1, err_1;
        return __generator(this, _a => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, undefined, 5]);
              _a.label = 1;
            case 1:
              if(!mounted) return [3 /*break*/, 3];
              return [4 /*yield*/, iter.next()];
            case 2:
              result_1 = _a.sent();
              if(mounted) {
                setResult(result_1);
              }
              if(result_1.done) {
                return [3 /*break*/, 3];
              }
              return [3 /*break*/, 1];
            case 3:
              return [3 /*break*/, 5];
            case 4:
              err_1 = _a.sent();
              if(mounted) {
                setResult(() => {
                  throw err_1;
                });
              }
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    })();
    return function() {
      mounted = false;
    };
  }, [iter]);
  return result;
}
function useValue(callback, deps) {
  let result = useResult(callback, deps);
  return result && result.value;
}

export { useAsyncIter, useRepeater, useResult, useValue };
