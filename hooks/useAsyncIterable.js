import { useCallback, useMemo } from '../dom/preactComponent.js';
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
