/**
 * square distance between 2 points
 * @param {[number, number]} p1
 * @param {[number, number]} p2
 * @returns {number}
 */
function getSqDist(p1, p2) {
  let dx = p1[0] - p2[0],
    dy = p1[1] - p2[1];

  return dx * dx + dy * dy;
}

/**
 * square distance from a point to a segment
 *
 * @param {[number, number]} p
 * @param {[number, number]} p1
 * @param {[number, number]} p2
 * @returns {number}
 */
function getSqSegDist(p, p1, p2) {
  let x = p1[0],
    y = p1[1],
    dx = p2[0] - x,
    dy = p2[1] - y,
    t;

  if(dx !== 0 || dy !== 0) {
    t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

    if(t > 1) {
      x = p2[0];
      y = p2[1];
    } else if(t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;

  return dx * dx + dy * dy;
}

/**
 * basic distance-based simplification
 *
 * @param points
 * @param sqTolerance
 * @returns {*[]}
 */
export function simplifyRadialDist(points, sqTolerance) {
  let prevPoint = [points[0], points[1]],
    newPoints = prevPoint,
    i = 2,
    n = points.length,
    point;

  for(i; i < n; i += 2) {
    point = [points[i], points[i + 1]];

    if(getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point[0], point[1]);
      prevPoint = point;
    }
  }

  if(prevPoint !== point) {
    newPoints.push(point[0], point[1]);
  }

  return newPoints;
}

/**
 *
 * @param points
 * @param first
 * @param last
 * @param sqTolerance
 * @param simplified
 */
export function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  let maxSqDist = sqTolerance,
    i = first + 2,
    sqDist,
    index;

  for(i; i < last; i += 2) {
    sqDist = getSqSegDist([points[i], points[i + 1]],
      [points[first], points[first + 1]],
      [points[last], points[last + 1]]
    );

    if(sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if(maxSqDist > sqTolerance) {
    if(index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index], points[index + 1]);
    if(last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
}

/**
 * simplification using Ramer-Douglas-Peucker algorithm
 *
 * @param points
 * @param sqTolerance
 * @returns {*[]}
 */
export function simplifyDouglasPeucker(points, sqTolerance) {
  let last = points.length - 2;
  let simplified = [points[0], points[1]];

  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last], points[last + 1]);

  return simplified;
}

/**
 * both algorithms combined for awesome performance
 *
 * @param points
 * @param tolerance
 * @param highestQuality
 * @returns {number[]}
 */
export function simplify(points, tolerance, highestQuality) {
  if(points.length <= 4) return points;

  let sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

  points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
  points = simplifyDouglasPeucker(points, sqTolerance);

  return points;
}

export default simplify;
