import Util from '../util.js';
import { Component } from '../dom/preactComponent.js';
import { Wire } from './components/wire.js';
import { Rectangle } from './components/rectangle.js';
import { Pin } from './components/pin.js';
import { Circle } from './components/circle.js';
import { Cross } from './components/cross.js';
import { Arc } from './components/arc.js';
import { Grid, Pattern } from './components/grid.js';
import { TextElement } from './components/textElement.js';
import { SVG } from './components/svg.js';
import { Background } from './components/background.js';
import { Drawing } from './components/drawing.js';
import { Pad } from './components/pad.js';
import { Origin } from './components/origin.js';

export const PrimitiveComponents = { Wire, Rectangle, Pin, Circle, Cross, Arc, Text: TextElement, Grid, Pattern, Pad, Via: Pad, Origin };

let prevName;

export const ElementNameToComponent = (name) => {
  let comp = PrimitiveComponents[Util.ucfirst(name)];

  if(!comp && name != prevName) {
    console.debug(`Not rendering component '${name}'`);
    prevName = name;
  }
  return comp;
};

export const ElementToComponent = (element) => ElementNameToComponent(element.tagName);

export { Wire } from './components/wire.js';
export { Rectangle } from './components/rectangle.js';
export { Pin } from './components/pin.js';
export { Circle } from './components/circle.js';
export { Cross } from './components/cross.js';
export { Arc } from './components/arc.js';
export { TextElement } from './components/textElement.js';
export { Grid, Pattern } from './components/grid.js';
export { SVG } from './components/svg.js';
export { Background } from './components/background.js';
export { Drawing } from './components/drawing.js';
export { Origin } from './components/origin.js';
