import { useCallback, useMemo } from '../preact.module.js';
import { useAsyncIterator } from './useAsyncIterator.js';

export function useAsyncIterable(iterable) {
  var iterator = useMemo(
    function() {
      return iterable[Symbol.asyncIterator]();
    },
    [iterable]
  );
  return useAsyncIterator(iterator);
}

export default useAsyncIterable;
