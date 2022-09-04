import { h, Component } from '../../dom/preactComponent.js';
import Util from '../../util.js';
import { MakeCoordTransformer, ElementToClass, useTrkl, log } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';
import { TransformationList } from '../../geom.js';
import { Arc } from './arc.js';

const RoundToMil = n => Math.round(n * 1000) / 1000;

export const Wire = ({ data, opts = {}, ...props }) => {
  //
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

  let { width, curve = '', x1, y1, x2, y2 } = coordFn(wire);
  let layerId = isNaN(+wire.attributes.layer) ? wire.attributes.layer : +wire.attributes.layer;
  let layer = wire.document.getLayer(layerId) ?? wire.layer;

  log('Wire.render ', { layerId, wire });
  const color = wire.getColor();
  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);
 

  let props = {
    class: ElementToClass(wire, layer.name),
    stroke: color,
    'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
    'stroke-linecap': 'round',
    ...(curve ? { 'data-curve': curve } : {}),
    'data-layer': `${layer.number} ${layer.name}`,
    transform,
    style: visible ? {} : { display: 'none' }
  };

  if(!isNaN(+curve) && Math.abs(+curve) > 0) {
    curve = +curve;
    let xdiff = x2 - x1,
      ydiff = y2 - y1;

    //console.log('Wire', { xdiff, ydiff, curve });
    let c = Math.sqrt(xdiff ** 2 + ydiff ** 2);
    let r = (c / 1.4142135623730951).toFixed(3);
    let l = 0;
    let s = Math.sign(curve) == -1 ? '0' : '1';
    return h('path', {
      d: `M ${x1} ${y1} a ${r} ${r} 0 ${l} ${s} ${RoundToMil(xdiff)} ${RoundToMil(ydiff)}`,
      fill: 'none',
      ...props
    });
  }

  return h('line', {
    x1,
    x2,
    y1,
    y2,
    ...props
  });
};
