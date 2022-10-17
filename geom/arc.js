import Util from '../util.js';
import { Point, isPoint } from './point.js';
import { Line, isLine } from './line.js';

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
    return new Point(
      p3.x + Math.sqrt(radsq - (chord / 2) * (chord / 2)) * ((y1 - y2) / chord),
      p3.y + Math.sqrt(radsq - (chord / 2) * (chord / 2)) * ((x2 - x1) / chord)
    );
  }

  static chordFromAngle(radius, angle) {
    return 2 * radius * Math.sin(angle / 2);
  }

  static chordFromDistance(radius, distance) {
    return 2 * Math.sqrt(radius ** 2 - distance ** 2);
  }

  static chordFromSegment(radius, segment) {
    return Arc.chordFromAngle(radius, Arc.angleFromSegment(radius, segment));
  }

  static radiusFromSegment(segment, angle) {
    let circumference = segment / (angle / (Math.PI * 2));
    let radius = circumference / (Math.PI * 2);
    return radius;
  }

  static chordFromSegmentAngle(segment, angle) {
    let radius = Arc.radiusFromSegment(segment, angle);
    return Arc.chordFromSegment(radius, segment);
  }

  static distanceFromSegmentAngle(segment, angle) {
    let radius = Arc.radiusFromSegment(segment, angle);
    return Arc.distanceFromSegment(radius, segment);
  }

  static segmentFromChord(radius, chord) {
    return Arc.segmentFromAngle(radius, Arc.angleFromChord(radius, chord));
  }

  static segmentFromDistance(radius, distance) {
    return Arc.segmentFromAngle(radius, Arc.angleFromDistance(radius, distance));
  }

  static segmentFromAngle(radius, angle) {
    let $2pi = 2 * Math.PI;
    return $2pi * radius * (angle / $2pi);
  }

  static angleFromChord(radius, chord) {
    return Math.asin(chord / (2 * radius)) * 2;
  }

  static angleFromDistance(radius, distance) {
    return Arc.angleFromChord(radius, chordFromDistance(radius, distance));
  }

  static angleFromSegment(radius, segment) {
    let $2pi = 2 * Math.PI;
    return (segment * $2pi) / ($2pi * radius);
  }

  static distanceFromAngle(radius, angle) {
    return Math.sqrt(radius ** 2 - (0.5 * Arc.chordFromAngle(radius, angle)) ** 2);
  }

  static distanceFromSegmentAngle(segment, angle) {
    let radius = Arc.radiusFromSegment(segment, angle);
    return Arc.distanceFromAngle(radius, angle);
  }

  static distanceFromChord(radius, chord) {
    return Math.sqrt(radius ** 2 - (0.5 * chord) ** 2);
  }

  static distanceFromChordAngle(chord, angle) {
    return Arc.distanceFromAngle(radius, Arc.angleFromSegment(radius, segment));
  }

  static distanceFromSegment(radius, segment) {
    return Arc.distanceFromAngle(radius, Arc.angleFromSegment(radius, segment));
  }
}

export function ArcTo(x, y, curve = 0) {
  if(curve == 0) return `l ${x} ${y}`;

  let radius,
    largeArc = 0,
    sweep = 0;
  let arcLen = Math.sqrt(x * x + y * y);

  let f = 45 / curve;

  let remain = 360 - curve;

  radius = arcLen * f;

  return `a ${radius} ${radius} 0 ${largeArc} ${sweep} ${x} ${y}`;
}
