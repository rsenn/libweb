import { Rect, BBox } from '../geom.js';
import { TransformationList } from '../geom/transformation.js';
import { RGBA } from '../color/rgba.js';
import { Palette } from './common.js';
import { LayerAttributes, MakeCoordTransformer } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';

export class LibraryRenderer extends EagleSVGRenderer {
  static pinSizes = {
    long: 3,
    middle: 2,
    short: 1,
    point: 0
  };

  static palette = {
    board: Palette.board((r, g, b) => new RGBA(r, g, b)),
    schematic: Palette.schematic((r, g, b) => new RGBA(r, g, b))
  };

  constructor(doc, factory) {
    super(doc, factory);
    this.id = 0;
    this.palette = LibraryRenderer.palette;
  }

  /**
   * { function_description }
   *
   * @param      {<type>}  item       The item
   * @param      {<type>}  parent     The parent
   * @param      {<type>}  [opts={}]  The options
   */
  renderItem(item, parent, opts = {}) {
    const { transform = new TransformationList(), rot, pos, labelText } = opts;

    let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

    /* if(rot)*/ this.debug(`LibraryRenderer.renderItem`, /* { labelText, pos, transform, rot }, */ item /*, item.xpath().toString()*/, item.raw);

    const layer = item.layer;
    const color = (opts && opts.color) || (layer && this.getColor(layer.color));
    const svg = (elem, attr, parent) =>
      this.create(
        elem,
        {
          className: item.tagName, //...LayerAttributes(layer),
          'data-path': item.path.toString(' '),
          ...attr
        },
        parent
      );
    switch (item.tagName) {
      default: {
        super.renderItem(item, parent, opts);
        break;
      }
    }
  }
  render(doc = this.doc, parent, props = {}, sheetNo = 0) {
    const { packages, devicesets, symbols } = doc.library;

    /*    let bounds = new BBox();
    let rect = new Rect(bounds.rect);
    this.bounds = bounds;
    this.rect = rect;
    rect.outset(1.27);
    rect.round(2.54);
    parent = super.render(doc, parent, props);
    this.debug('this.transform:', this.transform, 'this.rect:', this.rect, 'doc:', doc);
    this.debug(`LibraryRenderer.render`, { doc, sheetNo, bounds });
    this.renderSheet(sheet, parent);*/
    return parent;
  }
}

EagleSVGRenderer.rendererTypes.sch = LibraryRenderer;
