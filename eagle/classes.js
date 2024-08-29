//import { errors, types, isObject, isAsync, inspectSymbol, toString, btoa, atob, assert, escape, quote, memoize, chain, chainRight, chainArray, getset, modifier, getter, setter, gettersetter, hasFn, remover, getOrCreate, hasGetSet, mapObject, once, atexit, waitFor, extend, define, defineGetter, defineGetterSetter, defineGettersSetters, prototypeIterator, pick, omit, keys, entries, values, getMethodNames, getMethods, bindMethods, properties, weakDefine, merge, weakAssoc, getPrototypeChain, getConstructorChain, hasPrototype, filter, filterKeys, curry, clamp, split, matchAll, bindProperties, immutableClass, instrument, hash, catchable, isNumeric, isIndex, numericIndex, histogram, propertyLookupHandlers, propertyLookup, lookupObject, padFn, pad, abbreviate, trim, tryFunction, tryCatch, mapAdapter, mapFunction, mapWrapper, weakMapper, wrapGenerator, wrapGeneratorMethods, unique, getFunctionArguments, ansiStyles, stripAnsi, padAnsi, padStartAnsi, padEndAnsi, randInt, randFloat, randStr, toBigInt, roundDigits, roundTo, lazyProperty, lazyProperties, decorate, getOpt, showHelp, isoDate, toUnixTime, unixTime, fromUnixTime, range, repeater, repeat, chunkArray, ucfirst, lcfirst, camelize, decamelize, shorten, arraysInCommon, arrayFacade, mod, add, sub, mul, div, xor, or, and, pow, pushUnique, inserter, intersect, symmetricDifference, partitionArray, difference, intersection, union, partition, format, formatWithOptions, functionName, className, isArrowFunction, predicate, isArray, ArrayFacade, bits, dupArrayBuffer, getTypeName, isArrayBuffer, isBigDecimal, isBigFloat, isBigInt, isBool, isJSFunction, isCFunction, isConstructor, isEmptyString, isError, isException, isExtensible, isFunction, isHTMLDDA, isInstanceOf, isInteger, isJobPending, isLiveObject, isNull, isNumber, isUndefined, isString, isUninitialized, isSymbol, isUncatchableError, isRegisteredClass, rand, randi, randf, srand, toArrayBuffer, error } from '../misc.js';
import { parseXML, walkNodes, getAttributes, ArrayInterface, ObjectInterface } from '../dom/helpers.js';

export class Library extends ObjectInterface {
  constructor(element, desc = {}) {
    super(element, desc);
  }
}
Library.prototype[Symbol.toStringTag] = 'Library';

export class Package extends ObjectInterface {
  constructor(element, desc = {}) {
    super(element, desc);
  }
}

Package.prototype[Symbol.toStringTag] = 'Package';

export class Element extends ObjectInterface {
  constructor(element) {
    super(element, {
      library: {
        get: e => new Library(e.ownerDocument.querySelector(`library[name="${e.getAttribute('library')}"]`))
      },
      package: {
        get: e => new Package(e.ownerDocument.querySelector(`library[name="${e.getAttribute('library')}"]`).querySelector(`package[name="${e.getAttribute('package')}"]`)),
        set: (e, value) => {
          const n = Object.fromEntries([...walkNodes(value, 'parentElement', e => (e.hasAttribute('name') ? [e.tagName, e.getAttribute('name')] : null))].filter(p => p != null));

          if(!('library' in n)) throw new TypeError(`element has no library name`);
          if(!('package' in n)) throw new TypeError(`element has no package name`);

          e.setAttribute('library', n.library);
          e.setAttribute('package', n.package);
        }
      }
    });
  }
}

Element.prototype[Symbol.toStringTag] = 'Element';
