import { useMemo } from '../preact.mjs';
import { useAsyncIterator } from './useAsyncIterator.js';

export function useAsyncIterable(iterable) {
  var iterator = useMemo(
    function() {
      return iterable[Symbol.asyncIterator]();
    },
    [iterable],
  );
  return useAsyncIterator(iterator);
}

export default useAsyncIterable;
