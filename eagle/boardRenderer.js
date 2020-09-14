import Util from '../util.js';
import { Point, Line } from '../geom.js';
import { TransformationList } from '../geom/transformation.js';
import { EagleElement } from './element.js';
import { Cross, Arc, Origin } from './components.js';
import { RGBA } from '../color.js';
import { Palette } from './common.js';
import { VERTICAL, HORIZONTAL, RotateTransformation, LayerAttributes, LinesToPath, MakeCoordTransformer, Rotation } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';
import { Repeater } from '../repeater/repeater.js';
import { useTrkl, ElementToClass, EscapeClassName, UnescapeClassName } from './renderUtils.js';

import { h, Component, useEffect } from '../dom/preactComponent.js';

export class BoardRenderer extends EagleSVGRenderer {
  static palette = Palette.board((r, g, b) => new RGBA(r, g, b));

  constructor(obj, factory) {
    super(obj, factory);
    const { layers, elements, signals, sheets } = obj;

    let board = obj;

    this.elements = elements;
    this.signals = signals;
    //this.plain = board.plain; //get('plain', (v, l) => EagleElement.get(board, l));
    this.layers = layers;
    this.sheets = sheets;

    this.setPalette(BoardRenderer.palette);
  }

  renderItem(item, parent, opts = {}) {
    const layer = item.layer || this.layers.tPlace;
    const color = typeof item.getColor == 'function' ? item.getColor() : BoardRenderer.palette[16];

    const svg = (elem, attr, parent) =>
      this.create(elem, {
          class: ElementToClass(item),
          'data-path': item.path.toString(' '),
          ...(layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {}),
          ...attr
        },
        parent
      );
    const { coordFn = i => i, name, value } = opts;

    //    console.log('renderItem', { name, value });

    switch (item.tagName) {
      case 'xvia':
      case 'xpad': {
        const { name, drill, diameter, shape } = item;
        const { x, y } = coordFn(item);

        const ro = +((diameter || 1.5) / 2.54).toFixed(3);
        const ri = +(drill / 3).toFixed(3);
        let data = '';
        const transform = `translate(${x},${y})`;
        const layer = this.layers.Pads;

        //  console.log('item:', item);
        const padColor = item.getColor() || this.palette[2];

        switch (shape) {
          case 'long': {
            const w = ro * 0.75;
            data = `M 0 ${-ro} l ${w} 0 A ${ro} ${ro} 0 0 1 ${w} ${ro} l ${-w * 2} 0 A ${ro} ${ro} 0 0 1 ${-w} ${-ro}`;
            break;
          }
          case 'square': {
            const points = [new Point(-1, -1), new Point(1, -1), new Point(1, 1), new Point(-1, 1)].map(p => p.prod(ro * 1.27));

            data = points.map((p, i) => `${i == 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            break;
          }
          case 'octagon': {
            const points = Util.range(0, 7).map(i => Point.fromAngle((Math.PI * i) / 4 + Math.PI / 8, ro * 1.4));

            data = points.map((p, i) => `${i == 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            break;
          }
          default: {
            data = `M 0 ${-ro} A ${ro} ${ro} 0 0 1 0 ${ro} A ${ro} ${ro} 0 0 1 0 ${-ro}`;
            break;
          }
        }

        svg('path', {
            fill: padColor,
            d: data + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
            transform
          },
          parent
        );

        this.debug('name:', name);
        if(name) {
          svg('tspan', {
              children: name,
              ...EagleSVGRenderer.alignmentAttrs('center', HORIZONTAL)
            },
            svg(
              'text',
              {
                fill: 'hsla(180,100%,60%,0.5)',
                stroke: 'none',
                //                'stroke-width': 0.01,
                x: 0.04,
                y: -0.04,
                ...(layer ? { 'data-layer': `${layer.number} ${layer.name}` } : {}),
                //     filter: 'url(#shadow)',
                ...EagleSVGRenderer.alignmentAttrs('center', VERTICAL),
                'font-size': 0.6,
                'font-style': 'bold',
                // 'font-family': 'Fixed Medium',
                transform: `${transform} ${RotateTransformation(opts.rot, -1)} scale(1,-1)`
              },
              parent
            )
          );
        }
        break;
      }
      default: {
        //       console.log('boardRenderer other renderItem', { item, parent, transformation: this.transform.filter(t => ['translate'].indexOf(t.type) == -1) });
        super.renderItem(item, parent, { ...opts, color });
        break;
      }
    }
  }

  renderCollection(coll, parent, opts = {}) {
    const { predicate = i => true, transform, pos, rot } = opts;
    this.debug(`BoardRenderer.renderCollection`, { transform, pos, rot });

    let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

    let wireMap = new Map(),
      other = [];
    let layers = {},
      widths = {};

    const { tPlace } = this.layers;

    for(let item of coll) {
      if(item.tagName === 'wire') {
        const layerId = item.attributes.layer || tPlace.number;

        /*           if(layerId != 21) */ {
          layers[layerId] = item.layer || tPlace;

          if(item.layer) item.layer.elements.add(item);

          if('width' in item) widths[layerId] = item.width;
          if(wireMap.has(layerId)) wireMap.get(layerId).push(item);
          else wireMap.set(layerId, [item]);
          continue;
        }
      }
      other.push(item);
    }

    for(let item of other) if(predicate(item) && item.tagName == 'pad') this.renderItem(item, parent, { ...opts });

    for(let item of other) if(predicate(item) && item.tagName != 'pad') this.renderItem(item, parent, { ...opts });

    for(let [layerId, wires] of wireMap) {
      let classList = (parent && parent.classList) || [];
      if([...classList].indexOf('plain') != -1) continue;

      const lines = wires.map(wire => {
        let line = new Line(coordFn(wire));
        line.element = wire;
        if('curve' in wire) line.curve = wire.curve;
        return line;
      });

      this.debug('Lines:', [...lines]);

      const path = LinesToPath(lines);
      const layer = layers[layerId] || this.layers.Bottom;
      const width = widths[layerId];
      this.debug('Lines:', { path, layer, width });

      const color = layer.color;
      //this.debug('color:', color, layer.color);

      const WirePath = ({ className, path, color, width, layer }) => {
        let visible = 'yes' == useTrkl(layer.handlers.visible);
        this.debug('Lines visible:', visible);

        return h('path', {
          className,
          //...LayerAttributes(layer),
          d: path,
          stroke: color + '',
          'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
          fill: 'none',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'data-layer': `${layer.number} ${layer.name}`,
          style: visible ? undefined : { display: 'none' }
        });
      };
      this.create(WirePath, { class: ElementToClass(wires[0], layer.name), path, color, width, layer }, parent);
    }
  }

  renderElement(element, parent) {
    const { name, library, value, x, y, rot } = element;

    this.debug(`BoardRenderer.renderElement`, { name, library, value, x, y, rot });

    let transform = new TransformationList();
    let rotation = Rotation(rot);

    transform.translate(x, y);
    let elementName = EscapeClassName(name);

    const g = this.create('g',
      {
        id: `element-${elementName}`,
        class: ElementToClass(element),
        'data-name': name,
        'data-value': value,
        'data-library': library.name,
        'data-package': element.package.name,
        'data-path': element.path.toString(' '),
        'data-rot': rot,
        transform: transform.concat(rotation)
      },
      parent
    );
    this.renderCollection(element.package.children, g, {
      name,
      value,
      rot,
      transform: rotation.slice()
    });
    this.create(Origin, { x, y, color: '#f0f', element, layer: this.layers['tOrigins'] }, g);

    /*    let angle = Util.randInt(0, 360);
    let angles = [angle, angle + 120, angle + 240, angle + 360];
    this.create(Arc, { x, y, radius: 1, width: 0.508, color: '#f00', startAngle: angles[0], endAngle: angles[1] }, parent);
    this.create(Arc, { x, y, radius: 1, width: 0.508, color: '#f80', startAngle: angles[1], endAngle: angles[2] }, parent);
    this.create(Arc, { x, y, radius: 1, width: 0.508, color: '#ff0', startAngle: angles[2], endAngle: angles[3] }, parent);
    this.create(Arc, { x, y, radius: 2, width: 0.127, color: '#08f', startAngle: angles[0], endAngle: angles[3] }, parent);*/
  }

  renderSignal(signal, parent, options = {}) {
    let signalGroup = this.create('g', { id: `signal-${EscapeClassName(signal.name)}`, class: ElementToClass(signal), 'data-path': signal.path.toString(' ') }, parent);

    this.debug(`BoardRenderer.renderSignal`, signal.name);

    return this.renderCollection(signal.children, signalGroup, options);
  }

  render(doc = this.doc /*, parent, props = {}*/) {
    let parent, props;
    /*if(!this.bounds)
    this.bounds = doc.getBounds();*/
    let transform = this.transform;
    parent = super.render(doc, { transform });

    const { bounds, rect } = this;
    this.debug(`BoardRenderer.render`, { bounds, rect });
    //this.renderLayers(parent);
    let plainGroup = this.create('g', { class: 'plain', transform }, parent);
    let signalsGroup = this.create('g', { class: 'signals', strokeLinecap: 'round', transform }, parent);
    let elementsGroup = this.create('g', { class: 'elements', transform }, parent);
    this.debug('bounds: ', bounds);
    for(let signal of this.signals.list)
      this.renderSignal(signal, signalsGroup, {
        predicate: i => i.attributes.layer == '16'
      });
    for(let signal of this.signals.list)
      this.renderSignal(signal, signalsGroup, {
        predicate: i => i.attributes.layer == '1'
      });
    for(let signal of this.signals.list)
      this.renderSignal(signal, signalsGroup, {
        predicate: i => i.attributes.layer === undefined
      });
    for(let element of this.elements.list) this.renderElement(element, elementsGroup);
    let plain = [...this.doc.plain];
    this.renderCollection(plain, plainGroup);
    this.bounds = bounds;
    this.rect = bounds.rect;
    return parent;
  }
}

EagleSVGRenderer.rendererTypes.brd = BoardRenderer;
