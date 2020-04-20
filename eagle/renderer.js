import { SVG } from "../dom/svg.js";
import { BBox } from "../dom/bbox.js";
import { Point } from "../geom/point.js";
import { Line } from "../geom/line.js";
import { EagleElement } from "./element.js";

const RotateTransformation = rot => {
  let angle = +(rot || "").replace(/R/, "") || 0;
  // rot -= 90;
  return `rotate(${angle})`;
  //  return angle != 0 ? `rotate(${angle})` : '';
};

const InvertY = item => {
  //item = EagleElement.toObject(item);
  let ret = {};
  for(let prop in item.attributes) {
    if(prop.startsWith("y")) ret[prop] = -+item.attributes[prop];
    else ret[prop] = item.attributes[prop];
  }
  return item;
};

export class SchematicRenderer {
  static pinSizes = {
    long: 3,
    middle: 2,
    short: 1,
    point: 0
  };
  static colors = ["#ffffff", "#4b4ba5", "#4ba54b", "#4ba5a5", "#a54b4b", "#a54ba5", "#a5a54b", "#e6e6e6", "#4b4bff", "#4bff4b", "#4bffff", "#ff4b4b", "#ff4bff", "#ffff4b", "#4b4b4b", "#a5a5a5"];
  constructor(obj, factory) {
    const { layers, nets, parts, sheets, symbols } = obj;

    this.layers = layers;
    this.nets = nets;
    this.parts = parts;
    this.sheets = sheets;
    this.symbols = symbols;
    this.factory = factory;
  }

  renderCollection(collection, parent, labelText) {
    const arr = collection.children;
    /* console.log("collection:", collection.toXML(), " part:", part);*/

    for(let item of collection.children) this.renderItem(item, parent, labelText);
  }

  renderItem(item, parent, opts = {}) {
    const layer = item.layer;
    const color = SchematicRenderer.colors[layer && layer.color ] || "#4BA54B";
    const factory = (elem, attr, parent) => this.factory(elem, { className: item.tagName, ...attr }, parent);

    const { labelText, coordFn = i => i } = opts;

    switch (item.tagName) {
      case "wire": {
        const { x1, x2, y1, y2, width } = coordFn(item);
        factory("line", { stroke: color, x1, x2, y1, y2, strokeWidth: +(width * 1).toFixed(3) }, parent);
        break;
      }
      case "rectangle": {
        const { x1, x2, y1, y2, width } = coordFn(item);
        factory(
          "rect",
          {
            stroke: "none",
            fill: color,
            x: x1,
            y: y1,
            width: x2 - x1,
            height: y2 - y1,
            strokeWidth: "0.1"
          },
          parent
        );
        break;
      }
      case "label": {
        const { x, y, size, rot } = coordFn(item);

        const transform = `translate(${x},${y}) scale(1,-1) ${RotateTransformation(rot)}`;
        factory(
          "text",
          {
            fill: "#f0f", //color,
            stroke: "none",
            x: 0,
            y: 0,
            /*   x,
            y,*/ "text-anchor": "middle",
            "alignment-baseline": "central",
            innerHTML: labelText,
            fontSize: 3,
            fontFamily: "Fixed",
            transform
          },
          parent
        );
        break;
      }
      case "text": {
        let { x, y, text, align, size, font, rot } = coordFn(item);
        if(text.startsWith("&gt;")) {
          const prop = text.slice(4).toLowerCase();
          text = prop in opts ? opts[prop] : text;
        }
        const transform = `translate(${x},${y}) scale(1,-1) ${RotateTransformation(rot)}`;
        factory(
          "text",
          {
            fill: color,
            stroke: "none",
            strokeWidth: 0.05,
            x: 0,
            y: 0,
            innerHTML: text,
            fontSize: size * 1.6,
            fontFamily: font || "Fixed",
            transform
          },
          parent
        );
        break;
      }
      case "junction": {
        const { x, y } = coordFn(item);
        factory(
          "circle",
          {
            fill: "#4ba54b",
            cx: x,
            cy: y,
            r: 0.5,
            stroke: "none"
          },
          parent
        );
        break;
      }
      case "circle": {
        const { x, y, width, radius } = coordFn(item);
        factory(
          "circle",
          {
            stroke: color,
            cx: x,
            cy: y,
            r: radius,
            strokeWidth: width * 0.8,
            fill: "none"
          },
          parent
        );
        break;
      }
      case "pin": {
        const { x, y, length, rot } = coordFn(item);
        const angle = +(rot || "").replace(/R/, "");
        const vec = Point.fromAngle((angle * Math.PI) / 180).prod(SchematicRenderer.pinSizes[length] * 2.54);
        const pivot = new Point(+x, +y);
        const l = new Line(pivot, vec.add(pivot));
        console.log("pin:", item);
        factory("line", { class: "pin", stroke: "#a54b4b", ...l.toObject(), strokeWidth: 0.15 }, parent);
        break;
      }
      default: {
        const { x, y, width, radius } = coordFn(item);
        console.log("Unhandled", item.tagName);
        break;
      }
    }
  }

  renderPart(instance, parent) {
    const { x, y, rot } = instance;
    const part = instance.part;
    const { deviceset, device, library, name, value } = part;
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

    const g = this.factory("g", { id: `part.${part.name}`, transform: ` translate(${x},${y}) ${RotateTransformation(rot)}` }, parent);
    this.renderCollection(symbol, g, { name, value });
    return g;
  }

  renderNet(net, parent) {
    let g = this.factory("g", { id: `net.${net.name}` }, parent);
    for(let segment of net.children) this.renderCollection(segment, g, { labelText: net.name });
  }

  render(parent) {
    for(let sheet of this.sheets) {
      console.log("sheet:", sheet);
      this.renderSheet(sheet, parent);
    }
  }

  renderSheet(sheet, parent) {
    let netsGroup = this.factory("g", { className: "nets" }, parent);
    console.log("netsGroup:", netsGroup);
    let partsGroup = this.factory("g", { className: "parts" }, parent);

    for(let instance of sheet.instances.list) this.renderPart(instance, partsGroup);

    for(let net of sheet.nets.list) this.renderNet(net, netsGroup);
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
    transform: `translate(${center.prod(-1)}) scale(2.54,2.54) translate(${center.prod(1 / 2.54)}) scale(1,-1)`,
    "vector-effect": "non-scaling-stroke"

  });
  renderer.render(g);

  let bbox = SVG.bbox("#board");
  console.log("bbox:", bbox);
  console.log("bbox.aspect:", bbox.aspect());
  console.log("bbox.toString:", bbox.toString());
  //console.log("bbox.rect.toString:",bbox.rect.toString());
  factory.delegate.root.setAttribute("viewBox", bbox.toString());
}
