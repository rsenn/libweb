import { TransformationList } from '../../geom/transformation.js';
import { useTrkl } from '../../hooks/useTrkl.js';
import { define } from '../../misc.js';
import { h } from '../../preact.mjs';
import { useRef } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { log } from '../renderUtils.js';
import { useAttributes } from '../renderUtils.js';

export const useGrid = data => {
  const factors = { inch: 25.4, mm: 1 };
  const calcDist = (value, unit) => {
    // log('calcDist:', { value, unit });
    const f = factors[unit];
    return value * f;
  };
  const { distance, unitdist, unit, style, multiple, display, altdistance, altunitdist, altunit } = useAttributes(data);
  //log('useGrid:', { distance, unitdist, unit });
  let result = {
    distance: calcDist(+distance, unitdist || unit),
    altdistance: calcDist(+altdistance, altunitdist || altunit),
    display: display == 'yes',
    style,
    multiple: +multiple
  };
  return result;
};

export const Pattern = ({ data, id = 'pattern', attrs = { color: '#0000aa', width: 0.01 }, ...props }) => {
  log('Pattern.render ', { data, id, attrs, props });
  data =
    useValue(async function* () {
      for await(let change of data.repeater) {
        //log('change:', change);
        yield change;
      }
    }) || data;
  const { distance = 0.1, style, multiple = 1, display, altdistance } = useGrid(data);

  //log('Pattern.render:', { distance, style, multiple, display, altdistance });
  let pattern = useTrkl(attrs);

  let { width, color = '#0000aa' } = pattern;
  let ref =
    useRef() ||
    (() => {
      let current;
      let ret = function(value) {
        log('Pattern.render value =', value);
        current = value;
      };
      define(ret, {
        get current() {
          return current;
        },
        set current(value) {
          ret(value);
        }
      });
      return ret;
    })();

  if(ref.current) log('Pattern.render ref.current =', ref.current);

  const size = distance * multiple;
  log('Pattern.render ', { width, color, size });

  return h(
    'pattern',
    { id, width: size, height: size, patternUnits: 'userSpaceOnUse' },
    h('path', {
      ref,
      d: `M ${size},0 L 0,0 L 0,${size}`,
      fill: 'none',
      stroke: color,
      //  'vector-effect': 'non-scaling-stroke',
      'stroke-width': style == 'dots' ? width * 2 : width,
      'stroke-dasharray': style == 'dots' ? `${width}  ${size * 4}` : `${size * 2}`
    })
  );
};

export const Grid = ({ data, rect, id, attrs = { visible: true }, opts = {}, ...props }) => {
  let { transform = new TransformationList() } = opts;
  const { distance, style, multiple, display, altdistance } = useGrid(data);
  log('Grid.render:', { data, rect, attrs, opts, props });

  let grid = typeof attrs == 'function' ? attrs() : attrs;
  //let ref = useRef();
  log('Grid.render ', { grid });
  return h('rect', {
    //ref,
    stroke: 'none',
    fill: `url(#${id})`,
    style: grid.visible ? {} : { display: 'none' },
    ...rect.toObject(),
    transform
  });
};