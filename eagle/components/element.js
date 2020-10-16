import { h, Component } from '../../dom/preactComponent.js';
import { TransformationList } from '../../geom/transformation.js';
import { BoardPackage } from './package.js';
import { MakeRotation } from '../renderUtils.js';
import { useValue } from '../../repeater/react-hooks.js';

export const Element = ({ data, opts = {}, transformation, ...props }) => {
  let element =
    useValue(async function* () {
      for await (let change of data.repeater) {
        console.log('Element.change:', change);
        yield change;
      }
    }) || data;

  let { x, y, rot, library, name, value } = element;
  let { transform = new TransformationList() } = opts;

  transform.translate(x, y);
  if(rot) {
    rot = MakeRotation(rot);
    transform = transform.concat(rot);
  }

  if(!value && element.package) value = element.package.name;

  const pkg = h(BoardPackage, {
    data: element.package,
    opts: {
      ...opts,
      ...{ name, value },
      transformation: transformation.concat(transform.filter(t => ['translate'].indexOf(t.type) == -1))
    }
  });

  console.log('Element.render', { name, value, library: library.name, rot, x, y });

  return h('g', { className: `element.${element.name}`, 'data-path': element.path.toString(' '), transform }, [pkg]);
};
