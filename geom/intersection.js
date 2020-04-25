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

    denominator =
      (line2.b.y - line2.a.y) * (line1.b.x - line1.a.x) -
      (line2.b.x - line2.a.x) * (line1.b.y - line1.a.y);

    if(denominator == 0) {
      return null;
    }

    a = line1.a.y - line2.a.y;
    b = line1.a.x - line2.a.x;

    numerator1 = (line2.b.x - line2.a.x) * a - (line2.b.y - line2.a.y) * b;
    numerator2 = (line1.b.x - line1.a.x) * a - (line1.b.y - line1.a.y) * b;

    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.point.x = line1.a.x + a * (line1.b.x - line1.a.x);
    result.point.y = line1.a.y + a * (line1.b.y - line1.a.y);
    result.line1 = line1;
    result.line2 = line2;
    // if line1 is a segment and line2 is infinite, they intersect if:
    if(a > 0 && a < 1 && b > 0 && b < 1) {
      return result;
    } else {
      return null;
    }
  }

  static equals(intersection1, intersection2) {
    return Point.equals(
      intersection1.point,
      intersection2.point &&
        ((Line.equals(intersection1.line1, intersection2.line1) &&
          Line.equals(intersection1.line2, intersection2.line2)) ||
          (Line.equals(intersection1.line1, intersection2.line2) &&
            Line.equals(intersection1.line2, intersection2.line1)))
    );
  }
}
