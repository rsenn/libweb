import { Component, useState, useMemo, useCallback, useRef, useEffect } from '../preact.mjs';

export const useTrkl = fn => {
  if(!(typeof fn == 'function')) return fn;

  //console.debug('useTrkl fn =', fn);
  if(!globalThis.navigator) return fn();

  const [value, setValue] = useState(fn());

  useEffect(() => {
    //console.log('updated', fn.id, fn());
    let updateValue = v => {
      v ??= fn();

      if(v !== undefined) {
        // console.log('useTrkl setValue(', v, ')');
        setValue(v);
      }
    };

    fn.subscribe(updateValue);

    //console.log('useTrkl updateValue =', typeof updateValue, ' value =', value);

    return () => fn.unsubscribe(updateValue);
  });
  return value;
};
