import { range } from '../misc.js';
import { Line } from './line.js';
import { Point } from './point.js';
import { PointList } from './pointList.js';

export class Polygon extends PointList {
  constructor(...args) {
    super(...args);
  }

  get [Symbol.toStringTag]() {
    return 'Polygon';
  }
}

Polygon.area = polygon => {
  let area = 0;
  let j = polygon.length - 1;
  let p1;
  let p2;
  for(let k = 0; k < polygon.length; j = k++) {
    p1 = polygon[k];
    p2 = polygon[j];
    if(p1.x !== undefined && p2.x !== undefined) {
      area += p1.x * p2.y;
      area -= p1.y * p2.x;
    } else {
      area += p1[0] * p2[1];
      area -= p1[1] * p2[0];
    }
  }
  area = area / 2;
  return area;
};

Polygon.center = polygon => {
  let x = 0;
  let y = 0;
  let f;
  let j = polygon.length - 1;
  let p1;
  let p2;
  for(let k = 0; k < polygon.length; j = k++) {
    p1 = polygon[k];
    p2 = polygon[j];
    if(p1.x !== undefined && p2.x !== undefined) {
      f = p1.x * p2.y - p2.x * p1.y;
      x += (p1.x + p2.x) * f;
      y += (p1.y + p2.y) * f;
    } else {
      f = p1[0] * p2[1] - p2[0] * p1[1];
      x += (p1[0] + p2[0]) * f;
      y += (p1[1] + p2[1]) * f;
    }
  }
  f = area(polygon) * 6;
  return [x / f, y / f];
};

Polygon.approxCircle = (radius, npoints) => {
  let ret = [];
  for(let k = 0; k < npoints; k++) {
    let theta = (Math.PI * 2 * k) / npoints;

    let x = Math.sin(theta) * radius;
    let y = Math.cos(theta) * radius;

    ret.push({ x, y });
  }
  return ret;
};

Polygon.toPath = (polygon, relative = true) => {
  let prevx = 0;
  let prevy = 0;
  let path = '';

  for(let k = 0; k < polygon.length; k++) {
    let x = polygon[k].x !== undefined ? polygon[k].x : polygon[k][0];
    let y = polygon[k].y !== undefined ? polygon[k].y : polygon[k][1];

    if(relative) {
      x -= prevx;
      y -= prevy;
    }

    let cmd = k == 0 ? 'M' : 'L';
    if(relative) cmd = cmd.toLowerCase();
    path += `${cmd}${x},${y}`;
  }

  path += 'z';
  return path;
};

Polygon.fromLine = (arg, offset, steps = 3) => {
  let line = new Line(arg);
  const PI2 = Math.PI * 0.5;
  const step = range(0, steps - 1).map(i => (i * Math.PI) / (steps - 1));
  const a = line.angle();
  let vl = new PointList();
  //console.log('step:', step);
  vl = vl.concat(step.map(va => Point.fromAngle(a - PI2 - va, offset).sum(line.a)));
  vl = vl.concat(step.map(va => Point.fromAngle(a + PI2 - va, offset).sum(line.b)));
  return vl;
};

Polygon.pointInside = function(polygon, point) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  const { x, y } = point;

  let inside = false;
  for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x;
    let yi = polygon[i].y;
    let xj = polygon[j].x;
    let yj = polygon[j].y;

    let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if(intersect) inside = !inside;
  }

  return inside;
};

export function MakePolygon(n = 8, r = 1.27, start = 0) {
  const $2pi = Math.PI * 2;
  const step = $2pi / n;
  return new Polygon(
    range(0, n - 1)
      .map(i => ($2pi * i) / n)
      .map(a => Point.fromAngle(a + step * start, r))
  );
}

export default Polygon;
