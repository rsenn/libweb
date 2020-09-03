import { h, Component, toChildArray } from '../../dom/preactComponent.js';
import { Grid, Pattern } from './grid.js';
import { SVG } from './svg.js';
import { Background } from './background.js';

export const Drawing = ({ rect, attrs, grid, transform, children, ...props }) => {
  return h(SVG, { viewBox: new Rect(rect), defs: h(Pattern, { id: 'grid', attrs: attrs.grid }), ...props }, [h('g', { id: 'bg' }, [h(Background, { rect, attrs: attrs.bg }), h(Grid, { data: grid, rect, attrs: attrs.grid, transform })]), ...toChildArray(children)]);
};
