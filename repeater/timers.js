import { MAX_QUEUE_LENGTH, Repeater, RepeaterOverflowError, SlidingBuffer } from './repeater.js';
class TimeoutError extends Error {
  constructor(message) {
    super(message);
    Object.defineProperty(this, 'name', {
      value: 'TimeoutError',
      enumerable: false
    });
    if(typeof Object.setPrototypeOf === 'function') {
      Object.setPrototypeOf(this, new.target.prototype);
    } else {
      this.__proto__ = new.target.prototype;
    }
    if(typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class Timer {
  constructor(wait) {
    this.wait = wait;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  run(fn) {
    if(this.timeout != null) {
      throw new Error('Cannot run a timer multiple times');
    }
    this.timeout = setTimeout(() => {
      try {
        const value = fn();
        this.resolve(value);
      } catch(err) {
        this.reject(err);
      }
    }, this.wait);
  }
  clear() {
    clearTimeout(this.timeout);
    // In code below, this method is only called after the repeater is
    // stopped. Because repeaters swallow rejections which settle after stop, we
    // use this mechanism to make any pending call which has received the
    // deferred promise resolve to `{ done: true }`.
    this.reject(new TimeoutError('Timer.clear called before stop'));
  }
}

function delay(wait) {
  return new Repeater(async (push, stop) => {
    const timers = new Set();
    let stopped = false;
    stop.then(() => (stopped = true));
    try {
      while(!stopped) {
        const timer = new Timer(wait);
        timers.add(timer);
        if(timers.size > MAX_QUEUE_LENGTH) {
          throw new RepeaterOverflowError(`No more than ${MAX_QUEUE_LENGTH} calls to next are allowed on a single delay repeater.`);
        }
        timer.run(() => {
          timers.delete(timer);
          return Date.now();
        });
        await push(timer.promise);
      }
    } finally {
      for(const timer of timers) {
        timer.clear();
      }
    }
  });
}

function timeout(wait) {
  return new Repeater(async (push, stop) => {
    let timer;
    let stopped = false;
    stop.then(() => (stopped = true));
    try {
      while(!stopped) {
        if(timer !== undefined) {
          timer.resolve(undefined);
        }
        timer = new Timer(wait);
        timer.run(() => {
          throw new TimeoutError(`${wait}ms elapsed without next being called`);
        });
        await push(timer.promise);
      }
    } finally {
      if(timer !== undefined) {
        timer.clear();
      }
    }
  });
}

function interval(wait, buffer = new SlidingBuffer(1)) {
  return new Repeater(async (push, stop) => {
    push(Date.now());
    const timer = setInterval(() => push(Date.now()), wait);
    await stop;
    clearInterval(timer);
  }, buffer);
}

export { TimeoutError, delay, interval, timeout };
//# sourceMappingURL=timers.esm.js.map