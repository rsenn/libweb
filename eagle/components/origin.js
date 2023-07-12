import { h } from '../../preact.mjs';
import { log, useTrkl } from '../renderUtils.js';
import { Cross } from './cross.js';

export const Origin = ({ x, y, layer, element, color, radius = 0.45, width = 0.05, ...props }) => {
  let visible = !layer || 'yes' == useTrkl(layer.handlers['visible']);
  color = color || layer.getColor() || '#ffa200' || '#999';
  log('Origin.render', { x, y, layer, color, visible });

  return h(Cross, {
    className: 'origin',
    x,
    y,
    visible,
    color,
    radius,
    'data-layer': `${layer.number} ${layer.name}`,
    ...props
  });
};