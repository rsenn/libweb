/**
 * LogJS (c)2013 Brett Fattori
 * Lightweight JavaScript logging framework
 * MIT Licensed
 */
export var LogJS = {
  EXCEPTION: 'EXCEPTION',
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  VERBOSE: 'VERBOSE',
  DEBUG: 'DEBUG',

  version: 'LogJS v1.2.2',
  get window_() {
    try {
      if(global.window) return global.window;
    } catch(e) {}
    try {
      return globalThis.window;
    } catch(e) {}
  }
};

let appenders = {};

//This is the method for logging.  It passes off to the
//appenders to perform the actual logging.
let log = function(type, message, url, lineNumber) {
  let now = new Date().getTime();

  if(message instanceof Error) {
    if(message.stack) {
      message = message.message && message.stack.indexOf(message.message) === -1 ? message.message + '\n' + message.stack : message.stack;
    } else if(message.sourceURL) {
      message = message.message;
      url = message.sourceURL;
      lineNumber = message.line;
    }
  }

  for(let appender in appenders) {
    if(appenders.hasOwnProperty(appender)) {
      appenders[appender].log(type, now, message, url, lineNumber);
    }
  }
};

//Redirect the onerror handler for the global object (if it exists)
let win = LogJS.window_;

let gErrorHandler;
if(win) {
  if(win.onerror !== undefined) {
    gErrorHandler = win.onerror;
  }

  win.onerror = function onErrorLogJS(message, url, lineNumber) {
    log(LogJS.EXCEPTION, message, url, lineNumber);
    if(gErrorHandler) {
      gErrorHandler(message, url, lineNumber);
    }
  };
}

//--------------------------------------------------------------------------------------------------

LogJS.error = function(message, url, lineNumber) {
  log(LogJS.ERROR, message, url, lineNumber);
};

LogJS.warn = function(message, url, lineNumber) {
  log(LogJS.WARN, message, url, lineNumber);
};

LogJS.info = function(message, url, lineNumber) {
  log(LogJS.INFO, message, url, lineNumber);
};

LogJS.verbose = function(message, url, lineNumber) {
  log(LogJS.VERBOSE, message, url, lineNumber);
};

LogJS.debug = function(message, url, lineNumber) {
  log(LogJS.DEBUG, message, url, lineNumber);
};

//--------------------------------------------------------------------------------------------------

LogJS.addAppender = function(appender) {
  if(appender !== undefined) {
    appender = new appender(LogJS.config);
    if(appender.LOGJSAPPENDER) {
      appenders[appender.name] = appender;
    }
  }
};

LogJS.getAppender = function(appenderName) {
  return appenders[appenderName];
};

LogJS.getRegisteredAppenders = function() {
  let registered = [];
  for(let appender in appenders) {
    if(appenders.hasOwnProperty(appender)) {
      registered.push(appender);
    }
  }
  return registered;
};

Object.defineProperty(LogJS, 'config', {
  configurable: false,
  value: {},
  writable: true,
  enumerable: false
});

//--------------------------------------------------------------------------------------------------

LogJS.BaseAppender = function() {};

Object.defineProperty(LogJS.BaseAppender.prototype, 'LOGJSAPPENDER', {
  configurable: false,
  value: true,
  writable: false,
  enumerable: false
});

LogJS.BaseAppender.prototype.log = function(type, message, url, lineNumber) {};

LogJS.BaseAppender.prototype.configOpt = function(key, config, optValue) {
  return (config[this.name] && config[this.name][key]) || optValue;
};

Object.defineProperty(LogJS.BaseAppender.prototype, 'name', {
  configurable: false,
  value: 'LogJSBaseAppender',
  writable: true,
  enumerable: false
});

//Angular
if(typeof angular !== 'undefined') {
  LogJS.config.global = {
    debug: true
  };

  function LogJSProvider() {
    this.config = LogJS.config;
    let self = this;

    this.debugEnabled = function(flag) {
      if(typeof flag !== 'undefined') {
        this.config.global = {
          debug: flag
        };
        return this;
      }
      return this.config.global.debug;
    };

    this.$get = function() {
      let angularLogJS = {};
      ['error', 'info', 'verbose', 'debug', 'log', 'warn'].forEach(e => {
        let method = LogJS.info;
        if(LogJS[e]) {
          method = LogJS[e];
        }
        angularLogJS[e] = (function (method, e) {
          return function() {
            if(e !== 'debug' || self.config.global.debug) {
              method.apply(LogJS, arguments);
            }
          };
        })(method, e);
      });
      return angularLogJS;
    };
  }
}

export default LogJS;
