import { h } from '../../preact.mjs';
import { log } from '../renderUtils.js';
import { useTrkl } from '../renderUtils.js';

export const Background = ({ rect, attrs, ...props }) => {
  let bg = typeof attrs == 'function' ? useTrkl(attrs) : attrs;

  log('Background.render ', { bg });
  return h('rect', {
    ...rect.toObject(),
    fill: bg.color,
    style: bg.visible ? {} : { display: 'none' },
    ...props
  });
};