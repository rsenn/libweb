import { h } from '../../preact.mjs';

export function polarToCartesian(x, y, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180.0;
  return {
    x: x + r * Math.cos(rad),
    y: y + r * Math.sin(rad),
  };
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

export function describeArc(x, y, r, s, e) {
  let dist = e - s;
  s = mod(s, 360);
  e = s + dist;
  const start = polarToCartesian(x, y, r, e);
  const end = polarToCartesian(x, y, r, s);
  let largeArcFlag = '0';
  if(e >= s) {
    largeArcFlag = e - s <= 180 ? '0' : '1';
  } else {
    largeArcFlag = e + 360.0 - s <= 180 ? '0' : '1';
  }
  const d = ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  return d;
}

export const Arc = ({ x, y, radius = 1, width = 0.127 / 2, startAngle, endAngle, color = '#f0f', visible = true, ...props }) => {
  let d = describeArc(x, y, radius, startAngle, endAngle);

  if(Math.abs(endAngle - startAngle) >= 360) d = describeArc(x, y, radius, startAngle, startAngle + 180) + describeArc(x, y, radius, startAngle + 180, startAngle + 360);

  return h('path', {
    class: 'arc',
    stroke: color,
    d,
    'stroke-width': width,
    fill: 'none',
    style: visible ? {} : { display: 'none' },
    ...props,
  });
};
