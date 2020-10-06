import { h, Component, Fragment } from '../../dom/preactComponent.js';
import { ElementToComponent } from '../components.js';

export const SchematicSymbol = ({ data, opts, ...props }) => {
  //console.log(`SchematicSymbol.render`, data, opts);
  const children = [...data.children];

  //children.map(data => console.log('data:', data.tagName));

  return h(Fragment, {}, [
    ...children.filter(({ tagName }) => tagName != 'text').map(data => h(ElementToComponent(data), { data, opts })),
    ...children.filter(({ tagName }) => tagName == 'text').map(data => h(ElementToComponent(data), { data, opts }))
  ]);
};
