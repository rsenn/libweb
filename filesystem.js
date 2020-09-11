import Util from './util.js';

export function QuickJSFileSystem(std, os) {
  const CharWidth = {
    1: Uint8Array,
    2: Uint16Array,
    4: Uint32Array
  };

  function ArrayBufToString(buf, bytes = 1) {
    return String.fromCharCode(...new CharWidth[bytes](buf));
  }

  function StringToArrayBuf(str, bytes = 1) {
    const buf = new ArrayBuffer(str.length * bytes);
    const view = new CharWidth[bytes](buf);
    for(let i = 0, strLen = str.length; i < strLen; i++) view[i] = str.charCodeAt(i);
    return buf;
  }
  function CreateBuffer(bytes) {
    return new ArrayBuffer(bytes);
  }
  return {
    Stats: class Stats {
      constructor(st) {
        this.mode = st.mode;

        //  if(Object.hasOwnProperty(st, prop))
        for(let prop in st) this[prop] = st[prop];
      }
      isDirectory() {
        return !!(this.mode & os.S_IFDIR);
      }
      isCharacterDevice() {
        return !!(this.mode & os.S_IFCHR);
      }
      isBlockDevice() {
        return !!(this.mode & os.S_IFBLK);
      }
      isFile() {
        return !!(this.mode & os.S_IFREG);
      }
      isFIFO() {
        return !!(this.mode & os.S_IFIFO);
      }
      isSymbolicLink() {
        return !!(this.mode & os.S_IFLNK);
      }
      isSocket() {
        return !!(this.mode & os.S_IFSOCK);
      }
    },
    buffer(bytes) {
      return CreateBuffer(bytes);
    },
    bufferFrom(chunk, encoding = 'utf-8') {
      return StringToArrayBuf(chunk, 1);
    }, 

      bufferToString(buf, n = 1) {
      return ArrayBufToString(buf, n);
    },
    open(filename, flags = 'r', mode = 0o644) {
      let res = { errno: 0 };
      let fd = std.open(filename, flags, res);
      if(!res.errno) return fd;

      return -res.errno;
    },
    close(fd) {
      return fd.close();
    },

    read(fd, buf, offset, length) {
      let ret, err;
      let retFn = (r) => err || r;
      length = length || 1024;
      offset = offset || 0;
      if(!buf) {
        buf = CreateBuffer(length);
        retFn = (r) => {
          if(r > 0) {
            let b = r < buf.byteLength ? buf.slice(0, r) : buf;
            /* b[Symbol.toStringTag] = */ b.toString = () => ArrayBufToString(b);
            return b;
          }
          return err || r;
        };
      }
      ret = fd.read(buf, offset, length);
      err = ret > 0 ? undefined : -1;
      return retFn(ret);
    },
    write(fd, data, offset, length) {
      if(!(data instanceof ArrayBuffer)) data = StringToArrayBuf(data);
      let ret = fd.write(data, offset || 0, length || data.byteLength);
      let err = ret > 0 ? undefined : (std.clearerr(), -1);
      return err || ret;
    },

    readFile(filename) {
      let buf,
        size,
        res = { errno: 0 };
      let file = std.open(filename, 'r', res);
      if(!res.errno) {
        file.seek(0, std.SEEK_END);
        size = file.tell();
        file.seek(0, std.SEEK_SET);
        buf = new ArrayBuffer(size);
        file.read(buf, 0, size);
        //buf = file.readAsString(/*size*/);
        file.close();
        return ArrayBufToString(buf);
      }
      return -res.errno;
    },
    writeFile(filename, data, overwrite = true) {
      let buf,
        bytes,
        res = { errno: 0 };
      let file = std.open(filename, overwrite ? 'w' : 'wx', res);
      // console.log('writeFile', filename, data.length, file, res.errno);
      if(!res.errno) {
        buf = typeof data == 'string' ? StringToArrayBuf(data) : data;
        bytes = file.write(buf, 0, buf.byteLength);
        file.flush();
        res = file.close();
        if(res < 0) return res;
        return bytes;
      }
      return -res.errno;
    },
    exists(path) {
      let file = std.open(path, 'r');
      let res = file != null;
      if(file) file.close();
      return res;
    } /**/,
    size(filename) {
      let bytes,
        res = { errno: 0 };
      let file = std.open(filename, 'r', res);
      if(!res.errno) {
        file.seek(0, std.SEEK_END);
        bytes = file.tell();
        res = file.close();
        if(res < 0) return res;
        return bytes;
      }
      return -res.errno;
    },
    stat(path, cb) {
      let [st, err] = os.stat(path);
      st = err ? null : new this.Stats(st);
      return typeof cb == 'function' ? cb(err, st) : err ? err : st;
    },
    lstat(path, cb) {
      let [st, err] = os.lstat(path);
      st = err ? null : new this.Stats(st);
      return typeof cb == 'function' ? cb(err, st) : err ? err : st;
    },

    realpath(path, cb) {
      let [str, err] = os.realpath(path);
      return typeof cb == 'function' ? cb(err, st) : err ? err : str;
    },
    readdir(dir, cb) {
      let [arr, err] = os.readdir(dir);
      return typeof cb == 'function' ? cb(err, st) : err ? err : arr;
    },
    getcwd(cb) {
      let [wd, err] = os.getcwd();
      return typeof cb == 'function' ? cb(err, st) : err ? err : wd;
    },
    chdir(path) {
      let err = os.chdir(path);
      return err;
    }
  };
}

export function NodeJSFileSystem(fs) {
  function CreateBuffer(bytes = 1) {
    const buf = Buffer.alloc(bytes);
    return buf;
  }
  function StringToArrayBuf(chunk, encoding = 'utf-8') {
    return Buffer.from(chunk+'', encoding);
  }

  return {
    buffer(bytes) {
      return CreateBuffer(bytes);
    },
    bufferFrom(chunk, encoding = 'utf-8') {
      return StringToArrayBuf(chunk, encoding);
    },
    bufferToString(buf, encoding = 'utf-8') {
      return Buffer.from(buf).toString(encoding);
    },

     open(filename, flags = 'r', mode = 0o644) {
      let ret = -1;
      try {
        ret = fs.openSync(filename, flags, mode);
      } catch(error) {
        ret = new Number(-1);
        ret.message = error.message;
        ret.stack = error.stack;
      }
      return ret;
    },
    close(fd) {
      let ret;
      try {
        fs.closeSync(fd);
        ret = 0;
      } catch(error) {
        ret = new Number(-1);
        ret.message = error.message;
        ret.stack = error.stack;
      }
      return ret;
    },
    read(fd, buf, offset, length) {
      let ret,
        retFn = (r) => r;
      try {
        length = length || 1024;
        offset = offset || 0;
        if(!buf) {
          buf = CreateBuffer(length);
          retFn = (r) => (r > 0 ? buf.slice(0, r) : r);
        }
        ret = fs.readSync(fd, buf, offset, length, 0);
      } catch(error) {
        ret = new Number(-1);
        ret.message = error.message;
        ret.stack = error.stack;
      }
      return retFn(ret);
    },
    write(fd, data, offset, length) {
      let ret;
      try {
        ret = fs.writeSync(fd, data, offset, length);
      } catch(error) {
        ret = new Number(-1);
        ret.message = error.message;
        ret.stack = error.stack;
      }
      return ret;
    },
    readFile(filename) {
      let ret;
      try {
        ret = fs.readFileSync(filename, { encoding: 'utf-8' });
      } catch(error) {
        ret = new Number(-1);
        ret.message = error.message;
        ret.stack = error.stack;
      }
      return ret;
    },
    writeFile(filename, data, overwrite = true) {
      let fd, ret;
      try {
        fd = fs.openSync(filename, overwrite ? 'w' : 'wx');
        ret = fs.writeSync(fd, data);
        fs.closeSync(fd);
      } catch(error) {
        ret = new Number(-1);
        ret.message = error.message;
        ret.stack = error.stack;
      }
      return ret;
    },
    exists(filename) {
      return fs.existsSync(filename);
    },
    realpath(filename) {
      return fs.realpathSync(filename);
    },
    size(filename) {
      let st = fs.statSync(filename);
      return st.size;
    },
    stat(filename, dereference = false) {
      return dereference ? fs.statSync(filename) : fs.lstatSync(filename);
    },
    readdir(dir) {
      return fs.readdirSync(dir);
    },
    getcwd(cb) {
      let [err, wd] = [undefined, process.cwd];
      return (cb && cb(err, wd)) || err ? err : wd;
    },
    chdir(path) {
      let err;
      try {
        process.chdir(path);
      } catch(error) {
        err = error;
      }
      return err || 0;
    },
    rename(filename, to) {
      try {
        fs.renameSync(filename, to);
      } catch(err) {}
      return !this.exists(filename) && this.exists(to);
    }
  };
}

export async function CreatePortableFileSystem(ctor, ...args) {
  return ctor(...(await Promise.all(args)));
}

export async function GetPortableFileSystem() {
  let fs, err;
  try {
    fs = await CreatePortableFileSystem(QuickJSFileSystem, import('std'), import('os'));
  } catch(error) {
    err = error;
  }
  if(fs && !err) return fs;
  err = null;
  try {
    fs = await CreatePortableFileSystem(NodeJSFileSystem, import('fs'));
  } catch(error) {
    err = error;
  }

  if(fs && !err) return fs;
}

export async function PortableFileSystem(fn = (fs) => true) {
  return await Util.memoize(async function () {
    const fs = await GetPortableFileSystem();

    try {
      return (globalThis.filesystem = fs);
    } catch(error) {
      try {
        return (global.filesystem = fs);
      } catch(error) {
        try {
          return (window.filesystem = fs);
        } catch(error) {
          try {
            return (window.filesystem = fs);
          } catch(error) {}
        }
      }
    }
    return fs;
  })().then((fs) => (fn(fs), fs));
}

export default PortableFileSystem;
