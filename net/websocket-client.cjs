"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.WebSocketClient = void 0;

class WebSocketClient {
  constructor(ctor) {
    this._reset();

    Object.defineProperty(this, 'ctor', {
      value: ctor,
      enumerable: false
    });
  }

  get connected() {
    return this._socket != null && this._socket.readyState === this.ctor.OPEN;
  }

  get dataAvailable() {
    return this._receiveDataQueue.length;
  }

  connect(url, protocols) {
    var ws = this;
    return this.disconnect().then(function () {
      ws._reset();

      ws._socket = new ws.ctor(url, protocols);
      ws._socket.binaryType = 'arraybuffer';
      return ws._setupListenersOnConnect();
    });
  }

  send(data) {
    if (!this.connected) {
      throw this._closeEvent || new Error('Not connected.');
    }

    this._socket.send(data);
  }

  receive() {
    var ws = this;

    if (this._receiveDataQueue.length !== 0) {
      return Promise.resolve(this._receiveDataQueue.shift());
    }

    if (!this.connected) {
      return Promise.reject(this._closeEvent || new Error('Not connected.'));
    }

    var receivePromise = new Promise(function (resolve, reject) {
      ws._receiveCallbacksQueue.push({
        resolve: resolve,
        reject: reject
      });
    });
    return receivePromise;
  }

  disconnect(code, reason) {
    var ws = this;

    if (!this.connected) {
      return Promise.resolve(this._closeEvent);
    }

    return new Promise(function (resolve, reject) {
      var callbacks = {
        resolve: function (dummy) {
          ws._receiveCallbacksQueue.push(callbacks);
        },
        reject: resolve
      };

      ws._receiveCallbacksQueue.push(callbacks);

      ws._socket.close(code, reason);
    });
  }

  _setupListenersOnConnect() {
    var ws = this;
    var socket = this._socket;
    return new Promise(function (resolve, reject) {
      var handleMessage = function (event) {
        var messageEvent = function (event) {
          return;
        };

        if (ws._receiveCallbacksQueue.length !== 0) {
          ws._receiveCallbacksQueue.shift().resolve(messageEvent.data);

          return;
        }

        ws._receiveDataQueue.push(messageEvent.data);
      };

      var handleOpen = function (event) {
        socket.addEventListener('message', handleMessage);
        socket.addEventListener('close', function (event) {
          ws._closeEvent = function (event) {
            return;
          };

          while (ws._receiveCallbacksQueue.length !== 0) {
            ws._receiveCallbacksQueue.shift().reject(ws._closeEvent);
          }
        });
        resolve();
      };

      socket.addEventListener('error', reject);
      socket.addEventListener('open', handleOpen);
    });
  }

  _reset() {
    this._receiveDataQueue = [];
    this._receiveCallbacksQueue = [];
    this._closeEvent = null;
  }

}

exports.WebSocketClient = WebSocketClient;
var _default = WebSocketClient;
exports.default = _default;
