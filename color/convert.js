
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
 * from convert-colors/src/util.js
 */

export function rgb2hue(rgbR, rgbG, rgbB, fallbackhue = 0) {
  const value = rgb2value(rgbR, rgbG, rgbB);
  const whiteness = rgb2whiteness(rgbR, rgbG, rgbB);
  const delta = value - whiteness;

  if(delta) {
    const segment =
      value === rgbR
        ? (rgbG - rgbB) / delta
        : value === rgbG
        ? (rgbB - rgbR) / delta
        : (rgbR - rgbG) / delta;
    const shift =
      value === rgbR ? (segment < 0 ? 360 / 60 : 0 / 60) : value === rgbG ? 120 / 60 : 240 / 60;
    const hue = (segment + shift) * 60;
    return hue;
  } else {
    return fallbackhue;
  }
}

export function hue2rgb(t1, t2, hue) {
  const rhue = hue < 0 ? hue + 360 : hue > 360 ? hue - 360 : hue;
  const rgb =
    rhue * 6 < 360
      ? t1 + ((t2 - t1) * rhue) / 60
      : rhue * 2 < 360
      ? t2
      : rhue * 3 < 720
      ? t1 + ((t2 - t1) * (240 - rhue)) / 60
      : t1;
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
  return mats.map(mat =>
    mat.reduce((acc, value, index) =>
        acc + (params[index] * precision * (value * precision)) / precision / precision,
      0
    )
  );
}

/*
 * from convert-colors/src/rgb-hsl.js
 */

export function rgb2hsl(rgbR, rgbG, rgbB, fallbackhue) {
  const hslH = rgb2hue(rgbR, rgbG, rgbB, fallbackhue);
  const hslV = rgb2value(rgbR, rgbG, rgbB);
  const hslW = rgb2whiteness(rgbR, rgbG, rgbB);
  const hslD = hslV - hslW;
  const hslL = (hslV + hslW) / 2;
  const hslS = hslD === 0 ? 0 : (hslD / (100 - abs(2 * hslL - 100))) * 100;
  return [hslH, hslS, hslL];
}

export function hsl2rgb(hslH, hslS, hslL) {
  const t2 = hslL <= 50 ? (hslL * (hslS + 100)) / 100 : hslL + hslS - (hslL * hslS) / 100;
  const t1 = hslL * 2 - t2;
  const [rgbR, rgbG, rgbB] = [
    hue2rgb(t1, t2, hslH + 120),
    hue2rgb(t1, t2, hslH),
    hue2rgb(t1, t2, hslH - 120)
  ];
  return [rgbR, rgbG, rgbB];
}

 

/*
 * from convert-colors/src/rgb-hwb.js
 */

export function rgb2hwb(rgbR, rgbG, rgbB, fallbackhue) {
  const hwbH = rgb2hue(rgbR, rgbG, rgbB, fallbackhue);
  const hwbW = rgb2whiteness(rgbR, rgbG, rgbB);
  const hwbV = rgb2value(rgbR, rgbG, rgbB);
  const hwbB = 100 - hwbV;
  return [hwbH, hwbW, hwbB];
}

export function hwb2rgb(hwbH, hwbW, hwbB, fallbackhue) {
  const [rgbR, rgbG, rgbB] = hsl2rgb(hwbH, 100, 50, fallbackhue).map(v => (v * (100 - hwbW - hwbB)) / 100 + hwbW
  );
  return [rgbR, rgbG, rgbB];
}

/*
 * from convert-colors/src/rgb-hsv.js
 */

export function rgb2hsv(rgbR, rgbG, rgbB, fallbackhue) {
  const hsvV = rgb2value(rgbR, rgbG, rgbB);
  const hsvW = rgb2whiteness(rgbR, rgbG, rgbB);
  const hsvH = rgb2hue(rgbR, rgbG, rgbB, fallbackhue);
  const hsvS = hsvV === hsvW ? 0 : ((hsvV - hsvW) / hsvV) * 100;
  return [hsvH, hsvS, hsvV];
}

export function hsv2rgb(hsvH, hsvS, hsvV) {
  const rgbI = floor(hsvH / 60);
  const rgbF = (hsvH / 60 - rgbI) & 1 ? hsvH / 60 - rgbI : 1 - hsvH / 60 - rgbI;
  const rgbM = (hsvV * (100 - hsvS)) / 100;
  const rgbN = (hsvV * (100 - hsvS * rgbF)) / 100;
  const rgbT = (hsvV * (100 - ((100 - rgbF) * hsvS) / 100)) / 100;
  const [rgbR, rgbG, rgbB] =
    rgbI === 5
      ? [hsvV, rgbM, rgbN]
      : rgbI === 4
      ? [rgbT, rgbM, hsvV]
      : rgbI === 3
      ? [rgbM, rgbN, hsvV]
      : rgbI === 2
      ? [rgbM, hsvV, rgbT]
      : rgbI === 1
      ? [rgbN, hsvV, rgbM]
      : [hsvV, rgbT, rgbM];
  return [rgbR, rgbG, rgbB];
}

/*
 * from convert-colors/src/rgb-xyz.js
 */

export function rgb2xyz(rgbR, rgbG, rgbB) {
  const [lrgbR, lrgbB, lrgbG] = [rgbR, rgbG, rgbB].map(v =>
    v > 4.045 ? Math.pow((v + 5.5) / 105.5, 2.4) * 100 : v / 12.92
  );
  const [xyzX, xyzY, xyzZ] = matrix([lrgbR, lrgbB, lrgbG],
    [
      [0.4124564, 0.3575761, 0.1804375],
      [0.2126729, 0.7151522, 0.072175],
      [0.0193339, 0.119192, 0.9503041]
    ]
  );
  return [xyzX, xyzY, xyzZ];
}

export function xyz2rgb(xyzX, xyzY, xyzZ) {
  const [lrgbR, lrgbB, lrgbG] = matrix([xyzX, xyzY, xyzZ],
    [
      [3.2404542, -1.5371385, -0.4985314],
      [-0.969266, 1.8760108, 0.041556],
      [0.0556434, -0.2040259, 1.0572252]
    ]
  );
  const [rgbR, rgbG, rgbB] = [lrgbR, lrgbB, lrgbG].map(v =>
    v > 0.31308 ? 1.055 * pow(v / 100, 1 / 2.4) * 100 - 5.5 : 12.92 * v
  );
  return [rgbR, rgbG, rgbB];
}

/*
 * from convert-colors/src/hsl-hsv.js
 */

export function hsl2hsv(hslH, hslS, hslL) {
  const hsv1 = (hslS * (hslL < 50 ? hslL : 100 - hslL)) / 100;
  const hsvS = hsv1 === 0 ? 0 : ((2 * hsv1) / (hslL + hsv1)) * 100;
  const hsvV = hslL + hsv1;
  return [hslH, hsvS, hsvV];
}

export function hsv2hsl(hsvH, hsvS, hsvV) {
  const hslL = ((200 - hsvS) * hsvV) / 100;
  const [hslS, hslV] = [
    hslL === 0 || hslL === 200
      ? 0
      : ((hsvS * hsvV) / 100 / (hslL <= 100 ? hslL : 200 - hslL)) * 100,
    (hslL * 5) / 10
  ];
  return [hsvH, hslS, hslV];
}

/*
 * from convert-colors/src/hwb-hsv.js
 */

export function hwb2hsv(hwbH, hwbW, hwbB) {
  const [hsvH, hsvS, hsvV] = [
    hwbH,
    hwbB === 100 ? 0 : 100 - (hwbW / (100 - hwbB)) * 100,
    100 - hwbB
  ];
  return [hsvH, hsvS, hsvV];
}

export function hsv2hwb(hsvH, hsvS, hsvV) {
  const [hwbH, hwbW, hwbB] = [hsvH, ((100 - hsvS) * hsvV) / 100, 100 - hsvV];
  return [hwbH, hwbW, hwbB];
}
 
/*
 * from convert-colors/src/lab-xyz.js
 */

export function lab2xyz(labL, labA, labB) {
  const f2 = (labL + 16) / 116;
  const f1 = labA / 500 + f2;
  const f3 = f2 - labB / 200;
  const [initX, initY, initZ] = [
    pow(f1, 3) > epsilon ? pow(f1, 3) : (116 * f1 - 16) / kappa,
    labL > kappa * epsilon ? pow((labL + 16) / 116, 3) : labL / kappa,
    pow(f3, 3) > epsilon ? pow(f3, 3) : (116 * f3 - 16) / kappa
  ];
  const [xyzX, xyzY, xyzZ] = matrix([initX * wd50X, initY * wd50Y, initZ * wd50Z],
    [
      [0.9555766, -0.0230393, 0.0631636],
      [-0.0282895, 1.0099416, 0.0210077],
      [0.0122982, -0.020483, 1.3299098]
    ]
  );
  return [xyzX, xyzY, xyzZ];
}

export function xyz2lab(xyzX, xyzY, xyzZ) {
  const [d50X, d50Y, d50Z] = matrix([xyzX, xyzY, xyzZ],
    [
      [1.0478112, 0.0228866, -0.050127],
      [0.0295424, 0.9904844, -0.0170491],
      [-0.0092345, 0.0150436, 0.7521316]
    ]
  );
  const [f1, f2, f3] = [d50X / wd50X, d50Y / wd50Y, d50Z / wd50Z].map(value =>
    value > epsilon ? cbrt(value) : (kappa * value + 16) / 116
  );
  const [labL, labA, labB] = [116 * f2 - 16, 500 * (f1 - f2), 200 * (f2 - f3)];
  return [labL, labA, labB];
}


/*
 * from convert-colors/src/lab-lch.js
 */

export function lab2lch(labL, labA, labB) {
  const [lchC, lchH] = [sqrt(pow(labA, 2) + pow(labB, 2)), rad2deg(atan2(labB, labA))];
  return [labL, lchC, lchH];
}

export function lch2lab(lchL, lchC, lchH) {
  const [labA, labB] = [lchC * cosd(lchH), lchC * sind(lchH)];
  return [lchL, labA, labB];
}

 
/*
 * from convert-colors/src/rgb-contrast.js
 */

export function rgb2contrast(rgb1, rgb2) {
  const luminance1 = rgb2luminance(...rgb1);
  const luminance2 = rgb2luminance(...rgb2);
  return luminance2contrast(luminance1, luminance2);
}

export function rgb2luminance(rgbR, rgbG, rgbB) {
  return ((adjustChannel(rgbR) * coefficientR +
      adjustChannel(rgbG) * coefficientG +
      adjustChannel(rgbB) * coefficientB) /
    precision
  );
}
const adjustChannel = x => (x <= 3.928 ? x / lowc : adjustGamma(x));
const adjustGamma = x => pow((x + 5.5) / 105.5, 2.4);
const lowc = 1292;
const coefficientR = 0.2126 * precision;
const coefficientG = 0.7152 * precision;
const coefficientB = 0.0722 * precision;

/*
 * from convert-colors/src/hex-rgb.js
 */

export function hex2rgb(hex) {
  const [r, g, b, a, rr, gg, bb, aa] = hex.match(hexColorMatch) || [];

  if(rr !== undefined || r !== undefined) {
    const red = rr !== undefined ? parseInt(rr, 16) : parseInt(r + r, 16);
    const green = gg !== undefined ? parseInt(gg, 16) : parseInt(g + g, 16);
    const blue = bb !== undefined ? parseInt(bb, 16) : parseInt(b + b, 16);
    const alpha = aa !== undefined ? parseInt(aa, 16) : a !== undefined ? parseInt(a + a, 16) : 255;
    return [red, green, blue, alpha].map(c => (c * 100) / 255);
  }

  return undefined;
}

export function rgb2hex(rgbR, rgbG, rgbB) {
  return `#${((1 << 24) +
    (Math.round((rgbR * 255) / 100) << 16) +
    (Math.round((rgbG * 255) / 100) << 8) +
    Math.round((rgbB * 255) / 100)
  )
    .toString(16)
    .slice(1)}`;
}
const hexColorMatch = /^#?(?:([a-f0-9])([a-f0-9])([a-f0-9])([a-f0-9])?|([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?)$/i;

/*
 * from convert-colors/src/keyword-rgb.js
 */

export function keyword2rgb(keyword) {
  const rgb255 = keywords[String(keyword).toLowerCase()];
  return rgb255 ? rgb255.map(x => (x * 100) / 255) : null;
}
const keywords = {
  aliceblue: [240, 248, 255],
  antiquewhite: [250, 235, 215],
  aqua: [0, 255, 255],
  aquamarine: [127, 255, 212],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  bisque: [255, 228, 196],
  black: [0, 0, 0],
  blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255],
  blueviolet: [138, 43, 226],
  brown: [165, 42, 42],
  burlywood: [222, 184, 135],
  cadetblue: [95, 158, 160],
  chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30],
  coral: [255, 127, 80],
  cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220],
  crimson: [220, 20, 60],
  cyan: [0, 255, 255],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169],
  darkgreen: [0, 100, 0],
  darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107],
  darkmagenta: [139, 0, 139],
  darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0],
  darkorchid: [153, 50, 204],
  darkred: [139, 0, 0],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  floralwhite: [255, 250, 240],
  forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255],
  gainsboro: [220, 220, 220],
  ghostwhite: [248, 248, 255],
  gold: [255, 215, 0],
  goldenrod: [218, 165, 32],
  gray: [128, 128, 128],
  green: [0, 128, 0],
  greenyellow: [173, 255, 47],
  grey: [128, 128, 128],
  honeydew: [240, 255, 240],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  lavenderblush: [255, 240, 245],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224],
  lime: [0, 255, 0],
  limegreen: [50, 205, 50],
  linen: [250, 240, 230],
  magenta: [255, 0, 255],
  maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  navy: [0, 0, 128],
  oldlace: [253, 245, 230],
  olive: [128, 128, 0],
  olivedrab: [107, 142, 35],
  orange: [255, 165, 0],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  pink: [255, 192, 203],
  plum: [221, 160, 221],
  powderblue: [176, 224, 230],
  purple: [128, 0, 128],
  rebeccapurple: [102, 51, 153],
  red: [255, 0, 0],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  salmon: [250, 128, 114],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  seashell: [255, 245, 238],
  sienna: [160, 82, 45],
  silver: [192, 192, 192],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  snow: [255, 250, 250],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  tan: [210, 180, 140],
  teal: [0, 128, 128],
  thistle: [216, 191, 216],
  tomato: [255, 99, 71],
  transparent: [0, 0, 0],
  turquoise: [64, 224, 208],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  white: [255, 255, 255],
  whitesmoke: [245, 245, 245],
  yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50]
};

/*
 * from convert-colors/src/lab-ciede.js
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
    deltaSmallHPrime =
      abs(h1Prime - h2Prime) <= 180
        ? h2Prime - h1Prime
        : h2Prime <= h1Prime
        ? h2Prime - h1Prime + 360
        : h2Prime - h1Prime - 360;
    deltaBigHPrime = 2 * sqrt(c1Prime * c2Prime) * sind(deltaSmallHPrime / 2);
    hBarPrime =
      abs(h1Prime - h2Prime) <= 180
        ? (h1Prime + h2Prime) / 2
        : h1Prime + h2Prime < 360
        ? (h1Prime + h2Prime + 360) / 2
        : (h1Prime + h2Prime - 360) / 2;
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

/*
 * from convert-colors/src/index.js
 */

function rgb2lab(rgbR, rgbG, rgbB) {
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  const [labL, labA, labB] = xyz2lab(xyzX, xyzY, xyzZ);
  return [labL, labA, labB];
}

function lab2rgb(labL, labA, labB) {
  const [xyzX, xyzY, xyzZ] = lab2xyz(labL, labA, labB);
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  return [rgbR, rgbG, rgbB];
}

function rgb2lch(rgbR, rgbG, rgbB) {
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  const [labL, labA, labB] = xyz2lab(xyzX, xyzY, xyzZ);
  const [lchL, lchC, lchH] = lab2lch(labL, labA, labB);
  return [lchL, lchC, lchH];
}

function lch2rgb(lchL, lchC, lchH) {
  const [labL, labA, labB] = lch2lab(lchL, lchC, lchH);
  const [xyzX, xyzY, xyzZ] = lab2xyz(labL, labA, labB);
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  return [rgbR, rgbG, rgbB];
}

function hwb2hsl(hwbH, hwbW, hwbB) {
  const [hsvH, hsvS, hsvV] = hwb2hsv(hwbH, hwbW, hwbB);
  const [hslH, hslS, hslL] = hsv2hsl(hsvH, hsvS, hsvV);
  return [hslH, hslS, hslL];
}

function hsl2hwb(hslH, hslS, hslL) {
  const [hsvS, hsvV] = hsl2hsv(hslH, hslS, hslL);
  const [hwbW, hwbB] = hsv2hwb(hslH, hsvS, hsvV);
  return [hslH, hwbW, hwbB];
}

function hsl2lab(hslH, hslS, hslL) {
  const [rgbR, rgbG, rgbB] = hsl2rgb(hslH, hslS, hslL);
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  const [labL, labA, labB] = xyz2lab(xyzX, xyzY, xyzZ);
  return [labL, labA, labB];
}

function lab2hsl(labL, labA, labB, fallbackhue) {
  const [xyzX, xyzY, xyzZ] = lab2xyz(labL, labA, labB);
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  const [hslH, hslS, hslL] = rgb2hsl(rgbR, rgbG, rgbB, fallbackhue);
  return [hslH, hslS, hslL];
}

function hsl2lch(hslH, hslS, hslL) {
  const [rgbR, rgbG, rgbB] = hsl2rgb(hslH, hslS, hslL);
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  const [labL, labA, labB] = xyz2lab(xyzX, xyzY, xyzZ);
  const [lchL, lchC, lchH] = lab2lch(labL, labA, labB);
  return [lchL, lchC, lchH];
}

function lch2hsl(lchL, lchC, lchH, fallbackhue) {
  const [labL, labA, labB] = lch2lab(lchL, lchC, lchH);
  const [xyzX, xyzY, xyzZ] = lab2xyz(labL, labA, labB);
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  const [hslH, hslS, hslL] = rgb2hsl(rgbR, rgbG, rgbB, fallbackhue);
  return [hslH, hslS, hslL];
}

function hsl2xyz(hslH, hslS, hslL) {
  const [rgbR, rgbG, rgbB] = hsl2rgb(hslH, hslS, hslL);
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  return [xyzX, xyzY, xyzZ];
}

function xyz2hsl(xyzX, xyzY, xyzZ, fallbackhue) {
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  const [hslH, hslS, hslL] = rgb2hsl(rgbR, rgbG, rgbB, fallbackhue);
  return [hslH, hslS, hslL];
}

function hwb2lab(hwbH, hwbW, hwbB) {
  const [rgbR, rgbG, rgbB] = hwb2rgb(hwbH, hwbW, hwbB);
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  const [labL, labA, labB] = xyz2lab(xyzX, xyzY, xyzZ);
  return [labL, labA, labB];
}

function lab2hwb(labL, labA, labB, fallbackhue) {
  const [xyzX, xyzY, xyzZ] = lab2xyz(labL, labA, labB);
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  const [hwbH, hwbW, hwbB] = rgb2hwb(rgbR, rgbG, rgbB, fallbackhue);
  return [hwbH, hwbW, hwbB];
}

function hwb2lch(hwbH, hwbW, hwbB) {
  const [rgbR, rgbG, rgbB] = hwb2rgb(hwbH, hwbW, hwbB);
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  const [labL, labA, labB] = xyz2lab(xyzX, xyzY, xyzZ);
  const [lchL, lchC, lchH] = lab2lch(labL, labA, labB);
  return [lchL, lchC, lchH];
}

function lch2hwb(lchL, lchC, lchH, fallbackhue) {
  const [labL, labA, labB] = lch2lab(lchL, lchC, lchH);
  const [xyzX, xyzY, xyzZ] = lab2xyz(labL, labA, labB);
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  const [hwbH, hwbW, hwbB] = rgb2hwb(rgbR, rgbG, rgbB, fallbackhue);
  return [hwbH, hwbW, hwbB];
}

function hwb2xyz(hwbH, hwbW, hwbB) {
  const [rgbR, rgbG, rgbB] = hwb2rgb(hwbH, hwbW, hwbB);
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  return [xyzX, xyzY, xyzZ];
}

function xyz2hwb(xyzX, xyzY, xyzZ, fallbackhue) {
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  const [hwbH, hwbW, hwbB] = rgb2hwb(rgbR, rgbG, rgbB, fallbackhue);
  return [hwbH, hwbW, hwbB];
}

function hsv2lab(hsvH, hsvS, hsvV) {
  const [rgbR, rgbG, rgbB] = hsv2rgb(hsvH, hsvS, hsvV);
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  const [labL, labA, labB] = xyz2lab(xyzX, xyzY, xyzZ);
  return [labL, labA, labB];
}

function lab2hsv(labL, labA, labB, fallbackhue) {
  const [xyzX, xyzY, xyzZ] = lab2xyz(labL, labA, labB);
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  const [hsvH, hsvS, hsvV] = rgb2hsv(rgbR, rgbG, rgbB, fallbackhue);
  return [hsvH, hsvS, hsvV];
}

function hsv2lch(hsvH, hsvS, hsvV) {
  const [rgbR, rgbG, rgbB] = hsv2rgb(hsvH, hsvS, hsvV);
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  const [labL, labA, labB] = xyz2lab(xyzX, xyzY, xyzZ);
  const [lchL, lchC, lchH] = lab2lch(labL, labA, labB);
  return [lchL, lchC, lchH];
}

function lch2hsv(lchL, lchC, lchH, fallbackhue) {
  const [labL, labA, labB] = lch2lab(lchL, lchC, lchH);
  const [xyzX, xyzY, xyzZ] = lab2xyz(labL, labA, labB);
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  const [hsvH, hsvS, hsvV] = rgb2hsv(rgbR, rgbG, rgbB, fallbackhue);
  return [hsvH, hsvS, hsvV];
}

function hsv2xyz(hsvH, hsvS, hsvV) {
  const [rgbR, rgbG, rgbB] = hsv2rgb(hsvH, hsvS, hsvV);
  const [xyzX, xyzY, xyzZ] = rgb2xyz(rgbR, rgbG, rgbB);
  return [xyzX, xyzY, xyzZ];
}

function xyz2hsv(xyzX, xyzY, xyzZ, fallbackhue) {
  const [rgbR, rgbG, rgbB] = xyz2rgb(xyzX, xyzY, xyzZ);
  const [hsvH, hsvS, hsvV] = rgb2hsv(rgbR, rgbG, rgbB, fallbackhue);
  return [hsvH, hsvS, hsvV];
}

function xyz2lch(xyzX, xyzY, xyzZ) {
  const [labL, labA, labB] = xyz2lab(xyzX, xyzY, xyzZ);
  const [lchL, lchC, lchH] = lab2lch(labL, labA, labB);
  return [lchL, lchC, lchH];
}

function lch2xyz(lchL, lchC, lchH) {
  const [labL, labA, labB] = lch2lab(lchL, lchC, lchH);
  const [xyzX, xyzY, xyzZ] = lab2xyz(labL, labA, labB);
  return [xyzX, xyzY, xyzZ];
}

function hex2hsl(hex) {
  return rgb2hsl(...hex2rgb(hex));
}

function hex2hsv(hex) {
  return rgb2hsv(...hex2rgb(hex));
}

function hex2hwb(hex) {
  return rgb2hwb(...hex2rgb(hex));
}

function hex2lab(hex) {
  return rgb2lab(...hex2rgb(hex));
}

function hex2lch(hex) {
  return rgb2lch(...hex2rgb(hex));
}

function hex2xyz(hex) {
  return rgb2xyz(...hex2rgb(hex));
}

function hsl2hex(hslH, hslS, hslL) {
  return rgb2hex(...hsl2rgb(hslH, hslS, hslL));
}

function hsv2hex(hsvH, hsvS, hsvV) {
  return rgb2hex(...hsl2rgb(hsvH, hsvS, hsvV));
}

function hwb2hex(hwbH, hwbW, hwbB) {
  return rgb2hex(...hwb2rgb(hwbH, hwbW, hwbB));
}

function lab2hex(labL, labA, labB) {
  return rgb2hex(...lab2rgb(labL, labA, labB));
}

function lch2hex(lchL, lchC, lchH) {
  return rgb2hex(...lch2rgb(lchL, lchC, lchH));
}

function xyz2hex(xyzX, xyzY, xyzZ) {
  return rgb2hex(...xyz2rgb(xyzX, xyzY, xyzZ));
}

function hex2ciede(hex1, hex2) {
  return lab2ciede(hex2lab(hex1), hex2lab(hex2));
}

function hsl2ciede(hsl1, hsl2) {
  return lab2ciede(hsl2lab(...hsl1), hsl2lab(...hsl2));
}

function hsv2ciede(hsv1, hsv2) {
  return lab2ciede(hsv2lab(...hsv1), hsv2lab(...hsv2));
}

function hwb2ciede(hwb1, hwb2) {
  return lab2ciede(hwb2lab(...hwb1), hwb2lab(...hwb2));
}

function keyword2ciede(keyword1, keyword2) {
  return lab2ciede(keyword2lab(keyword1), keyword2lab(keyword2));
}

function lch2ciede(lch1, lch2) {
  return lab2ciede(lch2lab(...lch1), lch2lab(...lch2));
}

function rgb2ciede(rgb1, rgb2) {
  return lab2ciede(rgb2lab(...rgb1), rgb2lab(...rgb2));
}

function xyz2ciede(xyz1, xyz2) {
  return lab2ciede(xyz2lab(...xyz1), xyz2lab(...xyz2));
}

function hex2contrast(hex1, hex2) {
  return rgb2contrast(hex2rgb(hex1), hex2rgb(hex2));
}

function hsl2contrast(hsl1, hsl2) {
  return rgb2contrast(hsl2rgb(...hsl1), hsl2rgb(...hsl2));
}

function hsv2contrast(hsv1, hsv2) {
  return rgb2contrast(hsv2rgb(...hsv1), hsv2rgb(...hsv2));
}

function hwb2contrast(hwb1, hwb2) {
  return rgb2contrast(hwb2rgb(...hwb1), hwb2rgb(...hwb2));
}

function keyword2contrast(keyword1, keyword2) {
  return rgb2contrast(keyword2rgb(keyword1), keyword2rgb(keyword2));
}

function lab2contrast(lab1, lab2) {
  return rgb2contrast(lab2rgb(...lab1), lab2rgb(...lab2));
}

function lch2contrast(lch1, lch2) {
  return rgb2contrast(lch2rgb(...lch1), lch2rgb(...lch2));
}

function xyz2contrast(xyz1, xyz2) {
  return rgb2contrast(xyz2rgb(...xyz1), xyz2rgb(...xyz2));
}

function keyword2hex(keyword) {
  return rgb2hex(...keyword2rgb(keyword));
}

function keyword2hsl(keyword) {
  return rgb2hsl(...keyword2rgb(keyword));
}

function keyword2hsv(keyword) {
  return rgb2hsv(...keyword2rgb(keyword));
}

function keyword2hwb(keyword) {
  return rgb2hwb(...keyword2rgb(keyword));
}

function keyword2lab(keyword) {
  return rgb2lab(...keyword2rgb(keyword));
}

function keyword2lch(keyword) {
  return rgb2lch(...keyword2rgb(keyword));
}

function keyword2xyz(keyword) {
  return rgb2xyz(...keyword2rgb(keyword));
}
export {
  hex2ciede,
  hex2contrast,
  hex2hsl,
  hex2hsv,
  hex2hwb,
  hex2lab,
  hex2lch,
  hex2xyz,
  hsl2ciede,
  hsl2contrast,
  hsl2hex,
  hsl2hwb,
  hsl2lab,
  hsl2lch,
  hsl2xyz,
  hsv2ciede,
  hsv2contrast,
  hsv2hex,
  hsv2lab,
  hsv2lch,
  hsv2xyz,
  hwb2ciede,
  hwb2contrast,
  hwb2hex,
  hwb2hsl,
  hwb2lab,
  hwb2lch,
    hwb2xyz,
  keyword2ciede,
  keyword2contrast,
  keyword2hex,
  keyword2hsl,
  keyword2hsv,
  keyword2hwb,
  keyword2lab,
  keyword2lch,
  keyword2xyz,
  lab2contrast,
  lab2hex,
  lab2hsl,
  lab2hsv,
  lab2hwb,
  lab2rgb,
  lch2ciede,
  lch2contrast,
  lch2hex,
  lch2hsl,
  lch2hsv,
  lch2hwb,
  lch2rgb,
  lch2xyz,
  rgb2ciede,
  rgb2lab,
  rgb2lch,
  xyz2ciede,
  xyz2contrast,
  xyz2hex,
  xyz2hsl,
  xyz2hsv,
  xyz2hwb,
  xyz2lch 
};
