import { SVG } from '../dom/svg.js';
import { BBox } from '../geom/bbox.js';
import { Point } from '../geom/point.js';
import { Rect } from '../geom/rect.js';
import { Line } from '../geom/line.js';
import { PolygonFinder } from '../geom/polygonFinder.js';
import { Transformation, TransformationList } from '../geom/transformation.js';
import { EagleElement } from './element.js';
import Alea from '../alea.js';

const EagleColors = ['rgb(255,255,255)', 'rgb(75,75,165)', 'rgb(75,165,75)', 'rgb(75,165,165)', 'rgb(165,75,75)', 'rgb(165,75,165)', 'rgb(165,165,75)', 'rgb(175,175,175)', 'rgb(75,75,255)', 'rgb(75,255,75)', 'rgb(75,255,255)', 'rgb(255,75,75)', 'rgb(255,75,255)', 'rgb(255,255,75)', 'rgb(75,75,75)', 'rgb(165,165,165)'];

export const EaglePalette = ['hsl(230,100%,40%)', 'rgb(252,245,38)', 'rgb(0,126,24)', 'rgb(0,23,185)', 'rgb(79,9,0)', 'rgb(62,46,25)', 'hsl(30,100%,55%)', 'rgb(255,180,83)', 'rgb(105,82,33)', 'rgb(251,252,247)', 'rgb(140,95,51)', 'rgb(132,148,109)', 'rgb(168,166,32)', 'rgb(16,6,61)', 'rgb(178,27,0)', 'hsl(30,0%,80%)'];

const VERTICAL = 1;
const HORIZONTAL = 2;
const HORIZONTAL_VERTICAL = VERTICAL | HORIZONTAL;

const ClampAngle = (a, mod = 360) => {
  while(a < 0) a += 360;
  a %= mod;
  return a > 180 ? a - 360 : a;
};
const AlignmentAngle = a => {
  a %= 360;
  return Math.abs(a - (a % 180));
};

const Rotation = (rot, f = 1) => {
  let mirror, angle;
  if(!rot) {
    mirror = 0;
    angle = 0;
  } else {
    mirror = /M/.test(rot) ? 1 : 0;
    angle = +(rot || '').replace(/M?R/, '') || 0;
  }
  let transformations = new TransformationList();
  if(mirror !== 0) transformations.scale(-1, 1);
  if(angle !== 0) transformations.rotate(angle);

  return transformations;

  return {
    scale: [mirror ? -1 : 1, 1],
    rotate: angle * f,
    toString() {
      const { scale, rotate } = this;
      let ret = [];

      if(scale[0] !== 1 || scale[1] !== 1) ret.push(`scale(${scale.join(',')})`);

      if(rotate !== 0) ret.push(`rotate(${rotate})`);

      return ret.join(' ');
    }
  };
};

const RotateTransformation = (rot, f = 1) => {
  const r = Rotation(rot, f);

  return r.toString();
};

const LayerAttributes = layer =>
  layer
    ? {
        'data-layer': `${layer.number} ${layer.name} color: ${layer.color}`
      }
    : {};

const InvertY = item => {
  let ret = {};
  for(let prop in item.attributes) {
    if(prop.startsWith('y')) ret[prop] = -+item.attributes[prop];
    else ret[prop] = item.attributes[prop];
  }
  return item;
};

const PolarToCartesian = (cx, cy, radius, angle) => {
  var a = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(a),
    y: cy + radius * Math.sin(a)
  };
};

const Arc = (x, y, radius, startAngle, endAngle) => {
  let start = PolarToCartesian(x, y, radius, endAngle);
  let end = PolarToCartesian(x, y, radius, startAngle);
  let arcSweep = endAngle - startAngle <= 180 ? '0' : '1';
  let d = ['M', start.x, start.y, 'A', radius, radius, 0, arcSweep, 0, end.x, end.y].join(' ');
  return d;
};

const CalculateArcRadius = (p1, p2, angle) => {
  const d = Point.distance(p1, p2);

  const r2 = (d * d) / (2 - 2 * Math.cos((angle * Math.PI) / 180));
  const r = d / Math.sqrt(2 + 2 * Math.cos((angle * Math.PI) / 180));

  if(isNaN(r)) throw new Error('Arc radius for angle: ' + angle);

  return Math.abs(angle) > 90 ? r / 2 : Math.sqrt(r2);
};

const LinesToPath = lines => {
  let l = lines.shift(), m;
  let start = l.a;
  let ret = [];
  let prevPoint = new Point(l.a.x, l.a.y);
  ret.push(`M${l.a.x} ${l.a.y}`);

  const lineTo = (point, curve) => {
    if(curve !== undefined) {
      const r = CalculateArcRadius(prevPoint, point, curve).toFixed(4);

      const largeArc = Math.abs(curve) > 180 ? '1' : '0';
      const sweepArc = curve > 0 ? '1' : '0';

      ret.push(`A ${r} ${r} 0 ${largeArc} ${sweepArc} ${point.x} ${point.y}`);
    } else {
      ret.push(`L ${point.x} ${point.y}`);
    }
    prevPoint = new Point(point.x, point.y);
  };

  lineTo(l.b, l.curve);

  do {
    m = null;
    for(let i = 0; i < lines.length; i++) {
      const d = [i, Point.distance(l.b, lines[i].a), Point.distance(l.b, lines[i].b)];

      if(Point.equals(l.b, lines[i].a)) {
        m = lines.splice(i, 1)[0];
        break;
      } else if(Point.equals(l.b, lines[i].b)) {
        const l = lines.splice(i, 1)[0];
        m = l.swap();
        if(l.curve !== undefined) m.curve = -l.curve;
        break;
      }
    }
    if(m) {
      if(lines.length == 0 && Point.equals(m.b, start)) ret.push(`Z`);
      else lineTo(m.b, m.curve);
      l = m;
    } else if(lines.length > 0) {
      l = lines.shift();
      ret.push(`M ${l.a.x} ${l.a.y}`);
      prevPoint = new Point(l.a.x, l.a.y);
      lineTo(l.b, l.curve);
    }
  } while(lines.length > 0);

  return ret.join(' ');
};

export class EagleRenderer {
  palette = EagleColors;
  id = 0;
  layers = {};
  colors = {};

  constructor(doc, factory) {
    this.doc = doc;
    this.create = (tag, attrs, parent) => factory(tag, 'id' in attrs ? attrs : { id: ++this.id, ...attrs }, parent);
  }

  findLayer(number_or_name) {
    if(number_or_name instanceof EagleElement) {
      if('layer' in number_or_name) number_or_name = number_or_name.layer;
      else if(number_or_name.tagName == 'pad') number_or_name = 'Pads';
      else if(number_or_name.tagName == 'description') number_or_name = 'Document';
    }
    const { number, name } = Util.isObject(number_or_name) ? { number: number_or_name.number, name: number_or_name.name } : { number: +number_or_name, name: '' + number_or_name };
    return this.getLayer(typeof number == 'number' ? number : name);
  }
  getLayer(id) {
    if(this.layers[id]) return this.layers[id];

    for(let layer of this.layers.list) {
      if(layer.number === id) return layer;
      if(layer.name === id) return layer;
    }
  }

  getColor(layer) {
    //const name = Util.isObject(layer) && 'name' in layer ? layer.name : layer;
    const color = Util.isObject(layer) && 'color' in layer ? layer.color : layer;
    return this.colors[color] || this.palette[color - 1] || 'rgb(255,0,0)';
  }

  layerOf(element) {
    let layer;
    do {
      layer = element.getAttribute('data-layer') || element.getAttribute('data-layer-id') || element.getAttribute('data-layer-name') || element.getAttribute('layer');
      if(layer) {
        const layerId = +(layer + '').replace(/ .*/g, '');
        return this.layers[layerId];
      }
    } while((element = element.parentElement));
  }

  renderLayers(parent) {
    const layerGroup = this.create('g', { className: 'layers' }, parent);
    const layers = [...this.doc.layers.list].sort((a, b) => a.number - b.number);
    const colors = {};
    this.layerElements = {};

    for(let l of layers) {
      const { name, number, color } = l;
      const stroke = this.getColor(color);
      const layer = this.create('g', {
          id: `layer-${l.number}`,
          className: 'layer',
          ...LayerAttributes(l),
          stroke
        }, layerGroup);

      this.layerElements[l.number] = layer;
      colors[l.name] = stroke;
    }
  }

  renderItem(item, parent, opts = {}) {
    const layer = item.layer;
    const color = opts.color || this.getColor(layer.color);
    const svg = (elem, attr, parent) =>
      this.create(elem, {
          className: item.tagName,
          ...LayerAttributes(layer),
          ...attr
        }, parent);
    let { labelText, coordFn = i => i } = opts;

    let transformation = (opts.transformation || new TransformationList()).slice();

    switch (item.tagName) {
      case 'wire': {
        const { x1, x2, y1, y2, width, curve } = coordFn(item);
        svg('line', {
            stroke: color,
            x1,
            x2,
            y1,
            y2,
            'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
            'data-curve': curve
          }, parent);
        break;
      }
      case 'rectangle': {
        const { x1, x2, y1, y2, width, rot } = coordFn(item);
        let rect = new Rect({ x1, x2, y1, y2 });
        let center = rect.center;
        svg('rect', {
            stroke: 'none',
            fill: color,
            x: -rect.width / 2,
            y: -rect.height / 2,
            width: rect.width,
            height: rect.height,
            transform: `translate(${center.x},${center.y}) ${Rotation(rot)}`
          }, parent);
        break;
      }
      case 'label': {
        const { x, y, size, rot, align } = coordFn(item);
        const transform = new TransformationList(`translate(${x},${y})`);

        svg('text', {
            fill: '#f0f',
            stroke: 'none',
            x: 0,
            y: 0,
            ...EagleRenderer.alignmentAttrs(align),
            innerHTML: labelText,
            'font-size': 3,
            'font-family': 'Fixed',
            transform: transform.undo(transformation)
          }, parent);
        break;
      }
      case 'text': {
        let { x, y, text, align, size, font, rot } = coordFn(item);
        if(text.startsWith('&gt;')) {
          const prop = text.slice(4).toLowerCase();
          text = prop in opts ? opts[prop] : text;
        }
        const translation = new TransformationList(`translate(${x},${y})`);
        const rotation = translation.concat(Rotation(rot));
        let wholeTransform = transformation.concat(Rotation(rot));
        let wholeAngle = ClampAngle(wholeTransform.decompose().rotate);

        let undoTransform = new TransformationList().scale(1, -1).rotate(wholeAngle);
        let undoAngle = ClampAngle(undoTransform.decompose().rotate);

        let angle = ClampAngle(undoAngle - wholeAngle, 180);

        const finalTransformation = rotation
          .concat(undoTransform)
          .rotate(Math.abs(wholeAngle % 180))
          .collapseAll();

        /*  console.log(`wholeAngle ${text}`, wholeAngle);
        console.log(`undoAngle ${text}`, undoAngle);
        console.log(`angle ${text}`, angle);
         console.log(`finalTransformation ${text}`, finalTransformation.toString());
        console.log(`finalTransformation ${text}`, finalTransformation.translation, finalTransformation.rotation, finalTransformation.scaling);*/

        if(finalTransformation.rotation) {
          if(finalTransformation.rotation.angle < 0) finalTransformation.rotation.angle = Math.abs(finalTransformation.rotation.angle);
        }

        const baseAlignment = EagleRenderer.alignment(align);
        const rotateAlignment = AlignmentAngle(wholeAngle);
        const alignment = baseAlignment
          .clone()
          .rotate((rotateAlignment * Math.PI) / 180)
          .round(1);

        //console.log(`render alignment ${text}`, Util.map({ baseAlignment, rotateAlignment, alignment }, (k, v) => [k, v + '']), EagleRenderer.alignmentAttrs(alignment, VERTICAL) );

        const e = svg('text', {
            fill: color,
            stroke: 'none',
            'stroke-width': 0.05,
            x: 0,
            y: 0,
            ...EagleRenderer.alignmentAttrs(alignment, VERTICAL),

            'font-size': (size * 1.6).toFixed(2),
            'font-family': font || 'Fixed',
            transform: finalTransformation
          }, parent);

        let attrs = EagleRenderer.alignmentAttrs(alignment, HORIZONTAL);
        if(align !== undefined) attrs['data-align'] = align;
        this.create('tspan', { ...attrs, innerHTML: text }, e);
        break;
      }
      case 'circle': {
        const { x, y, width, radius } = coordFn(item);
        svg('circle', {
            stroke: color,
            cx: x,
            cy: y,
            r: radius,
            'stroke-width': width * 0.8,
            fill: 'none'
          }, parent);
        break;
      }
      case 'contactref':
        break;
      default: {
        const { x, y, width, radius } = coordFn(item);

        break;
      }
    }
  }

  setPalette(pal) {
    this.palette = pal;
  }

  static alignment(align, def = [-1, 1], rot = 0) {
    let h, v;
    const { horizontalAlignment, verticalAlignment } = EagleRenderer;

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
    let coord = align instanceof Point ? align : EagleRenderer.alignment(align, [-1, 1]);
    if(Math.abs(rot) > 0) coord.rotate((rot * Math.PI) / 180);

    const { x, y } = coord;
    const { verticalAlignment, horizontalAlignment } = EagleRenderer;
    let r = {};
    if(hv & VERTICAL) r['dominant-baseline'] = verticalAlignment[Math.round(y) + 1] || verticalAlignment[defaultY + 1];

    if(hv & HORIZONTAL) r['text-anchor'] = horizontalAlignment[Math.round(x) + 1] || horizontalAlignment[defaultX + 1];
    return r;
  }
}
EagleRenderer.horizontalAlignment = ['start', 'middle', 'end'];
EagleRenderer.verticalAlignment = ['hanging', 'mathematical', 'baseline'];

export class SchematicRenderer extends EagleRenderer {
  static pinSizes = {
    long: 3,
    middle: 2,
    short: 1,
    point: 0
  };

  constructor(doc, factory) {
    super(doc, factory);

    const { layers, nets, parts, sheets, symbols } = doc;
    this.sheets = sheets;
    this.id = 0;
  }

  renderCollection(collection, parent, opts) {
    const arr = [...collection.children];
    for(let item of arr.filter(item => item.tagName != 'text')) this.renderItem(item, parent, opts);
    for(let item of arr.filter(item => item.tagName == 'text')) this.renderItem(item, parent, opts);
  }

  renderItem(item, parent, opts = {}) {
    const layer = item.layer;
    const color = opts.color || this.getColor(layer.color);
    const svg = (elem, attr, parent) => this.create(elem, { className: item.tagName, ...LayerAttributes(layer), ...attr }, parent);

    const { labelText, coordFn = i => i } = opts;
    switch (item.tagName) {
      case 'junction': {
        const { x, y } = coordFn(item);
        svg('circle', {
            fill: '#4ba54b',
            cx: x,
            cy: y,
            r: 0.5,
            stroke: 'none'
          }, parent);
        break;
      }

      case 'pin': {
        const { x, y, length, rot, name, visible } = coordFn(item);
        const angle = +(rot || '0').replace(/R/, '');
        const vec = Point.fromAngle((angle * Math.PI) / 180).prod(SchematicRenderer.pinSizes[length] * 2.54);
        const pivot = new Point(+x, +y);
        const l = new Line(pivot, vec.add(pivot));

        svg('line', {
            class: 'pin',
            stroke: '#a54b4b',
            ...l.toObject(),
            'stroke-width': 0.15
          }, parent);
        if(name != '' && visible != 'off')
          svg('text', {
              class: 'pin',
              stroke: 'none',
              fill: this.getColor(6),
              x: 2.54,
              y: 0,
              'font-size': 2,
              'font-family': 'Fixed',
              'text-anchor': 'left',
              'alignment-baseline': 'central',
              innerHTML: name,
              transform: `translate(${vec.x},${vec.y}) scale(1,-1) rotate(${-angle})`
            }, parent);
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
      symbol = library.symbols[gate.attributes.symbol];
      if(symbol) break;
    }
    if(!symbol) {
    }
    const g = this.create('g', {
        className: `part.${part.name}`,
        transform: ` translate(${x},${y}) ${RotateTransformation(rot)}`
      }, parent);
    if(!value) value = deviceset.name;
    let opts = deviceset.uservalue == 'yes' ? { name, value } : { name };
    this.renderCollection(symbol, g, opts);
    return g;
  }

  renderNet(net, parent) {
    let g = this.create('g', { className: `net.${net.name}` }, parent);
    for(let segment of net.children) this.renderCollection(segment, g, { labelText: net.name });
  }

  render(parent) {
    this.renderLayers(parent);

    for(let sheet of this.sheets) {
      this.renderSheet(sheet, parent);
    }
  }

  renderSheet(sheet, parent) {
    let netsGroup = this.create('g', { className: 'nets' }, parent);

    let partsGroup = this.create('g', { className: 'parts' }, parent);
    for(let instance of sheet.instances.list) this.renderPart(instance, partsGroup);
    for(let net of sheet.nets.list) this.renderNet(net, netsGroup);
  }
}

export class BoardRenderer extends EagleRenderer {
  constructor(obj, factory) {
    super(obj, factory);
    const { settings, layers, libraries, classes, designrules, elements, signals, plain } = obj;

    this.elements = elements;
    this.signals = signals;
    this.plain = [...board.getAll('plain', (v, l) => new EagleElement(board, l))][0];
    this.layers = layers;
  }

  renderItem(item, parent, opts = {}) {
    const layer = item.layer;
    const color = layer ? this.getColor(layer.color) : this.getColor(6);
    const svg = (elem, attr, parent) => this.create(elem, { className: item.tagName, ...LayerAttributes(layer), ...attr }, parent);
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
            fill: this.colors['Pads'] || this.palette[2],
            d: data + ` M 0 ${ri} A ${ri} ${ri} 180 0 0 0 ${-ri} A ${ri} ${ri} 180 0 0 0 ${ri}`,
            transform
          }, parent);

        if(name) {
          svg('tspan', {
              innerHTML: name,
              ...EagleRenderer.alignmentAttrs('center', HORIZONTAL)
            }, svg(
              'text', {
                fill: 'hsl(180,100%,60%)',
                stroke: 'black',
                'stroke-width': 0.01,
                x: 0.04,
                y: -0.04,
                filter: 'url(#shadow)',
                ...EagleRenderer.alignmentAttrs('center', VERTICAL),
                'font-size': 0.9,
                fontStyle: 'bold',
                'font-family': 'Fixed',
                transform: `${transform} scale(1,-1) ${RotateTransformation(opts.rot, -1)}`
              }, parent
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
    const { predicate = i => true, coordFn = i => i, transform } = opts;
    let wireMap = new Map(), other = [];
    let layers = {}, widths = {};

    for(let item of coll.children) {
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

    for(let item of other) if(predicate(item) && item.tagName == 'pad') this.renderItem(item, parent, opts);

    for(let item of other) if(predicate(item) && item.tagName != 'pad') this.renderItem(item, parent, opts);

    for(let [layerId, wires] of wireMap) {
      if(parent.classList.contains('plain')) continue;

      const lines = wires.map(wire => {
        let line = new Line(coordFn(wire));
        if('curve' in wire) line.curve = wire.curve;
        return line;
      });

      const path = LinesToPath(lines);
      const layer = layers[layerId];
      const width = widths[layerId];
      const color = this.getColor(layer);

      this.create('path', {
          className: 'wire',
          d: path,
          stroke: color,
          'stroke-width': +(width == 0 ? 0.1 : width * 1).toFixed(3),
          fill: 'none',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          ...LayerAttributes(layer)
        }, parent);
    }
  }

  renderElement(element, parent) {
    const { name, library, value, x, y, rot } = element;

    let transform = new TransformationList();
    let rotation = Rotation(rot);

    transform.translate(x, y);

    const g = this.create('g', {
        id: `element.${name}`,
        className: 'element',
        'data-name': name,
        'data-value': value,
        'data-library': library.name,
        'data-package': element.package.name,
        transform: transform.concat(rotation)
      }, parent);

    this.renderCollection(element.package, g, {
      name,
      value,
      rot,
      transformation: rotation.slice()
    });
  }

  render(parent) {
    this.renderLayers(parent);

    let signalsGroup = this.create('g', { className: 'signals', strokeLinecap: 'round' }, parent);
    let elementsGroup = parent; // this.create('g', { className: 'elements' }, parent);

    let plainGroup = this.create('g', { className: 'plain' }, parent);

    for(let element of this.elements.list) this.renderElement(element, elementsGroup);

    for(let signal of this.signals.list)
      this.renderCollection(signal, signalsGroup, {
        predicate: i => i.attributes.layer == '16'
      });
    for(let signal of this.signals.list)
      this.renderCollection(signal, signalsGroup, {
        predicate: i => i.attributes.layer == '1'
      });
    for(let signal of this.signals.list)
      this.renderCollection(signal, signalsGroup, {
        predicate: i => i.attributes.layer === undefined
      });

    this.renderCollection(this.plain, plainGroup);
  }
}

export function renderDocument(doc, container) {
  const gridColor = 'hsl(230,100%,60%)';
  const gridWidth = 0.127;

  const factory = SVG.factory({
      append_to(elem, parent) {
        if(elem.tagName.toLowerCase() == 'text') return parent.appendChild(elem);
        let before = null;
        for(let i = 0; i < parent.children.length; i++) {
          if(parent.children[i].tagName.toLowerCase() == 'text') {
            before = parent.children[i];
            break;
          }
        }

        parent.insertBefore(elem, before);
      }
    }, container);
  const ctor = doc.type == 'sch' ? SchematicRenderer : BoardRenderer;
  const renderer = new ctor(doc, factory);
  const bb = new BBox();
  let objects = [];
  let defs;

  renderer.colors = {
    Top: 'rgb(0,23,185)',
    Route2: 'rgb(3,0,5)',
    Route3: 'rgb(0,23,185)',
    Route4: 'rgb(3,0,5)',
    Route5: 'rgb(0,23,185)',
    Route6: 'rgb(3,0,5)',
    Route7: 'rgb(0,23,185)',
    Route8: 'rgb(3,0,5)',
    Route9: 'rgb(0,23,185)',
    Route10: 'rgb(3,0,5)',
    Route11: 'rgb(0,23,185)',
    Route12: 'rgb(3,0,5)',
    Route13: 'rgb(0,23,185)',
    Route14: 'rgb(3,0,5)',
    Route15: 'rgb(0,23,185)',
    Bottom: 'rgb(252,245,38)',
    Pads: 'hsl(131,100%,24.7%)',
    Vias: 'rgb(252,245,38)',
    Unrouted: 'rgb(62,46,25)',
    Dimension: 'rgb(175,175,175)',
    tPlace: 'hsl(20,100%,60%)',
    bPlace: 'rgb(255,180,83)',
    tOrigins: 'rgb(178,27,0)',
    bOrigins: 'rgb(178,27,0)',
    tNames: 'rgb(255,38,0)',
    bNames: 'rgb(189,133,64)',
    tValues: 'rgb(255,38,0)',
    bValues: 'rgb(189,133,64)',
    tStop: 'rgb(189,133,64)',
    bStop: 'rgb(189,133,64)',
    tCream: 'rgb(189,133,64)',
    bCream: 'rgb(189,133,64)',
    tFinish: 'rgb(62,46,25)',
    bFinish: 'rgb(62,46,25)',
    tGlue: 'rgb(189,133,64)',
    bGlue: 'rgb(189,133,64)',
    tTest: 'rgb(189,133,64)',
    bTest: 'rgb(189,133,64)',
    tKeepout: 'rgb(0,23,185)',
    bKeepout: 'rgb(3,0,5)',
    tRestrict: 'rgb(0,23,185)',
    bRestrict: 'rgb(3,0,5)',
    vRestrict: 'rgb(252,245,38)',
    Drills: 'rgb(189,133,64)',
    Holes: 'rgb(0,255,255)',
    Milling: 'rgb(0,126,24)',
    Measures: 'rgb(189,133,64)',
    Document: 'rgb(255,180,83)',
    Reference: 'rgb(189,133,64)',
    tDocu: 'rgb(255,180,83)',
    bDocu: 'rgb(255,180,83)',
    Modules: 'rgb(79,9,0)',
    Nets: 'rgb(252,245,38)',
    Busses: 'rgb(3,0,5)',
    Pins: 'rgb(252,245,38)',
    Symbols: 'rgb(0,23,185)',
    Names: 'rgb(189,133,64)',
    Values: 'rgb(189,133,64)',
    Info: 'rgb(189,133,64)',
    Guide: 'rgb(62,46,25)',
    SpiceOrder: 'rgb(189,133,64)',
    trash: 'rgb(189,133,64)'
  };

  let palette;

  let rng, str = '';
  let randN = Util.randInt(0, 30000);

  rng = new Alea(1340);

  palette = ['hsl(155,100%,50.2%)', 'hsl(318,100%,50.2%)', 'hsl(109,100%,50.2%)', 'hsl(236,100%,50.2%)', 'hsl(176,100%,50.2%)', 'hsl(267,100%,50.2%)', 'hsl(263,100%,50.2%)', 'hsl(42,100%,50.2%)', 'hsl(106,100%,50.2%)', 'hsl(4,100%,50.2%)', 'hsl(10,100%,50.2%)', 'hsl(71,100%,50.2%)', 'hsl(305,100%,50.2%)', 'hsl(215,100%,50.2%)'];
  palette = Util.shuffle(palette, rng);

  container = factory.delegate.root;

  renderer.colors = {};
  let first = container.firstElementChild;
  if(!first || (first.tagName+'').toLowerCase() != 'defs') {
    defs = SVG.create('defs', {});
    container.insertBefore(defs, container.firstElementChild);
  } else {
    defs = first;
  }

  if(!Element.find('pattern', defs)) {
    const step = '2.54';
    SVG.create('path', {
        d: `M ${step},0 L 0,0 L 0,${step}`,
        fill: 'none',
        stroke: gridColor,
        'stroke-width': gridWidth
      }, SVG.create(
        'pattern', {
          id: 'grid',
          width: step,
          height: step,
          patternUnits: 'userSpaceOnUse'
        }, defs
      )
    );
  }

  if(!Element.find('filter', defs)) {
    SVG.create('feDropShadow', {
        dx: '20',
        dy: '20',
        stdDeviation: '4',
        'flood-color': '#000000'
      }, SVG.create(
        'filter', {
          id: 'shadow',
          x: '-20%',
          y: '-20%',
          width: '200%',
          height: '200%'
        }, defs
      )
    );
  }

  renderer.setPalette(EaglePalette || palette);

  for(let [v, k, o] of doc.iterator(it => it.attributes && it.attributes.x !== undefined,
    [],
    arg => arg
  ))
    objects.push(v);

  bb.update(objects);
  const rect = bb.rect.outset(2.54 * 4);
  const center = rect.center;

  for(let [v, k, o] of doc.iterator(it => !!it.attributes,
    [],
    arg => arg
  )) {
    if(['x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'size'].indexOf(k) != -1) {
      o[k] = v / 2.54;
      o[k] = Util.roundTo(o[k], 0.001);
      if(k[0] == 'y') o[k] = -o[k];
    }
  }
  const p1 = center.prod(-1);
  const p2 = center.quot(2.54);
  let groupTransform = `translate(${p1}) scale(2.54,-2.54) translate(${p2.sum(0, 0.0)})`;

  const gridGroup = factory('g', {
    transform: `scale(1,-1) translate(0,0)`,
    'vector-effect': 'non-scaling-stroke'
  });
  const g = factory('g', {
    transform: groupTransform,
    'vector-effect': 'non-scaling-stroke'
  });
  renderer.render(g);

  let bbox = SVG.bbox('#board');

  let brect = Element.rect('#board');
  const crect = new Rect(0, 0, window.innerWidth, window.innerHeight);

  Element.setCSS(document.body, { overflow: 'hidden' });
  Element.setCSS(container.parentElement, {
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });
  Element.setCSS(container, brect.aspect() > 1 ? { overflow: 'hidden', width: `${crect.width}px`, height: 'auto' } : { overflow: 'hidden', width: 'auto', height: '${crect.height}px' });

  let gridBox = new Rect(0, 0, Util.roundTo(bbox.width, 2.54), Util.roundTo(bbox.height, 2.54));

  bbox.outset({ top: 0.778, bottom: 1, left: -0.05, right: 0.05 });

  gridBox.size.div(2.54);
  gridBox.height += 1;

  gridBox.round(2.54);
  gridBox.height += gridWidth / 2;
  gridBox.width += gridWidth / 2;

  let grid = SVG.create('rect', {
    ...gridBox.toObject(),
    fill: 'url(#grid)',
    transform: 'translate(0,0) scale(2.54,2.54)'
  });
  gridGroup.appendChild(grid);

  let points = gridBox.toPoints();
  let d = points.toPath({ close: true });

  let sbox = SVG.bbox(container);
  let obox = SVG.bbox(gridGroup);

  sbox.outset(2.54 * 2.54);
  container.setAttribute('viewBox', sbox.toString());

  obox.outset(2.54 * 2.54);
  gridGroup.parentElement.insertBefore(SVG.create('rect', { ...obox, fill: 'black', transform: 'scale(1,-1)' }), gridGroup);

  groupTransform += ` translate(0,0)`;
  Element.attr(g, { transform: groupTransform });
  return renderer;
}
