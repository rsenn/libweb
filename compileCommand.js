import { spawn } from 'child_process';
import { absolute, relative, isAbsolute, isRelative, join, normalize, basename, basepos } from 'path';
import { assert, define, nonenumerable, types, abbreviate, escape, unescape } from 'util';
//import inspect from 'inspect';

export function PathTransformer(dir) {
  if(!isAbsolute(dir)) dir = absolute(dir);

  assert(isAbsolute(dir), `dir must be absolute (${dir})`);

  return {
    relative: p => (isAbsolute(p) ? relative(dir, p) : p),
    absolute: p => (isRelative(p) ? join(dir, p) : p),
  };
}

export class Command {
  constructor(a, workDir = '.') {
    if(typeof a == 'string') a = a.split(/\s+/g);
    else a = [...a];

    a = a.map(s => unescape(s, '"'));

    define(this, nonenumerable({ workDir: absolute(typeof workDir == 'string' ? workDir : '.'), argv: a }));

    //this.splice(0, this.length);
    //for(let i = 0; i < a.length; i++) this.argv[i] = a[i];
  }

  /* prettier-ignore */ get program() { return this.argv[0]; }
  /* prettier-ignore */ set program(arg) { this.argv[0] = arg; }

  absolutePath(path) {
    if(!isAbsolute(path)) path = join(this.workDir, path);
    return normalize(path);
  }

  argumentsOfType(type) {
    const pred = ArgumentIs(type);
    return this.argv.filter((arg, i) => i > 0 && pred(arg, i));
  }

  /* prettier-ignore */ get warnFlags() { return this.argumentsOfType('warning'); }
  /* prettier-ignore */ get debugFlags() { return this.argumentsOfType('debug'); }
  /* prettier-ignore */ get optFlags() { return this.argumentsOfType(/^opt/); }
  /* prettier-ignore */ get depFlags() { return this.argumentsOfType(/^dep/); }
  /* prettier-ignore */ get modeFlag() { return this.argv.find(ArgumentIs('mode')); }

  /* prettier-ignore */ isCompile() { return this.modeFlag == '-S'; }
  /* prettier-ignore */ isPreprocess() { return this.modeFlag == '-E'; }
  /* prettier-ignore */ isAssemble() { return this.modeFlag == '-S'; }
  /* prettier-ignore */ isLink() { return !this.modeFlag; }

  toString(delim) {
    return this.argv.join(delim ? delim : ' ');
  }

  toArray() {
    return Array.from(this.argv);
  }

  remove(...args) {
    let r = [];
    for(let a of args) {
      let i;
      while((i = this.argv.indexOf(a)) != -1) {
        let a = this.argv.splice(i, 1);
        r = r.concat(a);
      }
    }
    return r;
  }
  get dependencies() {
    const { sources = [], objects = [] } = this;
    let ret = new Set();

    for(let file of sources.concat(objects)) {
      let tmp = this.absolutePath(file);
      /*if(tmp != file)*/ ret.add(tmp);
      file = tmp;
    }

    return [...ret];
  }

  get outputFile() {
    return this.absolutePath(this.output);
  }

  //absolute() {const pred = ArgumentIs(/^(include|systemInclude|search|libpath|file)$/); return new this.constructor(this.argv.map((arg, i) => {let opt = ''; if(i == 1 && /^[A-Z0-9a-z]+$/.test(arg)) {} else if(i > 0 && pred(arg, i)) {if(!ArgumentIs('file')(arg)) {let [, opt] = [.../^-?(isystem\b|[A-Za-z]).*/g.exec(arg)]; opt = arg.slice(0, opt.length + 1); arg = arg.slice(opt.length + 1); } if(!isAbsolute(arg)) arg = this.absolutePath(arg); } return opt + arg; }), ); }

  transformPath(t) {
    const { argv } = this;
    const pred = ArgumentIs(/^(include|search|libpath|file)$/);
    return new this.constructor({
      *[Symbol.iterator]() {
        let i = 0,
          len = argv.length;

        for(; i < len; i++) {
          let arg = argv[i];
          let opt = ArgumentOpt(arg, i);
          let alen = ArgumentLen(arg, i);

          let rest = opt ? arg.slice(opt.length + 1) : arg;

          console.log('transformPath', { opt, rest, i });

          if(i > 0 && pred(arg, i)) rest = t(rest, i, this);

          /*if(isAbsolute(arg)) {
            const newarg = relative(to, arg);
            if(!newarg.endsWith(arg)) arg = newarg;
          }*/

          if(opt.length) yield '-' + opt;
          if(rest.length) yield rest;
        }
      },
    });
  }

  [Symbol.inspect](depth, options = {}) {
    const name = this[Symbol.toStringTag ?? this.construtor?.name];
    const bpos = basepos(this.argv[0]);
    let maxLen = os.ttyGetWinSize?.()?.[1] ?? options.maxArrayLength ?? 1024;

    const str = this.argv.reduce((s, arg, i) => {
      if(i == 0) arg = basename(arg);

      if(s.length + arg.length + 1 + 3 < maxLen) {
        s += ' ';
        s += arg;
      } else if(s[0] == ' ') {
        s = s.slice(1) + ' ...';
      }

      return s;
    }, '');

    const args = str.padEnd(maxLen, ' ');
    //console.log('inspect',{name, args});

    const obj = '{}';

    return '\x1b[1;31m' + name + '\x1b[0m \x1b[0;32m' + args + '\x1b[0m ' + obj;
  }

  run(opts = {}) {
    const [program, ...args] = this.argv;
    return spawn(program, args, { cwd: this.workDir, stdio: ['ignore', 'inherit', 'inherit'], ...opts });
  }
}

Object.setPrototypeOf(Command.prototype, null);

function wrapTransformer(mtf = dir => a => a) {
  return function(dir) {
    let t = mtf(dir);
    const pred = ArgumentIs(/^(include|systemInclude|search|libpath|file)$/);
    return new this.constructor(
      this.argv.map((arg, i) => {
        let opt = '';
        if(i == 1 && /^[A-Z0-9a-z]+$/.test(arg)) {
        } else if(i > 0 && pred(arg, i)) {
          if(!ArgumentIs('file')(arg)) {
            let [, opt] = [.../^-?(isystem\b|[A-Za-z]).*/g.exec(arg)];

            opt = arg.slice(0, opt.length + 1);
            arg = arg.slice(opt.length + 1);
          }

          arg = t(arg, i, this.argv);
        }
        return opt + arg;
      }),
    );
  };
}

function wrapNumericArgument(fn) {
  return function(v, i) {
    if(typeof v == 'number') {
      i = v;
      v = this.argv[i];
    }
    return fn.call(this, v, i, this.argv);
  };
}

define(
  Command.prototype,
  nonenumerable({
    argv: null,
    argumentType: wrapNumericArgument(ArgumentType),
    argumentLen: wrapNumericArgument(ArgumentLen),
    argumentOpt: wrapNumericArgument(ArgumentOpt),
    absolute: wrapTransformer(dir => PathTransformer(dir).absolute),
    relative: wrapTransformer(dir => PathTransformer(dir).relative),
    toJSON() {
      const { workDir, source, output } = this;
      return {
        directory: workDir,
        command: this.argv.join(' '),
        file: source,
        output,
      };
    },
    [Symbol.toStringTag]: 'Command' /*, [Symbol.species]: Command*/,
  }),
);

define(
  Command,
  nonenumerable({
    fromString(str, workDir = '.') {
      const args = [...str.matchAll(/"(\\.|[^"])*"|'(\\.|[^'])'|([^\s]+)/g)].map(([m]) => (/^('.*'|".*")$/.test(m) ? m.slice(1, -1) : m));
      return new this(args, workDir);
    },
  }),
);

//extendArray(Command.prototype);

export class CompileCommand extends Command {
  constructor(a, workDir = '.') {
    super(a, workDir);
  }

  static argumentType = ArgumentType;

  /* prettier-ignore */ get includePaths() { return  this.toObject().includes; }
  /* prettier-ignore */ get defines() { return this.toObject().defines; }
  /* prettier-ignore */ get cflags() { let { flags, includes, defines } = this.toObject(); return (includes ?? []) .map(inc => '-I' + inc) .concat((defines ?? []).map(def => '-D' + def)) .concat(flags); }
  /* prettier-ignore */ get flags() {return this.toObject().flags; }
  /* prettier-ignore */ get args() { return this.toObject().args; }
  /* prettier-ignore */ get sources() { return (this.toObject().args ?? []).filter(arg => arg != this.output); }

  set sources(arg) {
    let { sources } = this;
    let idx = this.argv.indexOf(sources[0]);

    if(!Array.isArray(arg)) arg = [arg];
    this.argv.remove(...sources);

    this.argv.splice(idx, 0, ...arg);
  }

  get source() {
    let { sources } = this;
    if(sources.length > 1) {
      console.log(`CompileCommand has more than 1 source:`, sources);
      //throw new Error(`CompileCommand has more than 1 source: ${sources}`);
    }
    return sources[0];
  }
  set source(arg) {
    this.sources = [arg];
  }

  toObject() {
    let r = {},
      program,
      p,
      includes = [],
      systemIncludes = [],
      defines = [],
      flags = [],
      i = 0,
      output,
      args = [];

    for(let s of this.argv) {
      //console.log('p', p);
      if(i == 0) program = s;
      else if(p == '-isystem') {
        flags.shift();
        systemIncludes.push(s);
      } else if(p == '-I') includes.push(s);
      else if(s.startsWith('-I') && s.length > 2) includes.push(s.slice(2));
      else if(p == '-D') defines.push(s);
      else if(s.startsWith('-D') && s.length > 2) defines.push(s.slice(2));
      else if(p == '-o') {
        if(flags[flags.length - 1] == '-o') flags.pop();
        output = s;
      } else if(s.startsWith('-o') && s.length > 2) output = s.slice(2);
      else if(s.startsWith('-')) flags.push(s);
      else args.push(s);
      p = s;
      i++;
    }

    if(program) r.program = program;
    if(output) r.output = output;
    if(includes && includes.length) r.includes = includes /*.map(inc => relative(inc, this.workDir))*/;
    if(systemIncludes && systemIncludes.length) r.systemIncludes = systemIncludes;
    if(defines && defines.length) r.defines = defines;
    if(flags && flags.length) r.flags = flags;
    if(args && args.length) r.args = args;

    return r;
  }
}

define(
  CompileCommand.prototype,
  nonenumerable({
    [Symbol.toStringTag]: 'CompileCommand',
    type: 'compile',
    [Symbol.species]: CompileCommand,
    get output() {
      let i = this.argv.findIndex(a => /^-o($|)/.test(a));
      return this.argv[i] == '-o' ? this.argv[++i] : this.argv[i].slice(2);
    },
    set output(arg) {
      let i = this.argv.findIndex(a => /^-o($|)/.test(a));
      if(this.argv[i] == '-o') this.argv[++i] = arg;
      else this.argv[i] = '-o' + arg;
    },
  }),
);

//CompileCommand.prototype[Symbol.toStringTag] = 'CompileCommand';

export class LinkCommand extends Command {
  constructor(a, workDir = '.') {
    super(a, workDir);
  }

  /* prettier-ignore */ get libraries() { return  this.argumentsOfType('library'); }
  /* prettier-ignore */ get libpaths() { return  this.argumentsOfType('libpath'); }
  /* prettier-ignore */ get linkflags() { return  this.argumentsOfType('linker'); }

  /* prettier-ignore */ get args() { const pred=ArgumentIs('file'); return this.argv.filter((arg,i) => i > 0 && pred(arg));  }

  get objects() {
    let objs = this.argv.filter((arg, i) => i > 0 && !(i == 1 && /^[a-z]+$/.test(arg))).filter(ArgumentIs('file'));

    return objs /*.map(obj => this.absolutePath(obj))*/
      .filter(arg => arg != this.output);
  }

  get flags() {
    return this.argv.filter(ArgumentIs(t => ['program', 'output', 'file'].indexOf(t) == -1));
  }
}

//LinkCommand.prototype[Symbol.toStringTag] = 'LinkCommand';

define(
  LinkCommand.prototype,
  nonenumerable({
    [Symbol.toStringTag]: 'LinkCommand',
    __proto__: Command.prototype,
    type: 'link',
    [Symbol.species]: LinkCommand,
  }),
);

export function ArgumentOpt(arg) {
  let m;
  if((m = /^-(i[a-z]*\b|shared|pie|Xlinker|Xassembler|Xpreprocessor|[DIULl]|[\w=]+)/g.exec(arg))) {
    const [, opt] = [...m];
    return opt;
  }
  return '';
}

export function ArgumentLen(arg, i) {
  let opt = ArgumentOpt(arg);
  let rest = opt ? arg.slice(opt.length + 1) : arg;
  let needsArg = new Set(['x', 'Xlinker', 'Xassembler', 'Xpreprocessor', 'I', 'isystem', 'idirafter', 'B', 'D', 'U', 'l', 'L', 'w', 'W', 'o']);
  if(rest.length > 1) return 1;

  if(needsArg.has(opt)) return 2;
  return 1;
}

export function ArgumentType(arg, i = Number.MAX_SAFE_INTEGER) {
  if(arg[0] == '-') {
    let c = ArgumentOpt(arg); // arg.slice(1);
    //iconsole.log('ArgumentType',{c});
    switch (c) {
      case 'v':
        return 'verbose';
      case 'x':
        return 'language';
      case 'Xlinker':
      case 'Xassembler':
      case 'Xpreprocessor':
        return 'x';
      case 'I':
        return 'include';
      case 'isystem':
      case 'idirafter':
        return 'systemInclude';
      case 'B':
        return 'search';
      case 'D':
        return 'define';
      case 'U':
        return 'undef';
      case 'l':
        return 'library';
      case 'L':
        return 'libpath';
      case 'S':
      case 'E':
      case 'c':
        return 'mode';
      case 'g':
      case 'G':
        return 'debug';
      case 'w':
      case 'W':
        if(/^-W[apl],/.test(arg)) return { a: 'assembler', p: 'preprocessor', l: 'linker' }[arg[2]];
        return 'warning';
      case 'm':
        return 'machine';
      case 'M':
        return 'dependency';
      case 'O':
        return 'optimization';
      case 'o':
        return 'output';
      case 's': {
        if(/^-std/.test(arg)) return 'standard';
        if(/^-(shared|pie)/.test(arg)) return 'linker';
      }
    }
    if(/^-dump/.test(arg)) return 'dump';
    if(/^-print/.test(arg)) return 'print';
    return 'default(' + c + ')';
  } else if(i === 0) return 'program';
  return 'file';
}

export function ArgumentIs(pred) {
  if(types.isRegExp(pred)) return arg => pred.test(ArgumentType(arg));
  if(typeof pred == 'function') return arg => pred(ArgumentType(arg));
  return arg => ArgumentType(arg) == pred;
}

export function CommandType(command) {
  const mode = command.find(ArgumentIs('mode'));
  switch (mode) {
    case '-c':
      return 'compile';
    case '-E':
      return 'preproc';
    case '-S':
      return 'assemble';
    default:
      return 'link';
  }
}

/*export function CommandOutput(command, ...args) {
  const i = command.findIndex(ArgumentIs('output'));
  const j = command[cmdIndex] == '-o' ? 1 : 0;

  if(args.length > 0) command[i + j] = (j ? '' : '-o') + args[0];

  return command[i + j]?.slice(0, j ? 0 : 2);
}*/

export function MakeCommands(text, workDir = '.') {
  console.log('text', text);
  assert(typeof text, 'string');
  return text.split(/\n/g).map(line => MakeCommand(line, workDir));
}

export function MakeCommand(arrayOrString, workDir = '.') {
  if(typeof arrayOrString == 'string') arrayOrString = [...arrayOrString.matchAll(/"(\\.|[^"])*"|'(\\.|[^'])'|([^\s]+)/g)].map(([m]) => (/^('.*'|".*")$/.test(m) ? m.slice(1, -1) : m));

  return new ({ link: LinkCommand }[CommandType(arrayOrString)] ?? CompileCommand)(arrayOrString, workDir);
}

define(
  LinkCommand.prototype,
  nonenumerable({
    get output() {
      let i = this.argv.findIndex(a => /^-o($|)/.test(a));
      let output = this.argv[i] == '-o' ? this.argv[++i] : i != -1 ? this.argv[i].slice(2) : this.argv.find((a, i) => i > 0 && /\./.test(a));
      return /*this.absolutePath*/ output;
    },

    set output(arg) {
      let i = this.argv.findIndex(a => /^-o($|)/.test(a));
      if(this.argv[i] == '-o') this.argv[++i] = arg;
      else this.argv[i] = '-o' + arg;
    },
  }),
);
