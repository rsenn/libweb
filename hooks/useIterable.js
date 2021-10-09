import { useMemo } from '../dom/preactComponent.js';

import { useIterator } from './useIterator.js';

export function useIterable(iterable) {
  var iterator = useMemo(
    function() {
      return iterable[Symbol.iterator]();
    },
    [iterable]
  );
  return useIterator(iterator);
}

export default useIterable;
