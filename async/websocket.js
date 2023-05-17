import { waitFor } from '../misc.js';

WebSocket.makeURL = WebSocketURL;

// Generate a Promise that listens only once for an event
const oncePromise = (emitter, events) => {
  if(!Array.isArray(events)) events = [events];

  return new Promise(
    /*'addEventListener' in emitter ||*/ false
      ? resolve => {
          const handler = e => {
            for(let name of events) emitter.removeEventListener(name, handler);
            resolve(e);
          };
          for(let name of events) emitter.addEventListener(name, handler);
        }
      : resolve => {
          const handler = e => {
            for(let name of events) emitter['on' + name] = 0;
            resolve(e);
          };
          for(let name of events) emitter['on' + name] = handler;
        }
  );
};

export class WebSocketError extends Error {
  constructor(message, ws) {
    super(message);
    this.socket = ws;
  }
}

// Add an async iterator to all WebSockets
//WebSocket.prototype[Symbol.asyncIterator] = WebSocketIterator;

export async function* WebSocketIterator() {
  while(this.readyState !== WebSocket.CLOSED) {
    let ev = await oncePromise(this, ['message', 'close', 'error']);
    switch (ev.type) {
      case 'message':
        yield ev.data;
        break;
      case 'close':
        const { reason, code } = ev;
        return { reason, code };

      case 'error':
        this.error = ev;
        throw new WebSocketError(`WebSocket error`, this);
        break;
    }
  }
}

export function WebSocketURL(arg = '/', query = {}) {
  const { protocol, origin } = window.location;
  let path = typeof arg == 'object' ? arg.pathname || arg.path || '' : arg;
  let url = new URL(path, origin.replace(/^http/, 'ws'));
  if(typeof arg == 'object') Object.assign(url, arg);
  for(let key in query) url.searchParams.set(key, query[key]);
  return url[path === '' ? 'origin' : 'href'];
}

export function CreateWebSocket(path = '/', protocols = []) {
  console.log('CreateWebSocket', { path, protocols });
  let ws = new WebSocket(path instanceof URL ? path : WebSocketURL(path), protocols);
  ws[Symbol.asyncIterator] = WebSocketIterator;
  return ws;
}

export async function* StreamReadIterator(strm) {
  let reader = await strm.getReader();

  do {
    let { done, value } = await reader.read();
    if(done) break;
    yield value;
  } while(true);

  await reader.releaseLock();
}

export class ReconnectingWebSocket {
  url = null;
  protocols = [];
  message = null;
  close = null;
  error = null;

  constructor(url = '/ws', protocols = [], handlers = {}) {
    this.url = WebSocketURL(url) + '';
    this.protocols = protocols;

    this.connect(handlers);
  }

  async connect(handlers = {}) {
    this.socket = CreateWebSocket(this.url, this.protocols);

    let ev = await oncePromise(this.socket, ['open', 'error']);

    if(ev.type == 'open') {
      if(handlers.onOpen) handlers.onOpen(ev);
      /*  lazyProperties(this, {
        writable: () =>
          new WritableStream({
            write: chunk => this.socket.send(chunk),
            close: () => this.socket.close(),
            abort: err => this.socket.close(err)
          }),
        readable: () =>
          new ReadableStream({
            start: async controller => {
              for await(let chunk of this) controller.enqueue(chunk);
            }
          })
      });*/
    }
    return ev;
  }

  get writable() {
    return new WritableStream({
      write: chunk => this.socket.send(chunk),
      close: () => this.socket.close(),
      abort: err => this.socket.close(err)
    });
  }

  get readable() {
    return new ReadableStream({
      start: async controller => {
        for await(let chunk of this) controller.enqueue(chunk);
      }
    });
  }

  async *[Symbol.asyncIterator]() {
    let ev;

    while((ev = await oncePromise(this.socket, ['message', 'close', 'error']))) {
      if(ev.type == 'message') {
        yield ev.data;
        continue;
      }

      const { type, reason, code } = ev;
      console.log('closed/error', { type, reason, code });

      await waitFor(type == 'error' ? 10000 : 250);

      let ret = await this.connect();
      console.log('reconnect', ret);
    }

    /*return {
      next: async () => {
        let msg = await this.message;
        console.log('msg',msg);
        this.message = oncePromise(this.socket, 'message');
        return { value: msg.data, done: false };
      }
    };*/
  }
}
