import { h } from '../../preact.js';
import { log } from '../renderUtils.js';
import { Via } from './via.js';
import { Wire } from './wire.js';

export const Signal = ({ data, color, ...props }) => {
  log('Signal.render', { data });

  const { name, vias, wires } = data;

  return h('g', { class: 'signal ' + name, ['data-name']: 'signal', ['data-id']: name }, [...wires.map(data => h(Wire, { data, color })), ...vias.map(data => h(Via, { data }))]);
};
