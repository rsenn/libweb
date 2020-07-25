import Util from './lib/util.js';
'use strict';

var has = Object.prototype.hasOwnProperty,
  prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
//We try to not inherit from `Object.prototype`. In some engines creating an
//instance in this way is faster than calling `Object.create(null)` directly.
//If `Object.create(null)` is not supported we prefix the event names with a
//character to make sure that the built-in object properties are not
//overridden or used as an attack vector.
//
if(Object.create) {
  Events.prototype = Object.create(null);

  //
  //This hack is needed because the `__proto__` property is still inherited in
  //some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if(!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {WeakEventEmitter} emitter Reference to the `WeakEventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {WeakEventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if(typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once),
    evt = prefix ? prefix + event : event;

  var _events = emitter._weakMap.get(emitter);
  if(!_events[evt]) (_events[evt] = listener), emitter._eventsCount++;
  else if(!_events[evt].fn) _events[evt].push(listener);
  else _events[evt] = [_events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {WeakEventEmitter} emitter Reference to the `WeakEventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if(--emitter._eventsCount === 0) {
    emitter._weakMap.set(emitter, new Events());
  } else {
    var _events = emitter._weakMap.get(emitter);
    delete _events[evt];
  }
}

/**
 * Minimal `WeakEventEmitter` interface that is molded against the Node.js
 * `WeakEventEmitter` interface.
 *
 * @constructor
 * @public
 */
export function WeakEventEmitter() {
  this._weakMap = new WeakMap();
  this._weakMap.set(this, new Events());

  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
WeakEventEmitter.prototype.eventNames = function eventNames() {
  var names = [],
    events,
    name;

  if(this._eventsCount === 0) return names;

  var _events = this._weakMap.get(this);
  for(name in (events = _events)) {
    if(has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if(Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
WeakEventEmitter.prototype.listeners = function listeners(event) {
  var _events = this._weakMap.get(this);

  var evt = prefix ? prefix + event : event,
    handlers = _events[evt];

  if(!handlers) return [];
  if(handlers.fn) return [handlers.fn];

  for(var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
WeakEventEmitter.prototype.listenerCount = function listenerCount(event) {
  var _events = this._weakMap.get(this);

  var evt = prefix ? prefix + event : event,
    listeners = _events[evt];

  if(!listeners) return 0;
  if(listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
WeakEventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  var _events = this._weakMap.get(this);
  if(!_events[evt]) return false;

  var listeners = _events[evt],
    len = arguments.length,
    args,
    i;

  if(listeners.fn) {
    if(listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1:
        return listeners.fn.call(listeners.context), true;
      case 2:
        return listeners.fn.call(listeners.context, a1), true;
      case 3:
        return listeners.fn.call(listeners.context, a1, a2), true;
      case 4:
        return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for(i = 1, args = new Array(len - 1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length,
      j;

    for(i = 0; i < length; i++) {
      if(listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1:
          listeners[i].fn.call(listeners[i].context);
          break;
        case 2:
          listeners[i].fn.call(listeners[i].context, a1);
          break;
        case 3:
          listeners[i].fn.call(listeners[i].context, a1, a2);
          break;
        case 4:
          listeners[i].fn.call(listeners[i].context, a1, a2, a3);
          break;
        default:
          if(!args)
            for(j = 1, args = new Array(len - 1); j < len; j++) {
              args[j - 1] = arguments[j];
            }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {WeakEventEmitter} `this`.
 * @public
 */
WeakEventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {WeakEventEmitter} `this`.
 * @public
 */
WeakEventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {WeakEventEmitter} `this`.
 * @public
 */
WeakEventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  var _events = this._weakMap.get(this);
  if(!_events[evt]) return this;
  if(!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = _events[evt];

  if(listeners.fn) {
    if(listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
      clearEvent(this, evt);
    }
  } else {
    for(var i = 0, events = [], length = listeners.length; i < length; i++) {
      if(listeners[i].fn !== fn || (once && !listeners[i].once) || (context && listeners[i].context !== context)) {
        events.push(listeners[i]);
      }
    }

    //
    //Reset the array, or remove it completely if we have no more listeners.
    //
    var _events = this._weakMap.get(this);
    if(events.length) _events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {WeakEventEmitter} `this`.
 * @public
 */
WeakEventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if(event) {
    evt = prefix ? prefix + event : event;
    var _events = this._weakMap.get(this);
    if(_events[evt]) clearEvent(this, evt);
  } else {
    this._weakMap.set(this, new Events());
    this._eventsCount = 0;
  }

  return this;
};

//
//Alias methods names because people roll like that.
//
WeakEventEmitter.prototype.off = WeakEventEmitter.prototype.removeListener;
WeakEventEmitter.prototype.addListener = WeakEventEmitter.prototype.on;

//
//Expose the prefix.
//
WeakEventEmitter.prefixed = prefix;

//
//Allow `WeakEventEmitter` to be imported as module namespace.
//
WeakEventEmitter.WeakEventEmitter = WeakEventEmitter;

//
//Expose the module.
//
if('undefined' !== typeof module) {
  module.exports = WeakEventEmitter;
}
