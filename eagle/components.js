import { h, Component } from '../modules/htm/preact/standalone.mjs';
import { Point, Line } from '../geom.js';

const PinSizes = {
  long: 3,
  middle: 2,
  short: 1,
  point: 0
};

const Pin = ({ length, rot, name, visible, x, y, function: func }) => {
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
          'font-family': 'Fixed',
          'text-anchor': 'left',
          'alignment-baseline': 'central',
          children: name
          //transform: `translate(${vec.x},${vec.y}) scale(1,-1) rotate(${-angle})`
        },
        parent
      )
    );

  return ret;
};
