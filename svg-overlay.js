import React from "react";
import { Point, Element, SVG } from "./dom.js";
import { trkl } from "./trkl.js";
import { lazyInitializer } from "./lazyInitializer.js";

export function SvgPathTracer(path) {
  var bbox = SVG.bbox(path);
  var rect = Element.rect(SVG.owner(path).element);
  var length = path.getTotalLength();
  var steps = 100;
  var center = bbox.center;

  //console.log("SvgPathTracer ", { center, bbox, rect, length });

  var self = {
    length,
    center,
    *entries() {},
    *[Symbol.iterator]() {
      for(let i = 0; i < steps; i++) {
        const offset = (i * length) / steps;
        let point = new Point(path.getPointAtLength(offset));
        let relative = Point.diff(point, center);
        let angle = Point.toAngle(relative);
        let distance = Point.distance(relative);
        yield [offset, point];
      }
    }
  };
  return self;
}

export class SvgOverlay extends React.Component {
  //layer = lazyInitializer(() => Element.create('div', { id: 'svg-overlay', parent: document.body }));

  svg = lazyInitializer((rect, root) => {
    //console.log("lazyInitializer: ", { rect, root });
    var svg = SVG.create(
      "svg",
      {
        parent: root,
        width: rect.width,
        height: rect.height,
        viewBox: `0 0 ${rect.width} ${rect.height}`,
        style: `width: ${rect.width}px; height: ${rect.height}px`
      },
      root
    );
    const f = this.factory();
    if(f) f.root = svg;
    SVG.create("defs", {}, svg);

    ReactDOM.render(this.props.children, svg);
    //
    return svg;
  });

  factory = lazyInitializer(root => SVG.factory(root || this.svg()));
  paths = [];

  constructor(props) {
    super(props);
    this.layerRef = {};

    const { svgRef } = this.props;

    trkl.property(this.layerRef, "current").subscribe(ref => {
      //console.log("layerRef: ", ref);
      var rect = Element.rect(ref);
      var svg = SVG.create(
        "svg",
        {
          width: rect.width,
          height: rect.height,
          viewBox: `0 0 ${rect.width} ${rect.height}`,
          style: `width: ${rect.width}px; height: ${rect.height}px`
        },
        ref
      );
      SVG.create("defs", {}, svg);
      /* SVG.create(
        "rect",
        {
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          stroke: "#000",
          strokeWidth: 2,
          fill: "rgb(0,255,0)",
          "fill-opacity": 0.5
        },
        svg
      );*/
      this.svg(svg);
      const f = this.factory();
      f.root = svg;
      if(typeof svgRef == "function") svgRef({ svg, factory: f /*(name,props) => f(name,props, svg) */ });
      //console.log("SvgOverlay: ", { svg, rect });

      //   this.createPaths();
    });
    if(global.window) {
      window.svgOverlay = this;
    }
  }

  createPaths = () => {
    const f = this.factory();

    if(typeof f == "function") f("rect", { width: 100, height: 100, x: 50, y: 50, stroke: "red", strokeWidth: "4" });
  };

  render() {
    if(global.window) this.createPaths();

    return (
      <div
        className={"svg-overlay"}
        ref={this.layerRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100%",
          pointerEvents: "none"
        }}
      ></div>
    );
  }
}

export default SvgOverlay;
