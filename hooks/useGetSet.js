import { useCallback, useRef } from '../preact.mjs';

export const useGetSet = initialValue => {
  const ref = useRef(initialValue);
  const get = useCallback(() => ref.current, []);
  const set = useCallback(value => {
    ref.current = typeof value === 'function' ? value(ref.current) : value;

    return ref.current;
  }, []);

  return [get, set];
};

export default useGetSet;