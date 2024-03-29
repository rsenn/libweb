import { ArcTo, TransformationList } from '../../geom.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { ElementToClass, log, MakeCoordTransformer, useTrkl } from '../renderUtils.js';

const RoundToMil = n => Math.round(n * 1000) / 1000;

export const Wire = ({ data, opts = {}, color, ...props }) => {
  let wire =
    useValue(async function* () {
      for await(let change of data.repeater) {
        yield change;
      }
    }) || data;
  let { labelText, transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;
  let { width, curve = '', x1, y1, x2, y2 } = coordFn(wire);
  let layerId = isNaN(+wire.attributes.layer) ? wire.attributes.layer : +wire.attributes.layer;
  let layer = wire.document.getLayer(layerId) ?? wire.layer;

  log('Wire.render ', { layerId, wire });

  color ??= wire && wire.getColor ? wire.getColor() : undefined;

  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  const extraStyle = {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  };

  let extraProps = {
    class: ElementToClass(wire, layer.name),
    stroke: color,
    'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
    ...(curve ? { 'data-curve': curve } : {}),
    'data-layer': `${layer.number} ${layer.name}`,
    style: visible ? { ...extraStyle } : { ...extraStyle, display: 'none' },
    ...props
  };

  if(transform.length > 0) extraProps.transform = transform;

  let d = `M ${x1} ${y1} L ${x2} ${y2}`;

  if(!isNaN(+curve) && Math.abs(+curve) > 0) {
    let xdiff = x2 - x1,
      ydiff = y2 - y1;
    d = `M ${x1} ${y1} `;

    d += ArcTo(RoundToMil(xdiff), RoundToMil(ydiff), -curve);
  }

  return h('path', {
    d,
    fill: 'none',
    ...extraProps
  });
};
