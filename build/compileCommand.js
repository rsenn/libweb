import inspect from './objectInspect.js';
import * as util from './misc.js';
import * as path from './path.js';


export class CompileCommand extends Array {
  constructor(a, workDir = '.') {
    super();
    this.workDir = path.absolute(typeof workDir == 'string' ? workDir : '.');
    if(typeof a == 'string') a = a.split(/\s+/g);
    if(Array.isArray(a)) {
      this.splice(0, this.length);
      for(let item of a) this.pushUnique(item);
    }
  }

  static argumentType = ArgumentType;

  static [Symbol.species] = Array;

  /* prettier-ignore */ get program() { return this.toObject().program; }
  /* prettier-ignore */ set program(arg) { this[0] = arg; }
  /* prettier-ignore */ get output() { return this.toObject().output; }
  set output(arg) {
    let i = this.findIndex(a => /^-o($|)/.test(a));
    if(this[i] == '-o') i++;
    this[i] = arg;
  }
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

  typeFlags(type) {
    const { flags } = this;
    let p = typeof type == 'string' ? f => ArgumentType(f) == type : f => type.test(ArgumentType(f));
    return flags.filter(p);
  }

  /* prettier-ignore */ get warnFlags() { return this.typeFlags('warning'); }
  /* prettier-ignore */ get debugFlags() { return this.typeFlags('debug'); }
  /* prettier-ignore */ get optFlags() { return this.typeFlags(/^opt/); }
  /* prettier-ignore */ get depFlags() { return this.typeFlags(/^dep/); }
  /* prettier-ignore */ get modeFlags() { return this.typeFlags('mode'); }

  /* prettier-ignore */ isCompile() { const { type } = this; return type == 'compile'; }
  /* prettier-ignore */ isPreprocess() { const { type } = this; return type == 'preprocess'; }
  /* prettier-ignore */ isAssemble() { const { type } = this; return type == 'assemble'; }
  /* prettier-ignore */ isLink() { const { type } = this; return type == 'link'; }

  get type() {
    const { modeFlags } = this;
    const last = modeFlags[modeFlags.length - 1];

    switch (last[1]) {
      case 'c':
        return 'compile';
      case 'E':
        return 'preproc';
      case 'S':
        return 'assemble';
      default:
        return 'link';
    }
  }

  toString(delim) {
    return this.join(delim ? delim : ' ');
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
    if(includes && includes.length) r.includes = includes/*.map(inc => path.relative(inc, this.workDir))*/;
    if(defines && defines.length) r.defines = defines;
    if(flags && flags.length) r.flags = flags;
    if(args && args.length) r.args = args;
    return r;
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

  [Symbol.inspect /*?? Symbol.for('nodejs.util.inspect.custom')*/]() {
    return inspect(this.toObject(), {
      colors: true,
      compact: false,
      maxStringLength: Infinity,
      maxArrayLength: Infinity
    });
  }
}

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

util.extendArray(CompileCommand.prototype);

export function NinjaRule(command) {
 /* if(!new.target) return new NinjaRule(command);*/

  
}

export default CompileCommand;
