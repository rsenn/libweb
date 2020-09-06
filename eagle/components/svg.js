import { h, Component } from '../../dom/preactComponent.js';

export const SVG = ({ viewBox, preserveAspectRatio = 'xMinYMin', children, defs, ...props }) => {
  return h('svg',
    {
      viewBox,
      preserveAspectRatio,
      ...props
    }, [
      h('style', {}, [
        `
text { font-size: 0.0875rem; }
text { stroke: none; }
.pad { fill: #4ba54b; }
.pad > text { fill: #ff33ff; }
.pad > text { font-size: 1px; }
`
      ]),
      h('defs', {}, defs),
      ...children
    ]
  );
};
