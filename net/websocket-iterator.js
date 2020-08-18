import { thenableReject } from '../thenable-reject.js';
import Util from '../util.js';

export async function* websocketData(websocket) {
  for await (const { data } of websocketEvents(websocket)) yield data;
}

export function websocketEvents(websocket, { emitOpen = false } = {}) {
  let done = false;
  const values = [];
  const resolvers = [];
  const ctor = Util.tryCatch(
    () => window.WebSocket,
    (ws) => ws,
    () => websocket.constructor
  );

  //console.log("ctor:", ctor);

  const close = () => {
    done = true;

    while(resolvers.length > 0)
      resolvers.shift()({
        value: undefined,
        done: true
      });
  };

  const push = (data) => {
    if(done) return;

    if(resolvers.length > 0) {
      resolvers.shift()(data);
    } else {
      values.push(data);
    }
  };

  const pushError = (error) => {
    push(thenableReject(error));
    close();
  };

  const pushEvent = (event) =>
    push({
      value: event,
      done: false
    });

  const next = () => {
    if(values.length > 0) return Promise.resolve(values.shift());
    if(done)
      return Promise.resolve({
        value: undefined,
        done: true
      });
    return new Promise((resolve) => resolvers.push(resolve));
  };

  const initSocket = () => {
    websocket.addEventListener('close', close);
    websocket.addEventListener('error', pushError);
    websocket.addEventListener('message', pushEvent);
  };

  if(websocket.readyState === ctor.CONNECTING) {
    websocket.addEventListener('open', (event) => {
      if(emitOpen) pushEvent(event);
      initSocket();
    });
  } else {
    initSocket();
  }

  const iterator = {
    [Symbol.asyncIterator]: () => iterator,
    next,
    throw: async (value) => {
      pushError(value);
      if(websocket.readyState === ctor.OPEN) websocket.close();
      return next();
    },
    return: async () => {
      close();
      if(websocket.readyState === ctor.OPEN) websocket.close();
      return next();
    }
  };
  return iterator;
}
