import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeCoordTransformer, AlignmentAttrs, ElementToClass, useTrkl, log } from '../renderUtils.js';
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
  const ro = Util.roundTo(diameter / 2, 0.0001);
  const ri = Util.roundTo(drill / 2, 0.0001);
  let d;
  let transform = `translate(${x},${y})`;
  let visible = 'yes' == useTrkl(layer.handlers.visible);

  const padColor = layer.getColor(pad) || pad.getColor();

  switch (shape) {
    case 'long': {
      const w = ro * 0.75;
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
        .map(i => Point.fromAngle((Math.PI * i) / 4 + Math.PI / 8, ro * 1.4))
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
    fill: layer.color
  };
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
        transform: RotateTransformation(opts.rot, -1) + ' ' + transformation.invert().scaling
      },
      /* prettier-ignore */ h('tspan', { ...AlignmentAttrs(alignment, HORIZONTAL) }, name)
    );
    return h('g', { ...baseProps, ...dataProps, ...visibleProps, ...layerProps }, [
      h('path', { ...pathProps, ...visibleProps }),
      textElem
    ]);
  }
  return h('path', { ...baseProps, ...dataProps, ...pathProps, ...visibleProps });
};
