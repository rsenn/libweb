import { partition } from '../misc.js';
import { Point, Line, LineList, Rect } from '../geom.js';
import { TransformationList, Translation } from '../geom/transformation.js';
import { EagleElement } from './element.js';
import { Cross, Arc, Origin, WirePath, Element, ElementToComponent } from './components.js';
import { RGBA } from '../color.js';
import { Palette } from './common.js';
import { VERTICAL, HORIZONTAL, RotateTransformation, LayerAttributes, LinesToPath, MakeCoordTransformer, MakeRotation } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';
import { Repeater } from '../repeater/repeater.js';
import { useTrkl, ElementToClass, EscapeClassName, UnescapeClassName, RenderShape } from './renderUtils.js';
import { h, Component, Fragment, useEffect } from '../dom/preactComponent.js';
import { classNames } from '../classNames.js';
import { digit2color, GetFactor, GetColorBands, ValueToNumber, NumberToValue, GetExponent, GetMantissa } from '../eda/colorCoding.js';
import { EagleNodeMap } from './nodeMap.js';

export class BoardRenderer extends EagleSVGRenderer {
  static palette = Palette.board((r, g, b) => new RGBA(r, g, b));

  constructor(obj, factory) {
    super(obj.document, factory);
    const { layers, elements, signals, sheets } = obj;
    const doc = obj.document;

    let board = obj.tagName == 'board' ? obj : doc.mainElement;

    this.elements = elements;
    this.signals = EagleNodeMap.create(obj.drawing.board.signals.children, 'name');

    //this.plain = board.plain; //get('plain', (v, l) => EagleElement.get(board, l));
    //this.layers = Object.getOwnPropertyNames(doc.layers).map(n => [n, doc.layers[n]]);
    this.layers = EagleNodeMap.create(obj.drawing.layers.children, 'name');

    this.board = board;

    this.setPalette(BoardRenderer.palette);
  }

  renderItem(item, parent, opts = {}) {
    const layer = item.layer || this.layers.tPlace;
    const color = typeof item.getColor == 'function' ? item.getColor() : BoardRenderer.palette[16];

    const svg = (elem, attr, parent) =>
      this.create(
        elem,
        {
          class: ElementToClass(item),
          'data-path': item.path.toString(' '),
          ...(layer
            ? {
                'data-layer': `${layer.number} ${layer.name}`
              }
            : {}),
          ...attr
        },
        parent
      );
    const { coordFn = i => i, name, value } = opts;

    switch (item.tagName) {
      case 'xvia':
      case 'xpad': {
        const { name, drill, diameter, shape } = item;
        const { x, y } = coordFn(item);

        const ro = +((diameter || 1.5) / 2.54).toFixed(3);
        const ri = +(drill / 3).toFixed(3);
        const transform = `translate(${x},${y})`;
        const layer = this.layers.Pads;

        //  console.log('item:', item);
        const padColor = item.getColor() || this.palette[2];

        let data = RenderShape(shape, ro, ri);
        svg(
          'path',
          {
            fill: padColor,
            d: data + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
            transform
          },
          parent
        );

        this.debug('name:', name);
        if(name) {
          let t = RotateTransformation(opts.rot, -1);
          svg(
            'tspan',
            {
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
                ...(layer
                  ? {
                      'data-layer': `${layer.number} ${layer.name}`
                    }
                  : {}),
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
        return;
        break;
      }
    }

    this.debug('BoardRenderer.renderItem', { name, value, item });
  }

  renderCollection(coll, parent, opts = {}) {
    const { predicate = i => i.tagName != 'description', transformation, pos, rot, name, layer, props = {}, flat } = opts;

    this.debug(`BoardRenderer.renderCollection(1)`, { coll, transformation, name });

    let coordFn = i => i;
    let { class: addClass, ...addProps } = props;
    let other = [],
      layers = {},
      wireObj = {};

    const { tPlace } = this.layers;

    for(let item of coll) {
      if(item.tagName === 'wire') {
        const layerId = item.attributes.layer || tPlace.number;
        const layerName = item.layer.name;
        layers[layerId] ??= item.layer || tPlace;

        if(item.layer) item.layer.elements.add(item);

        wireObj[layerId] ??= {};
        wireObj[layerId][item.width] ??= [];
        wireObj[layerId][item.width].push(item);
        continue;
      }
      if(predicate(item)) other.push(item);
    }
    //console.log('BoardRenderer.renderCollection', wireObj);
    //
    let [pads, nonPads] = partition(other.filter(predicate), item => item.tagName == 'pad');

    for(let item of pads) this.renderItem(item, parent, { ...opts });
    for(let item of nonPads) this.renderItem(item, parent, { ...opts });

    for(let layerId in wireObj) {
      for(let width in wireObj[layerId]) {
        let wires = wireObj[layerId][width];
        let classList = (parent && parent.classList) || [];
        if([...classList].indexOf('plain') != -1) continue;
        let lines = new LineList(
          wires.map(wire => {
            let line = new Line(coordFn(wire)).round(0.0127, 6);
            line.element = wire;
            if(wire.curve !== undefined) line.curve = wire.curve;
            line.width = wire.width;
            return line;
          })
        );
        const layer = layers[layerId] || this.layers.Bottom;
        const color = layer.color;

        this.debug('BoardRenderer.renderCollection', { layer: layer.name, width, wires, lines });

        if(true) {
          let lines2 = lines.map(l => new Line(l));
          let cmds = LinesToPath(
            lines.map(l => {
              let ret = new Line(l);
              if(l.curve !== undefined) ret.curve = l.curve;
              if(l.element !== undefined) ret.element = l.element;
              return ret;
            })
          );
          if(flat) cmds = cmds.flat();

          this.debug('BoardRenderer.renderCollection', console.config({ compact: false }), cmds);

          this.create(
            WirePath,
            {
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
          LinesToPath(lines).map(cmds =>
            this.create(
              WirePath,
              {
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
  }

  renderElement(element, parent) {
    let { name, library, value, x, y, rot = '0' } = element;
    if(typeof value != 'string') value = value + '';

    //throw new Error(`renderElement deprecated`);

    this.debug(`BoardRenderer.renderElement`, { name, library, value, x, y, rot });

    let transform = new TransformationList();
    let rotation = MakeRotation(rot);

    transform = transform.translate(x, y);
    transform = transform.concat(rotation);
    let elementName = EscapeClassName(name);

    if(typeof value != 'string' || value.length == 0) value = ' ';

    //console.debug(`BoardRenderer.renderElement(2)`, { name, transform });

    const g = this.create(
      'g',
      {
        //&id: `element.${elementName}`,
        class: ElementToClass(element),
        'data-type': element.tagName,
        'data-name': name,
        'data-value': value,
        'data-library': library.name,
        'data-package': element.package.name,
        'data-path': element.path.toString(' '),
        'data-rot': rot,
        transform
      },
      parent
    );
    // this.debug('BoardRenderer.renderElement', { name, value });

    if(/^[RLC][0-9]/.test(name)) {
      let re;
      this.debug('BoardRenderer.renderElement', {
        name,
        value
      });
      switch (name[0]) {
        case 'R':
          value = value.replace(/㏀$/, 'kΩ').replace(/㏁$/, 'MΩ');
          re = /[ΩΩ㏀㏁]?$/;
          break;
        case 'L':
          re = /[H]?$/;
          break;
        case 'C':
          re = /[F]?$/;
          break;
      }

      let number;

      try {
        number = ValueToNumber(value.replace(re, ''));
      } catch(e) {}
    }

    if(element?.package?.children)
      this.renderCollection(element.package.children, g, {
        name,
        value,
        transformation: this.transform.concat(transform),
        flat: true
      });

    this.create(
      Origin,
      {
        /* x, y,*/ element,
        layer: this.layers['tOrigins'],
        style: { display: 'none' }
      },
      g
    );
  }

  render(doc = this.doc /*, parent, props = {}*/) {
    let parent, props;
    let transform = this.transform;
    let bounds = doc.measures;
    let rect = new Rect(bounds).round(2.54);
    let viewBox = new Rect(0, 0, rect.width, rect.height);

    parent = super.render(doc, {
      transform,
      rect,
      viewBox
    });

    bounds = this.bounds;
    //  const { bounds, rect } = this;
    rect = this.rect;

    this.transform.unshift(new Translation(0, rect.height));

    if(Math.abs(rect.x) > 0 || Math.abs(rect.y) > 0) this.transform.unshift(new Translation(-rect.x, rect.y));

    this.debug(`BoardRenderer.render`, { bounds, rect, transform });

    //this.renderLayers(parent);
    let plainGroup = this.create('g', { id: 'plain', transform, 'font-family': 'Fixed' }, parent);
    let signalsElement = doc.get('signals');
    let signalsGroup = this.create(ElementToComponent(signalsElement), { data: signalsElement, transform }, parent);

    let elementsGroup = this.create('g', { id: 'elements', transform, 'font-family': 'Fixed' }, parent);

    for(let element of this.elements.list) {
      //this.create(Element, element,  elementsGroup);
      this.renderElement(element, elementsGroup);
    }

    let plain = [...doc.get('plain').children];

    this.renderCollection(plain, plainGroup);

    this.bounds = bounds;
    this.rect = bounds.rect;
    return parent;
  }
}

EagleSVGRenderer.rendererTypes.brd = BoardRenderer;
