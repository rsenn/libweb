import { Line } from './line.js';
import { BBox } from './bbox.js';
import Util from '../util.js';

export class LineList extends Array {
  constructor(lines) {
    super();
    if (Util.isArray(lines) || Util.isGenerator(lines)) {
      for (let line of lines) {
        if (!(line instanceof Line)) line = Util.isArray(line) ? new Line(...line) : new Line(line);

        this.push(line);
      }
    }
  }

  bbox() {
    let bb = new BBox();
    for (let line of this) bb.update(Line.prototype.toObject.call(line));
    return bb;
  }
}

if (!Util.isBrowser()) {
  let c = Util.coloring();
  const sym = Symbol.for('nodejs.util.inspect.custom');
  LineList.prototype[sym] = function () {
    return `${c.text('LineList', 1, 31)}${c.text('(', 1, 36)}${c.text(this.length, 1, 35) + c.code(1, 36)}) [\n  ${this.map((line) => line[sym]() /*({ x1, y1,x2,y2 }) => Util.toString({ x1,y1,x2, y2  }, { multiline: false, spacing: ' ' })*/).join(',\n  ')}\n${c.text(']', 1, 36)}`;
  };
}

Util.defineGetter(LineList, Symbol.species, function () {
  return this;
});

export const ImmutableLineList = Util.immutableClass(LineList);
Util.defineGetter(ImmutableLineList, Symbol.species, () => ImmutableLineList);
