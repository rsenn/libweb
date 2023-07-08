import { useMemo } from '../preact.mjs';
import { trkl } from '../trkl.js';

export function useElement(callback) {
  const emitter = trkl(null);

  if(typeof callback == 'function') emitter.subscribe(callback);

  return useMemo(() => ({
    get current() {
      return emitter();
    },
    set current(value) {
      if(typeof value == 'object' && value !== null && 'base' in value) value = value.base;

      if(value !== null && value !== undefined) {
        let oldValue = emitter();
        if(oldValue !== value) emitter(value);
      }
    },
    emitter,
    subscribe(handler) {
      emitter.subscribe(handler);
      return this;
    },
    unsubscribe(handler) {
      emitter.unsubscribe(handler);
      return this;
    }
  }));
}