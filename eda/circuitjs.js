import { Line, Point, Rect } from '../geom.js';

const props = {
  x1: 1,
  y1: 2,
  x2: 3,
  y2: 4,
};

export const DOTS = 1;

export const SMALL_GRID = 2;
export const VOLTS = 4;
export const POWER = 8;
export const SHOW_VALUES = 16;

export function Element(el) {
  if(el instanceof Element) return el;
  const makeGetterSetter = key => v => v === undefined ? +el[key] : (el[key] = +v);

  Util.lazyProperties(el, {
    line: () => Line.bind(el, null, k => makeGetterSetter(props[k])),
    a: () => Point.bind(el, [1, 2]),
    b: () => Point.bind(el, [3, 4]),
    type: () => CircuitJS.types[el[0]] ?? toNumber(el[0]),
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
    },
  });
}

Element.prototype = new Array();
Element.prototype[Symbol.toStringTag] = 'CircuitJSElement';
Element.prototype.constructor = Element;
Element.prototype.toString = function() {
  return this.join(' ');
};

export class CircuitJS {
  static load(file) {
    let data = fs.readFileSync(file, 'utf-8');
    return CircuitJS.parse(data);
  }

  constructor(options = [1, 0.000015625, 10.20027730826997, 50, 5]) {
    return CircuitJS.create([['$'].concat(options)]);
  }

  static create(instance = []) {
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
      },
    });
  }

  static parse(text) {
    let lines = text.split(/\n/g);
    const instance = lines.filter(line => !/^\s*$/.test(line)).map(line => line.split(/\s+/g).map((s, i) => (i == 0 || isNaN(+s) ? s : +s)));

    //console.log('lines', lines);
    return CircuitJS.create(instance);
  }

  write() {
    return this.reduce((acc, element) => acc + element.toString() + '\n', '');
  }

  save(filename) {
    let data = this.write();
    return fs.writeFileSync(filename, data);
  }
  add(...args) {
    if(args.length > 1 && typeof args[0] == 'string') args = [args];
    for(let el of args) this.push(Element(el));
    return this;
  }

  static types = {
    ['$']: 'Options',
    150: 'AndGate',
    151: 'NandGate',
    152: 'OrGate',
    153: 'NorGate',
    154: 'XorGate',
    155: 'DFlipFlop',
    156: 'JKFlipFlop',
    157: 'SevenSeg',
    158: 'VCO',
    159: 'AnalogSwitch',
    160: 'AnalogSwitch2',
    161: 'PhaseComp',
    162: 'LED',
    163: 'RingCounter',
    164: 'Counter',
    165: 'Timer',
    166: 'DAC',
    167: 'ADC',
    168: 'Latch',
    169: 'TappedTransformer',
    170: 'Sweep',
    171: 'TransLine',
    172: 'VarRail',
    173: 'Triode',
    174: 'Pot',
    175: 'TunnelDiode',
    176: 'Varactor',
    177: 'SCR',
    178: 'Relay',
    179: 'CC2',
    180: 'TriState',
    181: 'Lamp',
    182: 'Schmitt',
    183: 'InvertingSchmitt',
    184: 'Multiplexer',
    185: 'DeMultiplexer',
    186: 'PisoShift',
    187: 'SparkGap',
    188: 'SeqGen',
    189: 'SipoShift',
    193: 'TFlipFlop',
    194: 'Monostable',
    195: 'HalfAdder',
    196: 'FullAdder',
    197: 'SevenSegDecoder',
    200: 'AM',
    201: 'FM',
    203: 'Diac',
    206: 'Triac',
    207: 'LabeledNode',
    208: 'CustomLogic',
    209: 'PolarCapacitor',
    210: 'DataRecorder',
    211: 'AudioOutput',
    212: 'VCVS',
    213: 'VCCS',
    214: 'CCVS',
    215: 'CCCS',
    216: 'OhmMeter',
    350: 'ThermistorNTC',
    368: 'TestPoint',
    370: 'Ammeter',
    374: 'LDR',
    400: 'Darlington',
    401: 'Comparator',
    402: 'OTA',
    403: 'Scope',
    404: 'Fuse',
    405: 'LEDArray',
    406: 'CustomTransformer',
    407: 'Optocoupler',
    408: 'StopTrigger',
    409: 'OpAmpReal',
    410: 'CustomComposite',
    411: 'AudioInput',
    412: 'Crystal',
    413: 'SRAM',
    414: 'TimeDelayRelay',
    415: 'DCMotor',
    416: 'MBBSwitch',
    417: 'Unijunction',
    418: 'ExtVoltage',
    419: 'DecimalDisplay',
    420: 'Wattmeter',
    421: 'Counter2',
    422: 'DelayBuffer',
    423: 'Line',
    A: 'Antenna',
    I: 'Inverter',
    L: 'LogicInput',
    M: 'LogicOutput',
    O: 'Output',
    R: 'Rail',
    S: 'Switch2',
    T: 'Transformer',
    a: 'OpAmp',
    b: 'Box',
    c: 'Capacitor',
    d: 'Diode',
    f: 'Mosfet',
    g: 'Ground',
    i: 'Current',
    j: 'Jfet',
    l: 'Inductor',
    m: 'Memristor',
    n: 'Noise',
    p: 'Probe',
    r: 'Resistor',
    s: 'Switch',
    t: 'Transistor',
    v: 'Voltage',
    w: 'Wire',
    x: 'Text',
    z: 'Zener',
  };
  static bases = {
    ACRail: 'Rail',
    ACVoltage: 'Voltage',
    ADC: 'Chip',
    AnalogSwitch2: 'AnalogSwitch',
    AndGate: 'Gate',
    Antenna: 'Rail',
    AudioInput: 'Rail',
    Box: 'Graphic',
    CC2: 'Chip',
    CC2Neg: 'CC2',
    CCCS: 'VCCS',
    CCVS: 'VCCS',
    Clock: 'Rail',
    Comparator: 'Composite',
    Counter2: 'Chip',
    Counter: 'Chip',
    Crystal: 'Composite',
    CustomCompositeChip: 'Chip',
    CustomComposite: 'Composite',
    CustomLogic: 'Chip',
    DAC: 'Chip',
    Darlington: 'Composite',
    DCVoltage: 'Voltage',
    DecimalDisplay: 'Chip',
    DeMultiplexer: 'Chip',
    DFlipFlop: 'Chip',
    ExtVoltage: 'Rail',
    FullAdder: 'Chip',
    HalfAdder: 'Chip',
    Jfet: 'Mosfet',
    JKFlipFlop: 'Chip',
    Latch: 'Chip',
    LEDArray: 'Chip',
    LED: 'Diode',
    Line: 'Graphic',
    LogicInput: 'Switch',
    MBBSwitch: 'Switch',
    Monostable: 'Chip',
    Multiplexer: 'Chip',
    NandGate: 'AndGate',
    NDarlington: 'Darlington',
    NJfet: 'Jfet',
    PJfet: 'Jfet',
    NMosfet: 'Mosfet',
    Noise: 'Rail',
    NorGate: 'OrGate',
    NTransistor: 'Transistor',
    OhmMeter: 'Current',
    OpAmpReal: 'Composite',
    OpAmpSwap: 'OpAmp',
    Optocoupler: 'Composite',
    OrGate: 'Gate',
    OTA: 'Composite',
    PDarlington: 'Darlington',
    PhaseComp: 'Chip',
    PisoShift: 'Chip',
    PMosfet: 'Mosfet',
    PolarCapacitor: 'Capacitor',
    PTransistor: 'Transistor',
    PushSwitch: 'Switch',
    Rail: 'Voltage',
    RingCounter: 'Chip',
    Schmitt: 'InvertingSchmittElm',
    SeqGen: 'Chip',
    SevenSegDecoder: 'Chip',
    SevenSeg: 'Chip',
    SipoShift: 'Chip',
    SquareRail: 'Rail',
    SRAM: 'Chip',
    Switch2: 'Switch',
    Text: 'Graphic',
    TFlipFlop: 'Chip',
    TimeDelayRelay: 'Chip',
    Timer: 'Chip',
    Unijunction: 'Composite',
    Varactor: 'Diode',
    VarRail: 'Rail',
    VCCS: 'Chip',
    VCO: 'Chip',
    VCVS: 'VCCS',
    XorGate: 'OrGate',
    Zener: 'Diode',
  };

  static params = {
    Options: ['flags', 'maxTimeStep', 'speed', 'current', 'voltageRange', 'power', 'minTimeStep'],
    AnalogSwitch: ['r_on', 'r_off'],
    Box: ['x', 'y', 'x2', 'y2'],
    Capacitor: ['capacitance', 'voltdiff'],
    CC2: ['gain'],
    Chip: ['bits', 'volts[i]'],
    Current: ['currentValue'],
    Diac: ['onresistance', 'offresistance', 'breakdown', 'holdcurrent'],
    Diode: ['fwdrop'],
    Gate: ['inputCount', 'lastOutput'],
    Inductor: ['inductance', 'current'],
    Inverter: ['slewRate'],
    Lamp: ['temp', 'nom_pow', 'nom_v', 'warmTime', 'coolTime'],
    LED: ['colorR', 'colorG', 'colorB'],
    LogicInput: ['hiV', 'loV'],
    LogicOutput: ['threshold'],
    Memristor: ['r_on', 'r_off', 'dopeWidth', 'totalWidth', 'mobility'],
    Mosfet: ['vt'],
    OpAmp: ['maxOut', 'minOut', 'gbw'],
    PhotoResistor: ['minresistance', 'maxresistance'],
    Pot: ['maxResistance', 'position', 'sliderText', 'sliderText'],
    Relay: ['poleCount', 'inductance', 'coilCurrent', 'r_on', 'r_off', 'onCurrent', 'coilR'],
    Resistor: ['resistance'],
    SCR: ['lastvac', 'lastvag', 'triggerI', 'holdingI', 'cresistance'],
    SparkGap: ['onresistance', 'offresistance', 'breakdown', 'holdcurrent'],
    Sweep: ['minF', 'maxF', 'maxV', 'sweepTime'],
    Switch2: ['link'],
    Switch: ['momentary'],
    TappedTransformer: ['inductance', 'ratio', 'current[0]', 'current[1]', 'current[2]'],
    Text: ['size', 'text', 'text'],
    Thermistor: ['minresistance', 'maxresistance'],
    Transformer: ['inductance', 'ratio', 'current[0]', 'current[1]', 'couplingCoef'],
    Transistor: ['pnp', 'lastvbe', 'lastvbc', 'beta'],
    TransLine: ['delay', 'imped', 'width'],
    Triac: ['lastvac', 'lastvag', 'triggerI', 'holdingI', 'cresistance'],
    Triode: ['mu', 'kg1'],
    VarRail: ['sliderText', 'sliderText'],
    Voltage: ['waveform', 'frequency', 'maxVoltage', 'bias', 'phaseShift', 'dutyCycle'],
    Zener: ['zvoltage'],
  };
}

export default CircuitJS;
