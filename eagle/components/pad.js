import Util from '../../util.js';
import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeCoordTransformer, MakeRotation, Alignment, AlignmentAttrs, ElementToClass, RenderShape, useTrkl, log, VERTICAL, HORIZONTAL } from '../renderUtils.js';
import { TransformationList, Point } from '../../geom.js';
import { Palette } from '../common.js';
import { Text } from './text.js';
import { useValue } from '../../repeater/react-hooks.js';

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
  let ro = Util.roundTo(diameter / 2, 0.0001);
  let ri = Util.roundTo(drill / 2, 0.0001);
  let transform = `translate(${x},${y})`;
  let visible = 'yes' == useTrkl(layer.handlers.visible);
  let rotation = MakeRotation(rot);

  if(rot) transform = transform.concat(rotation);

  const padColor = /*layer.getColor(pad) ||*/ pad.getColor();

  let d = RenderShape(shape, ro, ri);

  const layerProps = layer
    ? { 'data-layer': `${layer.number} ${layer.name}` }
    : {};
  const pathProps = {
    d: d +
      ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
    stroke: 'none',
    fill: padColor.toRGB(),
    'fill-opacity': padColor.a / 255
  };
  if(padColor.a < 255)
    pathProps['fill-opacity'] = Util.roundTo(padColor.a / 255, 0.001);
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
    const textElem = h('text',
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
    return h('g',
      { ...baseProps, ...dataProps, ...visibleProps, ...layerProps },
      [h('path', { ...pathProps, ...visibleProps }), textElem]
    );
  }
  return h('path', {
    ...baseProps,
    ...dataProps,
    ...pathProps,
    ...visibleProps
  });
};
