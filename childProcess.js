import Util from './util.js';
import PortableFileSystem from './filesystem.js';

export const SIGHUP = 1;
export const SIGINT = 2;
export const SIGQUIT = 3;
export const SIGILL = 4;
export const SIGTRAP = 5;
export const SIGABRT = 6;
export const SIGIOT = 6;
export const SIGBUS = 7;
export const SIGFPE = 8;
export const SIGKILL = 9;
export const SIGSEGV = 11;
export const SIGPIPE = 13;
export const SIGALRM = 14;
export const SIGTERM = 15;
export const SIGSTKFLT = 16;
export const SIGCHLD = 17;
export const SIGCONT = 18;
export const SIGSTOP = 19;
export const SIGTSTP = 20;
export const SIGTTIN = 21;
export const SIGTTOU = 22;
export const SIGURG = 23;
export const SIGXCPU = 24;
export const SIGXFSZ = 25;
export const SIGVTALRM = 26;
export const SIGPROF = 27;
export const SIGWINCH = 28;
export const SIGIO = 29;
export const SIGPWR = 30;
export const SIGSYS = 31;
export const SIGUNUSED = 31;

export function QuickJSChildProcess(fs, std, os) {
  let self;

  function strerr(ret) {
    const [str, err] = ret;
    if(err) {
      errno = err;
      return null;
    }
    return str;
  }

  function numerr(ret) {
    if(ret < 0) {
      switch (ret) {
        case -127:
          ret = -2;
          break;
      }
      self.errno = -ret;
      ret = -1;
    } else {
      ret = 0;
    }
    return ret || 0;
  }

  function dopipe(obj, name) {
    let [rd, wr] = os.pipe();
    let ret;
    if(!obj.stdio) obj.stdio = [];

    switch (name) {
      case 'stdin': {
        obj.stdio[0] = wr;
        ret = rd;
        break;
      }
      case 'stdout': {
        obj.stdio[1] = rd;
        ret = wr;
        break;
      }
      case 'stderr': {
        obj.stdio[2] = rd;
        ret = wr;
        break;
      }
    }
    return ret;
    if(name.endsWith('in')) {
      obj[name] = wr; //fs.fdopen(wr, 'w');
      return rd;
    } else {
      obj[name] = rd; //fs.fdopen(rd, 'r');
      return wr;
    }
  }

  self = function ChildProcess(command, args = [], options = {}) {
    console.log('ChildProcess', { command, args, options });
    let { file, stdio, env, block = false, ...opts } = options;
    let obj = {};
    if(file) opts.file = file;
    if(stdio) {
      const [stdin, stdout, stderr] = stdio;
      if(stdin)
        opts.stdin =
          stdin != 'pipe' ? (typeof stdin.fileno == 'function' ? stdin.fileno() : stdin) : dopipe(obj, 'stdin');
      if(stdout)
        opts.stdout =
          stdout != 'pipe' ? (typeof stdout.fileno == 'function' ? stdout.fileno() : stdout) : dopipe(obj, 'stdout');
      if(stderr)
        opts.stderr =
          stderr != 'pipe' ? (typeof stderr.fileno == 'function' ? stderr.fileno() : stderr) : dopipe(obj, 'stderr');
    }
    opts = { ...opts, block };
    if(env) opts.env = env;

    let ret = os.exec([command, ...args], opts);

    for(let channel of ['stdin', 'stdout', 'stderr'])
      if(opts[channel] != stdio[channel] && typeof opts[channel] == 'number') os.close(opts[channel]);

    let exitCode, pid;
    if(block) {
      exitCode = numerr(-ret);
    } else {
      if(ret >= 0) pid = ret;
      exitCode = numerr(ret);
      obj.wait = function(options = os.WNOHANG) {
        return new Promise((resolve, reject) => {
          let [ret, status] = os.waitpid(pid, options);
          let exitCode = (status & 0xff00) >> 8;
          let termSig = status & 0x7f;
          numerr(ret);
          /*if(termSig == 0) resolve(exitCode);
          else*/ resolve([exitCode, termSig]);
        });
      };
      obj.kill = function(signum = SIGTERM) {
        return numerr(os.kill(this.pid, signum));
      };
    }

    os.signal(17, arg => {
      let [ret, status] = os.waitpid(pid, options);
      //console.log('SIGCHLD', { pid, arg, ret, status });
      /*if(typeof obj.stdin == 'number') os.close(obj.stdin);
      if(typeof obj.stdout == 'number') os.close(obj.stdout);
      if(typeof obj.stderr == 'number') os.close(obj.stderr);*/
    });
    return {
      ...obj,
      exitCode,
      pid
    };
  };

  Object.defineProperties(self, {
    errstr: {
      get() {
        return std.strerror(this.errno);
      }
    },
    strerror: {
      value(err) {
        return std.strerror(err);
      }
    }
  });

  return self;
}

export function NodeJSChildProcess(fs, tty, child_process) {
  let errno = 0;

  function CatchError(fn) {
    let ret;
    try {
      ret = fn();
    } catch(error) {
      ret = new Number(-1);
      ret.message = error.message;
      ret.stack = error.stack;

      if(error.errno != undefined) errno = error.errno;
    }
    return ret || 0;
  }

  return function(command, args = [], options = {}) {
    let obj;
    let { file, stdio, ...opts } = options;
    if(file) {
      opts.argv0 = command;
      command = file;
    }

    if(stdio) {
      opts.stdio = stdio.map(strm =>
        typeof strm == 'object' && strm != null && typeof strm.fd == 'number' ? strm.fd : strm
      );
    }
    //  console.log('child', { command, args, opts });
    obj = child_process.spawn(command, args, opts);

    //console.log('child', Util.getMethodNames(obj, 3, 0));

    // obj.stderr.on('data', data => console.log('child data', data.toString()));

    obj.wait = function(options = {}) {
      return new Promise((resolve, reject) => {
        obj.on('exit', (code, signal) => {
          // console.log('child exit', { code, signal });
          if(code !== null) resolve(code);
          else reject(signal);
        });
      });
    };
    return obj;
  };
}

export function BrowserChildProcess(TextDecoderStream, TransformStream, WritableStream) {
  return function(command, args = [], options = {}) {};
}

export async function CreatePortableChildProcess(ctor, ...args) {
  return ctor(...(await Promise.all(args)));
}

export async function GetPortableChildProcess(set = (cp, fs, std, os) => true) {
  let fs, err;
  let a = [];
  try {
    a = [await PortableFileSystem(), await import('std'), await import('os')];
    fs = await CreatePortableChildProcess(QuickJSChildProcess, ...a);
  } catch(error) {
    err = error;
  }
  if(fs && !err) {
    set(fs, ...a);
    return fs;
  }
  err = null;
  try {
    a = [await import('fs'), await import('tty'), await import('child_process')];
    fs = await CreatePortableChildProcess(NodeJSChildProcess, ...a);
  } catch(error) {
    err = error;
  }

  if(fs && !err) {
    set(fs, ...a);
    return fs;
  }
  err = null;
  try {
    fs = await CreatePortableChildProcess(BrowserChildProcess);
  } catch(error) {
    err = error;
  }

  if(fs && !err) {
    set(fs, ...a);
    return fs;
  }
}

export async function PortableChildProcess(fn = fs => true) {
  return await Util.memoize(async function() {
    const fs = await GetPortableChildProcess(fn);

    try {
      return (globalThis.childProcess = fs);
    } catch(error) {
      try {
        return (global.childProcess = fs);
      } catch(error) {
        try {
          return (window.childProcess = fs);
        } catch(error) {
          try {
            return (window.childProcess = fs);
          } catch(error) {}
        }
      }
    }
    return fs;
  })() /*.then(fs => (fn(fs), fs))*/;
}

export default PortableChildProcess;
