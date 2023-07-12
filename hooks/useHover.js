import { useMemo, useState } from '../preact.mjs';

export function useHover() {
  const [isHovered, setHovered] = useState(false);
  const bind = useMemo(() => ({ onMouseEnter: e => void setHovered(true), onMouseLeave: e => void setHovered(false) }), []);
  return [isHovered, bind];
}

export default useHover;