import { log, useTransform } from '../renderUtils.js';
import { h, Component, Fragment } from '../../preact.mjs';
import { ElementToComponent } from '../components.js';

export const SchematicSymbol = ({ data, component = Fragment, id, class: className, ...props }) => {
  log(`SchematicSymbol.render`, { data, id });

  const children = [...data.children];

  let [transformation, transform, accumulate] = useTransform(props.opts);

  //children.map(data => log('data:', data.tagName));

  console.log(`SchematicSymbol(${data.name}).render`, children /*.map(ch=>[ch, ElementToComponent(ch)])*/);

  return h(component, { id, class: className }, [
    ...children.filter(({ tagName }) => tagName != 'text').map(data => h(ElementToComponent(data), { data, ...props })),
    ...children.filter(({ tagName }) => tagName == 'text').map(data => h(ElementToComponent(data), { data, ...props }))
  ]);
};
