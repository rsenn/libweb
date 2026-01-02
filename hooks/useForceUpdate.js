import { useCallback } from '../preact.js';
import { useState } from '../preact.js';

export const useForceUpdate = () => {
  const [, dispatch] = useState(Object.create(null));

  const memoizedDispatch = useCallback(() => {
    dispatch(Object.create(null));
  }, [dispatch]);

  return memoizedDispatch;
};

export default useForceUpdate;