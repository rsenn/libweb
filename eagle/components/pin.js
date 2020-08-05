import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeCoordTransformer, Rotation } from '../renderUtils.js';
import { TransformationList } from '../../geom/transformation.js';
import { Palette } from '../common.js';
import { Text } from './text.js';

export const PinSizes = {
  long: 3,
  middle: 2,
  short: 1,
  point: 0
};

export const Pin = ({ data, opts = {}, ...props }) => {
  data = data || props.item;

  //console.log('Pin.render ', { data, opts });
  let { transform = new TransformationList() } = opts;

  let { transformation } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { length, rot, name, visible } = data;
  const { x, y } = coordFn(data);
  const func = data.function;

  const angle = +(rot || '0').replace(/R/, '');
  let veclen = PinSizes[length] * 2.54;
  if(func == 'dot') veclen -= 1.5;
  const dir = Point.fromAngle((angle * Math.PI) / 180);
  const vec = dir.prod(veclen);
  const pivot = new Point(+x, +y);
  const pp = dir.prod(veclen + 0.75).add(pivot);
  const l = new Line(pivot, vec.add(pivot));
  let children = [];
  const tp = pivot.diff(dir.prod(2.54));

  if(func == 'dot')
    children.push(
      h('circle', {
        class: 'pin',
        stroke: '#a54b4b',
        fill: 'none',
        cx: pp.x,
        cy: pp.y,
        r: 0.75,
        'stroke-width': 0.3
      })
    );

  children.push(
    h('line', {
      class: 'pin',
      stroke: '#a54b4b',
      ...l.toObject(),
      'stroke-width': 0.15
    })
  );
  if(name != '' && visible != 'off')
    children.push(
      h(Text, {
        class: 'pin',
        color: Palette.schematic((r, g, b) => new RGBA(r, g, b))[16],
        x: tp.x,
        y: tp.y,

        text: name,
        alignment: new Point(-1, 0),
        transformation,
        rot,
        'data-rot': rot
        //transform: `translate(${vec.x},${vec.y}) scale(1,-1) rotate(${-angle})`
      })
    );

  return h(Fragment, {}, children);
};
