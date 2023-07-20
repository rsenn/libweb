import { Point, Rotation, TransformationList, Translation } from '../../geom.js';
import { mod } from '../../misc.js';
import { Fragment, h } from '../../preact.mjs';
import { Alignment, AlignmentAttrs, ExtractRotation, HORIZONTAL, log, MakeRotation, RAD2DEG, useTransformation, VERTICAL } from '../renderUtils.js';

export const Text = ({ x, y, text, color, alignment, rot, visible, className, opts = {}, style, ...props }) => {
  let transformation2 = useTransformation(props.transformation);
  let { transformation = new TransformationList() } = opts;
  log(`Text.render(1)`, { text, transformation, alignment });
  let elementTransform = ExtractRotation(transformation);

  let parentAngle = Math.round(elementTransform.angle * RAD2DEG);
  log(`Text.render`, {
    text,
    parentAngle,
    transformation2,
    x,
    y,
    alignment,
    rot
  });
  let [rotation] = MakeRotation(rot);
  let rotationAngle = rotation ? rotation.angle : 0;
  let totalAngle = mod(parentAngle + rotationAngle, 180);
  let realAngle = mod(totalAngle - parentAngle, 360);
  let diffAngle = mod(-rotationAngle + realAngle, 360);
  let ang = -(transformation?.rotation?.angle ?? 0);
  let parentMatrix = elementTransform.toMatrix();
  let vec = new Point(x, y).transform(parentMatrix.invert());
  let transform = new TransformationList()
    .concat(elementTransform.invert())
    .translate(vec.x, vec.y)
    .concat(transformation.scaling ? [transformation.find(t => t.type == 'scale')] : []);

  log(`Text.render(2)`, { text, transformation, ang, transform, alignment });

  let { scaling } = elementTransform;

  let align = Alignment(alignment, -ang, elementTransform.scaling);

  log(`Text.render(3)`, { align, elementTransform });
  log(`Text.render`, { alignment, align, scaling, elementTransform });
  align = align.round();

  if(align.y == 0) transform = transform.concat(new Translation(0, +0.11));
  text = (text + '').replace(/Ω/g, '&#x2126;').replace(/μ/g, '&#xb5;');
  log(`Text.render`, { transformation, transform, text, align });
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
        transform
      },
      h('tspan', {
        ...AlignmentAttrs(align, HORIZONTAL),
        dangerouslySetInnerHTML: { __html: text }
      })
    )
  ]);
};
