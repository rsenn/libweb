import Util from '../../util.js';
import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeCoordTransformer, MakeRotation, Alignment, AlignmentAttrs, ElementToClass, useTrkl, log, VERTICAL, HORIZONTAL } from '../renderUtils.js';
import { TransformationList, Point } from '../../geom.js';
import { Palette } from '../common.js';
import { Text } from './text.js';
import { useValue } from '../../repeater/react-hooks.js';

export const Pad = ({ data, opts = {}, ...props }) => {
  let { transformation = new TransformationList() } = opts;
  log('Pad.render ', { transformation, data, opts });
  let pad =
    useValue(async function* () {
      for await (let change of data.repeater) {
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
  let d;
  let transform = `translate(${x},${y})`;
  let visible = 'yes' == useTrkl(layer.handlers.visible);
  let rotation = MakeRotation(rot);

  if(rot) transform = transform.concat(rotation);

  const padColor = /*layer.getColor(pad) ||*/ pad.getColor();

  switch (shape) {
    case 'long': {
      ro = ro * 1.2;
      const w = ro;
      d = `M 0 ${-ro} l ${w} 0 A ${ro} ${ro} 0 0 1 ${w} ${ro} l ${-w * 2} 0 A ${ro} ${ro} 0 0 1 ${-w} ${-ro}`;
      break;
    }
    case 'square': {
      d = [new Point(-1, -1), new Point(1, -1), new Point(1, 1), new Point(-1, 1)]
        .map(p => p.prod(ro))
        .map(p => p.round())
        .map((p, i) => `${i == 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
      break;
    }
    case 'octagon': {
      d = Util.range(0, 7)
        .map(i => Point.fromAngle((Math.PI * i) / 4 + Math.PI / 8, ro * 1.2))
        .map(p => p.round())
        .map((p, i) => `${i == 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
      break;
    }
    default: {
      d = `M 0 ${-ro} A ${ro} ${ro} 0 0 1 0 ${ro} A ${ro} ${ro} 0 0 1 0 ${-ro}`;
      break;
    }
  }

  const layerProps = layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {};
  const pathProps = {
    d: d + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
    stroke: 'none',
    fill: padColor.toRGB(),
    'fill-opacity': padColor.a / 255
  };
  if(padColor.a < 255) pathProps['fill-opacity'] = Util.roundTo(padColor.a / 255, 0.001);
  const baseProps = {
    class: ElementToClass(pad),
    //fill: padColor,
    transform
  };
  const dataProps = {
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
    return h('g', { ...baseProps, ...dataProps, ...visibleProps, ...layerProps }, [h('path', { ...pathProps, ...visibleProps }), textElem]);
  }
  return h('path', { ...baseProps, ...dataProps, ...pathProps, ...visibleProps });
};
