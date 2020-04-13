import { BBox } from "../dom/bbox.js";
import { Rect } from "../dom/rect.js";
import { Point } from "../dom/point.js";
import { Line } from "../dom/line.js";

export class SchematicRenderer {
  static pinSizes = {
    long: 3,
    middle: 2,
    short: 1,
    point: 0
  };

  constructor(obj, factory) {
    const { layers, nets, parts, symbols } = obj;

    this.layers = layers;
    this.nets = nets;
    this.parts = parts;
    this.symbols = symbols;
    this.factory = factory;
  }

  renderSymbol(symbol, part, parent) {
    const arr = symbol.symbol instanceof Array ? symbol.symbol : [symbol.symbol];

    return arr.map(sym => {
      const layer = this.layers.find(l => l.id === sym.layer);
      switch (sym.type) {
        case "wire":
          const { x1, x2, y1, y2, width } = sym;
          this.factory("line", { stroke: layer ? layer.color : "#a54b4b", x1, x2, y1, y2, strokeWidth: width }, parent);
          break;
        case "text":
          const { x, y, text, align, size, font } = sym;
          this.factory(
            "text",
            {
              fill: layer ? layer.color : "#a54b4b",
              x,
              y,
              innerHTML: text,
              fontSize: size,
              fontFamily: font || "Fixed"
            },
            parent
          );
          break;
        case "circle":
          const { x, y, width, radius } = sym;
          this.factory(
            "circle",
            {
              stroke: layer ? layer.color : "#a54b4b",
              x,
              y,
              r: radius / 2,
              strokeWidth: width,
              fill: "none"
            },
            parent
          );
          break;
        case "pin":
          const { x, y, length, rot } = sym;
          const angle = +(rot || "").replace(/R/, "");
          const vec = Point.fromAngle((angle * Math.PI) / 180, SchematicRenderer.pinSizes[length]).prod(new Point(1, -1));
          const pivot = new Point(x, y);
          const l = new Line(pivot, vec.add(pivot));
          console.log("pin:", sym);
          this.factory("line", { stroke: layer ? layer.color : "#a54b4b", ...l.toObject(), strokeWidth: 0.1 }, parent);
          break;
        default:
          const { x, y, width, radius } = sym;
          console.log("Unhandled", sym.type || sym);
          break;
      }
    });
  }

  renderPart(part, parent) {
    const { designator, name, value, instance } = part;
    const { x, y } = instance;
    const symbol = this.symbols.find(sym => sym.name == part.symbol);
    const g = this.factory("g", { id: designator, transform: ` translate(${x},${y})` }, parent);
    this.renderSymbol(symbol, part, g);
    return g;
  }

  render(parent) {
    let partsGroup = this.factory("g", { class: "parts" }, parent);
    this.parts.forEach(part => this.renderPart(part, partsGroup));
  }
}

export function renderSchematic(obj, factory) {
  const renderer = new SchematicRenderer(obj, factory);
  const bb = new BBox();
  let objects = [];
  for(let [v, k, o] of Util.traverse(obj)) if(typeof v == "object" && v !== null) objects.push(v);
  bb.update(objects);
  const rect = bb.rect.outset(2.54 * 4);
  const center = rect.center;
  /*console.log("rect:", rect.toString());
  console.log("center:", center.prod(-1, -1).toString());
  console.log("factory.delegate.root:", factory.delegate.root);*/
  factory.delegate.root.setAttribute("viewBox", rect.toString());
  for(let [v, k, o] of Util.traverse(obj)) {
    if(["x", "y", "x1", "y1", "x2", "y2", "width", "size"].indexOf(k) != -1) {
      o[k] = v / 2.54;
      /* if(k !== "width" && k !== "size")*/ o[k] = Util.roundTo(o[k], 0.001);
      if(k[0] == "y") o[k] = -o[k];
    }
  }
  const g = factory("g", {
    transform: `translate(${center.prod(-1, -1)}) scale(2.54,2.54) translate(${center.prod(new Point(1 / 2.54, 1 / 2.54))})`
  });
  renderer.render(g);
}
