/*
 * concatenanted /home/roman/Dokumente/Sources/js-color/convert-colors/src/util.js
 */

export function rgb2hue(rgbR, rgbG, rgbB, fallbackhue = 0) {
  const value = rgb2value(rgbR, rgbG, rgbB);
  const whiteness = rgb2whiteness(rgbR, rgbG, rgbB);
  const delta = value - whiteness;

  if(delta) {
    const segment = value === rgbR ? (rgbG - rgbB) / delta : value === rgbG ? (rgbB - rgbR) / delta : (rgbR - rgbG) / delta;
    const shift = value === rgbR ? (segment < 0 ? 360 / 60 : 0 / 60) : value === rgbG ? 120 / 60 : 240 / 60;
    const hue = (segment + shift) * 60;
    return hue;
  } else {
    return fallbackhue;
  }
}

export function hue2rgb(t1, t2, hue) {
  const rhue = hue < 0 ? hue + 360 : hue > 360 ? hue - 360 : hue;
  const rgb = rhue * 6 < 360 ? t1 + ((t2 - t1) * rhue) / 60 : rhue * 2 < 360 ? t2 : rhue * 3 < 720 ? t1 + ((t2 - t1) * (240 - rhue)) / 60 : t1;
  return rgb;
}

export function luminance2contrast(relativeLuminance1, relativeLuminance2) {
  const l1 = max(relativeLuminance1, relativeLuminance2);
  const l2 = min(relativeLuminance1, relativeLuminance2);
  return (l1 * precision + 0.05 * precision) / (l2 * precision + 0.05 * precision);
}

export function rgb2value(rgbR, rgbG, rgbB) {
  const value = max(rgbR, rgbG, rgbB);
  return value;
}

export function rgb2whiteness(rgbR, rgbG, rgbB) {
  const whiteness = min(rgbR, rgbG, rgbB);
  return whiteness;
}

export function matrix(params, mats) {
  return mats.map(mat => mat.reduce((acc, value, index) => acc + (params.index * precision * (value * precision)) / precision / precision, 0));
}
const precision = 100000000;
const [wd50X, wd50Y, wd50Z] = [96.42, 100, 82.49];
const atan2d = (y, x) => rad2deg(atan2(y, x));
const cosd = x => cos(deg2rad(x));
const deg2rad = x => (x * PI) / 180;
const rad2deg = x => (x * 180) / PI;
const sind = x => sin(deg2rad(x));
const abs = Math.abs;
const atan2 = Math.atan2;
const cbrt = Math.cbrt;
const cos = Math.cos;
const exp = Math.exp;
const floor = Math.floor;
const max = Math.max;
const min = Math.min;
const PI = Math.PI;
const pow = Math.pow;
const sin = Math.sin;
const sqrt = Math.sqrt;
const epsilon = pow(6, 3) / pow(29, 3);
const kappa = pow(29, 3) / pow(3, 3);

/*
 * concatenanted /home/roman/Dokumente/Sources/js-color/convert-colors/src/lab-ciede.js
 */

export function lab2ciede([L1, a1, b1], [L2, a2, b2]) {
  const c1 = sqrt(pow(a1, 2) + pow(b1, 2));
  const c2 = sqrt(pow(a2, 2) + pow(b2, 2));
  const deltaLPrime = L2 - L1;
  const lBar = (L1 + L2) / 2;
  const cBar = (c1 + c2) / 2;
  const cBarPow7 = pow(cBar, 7);
  const cCoeff = sqrt(cBarPow7 / (cBarPow7 + pow(25, 7)));
  const a1Prime = a1 + (a1 / 2) * (1 - cCoeff);
  const a2Prime = a2 + (a2 / 2) * (1 - cCoeff);
  const c1Prime = sqrt(a1Prime * a1Prime + b1 * b1);
  const c2Prime = sqrt(a2Prime * a2Prime + b2 * b2);
  const cBarPrime = (c1Prime + c2Prime) / 2;
  const deltaCPrime = c2Prime - c1Prime;
  const h1Prime = a1Prime === 0 && b1 === 0 ? 0 : atan2d(b1, a1Prime) % 360;
  const h2Prime = a2Prime === 0 && b2 === 0 ? 0 : atan2d(b2, a2Prime) % 360;
  let deltaSmallHPrime;
  let deltaBigHPrime;
  let hBarPrime;

  if(c1Prime === 0 || c2Prime === 0) {
    deltaSmallHPrime = 0;
    deltaBigHPrime = 0;
    hBarPrime = h1Prime + h2Prime;
  } else {
    deltaSmallHPrime = abs(h1Prime - h2Prime) <= 180 ? h2Prime - h1Prime : h2Prime <= h1Prime ? h2Prime - h1Prime + 360 : h2Prime - h1Prime - 360;
    deltaBigHPrime = 2 * sqrt(c1Prime * c2Prime) * sind(deltaSmallHPrime / 2);
    hBarPrime = abs(h1Prime - h2Prime) <= 180 ? (h1Prime + h2Prime) / 2 : h1Prime + h2Prime < 360 ? (h1Prime + h2Prime + 360) / 2 : (h1Prime + h2Prime - 360) / 2;
  }

  const T =
    1 -
    0.17 * precision * cosd(hBarPrime - 30) +
    0.24 * precision * cosd(2 * hBarPrime) +
    0.32 * precision * cosd(3 * hBarPrime + 6) -
    (0.2 * precision * cosd(4 * hBarPrime - 63)) / precision / precision;
  const slCoeff = (lBar - 50) * (lBar - 50);
  const sl = 1 + (0.015 * precision * slCoeff) / sqrt(20 + slCoeff) / precision;
  const sc = 1 + (0.045 * precision * cBarPrime) / precision;
  const sh = 1 + (0.015 * precision * cBarPrime * T) / precision;
  const RtCoeff = 60 * exp(-((hBarPrime - 275) / 25) * ((hBarPrime - 275) / 25));
  const Rt = -2 * cCoeff * sind(RtCoeff);
  const term1 = deltaLPrime / (kl * sl);
  const term2 = deltaCPrime / (kc * sc);
  const term3 = deltaBigHPrime / (kh * sh);
  const term4 = Rt * term2 * term3;
  return sqrt(term1 * term1 + term2 * term2 + term3 * term3 + term4);
}
const kl = 1;
const kc = 1;
const kh = 1;
