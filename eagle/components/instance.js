import { h, Component } from '../../dom/preactComponent.js';
import { TransformationList } from '../../geom/transformation.js';
import { SchematicSymbol } from './symbol.js';
import { Rotation } from '../common.js';

export const Instance = ({ data, opts = {}, ...props }) => {
  console.log(`Instance.render`, { data });

  let { x, y, rot, part, symbol } = data;
  let { deviceset, name, value } = part;
  let { transform = new TransformationList() } = opts;

  transform.translate(x, y);
  if(rot) {
    rot = Rotation(rot);
    transform = transform.concat(rot);
  }

  if(!value) value = deviceset.name;
  opts = {
    ...opts,
    ...(deviceset.uservalue == 'yes' || true ? { name, value } : { name, value: '' })
  };

  const sym = h(SchematicSymbol, { data: symbol, opts });

  console.log('Instance.render', { sym });

  return h('g', { className: `part.${part.name}`, 'data-path': part.path, transform }, [sym]);
};
