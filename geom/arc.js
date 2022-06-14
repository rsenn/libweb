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
}
