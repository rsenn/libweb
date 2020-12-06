import { RGBA, HSLA } from '../color.js';

export function GetExponent(value) {
  const suffix = value.replace(/[^KkMmnpuμ]/g, '');
  let exp = 0;
  if(suffix.length > 1) throw new Error(`Suffix '${suffix}' length > 1`);
  switch (suffix) {
    case 'M':
      exp = 6;
      break;
    case 'K':
    case 'k':
      exp = 3;
      break;
    case 'm':
      exp = -3;
      break;
    case 'μ':
    case 'u':
      exp = -6;
      break;
    case 'n':
      exp = -9;
      break;
    case 'p':
      exp = -12;
      break;
  }
  return exp;
}

export function GetMantissa(value) {
  let mantissa = value.replace(/[KkMmnpuμ]$/, '');
  if(isNaN(+mantissa)) throw new Error(`GetMantissa '${mantissa}' not a valid number`);
  return +mantissa;
}

export function ValueToNumber(value) {
  let exp = GetExponent(value);
  let man = GetMantissa(value);

  return man * 10 ** exp;
}

export function NumberToValue(value,
  suffixes = [
    [1e3, 'k'],
    ['1e6', 'M'],
    ['1e9', 'G']
  ]
) {
  let suffix = [1, ''];
  for(let [min, sfx] of suffixes) {
    if(value >= min && min > suffix[0]) suffix = [min, sfx];
  }

  return value / suffix[0] + suffix[1];
}

export function GetMultipliers() {
  return [10, 100, 1e3, 1e4, 1e5, 1e6, 1e7];
}

export function GetFactor(num) {
  let i = -1;
  for(let max of GetMultipliers()) {
    if(num >= max) i++;
    else break;
  }
  return i;
}

export function GetColorBands(value, precision = 2) {
  let f = GetFactor(value);
  let fx = f + (2 - precision);
  let multiplier = GetMultipliers()[f];
  let x = value / multiplier;
  let r = [];

  for(let i = 0; i < precision; i++) {
    let digit = Math.floor(x);
    x = x % 1;
    x *= 10;
    x = Math.round(x * 10) / 10;
    r.push(digit);
  }
  return r.concat([fx]);
}

export const digit2color = {
  rgb: [
    //[ "#000000", "#8b572a", "#d0021b", "#f5a623", "#f8e71c", "#7ed321", "#4a90e2", "#9013fe", "#999999", "#ffffff" ] //  ["#000000", "#905030", "#d00020", "#f0a020", "#ffe020", "#80d020", "#5090e0", "#9010ff", "#a0a0a0", "#ffffff"]
    '#000000',
    '#8b572a',
    '#d0021b',
    '#f5a623',
    '#f8e71c',
    '#7ed321',
    '#4a90e2',
    '#9013fe',
    '#999999',
    '#ffffff'
  ].map(c => RGBA.fromHex(c)),
  ansi: [
    [48, 5, 16], // black
    [48, 5, 94], // brown
    [48, 5, 160], // red
    [48, 5, 208], // orange
    [48, 5, 226], // yellow
    [48, 5, 40], // green
    [48, 5, 27], // blue
    [48, 5, 63], // violet
    [48, 5, 241], // grey
    [48, 5, 231], // white
    [48, 5, 172], // gold
    //  [48,5,251],
    [48, 5, 249] // silver
  ]
};
