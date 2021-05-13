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
import { Polygon } from './components/polygon.js';
import { Origin } from './components/origin.js';
import { Element } from './components/element.js';
import { WirePath } from './components/wirePath.js';
import { Package } from './components/package.js';
import { SchematicSymbol } from './components/symbol.js';
import { Hole } from './components/hole.js';
import { Dimension } from './components/dimension.js';
import { SMD } from './components/smd.js';
import { Via } from './components/via.js';

export const PrimitiveComponents = {
  Wire,
  Rectangle,
  Pin,
  Circle,
  Cross,
  Arc,
  Text: TextElement,
  Grid,
  Pattern,
  Pad,
  Via: Pad,
  Origin,
  Polygon,
  Symbol: SchematicSymbol,
  Package,
  Hole,
  Dimension,
  Smd: SMD,
  Via
};

let prevName;

export const ElementNameToComponent = name => {
  let comp = PrimitiveComponents[Util.ucfirst(name)];

  if(!comp && name != prevName) {
    console.debug(`Not rendering component '${name}'`);
    prevName = name;
  }
  return comp;
};

export const ElementToComponent = element =>
  ElementNameToComponent(element.tagName);

export { Wire } from './components/wire.js';
export { Rectangle } from './components/rectangle.js';
export { Pin } from './components/pin.js';
export { Circle } from './components/circle.js';
export { Cross } from './components/cross.js';
export { Arc } from './components/arc.js';
export { Grid, Pattern } from './components/grid.js';
export { TextElement } from './components/textElement.js';
export { SVG } from './components/svg.js';
export { Background } from './components/background.js';
export { Drawing } from './components/drawing.js';
export { Pad } from './components/pad.js';
export { Polygon } from './components/polygon.js';
export { Origin } from './components/origin.js';
export { WirePath } from './components/wirePath.js';
export { Package } from './components/package.js';
export { SchematicSymbol } from './components/symbol.js';
