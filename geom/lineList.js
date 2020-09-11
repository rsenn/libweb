import { Line } from './line.js';
import { BBox } from './bbox.js';
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

  toPolygons() {
    return LineList.toPolygons(this);
  }
}

/**
 *
 * @param [[[x, y], [x, y]], ...] lines
 */
LineList.toPolygons = (lines) => {
  const polygons = [];
  for(var i = 0; i < lines.length; i++) {
    // Récupération et suppression du tableau du premier élément
    const firstLine = lines.splice(i--, 1)[0];
    // create a new polygon array
    const polygon = [];
    // init current start point and current end point
    let currentStartPoint = firstLine.a;
    let currentEndPoint = firstLine.b;
    // put the 2 points of the first line on the polygon array
    polygon.push(currentStartPoint, currentEndPoint);

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
      if(polygon.length >= 3 && ((currentEndPoint.x === nextLine.x1 && currentEndPoint.y === nextLine.y1 && currentStartPoint.x === nextLine.x2 && currentStartPoint.y === nextLine.y2) || (currentStartPoint.x === nextLine.x1 && currentStartPoint.y === nextLine.y1 && currentEndPoint.x === nextLine.x2 && currentEndPoint.y === nextLine.y2))) {
        polygons.push(polygon);
        break;
      }
      if(currentEndPoint.x === nextLine.x1 && currentEndPoint.y === nextLine.y1) {
        // end point of the current line equals to start point of the next line
        polygon.push(nextLine.b);
        // update current end point
        currentEndPoint = nextLine.b;
        // Suppression de la ligne dans le tableau
        lines.splice(--j, 1);
      } else if(currentStartPoint.x === nextLine.x1 && currentStartPoint.y === nextLine.y1) {
        // start point of the current line equals to start point of the next line
        polygon.unshift(nextLine.b);
        // update current start point
        currentStartPoint = nextLine.b;
        lines.splice(--j, 1);
      } else if(currentEndPoint.x === nextLine.x2 && currentEndPoint.y === nextLine.y2) {
        // end point of the current line equals to end point of the next line
        polygon.push(nextLine.a);
        // update current end point
        currentEndPoint = nextLine.a;
        lines.splice(--j, 1);
      } else if(currentStartPoint.x == nextLine.x2 && currentStartPoint.y == nextLine.y2) {
        // start point of the current line equals to end point of the next line
        polygon.unshift(nextLine.a);
        // update current start point
        currentStartPoint = nextLine.a;
        lines.splice(--j, 1);
      }
    }
  }
  return polygons;
};

if(!Util.isBrowser()) {
  let c = Util.coloring();
  const sym = Symbol.for('nodejs.util.inspect.custom');
  LineList.prototype[sym] = function() {
    return `${c.text('LineList', 1, 31)}${c.text('(', 1, 36)}${c.text(this.length, 1, 35) + c.code(1, 36)}) [\n  ${this.map((line) => line[sym]() /*({ x1, y1,x2,y2 }) => Util.toString({ x1,y1,x2, y2  }, { multiline: false, spacing: ' ' })*/).join(',\n  ')}\n${c.text(']', 1, 36)}`;
  };
}

Util.defineGetter(LineList, Symbol.species, function() {
  return this;
});

export const ImmutableLineList = Util.immutableClass(LineList);
Util.defineGetter(ImmutableLineList, Symbol.species, () => ImmutableLineList);
