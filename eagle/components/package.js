import { Component } from '../../preact.mjs';
import { Fragment } from '../../preact.mjs';
import { h } from '../../preact.mjs';
import { ElementToComponent } from '../components.js';
import { log } from '../renderUtils.js';

export const Package = ({ data, component = Fragment, id, class: className, ...props }) => {
  const { name } = data;

  log('Package.render', { data, name });
  const children = data.children.filter(e => e.tagName != 'description');
  const [description] = data.children.filter(e => e.tagName == 'description');

  //children.map(data => log('data:', data.tagName));
  //
  let i = 0;

  return h(component, { id, class: className }, [
    ...children
      .filter(({ tagName }) => tagName != 'text')
      .map(data => h(ElementToComponent(data), { data, key: `package-${name}-${i++}`, ...props })),
    ...children
      .filter(({ tagName }) => tagName == 'text')
      .map(data => h(ElementToComponent(data), { data, key: `package-${name}-${i++}`, ...props }))
  ]);
};