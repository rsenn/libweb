"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.WebSocketClient = void 0;

let _Symbol$asyncIterator;

_Symbol$asyncIterator = Symbol.asyncIterator;

class WebSocketClient {
  constructor() {
    this.receiveDataQueue = [];
    this.receiveCallbacksQueue = [];
    this.closeEvent = null;
  }

  connect(url, protocols) {
    return this.disconnect().then(() => {
      this.reset();
      this.socket = new WebSocket(url, protocols);
      this.socket.binaryType = 'arraybuffer';
      return this.setupListenersOnConnect();
    });
  }

  send(data) {
    if (!this.connected) {
      throw this.closeEvent || new Error('Not connected.');
    }

    this.socket.send(data);
  }

  receive() {
    if (this.receiveDataQueue.length !== 0) {
      return Promise.resolve(this.receiveDataQueue.shift());
    }

    if (!this.connected) {
      return Promise.reject(this.closeEvent || new Error('Not connected.'));
    }

    var receivePromise = new Promise((resolve, reject) => {
      this.receiveCallbacksQueue.push({
        resolve: resolve,
        reject: reject
      });
    });
    return receivePromise;
  }

  disconnect(code, reason) {
    if (!this.connected) {
      return Promise.resolve(this.closeEvent);
    }

    return new Promise((resolve, reject) => {
      var callbacks = {
        resolve: dummy => {
          this.receiveCallbacksQueue.push(callbacks);
        },
        reject: resolve
      };
      this.receiveCallbacksQueue.push(callbacks);
      this.socket.close(code, reason);
    });
  }

  setupListenersOnConnect() {
    var socket = this.socket;
    return new Promise((resolve, reject) => {
      var handleMessage = event => {
        var messageEvent = event;

        if (this.receiveCallbacksQueue.length !== 0) {
          this.receiveCallbacksQueue.shift().resolve(messageEvent.data);
          return;
        }

        this.receiveDataQueue.push(messageEvent.data);
      };

      var handleOpen = event => {
        socket.addEventListener('message', handleMessage);
        socket.addEventListener('close', event => {
          this.closeEvent = event;

          while (this.receiveCallbacksQueue.length !== 0) {
            this.receiveCallbacksQueue.shift().reject(this.closeEvent);
          }
        });
        resolve();
      };

      socket.addEventListener('error', reject);
      socket.addEventListener('open', handleOpen);
    });
  }

  reset() {
    this.receiveDataQueue = [];
    this.receiveCallbacksQueue = [];
    this.closeEvent = null;
  }

  get connected() {
    return this.socket != null && this.socket.readyState === WebSocket.OPEN;
  }

  get dataAvailable() {
    return this.receiveDataQueue.length;
  }

  async *[_Symbol$asyncIterator]() {
    while (this.readyState !== 3) {
      yield (await oncePromise(this.socket, 'message')).data;
    }
  }

}

exports.WebSocketClient = WebSocketClient;

function oncePromise(emitter, event) {
  return new Promise(resolve => {
    var handler = (...args) => {
      emitter.removeEventListener(event, handler);
      resolve(...args);
    };

    emitter.addEventListener(event, handler);
  });
}

var _default = WebSocketClient;
exports.default = _default;
