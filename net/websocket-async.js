/**
 * An asynchronous WebSocket client.
 * @example
 *  //Set up connection.
 * const webSocketClient = new WebSocketClient;
 *  //Connect.
 * await webSocketClient.connect('ws://www.example.com/');
 *  //Send is synchronous.
 * webSocketClient.send('Hello!');
 *  //Receive is asynchronous.
 * console.log(await webSocketClient.receive());
 *  //See if there are any more messages received.
 * if(webSocketClient.dataAvailable !== 0) {
 *     console.log(await webSocketClient.receive());
 * }
 *  //Close the connection.
 * await webSocketClient.disconnect();
 */
export class WebSocketClient {
  /*receiveDataQueue = [];
  receiveCallbacksQueue = [];
  closeEvent = null;*/

  constructor(ctor = globalThis.WebSocket) {
    this.reset();

    Object.defineProperties(
      this,
      [
        ['ctor', ctor],
        ['receiveDataQueue', []],
        ['receiveCallbacksQueue', []],
        ['closeEvent', null]
      ].reduce(
        (acc, [name, value]) => ({
          ...acc,
          [name]: { value, enumerable: false }
        }),
        {}
      )
    );
  }

  /**
   * Whether a connection is currently open.
   * @returns true if the connection is open.
   */

  /**
   * Sets up a WebSocket connection to specified url. Resolves when the
   * connection is established. Can be called again to reconnect to any url.
   */
  connect(url, protocols) {
    let ws = this;
    return this.disconnect().then(() => {
      this.reset();

      this.socket = new ws.ctor(url, protocols);
      this.socket.binaryType = 'arraybuffer';
      return this.setupListenersOnConnect();
    });
  }

  /**
   * Send data through the websocket.
   * Must be connected. See {@link #connected}.
   */
  send(data) {
    if(!this.connected) throw this.closeEvent || new Error('Not connected.');

    this.socket.send(data);
  }

  /**
   * Asynchronously receive data from the websocket.
   * Resolves immediately if there is buffered, unreceived data.
   * Otherwise, resolves with the next rececived message,
   * or rejects if disconnected.
   * @returns A promise that resolves with the data received.
   */
  receive() {
    if(this.receiveDataQueue.length !== 0) return Promise.resolve(this.receiveDataQueue.shift());

    if(!this.connected) return Promise.reject(this.closeEvent || new Error('Not connected.'));

    const receivePromise = new Promise((resolve, reject) => this.receiveCallbacksQueue.push({ resolve, reject }));

    return receivePromise;
  }

  /**
   * Initiates the close handshake if there is an active connection.
   * Returns a promise that will never reject.
   * The promise resolves once the WebSocket connection is closed.
   */
  disconnect(code, reason) {
    if(!this.connected) return Promise.resolve(this.closeEvent);

    return new Promise((resolve, reject) => {
      //It's okay to call resolve/reject multiple times in a promise.
      const callbacks = {
        resolve: dummy => {
          //Make sure this object always stays in the queue
          //until callbacks.reject() (which is resolve) is called.
          this.receiveCallbacksQueue.push(callbacks);
        },

        reject: resolve
      };

      this.receiveCallbacksQueue.push(callbacks);
      //After this, we will imminently get a close event.
      //Therefore, this promise will resolve.
      this.socket.close(code, reason);
    });
  }

  /**
   * Sets up the event listeners, which do the bulk of the work.
   * @private
   */
  setupListenersOnConnect() {
    const { socket } = this;

    return new Promise((resolve, reject) => {
      const handleMessage = event => {
        const messageEvent = event;
        //The cast was necessary because Flow's libdef's don't contain
        //a MessageEventListener definition.

        if(this.receiveCallbacksQueue.length !== 0) {
          this.receiveCallbacksQueue.shift().resolve(messageEvent.data);
          return;
        }

        this.receiveDataQueue.push(messageEvent.data);
      };

      const handleOpen = event => {
        socket.addEventListener('message', handleMessage);
        socket.addEventListener('close', event => {
          this.closeEvent = event;

          //Whenever a close event fires, the socket is effectively dead.
          //It's impossible for more messages to arrive.
          //If there are any promises waiting for messages, reject them.
          while(this.receiveCallbacksQueue.length !== 0) {
            this.receiveCallbacksQueue.shift().reject(this.closeEvent);
          }
        });
        resolve();
      };

      socket.addEventListener('error', reject);
      socket.addEventListener('open', handleOpen);
    });
  }

  /**
   * @private
   */
  reset() {
    this.receiveDataQueue = [];
    this.receiveCallbacksQueue = [];
    this.closeEvent = null;
  }

  get connected() {
    const { socket, ctor } = this;
    //Checking != null also checks against undefined.
    return socket != null && socket.readyState === ctor.OPEN;
  }

  /**
   * The number of messages available to receive.
   * @returns The number of queued messages that can be retrieved with {@link #receive}
   */
  get dataAvailable() {
    return this.receiveDataQueue.length;
  }

  async *[Symbol.asyncIterator]() {
    while(this.readyState !== 3) yield await oncePromise(this.socket, 'message', 'close', 'error');
    //    yield (await oncePromise(this.socket, 'close', 'error'));
  }
}

//Generate a Promise that listens only once for an event
function oncePromise(emitter, ...events) {
  return new Promise(resolve => {
    const handler = (...args) => {
      events.map(event => emitter.removeEventListener(event, handler));
      resolve(...args);
    };
    events.map(event => emitter.addEventListener(event, handler));
  });
}

export default WebSocketClient;
