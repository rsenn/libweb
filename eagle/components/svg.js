import { log } from '../renderUtils.js';
import { h, Component, toChildArray } from '../../dom/preactComponent.js';
import { FixedMedium } from '../../svg/fixedMedium.js';

export const SVG = ({ viewBox, preserveAspectRatio = 'xMinYMin', styles, children, defs = [], ...props }) => {
  return h('svg',
    {
      viewBox,
      preserveAspectRatio,
      xmlns: 'http://www.w3.org/2000/svg',
      ...props
    }, [
      defs ? h('defs', {}, [h(FixedMedium), ...toChildArray(defs)]) : null,
      styles ? h('style', {}, styles) : null,
      ...children
    ]
  );
};
