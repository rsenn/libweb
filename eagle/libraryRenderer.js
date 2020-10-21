import { Rect, BBox } from '../geom.js';
import { TransformationList } from '../geom/transformation.js';
import { RGBA } from '../color/rgba.js';
import { Palette } from './common.js';
import { LayerAttributes, MakeCoordTransformer } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';
import { ElementToComponent, Package } from './components.js';
import { Frame } from './components/frame.js';

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

  constructor(obj, factory) {
    super(obj.document, factory);

    let library = obj.tagName == 'library' ? obj : obj.document.mainElement;

    this.id = 0;
    this.palette = LibraryRenderer.palette;
    this.library = library;
  }

  /**
   * { function_description }
   *
   * @param      {<type>}  item       The item
   * @param      {<type>}  parent     The parent
   * @param      {<type>}  [opts={}]  The options
   */
  renderItem(item, options = {}) {
    const {
      transform,
      transformation = this.mirrorY,
      viewRect,
      viewSize,
      svgElement = true,
      create = this.create,
      ...opts
    } = options;
    let coordFn = transform ? MakeCoordTransformer(transform) : i => i;
    this.debug(`LibraryRenderer.renderItem`, item, item.raw);
    const layer = item.layer;
    const color = (options && options.color) || (layer && this.getColor(layer.color));
    const comp = ElementToComponent(item);
    let component;
    if(!comp) throw new Error(`No component for item '${item.tagName}'`);
    this.debug('comp =', comp);
    this.debug('item.tagName =', item.tagName);
    const svg = (elem, attr, children) =>
      create(elem, {
          class: item.tagName,
          'data-path': item.path.toString(' '),
          'data-xpath': item.xpath() + '',
          ...attr
        },
        children
      );
    component = svg(comp, { data: item, transform, opts: { ...opts, transformation } });
    if(svgElement) {
      let bounds = viewRect ? new BBox(viewRect) : item.getBounds();
      if(viewSize) {
        let add = { h: viewSize.width - bounds.width, v: viewSize.height - bounds.height };
        Rect.outset(bounds, { top: add.v / 2, bottom: add.v / 2, left: add.h / 2, right: add.h / 2 });
      } else {
        Rect.outset(bounds, 1.27);
        Rect.round(bounds, 2.54);
      }
      component = super.render(item, { ...options, transform: transformation, bounds }, [component]);
    }
    return component;
  }

  renderCollection(collection, options = {}) {
    if(collection instanceof EagleElement) collection = [...collection.children];

    this.debug('LibraryRenderer.renderCollection', { collection, options });
    let items = collection.map(item => [[Util.ucfirst(item.tagName), item.name], this.renderItem(item, options)]);
    return items;
  }

  render(options = {}) {
    let {
      component = Fragment,
      props = {},
      item = { component: Fragment, props: {} },
      asEntries = false,
      ...opts
    } = options;
    const { symbols, packages, devicesets } = this.doc.library;
    let allItems = (window.allItems = [...symbols.children, ...packages.children /*, ...devicesets.list*/]);
    //console.log("allItems:", allItems);
    let bbox = allItems.reduce((a, it) => a.update(it.getBounds()), new BBox());
    let size = bbox.toRect(Rect.prototype).size;

    //console.log("size:", size);

    let items = [symbols, packages /*, devicesets*/].reduce((a, collection) => [
        ...a,
        ...this.renderCollection(collection, {
          ...opts,
          viewSize: size /*, create: (...args) => [...args]*/
          /*    viewRect: bbox || {
            x1: -25.4,
            x2: 25.4,
            y1: -25.4,
            y2: 25.4
          }*/
        })
      ],
      []
    );
    this.entries = items.map(([title, component]) => [title.join(' '), component]);
    if(asEntries) return this.entries;
    component = 'div';
    props = {
      style: {
        display: 'flex',
        width: '100vw',
        flexFlow: 'row wrap',
        alignItems: 'flex-start',
        transform: `translate(-50vw, -50vh)`
      }
    };
    item.component = Frame;
    item.props = {};
    return h(component,
      props,
      items.map(([title, component]) =>
        h(item.component, { class: title[0].toLowerCase(), title, ...item.props }, [component])
      )
    );
  }
}

EagleSVGRenderer.rendererTypes.sch = LibraryRenderer;
