import { Point } from './point.js';
import { Line } from './line.js';

export class Intersection {
  constructor(line1, line2, intersectionPoint) {
    this.line1 = line1;
    this.line2 = line2;
    this.point = intersectionPoint;
  }

  static findIntersection(line1, line2) {
    let denominator, a, b, numerator1, numerator2;
    let result = new Intersection(line1, line2, {});

    //https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection

    denominator = (line2.y2 - line2.y1) * (line1.x2 - line1.x1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1);

    if(denominator == 0) return null;

    a = line1.y1 - line2.y1;
    b = line1.x1 - line2.x1;

    numerator1 = (line2.x2 - line2.x1) * a - (line2.y2 - line2.y1) * b;
    numerator2 = (line1.x2 - line1.x1) * a - (line1.y2 - line1.y1) * b;

    a = numerator1 / denominator;
    b = numerator2 / denominator;

    //if we cast these lines infinitely in both directions, they intersect here:
    result.point.x = line1.x1 + a * (line1.x2 - line1.x1);
    result.point.y = line1.y1 + a * (line1.y2 - line1.y1);
    result.line1 = line1;
    result.line2 = line2;

    //if line1 is a segment and line2 is infinite, they intersect if:
    if(a > 0 && a < 1 && b > 0 && b < 1) {
      return result;
    }
    return null;
  }

  static equals(intersection1, intersection2) {
    return Point.equals(intersection1.point, intersection2.point) && ((Line.equals(intersection1.line1, intersection2.line1) && Line.equals(intersection1.line2, intersection2.line2)) || (Line.equals(intersection1.line1, intersection2.line2) && Line.equals(intersection1.line2, intersection2.line1)));
  }
}
