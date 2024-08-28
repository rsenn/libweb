import { Point } from './point.js';
import { extend, define, properties } from '../misc.js';

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
    return (Arc.radius(angle, ...chord) * angle) / 2;
  }

  static center(x1, y1, x2, y2, radius) {
    const radsq = radius * radius;
    const chord = Point.distance([x1, y1], [x2, y2]);

    return new Point((x1 + x2) / 2 + Math.sqrt(radsq - (chord / 2) * (chord / 2)) * ((y1 - y2) / chord), (y1 + y2) / 2 + Math.sqrt(radsq - (chord / 2) * (chord / 2)) * ((x2 - x1) / chord));
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
    const $2pi = 2 * Math.PI;

    return (arcLength * $2pi) / ($2pi * radius);
  }

  /*static distanceFromAngle(radius, angle) {
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
    return chord * Math.cos((Math.PI - angle) / 2);
  }

  static distanceFromChordAngle(chord, angle) {
    return Arc.distanceFromAngle(radius, Arc.angleFromSegment(radius, arcLength));
  }

  static radiusFromSegment(arcLength, angle) {
    return arcLength / (angle / (Math.PI * 2)) / (Math.PI * 2);
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
    const r = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
    const x = x0 - r;
    const y = y0 - r;
    const width = 2 * r;
    const height = 2 * r;
    const start = (180 / Math.PI) * Math.atan2(y1 - y0, x1 - x0);
    const end = (180 / Math.PI) * Math.atan2(y2 - y0, x2 - x0);

    return { x, y, width, height, start, end };
  }
}

export function ArcTo(x, y, curve = 0, round = a => a) {
  const cabs = Math.abs(curve);

  if(cabs <= Number.EPSILON) return `l ${x} ${y}`;

  const radius = round(Math.sqrt(x * x + y * y) * Math.cos((cabs * Math.PI) / 360));

  return ['a', radius, radius, 0, cabs > 90 ? 1 : 0, Math.sign(curve) < 0 ? 1 : 0, x, y].join(' ');

  //return extend(['a', radius, radius, 0, (cabs > 90) | 0, (Math.sign(curve) < 0) | 0, x, y], properties({toString() {return Array.prototype.join.call(this, ' '); } }, {enumerable: false}));
}
