import { h, Component } from '../../dom/preactComponent.js';
import { useTrkl, useAttributes } from '../renderUtils.js';
import { Cross } from './cross.js';

export const Origin = ({ x, y, layer, ...props }) => {
  let isVisible = layer ? layer.handlers['visible'] : true;
  const color = '#f0f' || layer.getColor();

  return h(Cross, { className: 'origin', x, y, isVisible, color, 'data-layer': `${layer.number} ${layer.name}`, ...props });
};
