import { h, Component } from '../../dom/preactComponent.js';
import Util from '../../util.js';
import { MakeCoordTransformer, ElementToClass, useTrkl, log } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';
import { TransformationList } from '../../geom.js';

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

  //Util.putStack();

  let { labelText, transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { rot, layer, x, y, dx, dy } = coordFn(smd);
  const color = smd.getColor();
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
