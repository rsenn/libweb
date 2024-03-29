import { defineGetter, immutableClass, types } from '../misc.js';
import { BBox } from './bbox.js';
import { Line } from './line.js';
import { Point } from './point.js';
import { PointList } from './pointList.js';

export class LineList extends Array {
  constructor(lines) {
    super();
    if(Array.isArray(lines) || types.isIterable(lines)) {
      for(let line of lines) {
        if(!(line instanceof Line)) line = Array.isArray(line) ? new Line(...line) : new Line(line);
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
    makeGroup =
      makeGroup ||
      (() => ({
        tagName: 'g',
        attributes: { stroke: 'black', fill: 'none', 'stroke-width': 0.025 }
      }));
    let group,
      lines = this;
    lines = [...lines].map(({ x1, y1, x2, y2 }) => ['line', { x1, y1, x2, y2 }]);
    lines = lines.map(([tag, attrs]) => factory(tag, attrs, group));

    group = group || makeGroup('g', {}, lines);
    group.children = lines;
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
    //let entries = [...accumulate([...this.toPoints()].map((p, i) => [p + '', [i >> 1, i & 1]]))];
    let entries = [...this.toPoints()].map((p, i) => [p + '', [i >> 1, i & 1]]);

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
      if(
        polygon.length >= 3 &&
        ((endPoint.x === nextLine.x1 && endPoint.y === nextLine.y1 && startPoint.x === nextLine.x2 && startPoint.y === nextLine.y2) ||
          (startPoint.x === nextLine.x1 && startPoint.y === nextLine.y1 && endPoint.x === nextLine.x2 && endPoint.y === nextLine.y2))
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

defineGetter(LineList, Symbol.species, function() {
  return this;
});

export const ImmutableLineList = immutableClass(LineList);
defineGetter(ImmutableLineList, Symbol.species, () => ImmutableLineList);
