import { h, Component } from '../../dom/preactComponent.js';
import { useTrkl } from '../renderUtils.js';

export const Background = ({ rect, attrs, ...props }) => {
  let [bg] = typeof attrs == 'function' ? useTrkl(attrs) : [attrs];

  console.log('Background.render ', { bg });
  return h('rect', {
    ...rect.toObject(),
    fill: bg.color,
    style: bg.visible ? {} : { display: 'none' },
    ...props
  });
};
