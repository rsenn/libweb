import { SVG } from '../dom/svg.js';
import { BBox } from '../geom/bbox.js';
import { Rect } from '../geom/rect.js';
import { ColorMap } from '../draw/colorMap.js';
import Alea from '../alea.js';
import Util from '../util.js';
import { RGBA } from '../color/rgba.js';
import { Size } from '../dom.js';
import { SchematicRenderer } from './schematicRenderer.js';
import { BoardRenderer } from './boardRenderer.js';
import { LibraryRenderer } from './libraryRenderer.js';
export { EagleSVGRenderer } from './svgRenderer.js';
export { SchematicRenderer } from './schematicRenderer.js';
export { LibraryRenderer } from './libraryRenderer.js';
export { BoardRenderer } from './boardRenderer.js';

export function Renderer(doc, factory, debug) {
  let ret;
  switch (doc.type) {
    case 'brd':
      ret = new BoardRenderer(doc, factory);
      break;
    case 'sch':
      ret = new SchematicRenderer(doc, factory);
      break;

    case 'lbr':
      ret = new LibraryRenderer(doc, factory);
      break;
    default: throw new Error('No such document type: ' + doc.type);
  }
  Renderer.debug = ret.debug = debug ? (...args) => console.log(Util.getStackFrame().getLocation(), ...args) : () => {};
  return ret;
}
