export const Polygon = function Polygon() {};

Polygon.area = polygon => {
  var area = 0;
  var j = polygon.length - 1;
  var p1;
  var p2;
  for(var k = 0; k < polygon.length; j = k++) {
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
  var x = 0;
  var y = 0;
  var f;
  var j = polygon.length - 1;
  var p1;
  var p2;
  for(var k = 0; k < polygon.length; j = k++) {
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
  var ret = [];
  for(var k = 0; k < npoints; k++) {
    var theta = (Math.PI * 2 * k) / npoints;

    var x = Math.sin(theta) * radius;
    var y = Math.cos(theta) * radius;

    ret.push({ x, y });
  }
  return ret;
};

Polygon.toPath = (polygon, relative = true) => {
  var prevx = 0;
  var prevy = 0;
  var path = '';

  for(var k = 0; k < polygon.length; k++) {
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

export default Polygon;
