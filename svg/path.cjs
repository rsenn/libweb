require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

/**
 * SvgPath
 * Chainable SVG path string generator with some sugar added
 * Supports Node, AMD and browser environments (EcmaScript 5+ or shims)
 * No dependencies
 *
 * @format
 * @version 0.2.1
 * @author Igor Zalutsky
 * @license MIT
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.SvgPath = factory();
  }
})(this, function () {
  "use strict";

  var absCommands = ["M", "Z", "L", "H", "V", "C", "S", "Q", "T", "A"];
  var relCommands = absCommands.map(function (letter) {
    return letter.toLowerCase();
  });
  var commands = absCommands.concat(relCommands);

  function SvgPath() {
    if (this instanceof SvgPath) {
      this.relative = false;
      this.commands = [];
    } else {
      return new SvgPath();
    }
  }

  SvgPath.prototype.rel = function () {
    this.relative = true;
    return this;
  };

  SvgPath.prototype.abs = function () {
    this.relative = false;
    return this;
  };

  SvgPath.prototype.close = function () {
    return this._cmd("Z")();
  };

  SvgPath.prototype.to = function (x, y) {
    var point = typeof x === "object" ? x : {
      x: x,
      y: y
    };
    return this._cmd("M")(point.x, point.y);
  };

  SvgPath.prototype.line = function (x, y) {
    var point = typeof x === "object" ? x : {
      x: x,
      y: y
    };
    return this._cmd("L")(point.x, point.y);
  };

  SvgPath.prototype.hline = function (x) {
    return this._cmd("H")(x);
  };

  SvgPath.prototype.vline = function (y) {
    return this._cmd("V")(y);
  };

  SvgPath.prototype.bezier3 = function (x1, y1, x2, y2, x, y) {
    var usePoints = typeof x1 === "object";
    var shortcut = usePoints ? arguments.length < 3 : arguments.length < 6;
    var p1 = {
      x: x1,
      y: y1
    };
    var p2 = {
      x: x2,
      y: y2
    };
    var end = shortcut ? p2 : {
      x: x,
      y: y
    };

    if (usePoints) {
      p1 = x1;
      p2 = y1;
      end = shortcut ? p2 : x2;
    }

    if (!shortcut) {
      return this._cmd("C")(p1.x, p1.y, p2.x, p2.y, end.x, end.y);
    } else {
      return this._cmd("S")(p1.x, p1.y, end.x, end.y);
    }
  };

  SvgPath.prototype.bezier2 = function (x1, y1, x, y) {
    var usePoints = typeof x1 === "object";
    var shortcut = usePoints ? arguments.length < 2 : arguments.length < 4;
    var p1 = {
      x: x1,
      y: y1
    };
    var end = shortcut ? p1 : {
      x: x,
      y: y
    };

    if (usePoints) {
      p1 = x1;
      end = shortcut ? p1 : y1;
    }

    if (!shortcut) {
      return this._cmd("Q")(p1.x, p1.y, end.x, end.y);
    } else {
      return this._cmd("T")(end.x, end.y);
    }
  };

  SvgPath.prototype.arc = function (rx, ry, rotation, large, sweep, x, y) {
    var point = typeof x === "object" ? x : {
      x: x,
      y: y
    };
    return this._cmd("A")(rx, ry, rotation, large ? 1 : 0, sweep ? 1 : 0, point.x, point.y);
  };

  SvgPath.prototype.cmd = function (cmd) {
    let args = [...arguments];
    let command = args.shift();

    let fn = this._cmd(command);

    return fn.apply(null, args);
  };

  SvgPath.prototype.str = function () {
    return this.commands.map(function (command) {
      return command.toString();
    }).join(" ");
  };

  commands.forEach(function (commandName) {
    SvgPath.prototype[commandName] = function () {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(commandName);
      var command = new Command(args);
      this.commands.push(command);
      return this;
    };
  });

  SvgPath.prototype._cmd = function (letter) {
    var actualName = this.relative ? letter.toLowerCase() : letter.toUpperCase();
    return this[actualName].bind(this);
  };

  function Command(name) {
    var args = name.length > 0 && name.slice ? name : Array.prototype.slice.call(arguments, 0);
    this.name = args[0];
    this.args = args.slice(1);
  }

  Command.prototype.toString = function () {
    return this.name + this.args.join(" ");
  };

  return SvgPath;
});