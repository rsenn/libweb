import Util from '../util.js';
import { Point, Line } from '../geom.js';
import { TransformationList } from '../geom/transformation.js';
import { EagleElement } from './element.js';
import { Cross, Arc, Origin, WirePath } from './components.js';
import { RGBA } from '../color.js';
import { Palette } from './common.js';
import { VERTICAL, HORIZONTAL, RotateTransformation, LayerAttributes, LinesToPath, MakeCoordTransformer, MakeRotation } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';
import { Repeater } from '../repeater/repeater.js';
import { useTrkl, ElementToClass, EscapeClassName, UnescapeClassName } from './renderUtils.js';
import { h, Component, Fragment, useEffect } from '../dom/preactComponent.js';

export class BoardRenderer extends EagleSVGRenderer {
  static palette = Palette.board((r, g, b) => new RGBA(r, g, b));

  constructor(obj, factory) {
    super(obj.document, factory);
    const { layers, elements, signals, sheets } = obj;

    let board = obj.tagName == 'board' ? obj : obj.document.mainElement;

    this.elements = elements;
    this.signals = signals;
    //this.plain = board.plain; //get('plain', (v, l) => EagleElement.get(board, l));
    this.layers = layers;
    this.board = board;

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
            const points = [new Point(-1, -1), new Point(1, -1), new Point(1, 1), new Point(-1, 1)].map(p =>
              p.prod(ro * 1.27)
            );

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
          let t = RotateTransformation(opts.rot, -1);
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
                transformation: transform.concat([t]),
                transform: `${transform} ${t} scale(1,-1)`
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
    const { predicate = i => true, transform, pos, rot, name, layer, props = {}, flat } = opts;
    //  this.debug(`BoardRenderer.renderCollection`, { name, transform, pos, rot, layer },coll);
    this.debug(`BoardRenderer.renderCollection`, coll);
    let coordFn = transform ? MakeCoordTransformer(transform) : i => i;
    let { class: addClass, ...addProps } = props;
    let wireMap = new Map(),
      other = [],
      layers = {},
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
      if(predicate(item)) other.push(item);
    }

    for(let item of other) if(predicate(item) && item.tagName == 'pad') this.renderItem(item, parent, { ...opts });

    for(let item of other) if(predicate(item) && item.tagName != 'pad') this.renderItem(item, parent, { ...opts });

    for(let [layerId, wires] of wireMap) {
      let classList = (parent && parent.classList) || [];
      if([...classList].indexOf('plain') != -1) continue;

      let lines = new LineList(wires.map(wire => {
          let line = new Line(coordFn(wire)).round(0.0127, 6);
          line.element = wire;
          if(wire.curve !== undefined) line.curve = wire.curve;
          line.width = wire.width;
          return line;
        })
      );

      this.debug('Lines:', name, [...lines]);

      /*const cmdArr = cmds.map(cmd => cmd.split(/[^-.0-9A-Za-z]/g));
      const positions = cmdArr.map(cmd => cmd.slice(-2).map(n => +n));
      const path = cmdArr.slice(1).map((cmd, i) => [['M', ...positions[i]], cmd[0].toLowerCase() == 'z' ? ['L', ...positions[0]] : cmd]);
      this.debug('wires.length:', wires.length, ' lines.length:', lines.length, ' cmds.length:', cmds.length);
      this.debug('Lines:', { path, cmds, positions });
*/
      const layer = layers[layerId] || this.layers.Bottom;
      const width = widths[layerId];

      const color = layer.color;
      //this.debug('color:', color, layer.color);
      if(true) {
        let cmds = LinesToPath(lines);

        if(flat) cmds = cmds.flat();

        console.log('cmds:', cmds);

        this.create(WirePath, {
            class: classNames(addClass, ElementToClass(wires[0], layer.name)),
            cmds,
            color,
            width,
            layer,
            separator: flat ? ' ' : '\n',
            ...addProps
          },
          parent
        );
      } else {
        window.lines = lines.slice();
        // lines.ordered();
        LinesToPath(lines).map(cmds =>
          this.create(WirePath, {
              class: classNames(addClass, ElementToClass(wires[0], layer.name)),
              cmds,
              color,
              width,
              layer,
              ...addProps
            },
            parent
          )
        );
      }
    }
  }

  renderElement(element, parent) {
    const { name, library, value, x, y, rot } = element;

    this.debug(`BoardRenderer.renderElement`, { name, library, value, x, y, rot });

    let transform = new TransformationList();
    let rotation = MakeRotation(rot);

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
      transformation: rotation.slice(),
      flat: true
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
    this.debug(`BoardRenderer.renderSignal`, signal.name);
    let children = signal.children;
    if('layer' in options) {
      let layer = options.layer ? this.doc.layers[options.layer] : null;
      children = children.filter(child => (options.layer ? child.layer : !child.layer));
      if(layer) {
        children = children.filter(child => child.layer.number == layer.number);
        this.debug('Filtering', layer.number, layer.name, ...children.map(c => '\n' + c.toXML()));
      }
    }
    if(children.length > 0) {
      const className = ElementToClass(signal);
      const id = `signal-${EscapeClassName(signal.name)}${
        typeof options.layer == 'string' && options.layer != '' ? '-' + options.layer.toLowerCase() : ''
      }`;
      let props = {
        //id: ,
        class: className,
        'data-path': signal.path.toString(' ')
      };
      console.log('class:',
        className,
        'children.length:',
        children.length,
        ' options.layer:',
        options.layer,
        'cond:',
        children.length > 1 && !(typeof options.layer == 'string')
      );
      if(children.length > 1 && options.layer != '') {
        delete options.layer;
        let signalGroup = this.create('g', { id, ...props }, parent);
        return this.renderCollection(children, signalGroup, options);
      }

      return this.renderCollection(children, this.create(Fragment, {}, parent), { ...options, props });
    }
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
    let signalsGroup = this.create('g',
      { class: 'signals', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform },
      parent
    );
    let elementsGroup = this.create('g', { class: 'elements', transform }, parent);
    this.debug('bounds: ', bounds);
    for(let signal of this.signals.list)
      this.renderSignal(signal, signalsGroup, {
        layer: 'Bottom',
        predicate: i => i.layer && i.layer.name == 'Bottom'
      });
    for(let signal of this.signals.list)
      this.renderSignal(signal, signalsGroup, {
        layer: 'Top',
        predicate: i => i.layer && i.layer.name == 'Top'
      });
    for(let signal of this.signals.list)
      this.renderSignal(signal, signalsGroup, {
        layer: '',
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
