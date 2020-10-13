import { h, Component } from '../../dom/preactComponent.js';
import { Rect } from '../../geom.js';
import { Rotation, MakeCoordTransformer, ElementToClass } from '../renderUtils.js';
import { TransformationList } from '../../geom/transformation.js';
import { useTrkl } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';

export const Rectangle = ({ data, opts = {}, ...props }) => {
  let rectangle =
    useValue(async function* () {
      for await (let change of data.repeater) {
        console.log('Rectangle.change:', change);
        yield change;
      }
    }) || data;

  console.log('Rectangle.render ', { rectangle, opts });
  let { transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { x1, x2, y1, y2 } = coordFn(rectangle);
  const { layer } = rectangle;
  const color = rectangle.getColor();
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  let rect = Rect.from({ x1, x2, y1, y2 });
  let rot = Rotation(rectangle.rot);
  let center = rect.center;
  //console.log('Rectangle.render ', { layer, color, rect, visible, rot, center  });

  return h('rect', {
    class: ElementToClass(rectangle),

    stroke: 'none',
    fill: color,
    style: visible ? {} : { display: 'none' },
    ...rect.toObject(),
    transform: `translate(${center}) ${rot} translate(${center.prod(-1)})`,
    ...(layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {})
  });
};
