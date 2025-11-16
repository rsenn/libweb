import { useMemo, useState } from '../preact.js';

export function useActive() {
  const [isActive, setActive] = useState(false);
  const bind = useMemo(
    () => ({
      onMouseDown: e => void setActive(true),
      onMouseUp: e => void setActive(false),
    }),
    [],
  );
  return [isActive, bind];
}

export default useActive;
