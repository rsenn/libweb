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

  const proc = await Util.tryCatch(
    () => process,
    p => p,
    () => Util.tryCatch(async () => await import('process')),
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
    depth = Infinity,
    colors = await Util.isatty(1),
    breakLength = defaultBreakLength,
    maxArrayLength = Infinity,
    compact = 1,
    customInspect = true,
    ...options
  } = opts;

  let inspectOptions = new ConsoleOptions({
    depth,
    colors,
    breakLength,
    maxArrayLength,
    compact,
    customInspect,
    ...options
  });

  /*if(typeof globalThis.inspect == 'function' || typeof globalThis.inspect == 'object')
    globalThis.inspect.options = inspectOptions;*/
  if(Util.getPlatform() != 'quickjs')
    ret = await Util.tryCatch(
      async () => {
        let c = globalThis.console;
        let clog = c.log;

        const Console = await import('console').then(
          module => (globalThis.Console = module.Console)
        );

        ret = new Console({
          stdout: proc.stdout,
          stderr: proc.stderr,
          colorMode: inspectOptions.colors,
          inspectOptions
        });

        Console.prototype.config = function config(obj = {}) {
          return new ConsoleOptions(obj);
        };

        ret.colors = colors;
        ret.depth = depth;
        ret.options = inspectOptions;

        const inspectFunction = await import('util').then(
          module => (globalThis.inspect = module.inspect)
        );

        ret = extendWithOptionsHandler(ret, inspectFunction, inspectOptions, clog);
        clog.call(c, 'ret:', ret.log + '');
        return ret;
      },
      c => c,
      () => {}
    );
  else
    ret = await Util.tryCatch(
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

        let newcons = new Console({ inspectOptions });
        let inspectFunction;
        let platform = Util.getPlatform();

        newcons.options = inspectOptions;

        //console.log('Platform:', platform);
        switch (platform) {
          case 'quickjs':
            await import('inspect')
              .catch(() => import('inspect.so'))
              .then(module => (globalThis.inspect = inspectFunction = module.inspect));
            break;

          case 'node':
            await import('util').then(
              module => (globalThis.inspect = inspectFunction = module.inspect)
            );
            break;
          default:
            await import('./objectInspect.js').then(
              module => (globalThis.inspect = inspectFunction = module.inspectFunction)
            );
            break;
        }

        return extendWithOptionsHandler(newcons, inspectFunction, inspectOptions, c.log);
      },
      c => c,
      () => {}
    );

  if(ret) globalThis.console = addMissingMethods(ret);
}

function extendWithOptionsHandler(newcons, inspect, options, reallog) {
  return Util.define(newcons, {
    options,
    reallog,
    inspect(...args) {
      let [obj, opts] = args;
      if(args.length == 0) obj = this;
      return inspect(obj, ConsoleOptions.merge(this.options, opts));
    },
    log(...args) {
      let tempOpts = /*new ConsoleOptions*/ this.options;
      let acc = [];
      let i = 0;

      for(let arg of args) {
        try {
          if(typeof arg == 'object') {
            if(arg == null) {
              acc.push('null');
              continue;
            } else if(arg.merge === ConsoleOptions.prototype.merge) {
              tempOpts.merge(arg);
              continue;
            }
          }
          if(typeof arg != 'string') {
            const opts = { ...tempOpts };
            //this.reallog('tempOpts:', opts);
            acc.push(inspect(arg, opts));
            continue;
          }
          acc.push(arg);
        } catch(error) {
          this.reallog('error:', error.message, `\n${error.stack}`);
        }
      }
      //console.reallog('args:', acc);
      return this.reallog(acc.join(' '));
    }
  });
}

function addMissingMethods(cons) {
  let fns = {};

  if(cons)
    for(let method of ['error', 'warn', 'debug']) {
      if(cons[method] === undefined) fns[method] = cons.log;
    }
  return Util.define(cons, fns);
}

export const ConsoleOnce = Util.once(opts => ConsoleSetup(opts));

export default ConsoleSetup;
