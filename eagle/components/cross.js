import { h } from '../../preact.mjs';
import { log } from '../renderUtils.js';

export const Cross = ({ x, y, className = 'cross', radius = 1.27 / 2, width = 0.127 / 2, color = '#f0f', visible = true, ...props }) => {
  // let visible = typeof isVisible == 'function' ? useTrkl(isVisible) : true;
  log('Cross.render', { x, y, radius, width, color, visible });

  return h('path', {
    className,
    stroke: color,
    d: `M 0,-${radius} L 0,${radius} M -${radius},0 L ${radius},0`,
    'stroke-width': width,
    fill: 'none',
    style: visible ? {} : { display: 'none' },
    ...(x !== undefined && y !== undefined ? { transform: `translate(${x},${y})` } : {}),
    ...props,
  });
};
