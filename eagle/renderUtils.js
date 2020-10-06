import { Point, Line, TransformationList, LineList } from '../geom.js';
import Util from '../util.js';
import { Component, useEffect, useState } from '../dom/preactComponent.js';
import { classNames } from '../classNames.js';

const PI = Math.PI;
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;
const { mod, mul, roundTo } = Util;

const rad2deg = mul(RAD2DEG);
const deg2rad = mul(DEG2RAD);

export const VERTICAL = 1;
export const HORIZONTAL = 2;
export const HORIZONTAL_VERTICAL = VERTICAL | HORIZONTAL;

export const EscapeClassName = name =>
  encodeURIComponent(name)
    .replace(/_/g, '%5f')
    .replace(/%([0-9A-Fa-f]{2})/g, '_0x$1_');

export const UnescapeClassName = name => decodeURIComponent(name.replace(/_0?x?([0-9A-Fa-f]{2})_/g, '%$1'));

export const ElementToClass = (element, layerName) => {
  layerName = layerName || (element.layer || {}).name || '';
  //console.debug('ElementToClass', Util.className(element), element.tagName, { element, layerName });
  let layerClass = layerName.toLowerCase();
  if(/^[tb][A-Z]/.test(layerName)) {
    layerClass = layerName
      .replace(/^t([A-Z].*)/, 'top $1')
      .replace(/^b([A-Z].*)/, 'bottom $1')
      .toLowerCase();
  }
  if(/s$/.test(layerClass)) layerClass = layerClass.slice(0, -1);

  let tagName, name;
  if(/*Util.isObject*/ element) {
    if(element.tagName) tagName = element.tagName;
    if(element.name) name = EscapeClassName(element.name);
  }
  let classes = [tagName, name, layerClass];
  return classNames(...Util.unique(classes));
  return classes;
};

export const ClampAngle = (a, mod = 360) => {
  while(a < 0) a += 360;
  a %= mod;
  return a > 180 ? a - 360 : a;
};
export const AlignmentAngle = a => {
  a %= 360;
  return Math.abs(a - (a % 180));
};

export const Rotation = (rot, f = 1) => {
  let mirror, angle;
  if(!rot) {
    mirror = 0;
    angle = 0;
  } else {
    mirror = /M/.test(rot) ? 1 : 0;
    angle = +(rot || '').replace(/M?R/, '') || 0;
  }
  let transformations = new TransformationList([], '', '');
  if(angle !== 0) transformations.rotate(-angle);
  if(mirror !== 0) transformations.scale(-1, 1);

  return transformations;
};

export const EagleAlignments = {
  'bottom-left': [-1, -1],
  'bottom-center': [-1, 0],
  'bottom-right': [-1, 1],
  'center-left': [0, -1],
  center: [0, 0],
  'center-right': [0, 1],
  'top-left': [1, -1],
  'top-center': [1, 0],
  'top-right': [1, 1]
};

export const Alignment = (align, def = 'bottom-left', rot = 0) => {
  let [y, x] = EagleAlignments[align] || EagleAlignments[def];
  let ret = new Point(x, y);
  if(Math.abs(rot) > 0) ret.rotate((rot * PI) / 180);
  return ret;
};

export const SVGAlignments = [
  ['baseline', 'middle' /* 'mathematical'*/, 'hanging'],
  ['start', 'middle', 'end']
];

export const AlignmentAttrs = (align, hv = HORIZONTAL_VERTICAL, rot = 0) => {
  // if(Math.abs(rot) > 0) coord.rotate((rot * PI) / 180);
  const def = { y: 1, x: -1 };

  const { x, y } = align || def;
  const [vAlign, hAlign] = SVGAlignments;
  let r = {};

  //console.log('AlignmentAttrs', { x, y });
  if(hv & VERTICAL) r['dominant-baseline'] = vAlign[Math.round(y) + 1];
  if(hv & HORIZONTAL) r['text-anchor'] = hAlign[Math.round(x) + 1];
  return r;
};

export const RotateTransformation = (rot, f = 1) => {
  const r = Rotation(rot, f);

  return r.toString();
};

export const LayerAttributes = layer =>
  layer
    ? {
        'data-layer': `${layer.number} ${layer.name} color: ${layer.color}`
      }
    : {};

export const InvertY = item => {
  let ret = {};
  for(let prop in item.attributes) {
    if(prop.startsWith('y')) ret[prop] = -+item.attributes[prop];
    else ret[prop] = item.attributes[prop];
  }
  return item;
};

export const PolarToCartesian = (cx, cy, radius, angle) => {
  let a = (angle - 90) * DEG2RAD;
  return {
    x: cx + radius * Math.cos(a),
    y: cy + radius * Math.sin(a)
  };
};

export const Arc = (x, y, radius, startAngle, endAngle) => {
  let start = PolarToCartesian(x, y, radius, endAngle);
  let end = PolarToCartesian(x, y, radius, startAngle);
  let arcSweep = endAngle - startAngle <= 180 ? '0' : '1';
  let d = ['M', start.x, start.y, 'A', radius, radius, 0, arcSweep, 0, end.x, end.y].join(' ');
  return d;
};
/*
 *  Chord Length
 *     c = 2R sin( ½ × θ )
 *
 *     L = R *  θ ÷  (2*PI)
 *     L ÷ C =  θ ÷  (2*PI)
 *
 *
 * Arc length s for an angle θ
 *
 *  L =  R  x θ
 *    =  θ × R
 *
 *  L / R =   θ
 *
 *  𝛂 = 𝛃 = (PI - θ) / 2
 *                                     B
 *                                 ..
 *           𝛑                      .N
 *                                 ..........
 *                           ..77I7I........+ZZZ,.
 *                        .:77....~I7        ....:ZZ.
 *                    . .77..   ..I.I             ..:Z,.
 *                   ..I7.       I..7                ..Z=.
 *                  .77..      .7.  ~.                 ..Z..
 *                ..I..        ~?.  .~.                 ..IZ.
 *               ..I.        ..7.   .7.                   ..Z
 *               ,I..        .7.  𝛃 .7.   R                 .Z..
 *             ..7.         .I.     .7.                     ..Z..
 *             .I.   c   . ~:?.      ..                      .:Z.
 *            .7..         .7.       .I.                       Z.
 *           ..I.         .7.     ..?.7.                       .Z.
 *           .7..       ..I..   ..~...7..                      .Z.
 *           .I..        =+.    .Z.  .=..                      .,+
 *           .I       ...7.    .O.   ..=.                       .Z
 *           .7       =.I.     ..  Θ  .7.=+                     .Z
 *           .7      ..7.      ..    .7:.$    C                  Z
 *           .I      .+=.      ....$7..                         .Z
 *           .7..    .7..      ..I..                            .Z
 *           .I..   .I.      .7+.                              .$.
 *           .:I.   7. 𝛂  .I7..                                .Z.
 *           ..I. .?~   .I..    R                              ~I.
 *             ,7..   7I.                                    ..Z.
 *             .7,7~I..                                      .Z..
 *           A  .I,..                                       .Z,
 *              ..Z..                                     ..Z~.
 *              ...Z=..                                  ..Z.
 *                  ,Z...                              ..,Z.
 *                   .Z7..                           ...Z~.
 *                     .Z$..                        ..Z+.
 *                       .IZ:....              ....ZZ..
 *                          .7ZZ...............~ZZ,.
 *                              ..IZZZZZZZZZZ~.
 *
 *   ⌀
 */

const CalculateArc = (p1, p2, theta) => {
  const M_2_PI = PI * 2;
  const chordLen = Point.distance(p1, p2);
  let radius = chordLen / (2 * Math.sin(theta / 2));
  const sweepArc = theta > 0 ? 1 : 0;
  const largeArc = Math.abs(theta) > PI ? 1 : 0;
  let arc = {
    theta,
    chordLen,
    radius,
    get circumference() {
      return this.radius * PI;
    },
    get diameter() {
      return this.radius * 2;
    },
    get arcLen() {
      return this.radius * this.theta;
    },
    get pathData() {
      return [`M ${p1.x} ${p1.y}`, `A ${this.radius} ${this.radius} 0 ${largeArc} ${sweepArc} ${p2.x},${p2.y}`];
    }
  };
  console.debug(`CalculateArc`, arc);
  return arc;
};

/**
 * Render Arc to specific end point
 *
 * @class      RenderArcTo (name)
 * @param      {Number}    distance  Distance of straight line
 * @param      {Number}    radius    Radius
 * @param      {Number}    theta     Partial circumference (radians)
 * @param      {Point}     to        End point
 * @return     {String}  SVG arc command
 */
const RenderArcTo = (distance, radius, theta, sweep, to) => {
  const large = Math.abs(theta) > PI ? 1 : 0;

  return `A ${radius} ${radius} 0 ${large} ${sweep} ${to.x} ${to.y}`;
};

/**
 * Render move and arc command
 *
 * @class      RenderArcFromTo (name)
 * @param      {Point}  start   The start
 * @param      {Number}  radius  The radius
 * @param      {Number}  theta  Partial circumference (radians)
 * @param      {Number}  end     The end
 * @return     {Array}   Move and arc command
 */
const RenderArcFromTo = (start, radius, theta, end) => {
  const distance = Point.distance(start, end);
  const diff = Point.diff(end, start);

  const sweep = (diff.x < 0) ^ (diff.y < 0);

  return [`M ${start.x} ${start.y}`, RenderArcTo(distance, radius, theta, sweep, end)];
};

/**
 * Calculates the arc radius.
 *
 * @class      CalculateArcRadius (name)
 * @param      {Point}            d      Delta
 * @param      {(number|string)}  angle   The angle
 * @return     {<type>}           The arc radius.
 */
export const CalculateArcRadius = (d, angle) => {
  if(!isFinite(+angle)) return Infinity;

  const distance = Math.sqrt(d.x*d.x + d.y*d.y);
  return distance / (2 * Math.sin(angle / 2));
};

export const LinesToPath = (lines, lineFn) => {
  let l = lines.shift(),
    m;
  let [start, point] = l;
  let path,
    ret = [];
  let prevPoint = start;
  //path.push(`M ${prevPoint.x} ${prevPoint.y}`);
  let debug = false; //Point.equals(start, { x: 0, y: -2 });

  if(debug) {
    console.debug(`LinesToPath`, { lines, lineFn }, Util.getCallerStack());
  }

  lineFn =
    lineFn ||
    ((point, curve) => {
      lineFn = (point, curve) => {
        const p = [prevPoint, point];
        const dist = Point.distance(...p);
        const slope = Point.diff(prevPoint, point).round(0.0001);

        let cmd;
        const theta = deg2rad(curve);
        const angle = roundTo(rad2deg(theta), 0.1) || undefined;
        const diff =Point.diff(p[0], p[1]);
        const radius = roundTo(CalculateArcRadius(diff , theta), 0.0001);
        prevPoint = point;
        const sweep = Math.abs(slope.toAngle()) < PI ? 1 : 0;

        //if(isFinite(radius))
        if(debug) Util.consoleConcat(`lineFn\n`, { curve, angle, slope, radius }, debug).print(console.log);

        if(curve !== undefined && isFinite(radius)) return RenderArcTo(dist, radius.toFixed(4), theta, sweep, p[1]);
        else if(Point.equals(start, p[1])) return `Z`;
        else return `L ${p[1].x} ${p[1].y}`;
      };
      prevPoint = point;
      return `M ${point.x} ${point.y}`;
    });

  ret.push((path = []));

  const lineTo = (...args) => path.push(lineFn(...args));

  lineTo(prevPoint);
  lineTo(point, l.curve);

  do {
    m = null;
    for(let i = 0; i < lines.length; i++) {
      const p = lines[i]; /*.toPoints()*/

      const d = [i, Point.distance(l[1], p[0]), Point.distance(l[1], p[1])];

      if(Point.equals(l[1], p[0])) {
        m = lines.splice(i, 1)[0];
        break;
      } else if(Point.equals(l[1], p[1])) {
        m = lines.splice(i, 1)[0].reverse();
        if(l.curve !== undefined && isFinite(+l.curve) && Math.abs(+l.curve) > 0) m.curve = -m.curve;
        break;
      }
    }
    if(m) {
      debug = Point.equals(m[1], { x: 0.635, y: 1.016 }) && m;
      lineTo(m[1], m.curve);
      l = m;
    } else if(lines.length > 0) {
      l = lines.shift();
      ret.push((path = []));
      path.push(`M ${l.x1} ${l.y1}`);
      prevPoint = l[0];
      debug = Point.equals(l[1], { x: 0.635, y: 1.016 }) && l;
      lineTo(l[1], l.curve);
    }
  } while(lines.length > 0);

  return ret;
};

export function MakeCoordTransformer(matrix) {
  const transformStr = matrix + '';

  if(matrix && matrix.toMatrix) matrix = matrix.toMatrix();

  if(matrix.isIdentity()) return obj => obj;

  //S if(matrix && matrix.clone) matrix = Object.freeze(matrix.clone());

  let tr = matrix.transformer();

  return obj => {
    let coords = {};
    if('x' in obj && 'y' in obj) {
      const [x, y] = tr.xy(obj.x, obj.y);
      coords = { ...coords, x, y };
    }
    if('width' in obj && 'height' in obj) {
      const [width, height] = tr.wh(obj.width, obj.height);
      coords = { ...coords, width, height };
    }

    if('x1' in obj && 'y1' in obj && 'x2' in obj && 'y2' in obj) {
      const [x1, y1] = tr.xy(obj.x1, obj.y1);
      const [x2, y2] = tr.xy(obj.x2, obj.y2);
      coords = { ...coords, x1, y1, x2, y2 };
    }
    let oldCoords = Object.keys(coords).reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {});
    let newCoords = Object.keys(coords).reduce((acc, k) => ({ ...acc, [k]: Util.roundTo(coords[k], 0.000001) }), {});

    //console.log(`CoordTransform [${transformStr}]`, oldCoords, ' -> ', newCoords);
    return { ...newCoords };
  };
}

export const useTrkl = fn => {
  const [value, setValue] = useState(fn());
  //console.debug('useTrkl fn =', fn, ' value =', value);

  useEffect(() => {
    let updateValue = v => {
      if(v !== undefined) {
        /*  if(v === 'yes') v = true;
        else if(v === 'no') v = false;*/
        //console.debug('useTrkl updateValue(', v, ')');
        setValue(v);
      }
    };

    fn.subscribe(updateValue);
    return () => fn.unsubscribe(updateValue);
  });
  return value;
};

export const useAttributes = (element, attributeNames) => {
  attributeNames = attributeNames || Object.keys(element.attributes);

  let ret = {};

  for(let attr of attributeNames) ret[attr] = useTrkl(element.handlers[attr]);

  return ret;
};
