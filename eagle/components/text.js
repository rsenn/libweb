import Util from '../../util.js';
import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeRotation, Alignment, AlignmentAttrs, VERTICAL, HORIZONTAL, log, RAD2DEG, DEG2RAD, useTransformation } from '../renderUtils.js';
import { TransformationList, Rotation, Translation } from '../../geom.js';
import { Cross } from './cross.js';

export const Text = ({ x, y, text, color, alignment, rot, visible, className, opts = {}, style, ...props }) => {
  let transformation2 = useTransformation(props.transformation);

  let { transformation = new TransformationList() } = opts;
  let elementTransform = transformation.slice(transformation.findIndex(item => item.type.startsWith('scal')) + 1);
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

  let rotation = MakeRotation(rot);
  let rotationAngle = Math.round(rotation.angle * RAD2DEG);
  let totalAngle = Util.mod(parentAngle + rotationAngle, 180);
  let realAngle = Util.mod(totalAngle - parentAngle, 360);
  let diffAngle = Util.mod(-rotationAngle + realAngle, 360);

  let transform = new TransformationList()
    .translate(x, y)
    .concat(transformation.scaling ? [transformation.find(t => t.type == 'scale')] : [])
    //  .concat(transformation.rotation ? [transformation.rotation.invert()] : [])
    .rotate(-realAngle % 180);

  let { scaling } = elementTransform;
  let align = Alignment(alignment, diffAngle, scaling);
  //log(`Text.render`, { text, parentAngle, rotationAngle, totalAngle, realAngle, diffAngle, transform, align });
  log(`Text.render`, { alignment, align, scaling, elementTransform });

  //align = align.rotate(diffAngle * DEG2RAD);
  align = align.round();

  //console.log('Text.render', text);

  if(align.y == 0) transform = transform.concat(new Translation(0, +0.11));

  text = (text + '').replace(/Ω/g, '&#x2126;').replace(/μ/g, '&#xb5;');
  console.log(`Text.render`, console.config({ compact: 2 }), { transformation, transform, text, align });

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
      h(
        'tspan',
        {
          ...AlignmentAttrs(align, HORIZONTAL),
          dangerouslySetInnerHTML: { __html: text }
        } /*, h(Fragment, {}, [text])*/
      )
    )
    //    h(Cross, { x, y, radius: 1.27 / 4 })
  ]);
};
