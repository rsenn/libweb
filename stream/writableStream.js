import PortableFileSystem from '../filesystem.js';
import { EventEmitter } from '../eventEmitter.js';

let filesystem;

PortableFileSystem((instance) => (filesystem = instance));

export class WritableStream extends EventEmitter {
  constructor(path, options = {}) {
    super();
    this.path = path;
    this.highWaterMark = options.highWaterMark || 16 * 1024;
    this.autoClose = options.autoClose || true;
    this.encoding = options.encoding || 'utf8';
    this.mode = options.mode;
    this.start = options.start || 0;
    this.flags = options.flags || 'w';
    this.buffers = [];
    this.writing = false;
    this.needDrain = false;
    this.pos = 0;
    this.length = 0;

    this.open();
  }

  open() {
    let fd = filesystem.open(this.path, this.flags, this.mode);
    if(fd < 0) {
      this.emit('error', fd);
      if(this.autoClose) this.close();
      return;
    }
    this.fd = fd;
    this.emit('open', fd);
  }

  close() {
    if(typeof this.fd == 'number') {
      filesystem.close(this.fd);
      this.fd = undefined;
    }
    this.emit('close');
  }

  write(chunk, encoding = this.encoding, cb) {
    chunk = typeof chunk == 'string' ? filesystem.bufferFrom(chunk) : chunk;
    this.length += chunk.byteLength;
    let result = this.length < this.highWaterMark;
    this.needDrain = !result;
    cb = cb || ((r) => this.emit('data', r > 0 && r < chunk.byteLength ? chunk.slice(0, r) : chunk));
   const { pos, length, writing } =this;
    console.log('write:',  { pos, length, writing });

    if(this.writing) {
      this.buffers.push({ chunk, encoding, cb });
    } else {
      this.writing = true;
      this._write(chunk, encoding, (r) => {
        cb && cb(r);
        this.clearBuffer();
      });
    }
    return result;
  }

  _write(chunk, encoding, cb) {
    if(this.fd === undefined) return this.once('open', () => this._write(chunk, encoding, cb));
    //  console.log("filesystem.write(",this.fd, chunk, 0, chunk.byteLength, ")");
    let bytesWrite = filesystem.write(this.fd, chunk, 0, chunk.byteLength);
    // console.log("bytesWrite:",bytesWrite);
    if(bytesWrite > 0) {
      this.length -= bytesWrite;
      this.pos += bytesWrite;
      this.writing = false;
      cb && cb(bytesWrite);
    }
    return bytesWrite;
  }

  clearBuffer() {
    let buf = this.buffers.shift();
    if(buf) {
      this._write(buf.chunk, buf.encoding, () => (buf.cb && buf.cb(), this.clearBuffer()));
    } else {
      if(this.needDrain) {
        this.needDrain = false;
        this.emit('drain');
      }
    }
  }

  end() {
    if(this.autoClose) {
      this.emit('end');
      this.close();
    }
  }
}

export default WritableStream;
