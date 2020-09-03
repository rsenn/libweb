import { h, Component } from '../../dom/preactComponent.js';

export const SVG = ({ viewBox, preserveAspectRatio = 'xMinYMin', children, defs, ...props }) => {
  return h('svg',
    {
      viewBox,
      preserveAspectRatio,
      ...props
    }, [h('style', {}, [`text { font-size: 0.0875rem; }`]), h('defs', {}, defs), ...children]
  );
};
