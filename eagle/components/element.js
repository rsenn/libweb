import { h, Component } from '../../preact.mjs';
import { TransformationList } from '../../geom/transformation.js';
import { Package } from './package.js';
import { MakeRotation, log } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';
import { digit2color, GetFactor, GetColorBands, ValueToNumber, NumberToValue, GetExponent, GetMantissa } from '../../eda/colorCoding.js';

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
      className: `element.${element.name}`,
      'data-path': element.path.toString(' '),
      transform
    },
    [pkg]
  );
};
