import { Rect } from '../../geom/rect.js';
import { TransformationList } from '../../geom/transformation.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { ElementToClass, log, MakeCoordTransformer, MakeRotation, useTrkl } from '../renderUtils.js';

export const Rectangle = ({ data, opts = {}, ...props }) => {
  let rectangle =
    useValue(async function* () {
      for await(let change of data.repeater) {
        log('Rectangle.change:', change);
        yield change;
      }
    }) || data;

  log('Rectangle.render ', { rectangle, opts });
  let { transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { x1, x2, y1, y2 } = coordFn(rectangle);
  const { layer } = rectangle;
  const color = rectangle && rectangle.getColor ? rectangle.getColor() : undefined;
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  let rect = Rect.from({ x1, x2, y1, y2 });
  let rot = MakeRotation(rectangle.rot);
  let center = rect.center;
  //log('Rectangle.render ', { layer, color, rect, visible, rot, center  });

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
