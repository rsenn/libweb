import { useCallback, useState } from '../preact.mjs';

export const useForceUpdate = () => {
  const [, dispatch] = useState(Object.create(null));

  const memoizedDispatch = useCallback(() => {
    dispatch(Object.create(null));
  }, [dispatch]);

  return memoizedDispatch;
};

export default useForceUpdate;
