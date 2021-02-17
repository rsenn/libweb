import Util from './util.js';
import { StringReader, ChunkReader, DebugTransformStream } from './stream/utils.js';

export const SEEK_SET = 0;
export const SEEK_CUR = 1;
export const SEEK_END = 2;

export const O_RDONLY = 0x00;
export const O_WRONLY = 0x01;
export const O_RDWR = 0x02;
export const O_ACCMODE = 0x03;
export const O_APPEND = 0x08;
export const O_BLKSEEK = 0x40;
export const O_CREAT = 0x00000100;
export const O_TRUNC = 0x00000200;
export const O_EXCL = 0x00000400;
export const O_LARGEFILE = 0x00000800;
export const O_ASYNC = 0x00002000;
export const O_NONBLOCK = 0x00010004;
export const O_NOCTTY = 0x00020000;
export const O_DSYNC = 0x00040000;
export const O_RSYNC = 0x00080000;
export const O_NOATIME = 0x00100000;
export const O_CLOEXEC = 0x00200000;

export function QuickJSFileSystem(std, os) {
  let errno = 0;
  const { O_RDONLY, O_WRONLY, O_RDWR, O_APPEND, O_CREAT, O_EXCL, O_TRUNC, O_TEXT } = os;
  const { EINVAL, EIO, EACCES, EEXIST, ENOSPC, ENOSYS, EBUSY, ENOENT, EPERM } = std.Error;

  if(globalThis.os === undefined) globalThis.os = os;
  if(globalThis.std === undefined) globalThis.std = std;

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
      errno = -ret;
      return -1;
    }
    return ret || 0;
  }
  return {
    O_RDONLY,
    O_WRONLY,
    O_RDWR,
    O_APPEND,
    O_CREAT,
    O_EXCL,
    O_TRUNC,
    O_TEXT,
    get errno() {
      return errno;
    },
    get errstr() {
      return std.strerror(errno);
    },
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
      return CreateArrayBuffer(bytes);
    },
    bufferFrom(chunk, encoding = 'utf-8') {
      return StringToArrayBuffer(chunk, 1);
    },
    bufferSize(buf) {
      return ArrayBufferSize(buf);
    },
    bufferToString(buf, n = 1) {
      if(typeof buf == 'string') return buf;
      return ArrayBufferToString(buf, n);
    },
    fopen(filename, flags = 'r', mode = 0o644) {
      let res = { errno: 0 };
      let file = std.open(filename, flags, res);
      if(!res.errno) return file;

      return numerr(-res.errno);
    },
    open(filename, flags = O_RDONLY, mode = 0x1a4) {
      return numerr(os.open(filename, flags, mode));
      /*  if(fd => 0) return fd;

      return fd;*/
    },
    fdopen(fd, flags = 'r') {
      let res = { errno: 0 };
      let file = std.fdopen(fd, flags, res);
      if(!res.errno) return file;

      return numerr(-res.errno);
    },
    close(fd) {
      return numerr(typeof fd == 'number' ? os.close(fd) : fd.close());
    },

    read(fd, buf, offset, length) {
      let ret;
      offset = offset || 0;
      length = length || buf.byteLength - offset;

      switch (typeof fd) {
        case 'number':
          ret = os.read(fd, buf, offset, length);
          break;
        default: ret = fd.read(buf, offset, length);
          break;
      }
      //  console.log("ret:", ret);
      return numerr(ret);
    },
    write(fd, data, offset, length) {
      if(!(data instanceof ArrayBuffer)) data = StringToArrayBuffer(data);

      offset ??= 0;
      length ??= data.byteLength;

      //console.log("filesystem.write", { data: this.bufferToString(data), offset, length });

      let ret;
      switch (typeof fd) {
        case 'number':
          ret = os.write(fd, data, offset, length);
          break;
        default: ret = fd.write(data, offset, length);
          break;
      }
      return numerr(ret);
    },
    readFile(filename, encoding = 'utf-8') {
      if(encoding == 'utf-8') return std.loadFile(filename);

      let data,
        size,
        res = { errno: 0 };
      let file = std.open(filename, 'r', res);
      if(!res.errno) {
        file.seek(0, std.SEEK_END);
        size = file.tell();
        file.seek(0, std.SEEK_SET);
        data = new ArrayBuffer(size);
        file.read(data, 0, size);
        //data = file.readAsString(/*size*/);
        file.close();
        if(encoding != null) data = ArrayBufferToString(data, encoding);
        return data;
      }
      return numerr(-res.errno);
    },
    writeFile(filename, data, overwrite = true) {
      let buf,
        bytes,
        res = { errno: 0 };

      if(0 && typeof data == 'string') {
        let file = std.open(filename, 'w+b', res);
        if(!res.errno) {
          file.puts(data);
          file.flush();
          bytes = file.tell();
          //console.log('writeFile:', { bytes, len: data.length, data: data.slice(-1) });
          file.close();
          return bytes;
        }
        return numerr(-res.errno);
      } else {
        let fd = this.open(filename, O_WRONLY | O_CREAT | (overwrite ? O_TRUNC : O_EXCL));
        //console.log('writeFile', filename, data, fd, res.errno);
        if(fd >= 0) {
          buf = typeof data == 'string' ? StringToArrayBuffer(data) : data;
          let arr = new Uint8Array(buf);
          if(arr[arr.length - 1] == 0) buf = buf.slice(0, -1);
          bytes = this.write(fd, buf, 0, buf.byteLength);
          //console.log('writeFile:', { bytes, len: buf.byteLength, buf: buf.slice(-3) });
          this.close(fd);
          return bytes;
        }
      }
      return fd;
    },
    exists(path) {
      let file = std.open(path, 'r');
      let res = file != null;
      if(file) file.close();
      return res;
    } /**/,
    seek(fd, offset, whence) {
      let ret;
      switch (typeof fd) {
        case 'number':
          ret = os.seek(fd, offset, whence);
          break;
        default: if (numerr(fd.seek(offset, whence)) == 0)
            ret = typeof offset == 'bigint' ? fd.tello() : fd.tell();
          break;
      }
      console.log('seek:', { offset, whence, ret });
      return ret;
    },
    tell(file) {
      switch (typeof file) {
        case 'number':
          return numerr(os.seek(file, 0, std.SEEK_CUR));
        default: return file.tell();
      }
    },
    size(file) {
      let bytes, pos;
      let fd = typeof file == 'number' ? file : this.open(file, 'r');
      pos = this.tell(fd);
      bytes = this.seek(fd, 0, std.SEEK_END);
      if(file !== fd) this.close(fd);
      return bytes;
    },
    stat(path, cb) {
      let [st, err] = os.stat(path);
      return err ? strerr([st, err]) : new this.Stats(st);
    },
    lstat(path, cb) {
      let [st, err] = os.lstat(path);
      return err ? strerr([st, err]) : new this.Stats(st);
    },

    realpath(path) {
      return strerr(os.realpath(path));
    },
    readlink(path) {
      return strerr(os.readlink(path));
    },
    symlink(target, path) {
      return numerr(os.symlink(target, path));
    },
    rename(oldname, newname) {
      return numerr(os.rename(oldname, newname));
    },
    readdir(path) {
      return strerr(os.readdir(path));
    },
    getcwd() {
      return strerr(os.getcwd());
    },
    chdir(path) {
      return numerr(os.chdir(path));
    },
    mkdir(path, mode = 0o777) {
      return numerr(os.mkdir(path, mode));
    },
    unlink(path) {
      return numerr(os.remove(path));
    },
    isatty(file) {
      let fd = this.fileno(file);
      return os.isatty(fd);
    },

    fileno(file) {
      if(typeof file == 'number') return file;
      if(typeof file == 'object' && file != null && typeof file.fileno == 'function')
        return file.fileno();
    },
    get stdin() {
      return std.in;
    },
    get stdout() {
      return std.out;
    },
    get stderr() {
      return std.err;
    },
    pipe() {
      let [rd, wr] = os.pipe();
      return [rd, wr];
    },
    waitRead(file) {
      let fd = this.fileno(file);
      return new Promise((resolve, reject) => {
        os.setReadHandler(fd, () => {
          os.setReadHandler(fd, null);
          resolve(file);
        });
      });
    },
    waitWrite(file) {
      let fd = this.fileno(file);
      return new Promise((resolve, reject) => {
        os.setWriteHandler(fd, () => {
          os.setWriteHandler(fd, null);
          resolve(file);
        });
      });
    },
    readAll(input, bufSize = 1024) {
      const buffer = this.buffer(bufSize);
      let output = '';
      let ret;
      do {
        //await this.waitRead(input);
        ret = this.read(input, buffer, 0, bufSize);
        //console.log('readAll', { ret, input: this.fileno(input), buffer });
        let str = this.bufferToString(buffer.slice(0, ret));
        output += str;
        if(ret < bufSize) break;
      } while(ret > 0);
      return output;
    }
  };
}

export function NodeJSFileSystem(fs, tty, process) {
  let errno = 0;

  function BufferAlloc(bytes = 1) {
    return Buffer.alloc(bytes);
  }
  function BufferSize(buf) {
    return buf.length;
  }
  function BufferFromString(str, encoding = 'utf-8') {
    return Buffer.from(str + '', encoding);
  }
  function BufferToString(buf, encoding = 'utf-8') {
    buf = buf instanceof Buffer ? buf : Buffer.from(buf);
    return buf.toString(encoding);
  }

  const seekMap = new Map();
  const sizeMap = new Map();
  const dataMap = new WeakMap();

  function SeekSet(fd, pos) {
    seekMap.set(fd, pos);
  }
  function SeekAdvance(fd, bytes) {
    let pos = SeekGet(fd) || 0;

    seekMap.set(fd, pos + bytes);
  }
  function SeekGet(fd) {
    return seekMap.get(fd);
  }

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

  function AddData(file, data) {
    let buf;
    //console.log(`AddData`, { file, data });
    if(data instanceof ArrayBuffer) data = new Uint8Array(data);
    if(dataMap.has(file)) buf = Buffer.concat([dataMap.get(file), data]);
    else buf = Buffer.from(data);
    dataMap.set(file, buf);
    return buf.length;
  }

  function GetData(file, data, length) {
    let buf, len;
    if(data instanceof ArrayBuffer) data = new Uint8Array(data);
    if(!(buf = dataMap.get(file))) return 0;
    buf.copy(data, 0, 0, (len = Math.min(buf.length, length)));
    buf = Buffer.from(buf.slice(len));
    dataMap.set(file, buf);
    return len;
  }

  function HasData(file, data, length) {
    let buf;
    if(!(buf = dataMap.get(file))) return 0;
    return buf.length;
  }

  return {
    get errno() {
      return Number(errno);
    },
    buffer(bytes) {
      return BufferAlloc(bytes);
    },
    bufferFrom(chunk, encoding = 'utf-8') {
      return BufferFromString(chunk, encoding);
    },
    bufferSize(buf) {
      return BufferSize(buf);
    },
    bufferToString(buf, encoding = 'utf-8') {
      return BufferToString(buf, encoding);
    },
    fileno(file) {
      if(typeof file == 'object' && file !== null && 'fd' in file) return file.fd;
      if(typeof file == 'number') return file;
    },
    open(filename, flags = 'r', mode = 0o644) {
      let fd = -1;
      try {
        fd = fs.openSync(filename, flags, mode);
      } catch(error) {
        fd = new Number(-1);
        fd.message = error.message;
        fd.stack = error.stack;
        return fd;
      }
      let ret;
      if(flags[0] == 'r') ret = fs.createReadStream(filename, { fd, flags, mode });
      else if(flags[0] == 'w') ret = fs.createWriteStream(filename, { fd, flags, mode });
      return Object.assign(ret, { fd, flags, mode });
    },
    close(file) {
      let fd = this.fileno(file);
      if(typeof file == 'object') dataMap.delete(file);

      return CatchError(() => {
        fs.closeSync(fd);

        seekMap.delete(fd);
        sizeMap.delete(fd);

        return 0;
      });
    },
    read(file, buf, offset, length) {
      let pos;

      //     file = this.fileno(file);
      //console.log('file.read', file.read);

      return CatchError(() => {
        length = length || 1024;
        offset = offset || 0;
        if(!buf) {
          buf = BufferAlloc(length);
          retFn = r => (r > 0 ? buf.slice(0, r) : r);
        }
        let ret;
        if(typeof file == 'number') {
          ret = fs.readSync(file, buf, offset, length, (pos = SeekGet(file)));
        } else {
          ret = file.read(length);
          //console.log('file.read()', { ret, length });
          if(typeof ret == 'object' && ret !== null) {
            ret.copy(buf, offset, 0, ret.length);
            ret = ret.length;
          } else {
            ret = 0;
          }
          ret = GetData(file, buf, length);
        }
        SeekAdvance(file, ret);
        return ret;
      });
    },
    write(file, data, offset, length) {
      let ret;
      let fd = this.fileno(file);

      if(length === undefined && data.length !== undefined) length = data.length;

      return CatchError(() => fs.writeSync(fd, data, offset, length));
    },
    readFile(filename, encoding = 'utf-8') {
      return CatchError(() => fs.readFileSync(filename, { encoding }));
    },
    writeFile(filename, data, overwrite = true) {
      return CatchError(() => {
        let fd, ret;
        fd = fs.openSync(filename, overwrite ? 'w' : 'wx');
        ret = fs.writeSync(fd, data);
        fs.closeSync(fd);
        return ret;
      });
      return ret;
    },
    exists(path) {
      return CatchError(() => fs.existsSync(path));
    },
    realpath(path) {
      return CatchError(() => fs.realpathSync(path));
    },
    symlink(target, path) {
      return CatchError(() => fs.symlinkSync(target, path));
    },
    readlink(path) {
      return CatchError(() => fs.readlinkSync(path));
    },
    seek(file, offset, whence = SEEK_SET) {
      let fd = this.fileno(file);
      let pos = SeekGet(fd) || 0;
      let size = this.size(fd);
      let newpos;
      switch (whence) {
        case SEEK_SET:
          newpos = offset;
          break;
        case SEEK_CUR:
          newpos = pos + offset;
          break;
        case SEEK_END:
          newpos = size + offset;
          break;
      }
      //  console.log('newpos:', newpos);
      if(newpos >= 0 && newpos < size) {
        SeekSet(fd, newpos);
        return newpos;
      }
      return -1;
    },
    tell(file) {
      return seekMap.get(file);
    },
    size(file) {
      let fd = this.fileno(file);
      return CatchError(() => {
        let st;
        switch (typeof fd) {
          case 'string':
            st = fs.statSync(fd);
            break;
          case 'number':
            st = fs.fstatSync(fd);
            break;
          default: st = sizeMap.get(fd);
            break;
        }
        return st.size;
      });
    },
    stat(path) {
      return CatchError(() => fs.statSync(path));
    },
    lstat(path) {
      return CatchError(() => fs.lstatSync(path));
    },
    readdir(dir) {
      return CatchError(() => ['.', '..', ...fs.readdirSync(dir)]);
    },
    getcwd() {
      return process.cwd();
    },
    chdir(path) {
      return CatchError(() => process.chdir(path));
    },
    mkdir(path, mode = 0o777) {
      return CatchError(() => fs.mkdirSync(path, { mode }));
    },
    rename(filename, to) {
      return CatchError(() => {
        fs.renameSync(filename, to);

        if(this.exists(filename)) throw new Error(`${filename} still exists`);
        if(!this.exists(to)) throw new Error(`${to} doesn't exist`);
      });
    },
    unlink(path) {
      if(!this.exists(path)) return -1;
      try {
        let st = this.lstat(path);
        if(st.isDirectory()) fs.rmdirSync(path);
        else fs.unlinkSync(path);
      } catch(err) {
        return err;
      }
      return this.exists(path) ? -1 : 0;
    },
    isatty(file) {
      let fd = this.fileno(file);

      return !!tty.isatty(fd);
    },
    mkdtemp(prefix) {
      return CatchError(() => fs.mkdtempSync(prefix));
    },
    get stdin() {
      return process.stdin;
    },
    get stdout() {
      return process.stdout;
    },
    get stderr() {
      return process.stderr;
    },
    waitRead(file) {
      file.resume();
      return new Promise((resolve, reject) => {
        let len;
        if((len = HasData(file))) resolve(len);
        else {
          file.once('data', chunk => {
            //  console.log('data', chunk);
            resolve(AddData(file, chunk));
          });
          file.once('end', chunk => {
            //  console.log('data', chunk);
            resolve(0);
          });
        }
      });
    },
    waitWrite(file) {
      return new Promise((resolve, reject) => {
        if(file.writable) resolve(file);
        else file.once('drain', () => resolve(file));
      });
    },
    async readAllAsync(readable) {
      const chunks = [];
      for await(let chunk of readable) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks).toString();
    },
    readAll(file) {
      return new Promise(async (resolve, reject) => {
        let write = new (await import('concat-stream')).default({}, data => resolve(data));
        //file.pipe(write);
        let data = [];
        file.resume();

        //file.on('readable', () => data.push(file.read()));
        file.on('data', chunk => data.push(chunk));
        file.once('end', () => resolve(data));

        // file.on('data', chunk => data += chunk.toString());
        // file.once('end', () => resolve(data));
        //file.pipe(write);
      });
    }
  };
}

export function BrowserFileSystem(TextDecoderStream, TransformStream, WritableStream) {
  return {
    buffer(bytes) {
      return CreateArrayBuffer(bytes);
    },
    bufferFrom(chunk, encoding = 'utf-8') {
      return StringToArrayBuffer(chunk, 1);
    },

    bufferToString(buf, n = 1) {
      return ArrayBufferToString(buf, n);
    },

    open(filename, flags = 'r', mode = 0o644) {
      //console.log('TransformStream:', TransformStream);
      //console.log('fetch:', fetch);
      let error;
      let send = /w/.test(flags);
      let { writable, readable } = new TransformStream();
      //console.log(' writable, readable:', writable, readable);
      function wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
      }

      const stream = ChunkReader(`this\n\n...\n\n...\nis\n\n...\n\n...\na\n\n...\n\n...\ntest\n\n...\n\n...\n!`,
        4
      ).pipeThrough(new DebugTransformStream());
      /*ew ReadableStream({
        async start(controller) {
          await wait(1000);
          controller.enqueue('This ');
          await wait(1000);
          controller.enqueue('is ');
          await wait(1000);
          controller.enqueue('a ');
          await wait(1000);
          controller.enqueue('slow ');
          await wait(1000);
          controller.enqueue('request.');
          controller.close();
        }
      })*/
      //console.log(' stream:', stream);
      let promise = fetch(send ? '/save' : filename,
        send
          ? {
              method: 'POST',
              headers: send
                ? {
                    'http2-duplex-single': 'true',
                    'content-disposition': `attachment; filename="${filename}"`,
                    'content-type': 'text/plain;charset=UTF-8'
                  }
                : {},
              body: stream
            }
          : {}
      )
        .then(response =>
          writable
            ? response.json()
            : response.body && (stream = response.body).pipeThrough(new TextDecoderStream())
        )
        .catch(err => (error = err));
      return send ? writable : promise;
    },
    async close(fd) {
      await fd.cancel();
    },
    async read(fd, buf, offset, length) {
      /* prettier-ignore */ let reader, chunk, ret = {}, retFn;
      try {
        length = length || 1024;
        offset = offset || 0;
        reader = await fd.getReader();
        ret = await reader.read(buf);
        await reader.releaseLock();
      } catch(error) {
        ret.error = error;
      }
      if(typeof ret == 'object' && ret !== null) {
        const { value, done } = ret;
        if(typeof value == 'string')
          return CopyToArrayBuffer(value,
            buf || CreateArrayBuffer(value.length + (offset || 0)),
            offset || 0
          );
      }
      return ret.done ? 0 : -1;
    },
    write(fd, data, offset, length) {},
    readFile(filename) {
      return fetch(filename).then(async resp => await resp.text());
    },
    writeFile(filename, data, overwrite = true) {},
    exists(filename) {},
    realpath(filename) {},
    size(filename) {},
    stat(filename, dereference = false) {},
    readdir(dir) {},
    getcwd(cb) {},
    chdir(path) {},
    rename(filename, to) {}
  };
}

const CharWidth = {
  1: Uint8Array,
  2: Uint16Array,
  4: Uint32Array
};

function Encoding2Bytes(encoding) {
  switch (encoding.toLowerCase()) {
    case 'utf-8':
      return 1;
    case 'utf-16':
      return 2;
    case 'utf-32':
      return 4;
  }
}
function ArrayBufferToString(buf, bytes = 1) {
  if(typeof bytes == 'string') bytes = Encoding2Bytes(bytes);
  let ctor = CharWidth[bytes];
  console.log('ArrayBufferToString', { buf, bytes, ctor });
  return String.fromCharCode(...new ctor(buf));
}
function ArrayBufferSize(buf) {
  return buf.byteLength;
}

function StringToArrayBuffer(str, bytes = 1) {
  const buf = new ArrayBuffer(str.length * bytes);
  const view = new CharWidth[bytes](buf);
  for(let i = 0, strLen = str.length; i < strLen; i++) view[i] = str.codePointAt(i);
  return buf;
}
function CopyToArrayBuffer(str, buf, offset, bytes = 1) {
  // console.log("CopyToArrayBuffer",{str,buf,bytes});
  const view = new CharWidth[bytes](buf);
  for(let i = 0, end = Math.min(str.length, buf.byteLength); i < end; i++)
    view[i + offset] = str.codePointAt(i);
  return buf;
}
function CreateArrayBuffer(bytes) {
  return new ArrayBuffer(bytes);
}

export async function CreatePortableFileSystem(ctor, ...args) {
  return ctor(...(await Promise.all(args)));
}

export async function GetPortableFileSystem() {
  let fs, err;
  try {
    fs = await CreatePortableFileSystem(QuickJSFileSystem, await import('std'), await import('os'));
  } catch(error) {
    err = error;
  }
  if(fs && !err) return fs;
  err = null;
  try {
    fs = await CreatePortableFileSystem(NodeJSFileSystem,
      await import('fs'),
      await import('tty'),
      await import('process')
    );
  } catch(error) {
    err = error;
  }

  if(fs && !err) return fs;
  err = null;
  try {
    fs = await CreatePortableFileSystem(BrowserFileSystem,

      (await import('./stream/textDecodeStream.js')).TextDecoderStream,
      (await import('./stream/transformStream.js')).TransformStream,
      (await import('./stream/writableStream.js')).WritableStream
    );
  } catch(error) {
    err = error;
  }

  if(fs && !err) return fs;
}

export async function PortableFileSystem(fn = fs => true) {
  return await Util.memoize(async function() {
    const fs = await GetPortableFileSystem();

    Util.weakAssign(fs, FilesystemDecorator);

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
  })().then(fs => (fn(fs), fs));
}

const FilesystemDecorator = {
  async *asyncReader(input, bufSize = 1024) {
    const buffer = this.buffer(bufSize);
    let ret;
    do {
      await this.waitRead(input);
      ret = this.read(input, buffer, 0, bufSize);
      yield buffer.slice(0, ret);
    } while(ret == bufSize);
  },
  *reader(input, bufSize = 1024) {
    const buffer = this.buffer(bufSize);
    let ret;
    do {
      ret = this.read(input, buffer, 0, bufSize);
      yield buffer.slice(0, ret);
    } while(ret == bufSize);
  },

  async combiner(iter) {
    let data;
    for await(let part of iter) {
      if(data === undefined) data = part;
      else if(typeof data.concat == 'function') data = data.concat(part);
      else if(typeof data == 'string') data += part;
      else throw new Error(`No such data type '${typeof data}'`);
    }
    return data;
  },

  async input(input, bufSize = 1024) {
    let reader = await this.asyncReader(input, bufSize);
    let data = await this.combiner(reader);
    return filesystem.bufferToString(data);
  },
  tempnam(prefix) {
    if(!prefix)
      prefix = Util.getArgv()[1]
        .replace(/.*\//g, '')
        .replace(/\.[a-z]+$/, '');
    return prefix + Util.randStr(6);
  },
  mkdtemp(prefix) {
    let name = this.tempnam(prefix);
    if(!this.mkdir(name, 0o1777)) return name;
  },
  mktemp(prefix) {
    let name = this.tempnam(prefix);
    return this.open(name, 'w+');
  }
};

export default PortableFileSystem;
