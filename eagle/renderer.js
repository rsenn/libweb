import { SVG } from '../dom/svg.js';
import { BBox } from '../dom/bbox.js';
import { Point } from '../geom/point.js';
import { Rect } from '../geom/rect.js';
import { Line } from '../geom/line.js';
import { EagleElement } from './element.js';

const RotateTransformation = (rot, f = 1) => {
  if(rot === undefined) return '';
  let mirror = /M/.test(rot);
  let angle = +(rot || '').replace(/R/, '') || 0;
  return (mirror ? ` scale(-1,1) ` : '') + `rotate(${angle * f})`;
};

const Alignment = (align, def = 'bottom-left') => {
  let h, v;
  for(let tok of (align || def).split(/-/g)) {
    switch (tok) {
      case 'center': {
        if(h === undefined) h = 'middle';
        if(v === undefined) v = 'central';
        break;
      }
      case 'bottom':
      case 'top': {
        v = tok;
        break;
      }
      case 'left':
      case 'right': {
        v = tok;
        break;
      }
    }
  }
  return {
    'text-anchor': h,
    'alignment-baseline': v
  };
};

const InvertY = item => {
  let ret = {};
  for(let prop in item.attributes) {
    if(prop.startsWith('y')) ret[prop] = -+item.attributes[prop];
    else ret[prop] = item.attributes[prop];
  }
  return item;
};

const EagleColors = [
  'rgb(255,255,255)', // 0
  'rgb(75,75,165)', // 1
  'rgb(75,165,75)', // 2
  'rgb(75,165,165)', // 3
  'rgb(165,75,75)', // 4
  'rgb(165,75,165)', // 5
  'rgb(165,165,75)', // 6
  'rgb(175,175,175)', // 7
  'rgb(75,75,255)', // 8
  'rgb(75,255,75)', // 9
  'rgb(75,255,255)', // 10
  'rgb(255,75,75)', // 11
  'rgb(255,75,255)', // 12
  'rgb(255,255,75)', // 13
  'rgb(75,75,75)', // 14
  'rgb(165,165,165)' // 15
];

export class EagleRenderer {
  renderItem(item, parent, opts = {}) {
    const layer = item.layer;
    const color = opts.color || EagleColors[layer && layer.color] || '#4BA54B';
    const svg = (elem, attr, parent) =>
      this.create(elem, { className: item.tagName, ...attr }, parent);
    const { labelText, coordFn = i => i } = opts;
    switch (item.tagName) {
      case 'wire': {
        const { x1, x2, y1, y2, width } = coordFn(item);
        svg(
          'line',
          { stroke: color, x1, x2, y1, y2, strokeWidth: +(width * 1).toFixed(3) },
          parent
        );
        break;
      }
      case 'rectangle': {
        const { x1, x2, y1, y2, width, rot } = coordFn(item);
        let rect = new Rect({ x1, x2, y1, y2 });
        let center = rect.center;
        svg(
          'rect',
          {
            stroke: 'none',
            fill: color,
            x: -rect.width / 2,
            y: -rect.height / 2,
            width: rect.width,
            height: rect.height,
            transform: `translate(${center.x},${center.y}) ${RotateTransformation(rot)}`
          },
          parent
        );
        break;
      }
      case 'label': {
        const { x, y, size, rot, align } = coordFn(item);
        const transform = `translate(${x},${y}) scale(1,-1) ${RotateTransformation(rot)}`;
        svg(
          'text',
          {
            fill: '#f0f',
            stroke: 'none',
            x: 0,
            y: 0,
            ...Alignment(align),
            innerHTML: labelText,
            fontSize: 3,
            fontFamily: 'Fixed',
            transform
          },
          parent
        );
        break;
      }
      case 'text': {
        let { x, y, text, align, size, font, rot } = coordFn(item);
        if(text.startsWith('&gt;')) {
          const prop = text.slice(4).toLowerCase();
          text = prop in opts ? opts[prop] : text;
        }
        const transform = `translate(${x},${y}) scale(1,-1) ${RotateTransformation(rot)}`;
        svg(
          'text',
          {
            fill: color,
            stroke: 'none',
            strokeWidth: 0.05,
            x: 0,
            y: 0,
            ...Alignment(align),
            innerHTML: text,
            fontSize: size * 1.6,
            fontFamily: font || 'Fixed',
            transform
          },
          parent
        );
        break;
      }
      case 'circle': {
        const { x, y, width, radius } = coordFn(item);
        svg(
          'circle',
          {
            stroke: color,
            cx: x,
            cy: y,
            r: radius,
            strokeWidth: width * 0.8,
            fill: 'none'
          },
          parent
        );
        break;
      }
      default: {
        const { x, y, width, radius } = coordFn(item);
        console.log('Unhandled', item.toXML());
        break;
      }
    }
  }
}

export class SchematicRenderer extends EagleRenderer {
  static pinSizes = {
    long: 3,
    middle: 2,
    short: 1,
    point: 0
  };

  constructor(obj, factory) {
    super();

    const { layers, nets, parts, sheets, symbols } = obj;
    this.sheets = sheets;
    this.create = factory;
  }

  renderCollection(collection, parent, opts) {
    const arr = [...collection.children];
    for(let item of arr.filter(item => item.tagName != 'text'))
      this.renderItem(item, parent, opts);
    for(let item of arr.filter(item => item.tagName == 'text'))
      this.renderItem(item, parent, opts);
  }

  renderItem(item, parent, opts = {}) {
    const layer = item.layer;
    const color = opts.color || EagleColors[layer && layer.color] || '#4BA54B';
    const svg = (elem, attr, parent) =>
      this.create(elem, { className: item.tagName, ...attr }, parent);
    const { labelText, coordFn = i => i } = opts;
    switch (item.tagName) {
      case 'junction': {
        const { x, y } = coordFn(item);
        svg(
          'circle',
          {
            fill: '#4ba54b',
            cx: x,
            cy: y,
            r: 0.5,
            stroke: 'none'
          },
          parent
        );
        break;
      }

      case 'pin': {
        const { x, y, length, rot, name, visible } = coordFn(item);
        const angle = +(rot || '0').replace(/R/, '');
        const vec = Point.fromAngle((angle * Math.PI) / 180).prod(
          SchematicRenderer.pinSizes[length] * 2.54
        );
        const pivot = new Point(+x, +y);
        const l = new Line(pivot, vec.add(pivot));
        console.log('pin:', item.toXML());
        svg(
          'line',
          { class: 'pin', stroke: '#a54b4b', ...l.toObject(), strokeWidth: 0.15 },
          parent
        );
        if(name != '' && visible != 'off')
          svg(
            'text',
            {
              class: 'pin',
              stroke: 'none',
              fill: EagleColors[7],
              x: 2.54,
              y: 0,
              fontSize: 2,
              fontFamily: 'Fixed',
              'text-anchor': 'left',
              'alignment-baseline': 'central',
              innerHTML: name,
              transform: `translate(${vec.x},${vec.y}) scale(1,-1) rotate(${-angle})`
            },
            parent
          );
        break;
      }
      default: {
        super.renderItem(item, parent, opts);
        break;
      }
    }
  }

  renderPart(instance, parent) {
    const { x, y, rot } = instance;
    const part = instance.part;
    let { deviceset, device, library, name, value } = part;
    let symbol;
    for(let gate of deviceset.gates.list) {
      console.log('gate:', gate.toXML());
      console.log('gate.symbol:', gate.attributes.symbol);
      symbol = library.symbols[gate.attributes.symbol];
      if(symbol) break;
    }
    if(!symbol) {
      console.log('Symbol not found:', deviceset.name);
    }
    const g = this.create(
      'g',
      { id: `part.${part.name}`, transform: ` translate(${x},${y}) ${RotateTransformation(rot)}` },
      parent
    );
    if(!value) value = deviceset.name;
    this.renderCollection(symbol, g, { name, value });
    return g;
  }

  renderNet(net, parent) {
    let g = this.create('g', { id: `net.${net.name}` }, parent);
    for(let segment of net.children) this.renderCollection(segment, g, { labelText: net.name });
  }

  render(parent) {
    for(let sheet of this.sheets) {
      console.log('sheet:', sheet);
      this.renderSheet(sheet, parent);
    }
  }

  renderSheet(sheet, parent) {
    let netsGroup = this.create('g', { className: 'nets' }, parent);
    console.log('netsGroup:', netsGroup);
    let partsGroup = this.create('g', { className: 'parts' }, parent);
    for(let instance of sheet.instances.list) this.renderPart(instance, partsGroup);
    for(let net of sheet.nets.list) this.renderNet(net, netsGroup);
  }
}

export class BoardRenderer extends EagleRenderer {
  constructor(obj, factory) {
    super();
    const { settings, layers, libraries, classes, designrules, elements, signals, plain } = obj;

    this.elements = elements;
    this.signals = signals;
    this.plain = [...board.getAll('plain', (v, l) => new EagleElement(board, l))][0];
    this.layers = layers;
    this.create = factory;
  }

  renderItem(item, parent, opts = {}) {
    const layer = item.layer;
    const color = EagleColors[layer && layer.color] || EagleColors[7];
    const svg = (elem, attr, parent) =>
      this.create(elem, { className: item.tagName, ...attr }, parent);
    const { labelText, coordFn = i => i, rot } = opts;
    switch (item.tagName) {
      case 'via':
      case 'pad': {
        const { name, x, y, drill, diameter, shape } = coordFn(item);

        const ro = +((diameter || 1.5) / 2.54).toFixed(3);
        const ri = +(drill / 3).toFixed(3);
        let data = '';
        const transform = `translate(${x},${y})`;

        switch (shape) {
          case 'long': {
            const w = ro * 0.75;
            data = `M 0 ${-ro} l ${w} 0 A ${ro} ${ro} 0 0 1 ${w} ${ro} l ${-w *
              2} 0 A ${ro} ${ro} 0 0 1 ${-w} ${-ro}`;
            break;
          }
          case 'square': {
            const points = [
              new Point(-1, -1),
              new Point(1, -1),
              new Point(1, 1),
              new Point(-1, 1)
            ].map(p => p.prod(ro * 1.27));

            data = points.map((p, i) => `${i == 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            //data = `M ${-ro} ${-ro} L ${ro} ${-ro} L ${ro} ${ro} L ${-ro} ${ro}`;
            break;
          }
          case 'octagon': {
            const points = Util.range(0, 7).map(i =>
              Point.fromAngle((Math.PI * i) / 4 + Math.PI / 8, ro * 1.4)
            );

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
            //stroke: color, strokeWidth: 0.1, fill: 'none',
            fill: EagleColors[2],
            d: data + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
            transform
          },
          parent
        );

        if(name)
          svg(
            'text',
            {
              fill: 'rgb(255,255,255)',
              stroke: 'black',
              strokeWidth: 0.02,
              x: 0,
              y: 0.1,
              ...Alignment('center'),
              innerHTML: name,
              fontSize: 0.9,
              fontStyle: 'bold',
              fontFamily: 'Fixed',
              transform: `${transform} ${RotateTransformation(opts.rot, -1)} scale(1,-1)`
            },
            parent
          );
        break;
      }
      default: {
        super.renderItem(item, parent, { ...opts, color });
        break;
      }
    }
  }

  renderCollection(coll, parent, opts = {}) {
    const { predicate = i => true } = opts;

    for(let item of coll.children) {
      if(predicate(item)) this.renderItem(item, parent, opts);
    }
  }

  renderElement(element, parent) {
    const { name, library, value, x, y, rot } = element;

    const g = this.create(
      'g',
      { id: `element.${name}`, transform: ` translate(${x},${y}) ${RotateTransformation(rot)}` },
      parent
    );

    this.renderCollection(element.package, g, { name, value, rot });
  }

  render(parent) {
    let signalsGroup = this.create('g', { className: 'signals', strokeLinecap: 'round' }, parent);
    let elementsGroup = this.create('g', { className: 'elements' }, parent);

    let plainGroup = this.create('g', { className: 'plain' }, parent);

    console.log('plain:', this.plain);

    for(let element of this.elements.list) this.renderElement(element, elementsGroup);

    for(let signal of this.signals.list)
      this.renderCollection(signal, signalsGroup, { predicate: i => i.attributes.layer == '16' });
    for(let signal of this.signals.list)
      this.renderCollection(signal, signalsGroup, { predicate: i => i.attributes.layer == '1' });
    for(let signal of this.signals.list)
      this.renderCollection(signal, signalsGroup, {
        predicate: i => i.attributes.layer === undefined
      });

    this.renderCollection(this.plain, plainGroup);
  }
}

export function renderDocument(doc, factory) {
  const ctor = doc.type == 'sch' ? SchematicRenderer : BoardRenderer;
  const renderer = new ctor(doc, factory);
  const bb = new BBox();
  let objects = [];

  for(let [v, k, o] of doc.iterator()) if(typeof v == 'object' && v !== null) objects.push(v);
  bb.update(objects);
  const rect = bb.rect.outset(2.54 * 4);
  const center = rect.center;
  /*console.log("rect:", rect.toString());
  console.log("center:", center.prod(-1, -1).toString());
  console.log("factory.delegate.root:", factory.delegate.root);*/

  for(let [v, k, o] of Util.traverse(doc)) {
    if(['x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'size'].indexOf(k) != -1) {
      o[k] = v / 2.54;
      /* if(k !== "width" && k !== "size")*/ o[k] = Util.roundTo(o[k], 0.001);
      if(k[0] == 'y') o[k] = -o[k];
    }
  }
  const g = factory('g', {
    transform: `translate(${center.prod(-1)}) scale(2.54,2.54) translate(${center.quot(
      2.54
    )}) scale(1,-1)`,
    'vector-effect': 'non-scaling-stroke'
  });
  renderer.render(g);

  let bbox = SVG.bbox('#board');
  console.log('bbox:', bbox);
  console.log('bbox.aspect:', bbox.aspect());
  console.log('bbox.toString:', bbox.toString());
  //console.log("bbox.rect.toString:",bbox.rect.toString());
  factory.delegate.root.setAttribute('viewBox', bbox.toString());
}
