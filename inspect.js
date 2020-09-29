const keysFn = fn => o => (o instanceof Map ? [...o.keys()] : fn(o));
const getFn = (o, k) => (o instanceof Map ? o.get(k) : o[k]);

export const inspect = (o, pred = v => true) =>
  typeof(o) != 'object' ? o+'' : o instanceof Array ?  '[ '+o.map(item => inspect(item)).join(", ")+' ]' :
  '{\n  ' +
  [
    [o => o, keysFn(Object.keys)],
    [Object.getPrototypeOf, keysFn(Object.keys)],
    [o => o, keysFn(Object.getOwnPropertyNames)],
    [Object.getPrototypeOf, keysFn(Object.getOwnPropertyNames)]
  ]
    .reduce((a, [proto, keys]) => (a.length ? a : [...a, ...keys(proto(o))]), [])
    .reduce((a, k) => (a.indexOf(k) == -1 ? [...a, k] : a), [])
    .map(k => {
      /*console.log('k:', k);
      console.log('o:', o);
      console.log('v:', getFn(o, k));*/
      return [k, getFn(o, k)];
    })
    .map(([k, v]) => {
      if(pred(v, k) == false) return '';
      let s = v;
      if(typeof s != 'string') {
        try {
          if(typeof s == 'object') s = inspect(s, pred);
          else s = s + '';
        } catch(err) {
          s = typeof s;
        }
        if(typeof v == 'function') s = s.substring(0, s.indexOf('{')).trim();
      } else {
        s = '"' + s + '"';
      }
      if(s.length > 200) s = s.substring(0, 200) + '...';
      return k + (o instanceof Map ? ' => ' : ': ') + s.replace(/\n\s*/g, ' ');
    })
    //   .filter((item) => item != '')
    .join(',\n  ') +
  '\n}';

export default inspect;
