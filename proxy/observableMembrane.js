/**
 * Copyright (C) 2017
 * salesforce.com, inc.
 */
import Util from '../util.js';

const { isArray } = Array;
const { getPrototypeOf, create: ObjectCreate, /* defineProperty: ObjectDefineProperty,*/ defineProperties: ObjectDefineProperties, isExtensible, getOwnPropertyDescriptor, getOwnPropertyNames, getOwnPropertySymbols, preventExtensions, hasOwnProperty } = Object;
const ObjectDefineProperty = Util.define;

const { push: ArrayPush, concat: ArrayConcat, map: ArrayMap } = Array.prototype;
const OtS = {}.toString;

function toString(obj) {
  if(obj && obj.toString) {
    return obj.toString();
  } else if(typeof obj === 'object') {
    return OtS.call(obj);
  }
  return obj + '';
}

function isUndefined(obj) {
  return obj === undefined;
}

function isFunction(obj) {
  return typeof obj === 'function';
}

const proxyToValueMap = new WeakMap();
function registerProxy(proxy, value) {
  proxyToValueMap.set(proxy, value);
}

const unwrap = replicaOrAny => proxyToValueMap.get(replicaOrAny) || replicaOrAny;

class BaseProxyHandler {
  constructor(membrane, value) {
    this.originalTarget = value;
    this.membrane = membrane;
  }

  //Shared utility methods
  wrapDescriptor(descriptor) {
    if(hasOwnProperty.call(descriptor, 'value')) {
      descriptor.value = this.wrapValue(descriptor.value);
    } else {
      const { set: originalSet, get: originalGet } = descriptor;
      if(!isUndefined(originalGet)) {
        descriptor.get = this.wrapGetter(originalGet);
      }
      if(!isUndefined(originalSet)) {
        descriptor.set = this.wrapSetter(originalSet);
      }
    }

    return descriptor;
  }

  copyDescriptorIntoShadowTarget(shadowTarget, key) {
    const { originalTarget } = this;
    //Note: a property might get defined multiple times in the shadowTarget
    //but it will always be compatible with the previous descriptor
    //to preserve the object invariants, which makes these lines safe.
    const originalDescriptor = getOwnPropertyDescriptor(originalTarget, key);
    if(!isUndefined(originalDescriptor)) {
      const wrappedDesc = this.wrapDescriptor(originalDescriptor);
      ObjectDefineProperty(shadowTarget, key, wrappedDesc);
    }
  }

  lockShadowTarget(shadowTarget) {
    const { originalTarget } = this;
    const targetKeys = ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
    targetKeys.forEach(key => {
      this.copyDescriptorIntoShadowTarget(shadowTarget, key);
    });
    const {
      membrane: { tagPropertyKey }
    } = this;
    if(!isUndefined(tagPropertyKey) && !hasOwnProperty.call(shadowTarget, tagPropertyKey)) {
      ObjectDefineProperty(shadowTarget, tagPropertyKey, ObjectCreate(null));
    }
    preventExtensions(shadowTarget);
  }

  //Shared Traps
  apply(shadowTarget, thisArg, argArray) {
    /* No op */
  }

  construct(shadowTarget, argArray, newTarget) {
    /* No op */
  }

  get(shadowTarget, key) {
    const {
      originalTarget,
      membrane: { valueObserved }
    } = this;
    const value = originalTarget[key];
    valueObserved(originalTarget, key);
    return this.wrapValue(value);
  }

  has(shadowTarget, key) {
    const {
      originalTarget,
      membrane: { tagPropertyKey, valueObserved }
    } = this;
    valueObserved(originalTarget, key);
    //since key is never going to be undefined, and tagPropertyKey might be undefined
    //we can simply compare them as the second part of the condition.
    return key in originalTarget || key === tagPropertyKey;
  }

  ownKeys(shadowTarget) {
    const {
      originalTarget,
      membrane: { tagPropertyKey }
    } = this;
    //if the membrane tag key exists and it is not in the original target, we add it to the keys.
    const keys = isUndefined(tagPropertyKey) || hasOwnProperty.call(originalTarget, tagPropertyKey) ? [] : [tagPropertyKey];
    //small perf optimization using push instead of concat to avoid creating an extra array
    ArrayPush.apply(keys, getOwnPropertyNames(originalTarget));
    ArrayPush.apply(keys, getOwnPropertySymbols(originalTarget));
    return keys;
  }

  isExtensible(shadowTarget) {
    const { originalTarget } = this;
    //optimization to avoid attempting to lock down the shadowTarget multiple times
    if(!isExtensible(shadowTarget)) {
      return false; //was already locked down
    }

    if(!isExtensible(originalTarget)) {
      this.lockShadowTarget(shadowTarget);
      return false;
    }

    return true;
  }

  getPrototypeOf(shadowTarget) {
    const { originalTarget } = this;
    return getPrototypeOf(originalTarget);
  }

  getOwnPropertyDescriptor(shadowTarget, key) {
    const {
      originalTarget,
      membrane: { valueObserved, tagPropertyKey }
    } = this;
    //keys looked up via getOwnPropertyDescriptor need to be reactive
    valueObserved(originalTarget, key);
    let desc = getOwnPropertyDescriptor(originalTarget, key);
    if(isUndefined(desc)) {
      if(key !== tagPropertyKey) {
        return undefined;
      }

      //if the key is the membrane tag key, and is not in the original target,
      //we produce a synthetic descriptor and install it on the shadow target
      desc = {
        value: undefined,
        writable: false,
        configurable: false,
        enumerable: false
      };
      ObjectDefineProperty(shadowTarget, tagPropertyKey, desc);
      return desc;
    }

    if(desc.configurable === false) {
      //updating the descriptor to non-configurable on the shadow
      this.copyDescriptorIntoShadowTarget(shadowTarget, key);
    }

    //Note: by accessing the descriptor, the key is marked as observed
    //but access to the value, setter or getter (if available) cannot observe
    //mutations, just like regular methods, in which case we just do nothing.
    return this.wrapDescriptor(desc);
  }
}

const getterMap = new WeakMap();
const setterMap = new WeakMap();
const reverseGetterMap = new WeakMap();
const reverseSetterMap = new WeakMap();

class ReactiveProxyHandler extends BaseProxyHandler {
  wrapValue(value) {
    return this.membrane.getProxy(value);
  }

  wrapGetter(originalGet) {
    const wrappedGetter = getterMap.get(originalGet);
    if(!isUndefined(wrappedGetter)) {
      return wrappedGetter;
    }

    const handler = this;
    const get = function() {
      //invoking the original getter with the original target
      return handler.wrapValue(originalGet.call(unwrap(this)));
    };
    getterMap.set(originalGet, get);
    reverseGetterMap.set(get, originalGet);
    return get;
  }

  wrapSetter(originalSet) {
    const wrappedSetter = setterMap.get(originalSet);
    if(!isUndefined(wrappedSetter)) {
      return wrappedSetter;
    }

    const set = function(v) {
      //invoking the original setter with the original target
      originalSet.call(unwrap(this), unwrap(v));
    };
    setterMap.set(originalSet, set);
    reverseSetterMap.set(set, originalSet);
    return set;
  }

  unwrapDescriptor(descriptor) {
    if(hasOwnProperty.call(descriptor, 'value')) {
      //dealing with a data descriptor
      descriptor.value = unwrap(descriptor.value);
    } else {
      const { set, get } = descriptor;
      if(!isUndefined(get)) {
        descriptor.get = this.unwrapGetter(get);
      }

      if(!isUndefined(set)) {
        descriptor.set = this.unwrapSetter(set);
      }
    }

    return descriptor;
  }

  unwrapGetter(redGet) {
    const reverseGetter = reverseGetterMap.get(redGet);
    if(!isUndefined(reverseGetter)) {
      return reverseGetter;
    }

    const handler = this;
    const get = function() {
      //invoking the red getter with the proxy of this
      return unwrap(redGet.call(handler.wrapValue(this)));
    };
    getterMap.set(get, redGet);
    reverseGetterMap.set(redGet, get);
    return get;
  }

  unwrapSetter(redSet) {
    const reverseSetter = reverseSetterMap.get(redSet);
    if(!isUndefined(reverseSetter)) {
      return reverseSetter;
    }

    const handler = this;
    const set = function(v) {
      //invoking the red setter with the proxy of this
      redSet.call(handler.wrapValue(this), handler.wrapValue(v));
    };
    setterMap.set(set, redSet);
    reverseSetterMap.set(redSet, set);
    return set;
  }

  set(shadowTarget, key, value) {
    const {
      originalTarget,
      membrane: { valueMutated }
    } = this;
    const oldValue = originalTarget[key];
    if(oldValue !== value) {
      originalTarget[key] = value;
      valueMutated(originalTarget, key);
    } else if(key === 'length' && isArray(originalTarget)) {
      //fix for issue #236: push will add the new index, and by the time length
      //is updated, the internal length is already equal to the new length value
      //therefore, the oldValue is equal to the value. This is the forking logic
      //to support this use case.
      valueMutated(originalTarget, key);
    }

    return true;
  }

  deleteProperty(shadowTarget, key) {
    const {
      originalTarget,
      membrane: { valueMutated }
    } = this;
    delete originalTarget[key];
    valueMutated(originalTarget, key);
    return true;
  }

  setPrototypeOf(shadowTarget, prototype) {
    if(
      Util.tryCatch(
        () => process,
        process => process.env.NODE_ENV !== 'production'
      )
    ) {
      throw new Error(`Invalid setPrototypeOf invocation for reactive proxy ${toString(this.originalTarget)}. Prototype of reactive objects cannot be changed.`);
    }
  }

  preventExtensions(shadowTarget) {
    if(isExtensible(shadowTarget)) {
      const { originalTarget } = this;
      preventExtensions(originalTarget);
      //if the originalTarget is a proxy itself, it might reject
      //the preventExtension call, in which case we should not attempt to lock down
      //the shadow target.
      if(isExtensible(originalTarget)) {
        return false;
      }

      this.lockShadowTarget(shadowTarget);
    }

    return true;
  }

  defineProperty(shadowTarget, key, descriptor) {
    const {
      originalTarget,
      membrane: { valueMutated, tagPropertyKey }
    } = this;
    if(key === tagPropertyKey && !hasOwnProperty.call(originalTarget, key)) {
      //To avoid leaking the membrane tag property into the original target, we must
      //be sure that the original target doesn't have yet.
      //NOTE: we do not return false here because Object.freeze and equivalent operations
      //will attempt to set the descriptor to the same value, and expect no to throw. This
      //is an small compromise for the sake of not having to diff the descriptors.
      return true;
    }

    ObjectDefineProperty(originalTarget, key, this.unwrapDescriptor(descriptor));
    //intentionally testing if false since it could be undefined as well
    if(descriptor.configurable === false) {
      this.copyDescriptorIntoShadowTarget(shadowTarget, key);
    }

    valueMutated(originalTarget, key);
    return true;
  }
}

const getterMap$1 = new WeakMap();
const setterMap$1 = new WeakMap();

class ReadOnlyHandler extends BaseProxyHandler {
  wrapValue(value) {
    return this.membrane.getReadOnlyProxy(value);
  }

  wrapGetter(originalGet) {
    const wrappedGetter = getterMap$1.get(originalGet);
    if(!isUndefined(wrappedGetter)) {
      return wrappedGetter;
    }

    const handler = this;
    const get = function() {
      //invoking the original getter with the original target
      return handler.wrapValue(originalGet.call(unwrap(this)));
    };
    getterMap$1.set(originalGet, get);
    return get;
  }

  wrapSetter(originalSet) {
    const wrappedSetter = setterMap$1.get(originalSet);
    if(!isUndefined(wrappedSetter)) {
      return wrappedSetter;
    }

    const handler = this;
    const set = function(v) {
      if(
        Util.tryCatch(
          () => process,
          process => process.env.NODE_ENV !== 'production'
        )
      ) {
        const { originalTarget } = handler;
        throw new Error(`Invalid mutation: Cannot invoke a setter on "${originalTarget}". "${originalTarget}" is read-only.`);
      }
    };
    setterMap$1.set(originalSet, set);
    return set;
  }

  set(shadowTarget, key, value) {
    if(
      Util.tryCatch(
        () => process,
        process => process.env.NODE_ENV !== 'production'
      )
    ) {
      const { originalTarget } = this;
      throw new Error(`Invalid mutation: Cannot set "${key.toString()}" on "${originalTarget}". "${originalTarget}" is read-only.`);
    }

    return false;
  }

  deleteProperty(shadowTarget, key) {
    if(
      Util.tryCatch(
        () => process,
        process => process.env.NODE_ENV !== 'production'
      )
    ) {
      const { originalTarget } = this;
      throw new Error(`Invalid mutation: Cannot delete "${key.toString()}" on "${originalTarget}". "${originalTarget}" is read-only.`);
    }

    return false;
  }

  setPrototypeOf(shadowTarget, prototype) {
    if(
      Util.tryCatch(
        () => process,
        process => process.env.NODE_ENV !== 'production'
      )
    ) {
      const { originalTarget } = this;
      throw new Error(`Invalid prototype mutation: Cannot set prototype on "${originalTarget}". "${originalTarget}" prototype is read-only.`);
    }
  }

  preventExtensions(shadowTarget) {
    if(
      Util.tryCatch(
        () => process,
        process => process.env.NODE_ENV !== 'production'
      )
    ) {
      const { originalTarget } = this;
      throw new Error(`Invalid mutation: Cannot preventExtensions on ${originalTarget}". "${originalTarget} is read-only.`);
    }

    return false;
  }

  defineProperty(shadowTarget, key, descriptor) {
    if(
      Util.tryCatch(
        () => process,
        process => process.env.NODE_ENV !== 'production'
      )
    ) {
      const { originalTarget } = this;
      throw new Error(`Invalid mutation: Cannot defineProperty "${key.toString()}" on "${originalTarget}". "${originalTarget}" is read-only.`);
    }

    return false;
  }
}

function extract(objectOrArray) {
  if(isArray(objectOrArray)) {
    return objectOrArray.map(item => {
      const original = unwrap(item);
      if(original !== item) {
        return extract(original);
      }

      return item;
    });
  }

  const obj = ObjectCreate(getPrototypeOf(objectOrArray));
  const names = getOwnPropertyNames(objectOrArray);
  return ArrayConcat.call(names, getOwnPropertySymbols(objectOrArray)).reduce((seed, key) => {
    const item = objectOrArray[key];
    const original = unwrap(item);
    if(original !== item) {
      seed[key] = extract(original);
    } else {
      seed[key] = item;
    }

    return seed;
  }, obj);
}

const formatter = {
  header: plainOrProxy => {
    const originalTarget = unwrap(plainOrProxy);
    //if originalTarget is falsy or not unwrappable, exit
    if(!originalTarget || originalTarget === plainOrProxy) {
      return null;
    }

    const obj = extract(plainOrProxy);
    return ['object', { object: obj }];
  },
  hasBody: () => false,
  body: () => null
};

//Inspired from paulmillr/es6-shim
//https://github.com/paulmillr/es6-shim/blob/master/es6-shim.js#L176-L185
function getGlobal() {
  //the only reliable means to get the global object is `Function('return this')()`
  //However, this causes CSP violations in Chrome apps.
  if(typeof globalThis !== 'undefined') {
    return globalThis;
  }

  if(typeof self !== 'undefined') {
    return self;
  }

  if(typeof window !== 'undefined') {
    return window;
  }

  if(typeof global !== 'undefined') {
    return global;
  }

  //Gracefully degrade if not able to locate the global object
  return {};
}

function init() {
  if(
    Util.tryCatch(
      () => process,
      process => process.env.NODE_ENV === 'production'
    )
  ) {
    //this method should never leak to prod
    throw new ReferenceError();
  }

  const global = getGlobal();
  //Custom Formatter for Dev Tools. To enable this, open Chrome Dev Tools
  //- Go to Settings,
  //- Under console, select "Enable custom formatters"
  //For more information, https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
  const devtoolsFormatters = global.devtoolsFormatters || [];
  ArrayPush.call(devtoolsFormatters, formatter);
  global.devtoolsFormatters = devtoolsFormatters;
}

if(
  Util.tryCatch(
    () => process,
    process => process.env.NODE_ENV !== 'production'
  )
) {
  init();
}

const ObjectDotPrototype = Object.prototype;
function defaultValueIsObservable(value) {
  //intentionally checking for null
  if(value === null) {
    return false;
  }

  //treat all non-object types, including undefined, as non-observable values
  if(typeof value !== 'object') {
    return false;
  }

  if(isArray(value)) {
    return true;
  }

  const proto = getPrototypeOf(value);
  return proto === ObjectDotPrototype || proto === null || getPrototypeOf(proto) === null;
}

const defaultValueObserved = (obj, key) => {
  /* do nothing */
};

const defaultValueMutated = (obj, key) => {
  /* do nothing */
};

const defaultValueDistortion = value => value;
function createShadowTarget(value) {
  return isArray(value) ? [] : {};
}

class ReactiveMembrane {
  constructor(options) {
    this.valueDistortion = defaultValueDistortion;
    this.valueMutated = defaultValueMutated;
    this.valueObserved = defaultValueObserved;
    this.valueIsObservable = defaultValueIsObservable;
    this.objectGraph = new WeakMap();
    if(!isUndefined(options)) {
      const { valueDistortion, valueMutated, valueObserved, valueIsObservable, tagPropertyKey } = options;
      this.valueDistortion = isFunction(valueDistortion) ? valueDistortion : defaultValueDistortion;
      this.valueMutated = isFunction(valueMutated) ? valueMutated : defaultValueMutated;
      this.valueObserved = isFunction(valueObserved) ? valueObserved : defaultValueObserved;
      this.valueIsObservable = isFunction(valueIsObservable) ? valueIsObservable : defaultValueIsObservable;
      this.tagPropertyKey = tagPropertyKey;
    }
  }

  getProxy(value) {
    const unwrappedValue = unwrap(value);
    const distorted = this.valueDistortion(unwrappedValue);
    if(this.valueIsObservable(distorted)) {
      const o = this.getReactiveState(unwrappedValue, distorted);
      //when trying to extract the writable version of a readonly
      //we return the readonly.
      return o.readOnly === value ? value : o.reactive;
    }

    return distorted;
  }

  getReadOnlyProxy(value) {
    value = unwrap(value);
    const distorted = this.valueDistortion(value);
    if(this.valueIsObservable(distorted)) {
      return this.getReactiveState(value, distorted).readOnly;
    }

    return distorted;
  }

  unwrapProxy(p) {
    return unwrap(p);
  }

  getReactiveState(value, distortedValue) {
    const { objectGraph } = this;
    let reactiveState = objectGraph.get(distortedValue);
    if(reactiveState) {
      return reactiveState;
    }

    const membrane = this;
    reactiveState = {
      /* prettier-ignore */ get reactive() {
        const reactiveHandler = new ReactiveProxyHandler(membrane, distortedValue);
        //caching the reactive proxy after the first time it is accessed
        const proxy = new Proxy(createShadowTarget(distortedValue), reactiveHandler);
        registerProxy(proxy, value);
        ObjectDefineProperty(this, 'reactive', { value: proxy });
        ObjectDefineProperty(this, 'handler', { value: reactiveHandler });
        return proxy;
      },
      /* prettier-ignore */ get readOnly() {
        const readOnlyHandler = new ReadOnlyHandler(membrane, distortedValue);
        //caching the readOnly proxy after the first time it is accessed
        const proxy = new Proxy(createShadowTarget(distortedValue), readOnlyHandler);
        registerProxy(proxy, value);
        ObjectDefineProperty(this, 'readOnly', { value: proxy });
        ObjectDefineProperty(this, 'handler', { value: readOnlyHandler });
        return proxy;
      }
    };
    objectGraph.set(distortedValue, reactiveState);
    return reactiveState;
  }
}

export default ReactiveMembrane;

/** version: 1.0.0 */
