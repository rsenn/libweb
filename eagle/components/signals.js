import { Component } from '../../preact.mjs';
import { h } from '../../preact.mjs';
import { ElementToComponent } from '../components.js';
import { log } from '../renderUtils.js';

export const Signals = ({ data, transform, opts = {}, ...props }) => {
  log('Signals.render', { data });

  const getByLayer = layerNo => [...data.getAll(e => (typeof layerNo == 'number' ? e.attributes.layer == layerNo + '' /*||  e.layer.number == layerNo*/ : e.tagName == 'via'))];

  let layers = [16, 1, null];
  let colors = layers.map(layerNo => data.document.getLayer(layerNo)?.color);

  log('Signals.render', { layers });

  return h(
    'g',
    {
      id: 'signals',
      class: 'signals',
      ['data-name']: 'signals',
      transform,
      'stroke-linecap': 'round', // 'square'
      'stroke-linejoin': 'miter', // 'round', 'miter', 'bevel'
      'font-family': 'Fixed'
    },

    layers.reduce((acc, layerNo, i) => {
      let items = getByLayer(layerNo);
      log('Signals.render', { layerNo, items });

      for(let item of items) {
        let comp = ElementToComponent(item);
        let signalName = item.parentNode.name;

        acc.push(h(comp, { data: item, 'data-signal': signalName, color: colors[i], opts }));
      }
      return acc;
    }, [])
  );
};