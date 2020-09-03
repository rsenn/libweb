import { Point, TransformationList } from '../geom.js';
import Util from '../util.js';
import { Component, useEffect, useState } from '../dom/preactComponent.js';

export const VERTICAL = 1;
export const HORIZONTAL = 2;
export const HORIZONTAL_VERTICAL = VERTICAL | HORIZONTAL;

export const ClampAngle = (a, mod = 360) => {
  while(a < 0) a += 360;
  a %= mod;
  return a > 180 ? a - 360 : a;
};
export const AlignmentAngle = (a) => {
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
  let transformations = new TransformationList();
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
  if(Math.abs(rot) > 0) ret.rotate((rot * Math.PI) / 180);
  return ret;
};

export const SVGAlignments = [
  ['baseline', 'mathematical', 'hanging'],
  ['start', 'middle', 'end']
];

export const AlignmentAttrs = (align, hv = HORIZONTAL_VERTICAL, rot = 0) => {
  // if(Math.abs(rot) > 0) coord.rotate((rot * Math.PI) / 180);
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

export const LayerAttributes = (layer) =>
  layer
    ? {
        'data-layer': `${layer.number} ${layer.name} color: ${layer.color}`
      }
    : {};

export const InvertY = (item) => {
  let ret = {};
  for(let prop in item.attributes) {
    if(prop.startsWith('y')) ret[prop] = -+item.attributes[prop];
    else ret[prop] = item.attributes[prop];
  }
  return item;
};

export const PolarToCartesian = (cx, cy, radius, angle) => {
  let a = ((angle - 90) * Math.PI) / 180.0;
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

export const CalculateArcRadius = (p1, p2, angle) => {
  const d = Point.distance(p1, p2);
  const c = Math.cos((angle * Math.PI) / 180);

  const r2 = (d * d) / (2 - 2 * c);

  let r = d / Math.sqrt(2 + 2 * c);

  if(2 + 2 * c == 0) {
    r = r2;
    console.log('CalculateArcRadius', { d, c, r2, r });
  }
  if(isNaN(r)) throw new Error('Arc radius for angle: ' + angle);

  return Math.abs(angle) > 90 ? r / 2 : Math.sqrt(r2);
};

export const LinesToPath = (lines) => {
  let l = lines.shift(),
    m;
  let start = l.a;
  let ret = [];
  let prevPoint = new Point((l.a && l.a.x) || l.x1, (l.a && l.a.y) || l.y1);
  ret.push(`M ${prevPoint.x} ${prevPoint.y}`);

  const lineTo = (point, curve) => {
    if(curve !== undefined) {
      const r = CalculateArcRadius(prevPoint, point, curve).toFixed(4);

      if(r == Number.POSITIVE_INFINITY || r == Number.NEGATIVE_INFINITY) console.log('lineTo', { prevPoint, point, curve });

      const largeArc = Math.abs(curve) > 180 ? '1' : '0';
      const sweepArc = curve > 0 ? '1' : '0';

      ret.push(`A ${r} ${r} 0 ${largeArc} ${sweepArc} ${point.x} ${point.y}`);
    } else {
      ret.push(`L ${point.x} ${point.y}`);
    }
    prevPoint = new Point(point.x, point.y);
  };

  lineTo(l.b, l.curve);

  do {
    m = null;
    for(let i = 0; i < lines.length; i++) {
      const d = [i, Point.distance(l.b, lines[i].a), Point.distance(l.b, lines[i].b)];

      if(Point.equals(l.b, lines[i].a)) {
        m = lines.splice(i, 1)[0];
        break;
      } else if(Point.equals(l.b, lines[i].b)) {
        const l = lines.splice(i, 1)[0];
        m = l.swap();
        if(l.curve !== undefined) m.curve = -l.curve;
        break;
      }
    }
    if(m) {
      if(lines.length == 0 && Point.equals(m.b, start)) ret.push(`Z`);
      else lineTo(m.b, m.curve);
      l = m;
    } else if(lines.length > 0) {
      l = lines.shift();
      ret.push(`M ${l.a.x} ${l.a.y}`);
      prevPoint = new Point(l.a.x, l.a.y);
      lineTo(l.b, l.curve);
    }
  } while(lines.length > 0);

  return ret.join(' ');
};

export function MakeCoordTransformer(matrix) {
  const transformStr = matrix + '';

  if(matrix && matrix.toMatrix) matrix = matrix.toMatrix();

  if(matrix.isIdentity()) return (obj) => obj;

  //S if(matrix && matrix.clone) matrix = Object.freeze(matrix.clone());

  let tr = matrix.transformer();

  return (obj) => {
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
    let newCoords = Object.keys(coords).reduce((acc, k) => ({ ...acc, [k]: Util.roundTo(coords[k], 0.254) }), {});

    //console.log(`CoordTransform [${transformStr}]`, oldCoords, ' -> ', newCoords);
    return { ...newCoords };
  };
}

export const useTrkl = (fn) => {
  const [value, setValue] = useState(fn());
  console.debug('useTrkl fn =', fn, ' value =', value);

  useEffect(() => {
    let updateValue = (v) => {
      if(v !== undefined) {
        if(v === 'yes') v = true;
        else if(v === 'no') v = false;
        console.debug('useTrkl updateValue(', v, ')');
        setValue(v);
      }
    };

    fn.subscribe(updateValue);
    return () => fn.unsubscribe(updateValue);
  });
  return [value, fn];
};

export const useAttributes = (element, attributeNames) => {
  attributeNames = attributeNames || Object.keys(element.attributes);

  let ret = {};

  for(let attr of attributeNames) ret[attr] = useTrkl(element.handlers[attr])[0];

  return ret;
};
