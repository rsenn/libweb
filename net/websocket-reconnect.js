/*
 * It provides a abstraction layer over native javascript Websocket.
 *
 * Provide additional functionality like if connection is close, open
 * it again and process the buffered requests
 *
 * Usage:
 *
 * ReconnectSocket.init() // initial connection
 * ReconnectSocket.send({sample: "key"}), ReconnectSocket.send("plain message") // send your data
 * ReconnectSocket.close() // close the connection
 * ReconnectSocket.clear() // clear buffer if you want to instantiate new connection
 */

let ReconnectSocket = (function () {
  let socket,
    socketUrl = '',
    bufferedSends = [],
    isJSON = 0; // flag to indicate whether you send JSON message

  let status = function () {
    return socket && socket.readyState;
  };

  let isReady = function () {
    return socket && socket.readyState === 1;
  };

  let isClose = function () {
    return !socket || socket.readyState === 3;
  };

  let sendBufferedSends = function () {
    while(bufferedSends.length > 0) {
      if(isJSON) {
        socket.send(JSON.stringify(bufferedSends.shift()));
      } else {
        socket.send(bufferedSends.shift());
      }
    }
  };

  let init = function () {
    if(isClose()) {
      socket = new WebSocket(socketUrl);
    }

    socket.onopen = function () {
      sendBufferedSends();
    };

    // implement your server response handling here
    socket.onmessage = function (msg) {
      console.log(msg);
    };

    socket.onclose = function (e) {
      console.log('socket closed', e);
    };

    socket.onerror = function (error) {
      console.log('socket error', error);
    };
  };

  let send = function (data) {
    // check if its close then initilaize again
    if(isClose()) {
      bufferedSends.push(data);
      init();
    } else if(isReady()) {
      if(isJSON) {
        socket.send(JSON.stringify(data));
      } else {
        socket.send(data);
      }
    } else {
      bufferedSends.push(data);
    }
  };

  let close = function () {
    bufferedSends = [];
    if(socket) {
      socket.close();
    }
  };

  let clear = function () {
    bufferedSends = [];
  };

  return {
    init,
    send,
    close,
    clear
  };
})();
