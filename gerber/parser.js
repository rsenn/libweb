import Util from '../util.js';

// function to determine filetype from a chunk
function determine(chunk, start, LIMIT) {
  var limit = Math.min(LIMIT - start, chunk.length);
  var current = [];
  var filetype = null;
  var index = -1;

  while(!filetype && ++index < limit) {
    var c = chunk[index];
    if(c === '\n') {
      if(current.length + index) {
        filetype = 'drill';
        current = [];
      }
    } else {
      current.push(c);
      if(c === '*' && current[0] !== ';') {
        filetype = 'gerber';
        current = [];
      }
    }
  }

  return filetype;
}

// function for getting the next block of the chunk
// returns {next: '_', read: [chars read], lines: [lines read]}
function getNext(type, chunk, start) {
  if(type !== 'gerber' && type !== 'drill') {
    throw new Error('filetype to get next block must be "drill" or "gerber"');
  }

  // parsing constants
  var limit = chunk.length - start;
  var split = type === 'gerber' ? '*' : '\n';
  var param = type === 'gerber' ? '%' : '';

  // search flags
  var splitFound = false;
  var paramStarted = false;
  var paramFound = false;
  var blockFound = false;

  // chunk results
  var found = [];
  var read = 0;
  var lines = 0;

  while(!blockFound && read < limit) {
    var c = chunk[start + read];

    // count newlines
    if(c === '\n') {
      lines++;
    }

    // check for a param start or end
    if(c === param) {
      if(!paramStarted) {
        paramStarted = true;
        found.push(c);
      } else {
        paramFound = true;
        found.pop();
      }
    } else if(c === split) {
      splitFound = true;
      if(paramStarted) {
        found.push(c);
      }
    } else if(' ' <= c && c <= '~') {
      found.push(c);
    }

    read++;
    blockFound = splitFound && (!paramStarted || paramFound);
  }

  var block = blockFound ? found.join('').trim() : '';
  var rem = !blockFound ? found.join('') : '';
  return { lines: lines, read: read, block: block, rem: rem };
}

// factories to generate all possible parsed by a gerber command
function done(line) {
  return { type: 'done', line: line || -1 };
}

function set(property, value, line) {
  return { type: 'set', line: line || -1, prop: property, value: value };
}

function level(level, value, line) {
  return { type: 'level', line: line || -1, level: level, value: value };
}

function tool(code, tool, line) {
  return { type: 'tool', line: line || -1, code: code, tool: tool };
}

function op(operation, location, line) {
  return { type: 'op', line: line || -1, op: operation, coord: location };
}

function macro(name, blocks, line) {
  return { type: 'macro', line: line || -1, name: name, blocks: blocks };
}

var commandMap = {
  set: set,
  done: done,
  level: level,
  tool: tool,
  op: op,
  macro: macro
};

// convert a decimal number or gerber/drill coordinate into an svg coordinate
// coordinate is 1000x the gerber unit
// function takes in the number string to be converted and the format object
function normalizeCoord(number, format) {
  // make sure we're dealing with a string
  if(number == null) return NaN;

  var numberString = '' + number;

  // pull out the sign and get the before and after segments ready
  var sign = '+';
  if(numberString[0] === '-' || numberString[0] === '+') {
    sign = numberString[0];
    numberString = numberString.slice(1);
  }

  // check if the number has a decimal point or has been explicitely flagged
  var hasDecimal = numberString.indexOf('.') !== -1;
  if(hasDecimal || format == null || format.zero == null) {
    return Number(sign + numberString);
  }

  // otherwise we need to use the number format to split up the string
  else {
    // make sure format is valid
    if(format.places == null || format.places.length !== 2) return NaN;

    var leading = format.places[0];
    var trailing = format.places[1];
    if(!Number.isFinite(leading) || !Number.isFinite(trailing)) return NaN;

    // pad according to trailing or leading zero suppression
    if(format.zero === 'T') numberString = numberString.padLeft(leading + trailing, '0');
    else if(format.zero === 'L') numberString = numberString.padStart(leading + trailing, '0');
    else return NaN;
  }

  // finally, parse the numberString
  var before = numberString.slice(0, leading);
  var after = numberString.slice(leading, leading + trailing);
  return Number(sign + before + '.' + after);
}

// cordinate parser function
// takes in a string with X_____Y_____I_____J_____ and a format object
// returns an object of {x: number, y: number, etc} for coordinates it finds
// convert to normalized number
var RE_TRAILING = /[XY]0\d+/;
var RE_LEADING = /[XY]\d+0(?=\D|$)/;
var MATCH = [
  { coord: 'x', test: /X([+-]?[\d\.]+)/ },
  { coord: 'y', test: /Y([+-]?[\d\.]+)/ },
  { coord: 'i', test: /I([+-]?[\d\.]+)/ },
  { coord: 'j', test: /J([+-]?[\d\.]+)/ },
  { coord: 'a', test: /A([\d\.]+)/ }
];

function parse$1(coord, format) {
  if(coord == null) {
    return {};
  }

  if(format.zero == null || format.places == null) {
    throw new Error('cannot parse coordinate with format undefined');
  }

  // pull out the x, y, i, and j
  var parsed = MATCH.reduce(function (result, matcher) {
    var coordMatch = coord.match(matcher.test);

    if(coordMatch) {
      result[matcher.coord] = normalizeCoord(coordMatch[1], format);
    }

    return result;
  }, {});

  return parsed;
}

function detectZero(coord) {
  if(RE_LEADING.test(coord)) {
    return 'L';
  }

  if(RE_TRAILING.test(coord)) {
    return 'T';
  }

  return null;
}

var parseCoord = { parse: parse$1, detectZero: detectZero };

// parse a macro expression and return a function that takes mods
var reOP$1 = /[+\-\/xX()]/;
var reNUMBER = /[$\d.]+/;
var reTOKEN = new RegExp([reOP$1.source, reNUMBER.source].join('|'), 'g');

function parseMacroExpression(parser, expr) {
  // tokenize the expression
  var tokens = expr.match(reTOKEN);

  // forward declare parse expression
  var parseExpression;

  // primary tokens are numbers and parentheses
  function parsePrimary() {
    var t = tokens.shift();
    var exp;

    if(reNUMBER.test(t)) {
      exp = { type: 'n', val: t };
    } else {
      exp = parseExpression();
      tokens.shift();
    }
    return exp;
  }

  // parse multiplication and division tokens
  function parseMultiplication() {
    var exp = parsePrimary();
    var t = tokens[0];

    if(t === 'X') {
      parser.warn("multiplication in macros should use 'x', not 'X'");
      t = 'x';
    }
    while(t === 'x' || t === '/') {
      tokens.shift();
      var right = parsePrimary();
      exp = { type: t, left: exp, right: right };
      t = tokens[0];
    }
    return exp;
  }

  // parse addition and subtraction tokens
  parseExpression = function () {
    var exp = parseMultiplication();
    var t = tokens[0];
    while(t === '+' || t === '-') {
      tokens.shift();
      var right = parseMultiplication();
      exp = { type: t, left: exp, right: right };
      t = tokens[0];
    }
    return exp;
  };

  // parse the expression string into a binary tree
  var tree = parseExpression();

  // evalute by recursively traversing the tree
  function evaluate(op, mods) {
    function getValue(t) {
      if(t[0] === '$') {
        return Number(mods[t]);
      }
      return Number(t);
    }

    var type = op.type;
    if(type === 'n') {
      return getValue(op.val);
    }
    if(type === '+') {
      return evaluate(op.left, mods) + evaluate(op.right, mods);
    }
    if(type === '-') {
      return evaluate(op.left, mods) - evaluate(op.right, mods);
    }
    if(type === 'x') {
      return evaluate(op.left, mods) * evaluate(op.right, mods);
    }
    // else division
    return evaluate(op.left, mods) / evaluate(op.right, mods);
  }

  // return the evaluation function bound to the parsed expression tree
  return function (mods) {
    return evaluate(tree, mods);
  };
}

// function to parse a macro block into a primitive object
var reNUM = /^-?[\d.]+$/;
var reVAR_DEF = /^(\$[\d+])=(.+)/;

function parseMacroBlock(parser, block) {
  // check first for a comment
  if(block[0] === '0') {
    return { type: 'comment' };
  }

  // variable definition
  if(reVAR_DEF.test(block)) {
    var varDefMatch = block.match(reVAR_DEF);
    var varName = varDefMatch[1];
    var varExpr = varDefMatch[2];
    var evaluate = parseMacroExpression(parser, varExpr);

    function setMods(mods) {
      mods[varName] = evaluate(mods);

      return mods;
    }
    return { type: 'variable', set: setMods };
  }

  // map a primitive param to a number or, if an expression, a function
  function modVal(m) {
    if(reNUM.test(m)) {
      return Number(m);
    }
    return parseMacroExpression(parser, m);
  }

  var mods = block.split(',').map(modVal);
  var code = mods[0];
  var exp = mods[1];

  // circle primitive
  if(code === 1) {
    return {
      type: 'circle',
      exp: exp,
      dia: mods[2],
      cx: mods[3],
      cy: mods[4],
      // handle optional rotation with circle primitives
      rot: mods[5] || 0
    };
  }

  // vector primitive
  if(code === 2) {
    parser.warn('macro aperture vector primitives with code 2 are deprecated');
  }

  if(code === 2 || code === 20) {
    return {
      type: 'vect',
      exp: exp,
      width: mods[2],
      x1: mods[3],
      y1: mods[4],
      x2: mods[5],
      y2: mods[6],
      rot: mods[7]
    };
  }

  // center rectangle
  if(code === 21) {
    return {
      type: 'rect',
      exp: exp,
      width: mods[2],
      height: mods[3],
      cx: mods[4],
      cy: mods[5],
      rot: mods[6]
    };
  }

  if(code === 22) {
    parser.warn('macro aperture lower-left rectangle primitives are deprecated');
    return {
      type: 'rectLL',
      exp: exp,
      width: mods[2],
      height: mods[3],
      x: mods[4],
      y: mods[5],
      rot: mods[6]
    };
  }

  if(code === 4) {
    return {
      type: 'outline',
      exp: exp,
      points: mods.slice(3, -1).map(Number),
      rot: Number(mods[mods.length - 1])
    };
  }

  if(code === 5) {
    return {
      type: 'poly',
      exp: exp,
      vertices: mods[2],
      cx: mods[3],
      cy: mods[4],
      dia: mods[5],
      rot: mods[6]
    };
  }

  if(code === 6) {
    // moire primitive always has exposure on
    return {
      type: 'moire',
      exp: 1,
      cx: mods[1],
      cy: mods[2],
      dia: mods[3],
      ringThx: mods[4],
      ringGap: mods[5],
      maxRings: mods[6],
      crossThx: mods[7],
      crossLen: mods[8],
      rot: mods[9]
    };
  }

  if(code === 7) {
    // thermal primitive always had exposure on
    return {
      type: 'thermal',
      exp: 1,
      cx: mods[1],
      cy: mods[2],
      outerDia: mods[3],
      innerDia: mods[4],
      gap: mods[5],
      rot: mods[6]
    };
  } else {
    parser.warn(code + ' is an unrecognized primitive for a macro aperture');
  }
}

// parse gerber function
// takes a parser transform stream and a block string
// g-code set matchers
var reMODE = /^G0*([123])/;
var reREGION = /^G3([67])/;
var reARC = /^G7([45])/;
var reBKP_UNITS = /^G7([01])/;
var reBKP_NOTA = /^G9([01])/;
var reCOMMENT = /^G0*4/;

// tool changes
var reTOOL = /^(?:G54)?D0*([1-9]\d+)/;

// operations
var reOP = /D0*([123])$/;
var reCOORD = /^(?:G0*[123])?((?:[XYIJ][+-]?\d+){1,4})(?:D0*[123])?$/;

// parameter code matchers
var reUNITS = /^%MO(IN|MM)/;
// format spec regexp courtesy @summivox
var reFORMAT = /^%FS([LT]?)([AI]?)(.*)X([0-7])([0-7])Y\4\5/;
var rePOLARITY = /^%LP([CD])/;
var reSTEP_REP = /^%SR(?:X(\d+)Y(\d+)I([\d.]+)J([\d.]+))?/;
var reTOOL_DEF = /^%ADD0*(\d{2,})([A-Za-z_\$][\w\-\.]*)(?:,((?:X?[\d.]+)*))?/;
var reMACRO = /^%AM([A-Za-z_\$][\w\-\.]*)\*?(.*)/;

function parseToolDef(parser, block) {
  var format = { places: parser.format.places };
  var toolMatch = block.match(reTOOL_DEF);
  var tool = toolMatch[1];
  var shapeMatch = toolMatch[2];
  var toolArgs = toolMatch[3] ? toolMatch[3].split('X') : [];

  // get the shape
  var shape;
  var maxArgs;
  if(shapeMatch === 'C') {
    shape = 'circle';
    maxArgs = 3;
  } else if(shapeMatch === 'R') {
    shape = 'rect';
    maxArgs = 4;
  } else if(shapeMatch === 'O') {
    shape = 'obround';
    maxArgs = 4;
  } else if(shapeMatch === 'P') {
    shape = 'poly';
    maxArgs = 5;
  } else {
    shape = shapeMatch;
    maxArgs = 0;
  }

  var val;
  if(shape === 'circle') {
    val = [normalizeCoord(toolArgs[0], format)];
  } else if(shape === 'rect' || shape === 'obround') {
    val = [normalizeCoord(toolArgs[0], format), normalizeCoord(toolArgs[1], format)];
  } else if(shape === 'poly') {
    val = [normalizeCoord(toolArgs[0], format), Number(toolArgs[1]), 0];
    if(toolArgs[2]) {
      val[2] = Number(toolArgs[2]);
    }
  } else {
    val = toolArgs.map(Number);
  }

  var hole = [];
  if(toolArgs[maxArgs - 1]) {
    hole = [normalizeCoord(toolArgs[maxArgs - 2], format), normalizeCoord(toolArgs[maxArgs - 1], format)];
  } else if(toolArgs[maxArgs - 2]) {
    hole = [normalizeCoord(toolArgs[maxArgs - 2], format)];
  }
  var toolDef = { shape: shape, params: val, hole: hole };
  return parser.push(commandMap.tool(tool, toolDef));
}

function parseMacroDef(parser, block) {
  var macroMatch = block.match(reMACRO);
  var name = macroMatch[1];
  if(name.match(/\-/)) {
    parser.warn('hyphens in macro name are illegal: ' + name);
  }
  var blockMatch = macroMatch[2].length ? macroMatch[2].split('*') : [];
  var blocks = blockMatch.filter(Boolean).map(function (block) {
    return parseMacroBlock(parser, block);
  });

  return parser.push(commandMap.macro(name, blocks));
}

function parse(parser, block) {
  if(reCOMMENT.test(block)) {
    return;
  }

  if(block === 'M02') {
    return parser.push(commandMap.done());
  }

  if(reREGION.test(block)) {
    var regionMatch = block.match(reREGION)[1];
    var region = regionMatch === '6' ? true : false;
    return parser.push(commandMap.set('region', region));
  }

  if(reARC.test(block)) {
    var arcMatch = block.match(reARC)[1];
    var arc = arcMatch === '4' ? 's' : 'm';
    return parser.push(commandMap.set('arc', arc));
  }

  if(reUNITS.test(block)) {
    var unitsMatch = block.match(reUNITS)[1];
    var units = unitsMatch === 'IN' ? 'in' : 'mm';
    return parser.push(commandMap.set('units', units));
  }

  if(reBKP_UNITS.test(block)) {
    var bkpUnitsMatch = block.match(reBKP_UNITS)[1];
    var backupUnits = bkpUnitsMatch === '0' ? 'in' : 'mm';
    return parser.push(commandMap.set('backupUnits', backupUnits));
  }

  if(reFORMAT.test(block)) {
    var formatMatch = block.match(reFORMAT);
    var zero = formatMatch[1];
    var nota = formatMatch[2];
    var unknown = formatMatch[3];
    var leading = Number(formatMatch[4]);
    var trailing = Number(formatMatch[5]);
    var format = parser.format;

    format.zero = format.zero || zero;
    if(!format.places) {
      format.places = [leading, trailing];
    }

    // warn if zero suppression missing or set to trailing
    if(!format.zero) {
      format.zero = 'L';
      parser.warn('zero suppression missing from format; assuming leading');
    } else if(format.zero === 'T') {
      parser.warn('trailing zero suppression has been deprecated');
    }

    // warn if there were unknown characters in the format spec
    if(unknown) {
      parser.warn('unknown characters "' + unknown + '" in "' + block + '" were ignored');
    }

    var epsilon = 1.5 * Math.pow(10, -format.places[1]);
    parser.push(commandMap.set('nota', nota));
    parser.push(commandMap.set('epsilon', epsilon));
    return;
  }

  if(reBKP_NOTA.test(block)) {
    var bkpNotaMatch = block.match(reBKP_NOTA)[1];
    var backupNota = bkpNotaMatch === '0' ? 'A' : 'I';
    return parser.push(commandMap.set('backupNota', backupNota));
  }

  if(rePOLARITY.test(block)) {
    var polarity = block.match(rePOLARITY)[1];
    return parser.push(commandMap.level('polarity', polarity));
  }

  if(reSTEP_REP.test(block)) {
    var stepRepeatMatch = block.match(reSTEP_REP);
    var x = stepRepeatMatch[1] || 1;
    var y = stepRepeatMatch[2] || 1;
    var i = stepRepeatMatch[3] || 0;
    var j = stepRepeatMatch[4] || 0;
    var sr = { x: Number(x), y: Number(y), i: Number(i), j: Number(j) };
    return parser.push(commandMap.level('stepRep', sr));
  }

  if(reTOOL.test(block)) {
    var tool = block.match(reTOOL)[1];
    return parser.push(commandMap.set('tool', tool));
  }

  if(reTOOL_DEF.test(block)) {
    return parseToolDef(parser, block);
  }

  if(reMACRO.test(block)) {
    return parseMacroDef(parser, block);
  }

  // finally, look for mode commands and operations
  // they may appear in the same block
  if(reOP.test(block) || reMODE.test(block) || reCOORD.test(block)) {
    var opMatch = block.match(reOP);
    var modeMatch = block.match(reMODE);
    var coordMatch = block.match(reCOORD);
    var mode;

    if(modeMatch) {
      if(modeMatch[1] === '1') {
        mode = 'i';
      } else if(modeMatch[1] === '2') {
        mode = 'cw';
      } else {
        mode = 'ccw';
      }

      parser.push(commandMap.set('mode', mode));
    }

    if(opMatch || coordMatch) {
      var opCode = opMatch ? opMatch[1] : '';
      var coordString = coordMatch ? coordMatch[1] : '';
      var coord = parseCoord.parse(coordString, parser.format);

      var op = 'last';
      if(opCode === '1') {
        op = 'int';
      } else if(opCode === '2') {
        op = 'move';
      } else if(opCode === '3') {
        op = 'flash';
      }

      parser.push(commandMap.op(op, coord));
    }

    return;
  }

  // if we reach here the block was unhandled, so warn if it is not empty
  return parser.warn('block "' + block + '" was not recognized and was ignored');
}

// drill parser drill and route modes
var drillMode = {
  DRILL: '5',
  MOVE: '0',
  LINEAR: '1',
  CW_ARC: '2',
  CCW_ARC: '3'
};

// parse drill function
// takes a parser transform stream and a block string
var reALTIUM_HINT = /;FILE_FORMAT=(\d):(\d)/;
var reKI_HINT = /;FORMAT={(.):(.)\/ (absolute|.+)? \/ (metric|inch) \/.+(trailing|leading|decimal|keep)/;

var reUNITS$1 = /(INCH|METRIC)(?:,([TL])Z)?/;
var reTOOL_DEF$1 = /T0*(\d+)[\S]*C([\d.]+)/;
var reTOOL_SET = /T0*(\d+)(?![\S]*C)/;
var reCOORD$1 = /((?:[XYIJA][+-]?[\d.]+){1,4})(?:G85((?:[XY][+-]?[\d.]+){1,2}))?/;
var reROUTE = /^G0([01235])/;

function setUnits(parser, units, line) {
  var format = units === 'in' ? [2, 4] : [3, 3];
  if(!parser.format.places) {
    parser.format.places = format;
  }
  return parser.push(commandMap.set('units', units, line));
}

function parseCommentForFormatHints(parser, block, line) {
  var result = {};

  if(reKI_HINT.test(block)) {
    var kicadMatch = block.match(reKI_HINT);
    var leading = Number(kicadMatch[1]);
    var trailing = Number(kicadMatch[2]);
    var absolute = kicadMatch[3];
    var unitSet = kicadMatch[4];
    var suppressionSet = kicadMatch[5];

    // set format if we got numbers
    if(Number.isFinite(leading) && Number.isFinite(trailing)) {
      result.places = [leading, trailing];
    }

    // send backup notation
    if(absolute === 'absolute') {
      parser.push(commandMap.set('backupNota', 'A', line));
    } else {
      parser.push(commandMap.set('backupNota', 'I', line));
    }

    // send units
    if(unitSet === 'metric') {
      parser.push(commandMap.set('backupUnits', 'mm', line));
    } else {
      parser.push(commandMap.set('backupUnits', 'in', line));
    }

    // set zero suppression
    if(suppressionSet === 'leading' || suppressionSet === 'keep') {
      result.zero = 'L';
    } else if(suppressionSet === 'trailing') {
      result.zero = 'T';
    } else {
      result.zero = 'D';
    }
  }

  // check for altium format hints if the format is not already set
  else if(reALTIUM_HINT.test(block)) {
    var altiumMatch = block.match(reALTIUM_HINT);

    result.places = [Number(altiumMatch[1]), Number(altiumMatch[2])];
  }

  return result;
}

function zeroFromSupression(suppression) {
  if(suppression === 'T') {
    return 'L';
  } else if(suppression === 'L') {
    return 'T';
  }
}

function parseUnits(parser, block, line) {
  var unitsMatch = block.match(reUNITS$1);
  var units = unitsMatch[1];
  var suppression = unitsMatch[2];

  if(units === 'METRIC') {
    setUnits(parser, 'mm', line);
  } else {
    setUnits(parser, 'in', line);
  }

  if(parser.format.zero == null) {
    parser.format.zero = zeroFromSupression(suppression);
  }
}

function coordToCommand(parser, block, line) {
  var coordMatch = block.match(reCOORD$1);
  var coord = parseCoord.parse(coordMatch[1], parser.format);

  // if there's another match, then it was a slot
  if(coordMatch[2]) {
    parser.push(commandMap.op('move', coord, line));
    parser.push(commandMap.set('mode', 'i', line));
    coord = parseCoord.parse(coordMatch[2], parser.format);

    return parser.push(commandMap.op('int', coord, line));
  }

  // get the drill mode if a route command is present
  if(reROUTE.test(block)) {
    parser.drillMode = block.match(reROUTE)[1];
  }

  switch (parser.drillMode) {
    case drillMode.DRILL:
      return parser.push(commandMap.op('flash', coord, line));

    case drillMode.MOVE:
      return parser.push(commandMap.op('move', coord, line));

    case drillMode.LINEAR:
      parser.push(commandMap.set('mode', 'i', line));
      return parser.push(commandMap.op('int', coord, line));

    case drillMode.CW_ARC:
      parser.push(commandMap.set('mode', 'cw', line));
      return parser.push(commandMap.op('int', coord, line));

    case drillMode.CCW_ARC:
      parser.push(commandMap.set('mode', 'ccw', line));
      return parser.push(commandMap.op('int', coord, line));
  }
}

function parseBlock(parser, block, line) {
  if(reTOOL_DEF$1.test(block)) {
    var toolMatch = block.match(reTOOL_DEF$1);
    var toolCode = toolMatch[1];
    var toolDia = normalizeCoord(toolMatch[2]);
    var toolDef = { shape: 'circle', params: [toolDia], hole: [] };

    return parser.push(commandMap.tool(toolCode, toolDef, line));
  }

  // tool set
  if(reTOOL_SET.test(block)) {
    var toolSet = block.match(reTOOL_SET)[1];

    // allow tool set to fall through because it can happen on the
    // same line as a coordinate operation
    parser.push(commandMap.set('tool', toolSet, line));
  }

  if(reCOORD$1.test(block)) {
    if(!parser.format.places) {
      parser.format.places = [2, 4];
      parser.warn('places format missing; assuming [2, 4]');
    }

    return coordToCommand(parser, block, line);
  }

  if(block === 'M00' || block === 'M30') {
    return parser.push(commandMap.done(line));
  }

  if(block === 'M71') {
    return setUnits(parser, 'mm', line);
  }

  if(block === 'M72') {
    return setUnits(parser, 'in', line);
  }

  if(block === 'G90') {
    return parser.push(commandMap.set('nota', 'A', line));
  }

  if(block === 'G91') {
    return parser.push(commandMap.set('nota', 'I', line));
  }

  if(reUNITS$1.test(block)) {
    return parseUnits(parser, block, line);
  }

  return;
}

function flush(parser) {
  if(parser.drillStash.length) {
    parser.drillStash.forEach(function (data) {
      if(!parser.format.zero && reCOORD$1.test(data.block)) {
        parser.format.zero = 'T';
        parser.warn('zero suppression missing and not detectable;' + ' assuming trailing suppression');
      }
      parseBlock(parser, data.block, data.line);
    });
    parser.drillStash = [];
  }
}

function parse$2(parser, block) {
  parser.drillStash = parser.drillStash || [];

  // parse comments for formatting hints and ignore the rest
  if(block[0] === ';') {
    // check for kicad format hints
    var formatHints = parseCommentForFormatHints(parser, block, parser.line);

    Object.keys(formatHints).forEach(function (key) {
      if(!parser.format[key]) {
        parser.format[key] = formatHints[key];
      }
    });

    return;
  }

  // detect or assume zero suppression
  if(!parser.format.zero) {
    if(parser.drillStash.length >= 1000) {
      flush(parser);
      return parseBlock(parser, block, parser.line);
    }
    if(reCOORD$1.test(block)) {
      parser.format.zero = parseCoord.detectZero(block);
      if(parser.format.zero) {
        var zero = parser.format.zero === 'L' ? 'leading' : 'trailing';
        parser.warn('zero suppression missing; detected ' + zero + ' suppression');
        flush(parser);
        return parseBlock(parser, block, parser.line);
      }
    } else if(reUNITS$1.test(block)) {
      var unitsMatch = block.match(reUNITS$1);
      var suppression = unitsMatch[2];
      parser.format.zero = zeroFromSupression(suppression);
      if(parser.format.zero) {
        flush(parser);
        return parseBlock(parser, block, parser.line);
      }
    }

    return parser.drillStash.push({ line: parser.line, block: block });
  }

  return parseBlock(parser, block, parser.line);
}

var parseDrill = { parse: parse$2, flush: flush };

// simple warning class to be emitted when something questionable in the gerber is found
function warning(message, line) {
  return { message: message, line: line };
}

// generic file parser for gerber and drill files
var LIMIT = 65535;

export class Parser extends TransformStream {
  constructor(places, zero, filetype) {
    super({ readableObjectMode: true });

    // parser properties
    // this.decoder = new StringDecoder('utf8');
    this.stash = '';
    this.index = 0;
    this.drillMode = drillMode.DRILL;
    this.syncResult = null;
    this.line = 0;
    this.format = { places: places, zero: zero, filetype: filetype };
  }

  process(chunk, filetype) {
    while(this.index < chunk.length) {
      var next = getNext(filetype, chunk, this.index);
      this.index += next.read;
      this.line += next.lines;
      this.stash += next.rem;

      if(next.block) {
        if(filetype === 'gerber') {
          parse(this, next.block);
        } else {
          parseDrill.parse(this, next.block);
        }
      }
    }
  }

  transform(chunk, encoding, done) {
    var filetype = this.format.filetype;

    // decode buffer to string
    //chunk = this.decoder.write(chunk);

    // determine filetype within 65535 characters
    if(!filetype) {
      filetype = determine(chunk, this.index, LIMIT);
      this.index += chunk.length;

      if(!filetype) {
        if(this.index >= LIMIT) {
          return done(new Error('unable to determine filetype'));
        }
        this.stash += chunk;
        return done();
      } else {
        this.format.filetype = filetype;
        this.index = 0;
      }
    }

    chunk = this.stash + chunk;
    this.stash = '';

    this.process(chunk, filetype);

    this.index = 0;
    done();
  }

  flush(done) {
    if(this.format.filetype === 'drill') {
      parseDrill.flush(this);
    }

    return done && done();
  }

  push(data) {
    if(data.line === -1) {
      data.line = this.line;
    }

    var pushTarget = !this.syncResult ? this : this.syncResult;
    pushTarget.push(data);
  }

  warn(message) {
    console.warn(warning(message, this.line));
    //  this.emit('warning', warning(message, this.line));
  }

  parseSync(file) {
    var filetype = determine(file, this.index, 100 * LIMIT);
    this.format.filetype = filetype;
    this.syncResult = [];
    this.process(file, filetype);
    this.flush();

    return this.syncResult;
  }
}

export default Parser;
