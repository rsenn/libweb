import { useMemo } from '../preact.mjs';
import { useState } from '../preact.mjs';

export function useMousePosition() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const bind = useMemo(
    () => ({
      onMouseMove: e => {
        setX(e.nativeEvent.offsetX);
        setY(e.nativeEvent.offsetY);
      }
    }),
    []
  );
  return [x, y, bind];
}

export default useMousePosition;