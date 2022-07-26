import { h, Component } from '../../dom/preactComponent.js';
import { TransformationList } from '../../geom/transformation.js';
import { SchematicSymbol } from './symbol.js';
import { MakeRotation, log, useTransform } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';

export const Instance = ({ data, opts = {}, ...props }) => {
   console.log('Instance.render', { data,opts });
let [transformation, transform, accumulate] = useTransform(opts);

   console.log('Instance.render', { transformation, transform, accumulate });
  //let { transformation = new TransformationList() } = opts;
  //log('Instance.render', { transformation, data });

  let instance = /*useValue(async function* () {}) || */data;

    async function* DataFn () {
      for await(let change of data.repeater) {
        log('change:', change);
        yield change;
      }
    }

  let { x, y, rot, part, symbol } = instance;
  let { deviceset, name, value } = part;

  transform.translate(x, y);
  if(rot) {
    rot = MakeRotation(rot);
    transform = transform.concat(rot);
  }

  if(!value && deviceset) value = deviceset.name;

  // value = value.replace(/Ω/g, "\u2126;").replace(/μ/g, "\u00b5;");

   console.log('Instance.render', { symbol});

  const sym = h(SchematicSymbol, {
    data: symbol,
    opts: {
      ...opts,
      ...(deviceset.uservalue == 'yes' || true ? { name, value } : { name, value: '' }),
      transformation: transformation.concat(transform.filter(t => ['translate'].indexOf(t.type) == -1))
    }
  });

  return h(
    'g',
    {
      class: `part ${part.name}`,
      'data-path': part.path.toString(' '),
      transform
    },
    [sym]
  );
};
