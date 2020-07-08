import { SVG } from '../dom/svg.js';
import { BBox } from '../geom/bbox.js';
import { Rect } from '../geom/rect.js';
import { ColorMap } from '../draw/colorMap.js';
import Alea from '../alea.js';
import { Util } from '../util.js';
import { RGBA } from '../color/rgba.js';
import { Size } from '../dom.js';
import { SchematicRenderer } from './schematicRenderer.js';
import { BoardRenderer } from './boardRenderer.js';

import { EagleSVGRenderer } from './svgRenderer.js';

export { EagleSVGRenderer } from './svgRenderer.js';
export { SchematicRenderer } from './schematicRenderer.js';
export { BoardRenderer } from './boardRenderer.js';

export function Renderer(doc, factory, debug = false) {
  let ret;
  switch (doc.type) {
    case 'brd':
      ret = new BoardRenderer(doc, factory);
      break;
    case 'sch':
      ret = new SchematicRenderer(doc, factory);
      break;
    default:
      throw new Error('No such document type: ' + doc.type);
  }
  ret.debug = debug ? (...args) => console.log(...args) : () => {};
  return ret;
}
/*
export function renderDocument(doc, container) {
  const factory = SVG.factory(
    {
      append_to(e, p) {
        if(e.tagName.toLowerCase() == 'text') return p.appendChild(e);
        let b4 = null;
        for(let i = 0; i < p.children.length; i++) {
          const child = p.children[i];
          if(child.tagName.toLowerCase() == 'text') {
            b4 = child;
            break;
          }
        }
        p.insertBefore(e, b4);
      }
    },
    container
  );
  container = factory.delegate.root;
  let svg;
  if(container.tagName.toLowerCase() == 'svg') {
    svg = container;
    container = container.parentElement;
  }
  console.log('renderer:', { container, svg });
  //console.log('doc:', doc);
  const ctor = doc.type == 'sch' ? SchematicRenderer : BoardRenderer;
  const renderer = new ctor(doc, factory);
  let objects = [];
  let defs;
  let palette;
  let rng;
  let randN = Util.randInt(0, 30000);
  rng = new Alea(1340);
  let bgColor = doc.type == 'sch' ? 'rgb(255,255,255)' : 'rgba(0,0,0,0.0)';
  console.log(`${Util.className(renderer)} palette=${renderer.palette}`);
  //console.log(`doc type=${doc.type} path=${doc.path}`);
  renderer.colors = {};
  let first = svg.firstElementChild;
  if(!first || (first.tagName + '').toLowerCase() != 'defs') {
    defs = SVG.create('defs', {});
    svg.insertBefore(defs, svg.firstElementChild);
  } else {
    defs = first;
  }
  if(!Element.find('pattern', defs)) {
  }
  if(!Element.find('filter', defs)) {
    SVG.create(
      'feDropShadow',
      {
        dx: '20',
        dy: '20',
        stdDeviation: '4',
        'flood-color': '#000000'
      },
      SVG.create(
        'filter',
        {
          id: 'shadow',
          x: '-20%',
          y: '-20%',
          width: '200%',
          height: '200%'
        },
        defs
      )
    );
  }
  for(let [v, k, o] of doc.iterator(
    it => it.attributes && it.attributes.x !== undefined,
    [],
    arg => arg
  ))
    objects.push(v);
  const bb = new BBox();
  bb.update(objects);
  const rect = bb.rect.outset(2.54 * 4);
  const center = rect.center;
  for(let [v, k, o] of doc.iterator(
    it => !!it.attributes,
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
    className: 'grid',
    transform: `scale(1,-1) translate(0,0)`,
    'vector-effect': 'non-scaling-stroke'
  });
  const g = factory('g', {
    className: 'drawing',
    transform: groupTransform,
    'vector-effect': 'non-scaling-stroke',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'miter'
  });
  renderer.render(doc, g);
  let colors = SVG.allColors(svg);
  window.c = colors;
  window.dump = () => {
    let layerMap = (window.layerMap = new Map());
    let insert = (window.ins = Util.bucketInserter(layerMap));
    let getLayersForColor = number => (layerMap.has(number + '') ? layerMap.get(number + '').map(l => l.name) : []);
    for(let layer of renderer.doc.layers.list) {
      const { color, number, name, active, fill, visible } = layer.attributes;
      if(active == 'no') continue;
      //console.log('layer:,', layer.attributes);
      insert([color, { number, name, color, active, fill, visible }]);
    }
    const rgba1 = renderer.palette.map((color, i) => RGBA.fromString(color));
    const cmap = (window.colormap = new ColorMap(renderer.palette));
    //console.log('cmap:', cmap);
    //console.log('cmap:', [...cmap.toScalar({ fmt: n => `0b${n.toString(2)}` })]);
    const layerNames = Util.unique([...eagle.getAll(e => e.tagName)].filter(e => e.layer).map(e => e.layer.name));

    Util.colorDump(rgba1, (c, n) => ('    ' + n).slice(-3) + '   ' + getLayersForColor(n).join(' '));

    colors.dump();
  };
  dump();
  let bbox = SVG.bbox('#board');
  let brect = Element.rect('#board');
  const crect = new Rect(0, 0, window.innerWidth, window.innerHeight);
  let gridBox = SVG.bbox(svg.lastElementChild);
  let gridRect = new Rect(gridBox);
  gridRect.round(2.54);

  renderer.dimensions = new Size(gridRect, 'mm');

  gridRect.outset(0.2);
  let grid = SVG.create(
    'rect',
    {
      ...gridRect.toObject(),
      fill: 'url(#grid)',
      transform: 'translate(0,0) scale(2.54,2.54)'
    },
    gridGroup
  );
  let points = gridBox.toPoints();
  let d = points.toPath({ close: true });
  let sbox = SVG.bbox(svg);
  let obox = SVG.bbox(gridGroup);
  let gbox = SVG.bbox(gridGroup.firstElementChild);
  let aspects = [sbox.aspect(), obox.aspect(), gbox.aspect()];
  let gridObj = new Rect(gridRect).outset(1.27);
  sbox.outset(2.54 * 2.54);
  Object.assign(renderer, { sbox, obox, gbox, aspects });
  //console.log('render', { sbox, obox, gbox, aspects });
  let srect = new Rect(sbox);
  //console.log('sbox:', srect.toString());
  //console.log('obox:', obox.toString());

  obox.outset(2.54 * 2.54);
  grid.parentElement.insertBefore(SVG.create('rect', { ...gridObj, fill: bgColor, transform: 'scale(2.54,2.54)' }), grid);
  groupTransform += ` translate(0,0)`;
  Element.attr(g, { transform: groupTransform });

  obox = SVG.bbox(gridGroup);
  obox.y = -(obox.y + obox.height);
  sbox = SVG.bbox(svg);
  svg.setAttribute('viewBox', obox.move(0, 0));
  svg.setAttribute('data-aspect', new Rect(sbox).aspect());

  return renderer;
}
*/
