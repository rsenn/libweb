'use strict';

import gcodeInterp from './gcode-interp.js';

function State(v, e, f, time, vrel, erel, fp, spindle, tool, program, arc) {
  this.v = v;
  this.e = e;
  this.f = f; //feedrate in mm/minute
  this.time = time;
  this.vrel = vrel;
  this.erel = erel;
  this.fp = fp; //filament end position w.r.t nozzle end must be <= 0
  // this.code = code; //line of gcode for this state (sometimes referred to as the next state), useful for debugging
  this.implemented = true;

  this.spindle = spindle;
  this.tool = tool;
  this.program = program;
  this.arc = arc;

  //this.linenum = linenum;
}

State.prototype.clone = function() {
  //return Object.setPrototypeOf({ ...this }, Object.getPrototypeOf(this));

  const {
    v: { x: vx, y: vy, z: vz },
    e,
    f,
    time,
    vrel: { x: rx, y: ry, z: rz },
    erel,
    fp,
    spindle,
    tool,
    program,
    arc
  } = this;
  return new State({ x: vx, y: vy, z: vz },
    e,
    f,
    time,
    { x: rx, y: ry, z: rz },
    erel,
    fp,
    spindle,
    tool,
    program,
    arc
  );
};

function initialState() {
  return new State({ x: 0, y: 0, z: 0 }, 0, 0, 0, { x: 0, y: 0, z: 0 }, 0, 0, '', 0);
}

function nextState(gcode, prevState, linenum, i) {
  const nextState = prevState.clone();
  const tokens =
    typeof gcode == 'string'
      ? gcode.split(/\s+/g)
      : typeof gcode.words[0] == 'string'
      ? [...gcode.words]
      : gcode;
  //console.debug('tokens', tokens);

  const line = (gcode.line && gcode.line) || gcode;
  let comment = tokens.findIndex(tok => tok[0] == '(');
  if(comment == -1) comment = tokens.length;

  tokens.splice(comment, tokens.length - comment);
  let command = tokens.shift();

  const args = tokens;
  //console.debug('nextState', {command,args});
  const interp = gcodeInterp[command];
  const thisObj = { i, code: gcode, linenum };

  if(interp) {
    interp.call(thisObj, prevState, nextState, command, args);

    console.log(`#${i}: cmd:`,
      command,
      ' args:',
      args,
      ' prevState:',
      prevState,
      ' nextState:',
      nextState
    );
  } else {
    console.error('Unrecognized gcode:', command, args);

    throw new Error('Unrecognized GCode ' + line);
  }
  nextState.code = gcode;
  nextState.linenum = linenum;
  return nextState;
}

function removeUnimplemented(history) {
  for(let i = 0; i < history.length; i++) {
    if(!history[i].implemented) {
      history.splice(i, 1);
    }
  }
  return history;
}

function executeGCodes(codesnlinenums) {
  const gcodes = codesnlinenums[0];
  const history = [initialState()];
  const linenums = codesnlinenums[1];
  for(let i = 0; i < gcodes.length; ++i) {
    history.push(nextState(gcodes[i], history[i], linenums[i], i));
  }
  return history;
}

//Parsingage
function removeInLineComment(line) {
  //removes inline comment from a line of gcode
  return line.replace(/\s*[;(].*$/, '');
}

async function parseGCode(fileContent) {
  //split gcode into lines and extract those that are relevent.  Also remove inline comments.
  const lines =
    ((Util.isIterator(fileContent) || Util.isIterable(fileContent)) && fileContent) ||
    fileContent.split(/\r\n|\n/);
  const gcode = [];
  const linenums = []; //an array of line numbers for each gcode command (numbers will be missing if there are comments/empty space
  let i = 0;

  for await(let item of lines) {
    ++i;

    if(typeof item == 'string') {
      const stripped = ((item.line && item.line) || item).replace(/^N\d+\s+/, '');
      if(stripped.match(/^(G|M)/)) gcode.push(removeInLineComment(stripped));
    } else {
      if(item.line[0] == '(') continue;
      //   console.debug("item:", item);
      gcode.push(item);
    }

    linenums.push(i);
  }
  return [gcode, linenums];
}

export default async function doParse(content) {
  const history = executeGCodes(await parseGCode(content));
  return removeUnimplemented(history);
}
