import { SVG } from "../dom/svg.js";
import { BBox } from "../dom/bbox.js";
import { Point } from "../geom/point.js";
import { Line } from "../geom/line.js";

export class SchematicRenderer {
  static pinSizes = {
    long: 3,
    middle: 2,
    short: 1,
    point: 0
  };
static colors = [
"#FFFFFF", "#4B4BA5", "#4BA54B", "#4BA5A5", "#A54B4B", "#A54BA5", "#A5A54B", "#E6E6E6", "#4B4BFF", "#4BFF4B", "#4BFFFF", "#FF4B4B", "#FF4BFF", "#FFFF4B", "#4B4B4B", "#A5A5A5"
];
  constructor(obj, factory) {
    const { layers, nets, parts, sheets, symbols } = obj;

    this.layers = layers;
    this.nets = nets;
    this.parts = parts;
    this.sheets = sheets;
    this.symbols = symbols;
    this.factory = factory;
  }

  renderSymbol(symbol, part, parent) {
    const arr = symbol.children;
    console.log("symbol:", symbol.toXML(), " part:", part);

    for(let sym of symbol.children) {
      const layer = sym.layer;
     console.log("layer:", sym.layer);
/*
      if(sym.tagName == 'text') {
      console.log("text:", sym.text);
      console.log("children:", sym.raw.children);
      console.log("xml:", sym.toXML());
    }*/
    const color  = SchematicRenderer.colors[layer && layer.color] ||  "#4BA54B";

      switch (sym.tagName) {
        case "wire": {
          const { x1, x2, y1, y2, width, layer } = sym;
          this.factory("line", { stroke: color, x1, x2, y1, y2, strokeWidth: width*1.2 }, parent);
          break;
        }
         case "rectangle": {
          const { x1, x2, y1, y2, width, layer } = sym;
          this.factory("rect", { stroke: 'none', fill: color, x: x1, y: y1, width: x2-x1, height: y2-y1, strokeWidth: '0.1' }, parent);
          break;
        }
        case "text": {
          const { x, y, text, align, size, font } = sym;
          this.factory(
            "text",
            {
              fill: color,
              stroke: 'none',
              strokeWidth: 0.05,
              x,
              y,
              innerHTML: text,
              fontSize: size*1.6,
              fontFamily: font || "Fixed"
            },
            parent
          );
          break;
        }
        case "circle": {
          const { x, y, width, radius } = sym;
          this.factory(
            "circle",
            {
              stroke: color,
              x,
              y,
              r: radius ,
              strokeWidth: width * 0.8,
              fill: "none"
            },
            parent
          );
          break;
        }
        case "pin": {
          const { x, y, length, rot } = sym;
          const angle = +(rot || "").replace(/R/, "");
          const vec = Point.fromAngle((angle * Math.PI) / 180).prod(SchematicRenderer.pinSizes[length] * 2.54);
          const pivot = new Point(x, y);
          const l = new Line(pivot, vec.add(pivot));
          console.log("pin:", sym);
          this.factory("line", { class: 'pin', stroke:  "#A54B4b", ...l.toObject(), strokeWidth: 0.1 }, parent);
          break;
        }
        default: {
          const { x, y, width, radius } = sym;
          console.log("Unhandled", sym.type || sym);
          break;
        }
      }
    }
  }

  renderPart(instance, parent) {
    const { x, y, part, rot } = instance;
    const { deviceset, device, library, value } = part;
    let symbol;
    for(let gate of deviceset.gates.list) {
      console.log("gate:", gate.toXML());
      console.log("gate.symbol:", gate.attributes.symbol);
      symbol = library.symbols[gate.attributes.symbol];

      if(symbol) break;
    }

    //const symbol = library.symbols[deviceset.name];

    if(!symbol) {
      console.log("Symbol not found:", deviceset.name);
    }

    const g = this.factory("g", { id: part.name, transform: ` translate(${x},${y})` }, parent);
    this.renderSymbol(symbol, part, g);
    return g;
  }

  render(parent) {
    let partsGroup = this.factory("g", { class: "parts" }, parent);

    for(let instance of this.sheets[0].instances.list) {
      console.log("instance:", instance.toXML());
      console.log("instance.part:", instance.part.toXML());
      this.renderPart(instance, partsGroup);
    }
  }
}

export function renderSchematic(obj, factory) {
  const renderer = new SchematicRenderer(obj, factory);
  const bb = new BBox();
  let objects = [];

  for(let [v, k, o] of obj.iterator()) if(typeof v == "object" && v !== null) objects.push(v);
  bb.update(objects);
  const rect = bb.rect.outset(2.54 * 4);
  const center = rect.center;
  /*console.log("rect:", rect.toString());
  console.log("center:", center.prod(-1, -1).toString());
  console.log("factory.delegate.root:", factory.delegate.root);*/


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

  let bbox = SVG.bbox("#board");
  console.log("bbox:",bbox);
  console.log("bbox.aspect:",bbox.aspect());
  console.log("bbox.toString:",bbox.toString());
  //console.log("bbox.rect.toString:",bbox.rect.toString());
  factory.delegate.root.setAttribute("viewBox", bbox.toString());

}
