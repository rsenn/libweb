import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeRotation, Alignment, VERTICAL, HORIZONTAL, log, RAD2DEG, DEG2RAD } from '../renderUtils.js';
import { TransformationList, Rotation, Translation } from '../../geom.js';
import { Cross } from './cross.js';

export const Text = ({ x, y, text, color, alignment, rot, visible, className, opts = {}, style, ...props }) => {
  let { transformation = new TransformationList() } = opts;
  let parentAngle = Math.round(transformation.slice(transformation.indexOf(transformation.scaling) + 1).angle * RAD2DEG
  );
  log(`Text.render`, { text, parentAngle, transformation, x, y, alignment, rot });

  let rotation = MakeRotation(rot);
  let rotationAngle = Math.round(rotation.angle * RAD2DEG);
  let totalAngle = Util.mod(parentAngle + rotationAngle, 180);
  let realAngle = Util.mod(totalAngle - parentAngle, 360);
  let diffAngle = Util.mod(-rotationAngle + realAngle, 360);

  let transform = new TransformationList()
    .translate(x, y)
    .concat(transformation.scaling ? [transformation.scaling] : [])
    //  .concat(transformation.rotation ? [transformation.rotation.invert()] : [])
    .rotate(-realAngle);

  let align = Alignment(alignment);
  log(`Text.render`, { text, parentAngle, rotationAngle, totalAngle, realAngle, diffAngle, transform, align });

  align = align.rotate(diffAngle * DEG2RAD).round();

  log('Text.render', align);

  if(align.y == 0) transform = transform.concat(new Translation(0, +0.11));

  return h(Fragment, {}, [
    h('text', {
        className,
        fill: color,
        stroke: 'none',
        'stroke-width': 0.05,
        style: visible ? { ...style } : { ...style, display: 'none' },
        ...AlignmentAttrs(align, VERTICAL),
        ...props,
        transform
      },
      h('tspan', { ...AlignmentAttrs(align, HORIZONTAL), children: text })
    )
    //    h(Cross, { x, y, radius: 1.27 / 4 })
  ]);
};
