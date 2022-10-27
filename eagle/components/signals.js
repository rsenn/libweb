import { log } from '../renderUtils.js';
import { h, Component, Fragment } from '../../dom/preactComponent.js';
import { ElementToComponent } from '../components.js';

export const Signals = ({ data, transform, opts = {}, ...props }) => {
  log('Signals.render', { data });

  const getByLayer = layerNo => [
    ...data.getAll(e => (typeof layerNo == 'number' ? e.attributes.layer == layerNo : e.tagName == 'via'))
  ];

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

      for(let item of items) {
        let comp = ElementToComponent(item);

        acc.push(h(comp, { data: item, color: colors[i], opts }));
      }
      return acc;
    }, [])
  );
};
