
Util.getPlatform() == 'quickjs'
  ? import('inspect')
      .catch(() => import('inspect.so'))
      .then(module => {
        globalThis.inspect = module;
        return module;
      })
  : import('util').then(module => {
      globalThis.inspect = module.inspect;
      return module.inspect;
    });
