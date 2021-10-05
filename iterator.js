import Util from './util.js';

export const isIterator = arg =>
  typeof arg == 'object' && arg !== null && typeof arg.next == 'function';

export const isIterable = arg =>
  typeof arg == 'object' && arg !== null && arg[Symbol.iterator] !== undefined;

export class IterableInterface {
  [Symbol.iterator]() {
    if(typeof this.next == 'function') return this;
  }
}

export class IteratorInterface extends IterableInterface {
  next() {
    return { done: true };
  }

  map(fn = (x, i, it) => x) {
    const it = this;
    let i = 0;
    //console.log("MAP", it.next+'', i);

    return new IteratorForwarder((...args) => {
      //console.log("Iterator.map next", args);
      let { value, done } = it.next(...args);

      if(done) return { done };
      value = fn(value, i++, it);
      return { value, done };
    });
  }
}

export class IteratorForwarder extends IteratorInterface {
  constructor(it) {
    super();
    this.delegate = typeof it.next == 'function' ? it.next.bind(it) : it;
    //console.log("this.delegate", this.delegate);
    //this.next = it.next.bind(it);
    return this;
  }

  next(...args) {
    //console.log(this, "IteratorForwarder.next(",...args,")");
    return this.delegate(...args);
  }
}

export class Iterator extends IterableInterface {
  constructor(arg) {
    let ret;
    super();
    //if(isIterable(arg)) arg = arg[Symbol.iterator]();

    if(isIterator(arg)) {
      ret = this;
      //ret.next = arg.next.bind(arg); // ((...args) => arg.next(...args));
      ret.next = (...args) => {
        let ret = arg.next(...args);
        //console.log("arg.next(",...args,") =",ret);

        return ret;
      };
    } else if(typeof arg == 'function') {
      ret = this;
      ret.next = arg;
    } else if(
      ((typeof arg == 'object' && arg !== null) || typeof arg == 'string') &&
      arg.length !== undefined
    ) {
      ret = (function* () {
        for(let i = 0; i < arg.length; i++) yield arg[i];
      })();
    } else if(typeof arg == 'number') {
      ret = (function* () {
        for(let i = 0; i < arg; i++) yield i;
      })();
    } else {
      throw new Error('Not iterable? ' + typeof arg + ' ' + Util.className(arg));
    }

    if(!(ret instanceof Iterator))
      if(Object.hasOwnProperty(ret, 'next')) Object.setPrototypeOf(ret, Iterator.prototype);
      else Util.extend(ret, Util.getMethods(Iterator.prototype));

    //console.log("ret.next = ",ret.next+'');

    /*
                            //console.log("Iterator ", ret);
                            //console.log("Iterator methods", Util.getMethods(ret, 2,0));
                            //console.log("Iterator next", ret.next);
                            //console.log("Iterator next()", ret.next());*/

    return ret;
  }
}

/*for(let method of Util.getMethodNames(Iterator)) {
  Iterator.prototype[method] = function(...args) {
    let ret = Iterator[method](this, ...args);
    Object.setPrototypeOf(ret, Iterator.prototype);
    return ret;
  };
}*/
Iterator.map = function* (it, fn = (x, i, it) => x) {
  let i = 0;
  for(let item of it) yield fn(item, i++, it);
};

Iterator.reduce = function(it, fn = (acc, x, i, it) => x, acc) {
  let i = 0;
  for(let item of it) acc = fn(acc, item, i++, it);
  return acc;
};

Iterator.filter = function* (it, fn = (x, i, it) => true) {
  let i = 0;
  for(let item of it) if(fn(item, i++, it)) yield item;
};

Iterator.some = function* (it, fn = (x, i, it) => false) {
  let i = 0;
  for(let item of it) if(fn(item, i++, it)) return true;
  return false;
};

Iterator.every = function* (it, fn = (x, i, it) => false) {
  let i = 0;
  for(let item of it) if(!fn(item, i++, it)) return false;
  return true;
};

Iterator.forEach = function* (it, fn = (x, i, it) => true) {
  let i = 0;
  for(let item of it) fn(item, i++, it);
};

Object.assign(Iterator, { isIterable, isIterator });

export default Iterator;
