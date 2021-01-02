const boundFuncsMap = new WeakMap();
const proxiesMap = new WeakMap();

const handler = {
  get(target, name) {
    const boundFuncs = boundFuncsMap.get(target);
    const val = target[name];
    if(boundFuncs.has(val)) return boundFuncs.get(val);
    if(typeof val === 'function') {
      const boundFunc = val.bind(target);
      boundFuncs.set(val, boundFunc);
      return boundFunc;
    }
    return val;
  }
};

export const autoBind = (() => {
  let self = function autoBind(target) {
    if(proxiesMap.has(target)) return proxiesMap.get(target);

    if((typeof target !== 'object' && typeof target !== 'function') || target === null) {
      throw TypeError('expected a non-null object, ' + `got ${target === null ? 'null' : typeof target}`
      );
    }

    const boundFuncs = new WeakMap();
    const proxy = new Proxy(target, handler);
    boundFuncsMap.set(target, boundFuncs);
    proxiesMap.set(target, proxy);
    return proxy;
  };
  Object.assign(self, { boundFuncsMap, proxiesMap });
  return self;
})();

export default autoBind;
