import inspect from 'inspect';


export class CompileCommand extends Array {
  constructor(arg) {
    super();
    if(typeof arg == 'string') arg = arg.split(/\s+/g);
    if(Array.isArray(arg)) this.splice(0, this.length, ...arg);
  }

  get program() {
    return this.toObject().program;
  }

  get output() {
    return this.toObject().output;
  }

  get includes() {
    return this.toObject().includes;
  }

  get defines() {
    return this.toObject().defines;
  }

  get flags() {
    return this.toObject().flags;
  }

  get args() {
    return this.toObject().args;
  }

  get  warnFlags() {
    return this.flags.filter(f => /^-w/i.test(f));
  }

  get  debugFlags() {
    return this.flags.filter(f => /^-g/i.test(f));
  }

  get  optFlags() {
    return this.flags.filter(f => /^-O/.test(f));
  }

  isCompile() {
    return this.flags.indexOf('-c') != -1;
  }

  isPreprocess() {
    return this.flags.indexOf('-E') != -1;
  }

  isAssemble() {
    return this.flags.indexOf('-S') != -1;
  }

  isLink() {
    return !this.isCompile() && !this.isPreprocess() && !this.isAssemble();
  }

  get type() {
    if(this.isCompile()) return 'compile';
    if(this.isPreprocess()) return 'preproc';
    if(this.isAssemble()) return 'assemble';
    if(this.isLink()) return 'link';
  }

  toString(sep) {
    return this.join(sep ? sep : ' ');
  }

  toObject() {
    let program,
      prev,
      includes = [],
      defines = [],
      flags = [],
      i = 0,
      output,
      args = [];
    for(let arg of this) {
      if(i == 0) program = arg;
      else if(prev == '-I') includes.push(arg);
      else if(arg.startsWith('-I') && arg.length > 2) includes.push(arg.slice(2));
      else if(prev == '-D') defines.push(arg);
      else if(arg.startsWith('-D') && arg.length > 2) defines.push(arg.slice(2));
      else if(prev == '-o') {
        if(flags[flags.length - 1] == '-o') flags.pop();
        output = arg;
      } else if(arg.startsWith('-o') && arg.length > 2) output = arg.slice(2);
      else if(arg.startsWith('-')) flags.push(arg);
      else args.push(arg);
      prev = arg;
      i++;
    }
    return { program, output, includes, defines, flags, args };
  }

  [Symbol.inspect]() {
    const { program, output, includes, defines, flags, args } = this;
    return inspect(
      { program, output, includes, defines, flags, args },
      {
        colors: true,
        compact: 1,
        maxStringLength: Infinity,
        maxArrayLength: Infinity,
        stringBreakNewline: false,
        breakLength: std.getenv()
      }
    );
  }
}

export default CompileCommand;
