import { Point } from './point.js';

export class Arc {
  constructor() {}

  /**
   * Calculates the arc radius.
   *
   * @class      ArcRadius (name)
   * @param      {Point}            chordLen      Delta vector OR chord Len
   * @param      {(number|string)}  angle   The angle
   * @return     {<type>}           The arc radius.
   */
  static radius(angle, ...chord) {
    if(!isFinite(+angle)) return Infinity;

    if(typeof chord[0] == 'number') {
      chord = chord[0];
    } else {
      if(chord.length > 1) chord = Point.diff(...chord);
      /* if(isPoint(chord))*/ chord = Math.sqrt(chord.x * chord.x + chord.y * chord.y);
    }
    return chord / (2 * Math.sin(angle / 2));
  }

  static length(angle, ...chord) {
    const radius = Arc.radius(angle, ...chord);
    const fraction = angle / (Math.PI * 2);
    const whole = radius * Math.PI;
    return whole * fraction;
  }

  static center(x1, y1, x2, y2, radius) {
    let radsq = radius * radius;
    let p3 = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    let chord = Point.distance([x1, y1], [x2, y2]);
    return new Point(p3.x + Math.sqrt(radsq - (chord / 2) * (chord / 2)) * ((y1 - y2) / chord), p3.y + Math.sqrt(radsq - (chord / 2) * (chord / 2)) * ((x2 - x1) / chord));
  }

  static chordFromAngle(radius, angle) {
    return 2 * radius * Math.sin(angle / 2);
  }

  static chordFromDistance(radius, distance) {
    return 2 * Math.sqrt(radius ** 2 - distance ** 2);
  }

  static chordFromSegment(radius, arcLength) {
    return Arc.chordFromAngle(radius, Arc.angleFromSegment(radius, arcLength));
  }

  static segmentFromChord(radius, chord) {
    return Arc.segmentFromAngle(radius, Arc.angleFromChord(radius, chord));
  }

  static segmentFromDistance(radius, distance) {
    return Arc.segmentFromAngle(radius, Arc.angleFromDistance(radius, distance));
  }

  static segmentFromAngle(radius, angle) {
    return radius * angle;
  }

  static angleFromChord(radius, chord) {
    return Math.asin(chord / (2 * radius)) * 2;
  }

  static angleFromDistance(radius, distance) {
    return Arc.angleFromChord(radius, chordFromDistance(radius, distance));
  }

  static angleFromSegment(radius, arcLength) {
    let $2pi = 2 * Math.PI;
    return (arcLength * $2pi) / ($2pi * radius);
  }
  /*
  static distanceFromAngle(radius, angle) {
    return Math.sqrt(radius ** 2 - (0.5 * Arc.chordFromAngle(radius, angle)) ** 2);
  }*/

  static distanceFromAngle(radius, angle) {
    return radius * Math.sin(angle);
  }

  static distanceFromChord(radius, chord) {
    return Math.sqrt(radius ** 2 - (0.5 * chord) ** 2);
  }

  static distanceFromSegment(radius, arcLength) {
    return Arc.distanceFromAngle(radius, Arc.angleFromSegment(radius, arcLength));
  }

  static radiusFromChordAndHeight(chord, arcHeight) {
    return chord ** 2 / (8 * arcHeight) + arcHeight / 2;
  }

  static radiusFromChordAngle(chord, angle) {
    let alpha = (Math.PI - angle) / 2;
    return chord * Math.cos(alpha);
  }

  static distanceFromChordAngle(chord, angle) {
    return Arc.distanceFromAngle(radius, Arc.angleFromSegment(radius, arcLength));
  }

  static radiusFromSegment(arcLength, angle) {
    let circumference = arcLength / (angle / (Math.PI * 2));
    return circumference / (Math.PI * 2);
  }

  static chordFromSegmentAngle(arcLength, angle) {
    return Arc.chordFromSegment(Arc.radiusFromSegment(arcLength, angle), arcLength);
  }

  static distanceFromSegmentAngle(arcLength, angle) {
    return Arc.distanceFromSegment(Arc.radiusFromSegment(arcLength, angle), arcLength);
  }

  static distanceFromSegmentAngle(arcLength, angle) {
    return Arc.distanceFromAngle(Arc.radiusFromSegment(arcLength, angle), angle);
  }

  static radiusFromDistanceAngle(distance, angle) {
    return distance / Math.cos(angle / 2);
  }

  static radiusFromChordSagitta(chord, sagitta) {
    return ((sagitta ** 2 + chord ** 2) / sagitta) * 2;
  }

  static chordFromSagitta(radius, sagitta) {
    return Math.sqrt(2 * radius * sagitta - sagitta ** 2);
  }

  static sagittaFromSegment(radius, segment) {
    return radius * Math.sin(segment / (2 * radius));
  }

  static sagittaFromAngle(radius, angle) {
    return Arc.sagittaFromSegment(radius, Arc.segmentFromAngle(radius, angle));
  }

  static sagittaFromChord(radius, chord) {
    return Arc.sagittaFromAngle(radius, Arc.angleFromChord(radius, chord));
  }

  static arcFromPoints(x0, y0, x1, y1, x2, y2) {
    let r = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
    let x = x0 - r;
    let y = y0 - r;
    let width = 2 * r;
    let height = 2 * r;
    let start = (180 / Math.PI) * Math.atan2(y1 - y0, x1 - x0);
    let end = (180 / Math.PI) * Math.atan2(y2 - y0, x2 - x0);
    return { x, y, width, height, start, end };
  }
}

export function ArcTo(x, y, curve = 0) {
  if(Math.abs(curve) <= Number.EPSILON) return `l ${x} ${y}`;

  let radius,
    largeArc = 0,
    sweep = 0;

  let chordLen = Math.sqrt(x * x + y * y);

  let c = Math.abs(curve);
  let s = Math.sign(curve) < 0 ? 1 : 0;

  let remain = 360 - c;
  let angle = (c * Math.PI) / 180;

  let alpha = angle / 2;
  radius = chordLen * Math.cos(alpha);

  //console.log('ArcTo', { chordLen, angle, radius });

  largeArc = c > 90;
  sweep ^= s;

  return `a ${radius} ${radius} 0 ${largeArc | 0} ${sweep | 0} ${x} ${y}`;
}