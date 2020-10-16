import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { MakeRotation, Alignment, VERTICAL, HORIZONTAL } from '../renderUtils.js';
import { TransformationList, Rotation } from '../../geom.js';

export const Text = ({ x, y, text, color, alignment, rot, transformation, visible, className, ...props }) => {
  console.log(`Text.render`, { x, y, text, alignment, rot, transformation, ...props });

  let transform = new TransformationList();
  transform.translate(x, y);
  let rotation = MakeRotation(rot);

  transform = transform.concat(transformation
      // .slice(1)
      .filter(t => ['translate'].indexOf(t.type) == -1)
      .invert()
  );

  let matrix = transform.toMatrix();
  let { rotate } = matrix.decompose();
  console.log(`rotate ${text}`, (rotate * 180) / Math.PI);

  let alignmentTransform;
  let angle = Util.mod(Math.round((rotate * 180) / Math.PI), 360);
  alignmentTransform = new Rotation(angle);
  console.log(`alignmentTransform ${text}`, alignmentTransform);
  alignment = Alignment(alignment);
  console.log(`alignment ${text}`, AlignmentAttrs(alignment));
  alignment = alignment.transform(alignmentTransform);
  console.log(`alignment.transform ${text}`, AlignmentAttrs(alignment));

  transform = transform.concat(alignmentTransform);

  console.log(`transform ${text}`, transform);
  console.log(`transform ${text}`, transform + '');

  return h(Fragment, {}, [
    h('text', {
        className,
        fill: color,
        stroke: 'none',
        'stroke-width': 0.05,
        style: visible ? {} : { display: 'none' },
        ...AlignmentAttrs(alignment, VERTICAL),
        ...props,
        transform
      },
      h('tspan', { ...AlignmentAttrs(alignment, HORIZONTAL), children: text })
    )
  ]);
};
