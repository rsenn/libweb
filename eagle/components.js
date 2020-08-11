import Util from '../util.js';
import { Component } from '../dom/preactComponent.js';
import { Wire } from './components/wire.js';
import { Rectangle } from './components/rectangle.js';
import { Pin } from './components/pin.js';
import { Circle } from './components/circle.js';
import { Cross } from './components/cross.js';
import { TextElement } from './components/textElement.js';

export const PrimitiveComponents = { Wire, Rectangle, Pin, Circle, Cross, Text: TextElement };

export const ElementNameToComponent = name => {
  let comp = PrimitiveComponents[Util.ucfirst(name)];

  if(!comp) console.warn(`No component '${name}'`);
  return comp;
};

export const ElementToComponent = element => ElementNameToComponent(element.tagName);
