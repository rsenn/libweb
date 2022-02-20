import { useMemo, useReducer, useCallback } from '../dom/preactComponent.js';

var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for(var p in s) if(Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };

var reducer = function(s, v) {
  var next = __assign(__assign({}, s), v);
  return next;
};

export function useIterator(iterator) {
  var initialState = useMemo(function () {
    return iterator.next();
  }, []);
  var _a = useReducer(reducer, initialState),
    result = _a[0],
    dispatch = _a[1];
  var next = useCallback(
    function(next) {
      var res = iterator.next(next);
      dispatch(res);
    },
    [iterator, dispatch]
  );
  var return_ = useCallback(
    function(value) {
      var _a;
      var res = (_a = iterator.return) === null || _a === void 0 ? void 0 : _a.call(iterator, value);
      if(res == null) return;
      dispatch(res);
    },
    [iterator, dispatch]
  );
  var throw_ = useCallback(
    function(error) {
      var _a;
      var res = (_a = iterator.throw) === null || _a === void 0 ? void 0 : _a.call(iterator, error);
      if(res == null) return;
      dispatch(res);
    },
    [iterator, dispatch]
  );
  return useMemo(
    function() {
      return {
        done: result.done,
        value: result.value,
        next: next,
        return: return_,
        throw: throw_
      };
    },
    [result, next, return_, throw_]
  );
}

export default useIterator;
