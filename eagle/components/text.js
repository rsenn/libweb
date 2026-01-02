import { Point } from '../../geom.js';
import { Scaling } from '../../geom.js';
import { TransformationList } from '../../geom.js';
import { Translation } from '../../geom.js';
import { mod } from '../../misc.js';
import { Fragment } from '../../preact.js';
import { h } from '../../preact.js';
import { Alignment } from '../renderUtils.js';
import { AlignmentAttrs } from '../renderUtils.js';
import { ExtractRotation } from '../renderUtils.js';
import { HORIZONTAL } from '../renderUtils.js';
import { log } from '../renderUtils.js';
import { MakeRotation } from '../renderUtils.js';
import { RAD2DEG } from '../renderUtils.js';
import { useTransformation } from '../renderUtils.js';
import { VERTICAL } from '../renderUtils.js';

export const Text = ({ x, y, text, color, alignment, rot, visible, className, opts = {}, style, data, ...props }) => {
  const transformation2 = useTransformation(props.transformation);
  const { transformation = new TransformationList() } = opts;

  log(`Text.render(1)`, { x, y, text, color, alignment, rot, visible, className, opts, style, data });

  const elementTransform = ExtractRotation(transformation);
  const parentAngle = Math.round(elementTransform.angle * RAD2DEG);

  log(`Text.render(2)`, { transformation, elementTransform, parentAngle });

  const [rotation] = MakeRotation(rot);
  const rotationAngle = rotation ? rotation.angle : 0;
  const totalAngle = mod(parentAngle + rotationAngle, 180);
  const realAngle = mod(totalAngle - parentAngle, 360),
    diffAngle = mod(-rotationAngle + realAngle, 360),
    ang = -(transformation?.rotation?.angle ?? 0),
    parentMatrix = elementTransform.toMatrix(),
    vec = new Point(x, y).transform(parentMatrix.invert());

  let transform = new TransformationList()
    .concat(elementTransform.invert())
    .translate(vec.x, vec.y)
    .concat(transformation.scaling ? [transformation.find(t => t.type == 'scale')] : [new Scaling(1, -1)]);

  log(`Text.render(3)`, { ang, vec, transform });

  const { scaling } = elementTransform;

  let align = Alignment(alignment, -ang, elementTransform.scaling);

  align = align.round();

  log(`Text.render(4)`, { scaling, align });

  if(align.y == 0) transform = transform.concat(new Translation(0, +0.11));
  text = (text + '').replace(/Ω/g, '&#x2126;').replace(/μ/g, '&#xb5;');

  visible = true;

  return h(Fragment, {}, [
    h(
      'text',
      {
        className,
        fill: color,
        stroke: 'none',
        'stroke-width': 0.05,
        style: visible ? { ...style } : { ...style, display: 'none' },
        ...AlignmentAttrs(align, VERTICAL),
        ...props,
        transform,
      },
      h('tspan', {
        ...AlignmentAttrs(align, HORIZONTAL),
        dangerouslySetInnerHTML: { __html: text },
      }),
    ),
  ]);
};