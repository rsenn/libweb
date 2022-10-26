import { log } from '../renderUtils.js';
import { h, Component, Fragment } from '../../dom/preactComponent.js';
import { ElementToComponent } from '../components.js';
import { Via } from './via.js';
import { Wire } from './wire.js';
import { WirePath } from './wirePath.js';

export const Signals = ({ data, color, ...props }) => {
  log('Signals.render', { data });

  const { children } = data;

  return h('g', { class: 'signals', ['data-name']: 'signals' }, []);
};
