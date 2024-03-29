function distance(a, b) {
  return distance3(a, b[0], b[1], b[2]);
}

function distance3(a, x, y, z) {
  let dx = x - a[0];
  let dy = y - a[1];
  let dz = z - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function interpolate(p0, p1, p2, p3, t) {
  let v0 = (p2 - p0) * 0.5;
  let v1 = (p3 - p1) * 0.5;
  let t2 = t * t;
  let t3 = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

export function splinePoints(points, options) {
  let isClosedPath = options && options.closed;
  let segmentLength = options && options.segmentLength ? options.segmentLength : 0;

  let subpoints = [];
  let numPoints = isClosedPath ? points.length : points.length - 1;
  for(let i = 0; i < numPoints; i++) {
    var c0, c1, c2, c3;
    if(isClosedPath) {
      c0 = (i - 1 + points.length) % points.length;
      c1 = i % points.length;
      c2 = (i + 1) % points.length;
      c3 = (i + 2) % points.length;
    } else {
      c0 = i === 0 ? i : i - 1;
      c1 = i;
      c2 = i > points.length - 2 ? i : i + 1;
      c3 = i > points.length - 3 ? i : i + 2;
    }
    let numSteps = 3;
    if(segmentLength) {
      let dist = distance(points[c1], points[c2]);
      numSteps = Math.max(1, dist / segmentLength);
    }
    if(segmentLength) {
      numSteps *= 100; //generate 10x more points than necessary
    }
    let step = 1 / numSteps;
    for(let t = 0; t < 1; t += step) {
      let x = interpolate(points[c0][0], points[c1][0], points[c2][0], points[c3][0], t);
      let y = interpolate(points[c0][1], points[c1][1], points[c2][1], points[c3][1], t);
      let z = interpolate(points[c0][2], points[c1][2], points[c2][2], points[c3][2], t);
      subpoints.push([x, y, z]);
    }
  }

  let finalPoints = [];
  let travelledDist = 0;
  let prevPoint = points[0];
  finalPoints.push(prevPoint);
  for(let i = 0; i < subpoints.length; i++) {
    let p = subpoints[i];
    travelledDist += distance(prevPoint, p);
    if(travelledDist >= segmentLength) {
      finalPoints.push(p);
      travelledDist -= segmentLength;
    }
    prevPoint = p;
  }

  if(!isClosedPath && distance(finalPoints[finalPoints.length - 1], subpoints[subpoints.length - 1]) > segmentLength / 2) {
    finalPoints.push(subpoints[subpoints.length - 1]);
  }
  return finalPoints;
}

export default splinePoints;
