import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeRotation, Alignment, VERTICAL, HORIZONTAL, log, RAD2DEG, DEG2RAD } from '../renderUtils.js';
import { TransformationList, Rotation } from '../../geom.js';
import { Cross } from './cross.js';

export const Text = ({ x, y, text, color, alignment, rot, visible, className, opts = {}, ...props }) => {
  let { transformation = new TransformationList() } = opts;
  let parentAngle = Math.round(transformation.slice(1).angle * RAD2DEG);
  log(`Text.render`, { text, parentAngle, transformation, x, y, alignment, rot });

  let rotation = MakeRotation(rot);
  let rotationAngle = Math.round(rotation.angle * RAD2DEG);
  let totalAngle = Util.mod(-parentAngle + rotationAngle, 360);
  let realAngle = Util.mod(parentAngle + Util.mod(rotationAngle, 180), 360);
  let diffAngle = Util.mod(-rotationAngle - realAngle, 360);

  let transform = new TransformationList()
    .translate(x, y)
    .concat(transformation.scaling ? [transformation.scaling] : [])
    .rotate(realAngle);

  let align = Alignment(alignment);
  log(`Text.render`, { text, parentAngle, rotationAngle, totalAngle, realAngle, diffAngle, transform, align });

  align = align.rotate(diffAngle * DEG2RAD).round();

  return h(Fragment, {}, [
    h('text', {
        className,
        fill: color,
        stroke: 'none',
        'stroke-width': 0.05,
        style: visible ? {} : { display: 'none' },
        ...AlignmentAttrs(align, VERTICAL),
        ...props,
        transform
      },
      h('tspan', { ...AlignmentAttrs(align, HORIZONTAL), children: text })
    ),
    h(Cross, { x, y, radius: 1.27 / 4 })
  ]);
};
