import { EagleElement } from './element.js';
import Util from '../util.js';
import { Size } from '../dom.js';
import { Point, Rect, BBox, TransformationList } from '../geom.js';
import { Rotation, VERTICAL, HORIZONTAL, HORIZONTAL_VERTICAL, ClampAngle, AlignmentAngle, LayerAttributes, MakeCoordTransformer } from './renderUtils.js';
import { ElementToComponent, Pattern, Grid } from './components.js';
import trkl from '../trkl.js';
import { h, Component } from '../dom/preactComponent.js';
import { ColorMap } from '../draw/colorMap.js';

export class EagleSVGRenderer {
  static rendererTypes = {};

  palette = null;
  id = 0;
  layers = {};
  colors = {};
  transformStack = [];
  transform = new TransformationList();

  itemMap = new Map();
  path2component = null;
  component2path = new WeakMap();

  /*setItem(path, item) {
    const { itemMap } = this;
    itemMap.set(path + '', item);
  }

  setComponent(path, component) {
    const { path2component, component2path } = this;
    path2component.set(path + '', component);
    component2path.set(component, path);
  }

  getItem(path) {
    const { doc } = this;
    if(Util.isObject(path) && path.type !== undefined) path = this.component2path.get(path);
    return doc.mapper.get(path);
  }

  getComponent(path) {
    const { path2component } = this;
    if(Util.isObject(path) && path.path !== undefined) path = path.path;

    return path2component.get(path + '');
  }
*/
  constructor(doc, factory) {
    if(new.target === EagleSVGRenderer) throw new Error('Use SchematicRenderer or BoardRenderer');
    this.doc = doc;
    let renderer = this;
    this.path2component = Util.mapWrapper(new Map(),
      (path) => (Util.isObject(path) && path.path !== undefined ? path.path : path) + '',
      (key) => new ImmutablePath(key)
    );
    const insertCtoP = Util.inserter(this.component2path);
    const insert = Util.inserter(this.path2component, (k, v) => insertCtoP(v, k));
    this.create = function (tag, attrs, children, parent, element) {
      let ret = factory(tag, attrs, children, parent, element);
      let path = attrs['data-path'];
      if(path && !element) {
        element = EagleElement.get(doc, path);
      }
      if(!element) element = EagleElement.currentElement;
      if(!path && element) path = element.path;
      if(path) insert(path, ret);
      return ret;
    };
  }

  get maps() {
    const { path2component, component2path } = this;
    return [path2component, component2path];
  }

  pushTransform(transform) {
    transform = this.transform.concat(transform);

    this.transformStack.push(this.transform);
    this.transform = transform;
  }

  popTransform() {
    this.transform = this.transformStack.pop();
  }

  static create(doc, factory) {
    let renderer = new EagleSVGRenderer.rendererTypes[doc.type](doc, factory);
    return renderer;
  }

  setPalette(palette) {
    //console.log("setPalette 1",palette)
    palette = palette.map((color, i) => trkl(((color.valueOf = () => i), color)));
    let ncolors = palette.length;
    palette = palette.reduce((acc, color, i) => ({ ...acc, [i + '']: color }), {
      length: trkl(ncolors)
    });
    //console.log("setPalette 2",palette)
    //palette = new ColorMap(palette);
    console.log('setPalette 2', palette);

    palette = window.palette = trkl.bind(Util.define({}, { handlers: palette }), palette);
    Object.setPrototypeOf(palette,
      Object.defineProperties(
        {
          *[Symbol.iterator]() {
            for(let i = 0; i < this.length; i++) yield this[i];
          }
        },
        {
          constructor: { value: class Palette {}, enumerable: false, writable: false, configurable: false },
          handlers: { value: null, enumerable: false, writable: true },
          length: { value: 0, enumerable: false, configurable: true, writable: true }
        }
      )
    );
    //console.log("setPalette 3",palette)
    //console.log("setPalette 4",palette)

    Object.defineProperty(this, 'palette', {
      value: palette || (this.doc.type == 'brd' ? BoardRenderer.palette : SchematicRenderer.palette),
      writable: false,
      configurable: false
    });
  }

  /*
  findLayer(id) {
    if(id instanceof EagleElement) {
      if('layer' in id) id = id.layer;
      else if(id.tagName == 'pad') id = 'Pads';
      else if(id.tagName == 'description') id = 'Document';
    }
    const { number, name } = Util.isObject(id) ? { number: id.number, name: id.name } : { number: +id, name: '' + id };
    return this.getLayer(typeof number == 'number' ? number : name);
  }

  getLayer(id) {
    if(this.layers[id]) return this.layers[id];

    for(let layer of this.layers.list) {
      if(layer.number === id) return layer;
      if(layer.name === id) return layer;
    }
  }
*/
  getColor(color) {
    let c = this.palette[color] || /*this.colors[color] || */ 'rgb(165,165,165)';
    //this.debug('getColor', color, c);

    /* if(c)
    Util.colorDump([c]);*/
    return c;
  }

  layerOf(element) {
    let layer;
    do {
      layer = element.getAttribute('data-layer') || element.getAttribute('data-layer-id') || element.getAttribute('data-layer-name') || element.getAttribute('layer');
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
      const layer = this.create('g',
        {
          id: `layer-${l.number}`,
          className: 'layer',
          //...LayerAttributes(l),
          stroke,
          'data-name': l.name,
          'data-path': l.path.toString(' '),
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
    let { labelText, transform = new TransformationList() } = opts;

    /*   this.debug(`EagleSVGRenderer.renderItem`, item);
    this.debug(`EagleSVGRenderer.renderItem`, item.xpath().toString());*/

    const svg = (elem, attr, parent) => this.create(elem, { className: item.tagName, 'data-path': item.path.toString(' '), ...attr }, parent);

    let coordFn = transform ? MakeCoordTransformer(transform) : (i) => i;
    const { layer } = item;
    const color = typeof item.getColor == 'function' ? item.getColor() : this.constructor.palette[16];

    const comp = ElementToComponent(item);
    if(comp) {
      //console.log('EagleSVGRenderer render component ', this.transform.filter(t => ['translate'].indexOf(t.type) == -1));
      const elem = svg(comp,
        {
          data: item,
          transform,
          opts: {
            ...opts,
            transformation: this.transform.filter((t) => ['translate'].indexOf(t.type) == -1)
          }
        },
        parent
      );
      return;
    }

    switch (item.tagName) {
      /*case 'wire': {
        const { width, curve = '' } = item;
        const { x1, y1, x2, y2 } = coordFn(item);
        svg('line', {
            stroke: color,
            x1,
            x2,
            y1,
            y2,
            'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
            'data-curve': curve,
            'data-layer': layer.name,
            transform
          },
          parent
        );
        break;
      }*/
      /*case 'rectangle': {
        const { x1, x2, y1, y2 } = coordFn(item);
        let rect = Rect.from({ x1, x2, y1, y2 });
        let rot = Rotation(item.rot);
        let center = rect.center;
        svg('rect', {
            stroke: 'none',
            fill: color,
            ...rect.toObject(),
            transform: `translate(${center}) ${rot} translate(${center.prod(-1)})`
          },
          parent
        );
        break;
      }*/
      case 'label': {
        const { align } = item;
        const { x, y } = coordFn(item);
        const transform = new TransformationList(`translate(${x},${y})`);

        svg('text', {
            fill: '#f0f',
            stroke: 'none',
            x,
            y,
            ...EagleSVGRenderer.alignmentAttrs(align),
            children: labelText /*,            transform: transform.undo(transformation)*/,
            'font-size': '0.1px',
            'font-family': 'Fixed Medium'
          },
          parent
        );
        break;
      }

      /*  case 'text': {
        let { children = [], text: innerText, align, size, font, rot } = item;
        let text = innerText || labelText || children.join('\n');
        let { x, y } = coordFn(item);
        this.debug('text', { text });
        if(text.startsWith('>')) {
          const prop = text.slice(1).toLowerCase();
          this.debug('text', { text, prop, opts });
          text = prop in opts ? opts[prop] : text;
        }
        if(text == '') break;
        const translation = new TransformationList(`translate(${x},${y})`);
        this.debug('translation:', Util.className(translation));
        const rotation = translation.concat(Rotation(rot));
        this.debug('rotation:', Util.className(rotation));
        let wholeTransform = transform.concat(Rotation(rot));
        let wholeAngle = ClampAngle(wholeTransform.decompose().rotate);
        let undoTransform = new TransformationList().scale(1, -1).rotate(wholeAngle);
        let undoAngle = ClampAngle(undoTransform.decompose().rotate);
        let angle = ClampAngle(undoAngle - wholeAngle, 180);
        const finalTransformation = rotation
          .concat(undoTransform)
          .collapseAll();
        this.debug(`wholeAngle ${text}`, wholeAngle);
        this.debug(`finalTransformation ${text}`, finalTransformation.toString());
        this.debug(`finalTransformation ${text}`, finalTransformation.translation, finalTransformation.rotation, finalTransformation.scaling);
        if(finalTransformation.rotation) {
          if(finalTransformation.rotation.angle < 0) finalTransformation.rotation.angle = Math.abs(finalTransformation.rotation.angle);
        }
        const baseAlignment = EagleSVGRenderer.alignment(align);
        const rotateAlignment = AlignmentAngle(wholeAngle);
        const alignment = baseAlignment
          .clone()
          .rotate((rotateAlignment * Math.PI) / 180)
          .round(0.5);
        this.debug(`render alignment ${text}`,
          Util.map({ baseAlignment, rotateAlignment, alignment }, (k, v) => [k, v + '']),
          EagleSVGRenderer.alignmentAttrs(alignment, VERTICAL)
        );
        const e = svg('text',
          {
            fill: color,
            stroke: 'none',
            'stroke-width': 0.05,
            x,
            y,
            ...EagleSVGRenderer.alignmentAttrs(alignment, VERTICAL),
            transform: finalTransformation
          },
          parent
        );g
        let attrs = EagleSVGRenderer.alignmentAttrs(alignment, HORIZONTAL);
        if(align !== undefined) attrs['data-align'] = align;
        this.create('tspan', { ...attrs, children: text }, e);
        break;
      }
*/
      /*      case 'circle': {
        const { width, radius } = item;
        const { x, y } = coordFn(item);
        svg('circle', {
            stroke: color,
            cx: x,
            cy: y,
            r: radius,
            'stroke-width': width * 0.8,
            fill: 'none'
          },
          parent
        );
        break;
      }*/
      case 'contactref':
        break;
      default: {
        const { x, y } = coordFn(item);
        //  console.log('EagleSVGRenderer.renderItem', { item, parent, opts });
        //super.renderItem(item,parent,opts);
        break;
      }
    }
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

  render(doc, parent, props = {}) {
    doc = doc || this.doc;

    let bounds = doc.getBounds();
    console.log('EagleSVGRenderer.render', { bounds });
    let rect = bounds.toRect(Rect.prototype);

    rect.outset(1.27);

    /*  rect.round(2.54, 6);
     */
    // Util.tryCatch(() => this.debug('stack:', (window.stack = Util.getCallerStack(1)).toString()));

    this.rect = rect;
    this.bounds = BBox.fromRect(rect);
    console.log('EagleSVGRenderer.render', { bounds: this.bounds, rect });

    this.debug('bounds:', this.bounds.toString({ separator: ' ' }));

    const { width, height } = new Size(bounds).toCSS('mm');

    this.transform.clear();
    this.transform.translate(0, rect.height + rect.y);
    this.transform.scale(1, -1);

    const transform = this.transform + ''; //` translate(0,${(bounds.height+bounds.y)}) scale(1,-1) `;
    this.debug(bounds);

    console.log('viewBox rect:', rect, rect.toString(), rect.valueOf);

    if(!parent)
      parent = this.create('svg',
        {
          /*  width,
          height,*/
          viewBox: new Rect(rect).toString(), //+'', //rect.clone(r => (r.y = 0)).toString({ separator: ' ' }),
          preserveAspectRatio: 'xMinYMin', //"xMidYMid meet"
          ...props
        },
        parent
      );

    const cssStyle = this.create('style', { children: [`text { font-size: 0.0875rem; }`] }, parent);
    //this.renderLayers(parent);
    /*    const step = 2.54;
    const gridColor = '#0000aa';
    const gridWidth = 0.05;

*/
    let grid = doc.lookup('/eagle/drawing/grid');

    let defs =
      /*

    this.create('path', {
        d: `M ${step},0 L 0,0 L 0,${step}`,
        fill: 'none',
        stroke: gridColor,
        'stroke-width': gridWidth
      },
      this.create('pattern', { id: 'grid', width: step, height: step, patternUnits: 'userSpaceOnUse' }, defs)
    );*/
      this.create('defs', { children: h(Pattern, { id: 'grid', step: 2.54, color: '#0000aa', width: 0.05 }) }, parent);

    this.create('g', { id: 'bg', children: h('g', { transform }, h(Grid, { data: grid, rect, background: 'rgb(255,255,255)' })) }, parent);

    //  this.create('rect', { ...rect.toObject(), id: 'grid', fill: 'url(#grid)' }, bgGroup);

    this.debug(`EagleSVGRenderer.render`, { doc, parent, props });

    return parent;
  }
}
EagleSVGRenderer.horizontalAlignment = ['start', 'middle', 'end'];
EagleSVGRenderer.verticalAlignment = ['hanging', 'mathematical', 'baseline'];
