import { useMemo } from '../preact.js';
import { useState } from '../preact.js';

export function useHover() {
  const [isHovered, setHovered] = useState(false);
  const bind = useMemo(() => ({ onMouseEnter: e => void setHovered(true), onMouseLeave: e => void setHovered(false) }), []);
  return [isHovered, bind];
}

export default useHover;