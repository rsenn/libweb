import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeCoordTransformer, AlignmentAttrs } from '../renderUtils.js';
import { TransformationList } from '../../geom/transformation.js';
import { Palette } from '../common.js';
import { Text } from './text.js';
import { useValue } from '../../repeater/react-hooks.js';
import { useTrkl } from '../renderUtils.js';

export const Pad = ({ data, opts = {}, ...props }) => {
  let pad =
    useValue(async function* () {
      for await (let change of data.repeater) {
        //     console.log('change:', change);
        yield change;
      }
    }) || data;

  let coordFn = opts.transform ? MakeCoordTransformer(opts.transform) : (i) => i;

  const { name, drill, diameter, shape, layer } = pad;
  const { x, y } = coordFn(pad);

  const ro = +((diameter || 1.5) / 2.54).toFixed(3);
  const ri = +(drill / 3).toFixed(3);

  let d;
  const transform = `translate(${x},${y})`;
  let [visible] = layer ? useTrkl(layer.handlers.visible) : [true];
  console.log('pad layer=', layer.name, visible);
  const padColor = pad.getColor();

  switch (shape) {
    case 'long': {
      const w = ro * 0.75;
      d = `M 0 ${-ro} l ${w} 0 A ${ro} ${ro} 0 0 1 ${w} ${ro} l ${-w * 2} 0 A ${ro} ${ro} 0 0 1 ${-w} ${-ro}`;
      break;
    }
    case 'square': {
      const points = [new Point(-1, -1), new Point(1, -1), new Point(1, 1), new Point(-1, 1)].map((p) => p.prod(ro * 1.27));

      d = points
        .map((p) => p.round())
        .map((p, i) => `${i == 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

      break;
    }
    case 'octagon': {
      const points = Util.range(0, 7).map((i) => Point.fromAngle((Math.PI * i) / 4 + Math.PI / 8, ro * 1.4));

      d = points
        .map((p) => p.round())
        .map((p, i) => `${i == 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
      break;
    }
    default: {
      d = `M 0 ${-ro} A ${ro} ${ro} 0 0 1 0 ${ro} A ${ro} ${ro} 0 0 1 0 ${-ro}`;
      break;
    }
  }
  const pathProps = {
    fill: padColor,
    d: d + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
    ...(layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {}),
    transform
  };
  const visibleProps = { style: visible ? {} : { display: 'none' } };

  const textElem = name
    ? h('text',
        {
          fill: 'hsla(180,100%,60%,0.5)',
          stroke: 'none',

          x: 0.04,
          y: -0.04,
          ...(layer ? { 'd-layer': `${layer.number} ${layer.name}` } : {}),
          ...AlignmentAttrs('center', VERTICAL),
          'font-size': 0.6,
          'font-style': 'bold',
          transform: `${transform} ${RotateTransformation(opts.rot, -1)} scale(1,-1)`
        },
        /* prettier-ignore */ h('tspan', { ...AlignmentAttrs('center', HORIZONTAL) }, name)
      )
    : null;

  return textElem ? h('g', { class: 'pad', ...visibleProps }, [h('path', pathProps), textElem]) : h('path', { class: 'pad', ...pathProps, ...visibleProps });
};
