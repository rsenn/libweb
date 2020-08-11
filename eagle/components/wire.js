import { h, Component } from '../../dom/preactComponent.js';
import Util from '../../util.js';
import { MakeCoordTransformer } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';
import LogJS from '../../log.js';
import { useTrkl } from '../renderUtils.js';

export const Wire = ({ data, opts = {}, ...props }) => {
  //  data = data || props.item;
  LogJS.info('Wire.render ', { data, opts });

  let wire =
    useValue(async function*() {
      for await (let change of data.repeater) {
        console.log('change:', change);
        yield change;
      }
    }) || data;

  //Util.putStack();

  let { labelText, transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { width, curve = '', layer, x1, y1, x2, y2 } = coordFn(wire);
  const color = wire.getColor();
  let visible = layer ? useTrkl(layer.handlers['visible']) : true;

  return h('line', {
    stroke: color,
    x1,
    x2,
    y1,
    y2,
    'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
    'stroke-linecap': 'round',
    'data-curve': curve,
    'data-layer': `${layer.number} ${layer.name}`,
    transform,
    style: visible ? {} : { display: 'none' }
  });
};
