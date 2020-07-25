import Util from '../util.js';

/**
 * An asynchronous WebSocket client.
 * @example
 * // Set up connection.
 * const webSocketClient = new WebSocketClient;
 * // Connect.
 * await webSocketClient.connect('ws://www.example.com/');
 * // Send is synchronous.
 * webSocketClient.send('Hello!');
 * // Receive is asynchronous.
 * console.log(await webSocketClient.receive());
 * // See if there are any more messages received.
 * if(webSocketClient.dataAvailable !== 0) {
 *     console.log(await webSocketClient.receive());
 * }
 * // Close the connection.
 * await webSocketClient.disconnect();
 */
export class WebSocketClient {
  constructor(ctor) {
    this.reset();

    if(!ctor)
      ctor = Util.tryCatch(
        () => Util.isObject(window),
        () => window.WebSocket,
        null
      );

    if(ctor) Object.defineProperty(this, 'ctor', { value: ctor, enumerable: false });
  }

  /**
   * Whether a connection is currently open.
   * @returns true if the connection is open.
   */
  connect(url, protocols) {
    var ws = this;

    return this.disconnect().then(function() {
      ws.reset();

      ws.socket = new ws.ctor(url, protocols);
      ws.socket.binaryType = 'arraybuffer';
      return ws.setupListenersOnConnect();
    });
  }

  /**
   * Send data through the websocket.
   * Must be connected. See {@link #connected}.
   */

  send(data) {
    if(!this.connected) {
      throw this.closeEvent || new Error('Not connected.');
    }

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
    var ws = this;

    if(this.receiveDataQueue.length !== 0) {
      return Promise.resolve(this.receiveDataQueue.shift());
    }

    if(!this.connected) {
      return Promise.reject(this.closeEvent || new Error('Not connected.'));
    }

    var receivePromise = new Promise(function(resolve, reject) {
      ws.receiveCallbacksQueue.push({ resolve: resolve, reject: reject });
    });

    return receivePromise;
  }

  /**
   * Initiates the close handshake if there is an active connection.
   * Returns a promise that will never reject.
   * The promise resolves once the WebSocket connection is closed.
   */

  disconnect(code, reason) {
    var ws = this;

    if(!this.connected) {
      return Promise.resolve(this.closeEvent);
    }

    return new Promise(function(resolve, reject) {
      // It's okay to call resolve/reject multiple times in a promise.
      var callbacks = {
        resolve: function resolve(dummy) {
          // Make sure this object always stays in the queue
          // until callbacks.reject() (which is resolve) is called.
          ws.receiveCallbacksQueue.push(callbacks);
        },

        reject: resolve
      };

      ws.receiveCallbacksQueue.push(callbacks);
      // After this, we will imminently get a close event.
      // Therefore, this promise will resolve.
      ws.socket.close(code, reason);
    });
  }

  /**
   * Sets up the event listeners, which do the bulk of the work.
   * @private
   */

  setupListenersOnConnect() {
    var ws = this;

    var socket = this.socket;

    return new Promise(function(resolve, reject) {
      var handleMessage = function handleMessage(event) {
        var messageEvent = event;
        // The cast was necessary because Flow's libdef's don't contain
        // a MessageEventListener definition.

        if(ws.receiveCallbacksQueue.length !== 0) {
          ws.receiveCallbacksQueue.shift().resolve(messageEvent.data);
          return;
        }

        ws.receiveDataQueue.push(messageEvent.data);
      };

      var handleOpen = function handleOpen(event) {
        socket.addEventListener('message', handleMessage);
        socket.addEventListener('close', function(event) {
          ws.closeEvent = event;

          // Whenever a close event fires, the socket is effectively dead.
          // It's impossible for more messages to arrive.
          // If there are any promises waiting for messages, reject them.
          while(ws.receiveCallbacksQueue.length !== 0) {
            ws.receiveCallbacksQueue.shift().reject(ws.closeEvent);
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
    // Checking != null also checks against undefined.
    return this.socket != null && this.socket.readyState === this.ctor.OPEN;
  }

  /**
   * The number of messages available to receive.
   * @returns The number of queued messages that can be retrieved with {@link #receive}
   */

  get dataAvailable() {
    return this.receiveDataQueue.length;
  }
}

export default WebSocketClient;
