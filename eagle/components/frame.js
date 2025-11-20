import { classNames } from '../../classNames.js';
import { h } from '../../preact.js';
import { log } from '../renderUtils.js';

export const Frame = ({ class: className, title, children, ...props }) => {
  log(`Frame.render`, title, children);

  return h('div', { class: classNames('frame', className), ...props }, [
    h(
      'div',
      { class: 'title' },
      title.map(line => h('p', {}, [line])),
    ),
    h('div', { class: 'rendering' }, [...children]),
  ]);
};
