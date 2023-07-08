import { RGBA } from '../color/rgba.js';
import { BBox } from '../geom.js';
import { Matrix } from '../geom.js';
import { Rect } from '../geom.js';
import { TransformationList } from '../geom/transformation.js';
import { ucfirst } from '../misc.js';
import { unique } from '../misc.js';
import { Palette } from './common.js';
import { ElementToComponent } from './components.js';
import { Origin } from './components.js';
import { Frame } from './components/frame.js';
import { MakeCoordTransformer } from './renderUtils.js';
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

  constructor(obj, factory) {
    super(obj.document, factory);

    let library = obj.tagName == 'library' ? obj : obj.document.lookup('eagle/drawing/library');

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
    let { transform, transformation = this.mirrorY, viewRect, viewSize, svgElement = true, create = this.create, index, ...opts } = options;
    let coordFn = transform ? MakeCoordTransformer(transform) : i => i;
    //  this.debug(`LibraryRenderer.renderItem`, item, item.raw);
    const layer = item.layer;
    const color = (options && options.color) || (layer && this.getColor(layer.color));
    const comp = ElementToComponent(item);
    let component;
    if(!comp) throw new Error(`No component for item '${item.tagName}'`);
    this.debug('comp =', comp);
    this.debug('item.tagName =', item.tagName);
    const svg = (elem, attr, children) =>
      h(
        elem,
        {
          class: item.tagName,
          'data-path': item.path.toString(' '),
          'data-xpath': item.xpath() + '',
          ...attr
        },
        children
      );

    let devicesets = [...this.doc.getAll(e => e && e.attributes && e.attributes[item.tagName] == item.name)]
      .map(e => [e, e.scope().deviceset])
      .map(([e, deviceset]) => deviceset)
      .filter(deviceset => !!deviceset);
    let prefixes = unique(devicesets.map(deviceset => deviceset && deviceset.prefix).filter(prefix => !!prefix));
    let suffix = '';
    if(item.tagName == 'symbol') {
      let symbolUsages = devicesets
        .map(set => [set, [...set.gates.list].map((g, i) => [i, g.name, g.symbol]).filter(([i, name, symbol]) => symbol.name == item.name)])
        .filter(([set, gates]) => gates.length > 0);

      if(symbolUsages[0]) {
        let [deviceset, gates] = symbolUsages[0];
        let [number, name, symbol] = gates[0];

        if(/\$/.test(name)) name = String.fromCodePoint(65 + number);

        suffix = name;
        opts.value = deviceset.name;

        //console.log('LibraryRenderer.renderItem deviceset:', deviceset, 'gate:', { number, name, symbol });
      }
      //   console.log('LibraryRenderer.renderItem item.scope():', item.scope());
    }

    if(prefixes[0]) opts.name = `${prefixes[0]}1${suffix}`;

    component = h(comp, {
      data: item,
      transform,
      opts: { ...opts, transformation }
    });
    let origin = h(Origin, {
      layer: this.doc.layers['tOrigins'],
      radius: 1.27,
      width: 0.008,
      color: '#555',
      'stroke-dasharray': `${1.6 / 11} ${1.6 / 11}`
    });
    if(svgElement) {
      let bounds = viewRect ? new BBox(viewRect) : item.getBounds();
      let measure = new Rect(bounds);

      if(viewSize) {
        let add = {
          h: viewSize.width - bounds.width,
          v: viewSize.height - bounds.height
        };
        Rect.outset(bounds, {
          top: add.v / 2,
          bottom: add.v / 2,
          left: add.h / 2,
          right: add.h / 2
        });
      } else {
        Rect.outset(bounds, 1.27);
        Rect.round(bounds, 2.54);
      }
      measure = measure.outset(1.28).round(2.54);
      let matrix = new Matrix().affineTransform(measure.toPoints(), new Rect(bounds).toPoints());
      //  console.debug("LibraryRenderer.renderItem ", {matrix});

      let { scaling, translation } = (transformation = transformation.concat(TransformationList.fromMatrix(matrix)));

      let factor = Math.min(scaling.x, scaling.y);
      scaling.x = factor;
      scaling.y = factor;
      /*
if(translation) {
      translation.x = 0;
      translation.y = 0;
    }*/

      let group = svg('g', { transform: transformation }, [component, origin]);

      window.matrix = matrix;

      component = super.render(item, { ...options, index, transform: transformation, bounds }, [group]);
    }
    return component;
  }

  renderCollection(collection, options = {}) {
    if(collection instanceof EagleElement) collection = [...collection.children];

    this.debug('LibraryRenderer.renderCollection', { collection, options });
    let items = collection.map((item, index) => [[ucfirst(item.tagName), item.name], this.renderItem(item, { ...options, index })]);
    return items;
  }

  render(options = {}) {
    let { component = Fragment, props = {}, item = { component: Fragment, props: {} }, asEntries = false, ...opts } = options;
    const { symbols, packages, devicesets } = this.doc.library;
    let allItems = (window.allItems = [...symbols.children, ...packages.children]);
    let bbox = allItems.reduce((a, it) => a.update(it.getBounds()), new BBox());
    let size = bbox.toRect(Rect.prototype).size;
    let items = [symbols, packages].reduce(
      (a, collection) => [
        ...a,
        ...this.renderCollection(collection, {
          ...opts,
          viewSize: size
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
        justifyContent: 'flex-start',
        alignItems: 'flex-start' /*,
        transform: `translate(-50vw, -50vh)`*/
      }
    };
    item.component = Frame;
    item.props = {};
    return h(
      component,
      props,
      items.map(([title, component]) =>
        h(
          item.component,
          {
            class: title[0].toLowerCase(),
            title,
            key: title.join('-'),
            ...item.props
          },
          [component]
        )
      )
    );
  }
}

EagleSVGRenderer.rendererTypes.sch = LibraryRenderer;