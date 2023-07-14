import { ValueToNumber } from '../../eda/colorCoding.js';
import { TransformationList } from '../../geom/transformation.js';
import { h } from '../../preact.mjs';
import { useValue } from '../../repeater/react-hooks.js';
import { log, MakeRotation } from '../renderUtils.js';
import { Package } from './package.js';

export const Element = ({ data, opts = {}, ...props }) => {
  let { transformation = new TransformationList() } = opts;

  log('Element.render', { transformation, data });

  let element =
    useValue(async function* () {
      for await(let change of data.repeater) {
        log('Element.change:', change);
        yield change;
      }
    }) || data;

  let { x, y, rot, library, name, value } = element;

  let transform = new TransformationList();

  transform.translate(x, y);

  if(rot) {
    rot = MakeRotation(rot);
    transform = transform.concat(rot);
  }

  if(!value && element.package) value = element.package.name;

  if(/^R[0-9]/.test(name)) {
    let number = ValueToNumber(value);

    log('name:', name, ' number:', number, ' value:', value);
  }

  const pkg = h(Package, {
    data: element.package,
    opts: {
      ...opts,
      ...{ name, value },
      transformation: transformation.concat(transform /*.filter(t => ['translate'].indexOf(t.type) == -1)*/)
    }
  });

  return h(
    'g',
    {
      class: `element.${element.name}`,
      'data-path': element.path.toString(' '),
      transform
    },
    [pkg]
  );
};