var Module = typeof Module !== 'undefined' ? Module : {};

(function () {
  var Module = {};
  var moduleOverrides = {};
  var key;
  for(key in Module) {
    if(Module.hasOwnProperty(key)) {
      moduleOverrides[key] = Module[key];
    }
  }
  var arguments_ = [];
  var thisProgram = './this.program';
  var quit_ = function(status, toThrow) {
    throw toThrow;
  };
  var ENVIRONMENT_IS_WEB = false;
  var ENVIRONMENT_IS_WORKER = false;
  var ENVIRONMENT_IS_NODE = false;
  var ENVIRONMENT_IS_SHELL = false;
  ENVIRONMENT_IS_WEB = typeof window === 'object';
  ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
  ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
  ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
  var scriptDirectory = '';
  function locateFile(path) {
    if(Module['locateFile']) {
      return Module['locateFile'](path, scriptDirectory);
    }
    return scriptDirectory + path;
  }
  var read_, readAsync, readBinary, setWindowTitle;
  var nodeFS;
  var nodePath;
  if(ENVIRONMENT_IS_NODE) {
    if(ENVIRONMENT_IS_WORKER) {
      scriptDirectory = require('path').dirname(scriptDirectory) + '/';
    } else {
      scriptDirectory = __dirname + '/';
    }
    read_ = function shell_read(filename, binary) {
      if(!nodeFS) nodeFS = require('fs');
      if(!nodePath) nodePath = require('path');
      filename = nodePath['normalize'](filename);
      return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
    };
    readBinary = function readBinary(filename) {
      var ret = read_(filename, true);
      if(!ret.buffer) {
        ret = new Uint8Array(ret);
      }
      assert(ret.buffer);
      return ret;
    };
    if(process['argv'].length > 1) {
      thisProgram = process['argv'][1].replace(/\\/g, '/');
    }
    arguments_ = process['argv'].slice(2);
    if(typeof module !== 'undefined') {
      module['exports'] = Module;
    }
    process['on']('uncaughtException', function(ex) {
      if(!(ex instanceof ExitStatus)) {
        throw ex;
      }
    });
    process['on']('unhandledRejection', abort);
    quit_ = function(status) {
      process['exit'](status);
    };
    Module['inspect'] = function() {
      return '[Emscripten Module object]';
    };
  } else if(ENVIRONMENT_IS_SHELL) {
    if(typeof read != 'undefined') {
      read_ = function shell_read(f) {
        return read(f);
      };
    }
    readBinary = function readBinary(f) {
      var data;
      if(typeof readbuffer === 'function') {
        return new Uint8Array(readbuffer(f));
      }
      data = read(f, 'binary');
      assert(typeof data === 'object');
      return data;
    };
    if(typeof scriptArgs != 'undefined') {
      arguments_ = scriptArgs;
    } else if(typeof arguments != 'undefined') {
      arguments_ = arguments;
    }
    if(typeof quit === 'function') {
      quit_ = function(status) {
        quit(status);
      };
    }
    if(typeof print !== 'undefined') {
      if(typeof console === 'undefined') console = {};
      console.log = print;
      console.warn = console.error = typeof printErr !== 'undefined' ? printErr : print;
    }
  } else if(ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if(ENVIRONMENT_IS_WORKER) {
      scriptDirectory = self.location.href;
    } else if(typeof document !== 'undefined' && document.currentScript) {
      scriptDirectory = document.currentScript.src;
    }
    if(scriptDirectory.indexOf('blob:') !== 0) {
      scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/') + 1);
    } else {
      scriptDirectory = '';
    }
    {
      read_ = function(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        return xhr.responseText;
      };
      if(ENVIRONMENT_IS_WORKER) {
        readBinary = function(url) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false);
          xhr.responseType = 'arraybuffer';
          xhr.send(null);
          return new Uint8Array(xhr.response);
        };
      }
      readAsync = function(url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if(xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
            onload(xhr.response);
            return;
          }
          onerror();
        };
        xhr.onerror = onerror;
        xhr.send(null);
      };
    }
    setWindowTitle = function(title) {
      document.title = title;
    };
  } else {
  }
  var out = Module['print'] || console.log.bind(console);
  var err = Module['printErr'] || console.warn.bind(console);
  for(key in moduleOverrides) {
    if(moduleOverrides.hasOwnProperty(key)) {
      Module[key] = moduleOverrides[key];
    }
  }
  moduleOverrides = null;
  if(Module['arguments']) arguments_ = Module['arguments'];
  if(Module['thisProgram']) thisProgram = Module['thisProgram'];
  if(Module['quit']) quit_ = Module['quit'];
  var wasmBinary;
  if(Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
  var noExitRuntime;
  if(Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];
  if(typeof WebAssembly !== 'object') {
    abort('no native wasm support detected');
  }
  var wasmMemory;
  var ABORT = false;
  var EXITSTATUS;
  function assert(condition, text) {
    if(!condition) {
      abort('Assertion failed: ' + text);
    }
  }
  var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
  function updateGlobalBufferAndViews(buf) {
    buffer = buf;
    Module['HEAP8'] = HEAP8 = new Int8Array(buf);
    Module['HEAP16'] = HEAP16 = new Int16Array(buf);
    Module['HEAP32'] = HEAP32 = new Int32Array(buf);
    Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
    Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
    Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
    Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
    Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
  }
  var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 33554432;
  var wasmTable;
  var __ATPRERUN__ = [];
  var __ATINIT__ = [];
  var __ATMAIN__ = [];
  var __ATPOSTRUN__ = [];
  var runtimeInitialized = false;
  __ATINIT__.push({
    func: function() {
      ___wasm_call_ctors();
    }
  });
  function preRun() {
    if(Module['preRun']) {
      if(typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
      while(Module['preRun'].length) {
        addOnPreRun(Module['preRun'].shift());
      }
    }
    callRuntimeCallbacks(__ATPRERUN__);
  }
  function initRuntime() {
    runtimeInitialized = true;
    callRuntimeCallbacks(__ATINIT__);
  }
  function preMain() {
    callRuntimeCallbacks(__ATMAIN__);
  }
  function postRun() {
    if(Module['postRun']) {
      if(typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while(Module['postRun'].length) {
        addOnPostRun(Module['postRun'].shift());
      }
    }
    callRuntimeCallbacks(__ATPOSTRUN__);
  }
  function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb);
  }
  function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb);
  }
  var runDependencies = 0;
  var runDependencyWatcher = null;
  var dependenciesFulfilled = null;
  function addRunDependency(id) {
    runDependencies++;
    if(Module['monitorRunDependencies']) {
      Module['monitorRunDependencies'](runDependencies);
    }
  }
  function removeRunDependency(id) {
    runDependencies--;
    if(Module['monitorRunDependencies']) {
      Module['monitorRunDependencies'](runDependencies);
    }
    if(runDependencies == 0) {
      if(runDependencyWatcher !== null) {
        clearInterval(runDependencyWatcher);
        runDependencyWatcher = null;
      }
      if(dependenciesFulfilled) {
        var callback = dependenciesFulfilled;
        dependenciesFulfilled = null;
        callback();
      }
    }
  }
  Module['preloadedImages'] = {};
  Module['preloadedAudios'] = {};
  function abort(what) {
    if(Module['onAbort']) {
      Module['onAbort'](what);
    }
    what += '';
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';
    var e = new WebAssembly.RuntimeError(what);
    throw e;
  }
  function hasPrefix(str, prefix) {
    return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0;
  }
  var dataURIPrefix = 'data:application/octet-stream;base64,';
  function isDataURI(filename) {
    return hasPrefix(filename, dataURIPrefix);
  }
  var fileURIPrefix = 'file://';
  function isFileURI(filename) {
    return hasPrefix(filename, fileURIPrefix);
  }
  var wasmBinaryFile = 'bpgdec8a.wasm';
  if(!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }
  function getBinary(file) {
    try {
      if(file == wasmBinaryFile && wasmBinary) {
        return new Uint8Array(wasmBinary);
      }
      if(readBinary) {
        return readBinary(file);
      } else {
        throw 'both async and sync fetching of the wasm failed';
      }
    } catch(err) {
      abort(err);
    }
  }
  function getBinaryPromise() {
    if(!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
      if(typeof fetch === 'function' && !isFileURI(wasmBinaryFile)) {
        return fetch(wasmBinaryFile, {
          credentials: 'same-origin'
        })
          .then(function (response) {
            if(!response['ok']) {
              throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
            }
            return response['arrayBuffer']();
          })
          .catch(function () {
            return getBinary(wasmBinaryFile);
          });
      } else {
        if(readAsync) {
          return new Promise(function (resolve, reject) {
            readAsync(
              wasmBinaryFile,
              function(response) {
                resolve(new Uint8Array(response));
              },
              reject
            );
          });
        }
      }
    }
    return Promise.resolve().then(function () {
      return getBinary(wasmBinaryFile);
    });
  }
  function createWasm() {
    var info = {
      a: asmLibraryArg
    };
    function receiveInstance(instance, module) {
      var exports = instance.exports;
      Module['asm'] = exports;
      wasmMemory = Module['asm']['d'];
      updateGlobalBufferAndViews(wasmMemory.buffer);
      wasmTable = Module['asm']['e'];
      removeRunDependency('wasm-instantiate');
    }
    addRunDependency('wasm-instantiate');
    function receiveInstantiatedSource(output) {
      receiveInstance(output['instance']);
    }
    function instantiateArrayBuffer(receiver) {
      return getBinaryPromise()
        .then(function (binary) {
          return WebAssembly.instantiate(binary, info);
        })
        .then(receiver, function(reason) {
          err('failed to asynchronously prepare wasm: ' + reason);
          abort(reason);
        });
    }
    function instantiateAsync() {
      if(!wasmBinary && typeof WebAssembly.instantiateStreaming === 'function' && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch === 'function') {
        return fetch(wasmBinaryFile, {
          credentials: 'same-origin'
        }).then(function (response) {
          var result = WebAssembly.instantiateStreaming(response, info);
          return result.then(receiveInstantiatedSource, function(reason) {
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(receiveInstantiatedSource);
          });
        });
      } else {
        return instantiateArrayBuffer(receiveInstantiatedSource);
      }
    }
    if(Module['instantiateWasm']) {
      try {
        var exports = Module['instantiateWasm'](info, receiveInstance);
        return exports;
      } catch(e) {
        err('Module.instantiateWasm callback failed with error: ' + e);
        return false;
      }
    }
    instantiateAsync();
    return {};
  }
  function callRuntimeCallbacks(callbacks) {
    while(callbacks.length > 0) {
      var callback = callbacks.shift();
      if(typeof callback == 'function') {
        callback(Module);
        continue;
      }
      var func = callback.func;
      if(typeof func === 'number') {
        if(callback.arg === undefined) {
          wasmTable.get(func)();
        } else {
          wasmTable.get(func)(callback.arg);
        }
      } else {
        func(callback.arg === undefined ? null : callback.arg);
      }
    }
  }
  function _abort() {
    abort();
  }
  function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.copyWithin(dest, src, src + num);
  }
  function abortOnCannotGrowMemory(requestedSize) {
    abort('OOM');
  }
  function _emscripten_resize_heap(requestedSize) {
    requestedSize = requestedSize >>> 0;
    abortOnCannotGrowMemory(requestedSize);
  }
  var asmLibraryArg = {
    a: _abort,
    b: _emscripten_memcpy_big,
    c: _emscripten_resize_heap
  };
  var asm = createWasm();
  var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function() {
    return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['f']).apply(null, arguments);
  });
  var _malloc = (Module['_malloc'] = function() {
    return (_malloc = Module['_malloc'] = Module['asm']['g']).apply(null, arguments);
  });
  var _free = (Module['_free'] = function() {
    return (_free = Module['_free'] = Module['asm']['h']).apply(null, arguments);
  });
  var _bpg_decoder_get_info = (Module['_bpg_decoder_get_info'] = function() {
    return (_bpg_decoder_get_info = Module['_bpg_decoder_get_info'] = Module['asm']['i']).apply(null, arguments);
  });
  var _bpg_decoder_start = (Module['_bpg_decoder_start'] = function() {
    return (_bpg_decoder_start = Module['_bpg_decoder_start'] = Module['asm']['j']).apply(null, arguments);
  });
  var _bpg_decoder_get_frame_duration = (Module['_bpg_decoder_get_frame_duration'] = function() {
    return (_bpg_decoder_get_frame_duration = Module['_bpg_decoder_get_frame_duration'] = Module['asm']['k']).apply(null, arguments);
  });
  var _bpg_decoder_get_line = (Module['_bpg_decoder_get_line'] = function() {
    return (_bpg_decoder_get_line = Module['_bpg_decoder_get_line'] = Module['asm']['l']).apply(null, arguments);
  });
  var _bpg_decoder_open = (Module['_bpg_decoder_open'] = function() {
    return (_bpg_decoder_open = Module['_bpg_decoder_open'] = Module['asm']['m']).apply(null, arguments);
  });
  var _bpg_decoder_decode = (Module['_bpg_decoder_decode'] = function() {
    return (_bpg_decoder_decode = Module['_bpg_decoder_decode'] = Module['asm']['n']).apply(null, arguments);
  });
  var _bpg_decoder_close = (Module['_bpg_decoder_close'] = function() {
    return (_bpg_decoder_close = Module['_bpg_decoder_close'] = Module['asm']['o']).apply(null, arguments);
  });
  var calledRun;
  function ExitStatus(status) {
    this.name = 'ExitStatus';
    this.message = 'Program terminated with exit(' + status + ')';
    this.status = status;
  }
  dependenciesFulfilled = function runCaller() {
    if(!calledRun) run();
    if(!calledRun) dependenciesFulfilled = runCaller;
  };
  function run(args) {
    args = args || arguments_;
    if(runDependencies > 0) {
      return;
    }
    preRun();
    if(runDependencies > 0) return;
    function doRun() {
      if(calledRun) return;
      calledRun = true;
      Module['calledRun'] = true;
      if(ABORT) return;
      initRuntime();
      preMain();
      if(Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
      postRun();
    }
    if(Module['setStatus']) {
      Module['setStatus']('Running...');
      setTimeout(function () {
        setTimeout(function () {
          Module['setStatus']('');
        }, 1);
        doRun();
      }, 1);
    } else {
      doRun();
    }
  }
  Module['run'] = run;
  if(Module['preInit']) {
    if(typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
    while(Module['preInit'].length > 0) {
      Module['preInit'].pop()();
    }
  }
  noExitRuntime = true;
  run();
  window['BPGDecoder'] = function(ctx) {
    this.ctx = ctx;
    this['imageData'] = null;
    this['onload'] = null;
    this['frames'] = null;
    this['loop_count'] = 0;
  };
  window['BPGDecoder'].prototype = {
    malloc: Module['cwrap']('malloc', 'number', ['number']),
    free: Module['cwrap']('free', 'void', ['number']),
    bpg_decoder_open: Module['cwrap']('bpg_decoder_open', 'number', []),
    bpg_decoder_decode: Module['cwrap']('bpg_decoder_decode', 'number', ['number', 'array', 'number']),
    bpg_decoder_get_info: Module['cwrap']('bpg_decoder_get_info', 'number', ['number', 'number']),
    bpg_decoder_start: Module['cwrap']('bpg_decoder_start', 'number', ['number', 'number']),
    bpg_decoder_get_frame_duration: Module['cwrap']('bpg_decoder_get_frame_duration', 'void', ['number', 'number', 'number']),
    bpg_decoder_get_line: Module['cwrap']('bpg_decoder_get_line', 'number', ['number', 'number']),
    bpg_decoder_close: Module['cwrap']('bpg_decoder_close', 'void', ['number']),
    load: function(url) {
      var request = new XMLHttpRequest();
      var this1 = this;
      request.open('get', url, true);
      request.responseType = 'arraybuffer';
      request.onload = function(event) {
        this1._onload(request, event);
      };
      request.send();
    },
    _onload: function(request, event) {
      var data = request.response;
      var array = new Uint8Array(data);
      var img, w, h, img_info_buf, cimg, p0, rgba_line, w4, frame_count;
      var heap8, heap16, heap32, dst, i, y, duration, frames, loop_count;
      img = this.bpg_decoder_open();
      if(this.bpg_decoder_decode(img, array, array.length) < 0) {
        console.log('could not decode image');
        return;
      }
      img_info_buf = this.malloc(5 * 4);
      this.bpg_decoder_get_info(img, img_info_buf);
      heap8 = Module['HEAPU8'];
      heap16 = Module['HEAPU16'];
      heap32 = Module['HEAPU32'];
      w = heap32[img_info_buf >> 2];
      h = heap32[(img_info_buf + 4) >> 2];
      loop_count = heap16[(img_info_buf + 16) >> 1];
      w4 = w * 4;
      rgba_line = this.malloc(w4);
      frame_count = 0;
      frames = [];
      for(;;) {
        if(this.bpg_decoder_start(img, 1) < 0) break;
        this.bpg_decoder_get_frame_duration(img, img_info_buf, img_info_buf + 4);
        duration = (heap32[img_info_buf >> 2] * 1e3) / heap32[(img_info_buf + 4) >> 2];
        cimg = this.ctx.createImageData(w, h);
        dst = cimg.data;
        p0 = 0;
        for(y = 0; y < h; y++) {
          this.bpg_decoder_get_line(img, rgba_line);
          for(i = 0; i < w4; i = (i + 1) | 0) {
            dst[p0] = heap8[(rgba_line + i) | 0] | 0;
            p0 = (p0 + 1) | 0;
          }
        }
        frames[frame_count++] = {
          img: cimg,
          duration: duration
        };
      }
      this.free(rgba_line);
      this.free(img_info_buf);
      this.bpg_decoder_close(img);
      this['loop_count'] = loop_count;
      this['frames'] = frames;
      this['imageData'] = frames[0]['img'];
      if(this['onload']) this['onload']();
    }
  };
  window.onload = function() {
    var i, n, el, tab, tab1, url, dec, canvas, ctx, dw, dh;
    tab = document.images;
    n = tab.length;
    tab1 = [];
    for(i = 0; i < n; i++) {
      el = tab[i];
      url = el.src;
      if(url.substr(-4, 4).toLowerCase() == '.bpg') {
        tab1[tab1.length] = el;
      }
    }
    n = tab1.length;
    for(i = 0; i < n; i++) {
      el = tab1[i];
      url = el.src;
      canvas = document.createElement('canvas');
      if(el.id) canvas.id = el.id;
      if(el.className) canvas.className = el.className;
      dw = el.getAttribute('width') | 0;
      if(dw) {
        canvas.style.width = dw + 'px';
      }
      dh = el.getAttribute('height') | 0;
      if(dh) {
        canvas.style.height = dh + 'px';
      }
      el.parentNode.replaceChild(canvas, el);
      ctx = canvas.getContext('2d');
      dec = new BPGDecoder(ctx);
      dec.onload = function(canvas, ctx) {
        var dec = this;
        var frames = this['frames'];
        var imageData = frames[0]['img'];
        function next_frame() {
          var frame_index = dec.frame_index;
          if(++frame_index >= frames.length) {
            if(dec['loop_count'] == 0 || dec.loop_counter < dec['loop_count']) {
              frame_index = 0;
              dec.loop_counter++;
            } else {
              frame_index = -1;
            }
          }
          if(frame_index >= 0) {
            dec.frame_index = frame_index;
            ctx.putImageData(frames[frame_index]['img'], 0, 0);
            setTimeout(next_frame, frames[frame_index]['duration']);
          }
        }
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        if(frames.length > 1) {
          dec.frame_index = 0;
          dec.loop_counter = 0;
          setTimeout(next_frame, frames[0]['duration']);
        }
      }.bind(dec, canvas, ctx);
      dec.load(url);
    }
  };
})();
