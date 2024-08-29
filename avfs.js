'use strict';

/* global Uint8Array */

var constants = require('constants');
var util = require('util');

var assign = require('object-assign');

var errors = require('./errors');

var parsers = require('../common/parsers')(constants);
var utils = require('../common/utils');

var Storage = require('../common/storage');

var factories = {
  stats: require('../common/components/stats'),
  readStream: require('../common/streams/read-stream'),
  writeStream: require('../common/streams/write-stream'),
  syncWriteStream: require('../common/streams/sync-write-stream')
};

var rethrow = function(error) {
  var message = 'Calling an asynchronous function without callback is deprecated.';

  process.emitWarning(message, 'DeprecationWarning', 'DEP0013', rethrow);

  if(error) {
    throw error;
  }
};

var stringify = function(path) {
  return Buffer.isBuffer(path) ? path.toString() : path;
};

var parse = function(options) {
  if(!options) {
    return null;
  }

  if(typeof options === 'string') {
    return options;
  }

  if(typeof options === 'object') {
    return options.encoding || null;
  }

  throw new TypeError('"options" must be a string or an object, got ' + typeof options + ' instead.');
};

var bufferize = function(path, encoding) {
  if(!encoding) {
    return path;
  }

  var buffer = Buffer.from(path);

  return encoding === 'buffer' ? buffer : buffer.toString(encoding);
};

function VirtualFS() {
  var storage = new Storage(constants);

  var handles = {
    next: 0
  };

  var base = assign(
    {},
    require('../base/access')(storage, constants),
    require('../base/attributes')(storage, constants, { birthtime: true, milliseconds: true }),
    require('../base/copy')(storage, constants, handles),
    require('../base/descriptors')(storage, constants, handles),
    require('../base/directories')(storage, constants),
    require('../base/exists')(storage),
    require('../base/files')(storage, constants, handles),
    require('../base/links')(storage, constants),
    require('../base/permissions')(storage, constants),
    require('../base/read-write')(storage, constants, handles),
    require('../base/utils')(),
    require('../base/watchers')()
  );

  Object.defineProperty(this, 'storage', {
    value: storage,
    configurable: false,
    enumerable: false,
    writable: false
  });

  Object.defineProperty(this, 'base', {
    value: base,
    configurable: false,
    enumerable: false,
    writable: false
  });

  Object.defineProperty(this, 'handles', {
    value: handles,
    configurable: false,
    enumerable: false,
    writable: false
  });

  ['F_OK', 'R_OK', 'W_OK', 'X_OK'].forEach(
    function(key) {
      Object.defineProperty(this, key, {
        value: constants[key],
        enumerable: true,
        writable: false
      });
    }.bind(this)
  );

  // fs members

  this.Stats = factories.stats(constants, { birthtime: true, milliseconds: true });

  this.ReadStream = factories.readStream(this);
  this.WriteStream = factories.writeStream(this);

  this.FileReadStream = this.ReadStream;
  this.FileWriteStream = this.WriteStream;

  var SyncWriteStream = factories.syncWriteStream(this);

  Object.defineProperty(this, 'SyncWriteStream', {
    configurable: true,

    get: util.deprecate(
      function() {
        return SyncWriteStream;
      },
      'fs.SyncWriteStream is deprecated.',
      'DEP0061'
    ),
    set: util.deprecate(
      function(value) {
        SyncWriteStream = value;
      },
      'fs.SyncWriteStream is deprecated.',
      'DEP0061'
    )
  });

  Object.defineProperty(this, 'constants', {
    configurable: false,
    enumerable: true,
    value: utils.filter(constants, RegExp.prototype.test.bind(/(^[FRWXOS]_|COPYFILE)/))
  });

  // Asynchronous methods

  utils.asyncify(this, {
    nocb: rethrow,
    methods: ['readSync', 'writeSync'],
    error: function(error) {
      if(error instanceof Error && !/^E[A-Z]+/.test(error.code)) {
        throw error;
      }
    },
    transform: function(error, result, method, args, callback) {
      if(error) {
        error = errors[error.code](method);
      }

      return callback(error, result || 0, args[1]);
    }
  });

  utils.asyncify(this, rethrow);
}

VirtualFS.prototype.accessSync = function(path, mode) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.access, [path, mode], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.appendFileSync = function(file, data, options) {
  file = stringify(file);
  file = parsers.url(file);

  return utils.invoke(this.base.appendFile, [file, data, options], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'options:type') {
      throw new TypeError('"options" must be a string or an object, got ' + error.type + ' instead.');
    }

    if(error.code === 'options:encoding') {
      throw new Error('Unknown encoding: ' + error.encoding);
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.chmodSync = function(path, mode) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.chmod, [path, mode], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'mode:type') {
      throw new TypeError('mode must be an integer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.chownSync = function(path, uid, gid) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.chown, [path, uid, gid], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'uid:type') {
      throw new TypeError('uid must be an unsigned int');
    }

    if(error.code === 'gid:type') {
      throw new TypeError('gid must be an unsigned int');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.closeSync = function(fd) {
  return utils.invoke(this.base.close, [fd], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('fd must be a file descriptor');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.copyFileSync = function(src, dest, mode) {
  src = parsers.url(stringify(src));
  dest = parsers.url(stringify(dest));

  return utils.invoke(this.base.copyFile, [src, dest, mode], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'src:type') {
      throw new TypeError('src must be a string');
    }

    if(error.code === 'dest:type') {
      throw new TypeError('dest must be a string');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.createReadStream = function(path, options) {
  path = stringify(path);
  path = parsers.url(path);

  return this.ReadStream(path, options);
};

VirtualFS.prototype.createWriteStream = function(path, options) {
  path = stringify(path);
  path = parsers.url(path);

  return this.WriteStream(path, options);
};

VirtualFS.prototype.existsSync = function(path) {
  path = stringify(path);
  path = parsers.url(path);

  return this.base.exists(path);
};

VirtualFS.prototype.fchmodSync = function(fd, mode) {
  return utils.invoke(this.base.fchmod, [fd, mode], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('fd must be a file descriptor');
    }

    if(error.code === 'mode:type') {
      throw new TypeError('mode must be an integer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.fchownSync = function(fd, uid, gid) {
  return utils.invoke(this.base.fchown, [fd, uid, gid], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('fd must be an int');
    }

    if(error.code === 'uid:type') {
      throw new TypeError('uid must be an unsigned int');
    }

    if(error.code === 'gid:type') {
      throw new TypeError('gid must be an unsigned int');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.fdatasyncSync = function(fd) {
  return utils.invoke(this.base.fdatasync, [fd], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('fd must be a file descriptor');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.fstatSync = function(fd) {
  return utils.invoke(this.base.fstat, [fd], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('fd must be a file descriptor');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.fsyncSync = function(fd) {
  return utils.invoke(this.base.fsync, [fd], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('fd must be a file descriptor');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.ftruncateSync = function(fd, length) {
  return utils.invoke(this.base.ftruncate, [fd, length], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('fd must be a file descriptor');
    }

    if(error.code === 'length:type') {
      throw new TypeError('Not an integer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.futimesSync = function(fd, atime, mtime) {
  return utils.invoke(this.base.futimes, [fd, atime, mtime], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('fd must be an int');
    }

    if(error.code === 'atime:type') {
      throw new Error('Cannot parse time: ' + atime);
    }

    if(error.code === 'mtime:type') {
      throw new Error('Cannot parse time: ' + mtime);
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.lchmodSync = function(path, mode) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.lchmod, [path, mode], function(error) {
    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'mode:type') {
      throw new TypeError('mode must be an integer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.lchownSync = function(path, uid, gid) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.lchown, [path, uid, gid], function(error) {
    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'uid:type') {
      throw new TypeError('uid must be an unsigned int');
    }

    if(error.code === 'gid:type') {
      throw new TypeError('gid must be an unsigned int');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.linkSync = function(srcpath, dstpath) {
  srcpath = stringify(srcpath);
  dstpath = stringify(dstpath);

  srcpath = parsers.url(srcpath);
  dstpath = parsers.url(dstpath);

  return utils.invoke(this.base.link, [srcpath, dstpath], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'srcpath:type') {
      throw new TypeError('src must be a string or Buffer');
    }

    if(error.code === 'dstpath:type') {
      throw new TypeError('dest must be a string or Buffer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.lstatSync = function(path) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.lstat, [path], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.mkdirSync = function(path, mode) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.mkdir, [path, mode], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.mkdtemp = function(prefix, options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }

  var cb = typeof callback !== 'function' ? rethrow : callback;

  process.nextTick(
    function() {
      try {
        return cb(
          null,
          utils.invoke(this.base.mkdtemp, [prefix, options], function(error) {
            if(error.code === 'path:null') {
              throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
            }

            return errors[error.code](error);
          })
        );
      } catch(error) {
        return cb(error);
      }
    }.bind(this)
  );
};

VirtualFS.prototype.mkdtempSync = function(prefix, options) {
  var encoding = parse(options);

  return bufferize(
    utils.invoke(this.base.mkdtemp, [prefix], function(error) {
      if(error.code === 'path:null') {
        throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
      }

      return errors[error.code](assign(error, { path: prefix + 'XXXXXX' }));
    }),
    encoding
  );
};

VirtualFS.prototype.openSync = function(path, flags, mode) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.open, [path, flags, mode], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'flags:type') {
      throw new Error('Unknown file open flag: ' + error.value);
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.readdirSync = function(path, options) {
  path = stringify(path);
  path = parsers.url(path);

  var encoding = parse(options);

  var result = utils.invoke(this.base.readdir, [path], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    return errors[error.code](error);
  });

  if(!Array.isArray(result)) {
    return result;
  }

  return result.map(function (file) {
    return bufferize(file, encoding);
  });
};

VirtualFS.prototype.readFileSync = function(file, options) {
  file = stringify(file);
  file = parsers.url(file);

  return utils.invoke(this.base.readFile, [file, options], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'options:type') {
      throw new TypeError('"options" must be a string or an object, got ' + error.type + ' instead.');
    }

    if(error.code === 'options:encoding') {
      throw new Error('Unknown encoding: ' + error.encoding);
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.readlinkSync = function(path, options) {
  path = stringify(path);
  path = parsers.url(path);

  var encoding = parse(options);

  return bufferize(
    utils.invoke(this.base.readlink, [path], function(error) {
      if(error.code === 'path:null') {
        throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
      }

      if(error.code === 'path:type') {
        throw new TypeError('path must be a string or Buffer');
      }

      return errors[error.code](error);
    }),
    encoding
  );
};

VirtualFS.prototype.readSync = function(fd, buffer, offset, length, position) {
  var input = null;
  var isUint8Array = false;

  if(buffer instanceof Uint8Array && !(buffer instanceof Buffer)) {
    input = buffer;
    buffer = Buffer.from(input);
    isUint8Array = true;
  }

  var bytesRead = utils.invoke(this.base.read, [fd, buffer, offset, length, position], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('fd must be a file descriptor');
    }

    if(error.code === 'offset:size') {
      throw new Error('Offset is out of bounds');
    }

    if(error.code === 'length:size') {
      throw new RangeError('Length extends beyond buffer');
    }

    return errors[error.code](error);
  });

  if(isUint8Array === true) {
    input.set(buffer);
  }

  return bytesRead;
};

VirtualFS.prototype.realpathSync = function(path, options) {
  path = stringify(path);
  path = parsers.url(path);

  var encoding = parse(options);

  if(encoding && encoding !== 'buffer' && !Buffer.isEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }

  return bufferize(
    utils.invoke(this.base.realpath, [path], function(error) {
      if(error.code === 'path:null') {
        throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
      }

      return errors[error.code](error);
    }),
    encoding
  );
};

VirtualFS.prototype.renameSync = function(oldPath, newPath) {
  oldPath = stringify(oldPath);
  newPath = stringify(newPath);

  oldPath = parsers.url(oldPath);
  newPath = parsers.url(newPath);

  return utils.invoke(this.base.rename, [oldPath, newPath], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'old:type') {
      throw new TypeError('old_path must be a string or Buffer');
    }

    if(error.code === 'new:type') {
      throw new TypeError('new_path must be a string or Buffer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.rmdirSync = function(path) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.rmdir, [path], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.statSync = function(path) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.stat, [path], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.symlinkSync = function(target, path) {
  target = stringify(target);
  path = stringify(path);

  target = parsers.url(target);
  path = parsers.url(path);

  return utils.invoke(this.base.symlink, [target, path], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'srcpath:type') {
      throw new TypeError('target must be a string or Buffer');
    }

    if(error.code === 'dstpath:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.truncateSync = function(path, length) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.truncate, [path, length], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'length:type') {
      throw new TypeError('Not an integer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.unlinkSync = function(path) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.unlink, [path], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.utimesSync = function(path, atime, mtime) {
  path = stringify(path);
  path = parsers.url(path);

  return utils.invoke(this.base.utimes, [path, atime, mtime], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'atime:type') {
      throw new Error('Cannot parse time: ' + atime);
    }

    if(error.code === 'mtime:type') {
      throw new Error('Cannot parse time: ' + mtime);
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.writeFileSync = function(file, data, options) {
  file = stringify(file);
  file = parsers.url(file);

  if(data instanceof Uint8Array) {
    data = Buffer.from(data);
  }

  return utils.invoke(this.base.writeFile, [file, data, options], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    if(error.code === 'path:type') {
      throw new TypeError('path must be a string or Buffer');
    }

    if(error.code === 'options:type') {
      throw new TypeError('"options" must be a string or an object, got ' + error.type + ' instead.');
    }

    if(error.code === 'options:encoding') {
      throw new Error('Unknown encoding: ' + error.encoding);
    }

    return errors[error.code](error);
  });
};

VirtualFS.prototype.writeSync = function(fd, buffer, offset, length, position) {
  var input = null;
  var isUint8Array = false;

  if(buffer instanceof Uint8Array && !(buffer instanceof Buffer)) {
    input = buffer;
    buffer = Buffer.from(input);
    isUint8Array = true;
  }

  var written = utils.invoke(this.base.write, [fd, buffer, offset, length, position], function(error) {
    if(error.code === 'fd:type') {
      throw new TypeError('First argument must be file descriptor');
    }

    if(error.code === 'offset:size') {
      throw new RangeError('offset out of bounds');
    }

    if(error.code === 'length:size') {
      throw new RangeError('length out of bounds');
    }

    return errors[error.code](error);
  });

  if(isUint8Array === true) {
    input.set(buffer);
  }

  return written;
};

// Watchers

VirtualFS.prototype.watch = function(filename, options, listener) {
  filename = stringify(filename);
  filename = parsers.url(filename);

  return utils.invoke(this.base.watch, [filename, options, listener], function() {
    throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
  });
};

VirtualFS.prototype.watchFile = function(filename, options, listener) {
  filename = stringify(filename);
  filename = parsers.url(filename);

  return utils.invoke(this.base.watchFile, [filename, options, listener], function(error) {
    if(error.code === 'path:null') {
      throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
    }

    throw new Error('"watchFile()" requires a listener function');
  });
};

VirtualFS.prototype.unwatchFile = function(filename, listener) {
  filename = stringify(filename);
  filename = parsers.url(filename);

  return utils.invoke(this.base.unwatchFile, [filename, listener], function() {
    throw errors.createError('Path must be a string without null bytes', { code: 'ENOENT' });
  });
};

// Internals

VirtualFS.prototype._toUnixTimestamp = function(time) {
  return this.base.toUnixTimestamp(time);
};

module.exports = VirtualFS;
