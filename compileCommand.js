import inspect from './objectInspect.js';
import { define, glob, types } from './misc.js';
import { absolute, relative } from './path.js';
import { readFileSync } from './filesystem.js';

export class Command extends Array {
  constructor(a, workDir = '.') {
    super();
    this.workDir = absolute(typeof workDir == 'string' ? workDir : '.');
    if(typeof a == 'string') a = a.split(/\s+/g);

    //this.splice(0, this.length);
    for(let i = 0; i < a.length; i++) this[i] = a[i];
  }

  /* prettier-ignore */ get program() { return this[0]; }
  /* prettier-ignore */ set program(arg) { this[0] = arg; }

  typeFlags(type) {
    return [...this].filter(ArgumentIs(type));
  }

  /* prettier-ignore */ get warnFlags() { return this.typeFlags('warning'); }
  /* prettier-ignore */ get debugFlags() { return this.typeFlags('debug'); }
  /* prettier-ignore */ get optFlags() { return this.typeFlags(/^opt/); }
  /* prettier-ignore */ get depFlags() { return this.typeFlags(/^dep/); }
  /* prettier-ignore */ get modeFlag() { return [...this].find(ArgumentIs('mode')); }

  /* prettier-ignore */ isCompile() { return this.modeFlag == '-S'; }
  /* prettier-ignore */ isPreprocess() { return this.modeFlag == '-E'; }
  /* prettier-ignore */ isAssemble() { return this.modeFlag == '-S'; }
  /* prettier-ignore */ isLink() { return !this.modeFlag; }

  toString(delim) {
    return this.join(delim ? delim : ' ');
  }

  toArray() {
    return Array.from(this);
  }

  remove(...args) {
    let r = [];
    for(let a of args) {
      let i;
      while((i = this.indexOf(a)) != -1) {
        let a = this.splice(i, 1);
        r = r.concat(a);
      }
    }
    return r;
  }

  [Symbol.inspect](depth, options = {}) {
    return '\x1b[1;31m' + this[Symbol.toStringTag] + '\x1b[0m ' + inspect([...this], options);
  }
}

define(Command.prototype, { argumentType: ArgumentType, [Symbol.toStringTag]: 'Command' /*, [Symbol.species]: Command*/ });

define(Command, {
  fromFile(file, workDir = '.') {
    return this.fromString(readFileSync(file, 'utf-8'), workDir);
  },
  fromString(str, workDir = '.') {
    const args = [...str.matchAll(/"(\\.|[^"])*"|'(\\.|[^'])'|([^\s]+)/g)].map(([m]) => (/^('.*'|".*")$/.test(m) ? m.slice(1, -1) : m));
    return new this(args, workDir);
  }
});

//extendArray(Command.prototype);

export class CompileCommand extends Command {
  constructor(a, workDir = '.') {
    super(a, workDir);
  }

  static argumentType = ArgumentType;

  /* prettier-ignore */ get includes() { return  this.toObject().includes; }
  /* prettier-ignore */ get defines() { return this.toObject().defines; }
  /* prettier-ignore */ get cflags() { let { flags, includes, defines } = this.toObject(); return (includes ?? []) .map(inc => '-I' + inc) .concat((defines ?? []).map(def => '-D' + def)) .concat(flags); }
  /* prettier-ignore */ get flags() {return this.toObject().flags; }
  /* prettier-ignore */ get args() { return this.toObject().args; }
  /* prettier-ignore */ get sources() { return (this.toObject().args ?? []).filter(arg => arg != this.output); }

  set sources(arg) {
    let { sources } = this;
    let idx = this.indexOf(sources[0]);

    if(!Array.isArray(arg)) arg = [arg];
    this.remove(...sources);

    this.splice(idx, 0, ...arg);
  }

  get source() {
    let { sources } = this;
    if(sources.length > 1) throw new Error(`CompileCommand has more than 1 source`);
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
    for(let s of this) {
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

define(CompileCommand.prototype, { [Symbol.toStringTag]: 'CompileCommand', [Symbol.species]: CompileCommand });

export class LinkCommand extends Command {
  constructor(a, workDir = '.') {
    super(a, workDir);
  }

  get objects() {
    return [...this].filter(ArgumentIs(undefined)).filer(arg => arg != this.output);
  }
}

define(LinkCommand.prototype, { [Symbol.toStringTag]: 'LinkCommand', [Symbol.species]: LinkCommand });

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
}

export function ArgumentIs(str_or_regex) {
  return types.isRegExp(str_or_regex) ? f => str_or_regex.test(ArgumentType(f)) : f => ArgumentType(f) == str_or_regex;
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

export function CommandOutput(command, ...args) {
  const i = command.findIndex(ArgumentIs('output'));
  const j = command[cmdIndex] == '-o' ? 1 : 0;

  if(args.length > 0) command[i + j] = (j ? '' : '-o') + args[0];

  return command[i + j]?.slice(0, j ? 0 : 2);
}

export function MakeCommand(array_or_string) {
  if(typeof array_or_string == 'string') array_or_string = [...array_or_string.matchAll(/"(\\.|[^"])*"|'(\\.|[^'])'|([^\s]+)/g)].map(([m]) => (/^('.*'|".*")$/.test(m) ? m.slice(1, -1) : m));

  return new ({ link: LinkCommand }[CommandType(array_or_string)] ?? CompileCommand)(array_or_string);
}

for(let subclass of [CompileCommand, LinkCommand])
  define(subclass.prototype, {
    get output() {
      let i = this.findIndex(a => /^-o($|)/.test(a));
      if(this[i] == '-o') return this[++i];
      return this[i].slice(2);
    },

    set output(arg) {
      let i = this.findIndex(a => /^-o($|)/.test(a));
      if(this[i] == '-o') this[++i] = arg;
      else this[i] = '-o' + arg;
    }
  });

export function NinjaRule(command) {
  /* if(!new.target) return new NinjaRule(command);*/
}

export default CompileCommand;
