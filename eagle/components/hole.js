import { TransformationList } from '../../geom.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { ElementToClass } from '../renderUtils.js';
import { log } from '../renderUtils.js';
import { MakeCoordTransformer } from '../renderUtils.js';
import { useTrkl } from '../renderUtils.js';

export const Hole = ({ data, opts = {}, ...props }) => {
  let { transformation = new TransformationList() } = opts;
  log('Hole.render ', { transformation, data, opts });
  let hole =
    useValue(async function* () {
      for await(let change of data.repeater) {
        //  log('Hole.render:', change);
        yield change;
      }
    }) || data;

  let coordFn = opts.transform ? MakeCoordTransformer(opts.transform) : i => i;
  const { drill, layer } = hole;
  const { x, y } = coordFn(hole);

  let transform = `translate(${x},${y})`;
  let visible = 'yes' == useTrkl(layer.handlers.visible);

  const holeColor = layer.getColor(hole) || hole.getColor();

  const layerProps = layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {};

  const baseProps = {
    class: ElementToClass(hole),
    cx: x,
    cy: y,
    r: drill / 2,

    stroke: layer.color,
    'stroke-width': 0.05,
    fill: 'none'
  };
  const dataProps = {
    'data-drill': hole.drill
  };
  const visibleProps = visible ? {} : { style: { display: 'none' } };

  return h('circle', {
    ...baseProps,
    ...dataProps,
    ...visibleProps,
    ...layerProps
  });
};