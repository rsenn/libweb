export function Currency({ name, key, symbol, toSats, fromSats, round, format, ...rest }) {
  return {
    name: name || key,
    key: key,
    symbol: symbol || key,
    toSats: toSats || (amount => NaN),
    fromSats: fromSats || (sats => NaN),
    round: round || (value => Math.round(value * 100) * 0.01),
    format: format || (value => `${symbol}${value}`),
    get icon() {
      return Currency.icon(this.key);
    },
    get stepsize() {
      return CurrencyList.stepsizes[this.key];
    },
    ...rest
  };
}

export class CurrencyList {
  static mapping = [
    'BTC', // 1
    'mBTC', // 2
    'SAT', // 3
    'USD', // 4
    'EUR', // 5
    'TOM' // 6
  ];
  static currencies = {
    BTC: Currency({
      name: 'BitCoin',
      key: 'BTC',
      symbol: String.fromCharCode(0x20bf),
      before: true,
      format: function(am) {
        if(am == NaN || am == 'NaN') return '...';
        am = this.round(am) + '';
        return `${this.symbol}${am}`;
      },
      fromSats: 1.0e-8,
      toSats: 1.0e8,
      round: v => Math.round(v * 1.0e8) * 1.0e-8
    }),
    SAT: Currency({
      name: 'Satoishi',
      key: 'SAT',
      symbol: String.fromCharCode(0x218),
      before: false,
      format: (am, cu) => `${am} satoshis`,
      fromSats: 1,
      toSats: 1,
      round: v => Math.round(v),
      format: v => `${v} satoshis`
    }),
    USD: Currency({
      name: 'US Dollar',
      key: 'USD',
      symbol: '$',
      before: true,
      format: (am, cu) => `${this.symbol}${am}`,
      round: v => Math.round(v * 100) / 100,
      fromSats: NaN,
      toSats: NaN
    }),
    EUR: Currency({
      name: 'Euro',
      key: 'EUR',
      symbol: String.fromCharCode(0x20ac),
      before: false,
      format: function(am) {
        if(am == NaN || am == 'NaN') return '...';
        am = Math.round(am * 100) / 100;
        var value =
          this.symbol +
          '' +
          am.toLocaleString('en', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        return value;
      },
      round: v => Math.round(v * 100) / 100,
      fromSats: NaN,
      toSats: NaN
    }),
    TOM: Currency({
      name: 'Iranian Toman',
      key: 'TOM',
      symbol: 'TOM',
      before: true,
      format: function(am) {
        if(am == NaN || am == 'NaN') return '...';
        if(typeof am === 'number') am = this.round(am);
        return `TOM ${am}`;
      },
      fromSats: NaN,
      toSats: NaN,
      round: v => Math.round(v)
    })
  };

  static icons = {
    BTC: ({ width = '1em', height = 'auto', stroke = 'none', fill = 'inherit', ...props }) => (
      <svg
        height="48"
        width="48"
        className={'icon-btc'}
        viewBox={'0 0 48 48'}
        style={{
          position: 'relative' /*, verticalAlign: 'baseline', transform: 'translate(3px, 7px)'*/,
          width,
          height
        }}>
        <path
          style={{ isolation: 'isolate' }}
          d="M38.209 25.07a7.557 7.557 0 00-4.49-2.641c3.647-1.541 4.475-6.43 2.504-9.584-1.71-3.082-6.19-3.07-8.617-4.066V2.621h-4.042v6.372H20.42V2.64h-3.955v6.475H8.523v4.231c1.281.06 2.596-.132 3.85.122 1.173.394 1.395 1.696 1.278 2.768v6.21c.641-.283-.346.452.017 1.163-.024 3.155.049 6.318-.036 9.469-.235 1.126-1.499 1.1-2.4 1.043H9.318l-.829 4.696h7.944v6.563h3.955v-6.493h3.142v6.458h3.955v-6.562c5.467.349 12.278-2.671 12.008-9.04.127-1.579-.348-3.609-1.283-4.672zm-17.63-11.465c2.753.068 5.795-.416 8.133 1.346 1.548 1.38 1.523 4.277-.384 5.332-2.32 1.417-5.137 1.133-7.75 1.162v-7.893zm10.809 17.51c-1.03 2.372-3.989 2.732-6.277 2.956-1.507.128-3.022.042-4.533.067v-8.636c3.3.05 6.893-.33 9.774 1.572 1.247.782 1.745 3.438 1.036 4.042z"
          strokeWidth={0}
          fill={fill}
          stroke={stroke}
        />
      </svg>
    ),
    USD: '/static/img/sign-dollar.svg',
    EUR: '/static/img/sign-euro.svg',
    IRR: '/static/img/sign-rial.svg',
    TOM: ({ width = 120.879, height = 47.649, color, style }) => (
      <svg style={style} viewBox="0 0 129.749 51.145" xmlns="http://www.w3.org/2000/svg">
        <defs />
        <path
          stroke={color}
          fill={color}
          d="M56.96 6.772c-11.448 0-20.072 9.198-20.072 22.46 0 12.734 8.453 21.798 19.465 21.798 5.458 0 10.541-1.975 14.207-5.83 3.666-3.856 5.865-9.532 5.865-16.688 0-6.223-1.917-11.655-5.35-15.549-3.432-3.894-8.387-6.191-14.115-6.191zm24.974 0l-3.112 44.373h8.215l1.16-19.456v-.002c.152-2.649.193-5.078.329-7.766.642 2.055 1.071 3.881 1.817 6.072l6.752 20.92h6.114l7.38-21.256-.024.057c.981-2.52 1.536-4.602 2.303-6.921.12 2.984.143 5.874.3 8.635l1.064 19.717h8.438l-2.678-44.373h-9.32l-7.456 20.781-.003.012c-1.118 3.189-1.84 5.798-2.67 8.555-.796-2.764-1.509-5.402-2.56-8.535l-.002-.013-7.156-20.8zM7.098 6.757V14.4H19.13v36.63h8.478V14.4h12.118V6.757zm49.604 7.516c3.745 0 6.325 1.698 8.18 4.39 1.854 2.691 2.835 6.422 2.835 10.078 0 4.204-1.116 7.992-3.036 10.632-1.92 2.64-4.536 4.186-8.039 4.186-3.496 0-6.095-1.57-7.997-4.18-1.901-2.608-2.99-6.3-2.99-10.232 0-4.085.995-7.907 2.847-10.584 1.852-2.678 4.428-4.291 8.2-4.291z"
        />{' '}
      </svg>
    )
  };

  static stepsizes = {
    BTC: [0.001, 0.01, 0.1],
    EUR: [0.1, 1.0, 100.0],
    USD: [0.1, 1.0, 100.0],
    IRR: [1e4, 1e5, 1e7],
    TOM: [1e3, 1e4, 1e6]
  };
}

Currency.index = function(str, def = null) {
  for(let sym in CurrencyList.currencies) {
    const c = CurrencyList.currencies[sym];
    if(str.indexOf(sym) != -1 || str.indexOf(c.name) != -1 || str.indexOf(c.symbol) != -1) {
      return sym;
    }
  }
  return def;
};

Currency.find = function(arg, def = null) {
  const key = Currency.findKey(arg, def);
  return key == null ? null : CurrencyList.currencies[key];
};
Currency.findKey = function(arg, def = null) {
  if(typeof arg === 'object') return arg;
  const key = typeof arg === 'string' ? Currency.index(arg, def) : null;
  return key;
};

Currency.icon = function(arg) {
  const c = Currency.find(arg);
  return CurrencyList.icons[c.key];
};

Currency.converter = function(from, to) {
  const c = [Currency.find(from), Currency.find(to)];
  return amount => c[1].fromSats * c[0].toSats * amount;
};
