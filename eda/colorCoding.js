import { HSLA } from '../color.js';
import { GetExponent, GetMantissa, NumberToValue, ValueToNumber } from './values.js';

export { GetExponent, GetMantissa, ValueToNumber, NumberToValue } from './values.js';

export function GetMultipliers() {
  return {
    [-2]: 1e-1,
    [-1]: 1,
    [0]: 10,
    [1]: 100,
    [2]: 1e3,
    [3]: 1e4,
    [4]: 1e5,
    [5]: 1e6,
    [6]: 1e7,
    [7]: 1e8,
    [8]: 1e9,
    [9]: 1e10
  };
}

export function GetMultiplier(exponent, base = 10) {
  return Math.pow(base, exponent);
}

export function GetFactor(num) {
  const multipliers = GetMultipliers();
  let i = -1;
  for(let exp in multipliers) {
    const max = multipliers[exp];
    if(num >= max) i++;
    else break;
  }
  return i;
}

export function GetColorBands(value, precision = 2) {
  let f = GetFactor(value);
  let fx = f + (2 - precision);
  let multipliers = GetMultipliers();
  let x = value / (multipliers[f] ?? GetMultiplier(f));
  let r = [];
  // console.log('GetColorBands(', value, ',', precision, ') =', { f, fx, multipliers, x, r });

  for(let i = 0; i < precision; i++) {
    let digit = Math.floor(x);
    x = x % 1;
    x *= 10;
    x = Math.round(x * 10) / 10;
    r.push(digit);
  }
  return r.concat([fx]);
}

export const BG = Symbol.for('BG');

export const PartScales = {
  C: 1e12,
  R: 1,
  L: 1
};

export const digit2color = {
  rgb: {
    //[BG]: '#ebce9d',[0]: '#000000', [1]: '#8b572a', [2]: '#d0021b', [3]: '#f5a623', //[4]: '#f8e71c', [5]: '#7ed321', [6]: '#4a90e2', [7]: '#9013fe', [8]: '#999999', [9]: '#ffffff'
    [BG]: [...new HSLA({ h: 30, s: 66, l: 80, a: 1 }).toRGBA()].slice(0, 3),
    [0]: [0x00, 0x00, 0x00],
    [1]: [0x8b, 0x57, 0x2a],
    [2]: [0xd0, 0x02, 0x1b],
    [3]: [0xf5, 0xa6, 0x23],
    [4]: [0xf8, 0xe7, 0x1c],
    [5]: [0x7e, 0xd3, 0x21],
    [6]: [0x4a, 0x90, 0xe2],
    [7]: [0x90, 0x13, 0xfe],
    [8]: [0x99, 0x99, 0x99],
    [9]: [0xff, 0xff, 0xff]
  } /*.map(c => RGBA.fromHex(c))*/,
  ansi: {
    [BG]: [48, 5, 223], // base color (skin)
    [-2]: [48, 5, 249], // silver
    [-1]: [48, 5, 172], // gold
    [0]: [48, 5, 16], // black
    [1]: [48, 5, 94], // brown
    [2]: [48, 5, 160], // red
    [3]: [48, 5, 208], // orange
    [4]: [48, 5, 226], // yellow
    [5]: [48, 5, 40], // green
    [6]: [48, 5, 27], // blue
    [7]: [48, 5, 63], // violet
    [8]: [48, 5, 241], // grey
    [9]: [48, 5, 231] // white
  }
};
