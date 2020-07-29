import { h, Component } from '../../dom/preactComponent.js';
import { MakeCoordTransformer } from '../renderUtils.js';
import { TransformationList } from '../../geom/transformation.js';

export const PinSizes = {
  long: 3,
  middle: 2,
  short: 1,
  point: 0
};

export const Circle = ({ data, opts = {}, ...props }) => {
  data = data || props.item;

  console.log('Circle.render ', { data, opts });
  let { transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { width, radius, layer } = data;
  const { x, y } = coordFn(data);
  const color = layer && layer.color; //(opts && opts.color) || (layer && this.getColor(layer.color));

  return h('circle', {
    stroke: color,
    cx: x,
    cy: y,
    r: radius,
    'stroke-width': width * 0.8,
    fill: 'none'
  });
};
