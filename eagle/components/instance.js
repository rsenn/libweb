import { h, Component } from '../../dom/preactComponent.js';
import { TransformationList } from '../../geom/transformation.js';
import { SchematicSymbol } from './symbol.js';
import { Rotation } from '../renderUtils.js';
import { useValue, useResult, useAsyncIter, useRepeater } from '../../repeater/react-hooks.js';

export const Instance = ({ data, opts = {}, transformation, ...props }) => {
  let instance =
    useValue(async function*() {
      for await (let change of data.repeater) {
        console.log('change:', change);
        yield change;
      }
    }) || data;

  let { x, y, rot, part, symbol } = instance;
  let { deviceset, name, value } = part;
  let { transform = new TransformationList() } = opts;

  console.log('instance:', instance);

  transform.translate(x, y);
  if(rot) {
    rot = Rotation(rot);
    transform = transform.concat(rot);
  }

  if(!value && deviceset) value = deviceset.name;

  const sym = h(SchematicSymbol, {
    data: symbol,
    opts: {
      ...opts,
      ...(deviceset.uservalue == 'yes' || true ? { name, value } : { name, value: '' }),
      transformation: transformation.concat(transform.filter(t => ['translate'].indexOf(t.type) == -1))
    }
  });

  console.log('Instance.render', { name, sym, transform, transformation: transformation.concat(transform.filter(t => ['translate'].indexOf(t.type) == -1)) });

  return h('g', { className: `part.${part.name}`, 'data-path': part.path, transform }, [sym]);
};
