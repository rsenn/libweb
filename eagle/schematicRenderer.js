import { className, isObject } from '../misc.js';
import { Point, Rect, Line, BBox } from '../geom.js';
import { TransformationList } from '../geom/transformation.js';
import { RGBA } from '../color/rgba.js';
import { HSLA } from '../color/hsla.js';
import { Palette } from './common.js';
import { MakeRotation, LayerAttributes, MakeCoordTransformer, useTransformation, useTransform } from './renderUtils.js';
import { EagleSVGRenderer } from './svgRenderer.js';
import { Instance } from './components/instance.js';
import { Sheet } from './components/sheet.js';
import { h, ReactComponent } from '../dom/preactComponent.js';

export class SchematicRenderer extends EagleSVGRenderer {
  static pinSizes = {
    long: 3,
    middle: 2,
    short: 1,
    point: 0
  };

  static palette = Palette.schematic((r, g, b) => new RGBA(r, g, b));

  constructor(doc, factory) {
    super(doc, factory);
    this.id = 0;

    this.setPalette(SchematicRenderer.palette);

    //this.palette = SchematicRenderer.palette;
  }

  renderCollection(collection, parent, opts) {
    const arr = [...collection];
    this.debug(`SchematicRenderer.renderCollection`, arr, opts);
    for(let item of arr.filter(item => item.tagName != 'text')) this.renderItem(item, parent, opts);
    this.debug(`SchematicRenderer.renderCollection`, arr, opts);
    for(let item of arr.filter(item => item.tagName == 'text')) this.renderItem(item, parent, opts);
  }

  /**
   * { function_description }
   *
   * @param      {<type>}  item       The item
   * @param      {<type>}  parent     The parent
   * @param      {<type>}  [opts={}]  The options
   */
  renderItem(item, parent, options = {}) {
    let [transformation, transform, accumulate] = useTransform(options);

    const { rot, pos, labelText, ...opts } = options;
    let coordFn = transform ? MakeCoordTransformer(transform.toMatrix()) : i => i;
    this.debug(`SchematicRenderer.renderItem`, { item, options });

    const layer = item.layer;
    const color = typeof item.getColor == 'function' ? item.getColor() : SchematicRenderer.palette[16];
    const svg = (elem, attr, parent) =>
      this.create(
        elem,
        {
          className: item.tagName, //...LayerAttributes(layer),
          'data-path': item.path.toString(' '),
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
              fill: SchematicRenderer.palette[6],
              x: vec.x + 2.54,
              y: vec.y + 0,
              'font-size': 0.6,
              //  'font-family': 'Fixed Medium',
              'text-anchor': 'left',
              'alignment-baseline': 'central',
              children: name
              //transform: `translate(${vec.x},${vec.y}) scale(1,-1) rotate(${-angle})`
            },
            parent
          );
        break;
      }
      default: {
        super.renderItem(item, parent, { ...accumulate(), ...opts });
        break;
      }
    }
  }

  renderNet(net, parent) {
    this.debug(`SchematicRenderer.renderNet`, { net, parent });
    let g = this.create('g', { className: `net ${net.name}` }, parent);
    for(let segment of net.children)
      this.renderCollection(segment.children, g, {
        labelText: net.name,
        transformation: this.transform
      });
  }

  renderSheet(sheet, parent) {
    const { transform } = this;
    this.debug(`SchematicRenderer.renderSheet`, { sheet, parent, transform });
    let instances = sheet.instances;
    this.debug(`SchematicRenderer.renderSheet`, sheet);
    let netsGroup = this.create(
      'g',
      { className: 'nets', transform, 'font-family': 'Fixed', 'font-size': 0.6 },
      parent
    );
    let instancesGroup = this.create(
      'g',
      { className: 'instances', transform, 'font-family': 'Fixed', 'font-size': 0.6 },
      parent
    );
    instancesGroup.props.children = [...instances.list].map(data =>
      h(Instance, { data, opts: { transformation: transform } })
    );
    for(let net of sheet.nets.list) this.renderNet(net, netsGroup);
  }

  render(doc = this.doc, parent, props = {}, sheetNo = 0) {
    //console.log('doc:', doc);
    console.log('SchematicRenderer.render', { doc, parent, props, sheetNo });

    /*   const sheetsElem = isObject(doc) && doc.find && doc.find('sheets');
    const sheets = sheetsElem?.children ?? [];*/

    //console.log('doc.sheets:',sheets);

    let sheet = doc.sheets[sheetNo];
    console.log('sheet', sheet);
    console.log('sheetNo', sheetNo);
    //console.log('doc', doc, className(doc));

    let bounds = doc.getBounds(sheetNo || 0);
    //console.log('bounds:', bounds);
    let rect = bounds.toRect(Rect.prototype);

    rect.outset(1.27);
    rect.round(2.54);

    bounds = new BBox(rect.x1, -rect.y2, rect.x2, -rect.y1);

    this.debug(`SchematicRenderer.render`, {
      doc,
      sheetNo,
      bounds,
      viewBox: rect
    });
    let { transform } = this;
    let svgElem = super.render(sheet, { bounds });

    this.debug('this.transform:', this.transform, 'this.rect:', this.rect, 'doc:', doc);

    this.renderSheet(sheet, svgElem);
    this.debug(`SchematicRenderer.render`, { sheet, svgElem });

    //this.renderInstances(parent, sheetNo, rect);

    return svgElem;
  }
}

EagleSVGRenderer.rendererTypes.sch = SchematicRenderer;
