import Util from './util.js';
//import ObjectInspect from './objectInspect.js';

let savedOpts = {};

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
    ...options
  } = opts;
  const inspectOptions = {
    depth,
    colors,
    breakLength,
    maxArrayLength,
    ...options
  };
  ret = await Util.tryCatch(async () => {
      const Console = await import('console').then(module => module.Console);
      ret = new Console({
        stdout: proc.stdout,
        stderr: proc.stderr,
        inspectOptions
      });
      ret.colors = colors;
      ret.depth = depth;
      ret.inspect = (await import('util')).inspect;
      return ret;
    },
    c => c,
    async () => {
      let c = Util.getGlobalObject().console;
      let options = { colors: true, depth: Infinity, indent: 2, ...inspectOptions };

      let log = c.log;
      c.reallog = log;

      class Console {
        config(obj = {}) {
          return new ConsoleOptions(obj);
        }
      }

      /*    Console.Options = */ function ConsoleOptions(obj = {}) {
        Object.assign(this, obj);
      }
      ConsoleOptions.prototype.merge = function(...args) {
        return Object.assign(this, ...args);
      };

      let newcons = Object.create(Console.prototype);

      await import('inspect.so')
        .then(module => (globalThis.ObjectInspect = module.inspect))
        .catch(() =>
          import('./objectInspect.js').then(module => (globalThis.ObjectInspect = module.ObjectInspect)
          )
        );
      //      Util.getGlobalObject().ObjectInspect = ObjectInspect;

      return /*Object.create*/ Util.define(newcons, {
        options,
        reallog: log,
        inspect(...args) {
          let [obj, opts] = args;
          if(args.length == 0) obj = this;
          return ObjectInspect(obj, {
            customInspect: true,
            ...this.options,
            ...opts
          });
        },
        log(...args) {
          let tempOpts = new ConsoleOptions(this.options);
          return log.call(this,
            ...args.reduce((acc, arg) => {
              if(Util.className(arg) == 'ConsoleOptions') tempOpts.merge(arg);
              else if(typeof arg != 'string' || !Util.isPrimitive(arg))
                acc.push(ObjectInspect(arg, tempOpts));
              else acc.push(arg);
              return acc;
            }, [])
          );
        }
      });
    }
  );

  function addMissingMethods(cons) {
    let fns = {};

    for(let method of ['error', 'warn', 'debug']) {
      if(cons[method] === undefined) fns[method] = cons.log;
    }
    return Util.define(cons, fns);
  }
  /*  console.log('Util.getGlobalObject():', Util.getGlobalObject());
  console.log('globalThis:', globalThis);
  console.log('globalThis === Util.getGlobalObject():', globalThis === Util.getGlobalObject());
  console.log('ret:', ret === console);
  console.log('globalThis.console', globalThis.console);
  console.log('globalThis.console === console', globalThis.console === console);*/

  Util.getGlobalObject().console = addMissingMethods(ret);
}

export const ConsoleOnce = Util.once(opts => ConsoleSetup(opts));

export default ConsoleSetup;
