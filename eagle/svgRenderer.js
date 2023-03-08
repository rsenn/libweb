import { EagleElement } from './element.js';
import { define, inserter, isObject,mapWrapper } from '../misc.js';
import { Size } from '../dom.js';
import { Point, Rect, BBox, TransformationList } from '../geom.js';
import { MakeRotation, VERTICAL, HORIZONTAL, HORIZONTAL_VERTICAL, ClampAngle, AlignmentAngle, LayerAttributes, MakeCoordTransformer, LayerToClass } from './renderUtils.js';
import { ElementToComponent, Pattern, Grid, Background, Drawing } from './components.js';
import trkl from '../trkl.js';
import { h, Component } from '../dom/preactComponent.js';
import { ColorMap } from '../draw/colorMap.js';
import { SVG } from './components/svg.js';
import { ImmutableXPath } from '../xml/xpath.js';
import { Pointer as ImmutablePath } from '../pointer.js';

const transformXPath = p => p.replace(/➟/g, 'children').replace(/ /g, '.').split(/\./g);

export class EagleSVGRenderer {
  static rendererTypes = {};

  palette = null;
  id = 0;
  layers = {};
  colors = {};
  transformStack = [];
  transform = new TransformationList().scale(1, -1);

  itemMap = new Map();
  path2component = null;
  component2path = new WeakMap();

  constructor(doc, factory) {
    //console.log('EagleSVGRenderer.constructor',{factory});
    if(new.target === EagleSVGRenderer) throw new Error('Use SchematicRenderer or BoardRenderer');
    this.doc = doc;
    let renderer = this;
    this.path2component = mapWrapper(
      new Map(),
      path => (isObject(path) && path.path !== undefined ? path.path : path) + '',
      key => new ImmutablePath(key)
    );
    const insertCtoP = inserter(this.component2path);
    const insert = inserter(this.path2component, (k, v) => insertCtoP(v, k));
    this.mirrorY = new TransformationList().scale(1, -1);
    this.append = factory;
    this.create = function(tag, attrs, children, parent, element) {
      // console.log('EagleSVGRenderer.create',{factory});
      let ret = factory(tag, attrs, children, parent, element);
      let path = attrs['data-path'];
      if(path) {
        if(typeof path == 'string' && /children\[/.test(path)) path = new ImmutablePath(path);
        else if(!isObject(path) || !(path instanceof ImmutableXPath)) path = new ImmutableXPath(path);
        //console.log('EagleSVGRenderer.create', { path /*,ref*/ });
        try {
          let e = path.apply(doc);
          let parent = e.parentNode;

          insert(path, ret);
        } catch(e) {}
      }
      return ret;
    };

    if(!doc.layers.tOrigins)
      doc.layers.raw.push(
        EagleElement.create('layer', {
          name: 'tOrigins',
          number: '23',
          color: '15',
          fill: '1',
          visible: 'yes',
          active: 'yes'
        })
      );
    if(!doc.layers.bOrigins)
      doc.layers.raw.push(
        EagleElement.create('layer', {
          name: 'bOrigins',
          number: '24',
          color: '15',
          fill: '1',
          visible: 'yes',
          active: 'yes'
        })
      );

    // this.layers = Object.fromEntries([...doc.layers].map(([n, l]) => [l.name, l]));
    this.layers = Object.getOwnPropertyNames(doc.layers).map(n => [n, doc.layers[n]]);
  }

  get maps() {
    const { path2component, component2path } = this;
    return [path2component.map, component2path];
  }
  /*
  pushTransform(transform) {
    transform = this.transform.concat(transform);

    this.transformStack.push(this.transform);
    this.transform = transform;
  }

  popTransform() {
    this.transform = this.transformStack.pop();
  }*/

  static create(doc, factory) {
    let renderer = new EagleSVGRenderer.rendererTypes[doc.type](doc, factory);
    return renderer;
  }

  setPalette(palette) {
    palette = palette.map((color, i) => trkl(((color.valueOf = () => i), color)));
    let ncolors = palette.length;
    palette = palette.reduce((acc, color, i) => ({ ...acc, [i + '']: color }), {
      length: trkl(ncolors)
    });

    palette = trkl.bind(define({}, { handlers: palette }), palette);
    Object.setPrototypeOf(
      palette,
      Object.defineProperties(
        {
          *[Symbol.iterator]() {
            for(let i = 0; i < this.length; i++) yield this[i];
          }
        },
        {
          constructor: {
            value: class Palette {},
            enumerable: false,
            writable: false,
            configurable: false
          },
          handlers: {
            value: null,
            enumerable: false,
            writable: true
          },
          length: {
            value: 0,
            enumerable: false,
            configurable: true,
            writable: true
          }
        }
      )
    );
    //this.debug("setPalette 3",palette)
    //this.debug("setPalette 4",palette)

    Object.defineProperty(this, 'palette', {
      value: palette || (this.doc.type == 'brd' ? BoardRenderer.palette : SchematicRenderer.palette),
      writable: true,
      configurable: true
    });
  }

  getColor(color) {
    let c = this.palette[color] || /*this.colors[color] || */ 'rgb(165,165,165)';
    //this.debug('getColor', color, c);

    return c;
  }

  layerOf(element) {
    let layer;
    do {
      layer =
        element.getAttribute('data-layer') ||
        element.getAttribute('data-layer-id') ||
        element.getAttribute('data-layer-name') ||
        element.getAttribute('layer');
      if(layer) {
        const layerId = +(layer + '').replace(/\ .*/g, '');
        return this.layers[layerId];
      }
    } while((element = element.parentElement));
  }

  renderLayers(parent) {
    this.debug(`EagleSVGRenderer.renderLayers`);

    //const layerGroup = this.create('g', { className: 'layers' }, parent);
    const layerList = [...this.doc.layers.list].sort((a, b) => a.number - b.number);
    const colors = {};

    this.layerElements = {};
    let layers = [];

    for(let l of layerList) {
      const { color, active, visible } = l;

      if(active == 'no' && visible == 'no') continue;

      const stroke = this.getColor(color);
      const layer = this.create(
        'g',
        {
          id: `layer-${l.number}`,
          className: 'layer',
          //...LayerAttributes(l),
          stroke,
          'data-name': l.name,
          'data-path': l.path /*.toString(' ')*/,
          ...(active == 'yes' ? { 'data-active': 'yes' } : {}),
          ...(visible == 'yes' ? { 'data-visible': 'yes' } : {})
        },
        layerGroup
      );

      this.layerElements[l.number] = layer;
      colors[l.name] = stroke;

      layers.push(layer);
    }
    return layers;
  }

  renderItem(item, parent, opts = {}) {
    let { labelText, transformation = new TransformationList() } = opts;

    console.log(`EagleSVGRenderer.renderItem`, { item, transformation });

    const svg = (elem, attr, parent) =>
      this.create(
        elem,
        {
          className: item.tagName,
          ...attr
        },
        parent
      );

    let coordFn = i => i;
    const { layer } = item;
    const color = typeof item.getColor == 'function' ? item.getColor() : this.constructor.palette[16];
    let elem;
    const comp = ElementToComponent(item);
    if(comp) {
      elem = svg(
        comp,
        {
          data: item,
          opts: {
            ...opts,
            transformation
          }
        },
        parent
      );

      return elem;
    }

    switch (item.tagName) {
      case 'label': {
        const { align } = item;
        const { x, y } = coordFn(item);
        const transform = new TransformationList(`translate(${x},${y})`);

        elem = svg(
          'text',
          {
            fill: '#f0f',
            stroke: 'none',
            x,
            y,
            ...EagleSVGRenderer.alignmentAttrs(align),
            children: labelText,
            'font-size': '0.1px',
            'font-family': 'Fixed Medium'
          },
          parent
        );
        break;
      }

      case 'pinref':
      case 'contactref':
        break;
      default: {
        const { x, y } = coordFn(item);
        this.debug('EagleSVGRenderer.renderItem', {
          item,
          parent,
          opts
        });
        throw new Error(`No renderer for element '${item.tagName}'`);
        break;
      }
    }
    return elem;
  }

  static alignment(align, def = [-1, 1], rot = 0) {
    let h, v;
    const { horizontalAlignment, verticalAlignment } = EagleSVGRenderer;

    for(let tok of (align || horizontalAlignment[def[0] + 1] + '-' + verticalAlignment[def[1] + 1]).split(/-/g)) {
      switch (tok) {
        case 'center': {
          if(h === undefined) h = 0;
          if(v === undefined) v = 0;
          break;
        }
        case 'bottom':
        case 'top': {
          v = tok == 'top' ? -1 : 1;
          break;
        }
        case 'left':
        case 'right': {
          h = tok == 'left' ? -1 : 1;
          break;
        }
      }
    }
    let ret = new Point(h === undefined ? def[0] : h, v === undefined ? def[1] : v);
    if(Math.abs(rot) > 0) ret.rotate((rot * Math.PI) / 180);
    return ret;
  }

  static alignmentAttrs(align, hv = HORIZONTAL_VERTICAL, rot = 0) {
    let coord = align instanceof Point ? align : EagleSVGRenderer.alignment(align, [-1, 1]);
    if(Math.abs(rot) > 0) coord.rotate((rot * Math.PI) / 180);
    const defaultY = 1;
    const defaultX = -1;

    const { x, y } = coord;
    const { verticalAlignment, horizontalAlignment } = EagleSVGRenderer;
    let r = {};
    if(hv & VERTICAL) r['dominant-baseline'] = verticalAlignment[Math.round(y) + 1] || verticalAlignment[defaultY + 1];

    if(hv & HORIZONTAL) r['text-anchor'] = horizontalAlignment[Math.round(x) + 1] || horizontalAlignment[defaultX + 1];
    return r;
  }

  render(obj, props = {}, children = []) {
    //console.log('EagleSVGRenderer.render', { obj, props, children });
    let doc = obj.document || this.doc;
    this.debug('EagleSVGRenderer.render', { doc });
    let { bounds = obj.getMeasures && obj.getMeasures({ bbox: true }), transform = new TransformationList() } = props;

    if(!bounds || bounds.size.area() == 0) bounds = obj.getBounds({ bbox: true });

    let rect = new Rect(bounds.rect);
    //    let { rect = new Rect(bounds.rect) } = props;

    //let { bounds = doc.measures || doc.getBounds() } = props;
    rect.round(1.27);
    //rect.outset(1.27);
    rect.round(2.54);
    let viewBox = rect;
    let { index } = props;

    this.rect = rect;
    this.bounds = bounds;

    const { width, height } = (this.size = rect.size.toCSS('mm'));
    console.log('EagleSVGRenderer', {
      bounds,
      width,
      height
    });

    this.debug('SVGRenderer.render', { transform, index });

    let gridElement = doc.lookup('/eagle/drawing/grid');
    let attrs = {
      bg: trkl({ color: '#ffffff', visible: true }),
      grid: trkl({
        color: '#0000aa',
        width: 0.01,
        visible: true
      })
    };
    const { bg, grid } = attrs;
    this.attrs = attrs;

    trkl.bind(this, { bg, grid });

    let svgElem = h(
      Drawing,
      {
        rect: viewBox,

        bounds,
        attrs,
        grid: gridElement,
        nodefs: index > 0,
        width,
        height,
        transform: transform.slice(1)
        /*   styles: [
          'text { font-size: 0.0875rem; }',
          'text { stroke: none; }',
          '.pad { fill: #4ba54b; }',
          '.pad > text { fill: #ff33ff; }',
          '.pad > text { font-size: 0.04375rem; }',
           'rect { stroke: none; }',
          'path { stroke-linejoin: round; stroke-linecap: round; }'
        ]*/
      },
      children
    );

    return svgElem;
  }
}
EagleSVGRenderer.horizontalAlignment = ['start', 'middle', 'end'];
EagleSVGRenderer.verticalAlignment = ['hanging', 'mathematical', 'baseline'];
