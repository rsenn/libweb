import { TransformationList } from '../../geom.js';
import { useTrkl } from '../../hooks/useTrkl.js';
import { h, toChildArray } from '../../preact.mjs';
import { log } from '../renderUtils.js';
import { Background } from './background.js';
import { Board } from './board.js';
import { Grid, Pattern } from './grid.js';
import { SVG } from './svg.js';

export const Drawing = ({
  data,
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
  let size = {};
  if(data) {
    rect = data.document.getMeasures({ bbox: true }) ?? data.getBounds();
    grid = data.grid;

    if(rect) {
      size.width = `${rect.width}mm`;
      size.height = `${rect.height}mm`;
    }
  }
  viewBox = useTrkl(viewBox ?? rect);

  log('viewBox', viewBox);
  {
    let transform = new TransformationList();

    transform.translate(0, viewBox.y1);
    transform.scale(1, -1);
    transform.translate(0, -viewBox.y1 - viewBox.height);

    if(data?.document?.type == 'brd') children = [h(Board, { data: data.document, transform })];

    attrs ??= {
      bg: { color: '#ffffff', visible: true },
      grid: { color: '#0000aa', width: 0.01, visible: true }
    };

    const id = 'grid';

    log('Drawing.render', { attrs, grid, nodefs });

    const defs = nodefs ? {} : { defs: h(Pattern, { data: grid, id, attrs: attrs.grid }) };

    return h(SVG, { viewBox, styles, style, ...size, ...defs, ...props }, [
      h('g', { id: 'bg', transform }, [
        h(Background, { rect, attrs: attrs.bg }),
        h(Grid, { data: grid, id, rect, attrs: attrs.grid })
      ]),
      ...toChildArray(children)
    ]);
  }
};