import { h, Component } from '../../dom/preactComponent.js';
import { Rect } from '../../geom.js';
import { Rotation, MakeCoordTransformer } from '../renderUtils.js';
import { TransformationList } from '../../geom/transformation.js';
import { useTrkl } from '../renderUtils.js';

export const Rectangle = ({ data, opts = {}, ...props }) => {
  data = data || props.item;

  //console.log('Rectangle.render ', { data, opts });
  let { transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { layer, x1, x2, y1, y2 } = coordFn(data);
  const color = data.getColor();
  let visible = layer ? useTrkl(layer.handlers['visible']) : true;

  let rect = Rect.from({ x1, x2, y1, y2 });
  let rot = Rotation(data.rot);
  let center = rect.center;

  //console.log('rect:', rect);
  //console.log('rot:', rot);
  return h('rect', {
    stroke: 'none',
    fill: color,
    style: visible ? {} : { display: 'none' },
    ...rect.toObject(),
    ...(layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {}),
    transform: `translate(${center}) ${rot} translate(${center.prod(-1)})`
  });
};
