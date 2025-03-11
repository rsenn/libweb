import { spawn } from 'child_process';
import { absolute, isAbsolute, join, normalize, relative } from 'path';
import { assert, define, nonenumerable, types } from 'util';
//import inspect from 'inspect';

export class Command {
  constructor(a, workDir = '.') {
    this.workDir = absolute(typeof workDir == 'string' ? workDir : '.');
    if(typeof a == 'string') a = a.split(/\s+/g);
    else a = [...a];

    define(this, nonenumerable({ argv: a }));

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

  absolute() {
    const pred = ArgumentIs(/^(include|search|libpath|file)$/);
    return new this.constructor(
      this.argv.map((arg, i) => {
        let opt = '';
        if(i > 0 && pred(arg, i)) {
          if(!ArgumentIs('file')(arg)) {
            opt = arg.slice(0, 2);
            arg = arg.slice(2);
          }
          if(!isAbsolute(arg)) arg = this.absolutePath(arg);
        }
        return opt + arg;
      })
    );
  }

  relative(to) {
    const pred = ArgumentIs(/^(include|search|libpath|file)$/);
    to ??= this.workDir;
    return new this.constructor(
      this.argv.map((arg, i) => {
        let opt = '';
        if(i > 0 && pred(arg, i)) {
          if(!ArgumentIs('file')(arg)) {
            opt = arg.slice(0, 2);
            arg = arg.slice(2);
          }
          if(isAbsolute(arg)) {
            const newarg = relative(to, arg);
            if(!newarg.endsWith(arg)) arg = newarg;
          }
        }
        return opt + arg;
      })
    );
  }

  /* [Symbol.inspect](depth, options = {}) {
    return '\x1b[1;31m' + this[Symbol.toStringTag] + '\x1b[0m ' + inspect(this.argv, options);
  }*/

  run() {
    const [program, ...args] = this.argv;
    return spawn(program, args, { cwd: this.workDir, stdio: ['ignore', 'inherit', 'inherit'] });
  }
}

define(
  Command.prototype,
  nonenumerable({
    argv: null,
    argumentType: ArgumentType,
    toJSON() {
      const { workDir, source, output } = this;
      return {
        directory: workDir,
        command: this.argv.join(' '),
        file: source,
        output
      };
    },
    [Symbol.toStringTag]: 'Command' /*, [Symbol.species]: Command*/
  })
);

define(
  Command,
  nonenumerable({
    fromString(str, workDir = '.') {
      const args = [...str.matchAll(/"(\\.|[^"])*"|'(\\.|[^'])'|([^\s]+)/g)].map(([m]) => (/^('.*'|".*")$/.test(m) ? m.slice(1, -1) : m));
      return new this(args, workDir);
    }
  })
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
    if(sources.length > 1) throw new Error(`CompileCommand has more than 1 source: ${sources}`);
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
      defines = [],
      flags = [],
      i = 0,
      output,
      args = [];

    for(let s of this.argv) {
      if(i == 0) program = s;
      else if(p == '-I') includes.push(s);
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
    if(defines && defines.length) r.defines = defines;
    if(flags && flags.length) r.flags = flags;
    if(args && args.length) r.args = args;

    return r;
  }
}

define(
  CompileCommand.prototype,
  nonenumerable({
    type: 'compile',
    [Symbol.toStringTag]: 'CompileCommand',
    [Symbol.species]: CompileCommand,
    get output() {
      let output,
        i = this.argv.findIndex(a => /^-o($|)/.test(a));

      output = this.argv[i] == '-o' ? this.argv[++i] : this.argv[i].slice(2);
      return /*this.absolutePath*/ output;
    },
    set output(arg) {
      let i = this.argv.findIndex(a => /^-o($|)/.test(a));
      if(this.argv[i] == '-o') this.argv[++i] = arg;
      else this.argv[i] = '-o' + arg;
    }
  })
);

CompileCommand.prototype[Symbol.toStringTag] = 'CompileCommand';

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

define(
  LinkCommand.prototype,
  nonenumerable({
    __proto__: Command.prototype,
    type: 'link',
    [Symbol.toStringTag]: 'LinkCommand',
    [Symbol.species]: LinkCommand
  })
);

export function ArgumentType(arg, i = Number.MAX_SAFE_INTEGER) {
  if(arg[0] == '-') {
    let c = arg[1];
    switch (c) {
      case 'v':
        return 'verbose';
      case 'x':
        return 'language';
      case 'X': {
        if(/^-X(linker|assembler|preprocessor)/.test(arg)) return arg.substring(2);
        break;
      }
      case 'I':
        return 'include';
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
    }
  })
);

export function NinjaRule(command) {
  /* if(!new.target) return new NinjaRule(command);*/
}
