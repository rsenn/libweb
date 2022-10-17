import { ArrayWriter, readStream, LineReader } from '../stream/utils.js';

// function to determine filetype from a chunk
function determine(chunk, start, LIMIT) {
  let limit = Math.min(LIMIT - start, chunk.length);
  let current = [];
  let filetype = null;
  let index = -1;

  while(!filetype && ++index < limit) {
    let c = chunk[index];
    // console.debug("determine",{index,c, limit, current});
    if(c === '%' && index == 0) {
      if(current.length == 0) filetype = 'drill';
    } else if(c === '\n') {
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
  let limit = chunk.length - start;
  let split = type === 'gerber' ? '*' : '\n';
  let param = type === 'gerber' ? '%' : '';

  // search flags
  let splitFound = false;
  let paramStarted = false;
  let paramFound = false;
  let blockFound = false;

  // chunk results
  let found = [];
  let read = 0;
  let lines = 0;

  while(!blockFound && read < limit) {
    let c = chunk[start + read];

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

  let block = blockFound ? found.join('').trim() : '';
  let rem = !blockFound ? found.join('') : '';
  return { lines, read, block, rem };
}

// factories to generate all possible parsed by a gerber command
function done(line) {
  return { type: 'done', line: line || -1 };
}

function set(property, value, line) {
  return { type: 'set', line: line || -1, prop: property, value };
}

function level(level, value, line) {
  return { type: 'level', line: line || -1, level, value };
}

function tool(code, tool, line) {
  return { type: 'tool', line: line || -1, code, tool };
}

function op(operation, location, line) {
  return { type: 'op', line: line || -1, op: operation, coord: location };
}

function macro(name, blocks, line) {
  return { type: 'macro', line: line || -1, name, blocks };
}

let commandMap = {
  set,
  done,
  level,
  tool,
  op,
  macro
};

// convert a decimal number or gerber/drill coordinate into an svg coordinate
// coordinate is 1000x the gerber unit
// function takes in the number string to be converted and the format object
function normalizeCoord(number, format) {
  // make sure we're dealing with a string
  if(number == null) return NaN;

  let numberString = '' + number;

  // pull out the sign and get the before and after segments ready
  let sign = '+';
  if(numberString[0] === '-' || numberString[0] === '+') {
    sign = numberString[0];
    numberString = numberString.slice(1);
  }

  // check if the number has a decimal point or has been explicitely flagged
  let hasDecimal = numberString.indexOf('.') !== -1;
  if(hasDecimal || format == null || format.zero == null) {
    return Number(sign + numberString);
  }

  // otherwise we need to use the number format to split up the string

  // make sure format is valid
  if(format.places == null || format.places.length !== 2) return NaN;

  let leading = format.places[0];
  let trailing = format.places[1];
  if(!Number.isFinite(leading) || !Number.isFinite(trailing)) return NaN;

  // pad according to trailing or leading zero suppression
  if(format.zero === 'T') numberString = numberString.padStart(leading + trailing, '0');
  else if(format.zero === 'L') numberString = numberString.padStart(leading + trailing, '0');
  else return NaN;

  // finally, parse the numberString
  let before = numberString.slice(0, leading);
  let after = numberString.slice(leading, leading + trailing);
  return Number(sign + before + '.' + after);
}

// cordinate parser function
// takes in a string with X_____Y_____I_____J_____ and a format object
// returns an object of {x: number, y: number, etc} for coordinates it finds
// convert to normalized number
let RE_TRAILING = /[XY]0\d+/;
let RE_LEADING = /[XY]\d+0(?=\D|$)/;
let MATCH = [
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
  let parsed = MATCH.reduce((result, matcher) => {
    let coordMatch = coord.match(matcher.test);

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

let parseCoord = { parse: parse$1, detectZero };

// parse a macro expression and return a function that takes mods
let reOP$1 = /[+\-\/xX()]/;
let reNUMBER = /[$\d.]+/;
let reTOKEN = new RegExp([reOP$1.source, reNUMBER.source].join('|'), 'g');

function parseMacroExpression(parser, expr) {
  // tokenize the expression
  let tokens = expr.match(reTOKEN);

  // forward declare parse expression
  let parseExpression;

  // primary tokens are numbers and parentheses
  function parsePrimary() {
    let t = tokens.shift();
    let exp;

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
    let exp = parsePrimary();
    let t = tokens[0];

    if(t === 'X') {
      parser.warn("multiplication in macros should use 'x', not 'X'");
      t = 'x';
    }
    while(t === 'x' || t === '/') {
      tokens.shift();
      let right = parsePrimary();
      exp = { type: t, left: exp, right };
      t = tokens[0];
    }
    return exp;
  }

  // parse addition and subtraction tokens
  parseExpression = function() {
    let exp = parseMultiplication();
    let t = tokens[0];
    while(t === '+' || t === '-') {
      tokens.shift();
      let right = parseMultiplication();
      exp = { type: t, left: exp, right };
      t = tokens[0];
    }
    return exp;
  };

  // parse the expression string into a binary tree
  let tree = parseExpression();

  // evalute by recursively traversing the tree
  function evaluate(op, mods) {
    function getValue(t) {
      if(t[0] === '$') {
        return Number(mods[t]);
      }
      return Number(t);
    }

    let type = op.type;
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
  return function(mods) {
    return evaluate(tree, mods);
  };
}

// function to parse a macro block into a primitive object
let reNUM = /^-?[\d.]+$/;
let reVAR_DEF = /^(\$[\d+])=(.+)/;

function parseMacroBlock(parser, block) {
  // check first for a comment
  if(block[0] === '0') {
    return { type: 'comment' };
  }

  // variable definition
  if(reVAR_DEF.test(block)) {
    let varDefMatch = block.match(reVAR_DEF);
    let varName = varDefMatch[1];
    let varExpr = varDefMatch[2];
    let evaluate = parseMacroExpression(parser, varExpr);

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

  let mods = block.split(',').map(modVal);
  let code = mods[0];
  let exp = mods[1];

  // circle primitive
  if(code === 1) {
    return {
      type: 'circle',
      exp,
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
      exp,
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
      exp,
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
      exp,
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
      exp,
      points: mods.slice(3, -1).map(Number),
      rot: Number(mods[mods.length - 1])
    };
  }

  if(code === 5) {
    return {
      type: 'poly',
      exp,
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
  }
  parser.warn(code + ' is an unrecognized primitive for a macro aperture');
}

// parse gerber function
// takes a parser transform stream and a block string
// g-code set matchers
let reMODE = /^G0*([123])/;
let reREGION = /^G3([67])/;
let reARC = /^G7([45])/;
let reBKP_UNITS = /^G7([01])/;
let reBKP_NOTA = /^G9([01])/;
let reCOMMENT = /^G0*4/;

// tool changes
let reTOOL = /^(?:G54)?D0*([1-9]\d+)/;

// operations
let reOP = /D0*([123])$/;
let reCOORD = /^(?:G0*[123])?((?:[XYIJ][+-]?\d+){1,4})(?:D0*[123])?$/;

// parameter code matchers
let reUNITS = /^%MO(IN|MM)/;
// format spec regexp courtesy @summivox
let reFORMAT = /^%FS([LT]?)([AI]?)(.*)X([0-7])([0-7])Y\4\5/;
let rePOLARITY = /^%LP([CD])/;
let reSTEP_REP = /^%SR(?:X(\d+)Y(\d+)I([\d.]+)J([\d.]+))?/;
let reTOOL_DEF = /^%ADD0*(\d{2,})([A-Za-z_\$][\w\-\.]*)(?:,((?:X?[\d.]+)*))?/;
let reMACRO = /^%AM([A-Za-z_\$][\w\-\.]*)\*?(.*)/;

function parseToolDef(parser, block) {
  let format = { places: parser.format.places };
  let toolMatch = block.match(reTOOL_DEF);
  let tool = toolMatch[1];
  let shapeMatch = toolMatch[2];
  let toolArgs = toolMatch[3] ? toolMatch[3].split('X') : [];

  // get the shape
  let shape;
  let maxArgs;
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

  let val;
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

  let hole = [];
  if(toolArgs[maxArgs - 1]) {
    hole = [normalizeCoord(toolArgs[maxArgs - 2], format), normalizeCoord(toolArgs[maxArgs - 1], format)];
  } else if(toolArgs[maxArgs - 2]) {
    hole = [normalizeCoord(toolArgs[maxArgs - 2], format)];
  }
  let toolDef = { shape, params: val, hole };
  return parser.push(commandMap.tool(tool, toolDef));
}

function parseMacroDef(parser, block) {
  let macroMatch = block.match(reMACRO);
  let name = macroMatch[1];
  if(name.match(/\-/)) {
    parser.warn('hyphens in macro name are illegal: ' + name);
  }
  let blockMatch = macroMatch[2].length ? macroMatch[2].split('*') : [];
  let blocks = blockMatch.filter(Boolean).map(block => parseMacroBlock(parser, block));

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
    let regionMatch = block.match(reREGION)[1];
    let region = regionMatch === '6';
    return parser.push(commandMap.set('region', region));
  }

  if(reARC.test(block)) {
    let arcMatch = block.match(reARC)[1];
    let arc = arcMatch === '4' ? 's' : 'm';
    return parser.push(commandMap.set('arc', arc));
  }

  if(reUNITS.test(block)) {
    let unitsMatch = block.match(reUNITS)[1];
    let units = unitsMatch === 'IN' ? 'in' : 'mm';
    return parser.push(commandMap.set('units', units));
  }

  if(reBKP_UNITS.test(block)) {
    let bkpUnitsMatch = block.match(reBKP_UNITS)[1];
    let backupUnits = bkpUnitsMatch === '0' ? 'in' : 'mm';
    return parser.push(commandMap.set('backupUnits', backupUnits));
  }

  if(reFORMAT.test(block)) {
    let formatMatch = block.match(reFORMAT);
    let zero = formatMatch[1];
    let nota = formatMatch[2];
    let unknown = formatMatch[3];
    let leading = Number(formatMatch[4]);
    let trailing = Number(formatMatch[5]);
    let format = parser.format;

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

    let epsilon = 1.5 * Math.pow(10, -format.places[1]);
    parser.push(commandMap.set('nota', nota));
    parser.push(commandMap.set('epsilon', epsilon));
    return;
  }

  if(reBKP_NOTA.test(block)) {
    let bkpNotaMatch = block.match(reBKP_NOTA)[1];
    let backupNota = bkpNotaMatch === '0' ? 'A' : 'I';
    return parser.push(commandMap.set('backupNota', backupNota));
  }

  if(rePOLARITY.test(block)) {
    let polarity = block.match(rePOLARITY)[1];
    return parser.push(commandMap.level('polarity', polarity));
  }

  if(reSTEP_REP.test(block)) {
    let stepRepeatMatch = block.match(reSTEP_REP);
    let x = stepRepeatMatch[1] || 1;
    let y = stepRepeatMatch[2] || 1;
    let i = stepRepeatMatch[3] || 0;
    let j = stepRepeatMatch[4] || 0;
    let sr = { x: Number(x), y: Number(y), i: Number(i), j: Number(j) };
    return parser.push(commandMap.level('stepRep', sr));
  }

  if(reTOOL.test(block)) {
    let tool = block.match(reTOOL)[1];
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
    let opMatch = block.match(reOP);
    let modeMatch = block.match(reMODE);
    let coordMatch = block.match(reCOORD);
    let mode;

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
      let opCode = opMatch ? opMatch[1] : '';
      let coordString = coordMatch ? coordMatch[1] : '';
      let coord = parseCoord.parse(coordString, parser.format);

      let op = 'last';
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
let drillMode = {
  DRILL: '5',
  MOVE: '0',
  LINEAR: '1',
  CW_ARC: '2',
  CCW_ARC: '3'
};

// parse drill function
// takes a parser transform stream and a block string
let reALTIUM_HINT = /;FILE_FORMAT=(\d):(\d)/;
let reKI_HINT = /;FORMAT={(.):(.)\/ (absolute|.+)? \/ (metric|inch) \/.+(trailing|leading|decimal|keep)/;

let reUNITS$1 = /(INCH|METRIC)(?:,([TL])Z)?/;
let reTOOL_DEF$1 = /T0*(\d+)[\S]*C([\d.]+)/;
let reTOOL_SET = /T0*(\d+)(?![\S]*C)/;
let reCOORD$1 = /((?:[XYIJA][+-]?[\d.]+){1,4})(?:G85((?:[XY][+-]?[\d.]+){1,2}))?/;
let reROUTE = /^G0([01235])/;

function setUnits(parser, units, line) {
  let format = units === 'in' ? [2, 4] : [3, 3];
  if(!parser.format.places) {
    parser.format.places = format;
  }
  return parser.push(commandMap.set('units', units, line));
}

function parseCommentForFormatHints(parser, block, line) {
  let result = {};

  if(reKI_HINT.test(block)) {
    let kicadMatch = block.match(reKI_HINT);
    let leading = Number(kicadMatch[1]);
    let trailing = Number(kicadMatch[2]);
    let absolute = kicadMatch[3];
    let unitSet = kicadMatch[4];
    let suppressionSet = kicadMatch[5];

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
    let altiumMatch = block.match(reALTIUM_HINT);

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
  let unitsMatch = block.match(reUNITS$1);
  let units = unitsMatch[1];
  let suppression = unitsMatch[2];

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
  let coordMatch = block.match(reCOORD$1);
  let coord = parseCoord.parse(coordMatch[1], parser.format);

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
    let toolMatch = block.match(reTOOL_DEF$1);
    let toolCode = toolMatch[1];
    let toolDia = normalizeCoord(toolMatch[2]);
    let toolDef = { shape: 'circle', params: [toolDia], hole: [] };

    return parser.push(commandMap.tool(toolCode, toolDef, line));
  }

  // tool set
  if(reTOOL_SET.test(block)) {
    let toolSet = block.match(reTOOL_SET)[1];

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
  //console.debug('flush', { parser });
  if(parser.drillStash.length) {
    parser.drillStash.forEach(data => {
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
    let formatHints = parseCommentForFormatHints(parser, block, parser.line);

    Object.keys(formatHints).forEach(key => {
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
        let zero = parser.format.zero === 'L' ? 'leading' : 'trailing';
        parser.warn('zero suppression missing; detected ' + zero + ' suppression');
        flush(parser);
        return parseBlock(parser, block, parser.line);
      }
    } else if(reUNITS$1.test(block)) {
      let unitsMatch = block.match(reUNITS$1);
      let suppression = unitsMatch[2];
      parser.format.zero = zeroFromSupression(suppression);
      if(parser.format.zero) {
        flush(parser);
        return parseBlock(parser, block, parser.line);
      }
    }

    return parser.drillStash.push({ line: parser.line, block });
  }

  return parseBlock(parser, block, parser.line);
}

let parseDrill = { parse: parse$2, flush };

// simple warning class to be emitted when something questionable in the gerber is found
function warning(message, line) {
  return { message, line };
}

// generic file parser for gerber and drill files
let LIMIT = 65535;

export class Parser {
  constructor(places, zero, filetype) {
    this.stash = '';
    this.index = 0;
    this.drillMode = drillMode.DRILL;

    this.syncResult = null;
    this.line = 0;
    this.format = { places, zero, filetype };
  }
  start() {
    //console.debug('GerberParser start()!');
  }

  process(chunk, controller) {
    let { filetype } = this.format;
    this.controller = controller;

    while(this.index < chunk.length) {
      let next = getNext(filetype, chunk, this.index);
      this.index += next.read;
      this.line += next.lines;
      this.stash += next.rem;
      //console.debug('process', { next, filetype });

      if(next.block) {
        if(filetype === 'gerber') {
          parse(this, next.block);
        } else {
          parseDrill.parse(this, next.block);
        }
      }
    }
  }

  transform(chunk, controller) {
    let filetype = this.format.filetype;

    const done = controller ? err => (err ? controller.error(err) : controller.terminate()) : () => {};
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
      }
      this.format.filetype = filetype;
      this.index = 0;
      if(filetype == 'drill') this.drillStash = [];
    }
    chunk = this.stash + chunk;
    //console.debug('chunk', chunk);
    this.stash = '';
    this.process(chunk, controller);
    this.index = 0;

    if(chunk === null) {
      if(controller) controller.terminate();
      else done();
    }
  }

  flush(controller) {
    if(this.format.filetype === 'drill') parseDrill.flush(this);

    return typeof controller == 'object' ? controller.terminate() : controller && controller();
  }

  push(data) {
    if(data.line === -1) data.line = this.line;

    if(this.syncResult) this.syncResult.push(data);
    else if(this.controller) this.controller.enqueue(data);
    else this.writable.write(data);
  }

  warn(message) {
    //console.warn(warning(message, this.line));
    //  this.emit('warning', warning(message, this.line));
  }

  parseSync(file) {
    this.format.filetype ??= determine(file, this.index, 100 * LIMIT);
    this.syncResult = [];
    this.process(file);
    this.flush();

    return this.syncResult;
  }

  static async parse(file) {
    let ret = [];
    let parser = new Parser();

    await LineReader(file).pipeThrough(new TransformStream(parser)).pipeTo(ArrayWriter(ret));
    // await readStream(LineReader(file).pipeThrough(new TransformStream(parser)), ret);
    return ret;
  }
}

export default Parser;
