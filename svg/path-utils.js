import { parse, parseSVG, makeAbsolute } from './path-parser.js';
import { SvgPath, Command } from './path.js';
import { Matrix } from '../geom/matrix.js';
import { Point } from '../geom.js';
import { isObject, partitionArray } from '../misc.js';

export const isUpper = s => s.toUpperCase() == s;

function SvgCommand(peg) {
  const [name, ...args] = Object.values(util.filterKeys(peg, k => ['command', 'relative'].indexOf(k) == -1));

  return Object.setPrototypeOf({ name, args }, SvgCommand.prototype);
}

SvgCommand.prototype = new Command();

Object.assign(SvgCommand.prototype, {
  toString(delim = ',') {
    const { name, args } = this;
    let s = '';

    for(let arg of args) {
      if(s != '') s += delim;
      s += arg;
    }

    return name + (s == '' ? '' : ' ' + s);
  }
});

export function parseSvgPath(str, absolute) {
  if(typeof str != 'string') return new parseSvgPath('', absolute);
  let path = parseSVG(str);
  if(absolute) path = makeAbsolute(path);
  return Object.setPrototypeOf({ commands: path.map(cmd => SvgCommand(cmd)) }, parseSvgPath.prototype);
}

parseSvgPath.prototype = new SvgPath();

Object.assign(parseSvgPath.prototype, {
  str(delim = '\n') {
    return this.subpaths()
      .map(sp => SvgPath.prototype.str.call({ commands: sp }))
      .join(delim);

    // return this.commands.reduce((s, c) => (s == '' ? '' : s + delim) + c.toString(), '');
  },
  toRelative() {
    const commands = [];
    let pos = [0, 0];

    for(let c of this.commands) {
      let { name, args } = c;

      if(/[Mm]/.test(name)) {
        let [x, y] = args.slice(-2);

        if(!pos || isUpper(name)) {
          let dx = x - pos[0],
            dy = y - pos[1];
          pos = [x, y];
          args = [dx, dy];
        } else {
          pos[0] += x;
          pos[1] += y;
        }
        name = 'm';
      } else if(/[Zz]/.test(name)) {
        name = 'z';
      } else if(isUpper(name)) {
      }

      commands.push(Object.setPrototypeOf({ name, args }, SvgCommand.prototype));
    }

    return Object.setPrototypeOf({ commands }, parseSvgPath.prototype);
  },
  subpaths() {
    let p,
      result = [(p = [])];

    for(let c of this.commands) {
      p.push(c);

      if(/[Zz]/.test(c.name)) result.push((p = []));
    }

    return result;
  },
  transform(matrix) {
    const commands = [];

    if(!isObject(matrix) || !(matrix instanceof Matrix)) matrix = new Matrix(matrix);

    for(let c of this.commands) {
      const { name, args } = c;

      if((commands.length == 0 || isUpper(name)) && args.length >= 2) {
        let i = args.length - 2;
        let [x, y] = args.splice(i, 2);

        [x, y] = matrix.transformXY(x, y);

        args.push(x, y);
      } else if(/[HhVv]/.test(name)) {
        let i = 'hv'.indexOf(name.toLowerCase());
        let [arg] = args;

        args[0] = matrix.transformWH(arg, arg)[i];
      } else if(!isUpper(name) && args.length >= 2) {
        args.splice(0, args.length, ...[...partitionArray(args, 2)].map(([x, y]) => matrix.transformWH(x, y)));
      }

      commands.push(Object.setPrototypeOf({ name, args }, SvgCommand.prototype));
    }

    return Object.setPrototypeOf({ commands }, parseSvgPath.prototype);
  },
  *points() {
    let x = 0,
      y = 0;
    let originX = 0,
      originY = 0;

    for(let { name, args } of this.commands) {
      let [dx, dy] = (args ?? []).slice(-2);

      switch (name) {
        case 'm':
        case 'M': {
          break;
        }
        case 'z':
        case 'Z': {
          dx = originX;
          dy = originY;
          name = 'Z';
          break;
        }
        case 'l':
        case 'L': {
          break;
        }
        case 'h':
        case 'H': {
          dy = 0;
          break;
        }
        case 'v':
        case 'V': {
          dy = dx;
          dx = 0;
          break;
        }
        case 'c':
        case 'C': {
          break;
        }
        case 's':
        case 'S': {
          break;
        }
        case 'q':
        case 'Q': {
          break;
        }
        case 't':
        case 'T': {
          break;
        }
        case 'a':
        case 'A': {
          break;
        }
      }

      if(isUpper(name)) {
        dx -= x;
        dy -= y;
      }

      /*if(dx != 0 || dy != 0)*/ {
        x += dx;
        y += dy;

        yield new Point(x, y);
      }

      if(/[Mm]/.test(name)) {
        originX = x;
        originY = y;
      }
    }
  }
});

export function MakeText(str, font) {
  font ??= JSON.parse(fs.readFileSync('font.json', 'utf-8'));

  let d = '',
    i = 0;

  for(let ch of str) {
    if(d != '') d += `\n`;

    let m = new Matrix()
      .translate(500 * i, 0)
      .scale(1, -1)
      .translate(0, -703);
    let path = parseSvgPath(font[ch] || '') /*.toRelative()*/
      .transform(m);

    d += path.str();

    i++;
  }

  return d;
}

export function DrawSVGText(str, font) {
  return {
    tagName: 'svg',
    attributes: { version: '1.1', viewBox: '0 0 10000 5000', width: '10000', height: '5000' },
    children: [{ tagName: 'path', attributes: { stroke: 'none', 'stroke-width': 10, fill: 'black', d: MakeText(str, font) } }]
  };
}
