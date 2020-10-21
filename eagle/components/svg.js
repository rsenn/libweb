import { log } from '../renderUtils.js';
import { h, Component } from '../../dom/preactComponent.js';

export const SVG = ({ viewBox, preserveAspectRatio = 'xMinYMin', styles, children, defs, ...props }) => {
  return h('svg',
    {
      viewBox,
      preserveAspectRatio,
      ...props
    }, [h('defs', {}, defs), h('style', {}, styles), ...children]
  );
};
