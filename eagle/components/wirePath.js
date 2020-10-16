import Util from '../util.js';
import { Point, Line } from '../geom.js';
import { TransformationList } from '../geom/transformation.js';
import { EagleElement } from './element.js';
import { Cross, Arc, Origin } from './components.js';
import { RGBA } from '../color.js';
import { Palette } from './common.js';
import { VERTICAL, HORIZONTAL, RotateTransformation, LayerAttributes, LinesToPath, MakeCoordTransformer, MakeRotation } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';
import { Repeater } from '../repeater/repeater.js';
import { useTrkl, ElementToClass, EscapeClassName, UnescapeClassName } from './renderUtils.js';
import { h, Component, Fragment, useEffect } from '../dom/preactComponent.js';

const WirePath = ({ className, path, cmds, separator = '\n', color, width, layer, ...props }) => {
  let visible = 'yes' == useTrkl(layer.handlers.visible);
  console.debug('Lines visible:', visible);

  let attrs = {
    stroke: color + '',
    'stroke-width': +(width == 0 ? 0.1 : width * 0.8).toFixed(3),
    'data-layer': `${layer.number} ${layer.name}`,
    fill: 'none',
    style: visible ? undefined : { display: 'none' }
  };

  console.debug('path:', path);
  console.debug('cmds:', cmds);

  return h(Util.isArray(path) ? 'g' : 'path',
    {
      className,
      ...(Util.isArray(path) ? {} : { d: Util.isArray(cmds) ? (separator + cmds.join(separator) + separator) : cmds }),
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
