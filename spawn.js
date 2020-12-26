import Util from './util.js';
import inspect from './inspect.js';

function QuickJSSpawn(os, ffi) {
  console.log('os:', os);
  console.log('ffi:', ffi);

  if(typeof os.exec == 'function')
    return (args, options = { block: false }) => {
      let { stdio, ...opts } = options;
      stdio = (stdio || []).concat(['pipe', 'pipe', 'pipe']).slice(0, 3);

      let pipes = stdio.map((mode, chan) =>
        mode != 'pipe' ? [chan, undefined] : [...os.pipe()][chan == 0 ? 'slice' : 'reverse']()
      );

      let [cfds, pfds] = Util.zip(pipes);
      console.log('pipes:', inspect(pipes));
      console.log('spawn:', inspect({ pipes, cfds, pfds }));

      opts.stdio = cfds[0];
      opts.stdout = cfds[1];
      opts.stderr = cfds[2];

      let ret = os.exec(args, opts);
      ret = opts.block
        ? { exitCode: ret }
        : {
            pid: ret,
            wait() {
              return new Promise((resolve, reject) => {
                let ret = os.waitpid(this.pid, 0);
                if(ret[1] !== undefined) this.exitCode = (ret[1] & 0xff0) >> 8;
                resolve([ret[0], this.exitCode]);
              });
            }
          };
      if(pfds[0]) ret.stdin = MakeWriteStream(pfds[0]);
      if(pfds[1]) ret.stdout = MakeReadStream(pfds[1]);
      if(pfds[2]) ret.stderr = MakeReadStream(pfds[2]);
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
          console.log('timeout', msecs);
          timeout();
        }, msecs);
      (write ? os.setWriteHandler : os.setReadHandler)(fd, () => {
        console.log('ok');
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
      let ret = child_process.spawn(command, args, { stdio: [stdin, stdout, stderr] });

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
  return ctor(...(await Promise.all(args)));
}

export async function GetPortableSpawn() {
  let spawnFn, err;
  try {
    spawnFn = await CreatePortableSpawn(QuickJSSpawn, import('os'), import('ffi'));
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

export async function PortableSpawn(fn = spawnFn => true) {
  return await Util.memoize(async function() {
    const spawnFn = await GetPortableSpawn();

    try {
      return (globalThis.spawn = spawnFn);
    } catch(error) {
      try {
        return (global.spawn = spawnFn);
      } catch(error) {}
    }
    return spawnFn;
  })().then(spawnFn => (fn(spawnFn), spawnFn));
}

export default PortableSpawn;
