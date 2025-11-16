import { TransformationList } from '../../geom/transformation.js';
import { h } from '../../preact.js';
import { useValue } from '../../repeater/react-hooks.js';
import { ElementToClass, log, MakeCoordTransformer, useTrkl } from '../renderUtils.js';

export const SMD = ({ data, opts = {}, ...props }) => {
  log('SMD.render ', { data, opts });

  let smd =
    useValue(async function* () {
      // log('data.repeater:', data.repeater);
      for await(let change of data.repeater) {
        // log('change:', change);
        yield change;
      }
    }) || data;

  let { labelText, transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { rot, x, y, dx, dy } = coordFn(smd);
  const layer = smd.getLayer();
  const color = smd && smd.getColor ? smd.getColor() : undefined;
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  return h('rect', {
    class: ElementToClass(smd, layer.name),
    fill: color,
    x: x - dx / 2,
    y: y - dy / 2,
    width: dx,
    height: dy,
    'data-layer': `${layer.number} ${layer.name}`,
    transform,
    style: visible ? {} : { display: 'none' }
  });
};
