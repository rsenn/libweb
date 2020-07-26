import Util from '../../util.js';
import { h, Component, useState, useEffect } from '../../dom/preactComponent.js';
import { Point, Line } from '../../geom.js';
import { MakeCoordTransformer } from '../renderUtils.js';

const Instance = ({ data, opts, ...props }) => {
  let { x, y, rot, part, symbol } = data;
  let { deviceset, name, value } = part;
  let { transform = new TransformationList() } = opts;
  transform.translate(x, y);
  if(rot) {
    rot = Rotation(rot);
    transform = transform.concat(rot);
  }
  connsole.log(`Instance.render`, { x, y, transform });

  if(!value) value = deviceset.name;
  opts = { ...opts, ...(deviceset.uservalue == 'yes' || true ? { name, value } : { name, value: '' }) };

  return h('g', { className: `part.${part.name}`, 'data-path': part.path, transform }, h(Symbol, { data: symbol, opts }));
};
