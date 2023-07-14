import { Component, Fragment, h } from '../../preact.mjs';
import { log } from '../renderUtils.js';

import { PinSizes, Circle } from './circle.js';
import { Hole } from './hole.js';
import { Pad } from './pad.js';
import { Polygon } from './polygon.js';
import { Rectangle } from './rectangle.js';
import { SMD } from './smd.js';
import { Text } from './text.js';
import { Wire } from './wire.js';

const componentIndex = {
  circle: Circle,
  hole: Hole,
  pad: Pad,
  polygon: Polygon,
  rectangle: Rectangle,
  smd: SMD,
  text: Text,
  wire: Wire
};

export const Package = ({ data, component = Fragment, id, class: className, ...props }) => {
  const { name } = data;

  log('Package.render', { data, name });
  const children = data.children.filter(e => e.tagName != 'description');
  const [description] = data.children.filter(e => e.tagName == 'description');

  //children.map(data => log('data:', data.tagName));
  //
  let i = 0;

  return h(component, { id, class: className }, [
    ...children.filter(({ tagName }) => tagName != 'text').map(data => h(componentIndex[data.tagName], { data, key: `package-${name}-${i++}`, ...props })),
    ...children.filter(({ tagName }) => tagName == 'text').map(data => h(componentIndex[data.tagName], { data, key: `package-${name}-${i++}`, ...props }))
  ]);
};
