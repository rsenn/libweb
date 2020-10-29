import { h, Component } from '../../dom/preactComponent.js';
import { useTrkl, useAttributes, log } from '../renderUtils.js';
import { Cross } from './cross.js';

export const Origin = ({ x, y, layer, element, ...props }) => {
  let visible = !layer || 'yes' == useTrkl(layer.handlers['visible']);
  const color = '#ffa200' || layer.getColor() || '#999';
  log('Origin.render', { x, y, layer, color, visible });

  return h(Cross, {
    className: 'origin',
    x,
    y,
    visible,
    color,
    radius: 0.45,
    width: 0.05,
    'data-layer': `${layer.number} ${layer.name}`,
    ...props
  });
};
