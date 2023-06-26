import { log } from '../renderUtils.js';
import { h, Component, Fragment } from '../../preact.mjs';
import { ElementToComponent } from '../components.js';
import { Via } from './via.js';
import { Wire } from './wire.js';
import { WirePath } from './wirePath.js';

export const Signal = ({ data, color, ...props }) => {
  log('Signal.render', { data });

  const { name, vias, wires } = data;

  return h('g', { class: 'signal ' + name, ['data-name']: 'signal', ['data-id']: name }, [
    ...wires.map(data => h(Wire, { data, color })),
    ...vias.map(data => h(Via, { data }))
  ]);
};
