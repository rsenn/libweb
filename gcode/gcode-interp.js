'use strict';

function G0(prevState, nextState, command, args, i) {
  for(var j = 0; j < args.length; j++) {
    const arg = args[j];
    const prop = arg.charAt(0).toLowerCase();
    const num = parseFloat(arg.substring(1));

    /// console.log(`#${i}: cmd:`, command, ' arg:', arg, ' prop:', prop, ' num:', num);

    switch (prop) {
      case 'x':
        nextState.v.x = prevState.vrel.x + parseFloat(arg.substring(1));
        break;
      case 'y':
        nextState.v.y = prevState.vrel.y + parseFloat(arg.substring(1));
        break;
      case 'z':
        nextState.v.z = prevState.vrel.z + parseFloat(arg.substring(1));
        break;
      case 's':
        nextState.s = parseFloat(arg.substring(1));
        break;
      case 'f':
        nextState.f = parseFloat(arg.substring(1));
        break;
      case 'e':
        nextState.e = prevState.erel + parseFloat(arg.substring(1));
        nextState.fp = prevState.fp + (nextState.e - prevState.e);
        if(nextState.fp > 0) {
          nextState.fp = 0;
        }
        break;
      default: throw new Error('error I do not understand this arguement' + '<' + arg + '>');
        break;
    }
  }
}

function G92(prevState, nextState, command, args) {
  if(args.length === 0) {
    //TODO: Reset everything
    throw new Error('Reset all coordinates not implemented yet');
  } else {
    for(var j = 0; j < args.length; j++) {
      switch (args[j].charAt(0).toLowerCase()) {
        case 'x':
          nextState.vrel[0] = prevState.v[0] - parseFloat(args[j].slice(1));
          break;
        case 'y':
          nextState.vrel[1] = prevState.vrel[1] - parseFloat(args[j].slice(1));
          break;
        case 'z':
          nextState.vrel[2] = prevState.vrel[2] - parseFloat(args[j].slice(1));
          break;
        case 'e':
          nextState.erel = prevState.e - parseFloat(args[j].slice(1));
          break;
        default: throw new Error('error I do not understand this arguement' + '<' + args[j] + '>');
          break;
      }
    }
  }
}

function G00(prevState, nextState, command, args, i) {
  // Rapid positioning
  //console.log('cmd:', command, ' args:', args );

  G0.call(this, prevState, nextState, command, args, i);
}
function G04(prevState, nextState, command, args) {
  console.info('Pause / Dwell for Precise CNC Timing', { command, args });
}

function G90(prevState, nextState, command, args) {
  // Milling: Absolute programming
  // else: Fixed cycle, simple cycle, for roughing (Z-axis emphasis)
  console.info('Absolute programming /  Fixed cycle, simple cycle, for roughing (Z-axis emphasis)');
  console.log(`#${this.i}: cmd:`,
    command,
    ' args:',
    args,
    ' prevState:',
    prevState,
    ' nextState:',
    nextState
  );
}

function G91(prevState, nextState, command, args) {
  console.info('relative positioning is not implemented');
}

function G90_1(prevState, nextState, command, args) {
  console.info('Arc IJK absolute mode');

  if(prevState.arc !== command) nextState.arc = command;
}
function G91_1(prevState, nextState, command, args) {
  console.info('Arc IJK incremental  mode');

  if(prevState.arc !== command) nextState.arc = command;
}

function G94(prevState, nextState, command, args) {
  console.info('units per minute', { command, args });
}

function G20(prevState, nextState, command, args) {
  console.info('use inches', { command, args });
}

function noop(prevState, nextState, command, args) {
  nextState.implemented = false;
  console.warn('Unimplemented GCode: ', command);
}

function M0(prevState, nextState, command, args) {
  if(prevState.program !== command) nextState.program = command;
}
function M3(prevState, nextState, command, args, i) {
  if(prevState.spindle !== command) nextState.spindle = command;
  console.log(`#${this.i}: cmd:`,
    command,
    ' args:',
    args,
    ' prevState.spindle:',
    prevState.spindle,
    ' nextState.spindle:',
    nextState.spindle
  );
}
function M9(prevState, nextState, command, args) {
  if(prevState.coolant !== command) nextState.coolant = command;
}

function M6(prevState, nextState, command, args) {
  // M6: Tool Change
  let tool = args[0] || command;

  console.warn('Tool change ', tool);
  if(prevState.tool !== tool) nextState.tool = tool;
}

function T0(prevState, nextState, command, args) {
  if(prevState.tool !== command) nextState.tool = command;
}
export default {
  G00,
  G0,
  G04,
  G1: G0,
  G20,
  G92,
  G91,
  'G90.1': G90_1,
  'G91.1': G91_1,
  G94,
  G28: noop,
  G90,
  M82: noop,
  G21: noop,
  M0,
  M1: M0,
  M2: M0,
  M3,
  M4: M3,
  M5: M3,
  M6,
  M9,
  M30: M0,
  M48: noop,
  M84: noop,
  M107: noop,
  M104: noop,
  M106: noop,
  M109: noop,
  M190: noop,
  T0,
  T1: T0,
  T2: T0,
  T3: T0,
  T4: T0,
  T5: T0,
  T6: T0
};
