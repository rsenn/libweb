import { h, Fragment, Component } from '../../dom/preactComponent.js';
import { Rect } from '../../geom.js';
import { Rotation, MakeCoordTransformer } from '../renderUtils.js';
import { TransformationList } from '../../geom/transformation.js';
import { useTrkl, useAttributes } from '../renderUtils.js';

export const Pattern = ({ id = 'pattern', step = 2.54, color = '#0000aa', width = 0.05, ...props }) => {
  return h(
    'pattern',
    { id, width: step, height: step, patternUnits: 'userSpaceOnUse' },
    h('path', {
      d: `M ${step},0 L 0,0 L 0,${step}`,
      fill: 'none',
      stroke: color,
      'stroke-width': width
    })
  );
};

export const Grid = ({ data, rect, isVisible, background = 'rgb(255,255,255)', opts = {}, ...props }) => {
  data = data || props.item;

  //console.log('Grid.render ', { data, opts });
  let { transform = new TransformationList() } = opts;

  const { distance, unitdist, unit, style, multiple, display, altdistance, altunitdist, altunit } = useAttributes(data);


  let visible = typeof(isVisible) == 'function' ? useTrkl(isVisible) : true;


  return h(Fragment, {}, [
    h('rect', { ...rect.toObject(), fill: background }),

    h('rect', {
      stroke: 'none',
      fill: 'url(#grid)',
      style: visible ? {} : { display: 'none' },
      ...rect.toObject(),
      transform: transform
    })
  ]);
};
