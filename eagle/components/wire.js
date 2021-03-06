import { h, Component } from '../../dom/preactComponent.js';
import Util from '../../util.js';
import { MakeCoordTransformer, ElementToClass, useTrkl, log } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';
import { TransformationList } from '../../geom.js';

export const Wire = ({ data, opts = {}, ...props }) => {
  //log('Wire.render ', { data, opts });

  let wire =
    useValue(async function* () {
      // log('data.repeater:', data.repeater);
      for await(let change of data.repeater) {
        // log('change:', change);
        yield change;
      }
    }) || data;

  //Util.putStack();

  let { labelText, transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { width, curve = '', layer, x1, y1, x2, y2 } = coordFn(wire);
  const color = wire.getColor();
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  return h('line', {
    class: ElementToClass(wire, layer.name),
    stroke: color,
    x1,
    x2,
    y1,
    y2,
    'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
    'stroke-linecap': 'round',
    ...(curve ? { 'data-curve': curve } : {}),
    'data-layer': `${layer.number} ${layer.name}`,
    transform,
    style: visible ? {} : { display: 'none' }
  });
};
