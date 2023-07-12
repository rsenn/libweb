import { useEffect, useRef } from '../preact.mjs';

const defaultEvents = ['mousedown', 'touchstart'];

export const useClickout = (events = defaultEvents) => {
  const refWrap = useRef();
  const doEvent = useRef(() => {});

  const bindClickout = clickoutFn => {
    doEvent.current = clickoutFn;
  };

  useEffect(() => {
    const handler = event => {
      const isOut = !!refWrap.current && !refWrap.current.contains(event.target);
      if(isOut) doEvent.current(event, refWrap);
    };

    events.forEach(event => {
      document.addEventListener(event, handler);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handler);
      });
    };
  }, [events]);

  return [refWrap, bindClickout];
};

export default useClickout;