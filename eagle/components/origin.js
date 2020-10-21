import { h, Component } from '../../dom/preactComponent.js';
import { useTrkl, useAttributes, log } from '../renderUtils.js';
import { Cross } from './cross.js';

export const Origin = ({ x = 0, y = 0, layer, element, ...props }) => {
  let visible = !layer || 'yes' == useTrkl(layer.handlers['visible']);
  const color = props.color || layer.getColor(props.instance || props.part || props.element);

  return h(Cross, {
    className: 'origin',
    x,
    y,
    visible,
    color,
    'data-layer': `${layer.number} ${layer.name}`,
    ...props
  });
};
