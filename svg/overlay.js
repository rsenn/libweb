import { Element, Point, SVG } from '../dom.js';

export function SvgPathTracer(path) {
  let bbox = SVG.bbox(path);
  let rect = Element.rect(SVG.owner(path).element);
  let length = path.getTotalLength();
  let steps = 100;
  let center = bbox.center;

  //console.log("SvgPathTracer ", { center, bbox, rect, length });

  let self = {
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

/*export class SvgOverlay extends React.Component {
  //layer = lazyInitializer(() => Element.create('div', { id: 'svg-overlay', parent: document.body }));

  xsvg = lazyInitializer((rect, root) => {
    //console.log("lazyInitializer: ", { rect, root });
    let svg = SVG.create('svg',
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
    SVG.create('defs', {}, svg);

    ReactDOM.render(this.props.children, svg);
    //
    return svg;
  });

  factory = lazyInitializer(root => SVG.factory(root || this.svg()));
  paths = [];

  constructor(props) {
    super(props);
    this.layerRef = React.createRef();

    const { svgRef } = this.props;

    if(globalThis.window) {
      window.svgOverlay = this;
    }
  }

  componentDidMount() {
    const ref = this.layerRef.current;

    //trkl.property(this.layerRef, 'current').subscribe(ref => {
    //console.log("layerRef: ", ref);
    if(!this.svg) {
    let rect = Element.rect(ref);
    let svg = SVG.create('svg',
      {
        width: rect.width,
        height: rect.height,
        viewBox: `0 0 ${rect.width} ${rect.height}`,
        style: `width: ${rect.width}px; height: ${rect.height}px`
      },
      ref
    );
    SVG.create('defs', {}, svg);
}

     SVG.create("rect", {
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          stroke: "#000",
          strokeWidth: 2,
          fill: "rgb(0,255,0)",
          "fill-opacity": 0.5
        }, svg
      );
    const f = this.factory();
    f.root = svg;
    if(typeof svgRef == 'function')
      svgRef({ svg, factory: f  });
    //console.log("SvgOverlay: ", { svg, rect });

    //this.createPaths();
    //});
  }

  createPaths = () => {
    const f = this.factory();

    console.log("this.svg", this.svg);

    if(typeof f == 'function')
      f('rect', {
        width: 100,
        height: 100,
        x: 50,
        y: 50,
        stroke: 'red',
        strokeWidth: '4'
      });
  };

  render() {
    if(globalThis.window) this.createPaths();

    return (<div
        className={'svg-overlay'}
        ref={this.layerRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100%',
          pointerEvents: 'none',
          ...this.props.style
        }}
      />
    );
  }
}*/

export const SvgOverlay = ({ svgRef }) => {
  return <svg></svg>;
};

export default SvgOverlay;