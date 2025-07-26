export default () => {
  return h(
    'svg',
    {
      viewBox: '0 -5 32 52',
    },
    h(
      'g',
      null,
      h('polyline', {
        points: '1 19 1 31 31 31 31 19',
      }),
      h('polyline', {
        className: '__arrow',
        points: '8 9 16 1 24 9',
      }),
      h('line', {
        className: '__arrow',
        x1: '16',
        x2: '16',
        y1: '1',
        y2: '25',
      }),
    ),
  );
};
