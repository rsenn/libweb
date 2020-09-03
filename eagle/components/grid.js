import { h, Component } from '../../dom/preactComponent.js';
import { TransformationList } from '../../geom/transformation.js';
import { useTrkl, useAttributes } from '../renderUtils.js';

export const Pattern = ({ id = 'pattern', attrs = { color: '#0000aa', width: 0.05, step: 2.54 }, ...props }) => {
  let [pattern] = typeof attrs == 'function' ? useTrkl(attrs) : [attrs];
  console.log('Pattern.render ', { pattern });
  const { width = 0.05, step = 2.54, color = '#0000aa' } = pattern;

  return h('pattern',
    { id, width: step, height: step, patternUnits: 'userSpaceOnUse' },
    h('path', {
      d: `M ${step},0 L 0,0 L 0,${step}`,
      fill: 'none',
      stroke: color || '#0000aa',
      'stroke-width': width || 0.05
    })
  );
};

export const Grid = ({ data, rect, attrs = { visible: true }, opts = {}, ...props }) => {
  //data = data || props.item;

  let { transform = new TransformationList() } = opts;
  const { distance, unitdist, unit, style, multiple, display, altdistance, altunitdist, altunit } = useAttributes(data);

  let [grid] = typeof attrs == 'function' ? useTrkl(attrs) : [attrs];
  console.log('Grid.render ', { grid });

  return h('rect', {
    stroke: 'none',
    fill: 'url(#grid)',
    style: grid.visible ? {} : { display: 'none' },
    ...rect.toObject(),
    transform
  });
};
