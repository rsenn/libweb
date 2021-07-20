import { log } from '../renderUtils.js';
import { h, Component, Fragment } from '../../dom/preactComponent.js';
import { ElementToComponent } from '../components.js';
import { classNames } from '../../classNames.js';

export const Frame = ({ class: className, title, children, ...props }) => {
  log(`Frame.render`, title, children);

  return h('div', { class: classNames('frame', className), ...props }, [
    h(
      'div',
      { class: 'title' },
      title.map(line => h('p', {}, [line]))
    ),
    h('div', { class: 'rendering' }, [...children])
  ]);
};
