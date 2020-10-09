import { h, Component, toChildArray } from '../../dom/preactComponent.js';
import { Rect } from '../../geom.js';
import { Grid, Pattern } from './grid.js';
import { SVG } from './svg.js';
import { Background } from './background.js';

export const Drawing = ({ rect, bounds, attrs, grid, transform, styles, children, ...props }) => {
  let viewBox = new Rect(rect);
  //viewBox.y = bounds.y1;

  return h(SVG, { viewBox, styles, defs: h(Pattern, { data: grid, id: 'grid', attrs: attrs.grid }), ...props }, [
    h('g', { id: 'bg', transform }, [
      h(Background, { rect, attrs: attrs.bg }),
      h(Grid, { data: grid, rect, attrs: attrs.grid, transform })
    ]),
    ...toChildArray(children)
  ]);
};
