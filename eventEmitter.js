// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
import Util from './util.js';

export function EventEmitter() {
  this.events = this.events || {};
  this.maxListeners = this.maxListeners || undefined;
}

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype.events = undefined;
EventEmitter.prototype.maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function (n) {
  if (!Util.isNumber(n) || n < 0 || Util.isNaN(n))
    throw TypeError('n must be a positive number');
  this.maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function (...argList) {
  //console.log("emit(", ...argList, ")");
  const [type] = argList;
  let er, handler, len, args, i, listeners;

  if (!this.events) this.events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (
      !this.events.error ||
      (isObject(this.events.error) && !this.events.error.length)
    ) {
      er = argList[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        let err = new Error(
          'Uncaught, unspecified "error" event. (' + er + ')'
        );
        err.context = er;
        throw err;
      }
    }
  }

  handler = this.events[type];
  //console.debug("Handler:", handler);

  if (isUndefined(handler)) return false;

  if (Util.isFunction(handler)) {
    switch (argList.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, argList[1]);
        break;
      case 3:
        handler.call(this, argList[1], argList[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(argList, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(argList, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++) listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function (type, listener) {
  let m;

  if (!Util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this.events) this.events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this.events.newListener)
    this.emit(
      'newListener',
      type,
      Util.isFunction(listener.listener) ? listener.listener : listener
    );
  //console.debug('this.events:', this.events);

  //  if(this.events[type]) console.debug('Util.keys(this.events[type]):', Util.getMemberNames(this.events[type], Infinity, 0));
  //console.debug('type:', type);
  if (!this.events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this.events[type] = listener;
  else if (isObject(this.events[type]))
    // If we've already got an array, just append.
    this.events[type].push(listener);
  // Adding the second element, need to change to array.
  else this.events[type] = [this.events[type], listener];

  // Check for listener leak
  if (isObject(this.events[type]) && !this.events[type].warned) {
    if (!isUndefined(this.maxListeners)) {
      m = this.maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this.events[type].length > m) {
      this.events[type].warned = true;
      console.error(
        '(node) warning: possible EventEmitter memory ' +
          'leak detected. %d listeners added. ' +
          'Use emitter.setMaxListeners() to increase limit.',
        this.events[type].length
      );
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }
  //console.debug('this.events[type]:', this.events[type]);

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function (type, listener) {
  if (!Util.isFunction(listener))
    throw TypeError('listener must be a function');

  let fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function (type, listener) {
  let list, position, length, i;

  if (!Util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this.events || !this.events[type]) return this;

  list = this.events[type];
  length = list.length;
  position = -1;

  if (
    list === listener ||
    (Util.isFunction(list.listener) && list.listener === listener)
  ) {
    delete this.events[type];
    if (this.events.removeListener) this.emit('removeListener', type, listener);
  } else if (isObject(list)) {
    for (i = length; i-- > 0; ) {
      if (
        list[i] === listener ||
        (list[i].listener && list[i].listener === listener)
      ) {
        position = i;
        break;
      }
    }

    if (position < 0) return this;

    if (list.length === 1) {
      list.length = 0;
      delete this.events[type];
    } else {
      list.splice(position, 1);
    }

    if (this.events.removeListener) this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
  let key, listeners;

  if (!this.events) return this;

  // not listening for removeListener, no need to emit
  if (!this.events.removeListener) {
    if (arguments.length === 0) this.events = {};
    else if (this.events[type]) delete this.events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this.events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this.events = {};
    return this;
  }

  listeners = this.events[type];

  if (Util.isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this.events[type];

  return this;
};

EventEmitter.prototype.listeners = function (type) {
  let ret;
  if (!this.events || !this.events[type]) ret = [];
  else if (Util.isFunction(this.events[type])) ret = [this.events[type]];
  else ret = this.events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function (type) {
  if (this.events) {
    let evlistener = this.events[type];

    if (Util.isFunction(evlistener)) return 1;
    else if (evlistener) return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function (emitter, type) {
  return emitter.listenerCount(type);
};

function isObject(arg) {
  return typeof arg == 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

export default EventEmitter;
