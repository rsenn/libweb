import { Component, useState, useMemo, useCallback, useRef } from '../dom/preactComponent.js';
/**
 * @param {clickEvent} doubleClick
 * @param {clickEvent} [click]
 * @param {UseDoubleClickOptions} [options]
 * @returns {clickEvent}
 */
export const useDoubleClick = (doubleClick, click, options) => {
  options = {
    timeout: 200,
    ...options
  };
  const clickTimeout = useRef();
  const clearClickTimeout = () => {
    if(clickTimeout) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
  };
  return useCallback(event => {
      clearClickTimeout();
      if(click && event.detail === 1) {
        clickTimeout.current = setTimeout(() => {
          click(event);
        }, options.timeout);
      }
      if(event.detail % 2 === 0) {
        doubleClick(event);
      }
    }, [click, doubleClick, options.timeout]
  );
};
