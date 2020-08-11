import { h, Component } from '../../dom/preactComponent.js';

export const Cross = ({ x, y, radius = 1.27 / 2, width = 0.127 / 2, color = '#f0f', visible = true, ...props }) => {
  return h('path', {
    stroke: color,
    d: `M 0,-${radius} L 0,${radius} M -${radius},0 L ${radius},0`,
    'stroke-width': width,
    fill: 'none',
    style: visible ? {} : { display: 'none' },
    ...props
  });
};