import { TransformationList } from '../../geom/transformation.js';
import { roundTo, tryCatch } from '../../misc.js';
import { h } from '../../preact.mjs';
import { Alignment, ElementToClass, log, MakeCoordTransformer, useTrkl } from '../renderUtils.js';
import { Text } from './text.js';

export const TextElement = ({ data, opts = {}, transform = new TransformationList(), ...props }) => {
  data = data || props.item;

  log(`TextElement.render(1)`, { data });

  const { transformation = new TransformationList() } = opts;

  const coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  const { children, text: innerText, align = 'bottom-left', size, font, rot } = data;
  const layer = data.document.getLayer(data.attributes.layer);

  let text = (
    innerText ||
    tryCatch(
      () => children.map(t => (t + '').trim()).join('\n'),
      t => t,
      () => ''
    )
  ).trim();

  log(`TextElement.render(2)`, { text, transformation, align, size, font, rot, layer });

  const { x, y } = coordFn(data);
  const color = data && data.getColor ? data.getColor() : undefined;
  const className = ElementToClass(data);

  const visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  if(text.startsWith('>')) {
    const prop = text.slice(1).toLowerCase();
    text = prop in opts ? opts[prop] : text;
  }

  const attrs = {};

  if(align !== undefined) attrs['data-align'] = align;
  if(rot !== undefined) attrs['data-rot'] = rot;
  if(layer !== undefined) attrs['data-layer'] = `${layer.number} ${layer.name}`;

  attrs['data-alignment'] = [...Alignment(align)].join('|');

  log(`TextElement.render(3)`, { className,color,x,y,rot,alignment:align,text,visible,opts,...attrs });

  return h(Text, {
    className,
    color,
    x,
    y,
    rot,
    alignment: align,
    text,
    visible,
    opts,
    style: { 'font-size': roundTo(size * 1.5, 0.001) },
    ...attrs
  });
};
