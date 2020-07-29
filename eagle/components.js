import Util from '../util.js';
import { h, Component, useState, useEffect } from '../dom/preactComponent.js';
import { Point, Line } from '../geom.js';
import { MakeCoordTransformer } from './renderUtils.js';
/*import { Instance } from './components/instance.js';
import { SchematicSymbol } from './components/symbol.js';
*/
import { Wire } from './components/wire.js';
import { Rectangle } from './components/rectangle.js';
import { Pin } from './components/pin.js';
import { Circle } from './components/circle.js';

export const PrimitiveComponents = { Wire, Rectangle, Pin, Circle };

export const ElementNameToComponent = name => {
  let comp = PrimitiveComponents[Util.ucfirst(name)];

  if(!comp) console.warn(`No component '${name}'`);
  return comp;
};

export const ElementToComponent = element => ElementNameToComponent(element.tagName);

const PinSizes = {
  long: 3,
  middle: 2,
  short: 1,
  point: 0
};
/*
export const Pin = ({ length, rot, name, visible, x, y, function: func }) => {
  const angle = +(rot || '0').replace(/R/, '');
  let veclen = PinSizes[length] * 2.54;
  if(func == 'dot') veclen -= 1.5;
  const dir = Point.fromAngle((angle * Math.PI) / 180);
  const vec = dir.prod(veclen);
  const pivot = new Point(+x, +y);
  const pp = dir.prod(veclen + 0.75).add(pivot);
  const l = new Line(pivot, vec.add(pivot));
  let ret = [];

  if(func == 'dot') {
    ret.push(
      h(
        'circle',
        {
          class: 'pin',
          stroke: '#a54b4b',
          fill: 'none',
          cx: pp.x,
          cy: pp.y,
          r: 0.75,
          'stroke-width': 0.3
        },
        parent
      )
    );
  }
  ret.push(
    h(
      'line',
      {
        class: 'pin',
        stroke: '#a54b4b',
        ...l.toObject(),
        'stroke-width': 0.15
      },
      parent
    )
  );
  if(name != '' && visible != 'off')
    ret.push(
      h(
        'text',
        {
          class: 'pin',
          stroke: 'none',
          fill: this.getColor(6),
          x: vec.x + 2.54,
          y: vec.y + 0,
          'font-size': 2,
          //    'font-family': 'Fixed Medium',
          'text-anchor': 'left',
          'alignment-baseline': 'central',
          children: name
          //transform: `translate(${vec.x},${vec.y}) scale(1,-1) rotate(${-angle})`
        },
        parent
      )
    );

  return ret;
};*/
/*
export const Wire = props => {
  const [item, setItem] = useState(props.item);
  const [transform, setTransform] = useState(props.transform);
  let coordFn = props.transform ? MakeCoordTransformer(props.transform) : i => i;
  const { width, curve = '', layer, x1, y1, x2, y2 } = coordFn(props.item);
  const color = layer && layer.color;
  useEffect(() => {
    let handler = props.item.subscribe((name, value) => setItem({ ...item, [name]: value }));
    return () => props.item.unsubscribe(handler);
  });
  return h(
    'line',
    {
      stroke: color,
      x1,
      x2,
      y1,
      y2,
      'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
      'data-curve': curve,
      'data-layer': layer.name,
      transform
    },
    []
  );
};*/

export default { Pin, Wire };
