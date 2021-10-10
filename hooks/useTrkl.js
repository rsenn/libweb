import { Component, useState, useMemo, useCallback, useRef, useEffect } from '../dom/preactComponent.js';
import Util from '../util.js';

export const useTrkl = fn => {
  if(Util.platform != 'browser') return fn();

  const [value, setValue] = useState(fn());
 // console.debug('useTrkl fn =', fn, ' value =', value);

  useEffect(() => {
    console.log('updated', fn.id, fn());
 let updateValue = v => {
  v ??= fn();

      if(v !== undefined) {
        /*  if(v === 'yes') v = true;
        else if(v === 'no') v = false;*/
        console.log('useTrkl setValue(', v, ')');
        setValue(v);
      }
    };

    fn.subscribe(updateValue);

 //console.log('useTrkl updateValue =', typeof updateValue, ' value =', value);

    return () => fn.unsubscribe(updateValue);
  });
  return value;
};
