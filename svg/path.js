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

let absCommands = ['M', 'Z', 'L', 'H', 'V', 'C', 'S', 'Q', 'T', 'A'];
let relCommands = absCommands.map(letter => letter.toLowerCase());
let commands = absCommands.concat(relCommands);

/**
 * Creates a path builder. Can be invoked without new.
 * @returns {SvgPath}
 * @constructor
 */
export function SvgPath() {
  //TODO is this check robust enough?
  if(this instanceof SvgPath) {
    //this.relative = false;
    this.commands = [];
  } else {
    return new SvgPath();
  }
}

/**
 * Turns relative mode on (lowercase commands will be used)
 * @returns {SvgPath}
 */
SvgPath.prototype.rel = function() {
  this.relative = true;
  return this;
};

/**
 * Turns relative mode off (uppercase commands will be used)
 * @returns {SvgPath}
 */
SvgPath.prototype.abs = function() {
  this.relative = false;
  return this;
};

/**
 * Closes subpath (Z command)
 * @returns {SvgPath}
 */
SvgPath.prototype.close = function() {
  return this._cmd('Z')();
};

/**
 * Moves pen (M or m command)
 * Also accepts point, i.e. { x: 10, y: 20 }
 * @param x
 * @param y
 * @returns {SvgPath}
 */
SvgPath.prototype.to = function(x, y) {
  let point = typeof x === 'object' ? x : { x, y };
  return this._cmd('M')(point.x, point.y);
};

/**
 * Draws line (L or l command)
 * Also accepts point, i.e. { x: 10, y: 20 }
 * @param x
 * @param y
 * @returns {SvgPath}
 */
SvgPath.prototype.line = function(x, y) {
  let point = typeof x === 'object' ? x : { x, y };
  return this._cmd('L')(point.x, point.y);
};

/**
 * Draws horizontal line (H or h command)
 * @param x
 * @returns {SvgPath}
 */
SvgPath.prototype.hline = function(x) {
  return this._cmd('H')(x);
};

/**
 * Draws vertical line (V or v command)
 * @param y
 * @returns {SvgPath}
 */
SvgPath.prototype.vline = function(y) {
  return this._cmd('V')(y);
};

/**
 * Draws cubic bezier curve (C or c command)
 * Also accepts 2 or 3 points, i.e. { x: 10, y: 20 }
 * If last point is omitted, acts like shortcut (S or s command)
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param x
 * @param y
 * @returns {SvgPath}
 */
SvgPath.prototype.bezier3 = function(x1, y1, x2, y2, x, y) {
  let usePoints = typeof x1 === 'object';
  let shortcut = usePoints ? arguments.length < 3 : arguments.length < 6;
  let p1 = { x: x1, y: y1 };
  let p2 = { x: x2, y: y2 };
  let end = shortcut ? p2 : { x, y };
  if(usePoints) {
    p1 = x1;
    p2 = y1;
    end = shortcut ? p2 : x2;
  }
  if(!shortcut) {
    return this._cmd('C')(p1.x, p1.y, p2.x, p2.y, end.x, end.y);
  }
  return this._cmd('S')(p1.x, p1.y, end.x, end.y);
};

/**
 * Draws quadratic bezier curve (Q or q command)
 * Also accepts 1 or 2 points, i.e. { x: 10, y: 20 }
 * If last point is omitted, acts like shortcut (T or t command)
 * @param x1
 * @param y1
 * @param x
 * @param y
 * @returns {SvgPath}
 */
SvgPath.prototype.bezier2 = function(x1, y1, x, y) {
  let usePoints = typeof x1 === 'object';
  let shortcut = usePoints ? arguments.length < 2 : arguments.length < 4;
  let p1 = { x: x1, y: y1 };
  let end = shortcut ? p1 : { x, y };
  if(usePoints) {
    p1 = x1;
    end = shortcut ? p1 : y1;
  }
  if(!shortcut) {
    return this._cmd('Q')(p1.x, p1.y, end.x, end.y);
  }
  return this._cmd('T')(end.x, end.y);
};

/**
 * Draws an arc (A or a command)
 * Also accepts end point, i.e. { x: 10, y: 20 }
 * @param rx
 * @param ry
 * @param rotation
 * @param large
 * @param sweep
 * @param x
 * @param y
 * @returns {*}
 */
SvgPath.prototype.arc = function(rx, ry, rotation, large, sweep, x, y) {
  let point = typeof x === 'object' ? x : { x, y };
  return this._cmd('A')(rx,
    ry,
    rotation,
    large ? 1 : 0,
    sweep ? 1 : 0,
    point.x,
    point.y
  );
};

SvgPath.prototype.cmd = function(command, ...args) {
  let fn = this[command];
  return fn.apply(this, args);
};

/**
 * String representation of command chain
 * @returns {string}
 */
SvgPath.prototype.str = function(digits, lineSep = ' ') {
  return this.commands
    .map(command => {
      let str =
        Command.prototype.toString.call(command, digits) || command + '';

      return str;
    })
    .join(lineSep);
};

SvgPath.prototype.toString = SvgPath.prototype.str;

//setting letter commands
commands.forEach(commandName => {
  SvgPath.prototype[commandName] = function() {
    let args = Array.prototype.slice.call(arguments, 0);
    args.unshift(commandName);
    let command = new Command(...args);
    this.commands.push(command);
    return this;
  };
});

/**
 * Gets either absolute (uppercase) or relative (lowercase) version of command depending on mode
 * @param letter
 * @returns {function}
 * @private
 */
SvgPath.prototype._cmd = function(letter) {
  let actualName = this.relative ? letter.toLowerCase() : letter.toUpperCase();
  //TODO maybe direct invokation is better than binding?
  return this[actualName].bind(this);
};

/**
 * Represents a single command
 * @param name
 * @constructor
 */
function Command(name, ...args) {
  this.name = name;
  this.args = args;
}

/**
 * String representation of a command
 * @returns {string}
 */
Command.prototype.toString = function(digits) {
  let { name, args = [] } = this;

  if(digits !== undefined) args = args.map(a => +a.toFixed(digits));

  return name + args.reduce((acc, arg) => acc + ` ${arg}`, '');
};

SvgPath.prototype.toRelative = function() {
  let prevX = 0,
    prevY = 0;
  let cmds = [];
  let start;

  for(let cmd of this.commands) {
    const { name, args } = cmd;

    switch (name) {
      case 'M': {
        const [x, y] = args;
        args[0] -= prevX;
        args[1] -= prevY;
        prevX = x;
        prevY = y;
        break;
      }
      case 'Z': {
        break;
      }
      case 'L': {
        const [x, y] = args;
        args[0] -= prevX;
        args[1] -= prevY;
        prevX = x;
        prevY = y;
        break;
      }
      case 'H': {
        const [x] = args;
        args[0] -= prevX;

        prevX = x;
        break;
      }
      case 'V': {
        const [y] = args;
        args[0] -= prevY;
        prevY = y;
        break;
      }
      case 'C': {
        const [x1, y1, x2, y2, x, y] = args;
        args[0] -= prevX;
        args[1] -= prevY;
        args[2] -= prevX;
        args[3] -= prevY;
        args[4] -= prevX;
        args[5] -= prevY;
        prevX = x;
        prevY = y;
        break;
      }
      case 'S': {
        const [x2, y2, x, y] = args;
        args[0] -= prevX;
        args[1] -= prevY;
        args[2] -= prevX;
        args[3] -= prevY;
        prevX = x;
        prevY = y;
        break;
      }
      case 'Q': {
        const [x1, y1, x, y] = args;
        args[0] -= prevX;
        args[1] -= prevY;
        args[2] -= prevX;
        args[3] -= prevY;
        prevX = x;
        prevY = y;
        break;
      }
      case 'T': {
        const [x, y] = args;
        args[0] -= prevX;
        args[1] -= prevY;
        prevX = x;
        prevY = y;
        break;
      }
      case 'A': {
        const [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y] = args;
        args[5] -= prevX;
        args[6] -= prevY;
        prevX = x;
        prevY = y;
        break;
      }
      case 'm': {
        const [x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'z': {
        break;
      }
      case 'l': {
        const [x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'h': {
        const [x] = args;

        prevX = x;
        break;
      }
      case 'v': {
        const [y] = args;
        prevY = y;
        break;
      }
      case 'c': {
        const [x1, y1, x2, y2, x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 's': {
        const [x2, y2, x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'q': {
        const [x1, y1, x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 't': {
        const [x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'a': {
        const [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
    }
    if(!start) start = { x: prevX, y: prevY };

    cmds.push(new Command(name.toLowerCase(), ...args));
  }
  let ret = new SvgPath();
  ret.commands = cmds;
  return ret;
};

SvgPath.prototype.toAbsolute = function() {
  let prevX = 0,
    prevY = 0;
  let cmds = [];
  let start;

  for(let cmd of this.commands) {
    const { name, args } = cmd;

    switch (name) {
      case 'm': {
        const [x, y] = args;
        args[0] += prevX;
        args[1] += prevY;
        prevX = args[0];
        prevY = args[1];
        break;
      }
      case 'z': {
        break;
      }
      case 'l': {
        const [x, y] = args;
        args[0] += prevX;
        args[1] += prevY;
        prevX = args[0];
        prevY = args[1];
        break;
      }
      case 'h': {
        const [x] = args;
        args[0] += prevX;

        prevX = args[0];
        break;
      }
      case 'v': {
        const [y] = args;
        args[0] += prevY;
        prevY = args[0];
        break;
      }
      case 'c': {
        const [x1, y1, x2, y2, x, y] = args;
        args[0] += prevX;
        args[1] += prevY;
        args[2] += prevX;
        args[3] += prevY;
        args[4] += prevX;
        args[5] += prevY;
        prevX = args[0];
        prevY = args[1];
        break;
      }
      case 's': {
        const [x2, y2, x, y] = args;
        args[0] += prevX;
        args[1] += prevY;
        args[2] += prevX;
        args[3] += prevY;
        prevX = args[2];
        prevY = args[3];
        break;
      }
      case 'q': {
        const [x1, y1, x, y] = args;
        args[0] += prevX;
        args[1] += prevY;
        args[2] += prevX;
        args[3] += prevY;
        prevX = args[2];
        prevY = args[3];
        break;
      }
      case 't': {
        const [x, y] = args;
        args[0] += prevX;
        args[1] += prevY;
        prevX = args[0];
        prevY = args[1];
        break;
      }
      case 'a': {
        const [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y] = args;
        args[5] += prevX;
        args[6] += prevY;
        prevX = args[5];
        prevY = args[6];
        break;
      }
      case 'M': {
        const [x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'Z': {
        break;
      }
      case 'L': {
        const [x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'H': {
        const [x] = args;
        prevX = x;
        break;
      }
      case 'V': {
        const [y] = args;
        prevY = y;
        break;
      }
      case 'C': {
        const [x1, y1, x2, y2, x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'S': {
        const [x2, y2, x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'Q': {
        const [x1, y1, x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'T': {
        const [x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
      case 'A': {
        const [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y] = args;
        prevX = x;
        prevY = y;
        break;
      }
    }
    if(!start) start = { x: prevX, y: prevY };

    cmds.push(new Command(name.toUpperCase(), ...args));
  }
  let ret = new SvgPath();
  ret.commands = cmds;
  return ret;
};

export default SvgPath;
