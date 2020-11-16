import { Component, useState, useMemo, useCallback, useRef, useEffect } from '../dom/preactComponent.js';
import Util from '../util.js';

export const useTrkl = fn => {
  if(Util.platform != 'browser') return fn();

  const [value, setValue] = useState(fn());
  //console.debug('useTrkl fn =', fn, ' value =', value);

  useEffect(() => {
    let updateValue = v => {
      if(v !== undefined) {
        /*  if(v === 'yes') v = true;
        else if(v === 'no') v = false;*/
        //console.debug('useTrkl updateValue(', v, ')');
        setValue(v);
      }
    };

    fn.subscribe(updateValue);
    return () => fn.unsubscribe(updateValue);
  });
  return value;
};
