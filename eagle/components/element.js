import { ValueToNumber } from '../../eda/colorCoding.js';
import { TransformationList } from '../../geom/transformation.js';
import { h } from '../../preact.js';
import { useValue } from '../../repeater/react-hooks.js';
import { log } from '../renderUtils.js';
import { MakeRotation } from '../renderUtils.js';
import { Package } from './package.js';

export const Element = ({ data, opts = {}, ...props }) => {
  const { transformation = new TransformationList() } = opts;

  const element =
    useValue(async function* () {
      for await(let change of data.repeater) yield change;
    }) || data;

  let { x, y, rot, library, name, value } = element;

  log('Element.render', { x, y, rot, library, name, value });

  let transform = new TransformationList();

  transform.translate(x, y);

  if(rot) {
    rot = MakeRotation(rot);
    transform = transform.concat(rot);
  }

  {
    let pkg = element.library.get(e => e.tagName == 'package' && e.attributes.name == element.attributes.package);

    if(!value && pkg) value = pkg.name;
  }
  /* if(rot) 
    transform = transform.concat(MakeRotation(rot));*/

  /*  if(/^R[0-9]/.test(name)) {
    const number = ValueToNumber(value);

    log('name:', name, ' number:', number, ' value:', value);
  }*/

  if(!value && pkg) value = pkg.name;

  log('Element.render', { transformation, transform });

  const child = h(Package, {
    data: pkg,
    opts: {
      ...opts,
      ...{ name, value },
      transformation: transformation.concat(transform /*.filter(t => ['translate'].indexOf(t.type) == -1)*/),
    },
  });

  return h(
    'g',
    {
      id: `element-${element.name}`,
      class: `element-${element.name}`,
      'data-path': element.path.toString(' '),
      transform,
    },
    [child],
  );
};