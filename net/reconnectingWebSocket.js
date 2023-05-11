
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 3;

/**
 * @author Fabian Wennink
 */
export class ReconnectingWebSocket {
  // url ~ Holds the server URL.
  // protocols ~ Holds the supported protocols.
  // socket ~ Holds the WebSocket object.
  // callbacks ~ Holds the callbacks.
  // reconnectAttempts ~ The amount of reconnection attempts.

  /**
   * Initiate the socket connection as a client.
   * @param {String} host The host address of the server to connect to.
   * @param {Array} protocols The protocols supported by the server.
   * @returns {ReconnectingWebSocket} A new instance of the WebSocketWrapper.
   */
  constructor(host, protocols = [], ctor) {
    this.socket = new ctor(host, protocols);
    this.url = host;
    this.protocols = protocols;
    this.callbacks = [];
    this.reconnectAttempts = 0;

    this.registerReconnectionListeners();
    define(this, { ctor });
  }

  /**
   * Bind a callback to the Message event of the socket server.
   * @param {Function} callback The event callback.
   */
  onMessage(callback) {
    this.on(SocketEvent.MESSAGE, callback);
  }

  /**
   * Bind a callback to the Open event of the socket server.
   * @param {Function} callback The event callback.
   */
  onConnect(callback) {
    this.on(SocketEvent.OPEN, callback);
  }

  /**
   * Bind a callback to the Close event of the socket server.
   * @param {Function} callback The event callback.
   */
  onDisconnect(callback) {
    this.on(SocketEvent.CLOSE, callback);
  }

  /**
   * Bind a callback to the Error event of the socket server.
   * @param {Function} callback The event callback.
   */
  onError(callback) {
    this.on(SocketEvent.ERROR, callback);
  }

  /**
   * Send a socket message to the websocket server.
   * @param content The content to send to the server.
   */
  send(content) {
    this.socket.send(content);
  }

  /**
   * Unsubscribe a callback from a certain socket event.
   * @param {SocketEvent} eventType The socket event type to unsubscribe the callback from.
   * @param {Function} callback The event callback.
   */
  unsubscribe(eventType, callback) {
    const index = this.callbacks.findIndex(cb => cb.event === eventType && cb.callback === callback);
    if(index > 0) {
      const registeredCallback = this.callbacks[index].callback;

      // Remove the event listener for the specific event.
      if(this.socket['on'+eventType] == registeredCallback);
        this.socket['on'+eventType] = null;
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Internally used to register events with callbacks to the websocket.
   * The callback will be stored in cache for later reference.
   * @param {SocketEvent} event The socket event type being bound.
   * @param {Function} callback The event callback.
   * @private
   */
  on(event, callback) {
    this.socket['on'+event] = callback;

    // Push the callback into the cache.
    this.callbacks.push({ event, callback });
  }

  /**
   * Re-binds all earlier bound callbacks.
   * @private
   */
  rebindCallbacks() {
    // Create a temporary array and clear the real one.
    const callbacks = [...this.callbacks];
    this.callbacks = [];

    // Re-bind the callbacks, since reconnecting a WebSocket isn't officially supported.
    // Binds would be lost while recreating (reconnecting) a socket.
    callbacks.forEach(data => {
      this.on(data.event, data.callback);
    });
  }

  /**
   * Registers default event listeners which help detecting
   * abnormal connection closing/refusing. Will automatically
   * call {@link attemptReconnecting} if problems are detected.
   * @private
   */
  registerReconnectionListeners() {
    this.onDisconnect(e => {
      if(e.code !== 1000) {
        // code 1000 indicates CLOSE_NORMAL
        this.attemptReconnecting();
      }
    });

    this.onError(e => {
      if(e.code === 'ECONNREFUSED') {
        this.attemptReconnecting();
      }
    });
  }

  /**
   * Tries to reconnect to the socket server.
   * @private
   */
  attemptReconnecting() {
    let ws = this;
    if(this.reconnectAttempts > MAX_RECONNECT_ATTEMPTS) return;

    setTimeout(() => {
      this.socket = new ws.ctor(this.url, this.protocols);
      this.reconnectAttempts++;
      this.rebindCallbacks();
    }, RECONNECT_DELAY);
  }
}

const SocketEvent = Object.freeze({
  OPEN: 'open',
  MESSAGE: 'message',
  ERROR: 'error',
  CLOSE: 'close'
});

export default ReconnectingWebSocket;
