import { SyntaxError, parse, parseSVG, makeAbsolute } from './path-parser.js';
import { SvgPath, Command } from './lib/svg/path.js';

export function pegToSvgCommand(peg) {
  const [name, ...args] = Object.values(util.filterKeys(peg, k => ['command', 'relative'].indexOf(k) == -1));
  return Object.setPrototypeOf({ name, args }, Command.prototype);
}

export function parseSvgPath(str) {
  const path = parseSVG(str);
  return Object.setPrototypeOf({ commands: path.map(pegToSvgCommand) }, SvgPath.prototype);
}
