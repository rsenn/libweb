import { TransformationList } from '../../geom.js';
import { roundTo } from '../../misc.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { Alignment, AlignmentAttrs, HORIZONTAL, log, MakeCoordTransformer, MakeRotation, RenderShape, useTrkl, VERTICAL } from '../renderUtils.js';

export const Pad = ({ data, opts = {}, ...props }) => {
  let { transformation = new TransformationList() } = opts;
  log('Pad.render ', { transformation, data, opts });
  let pad =
    useValue(async function* () {
      for await(let change of data.repeater) {
        //  log('Pad.render:', change);
        yield change;
      }
    }) || data;

  let coordFn = opts.transform ? MakeCoordTransformer(opts.transform) : i => i;
  const { name, drill, radius, shape, layer, rot } = pad;
  const { x, y } = coordFn(pad);
  const diameter = radius * 2;
  let ro = roundTo(diameter / 2, 0.0001);
  let ri = roundTo(drill / 2, 0.0001);
  let transform = `translate(${x},${y})`;
  let visible = 'yes' == useTrkl(layer.handlers.visible);
  let rotation = MakeRotation(rot);

  if(rot) transform = transform.concat(rotation);

  const padColor = pad && pad.getColor ? pad.getColor() : undefined;

  let d = RenderShape(shape, ro, ri);

  const layerProps = layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {};
  const pathProps = {
    d: d + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
    stroke: 'none',
    fill: padColor.toRGB(),
    'fill-opacity': padColor.a / 255
  };
  if(padColor.a < 255) pathProps['fill-opacity'] = roundTo(padColor.a / 255, 0.001);
  const baseProps = {
    //class: ElementToClass(pad),
    //fill: padColor,
    transform
  };
  const dataProps = {
    'data-type': pad.tagName,
    'data-name': pad.name,
    'data-shape': pad.shape,
    'data-drill': pad.drill,
    'data-diameter': pad.diameter,
    'data-rot': pad.rot,
    'data-layer': `${layer.number} ${layer.name}`
  };
  const visibleProps = visible ? {} : { style: { display: 'none' } };
  const alignment = Alignment('center');
  if(name) {
    let t = transformation.concat(rotation).invert().scale(1, -1);
    log('Pad.render(2)', { t });
    const textElem = h(
      'text',
      {
        x: 0.04,
        y: 0.04,
        fill: '#f0f',
        'font-size': '0.8px',
        ...AlignmentAttrs(alignment, VERTICAL),
        style: { display: 'none' },
        transform: t.scaling
      },
      /* prettier-ignore */ h('tspan', { ...AlignmentAttrs(alignment, HORIZONTAL) }, name)
    );
    return h('g', { ...baseProps, ...dataProps, ...visibleProps, ...layerProps }, [h('path', { ...pathProps, ...visibleProps }), textElem]);
  }
  return h('path', {
    ...baseProps,
    ...dataProps,
    ...pathProps,
    ...visibleProps
  });
};
