import { Line } from './line.js';
import { BBox } from './bbox.js';
import { Element, isElement } from '../dom/element.js';
import { PointList } from './pointList.js';
import Util from '../util.js';

export class LineList extends Array {
  constructor(lines) {
    super();
    if(Util.isArray(lines) || Util.isGenerator(lines)) {
      for(let line of lines) {
        if(!(line instanceof Line)) line = Util.isArray(line) ? new Line(...line) : new Line(line);
        this.push(line);
      }
    }
  }

  bbox() {
    let bb = new BBox();
    for(let line of this) bb.update(Line.prototype.toObject.call(line));
    return bb;
  }

  toPolygons(createfn = points => new PointList(points)) {
    let lines = this;
    return LineList.toPolygons([...lines], createfn);
  }

  toSVG(factory, makeGroup) {
    if(isElement(makeGroup)) {
      let parentElem = makeGroup;
      makeGroup = () => parentElem;
    }
    makeGroup = makeGroup || (() => factory('g', { stroke: 'black', fill: 'none', 'stroke-width': 0.1 }));
    let group = makeGroup(),
      lines = this;
    lines = [...lines].map(({ x1, y1, x2, y2 }) => ['line', { x1, y1, x2, y2 }]);
    if(typeof factory == 'function') {
      lines = lines.map(([tag, attrs]) => factory(tag, attrs, group));
    } else {
      group = ['g', {}, lines];
    }
    return group || lines;
  }

  orderedPoints() {
    let list = this.slice();
    let ret = [];
    while(list.length > 0) {
      let pts = new PointList();
      let line = list.pop();
      let link = line[1];
      pts.push(line[0]);
      for(let ct = list.length; ct--; ) {
        for(let i = list.length; i--; ) {
          if(Point.equals(list[i].a, link)) {
            line = list.splice(i, 1)[0];
            pts.push(line.a);
            link = line.b;
            break;
          } else if(Point.equals(list[i].b, link)) {
            line = list.splice(i, 1)[0];
            pts.push(line.b);
            link = line.a;
            break;
          }
        }
      }
      pts.push(link);
      ret.push(pts);
    }
    return ret;
  }

  ordered() {
    let list = this.slice();
    let ret = list.splice(0, 1);
    while(list.length > 0) {
      const link = [ret[0].a, ret[ret.length - 1].b];
      let line;
      for(let i = 0; i < list.length; i++) {
        if(Point.equals(list[i].a, link[1])) {
          line = list.splice(i, 1)[0];
          ret.push(line);
          break;
        }
        if(Point.equals(list[i].b, link[0])) {
          line = list.splice(i, 1)[0];
          ret.unshift(line);
          break;
        }
      }
      if(line) continue;
      for(let i = 0; i < list.length; i++) {
        if(Point.equals(list[i].b, link[1])) {
          line = list.splice(i, 1)[0];
          ret.push(line.reverse());
          break;
        }
        if(Point.equals(list[i].a, link[0])) {
          line = list.splice(i, 1)[0];
          ret.unshift(line.reverse());
          break;
        }
      }
      if(line) continue;
      line = list.pop();
      ret.push(line);
    }
    if(list.length) {
      throw new Error('list not empty)');
    }
    return ret;
  }

  connected() {
    let ordered = this.ordered();
    let prevLine;
    let i = 0;
    let ret = [];

    for(let line of ordered) {
      if(i == 0 || !Point.equals(prevLine.b, line.a)) ret.push(new LineList());

      ret[ret.length - 1].push(line);

      prevLine = line;
      i++;
    }
    return ret;
  }

  *toPoints() {
    for(let line of this) yield* line;
  }

  coincidences() {
    let entries = [...Util.accumulate([...this.toPoints()].map((p, i) => [p + '', [i >> 1, i & 1]]))];

    //entries =    entries.filter(([p,indexes]) => indexes.length > 1);

    entries = entries.map(([pointStr, indexes]) => [Point.fromString(pointStr), indexes]);
    return new Map(entries);
  }

  toPath() {
    let prevLine;
    let cmds = [];
    let i = 0;
    for(let line of this) {
      if(i == 0 || !Point.equals(prevLine.b, line.a)) cmds.push(`M ${line.a}`);
      cmds.push(`L ${line.b}`);
      prevLine = line;
      i++;
    }
    return cmds.join(' ');
  }

  toString(opts = {}) {
    const { separator = ' ', ...options } = typeof opts == 'string' ? { separator: opts } : opts;
    return this.map(line => line.toString({ ...options, pad: 0, separator: '|' })).join(separator);
  }
  [Symbol.toStringTag]() {
    return this.toString({ separator: '\n' });
  }

  [Symbol.for('nodejs.util.inspect.custom')](n, opts = {}) {
    let c = Util.coloring(false && opts.colors);
    let toString = [Symbol.toStringTag, 'toString', Symbol.for('nodejs.util.inspect.custom')].reduce((a, p) =>
      this[0][p] ? p : a
    );
    console.log('inspectFn:', toString);
    //   return Util.toString(this, { ...opts, toString });
    return `${c.text('LineList', 1, 31)}${c.text('(', 1, 36)}${
      c.text(this.length, 1, 35) + c.code(1, 36)
    }) [\n  ${this.map(line =>
        line[toString].call(line, n, {
          ...opts,
          color: false
        }) /*({ x1, y1,x2,y2 }) => Util.toString({ x1,y1,x2, y2  }, { multiline: false, spacing: ' ' })*/
    ).join(',\n  ')}\n${c.text(']', 1, 36)}`;
  }

  isContinuous() {
    let prevLine;
    let i = 0;
    for(let line of this) {
      //if(i) console.log('isContinuous', i, prevLine.b + '', line.a + '');
      if(i && !Point.equals(prevLine.b, line.a)) return false;

      prevLine = line;
      i++;
    }
    return true;
  }
}

/**
 *
 * @param [[[x, y], [x, y]], ...] lines
 */
LineList.toPolygons = (lines, createfn = points => Object.setPrototypeOf(points, PointList.prototype)) => {
  const polygons = [];
  for(var i = 0; i < lines.length; i++) {
    // Récupération et suppression du tableau du premier élément
    const firstLine = lines.splice(i--, 1)[0];
    // create a new polygon array
    const polygon = [];
    // init current start point and current end point
    let startPoint = firstLine.a;
    let endPoint = firstLine.b;
    // put the 2 points of the first line on the polygon array
    polygon.push(startPoint, endPoint);

    let j = 0;
    // init the linesLength
    let linesLength = lines.length;
    while(lines.length && (j < lines.length || linesLength != lines.length)) {
      // if j == lines.length, we have to return to the first index and redefine linesLength to the new lines.length
      if(j == lines.length) {
        j = 0;
        linesLength = lines.length;
      }
      // The nextLine in the array
      const nextLine = lines[j++];
      // min 3 lines to have a closed polygon
      // check if the polygon is closed (the nextLine start point is one of the current start or end point and the nextLine end point is one of the current start or end point)
      if(polygon.length >= 3 &&
        ((endPoint.x === nextLine.x1 &&
          endPoint.y === nextLine.y1 &&
          startPoint.x === nextLine.x2 &&
          startPoint.y === nextLine.y2) ||
          (startPoint.x === nextLine.x1 &&
            startPoint.y === nextLine.y1 &&
            endPoint.x === nextLine.x2 &&
            endPoint.y === nextLine.y2))
      ) {
        polygons.push(polygon);
        break;
      }
      if(endPoint.x === nextLine.x1 && endPoint.y === nextLine.y1) {
        // end point of the current line equals to start point of the next line
        polygon.push(nextLine.b);
        // update current end point
        endPoint = nextLine.b;
        // Suppression de la ligne dans le tableau
        lines.splice(--j, 1);
      } else if(startPoint.x === nextLine.x1 && startPoint.y === nextLine.y1) {
        // start point of the current line equals to start point of the next line
        polygon.unshift(nextLine.b);
        // update current start point
        startPoint = nextLine.b;
        lines.splice(--j, 1);
      } else if(endPoint.x === nextLine.x2 && endPoint.y === nextLine.y2) {
        // end point of the current line equals to end point of the next line
        polygon.push(nextLine.a);
        // update current end point
        endPoint = nextLine.a;
        lines.splice(--j, 1);
      } else if(startPoint.x == nextLine.x2 && startPoint.y == nextLine.y2) {
        // start point of the current line equals to end point of the next line
        polygon.unshift(nextLine.a);
        // update current start point
        startPoint = nextLine.a;
        lines.splice(--j, 1);
      }
    }
  }
  return polygons.map(points => createfn(points));
};
/*
if(!Util.isBrowser()) {
  let c = Util.coloring();
  const sym = Symbol.for('nodejs.util.inspect.custom');
  LineList.prototype[sym] = function() {
    return `${c.text('LineList', 1, 31)}${c.text('(', 1, 36)}${c.text(this.length, 1, 35) + c.code(1, 36)}) [\n  ${this.map((line) => line[sym]()  ).join(',\n  ')}\n${c.text(']', 1, 36)}`;
  };
}*/

Util.defineGetter(LineList, Symbol.species, function() {
  return this;
});

export const ImmutableLineList = Util.immutableClass(LineList);
Util.defineGetter(ImmutableLineList, Symbol.species, () => ImmutableLineList);
