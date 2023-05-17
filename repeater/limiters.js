import { Repeater, FixedBuffer } from './repeater.js';
import { delay } from './timers.js';

function semaphore(limit) {
  if(limit < 1) {
    throw new RangeError('limit cannot be less than 1');
  }
  let remaining = limit;
  const tokens = {};
  const bucket = new Repeater(push => {
    let nextId = 0;
    function release(id) {
      if(tokens[id] != null) {
        const id1 = nextId++;
        const token = {
          ...tokens[id],
          id: id1,
          release: release.bind(null, id1)
        };
        push(token);
        delete tokens[id];
        remaining++;
      }
    }
    for(let i = 0; i < limit; i++) {
      const id = nextId++;
      const token = {
        id,
        limit,
        remaining,
        release: release.bind(null, id)
      };
      push(token);
    }
  }, new FixedBuffer(limit));
  return new Repeater(async (push, stop) => {
    let stopped = false;
    stop.then(() => (stopped = true));
    for await(let token of Repeater.race([bucket, stop])) {
      if(stopped) {
        break;
      }
      remaining--;
      token = { ...token, remaining };
      tokens[token.id] = token;
      await push(token);
    }
  });
}

function throttler(wait, options = {}) {
  const { limit = 1, cooldown = false } = options;
  if(limit < 1) {
    throw new RangeError('options.limit cannot be less than 1');
  }
  return new Repeater(async (push, stop) => {
    const timer = delay(wait);
    const tokens = new Set();
    let start = Date.now();
    let leaking;
    async function leak() {
      if(leaking != null) {
        return leaking;
      }
      start = Date.now();
      await timer.next();
      for(const token of tokens) {
        token.release();
      }
      tokens.clear();
      // eslint-disable-next-line require-atomic-updates
      leaking = undefined;
    }
    let stopped = false;
    stop.then(() => (stopped = true));
    for await(const token of Repeater.race([semaphore(limit), stop])) {
      if(stopped) {
        break;
      }
      leaking = leak();
      let token1 = { ...token, reset: start + wait };
      tokens.add(token1);
      if(cooldown && token.remaining === 0) {
        await Promise.race([stop, leaking]);
        token1 = { ...token1, remaining: limit };
      }
      await push(token1);
    }
    tokens.clear();
    await timer.return();
  });
}

export { semaphore, throttler };
//# sourceMappingURL=limiters.esm.js.map
