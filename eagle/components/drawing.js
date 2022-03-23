import { log } from '../renderUtils.js';
import { h, Component, toChildArray, useState } from '../../dom/preactComponent.js';
import { Rect } from '../../geom.js';
import { Grid, Pattern } from './grid.js';
import { SVG } from './svg.js';
import { Background } from './background.js';
import { useValue } from '../../repeater/react-hooks.js';
import { useTrkl } from '../../hooks/useTrkl.js';

export const Drawing = ({
  viewBox,
  rect,
  bounds,
  attrs,
  grid,
  nodefs,
  transform,
  styles,
  children,
  style,
  ...props
}) => {
  viewBox = useTrkl(viewBox ?? rect);
  /*l(viewBox),  'object':  typeof viewBox
  let viewBox = new Rect(rect);*/
  //viewBox.y = bounds.y1;
  //
  const id = 'grid'; //grid-'+Util.randStr(8, '0123456789ABCDEF'.toLowerCase());
  //
  log('Drawing.render', { attrs, grid, nodefs });

  const defs = nodefs ? {} : { defs: h(Pattern, { data: grid, id, attrs: attrs.grid }) };

  return h(SVG, { viewBox, styles, style, ...defs, ...props }, [
    h('g', { id: 'bg', transform }, [
      h(Background, { rect, attrs: attrs.bg }),
      h(Grid, { data: grid, id, rect, attrs: attrs.grid })
    ]),
    ...toChildArray(children)
  ]);
};
