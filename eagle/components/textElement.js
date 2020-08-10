import { h, Component } from '../../dom/preactComponent.js';
import Util from '../../util.js';
import { Rotation, VERTICAL, HORIZONTAL, ClampAngle, AlignmentAngle, MakeCoordTransformer } from '../renderUtils.js';
import { Text } from './text.js';
import { useTrkl } from '../renderUtils.js';

export const TextElement = ({ data, opts = {}, ...props }) => {
  data = data || props.item;

  let { transform = new TransformationList(), transformation } = opts;

  if(!transformation) Util.putStack();

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  let { children = [], text: innerText, align = 'bottom-left', size, font, rot, layer } = data;
  let text = innerText || labelText || children.join('\n');
  let { x, y } = coordFn(data);
  const color = data.getColor();

  let visible = layer ? useTrkl(layer.handlers['visible']) : true;

  //  const visible = layer ? layer.isVisible(data) : true;

  if(text.startsWith('>')) {
    const prop = text.slice(1).toLowerCase();
    //console.log('text', { text, prop, opts });
    text = prop in opts ? opts[prop] : text;
  }
  //console.log(`TextElement.render`, text, { align, opts });

  /*const translation = new TransformationList();

  //console.log('translation:', Util.className(translation));
  const rotation = translation.concat(Rotation(rot));
  //console.log('rotation:', Util.className(rotation));
  let wholeTransform = transform.concat(Rotation(rot));
  let wholeAngle = ClampAngle(wholeTransform.decompose().rotate);

  let undoTransform = new TransformationList().scale(1, -1).rotate(wholeAngle);
  let undoAngle = ClampAngle(undoTransform.decompose().rotate);

  let angle = ClampAngle(undoAngle - wholeAngle, 180);

  const finalTransformation = rotation
    .concat(undoTransform)
    //.rotate(Math.abs(wholeAngle % 180))
    .collapseAll();

  //console.log(`wholeAngle ${text}`, wholeAngle);
  //console.log(`undoAngle ${text}`, undoAngle);
        //console.log(`angle ${text}`, angle);
  //console.log(`finalTransformation ${text}`, finalTransformation.toString());
  //console.log(`finalTransformation ${text}`, finalTransformation.translation, finalTransformation.rotation, finalTransformation.scaling);

  if(finalTransformation.rotation) {
    if(finalTransformation.rotation.angle < 0) finalTransformation.rotation.angle = Math.abs(finalTransformation.rotation.angle);
    //finalTransformation.rotation.angle %= 180;
  }

  const baseAlignment = Alignment(align);
  const rotateAlignment = AlignmentAngle(wholeAngle);
  const alignment = baseAlignment
    .clone()
    .rotate((rotateAlignment * Math.PI) / 180)
    .round(0.5);

  //console.log(
    `render alignment ${text}`,
    Util.map({ baseAlignment, rotateAlignment, alignment }, (k, v) => [k, v + ''])
  );*/

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
