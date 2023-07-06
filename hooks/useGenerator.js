'use strict';

import { useEffect, useRef } from '../preact.mjs';

export const useGenerator = (generator, deps = []) => {
  const generatorRef = useRef(generator);

  useEffect(() => {
    generatorRef.current = generator;
  });

  useEffect(() => {
    let ignore = false;
    const genFunc = generatorRef.current();

    const execute = async () => {
      let result = { value: null, done: false };
      while(!result.done) {
        try {
          if(ignore) return;
          result = genFunc.next(result.value);

          try {
            const value = await result.value;
            result.value = { value, error: null };
          } catch(err) {
            if(ignore) return;
            const error = await err;
            result.value = { value: null, error: error.message };
          }
        } catch(err) {
          /* eslint-disable */
          console.error(`useGenerator - unhandled error: ${err.message}`);
          /* eslint-enable */
          return;
        }
      }
    };

    execute();

    return () => {
      ignore = true;
    };
  }, deps);
};
