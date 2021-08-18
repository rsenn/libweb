import { h, Component } from '../../dom/preactComponent.js';
import Util from '../../util.js';
import { MakeCoordTransformer, useTrkl, ElementToClass, log, Alignment } from '../renderUtils.js';
import { Text } from './text.js';
import { toXML } from '../../json.js';
import { classNames } from '../../classNames.js';
import { TransformationList } from '../../geom.js';

export const TextElement = ({ data, opts = {}, transform = new TransformationList(), ...props }) => {
  data = data || props.item;

  let { transformation = new TransformationList() } = opts;

  if(!transformation) Util.putStack();

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  let { children, text: innerText, align = 'bottom-left', size, font, rot, layer } = data;
  let text = (
    innerText ||
    /* labelText || */ Util.tryCatch(
      () => children.map(t => (t + '').trim()).join('\n'),
      t => t,
      () => ''
    )
  ).trim();
  log(`TextElement.render`, { text, transformation, align, size, font, rot, layer });
  let { x, y } = coordFn(data);
  const color = data.getColor();
  let className = ElementToClass(data);

  let visible = !layer || 'yes' == useTrkl(layer.handlers.visible);

  if(text.startsWith('>')) {
    const prop = text.slice(1).toLowerCase();
    text = prop in opts ? opts[prop] : text;
  } else {
    //log('TextElement', data.tagName, Util.isObject(data) && '\n' + toXML(data.raw), '\n' + text);
  }
  let attrs = {};
  if(align !== undefined) attrs['data-align'] = align;
  // if(data.path !== undefined)
  // attrs['data-path'] = data.path.toString(' ');
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
    style: { 'font-size': Util.roundTo(size * 1.5, 0.001) },
    ...attrs
  });
};
