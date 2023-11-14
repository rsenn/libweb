export const PromiseState = Symbol('PromiseState');

export function defer() {
  let res, rej;

  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  return Object.assign(promise, {
    resolve(...args) {
      res(...args);
      this[PromiseState] = 'resolved';
    },
    reject(...args) {
      rej(...args);
      this[PromiseState] = 'rejected';
    },
    [PromiseState]: 'pending'
  });
}

export function rejectDefer(e) {
  return Object.assign(Promise.reject(e), {
    resolve: () => {},
    reject: () => {},
    [PromiseState]: 'rejected'
  });
}

export function resolveDefer(e) {
  return Object.assign(Promise.resolve(e), {
    resolve: () => {},
    reject: () => {},
    [PromiseState]: 'resolved'
  });
}
