import { h } from '../../preact.js';
import { log } from '../renderUtils.js';
import { useTransform } from '../renderUtils.js';
import { Instance } from './instance.js';

export const Sheet = ({ data, opts = {}, ...props }) => {
  let [transformation, transform, accumulate] = useTransform(opts);

  log('Sheet.render', { transformation, data });
  let sheet = data;

  return h(
    'g',
    {
      class: `sheet`,
      'data-path': sheet.path.toString(' '),
      opts: accumulate(...opts),
    },
    [
      //...sheet.nets.map(net => h(Net, {data: net, opts: accumulate(...opts) }))
      ...sheet.instances.map(instance => h(Instance, { data: instance, opts: accumulate(...opts) })),
    ],
  );
};