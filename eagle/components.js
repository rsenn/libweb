import {ucfirst} from '../misc.js';
import { Component } from '../dom/preactComponent.js';
import { polarToCartesian, describeArc, Arc } from './components/arc.js';
import { Background } from './components/background.js';
import { Board } from './components/board.js';
import { PinSizes, Circle } from './components/circle.js';
import { Cross } from './components/cross.js';
import { Dimension } from './components/dimension.js';
import { Drawing } from './components/drawing.js';
import { Element } from './components/element.js';
import { Frame } from './components/frame.js';
import { useGrid, Pattern, Grid } from './components/grid.js';
import { Hole } from './components/hole.js';
import { Instance } from './components/instance.js';
import { Origin } from './components/origin.js';
import { Package } from './components/package.js';
import { Pad } from './components/pad.js';
import { Pin } from './components/pin.js';
import { Polygon } from './components/polygon.js';
import { Rectangle } from './components/rectangle.js';
import { Sheet } from './components/sheet.js';
import { Signal } from './components/signal.js';
import { Signals } from './components/signals.js';
import { SMD } from './components/smd.js';
import { SVG } from './components/svg.js';
import { SchematicSymbol } from './components/symbol.js';
import { TextElement } from './components/textElement.js';
import { Text } from './components/text.js';
import { Via } from './components/via.js';
import { Wire } from './components/wire.js';
import { WirePath } from './components/wirePath.js';

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
  Via,
  Instance,
  Sheet,
  Element,
  Board,
  Drawing,
  Signal,
  Signals
};

let prevName;

export const ElementNameToComponent = name => {
  let comp = PrimitiveComponents[ucfirst(name)];

  if(!comp && name != prevName) {
    console.debug(`Not rendering component '${name}'`);
    prevName = name;
  }
  return comp;
};

export const ElementToComponent = element => ElementNameToComponent(element.tagName);
export const RenderElement = element => ElementToComponent(element);

export { polarToCartesian, describeArc, Arc } from './components/arc.js';
export { Background } from './components/background.js';
export { Board } from './components/board.js';
export { PinSizes, Circle } from './components/circle.js';
export { Cross } from './components/cross.js';
export { Dimension } from './components/dimension.js';
export { Drawing } from './components/drawing.js';
export { Element } from './components/element.js';
export { Frame } from './components/frame.js';
export { useGrid, Pattern, Grid } from './components/grid.js';
export { Hole } from './components/hole.js';
export { Instance } from './components/instance.js';
export { Origin } from './components/origin.js';
export { Package } from './components/package.js';
export { Pad } from './components/pad.js';
export { Pin } from './components/pin.js';
export { Polygon } from './components/polygon.js';
export { Rectangle } from './components/rectangle.js';
export { Sheet } from './components/sheet.js';
export { Signal } from './components/signal.js';
export { Signals } from './components/signals.js';
export { SMD } from './components/smd.js';
export { SVG } from './components/svg.js';
export { SchematicSymbol } from './components/symbol.js';
export { TextElement } from './components/textElement.js';
export { Text } from './components/text.js';
export { Via } from './components/via.js';
export { Wire } from './components/wire.js';
export { WirePath } from './components/wirePath.js';
