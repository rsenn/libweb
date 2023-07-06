import { useCallback, useMemo } from '../preact.mjs';
import { useAsyncIterator } from './useAsyncIterator.js';

export function useAsyncGenerator(fn, deps) {
  var asyncGeneratorFn = useCallback(function () {
    return fn();
  }, deps);
  var asyncGenerator = useMemo(
    function() {
      return asyncGeneratorFn();
    },
    [asyncGeneratorFn]
  );
  return useAsyncIterator(asyncGenerator);
}

export default useAsyncGenerator;
