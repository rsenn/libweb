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

  //let wholeTransform = transformation.concat(transform.filter(t => ['translate'].indexOf(t.type) == -1)).invert();

  transform = transform.concat(
    transformation
      .slice(1)
      .filter(t => ['translate'].indexOf(t.type) == -1)
      .invert()
  );

  let alignmentTransform = transform.filter(t => ['translate'].indexOf(t.type) == -1).collapseAll();
  console.log('alignment:', { text, alignment, alignmentTransform });

  console.log('transformation.slice(0,1):', text, transformation.slice(0, 1));
  console.log('transformation.slice(1):', text, transformation.slice(1));
  console.log('transform:', text, transform);
  alignment = Alignment(alignment);

  alignment.transform(alignmentTransform.toMatrix());
  console.log('alignment:', { text, alignment });

  return h(Fragment, {}, [
    /*h('circle', { cx: x, cy: y, r: 0.7071, stroke: '#f0f', 'stroke-width': 0.1, fill: 'none' }),
    h('line', { x1: x - 1, y1: y - 1, x2: x + 1, y2: y + 1, stroke: '#f0f', 'stroke-width': 0.1 }),
    h('line', { x1: x + 1, y1: y - 1, x2: x - 1, y2: y + 1, stroke: '#f0f', 'stroke-width': 0.1 }),*/
    h(
      'text',
      {
        fill: color,
        stroke: 'none',
        'stroke-width': 0.05,
        /*   x,
          y,*/
        ...AlignmentAttrs(alignment, VERTICAL),
        ...props,
        transform: transform.concat(transformation.slice(0, 1).invert())
      },
      h('tspan', { ...AlignmentAttrs(alignment, HORIZONTAL), children: text })
    )
  ]);
};
