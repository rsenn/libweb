import { Point } from '../geom/point.js';
import { Line } from '../geom/line.js';
import { TransformationList } from '../geom/transformation.js';
import { EagleElement } from './element.js';
import { Util } from '../util.js';
import { Rotation } from './common.js';
import { VERTICAL, HORIZONTAL, RotateTransformation, LayerAttributes, LinesToPath, MakeCoordTransformer } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';

export class BoardRenderer extends EagleSVGRenderer {
  static palette = ['hsl(230,100%,40%)', 'rgb(252,245,38)', 'rgb(0,126,24)', 'rgb(0,23,185)', 'rgb(79,9,0)', 'rgb(62,46,25)', 'hsl(30,100%,55%)', 'rgb(255,180,83)', 'rgb(105,82,33)', 'rgb(251,252,247)', 'rgb(140,95,51)', 'rgb(132,148,109)', 'rgb(168,166,32)', 'rgb(16,6,61)', 'rgb(178,27,0)', 'hsl(30,0%,80%)'];

  constructor(obj, factory) {
    super(obj, factory);
    const { settings, layers, libraries, classes, designrules, elements, signals, plain, sheets } = obj;

    this.elements = elements;
    this.signals = signals;
    this.plain = [...board.getAll('plain', (v, l) => new EagleElement(board, l))][0];
    this.layers = layers;
    this.sheets = sheets;

    this.setPalette(BoardRenderer.palette);
  }

  renderItem(item, parent, opts = {}) {
    const layer = item.layer;
    const color = layer ? this.getColor(layer.color) : this.getColor(6);
    const svg = (elem, attr, parent) =>
      this.create(
        elem,
        {
          className: item.tagName, //...LayerAttributes(layer),
          ...attr
        },
        parent
      );
    const { labelText, coordFn = i => i, rot } = opts;
    switch (item.tagName) {
      case 'via':
      case 'pad': {
        const { name, drill, diameter, shape } = item;
        const { x, y } = coordFn(item);

        const ro = +((diameter || 1.5) / 2.54).toFixed(3);
        const ri = +(drill / 3).toFixed(3);
        let data = '';
        const transform = `translate(${x},${y})`;

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

        svg(
          'path',
          {
            fill: this.colors['Pads'] || this.palette[2],
            d: data + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
            transform
          },
          parent
        );

        if(name) {
          svg(
            'tspan',
            {
              innerHTML: name,
              ...EagleSVGRenderer.alignmentAttrs('center', HORIZONTAL)
            },
            svg(
              'text',
              {
                fill: 'hsl(180,100%,60%)',
                stroke: 'black',
                'stroke-width': 0.01,
                x: 0.04,
                y: -0.04,
                filter: 'url(#shadow)',
                ...EagleSVGRenderer.alignmentAttrs('center', VERTICAL),
                'font-size': 0.9,
                fontStyle: 'bold',
                'font-family': 'Fixed',
                transform: `${transform} ${RotateTransformation(opts.rot, -1)} scale(1,-1)`
              },
              parent
            )
          );
        }
        break;
      }
      default: {
        super.renderItem(item, parent, { ...opts, color });
        break;
      }
    }
  }

  renderCollection(coll, parent, opts = {}) {
    const { predicate = i => true, transform, pos, rot } = opts;
    //console.log(`BoardRenderer.renderCollection`, { transform, pos, rot });

    let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

    let wireMap = new Map(),
      other = [];
    let layers = {},
      widths = {};

    for(let item of coll) {
      if(item.tagName === 'wire') {
        const layerId = item.attributes.layer;
        layers[layerId] = item.layer;
        if('width' in item) widths[layerId] = item.width;
        if(wireMap.has(layerId)) wireMap.get(layerId).push(item);
        else wireMap.set(layerId, [item]);
      } else {
        other.push(item);
      }
    }

    for(let item of other) if(predicate(item) && item.tagName == 'pad') this.renderItem(item, parent, { ...opts });

    for(let item of other) if(predicate(item) && item.tagName != 'pad') this.renderItem(item, parent, { ...opts });

    for(let [layerId, wires] of wireMap) {
      let classList = (parent && parent.classList) || [];
      if([...classList].indexOf('plain') != -1) continue;

      const lines = wires.map(wire => {
        let line = new Line(coordFn(wire));
        if('curve' in wire) line.curve = wire.curve;
        return line;
      });

      //console.log('Lines:', [...lines]);

      const path = LinesToPath(lines);
      const layer = layers[layerId];
      const width = widths[layerId];

      //console.log("layerId:", layerId);
      //console.log("layers:", layers);
      const color = this.getColor(layer.color);

      this.create(
        'path',
        {
          className: 'wire',
          //  ...LayerAttributes(layer),
          d: path,
          stroke: color,
          'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
          fill: 'none',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        },
        parent
      );
    }
  }

  renderElement(element, parent) {
    const { name, library, value, x, y, rot } = element;

    let transform = new TransformationList();
    let rotation = Rotation(rot);

    transform.translate(x, y);

    const g = this.create(
      'g',
      {
        id: `element.${name}`,
        className: 'element',
        'data-name': name,
        'data-value': value,
        'data-library': library.name,
        'data-package': element.package.name
        //SStransform: transform.concat(rotation)
      },
      parent
    );
    this.renderCollection(element.package.children, g, {
      name,
      value,
      rot,
      transform: rotation.slice()
    });
  }

  renderSignal(signal, parent, options = {}) {
    let signalGroup = this.create('g', { className: `signal.${signal.name}` }, parent);

    return this.renderCollection(signal.children, signalGroup, options);
  }

  render(doc = this.doc, parent) {
    parent = super.render(doc, parent);

    this.renderLayers(parent);

    let signalsGroup = parent; // this.create('g', { className: 'signals', strokeLinecap: 'round' }, parent);
    let elementsGroup = parent; //this.create('g', { className: 'elements' }, parent);

    let plainGroup = this.create('g', { className: 'plain' }, parent);

    for(let element of this.elements.list) this.renderElement(element, elementsGroup);

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

    let [plain] = [...board.getAll('plain')];

    this.renderCollection(plain.children, plainGroup);

    return parent;
  }
}
EagleSVGRenderer.BOARD = BoardRenderer;

EagleSVGRenderer.rendererTypes.brd = BoardRenderer;
