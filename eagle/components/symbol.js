import { log } from '../renderUtils.js';
import { h, Component, Fragment } from '../../dom/preactComponent.js';
import { ElementToComponent } from '../components.js';

export const SchematicSymbol = ({ data,component = Fragment,id, class: className,  ...props }) => {
  log(`SchematicSymbol.render`, data);
  const children = [...data.children];

  //children.map(data => log('data:', data.tagName));

  return h(component, {id, class: className }, [
    ...children.filter(({ tagName }) => tagName != 'text').map(data => h(ElementToComponent(data), { data, ...props })),
    ...children.filter(({ tagName }) => tagName == 'text').map(data => h(ElementToComponent(data), { data, ...props }))
  ]);
};
