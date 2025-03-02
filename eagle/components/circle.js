import { TransformationList } from '../../geom/transformation.js';
import { roundTo } from '../../misc.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { log, MakeCoordTransformer, useTrkl } from '../renderUtils.js';

export const PinSizes = {
  long: 3,
  middle: 2,
  short: 1,
  point: 0
};

export const Circle = ({ data, opts = {}, ...props }) => {
  data = data || props.item;

  let circle =
    useValue(async function* () {
      for await(let change of data.repeater) yield change;
    }) || data;

  let { transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { width, radius, layer } = circle;
  const { x, y } = coordFn(circle);
  const color = circle && circle.getColor ? circle.getColor() : undefined;
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  log('Circle.render ', { circle, x, y, radius, width, visible });

  return h('circle', {
    class: 'circle',
    stroke: color,
    cx: x,
    cy: y,
    r: radius,
    'stroke-width': roundTo(width * 0.8, 0.0001),
    fill: 'none',
    ...(layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {}),
    style: visible ? {} : { display: 'none' }
  });
};
