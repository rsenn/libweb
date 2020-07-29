import { h, Component } from '../../dom/preactComponent.js';
import { Rotation } from '../common.js';
import Util from '../../util.js';
import { VERTICAL, HORIZONTAL, ClampAngle, AlignmentAngle, MakeCoordTransformer } from '../renderUtils.js';

const Alignments = [
  ['hanging', 'mathematical', 'baseline'],
  ['start', 'middle', 'end']
];

const EagleAlignments = {
  'bottom-left': [-1, -1],
  'bottom-center': [-1, 0],
  'bottom-right': [-1, 1],
  'center-left': [0, -1],
  center: [0, 0],
  'center-right': [0, 1],
  'top-left': [1, -1],
  'top-center': [1, 0],
  'top-right': [1, 1]
};

const Alignment = (align, def = [-1, 1], rot = 0) => {
 /* let h, v;
  const [verticalAlignment, horizontalAlignment] = Alignments;

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
  }*/
  let a = EagleAlignments[align] || def;
  console.log("a:",{ a, align });
  let ret = new Point(...a);
  if(Math.abs(rot) > 0) ret.rotate((rot * Math.PI) / 180);
  return ret;
};

const AlignmentAttrs = (align, hv = HORIZONTAL_VERTICAL, rot = 0) => {
  let coord = align instanceof Point ? align : Alignment(align, [-1, 1]);
  if(Math.abs(rot) > 0) coord.rotate((rot * Math.PI) / 180);
  const defaultY = 1;
  const defaultX = -1;

  const { x, y } = coord;
  const [verticalAlignment, horizontalAlignment] = Alignments;
  let r = {};
  if(hv & VERTICAL) r['dominant-baseline'] = verticalAlignment[Math.round(y) + 1] || verticalAlignment[defaultY + 1];
  if(hv & HORIZONTAL) r['text-anchor'] = horizontalAlignment[Math.round(x) + 1] || horizontalAlignment[defaultX + 1];
  return r;
};

export const TextElement = ({ data, opts = {}, ...props }) => {
  console.log(`TextElement.render`, { data, opts });
  data = data || props.item;

  let { transform = new TransformationList() } = opts;

  let coordFn = transform ? MakeCoordTransformer(transform) : i => i;

  let { children = [], text: innerText, align, size, font, rot, layer } = data;
  let text = innerText || labelText || children.join('\n');
  let { x, y } = coordFn(data);
  const color = layer && layer.color;

  console.log('text', { text, align });

  if(text.startsWith('>')) {
    const prop = text.slice(1).toLowerCase();
    console.log('text', { text, prop, opts });
    text = prop in opts ? opts[prop] : text;
  }

  const translation = new TransformationList();

  console.log('translation:', Util.className(translation));
  const rotation = translation.concat(Rotation(rot));
  console.log('rotation:', Util.className(rotation));
  let wholeTransform = transform.concat(Rotation(rot));
  let wholeAngle = ClampAngle(wholeTransform.decompose().rotate);

  let undoTransform = new TransformationList().scale(1, -1).rotate(wholeAngle);
  let undoAngle = ClampAngle(undoTransform.decompose().rotate);

  let angle = ClampAngle(undoAngle - wholeAngle, 180);

  const finalTransformation = rotation
    .concat(undoTransform)
    //.rotate(Math.abs(wholeAngle % 180))
    .collapseAll();

  console.log(`wholeAngle ${text}`, wholeAngle);
  /*console.log(`undoAngle ${text}`, undoAngle);
        console.log(`angle ${text}`, angle);*/
  console.log(`finalTransformation ${text}`, finalTransformation.toString());
  console.log(`finalTransformation ${text}`, finalTransformation.translation, finalTransformation.rotation, finalTransformation.scaling);

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

  console.log(
    `render alignment ${text}`,
    Util.map({ baseAlignment, rotateAlignment, alignment }, (k, v) => [k, v + '']),
    AlignmentAttrs(alignment, VERTICAL)
  );

  let attrs = AlignmentAttrs(alignment, HORIZONTAL);
  if(align !== undefined) attrs['data-align'] = align;

  return h(
    'text',
    {
      fill: color,
      stroke: 'none',
      'stroke-width': 0.05,
      x,
      y,
      ...AlignmentAttrs(alignment, VERTICAL),

      /*    'font-size': (size * 1.6).toFixed(2),
            'font-family': font || 'Fixed Medium',*/
      transform: finalTransformation
    },
    h('tspan', { ...attrs, children: text })
  );
};
