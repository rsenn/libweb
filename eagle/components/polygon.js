import { h, Component } from '../../dom/preactComponent.js';
import { MakeCoordTransformer, ElementToClass, useTrkl, log } from '../renderUtils.js';
import { TransformationList, Point, PointList } from '../../geom.js';
import { useValue } from '../../repeater/react-hooks.js';

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
  const points = new PointList(polygon.children.map(v => new Point(coordFn(v)))
  );
  const color = polygon.getColor();
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  const colorProps =
    ['Top', 'Bottom'].indexOf(layer.name) != -1
      ? { stroke: color, fill: 'none' }
      : { stroke: 'none', fill: color };
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
