import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeRotation, Alignment, VERTICAL, HORIZONTAL, log } from '../renderUtils.js';
import { TransformationList, Rotation } from '../../geom.js';
import { Cross } from './cross.js';

export const Text = ({ x, y, text, color, alignment, rot, visible, className, opts = {}, ...props }) => {
  let { transformation = new TransformationList() } = opts;
  log(`Text.render`, { text, transformation, x, y, alignment, rot });

  let rotation = MakeRotation(rot);
  let angle = (rotation.angle * 180) / Math.PI;
  let realAngle = Util.mod(angle, 180);

  let transform = new TransformationList()
    .translate(x, y)
    .concat(transformation.scaling ? [transformation.scaling] : [])
    .rotate(-realAngle);

  let diffAngle = angle - realAngle;

  let align = Alignment(alignment);
  log(`Text.render`, { text, diffAngle, transform, align });

  align = align.rotate(diffAngle);

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
