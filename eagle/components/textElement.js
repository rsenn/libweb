import { TransformationList } from '../../geom/transformation.js';
import { roundTo, tryCatch } from '../../misc.js';
import { h } from '../../preact.mjs';
import { Alignment, ElementToClass, log, MakeCoordTransformer, useTrkl } from '../renderUtils.js';
import { Text } from './text.js';

export const TextElement = ({ data, opts = {}, transform = new TransformationList(), ...props }) => {
  data = data || props.item;

  let { transformation = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  let { children, text: innerText, align = 'bottom-left', size, font, rot } = data;
  let layer = data.document.getLayer(data.attributes.layer);
  let text = (
    innerText ||
    /* labelText || */ tryCatch(
      () => children.map(t => (t + '').trim()).join('\n'),
      t => t,
      () => ''
    )
  ).trim();
  log(`TextElement.render`, { text, transformation, align, size, font, rot, layer });
  let { x, y } = coordFn(data);
  const color = data && data.getColor ? data.getColor() : undefined;
  let className = ElementToClass(data);

  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  if(text.startsWith('>')) {
    const prop = text.slice(1).toLowerCase();
    text = prop in opts ? opts[prop] : text;
  } else {
    //log('TextElement', data.tagName, isObject(data) && '\n' + toXML(data.raw), '\n' + text);
  }
  let attrs = {};
  if(align !== undefined) attrs['data-align'] = align;
  if(rot !== undefined) attrs['data-rot'] = rot;
  if(layer !== undefined) attrs['data-layer'] = `${layer.number} ${layer.name}`;

  attrs['data-alignment'] = [...Alignment(align)].join('|');

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
