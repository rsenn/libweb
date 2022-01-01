import { Point, Line, Rect } from '../geom.js';

const props = {
  x1: 1,
  y1: 2,
  x2: 3,
  y2: 4
};

export function Element(el) {
  const makeGetterSetter = key => v => v === undefined ? +el[key] : (el[key] = +v);

  Util.lazyProperties(el, {
    line: () => Line.bind(el, null, k => makeGetterSetter(props[k])),
    a: () => Point.bind(el, [1, 2]),
    b: () => Point.bind(el, [3, 4]),
    type: () => CircuitJS.types[el[0]] ?? toNumber(el[0])
  });

  Object.setPrototypeOf(el, Element.prototype);

  return new Proxy(el, {
    get(target, prop, receiver) {
      if(typeof prop == 'string') {
        if(prop == 'rect') {
          let [, x1, y1, x2, y2] = el;
          return new Rect({ x1, y1, x2, y2 });
        }
        if(/^[xy][12]$/.test(prop)) {
          return el[props[prop]];
        }
      }
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      if(prop == 'rect') {
        const r = new Rect(value);
        const { x1, y1, x2, y2 } = r;
        Object.assign(el.line, { x1, y1, x2, y2 });
      } else if(/^[xy][12]$/.test(prop)) {
        el[props[prop]] = +value;
      } else {
        Reflect.set(target, prop, value);
      }
    }
  });
}

Element.prototype = new Array();
Element.prototype[Symbol.toStringTag] = 'CircuitJSElement';
Element.prototype.constructor = Element;

export class CircuitJS {
  static parse(text) {
    let lines = text.split(/\n/g);
    const instance = lines
      .filter(line => !/^\s*$/.test(line))
      .map(line => line.split(/\s+/g).map((s, i) => (i == 0 || isNaN(+s) ? s : +s)));

    //console.log('lines', lines);
    return new Proxy(instance.map(Element), {
      get(target, prop, receiver) {
        if(Reflect.has(target, prop)) return target[prop];
        if(prop in CircuitJS.prototype) return CircuitJS.prototype[prop];

        if(prop == Symbol.toStringTag) return 'CircuitJS';

        if(typeof prop == 'string') prop = new RegExp(prop, 'ig');
        if(prop instanceof RegExp) {
          const re = prop;
          prop = ([name]) => re.test(name);
        }

        const elements = instance.filter(prop);
        return elements;
      },
      getPrototypeOf(target) {
        return CircuitJS.prototype;
      }
    });
  }
  static types = {
    0: 'cir-sim',
    150: 'and-gate',
    151: 'nand-gate',
    152: 'or-gate',
    153: 'nor-gate',
    154: 'xor-gate',
    155: 'd-flip-flop',
    156: 'jk-flip-flop',
    157: 'seven-seg',
    158: 'vco',
    159: 'analog-switch',
    160: 'analog-switch2',
    161: 'phase-comp',
    162: 'led',
    163: 'decade',
    164: 'counter',
    165: 'timer',
    166: 'dac',
    167: 'adc',
    168: 'latch',
    169: 'tapped-transformer',
    170: 'sweep',
    171: 'trans-line',
    172: 'var-rail',
    173: 'triode',
    174: 'pot',
    175: 'tunnel-diode',
    176: 'varactor',
    177: 'scr',
    178: 'relay',
    179: 'c-c2',
    180: 'tri-state',
    181: 'lamp',
    182: 'schmitt',
    183: 'triac',
    184: 'multiplexer',
    185: 'diac',
    186: 'photo-resistor',
    187: 'spark-gap',
    188: 'thermistor',
    189: 'sipo-shift',
    193: 't-flip-flop',
    194: 'monostable',
    195: 'half-adder',
    196: 'full-adder',
    197: 'seven-seg-decoder',
    200: 'am',
    201: 'fm',
    203: 'diac',
    206: 'triac',
    207: 'labeled-node',
    208: 'custom-logic',
    209: 'polar-capacitor',
    210: 'data-recorder',
    211: 'audio-output',
    212: 'vcvs',
    213: 'vccs',
    214: 'ccvs',
    215: 'cccs',
    216: 'ohm-meter',
    350: 'thermistor-ntc',
    368: 'test-point',
    370: 'ammeter',
    374: 'ldr',
    400: 'darlington',
    401: 'comparator',
    402: 'ota',
    403: 'scope',
    404: 'fuse',
    405: 'led-array',
    406: 'custom-transformer',
    407: 'optocoupler',
    408: 'stop-trigger',
    409: 'op-amp-real',
    410: 'custom-composite',
    411: 'audio-input',
    412: 'crystal',
    413: 'sram',
    414: 'time-delay-relay',
    415: 'dc-motor',
    416: 'mbb-switch',
    417: 'unijunction',
    418: 'ext-voltage',
    419: 'decimal-display',
    420: 'wattmeter',
    421: 'counter2',
    422: 'delay-buffer',
    423: 'line',
    A: 'antenna',
    I: 'inverter',
    L: 'logic-input',
    M: 'logic-output',
    O: 'output',
    R: 'rail',
    S: 'switch2',
    T: 'transformer',
    a: 'op-amp',
    b: 'box',
    c: 'capacitor',
    d: 'diode',
    f: 'mosfet',
    g: 'ground',
    i: 'current',
    j: 'jfet',
    l: 'inductor',
    m: 'memristor',
    n: 'noise',
    p: 'probe',
    r: 'resistor',
    s: 'switch',
    t: 'transistor',
    v: 'voltage',
    w: 'wire',
    x: 'text',
    z: 'zener',
    $: 'preamble',
    o: 'output'
  };
}

export default CircuitJS;
