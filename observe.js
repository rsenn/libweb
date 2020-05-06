"use strict";

/*
The properties of these change object are:
name: The name of the property which was changed.
object: The changed object after the change was made.
type: A string indicating the type of change taking place.
oldValue: Only for "update" and "delete" types. The value before the change.
*/

const change = { name, object, type, oldValue };

export class Observe {
  constructor(target, fn = callback(change), ...acceptList) {
    //The function called each time changes are made
    this.fn = fn;

    //The list of types of changes to be observed on the given object for the given callback.
    //Default ["add", "update", "delete", "reconfigure", "setPrototype", "preventExtensions"]
    this.acceptList = acceptList;

    if(!this.acceptList) {
      return new Proxy(target, this);
    }
  }

  get(target, key, context) {
    if(Reflect.has(target, key)) {
      this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: "get" }]);
      return Reflect.get(target, key, context);
    } else {
      throw new ReferenceError(`${key} doesnt exist`);
    }
  }

  set(target, key, value, context) {
    if(Reflect.has(target, key)) {
      this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: "update", oldValue: target[key] }]);
      return Reflect.set(target, key, value, context);
    } else {
      this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: "add" }]);
      return Reflect.set(target, key, value, context);
    }
  }

  deleteProperty(target, key) {
    this.fn.apply(this, [{ name: key, object: JSON.stringify(target), type: "delete", oldValue: target[key] }]);
    return Reflect.deleteProperty(target, key);
  }

  defineProperty(target, key, desc) {
    this.fn.apply(this, [
      {
        name: key,
        object: JSON.stringify(target),
        type: "reconfigure",
        descriptor: JSON.stringify(desc)
      }
    ]);
    return Reflect.defineProperty(target, key, desc);
  }

  setPrototypeOf(target, proto) {
    this.fn.apply(this, [
      {
        name: JSON.stringify(proto),
        object: JSON.stringify(target),
        type: "setPrototype",
        oldValue: JSON.stringify(target)
      }
    ]);
    return Reflect.setPrototypeOf(target, proto);
  }
}

Reflect.defineProperty(Observe.prototype, Symbol.toStringTag, {
  configurable: false,
  writable: false,
  enumerable: false,
  value: "Observe"
});
