import Util from './util.js';

let savedOpts = {};

export function ConsoleOptions(obj = {}) {
  Object.assign(this, obj);
}
ConsoleOptions.prototype.merge = function(...args) {
  return Object.assign(this, ...args);
};
ConsoleOptions.merge = function(opts, ...args) {
  return new ConsoleOptions(opts).merge(...args);
};

export async function ConsoleSetup(opts = {}) {
  opts = { ...savedOpts, ...opts };
  savedOpts = opts;
  //console.log("opts.breakLength:",opts.breakLength, Util.stack());
  let ret;
  Util.tryCatch(() => (Error.stackTraceLimit = 1000));
  const proc = await Util.tryCatch(async () => await import('process'),
    ({ stdout, env }) => ({ stdout, env }),
    () => ({ stdout: {}, env: {} })
  );
  const consoleWidth = async (fd = 1) => {
    const size = await Util.ttyGetWinSize(fd);
    return Array.isArray(size) ? size[0] : undefined;
  };
  const defaultBreakLength =
    (proc && proc.stdout && proc.stdout.isTTY && proc.stdout.columns) ||
    proc.env.COLUMNS ||
    (await consoleWidth()) ||
    80; // Infinity;
  const {
    depth = 2,
    colors = await Util.isatty(1),
    breakLength = defaultBreakLength,
    maxArrayLength = Infinity,
    compact = false,
    customInspect = true,
    ...options
  } = opts;

  let inspectOptions = new ConsoleOptions({
    depth,
    colors,
    breakLength,
    maxArrayLength,
    ...options
  });

  if(typeof globalThis.inspect == 'function' || typeof globalThis.inspect == 'ôbject')
    globalThis.inspect.options = inspectOptions;
  ret = await Util.tryCatch(async () => {
      const Console = await import('console').then(module => (globalThis.Console = module.Console));

      ret = new Console({
        stdout: proc.stdout,
        stderr: proc.stderr,
        inspectOptions
      });

      Console.prototype.config = function config(obj = {}) {
        return new ConsoleOptions(obj);
      };

      ret.colors = colors;
      ret.depth = depth;

      const inspectFunction = await import('util').then(module => (globalThis.inspect = module.inspect)
      );

      return extendWithOptionsHandler(ret, inspectFunction, inspectOptions);
    },
    c => c,
    async () => {
      let c = globalThis.console;
      /* let options = {
        colors: true,
        depth: Infinity,
        customInspect: true,
        indent: 2,
        ...inspectOptions
      };*/

      class Console {
        config(obj = {}) {
          return new ConsoleOptions(obj);
        }

        valueOf() {
          return this;
        }
      }

      globalThis.Console = Console;

      let newcons = new Console();
      let inspectFunction;
      let platform = Util.getPlatform();

      console.log('Platform:', platform);
      switch (platform) {
        case 'quickjs':
          await import('inspect.so').then(module => (globalThis.inspect = inspectFunction = module.inspect)
          );
          break;

        case 'node':
          await import('util').then(module => (globalThis.inspect = inspectFunction = module.inspect)
          );
          break;
        default: await import('./objectInspect.js').then(
            module => (globalThis.inspect = inspectFunction = module.inspectFunction)
          );
          break;
      }

      return extendWithOptionsHandler(newcons, inspectFunction, inspectOptions, c.log);
    }
  );

  /*  console.log('Util.getGlobalObject():', Util.getGlobalObject());
  console.log('globalThis:', globalThis);
  console.log('globalThis === Util.getGlobalObject():', globalThis === Util.getGlobalObject());
  console.log('ret:', ret === console);
  console.log('globalThis.console', globalThis.console);
  console.log('globalThis.console === console', globalThis.console === console);*/

  Util.getGlobalObject().console = addMissingMethods(ret);
}

function extendWithOptionsHandler(newcons, inspect, options, reallog) {
  return Util.define(newcons, {
    reallog: newcons.log ?? reallog,
    /*inspect(...args) {
        let [obj, opts] = args;
        if(args.length == 0) obj = this;
        return inspect(obj, ConsoleOptions.merge(this.options, opts));
      },*/
    log(...args) {
      let { reallog, options } = this;
      let tempOpts = new ConsoleOptions(options);
      //this.reallog("inspect:", inspect);
      return reallog.call(this,
        ...args.reduce((acc, arg) => {
          if(typeof arg == 'object' && arg != null && arg instanceof ConsoleOptions) {
            tempOpts.merge(arg);
          } else if(typeof arg == 'object' && arg != null) {
            let s;
            try {
              s = inspect(arg, tempOpts);
            } catch(error) {
              s = error;
            }
            acc.push(s);
          } else {
            acc.push(arg);
          }
          // this.reallog("acc:", acc);
          return acc;
        }, [])
      );
    }
  });
}

function addMissingMethods(cons) {
  let fns = {};

  for(let method of ['error', 'warn', 'debug']) {
    if(cons[method] === undefined) fns[method] = cons.log;
  }
  return Util.define(cons, fns);
}

export const ConsoleOnce = Util.once(opts => ConsoleSetup(opts));

export default ConsoleSetup;
