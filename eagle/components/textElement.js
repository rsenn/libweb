import { h, Component } from '../../dom/preactComponent.js';
import Util from '../../util.js';
import { MakeCoordTransformer } from '../renderUtils.js';
import { Text } from './text.js';
import { useTrkl } from '../renderUtils.js';

export const TextElement = ({ data, opts = {}, ...props }) => {
  data = data || props.item;

  let { transform = new TransformationList(), transformation } = opts;

  if(!transformation) Util.putStack();

  let coordFn = transform ? MakeCoordTransformer(transform) : (i) => i;

  let { children = [], text: innerText, align = 'bottom-left', size, font, rot, layer } = data;
  let text = innerText || labelText || children.join('\n');
  let { x, y } = coordFn(data);
  const color = data.getColor();

  let visible = layer ? useTrkl(layer.handlers.visible) : true;

  //  const visible = layer ? layer.isVisible(data) : true;

  if(text.startsWith('>')) {
    const prop = text.slice(1).toLowerCase();
    //console.log('text', { text, prop, opts });
    text = prop in opts ? opts[prop] : text;
  }

  let attrs = {};
  if(align !== undefined) attrs['data-align'] = align;
  if(data.path !== undefined) attrs['data-path'] = data.path.toString(' ');
  if(rot !== undefined) attrs['data-rot'] = rot;
  if(layer !== undefined) attrs['data-layer'] = `${layer.number} ${layer.name}`;
  attrs['data-alignment'] = [...Alignment(align)].join('|');

  return h(Text, {
    color,
    x,
    y,
    rot,
    alignment: align,
    text,
    transformation,
    visible,
    ...attrs
  });
};
