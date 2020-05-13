var _createClass = (function() {
  function defineProperties(target, props) {
    for(var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if(protoProps) defineProperties(Constructor.prototype, protoProps);
    if(staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if(!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

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
var WebSocketClient = (function() {
  function WebSocketClient() {
    _classCallCheck(this, WebSocketClient);

    this._reset();
  }

  /**
   * Whether a connection is currently open.
   * @returns true if the connection is open.
   */

  _createClass(WebSocketClient, [
    {
      key: "connect",

      /**
       * Sets up a WebSocket connection to specified url. Resolves when the
       * connection is established. Can be called again to reconnect to any url.
       */
      value: function connect(url, protocols) {
        var _this = this;

        return this.disconnect().then(function() {
          _this._reset();

          _this._socket = new WebSocket(url, protocols);
          _this._socket.binaryType = "arraybuffer";
          return _this._setupListenersOnConnect();
        });
      }

      /**
       * Send data through the websocket.
       * Must be connected. See {@link #connected}.
       */
    },
    {
      key: "send",
      value: function send(data) {
        if(!this.connected) {
          throw this._closeEvent || new Error("Not connected.");
        }

        this._socket.send(data);
      }

      /**
       * Asynchronously receive data from the websocket.
       * Resolves immediately if there is buffered, unreceived data.
       * Otherwise, resolves with the next rececived message,
       * or rejects if disconnected.
       * @returns A promise that resolves with the data received.
       */
    },
    {
      key: "receive",
      value: function receive() {
        var _this2 = this;

        if(this._receiveDataQueue.length !== 0) {
          return Promise.resolve(this._receiveDataQueue.shift());
        }

        if(!this.connected) {
          return Promise.reject(this._closeEvent || new Error("Not connected."));
        }

        var receivePromise = new Promise(function(resolve, reject) {
          _this2._receiveCallbacksQueue.push({ resolve: resolve, reject: reject });
        });

        return receivePromise;
      }

      /**
       * Initiates the close handshake if there is an active connection.
       * Returns a promise that will never reject.
       * The promise resolves once the WebSocket connection is closed.
       */
    },
    {
      key: "disconnect",
      value: function disconnect(code, reason) {
        var _this3 = this;

        if(!this.connected) {
          return Promise.resolve(this._closeEvent);
        }

        return new Promise(function(resolve, reject) {
          // It's okay to call resolve/reject multiple times in a promise.
          var callbacks = {
            resolve: function resolve(dummy) {
              // Make sure this object always stays in the queue
              // until callbacks.reject() (which is resolve) is called.
              _this3._receiveCallbacksQueue.push(callbacks);
            },

            reject: resolve
          };

          _this3._receiveCallbacksQueue.push(callbacks);
          // After this, we will imminently get a close event.
          // Therefore, this promise will resolve.
          _this3._socket.close(code, reason);
        });
      }

      /**
       * Sets up the event listeners, which do the bulk of the work.
       * @private
       */
    },
    {
      key: "_setupListenersOnConnect",
      value: function _setupListenersOnConnect() {
        var _this4 = this;

        var socket = this._socket;

        return new Promise(function(resolve, reject) {
          var handleMessage = function handleMessage(event) {
            var messageEvent = event;
            // The cast was necessary because Flow's libdef's don't contain
            // a MessageEventListener definition.

            if(_this4._receiveCallbacksQueue.length !== 0) {
              _this4._receiveCallbacksQueue.shift().resolve(messageEvent.data);
              return;
            }

            _this4._receiveDataQueue.push(messageEvent.data);
          };

          var handleOpen = function handleOpen(event) {
            socket.addEventListener("message", handleMessage);
            socket.addEventListener("close", function(event) {
              _this4._closeEvent = event;

              // Whenever a close event fires, the socket is effectively dead.
              // It's impossible for more messages to arrive.
              // If there are any promises waiting for messages, reject them.
              while(_this4._receiveCallbacksQueue.length !== 0) {
                _this4._receiveCallbacksQueue.shift().reject(_this4._closeEvent);
              }
            });
            resolve();
          };

          socket.addEventListener("error", reject);
          socket.addEventListener("open", handleOpen);
        });
      }

      /**
       * @private
       */
    },
    {
      key: "_reset",
      value: function _reset() {
        this._receiveDataQueue = [];
        this._receiveCallbacksQueue = [];
        this._closeEvent = null;
      }
    },
    {
      key: "connected",
      get: function get() {
        // Checking != null also checks against undefined.
        return this._socket != null && this._socket.readyState === WebSocket.OPEN;
      }

      /**
       * The number of messages available to receive.
       * @returns The number of queued messages that can be retrieved with {@link #receive}
       */
    },
    {
      key: "dataAvailable",
      get: function get() {
        return this._receiveDataQueue.length;
      }
    }
  ]);

  return WebSocketClient;
})();

export default WebSocketClient;
