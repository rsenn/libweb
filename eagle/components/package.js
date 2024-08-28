import { Fragment, h } from '../../preact.mjs';
import { log } from '../renderUtils.js';
import { Circle } from './circle.js';
import { Hole } from './hole.js';
import { Pad } from './pad.js';
import { Polygon } from './polygon.js';
import { Rectangle } from './rectangle.js';
import { SMD } from './smd.js';
import { Text } from './text.js';
import { TextElement } from './textElement.js';
import { Wire } from './wire.js';

const components = {
  pad: Pad,
  circle: Circle,
  hole: Hole,
  polygon: Polygon,
  rectangle: Rectangle,
  smd: SMD,
  wire: Wire,
  text: TextElement
};

export const Package = ({ data, component = Fragment, id, class: className, ...props }) => {
  log('Package.render', { data });

  const children = [...data.children].filter(e => e.tagName != 'description'),
    names = Object.keys(components);

  let a = [],
    i = 0,
    obj = {};

  for(let child of children) (obj[child.tagName] ??= []).push(child);

  for(let name of names) if(obj[name]) for(let elem of obj[name]) a.push(elem);

  return h(
    component,
    { id, class: className },
    a.map(data => h(components[data.tagName], { data, key: `package-${data.name}-${i++}`, ...props }))
  );
};
