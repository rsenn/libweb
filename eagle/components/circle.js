import { h, Component } from '../../preact.mjs';
import { MakeCoordTransformer, ElementToClass, useTrkl, log } from '../renderUtils.js';
import { TransformationList } from '../../geom/transformation.js';
import { useValue } from '../../repeater/react-hooks.js';
import { roundTo } from '../../misc.js';

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
      for await(let change of data.repeater) {
        log('Circle.change:', change);
        yield change;
      }
    }) || data;

  let { transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { width, radius, layer } = circle;
  const { x, y } = coordFn(circle);
  const color = circle.getColor(); //(opts && opts.color) || (layer && this.getColor(layer.color));
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);
  console.log('Circle.render ', { circle, x,y,radius, width, visible });

  return h('circle', {
    class: ElementToClass(circle),
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
