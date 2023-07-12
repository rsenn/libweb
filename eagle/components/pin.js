import { RGBA } from '../../color/rgba.js';
import { Line, Point, Rotation, TransformationList } from '../../geom.js';
import { Fragment, h } from '../../preact.mjs';
import { Palette } from '../common.js';
import { Alignment, AlignmentAttrs, ElementToClass, HORIZONTAL, log, MakeCoordTransformer, MakeRotation, PinSizes, VERTICAL } from '../renderUtils.js';
import { Text } from './text.js';

export const Pin = ({ data, opts = {}, ...props }) => {
  data = data || props.item;

  log('Pin.render(0)', { data, opts });

  let { transform = new TransformationList() } = opts;
  let { transformation } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { length, rot, name, visible } = data;
  const { x, y } = coordFn(data);
  const func = data.function;

  let [rotation] = MakeRotation(rot);
  log(`Pin.render(${name})`, { rotation });
  let angle = rotation ? Math.round(rotation.angle) : 0;

  //  const angle = +(rot || '0').replace(/R/, '');
  let veclen = PinSizes[length] * 2.54;
  if(func == 'dot') veclen -= 1.5;
  const dir = Point.fromAngle((angle * Math.PI) / 180);
  const vec = dir.prod(veclen);
  const pivot = new Point(+x, +y);
  const pp = dir.prod(veclen + 0.75).add(pivot);
  const l = new Line(pivot, vec.add(pivot));
  let children = [];
  const tp = pivot.diff(dir.prod(-2.54 * 2));

  if(func == 'dot' && length != 'point') {
    children.push(
      h('circle', {
        class: 'pin',
        stroke: '#a54b4b',
        fill: 'none',
        cx: pp.x,
        cy: pp.y,
        r: 0.75,
        'stroke-width': 0.3
      })
    );
    log('Pin.render(2)', { pp });
  }

  if(l.getLength()) {
    children.push(
      h('line', {
        class: 'pin',
        stroke: '#a54b4b',
        ...l.toObject(),
        'stroke-width': 0.15
      })
    );
    log('Pin.render(3)', { l });
  }
  if(name != '' && visible != 'off') {
    const align = Alignment(angle >= 180 ? 'center-right' : 'center-left', 0);
    //  const rotation=MakeRotation(rot);
    log(`Pin.render(${name})`, { align, angle, rotation });
    /* children.push(
      h(Text, {
        class: ElementToClass(data),
        color: Palette.schematic((r, g, b) => new RGBA(r, g, b))[16],
        x: tp.x,
        y: tp.y,

        text: name,
        alignment: new Point(-1, 0),
        opts: { transformation },
        rot,
        'data-rot': rot,
        'font-size': '1.905px'
      })
    );*/

    children.push(
      h(
        'text',
        {
          class: ElementToClass(data),
          fill: Palette.schematic((r, g, b) => new RGBA(r, g, b))[16],
          stroke: 'none',
          x: 0,
          y: 0,

          //style: visible ? { ...style } : { ...style, display: 'none' },
          ...AlignmentAttrs(align, VERTICAL),
          ...props,
          style: { 'font-size': '1.905px' },
          transform: new TransformationList() /*transformation.invert()*/
            .translate(tp.x, tp.y)
            .rotate(angle % 180)
            .concat(transformation.invert())
        },
        h(
          'tspan',
          {
            ...AlignmentAttrs(align, HORIZONTAL),
            dangerouslySetInnerHTML: { __html: name }
          } /*, h(Fragment, {}, [text])*/
        )
      )
    );
    /*children.push(
      h('circle', {
        class: 'pin-x',
        stroke: '#ff00ff',
        fill: 'none',
        cx: tp.x,
        cy: tp.y,
        r: 0.5,
        'stroke-width': 0.1
      })
    );
    children.push(
      h('circle', {
        class: 'pin-y',
        stroke: '#4219ff',
        opacity: 0.8,
        fill: 'none',
        cx: x,
        cy: y,
        r: 0.75,
        'stroke-width': 0.1
      })
    );*/

    log('Pin.render(5)', { name, tp, transformation, rot });
  }

  return h('g', { 'data-type': 'pin', 'data-name': name }, children);
  return h(Fragment, {}, children);
};