//import Util from './util.js';
//import inspect from './inspect.js';

const zip = a =>
  a
    .reduce((a, b) => (a.length > b.length ? a : b), [])
    .map((_, i) => a.map(arr => arr[i]));
const once = (fn, thisObj) => {
  let ran, ret;
  return async function(...args) {
    return ran
      ? ret
      : ((ran = true), (ret = await fn.call(thisObj || this, ...args)));
  };
};

function QuickJSSpawn(os, ffi) {
  //console.log('QuickJSSpawn', { os, ffi });
  //console.log('os:', os);
  //console.log('ffi:', ffi);

  if(typeof os.exec == 'function')
    return (args, options = { block: false }) => {
      let { stdio, ...opts } = options;
      stdio = (stdio || []).concat(['pipe', 'pipe', 'pipe']).slice(0, 3);

      let pipes = stdio.map((mode, chan) =>
        mode != 'pipe'
          ? [chan, undefined]
          : [...os.pipe()][chan == 0 ? 'slice' : 'reverse']()
      );

      let [cfds, pfds] = zip(pipes);
      //console.log('pipes:', console.config({ compact: -1 }), pipes);

      opts.stdio = cfds[0];
      opts.stdout = cfds[1];
      opts.stderr = cfds[2];
      //console.log('exec()', console.config({ compact: 1 }), { args, opts });

      let ret = os.exec(args, opts);

      cfds.forEach((fd, i) => stdio[i] == 'pipe' && os.close(fd));

      ret = opts.block
        ? { exitCode: ret }
        : {
            pid: ret,
            wait() {
              return new Promise((resolve, reject) => {
                //console.log('wait()');
                let ret = os.waitpid(this.pid, 0);
                //console.log('waitpid() =', ret);
                if(ret[1] !== undefined) this.exitCode = (ret[1] & 0xff0) >> 8;
                resolve([ret[0], this.exitCode]);
              });
            }
          };
      if(pfds[0]) ret.stdin = MakeWriteStream(pfds[0]);
      if(pfds[1]) ret.stdout = MakeReadStream(pfds[1]);
      if(pfds[2]) ret.stderr = MakeReadStream(pfds[2]);

      // console.log('spawn', console.config({ compact: 1 }),ret);

      return ret;
    };

  function MakeReadStream(fd) {
    return {
      fd,
      read(buffer, offset, length) {
        return WaitFd(this.fd, false)
          .then(() => os.read(this.fd, buffer, offset, length))
          .catch(() => -11);
      }
    };
  }
  function MakeWriteStream(fd) {
    return {
      fd,
      write(buffer, offset, length) {
        return WaitFd(this.fd, true)
          .then(() => os.write(this.fd, buffer, offset, length))
          .catch(() => -11);
      }
    };
  }

  function WaitFd(fd, write = false, timeout) {
    let timerId;
    return new Promise((resolve, reject) => {
      setupHandlers(() => {
          destroyHandlers();
          resolve();
        },
        () => {
          destroyHandlers();
          reject();
        },
        timeout
      );
    });

    function setupHandlers(ok, timeout, msecs) {
      if(msecs !== undefined)
        timerId = os.setTimeout(() => {
          //console.log('timeout', msecs);
          timeout();
        }, msecs);
      (write ? os.setWriteHandler : os.setReadHandler)(fd, () => {
        //console.log('ok');
        ok();
      });
    }
    function destroyHandlers() {
      (write ? os.setWriteHandler : os.setReadHandler)(fd, null);
      if(timerId !== undefined) os.clearTimeout(timerId);
    }
  }
}

function NodeJSSpawn(child_process) {
  if(typeof child_process.spawn == 'function')
    return (args, options = {}) => {
      const { stdin, stdout, stderr, ...restOfOptions } = options;
      let command = args.shift();
      let ret = child_process.spawn(command, args, {
        stdio: [stdin, stdout, stderr]
      });

      ret.wait = function() {
        const pid = this.pid;
        return new Promise((resolve, reject) => {
          this.once('exit', (code, signal) => resolve([pid, code]));
        });
      };
      return ret;
    };
}

export async function CreatePortableSpawn(ctor, ...args) {
  //console.log('CreatePortableSpawn', ctor, ...args);
  const imports = await Promise.all(args);
  //console.log('CreatePortableSpawn', ...imports);

  return ctor(...imports);
}

export async function GetPortableSpawn() {
  let spawnFn, err;
  //console.log('GetPortableSpawn');
  try {
    spawnFn = await QuickJSSpawn(await import('os'), await import('ffi.so'));
  } catch(error) {
    err = error;
  }
  if(spawnFn && !err) return spawnFn;
  err = null;
  try {
    spawnFn = await CreatePortableSpawn(NodeJSSpawn, import('child_process'));
  } catch(error) {
    err = error;
  }
  if(spawnFn && !err) return spawnFn;
}

const InitPortableSpawn = once(PortableSpawn);

export async function PortableSpawn(fn = spawn => (globalThis.spawn = spawn)) {
  //console.log('PortableSpawn', { fn: fn + '' });
  const spawnFn = await GetPortableSpawn(); //InitPortableSpawn();
  //console.log('PortableSpawn', { spawnFn });
  try {
    fn(spawnFn);
  } catch(error) {}

  try {
    return (globalThis.spawn = spawnFn);
  } catch(error) {
    try {
      return (global.spawn = spawnFn);
    } catch(error) {}
  }
  return spawnFn;
}

export default PortableSpawn;
