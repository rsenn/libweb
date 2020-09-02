export function Timer(timeout, fn, props = {}, { create = setInterval, destroy = clearInterval }) {
  let t;

  t = {
    timeout,
    fn,
    running: true,
    id: create(() => fn.call(t, t), timeout, fn, t),
    started: Date.now(),
    stop() {
      if(this.id !== null) {
        destroy(this.id);
        this.id = null;
        this.running = false;
      }
    },
    ...props
  };

  if(this instanceof Timer) Object.assign(this, t);
  else return t;
}

Timer.interval = (timeout, fn, props) => new Timer(timeout, fn, props, { destroy: clearTimeout });

Timer.once = (timeout, fn, props) => new Timer(timeout, fn, props, { create: setTimeout, destroy: clearTimeout });
Timer.until = (deadline, fn, props) => Timer.once(deadline - Date.now(), fn, props);

Timer.std = {
  create: (fn, interval) => setTimeout(fn, interval),
  destroy: (id) => clearTimeout(id)
};

Timer.debug = (impl = Timer.std) => ({
  log: (msg) => console.log(msg),
  create(fn, timeout) {
    let id, str;
    id = impl.create(() => {
      this.log(`Timer #${id} END`);
      impl.destroy(id);
      fn();
    }, timeout);
    this.log(`Timer #${id} START ${timeout}ms`);
    return id;
  },
  destroy(id) {
    impl.destroy(id);
    this.log(`Timer #${id} STOP`);
  }
});

Timer.promise = (timeout, impl = Timer.std /*Timer.debug(Timer.std)*/) =>
  new Promise((resolve, reject) =>
    Timer(timeout,
      resolve,
      {},
      {
        create: (fn, timeout) => impl.create(fn, timeout),
        destroy: (id) => {
          impl.destroy(id);
          reject();
        }
      }
    )
  );
