import { h, Component } from '../../dom/preactComponent.js';
import { TransformationList } from '../../geom/transformation.js';
import { useTrkl, useAttributes } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';

export const useGrid = data => {
  const factors = { inch: 25.4, mm: 1 };
  const calcDist = (value, unit) => {
    // console.debug('calcDist:', { value, unit });
    const f = factors[unit];
    return value * f;
  };
  const { distance, unitdist, unit, style, multiple, display, altdistance, altunitdist, altunit } = useAttributes(data);
  //console.debug('useGrid:', { distance, unitdist, unit });
  let result = {
    distance: calcDist(+distance, unitdist || unit),
    altdistance: calcDist(+altdistance, altunitdist || altunit),
    display: display == 'yes',
    style,
    multiple: +multiple
  };
  return result;
};

export const Pattern = ({ data, id = 'pattern', attrs = { color: '#0000aa', width: 0.05 }, ...props }) => {
  data =
    useValue(async function* () {
      for await (let change of data.repeater) {
        //console.log('change:', change);
        yield change;
      }
    }) || data;
  const { distance = 0.1, style, multiple = 1, display, altdistance } = useGrid(data);

  //console.log('Pattern.render:', { distance, style, multiple, display, altdistance });
  let pattern = typeof attrs == 'function' ? useTrkl(attrs) : attrs;
  console.log('Pattern.render ', { pattern, distance, multiple });
  let { width = 0.05, color = '#0000aa' } = pattern;
  const size = distance * multiple;
  return h('pattern',
    { id, width: size, height: size, patternUnits: 'userSpaceOnUse' },
    h('path', {
      d: `M ${size},0 L 0,0 L 0,${size}`,
      fill: 'none',
      stroke: color || '#0000aa',
      'stroke-width': style == 'dots' ? width * 2 : width,
      'stroke-dasharray': style == 'dots' ? `${width}  ${size * 4}` : `${size * 2}`
    })
  );
};

export const Grid = ({ data, rect, attrs = { visible: true }, opts = {}, ...props }) => {
  let { transform = new TransformationList() } = opts;
  const { distance, style, multiple, display, altdistance } = useGrid(data);
  //console.log('Grid.render:', { distance, style, multiple, display, altdistance });

  let grid = typeof attrs == 'function' ? useTrkl(attrs) : attrs;
  ///console.log('Grid.render ', { grid });

  return h('rect', {
    stroke: 'none',
    fill: 'url(#grid)',
    style: grid.visible ? {} : { display: 'none' },
    ...rect.toObject(),
    transform
  });
};
