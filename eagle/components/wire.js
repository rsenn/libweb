import { h, Component } from '../../dom/preactComponent.js';
import Util from '../../util.js';
import { MakeCoordTransformer } from '../renderUtils.js';

export const Wire = ({ data, opts = {}, ...props }) => {
  data = data || props.item;

  //console.log('Wire.render ', { data, opts });

  //Util.putStack();

  let { labelText, transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { width, curve = '', layer, x1, y1, x2, y2 } = coordFn(data);
  const color = layer && layer.color;

  return h('line', {
    stroke: color,
    x1,
    x2,
    y1,
    y2,
    'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
    'stroke-linecap': 'round',
    'data-curve': curve,
    'data-layer': layer.name,
    transform
  });
};
