WebSocket.makeURL = WebSocketURL;

// Generate a Promise that listens only once for an event
const oncePromise = (emitter, events) => {
  if(!Array.isArray(events)) events = [events];

  return new Promise(resolve => {
    const handler = e => {
      for(let name of events) emitter.removeEventListener(name, handler);
      resolve(e);
    };
    for(let name of events) emitter.addEventListener(name, handler);
  });
};

export class WebSocketError extends Error {
  constructor(message, ws) {
    super(message);
    this.ws = ws;
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

  constructor(url = '/ws', protocols = []) {
    this.url = WebSocketURL(url) + '';
    this.protocols = protocols;

    this.connect();
  }

  async connect() {
    this.ws = CreateWebSocket(this.url, this.protocols);

    let ev = await oncePromise(this.ws, ['open', 'error']);

    if(ev.type == 'open') {
      /*  lazyProperties(this, {
        writable: () =>
          new WritableStream({
            write: chunk => this.ws.send(chunk),
            close: () => this.ws.close(),
            abort: err => this.ws.close(err)
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
      write: chunk => this.ws.send(chunk),
      close: () => this.ws.close(),
      abort: err => this.ws.close(err)
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

    while((ev = await oncePromise(this.ws, ['message', 'close', 'error']))) {
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
        this.message = oncePromise(this.ws, 'message');
        return { value: msg.data, done: false };
      }
    };*/
  }
}
