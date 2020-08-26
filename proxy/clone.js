export const proxyClone = (obj) => {
  const override = Object.create(null);
  const deleted = Object.create(null);

  const debug = (...args) => console.log('DEBUG proxyClone', ...args); //Util.debug("proxy-clone");

  const get = (name) => {
    let value;
    if (!deleted[name]) value = override[name] || obj[name];
    if (Util.isObject(value)) {
      value = Util.proxyClone(value);
      override[name] = value;
    }
    if (typeof value === 'function') {
      value = value.bind(obj);
    }
    return value;
  };

  return new Proxy(Object.prototype, {
    getPrototypeOf: () => Object.getPrototypeOf(obj),
    setPrototypeOf: () => {
      throw new Error('Not yet implemented: setPrototypeOf');
    },
    isExtensible: () => {
      throw new Error('Not yet implemented: isExtensible');
    },
    preventExtensions: () => {
      throw new Error('Not yet implemented: preventExtensions');
    },
    getOwnPropertyDescriptor: (target, name) => {
      let desc;
      if (!deleted[name]) {
        desc = Object.getOwnPropertyDescriptor(override, name) || Object.getOwnPropertyDescriptor(obj, name);
      }
      if (desc) desc.configurable = true;
      debug(`getOwnPropertyDescriptor ${name} =`, desc);
      return desc;
    },
    defineProperty: () => {
      throw new Error('Not yet implemented: defineProperty');
    },
    has: (_, name) => {
      const has = !deleted[name] && (name in override || name in obj);
      debug(`has ${name} = ${has}`);
      return has;
    },
    get: (receiver, name) => {
      const value = get(name);
      debug(`get ${name} =`, value);
      return value;
    },
    set: (_, name, val) => {
      delete deleted[name];
      override[name] = val;
      debug(`set ${name} = ${val}`, name, val);
      return true;
    },
    deleteProperty: (_, name) => {
      debug(`deleteProperty ${name}`);
      deleted[name] = true;
      delete override[name];
    },
    ownKeys: () => {
      const keys = Object.keys(obj)
        .concat(Object.keys(override))
        .filter(Util.uniquePred)
        .filter((key) => !deleted[key]);
      debug(`ownKeys`, keys);
      return keys;
    },
    apply: () => {
      throw new Error('Not yet implemented: apply');
    },
    construct: () => {
      throw new Error('Not yet implemented: construct');
    },
    enumerate: () => {
      throw new Error('Not yet implemented: enumerate');
    }
  });
};

export default proxyClone;
