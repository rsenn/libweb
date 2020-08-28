export function QuickJSFileSystem(std, os) {
  const CharWidth = {
    1: Uint8Array,
    2: Uint16Array,
    4: Uint32Array
  };

  function ArrayBufToString(buf, bytes = 1) {
    return String.fromCharCode.apply(null, new CharWidth[bytes](buf));
  }

  function StringToArrayBuf(str, bytes = 1) {
    const buf = new ArrayBuffer(str.length * bytes);
    const view = new CharWidth[bytes](buf);
    for(let i = 0, strLen = str.length; i < strLen; i++) view[i] = str.charCodeAt(i);
    return buf;
  }

  return {
    Stats: class Stats {
      constructor(st) {
        this.mode = st.mode;
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
      return res.errno;
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
      return (cb && cb(err, st)) || err ? err : st;
    },
    lstat(path, cb) {
      let [st, err] = os.lstat(path);
      st = err ? null : new this.Stats(st);
      return (cb && cb(err, st)) || err ? err : st;
    },

    realpath(path, cb) {
      let [str, err] = os.realpath(path);
      return (cb && cb(err, str)) || err ? err : str;
    },
    readdir(dir, cb) {
      let [arr, err] = os.readdir(dir);
      return (cb && cb(err, arr)) || err ? err : arr;
    },
    getcwd(cb) {
      let [wd, err] = os.getcwd();
      return (cb && cb(err, wd)) || err ? err : wd;
    },
    chdir(path) {
      let err = os.chdir(path);
      return err;
    }
  };
}

export function NodeJSFileSystem(fs) {
  return {
    readFile(filename) {
      return fs.readFileSync(filename, { encoding: 'utf-8' });
    },
    writeFile(filename, data, overwrite = true) {
      let fd = fs.openSync(filename, overwrite ? 'w' : 'wx');
      let r = fs.writeSync(fd, data);
      fs.closeSync(fd);
      return r;
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
    }
  };
}

export async function PortableFileSystem() {
  let fs, err;

  try {
    fs = QuickJSFileSystem(...(await Promise.all([import('std'), import('os')])));
  } catch(error) {
    err = error;
  }

  if(fs && !err) return fs;
  err = null;

  try {
    fs = NodeJSFileSystem(await import('fs'));
  } catch(error) {
    err = error;
  }

  if(fs && !err) return fs;
}

export default PortableFileSystem;
