import Util from '../util.js';
import { SchematicRenderer } from './schematicRenderer.js';
import { BoardRenderer } from './boardRenderer.js';
import { LibraryRenderer } from './libraryRenderer.js';
export { EagleSVGRenderer } from './svgRenderer.js';
export { SchematicRenderer } from './schematicRenderer.js';
export { LibraryRenderer } from './libraryRenderer.js';
export { BoardRenderer } from './boardRenderer.js';
import { DEBUG, setDebug, log } from './renderUtils.js';

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

  setDebug(debug);
  console.log('DEBUG:', DEBUG);
  console.log('log:', log);
  /*  Renderer.debug = ret.debug = debug
    ? (...args) => console.log(Util.getCallers(2)[0].toString(false, { stripUrl: true }) + '\n', ...args)
    : () => {};*/
  // let fn = typeof console.debug == 'function' ? console.debug : console.log;

  ret.debug = log;
  return ret;
}
