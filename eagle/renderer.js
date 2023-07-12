import { BoardRenderer } from './boardRenderer.js';
import { LibraryRenderer } from './libraryRenderer.js';
import { setDebug } from './renderUtils.js';
import { SchematicRenderer } from './schematicRenderer.js';

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
    default:
      throw new Error('No such document type: ' + doc.type);
  }

  ret.debug = setDebug(debug);

  return ret;
}
