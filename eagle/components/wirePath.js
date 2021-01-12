import Util from '../../util.js';
import { useTrkl, log } from '../renderUtils.js';
import { h, Component } from '../../dom/preactComponent.js';

export const WirePath = ({ className, path, cmds, separator = '\n', color, width, layer, ...props }) => {
  let visible = 'yes' == useTrkl(layer.handlers.visible);
  log('WirePath', layer.toString(), 'visible:', visible);

  let attrs = {
    stroke: color + '',
    'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
    'data-layer': `${layer.number} ${layer.name}`,
    fill: 'none',
    style: visible ? undefined : { display: 'none' }
  };

  log('WirePath', layer.toString(), 'path:', path);
  log('WirePath', layer.toString(), 'cmds:', cmds);

  let isArray = Util.isArray(cmds[0]) && cmds.length > 1;

  if(Util.isArray(cmds[0]) && cmds.length == 1) cmds = cmds[0];
  // if(Util.isArray(cmds)) cmds =  separator + cmds.join(separator) + separator;

  return h(isArray ? 'g' : 'path',
    {
      className,
      ...(isArray ? {} : { d: cmds.join(' ') }),
      ...attrs,
      ...props
    },
    isArray
      ? cmds.map(cmd => {
          log('cmd:', cmd);
          return h('path', { d: cmd.join(' ') });
        })
      : []
  );
};
