export function GetExponent(value) {
  const suffix = value.replace(/\/.*/g, '').replace(/[^KkMmnpuμ\u03bc]/g, '');
  let exp = 0;
  // if(suffix.length > 1) throw new Error(`Suffix '${suffix}' of '${value}' length > 1`);
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
  let mantissa = value.replace(/([-+]?[0-9.]+).*/g, '$1');
  //console.log('GetMantissa', { value, mantissa });
  if(isNaN(+mantissa)) throw new Error(`GetMantissa '${mantissa}' not a valid number`);
  return +mantissa;
}

export function ValueToNumber(value) {
  //console.log('ValueToNumber(', value, ')');

  let exp = GetExponent(value);
  let man = GetMantissa(value);

  return man * 10 ** exp;
}

export function NumberToValue(
  value,
  suffixes = [
    [1e-3, 'm'],
    [1e-6, 'u'],
    [1e-9, 'n'],
    [1e-12, 'p'],
    [1e3, 'k'],
    [1e6, 'M'],
    [1e9, 'G']
  ]
) {
  let suffix = [1, ''];
  for(let [min, sfx] of suffixes) {
    if(value >= min && min > suffix[0]) suffix = [min, sfx];
  }

  return value / suffix[0] + suffix[1];
}
