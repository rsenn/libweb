import { h } from '../../preact.js';
import { log, useTrkl } from '../renderUtils.js';

export const WirePath = ({ className, path, cmds, separator = '\n', color, width, layer, data, ...props }) => {
  if(data) layer ??= data.document.getLayer(isNaN(+data.attributes.layer) ? data.attributes.layer : +data.attributes.layer);

  let visible = !layer?.handlers || 'yes' == useTrkl(layer.handlers.visible);
  log('WirePath', layer.toString(), 'visible:', visible);

  const extraStyle = {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };
  let attrs = {
    stroke: color + '',
    'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
    'data-layer': `${layer.number} ${layer.name}`,
    fill: 'none',
    style: visible ? { ...extraStyle } : { ...extraStyle, display: 'none' },
  };

  log('WirePath', layer.toString(), 'path:', path);
  log('WirePath', layer.toString(), 'cmds:', cmds);

  cmds ??= [];

  let isArray = Array.isArray(cmds[0]) && cmds.length > 1;

  if(Array.isArray(cmds[0]) && cmds.length == 1) cmds = cmds[0];
  // if(Array.isArray(cmds)) cmds =  separator + cmds.join(separator) + separator;

  return h(
    isArray ? 'g' : 'path',
    {
      className,
      ...(isArray ? {} : { d: cmds.join(' ') }),
      ...attrs,
      ...props,
    },
    isArray
      ? cmds.map(cmd => {
          //  log('cmd:', cmd);
          return h('path', { d: cmd.join(' ') });
        })
      : [],
  );
};
