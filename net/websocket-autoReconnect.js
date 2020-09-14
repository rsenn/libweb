/**
 * WebSocket replacement class that automatically reconnects after abnormally closed connection,
 * send data queued and resent after connection established.
 * https://github.com/isometimesgit/WebSocketAutoReconnect/
 */

class WebSocketAutoReconnect {
  /**
   * Creates an instance of WebSocketAutoReconnect use insted of WebSocket
   * @param {url} - Websocket server Url
   * @param {number} [interval=4000] - interval in ms to reconnect url
   */
  constructor(url, interval = 4000) {
    this.interval = interval;
    this.timerId = null;
    this.queue = [];
    this._open(url);
  }

  /**
   * Called internally by constructor do not use
   */
  _open(url) {
    this.socket = new WebSocket(url);
    this.socket.onclose = evt => {
      if(!this.timerId && evt.code !== 1000) {
        // Ignore normal closure (1000)
        this.timerId = setTimeout(() => {
          this._connect(url);
        }, this.interval);
      }
      this.onclose(evt);
    };
    this.socket.onopen = evt => {
      while(this.queue.length) {
        this.socket.send(this.queue.pop());
      }
      this.onopen(evt);
    };
    this.socket.onerror = evt => {
      this.onerror(evt);
    };
    this.socket.onmessage = evt => {
      this.onmessage(evt);
    };
  }

  /**
   * Proxy method for WebSocket.send, data will be queued and resent on connection
   * @param {data} - data to send
   */
  send(data) {
    if(this.socket.readyState === this.socket.OPEN) {
      this.socket.send(data);
    } else {
      this.queue.push(data);
    }
  }

  /**
   * Proxy method for WebSocket.close, will disable auto reconnect
   */
  close(code, reason) {
    clearTimeout(this.timerId);
    this.timerId = -1;
    this.socket.close(code, reason);
  }

  /**
   * Proxy methods for WebSocket
   */
  onopen(evt) {}
  onerror(evt) {}
  onmessage(evt) {}
  onclose(evt) {}
}
