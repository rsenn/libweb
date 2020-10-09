import { h, Component } from '../../dom/preactComponent.js';

export const SVG = ({ viewBox, preserveAspectRatio = 'xMinYMin', styles, children, defs, ...props }) => {
  return h('svg',
    {
      viewBox,
      preserveAspectRatio,
      ...props
    }, [h('style', {}, styles), h('defs', {}, defs), ...children]
  );
};
