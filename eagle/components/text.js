import { h, Fragment, Component } from '../../dom/preactComponent.js';
import Util from '../../util.js';
import { Rotation, Alignment, VERTICAL, HORIZONTAL, ClampAngle, AlignmentAngle, MakeCoordTransformer } from '../renderUtils.js';
import { TransformationList } from '../../geom.js';

export const Text = ({ x, y, text, color, alignment, rot, transformation, ...props }) => {
  console.log(`Text.render`, { x, y, text, alignment, rot, transformation, ...props });

  let transform = new TransformationList();
  transform.translate(x, y);
  transform = transform.concat(Rotation(rot));

  if(transform.rotation) transform.rotation.angle %= 180;

  transform = transform.concat(
    transformation
      .slice(1)
      .filter(t => ['translate'].indexOf(t.type) == -1)
      .invert()
  );
  let alignmentTransform = transform.filter(t => ['translate'].indexOf(t.type) == -1).collapseAll();
  alignment = Alignment(alignment);
  alignment.transform(alignmentTransform.toMatrix());

  return h(Fragment, {}, [
    h(
      'text',
      {
        fill: color,
        stroke: 'none',
        'stroke-width': 0.05,
        ...AlignmentAttrs(alignment, VERTICAL),
        ...props,
        transform: transform.concat(transformation.slice(0, 1).invert())
      },
      h('tspan', { ...AlignmentAttrs(alignment, HORIZONTAL), children: text })
    )
  ]);
};
