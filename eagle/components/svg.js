import { log } from '../renderUtils.js';
import { h, Component, toChildArray } from '../../dom/preactComponent.js';
import { MiscFixedSC613 } from '../../svg/miscFixed.js';

export const SVG = ({ viewBox, preserveAspectRatio = 'xMinYMin', styles, children, defs = [], ...props }) => {
  return h('svg',
    {
      viewBox,
      preserveAspectRatio,
      xmlns: 'http://www.w3.org/2000/svg',
      ...props
    }, [defs ? h('defs', {}, [h(MiscFixedSC613), ...toChildArray(defs)]) : null, styles ? h('style', {}, styles) : null, ...children]
  );
};
