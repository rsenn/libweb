import { h, Component, Fragment } from '../../preact.mjs';
import { log, useTransform } from '../renderUtils.js';

import { Pin } from './pin.js';
import { Text } from './text.js';
import { Wire } from './wire.js';
import { Rectangle } from './rectangle.js';
import { Circle } from './circle.js';
import { Polygon } from './polygon.js';

const childElements = {
  pin: Pin,
  text: Text,
  wire: Wire,
  rectangle: Rectangle,
  circle: Circle,
  polygon: Polygon
};

const ElementToComponent = data => childElements[data.tagName];

export const SchematicSymbol = ({ data, component = Fragment, id, class: className, ...props }) => {
  log(`SchematicSymbol.render`, { data, id });

  const children = [...data.children];

  let [transformation, transform, accumulate] = useTransform(props.opts);

  //children.map(data => log('data:', data.tagName));

  //log(`SchematicSymbol(${data.name}).render`, children /*.map(ch=>[ch, ElementToComponent(ch)])*/);

  return h(component, { id, class: className }, [
    ...children.filter(({ tagName }) => tagName != 'text').map(data => h(ElementToComponent(data), { data, ...props })),
    ...children.filter(({ tagName }) => tagName == 'text').map(data => h(ElementToComponent(data), { data, ...props }))
  ]);
};
