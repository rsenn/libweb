import { Point, PointList, TransformationList } from '../../geom.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { ElementToClass, log, MakeCoordTransformer, useTrkl } from '../renderUtils.js';

export const Polygon = ({ data, opts = {}, ...props }) => {
  data = data || props.item;

  let polygon =
    useValue(async function* () {
      for await(let change of data.repeater) {
        //     log('change:', change);
        yield change;
      }
    }) || data;

  //log('Polygon.render ', { polygon, opts });
  let { transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { width, layer } = polygon;
  const points = new PointList([...polygon.children].map(v => new Point(coordFn(v))));
  const color = polygon.getColor();
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  const colorProps =
    ['Top', 'Bottom'].indexOf(layer.name) != -1 ? { stroke: color, fill: 'none' } : { stroke: 'none', fill: color };
  return h('polygon', {
    points,
    class: ElementToClass(polygon),
    ...colorProps,

    'stroke-width': width * 0.8,
    ...(layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {}),
    style: visible ? {} : { display: 'none' },
    'data-layer': `${layer.number} ${layer.name}`
  });
};