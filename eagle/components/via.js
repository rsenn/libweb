import { TransformationList } from '../../geom/transformation.js';
import { roundTo } from '../../misc.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { Alignment, AlignmentAttrs, ElementToClass, HORIZONTAL, log, MakeCoordTransformer, RenderShape, useTrkl, VERTICAL } from '../renderUtils.js';

export const Via = ({ data, opts = {}, ...props }) => {
  let { transformation = new TransformationList() } = opts;
  log('Via.render ', { transformation, data, opts });
  let via =
    useValue(async function* () {
      for await(let change of data.repeater) {
        //  log('Via.render:', change);
        yield change;
      }
    }) || data;

  let coordFn = opts.transform ? MakeCoordTransformer(opts.transform) : i => i;
  let { name, drill, diameter, shape } = via;
  const layer = via.document.layers.Vias;

  if(diameter === 'auto') diameter = drill * 2;

  const { x, y } = coordFn(via);
  let ro = roundTo(diameter / 2, 0.0001);
  let ri = roundTo(drill / 2, 0.0001);
  let transform = `translate(${x},${y})`;
  let visible = 'yes' == useTrkl(layer.handlers.visible);

  log('Via.render ', { drill, diameter, x, y, ro, ri, transform, visible });

  const viaColor = /*layer.getColor(via) ||*/ via.getColor();
  let d = RenderShape(shape, ro, ri);

  const layerProps = layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {};
  const pathProps = {
    d: d + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
    stroke: 'none',
    fill: viaColor.toRGB(),
    'fill-opacity': viaColor.a / 255
  };
  if(viaColor.a < 255) pathProps['fill-opacity'] = roundTo(viaColor.a / 255, 0.001);
  const baseProps = {
    //  class: ElementToClass(via),
    //fill: viaColor,
    transform
  };
  const dataProps = {
    'data-type': via.tagName,
    'data-shape': via.shape,
    'data-drill': via.drill,
    'data-diameter': via.diameter,
    'data-layer': `${layer.number} ${layer.name}`
  };
  const visibleProps = visible ? {} : { style: { display: 'none' } };
  const alignment = Alignment('center');
  if(name) {
    const textElem = h(
      'text',
      {
        x: 0.04,
        y: 0.04,
        fill: '#f0f',
        'font-size': '0.8px',
        ...AlignmentAttrs(alignment, VERTICAL),
        transform: transformation.concat(rotation).invert().scaling
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