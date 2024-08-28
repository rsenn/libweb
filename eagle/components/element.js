import { ValueToNumber } from '../../eda/colorCoding.js';
import { TransformationList } from '../../geom/transformation.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { log, MakeRotation } from '../renderUtils.js';
import { Package } from './package.js';

export const Element = ({ data, opts = {}, ...props }) => {
  const { transformation = new TransformationList() } = opts;

  const element =
    useValue(async function* () {
      for await(let change of data.repeater) yield change;
    }) || data;

  const { x, y, rot, library, name, value, package: pkg } = element;

  log('Element.render', { x,y,rot,library,name,value,package:pkg });

  let transform = new TransformationList();

  transform.translate(x, y);

  if(rot) 
    transform = transform.concat(MakeRotation(rot));

  if(/^R[0-9]/.test(name)) {
    const number = ValueToNumber(value);

    log('name:', name, ' number:', number, ' value:', value);
  }

  if(!value && pkg) value = pkg.name;

  log('Element.render', { transformation, transform });

  const child = h(Package, {
    data: pkg,
     opts: {
      ...opts,
      ...{ name, value },
      transformation: transformation.concat(transform /*.filter(t => ['translate'].indexOf(t.type) == -1)*/)
    }
  });

  return h(
    'g',
    {
      id: `element-${element.name}`,
      class: `element-${element.name}`,
      'data-path': element.path.toString(' '),
      transform
    },
    [child]
  );
};
