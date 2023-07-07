import { Point, Line, TransformationList, ImmutableTransformationList, LineList } from '../geom.js';
import { unique, className, isObject, range, roundTo } from '../misc.js';
import { Component, useEffect, useState } from '../preact.mjs';
import { classNames } from '../classNames.js';
import { useTrkl } from '../hooks/useTrkl.js';
export { useTrkl } from '../hooks/useTrkl.js';

const PI = Math.PI;
export const RAD2DEG = 180 / Math.PI;
export const DEG2RAD = Math.PI / 180;
const { mod, mul } = Util;

const rad2deg = mul(RAD2DEG);
const deg2rad = mul(DEG2RAD);

export const VERTICAL = 1;
export const HORIZONTAL = 2;
export const HORIZONTAL_VERTICAL = VERTICAL | HORIZONTAL;

export let DEBUG = false;

export let log = DEBUG ? (typeof console.debug == 'function' ? console.debug : console.info || console.log).bind(console) : () => {};

export const setDebug = state => {
  DEBUG = state;
  return log = state ? (console.log) : (() => {});
};

export const PinSizes = {
  long: 3,
  middle: 2,
  short: 1,
  point: 0
};

export const EscapeClassName = name =>
  name ||
  encodeURIComponent(name)
    .replace(/_/g, '%5f')
    .replace(/%([0-9A-Fa-f]{2})/g, '_0x$1_');

export const UnescapeClassName = name => decodeURIComponent(name.replace(/_0?x?([0-9A-Fa-f]{2})_/g, '%$1'));

export const LayerToClass = layer => {
  let layerName = typeof layer == 'string' ? layer : layer.name;
  let layerClass = layerName.toLowerCase();
  if(/^[tb][A-Z]/.test(layerName)) {
    layerClass = layerName
      .replace(/^t([A-Z].*)/, 'top $1')
      .replace(/^b([A-Z].*)/, 'bottom $1')
      .toLowerCase();
  }
  if(/s$/.test(layerClass)) layerClass = layerClass.slice(0, -1);

  return layerClass.split(' ');
};
export const ElementToClass = (element, layerName) => {
  //console.debug('ElementToClass', className(element), element.tagName, { element, layerName });
  layerName = layerName || element.layer;
  let layerClass = layerName ? LayerToClass(layerName) : [];

  let tagName, name;
  if(/*isObject*/ element) {
    if(element.tagName) tagName = element.tagName;
    if(element.name) name = EscapeClassName(element.name);
  }
  let classes = [tagName, name, ...layerClass];
  //console.debug('ElementToClass', {classes,layerClass});
  return classNames(...unique(classes));
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

export const MakeRotation = (rot, f = 1) => {
  let mirror, angle;
  if(!rot) {
    mirror = 0;
    angle = 0;
  } else {
    mirror = /M/.test(rot) ? 1 : 0;
    angle = +((rot && rot + '') || '').replace(/M?R/, '') || 0;
  }
  let transformations = new TransformationList([], '', '');
  if(angle !== 0) transformations.rotate(angle);
  if(mirror !== 0) transformations.scale(-1, 1);

  return transformations;
};

export const ExtractRotation = transformation => {
  let [sc] = transformation;

  if(sc === undefined) return new TransformationList();

  let t = transformation.slice(sc.type == 'scale' && sc.x == 1 && sc.y == -1 ? 1 : 0).filter(t => t.type != 'translate');

  let angle = t.rotation ? t.rotation.angle : 0;
  let mirror = t.scaling && t.scaling.x == -1 && t.scaling.y == 1;

  return new TransformationList().rotate(angle).scale(mirror ? -1 : 1, 1);
};

export const InferRotation = transformation => {
  let [sc] = transformation;
  let t = transformation.slice(sc.type == 'scale' && sc.x == 1 && sc.y == -1 ? 1 : 0).filter(t => t.type != 'translate');

  let angle = t.rotation ? t.rotation.angle : 0;
  let mirror = t.scaling && t.scaling.x == -1 && t.scaling.y == 1;

  return angle != 0 || mirror ? (mirror ? 'M' : '') + 'R' + angle : '';
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

export const Alignment = (align, rot = 0, scaling = null, def = 'bottom-left') => {
  let [y, x] = (typeof align == 'string' ? EagleAlignments[align] : [...align]) || EagleAlignments[def];
  let ret = new Point(x, y);
  if(scaling) {
    if(scaling.x < 0) ret.x = -ret.x;
    if(scaling.y < 0) ret.y = -ret.y;
  }
  if(Math.abs(rot) > 0) ret.rotate((rot * PI) / 180);
  return ret.round(1);
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
  const r = MakeRotation(rot, f);

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

export const PolarToCartesian = ([radius, angle], origin = { x: 0, y: 0 }) => {
  let a = (angle - 90) * DEG2RAD;
  return {
    x: origin.x + radius * Math.cos(a),
    y: origin.y + radius * Math.sin(a)
  };
};

export const CartesianToPolar = ({ x, y }, origin = { x: 0, y: 0 }) => {
  x -= origin.x;
  y -= origin.y;

  let r = Math.sqrt(x * x + y * y);
  let phi = Math.atan2(y, x);
  return [r, phi];
};

export const RenderArc = (x, y, radius, startAngle, endAngle) => {
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

/*const CalculateArc = (p1, p2, theta) => {
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
*/
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

  return `A ${radius} ${radius} 0 ${large} ${sweep ? 1 : 0} ${to.x} ${to.y}`;
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

  const distance = Math.sqrt(d.x * d.x + d.y * d.y);
  return distance / (2 * Math.sin(angle / 2));
};

export function LinesToPath(lines, lineFn) {
  let l = lines.shift(),
    m;
  let [start, point] = l.toPoints();
  let path,
    ret = [];
  let prevPoint = start;
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
        const diff = Point.diff(p[0], p[1]);
        const radius = roundTo(CalculateArcRadius(diff, theta), 0.0001);
        prevPoint = point;
        const sweep = (curve || 0) >= 0;
        if(curve !== undefined && isFinite(radius)) return RenderArcTo(dist, Math.abs(radius), theta, sweep, p[1]);
        else if(Point.equals(start, p[1])) return `Z`;
        else return `L ${p[1].x} ${p[1].y}`;
      };
      prevPoint = point;
      start = new Point(point.x, point.y);
      return `M ${point.x} ${point.y}`;
    });
  ret.push((path = []));

  const lineTo = (...args) => {
    if(typeof args[0] == 'number') throw new Error('num');
    if(args[0].x === undefined) throw new Error(`lineTo arg 1`);

    let l = lineFn(...args);
    path.push(l);
  };
  lineTo(prevPoint);
  lineTo(point, l.curve);
  do {
    m = null;
    for(let i = 0; i < lines.length; i++) {
      const p = lines[i];
      const d = [i, Point.distance(l[1], p[0]), Point.distance(l[1], p[1])];

      if(Point.equals(l[1], p[0])) {
        m = lines.splice(i, 1)[0];
        break;
      } else if(Point.equals(l[1], p[1])) {
        let tmp = lines.splice(i, 1)[0];
        m = tmp.reverse();
        break;
      }
    }
    if(m) {
      lineTo(m[1], m.curve);
      l = m;
    } else if(lines.length > 0) {
      l = lines.shift();
      ret.push((path = []));
      path.push(`M ${l.x1} ${l.y1}`);
      start = l.a;
      prevPoint = l[0];
      lineTo(l.b, l.curve);
    }
  } while(lines.length > 0);
  return ret;
}

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
    let newCoords = Object.keys(coords).reduce((acc, k) => ({ ...acc, [k]: roundTo(coords[k], 0.000001) }), {});

    //console.log(`CoordTransform [${transformStr}]`, oldCoords, ' -> ', newCoords);
    return { ...newCoords };
  };
}

export const useAttributes = (element, attributeNames) => {
  attributeNames = attributeNames || Object.keys(element.attributes);

  let ret = {};

  for(let attr of attributeNames) ret[attr] = useTrkl(element.handlers[attr]);

  return ret;
};

export const useTransformation = transformation => {
  let list = new ImmutableTransformationList(transformation);

  return list;
};

export const useTransform = ({ transform, transformation, ...props }) => {
  transformation = transformation ? new ImmutableTransformationList(transformation) : new ImmutableTransformationList();

  transform = transform ? new TransformationList(transform) : new TransformationList();

  function accumulate(opts = {}) {
    return { ...opts, transformation: transformation.concat(transform), transform };
  }

  return [transformation, transform, accumulate];
};

export const RenderShape = (shape, ro, ri) => {
  let d;
  log('RenderShape ', { shape, ro, ri });

  switch (shape) {
    case 'long': {
      ro = ro * 1.2;
      const w = ro;
      d = `M 0 ${-ro} l ${w} 0 A ${ro} ${ro} 0 0 1 ${w} ${ro} l ${-w * 2} 0 A ${ro} ${ro} 0 0 1 ${-w} ${-ro}`;
      break;
    }
    case 'square': {
      d = [new Point(-1, -1), new Point(1, -1), new Point(1, 1), new Point(-1, 1)]
        .map(p => p.prod(ro))
        .map(p => p.round())
        .map((p, i) => `${i == 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
      break;
    }
    case 'octagon': {
      d = range(0, 7)
        .map(i => Point.fromAngle((Math.PI * i) / 4 + Math.PI / 8, ro * 1.2))
        .map(p => p.round())
        .map((p, i) => `${i == 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
      break;
    }
    default: {
      d = `M 0 ${-ro} A ${ro} ${ro} 0 0 1 0 ${ro} A ${ro} ${ro} 0 0 1 0 ${-ro}`;
      break;
    }
  }
  return d;
};
