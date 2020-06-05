import { Point } from '../geom/point.js';
import { Rect } from '../geom/rect.js';
import { Line } from '../geom/line.js';
import { TransformationList } from '../geom/transformation.js';
import { Util } from '../util.js';
import { RGBA } from '../dom/rgba.js';
import { HSLA } from '../dom/hsla.js';
import { Rotation } from './common.js';
import { LayerAttributes, MakeCoordTransformer } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';

export class SchematicRenderer extends EagleSVGRenderer {
  static pinSizes = {
    long: 3,
    middle: 2,
    short: 1,
    point: 0
  };

  static palette = ['rgb(255,255,255)', 'rgb(75,75,165)', 'rgb(75,165,75)', 'rgb(75,165,165)', 'rgb(165,75,75)', 'rgb(165,75,165)', 'rgb(165,165,75)', 'rgb(175,175,175)', 'rgb(75,75,255)', 'rgb(75,255,75)', 'rgb(75,255,255)', 'rgb(255,75,75)', 'rgb(255,75,255)', 'rgb(255,255,75)', 'rgb(75,75,75)', 'rgb(165,165,165)'];

  constructor(doc, factory) {
    super(doc, factory);

    const { layers, nets, parts, sheets, symbols } = doc;
    this.sheets = sheets;
    this.id = 0;

    //this.setPalette(SchematicRenderer.palette);
    this.palette = SchematicRenderer.palette;
  }

  renderCollection(collection, parent, opts) {
    const { transform, pos, rot } = opts;

    //  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

    //console.log(`SchematicRenderer.renderCollection`, { transform, pos, rot });

    const arr = [...collection];

    for(let item of arr.filter(item => item.tagName != 'text')) this.renderItem(item, parent, { ...opts, transform });
    for(let item of arr.filter(item => item.tagName == 'text')) this.renderItem(item, parent, { ...opts, transform });
  }

  /**
   * { function_description }
   *
   * @param      {<type>}  item       The item
   * @param      {<type>}  parent     The parent
   * @param      {<type>}  [opts={}]  The options
   */
  renderItem(item, parent, opts = {}) {
    const { labelText, pos, transform, rot } = opts;

    let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

    //if(rot)    console.log(`SchematicRenderer.renderItem`, {labelText, pos ,transform,   rot });

    const layer = item.layer;
    const color = (opts && opts.color) || (layer && this.getColor(layer.color));
    const svg = (elem, attr, parent) =>
      this.create(
        elem,
        {
          className: item.tagName, //...LayerAttributes(layer),
          ...attr
        },
        parent
      );
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
        const { length, rot, name, visible } = item;
        const { x, y } = coordFn(item);
        const func = item['function'];

        const angle = +(rot || '0').replace(/R/, '');
        let veclen = SchematicRenderer.pinSizes[length] * 2.54;
        if(func == 'dot') veclen -= 1.5;
        const dir = Point.fromAngle((angle * Math.PI) / 180);
        const vec = dir.prod(veclen);
        const pivot = new Point(+x, +y);
        const pp = dir.prod(veclen + 0.75).add(pivot);
        const l = new Line(pivot, vec.add(pivot));

        if(func == 'dot') {
          svg(
            'circle',
            {
              class: 'pin',
              stroke: '#a54b4b',
              fill: 'none',
              cx: pp.x,
              cy: pp.y,
              r: 0.75,
              'stroke-width': 0.3
            },
            parent
          );
        }

        svg(
          'line',
          {
            class: 'pin',
            stroke: '#a54b4b',
            ...l.toObject(),
            'stroke-width': 0.15
          },
          parent
        );
        if(name != '' && visible != 'off')
          svg(
            'text',
            {
              class: 'pin',
              stroke: 'none',
              fill: this.getColor(6),
              x: vec.x + 2.54,
              y: vec.y + 0,
              'font-size': 2,
              'font-family': 'Fixed',
              'text-anchor': 'left',
              'alignment-baseline': 'central',
              innerHTML: name
              //     transform: `translate(${vec.x},${vec.y}) scale(1,-1) rotate(${-angle})`
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

  renderNet(net, parent) {
    //console.log(`${Util.className(this)}.renderNet`, { net, parent });
    let g = this.create('g', { className: `net.${net.name}` }, parent);
    for(let segment of net.children) this.renderCollection(segment.children, g, { labelText: net.name });
  }

  renderSheet(sheet, parent) {
    //console.log(`${Util.className(this)}.renderSheet`, { sheet, parent });
    let netsGroup = this.create('g', { className: 'nets' }, parent);
    let instancesGroup = this.create('g', { className: 'instances' }, parent);

    for(let instance of sheet.instances.list) this.renderInstance(instance, instancesGroup);

    for(let net of sheet.nets.list) this.renderNet(net, netsGroup);
  }

  render(doc = this.doc, parent, props = {}, sheetNo = 0) {
    let sheet = this.sheets[sheetNo];
    let bounds = sheet.getBounds();
    let rect = bounds.rect;

    this.bounds = bounds;
    this.rect = rect;

    rect.outset(1.27);
    rect.round(2.54);

    //console.log('bounds:', rect);
    parent = super.render(doc, parent, props);

    this.renderSheet(sheet, this.group);

    this.renderInstances(this.group, sheetNo, rect);

    return parent;
  }

  renderInstance(instance, parent, opts = {}) {
    let { x, y, rot, part, gate, symbol } = instance;
    let { transform, pos } = opts;
    let coordFn = MakeCoordTransformer(this.transform);
    let { deviceset, device, library, name, value } = part;
    let t = new TransformationList();
    t.translate(x, y);
    if(rot) {
      rot = Rotation(rot);
      t = t.concat(rot);
    }
    //console.log(`SchematicRenderer.renderPart`, { x, y, pos, rot, t });
    const g = this.create('g', { className: `part.${part.name}`, transform: t }, parent);
    if(!value) value = deviceset.name;
    opts = deviceset.uservalue == 'yes' ? { name, value } : { name };
    this.renderCollection(symbol.children, g, {
      ...opts,
      rot /*pos: new Point(x, y), transform: t.slice()*/
    });
    return g;
  }

  renderInstances(parent, sheetNo = 0, b) {
    //  console.log('b:', b);
    let g = this.create(
      'g',
      {
        className: 'instances rects',
        stroke: new HSLA(220, 100, 50),
        'stroke-width': 0.2,
        'stroke-dasharray': '0.25 0.25',
        fill: 'none'
      },
      parent
    );
    for(let instance of this.sheets[sheetNo].getAll('instance')) {
      let t = new TransformationList();
      t.translate(+instance.x, +instance.y);
      let b = instance.getBounds();
      let br = new Rect(b).round(0.0001, 5);
      this.create(
        'rect',
        {
          ...br.toObject(),
          //   transform: 'none',
          'data-part': instance.part.name /*,
          'data-device': part.device.name,
          'data-gate': gate.name,
          'data-value': part.value || ''*/
        },
        g
      );
      t.rotate(45);
      this.create(
        'path',
        {
          d: `M 0,-1 L 0,1 M -1,0 L 1,0`,
          transform: t,
          stroke: new RGBA(255, 255, 0),
          'stroke-linecap': 'round',
          'stroke-width': 0.2
        },
        g
      );
    }
    /*
    r.outset(0);
    r.round(2.54);
*/
    b.outset(0.15);

    this.create(
      'rect',
      {
        ...b.toObject(),
        stroke: new HSLA(320, 100, 50),
        'stroke-width': 0.3,
        'stroke-dasharray': '0.9 0.6',
        fill: 'none'
      },
      parent
    );
  }
}

EagleSVGRenderer.rendererTypes.sch = SchematicRenderer;
