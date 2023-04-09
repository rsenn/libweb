import { platform } from '../misc.js';
import { Component, useState, useMemo, useCallback, useRef, useEffect } from '../dom/preactComponent.js';
import Util from '../util.js';

export const useTrkl = fn => {
  if(!(typeof fn == 'function')) return fn;

  //console.debug('useTrkl fn =', fn);
  if(Util.platform != 'browser') return fn();

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
