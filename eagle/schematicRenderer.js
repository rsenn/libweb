import { Point, Rect, Line, BBox } from '../geom.js';
import { TransformationList } from '../geom/transformation.js';
import { RGBA } from '../color/rgba.js';
import { HSLA } from '../color/hsla.js';
import { Rotation, Palette } from './common.js';
import { LayerAttributes, MakeCoordTransformer } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';

export class SchematicRenderer extends EagleSVGRenderer {
  static pinSizes = {
    long: 3,
    middle: 2,
    short: 1,
    point: 0
  };

  static palette = Palette.schematic((r, g, b) => new RGBA(r, g, b));

  constructor(doc, factory) {
    //const { sheets } = doc;
    super(doc, factory);

    //  this. sheets  = sheets;
    this.id = 0;

    //this.setPalette(SchematicRenderer.palette);
    this.palette = SchematicRenderer.palette;
    // console.log('found:', new ImmutablePath([...doc.path, 'children', { tagName: 'eagle' }, 'children', { tagName: 'drawing' }, 'children', { tagName: 'schematic' }]));
    console.log('SchematicRenderer.constructor(', doc, factory, ')');
  }

  renderCollection(collection, parent, opts) {
    /*    if(pos !== undefined || rot !== undefined)
      throw new Error();*/
    //  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

    this.debug(`SchematicRenderer.renderCollection`, opts);

    const arr = [...collection];

    for(let item of arr.filter(item => item.tagName != 'text')) this.renderItem(item, parent, opts);
    for(let item of arr.filter(item => item.tagName == 'text')) this.renderItem(item, parent, opts);
  }

  /**
   * { function_description }
   *
   * @param      {<type>}  item       The item
   * @param      {<type>}  parent     The parent
   * @param      {<type>}  [opts={}]  The options
   */
  renderItem(item, parent, opts = {}) {
    const { transform = new TransformationList(), rot, pos, labelText } = opts;

    let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

    if(rot) this.debug(`SchematicRenderer.renderItem`, { labelText, pos, transform, rot }, item.xpath().toString());

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
        const func = item.function;

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
              children: name
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
    this.debug(`SchematicRenderer.renderNet`, { net, parent });
    let g = this.create('g', { className: `net ${net.name}` }, parent);
    for(let segment of net.children) this.renderCollection(segment.children, g, { labelText: net.name });
  }

  renderSheet(sheet, parent) {
    const { transform } = this;

    this.debug(`SchematicRenderer.renderSheet`, { sheet, parent, transform });

    let instances = sheet.find('instances');

    this.debug(`SchematicRenderer.renderSheet`, sheet);

    let netsGroup = this.create('g', { className: 'nets', transform }, parent);
    let instancesGroup = this.create('g', { className: 'instances', transform }, parent);

    for(let instance of instances.children) this.renderInstance(instance, instancesGroup);

    for(let net of sheet.nets.list) this.renderNet(net, netsGroup);
  }

  renderInstance(instance, parent, opts = {}) {
    this.debug(`SchematicRenderer.renderInstance`, instance);

    let { x, y, rot, part, symbol } = instance;
    //let coordFn = MakeCoordTransformer(this.transform);
    let { deviceset, name, value } = part;
    let { transform = new TransformationList() } = opts;
    transform.translate(x, y);
    if(rot) {
      rot = Rotation(rot);
      transform = transform.concat(rot);
    }
    this.debug(`SchematicRenderer.renderInstance`, { x, y, transform });
    const g = this.create('g', { className: `part.${part.name}`, transform }, parent);
    if(!value) value = deviceset.name;
    opts = deviceset.uservalue == 'yes' || true ? { name, value } : { name, value: '' };
    this.renderCollection(symbol.children, g, {
      ...opts /*pos: new Point(x, y), transform: t.slice()*/
    });
    return g;
  }

  renderInstances(parent, sheetNo = 0, b) {
    const { transform } = this;
    this.debug('b:', b);
    let g = this.create(
      'g',
      {
        className: 'instances rects',
        fill: new HSLA(220, 100, 50, 0.5),
        'stroke-width': 0.2,
        'stroke-dasharray': '0.25 0.25',
        stroke: 'none',
        transform
      },
      parent
    );

    for(let instance of this.sheets[sheetNo].instances.list) {
      let t = new TransformationList();
      t.translate(+instance.x, +instance.y);
      let b = instance.getBounds();
      let br = new Rect(b.rect); /*.round(0.254, 5)*/
      br = br.round(0.254, 5);

      //console.log("br:", br);

      this.create('rect', { ...br.toObject(), 'data-part': instance.part.name }, g);
      t.rotate(45);
      this.create('path', { d: `M 0,-1 L 0,1 M -1,0 L 1,0`, transform: t, stroke: new RGBA(255, 255, 0), 'stroke-linecap': 'round', 'stroke-width': 0.2 }, g);
    }

    /*  b.outset(0.15);

    this.create(
      'rect',
      {
        ...b.toObject(),
        fill: new HSLA(290, 100, 50, 0.5),
        'stroke-width': 0.1,
        'stroke-dasharray': '0.9 0.6',
        stroke: 'none'
      },
      parent
    );*/
  }

  render(doc = this.doc, parent, props = {}, sheetNo = 0) {
    //console.log('doc:', doc);

    const sheets = doc.find('sheets').children;

    //console.log('doc.sheets:',sheets);

    let sheet = sheets[sheetNo];
    // console.log('sheet.getBounds', sheet.getBounds+'');

    let bounds = new BBox();

    //  bounds = Util.tryFunction(() => sheet.getBounds());

    let rect = new Rect(bounds.rect);

    this.bounds = bounds;
    this.rect = rect;
    //    this.plain = sheet.plain;

    rect.outset(1.27);
    rect.round(2.54);

    parent = super.render(doc, parent, props);

    this.debug('this.transform:', this.transform, 'this.rect:', this.rect, 'doc:', doc);

    this.debug(`SchematicRenderer.render`, { doc, sheetNo, bounds });
    this.renderSheet(sheet, parent);

    //this.renderInstances(parent, sheetNo, rect);

    return parent;
  }
}

EagleSVGRenderer.rendererTypes.sch = SchematicRenderer;
