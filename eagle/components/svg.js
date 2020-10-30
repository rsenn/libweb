import { log } from '../renderUtils.js';
import { h, Component } from '../../dom/preactComponent.js';

export const SVG = ({ viewBox, preserveAspectRatio = 'xMinYMin', styles, children, defs, ...props }) => {
  return h('svg',
    {
      viewBox,
      preserveAspectRatio,
      xmlns: 'http://www.w3.org/2000/svg',
      ...props
    }, [defs ? h('defs', {}, defs) : null, styles ? h('style', {}, styles) : null, ...children]
  );
};
