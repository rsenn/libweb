import { ArcTo, TransformationList } from '../../geom.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { ElementToClass, log, MakeCoordTransformer, useTrkl } from '../renderUtils.js';
import { Pointer } from '../../pointer.js';

const RoundToMil = n => Math.round(n * 1000) / 1000;

export const Wire = ({ data, opts = {}, color, ...props }) => {
  const wire =
    useValue(async function* () {
      for await(const change of data.repeater) yield change;
    }) || data;

  const { transform = new TransformationList() } = opts;
  const { width, curve = '', x1, y1, x2, y2 } = (transform ? MakeCoordTransformer(transform) : i => i)(wire);
  const { layer } = wire;

  color ??= wire.layer.color;

  const visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  log('Wire.render ', { x1, y1, x2, y2, width, curve, color, visible });

  const extraStyle = {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };

  return h('path', {
    d: !isNaN(+curve) && Math.abs(+curve) > 0 ? `M ${x1} ${y1} ` + ArcTo(RoundToMil(x2 - x1), RoundToMil(y2 - y1), -curve, a => +a.toFixed(5)) : `M ${x1} ${y1} L ${x2} ${y2}`,
    fill: 'none',
    class: ElementToClass(wire, layer.name),
    stroke: color,
    'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
    ...(curve ? { 'data-curve': curve } : {}),
    'data-layer': `${layer.number} ${layer.name}`,
    'data-path': data.path.join(' '),
    style: visible ? { ...extraStyle } : { ...extraStyle, display: 'none' },
    transform,
    ...props,
  });
};
