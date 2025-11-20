export const proxyDelegate = (target, origin) =>
  new Proxy(target, {
    get(target, key, receiver) {
      if(key in target) return Reflect.get(target, key, receiver);
      const value = origin[key];
      return typeof value === 'function' ? (...args) => value.apply(origin, args) : value;
    },
    set(target, key, value, receiver) {
      if(key in target) return Reflect.set(target, key, value, receiver);
      origin[key] = value;
      return true;
    },
  });

export default proxyDelegate;
