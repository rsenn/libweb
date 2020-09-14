import { h, Component } from '../../dom/preactComponent.js';
import { MakeCoordTransformer, ElementToClass } from '../renderUtils.js';
import { TransformationList } from '../../geom/transformation.js';
import { useTrkl } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';

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
      for await (let change of data.repeater) {
        //     console.log('change:', change);
        yield change;
      }
    }) || data;

  //console.log('Circle.render ', { circle, opts });
  let { transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { width, radius, layer } = circle;
  const { x, y } = coordFn(circle);
  const color = circle.getColor(); //(opts && opts.color) || (layer && this.getColor(layer.color));
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  return h('circle', {
    class: ElementToClass(circle),
    stroke: color,
    cx: x,
    cy: y,
    r: radius,
    'stroke-width': width * 0.8,
    fill: 'none',
    ...(layer ? { 'circle-layer': `${layer.number} ${layer.name}` } : {}),
    style: visible ? {} : { display: 'none' },
    'data-layer': `${layer.number} ${layer.name}`
  });
};
