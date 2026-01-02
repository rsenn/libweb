import { classNames } from '../classNames.js';
import { RGBA } from '../color/rgba.js';
import { ValueToNumber } from '../eda/colorCoding.js';
import { BBox } from '../geom.js';
import { Line } from '../geom.js';
import { LineList } from '../geom.js';
import { Rect } from '../geom.js';
import { TransformationList } from '../geom/transformation.js';
import { Translation } from '../geom/transformation.js';
import { partition } from '../misc.js';
import { Palette } from './common.js';
import { ElementToComponent } from './components.js';
import { Origin } from './components.js';
import { WirePath } from './components.js';
import { Element } from './components/element.js';
import { ElementToClass } from './renderUtils.js';
import { EscapeClassName } from './renderUtils.js';
import { HORIZONTAL } from './renderUtils.js';
import { LinesToPath } from './renderUtils.js';
import { MakeRotation } from './renderUtils.js';
import { RenderShape } from './renderUtils.js';
import { RotateTransformation } from './renderUtils.js';
import { VERTICAL } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';

export class BoardRenderer extends EagleSVGRenderer {
  static palette = Palette.board((r, g, b) => new RGBA(r, g, b));

  constructor(obj, factory) {
    super(obj.document, factory);
    const { layers, elements, signals, sheets } = obj;
    const doc = obj.document;

    let board = obj.tagName == 'board' ? obj : doc.lookup('eagle/drawing/board');

    this.elements = elements;
    this.signals = signals;

    //this.plain = board.plain; //get('plain', (v, l) => EagleElement.get(board, l));
    //this.layers = Object.getOwnPropertyNames(doc.layers).map(n => [n, doc.layers[n]]);
    this.layers = layers;
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
                'data-layer': `${layer.number} ${layer.name}`,
              }
            : {}),
          ...attr,
        },
        parent,
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

        const padColor = item.getColor() || this.palette[2];

        let data = RenderShape(shape, ro, ri);
        svg(
          'path',
          {
            fill: padColor,
            d: data + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
            transform,
          },
          parent,
        );

        this.debug('name:', name);
        if(name) {
          let t = RotateTransformation(opts.rot, -1);
          svg(
            'tspan',
            {
              children: name,
              ...EagleSVGRenderer.alignmentAttrs('center', HORIZONTAL),
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
                      'data-layer': `${layer.number} ${layer.name}`,
                    }
                  : {}),
                //     filter: 'url(#shadow)',
                ...EagleSVGRenderer.alignmentAttrs('center', VERTICAL),
                'font-size': 0.6,
                'font-style': 'bold',
                // 'font-family': 'Fixed Medium',
                transformation: transform.concat([t]),
                transform: `${transform} ${t} scale(1,-1)`,
              },
              parent,
            ),
          );
        }
        break;
      }
      default: {
        super.renderItem(item, parent, { ...opts, color });
        return;
        break;
      }
    }

    //this.debug('BoardRenderer.renderItem', { name, value, item });
  }

  renderCollection(coll, parent, opts = {}) {
    const { predicate = i => i.tagName != 'description', transformation, pos, rot, name, layer, props = {}, flat } = opts;

    //this.debug(`BoardRenderer.renderCollection(1)`, { coll, transformation, name });

    //this.debug('BoardRenderer.renderCollection', coll[0].tagName);

    let coordFn = i => i;
    let { class: addClass, ...addProps } = props;
    let other = [],
      layers = {},
      wireObj = {};

    const { tPlace } = this.layers || {};

    for(let item of coll) {
      if(item.tagName === 'wire') {
        const layerId = item.attributes.layer || tPlace.number;
        const layerName = item.getLayer()?.name;
        layers[layerId] ??= item.layer || tPlace;

        if(item.layer) item.layer.elements.add(item);

        wireObj[layerId] ??= {};
        wireObj[layerId][item.width] ??= [];
        wireObj[layerId][item.width].push(item);
        continue;
      }
      if(predicate(item)) other.push(item);
    }

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
          }),
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
            }),
          );
          if(flat) cmds = cmds.flat();

          this.debug('BoardRenderer.renderCollection', cmds);

          this.create(
            WirePath,
            {
              class: classNames(addClass, ElementToClass(wires[0], layer.name)),
              cmds,
              color,
              width,
              layer,
              separator: flat ? ' ' : '\n',
              ...addProps,
            },
            parent,
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
                ...addProps,
              },
              parent,
            ),
          );
        }
      }
    }
  }

  /*renderElement(element, parent) {
    let { name, library, value, x, y, rot = '0', package:pkg } = element;
    if(typeof value != 'string') value = value + '';

<<<<<<< HEAD
    let pkg = library.get(e => e.tagName == 'package' && e.attributes.name == element.attributes.package);

    //throw new Error(`renderElement deprecated`);

=======
>>>>>>> d28162443cf9258c2c6a336327dd1454ef068614
    this.debug(`BoardRenderer.renderElement`, { name, library, value, x, y, rot });

    let rotation = MakeRotation(rot);
    let transform = new TransformationList().translate(x, y).concat(rotation);
    let elementName = EscapeClassName(name);

    if(typeof value != 'string' || value.length == 0) value = ' ';

    const g = this.create(
      'g',
      {
        class: ElementToClass(element),
        'data-type': element.tagName,
        'data-name': name,
        'data-value': value,
        'data-library': library.name,
        'data-package': pkg.name,
        'data-path': element.path.toString(' '),
        'data-rot': rot,
        transform
      },
      parent
    );
    if(/^[RLC][0-9]/.test(name)) {
      let re;

      this.debug('BoardRenderer.renderElement', { name, value });

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

<<<<<<< HEAD
    if(element?.package?.children)
=======
    if(pkg.children)
>>>>>>> d28162443cf9258c2c6a336327dd1454ef068614
      this.renderCollection(pkg.children, g, {
        name,
        value,
        transformation: this.transform.concat(transform),
        flat: true
      });

    this.create(
      Origin,
      {
         element,
        layer: this.layers['tOrigins'],
        style: { display: 'none' }
      },
      g
    );
  }*/

  render(doc = this.doc) {
    let parent, props;
    let transform = this.transform;

    let measures = doc.getMeasures();
    let bounds = new BBox();

    if(!measures || measures.length == 0) measures = [...doc.plain.children].filter(e => e.layer && ['Dimension', 'Measures'].indexOf(e.layer.name) != -1);

    measures.forEach(e => bounds.update(e.getBounds()));

    let rect = new Rect(bounds);
    let viewBox = new Rect(0, 0, rect.width, rect.height);

    this.debug(`BoardRenderer.render`, { bounds, rect, transform, viewBox });

    parent = super.render(doc, {
      transform,
      rect,
      viewBox,
    });

    bounds = this.bounds;

    rect = this.rect;

    if(this?.transform?.unshift && rect) {
      this.transform.unshift(new Translation(0, rect.height));

      if(Math.abs(rect.x) > 0 || Math.abs(rect.y) > 0) this.transform.unshift(new Translation(-rect.x, rect.y));
    }

    const plainGroup = this.create('g', { id: 'plain', transform, 'font-family': 'Fixed' }, parent);
    const signalsElement = doc.lookup('eagle/drawing/board/signals');

    const signalsComponent = ElementToComponent(signalsElement);
    const signalsGroup = this.create(signalsComponent, { data: signalsElement, transform }, parent);

    const elementsGroup = this.create('g', { id: 'elements', transform, 'font-family': 'Fixed' }, parent);

    for(let element of [...doc.elements.list]) this.create(Element, { data: element }, elementsGroup);

    let plain = [...(doc.plain?.children ?? doc.plain)];

    this.renderCollection(plain, plainGroup);

    this.bounds = bounds;

    if(bounds?.rect) this.rect = bounds.rect;

    return parent;
  }
}

EagleSVGRenderer.rendererTypes.brd = BoardRenderer;