import Util from '../util.js';
import { Component } from '../dom/preactComponent.js';
import { Wire } from './components/wire.js';
import { Rectangle } from './components/rectangle.js';
import { Pin } from './components/pin.js';
import { Circle } from './components/circle.js';

export const PrimitiveComponents = { Wire, Rectangle, Pin, Circle };

export const ElementNameToComponent = name => {
  let comp = PrimitiveComponents[Util.ucfirst(name)];

  if(!comp) console.warn(`No component '${name}'`);
  return comp;
};

export const ElementToComponent = element => ElementNameToComponent(element.tagName);
