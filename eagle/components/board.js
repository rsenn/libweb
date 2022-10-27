import { log } from '../renderUtils.js';
import { h, Component, Fragment } from '../../dom/preactComponent.js';
import { ElementToComponent } from '../components.js';
import { Element } from './element.js';
import { Signals } from './signals.js';
import { TransformationList } from '../../geom/transformation.js';
import { HSLA } from '../../color/hsla.js';

export const Board = ({ data, ...props }) => {
  log('Board.render', { data });

  const { elements, signals, plain } = data;
  let { transform = new TransformationList() } = props;

  // transform.scale(1, -1);
  if(data) {
    let rect = data.getBounds();

    // transform.translate(0,-rect.height);
  }

  let numSignals = signals.list.length;

  let palette = signals.list.map((sig, i) => new HSLA((i * 360) / (numSignals - 1), 100, 50, 1).toRGBA());

  console.log('Board.render', { palette });

  return h('g', { ['data-name']: 'board', transform }, [
    h(Signals, { data: data.get('signals') }),
    /*    h(
      'g',
      { ['data-name']: 'signals' },
      signals.list.map((data, i) => h(Signal, { data, color: palette[i] }))
    ),*/
    h(
      'g',
      { ['data-name']: 'elements' },
      elements.list.map(data => h(Element, { data }))
    )
  ]);
};
