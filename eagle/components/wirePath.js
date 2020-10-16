import Util from '../../util.js';
import { useTrkl } from '../renderUtils.js';
import { h, Component } from '../../dom/preactComponent.js';

export const WirePath = ({ className, path, cmds, separator = '\n', color, width, layer, ...props }) => {
  let visible = 'yes' == useTrkl(layer.handlers.visible);
  console.debug('Lines visible:', visible);

  let attrs = {
    stroke: color + '',
    'stroke-width': +(width == 0 ? 0.1 : width * 0.8).toFixed(3),
    'data-layer': `${layer.number} ${layer.name}`,
    fill: 'none',
    style: visible ? undefined : { display: 'none' }
  };

  console.info('WirePath path:', path);
  console.info('WirePath cmds:', cmds);

  return h(Util.isArray(path) ? 'g' : 'path',
    {
      className,
      ...(Util.isArray(path) ? {} : { d: Util.isArray(cmds) ? separator + cmds.join(separator) + separator : cmds }),
      ...attrs,
      ...props
    },
    Util.isArray(path)
      ? path.map(cmd => {
          console.debug('cmd:', cmd);
          return h('path', { d: cmd.flat().join(' ') });
        })
      : []
  );
};
