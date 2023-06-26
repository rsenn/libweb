import { Component, useState, useMemo } from '../preact.module.js';

export function useFocus() {
  const [isFocused, setFocused] = useState(false);
  const bind = useMemo(
    () => ({
      onFocus: e => void setFocused(true),
      onBlur: e => void setFocused(false)
    }),
    []
  );
  return [isFocused, bind];
}

export default useFocus;
