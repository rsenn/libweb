import { TransformationList } from '../../geom/transformation.js';
import { h } from '../../preact.js';
import { ElementToClass } from '../renderUtils.js';
import { log } from '../renderUtils.js';
import { MakeCoordTransformer } from '../renderUtils.js';
import { useTrkl } from '../renderUtils.js';

export const SMD = ({ data, opts = {}, ...props }) => {
  log('SMD.render ', { data, opts });

  let smd = data;

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
    ...(String(transform) ? { transform } : {}),
    style: visible ? {} : { display: 'none' },
  });
};